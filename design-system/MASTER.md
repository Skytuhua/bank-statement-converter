## Design System: bank-statement-converter (CANONICAL — binding source of truth)

This is the binding contract Phase 4 implements to. Page overrides in
`design-system/pages/*.md` win where they differ; otherwise MASTER governs.

### Pattern
- **Name:** Swiss Modernism workbench — strict 12-column grid, single column of
  content centered in a `max-w` container, mathematical 8px spacing.
- **Layout:** A focused tool, not a marketing page. App shell = slim header
  (wordmark + privacy badge + light/dark toggle) → a **horizontal stepper**
  (Load → Map → Preview → Export) → the active step's panel → slim footer.
- **Focus:** One clear primary action per step ("Choose file", "Download .ofx").
  Minimal chrome, generous whitespace, no decoration that isn't information.

### Style
- **Name:** Minimalism & Swiss Style / Swiss Modernism 2.0
- **Keywords:** Clean, spacious, functional, high contrast, geometric,
  grid-based, single accent, essential-only. WCAG AAA target.
- **Mode Support:** **Light = primary**, Dark = full. (Light chosen because the
  core surface is dense financial tables that read best on white.)
- **Radius:** small and consistent — `--radius: 8px` (cards), `6px` (inputs),
  `9999px` only for the privacy pill. No heavy rounding.
- **Borders over shadows:** prefer 1px borders + one subtle elevation shadow for
  raised cards. No decorative drop shadows.

### Colors (light = primary)
| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary (brand / buttons / links) | `#1E40AF` | `--color-primary` |
| Primary hover | `#1D4ED8` | `--color-primary-hover` |
| On Primary | `#FFFFFF` | `--color-on-primary` |
| Ink / Foreground | `#020617` | `--color-foreground` |
| Heading ink | `#0F172A` | `--color-heading` |
| Background (app) | `#F8FAFC` | `--color-background` |
| Card / surface | `#FFFFFF` | `--color-card` |
| Muted surface | `#E8ECF1` | `--color-muted` |
| Muted foreground | `#64748B` | `--color-muted-foreground` |
| Border | `#E2E8F0` | `--color-border` |
| Ring (focus) | `#1E40AF` | `--color-ring` |
| Accent (premium gold, sparing highlights) | `#A16207` | `--color-accent` |
| **Inflow / positive (data only)** | `#059669` | `--color-inflow` |
| **Outflow / negative (data only)** | `#DC2626` | `--color-outflow` |
| Destructive | `#DC2626` | `--color-destructive` |

**Dark mode:** Background `#0F172A`, Card `#0F1B33`, Muted `#1E293B`,
Foreground `#F8FAFC`, Heading `#FFFFFF`, Border `rgba(255,255,255,0.10)`,
Primary lightens to `#3B82F6`, inflow `#34D399`, outflow `#F87171`.

*Single accent rule:* blue is the only interactive accent. Green/red are
**reserved for amount semantics** (inflow/outflow) — that's information, not
decoration, so it doesn't violate the single-accent principle.

### Typography
- **Heading & Body:** **IBM Plex Sans** (300;400;500;600;700) — "Financial
  Trust" pairing; conveys trust, excellent for data.
- **Numeric / code / file content:** **IBM Plex Mono** — tabular figures for
  amounts and the raw-file/preview monospace views.
- **CSS import:**
```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
```
- **Tailwind:** `sans: ['IBM Plex Sans', ...]`, `mono: ['IBM Plex Mono', ...]`.
- Amounts use `font-variant-numeric: tabular-nums` and right-alignment.
- Scale: H1 `clamp(1.75rem,4vw,2.25rem)/600`, H2 `1.25rem/600`,
  body `0.95rem/400`, small `0.8125rem`, mono table `0.8125rem`.

### Spacing & grid (mathematical, 8px base)
- `--base-unit: 8px`; spacing tokens 4/8/12/16/24/32/48/64.
- Content container `max-width: 1120px`, gutters 16–24px.
- 12-column conceptual grid; mapping form uses a responsive 1→2→3 column grid.

### Key Effects
- Subtle hover (150–250ms ease) on interactive elements; color/bg transitions.
- One elevation shadow for cards: `0 1px 2px rgba(2,6,23,.06), 0 1px 3px rgba(2,6,23,.10)`.
- Dropzone: dashed border that brightens + faint primary tint on drag-over.
- Skeleton/`animate-pulse` for the brief parse step; never a frozen UI.
- Respect `prefers-reduced-motion`: disable non-essential transitions.

### Avoid (Anti-patterns) — enriched
- Playful / cutesy design; rounded "fun" everything. This is a finance tool.
- **AI purple/pink gradients**, neon, glassmorphism. No gradients at all.
- Emojis used as icons — use inline **SVG** icons (Lucide-style, drawn inline).
- Unclear/implied costs or fake "upgrade" gates — the tool is fully free.
- Decorative infinite animations (`animate-bounce`/`spin` on non-loaders).
- Low-contrast grey-on-grey text; muted text must still clear 4.5:1.
- `z-index: 9999` hacks — manage stacking contexts deliberately.
- Frozen UI during work — always show a loading/skeleton state.
- Uncontrolled form inputs — every input is controlled (`value`+`onChange`).
- Any network call. The page must make **zero** runtime requests (fonts are
  self-hosted / system-fallback so the tool works fully offline).

### React stack notes (from --stack react)
- Controlled components for all form inputs (`value` + `onChange`).
- `useState` for local UI state; a small reducer/store for the conversion model.
- Let React batch updates; avoid `flushSync`. Derive the preview with `useMemo`.
- Keep `src/core` pure & framework-free (already enforced architecturally).

### Pre-Delivery Checklist (run as an explicit pass in Phase 5)
- [ ] No emojis as icons (inline SVG only)
- [ ] `cursor-pointer` on all clickable elements; press/active feedback
- [ ] Hover + focus + disabled states on every interactive element
- [ ] Text contrast ≥ 4.5:1 (light AND dark)
- [ ] Visible keyboard focus ring (`--color-ring`) on every focusable element
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive at 375 / 768 / 1024 / 1440 px
- [ ] Loading/empty/error/success states for every async/data surface
- [ ] Fonts load offline (no blocking network request at runtime)
