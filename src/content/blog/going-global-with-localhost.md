---
title: going global with localhost
description: "This is how I've set up my local network and machine to safely expose my personal projects and other services to the outside world"
pubDate: 2024-09-23T15:00:00.00Z
draft: false
categories:
  - project homelabtop
tags:
  - docker
  - linux
  - notes
---

This post is a script for a talk I was supposed to give for James Quick's [Learn Build Teach Discord](https://learnbuildteach.com) on 23 September 2024, but ironically, had to ultimately cancel due to numerous network issues that just had to occur right before and during the presentation.

I was supposed to demonstrate publishing this talk's script live, but you'll have to make do without it (for now). Also, I've published [the slides as a PDF file](/going-global-with-localhost-slides.pdf), because I don't want them to go to waste either.

At any rate, enjoy the lecture!

## Introduction

Hello and welcome to my talk titled _Going global with localhost_, where you'll find out how I've set up my local network and my spare laptop to publicly host my personal projects and a couple of other services. You'll also get to learn a thing or two about networking, Docker, GitHub webhooks... just to name a few.

## About me

But first, let me introduce myself. My name is Maciej Pędzich, but if you don't know how to pronounce my it, you can call me Mac. _Professionally_, I'm a 19-year-old computer science student at the Polish-Japanese Academy of Information Technology in Warsaw. _After hours_, I'm an aficionado of all things motorsport (particularly Formula 1 and WRC) as well as house music.

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

Let's start with the concept of a <abbr>VLAN</abbr> (Virtual Local Area Network).

You might have an idea of what the <abbr>LAN</abbr> part of this acronym means, but what about the V? Virtual means that despite living on the same physical switch and Ethernet cables, the network is separated from others on a logical level by applying additional rules and configurations to the _true_ LAN's physical elements.

One such property you can configure, is the aforementioned VLAN ID to assign specific port to a given VLAN. That ID is later added onto each outgoing packet as a little tag, so that it can reach computers on the same VLAN, but not the ones outside of it. Once it's determined that a packet can go through, that tag gets removed and packet continues on to its destination.

Despite this limitation being imposed, it's still possible to make a service hosted on a machine in one VLAN available to computers outside this VLAN, while still keeping everything else isolated. This can be accomplished by creating appropriate firewall rules that will let through every packet going to a specific address and port via a specific transport protocol. That way I can make my websites accessible to other computers in my local network.

Local network is the key phrase here, because introducing those firewall rules alone won't make my server reachable from the outside, but we'll cross that bridge when we get to it.

## Side note: CIDR notation

One thing you might have noticed on the diagram is a different IP addressing scheme for each VLAN. While you might be familiar with the 4 numbers separated by dots, the slash followed by another number might not seem familiar.

This is what's known as the <abbr>CIDR</abbr> (Classless Inter-Domain Routing) notation. It's a shorthand way of writing an IP address range, where instead of using _first address-last address_, you denote the first IP address in a given range and then the number of 1 bits from the left to the right that stay the same across all addresses in a specified range written in binary.

Let's take my homelab VLAN's range for example: `10.0.10.1/24`. The first address in the range is `10.0.10.1`. IPv4 addresses are 32-bit integers, so each one of the 4 parts takes up 8 bits. In my example, the first 24 bits in the address, and thus the first 3 parts stay the same. Only the rightmost number changes with each address, so the last IP address in this range is `10.0.10.255`.

## Docker containers

Now that we've covered VLANs and CIDR notation, let's talk about Docker containers.

They serve a means of packaging applications along with their entire dependency trees and environment variables that are required for said app to work properly. Docker containers share the resources of the host they're running on, but they're isolated from that machine and other containers.

Using containers allows us to avoid potential dependency conflicts, where two apps use a different version of the same runtime or a library. They also allow us to mitigate the potential issue of having the same app/component using the same configuration parameters set to different values.

There's also a very handy tool called Docker Compose, which enables us to create a special YAML file to define a _tech stack_ of multiple containers working together within a single project. Yes, I've just mentioned that containers run in separation from one another, but it doesn't mean it's impossible for them to communicate. We'll talk about it in more detail soon, just bear with me.

## PaaS with dark theme and webhooks

If you don't get the reference, go and watch [Brian's talk](https://www.youtube.com/watch?v=qes91LgPnro).

Ok, so we've decided on the deployment method, but it would be so awesome to have a PaaS-like experience offered by the likes of Netlify, Vercel, Render, etc. to build and ship those containers using a nice web interface.

Enter Coolify. It's an open-source <abbr>PaaS</abbr> (Platform-as-a-Service), which aims to bring that sort of quality experience to self-hosted deployment. Apart from having a sleek dashboard, Coolify allows you to configure a webhook for each project, which will trigger a redeployment upon a push to your project's repo.

In case you don't know what a webhook, it's really nothing more than a regular HTTP request that gets sent to the user by a third-party app upon a certain event happening on their end. In my case, that event is a push to the main/production/release branch of a given project's Git repository hosted on GitHub.

When Coolify receives that request and verifies its legitimacy, it will clone the repository to obtain its source code, run the build command specified in the Coolify project's settings (in my case building the Docker image of the app that's being deployed) and if the build succeeds, it will replace the old container with a new one based on the fresh Docker image.

Some apps are more complex, in that they require multiple dedicated containers than just the one for the website. Some may require its own database or some other backend service that's required for the frontend to work properly. That's where Docker Compose comes into play.

It allows you to define _software stacks_ in a dedicated Compose file, where you can specify all the services that make up for your entire application, but also create dedicated Docker networks (which we'll cover in the very next section) or connect some containers to existing ones, specify volumes for persistent data storage, and more.

## Docker networks

Do you remember how I've mentioned that despite them running in isolation from other containers, it's still possible for them to talk to each other and the outside world? This is thanks to Docker networks.

By default, each network makes use of a software bridge, which is responsible for moving traffic between appropriate network segments. The bridge is the key to enabling containers in the same network to communicate, whereas additional firewall rules on the host machine ensure containers connected to different networks can't do that.

Apart from the bridge, Docker networks also come with their own DNS servers, which allow you to use the names of containers connected to a given network. This comes in very handy when referring to a specific service in code or in an environment variable somewhere, because just like with _the real DNS_, it's much easier to memorise a distinct name than a series of seemingly random numbers.

One last thing you need to know about Docker networks is that you can bind a port on the host machine to a port on a specific container, so that you can make that port reachable directly from the Docker host.

My approach to organising Docker networks is to have each container for the web frontend of a given app be connected to the Docker network used by Coolify to deploy its projects, and have each backend container for that app be a part of a dedicated Docker network (including the web frontend so that it can talk to these containers).

## Reverse proxy

We've got a bunch of containers up and running in their respective networks. You might think that the next order of business is binding some arbitrary host ports to ports used by the containerised web apps. It would be convenient to use the same ports for both host and container.

But what if two services use the same port and you can't change it on container's end? Well, you could just use a different port on the host and call it a day, right? In my case... not exactly, because once it came down to actually exposing all these apps to the outside world, not only would I have to manually generate an TLS certificate for every project, but I'd also effectively force anyone wanting to visit a certain website I host to append the right port number to the domain name.

So if I were to expose my personal website on port 3000, the URL you'd need to type in to access it would be `https://maciejpedzi.ch:3000`. But since I want to omit the port number in the URL, I have to use port 443 instead. But I'd soon run into the same issue of multiple apps trying to use the same host port at once - that's impossible.

The solution to that problem requires having a server that forwards incoming requests to appropriate apps based on something like the domain name. My personal website should be reachable via `maciejpedzi.ch`, my Gitea instance via `git.maciejpedzi.ch`, my Umami analytics platform via `analytics.maciejpedzi.ch`, and so on. It would also be nice if that server automatically generated all the necessary TLS certificates as more services go live.

You've probably seen it coming by now, but that's pretty much how a reverse proxy works in a nutshell. There are plenty of web servers that can be configured to act like one, such as Nginx, Traefik, or Caddy. It's the latter that I've ended up using for my apps, mainly due to the ease and flexibility of configuration but also a wide range of modules for extending Caddy's feature set.

## Dynamic DNS

Alright, so we've got a reverse proxy configured and all, but it's not enough to ensure that the right subdomains will point to the right websites. We need to take care of a proper DNS setpu first.

So you'd think that I just need to update your domain name's DNS records to point the apex domain and the wildcard subdomain to the IP address of the router and problem solved, right? This would've been the case if my router had a static IP address.

Unfortunately, I've got a dynamic one assigned to my router. This means that once it changes after I've set up my domain name to point to the previous IP, my website becomes unreachable until I update the DNS records to point to my router's new IP, and the cycle continues.

Fortunately though, this process is dead simple to automate by employing a <abbr>DDNS</abbr> (Dynamic DNS) service, which gives you a free domain name and periodically updates its DNS records to point to the router's public IP.

I use the DDNS service provided by MikroTik to its router owners like myself, but if you don't have a MikroTik router or if your router manufacturer doesn't provide their own service, you can use an external one such as [DuckDNS](https://www.duckdns.org), [No-IP](https://www.noip.com), or [ClouDNS](https://www.cloudns.net/index/lang/en). If you use Cloudflare's DNS, you can set up an automated script to send a request to their API to automatically update appropriate DNS records as well.

Even though I use Cloudflare's name servers for `maciejpedzi.ch`, I've decided to set up a `CNAME` record for the apex domain and all subdomains that maps to the domain name provided by MikroTik's DDNS service, because I've initially wanted to use Namecheap's DNS services (since I've registered `maciejpedzi.ch` with them), but I've opted to use Cloudflare's name servers, because they've made it easier for me to use Caddy to automatically generate all the publicly-trusted TLS certificates for my apps.

## Port forwarding

As we've established, the router's got a public IP address and it's responsible for establishing connections with the outside world on behalf of all devices in the local network, ensuring that the right reply gets to the right requester. But what about incoming connections? By default, the router is configured to reject such connection attempts, because it doesn't know which device on the local network should handle them.

Enter port forwarding. It's a means of telling the router to, as the name suggests, forward incoming connections to certain hosts on the local network for specific ports. Therefore I can tell my router to forward ports 80 and 443 using the TCP protocol to the equivalent ports and the IP address of my home server, so that I can well and truly have it go global.

Of course, we can also use port forwarding for services using other transport protocols like UDP. This is the case for my WireGuard VPN running directly on the router itself, in which case I need to set the router's local IP as the destination.

## Accessing a public server via LAN

### Problem

Technically speaking, we've done everything to ensure the home server is reachable from external networks... but what if told you that, quite ironically, trying to access it from within the local network might not work?

Imagine I have a local client with its IP set to `192.168.0.2`, a server with local IP of `192.168.0.3`. There's a port forwarding rule on the router set to redirect all incoming TCP connections on port 443 to the same port on the server. I've set up a global DNS record for my `example.com` domain name to point to my router's public IP address, let's say `12.34.56.78`.

When I try to visit `https://example.com` from my local client, it will try and establish and outgoing connection, because it's trying to reach out to an IP that's clearly outside the local network. But after the client tells the router it wants to make that outgoing connection to `12.34.56.78:443`, the router will realise that the destination points to its own public IP address and that it's got a port forwarding rule specified for port 443. Therefore the router will change the destination address to the server's local IP address and send the packet there.

However, the source address specified in that packet is still set to the client's local IP. So once my server sends a response packet to the router, it will have `192.168.0.2` set as the destination. When the router receives that response packet, it will realise that the recipient is in the same local network as the sender.

Here comes the problem - the client is expecting a response packet from the router's public IP, but then all of a sudden it gets a packet from the server's local IP. That packet will get dropped, since the daily driver is not expecting one from the latter, but the former.

### Solution 1: NAT hairpinning

There are two approaches that can be taken to resolve this issue. One involves configuring the router to allow what's known as _NAT hairpinning_. If enabled, the router will make sure to take all the packets sent to its local IP address and replace not only the target address with the home server's local IP, but also the sender's IP with the router's own local IP. In that scenario, once the router receives a response packet from the server, it will make sure to send it back to the sender, which will see a response coming from the router's public IP and thus accept the packet.

### Solution 2: split-horizon DNS

The other solution involves a _split-horizon DNS_ (AKA _split DNS_, _split-view DNS_, _split-brain DNS_) setup, which requires a local DNS server with records for my apex domain and a wildcard subdomain that point to the server's local IP. That way my daily driver will be expecting a response from `10.0.10.2`, and once that packet reaches the router, it won't perform any sort of port forwarding, since the destination is set to an address within the local network. So once a response packet finds its way back to the daily driver, it will get accepted as it's anticipated to be delivered.

Although both solutions are rather straightforward to set up on my MikroTik router, I've decided to adopt the _split DNS_ approach, because it allows my services to see the true local IPs from which I access various services.

## Pros of self-hosting

But why bother going to all these lengths when there are plenty of <abbr>PaaS</abbr> providers such as Netlify, Vercel, Render, code hosting platforms like GitHub, and analytics services that offer cloud-hosted solutions? They offer easy integration with one another and your apps, so taking extra steps to get similar products up and running seems like extra work with no tangible benefits.

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

## Cons of self-hosting

If you've had your heart set on getting your own homelab up and running this entire time, you might want to think again! Although I've just mentioned plenty of strengths of self-hosting and opportunities it may provide, it comes with a set of trade-offs that could potentially outweigh all the benefits depending on your use-case and needs.

### Initial learning curve

I'm fairly confident that some of you find certain terms and concepts I've touched on throughout this presentation confusing and intimidating. If you've only dabbled with the dev side of things and this is your first time diving a little deeper into the networking world, you shouldn't feel stupid because you didn't get something on your first try.

Having a fundamental knowledge of the most important networking components and protocols used by web browsers and applications is enough for a strictly dev role, so you shouldn't force yourself to learn about things you'll most likely never use in your day-to-day job.

Though I'm pretty sure the same applies to... well, any uncharted teritory of knowledge. Some ideas seem impossible to understand at first, but as you learn more and more about them, they become second nature. As the saying goes - practice makes perfect.

### Potentially more expensive than a subscription

If you don't have a spare computer lying around or if you'd need to buy a lot hard drives for a <abbr>NAS</abbr> (Network-Attached Storage) or additional computers to accomodate your needs, you could find yourself spending significantly more money that you otherwise would using a subscription-based cloud service.

When it comes to buying a dedicated machine, sometimes you can come across retired server equipment for relatively cheap, let alone old laptops and PCs. But once again, before you go all-in on self-hosting, consider all your options, especially in terms of their respective cost.

### Poor scalability (both up and down)

When you use cloud-based hosting solutions, you're generally billed for a specific amount of resources your app uses. If you receive less traffic a given month, it's totally reasonable for you to expect to pay less money for less computing power and vice versa.

With self-hosting, you generally don't have the luxury of dynamically allocating more resources as required at any given moment or if you've simply underestimated how much traffic your site would typically receive. Conversely, it's likely that you might overestimate it and find yourself sitting on too much RAM or disk space than you have idea to allocate it beyond what your existing services already consume.

### Inconsistent loading times across the globe

Most of the popular <abbr>PaaS</abbr> providers allow you to deploy your app to their Edge <abbr>CDN</abbr> (Content Delivery Network), which essentially means multiple servers scattered around the world, where each server is meant to be accessed by users who are geographically closest to it and thus ensure fast loading times for everyone no matter where they access your website.

Unless you also happen to own a bunch of computers distributed across the globe or have the power to break the laws of physics, you can't ensure equally fast loading times for everyone, especially those who live thousands of kilometers away from where your server is located.

### You’re in charge of security and maintenance

This is possibly the biggest trade-off you make when opting to use your own hardware and infrastructure instead of a _proper_ <abbr>PaaS</abbr> or <abbr>IaaS</abbr> (Infrastructure-as-a-Service). The whole responsibility of ensuring that your network appliances, your server(s), the services you're running and their dependencies are all kept up-to-date, but also implementing appropriate security measures falls on your shoulders.

Failing to do so makes all the aforementioned components increasingly more susceptible to various attacks as time passes. If one such attack gets carried out successfully, the consequences vary from as mild as getting your website defaced to as severe as the hacker gaining full control of your machine(s).

You also have to be wary of hosting services that allow users to submit text, images, videos, etc. because apart from malicious users trying to exploit potential holes in the submission mechanism, they could also try and abuse that platform to post hateful or explicit content.

## Wrap-up and acknowledgements

Thank you for reading this script all the way to the end!

I'd like to give a massive shout-out to [Brian Morrison](https://brianmorrison.me) for inspiring me to set up a homelab in the first place, but also his [fullstack.chat](https://fullstack.chat) Discord community for  providing a space for me to document my setup shenanigans live, but more importantly, showing support and encouragement to keep pushing forward despite various setbacks I've had to face with what I consider probably my most important project to date.

Take care!
