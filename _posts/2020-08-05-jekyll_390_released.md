---
title: Jekyll 3.9.0 Released
author: Jekyll News
layout: post
permalink: jekyll_390_released.html
original_link: https://jekyllrb.com/news/2020/08/05/jekyll-3-9-0-released/
---

Jekyll 3.9.0 allows use of kramdown v2, the latest series of kramdown.

If you choose to upgrade, please note that the GitHub-Flavored Markdown parser and other features of kramdown v1 are now distributed via separate gems. If you would like to continue using these features, you will need to add the gems to your `Gemfile`. They are as follows:

- GFM parser – `kramdown-parser-gfm`
- coderay syntax highlighter – `kramdown-syntax-coderay`
- mathjaxnode math engine – `kramdown-math-mathjaxnode`
- sskatex math engine – `kramdown-math-sskatex`
- katex math engine – `kramdown-math-katex`
- ritex math engine – `kramdown-math-ritex`
- itex2mml math engine – `kramdown-math-itex2mml`

Jekyll will require the given gem when the configuration requires it, and will show a helpful message when a dependency is missing.

You can check out the patches and see all the details in [the release notes](/docs/history/#v3-9-0)

Happy Jekylling!

