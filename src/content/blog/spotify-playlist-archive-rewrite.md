---
title: spotify playlist archive rewrite
description: Outlining my plan to rewrite the Spotify Playlist Archive website
pubDate: 2023-09-20T13:25:50.531Z
draft: false
categories:
  - dev diary
tags:
  - vue
  - nuxt
  - spotify-playlist-archive
  - primevue
---

Hey folks! It's time for another series of dev diary posts. In this entry, I'm going to explain how the current website works from the end user's perspective, but also share the overhauled site's tech stack and a list of new features I'd like to implement. With that said, let's just jump into it!

## High-level overview

If you go to [https://spotifyplaylistarchive.com](https://spotifyplaylistarchive.com), you'll be greeted with a search bar that allows you to look up available playlists either via the title or via the playlist's URL (e.g. if you paste [https://open.spotify.com/playlist/2vpAyuy9HOTPjygPl63QuH](https://open.spotify.com/playlist/2vpAyuy9HOTPjygPl63QuH) into the search bar, you'll get a single result for the _House Shift_ playlist).

Once you've picked a playlist from the search results, you're shown a calendar which has snapshot capture dates highlighted in green. If you click on one of these dates, you'll be presented with a snapshot of the playlist captured that day, including the title, description, and of course the tracklist.

You can also:

- Download a snapshot as a JSON file
- Copy track URLs of a snapshot to create a playlist out of said snapshot by pressing `Ctrl/Cmd+V` in Spotify's desktop app window (when the target playlist is open)
- Browse a playlist's stats, such as follower growth over the past week/month, or a track retention ranking table

## Tech stack

This site uses a rather unconventional backend, because its database is [a Git repo hosted on GitHub](https://github.com/mackorone/spotify-playlist-archive), with a GitHub Actions workflow running once every day to find and commit new playlist snapshots to this repository. GitHub's API and `raw.githubusercontent.com` serve as a means of obtaining commit hashes for given snapshots and snapshots themselves respectively, which I'll go into more detail in subsequent articles.

The frontend is powered by Nuxt 3 and PrimeVue, since the site relies quite heavily on interactive UI components for the aforementioned playlist search bar and the snapshot calendar (among others), even though the content (ie. playlists and their snapshots) is static and the same for every visitor.

While I'm looking to stick with these tools for the overhauled site, I'd also like to introduce Lucia Auth into the mix, which brings me to...

## New features

I'm pretty sure you've had this question come up while reading through this post so far:

> How are users supposed to add new playlists to the archive?

The process boils down to forking the repo, and then creating files with playlists' IDs as their names inside `/playlists/registry`, and finally opening a pull request against the main repo. As much as it may sound trivial for someone who's got experience with Git and GitHub, this process requires plenty of extra steps for _non-developers_, such as creating a GitHub account and learning how to perform all the aforementioned actions.

This might have previosuly discouraged the less technically adept folk from contributing their playlists to the archive. In order to make this process more accessible for these users, I'm looking to introduce a _setup wizard_, which should only require them to authenticate via GitHub (hence the addition of Lucia Auth to the tech stack) and provide links to playlists they'd like to add to the registry.

Apart from the setup wizard, I'm also planning to add:

- Comparing two snapshots of a given playlist
- Creating a cumulative playlist (ie. a playlist of all tracks that have ever been added to a given playlist) out of track URLs in the same vein as for a specific snapshot
- Looking up playlists that featured a given track (based on user-provided track URL)
- Various enhancements and refactor of existing features' code

## Wrapping up

Thank you so much for reading this shorter post. I'm looking forward to writing up the first technical breakdown of this project for you.

Take care!
