---
title: matchmaking and updating photos' ratings
description: Find out how I've implemented picking a pair of photos for a vote and how I update their ratings based on these votes' results
pubDate: 2023-06-10T07:34:12.649Z
draft: false
categories:
  - dev diary
tags:
  - formulaone
  - racemash
  - vue
  - vuetify
---

Hey folks!

I'm aware that this project is already taking too long for what it is supposed to be, but I got sidetracked with a couple of collaborative projects I'm involved in over the past week. I also had to deal with hay fever, which effectively limited my bandwidth and productivity.

But yes, I also managed to allocate some of that time to revisit RaceMash and implement logic for picking two random photos for a user to vote, as well as updating the photos' ratings using the [Glicko-2 system](http://www.glicko.net/glicko/glicko2.pdf). And in this post, I'm going to go through the code ended up with and explain some of the decisions I made when writing it.

With that said, let's just jump into it!

## Migrating from Appwrite backend

Since last week I elected to get rid of Appwrite from my app's stack entirely, opting to use `localStorage` and my Vue project's `public` folder as substitutes for fully-fledged database and file storage solutions respectively.

I also revised the structure of each photo and vote _document_. For the former, I replaced the `id` field with a unique `fileName` of each photo, and also renamed `ratingDeviation` and `volatility` to `rd` and `vol` respectively. While they're less descriptive, they match the return value of `glicko2-lite`, a library I use to update each photos ratings, but we'll get to that bit shortly.

As for the votes, I could finally switch over to a `photos` array field, but instead of storing carbon copies of entire objects, I instead chose to store their `fileName`s there. I retained the `result` field and its values (ie. `0`, `0.5`, and `1`).

With a proper model in place, I placed my images in `/public/images`, and created a `photos.json` file inside the project's `src` directory. The latter is just an array of 24 objects that have all the aforementioned properties, as well as an `altText` and `rating`.

I also made sure to create appropriate type definitions for my photos and documents inside `models/index.ts`:

```ts
export interface Photo {
  fileName: string;
  altText: string;
  rating: number;
  rd: number;
  vol: number;
}

export interface Vote {
  photos: [string, string];
  result: 0 | 0.5 | 1;
}

export interface Database {
  photos: Photo[];
  votes: Vote[];
}
```

## Coding up a useVote composable

### Persistent photo ratings and vote history

Although in my last post I wrote that I'd use lowdb, I changed my mind and decided to once again take advantage of Vue 3's powerful reactivity system and `watchEffect` to create a persistent state solution.

I created a `useVote.ts` file in the `composables` folder and placed a reactive object called `db` which is initialised to the value held in `localStorage` under the same key and falls back to an object with photos from the `photos.json` file and an empty `votes` array. Then I added a `ref` to store photos to display on the vote page and the aforementioned `watchEffect` call to save the _`db`_ to localStorage.

```ts
import { reactive, ref, watchEffect } from 'vue';

import defaultPhotos from '@/photos.json';
import { Database, Photo } from '@/models';

const db = reactive<Database>(
  JSON.parse(localStorage.getItem('db') as string) || {
    photos: defaultPhotos,
    votes: []
  }
);

const photosInCurrentVote = ref<Photo[]>([]);

watchEffect(() => localStorage.setItem('db', JSON.stringify(db)));
```

### Picking two photos for a vote

I had a place to store my photo entries and votes, but I still didn't do anything with that `ref`. So I added a `pickPhotosForNewVote` function. First thing I needed it to do was to filter through all photos and leave only the ones that hadn't been paired with every other image apart from itself. In other words, I wanted to keep the entries that did not appear _the toal number of photos - 1_ times across all votes.

```ts
const photosForFirstPick = db.photos.filter(({ fileName }) => {
  const appearanceCount = db.votes.filter((vote) =>
    vote.photos.includes(fileName)
  ).length;

  return appearanceCount !== db.photos.length - 1;
});
```

With that list in place, I just needed to grab a random item from this array like so:

```ts
const firstPick =
  photosForFirstPick[randomNumber(0, photosForFirstPick.length - 1)];
```

I stole... I mean borrowed the `randomNumber` function from [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_integer_between_two_values_inclusive), because why not.

Anyway, with first photo down, I still had to pick a second one that's not the first photo and that hadn't been paired with it yet. And last but not least, I just needed to populate the right ref:

```ts
const photosForSecondPick = db.photos.filter(({ fileName }) => {
  const votesWithFirstPick = db.votes.filter(({ photos }) =>
    photos.includes(firstPick.fileName)
  );

  const fileNamesToExclude = new Set([
    firstPick.fileName,
    ...votesWithFirstPick.flatMap(({ photos }) => photos)
  ]);

  return fileNamesToExclude.has(fileName) === false;
});

const secondPick =
  photosForSecondPick[randomNumber(0, photosForSecondPick.length - 1)];

photosInCurrentVote.value = [firstPick, secondPick];
```

### Submitting a vote

With logic to create a vote in place, I could move on to implementing a function for casting votes. I wanted it to accept a single argument for the result that could be set to one of three values: `0` (Photo 2 wins), `0.5` (a draw), or `1` (Photo 1 wins).

From there, I just had to grab the photos' `fileName`s, prepend an appropriate object to the `votes` array and call the `pickPhotosForNewVote` function to generate a new voting pair.

```ts
const submitVote = (result: 0 | 0.5 | 1) => {
  const photos = photosInCurrentVote.value.map(({ fileName }) => fileName) as [
    string,
    string
  ];

  db.votes.unshift({ photos, result });
  pickPhotosForNewVote();
};
```

### Updating photos' ratings

Next up was setting new ratings every 12 new vote submissions. Why 12? Because 276 (ie. the number of all possible voting pairs given 24 photos) is divisible by that number, and the Glicko-2 system apparently works best for 10-15 matches per tournament (I actually misread that recommendation, since this was supposed to be 10-15 matches per **player** in a torunament, but let's say I decided to experiment a little with my app, ok?).

I also opted to use [glicko2-lite](https://github.com/kenany/glicko2-lite), because it offers the best TypeScript support and flexibility when it comes to tracking matches, handling only the new ratings' calculations based on the match history **you** feed into the `glicko2` function.

So my plan was to group the votes into an object where each key is a photo's file name, with every value being an array of said parameters, ie. the opponent's rating, rating deviation and its result. So, if a vote has the result set to `1`, then in the opponent's array that vote will have the result set to `0` and vice versa. With all votes groupped by photos, I could then calculate the new rating params and override these photos' rating params.

That was the spec, here's the actual function responsible for updating these ratings:

```ts
const updateRatings = () => {
  // The first vote in the array is the most recent one.
  // Therefore calling reverse will order these votes chronologically.
  const twelveMostRecentVotes = db.votes.slice(0, 12).reverse();

  const votesGrouppedByPhotos = twelveMostRecentVotes.reduce((obj, vote) => {
    for (const [index, fileName] of vote.photos.entries()) {
      const opponentFileName = vote.photos[1 - index];
      const opponent = db.photos.find(
        ({ fileName }) => fileName === opponentFileName
      )!;

      const voteParams = [
        opponent.rating,
        opponent.rd,
        index === 0 ? vote.result : 1 - vote.result
      ] as [number, number, number];

      if (obj[fileName]) {
        obj[fileName].push(voteParams);
      } else {
        obj[fileName] = [voteParams];
      }
    }

    return obj;
  }, {} as Record<string, [number, number, number][]>);

  for (const [photoFileName, voteHistory] of Object.entries(
    votesGrouppedByPhotos
  )) {
    const photo = db.photos.find(({ fileName }) => fileName === photoFileName)!;
    const updatedRatingParams = glicko2(
      photo.rating,
      photo.rd,
      photo.vol,
      voteHistory
    );

    Object.assign(photo, updatedRatingParams);
  }
};
```

Of course, I also made sure to call this function in every 12 new vote submissions:

```ts
const submitVote = (result: 0 | 0.5 | 1) => {
  const photos = photosInCurrentVote.value.map(({ fileName }) => fileName) as [
    string,
    string
  ];

  db.votes.unshift({ photos, result });

  if (db.votes.length % 12 === 0) {
    updateRatings();
  }

  pickPhotosForNewVote();
};
```

## Creating a vote page

Of course, I wasn't quite done yet, because I was yet to implement the actual voting page. I revisited the `Vote.vue` component inside my views folder. I first placed this tiny little script tag at the top of the file:

```vue
<script lang="ts" setup>
import { onMounted } from 'vue';
import { useVote } from '@/composables/useVote';

const { photosInCurrentVote, pickPhotosForNewVote, submitVote } = useVote();

onMounted(pickPhotosForNewVote);
</script>
```

For the template, I wanted to center the content, ie. a heading, short but descriptive _manual_, the photos themselves and voting buttons to be centered both horizontally and vertically. Photos could be displayed side-by-side on large desktop screens, and one on top of the other on anything smaller.

```html
<template>
  <section class="w-100 h-100 d-flex flex-column justify-center align-center">
    <div class="text-center">
      <h1 class="mt-4 mb-2 text-h3">Vote</h1>
      <p class="px-4 text-h6 font-weight-regular">
        Which photo do you like more? Click one of three buttons below to
        choose.
      </p>
    </div>
    <div
      class="py-lg-6 py-3 d-flex flex-lg-row flex-lg-row flex-column align-center"
    >
      <div
        v-for="(photo, index) in photosInCurrentVote"
        :key="photo.fileName"
        class="d-flex flex-column align-center px-5 py-4"
      >
        <v-img
          :src="`/images/${photo.fileName}`"
          lazy-src="BASE64_URL_OF_GRAY_IMAGE_THAT_SAYS_LOADING"
          :alt="`Photo ${index + 1} - ` + photo.altText"
          :aspect-ratio="16 / 9"
          max-width="480"
          max-height="270"
        />
        <p class="mt-2 text-h6">Photo {{ index + 1 }}</p>
      </div>
    </div>
    <div id="vote-btns" class="mb-4 d-flex justify-center flex-wrap">
      <v-btn size="large" @click="submitVote(1)">Photo 1</v-btn>
      <v-btn size="large" @click="submitVote(0)">Photo 2</v-btn>
      <v-btn size="large" @click="submitVote(0.5)">I can't decide</v-btn>
    </div>
  </section>
</template>
```

Last but not least, since there aren't any Vuetify `flex-gap` utility classes, I added this teeny-tiny rule via a scoped style tag:

```css
#vote-btns {
  gap: 1.25rem;
}
```

## Wrapping up

Thank you so much for reading in... assuming anyone's reading this in the first place, but I don't mind if nobody is, since this blog mostly serves as a personal journal of mine anyway. Next up - tracking user's progress and displaying F1 fun facts at the 25%, 50%, and 75% marks.
