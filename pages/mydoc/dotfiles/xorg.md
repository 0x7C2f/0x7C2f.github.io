---
title: xorg
tags: xorg
keywords: xorg
last_updated: July 18, 2022
sidebar: mydoc_sidebar
permalink: xorg.html
---
## Keyboard Backlight
```yml
{% include dotfiles/roles/xorg/files/20-intel.conf %}
```
## xorg init
```yml
{% include dotfiles/roles/xorg/templates/xinitrc.j2 %}
```