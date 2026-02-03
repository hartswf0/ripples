# RIPPLES: Interface Pattern Library

## Part I: Image-to-Prompt Catalog

Each image from the ELO 2026 archive can be used as a prompt seed for generating interfaces.

---

### Frame 000: Title Card
**File:** `Gemini_Generated_Image_1roa41roa41roa41.png`
**Prompt:** *"A cinematic title slide on a dark stage. Futuristic turquoise and lime text reads 'RIPPLES: LIVE PERFORMANCE / OPERATIVE ECOLOGIES IN THE WORLDTEXT'. Below, smaller text states 'ELO 2026 - ATLANTA, GA'. The screen is slightly curved with a subtle glow."*

---

### Frame 001-003: Supervised Mode Interface
**Files:** `...(1).png`, `...(2).png`, `...(3).png`
**UI Prompt:** *"A dark, terminal-style interface with a 3-column layout. Left: SCENARIO_SELECT list (Abandoned House, Forest, The Cupboard). Center: ASCII art schematic of entities. Right: Three stacked buttons (SHIFT, GOAL, OBSTACLE) with distinct color accents (cyan, gold, red). Bottom panel: scrolling text readout. Font: JetBrains Mono. Color accents: #4af626 (terminal green), #ff3333 (alert), #ffd700 (gold)."*

---

### Frame 004: Syntax-Highlighted Worldtext Grid
**File:** `Gemini_Generated_Image_3zb61t3zb61t3zb6.png`
**Prompt:** *"A dense grid of syntax-highlighted text on a black background, reminiscent of a code editor or a 'Matrix' view. Green text denotes entities, red text denotes obstacles, gold text denotes goals. A central control panel overlays the grid with buttons for SELECT ENTITY, INJECT VECTOR, and TRIGGER SHIFT. An AUDIT LOG panel on the right. Version number 'v1.2' in header."*

---

### Frame 005: Deep Forest Ecology
**File:** `Gemini_Generated_Image_ekh8wtekh8wtekh8.png`
**Prompt:** *"An interactive art installation framed by natural wood and moss. The screen displays 'IMAGINARY ECOLOGIES / RIPPLES' with a topological visualization of a forest floor. Concentric glowing rings emanate from a central 'GOAL' marker. The text 'ENTITY: FUNGAL_NETWORK (PERSPECTIVE_LOCKED)' is displayed. Three vector buttons (GOAL, OBSTACLE, SHIFT) are visible on the right."*

---

### Frame 006-007: Performance Build v1.2
**Files:** `Gemini_Generated_Image_jhlrcgjhlrcgjhlr.png`, `Gemini_Generated_Image_qd9r1dqd9r1dqd9r.png`
**Prompt:** *"A professional software interface labeled 'RIPPLES / ELO 2026 PERFORMANCE BUILD v1.2'. Left sidebar: PRESET SCENARIOS list, ENTITY POOL with items like Dust_Mote, Ant, Tall_Glass_1. Center: WORLDTEXT READOUT with formatted simulation text. Right: OPERATOR CONTROLS (SELECT ENTITY/GOAL, INJECT VECTOR/OBSTACLE, TRIGGER SHIFT). AUTOPLAY THRESHOLD toggle set to OFF."*

---

### Frame 008-011: Zoom Live Performance
**Files:** `Gemini_Generated_Image_qd9r1dqd9r1dqd9r (1-3).png`, `..._yh7emyyh7emyyh7e (1).png`
**Prompt:** *"A Zoom call screen share during a live performance. The main screen shows the RIPPLES interface in SUPERVISED MODE. A chat sidebar on the right shows audience messages like 'The text is the terrain... fascinating!' and 'I'm about to inject a GOAL vector.' Participant video thumbnails are visible at the bottom. The Zoom header reads 'RIPPLES: OPERATIVE ECOLOGIES (ELO 2026)'."*

---

### Frame 012: System Overview Diagram
**File:** `Gemini_Generated_Image_w9pk6dw9pk6dw9pk (3).png`
**Prompt:** *"A system architecture diagram on a dark background. Title: 'RIPPLES SYSTEM OVERVIEW'. Three columns: DATABASE VIEW (list of scenarios), PRESET SCENARIOS (circular nodes connected by lines), ENTITIES (full list), VECTORS (Shift, Goal, Obstacle). Nodes are connected by thin gray lines to show relationships. The style is clean, data-oriented, almost like a database ERD."*

---

### Frame 013: Research Abstract
**File:** `Gemini_Generated_Image_w9pk6dw9pk6dw9pk.png`
**Prompt:** *"A printed research paper on a spiral notebook on a desk with a coffee cup. Title: 'RIPPLES: OPERATIVE ECOLOGIES IN THE WORLDTEXT'. Subtitles: 'Imaginary Relationalities', 'Forest Simulator', 'Imaginary Ecologies'. An abstract section explains the project. A 'WHAT IS IMPORTANT?' section with bullet points: 'Creating movement... three possible vectors', 'Entity perspective... agency in this cycle', 'Autoplay mode... system selects'."*

---

## Part II: UI Component Patterns

Identified across all HTML files.

| Pattern | Files | Description |
|---|---|---|
| **CRT Terminal Aesthetic** | 6, 7, 8, 13, 16 | Flicker animation, scanlines, vignette, green-on-black color scheme (`#4af626`, `#1e5c12`). |
| **Three-Column Layout** | 5, 6, 8, 14 | Sidebar + Viewport + Inspector/Logs. Common for IDE-style apps. |
| **Entity Pool Select** | 6, 7, 8, 10-16 | A list of clickable entities that sets a global `selectedEntity` state. |
| **Vector Buttons (SHIFT/GOAL/OBSTACLE)** | All | Three primary action buttons, color-coded (purple/cyan, gold/amber, red). |
| **Audit Log Panel** | 6, 8, 13-16 | Scrolling list of `[Tick_XXX]` timestamped events. Auto-scrolls to bottom. |
| **Autoplay Toggle** | 10-16 | Button/checkbox to enable autonomous simulation. Interval is typically 2-4 seconds. |
| **Scenario Presets** | 1-8, 10-16 | An array like `SCENES` or `PRESETS` with `id`, `label`, `entities[]`, and visual settings. |

---

## Part III: Key Differences That Make a Difference

| Axis of Variation | Low End | High End |
|---|---|---|
| **Rendering Engine** | Canvas 2D (1, 2, 4) | React Virtual DOM (6-16) |
| **Dimensionality** | 2D Text/Canvas (most) | 3D Three.js (3) |
| **LLM Integration** | None (hardcoded) | Gemini API calls (6, 9, 12) |
| **Interactivity** | Observe-only | Click-to-inject vectors |
| **Aesthetics** | Clean Tailwind UI | CRT/Glitch/Retro Terminal |
| **State Complexity** | Simple (entity array) | Complex (WorldState, history, phases) |

---

## Part IV: CSS Conventions

```css
/* Core Terminal Palette */
:root {
    --term-bg: #050a05;
    --term-text: #4af626;
    --term-dim: #1e5c12;
    --term-alert: #ff3333;
    --term-gold: #ffd700;
}

/* Scanline Effect */
.scanline {
    background: repeating-linear-gradient(
        0deg,
        rgba(0,0,0,0.1) 0px,
        rgba(0,0,0,0.1) 1px,
        transparent 1px,
        transparent 2px
    );
}

/* CRT Flicker Animation */
@keyframes flicker {
    0% { opacity: 0.02; }
    50% { opacity: 0.05; }
    100% { opacity: 0.02; }
}
```
