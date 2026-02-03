/**
 * RIPPLES REACT ADAPTER
 * =====================
 * 
 * BRIDGE: [React Component] -> [RIPPLES Engine]
 * 
 * Provides hooks and context for React-based visualizations.
 * 
 * CONTEXT WINDOW: ~600 tokens
 */

const { createContext, useContext, useState, useEffect, useRef, useCallback } = React;

// ============================================
// ENGINE CONTEXT
// ============================================

const EngineContext = createContext(null);

// ============================================
// ENGINE PROVIDER
// ============================================

function EngineProvider({ children, config = {} }) {
    const engineRef = useRef(null);
    const [state, setState] = useState(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        // Initialize engine
        const engine = new RipplesEngine(config);
        
        // Register scenarios from latent library
        if (config.latentLibrary) {
            Object.values(config.latentLibrary).forEach(scenario => {
                engine.registerScenario(scenario);
            });
        }

        // Subscribe to all state changes
        engine.state.topology.on('state:change', ({ path, value }) => {
            setState(engine.state.snapshot());
        });

        // Initial state
        engine.loadScenario(config.initialScenario || 'cupboard');
        setState(engine.state.snapshot());
        
        engineRef.current = engine;
        setIsReady(true);

        return () => {
            // Cleanup
            engine.stopAutoplay?.();
        };
    }, []);

    const value = {
        engine: engineRef.current,
        state,
        isReady
    };

    return React.createElement(EngineContext.Provider, { value }, children);
}

// ============================================
// USE ENGINE HOOK
// ============================================

function useEngine() {
    const context = useContext(EngineContext);
    if (!context) {
        throw new Error('useEngine must be used within EngineProvider');
    }
    return context;
}

// ============================================
// USE ENTITY HOOK
// ============================================

function useEntity(entityId) {
    const { engine, state } = useEngine();
    
    const entity = entityId 
        ? engine?.getEntity(entityId)
        : state?.selectedEntity 
            ? engine?.getEntity(state.selectedEntity)
            : null;
    
    const selectEntity = useCallback((id) => {
        engine?.selectEntity(id);
    }, [engine]);

    return { entity, selectEntity };
}

// ============================================
// USE RIPPLE HOOK
// ============================================

function useRipple() {
    const { engine } = useEngine();
    const [isGenerating, setIsGenerating] = useState(false);

    const triggerRipple = useCallback(async (vector) => {
        if (!engine || isGenerating) return null;
        
        setIsGenerating(true);
        try {
            const ripple = await engine.triggerVector(vector);
            return ripple;
        } finally {
            setIsGenerating(false);
        }
    }, [engine, isGenerating]);

    return { triggerRipple, isGenerating };
}

// ============================================
// USE SCENARIO HOOK
// ============================================

function useScenario() {
    const { engine, state } = useEngine();

    const scenario = engine?.getScenario();
    const scenarioIds = engine?.getScenarioIds() || [];

    const loadScenario = useCallback((id) => {
        engine?.loadScenario(id);
    }, [engine]);

    return {
        scenario,
        currentId: state?.scenario,
        scenarioIds,
        loadScenario
    };
}

// ============================================
// USE AUTOPLAY HOOK
// ============================================

function useAutoplay() {
    const { engine, state } = useEngine();

    const start = useCallback(() => {
        engine?.startAutoplay();
    }, [engine]);

    const stop = useCallback(() => {
        engine?.stopAutoplay();
    }, [engine]);

    const toggle = useCallback(() => {
        if (state?.isAutoplay) {
            stop();
        } else {
            start();
        }
    }, [state?.isAutoplay, start, stop]);

    return {
        isAutoplay: state?.isAutoplay,
        bpm: state?.bpm,
        start,
        stop,
        toggle
    };
}

// ============================================
// USE LLM HOOK
// ============================================

function useLLM() {
    const { engine } = useEngine();
    const [isGenerating, setIsGenerating] = useState(false);

    const setGenerator = useCallback((generator) => {
        engine?.setWorldtextGenerator(generator);
    }, [engine]);

    const generate = useCallback(async (entity, vector) => {
        if (!engine) return null;
        
        setIsGenerating(true);
        try {
            return await engine.generateWorldtext(entity, vector);
        } finally {
            setIsGenerating(false);
        }
    }, [engine]);

    return {
        generate,
        setGenerator,
        isGenerating,
        generationMode: engine?.state?.get('generationMode')
    };
}

// ============================================
// USE EVENTS HOOK
// ============================================

function useEngineEvent(event, handler) {
    const { engine } = useEngine();

    useEffect(() => {
        if (!engine) return;
        
        const unsubscribe = engine.events.on(event, handler);
        return unsubscribe;
    }, [engine, event, handler]);
}

// ============================================
// ENTITY CARD COMPONENT
// ============================================

function EntityCard({ entity, isSelected, onClick, showPreview = false }) {
    const { engine } = useEngine();
    
    const latent = showPreview && engine 
        ? engine.getLatent(entity.id, 'GOAL')
        : null;

    return React.createElement('div', {
        className: `entity-card ${isSelected ? 'selected' : ''} ${entity.type}`,
        onClick: () => onClick?.(entity.id)
    }, [
        React.createElement('div', { key: 'icon', className: 'entity-icon' }, entity.icon),
        React.createElement('div', { key: 'info', className: 'entity-info' }, [
            React.createElement('div', { key: 'name', className: 'entity-name' }, entity.name),
            React.createElement('div', { key: 'meta', className: 'entity-meta' }, [
                React.createElement('span', { key: 'type', className: 'entity-type' }, entity.type),
                React.createElement('span', { key: 'state', className: 'entity-state' }, entity.state)
            ])
        ]),
        showPreview && latent && React.createElement('div', { 
            key: 'preview', 
            className: 'entity-preview' 
        }, latent.substring(0, 80) + '...')
    ]);
}

// ============================================
// VECTOR BUTTON COMPONENT
// ============================================

function VectorButton({ vector, onClick, disabled = false }) {
    const colors = {
        GOAL: '#ffd700',
        OBSTACLE: '#ff3333',
        SHIFT: '#00ffff'
    };

    const icons = {
        GOAL: '→',
        OBSTACLE: '■',
        SHIFT: '↻'
    };

    const descriptions = {
        GOAL: 'Movement toward',
        OBSTACLE: 'Encounter barrier',
        SHIFT: 'Change state'
    };

    return React.createElement('button', {
        className: `vector-btn ${vector.toLowerCase()}`,
        onClick: () => onClick?.(vector),
        disabled,
        style: { '--vector-color': colors[vector] }
    }, [
        React.createElement('span', { key: 'icon', className: 'vector-icon' }, icons[vector]),
        React.createElement('span', { key: 'label', className: 'vector-label' }, vector),
        React.createElement('span', { key: 'desc', className: 'vector-desc' }, descriptions[vector])
    ]);
}

// ============================================
// WORLDTEXT VIEWPORT COMPONENT
// ============================================

function WorldtextViewport({ text, highlightVector, className = '' }) {
    const { engine } = useEngine();
    const { state } = useEngine();

    const renderText = () => {
        if (!text) return 'Select an entity to begin...';
        
        let html = text;
        
        // Highlight entity references
        const scenario = engine?.getScenario();
        scenario?.entities?.forEach(entity => {
            const regex = new RegExp(`\\b${entity.name}\\b`, 'gi');
            html = html.replace(regex, `<span class="entity-ref" data-entity="${entity.id}">${entity.name}</span>`);
        });

        // Apply vector highlight
        if (highlightVector) {
            html = `<span class="highlight-${highlightVector.toLowerCase()}">${html}</span>`;
        }

        return html;
    };

    return React.createElement('div', {
        className: `worldtext-viewport ${className}`,
        dangerouslySetInnerHTML: { __html: renderText() }
    });
}

// ============================================
// AUDIT LOG COMPONENT
// ============================================

function AuditLog({ maxEntries = 50, onEntryClick }) {
    const { state } = useEngine();
    const entries = state?.auditLog?.slice(0, maxEntries) || [];

    return React.createElement('div', { className: 'audit-log' },
        entries.length === 0 
            ? React.createElement('div', { className: 'empty-state' }, 'No ripples recorded')
            : entries.map((entry, i) => 
                React.createElement('div', {
                    key: entry.tick,
                    className: `audit-entry ${i === 0 ? 'new' : ''}`,
                    onClick: () => onEntryClick?.(entry)
                }, [
                    React.createElement('div', { key: 'header', className: 'audit-header' }, [
                        React.createElement('span', { key: 'tick', className: 'audit-tick' }, `#${entry.tick}`),
                        React.createElement('span', { key: 'vector', className: `audit-vector ${entry.vector.toLowerCase()}` }, entry.vector),
                        React.createElement('span', { key: 'entity', className: 'audit-entity' }, `→ ${entry.entityName}`),
                        entry.mode === 'generative' && React.createElement('span', { key: 'ai', className: 'audit-ai' }, '[AI]')
                    ]),
                    React.createElement('div', { key: 'result', className: 'audit-result' }, 
                        entry.description.substring(0, 80) + '...'
                    )
                ])
            )
    );
}

// ============================================
// SCENARIO SELECTOR COMPONENT
// ============================================

function ScenarioSelector({ className = '' }) {
    const { scenario, currentId, scenarioIds, loadScenario } = useScenario();

    return React.createElement('select', {
        className: `scenario-selector ${className}`,
        value: currentId || '',
        onChange: (e) => loadScenario(e.target.value)
    }, scenarioIds.map(id => 
        React.createElement('option', { key: id, value: id }, 
            scenario?.name || id
        )
    ));
}

// ============================================
// EXPORTS
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EngineContext,
        EngineProvider,
        useEngine,
        useEntity,
        useRipple,
        useScenario,
        useAutoplay,
        useLLM,
        useEngineEvent,
        EntityCard,
        VectorButton,
        WorldtextViewport,
        AuditLog,
        ScenarioSelector
    };
}
