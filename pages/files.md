---
title: Files
layout: page
permalink: /files/
lastmod: 2022-09-14T20:42:27.218Z
---

## PDF Files
---
<ul>
{% for pdf in site.data.pdfs %}
  <li>
    <a href="{{ pdf.file }}">{{ pdf.title }}</a>
  </li>
{% endfor %}
</ul>