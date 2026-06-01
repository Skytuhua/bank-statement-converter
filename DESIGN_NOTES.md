# Design Notes

My own-words summary of the design system Phase 4 implements to. The binding
detail lives in `design-system/MASTER.md` and `design-system/pages/*.md`; this
is the human-readable contract.

## The feel
A calm, precise, **Swiss-modernist financial tool** — not a marketing page.
Lots of white space, a strict 8px rhythm, high contrast, and exactly one
accent. It should read as trustworthy and serious, the way a bank's data
export *should* look. Nothing playful, no gradients, no glassmorphism.

## Layout
App shell: a slim header (wordmark "bank-statement-converter", a small
"Local · nothing uploaded" privacy pill, and a light/dark toggle), a horizontal
**stepper** (Load → Map → Preview → Export), the active step's panel inside a
centered `max-w-[1120px]` container, and a slim footer (MIT, source link,
privacy line). Each step has one clear primary action.

## Color
Light mode is primary (dense tables read best on white).
- **Background** `#F8FAFC`, **cards** `#FFFFFF`, **borders** `#E2E8F0`.
- **Ink** `#020617`, **headings** `#0F172A`, **muted text** `#64748B`.
- **Primary** (buttons, links, focus ring) trust-blue `#1E40AF` (hover
  `#1D4ED8`); white text on it.
- **Accent** premium gold `#A16207`, used sparingly for highlights only.
- **Green `#059669` / red `#DC2626` are reserved for amounts** — inflow vs
  outflow. That's information, not decoration, so the single-accent rule holds.
- Dark mode mirrors this on `#0F172A` surfaces with lightened primary `#3B82F6`.

## Typography
**IBM Plex Sans** for everything UI; **IBM Plex Mono** for amounts, the preview
table, and raw-file views. Amounts use tabular figures and right-align. Headings
500–600 weight; body 400 at ~0.95rem. Fonts are loaded with a system fallback
so the tool still works fully offline.

## Spacing & shape
8px base unit (4/8/12/16/24/32/48/64). Card radius 8px, inputs 6px, privacy
pill fully rounded. Borders do the structural work; just one subtle elevation
shadow for raised cards. No decorative shadows.

## Motion
Subtle 150–250ms hover/focus transitions; a dropzone that tints on drag-over; a
short skeleton/pulse during parsing (never a frozen UI). All non-essential
motion is disabled under `prefers-reduced-motion`.

## Components I'll need
Stepper, dropzone card, segmented control (output format), labelled select,
labelled text input, toggle/checkbox, collapsible panel (OFX account details),
dense data table with sticky header, summary stat row, warning badge, primary/
secondary/ghost buttons, privacy pill, light/dark toggle, toast/confirmation.

## Anti-patterns to actively avoid
Emojis as icons (use inline SVG), AI purple/pink gradients, neon, low-contrast
grey-on-grey, `z-index: 9999` hacks, infinite decorative animation, uncontrolled
inputs, frozen UI with no feedback, and — above all — **any network request at
runtime**.

## Pre-delivery checklist
Carried verbatim in MASTER.md; verified explicitly in Phase 5: SVG icons,
cursor/press feedback, hover/focus/disabled states, ≥4.5:1 contrast (both
modes), visible focus ring, reduced-motion, responsive at 375/768/1024/1440,
loading/empty/error/success states, offline fonts.
