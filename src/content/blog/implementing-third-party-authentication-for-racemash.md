---
title: implementing third-party authentication for racemash
description: ""
pubDate: 2023-05-26T20:05:13.563Z
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

In this post I'll describe how I've implemented logging in via GitHub and Discord in RaceMash, logging out, as well managing the auth state and ensuring the user gets redirected to an auth-protected page they wanted to enter before signing in.

## Writing a useAuth composable

I started by implementing a `useAuth` composable that would provide both the auth state shared across different components of my app and appropriate methods for obtaining user/session data from Appwrite, as well as managing the aforementioned state.

### Shared auth state

It consists of the following elements that are placed outside the exported `useAuth`:

- `user` ref for storing the currently logged in user. If not logged in, the value is set to `null`
- `loadingUserFinished` ref for indicating whether the `loadUser` function, which we'll get to in a minute, has already been executed or not. It's set to `false` by default
- `isLoggedIn` computed property that essentially uses double negation on the `user` ref's value to convert it to a boolean

With these three pieces and appropriate imports in place, I had the following:

```ts
import { ref, computed } from 'vue';
import { Models } from 'appwrite';

import { account } from '@/appwrite';

const user = ref<Models.User<Models.Preferences> | null>(null);
const loadingUserFinished = ref(false);
const isLoggedIn = computed(() => !!user.value);

export function useAuth() {
  return {
    user,
    loadingUserFinished,
    isLoggedIn
  }
}
```

If you're wondering where the `@/appwrite` import came from, then it's from [my previous article](/blog/setting-up-vue-and-appwrite-projects-for-racemash#setting-up-web-client).

I had the shared state in place, but still no convenient way to manipulate it or communicate with Appwrite to manage sessions. That's what I took care of next.

### logIn method

What better way to begin than by creating a method for logging in? I'll show you the final code snippet and then I'll explain what's going on there.

```ts
const logIn = (provider: 'github' | 'discord') => {
  const redirectPath = localStorage.getItem('redirectPath') || '/';
  const permissionScopes =
    provider === 'github'
      ? ['read:user', 'user:email']
      : ['identify', 'email'];

  account.createOAuth2Session(
    provider,
    `${location.origin}${redirectPath}#login-success`,
    `${location.origin}/log-in#login-error`,
    permissionScopes
  );
};
```

So, the `logIn` function accepts a single argument for the OAuth provider to use. Then I declare a `redirectPath` constant that we set to the value of the `redirectPath` item inside `localStorage` or `/` if the former is `null`, as well as a rather self-explanatory `permissionScopes` constant. They both appply to read-only user information, with the only difference lying in their names for respective providers.

Finally, I call the Account SDK's `createOAuth2Session` method with the `provider` argument, successful auth callback URL that, failed auth callback URL and the `permissionScopes` array.

### loadUser method

I can now create a session, but I still don't populate our state with the logged in user's data. That's why we'll introduce a `loadUser` method to help us with that. Here's how it looks like:

```ts
const loadUser = async () => {
  try {
    if (loadingUserFinished.value) return;

    const currentUser = await account.get();
    user.value = currentUser;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(error);
    }

    user.value = null;
  } finally {
    loadingUserFinished.value = true;
  }
};
```

It first checks if the `loadingUserFinished` flag has been set to prevent itself from making unnecessary requests to our Appwrite project. If this flag hasn't been set though, then it actually performs the request, and if the user has an active session, it populates the `user` ref with the object that I receive after resolving the promise returned by the `account.get` function.

If I called that function without authenticating first, it would throw an error, since I'd be trying to access the `accounts` resource as a `guest`, who doesn't have sufficient permissions to do that. This is why I needed to catch said error and set the `user` ref's value back to `null` (and also log the error indev mode in case a different one occurred, such as the Appwrite project being down)

And finally, I have the `finally` block, where we set the aforementioned `loadingUserFlag` to `true` regardless of an error being thrown or not.

### logOut method

I can now log in and keep user data in memory, but what if I wanted to delete the active session and have said user data be removed after doing so? That's why I needed to write a `logOut` method. And it boils down to this tiny snippet, which does both things I've just mentioned:

```ts
const logOut = async () => {
  await account.deleteSession('current');
  user.value = null;
};
```

### End result

AKA what you probably came here for anyway. Enjoy!

```ts
import { ref, computed } from 'vue';
import { Models } from 'appwrite';

import { account } from '@/appwrite';

const user = ref<Models.User<Models.Preferences> | null>(null);
const loadingUserFinished = ref(false);
const isLoggedIn = computed(() => !!user.value);

export function useAuth() {
  const logIn = (provider: 'github' | 'discord') => {
    const redirectPath = localStorage.getItem('redirectPath') || '/';
    const permissionScopes =
      provider === 'github'
        ? ['read:user', 'user:email']
        : ['identify', 'email'];

    // These hashes will become relevant later
    account.createOAuth2Session(
      provider,
      `${location.origin}${redirectPath}#login-success`,
      `${location.origin}/log-in#login-error`,
      permissionScopes
    );
  };

  const loadUser = async () => {
    try {
      if (loadingUserFinished.value) return;

      const currentUser = await account.get();
      user.value = currentUser;
    } catch (error) {

    } finally {
      loadingUserFinished.value = true;
    }
  };

  const logOut = async () => {
    await account.deleteSession('current');
    user.value = null;
  };

  return {
    user,
    loadingUserFinished,
    isLoggedIn,
    logIn,
    loadUser,
    logOut
  };
}
```

## Preparing a LogIn view

### the template

With a `useAuth` composable in place, I was ready to start using it across the entire app. The first place to do so was a page for logging in. So I created a `LogIn.vue` file inside the `views` directory. I created a full-screen `section` that's also a flex container with direction set to `column` and items centered in both axes.

Inside of that section I placed an h1 that say _Log in via:_ and a `v-container`. Inside of the latter I put a single `v-row` with its `align` and `justify` props set to `center`. That `v-row` contained two `v-col`s, where each had a `v-btn` - one for signing in via GitHub, and the other for signing in via Discord.

The whole template ended up looking like this:

```html
<template>
  <section class="w-100 h-100 d-flex flex-column justify-center align-center">
    <h1 class="text-h3 mb-3">Log in via:</h1>
    <v-container>
      <v-row align="center" justify="center">
        <v-col cols="auto">
          <v-btn color="github" size="large">GitHub</v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn color="discord" size="large">Discord</v-btn>
        </v-col>
      </v-row>
    </v-container>
  </section>
</template>
```

### the script

It all came down to importing the right files...

```html
<script lang="ts" setup>
import { useAuth } from '@/composables/useAuth';

const { logIn } = useAuth();
</script>
```

... and adding `@click` event handlers to the `v-btn`s:

```html
<!-- ... -->
<v-btn color="github" size="large" @click="logIn('github')">
  GitHub
</v-btn>
<!-- ... -->
<v-btn color="discord" size="large" @click="logIn('discord')">
  Discord
</v-btn>
```

### Adding a route record

Since I'd opted to use _vanilla_ Vue 3 with Vue Router for this project, I had to manually create a route record inside the `router/index.ts` file. And thus, one new route record later, the file looked like this:

```ts
import { createRouter, createWebHistory } from 'vue-router';
import Home from '@/views/Home.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/log-in',
    name: 'LogIn',
    component: () => import('../views/LogIn.vue')
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
```

## Creating a stub for the voting page and auth-protecting it

Cool, so I had a page for the user to log in from... but for seemingly no apparent reason. There was nowhere for the user to go to that required them to be logged in to enter. At the same time, I wasn't quite done with this authentication module to begin working on the actual voting page.

That's why I'd opted to stub it out for the time being and focus on writing an authentication guard for the page. Therefore I went on to create a `Vote.vue` file inside the `views` folder and placed a solitary `<h1>Vote</h1>` in the component's `template`.

Like moments ago, I also had to manually create a route record for this view as well. But right before I did that, I created a `types.d.ts` file inside the `src` directory to add types for each route record's `meta` object. More specifically, an optional `authRequired` boolean flag. And it looks something like this:

```ts
import 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    authRequired?: boolean;
  }
}
```

Now I could come back to the `router/index.ts` file and add a route record for the `Vote` page:

```ts
const routes = [
  /* .. */
  {
    path: '/vote',
    name: 'Vote',
    meta: { authRequired: true },
    component: () => import('../views/Vote.vue')
  }
];
```

With that out of the way, I created a `guards` directory with an `auth.ts` file inside of it.

I wanted to create a route guard that would leverage the `useAuth` composable's `loadUser` functionality to ensure the user data's been loaded and then check if the route the user wants to go to requires authentication in the first place.

If so, then check if the same composable's `isLoggedIn` computed property's value is `true`. If it's not, then save the destination's path to `localStorage` and redirect the user to `/log-in`

Sounds rather straightforward, but as the saying goes - _talk is cheap, show me the code_. Well, here you go:

```ts
import { RouteLocationNormalized, NavigationGuardNext } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

export async function authGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) {
  const { isLoggedIn, loadUser } = useAuth();

  await loadUser();

  if (!to.meta.authRequired || isLoggedIn.value) {
    return next();
  } else {
    localStorage.setItem('redirectPath', to.fullPath);
    return next('/log-in');
  }
}
```

All that was left to do was actually registering this guard to be activated before entering any page. I could achieve that by passing it to my router's `beforeEach` method like so:

```ts
import { createRouter, createWebHistory } from 'vue-router';
import { authGuard } from '@/guards/auth';

/* ... */

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

router.beforeEach(authGuard);

export default router;
```

## Displaying different nav links based on the auth state

And last, but certainly not least, I made use of a simple `v-if`/`v-else` to display appropriate nav links depending on whether the `isLoggedIn` computed property is `true` or not. Oh, and I also implemented a _Log out_ link that essentially calls the `useAuth`'s `logOut` function and redirects the user to `/log-in`. So inside my `NavMenu.vue` component I ended up with these additions:

```vue
<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const { isLoggedIn, logOut } = useAuth();
const router = useRouter();

const showDrawer = ref(false);

const logOutAndGoToLogIn = async () => {
  await logOut();
  await router.push('/log-in');
};
</script>

<template>
  <v-navigation-drawer v-model="showDrawer" temporary>
    <v-list density="compact" nav>
      <v-list-item title="Home" prepend-icon="mdi-home" link to="/" />
      <template v-if="isLoggedIn">
        <v-list-item title="Vote" prepend-icon="mdi-vote" link to="/vote" />
        <v-list-item
          title="Log out"
          prepend-icon="mdi-logout"
          @click="logOutAndGoToLogIn"
        />
      </template>
      <template v-else>
        <v-list-item
          title="Log in"
          prepend-icon="mdi-login"
          link
          to="/log-in"
        />
      </template>
    </v-list>
  </v-navigation-drawer>
</template>
```

## Wrapping up

As always, thank you so much for tuning in... or I should say, reading in, hahaha! Join me in the next post, perhaps a slightly shorter one, where I'll describe how I've written an event-bus-like composable and taken advantage of Vuetify's `v-snackbar` component to build an application-wide notification system.

Take care!
