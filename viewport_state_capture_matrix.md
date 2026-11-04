---
# viewport_state_capture_matrix/v1
# Every route/page, viewport, state, and scroll position captured
# Target: main branch, commit 931f91a, https://0x7c2f.github.io/
surface_type: "web"
target_repository: "github.com/0x7C2f/0x7C2f.github.io"
target_revision: "931f91a"

captures:
  - page: "/index.html"
    name: "Root startpage"
    viewports:
      - width: 1440
        height: 900
        states: ["default", "nav-hover", "nav-focus-visible", "search-focus-visible"]
        scroll: 0
      - width: 768
        height: 1024
        states: ["default"]
        scroll: 0
      - width: 375
        height: 812
        states: ["default"]
        scroll: 0
  - page: "/about/index.html"
    name: "About — Knowledge Stack"
    viewports:
      - width: 1440
        height: 900
        states: ["default"]
        scroll: 0
      - width: 768
        height: 1024
        states: ["default"]
        scroll: 0
      - width: 375
        height: 812
        states: ["default"]
        scroll: 0
  - page: "/blog/index.html"
    name: "Blog — Posts index"
    viewports:
      - width: 1440
        height: 900
        states: ["default"]
        scroll: 0
      - width: 768
        height: 1024
        states: ["default"]
        scroll: 0
      - width: 375
        height: 812
        states: ["default"]
        scroll: 0
  - page: "/files/index.html"
    name: "Files — PDF library"
    viewports:
      - width: 1440
        height: 900
        states: ["default"]
        scroll: 0
      - width: 768
        height: 1024
        states: ["default"]
        scroll: 0
      - width: 375
        height: 812
        states: ["default"]
        scroll: 0
  - page: "/dead-children-currency/index.html"
    name: "Article — Dead Children Currency"
    viewports:
      - width: 1440
        height: 900
        states: ["default"]
        scroll: 0
      - width: 768
        height: 1024
        states: ["default"]
        scroll: 0
      - width: 375
        height: 812
        states: ["default"]
        scroll: 0
  - page: "/mcp-usage-guide/index.html"
    name: "Article — MCP Server Repository List (long form)"
    viewports:
      - width: 1440
        height: 900
        states: ["default", "scroll-bottom"]
        scroll: [0, max]
      - width: 768
        height: 1024
        states: ["default"]
        scroll: 0
      - width: 375
        height: 812
        states: ["default"]
        scroll: 0
  - page: "/mcp-servers-github-pages/index.html"
    name: "Article — MCP Servers on GitHub Pages (long form)"
    viewports:
      - width: 1440
        height: 900
        states: ["default", "scroll-bottom"]
        scroll: [0, max]
      - width: 768
        height: 1024
        states: ["default"]
        scroll: 0
      - width: 375
        height: 812
        states: ["default"]
        scroll: 0
  - page: "/doppler-curve-localization-simulator/index.html"
    name: "Simulator wrapper"
    viewports:
      - width: 1440
        height: 900
        states: ["default"]
        scroll: 0
      - width: 768
        height: 1024
        states: ["default"]
        scroll: 0
      - width: 375
        height: 812
        states: ["default"]
        scroll: 0
  - page: "/pages/doppler-curve-localization-simulator.html"
    name: "Simulator — standalone canvas app"
    viewports:
      - width: 1440
        height: 900
        states: ["default"]
        scroll: 0
      - width: 768
        height: 1024
        states: ["default"]
        scroll: 0
      - width: 375
        height: 812
        states: ["default"]
        scroll: 0
  - page: "/awesome-pi-coding-agent/index.html"
    name: "Awesome Pi Coding Agent directory"
    viewports:
      - width: 1440
        height: 900
        states: ["default"]
        scroll: 0
      - width: 768
        height: 1024
        states: ["default"]
        scroll: 0
      - width: 375
        height: 812
        states: ["default"]
        scroll: 0
  - page: "/404.html"
    name: "404 Not Found"
    viewports:
      - width: 1440
        height: 900
        states: ["default"]
        scroll: 0
      - width: 768
        height: 1024
        states: ["default"]
        scroll: 0
      - width: 375
        height: 812
        states: ["default"]
        scroll: 0

cjk_heavy_regions: []  # No CJK content on site
motion_states: ["nav-hover", "nav-focus-visible", "search-focus-visible"]
console_check_required: true
accessibility_check_required: true
