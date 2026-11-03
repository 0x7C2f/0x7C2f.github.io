---
layout: false
title: "0x7C2f // command center"
permalink: /
---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="0x7C2f – terminal startpage: search, bookmarks, and quick links." />
  <meta name="robots" content="index, follow" />
  <title>0x7C2f // command center</title>

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />

  <style>
    :root {
      --bg:        #070b14;
      --bg-1:      #0d1321;
      --bg-2:      #121a2b;
      --panel:     rgba(13, 19, 33, 0.72);
      --fg:        #e2e8f0;
      --fg-dim:    #94a3b8;
      --fg-mute:   #64748b;
      --border:    rgba(148, 163, 184, 0.18);
      --border-hi: rgba(148, 163, 184, 0.42);
      --accent:    #22d3ee;
      --accent-2:  #a78bfa;
      --amber:     #fbbf24;
      --green:     #4ade80;
      --red:       #f87171;
      --sel-bg:    #22d3ee;
      --sel-fg:    #070b14;
      --font:      "JetBrains Mono", "Fira Code", ui-monospace, monospace;
      --font-ui:   "Inter", system-ui, sans-serif;
      --fs:        14px;
      --fs-sm:     12px;
      --radius:    10px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    html, body {
      height: 100%;
      background: var(--bg);
      color: var(--fg);
      font-family: var(--font);
      font-size: var(--fs);
      line-height: 1.55;
      overflow: hidden;
      -webkit-font-smoothing: antialiased;
    }

    body::before {
      content: "";
      position: fixed;
      inset: 0;
      background:
        radial-gradient(60% 50% at 15% 10%, rgba(34, 211, 238, 0.10), transparent 60%),
        radial-gradient(50% 40% at 85% 90%, rgba(167, 139, 250, 0.08), transparent 60%),
        radial-gradient(40% 30% at 50% 50%, rgba(251, 191, 36, 0.04), transparent 70%);
      pointer-events: none;
      z-index: 0;
    }
    body::after {
      content: "";
      position: fixed;
      inset: 0;
      background-image:
        linear-gradient(rgba(148, 163, 184, 0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(148, 163, 184, 0.04) 1px, transparent 1px);
      background-size: 48px 48px;
      mask-image: radial-gradient(ellipse at center, black 40%, transparent 85%);
      pointer-events: none;
      z-index: 0;
    }

    #shell {
      position: relative;
      z-index: 1;
      display: flex;
      flex-direction: column;
      height: 100vh;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px 12px;
    }

    #titlebar {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 0 12px;
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
    }
    #titlebar-left {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 700;
      letter-spacing: 0.02em;
    }
    #titlebar-left .logo-mark {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      border: 1px solid var(--accent);
      border-radius: 6px;
      color: var(--accent);
      font-size: 12px;
      font-weight: 700;
      box-shadow: 0 0 12px rgba(34, 211, 238, 0.25);
    }
    #titlebar-left a { color: var(--fg); text-decoration: none; }
    #titlebar-left a:hover { color: var(--accent); }

    #titlebar-nav {
      display: flex;
      flex: 1;
      gap: 4px;
      flex-wrap: wrap;
    }
    #titlebar-nav a {
      color: var(--fg-dim);
      text-decoration: none;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: var(--fs-sm);
      transition: color 0.15s, background 0.15s;
    }
    #titlebar-nav a:hover {
      color: var(--fg);
      background: rgba(148, 163, 184, 0.08);
    }
    #titlebar-nav a.active { color: var(--accent); }

    #titlebar-clock {
      color: var(--fg-mute);
      font-size: var(--fs-sm);
      white-space: nowrap;
      letter-spacing: 0.04em;
      font-variant-numeric: tabular-nums;
    }

    #center {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      gap: 22px;
      min-height: 0;
      overflow: hidden;
    }

    #wordmark {
      text-align: center;
      user-select: none;
    }
    #wordmark .hex {
      font-size: 11px;
      color: var(--fg-mute);
      letter-spacing: 0.3em;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    #wordmark .name {
      font-size: 42px;
      font-weight: 700;
      letter-spacing: -0.02em;
      background: linear-gradient(120deg, var(--fg) 0%, var(--accent) 55%, var(--accent-2) 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      text-shadow: 0 0 40px rgba(34, 211, 238, 0.15);
    }
    #wordmark .tag {
      margin-top: 6px;
      color: var(--fg-dim);
      font-size: var(--fs-sm);
      font-family: var(--font-ui);
    }
    #wordmark .tag span { color: var(--accent); }

    .panel {
      width: 100%;
      max-width: 760px;
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      box-shadow:
        0 1px 0 rgba(255, 255, 255, 0.04) inset,
        0 20px 60px -20px rgba(0, 0, 0, 0.6);
      overflow: hidden;
    }
    .panel-head {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border-bottom: 1px solid var(--border);
      background: rgba(148, 163, 184, 0.04);
    }
    .panel-head .dot {
      width: 9px; height: 9px; border-radius: 50%;
      background: var(--fg-mute);
    }
    .panel-head .dot.r { background: var(--red); }
    .panel-head .dot.y { background: var(--amber); }
    .panel-head .dot.g { background: var(--green); }
    .panel-head .title {
      margin-left: 6px;
      color: var(--fg-dim);
      font-size: var(--fs-sm);
      letter-spacing: 0.05em;
    }
    .panel-head .title .accent { color: var(--accent); }

    #engine-tabs {
      display: flex;
      gap: 2px;
      padding: 8px 12px 0;
      overflow-x: auto;
      scrollbar-width: none;
    }
    #engine-tabs::-webkit-scrollbar { display: none; }
    .eng-tab {
      padding: 6px 12px;
      cursor: pointer;
      color: var(--fg-mute);
      border: 1px solid transparent;
      border-radius: 6px 6px 0 0;
      font-size: var(--fs-sm);
      user-select: none;
      white-space: nowrap;
      transition: color 0.15s, background 0.15s, border-color 0.15s;
    }
    .eng-tab:hover {
      color: var(--fg);
      background: rgba(148, 163, 184, 0.06);
    }
    .eng-tab.active {
      color: var(--accent);
      background: rgba(34, 211, 238, 0.08);
      border-color: var(--border);
      border-bottom-color: transparent;
      font-weight: 600;
    }

    #search-row {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      gap: 12px;
    }
    #search-prompt {
      color: var(--green);
      font-weight: 700;
      user-select: none;
    }
    #search-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: var(--fg);
      font-family: var(--font);
      font-size: 15px;
      caret-color: var(--accent);
    }
    #search-input::placeholder { color: var(--fg-mute); }

    #bookmarks-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
      width: 100%;
      max-width: 980px;
    }
    .bm-panel {
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      overflow: hidden;
      transition: border-color 0.2s, transform 0.2s;
    }
    .bm-panel:hover {
      border-color: var(--border-hi);
      transform: translateY(-2px);
    }
    .bm-title {
      padding: 8px 14px;
      font-weight: 600;
      color: var(--amber);
      font-size: var(--fs-sm);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      border-bottom: 1px solid var(--border);
      background: rgba(251, 191, 36, 0.04);
    }
    .bm-list {
      list-style: none;
      padding: 8px 10px 10px;
    }
    .bm-list li { padding: 3px 4px; }
    .bm-list li a {
      color: var(--fg-dim);
      text-decoration: none;
      font-size: var(--fs-sm);
      display: block;
      padding: 3px 6px;
      border-radius: 4px;
      transition: color 0.15s, background 0.15s;
    }
    .bm-list li a:hover {
      color: var(--fg);
      background: rgba(34, 211, 238, 0.10);
    }
    .bm-list li a::before {
      content: "› ";
      color: var(--fg-mute);
    }

    #statusbar {
      display: flex;
      gap: 18px;
      padding: 10px 4px 0;
      font-size: var(--fs-sm);
      color: var(--fg-mute);
      flex-wrap: wrap;
      border-top: 1px solid var(--border);
      flex-shrink: 0;
    }
    #statusbar span { white-space: nowrap; }
    #statusbar .key {
      color: var(--fg-dim);
      background: rgba(148, 163, 184, 0.10);
      padding: 1px 6px;
      border-radius: 4px;
      margin-right: 4px;
      font-size: 11px;
    }
    #statusbar #engine-status {
      margin-left: auto;
      color: var(--accent);
      font-weight: 600;
    }

    ::selection { background: var(--sel-bg); color: var(--sel-fg); }

    @media (max-width: 720px) {
      html, body { overflow: auto; }
      #shell { height: auto; min-height: 100vh; }
      #center { justify-content: flex-start; padding: 16px 0; }
      #wordmark .name { font-size: 30px; }
      #bookmarks-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 480px) {
      #bookmarks-grid { grid-template-columns: 1fr; }
      #titlebar { flex-wrap: wrap; }
    }
  </style>
</head>
<body>

<div id="shell">

  <header id="titlebar">
    <div id="titlebar-left">
      <span class="logo-mark">0x</span>
      <a href="/">0x7C2f</a>
    </div>
    <nav id="titlebar-nav" aria-label="Site navigation">
      <a href="/blog/">blog</a>
      <a href="/files/">files</a>
      <a href="/about/">about</a>
      <a href="/awesome-pi-coding-agent/">awesome-pi</a>
    </nav>
    <span id="titlebar-clock" aria-live="polite" aria-label="Current date and time">--:--</span>
  </header>

  <main id="center" role="main">

    <div id="wordmark">
      <div class="hex">0x7c2f :: terminal</div>
      <div class="name">command center</div>
      <div class="tag">search <span>·</span> bookmarks <span>·</span> quick links</div>
    </div>

    <section class="panel" role="search" aria-label="Web search">
      <div class="panel-head">
        <span class="dot r"></span>
        <span class="dot y"></span>
        <span class="dot g"></span>
        <span class="title"><span class="accent">search</span> :: engine router</span>
      </div>
      <div id="engine-tabs" role="tablist" aria-label="Search engine selection">
        <div class="eng-tab active" data-engine="ddg" data-url="https://duckduckgo.com/?q=" data-label="DuckDuckGo" role="tab" aria-selected="true" tabindex="0">[1] ddg</div>
        <div class="eng-tab" data-engine="google" data-url="https://www.google.com/search?q=" data-label="Google" role="tab" aria-selected="false" tabindex="-1">[2] google</div>
        <div class="eng-tab" data-engine="brave" data-url="https://search.brave.com/search?q=" data-label="Brave" role="tab" aria-selected="false" tabindex="-1">[3] brave</div>
        <div class="eng-tab" data-engine="searx" data-url="https://searx.be/search?q=" data-label="SearXNG" role="tab" aria-selected="false" tabindex="-1">[4] searx</div>
        <div class="eng-tab" data-engine="yt" data-url="https://www.youtube.com/results?search_query=" data-label="YouTube" role="tab" aria-selected="false" tabindex="-1">[5] yt</div>
      </div>
      <div id="search-row">
        <span id="search-prompt">❯</span>
        <input id="search-input" type="text" placeholder="type to search..." autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="Search query" />
      </div>
    </section>

    <div id="bookmarks-grid" aria-label="Bookmarks">

      <div class="bm-panel">
        <div class="bm-title">social</div>
        <ul class="bm-list">
          <li><a href="https://twitter.com">twitter</a></li>
          <li><a href="https://reddit.com">reddit</a></li>
          <li><a href="https://4chan.org">4chan</a></li>
          <li><a href="https://lobste.rs">lobsters</a></li>
        </ul>
      </div>

      <div class="bm-panel">
        <div class="bm-title">dev</div>
        <ul class="bm-list">
          <li><a href="https://github.com">github</a></li>
          <li><a href="https://wiki.archlinux.org">arch wiki</a></li>
          <li><a href="https://devdocs.io">devdocs</a></li>
          <li><a href="https://mankier.com">mankier</a></li>
          <li><a href="https://stackoverflow.com">stack overflow</a></li>
        </ul>
      </div>

      <div class="bm-panel">
        <div class="bm-title">media</div>
        <ul class="bm-list">
          <li><a href="https://youtube.com">youtube</a></li>
          <li><a href="https://open.spotify.com">spotify</a></li>
          <li><a href="https://twitch.tv">twitch</a></li>
          <li><a href="https://netflix.com">netflix</a></li>
        </ul>
      </div>

      <div class="bm-panel">
        <div class="bm-title">news</div>
        <ul class="bm-list">
          <li><a href="https://news.ycombinator.com">hacker news</a></li>
          <li><a href="https://reuters.com">reuters</a></li>
          <li><a href="https://bbc.com/news">bbc news</a></li>
          <li><a href="https://theguardian.com">the guardian</a></li>
        </ul>
      </div>

      <div class="bm-panel">
        <div class="bm-title">tools</div>
        <ul class="bm-list">
          <li><a href="https://chat.openai.com">chatgpt</a></li>
          <li><a href="https://claude.ai">claude</a></li>
          <li><a href="https://notion.so">notion</a></li>
          <li><a href="https://gmail.com">gmail</a></li>
          <li><a href="https://drive.google.com">drive</a></li>
        </ul>
      </div>

      <div class="bm-panel">
        <div class="bm-title">site</div>
        <ul class="bm-list">
          <li><a href="/blog/">blog</a></li>
          <li><a href="/files/">files</a></li>
          <li><a href="/about/">about</a></li>
          <li><a href="https://github.com/0x7C2f">source</a></li>
          <li><a href="/feed.xml">rss</a></li>
        </ul>
      </div>

    </div>
  </main>

  <footer id="statusbar" aria-label="Keyboard shortcuts">
    <span><span class="key">type</span> search</span>
    <span><span class="key">tab</span> switch engine</span>
    <span><span class="key">1-5</span> pick engine</span>
    <span><span class="key">esc</span> clear</span>
    <span><span class="key">enter</span> go</span>
    <span id="engine-status">ddg</span>
  </footer>

</div><!-- #shell -->

<script>
(function () {
  'use strict';

  const clock = document.getElementById('titlebar-clock');
  function updateClock() {
    const now = new Date();
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const day  = days[now.getDay()];
    const hh   = String(now.getHours()).padStart(2,'0');
    const mm   = String(now.getMinutes()).padStart(2,'0');
    const ss   = String(now.getSeconds()).padStart(2,'0');
    const yyyy = now.getFullYear();
    const mo   = String(now.getMonth()+1).padStart(2,'0');
    const dd   = String(now.getDate()).padStart(2,'0');
    clock.textContent = `${day} ${yyyy}-${mo}-${dd}  ${hh}:${mm}:${ss}`;
  }
  updateClock();
  setInterval(updateClock, 1000);

  const tabs        = Array.from(document.querySelectorAll('.eng-tab'));
  const searchInput = document.getElementById('search-input');
  const engineStatus= document.getElementById('engine-status');
  let   activeIdx   = 0;

  function setEngine(idx) {
    tabs.forEach((t, i) => {
      const active = (i === idx);
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', active ? 'true' : 'false');
      t.tabIndex = active ? 0 : -1;
    });
    activeIdx = idx;
    engineStatus.textContent = tabs[idx].dataset.label;
  }

  tabs.forEach((tab, idx) => {
    tab.addEventListener('click', () => { setEngine(idx); searchInput.focus(); });
    tab.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { setEngine(idx); searchInput.focus(); }
    });
  });

  function doSearch() {
    const q = searchInput.value.trim();
    if (!q) return;
    const base = tabs[activeIdx].dataset.url;
    window.location.href = base + encodeURIComponent(q);
  }

  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') doSearch();
    if (e.key === 'Escape') { searchInput.value = ''; }
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      setEngine((activeIdx + 1) % tabs.length);
    }
  });

  document.addEventListener('keydown', e => {
    const active = document.activeElement;
    if (active && active.tagName === 'INPUT' && active !== searchInput) return;
    if (active && active.tagName === 'TEXTAREA') return;

    const num = parseInt(e.key, 10);
    if (num >= 1 && num <= tabs.length && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (active !== searchInput || searchInput.value === '') {
        e.preventDefault();
        setEngine(num - 1);
        searchInput.focus();
        return;
      }
    }

    if (active !== searchInput && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      searchInput.focus();
    }
  });

  searchInput.focus();
})();
</script>
</body>
</html>
