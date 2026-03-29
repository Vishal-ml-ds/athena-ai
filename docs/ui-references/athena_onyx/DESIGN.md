# Design System: High-End Editorial AI OS

## 1. Overview & Creative North Star
**Creative North Star: The Celestial Intelligence**
This design system moves beyond the utility of a "tool" and enters the realm of a "digital concierge." It balances the high-tech precision of a Jarvis-like interface with the structured, editorial clarity of a luxury publication. 

To break the "template" look, we reject the rigid, boxed-in grid. Instead, we embrace **Intentional Asymmetry**. Hero elements should bleed off-canvas, and information should be grouped through proximity and tonal shifts rather than hard lines. The experience should feel like a series of layered, translucent planes floating in a deep, cosmic vacuum.

---

## 2. Colors & Surface Philosophy
The palette is rooted in a deep obsidian base, punctuated by a regal "Nebula" purple and "Solar" gold.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or layout containment. Boundaries must be defined solely through background color shifts or subtle tonal transitions. 
- *Instead of a border:* Place a `surface_container_low` card on a `surface` background.
- *Instead of a divider:* Use a `6` (1.5rem) vertical spacing gap.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of frosted glass. Each "level" up represents a closer proximity to the user.
- **Base Layer:** `surface` (#0b1326) – The infinite background.
- **Section Layer:** `surface_container_low` (#131b2e) – Large structural areas.
- **Object Layer:** `surface_container` (#171f33) – Standard cards and modules.
- **Interaction Layer:** `surface_container_high` (#222a3d) – Hover states and active dialogs.

### The "Glass & Gradient" Rule
To achieve the "Premium AI" aesthetic, use Glassmorphism for floating overlays. 
- **Recipe:** `surface_container` at 60% opacity + `backdrop-blur-xl`.
- **Signature Texture:** Primary CTAs should not be flat. Use a linear gradient: `primary_container` (#7c3aed) to `primary` (#d2bbff) at a 135-degree angle to create a "glowing" energy source.

---

## 3. Typography
We utilize a high-contrast scale to create an editorial feel, mixing the technical precision of JetBrains Mono with the modern humanist touch of Inter and the architectural strength of Space Grotesk.

*   **Display & Headlines (Space Grotesk):** Used for "Hero" moments and OS headers. The wide apertures feel futuristic and authoritative.
*   **Titles & Body (Inter):** The workhorse. Inter provides maximum legibility for dense AI data (the "Notion" side of the aesthetic).
*   **Code & Metadata (JetBrains Mono):** Reserved for system status, AI "thinking" logs, and technical values.

**Hierarchy as Identity:**
- Large, low-weight (Light/Regular) `display-lg` headers create a "Luxury Journal" feel.
- Tight `label-sm` caps for metadata emphasize "System Precision."

---

## 4. Elevation & Depth
Depth is not a shadow; it is a **Tonal Layer.**

### The Layering Principle
Avoid traditional drop shadows which can feel "muddy" on dark backgrounds. Instead, stack your tokens:
1.  **Level 0:** `surface_container_lowest` (Background)
2.  **Level 1:** `surface_container_low` (In-set content)
3.  **Level 2:** `surface_container` (Cards)

### Ambient Glows
When an element must "float" (e.g., a Command Palette), use a **Tinted Ambient Glow** rather than a black shadow.
- **Shadow Property:** `0 20px 40px -12px rgba(124, 58, 237, 0.12)` (A subtle purple-tinted dispersion).

### The "Ghost Border" Fallback
If accessibility requires a container edge, use a **Ghost Border**:
- `outline_variant` (#4a4455) at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Buttons
- **Primary:** Gradient (`primary_container` to `primary`), 8px radius, `title-sm` (Medium weight).
- **Secondary:** `surface_container_high` background with a `primary` text color. No border.
- **Tertiary:** Transparent background, `primary` text, underlined only on hover.

### Cards (The "Glass" Module)
- **Radius:** `lg` (1rem / 16px) or `md` (0.75rem / 12px) for nested items.
- **Style:** `surface_container` + `backdrop-blur-md`. 
- **Rule:** Forbid divider lines. Use `surface_variant` backgrounds for internal headers within a card.

### Input Fields
- **Default:** `surface_container_lowest` background. 8px radius.
- **Active State:** A 1px "Ghost Border" using `primary` at 40% opacity and a subtle `primary` outer glow.
- **Font:** Use `body-md` for user input, but `label-md` (JetBrains Mono) for the floating label.

### AI Intelligence Components (Custom)
- **The "Pulse" Avatar:** Full-round avatars with a `secondary` (Gold) ring. When the AI is "Thinking," the ring should use a keyframe animation of a 2px blur expansion.
- **The "Stream" List:** For AI chat logs, do not use bubbles. Use an editorial layout where the "Role" (User/AI) is a `label-sm` in `secondary` text, and the content is `body-lg`.

---

## 6. Do's and Don'ts

### Do
- **Do** use `secondary` (Gold) sparingly for "Success" or "High-Value" notifications. It is the jewelry of the OS.
- **Do** embrace whitespace. A luxury product "breathes."
- **Do** use `JetBrains Mono` for any data that feels "generated" by the AI.

### Don't
- **Don't** use pure black (#000000). Use the `surface` tokens to maintain depth.
- **Don't** use 100% opaque borders. They break the "Glass" immersion.
- **Don't** use standard "Blue" for links. Use `primary` (Purple) or `secondary` (Gold) depending on the action's weight.
- **Don't** stack more than three levels of surface nesting; the UI will become cluttered and lose its premium clarity.

---

## 7. Implementation (Tailwind Configuration)