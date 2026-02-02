// RIPPLES: Operative Ecologies - Type Definitions

export type VectorType = 'GOAL' | 'OBSTACLE' | 'SHIFT';

export interface Entity {
  id: string;
  name: string;
  description: string;
  type: 'animate' | 'inanimate' | 'abstract';
  position: { x: number; y: number };
  state: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  baselineWorldtext: string;
  entities: Entity[];
  adjacencyRules: Record<string, string[]>;
}

export interface RippleState {
  tick: number;
  currentScenario: Scenario;
  selectedEntity: Entity | null;
  activeVector: VectorType | null;
  worldtext: WorldtextCell[];
  auditLog: AuditEntry[];
  isAutoplay: boolean;
  lastRipple: {
    entity: Entity;
    vector: VectorType;
    result: string;
  } | null;
}

export interface WorldtextCell {
  id: string;
  text: string;
  x: number;
  y: number;
  type: 'baseline' | 'entity' | 'obstacle' | 'goal' | 'shift' | 'transition';
  entityId?: string;
  isActive: boolean;
  opacity: number;
}

export interface AuditEntry {
  tick: number;
  timestamp: number;
  entityName: string;
  vector: VectorType;
  result: string;
}

export interface LatentDescription {
  entityId: string;
  vector: VectorType;
  preState: string;
  postState: string;
  poeticDescription: string;
}

export interface LatentLibrary {
  scenarios: Record<string, {
    baseline: string[];
    entities: Record<string, {
      GOAL: string[];
      OBSTACLE: string[];
      SHIFT: string[];
    }>;
  }>;
}

export type OperationMode = 'SUPERVISED' | 'UNSUPERVISED';
