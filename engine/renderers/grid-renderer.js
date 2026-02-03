/**
 * GRID RENDERER
 * ==============
 * CRT-style terminal grid renderer for RIPPLES.
 * Implements the visualization adapter interface.
 * 
 * FEATURES:
 * - Three-column layout (Entity Pool | Worldtext | Audit Log)
 * - CRT scanline and flicker effects
 * - Ripple animations with vector-colored glow
 * - Clickable entity and vector controls
 * 
 * USAGE:
 * ```javascript
 * const renderer = new GridRenderer(document.getElementById('app'));
 * const adapter = new VisualizationAdapter(engine, renderer);
 * 
 * // Renderer is automatically called by adapter events
 * engine.loadScenario('cupboard');
 * ```
 */

export class GridRenderer {
    /**
     * Create a grid renderer
     * @param {HTMLElement} container - The container element
     * @param {Object} options - Configuration options
     */
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            showCRTEffects: true,
            showLatentPanel: true,
            ...options
        };

        // DOM element references (populated during init)
        this.elements = {};

        // Initialize the UI
        this._initUI();
    }

    /**
     * Initialize the UI structure
     * @private
     */
    _initUI() {
        this.container.innerHTML = this._getTemplate();
        this.container.classList.add('ripples-grid-renderer');

        // Cache element references
        this.elements = {
            scenarioSelect: this.container.querySelector('#rg-scenario-select'),
            entityList: this.container.querySelector('#rg-entity-list'),
            worldtext: this.container.querySelector('#rg-worldtext'),
            auditLog: this.container.querySelector('#rg-audit-log'),
            latentPanel: this.container.querySelector('#rg-latent-panel'),
            selectedInfo: this.container.querySelector('#rg-selected-info'),
            selectedName: this.container.querySelector('#rg-selected-name'),
            tickDisplay: this.container.querySelector('#rg-tick'),
            statusText: this.container.querySelector('#rg-status'),
            btnGoal: this.container.querySelector('#rg-btn-goal'),
            btnObstacle: this.container.querySelector('#rg-btn-obstacle'),
            btnShift: this.container.querySelector('#rg-btn-shift'),
            autoplayToggle: this.container.querySelector('#rg-autoplay-toggle'),
            countdown: this.container.querySelector('#rg-countdown'),
        };

        // Inject styles
        this._injectStyles();
    }

    /**
     * Get the HTML template for the grid UI
     * @private
     */
    _getTemplate() {
        return `
      <div class="rg-crt-container ${this.options.showCRTEffects ? 'rg-flicker' : ''}">
        <div class="rg-app">
          <!-- Header -->
          <div class="rg-header">
            <div class="rg-scenario-select-wrapper">
              <label>Scenario</label>
              <select id="rg-scenario-select"></select>
            </div>
            <h1 class="rg-title">RIPPLES</h1>
            <div class="rg-status-bar">
              <span>TICK: <span id="rg-tick">0</span></span>
              <span id="rg-status">Ready</span>
            </div>
          </div>

          <!-- Left Panel: Entity Pool -->
          <div class="rg-panel rg-panel-left">
            <h2>Entity Pool</h2>
            <div id="rg-selected-info" class="rg-selected-info" style="display: none;">
              <div class="rg-label">Selected Perspective</div>
              <div id="rg-selected-name" class="rg-value">-</div>
            </div>
            <div id="rg-entity-list" class="rg-entity-list"></div>
          </div>

          <!-- Center Panel: Worldtext -->
          <div class="rg-panel rg-panel-center">
            <div class="rg-worldtext-container">
              <div id="rg-worldtext" class="rg-worldtext">
                Select an entity to begin...
              </div>
            </div>
          </div>

          <!-- Right Panel: Audit Log + Latent Library -->
          <div class="rg-panel rg-panel-right">
            <h2>Audit Log</h2>
            <div id="rg-audit-log" class="rg-audit-log">
              <div class="rg-empty-state">No ripples recorded</div>
            </div>
            ${this.options.showLatentPanel ? `
              <h3>Latent Library</h3>
              <div id="rg-latent-panel" class="rg-latent-panel">
                <div class="rg-empty-state">Select an entity</div>
              </div>
            ` : ''}
          </div>

          <!-- Bottom Panel: Vector Controls -->
          <div class="rg-panel rg-panel-bottom">
            <div class="rg-vector-controls">
              <button id="rg-btn-goal" class="rg-vector-btn rg-goal" disabled>
                <span>GOAL</span>
                <span class="rg-vector-desc">Movement toward</span>
              </button>
              <button id="rg-btn-obstacle" class="rg-vector-btn rg-obstacle" disabled>
                <span>OBSTACLE</span>
                <span class="rg-vector-desc">Encounter barrier</span>
              </button>
              <button id="rg-btn-shift" class="rg-vector-btn rg-shift" disabled>
                <span>SHIFT</span>
                <span class="rg-vector-desc">Change state</span>
              </button>
            </div>
            <div class="rg-autoplay-control">
              <span>Autoplay</span>
              <button id="rg-autoplay-toggle" class="rg-autoplay-btn">OFF</button>
              <span id="rg-countdown" class="rg-countdown"></span>
            </div>
          </div>
        </div>
      </div>
    `;
    }

    /**
     * Inject CSS styles into the document
     * @private
     */
    _injectStyles() {
        if (document.getElementById('ripples-grid-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'ripples-grid-styles';
        styles.textContent = `
      .ripples-grid-renderer {
        --rg-bg: #050a05;
        --rg-bg-light: #0a140a;
        --rg-text: #4af626;
        --rg-dim: #1e5c12;
        --rg-dimmer: #0d2a08;
        --rg-alert: #ff3333;
        --rg-gold: #ffd700;
        --rg-cyan: #00ffff;
        
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        font-size: 12px;
        line-height: 1.7;
        color: var(--rg-text);
        background: var(--rg-bg);
        height: 100%;
        width: 100%;
      }

      .rg-crt-container {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      .rg-crt-container::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        background: linear-gradient(to bottom, rgba(18,16,16,0) 50%, rgba(0,0,0,0.25) 50%);
        background-size: 100% 4px;
        pointer-events: none;
        z-index: 100;
        opacity: 0.3;
      }

      .rg-flicker {
        animation: rg-flicker 0.15s infinite;
      }

      @keyframes rg-flicker {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.98; }
      }

      .rg-app {
        display: grid;
        grid-template-columns: 280px 1fr 320px;
        grid-template-rows: 40px 1fr 140px;
        height: 100%;
        gap: 1px;
        background: var(--rg-dimmer);
      }

      .rg-panel {
        background: var(--rg-bg);
        padding: 12px;
        overflow: auto;
      }

      .rg-header {
        grid-column: 1 / -1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 16px;
        background: var(--rg-bg-light);
        border-bottom: 1px solid var(--rg-dim);
      }

      .rg-panel-left { grid-row: 2; border-right: 1px solid var(--rg-dim); }
      .rg-panel-center { grid-row: 2; position: relative; }
      .rg-panel-right { grid-row: 2; border-left: 1px solid var(--rg-dim); }
      .rg-panel-bottom {
        grid-column: 1 / -1;
        border-top: 1px solid var(--rg-dim);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
      }

      .rg-title {
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 0.1em;
        text-shadow: 0 0 10px var(--rg-text);
      }

      h2 {
        font-size: 11px;
        font-weight: 400;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: var(--rg-dim);
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--rg-dimmer);
      }

      h3 {
        font-size: 10px;
        color: var(--rg-dim);
        text-transform: uppercase;
        margin: 16px 0 8px;
      }

      /* Scenario select */
      .rg-scenario-select-wrapper {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .rg-scenario-select-wrapper label {
        font-size: 10px;
        text-transform: uppercase;
        color: var(--rg-dim);
      }

      .rg-scenario-select-wrapper select {
        background: var(--rg-bg);
        color: var(--rg-text);
        border: 1px solid var(--rg-dim);
        padding: 6px 12px;
        font-family: inherit;
        font-size: 11px;
      }

      /* Entity list */
      .rg-entity-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .rg-entity-item {
        padding: 10px 12px;
        border: 1px solid transparent;
        cursor: pointer;
        transition: all 0.15s;
      }

      .rg-entity-item:hover {
        background: var(--rg-bg-light);
        border-color: var(--rg-dim);
      }

      .rg-entity-item.selected {
        background: rgba(74, 246, 38, 0.08);
        border-color: var(--rg-text);
        box-shadow: 0 0 12px rgba(74, 246, 38, 0.15);
      }

      .rg-entity-name { font-weight: 500; font-size: 12px; }
      .rg-entity-meta { font-size: 10px; color: var(--rg-dim); }

      /* Selected info */
      .rg-selected-info {
        padding: 12px;
        border: 1px solid var(--rg-dim);
        background: var(--rg-bg-light);
        margin-bottom: 16px;
      }

      .rg-label { font-size: 10px; color: var(--rg-dim); text-transform: uppercase; }
      .rg-value { font-size: 13px; color: var(--rg-text); margin-top: 4px; }

      /* Worldtext */
      .rg-worldtext-container {
        height: 100%;
        overflow: auto;
        padding: 20px;
      }

      .rg-worldtext {
        white-space: pre-wrap;
        line-height: 1.9;
      }

      .rg-worldtext .entity-ref {
        color: var(--rg-text);
        cursor: pointer;
        text-decoration: underline;
        text-decoration-color: var(--rg-dim);
      }

      .rg-worldtext.goal-effect { color: var(--rg-gold); text-shadow: 0 0 8px rgba(255,215,0,0.4); }
      .rg-worldtext.obstacle-effect { color: var(--rg-alert); text-shadow: 0 0 8px rgba(255,51,51,0.4); }
      .rg-worldtext.shift-effect { color: var(--rg-cyan); text-shadow: 0 0 8px rgba(0,255,255,0.4); }

      /* Latent panel */
      .rg-latent-panel { display: flex; flex-direction: column; gap: 12px; }

      .rg-latent-item {
        padding: 10px;
        border: 1px solid var(--rg-dimmer);
        background: var(--rg-bg-light);
      }

      .rg-latent-item .vector-label {
        font-size: 10px;
        text-transform: uppercase;
        margin-bottom: 6px;
      }

      .rg-latent-item .vector-label.goal { color: var(--rg-gold); }
      .rg-latent-item .vector-label.obstacle { color: var(--rg-alert); }
      .rg-latent-item .vector-label.shift { color: var(--rg-cyan); }

      .rg-latent-text {
        font-size: 10px;
        color: rgba(74, 246, 38, 0.7);
        font-style: italic;
      }

      /* Audit log */
      .rg-audit-log { display: flex; flex-direction: column; gap: 8px; max-height: 200px; overflow-y: auto; }

      .rg-audit-entry {
        padding: 8px 10px;
        border-left: 2px solid var(--rg-dim);
        background: var(--rg-bg-light);
        font-size: 10px;
      }

      .rg-audit-entry.new { animation: rg-pulse 0.5s ease; }

      @keyframes rg-pulse {
        0% { background: rgba(74, 246, 38, 0.2); }
        100% { background: var(--rg-bg-light); }
      }

      .rg-audit-header { display: flex; gap: 8px; margin-bottom: 4px; }
      .rg-audit-tick { color: var(--rg-dim); }
      .rg-audit-vector { font-weight: 600; text-transform: uppercase; }
      .rg-audit-vector.goal { color: var(--rg-gold); }
      .rg-audit-vector.obstacle { color: var(--rg-alert); }
      .rg-audit-vector.shift { color: var(--rg-cyan); }
      .rg-audit-result { color: rgba(74, 246, 38, 0.6); font-style: italic; }

      /* Vector controls */
      .rg-vector-controls { display: flex; gap: 16px; flex: 1; justify-content: center; }

      .rg-vector-btn {
        padding: 16px 32px;
        border: 2px solid;
        background: transparent;
        font-family: inherit;
        font-size: 13px;
        font-weight: 600;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        cursor: pointer;
        transition: all 0.15s;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        min-width: 140px;
      }

      .rg-vector-btn:disabled { opacity: 0.3; cursor: not-allowed; }

      .rg-vector-btn.rg-goal { color: var(--rg-gold); border-color: var(--rg-gold); }
      .rg-vector-btn.rg-goal:hover:not(:disabled) { background: rgba(255,215,0,0.1); box-shadow: 0 0 20px rgba(255,215,0,0.3); }

      .rg-vector-btn.rg-obstacle { color: var(--rg-alert); border-color: var(--rg-alert); }
      .rg-vector-btn.rg-obstacle:hover:not(:disabled) { background: rgba(255,51,51,0.1); box-shadow: 0 0 20px rgba(255,51,51,0.3); }

      .rg-vector-btn.rg-shift { color: var(--rg-cyan); border-color: var(--rg-cyan); }
      .rg-vector-btn.rg-shift:hover:not(:disabled) { background: rgba(0,255,255,0.1); box-shadow: 0 0 20px rgba(0,255,255,0.3); }

      .rg-vector-desc { font-size: 9px; font-weight: 400; opacity: 0.7; }

      /* Autoplay */
      .rg-autoplay-control { display: flex; align-items: center; gap: 12px; padding: 0 16px; border-left: 1px solid var(--rg-dim); }

      .rg-autoplay-btn {
        padding: 8px 16px;
        background: var(--rg-bg);
        border: 1px solid var(--rg-dim);
        color: var(--rg-dim);
        font-family: inherit;
        font-size: 11px;
        cursor: pointer;
        transition: all 0.15s;
      }

      .rg-autoplay-btn.active {
        border-color: var(--rg-text);
        color: var(--rg-text);
        background: rgba(74, 246, 38, 0.1);
      }

      .rg-countdown { font-size: 14px; font-weight: 600; color: var(--rg-gold); min-width: 24px; }

      /* Status bar */
      .rg-status-bar { display: flex; gap: 16px; font-size: 10px; color: var(--rg-dim); }

      /* Empty state */
      .rg-empty-state { color: var(--rg-dim); font-style: italic; text-align: center; padding: 20px; }

      /* Scrollbar */
      .ripples-grid-renderer ::-webkit-scrollbar { width: 6px; }
      .ripples-grid-renderer ::-webkit-scrollbar-track { background: var(--rg-bg); }
      .ripples-grid-renderer ::-webkit-scrollbar-thumb { background: var(--rg-dim); border-radius: 3px; }
    `;

        document.head.appendChild(styles);
    }

    // ============================================
    // VISUALIZATION ADAPTER INTERFACE
    // ============================================

    /**
     * Render scenario change
     * @param {Object} data - { scenarioId, name, entities, baseline }
     */
    renderScenario(data) {
        // Update scenario select
        const select = this.elements.scenarioSelect;
        if (select && !select.options.length) {
            // Populate select (only once)
            const scenarios = ['cupboard', 'abandoned_house', 'deep_forest', 'urban_jungle'];
            scenarios.forEach(id => {
                const opt = document.createElement('option');
                opt.value = id;
                opt.textContent = id.replace(/_/g, ' ').toUpperCase();
                select.appendChild(opt);
            });
        }
        if (select) select.value = data.scenarioId;

        // Render entity list
        this._renderEntityList(data.entities);

        // Render baseline worldtext
        this.elements.worldtext.textContent = data.baseline;
        this.elements.worldtext.className = 'rg-worldtext';

        // Reset tick
        this.elements.tickDisplay.textContent = '0';

        // Clear audit log
        this.elements.auditLog.innerHTML = '<div class="rg-empty-state">No ripples recorded</div>';

        // Clear latent panel
        if (this.elements.latentPanel) {
            this.elements.latentPanel.innerHTML = '<div class="rg-empty-state">Select an entity</div>';
        }

        // Disable vector buttons
        this._setVectorButtonsEnabled(false);

        // Hide selected info
        this.elements.selectedInfo.style.display = 'none';

        // Update status
        this.elements.statusText.textContent = 'Ready';
    }

    /**
     * Render entity list
     * @private
     */
    _renderEntityList(entities, selectedId = null) {
        const container = this.elements.entityList;
        container.innerHTML = '';

        entities.forEach(entity => {
            const item = document.createElement('div');
            item.className = `rg-entity-item ${entity.id === selectedId ? 'selected' : ''}`;
            item.dataset.entityId = entity.id;
            item.innerHTML = `
        <div class="rg-entity-name">${entity.icon || '◉'} ${entity.name}</div>
        <div class="rg-entity-meta">${entity.type} / ${entity.state}</div>
      `;
            container.appendChild(item);
        });
    }

    /**
     * Render entity selection
     * @param {Object} data - { entity, latent, selected }
     */
    renderEntitySelect(data) {
        if (!data.selected || !data.entity) {
            // Deselected
            this.elements.selectedInfo.style.display = 'none';
            this._setVectorButtonsEnabled(false);
            this._renderEntityList(this._getCurrentEntities(), null);
            this.elements.statusText.textContent = 'Ready';
            return;
        }

        // Update selected info
        this.elements.selectedInfo.style.display = 'block';
        this.elements.selectedName.textContent = data.entity.name;

        // Highlight in entity list
        this._renderEntityList(this._getCurrentEntities(), data.entity.id);

        // Enable vector buttons
        this._setVectorButtonsEnabled(true);

        // Update latent panel
        if (this.elements.latentPanel && data.latent) {
            this._renderLatentPanel(data.latent);
        }

        // Update status
        this.elements.statusText.textContent = `Perspective: ${data.entity.name}`;
    }

    /**
     * Render latent panel
     * @private
     */
    _renderLatentPanel(latent) {
        if (!this.elements.latentPanel) return;

        this.elements.latentPanel.innerHTML = `
      <div class="rg-latent-item">
        <div class="vector-label goal">● GOAL</div>
        <div class="rg-latent-text">${latent.GOAL.substring(0, 100)}...</div>
      </div>
      <div class="rg-latent-item">
        <div class="vector-label obstacle">● OBSTACLE</div>
        <div class="rg-latent-text">${latent.OBSTACLE.substring(0, 100)}...</div>
      </div>
      <div class="rg-latent-item">
        <div class="vector-label shift">● SHIFT</div>
        <div class="rg-latent-text">${latent.SHIFT.substring(0, 100)}...</div>
      </div>
    `;
    }

    /**
     * Render ripple result
     * @param {Object} data - { entity, vector, worldtext, tick }
     */
    renderRipple(data) {
        // Update worldtext with vector effect
        this.elements.worldtext.textContent = data.worldtext;
        this.elements.worldtext.className = `rg-worldtext ${data.vector.toLowerCase()}-effect`;

        // Clear effect after animation
        setTimeout(() => {
            this.elements.worldtext.className = 'rg-worldtext';
        }, 2000);
    }

    /**
     * Render audit log entry
     * @param {Object} data - { entry, log }
     */
    renderAuditEntry(data) {
        const entry = data.entry;

        // Remove empty state if present
        const emptyState = this.elements.auditLog.querySelector('.rg-empty-state');
        if (emptyState) emptyState.remove();

        // Create entry element
        const entryEl = document.createElement('div');
        entryEl.className = 'rg-audit-entry new';
        entryEl.innerHTML = `
      <div class="rg-audit-header">
        <span class="rg-audit-tick">#${entry.tick}</span>
        <span class="rg-audit-vector ${entry.vector.toLowerCase()}">${entry.vector}</span>
        <span>→ ${entry.entityName}</span>
      </div>
      <div class="rg-audit-result">${entry.result}</div>
    `;

        // Prepend to log
        this.elements.auditLog.insertBefore(entryEl, this.elements.auditLog.firstChild);

        // Remove 'new' class after animation
        setTimeout(() => entryEl.classList.remove('new'), 500);

        // Keep only last 20 visible entries
        while (this.elements.auditLog.children.length > 20) {
            this.elements.auditLog.removeChild(this.elements.auditLog.lastChild);
        }
    }

    /**
     * Render tick update
     * @param {Object} data - { tick }
     */
    renderTick(data) {
        this.elements.tickDisplay.textContent = data.tick;
    }

    /**
     * Render autoplay state change
     * @param {Object} data - { isAutoplay, countdown }
     */
    renderAutoplay(data) {
        const btn = this.elements.autoplayToggle;
        if (data.isAutoplay) {
            btn.textContent = 'ON';
            btn.classList.add('active');
            this.elements.countdown.textContent = data.countdown;
        } else {
            btn.textContent = 'OFF';
            btn.classList.remove('active');
            this.elements.countdown.textContent = '';
        }
    }

    /**
     * Render countdown tick
     * @param {Object} data - { countdown }
     */
    renderCountdown(data) {
        this.elements.countdown.textContent = data.countdown;
    }

    // ============================================
    // UI HELPERS
    // ============================================

    /**
     * Enable/disable vector buttons
     * @private
     */
    _setVectorButtonsEnabled(enabled) {
        this.elements.btnGoal.disabled = !enabled;
        this.elements.btnObstacle.disabled = !enabled;
        this.elements.btnShift.disabled = !enabled;
    }

    /**
     * Get current entities from entity list
     * @private
     */
    _getCurrentEntities() {
        const items = this.elements.entityList.querySelectorAll('.rg-entity-item');
        return Array.from(items).map(item => ({
            id: item.dataset.entityId,
            name: item.querySelector('.rg-entity-name')?.textContent || '',
            type: 'unknown',
            state: 'unknown'
        }));
    }

    // ============================================
    // EVENT BINDING FOR ADAPTER
    // ============================================

    /**
     * Bind click handlers to UI elements
     * Call this after creating adapter to connect UI to engine
     * @param {VisualizationAdapter} adapter - The adapter to forward clicks to
     */
    bindAdapter(adapter) {
        // Entity clicks
        this.elements.entityList.addEventListener('click', (e) => {
            const item = e.target.closest('.rg-entity-item');
            if (item) {
                adapter.handleEntityClick(item.dataset.entityId);
            }
        });

        // Vector buttons
        this.elements.btnGoal.addEventListener('click', () => adapter.handleVectorClick('GOAL'));
        this.elements.btnObstacle.addEventListener('click', () => adapter.handleVectorClick('OBSTACLE'));
        this.elements.btnShift.addEventListener('click', () => adapter.handleVectorClick('SHIFT'));

        // Scenario select
        this.elements.scenarioSelect.addEventListener('change', (e) => {
            adapter.handleScenarioChange(e.target.value);
        });

        // Autoplay toggle
        this.elements.autoplayToggle.addEventListener('click', () => {
            adapter.handleAutoplayToggle();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            adapter.handleKeyPress(e.key);
        });
    }
}

export default GridRenderer;
