---
title: progress bar, trivia stops, and ranking page in racemash
description: Find out how I've implemented
pubDate: 2023-07-06T07:55:12.475Z
lastEditDate: 2023-07-13T07:08:28.802Z
draft: false
categories:
  - dev diary
tags:
  - formulaone
  - racemash
  - vue
  - vuetify
---

Hey!

I know it's been a couple weeks since my last RaceMash post, although I have anything but abandonned this project. Better yet, I actually released it yesterday. You can [go to racemash.netlify.app](https://racemash.netlify.app) to check out the app in action, or [browse its source code on GitHub](https://github.com/maciejpedzich/racemash).

Side note: I've actually opted not to use the `racemash.com` domain name, because I now consider this project a small but not borderline basic demo, rather than a product of sorts, so I didn't really feel like setting up and annually renewing a dedicated domain name for it.

But this was supposed to be a post describing the implementation of the last two core features I was yet to implement at the time of publishing of my last post, so let's just jump into it already.

## Adding a progress bar

Vuetify had already got me covered with [an appropriate component](https://vuetifyjs.com/en/components/progress-linear/). I just needed to supply it with a percentage value, which in my case was 100 times the ratio of the votes submitted by the user so far to all the possible votes that can be casted.

As I estabilished in [the first post of this series](/racemash-my-appwrite-x-hashnode-hackathon-project/#how-is-this-app-supposed-to-work), the number of all votes a user can submit given a set of `n` unique images equals _n choose 2_, which can be simplified to `(n * (n - 1)) / 2`. I made use of Vue 3's `computed` to keep the percentage up-to-date as the number of votes submitted by the user changed.

This is how I modified my `useVote.ts` file:

```ts
// ...

const NUM_POSSIBLE_VOTES = (db.photos.length * (db.photos.length - 1)) / 2;

const completionPercentage = computed(
  () => (db.votes.length / NUM_POSSIBLE_VOTES) * 100
);

// ...

export function useVote() {
  return {
    // ...
    completionPercentage,
    // ...
  };
}
```

All that was left to do was placing Vuetify's progress bar component, plugging `completionPercentage` computed property into the `model-value` prop, applying some styling touch-ups and having the bar display 2 decimal places, because it ensures constant value updates as one vote fills up the progress bar by about `0.36` percentage points.

```vue
<script lang="ts" setup>
// ...

const {
  // ...
  completionPercentage,
  // ...
} = useVote();
</script>

<template>
  <!-- ... -->
  <div class="w-100 px-4">
    <v-progress-linear
      class="px-6"
      color="primary"
      height="20"
      :model-value="completionPercentage"
    >
      <template v-slot:default="{ value }">
        <strong>{{ value.toFixed(2) }}%</strong>
      </template>
    </v-progress-linear>
  </div>
  <!-- ... -->
</template>
```

## Handling trivia milestones and 100% completion

With a progress bar out of the way, it was time for me to implement trivia pit stops for submitting 25%, 50%, and 75% of all votes, as well as a congratulations message with a link to the ranking page for reaching the highly coveted 100%. First I had to go back to the `useVote.ts` file to add the following `computed` properties, but also a `shownFactIndexes` field that's an initially empty array of numbers:

```ts
const userSubmittedAllVotes = computed(
  () => completionPercentage.value === 100
);

const userReachedTriviaMilestone = computed(() =>
  [25, 50, 75].includes(completionPercentage.value)
);
```

Then I created a `funFacts.json` file that was essentially an array of strings, where each one contained a fun fact. After that I came back to my vote view to implement picking a random fun fact whenever a user reached one of the milestones.

I added two `ref`s: `funFactToShow` and `canShowFunFact`, which are initally set to be an empty string and `false` respecitvely. Then I placed a `watch` for the `userReachedTriviaMilestone` computed property. If its new value is `false`, I return immediately. Otherwise, I grab a list of indexes of facts that are yet to be shown, pick a random one and use it to get the fun fact to display to finally add it to `shownFactIndexes` array and toggle the `canShowFunFact` flag.

Here's how a human known as Mac turned this _prompt_ into code:

```ts
// ...

import funFacts from '@/funFacts.json';
import { randomNumber } from '@/utils/randomNumber';

const funFactToShow = ref('');
const canShowFunFact = ref(false);

const {
  // ...
  userReachedTriviaMilestone,
  shownFactIndexes,
  // ...
} = useVote();

// ...

watch(userReachedTriviaMilestone, (valueIsTrue) => {
  if (!valueIsTrue) return;

  const availableFunFactIndexes = [...Array(funFacts.length).keys()].filter(
    (index) => !shownFactIndexes.value.includes(index)
  );
  const funFactIndex = randomNumber(0, availableFunFactIndexes.length - 1);

  funFactToShow.value = funFacts[funFactIndex];
  shownFactIndexes.value.push(funFactIndex);
  canShowFunFact.value = true;
});
```

I also had to modify the template to add a couple `v-if`s to toggle between the 100% congratulations message, fun fact pit stop, and the actual voting section.

```html
<section class="w-100 h-100 d-flex flex-column justify-center align-center">
  <div class="text-center">
    <template v-if="userSubmittedAllVotes">
      <h1 class="mb-md-5 mb-2 text-md-h2 text-h4">Congratulations!</h1>
      <p class="mb-md-6 mb-4 px-6 text-md-h5 text-body-1 font-weight-regular">
        You've submitted all votes. Check out the results by clicking the
        button below.
      </p>
      <v-btn size="large" to="/ranking">Show ranking</v-btn>
    </template>
    <template v-else-if="userReachedTriviaMilestone && canShowFunFact">
      <h1 class="mb-2 text-h3">Trivia pit stop</h1>
      <div class="mt-3 mb-8 px-12">
        <p class="text-h6 mb-6 font-weight-regular">
          You're doing great! While we have a quick pit stop to keep you
          running smoothly, enjoy this random bit of trivia.
        </p>
        <p class="w-50 mx-auto my-0 text-h6 font-italic">
          {{ funFactToShow }}
        </p>
      </div>
      <v-btn @click="canShowFunFact = false">Continue</v-btn>
    </template>
    <template v-else>
      <!-- Voting bit goes here -->
    </template>
  </div>
</section>
```

## Ranking page

Here comes the final feature to implement - the ranking page you can enter after submitting all votes. I wanted to sort the images by their ratings descendingly and display them in a responsive grid, where each image has a caption in the bottom left corner with the photo's position in the ranking as well as the aforementioned rating. On extra large desktop displays (ie. of 1080p resolution or higher), I wanted to display 4 images per row. On slightly smaller desktop/laptop screens, I wanted to show 3 photos per row, on tablet screens just 2, and finally one image per row for mobiles. I took advantage of Vuetify's card and grid components, but also the `useDisplay` composable to achieve this.

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { useDisplay } from 'vuetify';
import { useVote } from '@/composables/useVote';

const display = useDisplay();
const { photos } = useVote();

const photosSortedByRatingDesc = photos.value.sort(
  (a, b) => b.rating - a.rating
);
const cols = computed(() =>
  display.xlAndUp.value ? 3 : display.lg.value ? 4 : display.md.value ? 6 : 12
);
</script>

<template>
  <section class="w-100 h-100 d-flex flex-column justify-center align-center">
    <h1 class="mt-10 mb-3 text-h3">Ranking</h1>
    <p class="px-4 mb-3 text-h6 font-weight-regular">
      Here's the final classification of photos based on their ratings:
    </p>
    <v-container>
      <v-row dense no-gutters>
        <v-col
          v-for="(photo, index) in photosSortedByRatingDesc"
          class="px-4 py-4 d-flex justify-center"
          :key="photo.fileName"
          :cols="cols"
        >
          <v-card max-width="480" max-height="270">
            <v-img
              :src="`/images/${photo.fileName}`"
              :alt="photo.altText"
              class="align-end"
              gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
              :aspect-ratio="16 / 9"
            >
              <v-card-title class="text-white">
                {{ `#${index + 1} (Rating: ${photo.rating.toFixed(2)})` }}
              </v-card-title>
            </v-img>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>
```

Now I just needed to add an appropriate route record and a route guard to prevent the user from entering `/ranking` before casting all votes:

```ts
import {
  NavigationGuardNext,
  RouteLocationNormalized,
  createRouter,
  createWebHistory
} from 'vue-router';

// ...

import { useVote } from '@/composables/useVote';

const { userSubmittedAllVotes } = useVote();

const routes = [
  // ...
  {
    path: '/ranking',
    name: 'Ranking',
    component: () => import('../views/Ranking.vue'),
    beforeEnter: (
      _to: RouteLocationNormalized,
      _from: RouteLocationNormalized,
      next: NavigationGuardNext
    ) => {
      if (userSubmittedAllVotes.value) {
        return next();
      } else {
        return next('/');
      }
    }
  }
];
```

And that was it! RaceMash was, at long last, ready to deploy.

## Wrapping up

Thank you so much for reading in once again. For my next solo project, I'll stick to the topic of Formula One, but this time from a dataviz standpoint. I'm really looking forward to developing this one, as I should be done collecting all the aforementioned data this weekend. So stay tuned for my next post and take care!
