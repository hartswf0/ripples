# RIPPLES Architecture Documentation

## System Overview

RIPPLES is architected as a **headless core engine** with **interchangeable visualization layers**. This separation enables:

- Multiple visualization modes without engine changes
- Testing and simulation without UI
- LLM-driven interfaces (voice, text, API)
- Embedding in other applications

```
┌─────────────────────────────────────────────────────────────────┐
│                     VISUALIZATION LAYER                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  GridTV  │  │ Terminal │  │ Network  │  │  Custom  │        │
│  │ (visual) │  │ (text)   │  │ (graph)  │  │ (your)   │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
│       │             │             │             │               │
│       └─────────────┴──────┬──────┴─────────────┘               │
│                            │                                    │
│                    ┌───────┴───────┐                           │
│                    │  Event Bus    │ ◄─── Subscribe to engine   │
│                    └───────┬───────┘      events                │
└────────────────────────────┼────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                       CORE ENGINE                                │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    RipplesEngine                         │    │
│  │                                                          │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │    │
│  │  │  Scenarios  │  │   Entities  │  │  EntityMemory   │  │    │
│  │  │  (registry) │  │  (current)  │  │   (persistent)  │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │    │
│  │                                                          │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │    │
│  │  │  RippleGen  │  │   Cascade   │  │ PatternDetect   │  │    │
│  │  │  (latent/   │  │  (adjacent  │  │  (emergent)     │  │    │
│  │  │   LLM)      │  │   effects)  │  │                 │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │    │
│  │                                                          │    │
│  │  State: { scenario, selectedEntity, tick, auditLog,     │    │
│  │           generationMode, bpm, ... }                     │    │
│  │                                                          │    │
│  │  Events: scenario:changed, entity:selected,              │    │
│  │          ripple:triggered, patterns:detected, ...        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    LLM Adapter                           │    │
│  │  (OpenAI, Anthropic, Ollama, Mock)                      │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Context Window Mapping

### Token Budgets

| Component | Tokens | Purpose |
|-----------|--------|---------|
| Core Engine | ~1,000 | State, logic, pure functions |
| Event Bus | ~200 | Pub/sub, decoupling |
| Visualizer Base | ~400 | Abstract class, lifecycle |
| GridTV | ~800 | Grid rendering, animations |
| Terminal | ~400 | Text output, commands |
| Network | ~1,000 | Force simulation, SVG |
| App Layer | ~1,200 | Orchestration, UI binding |
| **Total (min)** | **~2,600** | Core + one visualizer |
| **Total (full)** | **~5,000** | All visualizers |

### Context Integrity Flow

```
┌─────────────────────────────────────────────────────────────┐
│  CONTEXT WINDOW (e.g., 8K, 16K, 32K, 128K tokens)           │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  SYSTEM INSTRUCTIONS (~500 tokens)                  │   │
│  │  - Role definition                                  │   │
│  │  - Output format                                    │   │
│  │  - Constraints                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  CORE ENGINE STATE (~1,000 tokens)                  │   │
│  │  - Current scenario                                 │   │
│  │  - Selected entity                                  │   │
│  │  - Recent ripples (last 10)                         │   │
│  │  - Entity memories                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  LATENT LIBRARY (on-demand, ~500 tokens/scenario)   │   │
│  │  - Current scenario descriptions                    │   │
│  │  - Selected entity's GOAL/OBSTACLE/SHIFT            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  GENERATION PROMPT (~300 tokens)                    │   │
│  │  - Template with current context                    │   │
│  │  - Entity perspective instructions                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  OUTPUT BUFFER (~2,000 tokens)                      │   │
│  │  - Generated worldtext                              │   │
│  │  - Cascade descriptions                             │   │
│  │  - Pattern detections                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Token Efficiency Strategies

### 1. Lazy Loading

Scenarios and latent descriptions load on-demand:

```javascript
// Only current scenario in active context
const currentScenario = engine.getCurrentScenario();

// Other scenarios remain in registry, not memory
const otherScenarios = engine.scenarios; // Map, not loaded
```

### 2. Compression

Entity references use short IDs:

```javascript
// Full name for display: "Formicidae Scout"
// Short ID for operations: "ant"
// Token savings: ~3:1 ratio
```

### 3. Prompt Templates

Pre-structured prompts minimize per-request tokens:

```javascript
// Template: ~150 tokens (defined once)
const template = `SCENARIO: {{NAME}}
ENTITY: {{ENTITY}} ({{TYPE}})
VECTOR: {{VECTOR}}
Write 150-250 words from first-person perspective...`;

// Filled: ~+100 tokens per generation
const prompt = template
  .replace('{{NAME}}', scenario.name)
  .replace('{{ENTITY}}', entity.name)
  ...
```

### 4. Event-Driven Updates

Visualizers only re-render on state changes:

```javascript
// Subscribe to specific events
engine.events.on('ripple:triggered', ({ ripple }) => {
  // Only update affected cells
  animateRipple(ripple.entityId);
});
```

## System Instructions for LLM Integration

### Core System Prompt

```
You are RIPPLES, a Worldtext Generator for imaginary ecologies.

CORE PRINCIPLES:
1. Write from WITHIN the entity's perspective (first-person phenomenology)
2. Emphasize STATE CHANGE, not narrative progression
3. Use uncertainty language: "might", "perhaps", "as if"
4. Use the entity's sensory system (chemical gradients for ants, etc.)
5. Compress language—evocative, ambiguous, poetic density
6. 150-250 words typical length

OUTPUT FORMAT:
- Plain text, no markdown
- No headers or labels
- Direct phenomenological description

CONSTRAINTS:
- Never claim to know what entities "actually" experience
- Always include uncertainty markers
- Focus on transformation, not story
- Avoid anthropomorphism (unless entity is human-like)
```

### Vector-Specific Instructions

**GOAL:**
```
The entity is moving TOWARD something—resource, target, desire.
Describe: attraction, seeking, the pull of purpose, how the world 
reorganizes around this vector.
```

**OBSTACLE:**
```
The entity encounters RESISTANCE—barrier, threat, opposition.
Describe: frustration, reassessment, the feeling of blocked momentum,
alternative paths considered.
```

**SHIFT:**
```
The entity is CHANGING STATE—identity, metabolism, condition.
Describe: transformation, becoming, threshold-crossing, the 
liminal space between states.
```

## Visualization Layer API

### Creating a Custom Visualizer

```javascript
class MyVisualizer extends Visualizer {
  buildDOM() {
    // Create your DOM structure
    this.container.innerHTML = `
      <div class="my-visualizer">
        <!-- Your HTML -->
      </div>
    `;
    this.myElement = this.container.querySelector('.my-element');
  }

  bindEvents() {
    // Subscribe to engine events
    this.subscribe('ripple:triggered', ({ ripple }) => {
      this.onRipple(ripple);
    });
  }

  render() {
    // Initial render based on current state
    const scenario = this.engine.getCurrentScenario();
    // ... render logic
  }

  onRipple(ripple) {
    // Handle ripple event
  }
}

// Register
Visualizers.myviz = MyVisualizer;

// Mount
app.mountVisualizer('myviz');
```

### Available Events

| Event | Payload | Description |
|-------|---------|-------------|
| `scenario:registered` | `{ scenario }` | New scenario added |
| `scenario:changed` | `{ current, previous, scenario }` | Scenario switched |
| `entity:selected` | `{ entity, memory, scenario }` | Entity focused |
| `entity:stateChanged` | `{ entity, previousState, newState, vector }` | State transition |
| `ripple:triggered` | `{ ripple, entity, patterns, scenario }` | Vector applied |
| `ripple:decay` | `{ entityId, intensity }` | Effect fading |
| `patterns:detected` | `{ patterns }` | Emergent patterns found |
| `autoplay:started` | `{ bpm }` | Autoplay enabled |
| `autoplay:stopped` | `{}` | Autoplay disabled |
| `llm:generating` | `{ entity, vector, prompt }` | LLM request sent |
| `llm:generated` | `{ entity, vector, description }` | LLM response received |

## LLM Adapter Interface

```javascript
class MyLLMAdapter extends LLMAdapter {
  async generate(prompt) {
    // Your API call here
    const response = await fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 400,
        temperature: 0.8
      })
    });
    
    const data = await response.json();
    return data.choices[0].message.content;
  }
}

// Configure engine
const engine = new RipplesEngine({
  llmAdapter: new MyLLMAdapter({
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4',
    apiKey: 'sk-...'
  })
});
```

## Performance Considerations

### For Live Performance (VJ/DJ Mode)

1. **Use LATENT mode** — No API latency
2. **BPM 20-40** — Comfortable for manual triggering
3. **GridTV visualizer** — Most responsive
4. **Preload all scenarios** — No load delays

### For Generative Exploration

1. **Use GENERATIVE mode** — Infinite variety
2. **Mock adapter for testing** — No API costs
3. **Terminal visualizer** — Minimal overhead
4. **Pattern detection on** — Discover emergent behaviors

### For API Integration

1. **Implement caching** — Avoid redundant generation
2. **Batch requests** — When possible
3. **Stream responses** — For real-time feel
4. **Fallback to latent** — On API failure

## Epistemic Commitment

> All models are wrong. We aim to be usefully wrong.

RIPPLES does not claim to know what entities experience. It generates speculations—poetic, perspective-locked descriptions that:

- Honor the entity's sensory capabilities
- Acknowledge uncertainty
- Focus on state over story
- Compress meaning into evocative language

The World Jockey does not claim truth. They make worlds.
