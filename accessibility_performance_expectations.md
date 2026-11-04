---
# accessibility_performance_expectations/v1
# Accessibility and performance expectations for 0x7C2f.github.io
# Source of truth: DESIGN.md, assets/design-system.css
accessibility:
  skip_link:
    present: true
    selector: ".skip-link"
    note: "Visible on focus; jumps to #main-content on section pages"
  nav:
    current_indicator: "aria-current='page' on active section link"
    keyboard: "All nav links keyboard operable; Tab/Enter/Space supported"
  focus:
    style: "2px solid var(--accent) outline with 2px offset on focus-visible"
    high_contrast: "prefers-contrast: high widens focus outline to 3px"
  reduced_motion:
    media_query: "prefers-reduced-motion: reduce"
    behavior: "All transitions and animations set to 0.01ms; scroll-behavior: auto; terminal cursor blink disabled"
  color_contrast:
    bg: "#070b14"
    fg: "#e2e8f0"
    note: "Near-black ground with off-white text maintains WCAG AA contrast without starkness"
  cjk:
    note: "No CJK content currently; if added, hold 14px Korean body font floor per taste-foundations.md"
  images:
    alt_text: "All simple-icons images carry descriptive alt attributes"
  terminal:
    aria_label: "Terminal given aria-label where present"
    note: "xterm.js canvas is not natively accessible; decorative/secondary to primary content"

performance:
  stylesheet:
    count: 1
    path: "/assets/design-system.css"
    note: "Single shared stylesheet replaces inline <style> blocks and orphaned per-page CSS files"
  fonts:
    stacks: ["JetBrains Mono", "Fira Code", "ui-monospace", "Inter", "system-ui"]
    note: "System font stacks — no render-blocking web font requests; fallback to system monospace"
  scripts:
    shared: "/assets/header-search.js"
    note: "Restored the previously-missing (404) shared module; small, no external dependencies"
  terminal_library:
    source: "unpkg.com/@xterm/xterm@5.3.0"
    note: "External CDN; render-blocking for terminal feature only, not primary content"
  render_blocking:
    note: "All CSS in <head>; no render-blocking scripts in head (header-search.js is at end of body)"

metrics:
  - name: "LCP"
    element: "Hero banner / titlebar on root; H1 on section pages"
    phase: "Paint"
    note: "Single stylesheet + system fonts → fast first paint"
  - name: "INP"
    interaction: "Nav click, search input, engine tab switch"
    note: "No JS framework overhead; native DOM event handlers"
  - name: "CLS"
    note: "Stable dimensions; no layout-shift-prone content; fixed shell structure"

browser_support:
  target: "Baseline Widely available (every core browser for 30+ months)"
  features_used: "CSS custom properties, @layer, backdrop-filter, focus-visible, grid, flexbox"
  fallbacks: "backdrop-filter degrades gracefully to solid panel background"
