---
title: validating debian live isos and creating live usbs using cli
description: it ain't much, but it's honest work 
pubDate: 2024-02-20T10:22:33.724Z
draft: false
categories:
  - project homelabtop
tags:
  - linux
  - self-hosted
---

The last couple of days have been a bit busier than I expected, so here's a little guide for validating Debian Live ISO files and cheksum lists' signatures, as well as writing these image files to USB drives using the command line.

## Verifying ISO file's checksums

Once you've downloaded a live ISO of your choice, make sure to download `SHA256SUMS` and `SHA512SUMS` files as well. That's because you can use them to verify if the SHA256 or SHA512 cheksum of the ISO file is present in its respecitve `SUMS` file.

Here's how I do it (replace `debian.iso` with the original file name of your ISO):

```sh
cat SHA256SUMS | grep "$(sha256sum debian.iso)"
cat SHA512SUMS | grep "$(sha512sum debian.iso)"
```

In case you're not familiar with the Linux command line, I've got you covered with a breakdown:

1. The `cat` command accepts a path to a given file, and if it exists, outputs its content
2. The pipe symbol redirects the output of the command on the left-hand side to the input of the command on the right-hand side.
3. The right-hand side command in our case is `grep`, which in our case will look for a given substring passed as the first argument across the whole text provided as input
4. Finally, I make use of the `"$()"` syntax to compute a given checksum of the ISO file, and since the output comes back as `CHECKSUM  FILENAME`, I need those extra quotation marks to ensure that grep treats this output as a single parameter instead of two separate ones.

If you run these commands and get back similar `CHECKSUM  FILENAME` lines, it means that the downloaded ISO file is valid.

## Validating the checksum lists

You can also check if the aforementioned `SUMS` files are correct by verifying their respective `.sign` files
using [GNU Privacy Guard (GPG)](https://www.gnupg.org/). First, you need to obtain the key ID by running:

```sh
gpg --verify SHA256SUMS.sign SHA256SUMS
```

You will probably get an error message that says `Can't check the signature: public key not found`. If that's the case, copy over the `KEY_ID` from the message that says `Signature made DATE_AND_TIME using RSA key ID: KEY_ID` to the following command:

```sh
gpg --keyserver keyring.debian.org --recv KEY_ID
```

Now that you've obtained the public key, you can rerun `gpg --verify SHA256SUMS.sign SHA256SUMS`. If the output contains a line that says something like `Good signature from "Debian CD signing key"`, you're good to go and use the live image.

Well, you should also run `gpg --verify SHA512SUMS.sign SHA512SUMS` and expect it to print a similar `Good signature` message. If it does, then you're good to proceed to the next section of this article.

## Preparing a bootable live USB drive

Although there are plenty of image writers with friendly UIs, I believe using the Linux command line for that task isn't as difficult as it may seem.

### Finding the target drive's path

First of all, look up the name of your USB drive by using:

```sh
ls -l /dev/disk/by-id/usb-*
```

The `-l` flag tells `ls` to use a more verbose listing format for each entry in the target directory.

You're after the path which **doesn't** end with `-part` followed by a number. Also, keep in mind the `/dev/sd*` path that may be listed alongside the longer path, as it will come in handy shortly.

Now you need to ensure that the target drive **isn't** mounted anywhere by running `lsblk`. If the value for the USB drive (ie. the one that's got the aforementioned `/dev/sd*` name) under the `MOUNTPOINTS` column is empty, you can proceed. Otherwise, unmount the drive using `umount` and run `lsblk` again.

### Writing the image file to the USB drive

Here comes the image writing part, and more specifically, the `tee` command. It's a simple tool that takes whatever was passed to it via standard input and writes it to the standard output.

If you combine `tee` together with _redirection operators_ (ie. `<` and `>` for redirecting a file's content to `stdin` and `stdout` respectively), we can use it to write the live image's content onto the target drive like so:

```sh
tee < /path/to/debian.iso > /dev/disk/by-id/usb-WHATEVER
```

After a minute or so, you should have a bootable Debian live USB at your disposal.

## Outro

If you've made it this far into my article, thank you so much for reading it! I'm aware there are plenty of similar tutorials covering the same topic, but it never hurts to add another one to the pile.
