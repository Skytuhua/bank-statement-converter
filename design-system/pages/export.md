## OVERRIDE — Export step (MASTER governs unless noted)
- Output format segmented control (CSV / OFX / QIF) + a per-app **preset** select (YNAB, Actual, GnuCash, Quicken, OFX generic, Custom).
- Collapsible 'Account details' panel (OFX only): account id, bank/routing id, account type, currency — all optional, controlled inputs.
- Big primary 'Download .<ext>' button with the resulting filename shown; success confirmation after download. No network.

## Design System: bank-statement-converter

### Pattern
- **Name:** App Store Style Landing
- **Conversion Focus:** Show real screenshots. Include ratings (4.5+ stars). QR code for mobile. Platform-specific CTAs.
- **CTA Placement:** Download buttons prominent (App Store + Play Store) throughout
- **Color Strategy:** Dark/light matching app store feel. Star ratings in gold. Screenshots with device frames.
- **Sections:** 1. Hero with device mockup, 2. Screenshots carousel, 3. Features with icons, 4. Reviews/ratings, 5. Download CTAs

### Style
- **Name:** AI-Native UI
- **Mode Support:** Light ✓ Full | Dark ✓ Full
- **Keywords:** Chatbot, conversational, voice, assistant, agentic, ambient, minimal chrome, streaming text, AI interactions
- **Best For:** AI products, chatbots, voice assistants, copilots, AI-powered tools, conversational interfaces
- **Performance:** ⚡ Excellent | **Accessibility:** ✓ WCAG AA

### Colors
| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary | `#2563EB` | `--color-primary` |
| Secondary | `#3B82F6` | `--color-secondary` |
| Accent/CTA | `#F97316` | `--color-accent` |
| Background | `#F8FAFC` | `--color-background` |
| Foreground | `#1E293B` | `--color-foreground` |

### Typography
- **Heading:** Inter
- **Body:** Inter
- **Mood:** Elegant + Gradient-friendly

### Key Effects
Typing indicators (3-dot pulse), streaming text animations, pulse animations, context cards, smooth reveals

### Avoid (Anti-patterns)
- Inconsistent styling
- Poor contrast ratios

### Pre-Delivery Checklist
- [ ] No emojis as icons (use SVG: Heroicons/Lucide)
- [ ] cursor-pointer on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard nav
- [ ] prefers-reduced-motion respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px