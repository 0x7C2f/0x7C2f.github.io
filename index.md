---
title: "0x7C2f Wiki"
keywords: overview start
tags: [overview]
toc: true
sidebar: mydoc_sidebar
permalink: index.html
summary: These brief overview as to what I am running system wise.
---

# Latest Posts
<ul>
    {% for post in site.posts %}
       {% unless post.title contains '@0x7C2f' %}
        <li>
            <a href="{{ post.url }}">{{ post.title }}</a>
        </li>
        {% endunless %}
    {% endfor %}
</ul>


# Twitter


<ul>
    {% for post in site.posts %}
        {% if post.title contains '@0x7C2f' %}
        <li>
            <a href="{{ post.url }}">{{ post.title }}</a>
        </li>
        {% endif %}
    {% endfor %}
</ul>