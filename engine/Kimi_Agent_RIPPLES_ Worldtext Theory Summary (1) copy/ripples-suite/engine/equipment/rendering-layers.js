/**
 * RIPPLES RENDERING LAYERS EQUIPMENT
 * ==================================
 * 
 * BRIDGE: [Engine Events] -> [Visual Effects]
 * 
 * Attachable rendering layers that enhance ANY visualization.
 * Works with Canvas, DOM, or React renderers.
 * 
 * CONTEXT WINDOW: ~800 tokens
 */

// ============================================
// BASE LAYER CLASS
// ============================================

class RenderLayer {
    constructor(config = {}) {
        this.enabled = config.enabled ?? true;
        this.intensity = config.intensity ?? 0.5;
        this.canvas = null;
        this.ctx = null;
    }

    attach(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    detach() {
        this.canvas = null;
        this.ctx = null;
    }

    render() {
        // Override in subclass
    }

    setIntensity(value) {
        this.intensity = Math.max(0, Math.min(1, value));
    }
}

// ============================================
// CRT LAYER
// ============================================

class CRTLayer extends RenderLayer {
    constructor(config = {}) {
        super(config);
        this.scanlineSpacing = config.scanlineSpacing || 4;
        this.scanlineOpacity = config.scanlineOpacity || 0.15;
        this.flickerSpeed = config.flickerSpeed || 0.15;
        this.phosphorColor = config.phosphorColor || '#4af626';
        this.curvature = config.curvature ?? 0.1;
        this.vignetteStrength = config.vignetteStrength ?? 0.4;
    }

    render() {
        if (!this.ctx || !this.enabled) return;

        const { width, height } = this.canvas;

        // Scanlines
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.fillStyle = `rgba(0, 0, 0, ${this.scanlineOpacity})`;
        
        for (let y = 0; y < height; y += this.scanlineSpacing) {
            this.ctx.fillRect(0, y, width, 1);
        }
        this.ctx.restore();

        // Vignette
        const gradient = this.ctx.createRadialGradient(
            width / 2, height / 2, 0,
            width / 2, height / 2, Math.max(width, height) / 1.5
        );
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, `rgba(0, 0, 0, ${this.vignetteStrength})`);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, width, height);

        // Screen curvature (subtle barrel distortion)
        if (this.curvature > 0) {
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'destination-in';
            const gradient2 = this.ctx.createRadialGradient(
                width / 2, height / 2, 0,
                width / 2, height / 2, Math.max(width, height) / 2
            );
            gradient2.addColorStop(0.8, 'rgba(255, 255, 255, 1)');
            gradient2.addColorStop(1, 'rgba(255, 255, 255, 0)');
            this.ctx.fillStyle = gradient2;
            this.ctx.fillRect(0, 0, width, height);
            this.ctx.restore();
        }
    }

    flicker() {
        if (!this.ctx || !this.enabled) return;
        
        const flicker = 0.97 + Math.random() * 0.03;
        this.ctx.save();
        this.ctx.globalAlpha = (1 - flicker) * this.intensity;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }
}

// ============================================
// BLOOM LAYER
// ============================================

class BloomLayer extends RenderLayer {
    constructor(config = {}) {
        super(config);
        this.pulses = [];
        this.decay = config.decay || 0.95;
    }

    pulse(color, position = null, radius = 100) {
        if (!this.enabled) return;
        
        this.pulses.push({
            color,
            position: position || { 
                x: this.canvas?.width / 2 || 0, 
                y: this.canvas?.height / 2 || 0 
            },
            radius,
            intensity: 1,
            timestamp: Date.now()
        });
    }

    render() {
        if (!this.ctx || !this.enabled) return;

        // Update and render pulses
        this.pulses = this.pulses.filter(pulse => {
            pulse.intensity *= this.decay;
            
            if (pulse.intensity < 0.01) return false;

            const gradient = this.ctx.createRadialGradient(
                pulse.position.x, pulse.position.y, 0,
                pulse.position.x, pulse.position.y, pulse.radius
            );
            
            const alpha = pulse.intensity * this.intensity;
            gradient.addColorStop(0, this.hexToRgba(pulse.color, alpha));
            gradient.addColorStop(0.5, this.hexToRgba(pulse.color, alpha * 0.3));
            gradient.addColorStop(1, this.hexToRgba(pulse.color, 0));

            this.ctx.save();
            this.ctx.globalCompositeOperation = 'screen';
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();

            return true;
        });
    }

    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}

// ============================================
// NOISE LAYER
// ============================================

class NoiseLayer extends RenderLayer {
    constructor(config = {}) {
        super(config);
        this.grainSize = config.grainSize || 1;
        this.amount = config.amount || 0.05;
        this.burstIntensity = 0;
    }

    burst() {
        this.burstIntensity = 1;
    }

    render() {
        if (!this.ctx || !this.enabled) return;

        const { width, height } = this.canvas;
        const imageData = this.ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        const noiseAmount = (this.amount + this.burstIntensity * 0.3) * this.intensity;

        for (let i = 0; i < data.length; i += 4) {
            if (Math.random() < noiseAmount) {
                const noise = (Math.random() - 0.5) * 50;
                data[i] = Math.min(255, Math.max(0, data[i] + noise));
                data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
                data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
            }
        }

        this.ctx.putImageData(imageData, 0, 0);

        // Decay burst
        this.burstIntensity *= 0.9;
    }
}

// ============================================
// VIGNETTE LAYER
// ============================================

class VignetteLayer extends RenderLayer {
    constructor(config = {}) {
        super(config);
        this.radius = config.radius || 0.7;
        this.softness = config.softness || 0.4;
        this.color = config.color || '#000000';
    }

    render() {
        if (!this.ctx || !this.enabled) return;

        const { width, height } = this.canvas;
        const centerX = width / 2;
        const centerY = height / 2;
        const maxRadius = Math.max(width, height) / 2;

        const gradient = this.ctx.createRadialGradient(
            centerX, centerY, maxRadius * this.radius * (1 - this.softness),
            centerX, centerY, maxRadius
        );

        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(1, this.hexToRgba(this.color, this.intensity));

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, width, height);
    }

    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}

// ============================================
// GRID OVERLAY LAYER (Matrix Rain)
// ============================================

class GridOverlayLayer extends RenderLayer {
    constructor(config = {}) {
        super(config);
        this.columns = config.columns || 50;
        this.fontSize = config.fontSize || 14;
        this.characters = config.characters || '01アイウエオカキクケコ';
        this.drops = [];
        this.speed = config.speed || 1;
    }

    attach(canvas) {
        super.attach(canvas);
        this.initDrops();
    }

    initDrops() {
        this.drops = [];
        for (let i = 0; i < this.columns; i++) {
            this.drops.push({
                x: i * (this.canvas.width / this.columns),
                y: Math.random() * -100,
                speed: 2 + Math.random() * 3,
                chars: []
            });
        }
    }

    render() {
        if (!this.ctx || !this.enabled) return;

        this.ctx.save();
        this.ctx.font = `${this.fontSize}px monospace`;
        this.ctx.fillStyle = `rgba(0, 255, 70, ${0.1 * this.intensity})`;
        this.ctx.textAlign = 'center';

        this.drops.forEach(drop => {
            // Add new character
            if (Math.random() < 0.1) {
                drop.chars.push({
                    char: this.characters[Math.floor(Math.random() * this.characters.length)],
                    y: drop.y,
                    opacity: 1
                });
            }

            // Update and render characters
            drop.chars = drop.chars.filter(char => {
                char.y += drop.speed * this.speed;
                char.opacity -= 0.02;

                if (char.opacity > 0 && char.y < this.canvas.height) {
                    this.ctx.globalAlpha = char.opacity * this.intensity;
                    this.ctx.fillText(char.char, drop.x, char.y);
                    return true;
                }
                return false;
            });

            // Reset drop if off screen
            if (drop.chars.length === 0 && Math.random() < 0.01) {
                drop.y = -this.fontSize;
            }
        });

        this.ctx.restore();
    }
}

// ============================================
// RENDERING LAYERS EQUIPMENT
// ============================================

class RenderingLayersEquipment {
    constructor(engine, config = {}) {
        this.engine = engine;
        this.layers = new Map();
        this.targetCanvas = null;
        this.isRunning = false;
        this.animationId = null;

        // Default layers
        this.registerLayer('crt', new CRTLayer(config.crt));
        this.registerLayer('bloom', new BloomLayer(config.bloom));
        this.registerLayer('noise', new NoiseLayer(config.noise));
        this.registerLayer('vignette', new VignetteLayer(config.vignette));
        this.registerLayer('grid', new GridOverlayLayer(config.grid));

        // Bind to engine events
        this.bindEngineEvents();
    }

    registerLayer(name, layer) {
        this.layers.set(name, layer);
    }

    bindEngineEvents() {
        // Bloom on vector trigger
        this.engine.events.on('ripple:complete', ({ ripple }) => {
            const colors = {
                GOAL: '#ffd700',
                OBSTACLE: '#ff3333',
                SHIFT: '#00ffff'
            };
            this.layers.get('bloom')?.pulse(colors[ripple.vector]);
        });

        // Noise burst on state changes
        this.engine.events.on('scenario:change', () => {
            this.layers.get('noise')?.burst();
        });
    }

    enable(layerNames) {
        layerNames.forEach(name => {
            const layer = this.layers.get(name);
            if (layer) layer.enabled = true;
        });
    }

    disable(layerNames) {
        layerNames.forEach(name => {
            const layer = this.layers.get(name);
            if (layer) layer.enabled = false;
        });
    }

    setIntensity(layerName, value) {
        this.layers.get(layerName)?.setIntensity(value);
    }

    attach(canvas) {
        this.targetCanvas = canvas;
        this.layers.forEach(layer => layer.attach(canvas));
    }

    detach() {
        this.stop();
        this.layers.forEach(layer => layer.detach());
        this.targetCanvas = null;
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.renderLoop();
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    renderLoop() {
        if (!this.isRunning) return;

        this.layers.forEach(layer => {
            if (layer.enabled) {
                layer.render();
            }
        });

        // CRT flicker
        if (Math.random() < 0.1) {
            this.layers.get('crt')?.flicker();
        }

        this.animationId = requestAnimationFrame(() => this.renderLoop());
    }

    // One-shot render (for non-animated use)
    render() {
        this.layers.forEach(layer => {
            if (layer.enabled) layer.render();
        });
    }
}

// ============================================
// EXPORTS
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        RenderLayer,
        CRTLayer,
        BloomLayer,
        NoiseLayer,
        VignetteLayer,
        GridOverlayLayer,
        RenderingLayersEquipment
    };
}
