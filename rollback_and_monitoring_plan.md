---
# rollback_and_monitoring_plan/v1
# Rollback and monitoring plan for frontend/site-consistency -> main merge
scope: "0x7C2f.github.io static site (GitHub Pages, main branch)"
audited_at: "2026-11-04"
assessor: "reviewer (omh-production-audit)"
---

# Rollback path (not tested, no owner designated)

## Primary rollback: revert commit on main

After the change is merged to `main`, rollback is:

```
git checkout main
git revert <merge-commit-sha>  # or git reset --hard <pre-merge-sha>
git push origin main
```

GitHub Pages serves `main` directly, so reverting on `main` and pushing restores the previous design system state. No build step means no rebuild needed — the revert is immediately live.

## Secondary rollback: restore previous CSS

If only the stylesheet needs rolling back (not the HTML restructure):

```
git checkout main~1 -- assets/design-system.css index.html about/index.html ...
```

## Rollback triggers

- Any page fails to render after deploy (blank, clipped content, broken nav)
- Any page shows stale `webtui.css`/`main-dark.css` references
- `assets/header-search.js` returns 404
- Computed styles deviate from `#070b14`/`#e2e8f0`/JetBrains Mono on any page

## Rollback owner

not_designated — must be assigned before GO

## Rollback tested

not_observed — revert procedure has not been exercised

---

# Monitoring / health signals (none configured)

The site is a pure static GitHub Pages deployment with no:
- analytics or error tracking
- uptime monitoring
- health endpoints
- real-user monitoring or Core Web Vitals collection
- deploy hooks or notifications

## Recommended (not implemented)

- Periodic fetch of `https://0x7c2f.github.io/index.html` and `/about/index.html` verifying HTTP 200
- Verify `assets/design-system.css` loads (HTTP 200) and `assets/header-search.js` loads (HTTP 200)
- Verify no console errors on page load

## Health signal owner

not_designated

## Recovery threshold

Any single page returning non-200 or missing `design-system.css` = trigger rollback review

## Recovery path

1. Detect failure (manual check or monitoring)
2. `git checkout main`
3. `git revert <merge-commit-sha>` (or reset to pre-merge SHA)
4. `git push origin main`
5. Confirm GitHub Pages serving previous HTML
