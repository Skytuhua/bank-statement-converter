# Polish Log

This file tracks usability-polish + safe-bug-fix passes made on top of the
product's feature work. Each pass aims to make the tool a little clearer and
friendlier for a non-technical, first-time user — without changing what it does
or how it converts files.

---

## 2026-06-01 — Pass 1 (v1.0.0 → v1.0.1)

Starting point: a genuinely well-built, well-documented tool (clean README with
a plain first line, sensible defaults, auto-detection, clear empty/error/success
states, WCAG-AA, light/dark, 198 passing tests). The audit therefore looked for
small, high-value, low-risk clarity wins rather than churn.

### Audited as a non-technical first-time user
Ran the real app in a headless browser at desktop (1280px) and mobile (375px),
walked the full Load → Map → Preview → Export flow, and triggered the error
state by loading an unsupported file.

### Changes shipped (all low-risk, behavior-preserving)
1. **fix(stepper): "Preview" no longer truncates to "Pre…" on desktop.**
   The four step labels were laid out as equal-width flex items with a
   stretchy connector line, which squeezed the longest label ("Preview") until
   it ellipsised to "Pre…" — looked broken. Fixed with CSS only: the last step
   no longer stretches (`last:flex-none`) and step buttons don't shrink at
   `sm`+ (`sm:shrink-0`). Mobile keeps its existing graceful truncation (there
   genuinely isn't room for all four full labels at 375px). No structural or
   behavior change. Verified with before/after screenshots.

2. **fix(load): actionable error messages for the most common mistake.**
   A non-technical user's #1 mistake is feeding it a **PDF / scanned statement**
   (or a spreadsheet, image, or zip). The "unrecognised file" message was
   generic. Added a pure helper `describeUnsupportedFile(name)`
   (`src/lib/readFile.ts`) that detects the extension and explains what to do —
   e.g. for a PDF: "This tool converts a data-export file (CSV, OFX/QFX, or
   QIF), not PDF or scanned statements. On your bank's website, look for
   'Export' or 'Download' and choose CSV or OFX." Spreadsheets → "Save As CSV";
   images → "needs a data export, not a screenshot"; zips → "unzip first". The
   read-failure message is also friendlier. Control flow is unchanged — only the
   copy is better. Covered by new unit tests.

3. **docs(map): plain-language hint for the "Delimiter" jargon.**
   Added a one-line hint under the Delimiter selector: "The character between
   columns — auto-detected." (uses the `Field` component's existing `hint`
   prop). Demystifies the only piece of true jargon a casual user is likely to
   meet, and reassures them it's already handled.

### Verification
- `npm run build` ✅ · `npm run lint` ✅ (clean)
- `npm test` ✅ — 206 tests pass (was 198; +8 for the new error-message tests).
- Re-ran the project's screenshot+network-audit script: **PASS — zero external
  requests** (privacy guarantee intact). README screenshots refreshed.
- Independent adversarial review confirmed no conversion/parsing/control-flow
  changes and no new features — pure clarity/microcopy/CSS bug-fix.

### Left for a future run (candidates, not yet done)
- **Mobile stepper** still abbreviates "Preview" to "Pre…" at ≤375px. Could be
  improved (e.g. show numbers-only with the active label, or wrap) — left as-is
  to avoid a risky responsive redesign this pass.
- Consider a tiny preemptive note on the Load screen (e.g. "exports, not PDF or
  scanned statements") so users avoid the PDF mistake before it happens — held
  back this pass to keep the load card uncluttered now that the error guides
  them well.
- Optional plain-language hints for "Decimal separator" / "Thousands separator"
  (lower value — their example options already self-explain).
- The header/brand still shows the raw repo slug `bank-statement-converter` in a
  monospace font; a friendlier display name could be considered, but it's the
  established brand — deliberately not touched.
