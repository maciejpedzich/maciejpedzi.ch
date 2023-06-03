---
title: a shift in direction for racemash
description: Explaining how and why I've changed the direction and functionality of RaceMash
pubDate: 2023-06-03T10:26:12.134Z
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

I'm aware that I haven't published anything in about a week now. This is because I've been working on a little script that helps me collect data for a web app that I'll be working on once I'm done with RaceMash... speaking of which, I've decided to change the direction I'd like to follow with this app for a couple of reasons.

## my frustration with appwrite's limitations

First of all, I've found Appwrite's Database and its SDK to be limited to basic CRUD operations and filtering/sorting options. For instance, there's no way to perform aggregate queries or create a query for items that an array field includes or doesn't include, or connect two queries with a logical OR. While I've managed to come up with workarounds for for all of these limitations, the lack of _official implementation_ is rather disappointing.

Also, as much as I'd love to interface with the DB directly via a server that would expose appropriate endpoints for the web app to send requests to, Appwrite doesn't provide any connection strings that you could pass to an ORM or some other query builder.

Vague _Server Errors_ that would often occurr when performing certain didn't help Appwrite's case either, especially since the only way to be able to triage these is to examine the web platform's logs... which is impossible if you're using their Cloud platform.

Yes, I'm aware that it's still in beta and I could always set up my own instance. However, just because something's possible, doesn't necessarily mean it's feasible. Even though RaceMash and the self-hosted Appwrite probably wouldn't prove too expensive to maintain, I reckon that having to manage the entire infrastructure for a service which aims to abstract it all away defeats the purpose of using Appwrite in the first place.

For the record, I'm not saying that Appwrite is an outright terrible platform, because that would be a blatant lie. However, at the moment it doesn't really let you spread your wings when it comes to even slightly more advanced database queries, which might ultimately become dealbreakers like in my case.

## the app's short-term appeal and conceptual flaw

I've never believed that RaceMash's gimmicky core concept would be capable of maintaining an active user base, or that increasing the number of photographs to vote for or trivia rewards for reaching specific milestones would somehow help.

While I've initially planned to switch the app to read-only mode after about a week or so, I now consider this a terrible idea, since it doesn't let the late-comers to join in on the voting fun. At the same time, leaving the vote to never conclude makes holidng a vote pointless and disclosing each photo's rating would introduce an unwanted bias.

## what's the new direction then?

It involves three key changes - one in the app's core concept, one in its tech stack, and one in its core mechanics. When it comes to the former, instead of holding a global vote where multiple users' choices affect the photographs' global ratings, each user will now have a personal ranking of photos that will be revealed after submitting all 276 votes.

And as for the latter, I'm looking to replace Appwrite with... no backend service at all! Instead, I'll place my images in the Vue app's `public` folder, and I'll use [lowdb](https://github.com/typicode/lowdb) for storing the voting history and images' ratings via the `localStorage` adapter.

While the voting process formula, the rating system, and trivia pit stops will still make the final cut, every photograph will have its rating updated every 12 casted votes, even if it hasn't featured in any of those.

## wrapping up

Thanks for reading this post! In the next one, I'll outline the brand new database schema as well the actual voting mechanism's implementation.

Take care!
