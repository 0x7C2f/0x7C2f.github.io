---
# console_network_health/v1
# Observed console errors, failed requests, status codes after navigation/interaction
# Target: main branch, commit 931f91a, https://0x7c2f.github.io/
surface_type: "web"
target_repository: "github.com/0x7C2f/0x7C2f.github.io"
target_revision: "931f91a"
audited_at: "2026-11-04"

note: "Console read via browser_console tool was not available/used in this session; JS-evaluated computed styles confirm rendering but console/network errors were not captured via browser_console."

pages_checked:
  - url: "https://0x7c2f.github.io/index.html"
    viewports: ["1440", "375"]
    console_errors: "not_observed"
    failed_requests: "not_observed"
    status_codes: "not_observed_via_browser_console"
    third_party_noise: "xterm.js CDN (unpkg.com) loads successfully"
  - url: "https://0x7c2f.github.io/about/index.html"
    viewports: ["1440", "375"]
    console_errors: "not_observed"
    failed_requests: "not_observed"
    status_codes: "not_observed_via_browser_console"
  - url: "https://0x7c2f.github.io/mcp-servers-github-pages/index.html"
    viewports: ["1440", "375"]
    console_errors: "not_observed"
    failed_requests: "not_observed"
    status_codes: "not_observed_via_browser_console"

assets_loaded:
  - url: "/assets/design-system.css"
    status: "200 (locally verified via HTTP server; live via GitHub Pages)"
  - url: "/assets/header-search.js"
    status: "200 (locally verified; was a 404 preload before this change)"
  - url: "https://unpkg.com/@xterm/xterm@5.3.0/css/xterm.css"
    status: "external CDN; not observed via browser console"
  - url: "https://unpkg.com/@xterm/xterm@5.3.0/lib/xterm.js"
    status: "external CDN; not observed via browser console"

console_network_health_status: "not_observed"  # browser_console tool not used
blocker: "console_network_health requires browser_console reads after every navigation; not performed in this session"
