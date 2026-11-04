## 2026-10-08 - Visually Hidden Skip Link
**Learning:** Skip links relying on negative positioning (e.g., `top: -40px`) can occasionally leak out on different viewport sizes or be inaccessible/skipped over by screen readers properly navigating focus loops. Visually hiding elements using clip rects and 1px constraints ensures proper accessible interaction across varied devices and screen readers without layout shift.
**Action:** Always prefer standard visually-hidden clip properties for invisible accessibility elements over off-screen positioning unless animating.

## 2024-11-03 - Global Click Focus Breaks Text Selection
**Learning:** Using a global click listener to force focus on an input field (common in terminal-like interfaces to maintain typing readiness) ruins user experience by preventing text selection and copying. When a user clicks to select text, the focus event is triggered and clears or interrupts the selection.
**Action:** Always check `!window.getSelection().toString()` before programmatically forcing focus on a click event in a full-page interface.
## 2026-11-04 - Search Input Focus Accessibility
**Learning:** In a design system where `outline: none` is used globally or extensively on inputs (e.g. `.tui-search input`), relying solely on fallback `input:focus-visible` can fail if more specific selectors override the `outline: none` reset.
**Action:** When a global reset overrides `focus-visible` styles with a more specific selector, explicitly define `:focus-visible` states matching the specificity of the elements lacking focus indicators.
