---
title: the making of catsof.tech
description: Outlining the site's tech stack and explaining some of the more interesting code snippets from the project
pubDate: 2023-09-11T16:21:00.617Z
draft: false
categories:
  - dev diary
tags:
  - astro
---

Hey folks!

In this post, I'll outline the tech stack behind my recent weekend project called [Cats Of Tech](https://catsof.tech). I'll also break down some of the more interesting bits of code from its components and pages.

While it's the polar opposite in terms of complexity when compared to the F1 data visualisation site [I gave a talk on at James Quick's Discord](https://youtu.be/9qa6Cc37D38) back in August, I still believe that something as simple as this website is worth showcasing anyway.

## How does it work?

Cats Of Tech serves as an online album of - and the following may shock you - cats whose owners work in the tech industry. These cats are ordered by the submission date descendingly (ie. the latest entries will be placed at the top of the page) and split into pages of 18 cats each.

Upon clicking the cat's card, the user is taken to a detailed profile page that, apart from the aforementioned elements, consists of the cat's description (if available), as well as a link to a page of owner's choice (usually their personal website or a social media profile).

There's also a page with the submission form with input fields for the cat's name, photograph, description, checkbox to tick if the cat has sadly passed away, as wel as the owner's name and a URL to a page of their choice.

## Choose Your Weapon, AKA the tech stack

In this type of website we display the same unchangable content for each visitor, therefore I found using a static site generator the most suitable for this project. I opted to go with Astro, because I'd already used this framework for static sites before, but also because it features **content collections**, which allow you to define a schema for validating your documents and automatically generating type definitons.

When it comes to styling, I decided to roll with [Chota](https://jenil.github.io/chota) to try out some micro CSS framework for a change. After all, frontend developer does not live by Tailwind alone. As for deployment, I chose Netlify since it's my go-to host for all kinds of sites, static and server-rendered alike.

## Cats collection structure

Now let's move on to the cats collection schema defined in `src/content/config.ts` like so:

```ts
import { z, defineCollection } from 'astro:content';

const cats = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string().max(25),
    dateAdded: z
      .string()
      .or(z.date())
      .transform((val) => new Date(val)),
    description: z.string().max(300),
    image: z.object({
      src: z.string(),
      alt: z.string()
    }),
    passedAway: z.boolean().optional().default(false),
    owner: z.object({
      name: z.string(),
      link: z.string().optional()
    })
  })
});

export const collections = { cats };
```

I believe every sinlge one of the `cats` schema's fields is rather self-explanatory. Each entry is a JSON file (hence I set the collection's type to `data`) placed inside the `src/content/cats` directory, where the cat's photgraph is loacted inside `public/images` directory.

## Card component

Even though I use it exclusively in the album pages, I opted to make one anyway, because I had to create plenty of styling rules for it. We'll get to those shortly, but for now let's have a look at the code fence of `src/components/CatCard.astro`.

### Props

```ts
import { type CollectionEntry } from 'astro:content';

export interface Props {
  cat: CollectionEntry<'cats'>;
}

const { cat } = Astro.props;
```

Another self-explanatory one - I basically have the component accept a single `cat` prop, which is an entry of the `cats` content collection, and then I extract its value from `Astro.props` to be able to use it in the template. Speaking of which...

### Template

Here's how I structured the card component's markup:

```jsx
<a class="card-link-wrapper" href={`/cats/${cat.id}`}>
  <div class="card is-center">
    <div class="image-wrapper">
      <img
        class:list={[{ 'rip-image': cat.data.passedAway }]}
        src={cat.data.image.src}
        alt={cat.data.image.alt}
        loading="lazy"
        decoding="async"
        width="350"
        height="250"
      />
      {cat.data.passedAway && <div class="rip-text">Rest In Peace</div>}
    </div>
    <h3>{cat.data.name}</h3>
    <p>{cat.data.owner.name}</p>
  </div>
</a>
```

No major surprises here either. Every card is a fancy link to a specific cat's profile page at `/cats/${cat.id}`, with that link's body consisting of card's _container_, lazily loaded photo of the cat (which gets assigned an extra class if the cat has passed away), as well as its and its owner's names.

### Styling

That's where we get to the component's styling. I began by overriding the default link styling, ie. setting the card's text color to Chota's `font-color` variable, increasing the focus outline's width and maintaining full opacity on hover:

```css
.card-link-wrapper {
  color: var(--font-color);
}

.card-link-wrapper:hover {
  opacity: 1;
}

.card-link-wrapper:focus {
  outline-width: 5px;
}
```

Then I've set out to modify the card class provided by Chota, mainly by adjusting the margin and padding, but also by ensuring all the card items get displayed in a column rather than the default row, and by introducing an expand transition that activates on hover:

```css
.card {
  margin: 0.5rem 0;
  padding: 0;
  flex-direction: column;
  transition-duration: 300ms;
}

.card:hover {
  transform: scale(1.05);
  box-shadow: 0 0 10px var(--color-grey);
}
```

Next up we've got styling for the card image's container, the image itself, as well as the _Rest In Peace_ frame. I wanted the latter to act as a bottom overlay, so I had to remove it from the regular content flow by setting its position to absolute (as well as setting the bottom and left offset properties to 0) and having the `image-wrapper` div's position to be relative to its normal position without offsetting it in any way.

I also needed to add margin values to create some space between the card's body and the image, but it also meant I had to account for that added space in my RIP text overlay, because I'd otherwise end up with an element that exceeds the width of the displayed image. Speaking of which, I also had to clip every image to fit the thumbnail's dimension and aspect ratio.

Here's how the resulting CSS code looks like:

```css
.image-wrapper {
  position: relative;
  width: 100%;
  padding: 2rem 2rem 0.6rem 2rem;
}

.rip-text {
  position: absolute;
  bottom: 0;
  left: 0;
  width: calc(100% - 4rem);
  margin: 0 2rem 0.5rem 2rem;
  padding: 0.25rem;
  background-color: #000;
  color: #fff;
  text-align: center;
}

.card img {
  display: block;
  width: 100%;
  object-fit: cover;
}
```

And finally, I adjusted the spacing for the card's title (cat's name) and description (owner's name):

```css
.card h3 {
  margin-top: 0;
  margin-bottom: 0;
}

.card p {
  margin-bottom: 1.25rem;
}
```

With a card component ready to use, I could move on to the album pages.

## Album pages

For the album pages, I wanted the root route (ie. `/`) to show the latest 18 entries in the album, with every subsequent page being available at `/:PAGE_NUMBER_HERE`. I also wanted to display these cats in polaroid-photo-like cards, with the cat's photograph as well as its and its owner's names underneath. These cards were supposed to be placed in a grid of 3 columns on desktops, 2 columns on tablets, and a single column on mobiles.

### Frontmatter

I began by defining the album pages' props and coding up a `getStaticPaths` function, which is required by Astro to generate static pages for routes accepting parameters. So I created a `[...page].astro` file inside `src/pages` with the following code inside the frontmatter:

```ts
import { getCollection, type CollectionEntry } from 'astro:content';

import BaseLayout from '../layouts/BaseLayout.astro';
import CatCard from '../components/CatCard.astro';

export interface Props {
  cats: CollectionEntry<'cats'>[];
  pageNums: number[];
}

export async function getStaticPaths() {
  const allCats = (await getCollection('cats')).sort(
    (a, b) => b.data.dateAdded.valueOf() - a.data.dateAdded.valueOf()
  );

  const CATS_PER_PAGE = 18;

  const maxPageNum = Math.ceil(
    allCats.length / CATS_PER_PAGE
  );

  const pageNums = [
    ...Array(maxPageNum + 1).keys()
  ].slice(1);

  return pageNums.map((pageNum) => ({
    params: {
      page: pageNum === 1
        ? undefined
        : pageNum.toString()
    },
    props: {
      cats: allCats.slice(
        CATS_PER_PAGE * (pageNum - 1),
        CATS_PER_PAGE * pageNum
      ),
      pageNums
    }
  }));
}

const { page } = Astro.params;
const { cats, pageNums } = Astro.props;
const currentPageNum = Number(page || '1');
```

There's actually quite a bit going on in this snippet, especially inside `getStaticPaths`, so let's take a closer look at it. I first create an `allCats` constant to obtain all cat entries from my content collection and then call the sort function on the returned array to get each document's Unix timestamp and order the items by these timestamps descendingly.

After that I calculate the greatest possible page number (AKA the number of album pages to generate) and use `Math.ceil` to round the result up and ensure an additional page gets created for the last _remainder from division_ cats. If the remainder equals 0, no extra page is generated.

I'm pretty sure the `pageNums` constant caught your attention too. Here I utilise some, I'd argue lesser-known JavaScript features, to generate an array of integers in range from 1 to `maxPageNum`:

1. I create an empty array of length `maxPageNum + 1`
2. I call the array's `keys` method to obtain an iterator of indexes of all the items in the array. This gives me a collection of integers from 0 to `maxPageNum`
3. I leverage the spread syntax to extract these numbers into an actual array
4. I finally call slice on the new array to get numbers from the second place (so index 1, where number 1 just so happens to be) onwards

Then I take my freshly generated `pageNums` and call map on it to create an array of objects with `params` and `props` keys, which Astro expects to create appropriate HTML documents. In order to have the page 1 of the album be located at `/`, I need to set the `page` param to `undefined`. As for props, I set the `cats` prop to an appropriate slice of cats for a given page, and pass down the `pageNums` array from a couple lines before.

And last but not least, we prepare to use both the route param and the props in the last three lines, where I also create a separate `currentPageNum` const by converting the page prop to number (or setting it to 1 in case it's the root route, where that prop is undefined).

### Page component's template

Now it's time for us to take a look at the markup of each album page:

```jsx
<BaseLayout title={page ? `Page ${page}` : undefined}>
  <div class="row">
    {
      cats.map((cat) => (
        <div class="col-12 col-6-md col-4-lg">
          <CatCard cat={cat} />
        </div>
      ))
    }
  </div>
  <nav class="nav" aria-label="Page navigation">
    <div class="nav-center">
      {
        pageNums.map((num) => (
          <a
            href={`/${num === 1 ? '' : num}`}
            class:list={[
              { active: num === currentPageNum }
            ]}
          >
            {num}
          </a>
        ))
      }
    </div>
  </nav>
</BaseLayout>
```

Nothing particularly special going on here either - I just set an appropriate document title depending on the page number (if it's undefined, it gets set to `Cats Of Tech` instead of `${title} - Cats Of Tech`), loop through the cats array to form the grid I described at the start of the section, as well as the `pageNums` to add links to all the album pages.

## Cats' profile pages

And last but not least, we've got a dedicated profile page for each cat, which boils down to its name displayed at the top and owner's name with a link to a website of their choice underneath, as well as the cat's full-resolution photo and description (and another _Rest In Peace_ message if that cat has passed away). This component can be found in `src/pages/cats/[...catId].astro`.

### Code fence

Here's code for generatic static pages, which boils down to getting all cats collection entries and mapping them to generate objects with appropriate `catId` param and document props like so:

```ts
import { getCollection, type CollectionEntry } from 'astro:content';

import BaseLayout from '../../layouts/BaseLayout.astro';

export interface Props {
  cat: CollectionEntry<'cats'>;
};

export async function getStaticPaths() {
  const cats = await getCollection('cats');

  return cats.map((cat) => ({
    params: { catId: cat.id },
    props: { cat }
  }));
}

const { cat } = Astro.props;
const title = `${cat.data.owner.name}'s ${cat.data.name}`;
```

### Profile page markup

```jsx
<BaseLayout
  title={title}
  description={cat.data.description}
  image={cat.data.image.src}
>
  <h1 class="text-center">
    {cat.data.name}
  </h1>
  <h2 class="text-center">
    Owner - <a href={cat.data.owner.link}>{cat.data.owner.name}</a>
  </h2>
  <div class="row">
    <div class="col-12 col-6-md">
      <img
        class:list={[{ 'rip-image': cat.data.passedAway }]}
        src={cat.data.image.src}
        alt={cat.data.image.alt}
      />
    </div>
    <div class="col-12 col-6-md">
      <p>
        {
          cat.data.description.length === 0
            ? 'No description provided.'
            : cat.data.description
        }
      </p>
      {cat.data.passedAway && <p>🕯️ Rest In Peace 🕯️</p>}
    </div>
  </div>
</BaseLayout>
```

## Wrapping up

Thank you so much for reading in! I hope you enjoyed this post, and if you'd like to submit your own cat, then you can do so by filling out [this little form](https://catsof.tech/submit) on the Cats Of Tech website.

Take care!
