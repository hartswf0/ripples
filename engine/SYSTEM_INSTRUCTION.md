# RIPPLES: System Instruction for LLM Integration

> Documentation for integrating the RIPPLES engine with Large Language Models for dynamic worldtext generation.

## Overview

The RIPPLES engine can be enhanced with LLM integration for generating novel worldtext instead of using the pre-written latent library. This document specifies the context engineering, token efficiency, and prompt patterns for optimal LLM integration.

## Context Window Management

### State Serialization

The engine state serializes to approximately **2KB JSON**:

```json
{
  "scenario": "cupboard",
  "entities": [
    { "id": "ant", "name": "Formicidae Scout", "type": "animate", "state": "foraging" },
    { "id": "dust-mote", "name": "Dust Mote", "type": "inanimate", "state": "suspended" }
  ],
  "selectedEntity": "ant",
  "tick": 5,
  "auditLog": [
    { "tick": 5, "entityName": "Formicidae Scout", "vector": "GOAL", "result": "..." }
  ],
  "lastVector": "GOAL",
  "lastRipple": "..."
}
```

### Latent Library

Each scenario's latent descriptions total approximately **8KB**:

- Baseline: ~500 characters
- Per entity (3 vectors × ~400 chars): ~1,200 characters
- 6 entities per scenario: ~7,200 characters

### Total Context Budget

| Component | Size |
|-----------|------|
| Engine state | ~2KB |
| Selected scenario | ~8KB |
| Recent audit log (5 entries) | ~2KB |
| System instruction | ~3KB |
| **Total** | **~15KB** |

This fits comfortably within modern LLM context windows (128K+ tokens).

## Token Efficiency Patterns

### Minimal Context Pattern

For maximum token efficiency, pass only essential context:

```javascript
function buildMinimalPrompt(engine) {
  const scenario = engine.getScenario();
  const entity = engine.getSelectedEntity();
  const vector = engine.state.lastVector;

  return {
    scenario: {
      name: scenario.name,
      baseline: scenario.baseline
    },
    entity: {
      id: entity.id,
      name: entity.name,
      type: entity.type,
      state: entity.state
    },
    vector: vector,
    tick: engine.state.tick
  };
}
```

**Compressed size: ~600 bytes**

### Rich Context Pattern

For higher quality generation with more grounding:

```javascript
function buildRichPrompt(engine) {
  const scenario = engine.getScenario();
  const entity = engine.getSelectedEntity();
  const vector = engine.state.lastVector;

  return {
    scenario: {
      name: scenario.name,
      baseline: scenario.baseline,
      entities: scenario.entities.map(e => ({
        id: e.id,
        name: e.name,
        type: e.type,
        state: e.state
      }))
    },
    selectedEntity: {
      ...entity,
      latent: scenario.latent[entity.id]  // Include pre-written examples
    },
    vector: vector,
    recentRipples: engine.state.auditLog.slice(0, 5)
  };
}
```

**Compressed size: ~4KB**

## System Instruction Template

### Core System Instruction

```
You are a RIPPLES worldtext generator. Your role is to produce immersive, poetic descriptions of imaginary ecologies from the perspective of non-human entities.

ONTOLOGY:
- Entity: Any being, object, or abstract force within the scenario
- Entity types: animate (living), inanimate (objects), abstract (forces/concepts)
- Vectors: GOAL (movement toward), OBSTACLE (encounter barrier), SHIFT (change state)
- Worldtext: Narrative description from entity's phenomenological perspective

CONSTRAINTS:
- Write in present tense, third person
- Focus on sensory and perceptual details
- Avoid human-centric language or values
- Embrace epistemic humility: describe perception, not truth
- Output: 150-300 words of worldtext only

VECTOR SEMANTICS:
- GOAL: The entity moves toward something desired, needed, or instinctual
- OBSTACLE: The entity encounters a barrier, impediment, or challenge
- SHIFT: The entity undergoes a state change, transformation, or phase transition
```

### Parameterized Prompt

```
SCENARIO: {{scenario.name}}
BASELINE: {{scenario.baseline}}

ENTITY: {{entity.name}}
TYPE: {{entity.type}}
STATE: {{entity.state}}

VECTOR: {{vector}}

Generate worldtext from {{entity.name}}'s perspective as it encounters a {{vector}} condition.
```

## Integration Patterns

### Pattern 1: Static Library with LLM Fallback

Use pre-written latent descriptions, fall back to LLM if missing:

```javascript
async function getWorldtext(engine, vector) {
  const entityId = engine.state.selectedEntity;
  const latent = engine.getLatent(entityId, vector);

  if (latent) {
    return latent;  // Use static library
  }

  // Fall back to LLM generation
  const prompt = buildMinimalPrompt(engine);
  return await generateWithLLM(prompt, vector);
}
```

### Pattern 2: Hybrid Enhancement

Use LLM to enhance or vary static worldtext:

```javascript
async function getEnhancedWorldtext(engine, vector) {
  const entityId = engine.state.selectedEntity;
  const baseLatent = engine.getLatent(entityId, vector);

  const prompt = `
    Base description: ${baseLatent}

    Rewrite this worldtext with fresh perspective while maintaining the core meaning.
    Add new sensory details. Vary the sentence structure. Keep the phenomenological focus.
  `;

  return await generateWithLLM(prompt, vector);
}
```

### Pattern 3: Full Dynamic Generation

Generate all worldtext dynamically:

```javascript
async function getDynamicWorldtext(engine, vector) {
  const prompt = buildRichPrompt(engine);
  const systemInstruction = getSystemInstruction();

  return await llm.generate({
    systemInstruction,
    userPrompt: JSON.stringify(prompt),
    temperature: 0.8,
    maxTokens: 400
  });
}
```

## Prompt Engineering Proof

### Example Input

```json
{
  "scenario": {
    "name": "THE CUPBOARD",
    "baseline": "The cupboard space is pressurized by stillness..."
  },
  "entity": {
    "id": "ant",
    "name": "Formicidae Scout",
    "type": "animate",
    "state": "foraging"
  },
  "vector": "OBSTACLE"
}
```

### Expected Output

```
The Formicidae Scout encounters a vertical cliff of ceramic: the edge of a plate. 
Its path is blocked. It pauses, antennae waving in frustrated inquiry, before 
beginning the long circumnavigation. The ceramic surface offers no purchase for 
climbing. Adhesive pads meet glazed impermeability—a frictionless interface 
between organic need and mineral indifference. The obstacle is not merely 
physical but temporal: the ant must wait for conditions to shift.
```

### Quality Criteria

1. **Phenomenological focus**: Describes perception, not objective reality
2. **Entity perspective**: Uses sensory language appropriate to the entity
3. **Vector alignment**: Clearly demonstrates the GOAL/OBSTACLE/SHIFT dynamic
4. **Wordcount**: 150-300 words
5. **Tense/person**: Present tense, third person
6. **Non-anthropocentric**: Avoids human values and judgments

## Contextual Integrity Flow

### 1. State Capture

```javascript
const context = engine.exportState();
// → Serializes all relevant state
```

### 2. Context Compression

```javascript
const compressed = {
  scenario: context.scenario,
  entity: engine.getSelectedEntity(),
  vector: context.lastVector,
  history: context.auditLog.slice(0, 3)
};
// → Minimal token footprint
```

### 3. Prompt Assembly

```javascript
const prompt = systemInstruction + '\n\n' + JSON.stringify(compressed, null, 2);
// → Complete prompt for LLM
```

### 4. Response Integration

```javascript
const worldtext = await llm.generate(prompt);
engine.state.lastRipple = worldtext;
engine.emit('ripple:complete', { worldtext, ... });
// → State updated, UI rendered
```

## Token Budgets by Model

| Model | Context Window | RIPPLES Budget | Remaining |
|-------|----------------|----------------|-----------|
| GPT-4 Turbo | 128K | 15K | 113K |
| Claude 3 | 200K | 15K | 185K |
| Gemini Pro | 128K | 15K | 113K |
| Llama 3 70B | 8K | 15K | ⚠️ Reduce |

For smaller context models, use the Minimal Context Pattern.

## Appendix: Full State Schema

```typescript
interface RipplesState {
  scenario: string;                    // Scenario ID
  entities: Entity[];                  // Array of entities
  selectedEntity: string | null;       // Selected entity ID
  tick: number;                        // Ripple counter
  auditLog: AuditEntry[];             // History of ripples
  isAutoplay: boolean;                 // Autoplay mode
  lastVector: 'GOAL' | 'OBSTACLE' | 'SHIFT' | null;
  lastRipple: string | null;          // Most recent worldtext
}

interface Entity {
  id: string;
  name: string;
  type: 'animate' | 'inanimate' | 'abstract';
  state: string;                      // Current behavioral state
  icon?: string;                      // Display emoji
}

interface AuditEntry {
  tick: number;
  timestamp: number;
  entityId: string;
  entityName: string;
  vector: string;
  result: string;                     // Truncated worldtext (80 chars)
}
```
