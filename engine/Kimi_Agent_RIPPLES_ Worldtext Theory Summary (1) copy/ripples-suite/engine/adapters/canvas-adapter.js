/**
 * RIPPLES CANVAS ADAPTER
 * ======================
 * 
 * BRIDGE: [Canvas Renderer] -> [RIPPLES Engine]
 * 
 * For particle simulations, immediate-mode UI, and infinite grids.
 * 
 * CONTEXT WINDOW: ~700 tokens
 */

// ============================================
// CANVAS VISUALIZATION ADAPTER
// ============================================

class CanvasAdapter {
    constructor(engine, canvas, config = {}) {
        this.engine = engine;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.config = {
            backgroundColor: config.backgroundColor || '#050a05',
            gridColor: config.gridColor || '#0a1f0a',
            entityColors: config.entityColors || {
                animate: '#4af626',
                inanimate: '#2a6a2a',
                abstract: '#00ffff'
            },
            vectorColors: config.vectorColors || {
                GOAL: '#ffd700',
                OBSTACLE: '#ff3333',
                SHIFT: '#00ffff'
            },
            ...config
        };

        this.particles = new Map();
        this.ripples = [];
        this.connections = [];
        
        this.bindEngineEvents();
        this.resize();
    }

    bindEngineEvents() {
        // Scenario change - rebuild
        this.engine.events.on('scenario:change', () => {
            this.rebuildParticles();
        });

        // Entity selection
        this.engine.events.on('entity:select', ({ entity }) => {
            this.highlightParticle(entity.id);
        });

        // Ripple completion
        this.engine.events.on('ripple:complete', ({ ripple }) => {
            this.spawnRippleWave(ripple);
        });

        // State changes
        this.engine.events.on('entity:stateChange', ({ entity }) => {
            this.updateParticleState(entity);
        });

        // Window resize
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const rect = this.canvas.parentElement?.getBoundingClientRect();
        if (rect) {
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
        }
        this.rebuildParticles();
    }

    // ============================================
    // PARTICLE SYSTEM
    // ============================================

    rebuildParticles() {
        this.particles.clear();
        this.connections = [];

        const scenario = this.engine.getScenario();
        if (!scenario) return;

        const entities = this.engine.getEntities();
        const { width, height } = this.canvas;

        // Calculate grid cell size
        const cols = scenario.grid?.cols || 8;
        const rows = scenario.grid?.rows || 6;
        const cellW = width / cols;
        const cellH = height / rows;

        entities.forEach(entity => {
            const x = (entity.position?.x || 0) * cellW + cellW / 2;
            const y = (entity.position?.y || 0) * cellH + cellH / 2;

            this.particles.set(entity.id, {
                id: entity.id,
                x, y,
                targetX: x,
                targetY: y,
                vx: 0, vy: 0,
                radius: Math.min(cellW, cellH) * 0.3,
                color: this.config.entityColors[entity.type] || '#4af626',
                entity,
                selected: false,
                rippling: false,
                rippleVector: null,
                intensity: 0
            });
        });

        // Build connections
        entities.forEach(entity => {
            entity.adjacentTo?.forEach(adjId => {
                if (!this.connections.find(c => 
                    (c.from === entity.id && c.to === adjId) ||
                    (c.from === adjId && c.to === entity.id)
                )) {
                    this.connections.push({ from: entity.id, to: adjId });
                }
            });
        });
    }

    highlightParticle(entityId) {
        this.particles.forEach(p => p.selected = false);
        const particle = this.particles.get(entityId);
        if (particle) {
            particle.selected = true;
        }
    }

    updateParticleState(entity) {
        const particle = this.particles.get(entity.id);
        if (particle) {
            particle.entity = entity;
        }
    }

    spawnRippleWave(ripple) {
        const particle = this.particles.get(ripple.entityId);
        if (!particle) return;

        particle.rippling = true;
        particle.rippleVector = ripple.vector;
        particle.intensity = 1;

        // Spawn visual ripple rings
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.ripples.push({
                    x: particle.x,
                    y: particle.y,
                    radius: particle.radius,
                    maxRadius: particle.radius * 8,
                    color: this.config.vectorColors[ripple.vector],
                    opacity: 1,
                    speed: 2
                });
            }, i * 100);
        }

        // Cascade effects to adjacent
        ripple.cascades?.forEach((cascade, i) => {
            setTimeout(() => {
                const adjParticle = this.particles.get(cascade.entityId);
                if (adjParticle) {
                    adjParticle.intensity = cascade.intensity;
                }
            }, 200 + i * 100);
        });

        // Clear ripple state
        setTimeout(() => {
            particle.rippling = false;
            particle.rippleVector = null;
        }, 1000);
    }

    // ============================================
    // RENDER LOOP
    // ============================================

    render() {
        const { width, height } = this.canvas;

        // Clear
        this.ctx.fillStyle = this.config.backgroundColor;
        this.ctx.fillRect(0, 0, width, height);

        // Draw grid
        this.drawGrid();

        // Update and draw connections
        this.drawConnections();

        // Update and draw particles
        this.updateParticles();
        this.drawParticles();

        // Update and draw ripples
        this.updateRipples();
        this.drawRipples();
    }

    drawGrid() {
        const scenario = this.engine.getScenario();
        if (!scenario?.grid) return;

        const { width, height } = this.canvas;
        const cols = scenario.grid.cols;
        const rows = scenario.grid.rows;

        this.ctx.strokeStyle = this.config.gridColor;
        this.ctx.lineWidth = 1;

        // Vertical lines
        for (let i = 1; i < cols; i++) {
            const x = (width / cols) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, height);
            this.ctx.stroke();
        }

        // Horizontal lines
        for (let i = 1; i < rows; i++) {
            const y = (height / rows) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(width, y);
            this.ctx.stroke();
        }
    }

    drawConnections() {
        this.ctx.strokeStyle = 'rgba(74, 246, 38, 0.1)';
        this.ctx.lineWidth = 1;

        this.connections.forEach(conn => {
            const from = this.particles.get(conn.from);
            const to = this.particles.get(conn.to);
            if (!from || !to) return;

            this.ctx.beginPath();
            this.ctx.moveTo(from.x, from.y);
            this.ctx.lineTo(to.x, to.y);
            this.ctx.stroke();
        });
    }

    updateParticles() {
        this.particles.forEach(p => {
            // Smooth movement to target
            p.x += (p.targetX - p.x) * 0.1;
            p.y += (p.targetY - p.y) * 0.1;

            // Decay intensity
            p.intensity *= 0.95;
        });
    }

    drawParticles() {
        this.particles.forEach(p => {
            // Glow for selected
            if (p.selected) {
                const gradient = this.ctx.createRadialGradient(
                    p.x, p.y, 0,
                    p.x, p.y, p.radius * 3
                );
                gradient.addColorStop(0, 'rgba(74, 246, 38, 0.3)');
                gradient.addColorStop(1, 'transparent');
                
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2);
                this.ctx.fill();
            }

            // Ripple glow
            if (p.rippling && p.rippleVector) {
                const color = this.config.vectorColors[p.rippleVector];
                const gradient = this.ctx.createRadialGradient(
                    p.x, p.y, 0,
                    p.x, p.y, p.radius * 2
                );
                gradient.addColorStop(0, this.hexToRgba(color, 0.5));
                gradient.addColorStop(1, 'transparent');
                
                this.ctx.fillStyle = gradient;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
                this.ctx.fill();
            }

            // Main particle
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();

            // Icon/text
            this.ctx.fillStyle = '#000';
            this.ctx.font = `${p.radius}px sans-serif`;
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(p.entity.icon || '●', p.x, p.y);

            // State indicator
            if (p.intensity > 0.1) {
                this.ctx.strokeStyle = `rgba(74, 246, 38, ${p.intensity})`;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius + 4, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        });
    }

    updateRipples() {
        this.ripples = this.ripples.filter(r => {
            r.radius += r.speed;
            r.opacity -= 0.02;
            return r.opacity > 0 && r.radius < r.maxRadius;
        });
    }

    drawRipples() {
        this.ripples.forEach(r => {
            this.ctx.strokeStyle = this.hexToRgba(r.color, r.opacity);
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
            this.ctx.stroke();
        });
    }

    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // ============================================
    // INTERACTION
    // ============================================

    handleClick(x, y) {
        // Find clicked particle
        let clicked = null;
        let minDist = Infinity;

        this.particles.forEach(p => {
            const dx = x - p.x;
            const dy = y - p.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < p.radius * 2 && dist < minDist) {
                minDist = dist;
                clicked = p;
            }
        });

        if (clicked) {
            this.engine.selectEntity(clicked.id);
            return true;
        }

        return false;
    }

    startRenderLoop() {
        const loop = () => {
            this.render();
            requestAnimationFrame(loop);
        };
        loop();
    }
}

// ============================================
// INFINITE GRID ADAPTER
// ============================================

class InfiniteGridAdapter extends CanvasAdapter {
    constructor(engine, canvas, config = {}) {
        super(engine, canvas, config);
        
        this.view = {
            x: 0,
            y: 0,
            zoom: 1
        };
        
        this.cells = new Map(); // Sparse grid storage
        this.waves = []; // Propagating ripple waves
        
        this.bindNavigation();
    }

    bindNavigation() {
        let isDragging = false;
        let lastX, lastY;

        this.canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            this.view.x += (e.clientX - lastX) / this.view.zoom;
            this.view.y += (e.clientY - lastY) / this.view.zoom;
            
            lastX = e.clientX;
            lastY = e.clientY;
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
        });

        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
            this.view.zoom *= zoomFactor;
            this.view.zoom = Math.max(0.1, Math.min(5, this.view.zoom));
        });
    }

    spawnWave(origin, vector) {
        this.waves.push({
            origin: { ...origin },
            vector,
            radius: 0,
            maxRadius: 20,
            cellsAffected: new Set()
        });
    }

    updateWaves() {
        this.waves = this.waves.filter(wave => {
            wave.radius += 0.5;
            
            // Affect cells at current radius
            const circumference = Math.PI * 2 * wave.radius;
            const steps = Math.max(8, Math.floor(circumference / 2));
            
            for (let i = 0; i < steps; i++) {
                const angle = (i / steps) * Math.PI * 2;
                const x = Math.round(wave.origin.x + Math.cos(angle) * wave.radius);
                const y = Math.round(wave.origin.y + Math.sin(angle) * wave.radius);
                const key = `${x},${y}`;
                
                if (!wave.cellsAffected.has(key)) {
                    wave.cellsAffected.add(key);
                    
                    // Update cell state
                    if (!this.cells.has(key)) {
                        this.cells.set(key, { intensity: 0, vector: wave.vector });
                    }
                    const cell = this.cells.get(key);
                    cell.intensity = Math.max(cell.intensity, 1 - wave.radius / wave.maxRadius);
                    cell.vector = wave.vector;
                }
            }
            
            return wave.radius < wave.maxRadius;
        });

        // Decay cell intensities
        this.cells.forEach((cell, key) => {
            cell.intensity *= 0.95;
            if (cell.intensity < 0.01) {
                this.cells.delete(key);
            }
        });
    }

    render() {
        const { width, height } = this.canvas;

        // Clear
        this.ctx.fillStyle = this.config.backgroundColor;
        this.ctx.fillRect(0, 0, width, height);

        // Calculate visible range
        const cellSize = 40 * this.view.zoom;
        const startX = Math.floor(-this.view.x / cellSize);
        const startY = Math.floor(-this.view.y / cellSize);
        const endX = startX + Math.ceil(width / cellSize) + 1;
        const endY = startY + Math.ceil(height / cellSize) + 1;

        // Draw grid
        this.ctx.strokeStyle = this.config.gridColor;
        this.ctx.lineWidth = 1 / this.view.zoom;

        for (let x = startX; x <= endX; x++) {
            const screenX = x * cellSize + this.view.x;
            this.ctx.beginPath();
            this.ctx.moveTo(screenX, 0);
            this.ctx.lineTo(screenX, height);
            this.ctx.stroke();
        }

        for (let y = startY; y <= endY; y++) {
            const screenY = y * cellSize + this.view.y;
            this.ctx.beginPath();
            this.ctx.moveTo(0, screenY);
            this.ctx.lineTo(width, screenY);
            this.ctx.stroke();
        }

        // Draw active cells
        this.cells.forEach((cell, key) => {
            const [x, y] = key.split(',').map(Number);
            const screenX = x * cellSize + this.view.x;
            const screenY = y * cellSize + this.view.y;

            const colors = {
                GOAL: '#ffd700',
                OBSTACLE: '#ff3333',
                SHIFT: '#00ffff'
            };

            this.ctx.fillStyle = this.hexToRgba(colors[cell.vector], cell.intensity * 0.5);
            this.ctx.fillRect(screenX, screenY, cellSize, cellSize);
        });

        // Update and draw waves
        this.updateWaves();

        // Draw entities
        const scenario = this.engine.getScenario();
        if (scenario?.entities) {
            scenario.entities.forEach(entity => {
                const screenX = entity.position.x * cellSize + this.view.x + cellSize / 2;
                const screenY = entity.position.y * cellSize + this.view.y + cellSize / 2;

                // Only draw if visible
                if (screenX > -cellSize && screenX < width + cellSize &&
                    screenY > -cellSize && screenY < height + cellSize) {
                    
                    this.ctx.fillStyle = this.config.entityColors[entity.type];
                    this.ctx.font = `${cellSize * 0.6}px sans-serif`;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(entity.icon, screenX, screenY);
                }
            });
        }

        // Draw zoom level indicator
        this.ctx.fillStyle = 'rgba(74, 246, 38, 0.5)';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Zoom: ${this.view.zoom.toFixed(2)}x`, 10, 20);
    }
}

// ============================================
// EXPORTS
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CanvasAdapter,
        InfiniteGridAdapter
    };
}
