---
title: racemash - my appwrite x hashnode hackathon project
description: Describing the inspiration and tech stack behind RaceMash and how it works.
pubDate: 2023-05-22T09:25:30.983Z
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

Hey folks! I'd like to share some details about **RaceMash** - an application I'm building for the [Appwrite x Hashnode Hackathon](https://hashnode.com/hackathons/appwrite) by answering the following questions that might have just come up in your head:

- What inspired you to start this project?
- How is this app supposed to work?
- What tools are you going to use to build RaceMash?
- When are you going to launch it?

Without further ado, let's jump into answering them all one by one.

## What inspired you to start this project?

The prize money! In all seriousness though, there are plenty of factors and events that have shaped the idea for this app.

It all started two weeks ago when I bought a brand new HP Omen 16 laptop for my 18th birthday ([full specs](https://support.hp.com/gb-en/document/c08017376) for those interested). I'd had my Dell Inspiron 5570 for 5 years at that point, so it was perfect time for an upgrade.

Once I was done with all the setup business, I decided to test some of my favourite racing games with high-fidelity graphical settings to find out what my new machine was capable of.

One of these games was F1 22, and unsurprisingly, the laptop could handle it without breaking a sweat. And right as I was about to move on to another title, I thought I'd play around with the built-in photo mode now that I owned proper hardware to take some decent pictures.

1650 photos and 6 gigabytes later, it's safe to say I got hooked. But how could I put at least some of these images to a good use (apart from creating a compilation of wallpapers for my laptop)?

The answer lied in a movie I saw last week. It's called _[The Social Network](https://www.imdb.com/title/tt1285016)_, and the scene that served as my source of inspiration was the one where Mark Zuckerberg developed **FaceMash**.

It was a website where the user got to choose one of two randomly picked girls based on their photographs to decide which one they (as in the user, not the girls themselves) found more attractive. After casting a vote, another pair was picked and the cycle continued. Each girl was assigned [an Elo rating](https://en.wikipedia.org/wiki/Elo_rating_system) that got updated based on the expected outcome of the vote and the actual result.

For the record, I didn't find what Mark had done _cool_, or otherwise morally acceptable. I did, however, entertain the idea of using the core FaceMash mechanic of having the users choose one of two randomly selected **photographs**  and updating their internal ratings based on the users' votes.

It didn't take long before I came up with the name for my project. Replacing the letter _F_ with the letter _R_ in FaceMash seemed like a fitting choice, given that my app would feature images of race cars. I settled on the name shortly after I learned that the `racemash.com` domain name was available. And yes, I did go on to register it.

## How is this app supposed to work?

Although you've probably got a general idea of how RaceMash is meant to work from the previous paragraph, in this one I'll give you a more detailed description of the voting process as well as a couple other features.

Before you start voting you'll just need to log in via GitHub, Google, or Discord. From there, just like in FaceMash, you'll be presented with 2 randomly selected photographs out of a total 24 I've taken. Why 24? Because that's the number of tracks available in F1 22.

Anyway, you can press one of three buttons to register your vote - one for each photo plus an option to _declare a draw_ if you like (or dislike) both images equally. After pressing one of these buttons, your vote will be submitted and you'll be shown a different pair of pictures for you to vote again, and so on and so forth.

When it comes to the rating system, I've opted to use [Glicko-2](http://www.glicko.net/glicko/glicko2.pdf), because it requires you to periodically update ratings instead of doing so after every vote registration, which effectively alllows me to take advantage of [scheduling Appwrite function executions](https://appwrite.io/docs/functions#scheduled-execution).

But of course, I'm pretty sure most of you (myself included) would get bored out of their minds after pointlessly casting votes after a few minutes, so here's a solution that I reckon should maximise the site's retention rate.

It's a progress bar displaying how many votes you've casted so far and how many there are to go. Now, if the app simultaneously picks 2 random photos out of 24 and the order in which they appear doesn't matter, it means there are **24 choose 2**, or **276** possible votes a single user can register.

If you're unsure as to how I've calculated that, then I highly recommend checking out [this article about binomial distribution](https://www.mathsisfun.com/data/binomial-distribution.html).

So, with a total of 276 possible voting sessions per user, the bar should go up by about one percentage point every `Math.ceil(276 / 100)`, or 3 submitted votes. I think this is more or less a happy medium between too fast and too slow progression, but I'll find out whether this is true or not only after launching the app.

It doesn't end there, however, since I'm also looking to reward users who have been consistently submitting their votes. After reaching 25%, 50%, and 75% milestones, you'll get to come in for an F1 trivia pit stop that will hopefully enable you to impress your friends and family with lesser-known facts about the sport.

## What tools are you going to use to build RaceMash?

RaceMash is a great fit for an SPA, because it relies heavily on user interactivity, and at the same time it doesn't need top-notch SEO (especially if most of the site's functionality requires authentication).

This is why I've opted to use _vanilla_ Vue 3. And yes, I'm aware that [Nuxt 3 offers client-side rendering](https://nuxt.com/docs/guide/concepts/rendering#client-side-rendering), as well as plenty of other DX improvements such as auto-imports. But since I'm already planning to rewrite [Spotify Playlist Archive](https://spotifyplaylistarchive.com) in Nuxt 3's stable version (at the time of writing, it's still powered by a release candidate), I thought it would be nice to make a Vue app for a change.

When it comes to the component library, it's high time I revisited Vuetify. I haven't used Vuetify since Vue 3 came out, since the former initially offered no support for the latter. But since this is no longer the case, I've finally got an opportunity to see it in some development action.

Since I'm building a project for an Appwrite-run hackathon, I don't think I need to explain why I've chosen it as my backend service provider.

But when it comes to the app's deployment, I'm going to roll with Netlify, because I've used it for the vast majority of my projects, and it has always proved a joy to use. The same goes for Plausible - my go-to analytics solution.

## When are you going to launch it?

I'm aiming to release RaceMash on June 7. I might do it a couple days earlier, but at the same time don't want to do it later than June 14, because that's the hackathon's deadline day. At any rate, I should manage to deliver the app on time.

## Wrapping up

Thank you so much for reading this post! Stay tuned for the next one, where I'll write up my Vue and Appwrite project setup, and maybe even implementing Appwrite third-party authentication.

Take care!
