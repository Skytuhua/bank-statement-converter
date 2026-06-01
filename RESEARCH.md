# Research & Product Selection

This document records the market research and the decision behind
**bank-statement-converter**.

## One-paragraph pitch

People constantly export transactions from their bank as a CSV, OFX/QFX or QIF
file, then try to import them into budgeting and accounting software (YNAB,
Actual Budget, GnuCash, Quicken, MoneyMoney) — only to discover the file is in
the *wrong* format, has the date in the wrong order, splits debits and credits
into two columns when the app wants one signed amount, or imports the memo as
the payee. The easy online converters that fix this require **uploading your
entire bank history to a stranger's server**; the private options are paid
desktop apps or Python command-line tools that ordinary people can't use.
**bank-statement-converter** closes that gap: a free, no-install, open-source
web tool that converts and cleans bank export files **entirely in your
browser** — your transactions never leave your computer.

## Market scan

Demand was validated through three parallel research passes (fan-out web
search across Reddit, StackExchange, official app docs, GitHub, and competitor
sites), then the findings were scored against a written rubric. Full notes
live in `BUILD_LOG.md`. The candidate shortlist:

| Idea | Niche | Demand | Doable | Demonstrable | Scope | Legal/Ethical |
|------|:---:|:---:|:---:|:---:|:---:|:---:|
| **Bank statement converter** | 9 | **9** | **9** | 8 | **9** | PASS |
| iCalendar (.ics) workbench | 8 | 7 | 7 | 8 | 7 | PASS |
| GPX track workbench | 6 | 8 | 6 | 9 | 5 | PASS |

### Why the bank statement converter won

- **Strong, evidenced, recurring demand.** Paid desktop incumbents have
  survived for years (ProperSoft CSV2OFX ~$30, MoneyThumb), a whole ecosystem
  of Python tools exists (`csv2ofx`, `ofxstatement` with per-bank plugin
  libraries), and budgeting communities repeatedly hit the same import pains:
  - Actual Budget #521 — users "resort to manually downloading and
    transforming CSV data" because of payee/notes field mapping bugs.
  - YNAB's own docs warn imports fail on bad date columns and require precise
    Date/Payee/Outflow/Inflow formatting.
  - Quicken docs address signed-amount vs debit/credit confusion explicitly.
- **The privacy wedge is the clearest of any candidate.** Bank transaction
  data is exactly what people *don't* want to upload. Online converters are
  almost all server-side uploads, and paid converters now market
  "zero-retention," "data wiped from RAM," "deleted within 24h," SOC 2 — i.e.
  vendors are selling *reassurance* about a risk this tool eliminates entirely.
  The only genuinely private options today are developer-only CLIs. A free,
  no-install, **nothing-leaves-the-browser** converter occupies the empty
  "easy AND private" quadrant.
- **Fully client-side feasible with no network dependency at all.** Unlike the
  GPX idea (map tiles leak location to tile servers) the converter needs *zero*
  network — so "nothing is uploaded" is airtight, trivially auditable, and the
  tool works fully offline.
- **Sharp, finishable scope.** The core is one clear pipeline: load file →
  detect format → map columns / dates / amounts → preview → export. No binary
  formats, no maps, no timezone database.

### Why the others lost

- **GPX workbench:** strong demand but [gpx.studio](https://gpx.studio) is a
  free, open-source, *already client-side* incumbent that does merge/trim/
  simplify/re-time. The privacy angle is already claimed, the moat is weak, and
  FIT (binary) + map tiles + 100k-point performance push it toward over-reach.
- **iCalendar workbench:** real demand, but correct timezone handling
  (Windows↔IANA TZID mapping, VTIMEZONE round-tripping, DST, floating times) is
  genuinely hard, and "everything must actually work" makes that risk costly.

## Target user

A privacy-conscious person — or a bookkeeper/accountant handling clients'
data — who has a bank export file in one format and needs it in another to
import into their budgeting/accounting app, and who is uncomfortable uploading
financial data to an anonymous website. Secondary: plain-text-accounting and
self-hosting enthusiasts who want a tool they can run offline and audit.

## The core problem

1. **Format mismatch** — bank exports CSV/OFX/QFX/QIF; the target app wants a
   *different* one of those (most often the bank gives CSV and the app wants
   OFX/QIF so it can de-duplicate on import).
2. **Field/shape mismatch** — wrong date order, two amount columns instead of
   one signed column (or vice-versa), currency symbols and thousands
   separators, payee vs. memo confusion, European `1.234,56` decimals.
3. **Privacy** — the convenient fixes for (1) and (2) require handing your
   financial history to a server.

## Why it's doable here

- CSV parsing: PapaParse (mature, browser-native).
- QIF: a flat, line-oriented text format — pure string assembly/parsing.
- OFX: legacy 1.x is SGML, 2.x is XML; generation is template emission and
  parsing uses a small tolerant tokenizer — all pure JS, no server.
- Everything else (column mapping, date/amount normalisation, sign handling,
  de-duplication FITIDs via a deterministic hash, preview, download) is
  in-memory data transformation. The File API loads files locally and Blob
  downloads save them locally — **genuinely zero upload**.

## Sources

Representative evidence gathered during research (non-exhaustive):

- Actual Budget field-mapping issue — https://github.com/actualbudget/actual/issues/521
- YNAB CSV formatting docs — https://support.ynab.com/en_us/formatting-a-csv-file-an-overview-BJvczkuRq
- Quicken CSV import (signed amount) — https://info.quicken.com/win/import-transactions-from-csv-file
- `csv2ofx` (Python, per-bank mappings) — https://github.com/reubano/csv2ofx
- `ofxstatement` (per-bank plugin ecosystem) — https://github.com/kedder/ofxstatement
- ProperSoft CSV2OFX (paid desktop incumbent) — https://www.propersoft.net/convert-csv-to-ofx/
- MoneyThumb (paid converter) — https://www.moneythumb.com/convert-to-finance-software/
- Example upload-based online converters (the privacy problem) —
  accountingconverter.com, csvconverter.biz, financefileconverter.com
