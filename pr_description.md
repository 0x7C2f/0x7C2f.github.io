💡 What: Updated the global `*:focus` rule in `_sass/base.scss` to use `*:focus-visible`.
🎯 Why: A global `:focus` rule causes focus rings to appear even when interactive elements are clicked with a mouse, which can be visually distracting and unpolished. Using `:focus-visible` ensures that these essential accessibility outlines are only shown when navigating via keyboard or screen reader, providing an ideal experience for all users.
📸 Before/After: Clicking anywhere now avoids focus rings, but tabbing correctly outlines elements. (Tested and verified with Playwright via screenshot).
♿ Accessibility: Maintains perfect keyboard navigation focus states while significantly improving the visual experience for mouse users.
