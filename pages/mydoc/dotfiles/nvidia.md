---
title: Nvidia
tags: nvidia
keywords: nvidia
sidebar: mydoc_sidebar
permalink: nvidia.html
---


## 20-nvidia.conf
```yml
{% include dotfiles/roles/nvidia/templates/20-nvidia.j2 %}
```
## blacklist-nvidia-nouveau.conf
```yml
{% include dotfiles/roles/nvidia/templates/blacklist-nvidia-nouveau.j2 %}
```
## Nvidia Settings
```yml
{% include dotfiles/roles/nvidia/templates/nvidia-settings-rc.j2 %}
```
## Nvidia Hook
```yml
{% include dotfiles/roles/nvidia/templates/nvidia.j2 %}
```