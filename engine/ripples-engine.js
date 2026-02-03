/**
 * RIPPLES ENGINE
 * ===============
 * Headless core engine for worldtext generation.
 * No DOM dependencies. Pure state machine with event system.
 * 
 * ARCHITECTURE:
 * - State: Scenario, entities, selection, tick, audit log
 * - Events: All state changes emit events for visualization adapters
 * - Vectors: GOAL, OBSTACLE, SHIFT trigger ripples
 * - Autoplay: Autonomous mode with configurable interval
 * 
 * USAGE:
 * ```javascript
 * const engine = new RipplesEngine({ latentLibrary });
 * engine.on('ripple:complete', (ripple) => console.log(ripple.worldtext));
 * engine.loadScenario('cupboard');
 * engine.selectEntity('ant');
 * engine.triggerVector('GOAL');
 * ```
 * 
 * TOKEN EFFICIENCY:
 * - Engine state serializes to ~2KB JSON
 * - Latent library per scenario: ~8KB
 * - Audit log capped at 50 entries: ~4KB
 * - Total context for LLM: ~15KB compressed
 */

export class RipplesEngine {
    /**
     * Create a new RIPPLES engine instance
     * @param {Object} config - Configuration object
     * @param {Object} config.latentLibrary - Library of scenarios and latent descriptions
     * @param {number} config.autoplayInterval - Milliseconds between autoplay ripples (default: 3000)
     * @param {number} config.maxAuditEntries - Maximum audit log entries to keep (default: 50)
     */
    constructor(config = {}) {
        // Configuration
        this.config = {
            autoplayInterval: 3000,
            maxAuditEntries: 50,
            ...config
        };

        // Latent library (required)
        this.latentLibrary = config.latentLibrary || {};

        // Core state
        this.state = {
            scenario: null,           // Current scenario ID
            entities: [],             // Entities in current scenario
            selectedEntity: null,     // Currently selected entity ID
            tick: 0,                  // Ripple counter
            auditLog: [],             // Array of { tick, timestamp, entity, vector, result }
            isAutoplay: false,        // Autoplay mode active
            lastVector: null,         // Last applied vector
            lastRipple: null          // Last generated ripple text
        };

        // Internal timers
        this._autoplayTimer = null;
        this._countdownTimer = null;
        this._countdownValue = 0;

        // Event listeners map: event -> Set<callback>
        this._listeners = new Map();
    }

    // ============================================
    // EVENT SYSTEM
    // ============================================

    /**
     * Subscribe to an engine event
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     * 
     * EVENTS:
     * - 'scenario:change' → { scenario, entities, baseline }
     * - 'entity:select' → { entity }
     * - 'entity:deselect' → {}
     * - 'vector:trigger' → { entity, vector }
     * - 'ripple:complete' → { entity, vector, worldtext, tick }
     * - 'tick:increment' → { tick }
     * - 'audit:add' → { entry }
     * - 'autoplay:start' → {}
     * - 'autoplay:stop' → {}
     * - 'autoplay:tick' → { countdown }
     * - 'state:change' → { state }
     */
    on(event, callback) {
        if (!this._listeners.has(event)) {
            this._listeners.set(event, new Set());
        }
        this._listeners.get(event).add(callback);

        // Return unsubscribe function
        return () => {
            this._listeners.get(event)?.delete(callback);
        };
    }

    /**
     * Emit an event to all subscribers
     * @param {string} event - Event name
     * @param {Object} data - Event payload
     */
    emit(event, data = {}) {
        const callbacks = this._listeners.get(event);
        if (callbacks) {
            callbacks.forEach(cb => {
                try {
                    cb(data);
                } catch (e) {
                    console.error(`[RipplesEngine] Error in ${event} handler:`, e);
                }
            });
        }
        // Always emit state:change for any mutation
        if (event !== 'state:change') {
            this._listeners.get('state:change')?.forEach(cb => {
                try {
                    cb({ state: this.getState(), event, data });
                } catch (e) {
                    console.error('[RipplesEngine] Error in state:change handler:', e);
                }
            });
        }
    }

    // ============================================
    // SCENARIO MANAGEMENT
    // ============================================

    /**
     * Load a scenario by ID
     * @param {string} scenarioId - Scenario identifier
     * @returns {Object} Loaded scenario
     */
    loadScenario(scenarioId) {
        const scenario = this.latentLibrary[scenarioId];
        if (!scenario) {
            throw new Error(`[RipplesEngine] Unknown scenario: ${scenarioId}`);
        }

        // Reset state
        this.state.scenario = scenarioId;
        this.state.entities = [...scenario.entities];
        this.state.selectedEntity = null;
        this.state.tick = 0;
        this.state.auditLog = [];
        this.state.lastVector = null;
        this.state.lastRipple = null;

        // Stop autoplay if running
        this.stopAutoplay();

        this.emit('scenario:change', {
            scenario: scenarioId,
            name: scenario.name,
            entities: this.state.entities,
            baseline: scenario.baseline
        });

        return scenario;
    }

    /**
     * Get the current scenario object
     * @returns {Object|null} Current scenario or null
     */
    getScenario() {
        if (!this.state.scenario) return null;
        return this.latentLibrary[this.state.scenario];
    }

    /**
     * Get the baseline worldtext for current scenario
     * @returns {string} Baseline text
     */
    getBaseline() {
        return this.getScenario()?.baseline || '';
    }

    /**
     * Get list of available scenario IDs
     * @returns {string[]} Array of scenario IDs
     */
    getScenarioIds() {
        return Object.keys(this.latentLibrary);
    }

    // ============================================
    // ENTITY MANAGEMENT
    // ============================================

    /**
     * Get all entities in the current scenario
     * @returns {Object[]} Array of entity objects
     */
    getEntities() {
        return this.state.entities;
    }

    /**
     * Get a specific entity by ID
     * @param {string} entityId - Entity identifier
     * @returns {Object|null} Entity object or null
     */
    getEntity(entityId) {
        return this.state.entities.find(e => e.id === entityId) || null;
    }

    /**
     * Get the currently selected entity
     * @returns {Object|null} Selected entity or null
     */
    getSelectedEntity() {
        if (!this.state.selectedEntity) return null;
        return this.getEntity(this.state.selectedEntity);
    }

    /**
     * Select an entity by ID
     * @param {string} entityId - Entity identifier
     * @returns {Object} Selected entity
     */
    selectEntity(entityId) {
        const entity = this.getEntity(entityId);
        if (!entity) {
            throw new Error(`[RipplesEngine] Unknown entity: ${entityId}`);
        }

        this.state.selectedEntity = entityId;
        this.emit('entity:select', { entity });

        return entity;
    }

    /**
     * Deselect the current entity
     */
    deselectEntity() {
        this.state.selectedEntity = null;
        this.emit('entity:deselect', {});
    }

    // ============================================
    // VECTOR PROCESSING
    // ============================================

    /**
     * Get available vectors
     * @returns {string[]} Array of vector names
     */
    getVectors() {
        return ['GOAL', 'OBSTACLE', 'SHIFT'];
    }

    /**
     * Get the latent description for an entity + vector combination
     * @param {string} entityId - Entity identifier
     * @param {string} vector - Vector name (GOAL, OBSTACLE, SHIFT)
     * @returns {string|null} Latent description or null
     */
    getLatent(entityId, vector) {
        const scenario = this.getScenario();
        if (!scenario) return null;
        return scenario.latent?.[entityId]?.[vector] || null;
    }

    /**
     * Trigger a vector on the currently selected entity
     * @param {string} vector - Vector name (GOAL, OBSTACLE, SHIFT)
     * @returns {Object} Ripple result { entity, vector, worldtext, tick }
     */
    triggerVector(vector) {
        if (!this.state.selectedEntity) {
            throw new Error('[RipplesEngine] No entity selected');
        }

        const validVectors = this.getVectors();
        if (!validVectors.includes(vector)) {
            throw new Error(`[RipplesEngine] Invalid vector: ${vector}`);
        }

        const entity = this.getSelectedEntity();
        const worldtext = this.getLatent(this.state.selectedEntity, vector);

        if (!worldtext) {
            throw new Error(`[RipplesEngine] No latent found for ${this.state.selectedEntity}:${vector}`);
        }

        // Emit trigger event
        this.emit('vector:trigger', { entity, vector });

        // Increment tick
        this.state.tick++;
        this.emit('tick:increment', { tick: this.state.tick });

        // Update entity state based on vector
        const entityIndex = this.state.entities.findIndex(e => e.id === entity.id);
        if (entityIndex !== -1) {
            const newState = vector === 'GOAL' ? 'pursuing' :
                vector === 'OBSTACLE' ? 'resisting' : 'transforming';
            this.state.entities[entityIndex] = { ...entity, state: newState };
        }

        // Store last ripple
        this.state.lastVector = vector;
        this.state.lastRipple = worldtext;

        // Create ripple result
        const ripple = {
            entity,
            vector,
            worldtext,
            tick: this.state.tick,
            timestamp: Date.now()
        };

        // Add to audit log
        this._addAuditEntry(ripple);

        // Emit complete event
        this.emit('ripple:complete', ripple);

        return ripple;
    }

    // ============================================
    // AUDIT LOG
    // ============================================

    /**
     * Get the audit log
     * @returns {Object[]} Array of audit entries
     */
    getAuditLog() {
        return this.state.auditLog;
    }

    /**
     * Add an entry to the audit log
     * @private
     * @param {Object} ripple - Ripple result
     */
    _addAuditEntry(ripple) {
        const entry = {
            tick: ripple.tick,
            timestamp: ripple.timestamp,
            entityId: ripple.entity.id,
            entityName: ripple.entity.name,
            vector: ripple.vector,
            result: ripple.worldtext.substring(0, 80) + '...'
        };

        // Prepend to maintain newest-first order
        this.state.auditLog.unshift(entry);

        // Trim to max entries
        if (this.state.auditLog.length > this.config.maxAuditEntries) {
            this.state.auditLog = this.state.auditLog.slice(0, this.config.maxAuditEntries);
        }

        this.emit('audit:add', { entry });
    }

    // ============================================
    // AUTOPLAY
    // ============================================

    /**
     * Start autoplay mode
     */
    startAutoplay() {
        if (this.state.isAutoplay) return;

        this.state.isAutoplay = true;
        this._countdownValue = Math.floor(this.config.autoplayInterval / 1000);

        this.emit('autoplay:start', {});

        // Countdown timer (every second)
        this._countdownTimer = setInterval(() => {
            this._countdownValue--;
            if (this._countdownValue < 0) {
                this._countdownValue = Math.floor(this.config.autoplayInterval / 1000);
            }
            this.emit('autoplay:tick', { countdown: this._countdownValue });
        }, 1000);

        // Autoplay timer
        this._autoplayTimer = setInterval(() => {
            this._triggerRandomRipple();
            this._countdownValue = Math.floor(this.config.autoplayInterval / 1000);
        }, this.config.autoplayInterval);
    }

    /**
     * Stop autoplay mode
     */
    stopAutoplay() {
        if (!this.state.isAutoplay) return;

        this.state.isAutoplay = false;

        if (this._autoplayTimer) {
            clearInterval(this._autoplayTimer);
            this._autoplayTimer = null;
        }
        if (this._countdownTimer) {
            clearInterval(this._countdownTimer);
            this._countdownTimer = null;
        }

        this.emit('autoplay:stop', {});
    }

    /**
     * Toggle autoplay mode
     * @returns {boolean} New autoplay state
     */
    toggleAutoplay() {
        if (this.state.isAutoplay) {
            this.stopAutoplay();
        } else {
            this.startAutoplay();
        }
        return this.state.isAutoplay;
    }

    /**
     * Trigger a random ripple (for autoplay)
     * @private
     */
    _triggerRandomRipple() {
        const entities = this.getEntities();
        if (entities.length === 0) return;

        // Pick random entity
        const randomEntity = entities[Math.floor(Math.random() * entities.length)];

        // Pick random vector
        const vectors = this.getVectors();
        const randomVector = vectors[Math.floor(Math.random() * vectors.length)];

        // Select and trigger
        try {
            this.selectEntity(randomEntity.id);
            this.triggerVector(randomVector);
        } catch (e) {
            console.warn('[RipplesEngine] Autoplay ripple failed:', e.message);
        }
    }

    // ============================================
    // STATE EXPORT/IMPORT
    // ============================================

    /**
     * Export current engine state for serialization
     * @returns {Object} Serializable state object
     */
    exportState() {
        return {
            scenario: this.state.scenario,
            entities: this.state.entities,
            selectedEntity: this.state.selectedEntity,
            tick: this.state.tick,
            auditLog: this.state.auditLog,
            isAutoplay: this.state.isAutoplay,
            lastVector: this.state.lastVector,
            lastRipple: this.state.lastRipple
        };
    }

    /**
     * Import state from a serialized object
     * @param {Object} state - Previously exported state
     */
    importState(state) {
        this.state = { ...this.state, ...state };
        this.emit('state:change', { state: this.getState(), event: 'import', data: {} });
    }

    /**
     * Get a snapshot of current state (shallow copy)
     * @returns {Object} Current state
     */
    getState() {
        return { ...this.state };
    }

    // ============================================
    // UTILITIES
    // ============================================

    /**
     * Reset the engine to initial state
     */
    reset() {
        this.stopAutoplay();
        this.state = {
            scenario: null,
            entities: [],
            selectedEntity: null,
            tick: 0,
            auditLog: [],
            isAutoplay: false,
            lastVector: null,
            lastRipple: null
        };
        this.emit('state:change', { state: this.getState(), event: 'reset', data: {} });
    }

    /**
     * Get engine version
     * @returns {string} Version string
     */
    static get VERSION() {
        return '1.0.0';
    }
}

// Default export
export default RipplesEngine;
