# Architecture

## Tech stack & rationale

| Choice | Why |
|--------|-----|
| **Vite + React 19 + TypeScript** | The UI is genuinely stateful (multi-step pipeline, live preview that recomputes as mapping options change). React keeps that manageable; TypeScript catches codec/format bugs at compile time. Vite gives a fast dev loop and a small static build. |
| **Tailwind CSS v4** | Utility-first styling lets the UI implement the Phase 3.5 design tokens directly with no CSS sprawl. v4's `@tailwindcss/vite` plugin needs zero config file. |
| **PapaParse** | Battle-tested, browser-native CSV parser handling quoting, delimiters, encodings, and streaming. No point re-implementing it. |
| **Hand-written OFX/QIF codecs** | OFX (SGML/XML) and QIF are small, well-specified text formats. Owning them as pure, fully-unit-tested functions is more reliable and lighter than pulling heavy/abandoned libs, and keeps the bundle tiny. |
| **Vitest + Testing Library** | Same engine as Vite; fast unit tests for the (pure) codec core plus component tests. |
| **No backend, relative base path** | The product's entire value proposition is "nothing is uploaded." A static SPA with `base: './'` runs from GitHub Pages, a downloaded `.zip`, or `file://`, and works fully offline. |

**Everything is client-side. There is no server, no API, no telemetry, no
network request of any kind at runtime.** This is enforced architecturally
(no `fetch`/`XMLHttpRequest` to any host) and verified in review.

## Layered design

```
┌──────────────────────────────────────────────────────────┐
│  UI (src/components, src/App.tsx)                          │
│  Steps: Load → Map → Preview → Output → Export             │
│  Pure presentational + small hooks; no business logic.     │
├──────────────────────────────────────────────────────────┤
│  State (src/state) — the conversion store                  │
│  Holds raw input, detected format, mapping config, the     │
│  derived Transaction[] and warnings. Recomputes on change. │
├──────────────────────────────────────────────────────────┤
│  Core (src/core) — PURE, framework-free, fully tested      │
│   • detect.ts      format + CSV dialect detection          │
│   • model.ts       Transaction type + helpers              │
│   • normalize.ts   date & amount parsing/normalisation     │
│   • fitid.ts       deterministic transaction hashing       │
│   • importers/     csv.ts · ofx.ts · qif.ts  (→ Transaction[]) │
│   • exporters/     csv.ts · ofx.ts · qif.ts  (Transaction[] →) │
│   • presets.ts     per-app output presets                  │
│   • convert.ts     orchestrates import → export            │
└──────────────────────────────────────────────────────────┘
```

The `core/` layer never imports React and never touches the DOM, so it is
trivially unit-testable and could be reused as a library or CLI.

## Data flow
1. `File` → `FileReader.readAsText` (with encoding detection) → raw string.
2. `detect()` → `{ format, dialect? }`.
3. Importer parses raw → `Transaction[]` + `ParseWarning[]`, using the
   user's mapping config (CSV) or the format's own structure (OFX/QIF).
4. The store exposes the normalised `Transaction[]` to the Preview.
5. On export, the chosen exporter + preset serialise `Transaction[]` → string
   → `Blob` → download.

## Key algorithms
- **CSV dialect detection** — score candidate delimiters by column-count
  consistency across rows; detect a header by alpha-vs-numeric heuristics;
  detect decimal separator by trailing-group analysis.
- **Date normalisation** — explicit user-selected format with a confident
  auto-guess (tries common orders, flags ambiguity like `03/04`).
- **Amount normalisation** — strip currency/grouping, honour decimal
  separator, combine debit/credit columns or split a signed column, optional
  sign flip.
- **FITID** — FNV-1a hash over `date|amount|payee|memo` (+ a per-account salt)
  so identical transactions get identical, stable IDs and apps de-duplicate.

## Third-party dependencies & licenses
| Package | License |
|---------|---------|
| react, react-dom | MIT |
| papaparse | MIT |
| tailwindcss, @tailwindcss/vite | MIT |
| vite, @vitejs/plugin-react | MIT |
| vitest, @testing-library/* | MIT |

All MIT/permissive. The product itself is MIT-licensed.
