// RIPPLES: Control Panel - Vector buttons and autoplay toggle
// The instrument of selection, not authorship

import React from 'react';
import type { VectorType, Entity } from '@/types';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { 
  Target, 
  Shield, 
  RefreshCw, 
  Play, 
  Pause,
  Zap
} from 'lucide-react';

interface ControlPanelProps {
  selectedEntity: Entity | null;
  activeVector: VectorType | null;
  isAutoplay: boolean;
  onVectorClick: (vector: VectorType) => void;
  onAutoplayToggle: () => void;
}

interface VectorButtonProps {
  vector: VectorType;
  isActive: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

const vectorConfig: Record<VectorType, {
  label: string;
  description: string;
  icon: React.ReactNode;
  colorClass: string;
  glowClass: string;
}> = {
  GOAL: {
    label: 'GOAL',
    description: 'Seek connection, resources, change',
    icon: <Target className="w-5 h-5" />,
    colorClass: 'text-goal-gold border-goal-gold/50 bg-goal-gold/5 hover:bg-goal-gold/10',
    glowClass: 'shadow-glow-gold'
  },
  OBSTACLE: {
    label: 'OBSTACLE',
    description: 'Introduce barrier, resistance, stasis',
    icon: <Shield className="w-5 h-5" />,
    colorClass: 'text-obstacle-red border-obstacle-red/50 bg-obstacle-red/5 hover:bg-obstacle-red/10',
    glowClass: 'shadow-glow-red'
  },
  SHIFT: {
    label: 'SHIFT',
    description: 'Internal transformation of state',
    icon: <RefreshCw className="w-5 h-5" />,
    colorClass: 'text-shift-cyan border-shift-cyan/50 bg-shift-cyan/5 hover:bg-shift-cyan/10',
    glowClass: 'shadow-glow-cyan'
  }
};

function VectorButton({ vector, isActive, isDisabled, onClick }: VectorButtonProps) {
  const config = vectorConfig[vector];
  
  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        'relative flex flex-col items-center gap-2 p-4 rounded border-2 transition-all duration-200',
        'min-w-[120px]',
        isDisabled && 'opacity-40 cursor-not-allowed',
        !isDisabled && config.colorClass,
        isActive && !isDisabled && cn('ring-2 ring-offset-2 ring-offset-background', config.glowClass),
        !isActive && !isDisabled && 'hover:scale-[1.02] active:scale-[0.98]'
      )}
    >
      <span className={cn(
        'transition-transform duration-200',
        isActive && 'scale-110'
      )}>
        {config.icon}
      </span>
      <span className="font-mono text-sm font-bold tracking-wider">
        {config.label}
      </span>
      <span className="text-[9px] text-center opacity-70 max-w-[100px]">
        {config.description}
      </span>
      
      {/* Active indicator */}
      {isActive && (
        <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-current animate-pulse" />
      )}
    </button>
  );
}

export function ControlPanel({
  selectedEntity,
  activeVector,
  isAutoplay,
  onVectorClick,
  onAutoplayToggle
}: ControlPanelProps) {
  const vectors: VectorType[] = ['GOAL', 'OBSTACLE', 'SHIFT'];
  
  return (
    <div className="bg-card/50 border-t border-border p-4">
      <div className="flex items-center justify-between gap-6">
        {/* Vector Buttons */}
        <div className="flex items-center gap-4">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider mr-2">
            Inject Vector
          </div>
          {vectors.map(vector => (
            <VectorButton
              key={vector}
              vector={vector}
              isActive={activeVector === vector}
              isDisabled={!selectedEntity || isAutoplay}
              onClick={() => onVectorClick(vector)}
            />
          ))}
        </div>
        
        {/* Divider */}
        <div className="w-px h-16 bg-border" />
        
        {/* Autoplay Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              {isAutoplay ? (
                <Play className="w-4 h-4 text-entity-green" />
              ) : (
                <Pause className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Operation Mode
              </span>
            </div>
            <div className="text-xs font-medium mt-1">
              {isAutoplay ? 'UNSUPERVISED' : 'SUPERVISED'}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Switch
              checked={isAutoplay}
              onCheckedChange={onAutoplayToggle}
              className="data-[state=checked]:bg-entity-green"
            />
            <div className="flex flex-col">
              <span className="text-xs font-medium">
                {isAutoplay ? 'AUTOPLAY ON' : 'AUTOPLAY OFF'}
              </span>
              <span className="text-[9px] text-muted-foreground">
                {isAutoplay ? 'System drives causality' : 'Human-in-the-loop'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Status Indicator */}
        <div className="flex items-center gap-3 ml-auto">
          <div className={cn(
            'w-2 h-2 rounded-full',
            selectedEntity ? 'bg-entity-green animate-pulse' : 'bg-muted-foreground'
          )} />
          <div className="text-xs">
            {selectedEntity ? (
              <span className="text-entity-green">
                Perspective: <span className="font-mono">{selectedEntity.name}</span>
              </span>
            ) : (
              <span className="text-muted-foreground">
                No entity selected
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Constraint reminder */}
      <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2 text-[9px] text-muted-foreground">
        <Zap className="w-3 h-3" />
        <span>
          Constraint: The user cannot type. They can only click to select entity and inject vector.
        </span>
      </div>
    </div>
  );
}
