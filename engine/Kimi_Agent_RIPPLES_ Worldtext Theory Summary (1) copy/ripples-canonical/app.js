/**
 * RIPPLES: Canonical Implementation
 * ==================================
 * 
 * Complete Operative Fiction system with:
 * - React state management
 * - Tone.js audio (drone + vector sonification)
 * - Tracery generative grammar
 * - CRT visual effects
 * - World Jockey workflow
 */

const { useState, useEffect, useRef, useCallback, useMemo } = React;

// ============================================
// LATENT LIBRARY
// ============================================

const LatentLibrary = {
    cupboard: {
        id: 'cupboard',
        name: 'THE CUPBOARD',
        baseline: `The cupboard space is pressurized by stillness. Light seeps only through marginal cracks between door and frame. Objects maintain rigid proximity. Six tall glasses (silica/dust coated) delimit the left boundary. A stack of twenty ceramic plates compresses the lower shelf space. The air is stagnant. Particles drift in slow Brownian motion, suspended in the amber light that filters through the crack.`,
        grid: { cols: 8, rows: 6 },
        entities: [
            { id: 'ant', name: 'Formicidae Scout', type: 'animate', state: 'foraging', icon: '🐜', position: { x: 1, y: 2 }, adjacentTo: ['plate-stack', 'tall-glass'] },
            { id: 'dust-mote', name: 'Dust Mote', type: 'inanimate', state: 'suspended', icon: '✧', position: { x: 0, y: 0 }, adjacentTo: ['light-shaft'] },
            { id: 'tall-glass', name: 'Tall Glass', type: 'inanimate', state: 'empty', icon: '🥛', position: { x: 2, y: 1 }, adjacentTo: ['ant', 'plate-stack', 'light-shaft'] },
            { id: 'plate-stack', name: 'Plate Stack', type: 'inanimate', state: 'compressed', icon: '🍽️', position: { x: 3, y: 3 }, adjacentTo: ['ant', 'tall-glass', 'shadow'] },
            { id: 'light-shaft', name: 'Light Shaft', type: 'abstract', state: 'filtering', icon: '☀️', position: { x: 7, y: 0 }, adjacentTo: ['dust-mote', 'tall-glass', 'shadow'] },
            { id: 'shadow', name: 'Shadow', type: 'abstract', state: 'expanding', icon: '⬛', position: { x: 6, y: 4 }, adjacentTo: ['plate-stack', 'light-shaft'] }
        ],
        latent: {
            ant: {
                GOAL: `The Formicidae Scout abandons the boundary cracks, navigating the ceramic topography of the plate stack. It traces an invisible chemical scent-line toward the tall glasses where a residue of dried liquid remains. Antennae process gradients. The world becomes a map of sugar probability.`,
                OBSTACLE: `The Formicidae Scout encounters a vertical cliff of ceramic: the edge of a plate. Its path is blocked. It pauses, antennae waving in frustrated inquiry, before beginning the long circumnavigation.`,
                SHIFT: `The Formicidae Scout enters a state of torpor. Its metabolic rate drops, its movements slow to glacial patience. It is no longer seeking but waiting, transformed from agent to object.`
            },
            'dust-mote': {
                GOAL: `The Dust Mote catches a thermal rising from the shelf below. It ascends in a lazy spiral, drawn toward the crack of light where the air moves.`,
                OBSTACLE: `The Dust Mote encounters a downdraft. The convection current reverses. It spirals downward, away from the light shaft.`,
                SHIFT: `The Dust Mote absorbs moisture from the air, swelling slightly. Its composition shifts: what was dry and light becomes damp and heavy.`
            },
            'tall-glass': {
                GOAL: `The Tall Glass dreams of being filled. Its emptiness aches for liquid, for the weight of water or wine, for the meniscus that would crown its rim.`,
                OBSTACLE: `The Tall Glass is blocked by its neighbors. Five identical vessels press against it, preventing movement.`,
                SHIFT: `The Tall Glass undergoes a phase transition in its crystalline structure. A micro-crack appears at the rim, invisible to unaided eyes.`
            },
            'plate-stack': {
                GOAL: `The Plate Stack dreams of dispersion. Compressed into vertical unity, the twenty plates long to be spread across a table, to receive food.`,
                OBSTACLE: `The Plate Stack is held in place by gravity and friction. To remove one is to risk the collapse of all.`,
                SHIFT: `The Plate Stack settles further, microscopically compressing. The air between them is squeezed out.`
            },
            'light-shaft': {
                GOAL: `The Light Shaft seeks expansion. Entering through the crack, it wants to fill the entire cupboard, to illuminate every corner.`,
                OBSTACLE: `The Light Shaft is blocked by the glasses. Their silica surfaces reflect and refract, scattering the photons.`,
                SHIFT: `The Light Shaft's wavelength shifts as it passes through dust-filled air. Scattered by particles, it changes color, becoming warmer, more golden.`
            },
            shadow: {
                GOAL: `The Shadow seeks depth. It wants to become darker, denser, more absolute. It dreams of perfect blackness.`,
                OBSTACLE: `The Shadow is pierced by a beam of light. Where it was absolute, it is now gradient.`,
                SHIFT: `The Shadow's edges blur as dust scatters the light. It is no longer a sharp boundary but a gradient, a zone of transition.`
            }
        },
        ambient: [
            { entityId: 'dust-mote', vector: 'SHIFT', probability: 0.3 },
            { entityId: 'shadow', vector: 'GOAL', probability: 0.2 },
            { entityId: 'ant', vector: 'GOAL', probability: 0.5 }
        ]
    },

    abandoned_house: {
        id: 'abandoned_house',
        name: 'ABANDONED HOUSE',
        baseline: `The abandoned house breathes through broken windows. Wind moves through rooms like blood through veins, carrying dust, leaves, the scent of rain. Floorboards have warped into waves. Wallpaper hangs in strips like shed skin. Nature has begun its reclamation.`,
        grid: { cols: 8, rows: 6 },
        entities: [
            { id: 'raccoon', name: 'Raccoon', type: 'animate', state: 'foraging', icon: '🦝', position: { x: 1, y: 1 }, adjacentTo: ['door', 'rain'] },
            { id: 'mold', name: 'Mold Colony', type: 'animate', state: 'colonizing', icon: '🍄', position: { x: 6, y: 2 }, adjacentTo: ['wallpaper', 'rain'] },
            { id: 'ivy', name: 'Ivy', type: 'animate', state: 'climbing', icon: '🌿', position: { x: 0, y: 4 }, adjacentTo: ['wallpaper', 'door'] },
            { id: 'rain', name: 'Rain', type: 'abstract', state: 'infiltrating', icon: '🌧️', position: { x: 4, y: 0 }, adjacentTo: ['raccoon', 'mold', 'wallpaper'] },
            { id: 'wallpaper', name: 'Wallpaper', type: 'inanimate', state: 'peeling', icon: '📜', position: { x: 2, y: 3 }, adjacentTo: ['mold', 'ivy', 'rain'] },
            { id: 'door', name: 'Door', type: 'inanimate', state: 'swollen', icon: '🚪', position: { x: 7, y: 5 }, adjacentTo: ['raccoon', 'ivy'] }
        ],
        latent: {
            raccoon: {
                GOAL: `The Raccoon seeks the attic's treasures. Its paws remember the texture of shiny objects, the weight of metal.`,
                OBSTACLE: `The Raccoon encounters a boarded window. The wood is old but strong, the nails rusted but holding.`,
                SHIFT: `The Raccoon enters a state of vigilance. It freezes, ears rotating, nose testing the air.`
            },
            mold: {
                GOAL: `The Mold Colony seeks expansion. From its stronghold on the mattress, it sends hyphae outward, exploring, colonizing.`,
                OBSTACLE: `The Mold Colony encounters dry plaster. The wall above the mattress is too arid.`,
                SHIFT: `The Mold Colony enters reproductive phase. Hyphae rise, swell, and burst, releasing clouds of spores.`
            },
            ivy: {
                GOAL: `The Ivy seeks the roof. From its base at the foundation, it climbs the wall, tendrils finding cracks.`,
                OBSTACLE: `The Ivy encounters painted wall. The surface is too smooth, the paint too intact.`,
                SHIFT: `The Ivy's leaves change shape. Lower leaves, in shadow, become larger, broader.`
            },
            rain: {
                GOAL: `The Rain seeks the lowest point. Entering through the roof's wound, it flows downward.`,
                OBSTACLE: `The Rain encounters the floor. The wood is dry, thirsty, absorbent.`,
                SHIFT: `The Rain becomes ice. Temperature drops; water on the attic floor crystallizes, expands.`
            },
            wallpaper: {
                GOAL: `The Wallpaper seeks freedom. It has been glued to plaster for decades, suffocating.`,
                OBSTACLE: `The Wallpaper encounters stubborn adhesive. In places, the glue still holds.`,
                SHIFT: `The Wallpaper changes color. Where it was floral, it is now brown.`
            },
            door: {
                GOAL: `The Door seeks closure. It has hung open for years, unable to seal the frame.`,
                OBSTACLE: `The Door encounters its own swelling. Moisture has expanded the wood.`,
                SHIFT: `The Door settles on its hinges. Years of gravity have pulled it downward.`
            }
        },
        ambient: [
            { entityId: 'rain', vector: 'SHIFT', probability: 0.3 },
            { entityId: 'mold', vector: 'GOAL', probability: 0.4 },
            { entityId: 'ivy', vector: 'GOAL', probability: 0.3 }
        ]
    },

    deep_forest: {
        id: 'deep_forest',
        name: 'DEEP FOREST',
        baseline: `The deep forest is a cathedral of verticality. Trunks rise like columns, branches arch like vaults. Light filters down in shafts. The forest floor is a tapestry: fallen leaves, rotting wood, fungal threads. Each tree is a city; the forest is a network.`,
        grid: { cols: 8, rows: 6 },
        entities: [
            { id: 'mycelium', name: 'Mycelium Network', type: 'animate', state: 'networking', icon: '🕸️', position: { x: 3, y: 3 }, adjacentTo: ['fallen-oak', 'seedling'] },
            { id: 'deer', name: 'Deer', type: 'animate', state: 'grazing', icon: '🦌', position: { x: 1, y: 2 }, adjacentTo: ['seedling', 'moonlight'] },
            { id: 'owl', name: 'Owl', type: 'animate', state: 'hunting', icon: '🦉', position: { x: 6, y: 1 }, adjacentTo: ['moonlight', 'fallen-oak'] },
            { id: 'seedling', name: 'Seedling', type: 'animate', state: 'reaching', icon: '🌱', position: { x: 2, y: 4 }, adjacentTo: ['mycelium', 'deer', 'fallen-oak'] },
            { id: 'fallen-oak', name: 'Fallen Oak', type: 'inanimate', state: 'decaying', icon: '🪵', position: { x: 4, y: 5 }, adjacentTo: ['mycelium', 'seedling', 'owl'] },
            { id: 'moonlight', name: 'Moonlight', type: 'abstract', state: 'filtering', icon: '🌙', position: { x: 7, y: 0 }, adjacentTo: ['deer', 'owl'] }
        ],
        latent: {
            mycelium: {
                GOAL: `The Mycelium Network seeks connection. Hyphae extend through soil, searching for roots, for other fungi.`,
                OBSTACLE: `The Mycelium Network encounters compacted soil. The hyphae cannot penetrate dense clay.`,
                SHIFT: `The Mycelium Network enters fruiting phase. Hyphae gather, swell, and rise, becoming mushroom.`
            },
            deer: {
                GOAL: `The Deer seeks the clearing. Its stomach is empty, its need urgent.`,
                OBSTACLE: `The Deer encounters the stream. Water is high, current strong.`,
                SHIFT: `The Deer enters alert mode. Ears rotate, nostrils flare, muscles tense.`
            },
            owl: {
                GOAL: `The Owl seeks prey. Ears, asymmetrically placed, triangulate scurrying of mice.`,
                OBSTACLE: `The Owl encounters wind. Gusts disrupt flight, push it off course.`,
                SHIFT: `The Owl molts. Feathers fall like soft rain, revealing new plumage.`
            },
            seedling: {
                GOAL: `The Seedling seeks light. Cotyledons are small, stem is thin, but need is absolute.`,
                OBSTACLE: `The Seedling encounters shade. A mature tree has expanded canopy.`,
                SHIFT: `The Seedling enters dormancy. Growth stops, metabolism slows.`
            },
            'fallen-oak': {
                GOAL: `The Fallen Oak seeks dissolution. It has fallen; now it wants to complete the cycle.`,
                OBSTACLE: `The Fallen Oak encounters resistance. The wood is dense, slow to rot.`,
                SHIFT: `The Fallen Oak becomes nurse log. Moss colonizes the bark; seedlings take root.`
            },
            moonlight: {
                GOAL: `The Moonlight seeks the forest floor. It filters through canopy, dodges leaves.`,
                OBSTACLE: `The Moonlight encounters cloud. The sky closes; silver becomes gray.`,
                SHIFT: `The Moonlight changes phase. From full to new, from bright to dim.`
            }
        },
        ambient: [
            { entityId: 'moonlight', vector: 'SHIFT', probability: 0.2 },
            { entityId: 'mycelium', vector: 'GOAL', probability: 0.4 },
            { entityId: 'owl', vector: 'GOAL', probability: 0.4 }
        ]
    },

    urban_jungle: {
        id: 'urban_jungle',
        name: 'URBAN JUNGLE',
        baseline: `The urban jungle is a forest of verticality. Buildings rise like cliffs, streets run like rivers. Concrete is the dominant geology. The air carries unique chemistry: exhaust, cooking, metallic tang. The city has its own ecology.`,
        grid: { cols: 8, rows: 6 },
        entities: [
            { id: 'pigeon', name: 'Pigeon', type: 'animate', state: 'foraging', icon: '🐦', position: { x: 2, y: 2 }, adjacentTo: ['traffic-light', 'rain-puddle'] },
            { id: 'rat', name: 'Rat', type: 'animate', state: 'scavenging', icon: '🐀', position: { x: 6, y: 4 }, adjacentTo: ['graffiti', 'rain-puddle'] },
            { id: 'graffiti', name: 'Graffiti', type: 'abstract', state: 'visible', icon: '🎨', position: { x: 1, y: 5 }, adjacentTo: ['rat', 'sidewalk-weed'] },
            { id: 'traffic-light', name: 'Traffic Light', type: 'inanimate', state: 'cycling', icon: '🚦', position: { x: 4, y: 1 }, adjacentTo: ['pigeon', 'sidewalk-weed'] },
            { id: 'rain-puddle', name: 'Rain Puddle', type: 'inanimate', state: 'evaporating', icon: '💧', position: { x: 5, y: 3 }, adjacentTo: ['pigeon', 'rat'] },
            { id: 'sidewalk-weed', name: 'Sidewalk Weed', type: 'animate', state: 'growing', icon: '🌿', position: { x: 0, y: 3 }, adjacentTo: ['graffiti', 'traffic-light'] }
        ],
        latent: {
            pigeon: {
                GOAL: `The Pigeon seeks crumbs. Its eyes scan pavement, benches, hands of humans.`,
                OBSTACLE: `The Pigeon encounters a child. The small human runs, arms waving.`,
                SHIFT: `The Pigeon enters courtship. Neck swells, feathers iridesce, it struts and coos.`
            },
            rat: {
                GOAL: `The Rat seeks the dumpster. Its nose has detected scent of food waste.`,
                OBSTACLE: `The Rat encounters poison. Bait is placed, trap is set.`,
                SHIFT: `The Rat enters maternal mode. Female has given birth; behavior changes.`
            },
            graffiti: {
                GOAL: `The Graffiti seeks visibility. The artist's tag wants to be seen.`,
                OBSTACLE: `The Graffiti encounters the buffer. City's anti-graffiti squad arrives.`,
                SHIFT: `The Graffiti fades. Sun bleaches colors, rain washes pigment.`
            },
            'traffic-light': {
                GOAL: `The Traffic Light seeks order. Its cycles of red, yellow, green are rhythm.`,
                OBSTACLE: `The Traffic Light encounters blackout. Power fails; light goes dark.`,
                SHIFT: `The Traffic Light changes program. Rush hour demands longer greens.`
            },
            'rain-puddle': {
                GOAL: `The Rain Puddle seeks absorption. It wants to sink into concrete.`,
                OBSTACLE: `The Rain Puddle encounters oil. A slick spreads across its surface.`,
                SHIFT: `The Rain Puddle shrinks. Sun and wind work together, pulling molecules into air.`
            },
            'sidewalk-weed': {
                GOAL: `The Sidewalk Weed seeks soil. It has found a crack, a gap between concrete slabs.`,
                OBSTACLE: `The Sidewalk Weed encounters foot traffic. Human shoes press down.`,
                SHIFT: `The Sidewalk Weed flowers. Despite everything, it produces blooms.`
            }
        },
        ambient: [
            { entityId: 'traffic-light', vector: 'SHIFT', probability: 0.3 },
            { entityId: 'pigeon', vector: 'GOAL', probability: 0.4 },
            { entityId: 'rain-puddle', vector: 'SHIFT', probability: 0.3 }
        ]
    }
};

// ============================================
// TRACERY GENERATIVE GRAMMAR
// ============================================

const TraceryGrammar = {
    animate: {
        GOAL: [
            "The #entity# #movement_verb# the #surface#, #sense_verb# for #resource#.",
            "The #entity# abandons its current state, drawn toward an unseen #target#.",
            "Purpose crystallizes. The #entity# transitions from passive reception to active pursuit."
        ],
        OBSTACLE: [
            "The #entity# encounters #obstacle_type#. Its path is blocked; it pauses, reassesses.",
            "Progress halts at a boundary. The #entity# tests the limit, probing for weakness.",
            "The #entity# faces resistance. What was fluid becomes fixed, what was open becomes closed."
        ],
        SHIFT: [
            "The #entity# undergoes transformation. Some essential quality changes—state, identity, metabolism.",
            "A threshold is crossed. The #entity# enters a new phase, adopts a new mode.",
            "The #entity# shifts. What was is no longer; what will be has not yet arrived."
        ],
        entity: ["scout", "forager", "wanderer", "seeker"],
        movement_verb: ["navigates", "traverses", "scales", "crosses"],
        surface: ["terrain", "landscape", "topography"],
        sense_verb: ["searching", "scanning", "probing"],
        resource: ["nutrients", "sustenance", "shelter"],
        target: ["objective", "destination", "goal"],
        obstacle_type: ["resistance", "barrier", "limitation"]
    },
    inanimate: {
        GOAL: [
            "The #entity# dreams of #desired_state#. Its current state aches for change.",
            "The #entity# seeks #transformation#. Every imperfection is a potential point of change.",
            "The #entity# longs for #purpose#. It remembers what it once was, what it could be."
        ],
        OBSTACLE: [
            "The #entity# is blocked by #constraint#. It cannot move, cannot change.",
            "The #entity# encounters its own #limitation#. The obstacle is itself.",
            "The #entity# faces #resistance_type#. Progress is arrested, transformation delayed."
        ],
        SHIFT: [
            "The #entity# undergoes #change_type#. A threshold is crossed, irreversibly.",
            "The #entity# changes phase. What was solid becomes fluid, what was whole becomes fractured.",
            "The #entity# settles into a new configuration. Time has worked its slow transformation."
        ],
        entity: ["object", "form", "structure"],
        desired_state: ["completion", "fulfillment", "purpose"],
        transformation: ["change", "metamorphosis", "evolution"],
        purpose: ["function", "use", "meaning"],
        constraint: ["neighbors", "gravity", "time"],
        limitation: ["nature", "composition", "history"],
        resistance_type: ["inertia", "entropy", "decay"],
        change_type: ["phase transition", "structural shift", "compositional change"]
    },
    abstract: {
        GOAL: [
            "The #entity# seeks expansion. It wants to fill space, to claim territory.",
            "The #entity# propagates, reaching toward every corner, every edge.",
            "The #entity# dreams of #abstract_desire#—to become more, to extend further."
        ],
        OBSTACLE: [
            "The #entity# encounters opposition. Where it flowed freely, it now meets resistance.",
            "The #entity# is blocked, turned aside, forced to find another path.",
            "The #entity# faces dissolution. Its very nature is threatened by encounter."
        ],
        SHIFT: [
            "The #entity# changes character. What was one thing becomes another.",
            "The #entity# transforms. Its essential quality shifts, becomes something new.",
            "The #entity# enters a new phase. Time and condition have altered its being."
        ],
        entity: ["phenomenon", "force", "presence"],
        abstract_desire: ["ubiquity", "dominance", "permanence"]
    }
};

function generateWithTracery(entityType, vector) {
    const grammar = TraceryGrammar[entityType];
    if (!grammar || !grammar[vector]) return null;
    
    const templates = grammar[vector];
    let text = templates[Math.floor(Math.random() * templates.length)];
    
    // Simple template replacement
    const keys = Object.keys(grammar).filter(k => !['GOAL', 'OBSTACLE', 'SHIFT'].includes(k));
    keys.forEach(key => {
        const values = grammar[key];
        const value = values[Math.floor(Math.random() * values.length)];
        text = text.replace(new RegExp(`#${key}#`, 'g'), value);
    });
    
    return text;
}

// ============================================
// TONE.JS AUDIO ENGINE
// ============================================

class AudioEngine {
    constructor() {
        this.initialized = false;
        this.drone = null;
        this.synths = {};
    }

    async init() {
        if (this.initialized) return;
        
        await Tone.start();
        
        // Create drone (two detuned oscillators)
        this.drone = {
            a: new Tone.Oscillator(110, 'sine').toDestination(),
            b: new Tone.Oscillator(112, 'sine').toDestination()
        };
        
        // Filter for drone
        this.filter = new Tone.Filter(400, 'lowpass').toDestination();
        this.drone.a.connect(this.filter);
        this.drone.b.connect(this.filter);
        
        // LFO for organic movement
        this.lfo = new Tone.LFO(0.1, 300, 600).start();
        this.lfo.connect(this.filter.frequency);
        
        // Vector synths
        this.synths.goal = new Tone.PolySynth(Tone.FMSynth, {
            harmonicity: 3,
            modulationIndex: 10,
            oscillator: { type: 'sine' },
            envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.5 },
            modulation: { type: 'square' }
        }).toDestination();
        this.synths.goal.volume.value = -10;
        
        this.synths.obstacle = new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 4,
            oscillator: { type: 'sine' },
            envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
        }).toDestination();
        this.synths.obstacle.volume.value = -5;
        
        this.synths.shift = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.5, decay: 1, sustain: 0.3, release: 2 }
        }).toDestination();
        
        // Phaser for shift effect
        this.phaser = new Tone.Phaser({
            frequency: 0.5,
            octaves: 3,
            baseFrequency: 200
        }).toDestination();
        this.synths.shift.connect(this.phaser);
        
        this.initialized = true;
    }

    startDrone() {
        if (!this.initialized) return;
        this.drone.a.start();
        this.drone.b.start();
        this.drone.a.volume.rampTo(-20, 2);
        this.drone.b.volume.rampTo(-20, 2);
    }

    stopDrone() {
        if (!this.initialized) return;
        this.drone.a.stop();
        this.drone.b.stop();
    }

    triggerVector(vector) {
        if (!this.initialized) return;
        
        switch (vector) {
            case 'GOAL':
                this.synths.goal.triggerAttackRelease(['C5', 'E5', 'G5'], '8n');
                break;
            case 'OBSTACLE':
                this.synths.obstacle.triggerAttackRelease('C2', '4n');
                break;
            case 'SHIFT':
                this.synths.shift.triggerAttackRelease(['A3', 'C4', 'E4'], '2n');
                break;
        }
    }
}

const audioEngine = new AudioEngine();

// ============================================
// MAIN APP COMPONENT
// ============================================

function App() {
    // State
    const [scenarioId, setScenarioId] = useState('cupboard');
    const [selectedEntityId, setSelectedEntityId] = useState(null);
    const [tick, setTick] = useState(0);
    const [auditLog, setAuditLog] = useState([]);
    const [isAutoplay, setIsAutoplay] = useState(false);
    const [bpm, setBpm] = useState(20);
    const [currentWorldtext, setCurrentWorldtext] = useState('');
    const [highlightVector, setHighlightVector] = useState(null);
    const [ripplingCells, setRipplingCells] = useState({});
    const [audioEnabled, setAudioEnabled] = useState(false);
    const [showStartScreen, setShowStartScreen] = useState(true);
    const [useGenerative, setUseGenerative] = useState(false);

    const scenario = LatentLibrary[scenarioId];
    const selectedEntity = selectedEntityId ? scenario.entities.find(e => e.id === selectedEntityId) : null;

    // Autoplay interval ref
    const autoplayRef = useRef(null);

    // Initialize audio on start
    const handleStart = async () => {
        await audioEngine.init();
        audioEngine.startDrone();
        setAudioEnabled(true);
        setShowStartScreen(false);
        setCurrentWorldtext(scenario.baseline);
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (showStartScreen) return;
            if (e.target.tagName === 'INPUT') return;
            
            const key = e.key.toLowerCase();
            
            switch (key) {
                case 'g':
                    if (selectedEntity) triggerVector('GOAL');
                    break;
                case 'o':
                    if (selectedEntity) triggerVector('OBSTACLE');
                    break;
                case 's':
                    if (selectedEntity) triggerVector('SHIFT');
                    break;
                case ' ':
                    e.preventDefault();
                    toggleAutoplay();
                    break;
                case 'arrowleft':
                case 'arrowright':
                    const scenarios = Object.keys(LatentLibrary);
                    const idx = scenarios.indexOf(scenarioId);
                    const newIdx = key === 'arrowleft' 
                        ? (idx - 1 + scenarios.length) % scenarios.length
                        : (idx + 1) % scenarios.length;
                    changeScenario(scenarios[newIdx]);
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                    const num = parseInt(key) - 1;
                    if (scenario.entities[num]) {
                        selectEntity(scenario.entities[num].id);
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedEntity, scenarioId, isAutoplay, showStartScreen]);

    // Autoplay effect
    useEffect(() => {
        if (isAutoplay) {
            const interval = 60000 / bpm;
            autoplayRef.current = setInterval(() => {
                const behaviors = scenario.ambient;
                const roll = Math.random();
                let cumulative = 0;
                
                for (const behavior of behaviors) {
                    cumulative += behavior.probability;
                    if (roll <= cumulative) {
                        selectEntity(behavior.entityId);
                        setTimeout(() => triggerVector(behavior.vector), 100);
                        break;
                    }
                }
            }, interval);
        } else {
            clearInterval(autoplayRef.current);
        }
        
        return () => clearInterval(autoplayRef.current);
    }, [isAutoplay, bpm, scenarioId]);

    const changeScenario = (id) => {
        setScenarioId(id);
        setSelectedEntityId(null);
        setTick(0);
        setAuditLog([]);
        setCurrentWorldtext(LatentLibrary[id].baseline);
    };

    const selectEntity = (id) => {
        setSelectedEntityId(id);
    };

    const triggerVector = (vector) => {
        if (!selectedEntity) return;

        // Get worldtext
        let worldtext;
        if (useGenerative) {
            worldtext = generateWithTracery(selectedEntity.type, vector);
        }
        if (!worldtext) {
            worldtext = scenario.latent[selectedEntity.id]?.[vector] || 
                `[No description for ${selectedEntity.name} + ${vector}]`;
        }

        // Update state
        const newTick = tick + 1;
        setTick(newTick);
        setCurrentWorldtext(worldtext);
        setHighlightVector(vector);
        
        // Add to audit log
        const entry = {
            tick: newTick,
            entityId: selectedEntity.id,
            entityName: selectedEntity.name,
            vector,
            preview: worldtext.substring(0, 60) + '...',
            fullText: worldtext
        };
        setAuditLog(prev => [entry, ...prev].slice(0, 50));

        // Trigger audio
        if (audioEnabled) {
            audioEngine.triggerVector(vector);
        }

        // Visual ripple effect
        setRipplingCells(prev => ({ ...prev, [selectedEntity.id]: vector }));
        
        // Cascade to adjacent
        selectedEntity.adjacentTo?.forEach((adjId, i) => {
            setTimeout(() => {
                setRipplingCells(prev => ({ ...prev, [adjId]: vector }));
                setTimeout(() => {
                    setRipplingCells(prev => {
                        const next = { ...prev };
                        delete next[adjId];
                        return next;
                    });
                }, 500);
            }, 200 + i * 100);
        });

        // Clear ripple after animation
        setTimeout(() => {
            setRipplingCells(prev => {
                const next = { ...prev };
                delete next[selectedEntity.id];
                return next;
            });
        }, 1000);

        // Clear highlight
        setTimeout(() => setHighlightVector(null), 2000);
    };

    const toggleAutoplay = () => {
        setIsAutoplay(!isAutoplay);
    };

    const exportSession = () => {
        const session = {
            scenario: scenarioId,
            tick,
            auditLog,
            timestamp: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ripples_session_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const renderWorldtext = () => {
        if (!currentWorldtext) return 'Select an entity to begin...';
        
        let html = currentWorldtext;
        
        // Highlight entity references
        scenario.entities.forEach(e => {
            const regex = new RegExp(`\\b${e.name}\\b`, 'gi');
            html = html.replace(regex, `<span class="entity-ref" onclick="window.selectEntity('${e.id}')">${e.name}</span>`);
        });

        if (highlightVector) {
            html = `<span class="highlight-${highlightVector.toLowerCase()}">${html}</span>`;
        }

        return html;
    };

    // Expose selectEntity to window for entity-ref clicks
    window.selectEntity = selectEntity;

    if (showStartScreen) {
        return (
            <div className="start-screen">
                <h1 className="start-title">RIPPLES</h1>
                <p className="start-subtitle">Operative Ecologies</p>
                <button className="start-btn" onClick={handleStart}>Initialize System</button>
                <div className="start-info">
                    <p>A Worldtext Generator for Imaginary Ecologies</p>
                    <p>Keyboard: [G] Goal | [O] Obstacle | [S] Shift | [Space] Autoplay</p>
                </div>
            </div>
        );
    }

    return (
        <div className="crt-container">
            {/* CRT Overlay Effects */}
            <div className="crt-overlay scanlines"></div>
            <div className="crt-overlay vignette"></div>
            
            <div className="app-container flicker">
                {/* Header */}
                <header className="header">
                    <div className="header-left">
                        <span className="logo">RIPPLES</span>
                        <select className="scenario-select" value={scenarioId} onChange={(e) => changeScenario(e.target.value)}>
                            {Object.entries(LatentLibrary).map(([id, s]) => (
                                <option key={id} value={id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="header-right">
                        <div className="status-item">
                            <span className="status-label">Tick:</span>
                            <span className="status-value">{tick}</span>
                        </div>
                        <div className="status-item">
                            <span className="status-label">Mode:</span>
                            <span className="status-value">{useGenerative ? 'GENERATIVE' : 'LATENT'}</span>
                        </div>
                        <div className="status-item">
                            {isAutoplay && <span className="pulse-dot"></span>}
                            <span className="status-value">{isAutoplay ? 'AUTO' : 'MANUAL'}</span>
                        </div>
                    </div>
                </header>

                {/* Grid Section */}
                <section className="grid-section">
                    <div className="grid-header">
                        <span className="grid-title">Ecology Grid</span>
                        <span className={`grid-status ${selectedEntity ? 'locked' : ''} ${isAutoplay ? 'auto' : ''}`}>
                            {isAutoplay ? 'AUTO' : selectedEntity ? 'LOCKED' : 'STANDBY'}
                        </span>
                    </div>
                    <div className="grid-container">
                        {/* Adjacency lines SVG */}
                        <svg className="adjacency-svg">
                            {scenario.entities.map(entity => 
                                entity.adjacentTo?.map(adjId => {
                                    const adj = scenario.entities.find(e => e.id === adjId);
                                    if (!adj || entity.id > adj.id) return null;
                                    const cellW = 100 / 8;
                                    const cellH = 100 / 6;
                                    const x1 = (entity.position.x + 0.5) * cellW;
                                    const y1 = (entity.position.y + 0.5) * cellH;
                                    const x2 = (adj.position.x + 0.5) * cellW;
                                    const y2 = (adj.position.y + 0.5) * cellH;
                                    return (
                                        <line key={`${entity.id}-${adjId}`} 
                                            className="adjacency-line" 
                                            x1={`${x1}%`} y1={`${y1}%`} 
                                            x2={`${x2}%`} y2={`${y2}%`} />
                                    );
                                })
                            )}
                        </svg>
                        
                        {/* Grid cells */}
                        {Array.from({ length: 48 }, (_, i) => {
                            const x = i % 8;
                            const y = Math.floor(i / 8);
                            const entity = scenario.entities.find(e => e.position.x === x && e.position.y === y);
                            const isRippling = entity && ripplingCells[entity.id];
                            
                            return (
                                <div key={i} 
                                    className={`grid-cell ${entity ? 'has-entity' : ''} ${entity?.id === selectedEntityId ? 'selected' : ''} ${isRippling ? `rippling-${isRippling.toLowerCase()}` : ''}`}
                                    onClick={() => entity && selectEntity(entity.id)}>
                                    {entity && (
                                        <>
                                            {entity.icon}
                                            {isRippling && <div className={`ripple-ring ${isRippling.toLowerCase()}`}></div>}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Right Panel */}
                <aside className="right-panel">
                    {/* Entity Pool */}
                    <div className="panel-section">
                        <h3 className="panel-title">Entity Pool</h3>
                        <div className="entity-list">
                            {scenario.entities.map((e, i) => (
                                <div key={e.id} 
                                    className={`entity-item ${e.id === selectedEntityId ? 'selected' : ''}`}
                                    onClick={() => selectEntity(e.id)}>
                                    <span className="entity-icon">{e.icon}</span>
                                    <div className="entity-info">
                                        <div className="entity-name">{i + 1}. {e.name}</div>
                                        <div className="entity-meta">
                                            <span className="entity-type">{e.type}</span>
                                            <span>{e.state}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Worldtext */}
                    <div className="panel-section worldtext-section">
                        <h3 className="panel-title">Worldtext</h3>
                        <div className="worldtext-display" dangerouslySetInnerHTML={{ __html: renderWorldtext() }}></div>
                    </div>

                    {/* Audit Log */}
                    <div className="panel-section">
                        <h3 className="panel-title">Audit Log</h3>
                        <div className="audit-log">
                            {auditLog.length === 0 ? (
                                <div className="empty-state">No ripples recorded</div>
                            ) : (
                                auditLog.map(entry => (
                                    <div key={entry.tick} className="audit-entry" onClick={() => {
                                        selectEntity(entry.entityId);
                                        setCurrentWorldtext(entry.fullText);
                                    }}>
                                        <div className="audit-header">
                                            <span className="audit-tick">#{entry.tick}</span>
                                            <span className={`audit-vector ${entry.vector.toLowerCase()}`}>{entry.vector}</span>
                                            <span>→ {entry.entityName}</span>
                                        </div>
                                        <div className="audit-preview">{entry.preview}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </aside>

                {/* Control Deck */}
                <footer className="control-deck">
                    <div className="vector-controls">
                        <button className="vector-btn goal" onClick={() => triggerVector('GOAL')} disabled={!selectedEntity}>
                            <span>GOAL</span>
                            <span className="vector-key">[G]</span>
                        </button>
                        <button className="vector-btn obstacle" onClick={() => triggerVector('OBSTACLE')} disabled={!selectedEntity}>
                            <span>OBSTACLE</span>
                            <span className="vector-key">[O]</span>
                        </button>
                        <button className="vector-btn shift" onClick={() => triggerVector('SHIFT')} disabled={!selectedEntity}>
                            <span>SHIFT</span>
                            <span className="vector-key">[S]</span>
                        </button>
                    </div>

                    <div className="playback-controls">
                        <div className="autoplay-toggle">
                            <span className="toggle-label">Autoplay</span>
                            <label className="toggle-switch">
                                <input type="checkbox" checked={isAutoplay} onChange={toggleAutoplay} />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        <div className="bpm-control">
                            <span className="bpm-label">BPM: {bpm}</span>
                            <input type="range" className="bpm-slider" min="10" max="60" value={bpm} onChange={(e) => setBpm(parseInt(e.target.value))} />
                        </div>
                    </div>

                    <div className="audio-control">
                        <button className="audio-btn" onClick={() => {
                            if (audioEnabled) {
                                audioEngine.stopDrone();
                                setAudioEnabled(false);
                            } else {
                                audioEngine.startDrone();
                                setAudioEnabled(true);
                            }
                        }}>
                            {audioEnabled ? 'Mute' : 'Audio'}
                        </button>
                    </div>

                    <div className="session-controls">
                        <button className="session-btn" onClick={() => setUseGenerative(!useGenerative)}>
                            {useGenerative ? 'Latent' : 'Gen'}
                        </button>
                        <button className="session-btn" onClick={exportSession}>Export</button>
                    </div>
                </footer>
            </div>
        </div>
    );
}

// Render
ReactDOM.createRoot(document.getElementById('root')).render(<App />);
