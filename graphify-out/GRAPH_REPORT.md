# Graph Report - .  (2026-06-02)

## Corpus Check
- 75 files · ~66,881 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 717 nodes · 1189 edges · 49 communities (36 shown, 13 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 143 edges (avg confidence: 0.87)
- Token cost: 0 input · 264,526 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Conversion Routing & Presets|Conversion Routing & Presets]]
- [[_COMMUNITY_Export UI Components|Export UI Components]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_App Shell & Wizard Flow|App Shell & Wizard Flow]]
- [[_COMMUNITY_Export Screen UI|Export Screen UI]]
- [[_COMMUNITY_Core ConvertCodec Functions|Core Convert/Codec Functions]]
- [[_COMMUNITY_Column Mapping Controls|Column Mapping Controls]]
- [[_COMMUNITY_Preview Screen (Desktop)|Preview Screen (Desktop)]]
- [[_COMMUNITY_Export Screen (Desktop)|Export Screen (Desktop)]]
- [[_COMMUNITY_Export Screen (Dark Mode)|Export Screen (Dark Mode)]]
- [[_COMMUNITY_Core Architecture Layer|Core Architecture Layer]]
- [[_COMMUNITY_Export Format Selection|Export Format Selection]]
- [[_COMMUNITY_Map Screen (Mobile)|Map Screen (Mobile)]]
- [[_COMMUNITY_Load Screen & Dropzone|Load Screen & Dropzone]]
- [[_COMMUNITY_Load Feature Cards|Load Feature Cards]]
- [[_COMMUNITY_Load Screen (Dark Mobile)|Load Screen (Dark Mobile)]]
- [[_COMMUNITY_Format Detection|Format Detection]]
- [[_COMMUNITY_Output Format Grid|Output Format Grid]]
- [[_COMMUNITY_Column Mapping Form|Column Mapping Form]]
- [[_COMMUNITY_Design System & Layout|Design System & Layout]]
- [[_COMMUNITY_Privacy & Accessibility Notes|Privacy & Accessibility Notes]]
- [[_COMMUNITY_Map Screen (Mobile Layout)|Map Screen (Mobile Layout)]]
- [[_COMMUNITY_Formats & Preset Model|Formats & Preset Model]]
- [[_COMMUNITY_Load Screen (Mobile)|Load Screen (Mobile)]]
- [[_COMMUNITY_Preview Deployment View|Preview Deployment View]]
- [[_COMMUNITY_A11y & Screenshot Scripts|A11y & Screenshot Scripts]]
- [[_COMMUNITY_Preview Screen (Desktop)|Preview Screen (Desktop)]]
- [[_COMMUNITY_Codec Test Suite|Codec Test Suite]]
- [[_COMMUNITY_File Reading|File Reading]]
- [[_COMMUNITY_Project Structure & Tests|Project Structure & Tests]]
- [[_COMMUNITY_Network Audit|Network Audit]]
- [[_COMMUNITY_Network Audit (dist)|Network Audit (dist)]]
- [[_COMMUNITY_Offline Build Config|Offline Build Config]]
- [[_COMMUNITY_Claude Settings Hooks|Claude Settings Hooks]]
- [[_COMMUNITY_TS Project References|TS Project References]]
- [[_COMMUNITY_Graphify Project Rule|Graphify Project Rule]]
- [[_COMMUNITY_Brand Mark|Brand Mark]]
- [[_COMMUNITY_Preset Registry|Preset Registry]]
- [[_COMMUNITY_Header & Footer|Header & Footer]]
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
7. `Column Mapping Form Card` - 14 edges
8. `Transaction` - 13 edges
9. `LoadStep component` - 12 edges
10. `Column Mapping Card` - 12 edges

## Surprising Connections (you probably didn't know these)
- `LoadStep component` --rationale_for--> `Actionable unsupported-file guidance`  [INFERRED]
  src/components/LoadStep.tsx → POLISH_LOG.md
- `Stepper component` --references--> `CHANGELOG`  [INFERRED]
  src/components/Stepper.tsx → CHANGELOG.md
- `Stepper component` --rationale_for--> `Mobile stepper truncation fix`  [INFERRED]
  src/components/Stepper.tsx → POLISH_LOG.md
- `4-step conversion flow (load/map/preview/export)` --conceptually_related_to--> `Load step (dropzone / file picker / sample)`  [INFERRED]
  src/App.tsx → design-system/pages/load.md
- `4-step conversion flow (load/map/preview/export)` --conceptually_related_to--> `Map step (column-role mapping)`  [INFERRED]
  src/App.tsx → design-system/pages/mapping.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Load-Map-Preview-Export wizard flow** — loadstep_LoadStep, mapstep_MapStep, stepper_Stepper, useconverter_useConverter [INFERRED 0.85]
- **File ingest pipeline (read, detect, dispatch)** — useconverter_loadFile, readfile_readFileSmart, useconverter_ingest, readfile_describeUnsupportedFile [EXTRACTED 0.95]

## Communities (49 total, 13 thin omitted)

### Community 0 - "Conversion Routing & Presets"
Cohesion: 0.07
Nodes (61): convert test suite (routing + presets), ExportArtifact, exportByPreset(), EXT, importByFormat(), MIME, ColumnRole, Delimiter (+53 more)

### Community 1 - "Export UI Components"
Cohesion: 0.07
Nodes (49): ACCOUNT_TYPES, ExportStep(), Footer(), Header(), AlertIcon(), ArrowLeftIcon(), ArrowRightIcon(), base() (+41 more)

### Community 2 - "Package Dependencies"
Cohesion: 0.05
Nodes (42): dependencies, @fontsource/ibm-plex-mono, @fontsource/ibm-plex-sans, react, react-dom, description, devDependencies, @axe-core/playwright (+34 more)

### Community 3 - "TypeScript Config"
Cohesion: 0.05
Nodes (35): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection, moduleResolution (+27 more)

### Community 4 - "App Shell & Wizard Flow"
Cohesion: 0.09
Nodes (37): a11y-check script (axe + overflow audit), App (root component / step router), CHANGELOG, Client-side, zero-upload privacy guarantee, Four-step conversion wizard flow, Privacy: nothing uploaded (local-only processing), ExportStep (output format + download), Footer (privacy notice + source link) (+29 more)

### Community 5 - "Export Screen UI"
Cohesion: 0.09
Nodes (34): Account details (optional) collapsible, 'Account details (optional)' collapsible accordion, App header: bank-statement-converter wordmark + theme toggle, Back button, Design decision: client-side / privacy-first messaging repeated throughout, Convert another file link, Export Step Screen (Desktop), Download .ofx primary button (+26 more)

### Community 6 - "Core Convert/Codec Functions"
Cohesion: 0.12
Nodes (29): exportByPreset, importByFormat, detectCsvDialect, detectFormat, guessColumnRoles, splitCsvLine, exportCsv, guardFormula (+21 more)

### Community 7 - "Column Mapping Controls"
Cohesion: 0.12
Nodes (22): Date Format Select (MM/DD/YYYY US), Decimal Separator Select (Point 1234.56), Delimiter Dropdown (Comma, auto-detected), Amount Field Mapping (Amount signed), Date Field Mapping, Description Field Mapping (Payee / Description), Inline Example Values (e.g. 01/03/2024, -84.23), Memo Field Mapping (Memo / Notes) (+14 more)

### Community 8 - "Preview Screen (Desktop)"
Cohesion: 0.12
Nodes (22): Signed Amount Color Coding, App Header (bank-statement-converter), Back Button, Choose Output Button (primary), Footer (privacy + MIT + Source), Local - nothing uploaded Badge, Preview Heading + Subtitle, Preview Step Screen (Desktop) (+14 more)

### Community 9 - "Export Screen (Desktop)"
Cohesion: 0.12
Nodes (21): Account Details (optional) Collapsible, App Header (bank-statement-converter), Back Button, 'Generated in your browser' Privacy Note, Convert Another File Link, Download .ofx Button, Ready to Export Summary Card, Export Step Screen (Desktop) (+13 more)

### Community 10 - "Export Screen (Dark Mode)"
Cohesion: 0.11
Nodes (21): Account Details (Optional) Accordion, Back Button, Convert Another File Link, Dark Mode Theme, Download .ofx Button, Export Step Screen (Dark Desktop), Output Filename Field (sample-bank-export.ofx), Footer (Runs in Browser / MIT Licensed / Source) (+13 more)

### Community 11 - "Core Architecture Layer"
Cohesion: 0.13
Nodes (20): core/convert.ts, src/core (pure core layer), core/detect.ts, core/exporters/ofx.ts, core/exporters/qif.ts, core/fitid.ts, core/importers/csv.ts, core/importers/ofx.ts (+12 more)

### Community 12 - "Export Format Selection"
Cohesion: 0.13
Nodes (20): Account Details (Optional) Accordion, Back Button, Generated in Browser Privacy Note, Convert Another File Link, Download .ofx Button, Ready to Export Side Panel, Export Step Screen (Choose Output Format), Footer (Runs Entirely in Browser / MIT Licensed / Source) (+12 more)

### Community 13 - "Map Screen (Mobile)"
Cohesion: 0.11
Nodes (20): Active Step Full Label ('Map'), Amount Column Mapping (Amount signed), App Header (bank-statement-converter + theme toggle), Date Format Dropdown (MM/DD/YYYY US), Date Column Mapping (Date), Decimal Separator Dropdown (Point 1234.56), Delimiter Dropdown (Comma), Description Column Mapping (Payee / Description) (+12 more)

### Community 14 - "Load Screen & Dropzone"
Cohesion: 0.13
Nodes (19): Accepted Formats Note (.csv .tsv .txt .ofx .qfx .qif), App Header Bar, Brand Title: bank-statement-converter, Card: CSV → OFX / QIF, Card: Smart column mapping, Card: Works offline, File Dropzone, Dropzone Prompt: Drop your statement here, or click to choose (+11 more)

### Community 15 - "Load Feature Cards"
Cohesion: 0.14
Nodes (17): Accepted formats hint: .csv .tsv .txt .ofx .qfx .qif, Card 'CSV → OFX / QIF' — formats apps need, with de-dup IDs, Card 'Smart column mapping' — auto-detect dates/amounts/debit-credit, Card 'Works offline' — no server, no sign-up, no tracking, Dashed drag-and-drop file dropzone, Three feature cards row, Footer: browser-only note + MIT licensed + Source link, Top app bar: wordmark + privacy status + theme toggle (+9 more)

### Community 16 - "Load Screen (Dark Mobile)"
Cohesion: 0.14
Nodes (16): Accepted Formats Note (.csv .tsv .txt .ofx .qfx .qif), Dark Theme Mobile Layout, File Drop Zone (Drop or Click to Choose), Stacked Feature Cards (Mobile Single Column), Feature: Smart Column Mapping, Feature: CSV to OFX / QIF, Feature: Works Offline, Footer with Privacy Note, MIT License and Source Link (+8 more)

### Community 17 - "Format Detection"
Cohesion: 0.21
Nodes (12): CsvDialect, DELIMITERS, detectCsvDialect(), DetectedFormat, detectFormat(), guessColumnRoles(), guessDecimalSeparator(), ROLE_HINTS (+4 more)

### Community 18 - "Output Format Grid"
Cohesion: 0.15
Nodes (15): Account Details (optional) Accordion, Download .ofx Button, Ready to Export / Download Panel, Format Card: Actual Budget (CSV), Format Card: CSV - generic, Format Card: GnuCash (CSV), Output Format Selection Grid, Format Card: OFX 2.x (.ofx) - selected (+7 more)

### Community 19 - "Column Mapping Form"
Cohesion: 0.19
Nodes (14): Amount Toggles (Strip currency symbols on, Flip +/- signs off), Delimiter Select (Comma), Field Mapping Dropdowns (Date, Description, Memo, Amount) with example hints, Loaded File Chip (sample-bank-export.csv) with Change link, Footer (browser-only privacy note, MIT licensed, Source link), Format Options Row (Date format, Decimal separator, Thousands separator), App Header with Title and Local/Theme Controls, 'First row is a header' Toggle (on) (+6 more)

### Community 20 - "Design System & Layout"
Cohesion: 0.21
Nodes (12): IBM Plex Sans/Mono typography, Single-accent rule (green/red reserved for amounts), Export step (format + preset + download), Load step (dropzone / file picker / sample), Preview step (live table + totals + warnings), 4-step conversion flow (load/map/preview/export), Swiss Modernism workbench design pattern, design-system/pages/export.md (+4 more)

### Community 21 - "Privacy & Accessibility Notes"
Cohesion: 0.20
Nodes (8): core/exporters/csv.ts, Fully client-side (no backend), CSV formula-injection guard, Playwright network audit (0 external requests), Privacy-first / nothing uploaded, Privacy wedge vs upload-based converters, WCAG 2.1 AA accessibility, Zero runtime network requests

### Community 22 - "Map Screen (Mobile Layout)"
Cohesion: 0.22
Nodes (11): Column Mapping Selects (Date/Description/Memo/Amount), Delimiter Select (Comma), Loaded File Chip + Change (sample-bank-export.csv), Format Options (Date format/Decimal/Thousands separator), First Row Is a Header Toggle (on), Preview transactions CTA, Privacy Footer (runs in browser / MIT / Source), Map Columns Screen (Mobile) (+3 more)

### Community 23 - "Formats & Preset Model"
Cohesion: 0.27
Nodes (9): core/presets.ts, De-duplication on import via FITID, European decimal handling (1.234,56), CSV format (input/output), OFX 1.x/2.x format (SGML/XML), QIF format, Saved mapping config in localStorage (never data), Per-app output presets (YNAB/Actual/GnuCash/Quicken) (+1 more)

### Community 24 - "Load Screen (Mobile)"
Cohesion: 0.25
Nodes (9): Full-Width Drag-and-Drop Upload Zone, Stacked Feature Cards (CSV→OFX/QIF, Smart mapping, Works offline), Mobile Footer (privacy note, MIT licensed, Source), Mobile Header (bank-statement-converter + theme toggle), Hero: 'Convert bank statement files, privately', In-Browser Privacy Note (lock icon), 'Or try a sample bank CSV' Link, Load Screen (Mobile Viewport) (+1 more)

### Community 25 - "Preview Deployment View"
Cohesion: 0.33
Nodes (9): App Header: bank-statement-converter Title + Theme Toggle, Footer: MIT licensed + Source link, Live GitHub Pages Deployment Preview (Bank Statement Converter), Privacy Indicators: 'Local · nothing uploaded' + 'Runs entirely in your browser. Your files never leave your device.', Navigation Buttons: Back / Choose output, Preview Step View: 'Check the parsed transactions before exporting', 4-Step Stepper: Load / Map / Preview / Export (Preview active), Summary Cards: Transactions 10, Inflow 4,989.99, Outflow -1,725.21, Net 3,264.78 (+1 more)

### Community 26 - "A11y & Screenshot Scripts"
Cohesion: 0.22
Nodes (5): overflow, run(), allRequests, audit, externalRequests

### Community 27 - "Preview Screen (Desktop)"
Cohesion: 0.32
Nodes (8): Signed Amount Color Coding (green inflow / red outflow), Preview Step (Desktop), Preview Heading + Subtitle 'Check the parsed transactions before exporting', Navigation Buttons (Back / Choose output), Privacy Banners ('Local - nothing uploaded' / 'Runs entirely in your browser'), 4-Step Progress Stepper (Load/Map/Preview/Export), Summary Stat Cards (Transactions / Inflow / Outflow / Net), Parsed Transactions Table (#, Date, Payee, Memo, Amount)

### Community 28 - "Codec Test Suite"
Cohesion: 0.29
Nodes (7): codecs test suite (importers/exporters), exportCsv (CSV exporter), exportOfx (OFX exporter), exportQif (QIF exporter), importCsv (CSV importer), importOfx (OFX/SGML importer), importQif (QIF importer)

### Community 29 - "File Reading"
Cohesion: 0.47
Nodes (4): ACCEPTED_EXTENSIONS, describeUnsupportedFile(), hasAcceptedExtension(), readFileSmart()

### Community 30 - "Project Structure & Tests"
Cohesion: 0.40
Nodes (4): src/components (React UI), src/state (conversion store), Layered design (UI / State / Core), Adversarial robustness test suite (125 cases)

### Community 31 - "Network Audit"
Cohesion: 0.40
Nodes (4): baseUrl, externalRequests, totalRequests, verdict

### Community 32 - "Network Audit (dist)"
Cohesion: 0.40
Nodes (4): baseUrl, externalRequests, totalRequests, verdict

## Knowledge Gaps
- **269 isolated node(s):** `baseUrl`, `totalRequests`, `externalRequests`, `verdict`, `name` (+264 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PapaParse (CSV parser)` connect `Core Architecture Layer` to `Conversion Routing & Presets`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `papaparse` connect `Core Architecture Layer` to `Package Dependencies`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Package Dependencies` to `Core Architecture Layer`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **What connects `baseUrl`, `totalRequests`, `externalRequests` to the rest of the system?**
  _275 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Conversion Routing & Presets` be split into smaller, more focused modules?**
  _Cohesion score 0.0741901776384535 - nodes in this community are weakly interconnected._
- **Should `Export UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.0733099209833187 - nodes in this community are weakly interconnected._
- **Should `Package Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.046511627906976744 - nodes in this community are weakly interconnected._