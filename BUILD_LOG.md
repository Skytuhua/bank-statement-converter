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
