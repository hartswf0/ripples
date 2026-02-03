const { useState, useEffect, useRef, useCallback, useMemo } = React;

// ============================================================
// FEEDBACK LOOP: Recursive System State Monitoring
// RIPPLES: Operative Ecologies through temporal feedback
// ============================================================

// --- ENTITIES ---
const ENTITIES = [
  { id: 'input', name: 'INPUT', type: 'source', x: 0.2, y: 0.5, color: '#d4af37' },
  { id: 'process', name: 'PROCESS', type: 'transform', x: 0.5, y: 0.5, color: '#4dd' },
  { id: 'output', name: 'OUTPUT', type: 'sink', x: 0.8, y: 0.5, color: '#d4a' },
  { id: 'feedback', name: 'FEEDBACK', type: 'loop', x: 0.5, y: 0.2, color: '#4a6' },
  { id: 'memory', name: 'MEMORY', type: 'store', x: 0.5, y: 0.8, color: '#808080' }
];

// --- GRAMMAR ---
const GRAMMAR = {
  origin: ["#state# #observation# #implication#"],
  state: ["System #condition#.", "State #phase#.", "Feedback #response#."],
  condition: ["oscillates", "resonates", "diverges", "converges", "stabilizes"],
  phase: ["transitions", "shifts", "inverts", "amplifies", "attenuates"],
  response: ["loops", "echoes", "reverberates", "cascades", "dissipates"],
  observation: ["The #component# #behavior#.", "#signal# detected."],
  component: ["input vector", "process node", "output channel", "feedback path"],
  behavior: ["modulates amplitude", "shifts phase", "introduces noise", "synchronizes"],
  signal: ["Resonant frequency", "Harmonic distortion", "Phase interference", "Entropy spike"],
  implication: ["Next state: #prediction#.", "Trajectory: #direction#."],
  prediction: ["amplification", "damping", "bifurcation", "collapse"],
  direction: ["convergent", "divergent", "cyclic", "chaotic"]
};

// --- AUDIO ENGINE ---
class AudioEngine {
  constructor() {
    this.initialized = false;
    this.oscillators = {};
    this.analyser = null;
  }

  async init() {
    if (this.initialized) return;
    await Tone.start();
    
    // Feedback drone
    this.oscillators.a = new Tone.Oscillator(110, 'sine').toDestination();
    this.oscillators.b = new Tone.Oscillator(110.5, 'sine').toDestination();
    this.oscillators.c = new Tone.Oscillator(55, 'triangle').toDestination();
    
    Object.values(this.oscillators).forEach(osc => {
      osc.volume.value = -30;
    });
    
    // Analyser for visualization
    this.analyser = new Tone.Analyser('waveform', 256);
    this.oscillators.a.connect(this.analyser);
    
    this.initialized = true;
  }

  start() {
    Object.values(this.oscillators).forEach(osc => {
      if (osc.state !== 'started') osc.start();
    });
  }

  stop() {
    Object.values(this.oscillators).forEach(osc => osc.stop());
  }

  modulate(vector, intensity) {
    if (!this.initialized) return;
    
    const baseFreq = { GOAL: 220, OBSTACLE: 110, SHIFT: 165 }[vector] || 110;
    
    // Create beating effect based on intensity
    this.oscillators.a.frequency.rampTo(baseFreq, 0.1);
    this.oscillators.b.frequency.rampTo(baseFreq * (1 + intensity * 0.01), 0.1);
    this.oscillators.c.frequency.rampTo(baseFreq * 0.5, 0.1);
    
    // Trigger envelope
    const env = new Tone.AmplitudeEnvelope({
      attack: 0.01,
      decay: 0.3,
      sustain: 0.1,
      release: 0.5
    }).toDestination();
    
    const osc = new Tone.Oscillator(baseFreq, 'sine').connect(env);
    osc.volume.value = -20;
    osc.start();
    env.triggerAttackRelease(0.5);
    setTimeout(() => osc.stop(), 600);
  }

  getWaveform() {
    return this.analyser ? this.analyser.getValue() : new Float32Array(256);
  }
}

const audioEngine = new AudioEngine();

// --- UTILITY ---
const expandGrammar = (symbol = 'origin') => {
  const rules = GRAMMAR[symbol];
  if (!rules) return symbol;
  const rule = rules[Math.floor(Math.random() * rules.length)];
  return rule.replace(/#([^#]+)#/g, (match, sym) => expandGrammar(sym));
};

// --- COMPONENTS ---

const SystemNode = ({ node, isActive, intensity }) => {
  const style = {
    left: `calc(${node.x * 100}% - 30px)`,
    top: `calc(${node.y * 100}% - 30px)`,
    borderColor: node.color,
    color: node.color,
    boxShadow: isActive ? `0 0 ${20 + intensity * 30}px ${node.color}` : 'none'
  };
  
  return (
    <div className={`system-node ${isActive ? 'active' : ''}`} style={style}>
      <span className="node-label">{node.name}</span>
      <span className="node-state">{isActive ? 'ACTIVE' : 'IDLE'}</span>
    </div>
  );
};

const HistoryItem = ({ item, isActive, onClick }) => (
  <div 
    className={`history-item ${isActive ? 'active' : ''}`}
    onClick={onClick}
  >
    <div className="history-tick">tick {item.tick}</div>
    <div className={`history-vector ${item.vector}`}>{item.vector}</div>
    <div className="history-entity">{item.entity}</div>
  </div>
);

const MetricBar = ({ name, value, type }) => (
  <div className="metric-section">
    <div className="metric-bar">
      <div 
        className={`metric-fill ${type}`} 
        style={{ width: `${value}%` }}
      />
    </div>
    <div className="metric-reading">
      <span className="metric-name">{name}</span>
      <span className="metric-value">{value.toFixed(1)}%</span>
    </div>
  </div>
);

// --- MAIN APP ---
const FeedbackLoop = () => {
  // State
  const [tick, setTick] = useState(0);
  const [history, setHistory] = useState([]);
  const [activeNode, setActiveNode] = useState(null);
  const [output, setOutput] = useState('System initialized. Waiting for input...');
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [activeVector, setActiveVector] = useState(null);
  const [metrics, setMetrics] = useState({
    entropy: 30,
    coherence: 70,
    resonance: 50
  });
  const [waveformData, setWaveformData] = useState(new Float32Array(256));
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState(-1);
  
  const scopeCanvasRef = useRef(null);
  const monitorCanvasRef = useRef(null);
  const animationRef = useRef(null);
  
  // Generate state change
  const triggerVector = useCallback(async (vector) => {
    if (!audioEnabled) {
      await audioEngine.init();
      setAudioEnabled(true);
      audioEngine.start();
    }
    
    setActiveVector(vector);
    setTimeout(() => setActiveVector(null), 200);
    
    // Determine affected node
    const nodeMap = { GOAL: 'input', OBSTACLE: 'process', SHIFT: 'feedback' };
    const affectedNode = nodeMap[vector];
    setActiveNode(affectedNode);
    setTimeout(() => setActiveNode(null), 500);
    
    // Generate output
    const newOutput = expandGrammar();
    setOutput(newOutput);
    
    // Update metrics based on vector
    setMetrics(prev => {
      const intensity = Math.random() * 30 + 10;
      switch(vector) {
        case 'GOAL':
          return {
            entropy: Math.max(10, prev.entropy - intensity * 0.3),
            coherence: Math.min(100, prev.coherence + intensity * 0.5),
            resonance: Math.min(100, prev.resonance + intensity * 0.2)
          };
        case 'OBSTACLE':
          return {
            entropy: Math.min(100, prev.entropy + intensity * 0.5),
            coherence: Math.max(10, prev.coherence - intensity * 0.3),
            resonance: Math.max(10, prev.resonance - intensity * 0.2)
          };
        case 'SHIFT':
          return {
            entropy: Math.min(100, prev.entropy + intensity * 0.2),
            coherence: prev.coherence,
            resonance: Math.min(100, prev.resonance + intensity * 0.6)
          };
        default:
          return prev;
      }
    });
    
    // Add to history
    const newHistoryItem = {
      tick,
      vector,
      entity: affectedNode,
      output: newOutput,
      metrics: { ...metrics },
      timestamp: Date.now()
    };
    setHistory(prev => [newHistoryItem, ...prev].slice(0, 50));
    
    // Audio feedback
    audioEngine.modulate(vector, metrics.resonance);
    
    setTick(t => t + 1);
  }, [tick, metrics, audioEnabled]);
  
  // Autoplay
  useEffect(() => {
    if (!isAutoplay) return;
    const interval = setInterval(() => {
      const vectors = ['GOAL', 'OBSTACLE', 'SHIFT'];
      triggerVector(vectors[Math.floor(Math.random() * vectors.length)]);
    }, 2500);
    return () => clearInterval(interval);
  }, [isAutoplay, triggerVector]);
  
  // Draw oscilloscope
  useEffect(() => {
    const canvas = scopeCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    let phase = 0;
    
    const draw = () => {
      ctx.fillStyle = 'rgba(5, 5, 8, 0.3)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw waveform for each vector channel
      const channels = [
        { color: '#d4af37', offset: 0.25, freq: 2 },
        { color: '#c44', offset: 0.5, freq: 3 },
        { color: '#4dd', offset: 0.75, freq: 1.5 }
      ];
      
      channels.forEach((ch, i) => {
        ctx.strokeStyle = ch.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        
        const amplitude = activeVector === ['GOAL', 'OBSTACLE', 'SHIFT'][i] ? 30 : 15;
        const yOffset = canvas.height * ch.offset;
        
        for (let x = 0; x < canvas.width; x += 2) {
          const t = (x / canvas.width) * Math.PI * 4 + phase * ch.freq;
          const y = yOffset + Math.sin(t) * amplitude * (metrics.resonance / 100);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        
        ctx.stroke();
      });
      
      // Draw feedback interference pattern
      if (metrics.resonance > 60) {
        ctx.strokeStyle = 'rgba(77, 221, 221, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        for (let x = 0; x < canvas.width; x += 3) {
          const t1 = (x / canvas.width) * Math.PI * 6 + phase;
          const t2 = (x / canvas.width) * Math.PI * 6.1 + phase;
          const interference = Math.sin(t1) + Math.sin(t2);
          const y = canvas.height * 0.5 + interference * 20;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        
        ctx.stroke();
      }
      
      phase += 0.05;
      animationRef.current = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [activeVector, metrics.resonance]);
  
  // Draw monitor connections
  useEffect(() => {
    const canvas = monitorCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connections
    const connections = [
      { from: 'input', to: 'process' },
      { from: 'process', to: 'output' },
      { from: 'output', to: 'feedback' },
      { from: 'feedback', to: 'input' },
      { from: 'process', to: 'memory' },
      { from: 'memory', to: 'process' }
    ];
    
    connections.forEach(conn => {
      const fromNode = ENTITIES.find(e => e.id === conn.from);
      const toNode = ENTITIES.find(e => e.id === conn.to);
      
      if (fromNode && toNode) {
        const x1 = fromNode.x * canvas.width;
        const y1 = fromNode.y * canvas.height;
        const x2 = toNode.x * canvas.width;
        const y2 = toNode.y * canvas.height;
        
        ctx.strokeStyle = 'rgba(128, 128, 128, 0.2)';
        ctx.lineWidth = 1;
        
        // Draw curved connection
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        
        const cpX = (x1 + x2) / 2 + (Math.random() - 0.5) * 50;
        const cpY = (y1 + y2) / 2 + (Math.random() - 0.5) * 50;
        
        ctx.quadraticCurveTo(cpX, cpY, x2, y2);
        ctx.stroke();
        
        // Draw active pulse if connection is active
        if (activeNode && (conn.from === activeNode || conn.to === activeNode)) {
          const pulsePos = (Date.now() % 1000) / 1000;
          const px = x1 + (x2 - x1) * pulsePos;
          const py = y1 + (y2 - y1) * pulsePos;
          
          ctx.fillStyle = fromNode.color;
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });
  }, [activeNode]);
  
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
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerVector]);
  
  // Calculate loop status
  const loopStatus = useMemo(() => {
    if (metrics.entropy > 70) return { status: 'divergent', text: 'DIVERGENT' };
    if (metrics.coherence > 80) return { status: 'convergent', text: 'CONVERGENT' };
    return { status: 'active', text: 'FEEDBACK ACTIVE' };
  }, [metrics]);
  
  return (
    <div className="feedback-loop">
      {/* CRT Overlay */}
      <div className="crt-overlay">
        <div className="scanlines" />
        <div className="phosphor-glow" />
      </div>
      
      {/* Header */}
      <header className="feedback-header">
        <div className="header-left">
          <div className="logo">RIPPLES // FEEDBACK LOOP</div>
          <div className="feedback-indicator">
            <div className="feedback-dot" />
            <span>RECURSIVE MONITORING</span>
          </div>
        </div>
        <div className="header-right">
          <div className="metric">
            <span>TICK</span>
            <span className="metric-value">{tick}</span>
          </div>
          <div className="metric">
            <span>HISTORY</span>
            <span className="metric-value">{history.length}</span>
          </div>
          <div className="metric">
            <span>ENTITIES</span>
            <span className="metric-value">{ENTITIES.length}</span>
          </div>
        </div>
      </header>
      
      {/* Oscilloscope */}
      <div className="oscilloscope-panel">
        <canvas ref={scopeCanvasRef} className="oscilloscope-canvas" />
        <div className="oscilloscope-overlay">
          <div className="scope-grid" />
          <div className="scope-labels">
            <div className="scope-channel">
              <div className="channel-dot goal" />
              <span>GOAL</span>
            </div>
            <div className="scope-channel">
              <div className="channel-dot obstacle" />
              <span>OBSTACLE</span>
            </div>
            <div className="scope-channel">
              <div className="channel-dot shift" />
              <span>SHIFT</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* History Panel */}
      <aside className="history-panel">
        <div className="panel-header">
          <span>State History</span>
          <span style={{ color: 'var(--text-tertiary)' }}>{history.length}</span>
        </div>
        <div className="history-list">
          {history.map((item, i) => (
            <HistoryItem
              key={item.timestamp}
              item={item}
              isActive={selectedHistoryIndex === i}
              onClick={() => {
                setSelectedHistoryIndex(i);
                setOutput(item.output);
              }}
            />
          ))}
        </div>
      </aside>
      
      {/* Monitor Panel */}
      <main className="monitor-panel">
        <canvas ref={monitorCanvasRef} className="monitor-canvas" />
        <div className="monitor-overlay">
          {ENTITIES.map(node => (
            <SystemNode
              key={node.id}
              node={node}
              isActive={activeNode === node.id}
              intensity={metrics.resonance / 100}
            />
          ))}
          
          {/* Feedback rings */}
          {activeNode && (
            <div 
              className="feedback-ring active"
              style={{
                left: '50%',
                top: '50%',
                width: 100,
                height: 100,
                transform: 'translate(-50%, -50%)'
              }}
            />
          )}
        </div>
      </main>
      
      {/* Metrics Panel */}
      <aside className="metrics-panel">
        <div className="panel-header">System Metrics</div>
        <div className="metrics-content">
          <MetricBar name="Entropy" value={metrics.entropy} type="entropy" />
          <MetricBar name="Coherence" value={metrics.coherence} type="coherence" />
          <MetricBar name="Resonance" value={metrics.resonance} type="resonance" />
          
          <div className="feedback-loop-indicator">
            <div className={`loop-status ${loopStatus.status}`}>
              <span>◆</span>
              <span>{loopStatus.text}</span>
            </div>
          </div>
          
          <div className="metric-section" style={{ marginTop: 16 }}>
            <div className="metric-title">Active Connections</div>
            <div style={{ fontSize: 9, color: 'var(--text-secondary)' }}>
              INPUT → PROCESS → OUTPUT<br />
              OUTPUT → FEEDBACK → INPUT<br />
              PROCESS ↔ MEMORY
            </div>
          </div>
        </div>
      </aside>
      
      {/* Control Panel */}
      <footer className="control-panel">
        <div className="output-display">
          <div className="output-label">System Output // Tick {tick}</div>
          <div className="output-text">{output}</div>
          <div className="output-meta">
            <span>ENTROPY: {metrics.entropy.toFixed(1)}%</span>
            <span>COHERENCE: {metrics.coherence.toFixed(1)}%</span>
            <span>RESONANCE: {metrics.resonance.toFixed(1)}%</span>
          </div>
        </div>
        
        <div className="controls">
          <div className="vector-row">
            <button 
              className={`vector-btn goal ${activeVector === 'GOAL' ? 'active' : ''}`}
              onClick={() => triggerVector('GOAL')}
            >
              Goal [G]
            </button>
            <button 
              className={`vector-btn obstacle ${activeVector === 'OBSTACLE' ? 'active' : ''}`}
              onClick={() => triggerVector('OBSTACLE')}
            >
              Obstacle [O]
            </button>
            <button 
              className={`vector-btn shift ${activeVector === 'SHIFT' ? 'active' : ''}`}
              onClick={() => triggerVector('SHIFT')}
            >
              Shift [S]
            </button>
          </div>
          
          <div className="control-row">
            <span className="control-label">Autoplay</span>
            <button 
              className={`toggle-btn ${isAutoplay ? 'active' : ''}`}
              onClick={() => setIsAutoplay(!isAutoplay)}
            >
              {isAutoplay ? 'ON' : 'OFF'}
            </button>
          </div>
          
          <div className="control-row">
            <span className="control-label">Audio</span>
            <button 
              className={`toggle-btn ${audioEnabled ? 'active' : ''}`}
              onClick={() => {
                if (!audioEnabled) {
                  audioEngine.init().then(() => {
                    setAudioEnabled(true);
                    audioEngine.start();
                  });
                } else {
                  audioEngine.stop();
                  setAudioEnabled(false);
                }
              }}
            >
              {audioEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<FeedbackLoop />);
