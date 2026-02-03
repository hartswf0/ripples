// ============================================================
// RIPPLES ORCA: Ecological Operators
// A-Z mapping for Domestic Ecology scenario
// ============================================================

// Base36 table for ORCA compatibility
export const BASE36 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const charToValue = (char) => {
  if (!char) return 0;
  const index = BASE36.indexOf(char.toUpperCase());
  return index >= 0 ? index : 0;
};

export const valueToChar = (value) => {
  return BASE36[Math.floor(value) % 36] || '0';
};

// RIPPLES-ORCA Operators (Ecological Functions)
export const RIPPLES_OPERATORS = {
  // A: Add -> Attract (Chemical gradient addition)
  'A': {
    name: 'ATTRACT',
    type: 'chemical',
    description: 'Adds pheromone concentration to adjacent cells',
    inputs: 2,
    execute: (grid, x, y, inputs, simulation) => {
      const concentration = (inputs[0] || 0) + (inputs[1] || 0);
      // Affect nearby entities
      simulation.entities.forEach(entity => {
        const dist = Math.abs(entity.x - x) + Math.abs(entity.y - y);
        if (dist <= 2 && entity.sensory === 'chemical') {
          entity.energy = Math.min(100, entity.energy + concentration * 2);
        }
      });
      return valueToChar(concentration);
    }
  },
  
  // B: Block -> Barrier (Physical obstruction)
  'B': {
    name: 'BARRIER',
    type: 'physical',
    description: 'Creates obstacle that blocks entity movement',
    inputs: 2,
    execute: (grid, x, y, inputs) => {
      const strength = Math.abs((inputs[0] || 0) - (inputs[1] || 0));
      return valueToChar(strength);
    }
  },
  
  // C: Clock -> Circadian (Time of day cycle)
  'C': {
    name: 'CIRCADIAN',
    type: 'temporal',
    description: 'Outputs light level (0-9) based on simulation time',
    inputs: 2,
    execute: (grid, x, y, inputs, simulation) => {
      const lightLevel = simulation.timeOfDay;
      // Affect shadow entities
      simulation.entities.forEach(entity => {
        if (entity.name === 'shadow') {
          if (lightLevel > 5) {
            entity.state = 'contracting';
          } else {
            entity.state = 'elongating';
          }
        }
      });
      return valueToChar(lightLevel);
    }
  },
  
  // D: Delay -> Decay (Organic decomposition)
  'D': {
    name: 'DECAY',
    type: 'organic',
    description: 'Reduces health of adjacent organic entities',
    inputs: 2,
    execute: (grid, x, y, inputs, simulation) => {
      const rate = inputs[0] || 1;
      const threshold = inputs[1] || 24;
      
      if (simulation.tick % threshold === 0) {
        simulation.entities.forEach(entity => {
          const dist = Math.abs(entity.x - x) + Math.abs(entity.y - y);
          if (dist <= 1 && entity.category === 'animate') {
            entity.health = Math.max(0, entity.health - rate * 5);
            if (entity.name === 'mold') {
              entity.state = 'decaying';
            }
          }
        });
      }
      return valueToChar(rate);
    }
  },
  
  // E: East -> Entity (Spawn entity)
  'E': {
    name: 'ENTITY',
    type: 'spawn',
    description: 'Spawns entity of type at east position',
    inputs: 0,
    execute: (grid, x, y, inputs, simulation) => {
      const entityChar = grid[y]?.[x + 1]?.char;
      if (entityChar && 'adgstlhmoa'.includes(entityChar.toLowerCase())) {
        simulation.spawnEntity(entityChar.toLowerCase(), x + 1, y);
        return '*';
      }
      return '.';
    }
  },
  
  // F: If -> Forage (Conditional resource seeking)
  'F': {
    name: 'FORAGE',
    type: 'behavioral',
    description: 'Entity seeks resources if condition met',
    inputs: 2,
    execute: (grid, x, y, inputs, simulation) => {
      const hunger = inputs[0] || 0;
      const resource = inputs[1] || 0;
      
      if (hunger > resource) {
        // Trigger foraging behavior
        simulation.entities.forEach(entity => {
          const dist = Math.abs(entity.x - x) + Math.abs(entity.y - y);
          if (dist <= 2 && entity.name === 'ant') {
            entity.state = 'foraging';
          }
        });
        return '*';
      }
      return '.';
    }
  },
  
  // G: Generator -> Grow (Organic expansion)
  'G': {
    name: 'GROW',
    type: 'organic',
    description: 'Triggers growth/spawning in adjacent entities',
    inputs: 2,
    execute: (grid, x, y, inputs, simulation) => {
      const rate = inputs[0] || 1;
      const limit = inputs[1] || 9;
      
      simulation.entities.forEach(entity => {
        const dist = Math.abs(entity.x - x) + Math.abs(entity.y - y);
        if (dist <= 1 && entity.name === 'mold' && simulation.tick % 48 === 0) {
          entity.state = 'sporing';
          // Chance to spawn new mold
          if (Math.random() < rate / 36 && simulation.entities.size < limit) {
            const nx = x + Math.floor(Math.random() * 3) - 1;
            const ny = y + Math.floor(Math.random() * 3) - 1;
            simulation.spawnEntity('m', nx, ny);
          }
        }
      });
      return valueToChar(rate);
    }
  },
  
  // H: Halt -> Hibernate (Dormancy trigger)
  'H': {
    name: 'HIBERNATE',
    type: 'behavioral',
    description: 'Puts southward entity into dormant state',
    inputs: 0,
    execute: (grid, x, y, inputs, simulation) => {
      const target = grid[y + 1]?.[x];
      if (target?.entity) {
        target.entity.state = 'dormant';
        target.entity.energy = Math.max(0, target.entity.energy - 20);
      }
      return '.';
    }
  },
  
  // I: Increment -> Intensify (Amplify signal)
  'I': {
    name: 'INTENSIFY',
    type: 'signal',
    description: 'Amplifies southward value',
    inputs: 1,
    execute: (grid, x, y, inputs) => {
      const base = inputs[0] || 0;
      return valueToChar(Math.min(35, base + 1));
    }
  },
  
  // J: Jumper -> Jitter (Random movement)
  'J': {
    name: 'JITTER',
    type: 'movement',
    description: 'Causes random entity displacement',
    inputs: 1,
    execute: (grid, x, y, inputs, simulation) => {
      const intensity = inputs[0] || 0;
      simulation.entities.forEach(entity => {
        const dist = Math.abs(entity.x - x) + Math.abs(entity.y - y);
        if (dist <= 1 && entity.name === 'dust' && Math.random() < intensity / 36) {
          entity.state = 'stirred';
        }
      });
      return valueToChar(intensity);
    }
  },
  
  // K: Konkat -> Kin (Family/group bonding)
  'K': {
    name: 'KIN',
    type: 'social',
    description: 'Links adjacent entities of same type',
    inputs: 1,
    execute: (grid, x, y, inputs, simulation) => {
      const range = inputs[0] || 3;
      let kinCount = 0;
      
      simulation.entities.forEach(e1 => {
        simulation.entities.forEach(e2 => {
          if (e1.id !== e2.id && e1.type === e2.type) {
            const dist = Math.abs(e1.x - e2.x) + Math.abs(e1.y - e2.y);
            if (dist <= range) {
              kinCount++;
              e1.energy = Math.min(100, e1.energy + 1);
            }
          }
        });
      });
      
      return valueToChar(kinCount);
    }
  },
  
  // L: Less -> Light (Illumination level)
  'L': {
    name: 'LIGHT',
    type: 'environmental',
    description: 'Outputs minimum of inputs as light intensity',
    inputs: 2,
    execute: (grid, x, y, inputs, simulation) => {
      const intensity = Math.min(inputs[0] || 0, inputs[1] || 0);
      
      // Affect light-sensitive entities
      simulation.entities.forEach(entity => {
        const dist = Math.abs(entity.x - x) + Math.abs(entity.y - y);
        if (dist <= intensity && entity.name === 'shadow') {
          entity.state = intensity > 5 ? 'contracting' : 'elongating';
        }
      });
      
      return valueToChar(intensity);
    }
  },
  
  // M: Multiply -> Mycelium (Network growth)
  'M': {
    name: 'MYCELIUM',
    type: 'network',
    description: 'Creates fungal network connections',
    inputs: 2,
    execute: (grid, x, y, inputs, simulation) => {
      const spread = (inputs[0] || 1) * (inputs[1] || 1);
      
      simulation.entities.forEach(entity => {
        if (entity.name === 'mycelium') {
          entity.energy = Math.min(100, entity.energy + spread);
        }
      });
      
      return valueToChar(Math.min(35, spread));
    }
  },
  
  // N: North -> Navigate (Directional movement)
  'N': {
    name: 'NAVIGATE',
    type: 'movement',
    description: 'Moves entity northward on bang',
    inputs: 0,
    execute: (grid, x, y, inputs, simulation) => {
      const target = grid[y - 1]?.[x];
      if (target && !target.entity) {
        const entity = grid[y][x].entity;
        if (entity) {
          entity.y -= 1;
          grid[y][x].entity = null;
          grid[y - 1][x].entity = entity;
        }
      }
      return '.';
    }
  },
  
  // O: Read -> Observe (Sensory input)
  'O': {
    name: 'OBSERVE',
    type: 'sensory',
    description: 'Reads environmental data at offset',
    inputs: 2,
    execute: (grid, x, y, inputs, simulation) => {
      const ox = inputs[0] || 0;
      const oy = inputs[1] || 0;
      const target = grid[y + oy]?.[x + ox];
      
      if (target?.entity) {
        return valueToChar(target.entity.energy / 3);
      }
      return valueToChar(simulation.timeOfDay);
    }
  },
  
  // P: Push -> Percolate (Fluid diffusion)
  'P': {
    name: 'PERCOLATE',
    type: 'fluid',
    description: 'Diffuses value eastward like liquid',
    inputs: 2,
    execute: (grid, x, y, inputs) => {
      const pressure = inputs[0] || 0;
      const viscosity = inputs[1] || 1;
      return valueToChar(pressure / viscosity);
    }
  },
  
  // Q: Query -> Quorum (Group decision)
  'Q': {
    name: 'QUORUM',
    type: 'social',
    description: 'Counts entities in range for collective behavior',
    inputs: 2,
    execute: (grid, x, y, inputs, simulation) => {
      const range = inputs[0] || 3;
      const threshold = inputs[1] || 5;
      
      let count = 0;
      simulation.entities.forEach(entity => {
        const dist = Math.abs(entity.x - x) + Math.abs(entity.y - y);
        if (dist <= range) count++;
      });
      
      return count >= threshold ? '*' : '.';
    }
  },
  
  // R: Random -> Resonate (Vibration frequency)
  'R': {
    name: 'RESONATE',
    type: 'vibration',
    description: 'Outputs resonant frequency for glass/stone',
    inputs: 2,
    execute: (grid, x, y, inputs, simulation) => {
      const min = inputs[0] || 0;
      const max = inputs[1] || 35;
      const freq = min + Math.floor(Math.random() * (max - min));
      
      // Affect resonant entities
      simulation.entities.forEach(entity => {
        const dist = Math.abs(entity.x - x) + Math.abs(entity.y - y);
        if (dist <= 2 && entity.name === 'glass') {
          entity.state = freq > 20 ? 'resonating' : 'empty';
        }
      });
      
      return valueToChar(freq);
    }
  },
  
  // S: South -> Settle (Sedimentation)
  'S': {
    name: 'SETTLE',
    type: 'physical',
    description: 'Causes dust/particles to settle downward',
    inputs: 0,
    execute: (grid, x, y, inputs, simulation) => {
      simulation.entities.forEach(entity => {
        const dist = Math.abs(entity.x - x) + Math.abs(entity.y - y);
        if (dist <= 1 && entity.name === 'dust') {
          entity.state = 'settling';
        }
      });
      return '.';
    }
  },
  
  // T: Track -> Thermal (Heat distribution)
  'T': {
    name: 'THERMAL',
    type: 'thermal',
    description: 'Tracks heat flow through environment',
    inputs: 2,
    execute: (grid, x, y, inputs, simulation) => {
      const source = inputs[0] || 0;
      const conductivity = inputs[1] || 1;
      const heat = source * conductivity / 10;
      
      simulation.entities.forEach(entity => {
        const dist = Math.abs(entity.x - x) + Math.abs(entity.y - y);
        if (dist <= heat && entity.sensory === 'thermal') {
          entity.energy = Math.min(100, entity.energy + heat);
        }
      });
      
      return valueToChar(heat);
    }
  },
  
  // U: Uclid -> Unison (Synchronized rhythm)
  'U': {
    name: 'UNISON',
    type: 'rhythm',
    description: 'Euclidean rhythm for coordinated behavior',
    inputs: 2,
    execute: (grid, x, y, inputs, simulation) => {
      const step = inputs[0] || 1;
      const max = inputs[1] || 8;
      
      if (simulation.tick % max < step) {
        // Trigger synchronized behavior
        simulation.entities.forEach(entity => {
          const dist = Math.abs(entity.x - x) + Math.abs(entity.y - y);
          if (dist <= 3) {
            entity.energy = Math.min(100, entity.energy + 5);
          }
        });
        return '*';
      }
      return '.';
    }
  },
  
  // V: Variable -> Vital (Life force)
  'V': {
    name: 'VITAL',
    type: 'life',
    description: 'Reads/writes entity vitality',
    inputs: 2,
    execute: (grid, x, y, inputs, simulation) => {
      const read = inputs[0] || 0;
      const write = inputs[1];
      
      const entity = grid[y][x].entity;
      if (entity && write !== undefined) {
        entity.energy = (write / 35) * 100;
      }
      
      return valueToChar(entity ? entity.energy / 3 : read);
    }
  },
  
  // W: West -> Wind (Air current)
  'W': {
    name: 'WIND',
    type: 'environmental',
    description: 'Creates airflow affecting dust/light entities',
    inputs: 0,
    execute: (grid, x, y, inputs, simulation) => {
      simulation.entities.forEach(entity => {
        const dist = Math.abs(entity.x - x) + Math.abs(entity.y - y);
        if (dist <= 2 && (entity.name === 'dust' || entity.name === 'heat')) {
          entity.state = entity.name === 'dust' ? 'stirred' : 'dissipating';
        }
      });
      return '.';
    }
  },
  
  // X: Write -> Xerophyte (Drought adaptation)
  'X': {
    name: 'XEROPHYTE',
    type: 'adaptation',
    description: 'Entity adapts to dry conditions',
    inputs: 2,
    execute: (grid, x, y, inputs, simulation) => {
      const dryness = inputs[0] || 0;
      const adaptability = inputs[1] || 1;
      
      simulation.entities.forEach(entity => {
        const dist = Math.abs(entity.x - x) + Math.abs(entity.y - y);
        if (dist <= 1 && dryness > 5) {
          entity.energy = Math.max(0, entity.energy - dryness + adaptability);
        }
      });
      
      return valueToChar(dryness);
    }
  },
  
  // Y: Jymper -> Yield (Resource production)
  'Y': {
    name: 'YIELD',
    type: 'resource',
    description: 'Produces resources from entity activity',
    inputs: 1,
    execute: (grid, x, y, inputs, simulation) => {
      const efficiency = inputs[0] || 1;
      
      let yield_amount = 0;
      simulation.entities.forEach(entity => {
        const dist = Math.abs(entity.x - x) + Math.abs(entity.y - y);
        if (dist <= 2 && entity.state === 'foraging') {
          yield_amount += efficiency;
          entity.energy = Math.min(100, entity.energy + efficiency);
        }
      });
      
      return valueToChar(Math.min(35, yield_amount));
    }
  },
  
  // Z: Lerp -> Zenith (Peak state transition)
  'Z': {
    name: 'ZENITH',
    type: 'transition',
    description: 'Transitions entity to peak state',
    inputs: 2,
    execute: (grid, x, y, inputs, simulation) => {
      const rate = inputs[0] || 1;
      const target = inputs[1] || 35;
      
      simulation.entities.forEach(entity => {
        const dist = Math.abs(entity.x - x) + Math.abs(entity.y - y);
        if (dist <= 1) {
          const diff = (target / 35) * 100 - entity.energy;
          entity.energy += diff * (rate / 35);
        }
      });
      
      return valueToChar(rate);
    }
  },
  
  // *: Bang -> Vector Impact
  '*': {
    name: 'BANG',
    type: 'trigger',
    description: 'Triggers vector impact on neighbors',
    inputs: 0,
    execute: (grid, x, y, inputs, simulation) => {
      // Trigger all adjacent operators
      const neighbors = [
        [x-1, y], [x+1, y], [x, y-1], [x, y+1]
      ];
      
      neighbors.forEach(([nx, ny]) => {
        if (grid[ny]?.[nx]) {
          grid[ny][nx].banging = true;
        }
      });
      
      return '*';
    }
  },
  
  // .: Empty
  '.': {
    name: 'EMPTY',
    type: 'empty',
    description: 'Empty cell',
    inputs: 0,
    execute: () => '.'
  }
};

// Process a single cell
export const processCell = (grid, x, y, simulation) => {
  const cell = grid[y]?.[x];
  if (!cell || cell.char === '.') return;
  
  const operator = RIPPLES_OPERATORS[cell.char];
  if (!operator) return;
  
  // Gather inputs (south and east)
  const inputs = [];
  const south = grid[y + 1]?.[x];
  const east = grid[y]?.[x + 1];
  
  if (south) inputs.push(charToValue(south.char));
  if (east) inputs.push(charToValue(east.char));
  
  // Execute operator
  try {
    const result = operator.execute(grid, x, y, inputs, simulation);
    cell.value = charToValue(result);
    return result;
  } catch (e) {
    console.error(`Operator ${cell.char} failed:`, e);
    return '.';
  }
};

// Process entire grid (one frame)
export const processGrid = (grid, simulation) => {
  // Clear bang states
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x]) {
        grid[y][x].banging = false;
      }
    }
  }
  
  // Process operators (bottom to top, right to left for ORCA compatibility)
  for (let y = grid.length - 1; y >= 0; y--) {
    for (let x = grid[y].length - 1; x >= 0; x--) {
      processCell(grid, x, y, simulation);
    }
  }
};

export default RIPPLES_OPERATORS;
