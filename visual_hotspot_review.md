---
# visual_hotspot_review/v1
# Diff hotspots, overflow lines, and screenshot regions mapped to visual causes
# Target: main branch, commit 931f91a, https://0x7c2f.github.io/
surface_type: "web"
target_repository: "github.com/0x7C2f/0x7C2f.github.io"
target_revision: "931f91a"
audited_at: "2026-11-04"

note: "No objective pixel diff output (visual_diff_evidence/v1) was recorded; hotspots below are from computed-style and layout observation during served-surface verification."

hotspots:
  - region: "Root page mobile search row (#search-row)"
    cause: "Padding 12px 16px made row 457px wide on 375px viewport — horizontal overflow"
    fix: "Reduced padding to 8px 12px in @media (max-width: 480px)"
    status: "fixed_and_verified"
    evidence: "searchRowPadding: 8px 12px, documentWidth 375 = viewport"
  
  - region: "Root page mobile ASCII banner (#banner)"
    cause: "white-space: pre prevented wrapping; banner 420px wide on 375px viewport — horizontal overflow"
    fix: "Changed to white-space: pre-wrap, font-size 8px at 480px"
    status: "fixed_and_verified"
    evidence: "bannerWhiteSpace: pre-wrap, bannerFontSize: 8px, bannerWidth 240"
  
  - region: "Section page mobile titlebar (.tui-titlebar)"
    cause: "flex-direction row + nowrap at 480px caused titlebar to scroll to 417px wide"
    fix: "Changed to flex-direction column + wrap at 480px"
    status: "fixed_and_verified"
    evidence: "titlebarFlexDirection: column, titlebarWrap: wrap, titlebarWidth 375 = scrollWidth"
  
  - region: "Long article pages (.container / .tui-main)"
    cause: "overflow: hidden clipped content beyond viewport (scrollHeight 8405px vs clientHeight 867px)"
    fix: "Changed .container and .tui-main to overflow: auto"
    status: "fixed_and_verified"
    evidence: "mainOverflow: auto, canScroll: true, conclusion visible after scroll to bottom"

blocking_violations: []  # All identified hotspots fixed and verified

remaining_visual_risks: none  # All identified visual defects resolved
