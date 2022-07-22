---
layout: post
tags: android 
categories: android
permalink: revanced-on-android.html
title: 'How to use revanced builder on Android'
---

"Firstly, you have to install Termux. To do this, you have to install [F-Droid](https://f-droid.org/).

After that, you have to run these commands:

```
termux-setup-storage
apt update
apt upgrade
apt install wget nodejs-lts openjdk-17 -y
wget https://github.com/reisxd/revanced-builder/archive/refs/heads/cli.zip
unzip cli.zip
cd revanced-builder-cli
npm i
node .
```
After running `node .`, revanced-builder will install OpenJDK 17 if its missing and also aapt2.

You now can build ReVanced with revanced-builder!

See my [YouTube-Revanced](YouTube-Revanced.html) page for more!