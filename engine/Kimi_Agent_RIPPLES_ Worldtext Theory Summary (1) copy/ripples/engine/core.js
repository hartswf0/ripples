/**
 * RIPPLES CORE ENGINE
 * ===================
 * 
 * The engine is the beating heart of RIPPLES. It knows nothing about DOM,
 * CSS, or rendering. It speaks only in state, events, and pure functions.
 * 
 * CONTEXT WINDOW MAPPING:
 * - Core Engine: ~800 tokens (state, logic, pure functions)
 * - Event System: ~200 tokens (pub/sub, ripple propagation)
 * - Total Core: ~1000 tokens (fits comfortably in any context)
 * 
 * TOKEN EFFICIENCY PRINCIPLES:
 * 1. No framework dependencies
 * 2. Minimal external APIs
 * 3. Functional state transitions
 * 4. Event-driven architecture
 */

// ============================================
// CORE TYPES (JSDoc for LLM context)
// ============================================

/**
 * @typedef {Object} Entity
 * @property {string} id - Unique identifier
 * @property {string} name - Display name
 * @property {'animate'|'inanimate'|'abstract'|'temporal'|'geological'} type - Ontological category
 * @property {string} state - Current behavioral state
 * @property {string} icon - Visual representation
 * @property {{x:number,y:number}} position - Grid coordinates
 * @property {string[]} adjacentTo - IDs of connected entities
 * @property {EntityMemory} memory - Accumulated experience
 */

/**
 * @typedef {Object} EntityMemory
 * @property {number} encounters - Times this entity has been activated
 * @property {string[]} lastVectors - Recent vector applications
 * @property {number} intensity - Current ripple intensity (0-1)
 * @property {CrossScenarioRipple[]} crossRipples - Connections to other scenarios
 */

/**
 * @typedef {Object} CrossScenarioRipple
 * @property {string} scenarioId - Target scenario
 * @property {string} entityId - Target entity
 * @property {string} vector - Vector that created connection
 * @property {number} timestamp - When connection formed
 */

/**
 * @typedef {Object} Vector
 * @property {'GOAL'|'OBSTACLE'|'SHIFT'} type - The three forces
 * @property {string} color - Visual identifier
 * @property {string} key - Keyboard shortcut
 */

/**
 * @typedef {Object} Ripple
 * @property {number} tick - System timestamp
 * @property {string} entityId - Source entity
 * @property {string} vector - Applied force
 * @property {string} description - Generated worldtext
 * @property {'latent'|'generative'} mode - Generation source
 * @property {number} timestamp - Real-world time
 * @property {CascadeEffect[]} cascades - Secondary effects
 */

/**
 * @typedef {Object} CascadeEffect
 * @property {string} entityId - Affected entity
 * @property {number} intensity - Effect strength (0.1-0.5 for secondary)
 * @property {string} description - Brief cascade description
 */

/**
 * @typedef {Object} Scenario
 * @property {string} id - Scenario identifier
 * @property {string} name - Display name
 * @property {string} baseline - Default worldtext
 * @property {{cols:number,rows:number}} grid - Dimensions
 * @property {Entity[]} entities - Inhabitants
 * @property {Object} latent - Pre-written descriptions
 * @property {AmbientBehavior[]} ambient - Autoplay behaviors
 */

/**
 * @typedef {Object} AmbientBehavior
 * @property {string} entityId - Entity to activate
 * @property {string} vector - Vector to apply
 * @property {number} probability - Chance per tick (0-1)
 */

/**
 * @typedef {Object} EngineState
 * @property {string} currentScenario - Active scenario ID
 * @property {string|null} selectedEntity - Focused entity ID
 * @property {number} tick - Global event counter
 * @property {Ripple[]} auditLog - History
 * @property {boolean} isAutoplay - Autonomous mode
 * @property {number} bpm - Beats per minute
 * @property {'latent'|'generative'} generationMode - Text source
 * @property {Object} llmConfig - AI provider settings
 * @property {Map<string,EntityMemory>} entityMemories - Persistent state
 * @property {EmergentPattern[]} detectedPatterns - System insights
 */

/**
 * @typedef {Object} EmergentPattern
 * @property {string} type - Pattern category
 * @property {string} description - Human-readable insight
 * @property {string[]} entityIds - Involved entities
 * @property {number} confidence - Detection certainty (0-1)
 */

// ============================================
// EVENT SYSTEM (Pub/Sub for decoupling)
// ============================================

class EventBus {
    constructor() {
        this.listeners = new Map();
    }

    /**
     * Subscribe to engine events
     * @param {string} event - Event type
     * @param {Function} callback - Handler
     * @returns {Function} Unsubscribe function
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
        
        return () => this.listeners.get(event)?.delete(callback);
    }

    /**
     * Emit event to all subscribers
     * @param {string} event - Event type
     * @param {*} data - Event payload
     */
    emit(event, data) {
        this.listeners.get(event)?.forEach(cb => {
            try { cb(data); } catch (e) { console.error(e); }
        });
    }
}

// ============================================
// CORE ENGINE
// ============================================

class RipplesEngine {
    constructor(config = {}) {
        // Event system for loose coupling
        this.events = new EventBus();
        
        // Core state (serializable)
        this.state = {
            currentScenario: config.initialScenario || 'cupboard',
            selectedEntity: null,
            tick: 0,
            auditLog: [],
            isAutoplay: false,
            bpm: config.bpm || 20,
            effectsIntensity: config.effectsIntensity || 0.5,
            generationMode: config.generationMode || 'latent',
            llmConfig: config.llmConfig || { provider: 'mock' },
            autoplayInterval: null,
            countdownInterval: null,
            countdownValue: 3
        };

        // Entity memories persist across scenarios
        this.entityMemories = new Map();
        
        // Scenario registry
        this.scenarios = new Map();
        
        // LLM prompt templates
        this.prompts = config.prompts || {};
        
        // Generative model interface
        this.llm = config.llmAdapter || null;
    }

    // ============================================
    // SCENARIO MANAGEMENT
    // ============================================

    /**
     * Register a scenario with the engine
     * @param {Scenario} scenario
     */
    registerScenario(scenario) {
        this.scenarios.set(scenario.id, scenario);
        
        // Initialize entity memories
        scenario.entities.forEach(entity => {
            if (!this.entityMemories.has(entity.id)) {
                this.entityMemories.set(entity.id, {
                    encounters: 0,
                    lastVectors: [],
                    intensity: 0,
                    crossRipples: []
                });
            }
        });
        
        this.events.emit('scenario:registered', { scenario });
    }

    /**
     * Switch active scenario
     * @param {string} scenarioId
     */
    loadScenario(scenarioId) {
        if (!this.scenarios.has(scenarioId)) {
            throw new Error(`Scenario not found: ${scenarioId}`);
        }

        const previous = this.state.currentScenario;
        this.state.currentScenario = scenarioId;
        this.state.selectedEntity = null;
        this.state.tick = 0;
        
        this.events.emit('scenario:changed', {
            current: scenarioId,
            previous,
            scenario: this.getCurrentScenario()
        });
    }

    /**
     * Get currently active scenario
     * @returns {Scenario}
     */
    getCurrentScenario() {
        return this.scenarios.get(this.state.currentScenario);
    }

    /**
     * Get entity by ID from current scenario
     * @param {string} entityId
     * @returns {Entity|undefined}
     */
    getEntity(entityId) {
        return this.getCurrentScenario().entities.find(e => e.id === entityId);
    }

    // ============================================
    // ENTITY SELECTION
    // ============================================

    /**
     * Select entity for perspective lock
     * @param {string} entityId
     */
    selectEntity(entityId) {
        const entity = this.getEntity(entityId);
        if (!entity) return;

        this.state.selectedEntity = entityId;
        
        // Update memory
        const memory = this.entityMemories.get(entityId);
        if (memory) {
            memory.encounters++;
            memory.intensity = Math.min(1, memory.intensity + 0.1);
        }

        this.events.emit('entity:selected', {
            entity,
            memory: this.entityMemories.get(entityId),
            scenario: this.getCurrentScenario()
        });
    }

    // ============================================
    // RIPPLE GENERATION (Core Operation)
    // ============================================

    /**
     * Apply vector to selected entity - THE PRIMARY OPERATION
     * @param {'GOAL'|'OBSTACLE'|'SHIFT'} vector
     * @returns {Promise<Ripple>}
     */
    async triggerRipple(vector) {
        if (!this.state.selectedEntity) {
            throw new Error('No entity selected');
        }

        const entity = this.getEntity(this.state.selectedEntity);
        const scenario = this.getCurrentScenario();
        
        // Generate or retrieve description
        const description = await this.generateWorldtext(entity, vector);
        
        // Build ripple object
        const ripple = {
            tick: ++this.state.tick,
            entityId: entity.id,
            entityName: entity.name,
            vector,
            description,
            mode: this.state.generationMode,
            timestamp: Date.now(),
            cascades: []
        };

        // Calculate cascade effects to adjacent entities
        if (entity.adjacentTo) {
            ripple.cascades = this.calculateCascades(entity, vector, description);
        }

        // Update entity state based on vector
        this.updateEntityState(entity, vector);
        
        // Update memory
        const memory = this.entityMemories.get(entity.id);
        memory.lastVectors.unshift(vector);
        if (memory.lastVectors.length > 5) memory.lastVectors.pop();
        memory.intensity = 1;

        // Detect emergent patterns
        const patterns = this.detectPatterns();
        
        // Add to audit log
        this.state.auditLog.unshift(ripple);
        
        // Emit events
        this.events.emit('ripple:triggered', {
            ripple,
            entity,
            patterns,
            scenario
        });

        // Decay intensity over time
        setTimeout(() => {
            memory.intensity *= 0.7;
            this.events.emit('ripple:decay', { entityId: entity.id, intensity: memory.intensity });
        }, 2000);

        return ripple;
    }

    /**
     * Generate worldtext - LATENT or GENERATIVE
     * @param {Entity} entity
     * @param {string} vector
     * @returns {Promise<string>}
     */
    async generateWorldtext(entity, vector) {
        if (this.state.generationMode === 'latent') {
            return this.getLatentDescription(entity.id, vector);
        }

        // Generative mode
        return this.generateWithLLM(entity, vector);
    }

    /**
     * Retrieve pre-written description
     * @param {string} entityId
     * @param {string} vector
     * @returns {string}
     */
    getLatentDescription(entityId, vector) {
        const scenario = this.getCurrentScenario();
        return scenario.latent?.[entityId]?.[vector] || 
            `[No latent description for ${entityId} + ${vector}]`;
    }

    /**
     * Generate description via LLM
     * @param {Entity} entity
     * @param {string} vector
     * @returns {Promise<string>}
     */
    async generateWithLLM(entity, vector) {
        if (!this.llm) {
            throw new Error('No LLM adapter configured');
        }

        const scenario = this.getCurrentScenario();
        const memory = this.entityMemories.get(entity.id);
        
        const prompt = this.buildPrompt(entity, vector, scenario, memory);
        
        this.events.emit('llm:generating', { entity, vector, prompt });
        
        const description = await this.llm.generate(prompt);
        
        this.events.emit('llm:generated', { entity, vector, description });
        
        return description;
    }

    /**
     * Build LLM prompt with context window optimization
     * @param {Entity} entity
     * @param {string} vector
     * @param {Scenario} scenario
     * @param {EntityMemory} memory
     * @returns {string}
     */
    buildPrompt(entity, vector, scenario, memory) {
        const template = this.prompts.worldtext || this.defaultPromptTemplate();
        
        return template
            .replace('{{SCENARIO_NAME}}', scenario.name)
            .replace('{{BASELINE}}', scenario.baseline)
            .replace('{{ENTITY_NAME}}', entity.name)
            .replace('{{ENTITY_TYPE}}', entity.type)
            .replace('{{ENTITY_STATE}}', entity.state)
            .replace('{{VECTOR}}', vector)
            .replace('{{ENCOUNTERS}}', memory.encounters)
            .replace('{{LAST_VECTORS}}', memory.lastVectors.slice(0, 3).join(', ') || 'none');
    }

    /**
     * Default prompt template (token-efficient)
     * @returns {string}
     */
    defaultPromptTemplate() {
        return `SCENARIO: {{SCENARIO_NAME}}
BASELINE: {{BASELINE}}
ENTITY: {{ENTITY_NAME}} ({{ENTITY_TYPE}}, state: {{ENTITY_STATE}})
VECTOR: {{VECTOR}}
PRIOR: {{ENCOUNTERS}} encounters, recent: {{LAST_VECTORS}}

Write 150-250 words from this entity's first-person phenomenological perspective experiencing the {{VECTOR}} vector. Use uncertainty markers (might, perhaps, as if). Emphasize state change over narrative. Chemical cartography: perceive through the entity's sensory system.`;
    }

    // ============================================
    // CASCADE CALCULATION
    // ============================================

    /**
     * Calculate secondary effects on adjacent entities
     * @param {Entity} source
     * @param {string} vector
     * @param {string} sourceDescription
     * @returns {CascadeEffect[]}
     */
    calculateCascades(source, vector, sourceDescription) {
        const cascades = [];
        
        source.adjacentTo?.forEach((adjId, index) => {
            const adjEntity = this.getEntity(adjId);
            if (!adjEntity) return;

            const intensity = 0.5 - (index * 0.1); // Decay with distance
            
            cascades.push({
                entityId: adjId,
                entityName: adjEntity.name,
                intensity: Math.max(0.1, intensity),
                description: this.generateCascadeDescription(source, adjEntity, vector)
            });
        });

        return cascades;
    }

    /**
     * Generate brief cascade description
     * @param {Entity} source
     * @param {Entity} target
     * @param {string} vector
     * @returns {string}
     */
    generateCascadeDescription(source, target, vector) {
        const templates = {
            GOAL: `${target.name} senses ${source.name}'s purposeful movement, adjusts accordingly.`,
            OBSTACLE: `${target.name} perceives ${source.name}'s struggle, responds to disturbance.`,
            SHIFT: `${target.name} detects ${source.name}'s transformation, enters alert state.`
        };
        return templates[vector] || `${target.name} responds to ${source.name}'s ripple.`;
    }

    // ============================================
    // STATE MANAGEMENT
    // ============================================

    /**
     * Update entity state based on vector
     * @param {Entity} entity
     * @param {string} vector
     */
    updateEntityState(entity, vector) {
        const stateMap = {
            GOAL: 'pursuing',
            OBSTACLE: 'resisting',
            SHIFT: 'transforming'
        };
        
        entity.state = stateMap[vector] || entity.state;
        
        this.events.emit('entity:stateChanged', {
            entity,
            previousState: entity.state,
            newState: stateMap[vector],
            vector
        });
    }

    // ============================================
    // PATTERN DETECTION
    // ============================================

    /**
     * Detect emergent patterns in audit log
     * @returns {EmergentPattern[]}
     */
    detectPatterns() {
        const patterns = [];
        const recent = this.state.auditLog.slice(0, 10);
        
        // Pattern: Same entity, multiple vectors
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

        // Pattern: Vector dominance
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

        // Pattern: Cross-entity cascades
        const cascadeCount = recent.reduce((sum, r) => sum + (r.cascades?.length || 0), 0);
        if (cascadeCount >= 8) {
            patterns.push({
                type: 'network_resonance',
                description: 'Entities are tightly coupled; ripples propagate widely',
                entityIds: [...new Set(recent.flatMap(r => [r.entityId, ...(r.cascades?.map(c => c.entityId) || [])]))],
                confidence: cascadeCount / 20
            });
        }

        if (patterns.length > 0) {
            this.events.emit('patterns:detected', { patterns });
        }

        return patterns;
    }

    // ============================================
    // AUTOPLAY
    // ============================================

    startAutoplay() {
        if (this.state.isAutoplay) return;
        
        this.state.isAutoplay = true;
        const intervalMs = 60000 / this.state.bpm;
        
        this.state.autoplayInterval = setInterval(() => {
            const scenario = this.getCurrentScenario();
            const behaviors = scenario.ambient || [];
            
            // Weighted random selection based on probabilities
            const roll = Math.random();
            let cumulative = 0;
            
            for (const behavior of behaviors) {
                cumulative += behavior.probability;
                if (roll <= cumulative) {
                    this.selectEntity(behavior.entityId);
                    setTimeout(() => this.triggerRipple(behavior.vector), 100);
                    break;
                }
            }
            
            // Fallback: random entity/vector
            if (roll > cumulative) {
                const randomEntity = scenario.entities[Math.floor(Math.random() * scenario.entities.length)];
                const vectors = ['GOAL', 'OBSTACLE', 'SHIFT'];
                const randomVector = vectors[Math.floor(Math.random() * vectors.length)];
                
                this.selectEntity(randomEntity.id);
                setTimeout(() => this.triggerRipple(randomVector), 100);
            }
        }, intervalMs);

        this.events.emit('autoplay:started', { bpm: this.state.bpm });
    }

    stopAutoplay() {
        this.state.isAutoplay = false;
        
        if (this.state.autoplayInterval) {
            clearInterval(this.state.autoplayInterval);
            this.state.autoplayInterval = null;
        }
        
        this.events.emit('autoplay:stopped');
    }

    // ============================================
    // SERIALIZATION
    // ============================================

    /**
     * Export current session state
     * @returns {Object}
     */
    serialize() {
        return {
            state: this.state,
            entityMemories: Array.from(this.entityMemories.entries()),
            timestamp: Date.now()
        };
    }

    /**
     * Import session state
     * @param {Object} data
     */
    deserialize(data) {
        Object.assign(this.state, data.state);
        this.entityMemories = new Map(data.entityMemories);
        this.events.emit('state:restored', { data });
    }
}

// ============================================
// LLM ADAPTER INTERFACE
// ============================================

/**
 * Base class for LLM adapters
 * Implement this to connect OpenAI, Anthropic, Ollama, etc.
 */
class LLMAdapter {
    constructor(config) {
        this.config = config;
    }

    /**
     * Generate text from prompt
     * @param {string} prompt
     * @returns {Promise<string>}
     */
    async generate(prompt) {
        throw new Error('LLM adapter must implement generate()');
    }
}

/**
 * Mock adapter for testing/demo
 */
class MockLLMAdapter extends LLMAdapter {
    async generate(prompt) {
        // Simulate network delay
        await new Promise(r => setTimeout(r, 500 + Math.random() * 1000));
        
        // Extract entity and vector from prompt
        const entityMatch = prompt.match(/ENTITY:\s*(.+?)\s*\(/);
        const vectorMatch = prompt.match(/VECTOR:\s*(\w+)/);
        
        const entity = entityMatch ? entityMatch[1] : 'Entity';
        const vector = vectorMatch ? vectorMatch[1] : 'SHIFT';
        
        const responses = {
            GOAL: [
                `${entity} abandons its current trajectory, drawn toward an unseen objective. The world reorganizes itself around this new vector of desire. Each sensation becomes a signal, each signal a step closer to the goal. The entity is no longer drifting but aiming—a living projectile seeking its target.`,
                `Purpose crystallizes. ${entity} transitions from passive reception to active pursuit. The environment transforms from static background to navigable terrain. Obstacles become problems to solve, paths become possibilities to explore.`
            ],
            OBSTACLE: [
                `${entity} encounters resistance. What was fluid becomes fixed, what was open becomes closed. The entity pauses, reassesses, searches for alternatives. Frustration is not emotional but operational—a system encountering an incompatible input.`,
                `Progress halts at a boundary. ${entity} tests the limit, probing for weakness, seeking passage. The obstacle is not merely physical but informational: the entity's world-model must update to account for this new constraint.`
            ],
            SHIFT: [
                `${entity} undergoes transformation. Some essential quality changes—state, identity, metabolism. The shift may be visible or invisible, rapid or gradual, reversible or permanent. What was is no longer; what will be has not yet arrived.`,
                `A threshold is crossed. ${entity} enters a new phase, adopts a new mode, becomes a new version of itself. The change is total yet subtle, comprehensive yet contained within the entity's own boundaries.`
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
    module.exports = { RipplesEngine, EventBus, LLMAdapter, MockLLMAdapter };
}
