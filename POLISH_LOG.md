# Polish Log

This file tracks usability-polish + safe-bug-fix passes made on top of the
product's feature work. Each pass aims to make the tool a little clearer and
friendlier for a non-technical, first-time user — without changing what it does
or how it converts files.

---

## 2026-06-02 — Pass 2 (v1.0.1 → v1.0.2)

Repeat run on the same product (nothing newer shipped by the builder, and no new
commits since Pass 1). Per the routine's "audit only the delta" rule, this pass
did **not** re-audit from scratch — it started from Pass 1's "Left for a future
run" list and picked the two highest-value, lowest-risk items.

### Changes shipped (all low-risk, behavior-preserving)
1. **fix(stepper): the mobile progress steps no longer truncate "Preview" to
   "Pre…".** Pass 1 fixed this on desktop only; at ≤375px all four step labels
   were laid out as equal-width flex items with `truncate`, so the active label
   still ellipsised (verified — "Pre…" on the Map step, and "Preview" itself was
   clipped). Fix is **CSS/className only**: on mobile each step sizes to its
   content and the row is centred (`flex-none` + `justify-center`), and only the
   *active* step shows its text label — the others render as numbered dots. The
   hidden labels stay in the accessibility tree (`sr-only sm:not-sr-only`), so
   screen readers still announce every step. At `sm`+ the original equal-width
   layout with full labels and connectors is exactly restored. Verified with
   before/after screenshots on the Map **and** Preview steps (the active label
   now reads in full), and re-confirmed no 375px horizontal overflow.

2. **docs(load): a preemptive plain-language note on the start screen.** This was
   Pass 1's top held-back candidate. Under the accepted-formats line we now show
   *"These are files your bank exports — not PDF or scanned statements."* — so a
   non-technical user understands what to load before they try a PDF or a photo
   of a statement (the #1 mistake). Static copy only, grouped tightly with the
   existing "Accepts …" line so it doesn't clutter the dropzone. Truthful — the
   tool has never parsed PDFs/OCR (see README Limitations).

### Verification
- `npm run build` ✅ · `npm run lint` ✅ (clean) · `npm test` ✅ — 206 tests pass.
- `scripts/a11y-check.mjs` ✅ — axe-clean in light **and** dark across all four
  steps; no horizontal overflow at 375px.
- `scripts/screenshots.mjs` ✅ — full Load→Map→Preview→Export flow driven in a
  real browser, OFX download verified, **network audit PASS — zero external
  requests** (privacy guarantee intact). README screenshots refreshed.
- Two independent adversarial reviewers confirmed both changes are className/copy
  only — no logic, control-flow, conversion, or accessibility regression, and no
  new feature.

### Left for a future run (candidates, not yet done)
- Optional plain-language hints for "Decimal separator" / "Thousands separator"
  (lower value — their example options, e.g. "1234.56" / "1,234", already
  self-explain). Deliberately skipped to avoid churn.
- The header/brand still shows the raw repo slug `bank-statement-converter` in a
  monospace font; a friendlier display name could be considered, but it's the
  established brand — still deliberately not touched.
- The split debit/credit hint and per-row warnings copy are already clear; no
  action needed unless the builder changes that area.

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
