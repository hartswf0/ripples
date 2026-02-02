// RIPPLES: WorldState Hook - Core simulation engine
// Manages the state of the world, ripples, and entity interactions

import { useState, useCallback, useRef, useEffect } from 'react';
import type { RippleState, Entity, VectorType, AuditEntry, WorldtextCell } from '@/types';
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
      opacity: isActive ? 1 : 0.6
    });
    
    x += word.length + 1;
  });
  
  return cells;
}

// Generate ripple worldtext
function generateRippleWorldtext(
  scenarioId: string,
  entity: Entity,
  vector: VectorType
): WorldtextCell[] {
  const description = getEntityDescription(scenarioId, entity.id, vector);
  if (!description) return generateWorldtext(scenarioId, entity.id);
  
  const cells: WorldtextCell[] = [];
  const words = description.split(/\s+/);
  
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
      opacity: 1
    });
    
    x += word.length + 1;
  });
  
  return cells;
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
  const [lastRipple, setLastRipple] = useState<RippleState['lastRipple']>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
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
      setWorldtext(generateWorldtext(currentScenario.id, entity.id));
    } else {
      setWorldtext(generateWorldtext(currentScenario.id));
    }
  }, [currentScenario.id]);

  // Execute a ripple
  const executeRipple = useCallback((entity: Entity, vector: VectorType) => {
    setIsTransitioning(true);
    
    // Generate new worldtext
    const newWorldtext = generateRippleWorldtext(currentScenario.id, entity, vector);
    
    // Create audit entry
    const newEntry: AuditEntry = {
      tick,
      timestamp: Date.now(),
      entityName: entity.name,
      vector,
      result: getEntityDescription(currentScenario.id, entity.id, vector).slice(0, 100) + '...'
    };
    
    // Update state
    setWorldtext(newWorldtext);
    setAuditLog(prev => [newEntry, ...prev].slice(0, 50)); // Keep last 50 entries
    setLastRipple({ entity, vector, result: newEntry.result });
    setTick(prev => prev + 1);
    setActiveVector(vector);
    
    // Clear transition state after animation
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  }, [currentScenario.id, tick]);

  // Trigger ripple with current selection
  const triggerRipple = useCallback((vector: VectorType) => {
    if (!selectedEntity) return;
    executeRipple(selectedEntity, vector);
  }, [selectedEntity, executeRipple]);

  // Autoplay logic
  useEffect(() => {
    if (isAutoplay) {
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
  }, [isAutoplay, currentScenario.entities, executeRipple]);

  // Toggle autoplay
  const toggleAutoplay = useCallback(() => {
    setIsAutoplay(prev => !prev);
  }, []);

  // Get adjacent entities for current selection
  const getAdjacentEntities = useCallback((): Entity[] => {
    if (!selectedEntity) return [];
    const adjacentIds = currentScenario.adjacencyRules[selectedEntity.id] || [];
    return currentScenario.entities.filter(e => adjacentIds.includes(e.id));
  }, [selectedEntity, currentScenario]);

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
    isTransitioning,
    
    // Actions
    changeScenario,
    selectEntity,
    triggerRipple,
    toggleAutoplay,
    getAdjacentEntities,
    
    // All scenarios
    allScenarios: scenarios
  };
}
