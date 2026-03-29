# Implementation Plan: Scandinavian Minimalism Pivot ("Inhumans")

This plan outlines the transformation of the Inhumans platform from its current high-contrast dark aesthetic to a "Scandinavian Trust" design system: warm minimalism, clarity-first UX, and human-centered fintech accents.

## 1. Design System Tokens (`globals.css`)
We will redefine the Tailwind 4 theme to establish the new color palette and spacing rhythm.

- **Background:** `#F9F8F6` (Warm Off-White).
- **Text:** `#262626` (Deep Charcoal).
- **Primary/Trust:** `#0D9488` (Teal 700ish - stable and muted).
- **Profit:** `#10B981` (Muted Green).
- **Loss:** `#F43F5E` (Muted Red).
- **Neutral/Soft Blue:** `#60A5FA` (Muted Blue).
- **Surfaces:** Pure white cards with very soft shadows (`shadow-sm`) and subtle borders (`border-neutral-200`).
- **Typography:** Shift to 'Plus Jakarta Sans' (friendly but authoritative) or 'Inter'.

## 2. Global Layout & Navigation (`ProtectedAppLayout.tsx`)
The structural frame must feel breathable and quiet.

- **Header:** White/Transparent backdrop with a very subtle bottom border.
- **Sidebar:** Light-gray surface or pure whitespace with subtle dividers.
- **Navigation:** Icons will be smaller, less "energetic," and labels will use `text-sm` with charcoal coloring.
- **Progressive Disclosure:** Ensure the layout focuses on one primary question/action at a time.

## 3. Core Component Overhaul
### Verified Trade Card (`VerifiedTradeCard.tsx`)
- **Container:** Rounded corners (16px), soft shadow, white background.
- **Visuals:** Replace the dark "side bar" with a more subtle indicator or a simple colored chip.
- **Verified Badge:** A clean, minimal teal checkmark (trust signal).
- **Data:** Use structured, digestible bento-style layouts within the card.

### KPI Cards & Metrics (`KpiCard`, `PnLNumber`)
- Remove high-contrast pulses.
- Use muted colors for P&L.
- Soften the typography and increase padding.

## 4. Feature Pages Transformation
### Dashboards & Feeds
- **Bento Grid:** Maintain the structure but soften the borders and backgrounds.
- **Live Feed:** Implement a "visually calm" stream with gentle animations for new entries.
- **Analytics:** Simplify charts; remove unnecessary grid lines and high-contrast labels.

## 5. Interaction Design
- **Animations:** Implement soft fades and gentle slide-ins using `framer-motion` or standard Tailwind transitions.
- **Progressive Disclosure:** Refactor the Dashboard to show basic stats first, with "Deep Dive" buttons to reveal complexity.

## Proposed Changes

### Step 1: `src/app/globals.css`
Replace dark-mode variables with the Scandinavian palette.

### Step 2: `src/components/ui/VerifiedTradeCard.tsx`
Redesign the core "unit of trust" to be a soft, light-mode card.

### Step 3: `src/app/(protected)/app/layout.tsx`
Update the navigation and layout frame to be minimal and white-centric.

### Step 4: `src/app/(protected)/app/page.tsx`
Update the bento-grid dashboard to use the new surface and shadow tokens.

## Verification & Testing
- **Contrast Check:** Ensure the charcoal text meets WCAG AA on the warm off-white background.
- **Responsive Audit:** Verify the "breathable" spacing holds up on mobile.
- **Performance:** Ensure animations remain purposeful and don't introduce lag.
