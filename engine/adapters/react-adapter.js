/**
 * RIPPLES React Adapter
 * ======================
 * React hooks and context for engine integration.
 * 
 * USAGE:
 * ```jsx
 * import { EngineProvider, useEngine } from './engine/adapters/react-adapter.js';
 * 
 * function App() {
 *   return (
 *     <EngineProvider>
 *       <MyComponent />
 *     </EngineProvider>
 *   );
 * }
 * 
 * function MyComponent() {
 *   const { engine, state } = useEngine();
 *   // state is reactive, updates on every engine event
 * }
 * ```
 */

const { createContext, useContext, useState, useEffect, useRef } = React;

// Engine context
export const EngineContext = createContext(null);

/**
 * Hook to access engine and reactive state
 */
export function useEngine() {
    const context = useContext(EngineContext);
    if (!context) {
        throw new Error('useEngine must be used within EngineProvider');
    }
    return context;
}

/**
 * Provider component that initializes engine and provides reactive state
 */
export function EngineProvider({ children, latentLibrary, config = {} }) {
    const [state, setState] = useState(null);
    const [isReady, setIsReady] = useState(false);
    const engineRef = useRef(null);

    useEffect(() => {
        // Dynamically import engine (works with ES modules)
        const initEngine = async () => {
            try {
                // Import the engine class
                const { RipplesEngine } = await import('../ripples-engine.js');

                // Create engine instance
                const engine = new RipplesEngine({
                    latentLibrary,
                    autoplayInterval: config.autoplayInterval || 3000,
                    maxAuditEntries: config.maxAuditEntries || 50,
                    ...config
                });

                engineRef.current = engine;

                // Subscribe to all state changes
                engine.on('state:change', ({ state: newState }) => {
                    setState({ ...newState });
                });

                // Set initial state
                setState(engine.getState());
                setIsReady(true);

                // Load default scenario if specified
                if (config.defaultScenario) {
                    engine.loadScenario(config.defaultScenario);
                }
            } catch (error) {
                console.error('[EngineProvider] Failed to initialize:', error);
            }
        };

        initEngine();

        return () => {
            // Cleanup on unmount
            if (engineRef.current) {
                engineRef.current.stopAutoplay();
            }
        };
    }, []);

    const value = {
        engine: engineRef.current,
        state,
        isReady,
        // Convenience methods
        loadScenario: (id) => engineRef.current?.loadScenario(id),
        selectEntity: (id) => engineRef.current?.selectEntity(id),
        triggerVector: (v) => engineRef.current?.triggerVector(v),
        startAutoplay: () => engineRef.current?.startAutoplay(),
        stopAutoplay: () => engineRef.current?.stopAutoplay(),
        toggleAutoplay: () => engineRef.current?.toggleAutoplay(),
    };

    return React.createElement(EngineContext.Provider, { value }, children);
}

/**
 * Hook for entity selection
 */
export function useEntity(entityId) {
    const { engine, state } = useEngine();

    if (!state || !entityId) return null;

    const entity = engine?.getEntity(entityId);
    const latent = engine?.getScenario()?.latent?.[entityId];
    const isSelected = state.selectedEntity === entityId;

    return { entity, latent, isSelected };
}

/**
 * Hook for scenario data
 */
export function useScenario() {
    const { engine, state } = useEngine();

    if (!engine || !state?.scenario) return null;

    return {
        id: state.scenario,
        data: engine.getScenario(),
        entities: engine.getEntities(),
        ids: engine.getScenarioIds()
    };
}

/**
 * Hook for audit log
 */
export function useAuditLog(limit = 10) {
    const { state } = useEngine();
    return state?.auditLog?.slice(0, limit) || [];
}

/**
 * Hook for autoplay state
 */
export function useAutoplay() {
    const { engine, state, toggleAutoplay } = useEngine();

    return {
        isAutoplay: state?.isAutoplay || false,
        toggle: toggleAutoplay
    };
}

// Export for non-module usage
if (typeof window !== 'undefined') {
    window.RipplesReactAdapter = {
        EngineContext,
        EngineProvider,
        useEngine,
        useEntity,
        useScenario,
        useAuditLog,
        useAutoplay
    };
}
