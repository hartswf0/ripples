// ============================================================
// RIPPLES LATENT LIBRARY
// Database of poetic descriptions - the DNA of Worldtext
// ============================================================

// Tracery-style grammar for generative text
export const GRAMMAR = {
  // Entity-specific expansions
  ant: {
    movement_verb: ['navigates', 'traverses', 'scales', 'crosses', 'probes'],
    surface: ['ceramic plain', 'glass horizon', 'wooden ridge', 'tile grid', 'porcelain cliff'],
    sense_verb: ['sensing', 'probing', 'scanning', 'detecting', 'reading'],
    resource: ['sucrose gradients', 'pheromone trails', 'moisture differentials', 'protein traces'],
    gradient: ['sugar', 'protein', 'water vapor', 'butyric acid'],
    material: ['porcelain', 'ceramic', 'enamel', 'glaze'],
    state: ['torpor', 'stasis', 'suspended animation', 'metabolic pause'],
    uncertainty: ['perhaps', 'as if', 'seemingly', 'it registers as', 'the gradient suggests']
  },
  
  shadow: {
    movement_verb: ['stretches', 'bleeds', 'creeps', 'consumes', 'flees'],
    surface: ['rough concrete', 'smooth tile', 'splintered wood', 'porcelain plane'],
    goal: ['darkness', 'union with the wall', 'escape from light', 'the corner'],
    quality: ['diffuse', 'sharp', 'elongated', 'contracted', 'merged'],
    state: ['insubstantial', 'material', 'dissolving', 'coalescing'],
    uncertainty: ['perhaps', 'as if', 'it appears to', 'the absence suggests']
  },
  
  dust: {
    movement_verb: ['drifts', 'settles', 'stirs', 'suspends', 'accumulates'],
    current: ['thermal updraft', 'air current', 'convection cell', 'static field'],
    destination: ['the shelf', 'the window ledge', 'the corner', 'the floor'],
    quality: ['suspended', 'settling', 'stirred', 'accumulated'],
    state: ['airborne', 'sedimentary', 'dispersed', 'concentrated'],
    uncertainty: ['perhaps', 'as if', 'it seems to', 'the motion implies']
  },
  
  light: {
    movement_verb: ['propagates', 'penetrates', 'reveals', 'illuminates', 'fades'],
    quality: ['golden', 'silver', 'diffuse', 'sharp', 'warm'],
    state: ['dawning', 'zenith', 'waning', 'absent', 'filtered'],
    interaction: ['reflects', 'refracts', 'absorbs', 'scatters', 'transmits'],
    uncertainty: ['perhaps', 'as if', 'the wavelength suggests', 'it appears']
  },
  
  glass: {
    quality: ['resonant', 'fragile', 'transparent', 'reflective', 'smooth'],
    state: ['empty', 'filled', 'resonating', 'cracked', 'condensing'],
    interaction: ['vibrates', 'rings', 'shimmers', 'reflects', 'contains'],
    sound: ['clear tone', 'dissonant hum', 'sharp ping', 'muffled thud'],
    uncertainty: ['perhaps', 'as if', 'the frequency suggests', 'it seems']
  },
  
  mold: {
    movement_verb: ['spreads', 'colonizes', 'consumes', 'decomposes', 'spores'],
    substrate: ['cellulose', 'organic matter', 'damp wood', 'paper'],
    state: ['sporing', 'growing', 'dormant', 'decaying', 'fruiting'],
    quality: ['fuzzy', 'powdery', 'slimy', 'dry', 'velvety'],
    uncertainty: ['perhaps', 'as if', 'the mycelium suggests', 'it appears']
  },
  
  stone: {
    quality: ['cold', 'smooth', 'rough', 'ancient', 'stable'],
    state: ['stable', 'shifting', 'weathering', 'fractured', 'eroding'],
    interaction: ['remembers', 'endures', 'resists', 'yields', 'witnesses'],
    time: ['geologic time', 'millennia', 'epochs', 'eras'],
    uncertainty: ['perhaps', 'as if', 'the mineral suggests', 'it seems']
  },
  
  owl: {
    movement_verb: ['hunts', 'perches', 'watches', 'swoops', 'listens'],
    sense: ['auditory field', 'soundscape', 'frequency spectrum', 'temporal pattern'],
    state: ['hunting', 'roosting', 'calling', 'silent', 'scanning'],
    quality: ['silent', 'swift', 'keen', 'patient', 'predatory'],
    uncertainty: ['perhaps', 'as if', 'the echo suggests', 'it seems']
  },
  
  mycelium: {
    movement_verb: ['networks', 'connects', 'signals', 'exchanges', 'weaves'],
    substrate: ['forest floor', 'root system', 'decaying matter', 'soil web'],
    state: ['growing', 'signaling', 'fruiting', 'dormant', 'spreading'],
    quality: ['interconnected', 'invisible', 'vast', 'ancient', 'intelligent'],
    uncertainty: ['perhaps', 'as if', 'the network suggests', 'it seems']
  },
  
  heat: {
    movement_verb: ['radiates', 'conducts', 'dissipates', 'concentrates', 'flows'],
    quality: ['warm', 'intense', 'diffuse', 'concentrated', 'residual'],
    state: ['radiating', 'conducting', 'dissipating', 'concentrated', 'ambient'],
    interaction: ['warms', 'cooks', 'dries', 'accelerates', 'transforms'],
    uncertainty: ['perhaps', 'as if', 'the gradient suggests', 'it seems']
  }
};

// Vector-specific sentence templates
export const VECTOR_TEMPLATES = {
  G: [ // GOAL - movement toward
    "The {entity} {movement_verb} the {surface}, {sense_verb} {resource}.",
    "{uncertainty} the {entity} detects {resource} ahead.",
    "Chemotaxis pulls the {entity} toward {gradient} concentrations.",
    "The {entity} extends toward {goal}, seeking union.",
    "Current state: {state}. Vector: attraction."
  ],
  
  O: [ // OBSTACLE - encounter
    "The {entity} encounters {material}. {uncertainty} passage is blocked.",
    "Obstruction detected. The {entity} registers resistance.",
    "The {quality} surface cannot be traversed.",
    "{uncertainty} the {entity} must find another route.",
    "Current state: {state}. Vector: resistance."
  ],
  
  S: [ // SHIFT - change
    "The {entity} undergoes phase transition: {state}.",
    "{uncertainty} time itself thickens for the {entity}.",
    "Metabolism shifts. The {entity} enters {state}.",
    "The {entity} transforms, becoming {quality}.",
    "Current state: {state}. Vector: metamorphosis."
  ]
};

// Expand a template with entity grammar
export const expandTemplate = (template, entityName, vectorType) => {
  const entityGrammar = GRAMMAR[entityName] || GRAMMAR['ant'];
  
  let result = template;
  
  // Replace {entity} with entity name
  result = result.replace(/{entity}/g, entityName);
  
  // Replace other placeholders with random selections
  result = result.replace(/{(\w+)}/g, (match, key) => {
    const options = entityGrammar[key];
    if (options && options.length > 0) {
      return options[Math.floor(Math.random() * options.length)];
    }
    return match;
  });
  
  return result;
};

// Generate worldtext for entity + vector
export const generateWorldtext = (entityName, vectorType, intensity = 0.5) => {
  const templates = VECTOR_TEMPLATES[vectorType] || VECTOR_TEMPLATES['G'];
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  // Expand template
  let text = expandTemplate(template, entityName, vectorType);
  
  // Add intensity-based modifiers
  if (intensity > 0.8) {
    text = text.replace(/\.$/, ' with urgency.');
  } else if (intensity < 0.3) {
    text = text.replace(/\.$/, ', slowly.');
  }
  
  return text;
};

// Generate multi-sentence description
export const generateDescription = (entity, vectorType, context = {}) => {
  const sentences = [];
  
  // Primary sentence
  sentences.push(generateWorldtext(entity.name, vectorType, context.intensity));
  
  // Secondary sentence based on state
  const stateDesc = `State: ${entity.state}. Energy: ${Math.round(entity.energy)}%.`;
  sentences.push(stateDesc);
  
  // Sensory detail
  const umwelt = entity.getUmwelt ? entity.getUmwelt() : ['unknown'];
  const sensory = `Perceives via ${umwelt[0]}.`;
  sentences.push(sensory);
  
  return sentences.join(' ');
};

// Latent Library class
export class LatentLibrary {
  constructor() {
    this.cache = new Map();
    this.history = [];
  }
  
  // Query for worldtext
  query(entityName, vectorType, options = {}) {
    const cacheKey = `${entityName}-${vectorType}-${options.intensity || 0.5}`;
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // Generate new text
    const text = generateWorldtext(entityName, vectorType, options.intensity);
    
    // Cache result
    this.cache.set(cacheKey, text);
    
    // Add to history
    this.history.push({
      timestamp: Date.now(),
      entity: entityName,
      vector: vectorType,
      text
    });
    
    // Limit history
    if (this.history.length > 1000) {
      this.history.shift();
    }
    
    return text;
  }
  
  // Get recent history
  getHistory(limit = 10) {
    return this.history.slice(-limit);
  }
  
  // Clear cache
  clearCache() {
    this.cache.clear();
  }
  
  // Get stats
  getStats() {
    return {
      cacheSize: this.cache.size,
      historySize: this.history.length,
      uniqueEntities: new Set(this.history.map(h => h.entity)).size
    };
  }
}

// Audit Log for session recording
export class AuditLog {
  constructor() {
    this.entries = [];
    this.startTime = Date.now();
  }
  
  log(type, data) {
    const entry = {
      tick: data.tick || 0,
      type,
      data,
      timestamp: Date.now()
    };
    
    this.entries.push(entry);
  }
  
  // Export session as JSON
  exportSession() {
    return {
      version: '0.9',
      startTime: this.startTime,
      endTime: Date.now(),
      duration: Date.now() - this.startTime,
      entryCount: this.entries.length,
      entries: this.entries
    };
  }
  
  // Get entries by type
  getByType(type) {
    return this.entries.filter(e => e.type === type);
  }
  
  // Get entries by tick range
  getByTickRange(start, end) {
    return this.entries.filter(e => e.tick >= start && e.tick <= end);
  }
  
  // Generate narrative summary
  generateSummary() {
    const vectors = this.getByType('vector');
    const spawns = this.getByType('spawn');
    
    return {
      totalEvents: this.entries.length,
      vectorApplications: vectors.length,
      entitiesSpawned: spawns.length,
      mostActiveEntity: this.getMostActiveEntity(),
      dominantVector: this.getDominantVector()
    };
  }
  
  getMostActiveEntity() {
    const counts = {};
    this.entries.forEach(e => {
      if (e.data.entity) {
        counts[e.data.entity] = (counts[e.data.entity] || 0) + 1;
      }
    });
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';
  }
  
  getDominantVector() {
    const counts = {};
    this.entries.forEach(e => {
      if (e.data.vector) {
        counts[e.data.vector] = (counts[e.data.vector] || 0) + 1;
      }
    });
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';
  }
}

export default LatentLibrary;
