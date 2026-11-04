---
# risk_register/v1
# Risk register for frontend/site-consistency -> main merge
audited_at: "2026-11-04"
scope: "frontend/site-consistency (commit 111c7a8) -> main -> GitHub Pages"
---

| ID | Risk | Likelihood | Impact | Severity | Mitigation | Owner | Status |
|----|------|------------|--------|----------|------------|-------|--------|
| R1 | Change not merged to `main`; GitHub Pages continues serving old design | high | high | P1 | Create PR; merge to `main` | repo operator | open |
| R2 | Remote ref at `31c1f1e` (pre-overflow-fix); local `111c7a8` diverges | medium | medium | P2 | `git fetch`; verify `origin/frontend/site-consistency` == `111c7a8` | repo operator | open |
| R3 | No CI/build/test gate; bad merge could ship broken CSS/HTML | medium | high | P2 | Manual browser verification before merge (done at 1440/768/375px) | reviewer | mitigated |
| R4 | Content clipping on long pages (`.tui-main` overflow: hidden) | high | high | P1 | Fixed in `111c7a8`: `overflow: auto` on `.tui-main`; verified scrollable | reviewer | mitigated |
| R5 | No rollback owner or tested procedure | medium | medium | P2 | Name owner; document revert path | repo operator | open |
| R6 | No observability; deploy failure undetected | low | medium | P3 | Add periodic fetch health check (recommended, not required) | repo operator | open |
| R7 | Stale `lefthook.yml` references to `main-dark.scss` / `assets/cli.js` | low | low | P3 | AGENTS.md notes prettier flags `assets/cli.js`; no action needed for this change | — | accepted |

# Boundary

Risk register is readiness assessment only. It does not perform deploy, infra, credential, or platform actions.
