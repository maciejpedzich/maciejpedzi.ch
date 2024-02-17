---
title: project homelabtop - overview
description: when life gives you free laptops, make lemonade... or home servers... or both
pubDate: 2024-02-17T05:03:42.526Z
draft: true
categories:
  - project homelabtop
tags:
  - docker
  - linux
  - self-hosted
---

## backstory and laptop specs

When I had a fiber optic Internet connection installed at my family home a couple years back, I finally got my very own router in my very own bedroom. However, when I moved out to Warsaw for my Computer Science studies in late September last year, I had no choice but to _orphan_ said router.

Fast forward to December last year, when I helped out a friend of a friend, and in return I ended up getting my hands on a virtually unused laptop for free. We're talking an Acer Extensa 15 EX215-55-51GE (that's a mouthful), which sports:

- an Intel Core i5-1235U CPU with 10 cores (8 efficiency + 2 performance) and 12 threads
- 8 GB of SODIMM DDR4 RAM at 3200 MT/s
- a 512 GB NVMe SSD
- a Gigabit Ethernet port
- a 50 Wh Lithium-Ion battery

These specs are nothing crazy, but certainly far from terrible, especially since the laptop also came with 2 memory and NVMe slots. It allowed me to use both of my daily driver's stock 8 gig modules (bringing the total to 16 gigs and unlocking that sweet dual-channel mode), as well as its stock 1 TB SSD.

Fast forward to now. I'm done with my first semester at uni, back home, and sitting on about 2 weeks of spare time to recharge before the 2nd semester kicks off in March... and this Acer laptop. So why not skill up and learn to set up a small homelab for hosting some of my web dev and data science projects?

After all, what could possibly go wrong?

## high-level overview of my network setup

For my very first homelab setup with a single computer, I'm going to keep it simple and unoriginal. The plan is to configure the aforementioned router to expose a **reverse proxy** (probably Traefik) to _the outside world_ and to have the latter direct traffic to appropriate apps based on the subdomain.

The apps in question (as well as the reverse proxy) will be running inside of Docker containers, with their host OS running bare-metal. As for the host OS, I'll be unoriginal once again and choose Debian, given numerous praises for its stability in the package management and updates department.

Oh, and here's an obligatory draw.io graph of the entire setup:

![Diagram of my homelab's network setup](/homelabtop-network-graph.png)

## non-exhaustive list of apps/services

I'm looking to host all the projects listed below under `*.maciejpedzi.ch` (unless marked as internal). As the header says, it might shrink/grow/change in the future, especially if I end up acquiring more machines.

- **My personal website**, probably the most important project on this list (please don't deface it, or else I'll be very, very sad)
- **Gitea instance** as a GitHub mirror for repos I care about the most
- **RaceMash (AHA Stack Edition)**: a rework of [this app](https://racemash.netlify.app/) I made with Vue, but using Astro, HTMX, Alpine, and a _proper backend_, ie. a CDN for serving images to vote for and a database for storing said votes
- **Prometheus instance (internal)** for monitoring performance metrics of the laptop and all the apps/services mentioned above
- **Grafana instance** for visualising data collected from Prometheus and other sources
- **Portainer instance** for managing all these Docker containers

I won't be able to deploy all these services mentioned above in those 2 or so weeks, but it's a solid starting point for the upcoming month or two

## outro

Thank you so much for reading this article. Stay tuned for my next post, where I'll describe the process of containerising my personal website and the initial config for my Traefik reverse proxy.

Stay tuned!
