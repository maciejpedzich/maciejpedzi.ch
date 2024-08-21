---
title: going global with localhost
description: "This is how I've set up my local network and machine to safely expose my personal projects and other services to the outside world"
pubDate: 2024-09-23T15:00:00.00Z
draft: true
categories:
  - project homelabtop
tags:
  - docker
  - linux
  - notes
---

This post is a script for a talk I gave for James Quick's [Learn Build Teach Discord](https://discord.gg/vM2bagU) on 23 September 2024. If you'd like to watch that talk instead of reading its script, then [here's the VOD link](https://www.youtube.com/watch?v=dQw4w9WgXcQ).

## Introduction

Hello and welcome to my talk titled _Going global with localhost_, where you'll find out how I've set up my local network and my spare laptop to publicly host my personal projects and a couple of other services. You'll also get to learn a thing or two about networking, Docker, GitHub webhooks... just to name a few.

## About me

But first, let me introduce myself. My name is Maciej Pędzich, but if you don't know how to pronounce my it, you can call me Mac. _Professionally_, I'm a 19-year-old computer science student at the Polish-Japanese Academy of Information Technology in Warsaw. _After hours_, I'm an aficionado of all things motorsport (particularly Formula 1 and WRC) as well as house music.

With that out of the way, let's dive into today's topic!

## Demo

_I go to maciejpedzi.ch, click the the analytics link in the header, show stats and move on. I click the Gitea link on my website's footer. Show off some repos' pages, but catsof.tech and six-degs-of-f1 in particular. For each repo click on the website link, briefly explain and show off the app_.

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

This is what's known as the <abbr>CIDR</abbr> (ClaTLSes Inter-Domain Routing) notation. It's a shorthand way of writing an IP address range, where instead of using _first address-last address_, you denote the first IP address in a given range and then the number of 1 bits from the left to the right that represent the subnet mask. The 1-bits in that mask mark the bits that stay the same across all addresses in a specified range written in binary.

Let's take my homelab VLAN's range for example: `10.0.10.1/24`. The first address in the range is `10.0.10.1`, and the first 24 bits in the address stay the same. Since each one of four numbers cannot be greater than 255, it means that each part fits perfectly in 8 bits.

Therefore, we can deduct that 24 divided by 8, so exactly first 3 numbers in each address in decimal stay the same. Only the rightmost number changes with each address, so the last IP address in this range is `10.0.10.255`.

## Docker containers

Now that we've covered VLANs and CIDR notation, let's talk about Docker containers.

They serve a means of packaging applications along with their entire dependency trees and environment variables that are required for said app to work properly. Docker containers share the resources of the host they're running on, but they're isolated from that machine and other containers.

Using containers allows us to avoid potential dependency conflicts, where two apps use a different version of the same runtime or a library. They also allow us to mitigate the potential issue of having the same app/component using the same configuration parameters set to different values.

There's also a very handy tool called Docker Compose, which enables us to create a special YAML file to define a _tech stack_ of multiple containers working together within a single project. Yes, I've just mentioned that containers run in separation from one another, but it doesn't mean it's impossible for them to communicate. We'll talk about it in more detail soon, just bear with me.

## PaaS with dark theme and webhooks

If you don't get the reference, go and watch [Brian's talk](https://www.youtube.com/watch?v=qes91LgPnro).

Ok, so we've decided on the deployment method, but it would be so awesome to have a PaaS-like experience offered by the likes of Netlify, Vercel, Render, etc. to build and ship those containers using a nice web interface.

Enter Coolify. It's an open-source <abbr>PaaS</abbr> (Platform-as-a-Service), which aims to bring that sort of quality experience to self-hosted deployment. Apart from a sleek dashboard, Coolify allows you to configure a webhook for each project, which will trigger a redeployment upon a push to your project's repo.

_I show the deployments tab of my personal website and a GitHub webhook deliveries page. I show my website's Dockerfile, explain what's going on there, set this article's draft field to false, push a commit and switch back to the webhook deliveries page and analyse the payload. Then I go back to the Coolify dashboard and go over the deployment logs._.

## Docker networks

Do you remember how I've mentioned that despite them running in isolation from other containers, it's still possible for them to talk to each other and the outside world? This is thanks to Docker networks.

By default, each network makes use of a software bridge, which is responsible for moving traffic between appropriate network segments. The bridge is the key to enabling containers in the same network to communicate, whereas additional firewall rules on the host machine ensure containers connected to different networks can't do that.

Apart from the bridge, Docker networks also come with their own DNS servers, which allow you to use the names of containers connected to a given network. This comes in very handy when referring to a specific service in code or in an environment variable somewhere, because just like with _the real DNS_, it's much easier to memorise a distinct name than a series of seemingly random numbers.

One last thing you need to know about Docker networks is that you can bind a port on the host machine to a port on a specific container, so that you can make that port reachable directly from the Docker host.

My approach to organising Docker networks is to have each container for the web frontend of a given app be connected to the Docker network used by Coolify to deploy its projects, and have each backend container for that app be a part of a dedicated Docker network (including the web frontend so that it can talk to these containers).

## Reverse proxy

Alright, so we've got a bunch of containers up and running in their respective networks. You might think that the next order of business is binding some arbitrary host ports to ports used by the containerised web apps. It would be convenient to use the same ports for both host and container.

But what if two services use the same port and you can't change it on container's end? Well, you could just use a different port on the host and call it a day, right? In my case... not exactly, because once it came down to actually exposing all these apps to the outside world, not only would I have to manually generate an TLS certificate for every project, but I'd also effectively force anyone wanting to visit a certain website I host to append the right port number to the domain name.

So if I were to expose my personal website on port 3000, the URL you'd need to type in to access it would be `https://maciejpedzi.ch:3000`. If you want to omit the port number in the URL, you have to use port 443 instead. But you'd soon run into the same issue of multiple apps trying to use the same host port at once - that's impossible.

The solution to that problem requires having a server that forwards incoming requests to appropriate apps based on something like the domain name. My personal website should be reachable via `maciejpedzi.ch`, my Gitea instance via `git.maciejpedzi.ch`, my Umami analytics platform via `analytics.maciejpedzi.ch`, and so on. It would also be nice if that server generated all the necessary TLS certificates as more services go live.

You've probably seen it coming by now, but that's pretty much how a reverse proxy works in a nutshell. There are plenty of web servers that can be configured to act like one, such as Nginx, Traefik, or Caddy. It's the latter that I've ended up using for my apps, mainly due to the ease and flexibility of configuration but also a wide range of modules for extending Caddy's feature set.

_Go over the Caddyfile, explain the global ACME DNS option. Show the log snippet, no public IPs except GH webhooks and a bunch of proxy rules_.

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

## Split-horizon DNS

Technically speaking, we've done everything to ensure the home server is reachable from external networks... but what if told you that, quite ironically, trying to access it from within the local network might not work?

Imagine I have my daily driver with a local IP set to `10.0.20.5`, my server's local IP is `10.0.10.2`, and I want to visit `https://maciejpedzi.ch` on the former. DNS lookup for that domain name will return my router's public IP address, let's say `79.191.35.174`.

My daily driver will send a packet to the router, because it's trying to reach out to an IP that's clearly outside the local network. But then the router will realise that the destination points to its own public IP address and that it's got a port forwarding rule specified for port 443. Therefore the router will change the destination address to the server's local IP address and send the packet there.

However, the source address specified in that packet is still set to the daily driver's local IP. So when my server sends a response packet to the router, it will have `10.0.20.5` set as the destination. Once the router receives that response packet, it will realise that the recipient is in the same local network as the sender.

Here comes the problem - the daily driver is expecting a response packet from the router's public IP, but then all of a sudden it gets a packet from the server's local IP. That packet will get dropped, since the daily driver is not expecting one from the latter, but the former.

There are two approaches that can be taken to resolve this issue. One involves configuring the router to allow what's known as _NAT hairpining_. If enabled, the router will make sure to take all the packets sent to its local IP address and replace not only the target address with the home server's local IP, but also the sender's IP with the router's own local IP. In that scenario, once the router receives a response packet from the server, it will make sure to send it back to the sender, which will see a response coming from the router's public IP and thus accept the packet.

The other solution involves a _split-horizon DNS_ (AKA _split DNS_, _split-view DNS_, _split-brain DNS_) setup, which requires a local DNS server with records for my apex domain and a wildcard subdomain that point to the server's local IP. That way my daily driver will be expecting a response from `10.0.10.2`, and once that packet reaches the router, it won't perform any sort of port forwarding, since the destination is set to an address within the local network. So once a response packet finds its way back to the daily driver, it will get accepted as it's anticipated to be delivered.

Although both solutions are rather straightforward to set up on my MikroTik router, I've decided to adopt the _split DNS_ approach, because it allows my services to see the true local IPs from which I access various services, but also because I've generally seen it get recommended over _NAT hairpining_ on various forum threads (possibly for the reasons I've just stated myself).

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

If you've had your heart set on getting your own homelab up and running this entire time, you might want to think again! Although I've just mentioned plenty of strengths of self-hosting and opportunities it may provide, it comes with a set of trade-offs that could potentially outweigh all the benefits, depending on your use-case and needs.

### You’re in charge of security and maintenance

This is possibly the biggest trade-off you make when opting to use your own hardware and infrastructure instead of a _proper_ <abbr>PaaS</abbr> or <abbr>IaaS</abbr> (Infrastructure-as-a-Service). The whole responsibility of ensuring that your network appliances, your server(s), the services you're running and their dependencies are all kept up-to-date, but also implementing appropriate security measures falls on your shoulders.

Failing to do so makes all the aforementioned components increasingly more susceptible to various attacks as time passes. If one such attack gets carried out successfully, the consequences vary from as mild as getting your website defaced to as severe as the hacker gaining full control of your machine(s).

You also have to be wary of hosting services that allow users to submit text, images, videos, etc. because apart from malicious users trying to exploit potential holes in the submission mechanism, they could also try and abuse that platform to post hateful or explicit content.

Speaking of which, I'd like bring up a story of me _hacking_ one of the web development industry's heavyweights to showcase just how much power and room for abuse I've gained with very little effort.

## Bonus story: "hacking" Wes Bos

Let me preface this section by stating that my goal is not to dunk on Wes or claim that I'm somehow a more skilled developer than him (I'm anything but). I only want to tell a cautionary tale of exposing services and IoT devices with lax or nonexistent security measures in place.

Chances are you've heard of [Wes Bos](https://wesbos.com) before. You might have taken his [JavaScript30 course](https://javascript30.com), listened to an episode of his [Syntax podacst](https://syntax.fm), or given him a [follow on Twitter](https://twitter.com/wesbos) (I'm never calling it X, sorry not sorry).

Let's rewind the calendar to 19 August 2024. I just so happened to be casually wasting my time on that site when I noticed [this tweet from Wes](https://x.com/wesbos/status/1825559690216132726). If you can't access the link, it said:

> This might be a bad idea but go to [local.wesbos.com](http://local.wesbos.com) and try take your photo. It should print to my printer

My boredom was dead on the spot, because the curious yet mischievious George in my head just had to find a way to get this printer to repeatedly spit out an image of my choice. But what kind of image did I ultimately end up submitting? In hindsight, I probably should've rolled with a somewhat more tasteful joke, but hindisght is 20/20 and I'm still yet to invent an _undo past_ button.

Anyway, past me concluded that the perfect choice for a photo to send would be a Dick pic, but not just any ordinary Dick. We're talking the 46th vice president of the USA, Dick Cheney. Why exactly him? I guess he was the first Dick to come to my mind at that moment.

I had a really narrow time frame to work with, but that's when my vast experience in doing homework right before the deadline hits came in clutch to allow me to reverse-engineer the photo submission mechanism and produce the following script to send a Dick pic just as long as the server was up.

```js
const { readFileSync } = require('fs');
const { setTimeout } = require('timers/promises');

const dickPic = 'data:image/png;base64,'
  + Buffer.from(readFileSync('dick.png')).toString('base64');

async function sendDickPic() {
  let ok = true;

  while (ok) {
    await setTimeout(5000);

    const res = await fetch('https://local.wesbos.com/', {
      method: 'POST',
      body: JSON.stringify([dickPic]),
      headers: {
        'Next-Action': '6ee7743577654da9ae36dc07718e86a493377b1d',
        'Next-Router-State-Tree': '%5B%22%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2C%22%2F%22%2C%22refresh%22%5D%7D%2Cnull%2Cnull%2Ctrue%5D'
      }
    });
    const resText = await res.text();

    if (res.ok) {
      console.log('DICK PIC SENT!');
    } else {
      console.log(res.status);
    }

    console.log(resText);
    ok = res.ok;
  }
}

sendDickPic();
```

The hardest part was figuring out that the `Next-Action` and `Next-Router-State-Tree` headers were necessary to trigger the bit of server-side code responsible for interfacing with the thermal printer. If you were to omit them, you'd get a `200 OK` HTTP status code, but also a generic _Not Found_ page in the response body. That's why I decided to log it in my script.

At any rate, I ran the script and after 5 seconds, there was a success message along with the expected JSON response from the API endpoint. About a minute or so later, the handler got disabled and it only took another minute for Wes to send [a follow-up tweet](https://x.com/wesbos/status/1825568577040093426). And sure enough, there were a handful of Dick pics being printed as he was recording!

Think about the gravity of this situation for a second. I could've instructed the printer to print... anything. From cute dogs and cats to the most disgusting and obscene images you could think of, all thanks to a few lines of code.

Some of you may say that I'm overexaggerating, and that Wes was certainly going to shut the site down after a few minutes regardless. However, it doesn't change the fact that I was able to gain this level of control over a _dumb_ device, simply because an online service for interacting with it got published with nothing in the way of preventing abuse.

The server never verified whether each request was coming from a legitimate or a malicious user, but also whether the image was appropriate or not. I'm also confident there was no rate-limiting either, which means I could theoretically get rid of the `setTimeout` call in my script to make it more annoying if I wanted to.

Of course, I'm not implying that Wes wouldn't implement any of the aforementioned security measures if this was meant to be a legitimate app of sorts. I'm also not saying that my server is immune to every cyber attack in the book just by the virtue of not accepting user-submitted content and setting up a few firewall rules.

But the moment you expose a means of communicating with your device, you can be certain that someone **can** and **will** at the very least attempt to abuse it. It doesn't matter if it's a random guy from Eastern Europe bored out of his mind or a state-sponsored hacker group looking to recruit more zombies into their botnet.

I reckon that the following fragment of a rap song by [Dual Core](https://dualcoremusic.bandcamp.com) titled ["All The Things"](https://dualcoremusic.bandcamp.com/track/all-the-things) sums up the story and its moral best:

> Regardless of the hardware, service, or encoding  
> Connect it to the internet  
> And someone's gonna own it

(The whole track is amazing, go buy it if you can)

## Wrap-up and acknowledgements

Thank you for reading this script all the way to the end! I highly recommend you check out the talk video I've linked to above, since it features more graphs, slides, my voice, my face, all that good stuff.

I'd also like to give a massive shout-out to [Brian Morrison](https://brianmorrison.me) for inspiring me to set up a homelab in the first place, but also his [fullstack.chat](https://fullstack.chat) Discord community for  providing a space for me to document my setup shenanigans live, but more importantly, showing support and encouragement to keep pushing forward despite various setbacks I've had to face with what I consider probably my most important project to date.

Take care!
