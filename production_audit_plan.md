---
# production_audit_plan/v1
# Preflight readiness audit for frontend/site-consistency -> main merge
# Source: observed repo state + observed browser render verification
scope: "0x7C2f.github.io — site-wide design system unification (frontend/site-consistency)"
target_environment: "GitHub Pages serving the main branch"
release_channel: "topic branch frontend/site-consistency -> PR -> merge to main -> GitHub Pages auto-deploy"
audit_date: "2026-11-04"
audit_owner: "reviewer (omh-production-audit)"
acceptable_risk_threshold: "low — static site, no server-side runtime, no credentials, no build step"
---

# Scope

The change unifies the site's fragmented design systems (root inline CSS, `webtui.css`+`main-dark.css`, orphaned `site.css`/`startpage.css`/`cli.css`) into a single `assets/design-system.css` driven by `DESIGN.md`. It also restores the missing `assets/header-search.js` shared module and fixes a content-clipping bug (`.tui-main` overflow) found during browser verification.

18 files changed: 1260 insertions, 236 deletions (commit `111c7a8`, branch `frontend/site-consistency`).

# Audit lanes to check

1. Build/test/CI — no build step, no test scripts, no CI beyond stale.yml
2. Security/privacy — static site, no server runtime, no credentials committed
3. Performance — single shared stylesheet replaces inline + orphaned CSS; system font stacks
4. Observability — none configured (no analytics, no error tracking)
5. Rollback — `git revert` / `git reset` on main; no rollback owner named
6. Docs/support — DESIGN.md + OMH artifacts created; no user-facing changelog
7. Release communication — none planned

# Evidence boundary

- Observed: repo file state, commit diff, lefthook.yml, AGENTS.md, package.json
- Observed: browser render verification at 1440/768/375px across root, about, blog, mcp-article (computed styles + scroll behavior)
- Not observed: remote tracking ref for `frontend/site-consistency` (local `111c7a8` vs remote `31c1f1e` — force push status uncertain), PR creation, merge to main, live GitHub Pages deploy, any CI run, any security scan
