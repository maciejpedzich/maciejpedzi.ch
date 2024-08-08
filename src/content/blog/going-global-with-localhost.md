---
title: going global with localhost
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

Hello and welcome to my talk titled _Going global with localhost_, where you'll find out how I've set up my local network and my spare laptop to publicly host my personal projects and a couple of other services. You'll also get to learn a thing or two about networking, Docker, GitHub webhooks... just to name a few.

## About me

But first, let me introduce myself. My name is Maciej Pędzich, but if you don't know how to pronounce my it, you can call me Mac. _Professionally_, I'm a 19-year-old computer science student at the Polish-Japanese Academy of Information Technology in Warsaw. _After hours_, I'm an aficionado of all things motorsport (particularly Formula 1 and WRC) as well as house music.

With that out of the way, let's dive into today's topic!

## Demo

I go to maciejpedzi.ch, click the the analytics link in the header, show stats and move on. I click the Gitea link on my website's footer. Show off some repos' pages, but catsof.tech and six-degs-of-f1 in particular. For each repo click on the website link, briefly explain and demo the app.

Then say: alright, it's cool and all, but some of you would probably like to ask...

## Why bother?

After all, there are plenty of <abbr>PaaS</abbr> (Platform-as-a-Service) providers such as Netlify, Vercel, Render, code hosting platforms like GitHub, and analytics services that offer cloud-hosted solutions. They offer easy integration with one another and your apps, so taking extra steps to get similar products up and running seems like extra work with no tangible benefits.

I've come up with 5 reasons why you too might be interested in self-hosting some of those apps and services:

### Freedom to run whatever software you want

What if you wanted to deploy a web app that's not written in JavaScript, but a different language that's not supported by any of those <abbr>PaaS</abbr> providers? Maybe your app requires an additional component, such as a niche database, for which there are no affordable hosting solutions if any at all?

If the answer is yes, you might be interested in self-hosting, since the only limiting factor when it comes to running the software you choose is your machine's horsepower. Well, there's also your country's law when it comes to websites distributing content deemed illegal, but we're not going to discuss those.

### Full control of your own data

Perhaps you're concerned with the possibility of a given service suddenly changing its privacy policy to gain greater access to your data and other activity metrics, or erasing a chunk of said data without a warning?

If so, you also might be interested in self-hosting, because it puts you in charge of everything you store on your server and there's no risk of a seemingly trusted third-party meddling with your own content or holding it hostage and demanding you to upgrade to a more expensive plan. Speaking of expensive...

### Better cost-efficiency than a subscription

What if a certain service has introduced a price increase across all of its plans, rendering further usage unaffordable? Maybe you've fallen victim to a _rug pull_, where a company offering a flexible free tier of their service discontinues it after a couple months or even years after its introduction?

In some cases, it may prove cheaper to run an open source equivalent of a specific paid subscription service. There's definitely no need to worry about potentially getting _rugpulled_ either.

### Giving your unused computer a new life

Maybe you've got an old computer lying around and collecting dust since you upgraded to a new machine? While it's definitely sensible to list it for sale on some online marketplace or give it to a friend/relatvie who may need it, consider turning this computer into your home server if neither of the other two options work out.

The e-waste landfills already occupy way too much space than they should, so instead of adding another computer to the pile, I highly encourage giving it a new lease of life.

### Fun learning experience

And last but not least, perhaps you're just curious as to how to get a PaaS-like deployment setup to work on a spare computer and how to configure your local network to safely expose such computer to the outside world. After all - curiosity might have killed the cat, but as far as I'm aware, it hasn't killed a server (yet).

By putting this setup together, you'll gain basic yet valuable skills in network engineering and DevOps, which may help your job-hunting prospects in the future.
