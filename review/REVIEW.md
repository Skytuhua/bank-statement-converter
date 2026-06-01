# Self-Review & QA Report

Phase 5 was run as a fan-out of independent review subagents (the dynamic-
workflow fallback, since the Workflow runtime isn't exposed in this
environment — see `BUILD_LOG.md`), one per angle, with the lead acting as the
adversarial verifier: every finding was reproduced against the actual code
before being accepted and fixed, and every fix was re-verified with fresh
evidence (new tests, fresh axe run, fresh screenshots).

Angles covered: functional, visual/UX vs. the design system, edge-case &
robustness, code-quality & security, accessibility & performance, and
"would a real user keep this".

## Evidence
- Screenshots of every screen/state: `docs/screenshots/` (desktop light + dark,
  mobile, and a verified successful download).
- **Network audit** (`review/network-audit.json`): a Playwright run recording
  every network request across the whole flow → **0 external requests**. This
  is the machine-checked proof of the "nothing is uploaded" claim.
- Test suite: **198 tests across 6 files, all green** (`npm test`), incl. a
  125-test adversarial robustness suite.
- axe-core (WCAG 2.0/2.1 A & AA): **clean on all 4 screens in both light and
  dark mode** after fixes.
- Build: `npm run build` green; `npm run lint` clean; `tsc -b` clean.

## Findings & fixes

### Security / correctness
1. **CSV formula injection (Medium) — FIXED.** Exported text cells (payee/memo/
   category) beginning with `= + - @ \t \r` could execute if the CSV were opened
   in a spreadsheet. Added `guardFormula()` in `exporters/csv.ts` that prefixes
   such *text* cells with `'` — never applied to date/amount columns (where a
   leading `-` is legitimate). Regression test added.
2. **OFX amount silently zeroed (Medium) — FIXED.** `importers/ofx.ts` used
   `Number(rawAmount.replace(/,/g,''))`, so an empty/comma-decimal/parenthesised
   `TRNAMT` became a silent `0` with no warning. Now routed through
   `parseAmount` and a missing amount is flagged. Tests added.
3. **OFX export could emit XML-illegal control characters (Low) — FIXED.**
   `exporters/ofx.ts` `xml()` now strips C0 control chars (except tab/LF/CR) so
   output is always well-formed; verified with a DOMParser round-trip test.
4. **QIF 2-digit apostrophe years didn't parse (Low) — FIXED.** `parseDate`
   auto-mode now accepts 2-digit trailing years (Quicken's `1/2'23` →
   `2023-01-02`). Test updated to assert the corrected behaviour.
5. **Unknown `<ACCTTYPE>` flowed in untyped (Low) — FIXED.** `importers/ofx.ts`
   now validates against the known account-type set before assigning. Test added.
6. **`detect.ts` mode computation was O(n²) + mutated its input (Low) — FIXED.**
   Replaced with a single frequency-map pass.
- XSS, ReDoS, secrets, prototype pollution, path traversal, runtime network
  calls: **all audited, no findings** (path-traversal sanitiser and the
  zero-network property were both verified).

### Accessibility (WCAG 2.1 AA)
7. **Unlabelled file `<input>` (High) — FIXED.** It is reached via the dropzone
   button, so it now has `tabindex=-1` + `aria-hidden` + an `aria-label`.
8. **Light-mode contrast failures (High/Medium) — FIXED.** Several pairings fell
   below 4.5:1 in light mode (inflow-green text on tints ~3.3:1; muted grey on
   muted surfaces ~4.0:1; `/80` hint opacity). Darkened the light-mode tokens
   (`--inflow` → emerald-700, `--outflow`/`--destructive` → red-700,
   `--muted-foreground` → slate-600) and removed the `/80` hint opacity. axe now
   reports zero color-contrast violations in both themes.
9. **375 px horizontal overflow on Map/Preview/Export (Medium) — FIXED.** The
   stepper forced a ~24 px overflow; connector lines are now hidden below `sm`,
   labels truncate, and mobile padding/gaps were trimmed. `scrollWidth` now
   equals the 375 px viewport on every screen.
- Keyboard nav, visible focus ring, `prefers-reduced-motion`, SVG-only icons,
  font/colour conformance to `MASTER.md`: **all PASS**.

### Robustness
- A 125-test adversarial suite (`src/core/__tests__/robustness.test.ts`) throws
  empty/huge (50k-row)/malformed/Unicode/locale-edge inputs at every codec and
  asserts no crashes and structurally sane output. All pass; the three genuine
  bugs it surfaced are fixed above (items 2, 3, 4).

### "Would a real user keep this?"
Yes. The end-to-end flow (load sample → auto-mapped columns → correct preview
with totals → OFX download that re-imports cleanly with stable FITIDs) works
and is fast. The privacy promise is provable (network audit), the UI is clean
and faithful to the design system, and the core handles the messy real-world
inputs (US/EU dates, comma decimals, quoted commas, debit/credit columns,
currency symbols) that make people give up on other tools.

## Known limitations (documented, not defects)
- Scientific-notation amounts (e.g. `1e3`) are not interpreted as 1000 — bank
  exports don't use them; pinned in the robustness suite as current behaviour.
- A UTF-8 BOM is not stripped from the *first CSV header cell name* (mapping is
  positional, so values still parse correctly).
- Per the v1 spec: no PDF/OCR, no multi-file merge, no live bank connections.
