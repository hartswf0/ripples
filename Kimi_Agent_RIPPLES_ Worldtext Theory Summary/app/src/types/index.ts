// RIPPLES: Operative Ecologies - Type Definitions
// A Theory of Imaginary Relationalities

export type VectorType = 'GOAL' | 'OBSTACLE' | 'SHIFT';

export type EntityType = 'animate' | 'inanimate' | 'abstract' | 'weather' | 'geological' | 'temporal';

export interface EntityMemory {
  vector: VectorType;
  timestamp: number;
  tick: number;
  result: string;
}

export interface Entity {
  id: string;
  name: string;
  description: string;
  type: EntityType;
  position: { x: number; y: number; z?: number };
  state: string;
  memory: EntityMemory[];
  energy: number; // 0-100, affects how actively the entity can respond
  adjacency: string[]; // IDs of adjacent entities
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  boundary: string;
  physics: 'high_friction' | 'low_friction' | 'standard' | 'high_noise';
  baselineWorldtext: string;
  entities: Entity[];
  adjacencyRules: Record<string, string[]>;
  environmentalFactors: {
    temperature: number;
    humidity: number;
    lightLevel: number;
    noiseLevel: number;
  };
}

export interface Ripple {
  id: string;
  tick: number;
  timestamp: number;
  sourceEntity: Entity;
  targetEntities: Entity[];
  vector: VectorType;
  description: string;
  propagationDepth: number;
  affectedCells: string[];
}

export interface RippleState {
  tick: number;
  currentScenario: Scenario;
  selectedEntity: Entity | null;
  activeVector: VectorType | null;
  worldtext: WorldtextCell[];
  auditLog: AuditEntry[];
  isAutoplay: boolean;
  lastRipple: Ripple | null;
  ripples: Ripple[];
  globalMemory: GlobalMemory;
  viewMode: 'worldtext' | '3d' | 'split';
  operationMode: 'supervised' | 'unsupervised' | 'performance';
}

export interface GlobalMemory {
  crossScenarioRipples: CrossScenarioRipple[];
  entityRelationships: Record<string, string[]>;
  emergentPatterns: EmergentPattern[];
}

export interface CrossScenarioRipple {
  id: string;
  fromScenario: string;
  toScenario: string;
  entityId: string;
  vector: VectorType;
  timestamp: number;
  tick: number;
}

export interface EmergentPattern {
  id: string;
  name: string;
  description: string;
  participatingEntities: string[];
  vectorSequence: VectorType[];
  firstObserved: number;
  lastObserved: number;
  occurrenceCount: number;
}

export interface WorldtextCell {
  id: string;
  text: string;
  x: number;
  y: number;
  z?: number;
  type: 'baseline' | 'entity' | 'obstacle' | 'goal' | 'shift' | 'transition' | 'memory' | 'propagation';
  entityId?: string;
  isActive: boolean;
  opacity: number;
  rippleId?: string;
  timestamp: number;
}

export interface AuditEntry {
  tick: number;
  timestamp: number;
  entityName: string;
  vector: VectorType;
  result: string;
  propagationDepth: number;
  affectedEntities: string[];
}

export interface LatentDescription {
  entityId: string;
  vector: VectorType;
  preState: string;
  postState: string;
  poeticDescription: string;
  propagationEffect: string;
}

export interface LatentLibrary {
  scenarios: Record<string, {
    baseline: string[];
    environmental: {
      temperature: string[];
      humidity: string[];
      lightLevel: string[];
      noiseLevel: string[];
    };
    entities: Record<string, {
      GOAL: string[];
      OBSTACLE: string[];
      SHIFT: string[];
    }>;
  }>;
}

export type OperationMode = 'SUPERVISED' | 'UNSUPERVISED' | 'PERFORMANCE';

export interface PerformanceState {
  isActive: boolean;
  audienceSize: number;
  votes: Record<VectorType, number>;
  votingWindow: number;
  lastVoteTimestamp: number;
}

export interface VisualizationState {
  cameraPosition: { x: number; y: number; z: number };
  focusedEntity: string | null;
  showConnections: boolean;
  showMemory: boolean;
  timeScale: number;
}
