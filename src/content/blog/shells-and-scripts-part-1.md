---
title: shells and scripts part 1
description: Theory behind working with Linux via a CLI and automating various tasks
pubDate: 2023-08-28T18:24:05.514Z
draft: false
categories:
  - learning modern linux
tags:
  - linux
  - notes
---

Hey folks!

This post contains my notes from the third chapter of _Learning Modern Linux_ book written by Michael Hausenblas. Let's just jump into it!

## Ways of working with a CLI

There are two ways in which a user can work with Linux via a CLI:

- **Manual** via a terminal or a pseudo-terminal such as `tty`, where a human inputs commands and checks their output
- **Automatic** by utilising shell scripts, which come in handy for repetitive tasks

## Terminal and Terminal Emulator

**Terminal** is an electronic device which generally consists of a keyboard and a monitor for inputting commands and data into a computer and inspecting the output of entered commands respectively.

**Terminal Emulator** is an application that mimics the behaviour of a physical terminal usually via a graphical user interface or a full-screen console.

## Shell

**Shell** is a program that interprets and executes incoming commands, handles input/output data and enables the user to enter these commands both manually and automatically via scripts.

## Streams

### Definition

**Streams** serve as a means of transporting input, output, and error data. In Linux and other Unix-like systems, every process has access to three **file descriptors**:

- 0 for `stdin`
- 1 for `stdout`
- 2 for `stderr`

### Redirecting to other destinations

By default, `stdin` is connected to the keyboard and the other two are connected to the screen. It's possible to redirect a stream elsewhere by adding `$FD>`, where `$FD` is an appropriate file descriptor (see: list above).

If you omit `$FD`, `stdout` will get redirected to the specified destination. If you want to redirect both `stdout` and `stderr` to the same destination, use `&>`. And if you want to ignore a certain stream, redirect it to `/dev/null`.

### Special characters

- `&` (ampersand) will run a command in the background
- `\` (backslash) allows you to continue writing a command in a new line
- `|` (pipe) allows you to pipe one command's `stdout` into the following command's `stdin`

## Variables

Shell variables, just like in pretty much any other programming language, are used to store a piece of data under a symbolic name.

We can specify two types of variables:

- **Environment variables** that are used to configure a value in some script from outside said code
- **Shell variables** that are limited to the execution context of a given script

Here's how to create a shell variable:

```sh
set NICE_NUMBER=69
```

And here's how to create an environment variable:

```sh
export ANOTHER_NICE_NUMBER=420
```

Here's how to print a variable's value:

```sh
echo $VARIABLE_NAME_HERE
```

Select environment and shell variables:

- `PATH` - list of paths to search for executables to run
- `HOSTNAME` - name of the device
- `PWD` - absolute path to the current working directory
- `USER` - current user's username
- `$` - current PID
- `?` - last task's exit code

Speaking of exit codes...

## Exit Codes

Every process is expected to return a status code after exiting. Code `0` means a **successful execution**, whereas every code greater than or equal `1` means some sort of a **failure**.

## Job Control

By default, every command you execute runs in **the foreground**, meaning it takes control over the keyboard and the screen. If you want to start a task in **the background**, you have to append a `&` to the command, or press `Ctrl+Z` while the task is running in the foreground.

## Modern command replacements and other utils

- [`exa`](https://the.exa.website/) as a replacement for `ls -l`
- [`bat`](https://github.com/sharkdp/bat) as a replacement for `cat`
- [`ripgrep (rg)`](https://github.com/BurntSushi/ripgrep) as a replacement for... well, `grep`
- [`gtop`](https://github.com/aksakalli/gtop) as a performance monitor in your CLI
- [`curlie`](https://github.com/rs/curlie) as a modern enhancement of `curl`

Feel free to check out [the modern-unix repo](https://github.com/ibraheemdev/modern-unix) for more examples.

## Navigation

Here's a list of some key combinations to help you navigate around your CLI:

- `Ctrl + A` moves the cursor to the start of the line
- `Ctrl + E` moves the cursor to the end of the line
- `Left Alt + F` moves the cursor forward by a word
- `Left Alt + B` moves the cursor backward by a word
- `Ctrl + U` removes all the characters on the left-hand side of a cursor
- `Ctrl + K` removes all the characters on the right-hand side of a cursor

## File content CRUD operations

### Create a file

```sh
touch cool-file.txt
```

### Read a file

```sh
cat cool-file.txt
```

### Overwrite a file's content

```sh
echo 'New file content' > cool-file.txt
```

### Append content to a file

```sh
echo 'Even more new content' >> cool-file.txt
```

(There's no need to add a newline character manually)

### Delete a file

```sh
rm cool-file.txt
```
