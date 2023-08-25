---
title: introduction to linux
description: Notes from the first two units of Michael Hausenblas' "Learning Modern Linux" book
pubDate: 2023-08-25T15:22:00.890Z
draft: false
categories:
  - learning modern linux
tags:
  - linux
  - notes
---

Hey folks! Here are my notes from the first unit of Michael Hausenblas' _Learning Modern Linux_ book.

## Operating System

**Operating System** is a piece of software responsible for managing your machine's memory, file system, communication with I/O devices, network stack, and more. It also provides a set of **system calls**, which allow programs to interface with the OS.

## Linux Distributions

**Linux Distribution**, commonly referred to as a **distro**, is an operationg system that consists of a Linux kernel, init system, package manager, etc.

## Everything is a file

In Linux, everything is treated as a file, including hardware and its abstractions.

### Linux Version

```
$ cat /proc/version
Linux version 6.3.1-arch2-1 (linux@archlinux) (gcc (GCC) 13.1.1 20230429, GNU ld (GNU Binutils) 2.40.0) #1 SMP PREEMPT_DYNAMIC Wed, 10 May 2023 08:54:47 +0000
```

### CPU Model Name

```
$ cat /proc/cpuinfo | grep "model name" -m 1
model name : AMD Ryzen 7 5800H with Radeon Graphics
```

### Total Available RAM

```
$ cat /proc/meminfo | grep "MemTotal"
MemTotal:       32193984 kB
```

### Process Info (first six rows)

```
$ cat /proc/$$/status | head -n6
Name: zsh
Umask: 0022
State: S (sleeping)
Tgid: 16378
Ngid: 0
Pid: 16378
```

`$$` variable means **shell's Process ID**

## High-level overview of Linux architecture

We can divide the architecture into three layers:

- **User space (Userland)**, where programs, shells, and desktop environments operate
- **Kernel**, which we'll get to in a later section
- **Hardware**, so your CPU, GPU, storage media, I/O devices, etc.

While there's a single API between the userland and the kernel in form of the aforementioned [system calls](#operating-system), there are multiple interfaces between the kernel and hardware. These include:

- CPU interface
- RAM interface
- Device and network drivers
- Block device drivers
- Character device drivers, hardware interrupts, and other I/O device drivers

## Select CPU architecture types

### Determining your CPU's architecture

You can use `uname -m`. Here's an example output from my machine:

```
❯ uname -m
x86_64
```

### x86_64 (amd64)

x86 was designed by Intel and it refers to the 32-bit instruction set. AMD later extended x86's instruction set by a 64-bit equivalent. Although Intel collaborated with HP to developi its own 64-bit instruction set called IA64, the former ended up adopting AMD's set and soon the _vendor-neutral_ name of `x86_64` was coined.

This architecture is utilised in the vast majority of personal computers, laptops, and servers. Despite its capabilites and wide spread, it's not really energy-efficient primarily due to the out-of-order execution.

### ARM (Advanced RISC Machines)

It was developed by Acron engineeers in 1985 with focus on minimising power usage. Nowadays, ARM processors power multiple portable devices like modern smartphones, but also video game consoles like PS Vita, or Nintendo Switch, and of course single-board computers like Raspberry Pi.

### RISC-V (RISC Five)

The newest player to enter the CPU market, RISC-V was developed by researchers from the University of California, Berkley. There are plenty of existing and in-development implementations from the likes of Google, Nvidia, Western Digital, or Alibaba Group, but these processors currently aren't as widespread as the former two.

## Process management

### Execution units

**Process** is an instance of a program that's being run in sequences of instructions independent of other code. These sequences are known as **threads**. Each process has a unique Process ID (PID), and can (but doesn't have to) consist of multiple threads.

In Linux, however, threads are implemented as processes which share resources with other processes. Threads are identified via a **Thread ID (TID)** in case of a single-threaded process, or a **Thread Group ID (TGID)** in case of a multi-threaded process.

Process can be organised into **Process Groups**, where each group has a unique **Process Group ID (PGID)**, and process groups themselves can be groupped into **Sessions**, which represent a user. As you may have guessed by now, each session has a unique **Session ID (SID)**.

Furthermore, the kernel contains a data structure called `task_struct`, which serves as an implementation basis for processes and threads, including their respective IDs, methods for handling different signals, and so on.

So here's how all these _execution units_ are ordered from the largest to the smallest:

1. Session
2. Process Group
3. Process
4. Thread
5. Task

### Process states

There are 4 main states a process can be in:

- **Running** - the process is active and currently being handled by the processor
- **Sleeping** - the process is waiting for required resources to become available. This state can be divided into 2 subcategories:
  - **Uninterruptible** - the process doesn't react to any signals before the resources become available
  - **Interruptible** - it can respond to both signals and resource availability
- **Stopped** - once a process enters this state, it frees all of its resources and sends a `SIGCHLD` termination signal to its parent, which will then free the child process once it receives said signal
- **Zombie** - process can enter that state after sending the termination signal and before getting removed from the process table by its parent. It means that a process is pretty much defunct at this point

## Memory management

Both the physical and virtual memory are divided into **pages** of fixed length. Pages of the former are called **page frames**, whereas pages of the latter are known as **virtual pages**. Many virtual pages can map to the same **page frame**. Processes believe they work with huge and contiguous sections of virtual memory; so huge in fact, that they exceed the amount of memory that's actually available.

Whenever the CPU requests access to one of the virtual pages, the OS uses a **page table** to obtain the physical address that its virtual counterpart corresponds to. This mapping is a **page table entry (PTE)**.

Modern CPUs contain a cache of recently used PTEs called **Translation Lookaside Buffer (TLB)**. This is what actually gets searched before the page table, and if the requested mapping is found, then the page table never gets queried. Otherwise, the lookup will be performed on said table, but the found PTE will later be saved in the TLB.

Although the **default page size** is a mere 4 kilobytes, it's possible to increase it since the release of kernel 2.6.3. Furthermore, 64-bit Linux allows you to use up to **128 terabytes of virtual address space**, as well as **64 terabytes of physical memory**.

## Network stack

The Linux network stack consists of three layers:

- **Sockets** for abstracting communication
- **Communication Protocols** in form of **Transmission Control Protocol (TCP)** and **User Datagram Protocol (UDP)**
- **Internet Protocol (IP)** for addressing and routing packets so that they can be delivered to the right machine

Other protocls such as HTTP, FTP, SMTP, or SSH are implemented in the user space.

## File systems

File systems are used to organise files and directories in storage media (ie. your hard disk drives and solid-state drives). Linux supports many file systems such as ext4, btrfs, or NTFS. The Linux kernel provides a **Virtual File System (VFS)**, which allows programs running in the userland to interact with the filesystem.

## Device drivers

Device driver is a piece of software that runs in the kernel and is responsible for managing a physical device (such as a keyboard, mouse, gamepad, or even a GPU) or a pseudo-device (e.g. a pseudo-terminal), as well as providing a means of interfacing with said device for other programs.

## System calls

System calls offer a way for programs to request a service from the kernel, which will then execute a set of relevant architecture-specific instructions. Programs don't make use of syscalls directly. Instead, they utilise wrappers from the C standard library, which are available via `glibc` or `musl`.
