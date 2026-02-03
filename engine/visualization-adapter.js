/**
 * VISUALIZATION ADAPTER
 * =====================
 * Bridge between RIPPLES engine and any front-end renderer.
 * Subscribes to engine events and forwards to renderer methods.
 * Captures user input and forwards to engine commands.
 * 
 * USAGE:
 * ```javascript
 * const engine = new RipplesEngine({ latentLibrary });
 * const renderer = new GridRenderer(document.getElementById('app'));
 * const adapter = new VisualizationAdapter(engine, renderer);
 * 
 * engine.loadScenario('cupboard');
 * ```
 * 
 * RENDERER INTERFACE:
 * A renderer must implement these methods:
 * - renderScenario(data) → Called when scenario changes
 * - renderEntitySelect(data) → Called when entity is selected/deselected
 * - renderRipple(data) → Called when ripple completes
 * - renderAuditEntry(data) → Called when audit log updates
 * - renderTick(data) → Called when tick increments
 * - renderAutoplay(data) → Called when autoplay state changes
 * - renderCountdown(data) → Called every second in autoplay
 */

export class VisualizationAdapter {
    /**
     * Create a new adapter bridging an engine and renderer
     * @param {RipplesEngine} engine - The RIPPLES engine instance
     * @param {Object} renderer - The visualization renderer
     */
    constructor(engine, renderer) {
        this.engine = engine;
        this.renderer = renderer;
        this._unsubscribers = [];

        this._bindEngineEvents();
    }

    /**
     * Subscribe to all engine events and forward to renderer
     * @private
     */
    _bindEngineEvents() {
        // Scenario change → renderScenario
        this._subscribe('scenario:change', (data) => {
            this._callRenderer('renderScenario', {
                scenarioId: data.scenario,
                name: data.name,
                entities: data.entities,
                baseline: data.baseline
            });
        });

        // Entity select → renderEntitySelect
        this._subscribe('entity:select', (data) => {
            const latent = this._getEntityLatent(data.entity.id);
            this._callRenderer('renderEntitySelect', {
                entity: data.entity,
                latent,
                selected: true
            });
        });

        // Entity deselect → renderEntitySelect
        this._subscribe('entity:deselect', () => {
            this._callRenderer('renderEntitySelect', {
                entity: null,
                latent: null,
                selected: false
            });
        });

        // Ripple complete → renderRipple
        this._subscribe('ripple:complete', (data) => {
            this._callRenderer('renderRipple', {
                entity: data.entity,
                vector: data.vector,
                worldtext: data.worldtext,
                tick: data.tick
            });
        });

        // Audit add → renderAuditEntry
        this._subscribe('audit:add', (data) => {
            this._callRenderer('renderAuditEntry', {
                entry: data.entry,
                log: this.engine.getAuditLog()
            });
        });

        // Tick increment → renderTick
        this._subscribe('tick:increment', (data) => {
            this._callRenderer('renderTick', {
                tick: data.tick
            });
        });

        // Autoplay start → renderAutoplay
        this._subscribe('autoplay:start', () => {
            this._callRenderer('renderAutoplay', {
                isAutoplay: true,
                countdown: Math.floor(this.engine.config.autoplayInterval / 1000)
            });
        });

        // Autoplay stop → renderAutoplay
        this._subscribe('autoplay:stop', () => {
            this._callRenderer('renderAutoplay', {
                isAutoplay: false,
                countdown: 0
            });
        });

        // Autoplay tick → renderCountdown
        this._subscribe('autoplay:tick', (data) => {
            this._callRenderer('renderCountdown', {
                countdown: data.countdown
            });
        });
    }

    /**
     * Helper to subscribe to an engine event and track unsubscriber
     * @private
     */
    _subscribe(event, callback) {
        const unsub = this.engine.on(event, callback);
        this._unsubscribers.push(unsub);
    }

    /**
     * Safely call a renderer method if it exists
     * @private
     */
    _callRenderer(method, data) {
        if (typeof this.renderer[method] === 'function') {
            try {
                this.renderer[method](data);
            } catch (e) {
                console.error(`[VisualizationAdapter] Error in renderer.${method}:`, e);
            }
        }
    }

    /**
     * Get latent descriptions for an entity
     * @private
     */
    _getEntityLatent(entityId) {
        const scenario = this.engine.getScenario();
        if (!scenario) return null;
        return scenario.latent?.[entityId] || null;
    }

    // ============================================
    // USER INPUT HANDLERS
    // ============================================
    // These methods should be called by the renderer's UI event handlers

    /**
     * Handle entity click from UI
     * @param {string} entityId - Clicked entity ID
     */
    handleEntityClick(entityId) {
        try {
            this.engine.selectEntity(entityId);
        } catch (e) {
            console.warn('[VisualizationAdapter] handleEntityClick:', e.message);
        }
    }

    /**
     * Handle vector button click from UI
     * @param {string} vector - Vector name (GOAL, OBSTACLE, SHIFT)
     */
    handleVectorClick(vector) {
        try {
            this.engine.triggerVector(vector);
        } catch (e) {
            console.warn('[VisualizationAdapter] handleVectorClick:', e.message);
        }
    }

    /**
     * Handle scenario change from UI
     * @param {string} scenarioId - New scenario ID
     */
    handleScenarioChange(scenarioId) {
        try {
            this.engine.loadScenario(scenarioId);
        } catch (e) {
            console.warn('[VisualizationAdapter] handleScenarioChange:', e.message);
        }
    }

    /**
     * Handle autoplay toggle from UI
     */
    handleAutoplayToggle() {
        this.engine.toggleAutoplay();
    }

    /**
     * Handle keyboard shortcut
     * @param {string} key - Key pressed
     */
    handleKeyPress(key) {
        const keyMap = {
            'g': () => this.handleVectorClick('GOAL'),
            'o': () => this.handleVectorClick('OBSTACLE'),
            's': () => this.handleVectorClick('SHIFT'),
            ' ': () => this.handleAutoplayToggle(),
            'ArrowLeft': () => this._cycleScenario(-1),
            'ArrowRight': () => this._cycleScenario(1),
            '1': () => this._selectEntityByIndex(0),
            '2': () => this._selectEntityByIndex(1),
            '3': () => this._selectEntityByIndex(2),
            '4': () => this._selectEntityByIndex(3),
            '5': () => this._selectEntityByIndex(4),
            '6': () => this._selectEntityByIndex(5),
        };

        const action = keyMap[key.toLowerCase()] || keyMap[key];
        if (action) action();
    }

    /**
     * Cycle through scenarios
     * @private
     */
    _cycleScenario(direction) {
        const ids = this.engine.getScenarioIds();
        const current = this.engine.state.scenario;
        const currentIndex = ids.indexOf(current);
        const newIndex = (currentIndex + direction + ids.length) % ids.length;
        this.handleScenarioChange(ids[newIndex]);
    }

    /**
     * Select entity by index
     * @private
     */
    _selectEntityByIndex(index) {
        const entities = this.engine.getEntities();
        if (index < entities.length) {
            this.handleEntityClick(entities[index].id);
        }
    }

    // ============================================
    // LIFECYCLE
    // ============================================

    /**
     * Disconnect adapter from engine (cleanup)
     */
    disconnect() {
        this._unsubscribers.forEach(unsub => unsub());
        this._unsubscribers = [];
    }

    /**
     * Reconnect adapter (after disconnect)
     */
    reconnect() {
        this.disconnect();
        this._bindEngineEvents();
    }
}

export default VisualizationAdapter;
