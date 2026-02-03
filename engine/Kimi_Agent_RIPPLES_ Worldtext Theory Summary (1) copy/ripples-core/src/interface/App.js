// ============================================================
// RIPPLES INTERFACE: The View
// Pond-like, auditable, unified
// ============================================================

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Simulation, GRID_COLS, GRID_ROWS, initializeGrid, ENTITY_TYPES } from '../engine/simulation.js';
import { RIPPLES_OPERATORS, processGrid, charToValue, valueToChar } from '../orca/operators.js';
import { RipplesSynth } from '../pilot/synth.js';
import { RipplesSampler } from '../gull/sampler.js';
import { LatentLibrary, AuditLog, generateWorldtext } from '../engine/latent_library.js';

// ============================================================
// MAIN APP COMPONENT
// ============================================================

const RipplesCore = () => {
  // Core state
  const [grid, setGrid] = useState(initializeGrid());
  const [cursor, setCursor] = useState({ x: 2, y: 2 });
  const [tick, setTick] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [timeOfDay, setTimeOfDay] = useState(0);
  
  // Worldtext state
  const [worldtext, setWorldtext] = useState('');
  const [worldtextHistory, setWorldtextHistory] = useState([]);
  
  // Audio state
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [volume, setVolume] = useState(-12);
  
  // Audit state
  const [auditLog, setAuditLog] = useState([]);
  const [showAudit, setShowAudit] = useState(false);
  
  // Refs for engine instances
  const simulationRef = useRef(null);
  const synthRef = useRef(null);
  const samplerRef = useRef(null);
  const libraryRef = useRef(null);
  const logRef = useRef(null);
  const intervalRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Initialize engines
  useEffect(() => {
    simulationRef.current = new Simulation();
    synthRef.current = new RipplesSynth();
    samplerRef.current = new RipplesSampler();
    libraryRef.current = new LatentLibrary();
    logRef.current = new AuditLog();
    
    // Load initial pattern
    loadPattern('cupboard');
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (synthRef.current) synthRef.current.stopDrone();
    };
  }, []);
  
  // Load predefined pattern
  const loadPattern = (patternName) => {
    const newGrid = initializeGrid();
    
    const patterns = {
      cupboard: [
        { x: 2, y: 2, char: 'E' }, { x: 3, y: 2, char: 'a' }, { x: 4, y: 2, char: '*' },
        { x: 6, y: 2, char: 'C' }, { x: 7, y: 2, char: '5' },
        { x: 2, y: 4, char: 'E' }, { x: 3, y: 4, char: 's' }, { x: 4, y: 4, char: '*' },
        { x: 6, y: 4, char: 'L' }, { x: 7, y: 4, char: '3' },
        { x: 2, y: 6, char: 'E' }, { x: 3, y: 6, char: 'd' }, { x: 4, y: 6, char: '*' },
        { x: 6, y: 6, char: 'J' }, { x: 7, y: 6, char: '5' },
        { x: 10, y: 2, char: 'G' }, { x: 11, y: 2, char: '3' },
        { x: 10, y: 4, char: 'D' }, { x: 11, y: 4, char: '2' },
        { x: 10, y: 6, char: 'R' }, { x: 11, y: 6, char: '8' }
      ],
      forest: [
        { x: 2, y: 2, char: 'E' }, { x: 3, y: 2, char: 'o' }, { x: 4, y: 2, char: '*' },
        { x: 6, y: 2, char: 'U' }, { x: 7, y: 2, char: '3' }, { x: 8, y: 2, char: '8' },
        { x: 2, y: 4, char: 'E' }, { x: 3, y: 4, char: 'f' }, { x: 4, y: 4, char: '*' },
        { x: 6, y: 4, char: 'M' }, { x: 7, y: 4, char: '2' },
        { x: 2, y: 6, char: 'E' }, { x: 3, y: 6, char: 't' }, { x: 4, y: 6, char: '*' },
        { x: 6, y: 6, char: 'T' }, { x: 7, y: 6, char: '5' }
      ]
    };
    
    const pattern = patterns[patternName] || patterns['cupboard'];
    
    pattern.forEach(p => {
      if (newGrid[p.y]?.[p.x]) {
        newGrid[p.y][p.x].char = p.char;
        newGrid[p.y][p.x].operator = RIPPLES_OPERATORS[p.char] || null;
      }
    });
    
    setGrid(newGrid);
    
    // Spawn entities from pattern
    if (simulationRef.current) {
      pattern.forEach(p => {
        if (p.char === 'E' && newGrid[p.y]?.[p.x + 1]) {
          const entityChar = newGrid[p.y][p.x + 1].char;
          if (ENTITY_TYPES[entityChar]) {
            simulationRef.current.spawnEntity(entityChar, p.x + 1, p.y);
          }
        }
      });
    }
  };
  
  // Initialize audio
  const initAudio = async () => {
    if (!synthRef.current || !samplerRef.current) return;
    
    await synthRef.current.init();
    await samplerRef.current.init();
    
    synthRef.current.startDrone();
    samplerRef.current.startAmbient('cupboard');
    
    setAudioEnabled(true);
  };
  
  // Game loop
  const tickFrame = useCallback(() => {
    if (!simulationRef.current) return;
    
    // Process ORCA grid
    processGrid(grid, simulationRef.current);
    
    // Update simulation
    const state = simulationRef.current.tick();
    setTick(state.tick);
    setTimeOfDay(state.timeOfDay);
    
    // Update grid visual state
    setGrid(prev => {
      const newGrid = [...prev];
      simulationRef.current.entities.forEach(entity => {
        if (newGrid[entity.y]?.[entity.x]) {
          newGrid[entity.y][entity.x].entity = entity;
        }
      });
      return newGrid;
    });
    
    // Check for vector triggers and generate worldtext
    for (let y = 0; y < GRID_ROWS; y++) {
      for (let x = 0; x < GRID_COLS; x++) {
        const cell = grid[y]?.[x];
        if (cell && (cell.char === 'G' || cell.char === 'O' || cell.char === 'S') && cell.banging) {
          // Find nearest entity
          let nearest = null;
          let minDist = Infinity;
          
          simulationRef.current.entities.forEach(entity => {
            const dist = Math.abs(entity.x - x) + Math.abs(entity.y - y);
            if (dist < minDist && dist <= 3) {
              minDist = dist;
              nearest = entity;
            }
          });
          
          if (nearest) {
            const vectorType = cell.char;
            const intensity = nearest.energy / 100;
            
            // Generate worldtext
            const text = libraryRef.current.query(
              nearest.name,
              vectorType,
              { intensity }
            );
            
            setWorldtext(text);
            setWorldtextHistory(prev => [...prev.slice(-9), text]);
            
            // Log event
            logRef.current.log('vector', {
              tick: state.tick,
              entity: nearest.name,
              vector: vectorType,
              text
            });
            setAuditLog(logRef.current.entries.slice(-20));
            
            // Trigger audio
            if (audioEnabled && synthRef.current) {
              synthRef.current.playVector(vectorType, intensity);
              synthRef.current.playEntity(nearest, intensity);
            }
            
            // Trigger sampler
            if (audioEnabled && samplerRef.current) {
              samplerRef.current.trigger(nearest, vectorType);
            }
            
            // Apply vector to entity
            simulationRef.current.applyVector(x, y, vectorType);
          }
        }
      }
    }
  }, [grid, audioEnabled]);
  
  // Start/stop loop
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(tickFrame, 60000 / bpm / 4);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, bpm, tickFrame]);
  
  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = async (e) => {
      // Init audio on first interaction
      if (!audioEnabled && e.key.length === 1) {
        await initAudio();
      }
      
      // Navigation
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
        // Manual bang at cursor
        setGrid(g => {
          const ng = [...g];
          if (ng[cursor.y]?.[cursor.x]) {
            ng[cursor.y][cursor.x].banging = true;
          }
          return ng;
        });
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        // Type character
        setGrid(g => {
          const ng = [...g];
          ng[cursor.y][cursor.x] = {
            ...ng[cursor.y][cursor.x],
            char: e.key.toUpperCase(),
            operator: RIPPLES_OPERATORS[e.key.toUpperCase()] || null
          };
          return ng;
        });
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
  }, [cursor, audioEnabled]);
  
  // Render cell
  const renderCell = (cell, x, y) => {
    const isCursor = cursor.x === x && cursor.y === y;
    const isOperator = cell.operator && cell.char !== '.';
    const isEntity = cell.entity !== null;
    
    let className = 'grid-cell';
    if (isCursor) className += ' cursor';
    if (isOperator) {
      className += ' operator';
      if (cell.char === 'G') className += ' goal';
      if (cell.char === 'O') className += ' obstacle';
      if (cell.char === 'S') className += ' shift';
      if (cell.char === 'R') className += ' ripple';
    }
    if (cell.banging) className += ' banging';
    if (cell.rippling) className += ' rippling';
    if (isEntity) className += ' has-entity';
    
    return (
      <div
        key={`${x}-${y}`}
        className={className}
        onClick={() => setCursor({ x, y })}
      >
        {cell.char}
      </div>
    );
  };
  
  // Export session
  const exportSession = () => {
    const session = logRef.current?.exportSession();
    if (session) {
      const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ripples_session_${Date.now()}.json`;
      a.click();
    }
  };
  
  return (
    <div className="ripples-core">
      {/* CRT Overlay */}
      <div className="crt-overlay" />
      
      {/* Header */}
      <header className="core-header">
        <div className="header-left">
          <div className="logo">RIPPLES // CORE</div>
          <div className={`play-indicator ${isPlaying ? 'playing' : ''}`}>
            <div className="play-dot" />
            <span>{isPlaying ? 'PLAYING' : 'STOPPED'}</span>
          </div>
        </div>
        
        <div className="header-center">
          <div className="time-display">
            <span className="time-label">CIRCADIAN</span>
            <span className="time-value">{timeOfDay}/9</span>
          </div>
        </div>
        
        <div className="header-right">
          <div className="stat">
            <span className="stat-label">BPM</span>
            <span className="stat-value">{bpm}</span>
          </div>
          <div className="stat">
            <span className="stat-label">TICK</span>
            <span className="stat-value">{tick}</span>
          </div>
          <div className="stat">
            <span className="stat-label">ENTITIES</span>
            <span className="stat-value">{simulationRef.current?.entities.size || 0}</span>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="core-main">
        {/* Grid */}
        <div className="grid-container">
          <div className="orca-grid">
            {grid.map((row, y) =>
              row.map((cell, x) => renderCell(cell, x, y))
            )}
          </div>
        </div>
        
        {/* Sidebar */}
        <aside className="core-sidebar">
          {/* Worldtext Output */}
          <div className="worldtext-panel">
            <div className="panel-header">
              <span>WORLDTEXT</span>
              <span className="tick-ref">tick {tick}</span>
            </div>
            <div className="worldtext-display">
              {worldtext || 'Place operators and press SPACE to generate...'}
            </div>
            <div className="worldtext-history">
              {worldtextHistory.map((text, i) => (
                <div key={i} className="history-item">{text}</div>
              ))}
            </div>
          </div>
          
          {/* Entity List */}
          <div className="entity-panel">
            <div className="panel-header">ENTITIES</div>
            <div className="entity-list">
              {simulationRef.current && Array.from(simulationRef.current.entities.values()).map(entity => (
                <div key={entity.id} className="entity-item">
                  <span className="entity-name">{entity.name}</span>
                  <span className="entity-state">{entity.state}</span>
                  <span className="entity-energy">{Math.round(entity.energy)}%</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Controls */}
          <div className="control-panel">
            <div className="panel-header">CONTROLS</div>
            <div className="control-buttons">
              <button onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? '⏹ STOP' : '▶ PLAY'}
              </button>
              <button onClick={() => loadPattern('cupboard')}>CUPBOARD</button>
              <button onClick={() => loadPattern('forest')}>FOREST</button>
              <button onClick={exportSession}>EXPORT</button>
            </div>
            <div className="bpm-control">
              <label>BPM: {bpm}</label>
              <input
                type="range"
                min="60"
                max="240"
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value))}
              />
            </div>
          </div>
        </aside>
      </div>
      
      {/* Audit Log */}
      {showAudit && (
        <div className="audit-panel">
          <div className="audit-header">
            <span>AUDIT LOG</span>
            <button onClick={() => setShowAudit(false)}>×</button>
          </div>
          <div className="audit-entries">
            {auditLog.map((entry, i) => (
              <div key={i} className="audit-entry">
                <span className="audit-tick">{entry.tick}</span>
                <span className="audit-type">{entry.type}</span>
                <span className="audit-data">{JSON.stringify(entry.data)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="core-footer">
        <div className="footer-left">
          <span className="key-hint">SPACE: play/pause</span>
          <span className="key-hint">ARROWS: move</span>
          <span className="key-hint">TYPE: place operator</span>
          <span className="key-hint">ENTER: bang</span>
        </div>
        <div className="footer-right">
          <button onClick={() => setShowAudit(!showAudit)}>
            {showAudit ? 'HIDE AUDIT' : 'SHOW AUDIT'}
          </button>
        </div>
      </footer>
    </div>
  );
};

// Render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<RipplesCore />);
