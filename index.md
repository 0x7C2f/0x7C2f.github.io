---
layout: false
title: "~/0x7C2f"
permalink: /
---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="0x7C2f – TUI startpage: search, bookmarks, and quick links." />
  <meta name="robots" content="index, follow" />
  <title>~/0x7C2f</title>
  <style>
    /* ── Reset & base ─────────────────────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:      #000;
      --fg:      #DBDBDB;
      --dim:     #888;
      --border:  rgba(219,219,219,0.75);
      --accent:  #b38aff;
      --green:   #05ca05;
      --yellow:  #e4e477;
      --red:     #f44;
      --sel-bg:  #DBDBDB;
      --sel-fg:  #000;
      --font:    "Courier New", Courier, monospace;
      --fs:      15px;
      --fs-sm:   12px;
    }

    html, body {
      height: 100%; width: 100%;
      background: var(--bg);
      color: var(--fg);
      font-family: var(--font);
      font-size: var(--fs);
      line-height: 1.5;
      overflow: hidden;
    }

    /* ── Outer shell: full viewport ──────────────────────────── */
    #shell {
      display: flex;
      flex-direction: column;
      height: 100vh;
      width: 100vw;
      max-width: 1100px;
      margin: 0 auto;
      padding: 0 12px 4px;
    }

    /* ── Title bar ───────────────────────────────────────────── */
    #titlebar {
      display: flex;
      align-items: center;
      gap: 0;
      border-bottom: 1px dashed var(--border);
      padding: 6px 0;
      flex-shrink: 0;
    }
    #titlebar-left  { font-weight: bold; padding-right: 12px; border-right: 1px dashed var(--border); }
    #titlebar-nav   { display: flex; flex: 1; gap: 2px; padding: 0 8px; flex-wrap: wrap; }
    #titlebar-nav a {
      color: var(--fg); text-decoration: none;
      padding: 2px 8px; min-height: 24px; line-height: 20px;
    }
    #titlebar-nav a:hover { background: var(--sel-bg); color: var(--sel-fg); }
    #titlebar-clock {
      padding-left: 12px;
      border-left: 1px dashed var(--border);
      color: var(--dim);
      white-space: nowrap;
      font-size: var(--fs-sm);
    }

    /* ── Main centering area ─────────────────────────────────── */
    #center {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      gap: 10px;
    }

    /* ── ASCII banner ────────────────────────────────────────── */
    #banner {
      color: var(--accent);
      text-align: center;
      font-size: var(--fs-sm);
      line-height: 1.2;
      white-space: pre;
      user-select: none;
    }

    /* ── TUI panel (generic bordered box) ────────────────────── */
    .tui-panel {
      border: 1px dashed var(--border);
      width: 100%;
      max-width: 620px;
    }
    .tui-panel-title {
      border-bottom: 1px dashed var(--border);
      padding: 2px 10px;
      color: var(--accent);
      font-weight: bold;
      font-size: var(--fs-sm);
      user-select: none;
    }
    .tui-panel-body { padding: 8px 10px; }

    /* ── Search engine tabs ──────────────────────────────────── */
    #engine-tabs {
      display: flex;
      gap: 0;
      border-bottom: 1px dashed var(--border);
      overflow-x: auto;
      scrollbar-width: none;
    }
    #engine-tabs::-webkit-scrollbar { display: none; }
    .eng-tab {
      padding: 2px 10px;
      cursor: pointer;
      color: var(--dim);
      border-right: 1px dashed var(--border);
      user-select: none;
      font-size: var(--fs-sm);
      white-space: nowrap;
      transition: background 0.1s, color 0.1s;
    }
    .eng-tab:hover  { background: var(--sel-bg); color: var(--sel-fg); }
    .eng-tab.active { color: var(--fg); background: var(--bg); font-weight: bold; }

    /* ── Search row ──────────────────────────────────────────── */
    #search-row {
      display: flex;
      align-items: center;
      padding: 8px 10px;
      gap: 6px;
    }
    #search-prompt { color: var(--green); white-space: nowrap; user-select: none; }
    #search-input  {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: var(--fg);
      font-family: var(--font);
      font-size: var(--fs);
      caret-color: var(--fg);
    }
    #search-input::placeholder { color: var(--dim); }

    /* ── Bookmarks grid ──────────────────────────────────────── */
    #bookmarks-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      width: 100%;
      max-width: 620px;
      justify-content: center;
    }
    .bm-panel {
      border: 1px dashed var(--border);
      min-width: 140px;
      flex: 1 1 140px;
    }
    .bm-title {
      border-bottom: 1px dashed var(--border);
      padding: 1px 8px;
      font-weight: bold;
      color: var(--yellow);
      font-size: var(--fs-sm);
      user-select: none;
    }
    .bm-list {
      list-style: none;
      padding: 4px 8px;
    }
    .bm-list li { padding: 1px 0; }
    .bm-list li a {
      color: var(--fg);
      text-decoration: none;
      font-size: var(--fs-sm);
    }
    .bm-list li a:hover { background: var(--sel-bg); color: var(--sel-fg); }
    .bm-list li a:focus { outline: 1px solid var(--accent); outline-offset: 1px; }

    /* ── Status bar ──────────────────────────────────────────── */
    #statusbar {
      border-top: 1px dashed var(--border);
      padding: 3px 0;
      display: flex;
      gap: 16px;
      font-size: var(--fs-sm);
      color: var(--dim);
      flex-shrink: 0;
      flex-wrap: wrap;
    }
    #statusbar span { white-space: nowrap; }
    #statusbar .key { color: var(--fg); }
    #statusbar #engine-status { margin-left: auto; color: var(--accent); }

    /* ── Selection ───────────────────────────────────────────── */
    ::selection { background: var(--sel-bg); color: var(--sel-fg); }

    /* ── Responsive ──────────────────────────────────────────── */
    @media (max-width: 700px) {
      html, body { overflow: auto; }
      #shell { height: auto; min-height: 100vh; }
      #center { justify-content: flex-start; padding: 8px 0; }
      #banner { font-size: 9px; }
      .tui-panel, #bookmarks-grid { max-width: 100%; }
      .bm-panel { min-width: 120px; }
    }
  </style>
</head>
<body>

<div id="shell">

  <!-- ── Title bar ─────────────────────────────────────── -->
  <div id="titlebar">
    <span id="titlebar-left">[ <a href="/" style="color:inherit;text-decoration:none;">0x7C2f</a> ]</span>
    <nav id="titlebar-nav" aria-label="Site navigation">
      <a href="/blog/">blog</a>
      <a href="/files/">files</a>
      <a href="/about/">about</a>
    </nav>
    <span id="titlebar-clock" aria-live="polite" aria-label="Current date and time">--:--</span>
  </div>

  <!-- ── Centered content ──────────────────────────────── -->
  <main id="center" role="main">

    <!-- ASCII banner -->
    <pre id="banner" aria-label="Site logo">
 ██████╗ ██╗  ██╗███████╗ ██████╗██████╗ ███████╗
██╔═████╗╚██╗██╔╝╚════██║██╔════╝╚════██╗██╔════╝
██║██╔██║ ╚███╔╝      ██╔╝██║      ████╔╝█████╗  
████╔╝██║ ██╔██╗     ██╔╝ ██║     ██╔══╝ ██╔══╝  
╚██████╔╝██╔╝ ██╗    ██║  ╚██████╗███████╗██║     
 ╚═════╝ ╚═╝  ╚═╝    ╚═╝   ╚═════╝╚══════╝╚═╝     </pre>

    <!-- Search box -->
    <div class="tui-panel" role="search" aria-label="Web search">
      <div id="engine-tabs" role="tablist" aria-label="Search engine selection">
        <div class="eng-tab active" data-engine="ddg"    data-url="https://duckduckgo.com/?q=" data-label="DuckDuckGo" role="tab" aria-selected="true"  tabindex="0">[1] ddg</div>
        <div class="eng-tab"        data-engine="google" data-url="https://www.google.com/search?q=" data-label="Google" role="tab" aria-selected="false" tabindex="-1">[2] google</div>
        <div class="eng-tab"        data-engine="brave"  data-url="https://search.brave.com/search?q=" data-label="Brave" role="tab" aria-selected="false" tabindex="-1">[3] brave</div>
        <div class="eng-tab"        data-engine="searx"  data-url="https://searx.be/search?q=" data-label="SearXNG" role="tab" aria-selected="false" tabindex="-1">[4] searx</div>
        <div class="eng-tab"        data-engine="yt"     data-url="https://www.youtube.com/results?search_query=" data-label="YouTube" role="tab" aria-selected="false" tabindex="-1">[5] yt</div>
      </div>
      <div id="search-row">
        <span id="search-prompt">❯</span>
        <input
          id="search-input"
          type="text"
          placeholder="type to search..."
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          aria-label="Search query"
        />
      </div>
    </div>

    <!-- Bookmarks -->
    <div id="bookmarks-grid" aria-label="Bookmarks">

      <div class="bm-panel">
        <div class="bm-title">[ social ]</div>
        <ul class="bm-list">
          <li><a href="https://twitter.com">twitter</a></li>
          <li><a href="https://reddit.com">reddit</a></li>
          <li><a href="https://4chan.org">4chan</a></li>
          <li><a href="https://lobste.rs">lobsters</a></li>
        </ul>
      </div>

      <div class="bm-panel">
        <div class="bm-title">[ dev ]</div>
        <ul class="bm-list">
          <li><a href="https://github.com">github</a></li>
          <li><a href="https://wiki.archlinux.org">arch wiki</a></li>
          <li><a href="https://devdocs.io">devdocs</a></li>
          <li><a href="https://mankier.com">mankier</a></li>
          <li><a href="https://stackoverflow.com">stack overflow</a></li>
        </ul>
      </div>

      <div class="bm-panel">
        <div class="bm-title">[ media ]</div>
        <ul class="bm-list">
          <li><a href="https://youtube.com">youtube</a></li>
          <li><a href="https://open.spotify.com">spotify</a></li>
          <li><a href="https://twitch.tv">twitch</a></li>
          <li><a href="https://netflix.com">netflix</a></li>
        </ul>
      </div>

      <div class="bm-panel">
        <div class="bm-title">[ news ]</div>
        <ul class="bm-list">
          <li><a href="https://news.ycombinator.com">hacker news</a></li>
          <li><a href="https://reuters.com">reuters</a></li>
          <li><a href="https://bbc.com/news">bbc news</a></li>
          <li><a href="https://theguardian.com">the guardian</a></li>
        </ul>
      </div>

      <div class="bm-panel">
        <div class="bm-title">[ tools ]</div>
        <ul class="bm-list">
          <li><a href="https://chat.openai.com">chatgpt</a></li>
          <li><a href="https://claude.ai">claude</a></li>
          <li><a href="https://notion.so">notion</a></li>
          <li><a href="https://gmail.com">gmail</a></li>
          <li><a href="https://drive.google.com">drive</a></li>
        </ul>
      </div>

      <div class="bm-panel">
        <div class="bm-title">[ site ]</div>
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

  <!-- ── Status bar ─────────────────────────────────────── -->
  <div id="statusbar" aria-label="Keyboard shortcuts">
    <span><span class="key">[type]</span> search</span>
    <span><span class="key">[tab]</span> switch engine</span>
    <span><span class="key">[1-5]</span> pick engine</span>
    <span><span class="key">[esc]</span> clear</span>
    <span><span class="key">[enter]</span> go</span>
    <span id="engine-status">ddg</span>
  </div>

</div><!-- #shell -->

<script>
(function () {
  'use strict';

  /* ── Clock ─────────────────────────────────────────────── */
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

  /* ── Engine selection ──────────────────────────────────── */
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

  /* ── Search submit ─────────────────────────────────────── */
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

  /* ── Numeric shortcut: 1-5 to select engine ───────────── */
  document.addEventListener('keydown', e => {
    const active = document.activeElement;
    /* Ignore if typing in a real input that is NOT our search field */
    if (active && active.tagName === 'INPUT' && active !== searchInput) return;
    if (active && active.tagName === 'TEXTAREA') return;

    const num = parseInt(e.key, 10);
    if (num >= 1 && num <= tabs.length && !e.ctrlKey && !e.metaKey && !e.altKey) {
      /* Only intercept if nothing is typed yet (no partial query) */
      if (active !== searchInput || searchInput.value === '') {
        e.preventDefault();
        setEngine(num - 1);
        searchInput.focus();
        return;
      }
    }

    /* Any printable character outside a focused input → focus search */
    if (active !== searchInput && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      searchInput.focus();
    }
  });

  /* ── Auto-focus on load ────────────────────────────────── */
  searchInput.focus();
})();
</script>
</body>
</html>
