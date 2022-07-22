---
title: Jekyll 3.9.1 Released
author: Jekyll News
layout: post
permalink: jekyll_391_released.html
original_link: https://jekyllrb.com/news/2021/04/08/jekyll-3-9-1-released/
---

This patch release of the 3.9 series is released to fix a bug where the`include` tag does not allow valid filename characters. For example, this would previously fail:

```
{% include my-logo@2x.svg %}
```

This release adds support for the following characters in filenames:

- `@`
- `-`
- `(` and `)`
- `+`
- `~`
- `#`

Happy Jekylling!

