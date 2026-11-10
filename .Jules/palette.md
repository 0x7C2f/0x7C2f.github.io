## 2026-10-08 - Visually Hidden Skip Link
**Learning:** Skip links relying on negative positioning (e.g., `top: -40px`) can occasionally leak out on different viewport sizes or be inaccessible/skipped over by screen readers properly navigating focus loops. Visually hiding elements using clip rects and 1px constraints ensures proper accessible interaction across varied devices and screen readers without layout shift.
**Action:** Always prefer standard visually-hidden clip properties for invisible accessibility elements over off-screen positioning unless animating.

## 2024-11-03 - Global Click Focus Breaks Text Selection
**Learning:** Using a global click listener to force focus on an input field (common in terminal-like interfaces to maintain typing readiness) ruins user experience by preventing text selection and copying. When a user clicks to select text, the focus event is triggered and clears or interrupts the selection.
**Action:** Always check `!window.getSelection().toString()` before programmatically forcing focus on a click event in a full-page interface.
## 2026-11-10 - ARIA Labels require valid Roles on generic containers
**Learning:** Adding an `aria-label` to a generic container like a `<div>` is ignored by screen readers unless accompanied by a semantic role that supports naming, such as `role="region"`.
**Action:** Always ensure that when adding `aria-label` to structural elements like `<div>` or `<span>`, a valid semantic role (e.g., `role="region"`, `role="group"`) is also added so assistive technologies can properly announce it.
