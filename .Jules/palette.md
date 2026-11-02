## 2026-10-08 - Visually Hidden Skip Link
**Learning:** Skip links relying on negative positioning (e.g., `top: -40px`) can occasionally leak out on different viewport sizes or be inaccessible/skipped over by screen readers properly navigating focus loops. Visually hiding elements using clip rects and 1px constraints ensures proper accessible interaction across varied devices and screen readers without layout shift.
**Action:** Always prefer standard visually-hidden clip properties for invisible accessibility elements over off-screen positioning unless animating.

## 2026-11-02 - Universal Focus-Visible over Focus
**Learning:** Using `*:focus` globally applies focus rings even when users click elements with a mouse, which can be visually jarring and degrade the interaction experience. `*:focus-visible` ensures that these accessibility outlines only appear when the user is navigating via keyboard, providing a superior experience for both mouse and keyboard users.
**Action:** Always prefer `:focus-visible` over `:focus` for focus rings unless the element explicitly requires focus indication on mouse click (like text inputs, which browsers handle natively).
