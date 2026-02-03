/**
 * RIPPLES VISUALIZATION BASE CLASS
 * ================================
 * 
 * All visualizers extend this base class. The engine knows nothing about
 * the visualizer; the visualizer subscribes to engine events.
 * 
 * CONTEXT WINDOW: ~400 tokens base class
 * Each visualizer: ~600-1200 tokens depending on complexity
 * 
 * VISUALIZER LIFECYCLE:
 * 1. constructor(engine, container) - Bind to engine, prepare DOM
 * 2. mount() - Attach to DOM, subscribe to events
 * 3. render() - Update based on current state
 * 4. unmount() - Clean up, unsubscribe
 */

class Visualizer {
    /**
     * @param {RipplesEngine} engine - The core engine instance
     * @param {HTMLElement} container - DOM container for this visualizer
     */
    constructor(engine, container) {
        this.engine = engine;
        this.container = container;
        this.subscriptions = [];
        this.isMounted = false;
    }

    /**
     * Subscribe to engine event with auto-cleanup
     * @param {string} event - Event type
     * @param {Function} handler - Event handler
     */
    subscribe(event, handler) {
        const unsub = this.engine.events.on(event, handler);
        this.subscriptions.push(unsub);
        return unsub;
    }

    /**
     * Mount visualizer to DOM
     */
    mount() {
        if (this.isMounted) return;
        
        this.container.innerHTML = '';
        this.buildDOM();
        this.bindEvents();
        this.isMounted = true;
        
        // Initial render
        this.render();
    }

    /**
     * Build DOM structure - override in subclass
     */
    buildDOM() {
        throw new Error('Visualizer must implement buildDOM()');
    }

    /**
     * Bind to engine events - override in subclass
     */
    bindEvents() {
        throw new Error('Visualizer must implement bindEvents()');
    }

    /**
     * Render current state - override in subclass
     */
    render() {
        throw new Error('Visualizer must implement render()');
    }

    /**
     * Unmount and clean up
     */
    unmount() {
        this.subscriptions.forEach(unsub => unsub());
        this.subscriptions = [];
        this.container.innerHTML = '';
        this.isMounted = false;
    }
}

// ============================================
// GRID TELEVISION VISUALIZER
// ============================================

/**
 * GridTV - The canonical RIPPLES visualization
 * 
 * Renders entities as nodes in a grid matrix with:
 * - Ripple propagation animations
 * - Adjacency connections
 * - State indicators
 * - CRT television aesthetic
 * 
 * CONTEXT WINDOW: ~800 tokens
 */
class GridTVVisualizer extends Visualizer {
    buildDOM() {
        this.container.className = 'grid-tv-visualizer';
        this.container.innerHTML = `
            <div class="grid-tv-header">
                <span class="grid-tv-title">ECOLOGY GRID</span>
                <span class="grid-tv-status" id="gridStatus">STANDBY</span>
            </div>
            <div class="grid-tv-screen" id="gridScreen"></div>
            <div class="grid-tv-footer">
                <span class="grid-tv-info" id="gridInfo">Select entity to begin</span>
            </div>
        `;
        
        this.screen = this.container.querySelector('#gridScreen');
        this.status = this.container.querySelector('#gridStatus');
        this.info = this.container.querySelector('#gridInfo');
    }

    bindEvents() {
        // Scenario changes
        this.subscribe('scenario:changed', () => this.renderGrid());
        
        // Entity selection
        this.subscribe('entity:selected', ({ entity }) => {
            this.highlightEntity(entity.id);
            this.status.textContent = 'LOCKED';
            this.status.className = 'grid-tv-status locked';
            this.info.textContent = `Perspective: ${entity.name} (${entity.type})`;
        });
        
        // Ripple triggered
        this.subscribe('ripple:triggered', ({ ripple, entity }) => {
            this.animateRipple(entity.id, ripple.vector);
            this.showCascade(ripple.cascades);
        });
        
        // State changes
        this.subscribe('entity:stateChanged', ({ entity }) => {
            this.updateEntityCell(entity);
        });
        
        // Autoplay
        this.subscribe('autoplay:started', () => {
            this.status.textContent = 'AUTO';
            this.status.className = 'grid-tv-status auto';
        });
        
        this.subscribe('autoplay:stopped', () => {
            this.status.textContent = 'STANDBY';
            this.status.className = 'grid-tv-status';
        });
    }

    render() {
        this.renderGrid();
    }

    renderGrid() {
        const scenario = this.engine.getCurrentScenario();
        if (!scenario) return;

        const { cols, rows } = scenario.grid;
        
        // Build entity position map
        const entityMap = new Map();
        scenario.entities.forEach(e => {
            entityMap.set(`${e.position.x},${e.position.y}`, e);
        });

        // Create grid cells
        this.screen.innerHTML = '';
        this.screen.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        this.screen.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;

                const entity = entityMap.get(`${x},${y}`);
                if (entity) {
                    cell.classList.add('has-entity');
                    cell.dataset.entity = entity.id;
                    cell.innerHTML = `
                        <span class="entity-icon">${entity.icon}</span>
                        <span class="entity-state-indicator" data-state="${entity.state}"></span>
                    `;
                    cell.addEventListener('click', () => {
                        this.engine.selectEntity(entity.id);
                    });
                }

                this.screen.appendChild(cell);
            }
        }

        // Draw adjacency connections (SVG overlay)
        this.drawConnections(scenario);
    }

    drawConnections(scenario) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.classList.add('grid-connections');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.pointerEvents = 'none';

        const cellSize = this.screen.offsetWidth / scenario.grid.cols;

        scenario.entities.forEach(entity => {
            entity.adjacentTo?.forEach(adjId => {
                const adj = scenario.entities.find(e => e.id === adjId);
                if (!adj) return;

                const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                line.setAttribute('x1', (entity.position.x + 0.5) * cellSize);
                line.setAttribute('y1', (entity.position.y + 0.5) * cellSize);
                line.setAttribute('x2', (adj.position.x + 0.5) * cellSize);
                line.setAttribute('y2', (adj.position.y + 0.5) * cellSize);
                line.classList.add('connection-line');
                svg.appendChild(line);
            });
        });

        this.screen.appendChild(svg);
    }

    highlightEntity(entityId) {
        // Clear previous selection
        this.screen.querySelectorAll('.grid-cell.selected').forEach(c => {
            c.classList.remove('selected');
        });

        // Highlight new selection
        const cell = this.screen.querySelector(`[data-entity="${entityId}"]`);
        if (cell) {
            cell.classList.add('selected');
        }
    }

    updateEntityCell(entity) {
        const cell = this.screen.querySelector(`[data-entity="${entity.id}"]`);
        if (cell) {
            const indicator = cell.querySelector('.entity-state-indicator');
            if (indicator) {
                indicator.dataset.state = entity.state;
            }
        }
    }

    animateRipple(entityId, vector) {
        const cell = this.screen.querySelector(`[data-entity="${entityId}"]`);
        if (!cell) return;

        // Flash effect
        cell.classList.add('rippling', vector.toLowerCase());
        
        // Concentric rings
        const colors = {
            GOAL: '#ffd700',
            OBSTACLE: '#ff3333',
            SHIFT: '#00ffff'
        };

        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const ring = document.createElement('div');
                ring.className = 'ripple-ring';
                ring.style.borderColor = colors[vector];
                ring.style.animationDelay = `${i * 0.1}s`;
                cell.appendChild(ring);
                
                setTimeout(() => ring.remove(), 1000);
            }, i * 100);
        }

        setTimeout(() => {
            cell.classList.remove('rippling', vector.toLowerCase());
        }, 800);
    }

    showCascade(cascades) {
        cascades.forEach((cascade, i) => {
            setTimeout(() => {
                const cell = this.screen.querySelector(`[data-entity="${cascade.entityId}"]`);
                if (cell) {
                    cell.style.opacity = cascade.intensity;
                    setTimeout(() => {
                        cell.style.opacity = '';
                    }, 500);
                }
            }, 200 + i * 100);
        });
    }
}

// ============================================
// TERMINAL VISUALIZER
// ============================================

/**
 * Terminal - Text-only visualization
 * 
 * Pure text interface for minimal resource environments
 * or accessibility needs.
 * 
 * CONTEXT WINDOW: ~400 tokens
 */
class TerminalVisualizer extends Visualizer {
    buildDOM() {
        this.container.className = 'terminal-visualizer';
        this.container.innerHTML = `
            <div class="terminal-output" id="terminalOutput"></div>
            <div class="terminal-input">
                <span class="terminal-prompt">&gt;</span>
                <input type="text" id="terminalInput" placeholder="command..." />
            </div>
        `;
        
        this.output = this.container.querySelector('#terminalOutput');
        this.input = this.container.querySelector('#terminalInput');
    }

    bindEvents() {
        this.subscribe('scenario:changed', ({ scenario }) => {
            this.log(`Loaded scenario: ${scenario.name}`);
        });

        this.subscribe('entity:selected', ({ entity }) => {
            this.log(`Selected: ${entity.name} [${entity.type}]`);
        });

        this.subscribe('ripple:triggered', ({ ripple }) => {
            this.log(`[${ripple.vector}] ${ripple.entityName}: ${ripple.description.substring(0, 60)}...`);
        });

        this.subscribe('patterns:detected', ({ patterns }) => {
            patterns.forEach(p => {
                this.log(`PATTERN: ${p.description} (${Math.round(p.confidence * 100)}% confidence)`);
            });
        });

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.handleCommand(this.input.value);
                this.input.value = '';
            }
        });
    }

    log(message, type = 'info') {
        const line = document.createElement('div');
        line.className = `terminal-line ${type}`;
        line.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        this.output.appendChild(line);
        this.output.scrollTop = this.output.scrollHeight;
    }

    handleCommand(cmd) {
        const parts = cmd.trim().toLowerCase().split(' ');
        
        switch (parts[0]) {
            case 'select':
            case 's':
                const entity = this.engine.getCurrentScenario().entities.find(
                    e => e.id === parts[1] || e.name.toLowerCase().includes(parts[1])
                );
                if (entity) {
                    this.engine.selectEntity(entity.id);
                } else {
                    this.log(`Entity not found: ${parts[1]}`, 'error');
                }
                break;
                
            case 'goal':
            case 'g':
                this.engine.triggerRipple('GOAL');
                break;
                
            case 'obstacle':
            case 'o':
                this.engine.triggerRipple('OBSTACLE');
                break;
                
            case 'shift':
            case 'sh':
                this.engine.triggerRipple('SHIFT');
                break;
                
            case 'scenario':
            case 'sc':
                if (parts[1]) {
                    this.engine.loadScenario(parts[1]);
                } else {
                    this.log(`Current: ${this.engine.state.currentScenario}`);
                }
                break;
                
            case 'autoplay':
            case 'a':
                if (this.engine.state.isAutoplay) {
                    this.engine.stopAutoplay();
                    this.log('Autoplay stopped');
                } else {
                    this.engine.startAutoplay();
                    this.log('Autoplay started');
                }
                break;
                
            case 'help':
            case 'h':
                this.log('Commands: select/s, goal/g, obstacle/o, shift/sh, scenario/sc, autoplay/a, help/h');
                break;
                
            default:
                this.log(`Unknown command: ${parts[0]}`, 'error');
        }
    }

    render() {
        this.log('RIPPLES Terminal v1.0');
        this.log('Type "help" for commands');
    }
}

// ============================================
// NETWORK GRAPH VISUALIZER
// ============================================

/**
 * NetworkGraph - Force-directed entity relationships
 * 
 * Shows entities as nodes with adjacency as edges.
 * Useful for understanding cascade propagation.
 * 
 * CONTEXT WINDOW: ~1000 tokens (requires D3 or similar)
 */
class NetworkGraphVisualizer extends Visualizer {
    buildDOM() {
        this.container.className = 'network-graph-visualizer';
        this.container.innerHTML = `
            <div class="network-header">
                <span class="network-title">CASCADE NETWORK</span>
            </div>
            <svg class="network-svg" id="networkSvg"></svg>
        `;
        
        this.svg = this.container.querySelector('#networkSvg');
        
        // Simple force simulation (no external deps)
        this.nodes = [];
        this.links = [];
        this.simulation = null;
    }

    bindEvents() {
        this.subscribe('scenario:changed', () => this.buildGraph());
        
        this.subscribe('ripple:triggered', ({ ripple }) => {
            this.highlightNode(ripple.entityId, ripple.vector);
            this.animatePropagation(ripple.cascades);
        });
    }

    buildGraph() {
        const scenario = this.engine.getCurrentScenario();
        if (!scenario) return;

        // Build nodes and links
        this.nodes = scenario.entities.map(e => ({
            id: e.id,
            name: e.name,
            type: e.type,
            x: Math.random() * 400 + 50,
            y: Math.random() * 300 + 50
        }));

        this.links = [];
        scenario.entities.forEach(e => {
            e.adjacentTo?.forEach(adjId => {
                if (!this.links.find(l => 
                    (l.source === e.id && l.target === adjId) ||
                    (l.source === adjId && l.target === e.id)
                )) {
                    this.links.push({ source: e.id, target: adjId });
                }
            });
        });

        this.startSimulation();
    }

    startSimulation() {
        // Simple force-directed layout
        const width = this.svg.clientWidth || 500;
        const height = this.svg.clientHeight || 400;
        
        const centerForce = () => {
            this.nodes.forEach(n => {
                n.x += (width / 2 - n.x) * 0.01;
                n.y += (height / 2 - n.y) * 0.01;
            });
        };

        const repelForce = () => {
            for (let i = 0; i < this.nodes.length; i++) {
                for (let j = i + 1; j < this.nodes.length; j++) {
                    const dx = this.nodes[j].x - this.nodes[i].x;
                    const dy = this.nodes[j].y - this.nodes[i].y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    const force = 1000 / (dist * dist);
                    const fx = (dx / dist) * force;
                    const fy = (dy / dist) * force;
                    
                    this.nodes[i].x -= fx;
                    this.nodes[i].y -= fy;
                    this.nodes[j].x += fx;
                    this.nodes[j].y += fy;
                }
            }
        };

        const linkForce = () => {
            this.links.forEach(l => {
                const source = this.nodes.find(n => n.id === l.source);
                const target = this.nodes.find(n => n.id === l.target);
                if (!source || !target) return;
                
                const dx = target.x - source.x;
                const dy = target.y - source.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const force = (dist - 100) * 0.01;
                const fx = (dx / dist) * force;
                const fy = (dy / dist) * force;
                
                source.x += fx;
                source.y += fy;
                target.x -= fx;
                target.y -= fy;
            });
        };

        const render = () => {
            centerForce();
            repelForce();
            linkForce();
            
            // Keep in bounds
            this.nodes.forEach(n => {
                n.x = Math.max(20, Math.min(width - 20, n.x));
                n.y = Math.max(20, Math.min(height - 20, n.y));
            });
            
            this.drawGraph();
        };

        this.simulation = setInterval(render, 50);
    }

    drawGraph() {
        // Clear and redraw
        this.svg.innerHTML = '';
        
        // Draw links
        this.links.forEach(l => {
            const source = this.nodes.find(n => n.id === l.source);
            const target = this.nodes.find(n => n.id === l.target);
            if (!source || !target) return;
            
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', source.x);
            line.setAttribute('y1', source.y);
            line.setAttribute('x2', target.x);
            line.setAttribute('y2', target.y);
            line.classList.add('network-link');
            this.svg.appendChild(line);
        });
        
        // Draw nodes
        this.nodes.forEach(n => {
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.classList.add('network-node');
            g.dataset.id = n.id;
            g.style.cursor = 'pointer';
            
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', n.x);
            circle.setAttribute('cy', n.y);
            circle.setAttribute('r', 20);
            circle.classList.add('node-circle', n.type);
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', n.x);
            text.setAttribute('y', n.y + 4);
            text.setAttribute('text-anchor', 'middle');
            text.classList.add('node-label');
            text.textContent = n.name.substring(0, 3);
            
            g.appendChild(circle);
            g.appendChild(text);
            
            g.addEventListener('click', () => {
                this.engine.selectEntity(n.id);
            });
            
            this.svg.appendChild(g);
        });
    }

    highlightNode(nodeId, vector) {
        const node = this.svg.querySelector(`[data-id="${nodeId}"] .node-circle`);
        if (node) {
            const colors = { GOAL: '#ffd700', OBSTACLE: '#ff3333', SHIFT: '#00ffff' };
            node.style.stroke = colors[vector];
            node.style.strokeWidth = '4';
            
            setTimeout(() => {
                node.style.stroke = '';
                node.style.strokeWidth = '';
            }, 1000);
        }
    }

    animatePropagation(cascades) {
        cascades.forEach((c, i) => {
            setTimeout(() => {
                const node = this.svg.querySelector(`[data-id="${c.entityId}"] .node-circle`);
                if (node) {
                    node.style.opacity = c.intensity;
                    setTimeout(() => {
                        node.style.opacity = '';
                    }, 500);
                }
            }, 200 + i * 100);
        });
    }

    unmount() {
        if (this.simulation) {
            clearInterval(this.simulation);
        }
        super.unmount();
    }
}

// ============================================
// VISUALIZER REGISTRY
// ============================================

const Visualizers = {
    gridtv: GridTVVisualizer,
    terminal: TerminalVisualizer,
    network: NetworkGraphVisualizer
};

// ============================================
// EXPORTS
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        Visualizer, 
        GridTVVisualizer, 
        TerminalVisualizer, 
        NetworkGraphVisualizer,
        Visualizers 
    };
}
