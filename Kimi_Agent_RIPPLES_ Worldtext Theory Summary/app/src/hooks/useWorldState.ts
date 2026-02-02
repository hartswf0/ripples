// RIPPLES: WorldState Hook - Core simulation engine
// Manages the state of the world, ripples, and entity interactions

import { useState, useCallback, useRef, useEffect } from 'react';
import type { 
  Entity, 
  VectorType, 
  AuditEntry, 
  WorldtextCell, 
  Ripple,
  CrossScenarioRipple,
  EmergentPattern,
  PerformanceState,
  EntityMemory
} from '@/types';
import { scenarios, getScenarioById } from '@/data/scenarios';
import { getEntityDescription, getBaselineDescriptions } from '@/data/latentLibrary';

// Generate initial worldtext grid
function generateWorldtext(scenarioId: string, selectedEntityId?: string): WorldtextCell[] {
  const baseline = getBaselineDescriptions(scenarioId);
  const scenario = getScenarioById(scenarioId);
  if (!scenario) return [];

  const cells: WorldtextCell[] = [];
  const words = baseline.join(' ').split(/\s+/);
  
  // Create a grid of words
  let x = 0;
  let y = 0;
  const maxX = 60;
  
  words.forEach((word, index) => {
    if (x + word.length > maxX) {
      x = 0;
      y++;
    }
    
    // Check if this word relates to an entity
    let type: WorldtextCell['type'] = 'baseline';
    let entityId: string | undefined;
    let isActive = false;
    
    for (const entity of scenario.entities) {
      const lowerWord = word.toLowerCase();
      const entityWords = entity.name.toLowerCase().split(' ');
      const descWords = entity.description.toLowerCase().split(' ');
      
      if (entityWords.some(ew => lowerWord.includes(ew)) || 
          descWords.some(dw => lowerWord.includes(dw) && dw.length > 4)) {
        type = 'entity';
        entityId = entity.id;
        isActive = entityId === selectedEntityId;
        break;
      }
    }
    
    cells.push({
      id: `cell-${index}`,
      text: word,
      x,
      y,
      type,
      entityId,
      isActive,
      opacity: isActive ? 1 : 0.6,
      timestamp: Date.now()
    });
    
    x += word.length + 1;
  });
  
  return cells;
}

// Generate ripple worldtext with propagation
function generateRippleWorldtext(
  scenarioId: string,
  entity: Entity,
  vector: VectorType,
  propagationDepth: number = 0,
  affectedEntities: Entity[] = []
): WorldtextCell[] {
  const description = getEntityDescription(scenarioId, entity.id, vector);
  if (!description) return generateWorldtext(scenarioId, entity.id);
  
  const cells: WorldtextCell[] = [];
  let text = description;
  
  // Add propagation effects if other entities are affected
  if (affectedEntities.length > 0 && propagationDepth > 0) {
    text += ` [Propagation: ${affectedEntities.map(e => e.name).join(', ')} respond${affectedEntities.length > 1 ? '' : 's'} to the ripple]`;
  }
  
  const words = text.split(/\s+/);
  
  let x = 0;
  let y = 0;
  const maxX = 60;
  
  words.forEach((word, index) => {
    if (x + word.length > maxX) {
      x = 0;
      y++;
    }
    
    const type: WorldtextCell['type'] = 
      vector === 'GOAL' ? 'goal' :
      vector === 'OBSTACLE' ? 'obstacle' : 'shift';
    
    cells.push({
      id: `ripple-${index}`,
      text: word,
      x,
      y,
      type,
      entityId: entity.id,
      isActive: true,
      opacity: 1,
      timestamp: Date.now()
    });
    
    x += word.length + 1;
  });
  
  return cells;
}

// Generate memory worldtext
function generateMemoryWorldtext(entity: Entity): WorldtextCell[] {
  if (entity.memory.length === 0) return [];
  
  const cells: WorldtextCell[] = [];
  const memories = entity.memory.slice(-3); // Show last 3 memories
  
  let text = `Memory of ${entity.name}: `;
  memories.forEach((mem) => {
    text += `[${mem.vector} at tick ${mem.tick}] ${mem.result.slice(0, 50)}... `;
  });
  
  const words = text.split(/\s+/);
  
  let x = 0;
  let y = 0;
  const maxX = 60;
  
  words.forEach((word, index) => {
    if (x + word.length > maxX) {
      x = 0;
      y++;
    }
    
    cells.push({
      id: `memory-${index}`,
      text: word,
      x,
      y,
      type: 'memory',
      entityId: entity.id,
      isActive: true,
      opacity: 0.8,
      timestamp: Date.now()
    });
    
    x += word.length + 1;
  });
  
  return cells;
}

// Detect emergent patterns
function detectPatterns(ripples: Ripple[]): EmergentPattern[] {
  const patterns: EmergentPattern[] = [];
  const entitySequences: Record<string, VectorType[]> = {};
  
  // Group ripples by entity
  ripples.forEach(ripple => {
    if (!entitySequences[ripple.sourceEntity.id]) {
      entitySequences[ripple.sourceEntity.id] = [];
    }
    entitySequences[ripple.sourceEntity.id].push(ripple.vector);
  });
  
  // Detect patterns (simplified: look for repeated sequences)
  Object.entries(entitySequences).forEach(([entityId, vectors]) => {
    if (vectors.length >= 3) {
      const lastThree = vectors.slice(-3);
      const patternKey = lastThree.join('-');
      
      // Check if this pattern exists
      const existingPattern = patterns.find(p => 
        p.vectorSequence.join('-') === patternKey
      );
      
      if (existingPattern) {
        existingPattern.occurrenceCount++;
        existingPattern.lastObserved = Date.now();
      } else {
        patterns.push({
          id: `pattern-${Date.now()}-${entityId}`,
          name: `Pattern: ${lastThree.join(' → ')}`,
          description: `Entity ${entityId} has shown a recurring sequence of vectors`,
          participatingEntities: [entityId],
          vectorSequence: lastThree,
          firstObserved: Date.now(),
          lastObserved: Date.now(),
          occurrenceCount: 1
        });
      }
    }
  });
  
  return patterns;
}

export function useWorldState() {
  const initialScenario = scenarios[0];
  const [tick, setTick] = useState(0);
  const [currentScenario, setCurrentScenario] = useState(initialScenario);
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
  const [activeVector, setActiveVector] = useState<VectorType | null>(null);
  const [worldtext, setWorldtext] = useState<WorldtextCell[]>(() => 
    generateWorldtext(initialScenario.id)
  );
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [lastRipple, setLastRipple] = useState<Ripple | null>(null);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [crossScenarioRipples, setCrossScenarioRipples] = useState<CrossScenarioRipple[]>([]);
  const [emergentPatterns, setEmergentPatterns] = useState<EmergentPattern[]>([]);
  const [viewMode, setViewMode] = useState<'worldtext' | '3d' | 'split'>('worldtext');
  const [operationMode, setOperationMode] = useState<'supervised' | 'unsupervised' | 'performance'>('supervised');
  const [performanceState, setPerformanceState] = useState<PerformanceState>({
    isActive: false,
    audienceSize: 0,
    votes: { GOAL: 0, OBSTACLE: 0, SHIFT: 0 },
    votingWindow: 10000,
    lastVoteTimestamp: 0
  });
  const [showMemory, setShowMemory] = useState(false);
  
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Change scenario
  const changeScenario = useCallback((scenarioId: string) => {
    const scenario = getScenarioById(scenarioId);
    if (scenario) {
      setCurrentScenario(scenario);
      setSelectedEntity(null);
      setActiveVector(null);
      setWorldtext(generateWorldtext(scenarioId));
      setLastRipple(null);
    }
  }, []);

  // Select entity
  const selectEntity = useCallback((entity: Entity | null) => {
    setSelectedEntity(entity);
    if (entity) {
      if (showMemory && entity.memory.length > 0) {
        setWorldtext(generateMemoryWorldtext(entity));
      } else {
        setWorldtext(generateWorldtext(currentScenario.id, entity.id));
      }
    } else {
      setWorldtext(generateWorldtext(currentScenario.id));
    }
  }, [currentScenario.id, showMemory]);

  // Toggle memory view
  const toggleMemoryView = useCallback(() => {
    setShowMemory(prev => {
      const newValue = !prev;
      if (selectedEntity) {
        if (newValue && selectedEntity.memory.length > 0) {
          setWorldtext(generateMemoryWorldtext(selectedEntity));
        } else {
          setWorldtext(generateWorldtext(currentScenario.id, selectedEntity.id));
        }
      }
      return newValue;
    });
  }, [selectedEntity, currentScenario.id]);

  // Calculate propagation - which adjacent entities are affected
  const calculatePropagation = useCallback((entity: Entity): Entity[] => {
    const adjacentIds = currentScenario.adjacencyRules[entity.id] || [];
    const affectedEntities: Entity[] = [];
    
    adjacentIds.forEach(id => {
      const adjacentEntity = currentScenario.entities.find(e => e.id === id);
      if (adjacentEntity && adjacentEntity.id !== entity.id) {
        // Chance of propagation based on entity energy
        const propagationChance = adjacentEntity.energy / 100;
        if (Math.random() < propagationChance) {
          affectedEntities.push(adjacentEntity);
        }
      }
    });
    
    return affectedEntities;
  }, [currentScenario]);

  // Execute a ripple
  const executeRipple = useCallback((entity: Entity, vector: VectorType) => {
    setIsTransitioning(true);
    
    // Calculate propagation
    const affectedEntities = calculatePropagation(entity);
    const propagationDepth = affectedEntities.length > 0 ? 1 : 0;
    
    // Generate new worldtext
    const newWorldtext = generateRippleWorldtext(
      currentScenario.id, 
      entity, 
      vector, 
      propagationDepth, 
      affectedEntities
    );
    
    // Create ripple record
    const ripple: Ripple = {
      id: `ripple-${Date.now()}`,
      tick,
      timestamp: Date.now(),
      sourceEntity: entity,
      targetEntities: affectedEntities,
      vector,
      description: getEntityDescription(currentScenario.id, entity.id, vector),
      propagationDepth,
      affectedCells: newWorldtext.map(c => c.id)
    };
    
    // Update entity memory
    const updatedEntities = currentScenario.entities.map(e => {
      if (e.id === entity.id) {
        return {
          ...e,
          memory: [...e.memory, {
            vector,
            timestamp: Date.now(),
            tick,
            result: ripple.description
          }].slice(-10), // Keep last 10 memories
          energy: Math.min(100, e.energy + (vector === 'GOAL' ? 5 : vector === 'SHIFT' ? 3 : -2))
        };
      }
      // Affected entities also update energy
      if (affectedEntities.find(ae => ae.id === e.id)) {
        return {
          ...e,
          energy: Math.min(100, e.energy + 2)
        };
      }
      return e;
    });
    
    // Update scenario with new entity states
    setCurrentScenario(prev => ({
      ...prev,
      entities: updatedEntities
    }));
    
    // Create audit entry
    const newEntry: AuditEntry = {
      tick,
      timestamp: Date.now(),
      entityName: entity.name,
      vector,
      result: ripple.description.slice(0, 100) + '...',
      propagationDepth,
      affectedEntities: affectedEntities.map(e => e.name)
    };
    
    // Update ripples and detect patterns
    const newRipples = [...ripples, ripple];
    setRipples(newRipples);
    setEmergentPatterns(detectPatterns(newRipples));
    
    // Update state
    setWorldtext(newWorldtext);
    setAuditLog(prev => [newEntry, ...prev].slice(0, 50));
    setLastRipple(ripple);
    setTick(prev => prev + 1);
    setActiveVector(vector);
    
    // Clear transition state after animation
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
    
    return ripple;
  }, [currentScenario.id, tick, ripples, calculatePropagation]);

  // Trigger ripple with current selection
  const triggerRipple = useCallback((vector: VectorType) => {
    if (!selectedEntity) return;
    executeRipple(selectedEntity, vector);
  }, [selectedEntity, executeRipple]);

  // Create cross-scenario ripple
  const createCrossScenarioRipple = useCallback((
    fromScenarioId: string,
    toScenarioId: string,
    entityId: string,
    vector: VectorType
  ) => {
    const crossRipple: CrossScenarioRipple = {
      id: `cross-${Date.now()}`,
      fromScenario: fromScenarioId,
      toScenario: toScenarioId,
      entityId,
      vector,
      timestamp: Date.now(),
      tick
    };
    
    setCrossScenarioRipples(prev => [...prev, crossRipple].slice(-20));
  }, [tick]);

  // Autoplay logic
  useEffect(() => {
    if (isAutoplay && operationMode !== 'performance') {
      autoplayRef.current = setInterval(() => {
        // Randomly select entity and vector
        const randomEntity = currentScenario.entities[Math.floor(Math.random() * currentScenario.entities.length)];
        const vectors: VectorType[] = ['GOAL', 'OBSTACLE', 'SHIFT'];
        const randomVector = vectors[Math.floor(Math.random() * vectors.length)];
        
        executeRipple(randomEntity, randomVector);
      }, 3000);
    } else {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
    }
    
    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [isAutoplay, currentScenario.entities, executeRipple, operationMode]);

  // Performance mode voting
  const castVote = useCallback((vector: VectorType) => {
    if (operationMode !== 'performance') return;
    
    setPerformanceState(prev => ({
      ...prev,
      votes: {
        ...prev.votes,
        [vector]: prev.votes[vector] + 1
      },
      lastVoteTimestamp: Date.now()
    }));
  }, [operationMode]);

  // Process performance votes
  useEffect(() => {
    if (operationMode !== 'performance' || !performanceState.isActive) return;
    
    const processVotes = setInterval(() => {
      const now = Date.now();
      if (now - performanceState.lastVoteTimestamp > performanceState.votingWindow) {
        // Find winning vector
        const votes = performanceState.votes;
        const winningVector = Object.entries(votes).reduce((a, b) => 
          votes[a[0] as VectorType] > votes[b[0] as VectorType] ? a : b
        )[0] as VectorType;
        
        // Execute ripple with winning vector
        if (selectedEntity && votes[winningVector] > 0) {
          executeRipple(selectedEntity, winningVector);
        }
        
        // Reset votes
        setPerformanceState(prev => ({
          ...prev,
          votes: { GOAL: 0, OBSTACLE: 0, SHIFT: 0 }
        }));
      }
    }, 1000);
    
    return () => clearInterval(processVotes);
  }, [operationMode, performanceState, selectedEntity, executeRipple]);

  // Toggle autoplay
  const toggleAutoplay = useCallback(() => {
    setIsAutoplay(prev => !prev);
  }, []);

  // Set operation mode
  const setMode = useCallback((mode: 'supervised' | 'unsupervised' | 'performance') => {
    setOperationMode(mode);
    setIsAutoplay(mode === 'unsupervised');
    setPerformanceState(prev => ({
      ...prev,
      isActive: mode === 'performance'
    }));
  }, []);

  // Set view mode
  const setView = useCallback((mode: 'worldtext' | '3d' | 'split') => {
    setViewMode(mode);
  }, []);

  // Get adjacent entities for current selection
  const getAdjacentEntities = useCallback((): Entity[] => {
    if (!selectedEntity) return [];
    const adjacentIds = currentScenario.adjacencyRules[selectedEntity.id] || [];
    return currentScenario.entities.filter(e => adjacentIds.includes(e.id));
  }, [selectedEntity, currentScenario]);

  // Get entity memory
  const getEntityMemory = useCallback((entityId: string): EntityMemory[] => {
    const entity = currentScenario.entities.find(e => e.id === entityId);
    return entity?.memory || [];
  }, [currentScenario]);

  return {
    // State
    tick,
    currentScenario,
    selectedEntity,
    activeVector,
    worldtext,
    auditLog,
    isAutoplay,
    lastRipple,
    ripples,
    isTransitioning,
    crossScenarioRipples,
    emergentPatterns,
    viewMode,
    operationMode,
    performanceState,
    showMemory,
    
    // Actions
    changeScenario,
    selectEntity,
    triggerRipple,
    toggleAutoplay,
    setMode,
    setView,
    toggleMemoryView,
    castVote,
    createCrossScenarioRipple,
    getAdjacentEntities,
    getEntityMemory,
    
    // All scenarios
    allScenarios: scenarios
  };
}
