---
# visual_qa_plan/v1
# Visual QA plan for 0x7C2f.github.io site-wide design system
# Target: main branch, commit 931f91a, deployed at https://0x7c2f.github.io/
surface_type: "web (static HTML/CSS/JS, GitHub Pages)"
target_url: "https://0x7c2f.github.io/"
target_repository: "github.com/0x7C2f/0x7C2f.github.io"
target_revision: "931f91a"
target_branch: "main"
audited_at: "2026-11-04"
auditor: "operator (omh-visual-qa)"
known_risk_areas: ["overflow/clipping on long article pages", "mobile titlebar row/nowrap overflow", "mobile search row padding overflow", "mobile ASCII banner width overflow"]
motion_interaction_states: ["nav link hover", "nav link focus-visible", "search input focus-visible", "engine tab hover/active", "bookmark panel hover"]

pages_to_cover:
  - path: "/index.html"
    name: "Root startpage (TUI terminal)"
    states: ["default", "nav-hover", "nav-focus-visible", "search-focus-visible"]
    viewports: ["1440", "768", "375"]
  - path: "/about/index.html"
    name: "About — Knowledge Stack"
    states: ["default"]
    viewports: ["1440", "768", "375"]
  - path: "/blog/index.html"
    name: "Blog — Posts index"
    states: ["default"]
    viewports: ["1440", "768", "375"]
  - path: "/files/index.html"
    name: "Files — PDF library"
    states: ["default"]
    viewports: ["1440", "768", "375"]
  - path: "/dead-children-currency/index.html"
    name: "Article — Dead Children Currency"
    states: ["default"]
    viewports: ["1440", "768", "375"]
  - path: "/mcp-usage-guide/index.html"
    name: "Article — MCP Server Repository List (long form)"
    states: ["default", "scroll-bottom"]
    viewports: ["1440", "768", "375"]
  - path: "/mcp-servers-github-pages/index.html"
    name: "Article — MCP Servers on GitHub Pages (long form)"
    states: ["default", "scroll-bottom"]
    viewports: ["1440", "768", "375"]
  - path: "/doppler-curve-localization-simulator/index.html"
    name: "Simulator wrapper — Doppler Curve"
    states: ["default"]
    viewports: ["1440", "768", "375"]
  - path: "/pages/doppler-curve-localization-simulator.html"
    name: "Simulator — standalone canvas app (outside design-system scope)"
    states: ["default"]
    viewports: ["1440", "768", "375"]
  - path: "/awesome-pi-coding-agent/index.html"
    name: "Awesome Pi Coding Agent directory"
    states: ["default"]
    viewports: ["1440", "768", "375"]
  - path: "/404.html"
    name: "404 Not Found"
    states: ["default"]
    viewports: ["1440", "768", "375"]

capture_requirements:
  - "One settled capture per page/viewport/state combination"
  - "Scroll-bottom capture for long-form articles at 1440px"
  - "Console read after every navigation"
  - "No destructive journeys (no checkout/payment/delete)"

evidence_boundary:
  - "Captures bound to target revision 931f91a"
  - "Visual diff evidence only from observed objective diff output"
  - "PASS unavailable until every required viewport captured and blocking findings resolved"
  - "Pass line: score >= 90 per visual-verdict-contract.md"
