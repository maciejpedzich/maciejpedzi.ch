---
title: cheesing a subnetting test with rust
description: "Find out how I've used Rust to make an already easy subnetting test even easier"
pubDate: 2024-12-26T09:47:47.456Z
draft: true
categories:
  - dev diary
tags:
  - rust
---

It's been a hot minute since my last post, and because it's Christmas break, I thought I'd break down this simple Rust program I've used to completely cheese this subnetting test I've had to take for the computer networking course at my uni. You can check out the source code on [GitHub](https://github.com/maciejpedzich) or on [my Gitea instance](https://git.maciejpedzi.ch) if the former is down.

## Isn't that cheating?

I'd agree if I used somebody else's script without understanding how the general algorithm works, let alone having sufficient knowledge of all the aforementioned concepts. I wouldn't have been able to automate the whole process without these.

Besides - if I'm supposed to get a higher education as a programmer, I reckon I should be encouraged to solve problems by writing code to automate away all the tedious parts of the tasks I'm given.

## Prerequisites

This post assumes you're familiar with the concept of IPv4 addressing scheme and CIDR notation. While at least basic knowledge of Rust will definitely make it easier for you to understand my code, you should still be able to make out what it does if you have general experience with other language(s) like C++, Java, or Python.

## Example task description and solution

We're given a CIDR notation of the main subnet and a comma-separated list of subnets with their names and the minimal number of hosts they need to accommodate. We have to split the base subnet starting with the largest subnet from the list, and if there are multiple subnets of the same size, we're supposed to choose the one that comes first in either alphabetical or reverse alphabetical order depending on what the task says. We also have to determine the base IP, subnet mask, and the broadcast IP for each subnet on the list.

Consider the following example:

- **Main subnet CIDR**: `192.168.1.55/24`
- **Subnets**: `(A,21), (B,37), (C,69), (D,30)`
- **Tiebreak order**: alphabetical

For starters we need to obtain the base and broadcast IP address of our main subnet. In this case it's `192.168.1.0` and `192.168.1.255` respectively. Then we need to calculate the sizes of listed subnets.

For each subnet, we take its number of hosts, increment it by 2 (because we have to account for the base IP and the broadcast IP) to obtain the minimal number of IP addresses we have to fit in there, and find the lowest power of 2 which is greater than or equal to that number.

In other words, the size of a subnet is determined by calculating $2^{\lceil \log_2{(n + 2)} \rceil}$, where $n$ is the minimal number of hosts in that subnet. Therefore $\lceil \log_2{(n + 2)} \rceil$ represents the number of bits reserved for identifying hosts in that subnet.

Here are the sizes of our example subnets:

- **A**: $2^{\lceil \log_2{(21 + 2)} \rceil} = 2^{\lceil \log_2{23} \rceil} = 2^5 = 32$
- **B**: $2^{\lceil \log_2{(37 + 2)} \rceil} = 2^{\lceil \log_2{39} \rceil} = 2^6 = 64$
- **C**: $2^{\lceil \log_2{(69 + 2)} \rceil} = 2^{\lceil \log_2{71} \rceil} = 2^7 = 128$
- **D**: $2^{\lceil \log_2{(30 + 2)} \rceil} = 2^{\lceil \log_2{32} \rceil} = 2^5 = 32$

Ordering the subnets by sizes descendingly and by names alphabetically gives us: **C, B, A, D**. Now we need to determine the base IP, subnet mask, and the broadcast IP for each subnet in that order.

So we start with subnet C and take the main subnet's base IP, which is `192.168.1.0`. This is subnet C's base IP. As for the subnet mask, because subnet C reserves 7 bits for the hosts, the number of the most significant bits used for the mask is $32 - 7 = 25$. This means that the subnet mask for C is `255.255.255.128/25`. Finally, the subnet's broadcast IP can be calculated by taking its base IP and incrementing it by the subnet's size minus 1, which in this example gives us `192.168.1.127`.

Then we move on to subnet B using the first address that comes after the previous subnet's broadcast IP, which in this case is `192.168.1.128`, and perform similar calculations until we've gone through all the subnets.

Although the algorithm above surely seems tedious to follow by hand, I believe it's easy to implement in code, and that's exactly what I've done to write my program.
