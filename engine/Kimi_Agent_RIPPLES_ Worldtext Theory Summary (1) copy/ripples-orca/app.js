const { useState, useEffect, useRef, useCallback, useMemo } = React;

// ============================================================
// RIPPLES: ORCA INTEGRATION
// Livecoding-compatible Worldtext Generator
// UDP/OSC protocol compatible with Pilot/Gull
// ============================================================

// --- RIPPLES OPERATORS (ORCA-Compatible) ---
const RIPPLES_OPERATORS = {
  // Core RIPPLES operators
  'G': { name: 'GOAL', type: 'vector', color: '#ffd700', desc: 'Movement toward resource' },
  'O': { name: 'OBSTACLE', type: 'vector', color: '#ff3333', desc: 'Encounter with barrier' },
  'S': { name: 'SHIFT', type: 'vector', color: '#00ffff', desc: 'Change in state' },
  'R': { name: 'RIPPLE', type: 'propagation', color: '#ff00ff', desc: 'Propagate to neighbors' },
  'E': { name: 'ENTITY', type: 'spawn', color: '#4af626', desc: 'Spawn entity at position' },
  'W': { name: 'WORLD', type: 'worldtext', color: '#4af626', desc: 'Generate worldtext' },
  // Standard ORCA operators
  'A': { name: 'add', type: 'math', desc: 'Outputs sum of inputs' },
  'B': { name: 'subtract', type: 'math', desc: 'Outputs difference of inputs' },
  'C': { name: 'clock', type: 'timing', desc: 'Outputs modulo of frame' },
  'D': { name: 'delay', type: 'timing', desc: 'Bangs on modulo of frame' },
  'H': { name: 'halt', type: 'control', desc: 'Halts southward operand' },
  'I': { name: 'increment', type: 'math', desc: 'Increments southward operand' },
  'L': { name: 'less', type: 'math', desc: 'Outputs smallest of inputs' },
  'M': { name: 'multiply', type: 'math', desc: 'Outputs product of inputs' },
  'N': { name: 'north', type: 'movement', desc: 'Moves northward' },
  'P': { name: 'push', type: 'io', desc: 'Writes eastward operand' },
  'T': { name: 'track', type: 'io', desc: 'Reads eastward operand' },
  'U': { name: 'uclid', type: 'rhythm', desc: 'Bangs on Euclidean rhythm' },
  'V': { name: 'variable', type: 'memory', desc: 'Reads and writes variable' },
  'X': { name: 'write', type: 'io', desc: 'Writes operand with offset' },
  '*': { name: 'bang', type: 'control', desc: 'Bangs neighboring operands' },
  '#': { name: 'comment', type: 'control', desc: 'Halts a line' },
  '.': { name: 'empty', type: 'empty', desc: 'Empty cell' }
};

// --- ENTITY TYPES ---
const ENTITY_TYPES = {
  'a': { name: 'ant', type: 'animate', sensory: 'chemical' },
  'd': { name: 'dust', type: 'inanimate', sensory: 'thermal' },
  's': { name: 'shadow', type: 'abstract', sensory: 'visual' },
  'l': { name: 'light', type: 'abstract', sensory: 'thermal' },
  'm': { name: 'mold', type: 'animate', sensory: 'chemical' },
  't': { name: 'stone', type: 'inanimate', sensory: 'vibration' },
  'o': { name: 'owl', type: 'animate', sensory: 'auditory' },
  'f': { name: 'mycelium', type: 'animate', sensory: 'chemical' }
};

// --- WORLDTEXT GRAMMAR ---
const WORLDTEXT_GRAMMAR = {
  ant: {
    goal: [
      "The <entity>ant</entity> <uncertainty>perhaps</uncertainty> navigates the ceramic topography, sensing sucrose gradients.",
      "Chemotaxis pulls the scout toward <vector>higher concentrations</vector>.",
      "Mandibles extended, antennae sweeping the <uncertainty>seemingly</uncertainty> infinite plain."
    ],
    obstacle: [
      "The vertical cliff of porcelain <vector>blocks all paths</vector>.",
      "Tumbling frequency increases. <uncertainty>Perhaps</uncertainty> another route exists.",
      "The ant registers the <vector>obstruction</vector> as thermal gradient shift."
    ],
    shift: [
      "Metabolism slows. The ant enters <vector>torpor</vector>.",
      "<uncertainty>As if</uncertainty> time itself thickens, movement becomes suspended.",
      "State transition: <vector>active → dormant</vector>."
    ]
  },
  shadow: {
    goal: [
      "The <entity>shadow</entity> stretches toward darkness, <vector>seeking union</vector> with the wall.",
      "Fleeing the light source, edges <uncertainty>seemingly</uncertainty> diffusing.",
      "Propagation vector: <vector>elongation</vector> along azimuth."
    ],
    obstacle: [
      "The light intensifies. <vector>Dissolution</vector> imminent.",
      "The shadow shrinks, <uncertainty>as if</uncertainty> compressed by photon pressure.",
      "<vector>Obstruction</vector>: illumination exceeds threshold."
    ],
    shift: [
      "As night falls, the shadow <vector>becomes substance</vector>.",
      "Phase transition: <vector>insubstantial → material</vector>.",
      "The darkness thickens, <uncertainty>perhaps</uncertainty> gaining mass."
    ]
  },
  dust: {
    goal: [
      "The <entity>dust mote</entity> drifts on thermal currents, <vector>seeking stillness</vector>.",
      "Brownian motion carries the particle <uncertainty>seemingly</uncertainty> at random.",
      "Suspended state: <vector>neither rising nor falling</vector>."
    ],
    obstacle: [
      "The downdraft <vector>pushes</vector> toward the floor.",
      "Air resistance increases. <uncertainty>Perhaps</uncertainty> collision is inevitable.",
      "<vector>Obstruction</vector>: surface proximity detected."
    ],
    shift: [
      "The mote settles, <vector>becoming sediment</vector>.",
      "State change: <vector>airborne → accumulated</vector>.",
      "The particle joins the layer of <uncertainty>forgotten</uncertainty> things."
    ]
  }
};

// --- UDP/OSC SIMULATION ---
class UDPSimulator {
  constructor() {
    this.listeners = new Map();
    this.ports = {
      input: 49160,
      output: 49161,
      osc: 49162
    };
  }

  send(message, port = 49161) {
    // Simulate UDP send
    console.log(`[UDP:${port}] ${message}`);
    return true;
  }

  on(port, callback) {
    this.listeners.set(port, callback);
  }

  receive(message, port = 49160) {
    const callback = this.listeners.get(port);
    if (callback) callback(message);
  }
}

const udp = new UDPSimulator();

// --- AUDIO ENGINE (Pilot-Compatible) ---
class RipplesAudio {
  constructor() {
    this.initialized = false;
    this.voices = [];
    this.effects = {};
  }

  async init() {
    if (this.initialized) return;
    await Tone.start();
    
    // Create 16 voices (Pilot-compatible)
    for (let i = 0; i < 16; i++) {
      this.voices.push({
        synth: new Tone.PolySynth(Tone.Synth).toDestination(),
        active: false
      });
    }
    
    // Effects
    this.effects.reverb = new Tone.Reverb(3).toDestination();
    this.effects.delay = new Tone.FeedbackDelay('8n', 0.5).toDestination();
    
    this.initialized = true;
  }

  playNote(channel, octave, note, velocity = 64, length = '16n') {
    if (!this.initialized) return;
    const voice = this.voices[channel % 16];
    if (!voice) return;
    
    const freq = this.noteToFreq(octave, note);
    voice.synth.triggerAttackRelease(freq, length, velocity / 127);
    
    // Send UDP message (Pilot-compatible)
    udp.send(`${channel}${octave}${note}${velocity.toString(36)}`, 49161);
  }

  noteToFreq(octave, note) {
    const notes = { 'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11 };
    const noteVal = notes[note] || 0;
    return 440 * Math.pow(2, (octave - 4) + (noteVal - 9) / 12);
  }
}

const audio = new RipplesAudio();

// --- GRID INITIALIZATION ---
const GRID_COLS = 56;
const GRID_ROWS = 36;

const initializeGrid = () => {
  const grid = [];
  for (let y = 0; y < GRID_ROWS; y++) {
    const row = [];
    for (let x = 0; x < GRID_COLS; x++) {
      row.push({
        x, y,
        char: '.',
        operator: null,
        entity: null,
        rippling: false,
        banging: false
      });
    }
    grid.push(row);
  }
  return grid;
};

// --- MAIN APP ---
const RipplesOrca = () => {
  // State
  const [grid, setGrid] = useState(initializeGrid());
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [tick, setTick] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [worldtext, setWorldtext] = useState('');
  const [entities, setEntities] = useState([]);
  const [command, setCommand] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(false);
  
  const gridRef = useRef(null);
  const intervalRef = useRef(null);
  
  // Initialize with sample pattern
  useEffect(() => {
    const newGrid = initializeGrid();
    // Add sample RIPPLES pattern
    const pattern = [
      { x: 2, y: 2, char: 'E' },
      { x: 3, y: 2, char: 'a' },
      { x: 4, y: 2, char: '*' },
      { x: 6, y: 2, char: 'G' },
      { x: 7, y: 2, char: 'R' },
      { x: 2, y: 4, char: 'E' },
      { x: 3, y: 4, char: 's' },
      { x: 4, y: 4, char: '*' },
      { x: 6, y: 4, char: 'O' },
      { x: 7, y: 4, char: 'R' },
      { x: 2, y: 6, char: 'E' },
      { x: 3, y: 6, char: 'd' },
      { x: 4, y: 6, char: '*' },
      { x: 6, y: 6, char: 'S' },
      { x: 7, y: 6, char: 'R' },
      { x: 10, y: 2, char: 'W' },
      { x: 10, y: 4, char: 'W' },
      { x: 10, y: 6, char: 'W' }
    ];
    
    pattern.forEach(p => {
      if (newGrid[p.y] && newGrid[p.y][p.x]) {
        newGrid[p.y][p.x].char = p.char;
        newGrid[p.y][p.x].operator = RIPPLES_OPERATORS[p.char] || null;
      }
    });
    
    setGrid(newGrid);
  }, []);
  
  // Generate worldtext
  const generateWorldtext = useCallback((entityType, vectorType) => {
    const grammar = WORLDTEXT_GRAMMAR[entityType];
    if (!grammar) return '';
    
    const options = grammar[vectorType];
    if (!options) return '';
    
    const text = options[Math.floor(Math.random() * options.length)];
    return text;
  }, []);
  
  // Process frame (ORCA-style)
  const processFrame = useCallback(() => {
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row => row.map(cell => ({ ...cell, banging: false })));
      const newEntities = [];
      
      // Scan for operators
      for (let y = 0; y < GRID_ROWS; y++) {
        for (let x = 0; x < GRID_COLS; x++) {
          const cell = newGrid[y][x];
          if (!cell.operator) continue;
          
          switch (cell.char) {
            case '*':
              // Bang neighbors
              const neighbors = [
                [x-1, y], [x+1, y], [x, y-1], [x, y+1]
              ];
              neighbors.forEach(([nx, ny]) => {
                if (newGrid[ny]?.[nx]) {
                  newGrid[ny][nx].banging = true;
                }
              });
              break;
              
            case 'E':
              // Spawn entity
              const entityChar = newGrid[y]?.[x+1]?.char;
              if (entityChar && ENTITY_TYPES[entityChar]) {
                newEntities.push({
                  x, y,
                  type: entityChar,
                  ...ENTITY_TYPES[entityChar]
                });
              }
              break;
              
            case 'G':
            case 'O':
            case 'S':
              // Vector operators - trigger if banging
              if (cell.banging || tick % 24 === 0) {
                const vectorType = cell.char === 'G' ? 'goal' : cell.char === 'O' ? 'obstacle' : 'shift';
                
                // Find nearby entity
                const nearby = newEntities.find(e => 
                  Math.abs(e.x - x) <= 3 && Math.abs(e.y - y) <= 3
                );
                
                if (nearby) {
                  const text = generateWorldtext(nearby.name, vectorType);
                  setWorldtext(text);
                  
                  // Trigger audio
                  if (audioEnabled) {
                    const note = cell.char === 'G' ? 'C4' : cell.char === 'O' ? 'A3' : 'E4';
                    audio.playNote(0, 4, cell.char === 'G' ? 'C' : cell.char === 'O' ? 'A' : 'E', 64, '16n');
                  }
                  
                  // UDP output (Pilot/Gull compatible)
                  udp.send(`0${cell.char === 'G' ? '4C' : cell.char === 'O' ? '3A' : '4E'}`, 49161);
                }
                
                // Ripple effect
                newGrid[y][x].rippling = true;
                setTimeout(() => {
                  setGrid(g => {
                    const ng = [...g];
                    if (ng[y]?.[x]) ng[y][x].rippling = false;
                    return ng;
                  });
                }, 500);
              }
              break;
              
            case 'R':
              // Ripple propagation
              if (cell.banging) {
                for (let dy = -2; dy <= 2; dy++) {
                  for (let dx = -2; dx <= 2; dx++) {
                    const nx = x + dx, ny = y + dy;
                    if (newGrid[ny]?.[nx] && (dx !== 0 || dy !== 0)) {
                      newGrid[ny][nx].rippling = true;
                      setTimeout(() => {
                        setGrid(g => {
                          const ng = [...g];
                          if (ng[ny]?.[nx]) ng[ny][nx].rippling = false;
                          return ng;
                        });
                      }, 300 + (Math.abs(dx) + Math.abs(dy)) * 100);
                    }
                  }
                }
              }
              break;
          }
        }
      }
      
      setEntities(newEntities);
      return newGrid;
    });
    
    setTick(t => t + 1);
  }, [tick, generateWorldtext, audioEnabled]);
  
  // Play loop
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(processFrame, 60000 / bpm / 4);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, bpm, processFrame]);
  
  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = async (e) => {
      // Audio init on first interaction
      if (!audioEnabled && e.key.length === 1) {
        await audio.init();
        setAudioEnabled(true);
      }
      
      if (e.key === 'ArrowUp') {
        setCursor(c => ({ ...c, y: Math.max(0, c.y - 1) }));
      } else if (e.key === 'ArrowDown') {
        setCursor(c => ({ ...c, y: Math.min(GRID_ROWS - 1, c.y + 1) }));
      } else if (e.key === 'ArrowLeft') {
        setCursor(c => ({ ...c, x: Math.max(0, c.x - 1) }));
      } else if (e.key === 'ArrowRight') {
        setCursor(c => ({ ...c, x: Math.min(GRID_COLS - 1, c.x + 1) }));
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(p => !p);
      } else if (e.key === 'Enter') {
        // Execute command
        if (command.startsWith('bpm:')) {
          const newBpm = parseInt(command.slice(4));
          if (!isNaN(newBpm)) setBpm(newBpm);
        }
        setCommand('');
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        // Type character into grid
        setGrid(g => {
          const ng = [...g];
          ng[cursor.y][cursor.x] = {
            ...ng[cursor.y][cursor.x],
            char: e.key.toUpperCase(),
            operator: RIPPLES_OPERATORS[e.key.toUpperCase()] || null
          };
          return ng;
        });
        // Move cursor right
        setCursor(c => ({ ...c, x: Math.min(GRID_COLS - 1, c.x + 1) }));
      } else if (e.key === 'Backspace') {
        setGrid(g => {
          const ng = [...g];
          ng[cursor.y][cursor.x] = {
            ...ng[cursor.y][cursor.x],
            char: '.',
            operator: null
          };
          return ng;
        });
        setCursor(c => ({ ...c, x: Math.max(0, c.x - 1) }));
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cursor, command, audioEnabled]);
  
  // Click to place cursor
  const handleCellClick = (x, y) => {
    setCursor({ x, y });
    gridRef.current?.focus();
  };
  
  return (
    <div className="ripples-orca">
      <div className="crt-overlay" />
      
      {/* Header */}
      <header className="orca-header">
        <div className="header-left">
          <div className="logo">RIPPLES // ORCA</div>
          <div className="status-indicator">
            <div className={`status-dot ${isPlaying ? '' : 'inactive'}`} />
            <span>{isPlaying ? 'PLAYING' : 'STOPPED'}</span>
          </div>
        </div>
        <div className="header-right">
          <div className="metric">
            <span>BPM</span>
            <span className="metric-value">{bpm}</span>
          </div>
          <div className="metric">
            <span>FRAME</span>
            <span className="metric-value">{tick}</span>
          </div>
          <div className="metric">
            <span>ENTITIES</span>
            <span className="metric-value">{entities.length}</span>
          </div>
        </div>
      </header>
      
      {/* Grid */}
      <div className="orca-grid-container" ref={gridRef} tabIndex={0}>
        <div className="orca-grid">
          {grid.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className={`grid-cell ${
                  cursor.x === x && cursor.y === y ? 'cursor' : ''
                } ${cell.operator ? 'operator' : ''} ${
                  cell.char === 'G' ? 'goal' :
                  cell.char === 'O' ? 'obstacle' :
                  cell.char === 'S' ? 'shift' :
                  cell.char === 'R' ? 'ripple' : ''
                } ${cell.banging ? 'bang' : ''} ${cell.rippling ? 'rippling' : ''}`}
                onClick={() => handleCellClick(x, y)}
              >
                {cell.char}
              </div>
            ))
          )}
        </div>
        
        {/* Operator Legend */}
        <div className="operator-legend">
          <div className="legend-title">RIPPLES OPERATORS</div>
          <div className="legend-item">
            <span className="legend-op" style={{ color: '#ffd700' }}>G</span>
            <span>GOAL vector</span>
          </div>
          <div className="legend-item">
            <span className="legend-op" style={{ color: '#ff3333' }}>O</span>
            <span>OBSTACLE vector</span>
          </div>
          <div className="legend-item">
            <span className="legend-op" style={{ color: '#00ffff' }}>S</span>
            <span>SHIFT vector</span>
          </div>
          <div className="legend-item">
            <span className="legend-op" style={{ color: '#ff00ff' }}>R</span>
            <span>RIPPLE propagation</span>
          </div>
          <div className="legend-item">
            <span className="legend-op">E</span>
            <span>Spawn entity</span>
          </div>
          <div className="legend-item">
            <span className="legend-op">W</span>
            <span>Worldtext output</span>
          </div>
          <div className="legend-item">
            <span className="legend-op">*</span>
            <span>Bang</span>
          </div>
        </div>
      </div>
      
      {/* Bottom Panel */}
      <footer className="orca-bottom">
        {/* Worldtext Output */}
        <div className="worldtext-output">
          <div className="output-header">
            <span className="output-label">WORLDTEXT BUFFER</span>
            <span className="output-tick">tick {tick}</span>
          </div>
          <div 
            className="worldtext-content"
            dangerouslySetInnerHTML={{ 
              __html: worldtext || 'Place E (entity) + G/O/S (vector) operators to generate worldtext...' 
            }}
          />
        </div>
        
        {/* Network Status */}
        <div className="network-panel">
          <div className="network-header">NETWORK I/O</div>
          <div className="port-status">
            <div className={`port-dot ${audioEnabled ? '' : 'inactive'}`} />
            <span>UDP In :{udp.ports.input}</span>
          </div>
          <div className="port-status">
            <div className={`port-dot ${audioEnabled ? '' : 'inactive'}`} />
            <span>UDP Out :{udp.ports.output}</span>
          </div>
          <div className="port-status">
            <div className={`port-dot ${audioEnabled ? '' : 'inactive'}`} />
            <span>OSC :{udp.ports.osc}</span>
          </div>
          <div className="port-status">
            <div className={`port-dot ${audioEnabled ? '' : 'inactive'}`} />
            <span>Pilot/Gull Compatible</span>
          </div>
        </div>
      </footer>
      
      {/* Command Input */}
      <div className="command-input">
        <span className="command-prompt">&gt;</span>
        <input
          type="text"
          className="command-field"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="type command (bpm:140, play, stop)..."
        />
      </div>
    </div>
  );
};

// Render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<RipplesOrca />);
