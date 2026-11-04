---
# render_capture_manifest/v1
# Observed render captures bound to target revision 931f91a
# Each entry records screenshot_path, URL, viewport width reported by page, target revision
surface_type: "web"
target_repository: "github.com/0x7C2f/0x7C2f.github.io"
target_revision: "931f91a"
audited_at: "2026-11-04"

captures:
  - screenshot_path: "/home/mrgrim/.config/browser-harness/tmp/p-bbe313194bad/shot.png"
    url: "https://0x7c2f.github.io/index.html"
    viewport_width: 1440
    viewport_height: 900
    device_scale_factor: 1
    mobile: false
    state: "default"
    reported_width_check: "not_performed_via_browser_console"
    notes: "Desktop root — computed styles verified: bg #070b14, color #e2e8f0, font JetBrains Mono, 4 nav links, 6 bookmark panels, terminal present"
  - screenshot_path: "/home/mrgrim/.config/browser-harness/tmp/p-bbe313194bad/shot.png"
    url: "https://0x7c2f.github.io/index.html"
    viewport_width: 375
    viewport_height: 812
    device_scale_factor: 1
    mobile: true
    state: "default"
    reported_width_check: "not_performed_via_browser_console"
    notes: "Mobile root — documentWidth 375 = viewport, titlebar column/wrap, banner pre-wrap 240px wide, search row 8px 12px padding, no horizontal overflow"
  - screenshot_path: "/home/mrgrim/.config/browser-harness/tmp/p-bbe313194bad/shot.png"
    url: "https://0x7c2f.github.io/about/index.html"
    viewport_width: 1440
    height: 900
    device_scale_factor: 1
    mobile: false
    state: "default"
    reported_width_check: "not_performed_via_browser_console"
    notes: "Desktop about — computed styles verified, skip link present, active nav = About, terminal present"
  - screenshot_path: "/home/mrgrim/.config/browser-harness/tmp/p-bbe313194bad/shot.png"
    url: "https://0x7c2f.github.io/about/index.html"
    viewport_width: 375
    viewport_height: 812
    device_scale_factor: 1
    mobile: true
    state: "default"
    reported_width_check: "not_performed_via_browser_console"
    notes: "Mobile about — documentWidth 375 = viewport, titlebar column/wrap 375px, container auto overflow, main scrollable (937px scroll height)"
  - screenshot_path: "/home/mrgrim/.config/browser-harness/tmp/p-bbe313194bad/shot.png"
    url: "https://0x7c2f.github.io/blog/index.html"
    viewport_width: 1440
    height: 900
    device_scale_factor: 1
    mobile: false
    state: "default"
    reported_width_check: "not_performed_via_browser_console"
    notes: "Desktop blog — computed styles verified, active nav = Blog"
  - screenshot_path: "/home/mrgrim/.config/browser-harness/tmp/p-bbe313194bad/shot.png"
    url: "https://0x7c2f.github.io/mcp-servers-github-pages/index.html"
    viewport_width: 1440
    height: 900
    device_scale_factor: 1
    mobile: false
    state: "default"
    reported_width_check: "not_performed_via_browser_console"
    notes: "Desktop long article — scrollHeight 8405px, canScroll true, all 8 h2 headings reachable, conclusion visible after scroll to bottom"
  - screenshot_path: "/home/mrgrim/.config/browser-harness/tmp/p-bbe313194bad/shot.png"
    url: "https://0x7c2f.github.io/mcp-servers-github-pages/index.html"
    viewport_width: 375
    height: 812
    device_scale_factor: 1
    mobile: true
    state: "scroll-bottom"
    reported_width_check: "not_performed_via_browser_console"
    notes: "Mobile long article — scrollHeight 9646px, scrolled to bottom, conclusion visible, no horizontal overflow"

capture_source_lineage: "session browser captures via browser_exec with Emulation.setDeviceMetricsOverride; cache disabled per capture"
lineage_match: "target_revision 931f91a matches deployed main branch"
lineage_verified: false  # git fetch re-verification pending

not_captured_yet:
  - "768px viewport for all pages"
  - "nav-hover state captures"
  - "nav-focus-visible state captures"
  - "search-focus-visible state captures"
  - "scroll-bottom captures at 768px and 375px for long articles"
  - "Files, dead-children-currency, mcp-usage-guide, doppler-wrapper, doppler-pages, awesome-pi, 404 pages at any viewport"
