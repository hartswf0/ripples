// ============================================================
// RIPPLES ENGINE: The Brain
// Ecological Simulation Core
// ============================================================

export const GRID_COLS = 56;
export const GRID_ROWS = 36;

// Entity Types with Umwelt characteristics
export const ENTITY_TYPES = {
  // Animate
  'a': { 
    name: 'ant', 
    type: 'animate', 
    sensory: 'chemical',
    voice: { waveform: 'fm', freq: 8000, jitter: 0.8 },
    states: ['foraging', 'blocked', 'carrying', 'dormant']
  },
  'm': { 
    name: 'mold', 
    type: 'animate', 
    sensory: 'chemical',
    voice: { waveform: 'am', freq: 200, drift: 0.3 },
    states: ['sporing', 'growing', 'dormant', 'decaying']
  },
  'o': { 
    name: 'owl', 
    type: 'animate', 
    sensory: 'auditory',
    voice: { waveform: 'saw', freq: 300, resonance: 0.9 },
    states: ['hunting', 'roosting', 'calling', 'silent']
  },
  
  // Inanimate
  'd': { 
    name: 'dust', 
    type: 'inanimate', 
    sensory: 'thermal',
    voice: { waveform: 'noise', freq: 100, filter: 'low' },
    states: ['suspended', 'settling', 'stirred', 'accumulated']
  },
  'g': { 
    name: 'glass', 
    type: 'inanimate', 
    sensory: 'vibration',
    voice: { waveform: 'sine', freq: 2000, resonance: 0.99 },
    states: ['empty', 'filled', 'resonating', 'cracked']
  },
  't': { 
    name: 'stone', 
    type: 'inanimate', 
    sensory: 'thermal',
    voice: { waveform: 'square', freq: 80, harmonics: 0.3 },
    states: ['stable', 'shifting', 'weathering', 'fractured']
  },
  
  // Abstract
  's': { 
    name: 'shadow', 
    type: 'abstract', 
    sensory: 'visual',
    voice: { waveform: 'sub', freq: 40, depth: 0.8 },
    states: ['elongating', 'contracting', 'merging', 'dissolving']
  },
  'l': { 
    name: 'light', 
    type: 'abstract', 
    sensory: 'thermal',
    voice: { waveform: 'sine', freq: 400, brightness: 0.9 },
    states: ['dawning', 'zenith', 'waning', 'absent']
  },
  'h': { 
    name: 'heat', 
    type: 'abstract', 
    sensory: 'thermal',
    voice: { waveform: 'triangle', freq: 150, warmth: 0.7 },
    states: ['radiating', 'conducting', 'dissipating', 'concentrated']
  }
};

// Vector Types
export const VECTORS = {
  'G': { name: 'GOAL', color: '#ffd700', sonic: 'ascending', intensity: 1.0 },
  'O': { name: 'OBSTACLE', color: '#ff3333', sonic: 'dissonant', intensity: 0.8 },
  'S': { name: 'SHIFT', color: '#00ffff', sonic: 'morphing', intensity: 0.6 }
};

// Initialize grid
export const initializeGrid = () => {
  const grid = [];
  for (let y = 0; y < GRID_ROWS; y++) {
    const row = [];
    for (let x = 0; x < GRID_COLS; x++) {
      row.push({
        x, y,
        char: '.',
        operator: null,
        entity: null,
        value: 0,
        rippling: false,
        banging: false,
        frame: 0
      });
    }
    grid.push(row);
  }
  return grid;
};

// Entity class
export class Entity {
  constructor(type, x, y) {
    const template = ENTITY_TYPES[type] || ENTITY_TYPES['a'];
    this.id = Math.random().toString(36).substr(2, 9);
    this.type = type;
    this.name = template.name;
    this.category = template.type;
    this.sensory = template.sensory;
    this.voice = template.voice;
    this.x = x;
    this.y = y;
    this.state = template.states[0];
    this.stateIndex = 0;
    this.states = template.states;
    this.health = 100;
    this.energy = 50;
    this.vectorHistory = [];
    this.tick = 0;
  }
  
  applyVector(vectorType, intensity = 1.0) {
    this.vectorHistory.push({ vector: vectorType, tick: this.tick, intensity });
    
    // State transitions based on vector
    switch (vectorType) {
      case 'G': // GOAL - move toward next state
        this.stateIndex = (this.stateIndex + 1) % this.states.length;
        this.energy = Math.min(100, this.energy + 20 * intensity);
        break;
      case 'O': // OBSTACLE - revert or damage
        this.stateIndex = Math.max(0, this.stateIndex - 1);
        this.health = Math.max(0, this.health - 15 * intensity);
        this.energy = Math.max(0, this.energy - 10 * intensity);
        break;
      case 'S': // SHIFT - random state change
        this.stateIndex = Math.floor(Math.random() * this.states.length);
        this.energy = this.energy * (0.8 + Math.random() * 0.4);
        break;
    }
    
    this.state = this.states[this.stateIndex];
    this.tick++;
    
    return {
      entity: this,
      previousState: this.states[(this.stateIndex - 1 + this.states.length) % this.states.length],
      newState: this.state,
      vector: vectorType
    };
  }
  
  getUmwelt() {
    // Return sensory perception based on entity type
    const perceptions = {
      chemical: ['pheromone gradient', 'sucrose concentration', 'moisture level'],
      thermal: ['temperature differential', 'heat flux', 'thermal inertia'],
      visual: ['light intensity', 'shadow depth', 'contrast edge'],
      vibration: ['resonant frequency', 'amplitude', 'harmonic content'],
      auditory: ['sound pressure', 'frequency spectrum', 'temporal pattern']
    };
    
    return perceptions[this.sensory] || perceptions['thermal'];
  }
}

// Simulation class
export class Simulation {
  constructor() {
    this.grid = initializeGrid();
    this.entities = new Map();
    this.tick = 0;
    this.bpm = 120;
    this.timeOfDay = 0; // 0-9 circadian cycle
    this.eventLog = [];
    this.rippleQueue = [];
  }
  
  spawnEntity(type, x, y) {
    const entity = new Entity(type, x, y);
    this.entities.set(entity.id, entity);
    
    // Update grid
    if (this.grid[y]?.[x]) {
      this.grid[y][x].entity = entity;
    }
    
    this.logEvent('spawn', { entity: entity.name, x, y });
    return entity;
  }
  
  removeEntity(id) {
    const entity = this.entities.get(id);
    if (entity) {
      if (this.grid[entity.y]?.[entity.x]) {
        this.grid[entity.y][entity.x].entity = null;
      }
      this.entities.delete(id);
      this.logEvent('despawn', { entity: entity.name });
    }
  }
  
  applyVector(x, y, vectorType) {
    const cell = this.grid[y]?.[x];
    if (!cell) return null;
    
    // Find nearest entity
    let targetEntity = null;
    let minDist = Infinity;
    
    this.entities.forEach(entity => {
      const dist = Math.abs(entity.x - x) + Math.abs(entity.y - y);
      if (dist < minDist && dist <= 3) {
        minDist = dist;
        targetEntity = entity;
      }
    });
    
    if (targetEntity) {
      const result = targetEntity.applyVector(vectorType);
      this.logEvent('vector', {
        vector: vectorType,
        entity: targetEntity.name,
        state: result.newState
      });
      
      // Queue ripple
      this.rippleQueue.push({
        x, y,
        vector: vectorType,
        radius: 0,
        maxRadius: 5
      });
      
      return result;
    }
    
    return null;
  }
  
  updateCircadian() {
    // Time of day cycles 0-9 based on tick
    this.timeOfDay = Math.floor((this.tick % 240) / 24); // 10 "hours"
    return this.timeOfDay;
  }
  
  updateRipples() {
    // Process ripple queue
    this.rippleQueue = this.rippleQueue.filter(ripple => {
      ripple.radius += 0.5;
      
      // Update grid cells in ripple radius
      for (let dy = -Math.ceil(ripple.radius); dy <= Math.ceil(ripple.radius); dy++) {
        for (let dx = -Math.ceil(ripple.radius); dx <= Math.ceil(ripple.radius); dx++) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (Math.abs(dist - ripple.radius) < 0.5) {
            const nx = ripple.x + dx;
            const ny = ripple.y + dy;
            if (this.grid[ny]?.[nx]) {
              this.grid[ny][nx].rippling = true;
              setTimeout(() => {
                if (this.grid[ny]?.[nx]) {
                  this.grid[ny][nx].rippling = false;
                }
              }, 200);
            }
          }
        }
      }
      
      return ripple.radius < ripple.maxRadius;
    });
  }
  
  tick() {
    this.tick++;
    this.updateCircadian();
    this.updateRipples();
    
    // Update all entities
    this.entities.forEach(entity => {
      entity.tick++;
      // Passive energy decay
      entity.energy = Math.max(0, entity.energy - 0.1);
    });
    
    return {
      tick: this.tick,
      timeOfDay: this.timeOfDay,
      entityCount: this.entities.size,
      ripples: this.rippleQueue.length
    };
  }
  
  logEvent(type, data) {
    this.eventLog.push({
      tick: this.tick,
      type,
      data,
      timestamp: Date.now()
    });
    
    // Keep last 1000 events
    if (this.eventLog.length > 1000) {
      this.eventLog.shift();
    }
  }
  
  getState() {
    return {
      grid: this.grid,
      entities: Array.from(this.entities.values()),
      tick: this.tick,
      timeOfDay: this.timeOfDay,
      bpm: this.bpm,
      eventLog: this.eventLog.slice(-100)
    };
  }
}

export default Simulation;
