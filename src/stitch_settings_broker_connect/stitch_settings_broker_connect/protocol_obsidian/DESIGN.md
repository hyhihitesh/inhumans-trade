# Design System Strategy: High-Precision Trust Infrastructure

## 1. Overview & Creative North Star: "The Digital Architect"
This design system is built to convey **Undeniable Authority**. In a market of volatility and "creator hype," this interface must feel like a high-end Swiss watch or a precision-engineered trading terminal. 

**The Creative North Star: The Sovereign Vault.**
We are moving away from the "bubbly" consumer web. Our aesthetic is defined by **Organic Brutalism**—the intersection of raw, dark-first industrialism and surgical digital precision. We break the "template" look through intentional asymmetry: imagine a dense, mono-spaced data sidebar contrasting against a wide, airy editorial display area. We use "High-Contrast Scale" where massive `Display-LG` numbers sit inches away from tiny, meticulous `Label-SM` metadata.

---

## 2. Colors & Tonal Architecture
We do not use color for decoration; we use it for **signal**. Our palette is a warm, near-black monochrome base that feels "expensive" rather than "empty."

### The "No-Line" Rule
To achieve a premium, seamless feel, **prohibit 1px solid borders for primary sectioning.** Instead of drawing a box around a sidebar, define it by shifting from `surface` (#131312) to `surface_container_low` (#1c1c1a). Boundaries are felt, not seen.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers stacked in a dark room.
- **Base Level:** `background` (#131312) - The floor of the application.
- **The Work Deck:** `surface_container` (#20201e) - Primary content areas.
- **The Focus Card:** `surface_container_high` (#2a2a29) - Elements that need to pop.
- **The Interaction Layer:** `surface_bright` (#3a3938) - Hovers and active states.

### The Glass & Gradient Rule
For "Verified" creator badges or primary CTAs, use a **Teal-to-Transparent Surface Gradient.**
*   **Signature Gradient:** `primary` (#57f1db) at 20% opacity fading into `primary_container` (#2dd4bf) at 5% opacity. This creates a "holographic" depth that flat hex codes cannot replicate.

---

## 3. Typography: Editorial Authority
Our type system is a dialogue between industrial power (`Cabinet Grotesk`) and digital utility (`Satoshi` / `JetBrains Mono`).

*   **Display & Headlines (Cabinet Grotesk):** Massive, heavy (800 weight), and tracked tightly (-2%). Used for creator names, large balances, and "Undeniable" statements.
*   **Body & UI (Satoshi):** Highly legible, used in 400 for descriptions and 600 for navigation.
*   **Data (JetBrains Mono):** The "Engineer’s Choice." Use this for all trade prices, timestamps, and contract addresses. It signals that the data is raw, untampered, and precise.

| Level | Token | Font | Size | Character Spacing |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | Cabinet Grotesk | 3.5rem | -0.04em |
| **Headline**| `headline-md`| Cabinet Grotesk | 1.75rem | -0.02em |
| **Body**    | `body-md`    | Satoshi | 0.875rem | 0 |
| **Data**    | `label-sm`   | JetBrains Mono | 0.6875rem | +0.02em |

---

## 4. Elevation & Depth
In this system, depth is achieved through **Tonal Layering** and **Ambient Light**, not structural shadows.

*   **The Layering Principle:** Place a `surface_container_lowest` (#0e0e0d) card inside a `surface_container` (#20201e) layout to create a "recessed" look, making the content feel protected and "vaulted."
*   **Ambient Shadows:** For floating modals, use a massive 64px blur with `on_surface` (#e5e2df) at 4% opacity. It shouldn't look like a shadow; it should look like the element is subtly occluding light.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use `outline_variant` (#3c4a46) at **15% opacity**. It should be a whisper, not a scream.
*   **Glassmorphism:** Navigation bars must use `surface` with a 12px `backdrop-blur`. This allows the vibrant teal gradients of the content to "ghost" through the UI as the user scrolls.

---

## 5. Components & Precision Primitives

### Buttons
*   **Primary:** Solid `primary_container` (#2dd4bf) with `on_primary` (#003731) text. No border. 10px radius.
*   **Secondary:** Ghost style. `outline` at 20% opacity, white text. On hover, the background fills to 10% `on_surface`.
*   **Trade Action:** For "Profit" actions, use `tertiary` (#61f587) with a subtle glow (2px blur).

### Cards & Lists
*   **Forbid Divider Lines:** Separate list items using `spacing.4` (0.9rem) of vertical white space or a 1-step shift in `surface_container` tokens. 
*   **Radii:** All containers must use the `DEFAULT` (0.5rem/10px) radius to maintain a consistent "instrument panel" feel.

### The "Verified" Badge
*   **Style:** A pill-shaped chip using `primary` text. The background is a radial gradient: `primary` at 10% opacity center to 0% at the edges. This creates a "glow" that signifies trust.

### Inputs
*   **State:** Default state is `surface_container_lowest`. Active state adds a `px` "Ghost Border" of `primary` at 40% opacity. 

---

## 6. Do’s and Don’ts

### Do
*   **DO** use JetBrains Mono for all numeric values. It reinforces the "Precision Engineering" tone.
*   **DO** use asymmetrical layouts. A 70/30 split is more "Editorial" and "High-End" than a centered 50/50 split.
*   **DO** lean into the "Warm Dark" (#0a0a09). It prevents the UI from feeling "cold" or "cheaply OLED."

### Don’t
*   **DON'T** use 100% white (#ffffff). It breaks the dark-first immersion. Use `on_surface` (#e8e7e4).
*   **DON'T** use standard 1px borders to separate content. Use background tonal shifts.
*   **DON'T** use bouncy or "playful" animations. All transitions must be linear or "ease-out-expo" for a surgical feel.