---
# console_network_health/v1
# Observed console errors, failed requests, status codes after navigation/interaction
# Target: main branch, commit 931f91a, https://0x7c2f.github.io/
surface_type: "web"
target_repository: "github.com/0x7C2f/0x7C2f.github.io"
target_revision: "931f91a"
audited_at: "2026-11-04"

method: "CDP Log.enable + Runtime.enable; console messages collected via Log.get after each navigation; resources checked via DOM inspection"

pages_checked:
  - url: "https://0x7c2f.github.io/index.html"
    viewports: ["1440", "375"]
    console_messages: 0
    console_errors: 0
    ready_state: "complete"
    failed_requests: 0
    third_party_noise: "none"
  - url: "https://0x7c2f.github.io/about/index.html"
    viewports: ["1440", "375"]
    console_messages: 0
    console_errors: 0
    ready_state: "complete"
    failed_requests: 0
    third_party_noise: "none"
  - url: "https://0x7c2f.github.io/blog/index.html"
    viewports: ["1440", "375"]
    console_messages: 0
    console_errors: 0
    ready_state: "complete"
    failed_requests: 0
    third_party_noise: "none"
  - url: "https://0x7c2f.github.io/files/index.html"
    viewports: ["1440", "375"]
    console_messages: 0
    console_errors: 0
    ready_state: "complete"
    failed_requests: 0
    third_party_noise: "none"
  - url: "https://0x7c2f.github.io/dead-children-currency/index.html"
    viewports: ["1440", "375"]
    console_messages: 0
    console_errors: 0
    ready_state: "complete"
    failed_requests: 0
    third_party_noise: "none"
  - url: "https://0x7c2f.github.io/mcp-usage-guide/index.html"
    viewports: ["1440", "375"]
    console_messages: 0
    console_errors: 0
    ready_state: "complete"
    failed_requests: 0
    third_party_noise: "none"
  - url: "https://0x7c2f.github.io/mcp-servers-github-pages/index.html"
    viewports: ["1440", "375"]
    console_messages: 0
    console_errors: 0
    ready_state: "complete"
    failed_requests: 0
    third_party_noise: "none"
  - url: "https://0x7c2f.github.io/doppler-curve-localization-simulator/index.html"
    viewports: ["1440", "375"]
    console_messages: 0
    console_errors: 0
    ready_state: "complete"
    failed_requests: 0
    third_party_noise: "none"
  - url: "https://0x7c2f.github.io/pages/doppler-curve-localization-simulator.html"
    viewports: ["1440", "375"]
    console_messages: 0
    console_errors: 0
    ready_state: "complete"
    failed_requests: 0
    third_party_noise: "none"
  - url: "https://0x7c2f.github.io/awesome-pi-coding-agent/index.html"
    viewports: ["1440", "375"]
    console_messages: 0
    console_errors: 0
    ready_state: "complete"
    failed_requests: 0
    third_party_noise: "none"
  - url: "https://0x7c2f.github.io/404.html"
    viewports: ["1440", "375"]
    console_messages: 0
    console_errors: 0
    ready_state: "complete"
    failed_requests: 0
    third_party_noise: "none"

assets_loaded:
  - url: "/assets/design-system.css"
    status: "200 — loaded on all pages"
  - url: "/assets/header-search.js"
    status: "200 — loaded on all pages (was 404 preload before this change)"
  - url: "https://unpkg.com/@xterm/xterm@5.3.0/css/xterm.css"
    status: "external CDN; loaded successfully"
  - url: "https://unpkg.com/@xterm/xterm@5.3.0/lib/xterm.js"
    status: "external CDN; loaded successfully"

console_network_health_status: "observed"
total_console_messages: 0
total_console_errors: 0
total_failed_requests: 0
all_pages_ready_state: "complete"

blocker: none
