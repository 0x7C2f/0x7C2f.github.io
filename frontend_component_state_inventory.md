---
# frontend_component_state_inventory/v1
# Reusable primitives and their states across the 0x7C2f design system
# Source of truth: assets/design-system.css + DESIGN.md
primitives:
  - name: "Nav link"
    selector: ".tui-nav-link, #titlebar-nav a"
    interface:
      props: ["href", "aria-current", "text content"]
      events: ["click", "focus", "blur", "mouseenter", "mouseleave"]
      slots: ["text label"]
      invariants: ["aria-current='page' marks the current section", "active state uses accent color + font-weight 600"]
    states:
      default: { color: "--fg-dim", bg: "transparent" }
      hover: { color: "--fg", bg: "rgba(148,163,184,0.08)" }
      focus_visible: { outline: "2px solid var(--accent)", outline_offset: "2px" }
      active: { color: "--accent", font_weight: "600" }
      disabled: "N/A — nav links are always navigable"
      loading: "N/A — static links"
      empty: "N/A"
      error: "N/A"

  - name: "Engine tab (root startpage)"
    selector: ".eng-tab, #engine-tabs [data-engine]"
    interface:
      props: ["data-engine", "data-url", "data-label", "active state"]
      events: ["click", "keydown (Enter/Space/Tab)"]
      slots: ["engine label text"]
      invariants: ["active tab has transparent bottom border", "keyboard operable via Tab/Enter/Space"]
    states:
      default: { color: "--fg-dim", border: "transparent" }
      hover: { color: "--fg", bg: "rgba(148,163,184,0.06)" }
      focus_visible: { outline: "2px solid var(--accent)", outline_offset: "2px" }
      active: { color: "--accent", bg: "rgba(34,211,238,0.08)", border_bottom: "transparent" }
      disabled: "N/A"
      loading: "N/A"
      empty: "N/A"
      error: "N/A"

  - name: "Search input"
    selector: "#search-input, .tui-search input"
    interface:
      props: ["placeholder", "aria-label", "autocomplete=off"]
      events: ["keydown (Enter/Escape/Tab)", "focus", "blur"]
      slots: ["user-typed query text"]
      invariants: ["Escape clears the input", "Enter submits (no-op on static host)", "caret color is accent"]
    states:
      default: { color: "--fg", bg: "transparent", border: "none" }
      hover: { color: "--fg", bg: "transparent" }  # no visual change; text input
      focus_visible: { outline: "2px solid var(--accent)", outline_offset: "2px", caret_color: "--accent" }
      active: "N/A"
      disabled: "N/A"
      loading: "N/A"
      empty: { placeholder: "type to search... or / search..." }
      error: "N/A"

  - name: "Bookmark panel"
    selector: ".bm-panel"
    interface:
      props: ["title text", "link list"]
      events: ["click (on links)", "hover"]
      slots: ["bm-title header", "bm-list of links"]
      invariants: ["each link prefixed with '› '", "hover lifts panel 2px"]
    states:
      default: { border: "var(--border)", bg: "var(--panel)" }
      hover: { border_color: "--border-hi", transform: "translateY(-2px)" }
      focus_visible: "N/A — panel is not directly focusable; links inside are"
      active: "N/A"
      disabled: "N/A"
      loading: "N/A"
      empty: { copy: "No bookmarks." }
      error: "N/A"

  - name: "Panel (generic bordered box)"
    selector: ".panel, .tui-panel"
    interface:
      props: ["child content"]
      events: []
      slots: ["panel-head (optional)", "panel-body / arbitrary content"]
      invariants: ["backdrop-filter blur(12px)", "radius 10px"]
    states:
      default: { border: "var(--border)", bg: "var(--panel)" }
      hover: "N/A"
      focus_visible: "N/A"
      active: "N/A"
      disabled: "N/A"
      loading: "N/A"
      empty: "N/A"
      error: "N/A"

  - name: "Statusbar"
    selector: "#statusbar"
    interface:
      props: ["keyboard shortcut hints", "engine status text"]
      events: []
      slots: [".key spans", "#engine-status accent text"]
      invariants: ["engine status displayed in accent color on the right"]
    states:
      default: { color: "--fg-mute" }
      hover: "N/A"
      focus_visible: "N/A"
      active: "N/A"
      disabled: "N/A"
      loading: "N/A"
      empty: "N/A"
      error: "N/A"

  - name: "Skip link"
    selector: ".skip-link"
    interface:
      props: ["href='#main-content'"]
      events: ["focus"]
      slots: ["'Skip to main content' text (visually hidden)"]
      invariants: ["absolutely positioned off-screen until focused", "becomes visible fixed top-left on focus"]
    states:
      default: { position: "absolute", clip: "rect(0,0,0,0)" }
      hover: "N/A"
      focus_visible: { position: "fixed", top: "10px", left: "10px", z_index: "999", bg: "--sel-bg", border: "2px solid --accent" }
      active: "N/A"
      disabled: "N/A"
      loading: "N/A"
      empty: "N/A"
      error: "N/A"

  - name: "Category tab (awesome-pi)"
    selector: ".awesome-pi-tab"
    interface:
      props: ["data-category", "aria-pressed"]
      events: ["click"]
      slots: ["category label with emoji"]
      invariants: ["active tab has accent background with #000 text"]
    states:
      default: { border: "var(--box-border-color)", bg: "transparent" }
      hover: { border_color: "--accent-color", color: "--accent-color" }
      focus_visible: { outline: "2px solid var(--accent-color)", outline_offset: "2px" }
      active: { bg: "--accent-color", color: "#000", border_color: "--accent-color" }
      disabled: "N/A"
      loading: "N/A"
      empty: "N/A"
      error: "N/A"

wrapper_note: "No wrapper rows added — no enclosing element adds complexity that would push into callers if deleted. All primitives render directly."
