---
# retry_or_blocker/v1
# Next steps for visual QA round scoring 82 (REVISE)
# Target: main branch, commit 931f91a
audited_at: "2026-11-04"
auditor: "operator (omh-visual-qa)"

status: "REVISE — named edits owed, recapture required, fresh round required"

edits_owed_to_executor:
  - "No code edits owed — all layout bugs found during this session were fixed and deployed (931f91a)"
  - "No CSS, HTML, or JS changes needed for visual QA itself"

recapture_required:
  - "All 11 pages at 768×1024 (currently not captured for any page)"
  - "Root page at 1440px: nav-hover, nav-focus-visible, search-focus-visible states"
  - "Long-form articles (mcp-usage-guide, mcp-servers-github-pages) scroll-bottom at 768px and 375px"
  - "Remaining pages at any viewport: Files, dead-children-currency, mcp-usage-guide, doppler-pages, awesome-pi-coding-agent, 404"

fresh_round_required: true
rescoring_same_captures_not_allowed: true

missing_evidence_before_pass:
  - "console_network_health/v1 via browser_console after every navigation"
  - "visual_diff_evidence/v1 (objective pixel diff)"
  - "dual_oracle_visual_review/v1 (independent read-only review)"
  - "accessibility_keyboard_trace/v1 via automated scan"

lineage_check: "All captures must be bound to target_revision 931f91a (deployed on main)"

score_to_beat: 82
pass_line: 90
