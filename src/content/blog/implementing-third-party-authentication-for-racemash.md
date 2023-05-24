---
title: implementing third-party authentication for racemash
description: ""
pubDate: 2023-05-24T06:40:14.716Z
draft: true
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

## Creating a Log In page
