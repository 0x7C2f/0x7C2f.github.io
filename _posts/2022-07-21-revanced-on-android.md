---
layout: post
tags: android 
categories: android
permalink: revanced-on-android.html
title: 'How to use revanced builder on Android'
---

## Prerequisites
Firstly, you have to install the following terminal emulator:
<br>
<br>
 [Termux](https://github.com/termux/termux-app) (GitHub link) <br>
 OR <br>
[Termux](https://f-droid.org/en/packages/com.termux) (F-Droid link)<br>
<br>
Secondly, be sure to be in the termux ~/ directory when running the commands below.

## Installation

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


## ReVanced Patches
 
🧩 [Official patches by ReVanced](https://github.com/revanced/revanced-patches/blob/main/README.md)
 
### List of available patches
 
| 💊 Patch | 📜 Description | 🎯 Target Package | 🏹 Target Version |
|:--------:|:--------------:|:-----------------:|:-----------------:|
| `minimized-playback-music` | Enables minimized playback on Kids music. | `com.google.android.apps.youtube.music` | 5.14.53 |
| `tasteBuilder-remover` | Removes the "Tell us which artists you like" card from the home screen. | `com.google.android.apps.youtube.music` | 5.14.53 |
| `hide-get-premium` | Removes all "Get Premium" evidences from the avatar menu. | `com.google.android.apps.youtube.music` | 5.14.53 |
| `compact-header` | Hides the music category bar at the top of the homepage. | `com.google.android.apps.youtube.music` | 5.14.53 |
| `upgrade-button-remover` | Removes the upgrade tab from the pivot bar. | `com.google.android.apps.youtube.music` | 5.14.53 |
| `background-play` | Enables playing music in the background. | `com.google.android.apps.youtube.music` | 5.14.53 |
| `music-video-ads` | Removes ads in the music player. | `com.google.android.apps.youtube.music` | 5.14.53 |
| `codecs-unlock` | Adds more audio codec options. The new audio codecs usually result in better audio quality. | `com.google.android.apps.youtube.music` | 5.14.53 |
| `exclusive-audio-playback` | Enables the option to play music without video. | `com.google.android.apps.youtube.music` | 5.14.53 |
| `swipe-controls` | Adds volume and brightness swipe controls. | `com.google.android.youtube` | 17.27.39 |
| `seekbar-tapping` | Enables tap-to-seek on the seekbar of the video player. | `com.google.android.youtube` | 17.27.39 |
| `minimized-playback` | Enables minimized and background playback. | `com.google.android.youtube` | 17.27.39 |
| `amoled` | Enables pure black theme. | `com.google.android.youtube` | 17.27.39 |
| `disable-create-button` | Hides the create button in the navigation bar. | `com.google.android.youtube` | 17.27.39 |
| `hide-cast-button` | Hides the cast button in the video player. | `com.google.android.youtube` | all |
| `return-youtube-dislike` | Shows the dislike count of videos using the Return YouTube Dislike API. | `com.google.android.youtube` | 17.27.39 |
| `hide-autoplay-button` | Hides the autoplay button in the video player. | `com.google.android.youtube` | 17.27.39 |
| `premium-heading` | Shows premium branding on the home screen. | `com.google.android.youtube` | all |
| `custom-branding` | Changes the YouTube launcher icon to be ReVanced's. | `com.google.android.youtube` | all |
| `disable-fullscreen-panels` | Disables video description and comments panel in fullscreen view. | `com.google.android.youtube` | 17.27.39 |
| `old-quality-layout` | Enables the original quality flyout menu. | `com.google.android.youtube` | 17.27.39 |
| `hide-shorts-button` | Hides the shorts button on the navigation bar. | `com.google.android.youtube` | 17.27.39 |
| `hide-watermark` | Hides creator's watermarks on videos. | `com.google.android.youtube` | 17.27.39 |
| `sponsorblock` | Integrate SponsorBlock. | `com.google.android.youtube` | 17.27.39 |
| `enable-wide-searchbar` | Replaces the search icon with a wide search bar. This will hide the YouTube logo when active. | `com.google.android.youtube` | 17.27.39 |
| `force-vp9-codec` | Forces the VP9 codec for videos. | `com.google.android.youtube` | 17.27.39 |
| `autorepeat-by-default` | Enables auto repeating of videos by default. | `com.google.android.youtube` | 17.27.39 |
| `microg-support` | Allows YouTube ReVanced to run without root and under a different package name with Vanced MicroG | `com.google.android.youtube` | 17.27.39 |
| `enable-debugging` | Enables app debugging by patching the manifest file. | `com.google.android.youtube` | all |
| `custom-playback-speed` | Adds more video playback speed options. | `com.google.android.youtube` | 17.27.39 |
| `hdr-auto-brightness` | Makes the brightness of HDR videos follow the system default. | `com.google.android.youtube` | 17.27.39 |
| `video-ads` | Removes ads in the video player. | `com.google.android.youtube` | 17.27.39 |
| `general-ads` | Removes general ads. | `com.google.android.youtube` | 17.27.39 |
| `hide-infocard-suggestions` | Hides infocards in videos. | `com.google.android.youtube` | 17.27.39 |
 
 