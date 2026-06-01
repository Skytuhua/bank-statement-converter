# Graph Report - .  (2026-06-01)

## Corpus Check
- 71 files · ~63,926 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 530 nodes · 968 edges · 38 communities (27 shown, 11 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 95 edges (avg confidence: 0.87)
- Token cost: 386,195 input · 68,151 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Conversion Engine & FITID|Conversion Engine & FITID]]
- [[_COMMUNITY_React UI Components & Icons|React UI Components & Icons]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_TypeScript Compiler Config|TypeScript Compiler Config]]
- [[_COMMUNITY_Export Screen (Desktop UI)|Export Screen (Desktop UI)]]
- [[_COMMUNITY_ImportExport Codec Functions|Import/Export Codec Functions]]
- [[_COMMUNITY_Core Layer Architecture|Core Layer Architecture]]
- [[_COMMUNITY_App Component Structure|App Component Structure]]
- [[_COMMUNITY_Load Screen (Desktop UI)|Load Screen (Desktop UI)]]
- [[_COMMUNITY_Format & Dialect Detection|Format & Dialect Detection]]
- [[_COMMUNITY_Export Screen (Dark Mode)|Export Screen (Dark Mode)]]
- [[_COMMUNITY_Map Columns Screen (Desktop)|Map Columns Screen (Desktop)]]
- [[_COMMUNITY_Design System & Visual Language|Design System & Visual Language]]
- [[_COMMUNITY_Privacy-First Architecture|Privacy-First Architecture]]
- [[_COMMUNITY_Statement Formats & Presets|Statement Formats & Presets]]
- [[_COMMUNITY_Map Columns Screen (Mobile)|Map Columns Screen (Mobile)]]
- [[_COMMUNITY_Live Deployment Preview|Live Deployment Preview]]
- [[_COMMUNITY_Load Screen (Mobile)|Load Screen (Mobile)]]
- [[_COMMUNITY_A11y & Screenshot Scripts|A11y & Screenshot Scripts]]
- [[_COMMUNITY_Preview Screen (Desktop)|Preview Screen (Desktop)]]
- [[_COMMUNITY_Codec Test Suite|Codec Test Suite]]
- [[_COMMUNITY_Layered Design & Robustness Tests|Layered Design & Robustness Tests]]
- [[_COMMUNITY_Network Audit (docs)|Network Audit (docs)]]
- [[_COMMUNITY_Network Audit (review)|Network Audit (review)]]
- [[_COMMUNITY_Offline Build Config|Offline Build Config]]
- [[_COMMUNITY_TS Project References|TS Project References]]
- [[_COMMUNITY_App Favicon  Brand Mark|App Favicon / Brand Mark]]
- [[_COMMUNITY_Preset Lookup|Preset Lookup]]
- [[_COMMUNITY_Header & Footer (Preview UI)|Header & Footer (Preview UI)]]
- [[_COMMUNITY_Project Manifest|Project Manifest]]
- [[_COMMUNITY_ESLint Flat Config|ESLint Flat Config]]
- [[_COMMUNITY_Totals Helper|Totals Helper]]
- [[_COMMUNITY_Download Helper|Download Helper]]
- [[_COMMUNITY_Theme Hook|Theme Hook]]
- [[_COMMUNITY_App Entry Point|App Entry Point]]

## God Nodes (most connected - your core abstractions)
1. `cx()` - 19 edges
2. `compilerOptions` - 17 edges
3. `compilerOptions` - 16 edges
4. `base()` - 15 edges
5. `src/core (pure core layer)` - 15 edges
6. `Target format / app card grid` - 15 edges
7. `Transaction` - 13 edges
8. `DateFormat` - 11 edges
9. `CsvMapping` - 10 edges
10. `parseDate()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Load step (dropzone / file picker / sample)` --conceptually_related_to--> `4-step conversion flow (load/map/preview/export)`  [INFERRED]
  design-system/pages/load.md → src/App.tsx
- `Map step (column-role mapping)` --conceptually_related_to--> `4-step conversion flow (load/map/preview/export)`  [INFERRED]
  design-system/pages/mapping.md → src/App.tsx
- `Preview step (live table + totals + warnings)` --conceptually_related_to--> `4-step conversion flow (load/map/preview/export)`  [INFERRED]
  design-system/pages/preview.md → src/App.tsx
- `Swiss Modernism workbench design pattern` --semantically_similar_to--> `Privacy-first / nothing uploaded`  [INFERRED] [semantically similar]
  design-system/MASTER.md → SPEC.md
- `Network audit result (review)` --semantically_similar_to--> `Network audit result (docs)`  [INFERRED] [semantically similar]
  review/network-audit.json → docs/screenshots/network-audit.json

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **4-step conversion UI flow** — loadstep_LoadStep, mapstep_MapStep, previewstep_PreviewStep [INFERRED 0.85]
- **Codec import/export round-trip family** — core_importofx, core_exportofx, codecstest_suite [INFERRED 0.85]
- **Local-only privacy guarantee + evidence** — concept_no_upload, screenshots_script, networkaudit_docs [INFERRED 0.80]
- **Importers parse into Transaction[]** — importerscsv_importCsv, importersofx_importOfx, importersqif_importQif [INFERRED 0.85]
- **Exporters serialise from Transaction[]** — exporterscsv_exportCsv, exportersofx_exportOfx, exportersqif_exportQif [INFERRED 0.85]
- **Detect to convert to model conversion flow** — state_useConverter, convert_importByFormat, model_Transaction [INFERRED 0.75]
- **Stepper conversion flow (Load→Map→Preview→Export)** — concept_step_load, concept_step_map, concept_step_preview, concept_step_export [INFERRED 0.85]
- **Core codec layer (import/export/convert)** — code_importer_csv, code_exporter_ofx, code_convert [INFERRED 0.80]
- **Privacy-first invariant (client-side, zero-network, audited)** — concept_client_side, concept_zero_network, concept_network_audit [INFERRED 0.85]

## Communities (38 total, 11 thin omitted)

### Community 0 - "Conversion Engine & FITID"
Cohesion: 0.07
Nodes (61): convert test suite (routing + presets), ExportArtifact, exportByPreset(), EXT, importByFormat(), MIME, ColumnRole, Delimiter (+53 more)

### Community 1 - "React UI Components & Icons"
Cohesion: 0.07
Nodes (51): ACCOUNT_TYPES, ExportStep(), Footer(), Header(), AlertIcon(), ArrowLeftIcon(), ArrowRightIcon(), base() (+43 more)

### Community 2 - "Package Dependencies"
Cohesion: 0.05
Nodes (42): dependencies, @fontsource/ibm-plex-mono, @fontsource/ibm-plex-sans, react, react-dom, description, devDependencies, @axe-core/playwright (+34 more)

### Community 3 - "TypeScript Compiler Config"
Cohesion: 0.05
Nodes (35): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+27 more)

### Community 4 - "Export Screen (Desktop UI)"
Cohesion: 0.09
Nodes (34): Account details (optional) collapsible, 'Account details (optional)' collapsible accordion, App header: bank-statement-converter wordmark + theme toggle, Back button, Design decision: client-side / privacy-first messaging repeated throughout, Convert another file link, Export Step Screen (Desktop), Download .ofx primary button (+26 more)

### Community 5 - "Import/Export Codec Functions"
Cohesion: 0.12
Nodes (29): exportByPreset, importByFormat, detectCsvDialect, detectFormat, guessColumnRoles, splitCsvLine, exportCsv, guardFormula (+21 more)

### Community 6 - "Core Layer Architecture"
Cohesion: 0.13
Nodes (20): core/convert.ts, src/core (pure core layer), core/detect.ts, core/exporters/ofx.ts, core/exporters/qif.ts, core/fitid.ts, core/importers/csv.ts, core/importers/ofx.ts (+12 more)

### Community 7 - "App Component Structure"
Cohesion: 0.25
Nodes (18): a11y-check script (axe + overflow audit), App (root component / step router), Privacy: nothing uploaded (local-only processing), ExportStep (output format + download), Footer (privacy notice + source link), Header (brand + theme toggle), Inline SVG icon set, FeatureRow (marketing feature list) (+10 more)

### Community 8 - "Load Screen (Desktop UI)"
Cohesion: 0.14
Nodes (17): Accepted formats hint: .csv .tsv .txt .ofx .qfx .qif, Card 'CSV → OFX / QIF' — formats apps need, with de-dup IDs, Card 'Smart column mapping' — auto-detect dates/amounts/debit-credit, Card 'Works offline' — no server, no sign-up, no tracking, Dashed drag-and-drop file dropzone, Three feature cards row, Footer: browser-only note + MIT licensed + Source link, Top app bar: wordmark + privacy status + theme toggle (+9 more)

### Community 9 - "Format & Dialect Detection"
Cohesion: 0.21
Nodes (12): CsvDialect, DELIMITERS, detectCsvDialect(), DetectedFormat, detectFormat(), guessColumnRoles(), guessDecimalSeparator(), ROLE_HINTS (+4 more)

### Community 10 - "Export Screen (Dark Mode)"
Cohesion: 0.15
Nodes (15): Account Details (optional) Accordion, Download .ofx Button, Ready to Export / Download Panel, Format Card: Actual Budget (CSV), Format Card: CSV - generic, Format Card: GnuCash (CSV), Output Format Selection Grid, Format Card: OFX 2.x (.ofx) - selected (+7 more)

### Community 11 - "Map Columns Screen (Desktop)"
Cohesion: 0.19
Nodes (14): Amount Toggles (Strip currency symbols on, Flip +/- signs off), Delimiter Select (Comma), Field Mapping Dropdowns (Date, Description, Memo, Amount) with example hints, Loaded File Chip (sample-bank-export.csv) with Change link, Footer (browser-only privacy note, MIT licensed, Source link), Format Options Row (Date format, Decimal separator, Thousands separator), App Header with Title and Local/Theme Controls, 'First row is a header' Toggle (on) (+6 more)

### Community 12 - "Design System & Visual Language"
Cohesion: 0.21
Nodes (12): IBM Plex Sans/Mono typography, Single-accent rule (green/red reserved for amounts), Export step (format + preset + download), Load step (dropzone / file picker / sample), Preview step (live table + totals + warnings), 4-step conversion flow (load/map/preview/export), Swiss Modernism workbench design pattern, design-system/pages/export.md (+4 more)

### Community 13 - "Privacy-First Architecture"
Cohesion: 0.20
Nodes (8): core/exporters/csv.ts, Fully client-side (no backend), CSV formula-injection guard, Playwright network audit (0 external requests), Privacy-first / nothing uploaded, Privacy wedge vs upload-based converters, WCAG 2.1 AA accessibility, Zero runtime network requests

### Community 14 - "Statement Formats & Presets"
Cohesion: 0.27
Nodes (9): core/presets.ts, De-duplication on import via FITID, European decimal handling (1.234,56), CSV format (input/output), OFX 1.x/2.x format (SGML/XML), QIF format, Saved mapping config in localStorage (never data), Per-app output presets (YNAB/Actual/GnuCash/Quicken) (+1 more)

### Community 15 - "Map Columns Screen (Mobile)"
Cohesion: 0.22
Nodes (11): Column Mapping Selects (Date/Description/Memo/Amount), Delimiter Select (Comma), Loaded File Chip + Change (sample-bank-export.csv), Format Options (Date format/Decimal/Thousands separator), First Row Is a Header Toggle (on), Preview transactions CTA, Privacy Footer (runs in browser / MIT / Source), Map Columns Screen (Mobile) (+3 more)

### Community 16 - "Live Deployment Preview"
Cohesion: 0.33
Nodes (9): App Header: bank-statement-converter Title + Theme Toggle, Footer: MIT licensed + Source link, Live GitHub Pages Deployment Preview (Bank Statement Converter), Privacy Indicators: 'Local · nothing uploaded' + 'Runs entirely in your browser. Your files never leave your device.', Navigation Buttons: Back / Choose output, Preview Step View: 'Check the parsed transactions before exporting', 4-Step Stepper: Load / Map / Preview / Export (Preview active), Summary Cards: Transactions 10, Inflow 4,989.99, Outflow -1,725.21, Net 3,264.78 (+1 more)

### Community 17 - "Load Screen (Mobile)"
Cohesion: 0.25
Nodes (9): Full-Width Drag-and-Drop Upload Zone, Stacked Feature Cards (CSV→OFX/QIF, Smart mapping, Works offline), Mobile Footer (privacy note, MIT licensed, Source), Mobile Header (bank-statement-converter + theme toggle), Hero: 'Convert bank statement files, privately', In-Browser Privacy Note (lock icon), 'Or try a sample bank CSV' Link, Load Screen (Mobile Viewport) (+1 more)

### Community 18 - "A11y & Screenshot Scripts"
Cohesion: 0.22
Nodes (5): overflow, run(), allRequests, audit, externalRequests

### Community 19 - "Preview Screen (Desktop)"
Cohesion: 0.32
Nodes (8): Signed Amount Color Coding (green inflow / red outflow), Preview Step (Desktop), Preview Heading + Subtitle 'Check the parsed transactions before exporting', Navigation Buttons (Back / Choose output), Privacy Banners ('Local - nothing uploaded' / 'Runs entirely in your browser'), 4-Step Progress Stepper (Load/Map/Preview/Export), Summary Stat Cards (Transactions / Inflow / Outflow / Net), Parsed Transactions Table (#, Date, Payee, Memo, Amount)

### Community 20 - "Codec Test Suite"
Cohesion: 0.29
Nodes (7): codecs test suite (importers/exporters), exportCsv (CSV exporter), exportOfx (OFX exporter), exportQif (QIF exporter), importCsv (CSV importer), importOfx (OFX/SGML importer), importQif (QIF importer)

### Community 21 - "Layered Design & Robustness Tests"
Cohesion: 0.40
Nodes (4): src/components (React UI), src/state (conversion store), Layered design (UI / State / Core), Adversarial robustness test suite (125 cases)

### Community 22 - "Network Audit (docs)"
Cohesion: 0.40
Nodes (4): baseUrl, externalRequests, totalRequests, verdict

### Community 23 - "Network Audit (review)"
Cohesion: 0.40
Nodes (4): baseUrl, externalRequests, totalRequests, verdict

## Knowledge Gaps
- **188 isolated node(s):** `baseUrl`, `totalRequests`, `externalRequests`, `verdict`, `name` (+183 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PapaParse (CSV parser)` connect `Core Layer Architecture` to `Conversion Engine & FITID`?**
  _High betweenness centrality (0.132) - this node is a cross-community bridge._
- **Why does `papaparse` connect `Core Layer Architecture` to `Package Dependencies`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Package Dependencies` to `Core Layer Architecture`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **What connects `baseUrl`, `totalRequests`, `externalRequests` to the rest of the system?**
  _193 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Conversion Engine & FITID` be split into smaller, more focused modules?**
  _Cohesion score 0.0741901776384535 - nodes in this community are weakly interconnected._
- **Should `React UI Components & Icons` be split into smaller, more focused modules?**
  _Cohesion score 0.06729264475743349 - nodes in this community are weakly interconnected._
- **Should `Package Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._