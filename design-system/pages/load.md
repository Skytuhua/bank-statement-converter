## OVERRIDE — Load step (MASTER governs unless noted)
- Hero of the empty state: large dashed **dropzone** card centered, IBM Plex Sans H1 + one-line description, primary 'Choose file' button, and a quiet 'or load a sample file' link.
- A reassurance row directly under the dropzone: small lock SVG + 'Your file is processed entirely in your browser. Nothing is uploaded.' in muted-foreground.
- Accept .csv .txt .ofx .qfx .qif; show detected format as a chip once loaded.
- States: idle / drag-over (primary tint) / parsing (skeleton) / error (clear message, retry).

## Design System: bank-statement-converter

### Pattern
- **Name:** Before-After Transformation
- **Conversion Focus:** Visual proof of value. 45% higher conversion. Real results. Specific metrics. Guarantee offer.
- **CTA Placement:** After transformation reveal + Bottom
- **Color Strategy:** Contrast: muted/grey (before) vs vibrant/colorful (after). Success green for results.
- **Sections:** 1. Hero (problem state), 2. Transformation slider/comparison, 3. How it works, 4. Results CTA

### Style
- **Name:** Flat Design
- **Mode Support:** Light ✓ Full | Dark ✓ Full
- **Keywords:** 2D, minimalist, bold colors, no shadows, clean lines, simple shapes, typography-focused, modern, icon-heavy
- **Best For:** Web apps, mobile apps, cross-platform, startup MVPs, user-friendly, SaaS, dashboards, corporate
- **Performance:** ⚡ Excellent | **Accessibility:** ✓ WCAG AAA

### Colors
| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary | `#2563EB` | `--color-primary` |
| On Primary | `#FFFFFF` | `--color-on-primary` |
| Secondary | `#3B82F6` | `--color-secondary` |
| Accent/CTA | `#D97706` | `--color-accent` |
| Background | `#F8FAFC` | `--color-background` |
| Foreground | `#0F172A` | `--color-foreground` |
| Muted | `#F1F5FD` | `--color-muted` |
| Border | `#E4ECFC` | `--color-border` |
| Destructive | `#DC2626` | `--color-destructive` |
| Ring | `#2563EB` | `--color-ring` |

*Notes: Folder blue + file amber*

### Typography
- **Heading:** Inter
- **Body:** Inter
- **Mood:** Professional + Clean hierarchy

### Key Effects
No gradients/shadows, simple hover (color/opacity shift), fast loading, clean transitions (150-200ms ease), minimal icons

### Avoid (Anti-patterns)
- Excessive decoration
- Complex shadows
- 3D effects

### Pre-Delivery Checklist
- [ ] No emojis as icons (use SVG: Heroicons/Lucide)
- [ ] cursor-pointer on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard nav
- [ ] prefers-reduced-motion respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px