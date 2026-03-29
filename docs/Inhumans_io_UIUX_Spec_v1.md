# Inhumans.io — UX/UI Design Specification

### Product Design Document · Version 2.0 · March 2026

---

> **Design Philosophy:** Inhumans.io is not a social network with a trading skin. It is a **trust infrastructure** for trading creators. Every UX decision must answer one question: *does this make the creator more credible and the follower more confident?* If it doesn't, it doesn't ship.

---

## 1. Art Direction & Brand Tone

### The One-Word Brand Feeling

**Clarity.**
Not "intensity." Not "power." Clarity. A creator on Inhumans.io is simplified and grounded through broker-verified truth. The product must feel like a quiet, intelligent assistant that reduces the anxiety of trading.

### Aesthetic Reference Points

| Reference | What We Take |
|---|---|
| **Scandinavian Minimalism** | Warm off-whites, breathable layouts, human-centered focus |
| **Linear.app** | Purposeful interaction, precision without intensity |
| **Robinhood (early)** | Making finance feel accessible, not intimidating |
| **Stripe Dashboard** | Trust through design quality and clarity |

### What We Are NOT

- Not a dark-terminal aesthetic (no harsh blacks, no neon)
- Not a social media hype-machine (no aggressive "trending" signals)
- Not an intimidating Bloomberg clone
- Not cluttered or data-dense without purpose

### Tone

- **Light mode is default** — uses warm off-whites to reduce eye strain and anxiety.
- **Breathable and Human** — generous white space and clear visual hierarchy.
- **Muted, Purposeful Color** — accents are used only to signal trust (Teal) or outcome (Muted Green/Red).
- **Soft Contrast** — deep charcoal text on warm surfaces, never pure black on pure white.

### Color Palette

```
Background:       #F9F8F6   (Warm Off-White)
Surface:          #FFFFFF   (Pure White Cards)
Surface-Nested:   #F3F2F0   (Nested elements, inputs)
Surface-Active:   #EBEAE7   (Hover states)
Border:           #E5E4E2   (Soft Neutral Border)
Divider:          #F0EFEF

Text:             #262626   (Deep Charcoal - Primary)
Text-muted:       #6B7280   (Secondary)
Text-faint:       #9CA3AF   (Tertiary, placeholders)

Primary (Teal):   #0D9488   (Stable, trust-driven teal)
Primary-hover:    #0F766E
Profit (Green):   #10B981   (Muted Green)
Loss (Red):       #F43F5E   (Muted Red)
Warning:          #F59E0B   (Muted Amber)
Neutral:          #60A5FA   (Soft Blue)
```

### Typography

```
Display Font:  'Plus Jakarta Sans' — weight 700/800
               Used for: Headings, page titles, trust signals
               Feel: Friendly, authoritative, modern

Body Font:     'Inter' — weight 400/500/600
               Used for: All body copy, labels, UI elements
               Feel: Highly legible, clean, calm

Mono Font:     'JetBrains Mono' — weight 400/600
               Used for: Prices, quantities, trade data
               Feel: Precision data without the 'hacker' vibe
```

---

## 2. Design System Tokens

### Surface Hierarchy

```
Layer 0 — Page background    #F9F8F6  ← the breathable "canvas"
Layer 1 — Cards/panels       #FFFFFF  ← content containers (12-16px radius)
Layer 2 — Nested surfaces    #F3F2F0  ← inputs, inner cards
Layer 3 — Hover/active       #EBEAE7  ← subtle interaction feedback
Layer 4 — Borders             #E5E4E2  ← soft separation
```

### Type Scale (Web App — Breathable)

```
--text-xs:    12px  →  Timestamps, status chips, micro labels
--text-sm:    14px  →  Buttons, nav links, form labels
--text-base:  16px  →  Body copy, descriptions
--text-lg:    20px  →  Section headings
--text-xl:    28px  →  Page titles
--text-data:  24px mono → P&L numbers, trade prices
```

### Radius System (Softer & More Human)

```
--radius-sm:   6px   →  Badges, chips
--radius-md:   10px  →  Inputs, smaller buttons
--radius-lg:   16px  →  Standard cards, dashboards
--radius-xl:   20px  →  Modal sheets, hero sections
--radius-full: 999px →  Avatars, status pills
```

### Shadow System (Trust Signals)

```
--shadow-soft: 0 4px 12px rgba(0, 0, 0, 0.03)     ← Default card state
--shadow-elevated: 0 10px 24px rgba(0, 0, 0, 0.06) ← Hover / Action focus
```

---

## 3. Shared Components Library (Scandinavian Overhaul)

### 6.1 Verified Trade Card

The core unit of trust. Reimagined as a calm, breathable component.

**Visual Treatment:**
- **White Background:** Pure white (`#FFFFFF`) with `shadow-soft`.
- **Rounded Corners:** 16px radius for a human, modern feel.
- **Subtle Indicators:** Replace the high-contrast sidebar with a minimal colored chip or a 2px left border.
- **Verified Badge:** A clean teal checkmark with a soft background.

### 6.2 KPI Cards & Bento Dashboards

- **Structured Clarity:** Every card answers one question clearly.
- **Monospace Data:** Numbers use JetBrains Mono for precision but are sized generously.
- **Muted Colors:** P&L data uses muted green/red to convey truth without inducing panic.

### 6.7 Copy Trade Bottom Sheet

**Design Shift:**
- **Calming Interaction:** Uses a 20px radius and significant padding.
- **Supportive Copy:** Single-sentence warnings that respect user intelligence.
- **Muted Actions:** Primary buttons use the trust-teal palette with soft transitions.

---

## 7. Motion & Interaction Principles

### The Core Rule

**Subtle & Purposeful.**
Animations must reinforce understanding, never distract. Use soft fades and gentle slide-ins.

### Specific Animations

**Progressive Disclosure:**
- Elements reveal themselves with a soft 300ms fade-in.
- Detail sections expand with a fast-entry, gentle-settle curve.

---

*Document version 2.0 · Inhumans.io Product Design · March 2026*
*Owner: Founder · Next review: April 10, 2026*
