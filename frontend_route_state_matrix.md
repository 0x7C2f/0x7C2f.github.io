---
# frontend_route_state_matrix/v1
# Site-wide route/state matrix for 0x7C2f.github.io
# All routes share the unified design system in assets/design-system.css (DESIGN.md source of truth)
routes:
  - path: "/"
    name: "Root startpage (TUI terminal)"
    audience: "Visitor returning to the site; primary entry point"
    primary_task: "Search the web, open bookmarks, navigate sections"
    markup: "#shell / #titlebar / #center / #statusbar (ID-based)"
    content: "ASCII banner, search engine tabs, search row, bookmarks grid"
  - path: "/about/"
    name: "About — Knowledge Stack"
    audience: "Visitor learning about the author"
    primary_task: "Read author bio, view technology badges"
    markup: "tui-header / tui-nav / container / tui-main (class-based)"
    content: "OS/VC/networking/virtualization/development/badge tables"
  - path: "/blog/"
    name: "Blog — Posts index"
    audience: "Reader browsing writings"
    primary_task: "Read posts, click through to full articles"
    markup: "tui-header / tui-nav / container / tui-main"
    content: "Post list with dates and links"
  - path: "/files/"
    name: "Files — PDF library"
    audience: "Visitor downloading curated PDFs"
    primary_task: "Browse and download PDF documents"
    markup: "tui-header / tui-nav / container / tui-main"
    content: "PDF file list"
  - path: "/dead-children-currency/"
    name: "Article — Dead Children Currency"
    audience: "Reader of satirical essay"
    primary_task: "Read the article"
    markup: "tui-header / tui-nav / container / tui-main"
    content: "Article body with footnotes and source links"
  - path: "/mcp-usage-guide/"
    name: "Article — MCP Server Repository List"
    audience: "Developer exploring MCP servers"
    primary_task: "Read the usage guide"
    markup: "tui-header / tui-nav / container / tui-main"
    content: "Long-form article with code blocks"
  - path: "/mcp-servers-github-pages/"
    name: "Article — MCP Servers on GitHub Pages"
    audience: "Developer asking about static hosting MCP"
    primary_task: "Read the answer and alternatives"
    markup: "tui-header / tui-nav / container / tui-main"
    content: "Article with TypeScript code examples"
  - path: "/doppler-curve-localization-simulator/index.html"
    name: "Simulator wrapper — Doppler Curve"
    audience: "Visitor using the interactive simulator"
    primary_task: "Open the simulator iframe"
    markup: "tui-header / tui-nav / container / tui-main (iframe embed)"
    content: "iframe to standalone simulator page"
  - path: "/pages/doppler-curve-localization-simulator.html"
    name: "Simulator — standalone canvas app"
    audience: "Visitor using the Doppler simulator"
    primary_task: "Interact with Doppler pass visualization"
    markup: "Self-contained Tailwind canvas app (outside design-system scope)"
    content: "Canvas rendering, sliders, telemetry panels"
  - path: "/awesome-pi-coding-agent/"
    name: "Awesome Pi Coding Agent directory"
    audience: "Developer browsing Pi ecosystem extensions"
    primary_task: "Search, filter, and discover Pi coding agent resources"
    markup: "tui-header / tui-nav / container / tui-main"
    content: "Entry grid, category tabs, search, stats"
  - path: "/404.html"
    name: "404 Not Found"
    audience: "Visitor who mistyped a URL"
    primary_task: "Return to the site root"
    markup: "tui-header / tui-nav / container / tui-main"
    content: "Shrug emoticon, webring marquee"

breakpoints:
  - name: "desktop"
    width: "1440px"
    note: "Primary breakpoint; shell max-width 1200px centered"
  - name: "tablet"
    width: "768px"
    note: "Overflow auto, shell height auto, bookmarks 2 columns"
  - name: "mobile"
    width: "375px"
    note: "Bookmarks 1 column, titlebar wraps to column"

empty_states:
  - route: "/awesome-pi-coding-agent/"
    component: "awesome-pi-empty"
    copy: "No results found."
    control: "Clear search / change category"

loading_states:
  - route: "/awesome-pi-coding-agent/"
    component: "stats-total / last-updated"
    copy: "Loading..."

error_states:
  - route: "/404.html"
    component: "page shell"
    copy: "¯\_(ツ)_/¯"

interaction_states:
  - primitive: "nav link"
    states: ["default", "hover", "focus-visible", "active (aria-current)"]
  - primitive: "engine tab (root)"
    states: ["default", "hover", "active"]
  - primitive: "search input"
    states: ["default", "focus-visible"]
  - primitive: "bookmark panel"
    states: ["default", "hover"]
  - primitive: "category tab (awesome-pi)"
    states: ["default", "hover", "active (aria-pressed)"]

cjk_locale_risks:
  - note: "No CJK content currently on site; if added, hold 14px Korean body font floor per taste-foundations.md"

remote_write_rows:
  - note: "No remote write surfaces on this static site; no submitting/submit-failed/optimistic-pending/stale/conflict (409) rows required"
