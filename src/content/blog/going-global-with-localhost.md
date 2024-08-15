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

I go to maciejpedzi.ch, click the the analytics link in the header, show stats and move on. I click the Gitea link on my website's footer. Show off some repos' pages, but catsof.tech and six-degs-of-f1 in particular. For each repo click on the website link, briefly explain and show off the app.

## My network's diagram and its quick breakdown

Now let me show you a simplified diagram of my local network and all the components from _the outside world_ that ensure my server can be reached from all over the globe. Don't worry if you fail to understand certain bits of the diagram or my rundown through it, as we will come back to each part and concept and break it down in subsequent slides.

<img src="/lbt-talk-net-graph.svg" alt="Diagram of my local network and components in the wide-area network that allow my home server to be reached from the outside world" loading="lazy" />

### DNS Lookup

So let's analyse what's going on here. When you open up your web browser and enter `https://maciejpedzi.ch`, the domain name (ie. the part after `https://`) needs to get converted to an IP address that your computer will then send its HTTP request to.

That's when a <abbr>DNS</abbr> (Domain Name System) lookup is performed, where your computer asks a name server (typically run by your Internet Service Provider) which address corresponds to a given domain name. If your <abbr>ISP</abbr>'s name server doesn't know, it will pass your query on to another name server, which in my case should ultimately reach one of Cloudflare's name servers.

### DDNS and address resolution

For reasons I'll explain later, Cloudflare's name server will actually respond with another domain name that's quite long and difficult to remember. It's provided to me by a <abbr>DDNS</abbr> (Dynamic DNS) service hosted by a company called MikroTik, which is also the manufacturer of the router I use.

This seemingly terrible domain name, however, will resolve to a proper IP address that will be sent back as an answer to the DNS query sent by your computer.

### Going over the wire

Now that your computer knows the address to reach out to, the HTTP request gets shipped as a bunch of <abbr>TCP</abbr> (Transmission Control Protocol) packets to ensure that the communication with my server will get established and that all the packets will be delivered in the right order (among other things).

On a physical level, all that data gets transmitted over a bunch of fiber-optic cables lying underground (and possibly underwater if you're on the other end of the pond) as well as coaxial cables towards the _last mile_ before the destination.

Our next stop in the journey is a little deviced called a _modem_, which stands for **Mo**dulator-**Dem**odulator. It's responsible for taking incoming signal from the coax wire to convert it to Ethernet and vice versa.

### Router and Firewall

The TCP packets are about to reach my server, but the IP address from the DNS lookup actually belongs to the router. Its job is to route the right packets to the right hosts on the local network.

Of course, letting every single packet sent from the outside world (but also certain ones from the inside as well) go through with no control whatsoever is a recipe for disaster. This is where firewall comes into play to ensure secure packet flow based on a set of predetermined rules.

### Switch (not the Nintendo one)

All the devices in the local network are connected together via a device known as a _switch_. What's more, each port can be configured to have a specific VLAN ID, which effectively has a single switch act like multiple switches on different networks. I'll come back to this in the next slide.

### Final stop - reverse proxy

The HTTP request has finally reached my server. It runs a containerised _reverse proxy_, which forwards incoming requests to appropriate containers based on criteria specified in the reverse proxy's configuration file. In most cases it's based on the `Host` header, so the domain name.

For example: if `Host` is set to `maciejpedzi.ch`, the request will be forwarded to the container running my personal website. If `Host` is set to `git.maciejpedzi.ch`, the request will be sent to my Gitea instance, and so on.

## Virtual Local Area Networks

Now it's time for a more detailed breakdown of some of the concepts I've mentioned when going through my network's diagram. Let's start with the concept of a <abbr>VLAN</abbr> (Virtual Local Area Network).

You might have an idea of what the <abbr>LAN</abbr> part of this acronym means, but what about the V? Virtual means that despite living on the same physical switch and Ethernet cables, the network is separated from others on a logical level by applying additional rules and configurations to the _true_ LAN's physical elements.

One such property you can configure, is the aforementioned VLAN ID to assign specific port to a given VLAN. That ID is later added onto each outgoing packet as a little tag, so that it can reach computers on the same VLAN, but not the ones outside of it. Once it's determined that a packet can go through, that tag gets removed and packet continues on to its destination.

Despite this limitation being imposed, it's still possible to make a service hosted on a machine in one VLAN available to computers outside this VLAN, while still keeping everything else isolated. This can be accomplished by creating appropriate firewall rules that will let through every packet going to a specific address and port via a specific transport protocol. That way I can make my websites accessible to other computers in my local network.

Local network is the key phrase here, because introducing those firewall rules alone won't make my server reachable from the outside, but we'll cross that bridge when we get to it.

## Side note on CIDR notation

One thing you might have noticed on the diagram is a different IP addressing scheme for each VLAN. While you might be familiar with the 4 numbers separated by dots, the slash followed by another number might not seem familiar.

This is what's known as the <abbr>CIDR</abbr> (Classles Inter-Domain Routing) notation. It's a shorthand way of writing an IP address range, where instead of using _first address-last address_, you denote the first IP address in a given range and then the number of 1 bits from the left to the right that represent the subnet mask. The 1-bits in that mask mark the bits that stay the same across all addresses in a specified range written in binary.

Let's take my homelab VLAN's range for example: `10.0.10.1/24`. The first address in the range is `10.0.10.1`, and the first 24 bits in the address stay the same. Since each one of four numbers cannot be greater than 255, it means that each part fits perfectly in 8 bits.

Therefore, we can deduct that 24 divided by 8, so exactly first 3 numbers in each address in decimal stay the same. Only the rightmost number changes with each address, so the last IP address in this range is `10.0.10.255`.

## Docker containers

Now that we've covered VLANs and CIDR notation, let's talk about Docker containers.

They serve a means of packaging applications along with their entire dependency trees and environment variables that are required for said app to work properly. Docker containers share the resources of the host they're running on, but they're isolated from that machine and other containers.

Using containers allows us to avoid potential dependency conflicts, where two apps use a different version of the same runtime or a library. They also allow us to mitigate the potential issue of having the same app/component using the same configuration parameters set to different values.

There's also a very handy tool called Docker Compose, which enables us to create a special YAML file to define a _tech stack_ of multiple containers working together within a single project. Yes, I've just mentioned that containers run in separation from one another, but it doesn't mean it's impossible for them to communicate. We'll talk about it in more detail once it's time to cover the reverse proxy.

## PaaS with dark theme and webhooks

If you don't get the reference, go and watch [Brian's talk](https://www.youtube.com/watch?v=qes91LgPnro).

Ok, so we've decided on the deployment method, but it would be so awesome to have a PaaS-like experience offered by the likes of Netlify, Vercel, Render, etc. to build and ship those containers using a nice web interface.

Enter Coolify. It's an open-source <abbr>PaaS</abbr> (Platform-as-a-Service), which aims to bring that sort of quality experience to self-hosted deployment. Apart from a sleek dashboard, Coolify allows you to configure a webhook for each project, which will trigger a redeployment upon a push to your project's repo.

We can talk all we want, but making ship happen is the real deal.

_I show the deployments tab of my personal website and a GitHub webhook deliveries page. I show my website's Dockerfile, explain what's going on there, set this article's draft field to false, push a commit and switch back to the webhook deliveries page and analyse the payload. Then I go back to the Coolify dashboard and go gover the deployment logs_.

## Why bother with self-hosting?

After all, there are plenty of <abbr>PaaS</abbr> providers such as Netlify, Vercel, Render, code hosting platforms like GitHub, and analytics services that offer cloud-hosted solutions. They offer easy integration with one another and your apps, so taking extra steps to get similar products up and running seems like extra work with no tangible benefits.

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
