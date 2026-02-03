const { useState, useEffect, useRef, useCallback, useMemo } = React;

// ============================================================
// META INTERFACE: Self-referential system architecture
// RIPPLES: Relational Imagination of Perspective, Presence, 
// and Latent Ecologies in Simulacra
// ============================================================

// --- THEORETICAL FRAMEWORK DATA ---
const THEORETICAL_CONCEPTS = {
  umwelt: {
    title: "Umwelt Theory",
    author: "Jakob von Uexküll",
    text: "The subjective perceptual world of an organism—its 'self-centered world'—constituted by the affordances and sign-stimuli that matter to its survival. Each entity inhabits a bubble of meaningful perception.",
    related: ["affordance", "sign-stimulus", "functional-tone"]
  },
  ooo: {
    title: "Object-Oriented Ontology",
    author: "Ian Bogost",
    text: "A flat ontology where all objects—human and nonhuman—exist equally. Alien Phenomenology proposes 'carpentry': constructing artifacts that do philosophical work through their operation.",
    related: ["flat-ontology", "alien-phenomenology", "carpentry"]
  },
  epistemic_humility: {
    title: "Epistemic Humility",
    text: "Acknowledging the limitations of models. 'All models are wrong, but some are usefully wrong.' The interface makes its own constructedness visible.",
    related: ["model", "simulacra", "operative-fiction"]
  },
  ecs: {
    title: "Entity-Component-System",
    text: "Deconstructed objects: Entities are pure IDs, Components are data containers, Systems process entities with specific component sets. Enables emergent complexity from simple rules.",
    related: ["entity", "component", "system", "emergence"]
  },
  tracery: {
    title: "Tracery Grammar",
    author: "Kate Compton",
    text: "Recursive generative text through symbol expansion. Non-terminal symbols expand until only terminals remain. Context-free yet meaningfully constrained.",
    related: ["generative", "grammar", "expansion", "symbol"]
  },
  perspectival_finitude: {
    title: "Perspectival Finitude",
    text: "The interface enforces a single-entity perspective lock. You cannot see all Umwelten simultaneously—only inhabit one at a time, then switch. Knowledge is situated and partial.",
    related: ["perspective", "finitude", "situated-knowledge"]
  }
};

// --- LATENT LIBRARY ---
const LATENT_LIBRARY = {
  cupboard: {
    name: "The Cupboard",
    description: "A domestic ecology of neglect and persistence",
    entities: [
      { id: "e1", name: "Forgotten Can", type: "animate", components: ["container", "preserved", "expiring"] },
      { id: "e2", name: "Grain Moth", type: "animate", components: ["insect", "seeking", "reproducing"] },
      { id: "e3", name: "Dust Layer", type: "inanimate", components: ["accumulation", "silent", "witnessing"] },
      { id: "e4", name: "Back Corner", type: "inanimate", components: ["space", "dark", "forgotten"] }
    ],
    affordances: ["shelter", "nutrition", "darkness", "containment"]
  },
  forest: {
    name: "Deep Forest",
    description: "A woodland ecology of interdependence",
    entities: [
      { id: "f1", name: "Mycelial Network", type: "animate", components: ["fungal", "connecting", "nutrient"] },
      { id: "f2", name: "Fallen Log", type: "inanimate", components: ["wood", "decaying", "habitat"] },
      { id: "f3", name: "Owl", type: "animate", components: ["predator", "nocturnal", "watching"] },
      { id: "f4", name: "Moss Patch", type: "animate", components: ["plant", "creeping", "moisture"] }
    ],
    affordances: ["connection", "decomposition", "perch", "moisture"]
  },
  urban: {
    name: "Urban Jungle",
    description: "A city ecology of adaptation",
    entities: [
      { id: "u1", name: "Pigeon", type: "animate", components: ["bird", "scavenging", "adapted"] },
      { id: "u2", name: "Crack in Pavement", type: "inanimate", components: ["void", "growing", "destabilizing"] },
      { id: "u3", name: "Dandelion", type: "animate", components: ["plant", "resilient", "spreading"] },
      { id: "u4", name: "Streetlight", type: "inanimate", components: ["light", "artificial", "attracting"] }
    ],
    affordances: ["food", "niche", "light", "shelter"]
  },
  tidepool: {
    name: "Tide Pool",
    description: "An intertidal ecology of flux",
    entities: [
      { id: "t1", name: "Sea Anemone", type: "animate", components: ["cnidarian", "waiting", "stinging"] },
      { id: "t2", name: "Hermit Crab", type: "animate", components: ["crustacean", "searching", "borrowed"] },
      { id: "t3", name: "Algae Film", type: "animate", components: ["photosynthetic", "coating", "oxygen"] },
      { id: "t4", name: "Pebble", type: "inanimate", components: ["mineral", "smooth", "anchor"] }
    ],
    affordances: ["anchorage", "shell", "sunlight", "stability"]
  }
};

// --- TRACERY GRAMMAR ---
const GRAMMAR = {
  origin: ["#entity.capitalize# #state# #location#.#reflection#"],
  entity: ["the #entity_type#"],
  entity_type: ["scout", "forager", "wanderer", "witness", "drifter"],
  state: ["#movement#", "#sensing#", "#waiting#"],
  movement: ["navigates the #surface#", "traverses the #terrain#", "scales the #elevation#"],
  sensing: ["#sense_verb# for #resource#", "detects #signal#", "reads the #environment#"],
  waiting: ["holds position", "maintains vigil", "remains still"],
  location: ["in the #zone#", "near the #landmark#", "beneath the #cover#"],
  reflection: [" #umwelt_phrase#.", " The #other_entity# #other_action#.", ""],
  umwelt_phrase: ["Time moves differently here", "The world contracts to what matters", "Meaning emerges from function"],
  other_entity: ["shadow", "echo", "memory"],
  other_action: ["lingers at the edge of perception", "waits in the peripheral", "fades from significance"],
  surface: ["grain", "texture", "contour"],
  terrain: ["slope", "decline", "rise"],
  elevation: ["ridge", "crest", "edge"],
  sense_verb: ["searches", "probes", "scans"],
  resource: ["signal", "trail", "resonance"],
  signal: ["vibration", "scent", "warmth"],
  environment: ["air", "substrate", "current"],
  zone: ["periphery", "threshold", "margin"],
  landmark: ["marker", "boundary", "junction"],
  cover: ["canopy", "overhang", "shadow"]
};

// --- AUDIO ENGINE ---
class AudioEngine {
  constructor() {
    this.initialized = false;
    this.drone = null;
    this.synths = {};
  }

  async init() {
    if (this.initialized) return;
    await Tone.start();
    
    // Drone
    this.drone = new Tone.Oscillator(55, 'sine').toDestination();
    this.drone.volume.value = -25;
    
    // Vector synths
    this.synths.goal = new Tone.PolySynth(Tone.FMSynth, {
      harmonicity: 3,
      modulationIndex: 10,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 1 }
    }).toDestination();
    this.synths.goal.volume.value = -15;
    
    this.synths.obstacle = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
    }).toDestination();
    this.synths.obstacle.volume.value = -10;
    
    this.synths.shift = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.05, decay: 0.3, sustain: 0.2, release: 1.5 }
    }).toDestination();
    const phaser = new Tone.Phaser({ frequency: 0.5, octaves: 3 }).toDestination();
    this.synths.shift.connect(phaser);
    this.synths.shift.volume.value = -12;
    
    this.initialized = true;
  }

  startDrone() {
    if (this.drone && this.drone.state !== 'started') {
      this.drone.start();
    }
  }

  stopDrone() {
    if (this.drone) this.drone.stop();
  }

  triggerVector(vector) {
    if (!this.initialized) return;
    switch(vector) {
      case 'GOAL':
        this.synths.goal.triggerAttackRelease(['C5', 'E5', 'G5'], '8n');
        break;
      case 'OBSTACLE':
        this.synths.obstacle.triggerAttackRelease('C2', '8n');
        break;
      case 'SHIFT':
        this.synths.shift.triggerAttackRelease(['A4', 'C5', 'E5'], '4n');
        break;
    }
  }
}

const audioEngine = new AudioEngine();

// --- UTILITY FUNCTIONS ---
const expandGrammar = (symbol = 'origin') => {
  const rules = GRAMMAR[symbol];
  if (!rules) return symbol;
  const rule = rules[Math.floor(Math.random() * rules.length)];
  return rule.replace(/#([^#]+)#/g, (match, sym) => expandGrammar(sym));
};

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

// --- COMPONENTS ---

// ECS Node Component
const ECSNode = ({ node, onClick, isExpanded }) => {
  const typeColors = {
    entity: '#2a8a8a',
    component: '#8a4a6a',
    system: '#4a7a4a'
  };
  
  return (
    <div className="ecs-node">
      <div className="ecs-node-header" onClick={onClick}>
        <div className={`ecs-node-type ${node.type}`}>
          {node.type.charAt(0).toUpperCase()}
        </div>
        <span className="ecs-node-id">{node.id}</span>
        <span className="ecs-node-meta">{node.components?.length || 0} comp</span>
      </div>
      {isExpanded && (
        <div className="ecs-node-body">
          <div>{node.description || 'No description'}</div>
          {node.components && (
            <div className="component-list">
              {node.components.map((c, i) => (
                <span key={i} className="component-tag">{c}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Umwelt Bubble Component
const UmweltBubble = ({ entity, x, y, radius, isSelected, onClick, color }) => {
  return (
    <div
      className={`umwelt-bubble ${isSelected ? 'selected' : ''}`}
      style={{
        left: x - radius,
        top: y - radius,
        width: radius * 2,
        height: radius * 2,
        borderColor: color,
        background: `${color}15`,
        boxShadow: isSelected ? `0 0 40px ${color}40` : 'none'
      }}
      onClick={onClick}
    >
      <div className="bubble-perceptual-ring" style={{ borderColor: color }} />
      <div className="bubble-label" style={{ color }}>{entity.name}</div>
      <div className="bubble-state">{entity.components[0]}</div>
    </div>
  );
};

// Theory Tab Content
const TheoryContent = ({ activeTab }) => {
  if (activeTab === 'concepts') {
    return (
      <div className="theory-content">
        {Object.entries(THEORETICAL_CONCEPTS).map(([key, concept]) => (
          <div key={key} className="theory-section">
            <div className="theory-title">{concept.title}</div>
            <div className="theory-text">
              {concept.text}
              {concept.related && (
                <div style={{ marginTop: 8 }}>
                  {concept.related.map((tag, i) => (
                    <span key={i} className="concept-tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (activeTab === 'latent') {
    return (
      <div className="theory-content">
        {Object.entries(LATENT_LIBRARY).map(([key, scenario]) => (
          <div key={key} className="latent-entry">
            <div className="latent-name">{scenario.name}</div>
            <div className="latent-desc">{scenario.description}</div>
            <div className="component-list" style={{ marginTop: 6 }}>
              {scenario.entities.map(e => (
                <span key={e.id} className="component-tag">{e.name}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="theory-content">
      <div className="theory-section">
        <div className="theory-title">Meta Interface</div>
        <div className="theory-text">
          This interface makes visible the usually invisible architecture of RIPPLES. 
          The ECS panel shows the deconstructed object system. The Umwelt viewport 
          visualizes perspectival bubbles. The theory panel surfaces the conceptual 
          framework that shapes the simulation.
        </div>
      </div>
      <div className="theory-section">
        <div className="theory-title">Map → Territory → Simulacra</div>
        <div className="theory-text">
          Use the reality stack in the header to shift between layers of representation. 
          Map: abstract code. Territory: running simulation. Simulacra: the experience 
          of inhabiting an Umwelt.
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---
const MetaInterface = () => {
  // State
  const [realityLayer, setRealityLayer] = useState('territory');
  const [activeScenario, setActiveScenario] = useState('cupboard');
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [theoryTab, setTheoryTab] = useState('concepts');
  const [worldtext, setWorldtext] = useState('');
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [tick, setTick] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [tooltip, setTooltip] = useState(null);
  const [rippleWaves, setRippleWaves] = useState([]);
  
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  // Get current scenario entities
  const entities = useMemo(() => {
    return LATENT_LIBRARY[activeScenario]?.entities || [];
  }, [activeScenario]);
  
  // Generate ECS nodes from entities
  const ecsNodes = useMemo(() => {
    const nodes = [];
    entities.forEach(e => {
      nodes.push({
        id: e.id,
        type: 'entity',
        description: e.name,
        components: e.components
      });
      e.components.forEach(c => {
        if (!nodes.find(n => n.id === c && n.type === 'component')) {
          nodes.push({
            id: c,
            type: 'component',
            description: `Data: ${c}`
          });
        }
      });
    });
    // Add systems
    nodes.push(
      { id: 'perception', type: 'system', description: 'Processes sensory data' },
      { id: 'movement', type: 'system', description: 'Updates position state' },
      { id: 'interaction', type: 'system', description: 'Handles entity collisions' }
    );
    return nodes;
  }, [entities]);
  
  // Calculate Umwelt bubble positions
  const bubblePositions = useMemo(() => {
    const centerX = 400;
    const centerY = 250;
    const radius = 180;
    return entities.map((e, i) => {
      const angle = (i / entities.length) * Math.PI * 2 - Math.PI / 2;
      return {
        entity: e,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        radius: 60 + e.components.length * 8,
        color: e.type === 'animate' ? '#2a8a8a' : '#9a9590'
      };
    });
  }, [entities]);
  
  // Generate worldtext
  const generateWorldtext = useCallback(() => {
    const entity = selectedEntity || entities[0];
    if (!entity) return;
    
    const grammar = { ...GRAMMAR };
    grammar.entity_type = [entity.name.toLowerCase()];
    grammar.entity = [`the ${entity.name.toLowerCase()}`];
    
    const text = expandGrammar('origin')
      .replace(/\./g, '. ')
      .replace(/\s+/g, ' ')
      .trim();
    
    setWorldtext(text);
  }, [selectedEntity, entities]);
  
  // Trigger vector
  const triggerVector = useCallback((vector) => {
    if (!audioEnabled) {
      audioEngine.init().then(() => {
        setAudioEnabled(true);
        audioEngine.startDrone();
        audioEngine.triggerVector(vector);
      });
    } else {
      audioEngine.triggerVector(vector);
    }
    
    generateWorldtext();
    
    // Create ripple effect
    const newRipple = {
      id: Date.now(),
      vector,
      startTime: Date.now()
    };
    setRippleWaves(prev => [...prev, newRipple]);
    
    // Remove ripple after animation
    setTimeout(() => {
      setRippleWaves(prev => prev.filter(r => r.id !== newRipple.id));
    }, 2000);
    
    setTick(t => t + 1);
  }, [audioEnabled, generateWorldtext]);
  
  // Toggle ECS node expansion
  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };
  
  // Autoplay effect
  useEffect(() => {
    if (!isAutoplay) return;
    const interval = setInterval(() => {
      const vectors = ['GOAL', 'OBSTACLE', 'SHIFT'];
      triggerVector(vectors[Math.floor(Math.random() * vectors.length)]);
    }, 3000);
    return () => clearInterval(interval);
  }, [isAutoplay, triggerVector]);
  
  // Initial worldtext
  useEffect(() => {
    generateWorldtext();
  }, [generateWorldtext]);
  
  // Canvas drawing for connections
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 500;
    
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connections between entities
      bubblePositions.forEach((pos1, i) => {
        bubblePositions.forEach((pos2, j) => {
          if (i >= j) return;
          
          // Check shared components
          const shared = pos1.entity.components.filter(c => 
            pos2.entity.components.includes(c)
          );
          
          if (shared.length > 0) {
            ctx.beginPath();
            ctx.moveTo(pos1.x, pos1.y);
            ctx.lineTo(pos2.x, pos2.y);
            ctx.strokeStyle = 'rgba(154, 149, 144, 0.15)';
            ctx.lineWidth = shared.length;
            ctx.stroke();
          }
        });
      });
      
      // Draw ripple waves
      const now = Date.now();
      rippleWaves.forEach(ripple => {
        const elapsed = now - ripple.startTime;
        const progress = elapsed / 2000;
        
        if (selectedEntity) {
          const pos = bubblePositions.find(p => p.entity.id === selectedEntity.id);
          if (pos) {
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 60 + progress * 200, 0, Math.PI * 2);
            const colors = {
              GOAL: 'rgba(201, 162, 39,',
              OBSTACLE: 'rgba(158, 58, 58,',
              SHIFT: 'rgba(42, 138, 138,'
            };
            ctx.strokeStyle = `${colors[ripple.vector]} ${1 - progress})`;
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }
      });
      
      animationRef.current = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [bubblePositions, rippleWaves, selectedEntity]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch(e.key.toLowerCase()) {
        case 'g': triggerVector('GOAL'); break;
        case 'o': triggerVector('OBSTACLE'); break;
        case 's': triggerVector('SHIFT'); break;
        case ' ':
          e.preventDefault();
          setIsAutoplay(a => !a);
          break;
        case 'arrowleft':
        case 'arrowright':
          const scenarios = Object.keys(LATENT_LIBRARY);
          const currentIdx = scenarios.indexOf(activeScenario);
          const nextIdx = e.key === 'arrowleft' 
            ? (currentIdx - 1 + scenarios.length) % scenarios.length
            : (currentIdx + 1) % scenarios.length;
          setActiveScenario(scenarios[nextIdx]);
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerVector, activeScenario]);
  
  return (
    <div className="meta-interface">
      {/* CRT Overlay */}
      <div className="crt-overlay">
        <div className="scanlines" />
        <div className="flicker" />
        <div className="vignette" />
      </div>
      
      {/* Header - Reality Stack */}
      <header className="meta-header">
        <div className="header-left">
          <div className="logo">RIPPLES <span>// META INTERFACE</span></div>
          <div className="reality-stack">
            {['map', 'territory', 'simulacra'].map(layer => (
              <button
                key={layer}
                className={`stack-layer ${realityLayer === layer ? 'active' : ''}`}
                onClick={() => setRealityLayer(layer)}
              >
                {layer}
              </button>
            ))}
          </div>
        </div>
        <div className="header-right">
          <span>ECS: {ecsNodes.length} nodes</span>
          <span>Umwelten: {entities.length}</span>
          <div className="epistemic-badge">Epistemic Humility</div>
        </div>
      </header>
      
      {/* Left Panel - ECS Architecture */}
      <aside className="ecs-panel">
        <div className="panel-header">Entity-Component-System</div>
        <div className="ecs-visualization">
          {ecsNodes.map(node => (
            <ECSNode
              key={`${node.type}-${node.id}`}
              node={node}
              isExpanded={expandedNodes.has(node.id)}
              onClick={() => toggleNode(node.id)}
            />
          ))}
        </div>
      </aside>
      
      {/* Center - Umwelt Visualization */}
      <main className="umwelt-viewport">
        <canvas ref={canvasRef} className="umwelt-canvas" />
        <div className="umwelt-overlay">
          {bubblePositions.map(({ entity, x, y, radius, color }) => (
            <UmweltBubble
              key={entity.id}
              entity={entity}
              x={x}
              y={y}
              radius={radius}
              color={color}
              isSelected={selectedEntity?.id === entity.id}
              onClick={() => setSelectedEntity(entity)}
            />
          ))}
        </div>
        <div className="humility-banner">
          All models are wrong. Some are usefully wrong.
        </div>
      </main>
      
      {/* Right Panel - Theory */}
      <aside className="theory-panel">
        <div className="theory-tabs">
          {['concepts', 'latent', 'meta'].map(tab => (
            <button
              key={tab}
              className={`theory-tab ${theoryTab === tab ? 'active' : ''}`}
              onClick={() => setTheoryTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <TheoryContent activeTab={theoryTab} />
      </aside>
      
      {/* Bottom Panel - Worldtext & Controls */}
      <footer className="worldtext-panel">
        <div className="worldtext-display">
          <div className="worldtext-label">
            Worldtext // {selectedEntity?.name || 'System'} // Tick {tick}
          </div>
          <div className="worldtext-content">
            {worldtext || 'Select an entity to generate worldtext...'}
          </div>
          <div className="worldtext-meta">
            <span className="meta-item">{activeScenario}</span>
            <span className="meta-item">{realityLayer}</span>
            <span className="meta-item">{entities.length} entities</span>
          </div>
        </div>
        
        <div className="controls-section">
          <div className="vector-buttons">
            <button 
              className="vector-btn goal" 
              onClick={() => triggerVector('GOAL')}
            >
              Goal [G]
            </button>
            <button 
              className="vector-btn obstacle" 
              onClick={() => triggerVector('OBSTACLE')}
            >
              Obstacle [O]
            </button>
            <button 
              className="vector-btn shift" 
              onClick={() => triggerVector('SHIFT')}
            >
              Shift [S]
            </button>
          </div>
          
          <div className="control-row">
            <span className="control-label">Autoplay</span>
            <button 
              className={`autoplay-toggle ${isAutoplay ? 'active' : ''}`}
              onClick={() => setIsAutoplay(!isAutoplay)}
            >
              <span className="autoplay-indicator" />
              {isAutoplay ? 'ON' : 'OFF'} [Space]
            </button>
          </div>
          
          <div className="control-row">
            <span className="control-label">Scenario</span>
            <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
              [← {activeScenario} →]
            </span>
          </div>
        </div>
      </footer>
      
      {/* Tooltip */}
      {tooltip && (
        <div 
          className="tooltip" 
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
};

// Render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<MetaInterface />);
