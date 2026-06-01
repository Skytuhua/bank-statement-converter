# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] — 2026-06-01

Usability polish — easier and clearer for first-time, non-technical users. No
change to how files are converted.

### Fixed
- The progress steps at the top no longer show a cut-off **"Pre…"** on desktop —
  the **Preview** step now reads in full.

### Changed
- **Clearer, more helpful messages when a file can't be used.** If you pick a
  **PDF, spreadsheet (Excel/Numbers), image, or zip** by mistake, the app now
  tells you exactly what happened and what to do instead (e.g. "look for Export
  or Download and choose CSV or OFX") rather than a generic "unrecognised file".
- Added a one-line plain-language hint under the **Delimiter** option explaining
  it's "the character between columns — auto-detected".
- A friendlier message when a file can't be read.

### Added
- Unit tests covering the new file-guidance messages.

## [1.0.0] — 2026-06-01

First public release.

### Added
- **Client-side conversion** between CSV, OFX/QFX and QIF bank statement files —
  everything runs in the browser, nothing is uploaded.
- **Smart detection** of file format and, for CSV, the delimiter, header row,
  decimal separator, and column roles (date / payee / memo / amount, or
  separate debit & credit columns).
- **Column mapping UI** with date-format selection (incl. ambiguity warnings),
  decimal/thousands separators, currency stripping, sign flipping, and
  debit/credit-to-signed-amount combining.
- **Live preview** with inflow / outflow / net totals and a per-row parsing
  warnings filter.
- **Output presets** for YNAB, Actual Budget, GnuCash (CSV), generic CSV,
  OFX 2.x, and Quicken QIF, with optional OFX account metadata. OFX exports
  include deterministic `FITID`s so finance apps de-duplicate on import.
- **Privacy & offline:** zero runtime network requests (audited), self-hosted
  fonts, installable PWA, and a fully static build that runs from `file://`.
- Light & dark themes, WCAG 2.1 AA accessibility, responsive layout, keyboard
  navigation, and `prefers-reduced-motion` support.
- 198 automated tests, including a 125-case adversarial robustness suite.

[1.0.0]: https://github.com/Skytuhua/bank-statement-converter/releases/tag/v1.0.0
