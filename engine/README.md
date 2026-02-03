# RIPPLES Engine

> A headless, event-driven engine for worldtext generation with pluggable visualizations.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONT-END VISUALIZATIONS                     │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│   │   Grid   │  │  Canvas  │  │  Text/   │  │   3D/    │           │
│   │  (CRT)   │  │  (Sim)   │  │ Terminal │  │  WebGL   │           │
│   └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘           │
│        └─────────────┴──────────────┴──────────────┘                │
│                               │                                     │
│                               ▼                                     │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │                 VISUALIZATION ADAPTER                        │  │
│   │   - Subscribes to engine events                              │  │
│   │   - Translates state → DOM/Canvas/WebGL                      │  │
│   │   - Forwards user input → engine commands                    │  │
│   └─────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          RIPPLES ENGINE                             │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │
│   │   State    │  │   Entity   │  │   Vector   │  │   Audit    │   │
│   │  Manager   │  │   Manager  │  │  Processor │  │    Log     │   │
│   └────────────┘  └────────────┘  └────────────┘  └────────────┘   │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐                   │
│   │  Scenario  │  │   Latent   │  │  Autoplay  │                   │
│   │   Loader   │  │  Library   │  │ Controller │                   │
│   └────────────┘  └────────────┘  └────────────┘                   │
└─────────────────────────────────────────────────────────────────────┘
```

## Quick Start

```javascript
import { RipplesEngine } from './ripples-engine.js';
import { VisualizationAdapter } from './visualization-adapter.js';
import { GridRenderer } from './renderers/grid-renderer.js';

// Load latent library
const latentLibrary = await fetch('./data/latent-library.json').then(r => r.json());

// Create engine
const engine = new RipplesEngine({ latentLibrary });

// Create renderer
const renderer = new GridRenderer(document.getElementById('app'));

// Create adapter (bridges engine ↔ renderer)
const adapter = new VisualizationAdapter(engine, renderer);

// Bind UI events
renderer.bindAdapter(adapter);

// Start!
engine.loadScenario('cupboard');
```

## Core Concepts

### Engine (Headless)

The engine is a pure state machine with no DOM dependencies. It can run in Node.js, browsers, or anywhere JavaScript executes.

```javascript
const engine = new RipplesEngine({ latentLibrary });

// Load a scenario
engine.loadScenario('cupboard');

// Select an entity
engine.selectEntity('ant');

// Trigger a vector
const ripple = engine.triggerVector('GOAL');
console.log(ripple.worldtext);

// Get state snapshot
const state = engine.exportState();
```

### Events

All state changes emit events. Subscribe to react to engine activity:

| Event | Payload | Description |
|-------|---------|-------------|
| `scenario:change` | `{ scenario, name, entities, baseline }` | Scenario loaded |
| `entity:select` | `{ entity }` | Entity selected |
| `entity:deselect` | `{}` | Entity deselected |
| `vector:trigger` | `{ entity, vector }` | Vector button pressed |
| `ripple:complete` | `{ entity, vector, worldtext, tick }` | Ripple generated |
| `tick:increment` | `{ tick }` | Tick counter advanced |
| `audit:add` | `{ entry }` | Audit log entry added |
| `autoplay:start` | `{}` | Autoplay mode started |
| `autoplay:stop` | `{}` | Autoplay mode stopped |
| `autoplay:tick` | `{ countdown }` | Countdown updated (every second) |
| `state:change` | `{ state, event, data }` | Any state mutation |

```javascript
// Subscribe to events
const unsubscribe = engine.on('ripple:complete', (data) => {
    console.log(`${data.entity.name} → ${data.vector}`);
    console.log(data.worldtext);
});

// Unsubscribe when done
unsubscribe();
```

### Visualization Adapter

The adapter bridges the engine and renderer. It:

1. Subscribes to engine events
2. Calls corresponding renderer methods
3. Forwards user input to engine commands

```javascript
const adapter = new VisualizationAdapter(engine, renderer);

// User clicks entity in UI → adapter → engine
renderer.onEntityClick = (id) => adapter.handleEntityClick(id);

// Engine emits event → adapter → renderer
// (Automatic when adapter is created)
```

### Renderers

Renderers implement a simple interface. Create your own for any visualization:

```javascript
class MyRenderer {
    renderScenario({ scenarioId, name, entities, baseline }) { ... }
    renderEntitySelect({ entity, latent, selected }) { ... }
    renderRipple({ entity, vector, worldtext, tick }) { ... }
    renderAuditEntry({ entry, log }) { ... }
    renderTick({ tick }) { ... }
    renderAutoplay({ isAutoplay, countdown }) { ... }
    renderCountdown({ countdown }) { ... }
}
```

## File Structure

```
engine/
├── ripples-engine.js       # Headless core engine
├── visualization-adapter.js # Bridge between engine and renderer
├── README.md               # This documentation
├── SYSTEM_INSTRUCTION.md   # LLM integration guide
├── data/
│   └── latent-library.json # Scenarios and latent descriptions
└── renderers/
    ├── grid-renderer.js    # CRT-style grid renderer
    └── canvas-renderer.js  # Particle simulation renderer (TODO)
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `G` | Trigger GOAL vector |
| `O` | Trigger OBSTACLE vector |
| `S` | Trigger SHIFT vector |
| `Space` | Toggle autoplay |
| `1-6` | Select entity by index |
| `←/→` | Cycle through scenarios |

## State Serialization

The engine state is fully serializable for persistence or LLM context:

```javascript
// Export
const state = engine.exportState();
localStorage.setItem('ripples-state', JSON.stringify(state));

// Import
const saved = JSON.parse(localStorage.getItem('ripples-state'));
engine.importState(saved);
```

## Console API

For debugging, the demo exposes `window.ripples`:

```javascript
ripples.engine.loadScenario('deep_forest')
ripples.engine.selectEntity('deer')
ripples.engine.triggerVector('GOAL')
ripples.engine.exportState()
ripples.engine.startAutoplay()
```

## Design Principles

1. **Headless engine** — No DOM dependencies
2. **Event-driven** — All state changes emit events
3. **Serializable state** — JSON-friendly for persistence/LLM
4. **Renderer-agnostic** — Any visualization can plug in
5. **Token-efficient** — Minimal context for LLM integration
6. **Documented** — Every function, event, and data structure
