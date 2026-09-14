# Mobile Reader QA

Status: implemented and validated on 2026-09-14.

The mobile layer is split into:

- `mobile-reader.css`
- `mobile-reader.js`

Validated viewports: 1440, 768, 430, 390, 375, 320.

Key behaviors verified:

- no document-level horizontal overflow
- contextual mobile topbar
- 44px minimum touch targets
- bottom Previous / Search / Focus / Next dock
- bottom-sheet full-text search
- drawer + backdrop layering and scroll lock
- independent horizontal scrolling for wide tables
- desktop presentation preserved

The final single-file artifact should inline these assets when `web/AI_Engineer_Handbook.html` is produced.
