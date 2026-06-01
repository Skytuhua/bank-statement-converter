# Product Spec — bank-statement-converter (v1)

> Convert bank statement export files (CSV, OFX/QFX, QIF) between formats
> entirely in your browser — nothing is uploaded.

## v1 feature set

### Input formats
- **CSV** — any delimiter (`,`, `;`, tab, `|`), with or without a header row,
  with auto-detection of delimiter, header, decimal separator and encoding
  (UTF-8 / UTF-8-BOM / Latin-1).
- **OFX 1.x** (SGML) and **OFX 2.x** (XML), `.ofx` / `.qfx`.
- **QIF** (`!Type:Bank`/`CCard`/`Cash` etc.).

### Output formats
- **CSV** — with a configurable column layout and per-app presets.
- **OFX 2.x** (well-formed XML, widely importable, with `<FITID>`s for
  de-duplication on import).
- **QIF**.

The headline conversion is **CSV → OFX/QIF** (the most-requested direction),
with the reverse (OFX/QIF → CSV) and any-to-any also supported.

### Core pipeline
1. **Load** — drag-and-drop or file picker (File API). The file is read in the
   browser; it is never sent anywhere.
2. **Detect** — auto-detect the input format; for CSV, auto-detect delimiter,
   header row, and decimal/thousands separators, and guess column roles.
3. **Map** (CSV input) — assign each source column to a transaction field:
   Date, Payee, Memo/Description, Amount **or** a Debit and Credit pair,
   Category, Check #, plus an explicit **date format** selector and
   **amount/sign options** (decimal separator, thousands separator, strip
   currency symbols, treat-debits-as-negative, flip signs).
4. **Preview** — a live table of the parsed, normalised transactions with row
   count, summed inflow/outflow totals, and per-row warnings (unparseable date
   or amount). Updates instantly as mapping options change.
5. **Configure output** — choose target format and a per-app **preset**
   (YNAB CSV, Actual Budget CSV, GnuCash, Quicken QIF, OFX, or generic). For
   OFX, optional account metadata (account id, bank/routing id, account type,
   currency).
6. **Export** — generate the file in memory and download it via Blob. Filename
   derived from the source.

### Quality-of-life
- **Saved presets / settings** persisted in `localStorage` (never the data
  itself — only the mapping configuration).
- **Sample file** loader so users can try it instantly with no data.
- Clear empty / loading / error / success states.
- Fully keyboard-navigable; responsive 375 → 1440px; light & dark.
- Works offline (installable PWA + runs from `file://` / a downloaded zip).

## Transaction model (canonical intermediate representation)

```
Transaction {
  date: ISO 'YYYY-MM-DD'      // normalised
  amount: number              // signed; negative = outflow/debit
  payee: string
  memo: string
  category?: string
  checkNumber?: string
  fitid: string               // deterministic hash for OFX de-dup
}
```
All importers parse *into* this model; all exporters serialise *from* it.

## Success criteria ("done")
- A user can take a real bank CSV and produce an OFX or QIF file that imports
  cleanly into the target app, configuring date order and amount handling
  through the UI — with a correct live preview at every step.
- Round-trips are sane: OFX→CSV→OFX preserves date, amount, payee, memo.
- De-duplication works: re-importing the same OFX into an app does not create
  duplicates (stable FITIDs).
- All core codec logic (CSV/OFX/QIF parse + serialise, date & amount
  normalisation, FITID hashing, format detection) is covered by automated
  tests, all green.
- Bad/empty/huge/malformed inputs never crash the app; they surface a clear,
  actionable message.

## Non-goals (v1)
- **PDF statement parsing / OCR.** (Input is delimited/financial *export*
  files, not scanned statements.)
- Merging multiple files into one (single file in → single file out).
- Bank-specific scrapers or live bank connections (no OAuth, no Plaid).
- Cloud sync, accounts, or any server component.
- Automatic category inference / transaction enrichment.
- TCX/MT940/CAMT/CODA exotic banking formats (CSV/OFX/QFX/QIF only).

## Primary user flows
1. **CSV → OFX for YNAB:** load CSV → confirm auto-detected mapping → pick
   "OFX" output → download → import into YNAB (de-dupes via FITID).
2. **QIF → CSV for a spreadsheet:** load QIF → pick "CSV" + a preset → download.
3. **European bank CSV (`;` delimiter, `1.234,56`) → QIF for GnuCash:** load →
   tool auto-detects `;` and comma-decimal → adjust if needed → export QIF.
