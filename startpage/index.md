---
layout: false
title: Startpage
permalink: /startpage/
---

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Personal startpage with bookmarks and search">
    <title>~/startpage</title>
    <link rel="stylesheet" type="text/css" href="/assets/startpage.css">
</head>

<body>
    <div class="container">
        <div class="left-container">
            <div class="gif">
                <img src="/images/pp.gif" alt="Animated character illustration" />
            </div>
        </div>

        <div class="right-container">
            <header class="head">
                <p>> cd ~/<span class="blinking" aria-label="cursor">_</span></p>
            </header>
            <div class="search">
                <form action="https://duckduckgo.com/" method="get" class="search-form">
                    <span class="prompt">> search </span>
                    <input type="text" name="q" placeholder="query..." class="search-input" autocomplete="off" id="search-input">
                </form>
            </div>
			<hr>
            <nav class="bookmarks" aria-label="Quick links">
                <div class="category">
                    <ul class="links">
                        <li class="title" aria-label="Social category">Social</li>
                        <li><a href="https://4chan.org">4Chan</a></li>
                        <li><a href="https://reddit.com">Reddit</a></li>
                        <li><a href="https://twitter.com">Twitter</a></li>
                    </ul>
                </div>
                <div class="category">
                    <ul class="links">
                        <li class="title" aria-label="Development category">Dev</li>
                        <li><a href="https://github.com/">GitHub</a></li>
                        <li><a href="https://wiki.archlinux.org/">Arch Wiki</a></li>
                        <li><a href="https://mankier.com/">Mankier</a></li>
                        <li><a href="https://devdocs.io/">DevDocs</a></li>
                        <li><a href="https://stackoverflow.com/">Stack Overflow</a></li>
                    </ul>
                </div>
                <div class="category">
                    <ul class="links">
                        <li class="title" aria-label="Media category">Media</li>
                        <li><a href="https://open.spotify.com/">Spotify</a></li>
                        <li><a href="https://youtube.com/">YouTube</a></li>
                        <li><a href="https://twitch.tv/">Twitch</a></li>
                        <li><a href="https://netflix.com/">Netflix</a></li>
                    </ul>
                </div>
                <div class="category">
                    <ul class="links">
                        <li class="title" aria-label="News category">News</li>
                        <li><a href="https://bbc.com/news">BBC News</a></li>
                        <li><a href="https://reuters.com/">Reuters</a></li>
                        <li><a href="https://theguardian.com/">The Guardian</a></li>
                    </ul>
                </div>
                <div class="category">
                    <ul class="links">
                        <li class="title" aria-label="Tools category">Tools</li>
                        <li><a href="https://gmail.com/">Gmail</a></li>
                        <li><a href="https://drive.google.com/">Google Drive</a></li>
                        <li><a href="https://notion.so/">Notion</a></li>
                        <li><a href="https://chat.openai.com/">ChatGPT</a></li>
                    </ul>
                </div>
            </nav>
        </div>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const searchInput = document.getElementById('search-input');
            searchInput.focus();
        });
    </script>
</body>

</html>