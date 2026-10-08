## 2026-10-08 - Visually Hidden Skip Link
**Learning:** Skip links relying on negative positioning (e.g., `top: -40px`) can occasionally leak out on different viewport sizes or be inaccessible/skipped over by screen readers properly navigating focus loops. Visually hiding elements using clip rects and 1px constraints ensures proper accessible interaction across varied devices and screen readers without layout shift.
**Action:** Always prefer standard visually-hidden clip properties for invisible accessibility elements over off-screen positioning unless animating.
