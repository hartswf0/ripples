const { useState, useEffect, useRef, useCallback, useMemo } = React;

// ============================================================
// LATENT PROMPT: Prompt Engineering as Interface
// Token-level visibility for RIPPLES worldtext generation
// ============================================================

// --- PROMPT COMPONENTS ---
const PROMPT_COMPONENTS = {
  entities: [
    { id: 'e_ant', label: 'Ant', type: 'entity', token: 'ant' },
    { id: 'e_shadow', label: 'Shadow', type: 'entity', token: 'shadow' },
    { id: 'e_dust', label: 'Dust Mote', type: 'entity', token: 'dust_mote' },
    { id: 'e_light', label: 'Light', type: 'entity', token: 'light' },
    { id: 'e_mold', label: 'Mold', type: 'entity', token: 'mold' },
    { id: 'e_stone', label: 'Stone', type: 'entity', token: 'stone' }
  ],
  vectors: [
    { id: 'v_goal', label: 'GOAL', type: 'vector', token: 'goal' },
    { id: 'v_obstacle', label: 'OBSTACLE', type: 'vector', token: 'obstacle' },
    { id: 'v_shift', label: 'SHIFT', type: 'vector', token: 'shift' }
  ],
  modifiers: [
    { id: 'm_chemical', label: 'chemical', type: 'modifier', token: 'chemical_sensing' },
    { id: 'm_tactile', label: 'tactile', type: 'modifier', token: 'tactile' },
    { id: 'm_thermal', label: 'thermal', type: 'modifier', token: 'thermal' },
    { id: 'm_vibration', label: 'vibration', type: 'modifier', token: 'vibration' },
    { id: 'm_suspended', label: 'suspended', type: 'modifier', token: 'suspended' },
    { id: 'm_pressurized', label: 'pressurized', type: 'modifier', token: 'pressurized' }
  ]
};

// --- LATENT SPACE POINTS ---
const LATENT_POINTS = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: 0.1 + Math.random() * 0.8,
  y: 0.1 + Math.random() * 0.8,
  intensity: Math.random(),
  vector: ['GOAL', 'OBSTACLE', 'SHIFT'][Math.floor(Math.random() * 3)]
}));

// --- GRAMMAR FOR GENERATION ---
const GRAMMAR = {
  ant: {
    goal: [
      "The ant #movement# the #surface#, #sensing# for #resource#.",
      "Chemotaxis pulls the scout toward #gradient# concentrations.",
      "Foraging state: mandibles extended, antennae sweeping."
    ],
    obstacle: [
      "Ceramic topography blocks path. Tumbling frequency increases.",
      "The vertical cliff of #material# cannot be scaled.",
      "Obstacle detected: reverting to search pattern."
    ],
    shift: [
      "Metabolism slows. The ant enters #state#.",
      "Internal temperature drops. Torpor imminent.",
      "State transition: active → suspended."
    ]
  },
  shadow: {
    goal: [
      "The shadow stretches toward darkness, seeking union with the wall.",
      "Fleeing the light source, edges diffusing.",
      "Propagation vector: elongation along azimuth."
    ],
    obstacle: [
      "The light source intensifies. Dissolution imminent.",
      "Obstruction: illumination exceeds threshold.",
      "The shadow shrinks, compressed by photon pressure."
    ],
    shift: [
      "As night falls, the shadow becomes substance.",
      "Phase transition: insubstantial → material.",
      "The darkness thickens, gaining mass."
    ]
  },
  dust_mote: {
    goal: [
      "The mote drifts on thermal currents, seeking stillness.",
      "Brownian motion carries the particle toward #destination#.",
      "Suspended state: neither rising nor falling."
    ],
    obstacle: [
      "The downdraft pushes the mote toward the floor.",
      "Air resistance increases. Trajectory altered.",
      "Collision with surface imminent."
    ],
    shift: [
      "The mote settles, becoming part of the accumulation.",
      "State change: airborne → sedimentary.",
      "The particle joins the layer of forgotten things."
    ]
  },
  light: {
    goal: [
      "The light shaft propagates, seeking surfaces to illuminate.",
      "Photons travel in straight lines, revealing dust.",
      "Propagation: unimpeded through transparent medium."
    ],
    obstacle: [
      "The opaque object blocks the beam, casting shadow.",
      "Absorption: energy transferred to surface.",
      "The light cannot penetrate. Reflection occurs."
    ],
    shift: [
      "As the sun sets, the light shifts toward the red.",
      "Wavelength elongation: blue → amber.",
      "The quality of illumination changes, becoming warm."
    ]
  },
  mold: {
    goal: [
      "The mycelium extends hyphae, seeking nutrients.",
      "Chemical sensing detects cellulose substrate.",
      "Colonization state: expansion at margins."
    ],
    obstacle: [
      "The dry surface inhibits growth. Sporulation triggered.",
      "Moisture levels below threshold. Dormancy initiated.",
      "The colony halts at the boundary of inhospitality."
    ],
    shift: [
      "Reproductive phase: sporangia forming.",
      "The mold transforms, preparing to disperse.",
      "Life cycle transition: vegetative → reproductive."
    ]
  },
  stone: {
    goal: [
      "The stone endures, seeking only stillness.",
      "Mineral stability: no metabolic drive.",
      "The stone's goal is the absence of change."
    ],
    obstacle: [
      "The hammer strikes. Fracture lines propagate.",
      "Mechanical stress exceeds tensile strength.",
      "The stone cracks, becoming multiple."
    ],
    shift: [
      "Erosion smooths the surface over millennia.",
      "The stone becomes sand, grain by grain.",
      "Geological time: solid → particulate."
    ]
  }
};

const EXPANSIONS = {
  movement: ["navigates", "traverses", "scales", "crosses"],
  surface: ["ceramic plain", "wooden ridge", "glass horizon", "tile grid"],
  sensing: ["sensing", "probing", "scanning", "detecting"],
  resource: ["sucrose", "pheromone trails", "moisture gradients"],
  gradient: ["sugar", "protein", "water vapor"],
  material: ["porcelain", "ceramic", "enamel"],
  state: ["torpor", "stasis", "suspended animation"],
  destination: ["the shelf", "the window", "the corner"]
};

// --- AUDIO ENGINE ---
class AudioEngine {
  constructor() {
    this.initialized = false;
    this.synth = null;
  }

  async init() {
    if (this.initialized) return;
    await Tone.start();
    
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.5 }
    }).toDestination();
    this.synth.volume.value = -15;
    
    this.initialized = true;
  }

  playTokenSound(type) {
    if (!this.initialized) return;
    const notes = {
      entity: 'C4',
      vector: 'E4',
      modifier: 'G4'
    };
    this.synth.triggerAttackRelease(notes[type] || 'C4', '32n');
  }

  playGenerateSound() {
    if (!this.initialized) return;
    this.synth.triggerAttackRelease(['C4', 'E4', 'G4', 'C5'], '16n');
  }
}

const audioEngine = new AudioEngine();

// --- UTILITY ---
const expandText = (text) => {
  return text.replace(/#(\w+)#/g, (match, key) => {
    const expansions = EXPANSIONS[key];
    if (expansions) {
      return expansions[Math.floor(Math.random() * expansions.length)];
    }
    return match;
  });
};

// --- COMPONENTS ---

const ComponentItem = ({ component, onDragStart }) => (
  <div
    className={`component-item ${component.type}`}
    draggable
    onDragStart={(e) => onDragStart(e, component)}
  >
    {component.label}
  </div>
);

const DroppedToken = ({ token, onRemove }) => (
  <div className={`dropped-token ${token.type}`}>
    <span>{token.label}</span>
    <span className="token-remove" onClick={onRemove}>×</span>
  </div>
);

const PromptSlot = ({ label, tokens, onDrop, onRemove, isActive }) => {
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('component');
    if (data) {
      onDrop(JSON.parse(data));
    }
  };

  return (
    <div 
      className={`prompt-slot ${isActive ? 'active' : ''}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <span className="slot-label">{label}</span>
      {tokens.map((token, i) => (
        <DroppedToken
          key={`${token.id}-${i}`}
          token={token}
          onRemove={() => onRemove(i)}
        />
      ))}
    </div>
  );
};

const LatentPoint = ({ point, isSelected, onClick }) => {
  const colors = {
    GOAL: '#d4af37',
    OBSTACLE: '#c45',
    SHIFT: '#4dd'
  };

  return (
    <div
      className={`latent-point ${isSelected ? 'selected' : ''}`}
      style={{
        left: `${point.x * 100}%`,
        top: `${point.y * 100}%`,
        background: colors[point.vector],
        opacity: 0.3 + point.intensity * 0.7
      }}
      onClick={onClick}
    />
  );
};

const AttentionBar = ({ label, value }) => (
  <div className="attention-bar">
    <span className="attention-label">{label}</span>
    <div className="attention-track">
      <div className="attention-fill" style={{ width: `${value}%` }} />
    </div>
    <span className="attention-value">{value}%</span>
  </div>
);

// --- MAIN APP ---
const LatentPrompt = () => {
  // State
  const [promptSlots, setPromptSlots] = useState({
    context: [],
    entity: [],
    vector: [],
    modifiers: []
  });
  const [generatedText, setGeneratedText] = useState('');
  const [attentionScores, setAttentionScores] = useState({
    entity: 0,
    vector: 0,
    context: 0,
    modifiers: 0
  });
  const [tokenStream, setTokenStream] = useState([]);
  const [selectedLatentPoint, setSelectedLatentPoint] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  
  const latentCanvasRef = useRef(null);
  
  // Calculate token count
  const tokenCount = useMemo(() => {
    return Object.values(promptSlots).flat().length + tokenStream.length;
  }, [promptSlots, tokenStream]);
  
  // Handle drag start
  const handleDragStart = (e, component) => {
    e.dataTransfer.setData('component', JSON.stringify(component));
    if (!audioEnabled) {
      audioEngine.init().then(() => {
        setAudioEnabled(true);
        audioEngine.playTokenSound(component.type);
      });
    } else {
      audioEngine.playTokenSound(component.type);
    }
  };
  
  // Handle drop
  const handleDrop = (slotKey, component) => {
    setPromptSlots(prev => ({
      ...prev,
      [slotKey]: [...prev[slotKey], component]
    }));
    
    // Update attention scores
    setAttentionScores(prev => ({
      ...prev,
      [component.type]: Math.min(100, prev[component.type] + 20)
    }));
  };
  
  // Handle remove
  const handleRemove = (slotKey, index) => {
    setPromptSlots(prev => ({
      ...prev,
      [slotKey]: prev[slotKey].filter((_, i) => i !== index)
    }));
  };
  
  // Generate worldtext
  const generate = useCallback(() => {
    setIsGenerating(true);
    
    // Get entity and vector from prompt
    const entity = promptSlots.entity[0]?.token || 'ant';
    const vector = promptSlots.vector[0]?.token || 'goal';
    
    // Get grammar options
    const options = GRAMMAR[entity]?.[vector] || ["The entity exists in state."];
    const baseText = options[Math.floor(Math.random() * options.length)];
    
    // Expand grammar
    const expanded = expandText(baseText);
    
    // Simulate token stream
    const tokens = expanded.split(/\s+/);
    setTokenStream([]);
    
    // Stream tokens
    tokens.forEach((token, i) => {
      setTimeout(() => {
        setTokenStream(prev => [...prev, token]);
      }, i * 80);
    });
    
    // Set final text
    setTimeout(() => {
      setGeneratedText(expanded);
      setIsGenerating(false);
      if (audioEnabled) {
        audioEngine.playGenerateSound();
      }
    }, tokens.length * 80 + 200);
    
    // Update attention based on modifiers
    const modifierBoost = promptSlots.modifiers.length * 10;
    setAttentionScores(prev => ({
      ...prev,
      modifiers: Math.min(100, prev.modifiers + modifierBoost),
      context: Math.min(100, prev.context + 15)
    }));
  }, [promptSlots, audioEnabled]);
  
  // Draw latent space connections
  useEffect(() => {
    const canvas = latentCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connections between nearby points
    LATENT_POINTS.forEach((p1, i) => {
      LATENT_POINTS.forEach((p2, j) => {
        if (i >= j) return;
        
        const dx = (p1.x - p2.x) * canvas.width;
        const dy = (p1.y - p2.y) * canvas.height;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 100) {
          ctx.strokeStyle = 'rgba(167, 119, 221, 0.1)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
          ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
          ctx.stroke();
        }
      });
    });
  }, []);
  
  return (
    <div className="latent-prompt">
      {/* Header */}
      <header className="prompt-header">
        <div className="header-left">
          <div className="logo">RIPPLES // LATENT PROMPT</div>
          <div className="prompt-status">
            <div className="status-dot" />
            <span>PROMPT ENGINEERING INTERFACE</span>
          </div>
        </div>
        <div className="header-right">
          <div className="token-count">
            <span>TOKENS</span>
            <span className="count-value">{tokenCount}</span>
          </div>
          <div className="token-count">
            <span>LATENT DIM</span>
            <span className="count-value">768</span>
          </div>
        </div>
      </header>
      
      {/* Left Panel - Components */}
      <aside className="components-panel">
        <div className="panel-header">Prompt Components</div>
        
        <div className="component-section">
          <div className="section-title">Entities</div>
          <div className="component-grid">
            {PROMPT_COMPONENTS.entities.map(c => (
              <ComponentItem
                key={c.id}
                component={c}
                onDragStart={handleDragStart}
              />
            ))}
          </div>
        </div>
        
        <div className="component-section">
          <div className="section-title">Vectors</div>
          <div className="component-grid">
            {PROMPT_COMPONENTS.vectors.map(c => (
              <ComponentItem
                key={c.id}
                component={c}
                onDragStart={handleDragStart}
              />
            ))}
          </div>
        </div>
        
        <div className="component-section">
          <div className="section-title">Modifiers</div>
          <div className="component-grid">
            {PROMPT_COMPONENTS.modifiers.map(c => (
              <ComponentItem
                key={c.id}
                component={c}
                onDragStart={handleDragStart}
              />
            ))}
          </div>
        </div>
      </aside>
      
      {/* Center - Workspace */}
      <main className="workspace-panel">
        <div className="workspace-canvas">
          <div className="prompt-composition">
            <PromptSlot
              label="Context"
              tokens={promptSlots.context}
              onDrop={(c) => handleDrop('context', c)}
              onRemove={(i) => handleRemove('context', i)}
              isActive={promptSlots.context.length > 0}
            />
            <PromptSlot
              label="Entity"
              tokens={promptSlots.entity}
              onDrop={(c) => handleDrop('entity', c)}
              onRemove={(i) => handleRemove('entity', i)}
              isActive={promptSlots.entity.length > 0}
            />
            <PromptSlot
              label="Vector"
              tokens={promptSlots.vector}
              onDrop={(c) => handleDrop('vector', c)}
              onRemove={(i) => handleRemove('vector', i)}
              isActive={promptSlots.vector.length > 0}
            />
            <PromptSlot
              label="Modifiers"
              tokens={promptSlots.modifiers}
              onDrop={(c) => handleDrop('modifiers', c)}
              onRemove={(i) => handleRemove('modifiers', i)}
              isActive={promptSlots.modifiers.length > 0}
            />
          </div>
        </div>
        
        {/* Latent Navigator */}
        <div className="latent-navigator">
          <div className="navigator-title">Latent Space Navigator</div>
          <div className="latent-canvas-container">
            <canvas ref={latentCanvasRef} className="latent-canvas" />
            {LATENT_POINTS.map(point => (
              <LatentPoint
                key={point.id}
                point={point}
                isSelected={selectedLatentPoint === point.id}
                onClick={() => setSelectedLatentPoint(point.id)}
              />
            ))}
          </div>
        </div>
      </main>
      
      {/* Right Panel - Output */}
      <aside className="output-panel">
        <div className="output-display">
          <div className="output-section">
            <div className="output-label">Generated Worldtext</div>
            <div className="generated-text">
              {generatedText || 'Compose a prompt and click Generate...'}
            </div>
          </div>
          
          <div className="output-section">
            <div className="output-label">Attention Weights</div>
            <div className="attention-viz">
              <AttentionBar label="Entity" value={attentionScores.entity} />
              <AttentionBar label="Vector" value={attentionScores.vector} />
              <AttentionBar label="Context" value={attentionScores.context} />
              <AttentionBar label="Modifiers" value={attentionScores.modifiers} />
            </div>
          </div>
          
          <button 
            className="generate-btn"
            onClick={generate}
            disabled={isGenerating || promptSlots.entity.length === 0}
          >
            {isGenerating ? 'Generating...' : 'Generate Worldtext'}
          </button>
        </div>
      </aside>
      
      {/* Bottom Panel - Token Stream */}
      <footer className="token-panel">
        <div className="token-header">
          <span className="panel-header">Token Stream</span>
          <span style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>
            {tokenStream.length} tokens emitted
          </span>
        </div>
        <div className="token-stream">
          {tokenStream.map((token, i) => (
            <span 
              key={i} 
              className={`stream-token ${i === tokenStream.length - 1 ? 'active' : ''}`}
            >
              {token}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
};

// Render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<LatentPrompt />);
