# Build Log

A running journal of decisions, dead ends, and fixes.

## Phase 0 — Environment & capability setup
- Inventoried toolchain: Node 22.22, npm 10.9, Python 3.11.15, git 2.43. OS
  Linux x86_64.
- `gh` CLI was missing → installed GitHub CLI 2.93.0 from the official apt repo.
- Authenticated `gh` as **Skytuhua** (token via stdin; never written to disk,
  logged, or committed). Ran `gh auth setup-git`. Set global git identity to
  `Skytuhua <Skytuhua@users.noreply.github.com>`.
- Listed existing repos to ensure no duplication. The account has a clear
  "privacy-first, 100% in-browser utility" portfolio (metascrub, vcardlab,
  subtitle tools, cronanchor, cookpit, id-lens, stitch-forge, Inkspect, …).
  None overlap the chosen product.
- Cloned `ui-ux-pro-max` design skill to `/home/user/uipro` and smoke-tested
  `src/ui-ux-pro-max/scripts/search.py` — working.
- **Dynamic workflows:** the dedicated `Workflow` runtime tool is **not
  exposed** in this environment (confirmed via tool search). Per the master
  prompt's fallback directive, falling back to parallel `Agent` subagents for
  fan-out research and multi-angle review, plus multi-pass self-review. Noted
  here as required.

## Phase 1 — Discovery & research
- Ran demand validation as three parallel research subagents (fan-out, the
  workflow fallback), one per shortlisted idea: bank-statement converter, ICS
  workbench, GPX workbench. Each returned a cited demand verdict + feasibility.
- Scored the shortlist against the §3 rubric (see RESEARCH.md). **Winner:
  bank-statement converter** — strongest honest demand, clearest privacy wedge
  incumbents can't copy, zero network dependency (airtight "nothing uploaded"),
  sharply finishable scope.

## Phase 2 — Scaffolding
- Chose plain, self-explanatory name **`bank-statement-converter`** (confirmed
  free on the account). Scaffolded Vite + React 19 + TypeScript.
- `git init`; disabled `commit.gpgsign` for this fresh project; set local git
  identity to the owner.
- Wrote RESEARCH.md, SPEC.md (v1 scope + explicit non-goals), ARCHITECTURE.md.

## Phase 3 — Dependencies
- Installed: papaparse (CSV). Dev: tailwindcss v4 + @tailwindcss/vite, vitest +
  @vitest/coverage-v8, jsdom, @testing-library/react + jest-dom,
  @types/papaparse, @types/node. 0 vulnerabilities.
- Configured Vite with relative base `./` (runs from file:// / Pages / zip),
  Tailwind v4 plugin, and Vitest (jsdom).
- **Gate 3 baseline green:** `vitest run` passes a smoke test, `npm run build`
  produces a working bundle, `eslint .` is clean.

## Phase 3.5 — UI/UX design system
- Ran the full `ui-ux-pro-max` workflow from project root: analyze → MASTER.md →
  per-page overrides (load/map/preview/export) → domain deep-dives (style,
  color, typography, ux) → `--stack react` → synthesized `DESIGN_NOTES.md`.
- Engine recommended **Minimalism/Swiss Style + IBM Plex Sans + trust-blue
  #1E40AF**. The color domain surfaced a light-first "Banking/Traditional
  Finance" palette better suited to dense financial tables, so light is the
  primary mode (dark fully supported). Green/red reserved for inflow/outflow
  semantics only (doesn't break the single-accent rule). Fonts self-hosted via
  Fontsource so the tool works fully offline (zero runtime network).
- Gate 3.5 passed: MASTER.md complete (pattern, hex colors, typography, spacing,
  effects, anti-patterns, checklist), per-page overrides present, DESIGN_NOTES.md
  written in own words.

## Phase 4 — Build
- Built pure `core/` layer first (model, normalize, fitid, detect, importers
  csv/ofx/qif, exporters csv/ofx/qif, presets, convert) with 70 unit tests
  (round-trips, EU decimals, debit/credit, edge cases) — all green.
- Built the React UI: app shell + stepper (Load→Map→Preview→Export), dropzone
  with drag/parse/error states, column-mapping form with live preview, dense
  data table with totals + warnings filter, output presets + OFX account panel,
  Blob download. Design-system primitives (Button/Select/Toggle/Card/etc.),
  light/dark theme, self-hosted fonts, branded SVG favicon + PWA manifest.
- Verified in a real browser via Playwright: full flow drives, OFX download is
  valid well-formed XML, **network audit = 0 external requests**. Gate 4 met.

## Phase 5 — Review & QA
- Fanned out parallel review subagents (security/code-quality, edge-case
  robustness, accessibility/design) + lead-as-adversarial-verifier. See
  `review/REVIEW.md` for the full findings/fixes/evidence.
- Fixed: CSV formula-injection guard, OFX amount parsing via parseAmount, OFX
  XML control-char stripping, QIF 2-digit year, ACCTTYPE validation, detect mode
  cleanup; a11y: file-input label, light-mode contrast tokens (WCAG AA),
  375px stepper overflow, hint opacity.
- Re-verified: 198 tests green, axe clean on 4 screens × 2 themes, no 375px
  overflow, network audit PASS, fresh screenshots captured. Gate 5 met.
