---
title: from localhost to global host
description: "This is how I've set up my local network and machine to safely expose my personal projects and other services to the outside world"
pubDate: 2024-08-07T16:49:34.239Z
draft: true
categories:
  - project homelabtop
tags:
  - docker
  - linux
  - notes
---

This post is a script for a talk I gave for James Quick's [Learn Build Teach Discord](https://discord.gg/vM2bagU) on DATE TBA. If you'd like to watch that talk instead of reading its script, then [here's the VOD link](https://www.youtube.com/watch?v=dQw4w9WgXcQ).

## Introduction

Hello and welcome to my talk titled _From localhost to global host_, where you'll find out how I've set up my local network and my spare laptop to publicly host my personal projects and a couple of other services. You'll also get to learn a thing or two about networking, Docker, GitHub webhooks... just to name a few.

## About me

But first, let me introduce myself. My name is Maciej Pędzich, but if you don't know how to pronounce my it, you can call me Mac. _Professionally_, I'm a 19-year-old computer science student at the Polish-Japanese Academy of Information Technology in Warsaw. But _after hours_, I'm an aficionado of all things motorsport (particularly Formula 1 and WRC) as well as house music.

With that out of the way, let's dive into today's topic!

## Demo

I go to maciejpedzi.ch, click the the analytics link in the header, show stats and move on. I click the Gitea link on my website's footer. Show off some repos' pages, but catsof.tech and six-degs-of-f1 in particular. For each repo click on the website link, briefly explain and demo the app.

Then say: alright, it's cool and all, but some of you would probably like to ask...

## Why bother?

After all, there are plenty of <abbr>PaaS</abbr> (Platform-as-a-Service) providers such as Netlify, Vercel, Render, and so on that allow you to deploy all sorts of websites ranging from simple static sites with just a few HTML and CSS files to highly interactive SPAs built in React/Vue/Angular/etc and big metaframework projects in Next/Nuxt/whatever.

All it takes to get a project online is authorising a GitHub app, creating a new project in your <abbr>PaaS</abbr>'s dashboard, selecting your app's repository, maybe adding some environment variables or tweaking the build config if needed, and hitting that deploy button.

From there, your <abbr>PaaS</abbr> will work its magic to build your project, distribute it to multiple servers around the world, give it a unique domain name (but you can also bring your own one), and just like that - your website, no matter how complex, is live.

But what if you wanted to deploy a web app that's not written in JavaScript, but a different one that's not supported by any of those services? Maybe your app requires an additional component (such as a niche database) that doesn't offer affordable hosting solutions if any at all? Perhaps your app requires more horsepower than a given tier allows and you can't afford to use the tier above?

Or maybe you're just like me - simply curious as to how to get a PaaS-like deployment setup to work on a spare computer and how to configure your local network to safely expose such computer to the outside world. After all - curiosity might have killed the cat, but as far as I'm aware, it hasn't killed a server (yet).
