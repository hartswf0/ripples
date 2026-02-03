/**
 * RIPPLES ENGINE v2.0 — TOPOLOGY
 * ==============================
 * 
 * A Media Compiler for Imaginary Ecologies.
 * 
 * BRIDGE: [MOD] -> [PRM] -> [FLM]
 * 
 * The engine is a topology — a shape that holds state, events, and 
 * transformations. Visualizations are projections of this topology
 * onto different media surfaces (canvas, DOM, React, terminal).
 * 
 * CONTEXT WINDOW MAPPING:
 * - Core Engine: ~1200 tokens
 * - Event Topology: ~300 tokens  
 * - LLM Integration: ~500 tokens
 * - Total: ~2000 tokens (fits in 4K context)
 */

// ============================================
// TOPOLOGY: EVENT GRAPH
// ============================================

class EventTopology {
    constructor() {
        this.nodes = new Map();
        this.edges = new Map();
        this.propagationDepth = 3;
    }

    on(event, handler, priority = 0) {
        if (!this.nodes.has(event)) {
            this.nodes.set(event, new Set());
            this.edges.set(event, new Set());
        }
        this.nodes.get(event).add({ handler, priority });
        
        return () => this.off(event, handler);
    }

    off(event, handler) {
        const handlers = this.nodes.get(event);
        if (handlers) {
            for (const h of handlers) {
                if (h.handler === handler) {
                    handlers.delete(h);
                    break;
                }
            }
        }
    }

    emit(event, data, depth = 0) {
        const handlers = this.nodes.get(event);
        if (handlers) {
            const sorted = Array.from(handlers).sort((a, b) => b.priority - a.priority);
            sorted.forEach(({ handler }) => {
                try { handler(data); } catch (e) { console.error(e); }
            });
        }

        // Cascade to connected events
        if (depth < this.propagationDepth) {
            const connected = this.edges.get(event);
            connected?.forEach(nextEvent => {
                this.emit(nextEvent, { ...data, cascaded: true }, depth + 1);
            });
        }
    }

    connect(from, to) {
        if (!this.edges.has(from)) this.edges.set(from, new Set());
        this.edges.get(from).add(to);
    }
}

// ============================================
// TOPOLOGY: STATE MANIFOLD
// ============================================

class StateManifold {
    constructor(initial = {}) {
        this.state = initial;
        this.history = [];
        this.maxHistory = 100;
        this.topology = new EventTopology();
    }

    get(path) {
        return path.split('.').reduce((obj, key) => obj?.[key], this.state);
    }

    set(path, value) {
        const keys = path.split('.');
        const last = keys.pop();
        const target = keys.reduce((obj, key) => {
            if (!obj[key]) obj[key] = {};
            return obj[key];
        }, this.state);
        
        const previous = target[last];
        target[last] = value;
        
        this.history.push({ path, previous, value, tick: Date.now() });
        if (this.history.length > this.maxHistory) this.history.shift();
        
        this.topology.emit('state:change', { path, value, previous });
        this.topology.emit(`state:change:${path}`, { value, previous });
    }

    snapshot() {
        return JSON.parse(JSON.stringify(this.state));
    }

    restore(snapshot) {
        this.state = snapshot;
        this.topology.emit('state:restore', { snapshot });
    }
}

// ============================================
// TOPOLOGY: RIPPLES ENGINE
// ============================================

class RipplesEngine {
    constructor(config = {}) {
        // Event topology for loose coupling
        this.events = new EventTopology();
        
        // State manifold for reactive state
        this.state = new StateManifold({
            scenario: config.initialScenario || 'cupboard',
            selectedEntity: null,
            tick: 0,
            auditLog: [],
            isAutoplay: false,
            bpm: config.bpm || 20,
            generationMode: config.generationMode || 'latent',
            effectsIntensity: config.effectsIntensity || 0.5,
            rippleIntensity: 0,
            patterns: []
        });

        // Entity memory persists across scenarios
        this.memories = new Map();
        
        // Scenario registry
        this.scenarios = new Map();
        
        // Latent library
        this.latentLibrary = config.latentLibrary || {};
        
        // LLM adapter
        this.llm = config.llmAdapter || null;
        this.worldtextGenerator = null;
        
        // System instruction for LLM
        this.systemInstruction = config.systemInstruction || this.defaultSystemInstruction();
        
        // Bind state events
        this.bindStateEvents();
    }

    bindStateEvents() {
        this.state.topology.on('state:change', ({ path, value }) => {
            this.events.emit('state:update', { path, value, state: this.state.snapshot() });
        });
    }

    // ============================================
    // SCENARIO TOPOLOGY
    // ============================================

    registerScenario(scenario) {
        this.scenarios.set(scenario.id, scenario);
        
        // Initialize entity memories
        scenario.entities?.forEach(entity => {
            if (!this.memories.has(entity.id)) {
                this.memories.set(entity.id, {
                    encounters: 0,
                    lastVectors: [],
                    intensity: 0,
                    crossRipples: [],
                    states: []
                });
            }
        });
        
        this.events.emit('scenario:registered', { scenario });
    }

    loadScenario(scenarioId) {
        if (!this.scenarios.has(scenarioId)) {
            throw new Error(`Scenario not found: ${scenarioId}`);
        }

        const previous = this.state.get('scenario');
        this.state.set('scenario', scenarioId);
        this.state.set('selectedEntity', null);
        this.state.set('tick', 0);
        
        this.events.emit('scenario:change', {
            current: scenarioId,
            previous,
            scenario: this.getScenario()
        });
    }

    getScenario(id) {
        return this.scenarios.get(id || this.state.get('scenario'));
    }

    getScenarioIds() {
        return Array.from(this.scenarios.keys());
    }

    // ============================================
    // ENTITY TOPOLOGY
    // ============================================

    getEntity(id) {
        return this.getScenario().entities?.find(e => e.id === id);
    }

    getEntities() {
        return this.getScenario().entities || [];
    }

    selectEntity(entityId) {
        const entity = this.getEntity(entityId);
        if (!entity) return false;

        this.state.set('selectedEntity', entityId);
        
        const memory = this.memories.get(entityId);
        if (memory) {
            memory.encounters++;
            memory.intensity = Math.min(1, memory.intensity + 0.1);
            memory.states.push({ state: entity.state, tick: this.state.get('tick') });
        }

        this.events.emit('entity:select', {
            entity,
            memory: this.memories.get(entityId),
            scenario: this.getScenario()
        });

        return true;
    }

    // ============================================
    // VECTOR TOPOLOGY (The Core Operation)
    // ============================================

    async triggerVector(vector) {
        const entityId = this.state.get('selectedEntity');
        if (!entityId) return null;

        const entity = this.getEntity(entityId);
        const scenario = this.getScenario();
        
        // Generate worldtext
        const description = await this.generateWorldtext(entity, vector);
        
        // Build ripple
        const ripple = {
            tick: this.state.get('tick') + 1,
            entityId,
            entityName: entity.name,
            vector,
            description,
            mode: this.state.get('generationMode'),
            timestamp: Date.now(),
            cascades: this.calculateCascades(entity, vector, description)
        };

        // Update state
        this.state.set('tick', ripple.tick);
        this.updateEntityState(entity, vector);
        
        // Update memory
        const memory = this.memories.get(entityId);
        memory.lastVectors.unshift(vector);
        if (memory.lastVectors.length > 5) memory.lastVectors.pop();
        memory.intensity = 1;

        // Add to audit log
        const auditLog = this.state.get('auditLog');
        auditLog.unshift(ripple);
        if (auditLog.length > 100) auditLog.pop();
        this.state.set('auditLog', auditLog);

        // Detect patterns
        const patterns = this.detectPatterns();
        this.state.set('patterns', patterns);

        // Emit events
        this.events.emit('ripple:complete', {
            ripple,
            entity,
            patterns,
            scenario
        });

        this.events.emit(`vector:${vector.toLowerCase()}`, {
            ripple,
            entity
        });

        // Decay intensity
        setTimeout(() => {
            memory.intensity *= 0.7;
            this.events.emit('ripple:decay', { entityId, intensity: memory.intensity });
        }, 2000);

        return ripple;
    }

    async generateWorldtext(entity, vector) {
        // Use custom generator if set
        if (this.worldtextGenerator) {
            return this.worldtextGenerator(entity, vector);
        }

        // Use LLM if in generative mode
        if (this.state.get('generationMode') === 'generative' && this.llm) {
            return this.generateWithLLM(entity, vector);
        }

        // Fallback to latent library
        return this.getLatent(entity.id, vector);
    }

    getLatent(entityId, vector) {
        const scenario = this.getScenario();
        return scenario.latent?.[entityId]?.[vector] || 
            `[No latent description for ${entityId} + ${vector}]`;
    }

    async generateWithLLM(entity, vector) {
        if (!this.llm) return this.getLatent(entity.id, vector);

        const prompt = this.buildPrompt(entity, vector);
        
        this.events.emit('llm:request', { entity, vector, prompt });
        
        const description = await this.llm.generate(prompt, this.systemInstruction);
        
        this.events.emit('llm:response', { entity, vector, description });
        
        return description;
    }

    buildPrompt(entity, vector) {
        const scenario = this.getScenario();
        const memory = this.memories.get(entity.id);
        
        return `SCENARIO: ${scenario.name}
BASELINE: ${scenario.baseline?.substring(0, 200)}...
ENTITY: ${entity.name} (${entity.type}, state: ${entity.state})
VECTOR: ${vector}
PRIOR: ${memory.encounters} encounters, recent: ${memory.lastVectors.slice(0, 3).join(', ') || 'none'}

Write 150-250 words from this entity's first-person phenomenological perspective experiencing the ${vector} vector. Use uncertainty markers (might, perhaps, as if). Emphasize state change over narrative. Chemical cartography: perceive through the entity's sensory system.`;
    }

    setWorldtextGenerator(generator) {
        this.worldtextGenerator = generator;
    }

    // ============================================
    // CASCADE TOPOLOGY
    // ============================================

    calculateCascades(source, vector, description) {
        const cascades = [];
        
        source.adjacentTo?.forEach((adjId, index) => {
            const adjEntity = this.getEntity(adjId);
            if (!adjEntity) return;

            const intensity = 0.5 - (index * 0.1);
            
            cascades.push({
                entityId: adjId,
                entityName: adjEntity.name,
                intensity: Math.max(0.1, intensity),
                description: this.generateCascadeDescription(source, adjEntity, vector)
            });
        });

        return cascades;
    }

    generateCascadeDescription(source, target, vector) {
        const templates = {
            GOAL: `${target.name} senses ${source.name}'s purposeful movement, adjusts accordingly.`,
            OBSTACLE: `${target.name} perceives ${source.name}'s struggle, responds to disturbance.`,
            SHIFT: `${target.name} detects ${source.name}'s transformation, enters alert state.`
        };
        return templates[vector] || `${target.name} responds to ${source.name}'s ripple.`;
    }

    updateEntityState(entity, vector) {
        const stateMap = {
            GOAL: 'pursuing',
            OBSTACLE: 'resisting',
            SHIFT: 'transforming'
        };
        
        entity.state = stateMap[vector] || entity.state;
        
        this.events.emit('entity:stateChange', {
            entity,
            previousState: entity.state,
            newState: stateMap[vector],
            vector
        });
    }

    // ============================================
    // PATTERN TOPOLOGY
    // ============================================

    detectPatterns() {
        const patterns = [];
        const auditLog = this.state.get('auditLog');
        const recent = auditLog.slice(0, 10);
        
        // Entity intensity pattern
        const entityCounts = {};
        recent.forEach(r => {
            entityCounts[r.entityId] = (entityCounts[r.entityId] || 0) + 1;
        });
        
        Object.entries(entityCounts).forEach(([id, count]) => {
            if (count >= 3) {
                const entity = this.getEntity(id);
                patterns.push({
                    type: 'entity_intensity',
                    description: `${entity?.name || id} is experiencing rapid state changes`,
                    entityIds: [id],
                    confidence: count / 10
                });
            }
        });

        // Vector dominance pattern
        const vectorCounts = {};
        recent.forEach(r => {
            vectorCounts[r.vector] = (vectorCounts[r.vector] || 0) + 1;
        });
        
        Object.entries(vectorCounts).forEach(([vector, count]) => {
            if (count >= 5) {
                patterns.push({
                    type: 'vector_dominance',
                    description: `${vector} vector is dominant in this ecology`,
                    entityIds: recent.filter(r => r.vector === vector).map(r => r.entityId),
                    confidence: count / 10
                });
            }
        });

        // Network resonance pattern
        const cascadeCount = recent.reduce((sum, r) => sum + (r.cascades?.length || 0), 0);
        if (cascadeCount >= 8) {
            patterns.push({
                type: 'network_resonance',
                description: 'Entities are tightly coupled; ripples propagate widely',
                entityIds: [...new Set(recent.flatMap(r => [r.entityId, ...(r.cascades?.map(c => c.entityId) || [])]))],
                confidence: cascadeCount / 20
            });
        }

        return patterns;
    }

    // ============================================
    // AUTOPLAY TOPOLOGY
    // ============================================

    startAutoplay() {
        if (this.state.get('isAutoplay')) return;
        
        this.state.set('isAutoplay', true);
        const intervalMs = 60000 / this.state.get('bpm');
        
        this.autoplayInterval = setInterval(() => {
            const scenario = this.getScenario();
            const entities = this.getEntities();
            
            if (entities.length === 0) return;
            
            const randomEntity = entities[Math.floor(Math.random() * entities.length)];
            const vectors = ['GOAL', 'OBSTACLE', 'SHIFT'];
            const randomVector = vectors[Math.floor(Math.random() * vectors.length)];
            
            this.selectEntity(randomEntity.id);
            setTimeout(() => this.triggerVector(randomVector), 100);
        }, intervalMs);

        this.events.emit('autoplay:start', { bpm: this.state.get('bpm') });
    }

    stopAutoplay() {
        this.state.set('isAutoplay', false);
        
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
        
        this.events.emit('autoplay:stop');
    }

    // ============================================
    // SYSTEM INSTRUCTION
    // ============================================

    defaultSystemInstruction() {
        return `You are RIPPLES, a Worldtext Generator for imaginary ecologies.

CORE PRINCIPLES:
1. Write from WITHIN the entity's perspective (first-person phenomenology)
2. Emphasize STATE CHANGE, not narrative progression
3. Use uncertainty language: "might", "perhaps", "as if"
4. Use the entity's sensory system (chemical gradients for ants, light patterns for shadows)
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
- Avoid anthropomorphism`;
    }

    // ============================================
    // SERIALIZATION
    // ============================================

    serialize() {
        return {
            state: this.state.snapshot(),
            memories: Array.from(this.memories.entries()),
            timestamp: Date.now()
        };
    }

    deserialize(data) {
        this.state.restore(data.state);
        this.memories = new Map(data.memories);
        this.events.emit('state:restore', { data });
    }
}

// ============================================
// LLM ADAPTER BASE
// ============================================

class LLMAdapter {
    constructor(config) {
        this.config = config;
    }

    async generate(prompt, systemInstruction) {
        throw new Error('LLM adapter must implement generate()');
    }
}

class MockLLMAdapter extends LLMAdapter {
    async generate(prompt, systemInstruction) {
        await new Promise(r => setTimeout(r, 500 + Math.random() * 500));
        
        const entityMatch = prompt.match(/ENTITY:\s*(.+?)\s*\(/);
        const vectorMatch = prompt.match(/VECTOR:\s*(\w+)/);
        
        const entity = entityMatch ? entityMatch[1] : 'Entity';
        const vector = vectorMatch ? vectorMatch[1] : 'SHIFT';
        
        const responses = {
            GOAL: [
                `${entity} abandons its current trajectory, drawn toward an unseen objective. The world reorganizes itself around this new vector of desire. Each sensation becomes a signal, each signal a step closer to the goal.`,
                `Purpose crystallizes. ${entity} transitions from passive reception to active pursuit. The environment transforms from static background to navigable terrain.`
            ],
            OBSTACLE: [
                `${entity} encounters resistance. What was fluid becomes fixed, what was open becomes closed. The entity pauses, reassesses, searches for alternatives.`,
                `Progress halts at a boundary. ${entity} tests the limit, probing for weakness, seeking passage.`
            ],
            SHIFT: [
                `${entity} undergoes transformation. Some essential quality changes—state, identity, metabolism. What was is no longer; what will be has not yet arrived.`,
                `A threshold is crossed. ${entity} enters a new phase, adopts a new mode, becomes a new version of itself.`
            ]
        };
        
        const options = responses[vector] || responses.SHIFT;
        return options[Math.floor(Math.random() * options.length)];
    }
}

// ============================================
// EXPORTS
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        RipplesEngine, 
        EventTopology, 
        StateManifold,
        LLMAdapter, 
        MockLLMAdapter 
    };
}
