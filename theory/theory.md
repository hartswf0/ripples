# RIPPLES: Operative Ecologies in the Worldtext

## A Theory of Imaginary Relationalities

This document is the **anchoring text** for RIPPLES. It describes not what the system *is*, but what it *could be*—a generative framework for imagining nonhuman perspectives within enclosed ecologies.

---

## Core Premise

> "A world simulator that creates emergent interactions between entities in imaginary, nonhuman ecologies."

RIPPLES operates on the principle that **text is terrain**. The Worldtext is not a narrative; it is a *state readout*—a snapshot of the ecology at a given moment. The user does not write the story; the user **injects vectors** that shift the state.

---

## The Operative Triad

### 1. Entity (The Subject)
An Entity is any object, organism, or force that can occupy a perspective within the ecology. Entities are defined by:

| Property | Description |
|----------|-------------|
| `type` | `animate` / `inanimate` / `abstract` |
| `state` | Current condition (e.g., `foraging`, `suspended`, `filtering`) |
| `position` | Coordinates within the Worldtext grid |

**Examples:**
- *Animate*: Ant, Raccoon, Deer, Pigeon
- *Inanimate*: Tall Glass, Stack of Plates, Traffic Light
- *Abstract*: Light, Shadow, Graffiti

### 2. Vector (The Force)
A Vector is a force or direction applied to an entity. There are three core vectors:

| Vector | Color | Meaning |
|--------|-------|---------|
| **GOAL** | Gold | Movement toward a resource or target |
| **OBSTACLE** | Red | Encounter with a barrier or threat |
| **SHIFT** | Cyan/Purple | Change in state, metabolism, or identity |

### 3. Ripple (The Effect)
When a vector is injected into an entity, it creates a **Ripple**—a cascade of state changes that propagate through the ecology. The Ripple updates the Worldtext.

---

## The Latent Library

The **Latent Library** is a database of pre-written poetic descriptions for each entity/vector combination. It is the "what it could be" layer—the generative seed that the system uses to produce new Worldtext.

### Structure
```
scenarios/
  cupboard/
    baseline: ["The cupboard space is pressurized by stillness...", ...]
    entities/
      ant/
        GOAL: ["The Ant entity abandons the boundary cracks...", ...]
        OBSTACLE: ["The Ant encounters a vertical cliff of ceramic...", ...]
        SHIFT: ["The Ant enters a state of torpor...", ...]
      dust_mote/
        GOAL: [...]
        OBSTACLE: [...]
        SHIFT: [...]
      ...
```

### Design Principles

1. **Perspective-Locked**: Each description is written from the entity's point of view, not an external observer.
2. **State-Focused**: Descriptions emphasize transformation, not narrative progression.
3. **Poetic Density**: Language is compressed, evocative, and ambiguous.
4. **Chemical Cartography**: Entities perceive their environment through their own sensory systems (chemical trails, light gradients, vibrational signals).

---

## Scenario Archetypes

| Scenario | Boundary | Physics | Entities |
|----------|----------|---------|----------|
| **The Cupboard** | Wood/Darkness | High Friction | Ant, Dust Mote, Glass, Plates, Light, Shadow |
| **Abandoned House** | Decay | Low Friction | Raccoon, Mold, Ivy, Rain |
| **Deep Forest** | Cathedral of Verticality | Standard | Mycelium, Deer, Owl, Seedling |
| **Urban Jungle** | Concrete Canyon | High Noise | Pigeon, Rat, Graffiti, Traffic Light |

---

## Modes of Operation

### Supervised (Human-in-the-Loop)
The operator manually selects an entity and injects a vector. The system waits for input before triggering a ripple.

### Unsupervised (Autoplay)
The system autonomously selects entities and vectors. The ecology drifts without human intent.

---

## What It Could Be

RIPPLES is a framework for:

1. **Imaginary Ecology Simulation**: Modeling nonhuman perspectives without claiming accuracy or scientific validity.
2. **Generative Worldbuilding**: Using AI to produce speculative text that imagines what it's like to be an ant, a dust mote, a shadow.
3. **Operative Fiction**: Creating fiction that *does something*—that responds to inputs, that evolves over time, that is never finished.
4. **Performance Instrument**: A tool for live performances where the audience can inject vectors and witness emergent narratives.
5. **Ecological Speculation**: Asking "what if?" about the inner lives of entities we normally ignore.

---

## Future Directions

- **Extended Entity Types**: Weather, geological forces, time itself as entities
- **Cross-Scenario Ripples**: Effects that propagate between scenarios
- **Memory**: Entities that remember past vectors and adapt their behavior
- **Collaborative Worldtext**: Multiple operators injecting vectors simultaneously
- **3D Visualization**: Real-time rendering of entity movements in Three.js

---

## References

- **Latent Library**: `/app/src/data/latentLibrary.ts` (518 lines of entity descriptions)
- **Scenarios**: `/app/src/data/scenarios.ts` (4 scenarios with 16 entities)
- **Type Definitions**: `/app/src/types/index.ts` (Entity, Scenario, RippleState, WorldtextCell)
- **React App**: `/app/src/App.tsx` (main application entry point)
