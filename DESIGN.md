---
# DESIGN.md — 0x7C2f design system contract
# OMH design_system_contract/v1
# Status: source of truth — all pages must conform; no component code without this contract.
palette:
  bg: "#070b14"
  panel: "rgba(13, 19, 33, 0.72)"
  fg: "#e2e8f0"
  fg-dim: "#94a3b8"
  fg-mute: "#64748b"
  border: "rgba(148, 163, 184, 0.18)"
  border-hi: "rgba(148, 163, 184, 0.42)"
  accent: "#22d3ee"
  accent-2: "#a78bfa"
  amber: "#fbbf24"
  green: "#4ade80"
  red: "#f87171"
  sel-bg: "#22d3ee"
  sel-fg: "#070b14"
typography:
  font: '"JetBrains Mono", "Fira Code", ui-monospace, monospace'
  font-ui: '"Inter", system-ui, sans-serif'
  fs: "14px"
  fs-sm: "12px"
  line-height: "1.55"
geometry:
  radius: "10px"
  border-width: "1px"
  border-style: "dashed"
  shell-max-width: "1200px"
  shell-padding: "0 20px 12px"
  titlebar-padding: "14px 0 12px"
  panel-padding: "10px 16px"
layout:
  shell: "#shell > #titlebar + #center"
  titlebar:
    left: "[ <a>0x7C2f</a> ]"
    nav: "blog / files / about / awesome-pi-coding-agent"
    right: "clock"
  center: "wordmark + panels + search row + statusbar"
breakpoints:
  tablet: "720px"
  mobile: "480px"
motion:
  easing: "0.15s ease"
  reduced-motion: "respect prefers-reduced-motion: reduce; no bounce decoration"
terminal:
  theme: "{ background:'#0f172a', foreground:'#e2e8f0' }"
  height: "88vh"
---
# Overview

**Primary direction: operational.** This is a developer startpage / portfolio (blog, files, about, PDF library, simulator). Utility leads over drama: information density, native controls, stable dimensions, restrained color. The editorial prior (cream grounds, serif display, muted terracotta) is explicitly rejected — it washes out status color and fights tabular figures, a failure mode for dashboards and dev tools per `taste-foundations.md`.

**Named borrowed element:** none. All tokens are project-defined; no third-party logos, assets, or brand copy are copied.

# Palette

Background is near-black `#070b14` (not pure `#000`) so text `#e2e8f0` retains readable contrast without starkness. Accent `#22d3ee` (cyan) is used for interactive state and selection; accent-2 `#a78bfa` (violet) for secondary emphasis. Amber/green/red are semantic states only (warn/success/error). Every surface layer carries a token; no ad-hoc hex literals in components.

# Typography

Text face: `JetBrains Mono`, `Fira Code`, `ui-monospace`, `monospace` at `14px`, line-height `1.55`. UI labels may use `Inter`, `system-ui`, sans-serif at `12px`. No serif display faces. Headings use the mono stack with weight for hierarchy, not size jumps.

# Geometry

Borders: `1px dashed` in the border token, matching the site's established TUI aesthetic. Radius `10px` on panels. Shell max-width `1200px`, centered, padding `0 20px 12px`.

# Layout

One shell structure for every page:

```
#shell (flex column, 100vh, max-width 1200px, centered)
  #titlebar (flex, border-bottom dashed, padding 14px 0 12px)
    #titlebar-left — brand wordmark "[ 0x7C2f ]"
    #titlebar-nav — nav links: blog, files, about, awesome-pi-coding-agent
    #titlebar-clock — date/time, muted, monospace
  #center (flex column, center, gap, flex: 1)
    page-specific content
  #statusbar (border-top dashed, keyboard hints + engine status)
```

The root startpage (`/`) additionally embeds search engine tabs, search row, and bookmarks grid inside `#center`. Section pages embed their article/content in `#center` and may drop the bookmarks grid.

# Components

Reusable primitives (each with default/hover/focus-visible/active/disabled states):

- **Nav link** — `padding 6px 12px`, radius `6px`, `fg-dim` → `fg` on hover, `.active` in accent
- **Panel** — `bg panel`, `1px dashed border`, radius `10px`, `backdrop-filter: blur(12px)`
- **Engine tab** — border-radius top only, active in accent with transparent bottom border
- **Search input** — transparent bg, no border, accent caret
- **Bookmark panel** — bordered card, title bar, link list with `›` prefix
- **Statusbar** — keyboard shortcuts left, engine status right in accent

# Motion

Transitions `0.15s ease` on color/background/border. No bounce easing, no decorative animation. `prefers-reduced-motion: reduce` disables all transitions and the terminal cursor blink.

# Responsive

- `max-width 720px`: `overflow: auto`, shell height auto, center justify flex-start, wordmark name smaller, bookmarks grid 2 columns
- `max-width 480px`: bookmarks grid 1 column, titlebar wraps

# Accessibility

- Skip link to `#main-content` on section pages
- `aria-current="page"` on active nav link
- Focus-visible outline in accent, 2px
- `prefers-contrast: high` widens focus outline to 3px
- All interactive elements keyboard-operable; no `tabindex` tricks beyond the nav pattern
- Terminal given `aria-label`; search input has `aria-label`

# Performance

- Single shared stylesheet (`/assets/design-system.css`) replaces per-page inline `<style>` and orphaned CSS files
- No render-blocking fonts beyond system stacks (JetBrains Mono/Fira Code fall back to system monospace)
- `header-search.js` restored as a real shared module (was a 404 preload)
- Terminal initialized once per page via a shared module script

# Do / Don't

Do:
- One palette, one font stack, one shell structure across all 12+ pages
- Dashed borders, radius 10px, backdrop-filter panels
- Accent for interactive state only; semantic colors for states
- Shared terminal module, shared nav markup

Don't:
- Cream grounds, serif display faces, editorial margins (startpage.css direction)
- Glass/cyan-to-purple gradients without brand rationale
- Bounce easing, blanket shadows on every surface
- One-note palette, uniform 3-column grids where items aren't peers
- Ad-hoc hex literals outside the token map

# Component state inventory (summary)

| Primitive | default | hover | focus-visible | active | disabled | loading | empty | error |
|---|---|---|---|---|---|---|---|---|
| Nav link | fg-dim | fg + bg tint | outline accent | accent | — | — | — | — |
| Engine tab | fg-muted | fg | outline accent | accent bg | — | — | — | — |
| Search input | fg | fg | accent caret | — | — | — | placeholder | — |
| Bookmark panel | border | border-hi | — | translateY -2px | — | — | "No bookmarks" | — |
| Panel | border | — | — | — | — | — | empty state | error state |
