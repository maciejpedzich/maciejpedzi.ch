---
title: coding up an app-wide notification system for racemash
description: "Find out how I took advantage of Vue 3's composables and Vuetify's Snackbar component to design an application-wide alert system"
pubDate: 2023-05-27T09:20:02.721Z
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

In this post, I'll show you how I've used a custom composable in conjunction with Vuetify's `v-snackbar` component to create a notification system I can use across my entire Vue 3 application. Let's get into it!

## Preparing the useSnackbar composable

It consists of two elements - shared snackbar state and a `showSnackbar` method, for... well, showing the snackabar/notification/alert/whatever you want to call it.

### Shared snackbar state

It consists of three properties:

- `visible`, a boolean flag, which I'm confident speaks for itself. It should be set to `false` by default
- `status` that can be set to either `error` or `success`. It should also dictate the alert's color and title
- `message` to communicate why the notification showed up in the first place

Unlike in the `useAuth` composable, this time I opted to use a `reactive` object to hold the snackbar's internal state, because it made sense to group them.

I did, however, use Vue 3's `toRefs` function as the composable's return value, because accessing, say, `message` in the actual Snackbar component implies that we're referring to the snackbar's state/property. And of course, it's shorter than writing `snackbar.message`.

With a proper description in place, here's how I converted it to actual code:

```ts
import { reactive, toRefs } from 'vue';

interface Snackbar {
  visible: boolean;
  status: '' | 'error' | 'success';
  message: string;
}

const snackbar = reactive<Snackbar>({
  visible: false,
  status: '',
  message: ''
});

export function useSnackbar() {
  return toRefs(snackbar);
}
```

### showSnackbar method

Now, while we could technically leave it at that and just manually set each `ref`s value whenever we wanted to display a notification, I believe a more reasonable approach would be calling a `showSnackbar` method that would accept an object with only the `status` and `message` fields (and which would append `visible: true` behind the scenes) to override the `snackbar` object.

Here's how the `showSnackbar`'s function definition can look like:

```ts
const showSnackbar = (options: Omit<Snackbar, 'visible'>) =>
  Object.assign(snackbar, { ...options, visible: true });
```

Notice the use of `Object.assign` instead of the `=` operator. This is because utilising the latter would result in our `snackbar` object losing reactivity.

### Result

AKA what you probably came here for anyway. Enjoy!

```ts
import { reactive, toRefs } from 'vue';

interface Snackbar {
  visible: boolean;
  status: '' | 'error' | 'success';
  message: string;
}

const snackbar = reactive<Snackbar>({
  status: '',
  message: '',
  visible: false
});

export function useSnackbar() {
  const showSnackbar = (options: Omit<Snackbar, 'visible'>) =>
    Object.assign(snackbar, { ...options, visible: true });

  return { ...toRefs(snackbar), showSnackbar };
}
```

## Creating and using a custom Snackbar component

In our custom `Snackbar.vue` component's script, I should only have to grab all the snackabr's state `ref`s and create a `computed` property for displaying the right title based on the `status`. And it's as simple as this:

```ts
import { computed } from 'vue';
import { useSnackbar } from '@/composables/useSnackbar';

const { visible, status, message } = useSnackbar();
const title = computed(() => (status.value === 'error' ? 'Error' : 'Success'));
```

This component's `template` isn't too complex either, as it boils down to setting the right props and `v-model` of the `v-snackbar` component and adding appropriate tags for displaying the `title` and `message`. Take a look:

```html
<v-snackbar v-model="visible" :color="status" vertical>
  <h6 class="text-h6 mb-1">{{ title }}</h6>
  <p class="text-body-1">{{ message }}</p>
</v-snackbar>
```

The `vertical` prop is here to enable us to position the `h6` right above the `p`, instead of having them displayed side-by-side.

Also, we don't need to worry about resetting the `visible` ref's value back to `false` after a couple seconds, because by default, the `v-snackbar` will automatically do it for us after a few seconds. Applying a nice fade-out transition included! How cool is that?

But right now, we're still unable to see the Snackbar component in action for two reasons:

1. We haven't placed it anywhere in our app
2. We never call the `showSnackbar` function

We can tackle issue no. 1 by going to `App.vue`, importing the `Snackbar.vue` component and placing it anywhere in the template, just like this:

```vue
<script lang="ts" setup>
// ...
import Snackbar from './components/ui/Snackbar.vue';
</script>

<template>
  <v-app>
    <!-- ... -->
    <Snackbar />
  </v-app>
</template>
```

## Displaying alerts on successful and failed login

But what about issue no. 2? Remember how I placed `#login-error` and `#login-success` hashes in the OAuth callback URLs in my previous article? We can check for their presence in the route's hash and show a snackbar in appropriate color depending on the hash in the same `App.vue` component.

```ts
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const { showSnackbar } = useSnackbar();

onMounted(async () => {
  await router.isReady();

  const loginStatusHashes = ['#login-error', '#login-success'];
  const routeHash = router.currentRoute.value.hash;

  if (loginStatusHashes.includes(routeHash)) {
    showSnackbar({
      status: routeHash.replace('#login-', '') as 'error' | 'success',
      message:
        routeHash === '#login-error'
          ? 'Failed to log you in'
          : "You're logged in"
    });
  }
});
```

Notice the `router.isReady` call. It's necessary, because the `onMounted` hook can get triggered before the router's been initalised, meaning the `includes` check would fail with the `routeHash` being an empty string.

## Wrapping up

Thank you so much for reading all the way to the end! I really enjoyed coding up this system and documenting its inner workings, however simple it may be. I believe it's a perfect showcase of the power and flexibilty of Vue 3's composables as a perfect solution for implementing shared application state or an event bus.

I'll see you all in the next post - take care!
