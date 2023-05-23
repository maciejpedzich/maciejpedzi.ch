---
title: setting up vue and appwrite projects for racemash
description: ""
pubDate: 2023-05-23T06:49:37.633Z
draft: false
categories:
  - dev diary
tags:
  - racemash
  - formulaone
  - appwrite
  - vue
  - vuetify
---

Hey folks!

In this post, I'll describe the setup process for both my Vue and Appwrite projects I went through earlier today. For the former I'll go through the tools I installed on top of the base template, as well as config files I've had to create or edit. As for the latter, I'll outline all Appwrite features I'm looking to utilise in RaceMash and how I've configured every single one of them.

With that said, let's just jump into it.

## Vue project

### Scaffolding

I used a tool called [`create-vuetify`](https://github.com/vuetifyjs/create-vuetify) to set up my Vite-powered Vue 3 project with pre-configured Vuetify.

All I had to do was run `npm create vuetify` and select all the tools I wanted to use. I chose not to use Pinia (I honestly prefer using custom composables these days, but I don't dislike Pinia at all), and instead enabled TypeScript, Vue Router, and ESLint.

From there I just needed to `cd` into the newly created `racemash` directory and run `npm install --legacy-peer-deps`. I had to include this flag, because NPM detected conflicting versions of the same dependency used by a Vuetify plugin for Vite and Vite itself... this may or may not come back and bite me later.

Also, if the same error keeps showing up whenever you install new packages, you can try running `npm config set legacy-peer-deps true`, so that you won't have to manually add the same flag for every install command you execute.

### Configuring Prettier

I created a `.prettierrc` file in the project's root directory. Feel free to copy and adjust the config I use below:

```json
{
  "tabWidth": 2,
  "printWidth": 80,
  "useTabs": false,
  "singleQuote": true,
  "arrowParens": "always",
  "trailingComma": "none",
  "endOfLine": "lf"
}
```

And even though I'd already installed the Prettier VSCode extension, I thought I would format all the template project files accordingly with my config, so I installed `prettier` as a dev dependency and added this line to my `package.json`'s scripts section:

```json
{
  "scripts": {
    // ...
    "prettier-format": "prettier --config .prettierrc --ignore-path .gitignore --write \"./**/*.{vue,js,ts}\"",
  }
}
```

A quick `npm run prettier-format` later, and all files were formatted properly!

### Adjusting ESLint config

With that out of the way, I moved on to installing `eslint-config-prettier` and `eslint-plugin-prettier` for better ESLint integration with Prettier. Then I added `'prettier'` to the `extends` and `plugins` arrays, added an extra `error` rule, and thus ended up with a config that looks like this:

```js
module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    'prettier'
  ],
  plugins: ['prettier'],
  rules: {
    'vue/multi-word-component-names': 'off',
    'prettier/prettier': 'error'
  }
};
```

And last but not least, I installed `vite-plugin-eslint` to display fullscreen ESLint errors in place of my page if necessary. Enabling it boils down to importing said package and adding `eslint()` to the `plugins` array like so:

```ts
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';

export default defineConfig({
  // ...
  plugins: [eslint()]
});
```

## Appwrite project

### Setting up web client

First I needed to reigster my web app via my Appwrite project's dashboard. So I headed over there and scrolled all the way down to the _Integrations_ section and selected the _Platforms_ tab. I clicked the _Add platform_ button on the right-hand side and selected _Web App_ from the dropdown menu. I named this platform **Development**, set its hostname to **localhost** and hit _Next_.

Then I copied and ran the `npm install appwrite` command. After that I hit clicked _Next_ in Appwrite's setup wizard, extracted the endpoint and project ID from an example code snippet, and placed them inside a `.env` file I created in my Vue project's root directory. Just like this:

```sh
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=redacted
```

After that I created two files in the `src` folder:

`global.d.ts`

```ts
interface ImportMetaEnv {
  BASE_URL: string;
  VITE_APPWRITE_ENDPOINT: string;
  VITE_APPWRITE_PROJECT_ID: string;
}
```

`appwriteClient.ts`

```ts
import { Client } from 'appwrite';

const appwriteClient = new Client();

appwriteClient
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

export { appwriteClient };
```

I wasn't ready to test the connection just yet, because I still had to set up auth and databse collections. Speaking of which...

### Configuring GitHub OAuth

It was time for me to configure third-party authentication via GitHub and Discord. I decided to tackle them in that order. I began by clicking on the _Auth_ link in the Appwrite dashboard's sidebar, disabled all auth methods except for JWT.

Then I selected GitHub from the list of available OAuth providers. A modal showed up with a switch to enable logging in via GitHub, as well as input fields for my GitHub application's ID and client secret. There was also a callback URL I had to copy and enter during the aforementioned GitHub application's registration.

Speaking of which, here's how I did it. I opened GitHub and clicked on my profile picture in the navbar and chose _Settings_ from the dropdown menu. Then I scrolled down to find a link to the _Developer settings_ page in the sidebar. Once there, I clicked on the _OAuth Apps_ link on the left-hand side and finally clicked the _New OAuth App_ button on the right-hand side.

I entered my app's name, its home page's URL (ie. `https://racemash.com`), and pasted in that callback URL I mentioned two paragraphs earlier. After submitting the form, I was taken to my GitHub app's settings screen that displayed the app's ID and a button to generate a client secret. I clicked in and copied newly generated secret.

Then I returned to my Appwrite project's Dashboard and entered the GitHub app's client ID and the client secret. And that was it - a very straightforwad process.

### Configuring Discord OAuth

The steps required to enable Discord OAuth are very similar to the ones you have to take for GitHub. You grab the callback URL from the Appwrite dashboard in the same way and head over to [Discord Developer Portal](https://discord.com/developers/applications).

Once there, I clicked the _New Application_ button in the top right corner and entered RaceMash as my app's name. After that I clicked on the _OAuth_ link in the sidebar and pasted in the Appwrite callback URL and copied my Discord app's ID and secret to then enter them in my Appwrite project's dashboard.

### Preparing file storage for my photos

Alright, so that had been the foundation for logging in, but there was still nowehere to serve the images from.

Therefore I selected the _Storage_ section from the Appwrite dashboard's sidebar, clicked the _Create bucket_ button on the right-hand side and entered the sotrage bucket's name - _photos_. From there, all I had to do was to compress and upload 24 photographs.

I also configured it so that everyone's got read-only access to the bucket by going to the _Settings_ tab, scrolling down to _Update permissions_ section, adding the _Any_ role and making sure only the _Read_ box was checked.

### Setting up the database and collections

Finally, there was only the DB setup left (well, technically the _Functions_ setup too, but I'll take care of it later).

I headed over to the _Databases_ section and created a new database that I aptly named _db_. Then I created its first collection - `photos`, consisting of the following attributes:

- `photoId` corresponding to the ID of a given photo in the `photos` storage bucket
- `url` for the link to the photo itself
- `rating`, by default set to 1500 accordingly with step 1A of the [Glicko-2 formula](http://www.glicko.net/glicko/glicko2.pdf)
- `ratingDeviation`, which measures the accuracy of a photo's rating. The formula recommends setting it to 350 for unranked players, so that's the default value
- `volatility`, which measures the degree of expected rating fluctuation. The formula recommends a default value of 0.06

The second collection I created was for `votes`, to which I added these attributes:

- `voterId`, which speaks for itself
- `photo1Id` and `photo2Id` to store IDs of photos compared in a vote. Yes, I'm aware that you can create an array attribute, but the Appwrite documentation doesn't mention the fact, and there don't appear to be any queries for arrays like `contains`/`includes`. This is why I chose to create two separate fields, especially since the user will have to choose between exactly 2 images
- `result`, which can accept one of 4 possible values:
  - `-1` for unconfirmed vote
  - `0` for `photo2`'s victory
  - `0.5` for a draw
  - `1` for `photo1`'s victory

## Wrapping up

Thank you so much for reading this post! Stay tuned for the next one, where I'll finally get into some programming action by implementing authentication.

Take care!
