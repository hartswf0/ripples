# RIPPLES: Media Compiler Inception Prompts

> Each prompt transforms source HTML into engine-driven visualization.

---

## 🔧 22.html — Canvas Particle Simulation

```
Act as a Media Compiler.
BRIDGE: [2.html] -> [22.html]
PACKET: "Canvas particle simulation with Vector2 physics."

TRANSFORMS:
- Entity class → engine.getEntities() particle pool
- config.entityCount → engine.getEntities().length
- choiceVector DIV → engine.triggerVector()
- slowMoFactor → engine.state.isAutoplay
- Local state → engine.on('state:change')

ARCHITECTURE:
import { RipplesEngine } from './engine/ripples-engine.js';
import { VisualizationAdapter } from './engine/visualization-adapter.js';

class CanvasParticleRenderer {
  renderScenario(data) { /* rebuild particle pool */ }
  renderRipple(data) { /* spawn shockwave */ }
  renderEntitySelect(data) { /* highlight particle */ }
}

INVARIANTS:
- Maintain cinematic letterbox bars
- Keep Vector2 physics class intact
- Preserve slow-motion pan effect
- 60fps animation loop

OUTPUT: Self-contained HTML with ES module imports from ./engine/
```

---

## 🔧 44.html — Pure Canvas Immediate-Mode

```
Act as a Media Compiler.
BRIDGE: [4.html] -> [44.html]
PACKET: "Pure canvas rendering with IMGUI-style UI."

TRANSFORMS:
- BIOMES object → engine.latentLibrary scenarios
- State.mode → engine.state.selectedEntity
- Entity.triggerSignal() → engine.triggerVector()
- log() → engine.on('audit:add')
- Particle class → engine-driven reconstruction

ARCHITECTURE:
class ImmediateModeRenderer {
  constructor(engine, canvas) {
    this.UI = { /* IMGUI functions */ };
    engine.on('scenario:change', this.rebuildEntities);
  }
  button(id, x, y, w, h, text, onClick) { /* Canvas button */ }
  panel(x, y, w, h) { /* Canvas panel */ }
}

INVARIANTS:
- Pure canvas (no DOM except canvas element)
- IMGUI-style hit detection
- Biome-specific color palettes
- Sidebar + terminal layout

OUTPUT: Single HTML, canvas-only rendering, engine module imports.
```

---

## 🔧 55.html — Rendering Layers Equipment

```
Act as a Media Compiler.
BRIDGE: [5.html] -> [55.html]
PACKET: "Attachable rendering layers system for visual enhancements."

CONCEPT: Equipment module that enhances ANY renderer.

LAYERS:
1. CRTLayer { scanlines, flicker, phosphorGlow }
2. BloomLayer { pulse(color), intensity }
3. NoiseLayer { grain, static, amount }
4. VignetteLayer { radius, softness }
5. GridOverlay { matrixRain, scrollSpeed }

ARCHITECTURE:
export class RenderingLayersEquipment {
  constructor(engine) {
    engine.on('vector:trigger', ({ vector }) => {
      this.layers.bloom.pulse(VECTOR_COLORS[vector]);
    });
    engine.on('ripple:complete', () => {
      this.layers.noise.burst();
    });
  }
  enable(layerNames) { /* activate layers */ }
  attach(targetCanvas) { /* overlay on canvas */ }
  detach() { /* cleanup */ }
}

UI: VSCode-style panel for layer configuration.

OUTPUT: 
- engine/equipment/rendering-layers.js (module)
- 55.html (demo/configuration UI)
```

---

## 🔧 66.html — React + Gemini API (CRITICAL)

```
Act as a Media Compiler.
BRIDGE: [6.html] -> [66.html]
PACKET: "React interface with live LLM worldtext generation."

TRANSFORMS:
- callGemini() → engine.setWorldtextGenerator()
- SCENES → engine.latentLibrary
- ImaginaryEcologies() → EngineProvider wrapped
- Local state → useEngine() hook

ARCHITECTURE:
import { EngineProvider, useEngine } from './engine/adapters/react-adapter.js';

function App() {
  return (
    <EngineProvider latentLibrary={latentLibrary}>
      <ImaginaryEcologies />
    </EngineProvider>
  );
}

function ImaginaryEcologies() {
  const { engine, state } = useEngine();
  
  // LLM override for dynamic worldtext
  useEffect(() => {
    engine.setWorldtextGenerator(async (entity, vector) => {
      const systemInstruction = await fetch('./engine/SYSTEM_INSTRUCTION.md');
      return callGemini(engine.buildPrompt(entity, vector), systemInstruction);
    });
  }, [engine]);
}

INVARIANTS:
- CRT terminal aesthetic
- Nature documentary overlay
- Gemini API structured output schema
- Fallback to latent library if API fails

OUTPUT: React + Babel, engine-driven, LLM-enhanced.
```

---

## 🔧 1010.html — Bigtime Premium Interface (CRITICAL)

```
Act as a Media Compiler.
BRIDGE: [10.html] -> [1010.html]
PACKET: "Premium, polished React interface — the flagship renderer."

TRANSFORMS:
- triggerRipple() → engine.triggerVector()
- generateRipple() → engine.getLatent()
- PRESET_SCENARIOS → engine.getScenarioIds()
- setInterval autoplay → engine.startAutoplay()

DESIGN GOALS:
- Premium glassmorphism aesthetic
- Smooth spring animations (CSS transitions)
- Entity cards with hover previews showing latent vectors
- Vector buttons with pulse animations on trigger
- Floating scenario selector
- Real-time audit log with timestamps

UI STRUCTURE:
┌──────────────────────────────────────────────────┐
│  RIPPLES                    [Scenario ▼] [Auto]  │
├────────────┬─────────────────────────────────────┤
│            │                                     │
│  ENTITIES  │          WORLDTEXT                  │
│  ┌──────┐  │                                     │
│  │ 🐜   │←─│  The Formicidae Scout traces...    │
│  └──────┘  │                                     │
│  ┌──────┐  │                                     │
│  │ ✧    │  │                                     │
│  └──────┘  │                                     │
├────────────┴─────────────────────────────────────┤
│  [GOAL]     [OBSTACLE]     [SHIFT]               │
└──────────────────────────────────────────────────┘

OUTPUT: React, TailwindCSS, engine-driven, production-ready aesthetic.
```

---

## 🔧 1111.html — Heavenly Aesthetic

```
Act as a Media Compiler.
BRIDGE: [11.html] -> [1111.html]
PACKET: "Ethereal, luminous React interface with heavenly aesthetic."

TRANSFORMS:
- VECTORS → engine.getVectors() + heavenly styling
- PRESET_SCENARIOS → engine.getScenarioIds()
- GlitchText → Keep component, enhance with bloom
- Local state → useEngine() hook

DESIGN GOALS:
- White/gold/cyan color palette
- Floating entity orbs with soft glow
- Soft bloom on vector triggers
- Ethereal typography (light weights)
- Particle effects on interactions
- Ambient audio-reactive elements

AESTHETIC:
- Background: radial gradient (deep indigo → black)
- Entities: floating glass orbs with inner glow
- Vectors: luminous buttons with halo effect
- Worldtext: gold text with letter-by-letter reveal
- Transitions: slow, dreamy easing curves

OUTPUT: React, engine-driven, maximum visual polish.
```

---

## 🔧 1212.html — Cartoon Style

```
Act as a Media Compiler.
BRIDGE: [12.html] -> [1212.html]
PACKET: "Vibrant cartoon React interface with Imagen backgrounds."

TRANSFORMS:
- callImagen() → trigger on scenario:change
- SIMULATION_SCHEMA → engine.SYSTEM_INSTRUCTION
- Entity icons → engine.getEntity().icon
- Local scenarios → engine.latentLibrary

DESIGN GOALS:
- Bold, saturated colors
- Bouncy UI transitions (spring physics)
- Comic-book style worldtext panels
- Generated backgrounds per scenario
- Emoji entity representations at 2x scale
- Sound effects on interactions (optional)

AESTHETIC:
- Thick black outlines on UI elements
- Halftone dot patterns
- Speech bubble worldtext containers
- Exaggerated hover animations
- Pop art vector buttons

IMAGEN INTEGRATION:
engine.on('scenario:change', async ({ name }) => {
  const bg = await callImagen(`${name} cartoon environment, vibrant colors`);
  setBackground(bg);
});

OUTPUT: React, engine-driven, cartoon aesthetic, Imagen-enhanced.
```

---

## 🔧 1313.html — CRT Final Form

```
Act as a Media Compiler.
BRIDGE: [13.html] -> [1313.html]
PACKET: "Maximum CRT fidelity — the ultimate terminal aesthetic."

TRANSFORMS:
- CRT_STYLES → RenderingLayers.enable(['crt', 'scanlines', 'flicker'])
- SCENES → engine.latentLibrary
- Nature show overlay → RenderingLayers.enable('natureShow')

DESIGN GOALS:
- Deepest green phosphor glow
- Visible scanlines at all sizes
- Authentic CRT flicker (subtle)
- Full-screen worldtext reveals
- Nature documentary-style overlays
- Retro terminal boot sequence

LAYERS (via RenderingLayersEquipment):
- CRT: scanlines, curvature, vignette
- Phosphor: green afterglow on text changes
- Flicker: 0.02-0.05 opacity variation
- Noise: subtle static on idle

NATURE SHOW MODE:
- Golden overlay bar at bottom
- "NARRATOR:" prefix on worldtext
- David Attenborough typography
- Fade transitions between ripples

OUTPUT: React, engine-driven, full CRT equipment attached.
```

---

## 🔧 1414.html — Infinite Scale (CRITICAL)

```
Act as a Media Compiler.
BRIDGE: [14.html] -> [1414.html]
PACKET: "Infinite zoomable grid with cellular automata ripples."

TRANSFORMS:
- view.zoom → Same, engine state overlay
- applyTool() → engine.setEntityState()
- getCell() → Sparse grid populated by engine

DESIGN GOALS:
- Zoom from single cell to macro ecosystem view
- Visible ripple propagation as wave fronts
- Entity density heat map at zoom-out
- Minimap showing full ecosystem
- Pan/zoom with momentum

ARCHITECTURE:
class InfiniteGridRenderer {
  constructor(engine) {
    this.view = { x: 0, y: 0, zoom: 1 };
    this.cells = new Map(); // Sparse storage
    
    engine.on('ripple:complete', ({ entity, vector }) => {
      this.propagateRipple(entity.gridPos, vector);
    });
  }
  
  propagateRipple(origin, vector, radius = 0) {
    // Cellular automata wave expansion
    // Each tick increases radius
    // Cells change color based on vector
  }
  
  getVisibleCells() {
    // Return only cells in current viewport
  }
}

ZOOM LEVELS:
- 1x: Individual cells with text
- 0.5x: Cells as colored dots
- 0.1x: Density heat map
- 0.01x: Ecosystem overview

OUTPUT: Canvas, engine-driven, infinite pan/zoom.
```

---

## 🔧 1515.html — Text Grid Simulation

```
Act as a Media Compiler.
BRIDGE: [15.html] -> [1515.html]
PACKET: "ASCII art text grid with terminal hacker aesthetic."

TRANSFORMS:
- LEXICON → engine.getLatent()
- runSimulationStep() → engine.on('tick:increment')
- Cell types → Engine entities + vectors

DESIGN GOALS:
- ASCII art aesthetic
- Worldtext appears as grid cells
- Text-based ripple propagation
- Terminal hacker vibe
- Monospace everything
- Green-on-black default

GRID MECHANICS:
- Each cell = 3 characters
- Revealed cells show worldtext fragments
- Unrevealed cells show ░▒▓█ glyphs
- Vector injection changes cell types
- Ripples propagate orthogonally

CELL TYPES → ENGINE MAPPING:
- ECO_FOREST → scenario.entities (type: 'animate')
- ECO_OCEAN → scenario.entities (type: 'abstract')
- VECTOR_GOAL → vector trigger state
- VECTOR_OBSTACLE → blocked cells
- VECTOR_SHIFT → transitioning cells

OUTPUT: React, engine-driven, pure text aesthetic.
```

---

## 🔧 1717.html — ELO 2026 Archive (NEW BUILD)

```
Act as a Media Compiler.
BRIDGE: [17.html structure] -> [1717.html]
PACKET: "Interactive performance archive with embedded visualizations."

CONCEPT: Documentation of a live RIPPLES performance at ELO 2026.

STRUCTURE:
┌────────────────────────────────────────────────────┐
│  RIPPLES: FORMICIDAE SCOUT // ELO 2026 ARCHIVE    │
│  Atlanta, GA | March 2026 | Operative Ecologies   │
├────────────────────────────────────────────────────┤
│  [PHASE 01] [PHASE 02] [PHASE 03] [PHASE 04]      │
├────────────────────────────────────────────────────┤
│                                                    │
│  PHASE CONTENT (scrollable)                        │
│  - Embedded iframes of engine visualizations       │
│  - Performance photographs                         │
│  - Simulated Zoom chat reactions                   │
│  - Worldtext projection captures                   │
│                                                    │
└────────────────────────────────────────────────────┘

PHASES:
1. SUPERVISED MODE — iframe: 1010.html
2. AUTOPLAY MODE — iframe: 66.html?autoplay=true
3. LIVE PERFORMANCE — Full-screen worldtext projection
4. EXPANDED ECOLOGIES — Deep Forest topographic visualization

FEATURES:
- Timeline scrubber
- Simulated audience reactions
- Performance control overlay
- Archive metadata sidebar

OUTPUT: Static HTML archive with embedded engine demos.
```

---

## 🔧 1776.html — Gallery View

```
Act as a Media Compiler.
BRIDGE: [Generated Image] -> [1776.html]
PACKET: "Gallery showcasing all engine-driven visualizations."

IMAGE GENERATION PROMPT:
"A rustic wooden frame made of reclaimed barn wood, covered with 
living moss and dried leaves, surrounding a high-tech CRT monitor 
displaying the RIPPLES interface. The screen shows:
- Header: 'IMAGINARY ECOLOGIES / RIPPLES' in cyan
- Status panel: WORLDTEXT_GENERATOR: ACTIVE, ECO-SYSTEM: DEEP_FOREST
- Topographic text visualization in concentric ripples
- GOAL/OBSTACLE/SHIFT buttons on right
Frame decorated with fairy lights. Natural materials meeting digital."

GALLERY STRUCTURE:
- Hero section with generated image
- Grid of all visualization thumbnails (22, 44, 55, 66, 1010, etc.)
- Each thumbnail links to full visualization
- Filter by pattern type (Canvas, React, Equipment)
- Engine status display
- Live demo switcher

OUTPUT: Gallery HTML with generated hero image.
```

---

## Usage

Each prompt can be fed to an LLM to generate the corresponding HTML file. The prompts encode:

1. **Source → Target** mapping
2. **Transform specifications** (what changes)
3. **Architecture patterns** (how to structure)
4. **Design goals** (aesthetic targets)
5. **Invariants** (what must stay the same)
6. **Output format** (self-contained HTML)

---

## 🔧 1818.html — Sonic Ecology (NEW)

```
Act as a Media Compiler.
BRIDGE: [18.html] -> [1818.html]
PACKET: "Web Audio-driven sonic ecology controlled by Orca logic."

TRANSFORMS:
- Entity.x/y → Orca Grid Operator Position (N, S, E, W)
- Entity Type → Sound Synthesis Channel (Sine, Square, Saw)
- Collision → Audio Trigger (Bang *)
- Ripples → Radial Bang (@)

ARCHITECTURE:
class SonicEcologyRenderer {
  constructor(engine) {
    this.audio = new AudioBridge();
    this.compiler = new GridCompiler();
    engine.on('tick', this.updateGrid);
  }
}

INVARIANTS:
- Esoteric Orca aesthetic (monospaced grid)
- Pilot-compatible sound synthesis
- Real-time audiovisual feedback

OUTPUT: Self-contained HTML with Web Audio.
```

## Sonic Ecology Prompts (Poetic)

### The Orca Operator
> "Imagine each entity in RIPPLES as a cell in an Orca grid. The ant is 'A', the shadow is 'S'. When they collide, they bang (*). What sequence emerges from the cupboard ecosystem running at 120 BPM?"

### The Pilot Voice
> "Each entity type has a voice in Pilot. Animate beings are sine waves, soft and organic. Inanimate objects are square waves, hard and defined. Abstract forces are sawtooth, cutting and transformative. What does the kitchen cabinet sound like at dusk?"

### The Gull Sampler
> "The World Jockey loads samples into Gull: footsteps, creaking wood, wind through cracks. Each ripple triggers a sample. The reverb is the room itself. What field recording captures the umwelt of the spider?"

### Chemical Cartography as Frequency
> "Chemotaxis becomes frequency modulation. The ant follows a gradient not of pheromones but of hertz. Higher frequencies indicate goal proximity. Lower frequencies warn of obstacles. What is the sound of seeking?"

