# Task Breakdown

Living checklist, updated as the build progresses.

## Core (pure, tested) — `src/core`
- [ ] `model.ts` — Transaction type + helpers
- [ ] `normalize.ts` — date parsing (multiple orders) + amount normalisation
- [ ] `fitid.ts` — deterministic FNV-1a transaction hash
- [ ] `detect.ts` — format detection + CSV dialect (delimiter/header/decimal)
- [ ] `importers/csv.ts` — CSV → Transaction[] with mapping config
- [ ] `importers/ofx.ts` — OFX 1.x/2.x → Transaction[]
- [ ] `importers/qif.ts` — QIF → Transaction[]
- [ ] `exporters/csv.ts` — Transaction[] → CSV (presets)
- [ ] `exporters/ofx.ts` — Transaction[] → OFX 2.x
- [ ] `exporters/qif.ts` — Transaction[] → QIF
- [ ] `presets.ts` — per-app output presets
- [ ] `convert.ts` — orchestration

## UI — `src/components`, `src/state`
- [ ] Conversion store / hook
- [ ] Load step (drag-drop + picker + sample)
- [ ] Mapping step (column roles, date format, amount/sign options)
- [ ] Preview table (totals, warnings, empty/error states)
- [ ] Output step (format, preset, OFX account metadata)
- [ ] Export / download
- [ ] Header, footer, privacy banner, help/about
- [ ] Light/dark, responsive, keyboard nav, reduced-motion

## Tests
- [ ] Unit tests for every core module (round-trips, edge cases)
- [ ] Component tests for the conversion flow
- [ ] Fixtures: real-shaped CSV/OFX/QIF samples (incl. EU decimals, BOM)

## Polish & ship
- [ ] PWA manifest + icons (no emoji icons; SVG)
- [ ] README with screenshots, install, usage
- [ ] CHANGELOG
- [ ] Build artifacts (zip of dist)
- [ ] Push repo, tagged release, GitHub Pages
