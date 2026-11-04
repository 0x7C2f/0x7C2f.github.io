---
# accessibility_keyboard_trace/v1
# Observed focus order, keyboard reachability, and automated scan boundaries
# Target: main branch, commit 931f91a, https://0x7c2f.github.io/
surface_type: "web"
target_repository: "github.com/0x7C2f/0x7C2f.github.io"
target_revision: "931f91a"
audited_at: "2026-11-04"

note: "Accessibility checks via automated scan were not performed; focus order and keyboard reachability observed via computed styles and DOM inspection only."

skip_link:
  present: true
  selector: ".skip-link"
  href: "#main-content"
  visually_hidden_until_focus: true
  pages: ["about/index.html", "blog/index.html", "files/index.html", "dead-children-currency/index.html", "mcp-usage-guide/index.html", "mcp-servers-github-pages/index.html", "doppler-curve-localization-simulator/index.html", "pages/doppler-curve-localization-simulator.html", "awesome-pi-coding-agent/index.html", "404.html"]

nav_keyboard:
  tab_order: ["skip-link", "nav links (blog, files, about, awesome-pi-coding-agent)", "search input", "bookmark links", "statusbar"]
  active_section_highlight: "aria-current='page' renders accent color #22d3ee + font-weight 600"
  engine_tabs_keyboard: "Tab/Enter/Space supported (root startpage only)"

focus_visible:
  selector: "a, button, input, select, textarea, [role='button'], [role='tab']"
  style: "2px solid var(--accent) outline with 2px offset"
  color: "#22d3ee"
  high_contrast_widening: "3px outline under prefers-contrast: high"

reduced_motion:
  media_query: "prefers-reduced-motion: reduce"
  effect: "all transitions 0.01ms, animations 1 iteration, scroll-behavior auto, terminal cursor blink disabled"

contrast:
  bg: "#070b14"
  fg: "#e2e8f0"
  note: "Near-black ground with off-white text; WCAG contrast not numerically verified"

accessibility_status: "not_observed_via_automated_scan"
blocker: "No automated accessibility scan or screen-reader test performed; keyboard trace is DOM/computed-style based only"
