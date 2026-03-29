# UI Component Guidelines (Scandinavian Trust)

## Design Tokens
- **Radius:** Standardize on softer corners (12px for inputs/pills, 16px for cards/containers).
- **Shadows:** Use soft, trust-driven shadows (`shadow-inhumans`) to provide depth without harsh contrast.
- **Palette:** Strictly adhere to the Warm Minimalism theme (Warm Off-White, Deep Charcoal, Muted Teal/Green/Red).

## Component Rules
- **Breathable Layouts:** Ensure generous padding and margin to reduce cognitive load and trading anxiety.
- **Data Clarity:** Present financial data simply and calmly. Use monospace for precision but maintain a human feel.
- **Progressive Disclosure:** Components should start simple. Use "Details" or "Deep Dive" triggers to reveal complex analytics only when requested.
- **Shared UI primitives:** `src/components/ui/*`.
- **Product-level composites:** `src/components/app/*`.

## Accessibility Baseline
- Keyboard reachable controls.
- Visible focus states.
- Semantic labels for interactive inputs/buttons.
- Minimum 44x44 interaction targets on mobile surfaces.

## States
Every user-facing component/screen must account for:
- loading
- empty
- error
- success
