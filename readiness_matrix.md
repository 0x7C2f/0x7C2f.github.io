---
# readiness_matrix/v1
# Production readiness matrix for frontend/site-consistency -> main merge
# All cells grounded in observed file/command/source evidence unless marked not_observed
scope: "frontend/site-consistency (commit 111c7a8) -> main -> GitHub Pages"
environment: "GitHub Pages (static, main branch)"
release_channel: "topic branch PR merge"
audited_at: "2026-11-04"
---

| Area | Status | Evidence ID | Details | Missing / Gap |
|------|--------|-------------|---------|---------------|
| Build | not_applicable | AGENTS.md:9-10 | "There is no build step"; pure static HTML/CSS/JS served directly | none |
| Tests | not_observed | package.json | "no `npm run test` script"; no test files found in repo | test suite absent |
| CI | not_observed | .github/workflows/stale.yml | Only CI workflow is stale issue handler; no build/test/deploy CI | no build/test/deploy pipeline |
| Security/privacy | not_observed | .gitignore + lefthook no-env-files | `.env` files blocked from commit; no server runtime, no credentials in diff | no security scan run; no dependency audit |
| Performance | observed | browser render at 1440/768/375px | Single shared stylesheet; computed styles `#070b14`/`#e2e8f0`/JetBrains Mono verified on all 11 pages; `.tui-main` overflow fixed (content scrollable) | no Lighthouse/CWV numbers measured |
| Observability | not_observed | — | No analytics, error tracking, or health endpoints configured (static site) | none configured |
| Rollback | not_observed | git history | `git revert` or `git reset --hard` to prior main commit is the rollback path; no rollback owner named | rollback owner not designated; rollback not tested |
| Docs/support | observed | DESIGN.md + OMH artifacts | DESIGN.md contract, route/state matrix, component inventory, a11y/perf expectations, visual QA report created | no user-facing changelog |
| Release communication | not_observed | — | No release notes, changelog, or stakeholder notification planned | none |

# Checked and found clean

- No `.env` files staged (lefthook no-env-files enforced)
- No console.log/debugger in staged JS (lefthook no-debug)
- No merge conflict markers (lefthook conflict-markers)
- All 11 HTML pages load `assets/design-system.css`; no stale `webtui.css`/`main-dark.css` references
- `assets/header-search.js` exists and is referenced (was a 404 preload)

# Could not assess

| Surface | Reason |
|---------|--------|
| Remote tracking ref for `frontend/site-consistency` | Local `111c7a8` vs remote `31c1f1e`; last force push reported success but tracking ref not re-verified after final push |
| PR creation / merge to main | Not performed; no PR URL |
| Live GitHub Pages deploy | Deploy is `git push origin main` (AGENTS.md:11, unverified) |
| Security scan / dependency audit | No tooling run; not part of this static-site audit scope without operator action |
| Lighthouse / Core Web Vitals | Not measured (lab evidence not captured) |
