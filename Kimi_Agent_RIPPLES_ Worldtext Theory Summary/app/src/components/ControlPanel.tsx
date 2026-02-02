// RIPPLES: Control Panel - Vector buttons and mode controls
// The instrument of selection, not authorship

import type { VectorType, Entity } from '@/types';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { 
  Target, 
  Shield, 
  RefreshCw, 
  Play,
  Zap,
  Eye,
  Box,
  LayoutGrid,
  Brain,
  Users,
  Globe
} from 'lucide-react';

interface ControlPanelProps {
  selectedEntity: Entity | null;
  activeVector: VectorType | null;
  isAutoplay: boolean;
  operationMode: 'supervised' | 'unsupervised' | 'performance';
  viewMode: 'worldtext' | '3d' | 'split';
  showMemory: boolean;
  onVectorClick: (vector: VectorType) => void;
  onAutoplayToggle: () => void;
  onModeChange: (mode: 'supervised' | 'unsupervised' | 'performance') => void;
  onViewChange: (mode: 'worldtext' | '3d' | 'split') => void;
  onMemoryToggle: () => void;
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
        'min-w-[100px]',
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
      <span className="text-[9px] text-center opacity-70 max-w-[90px]">
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
  operationMode,
  viewMode,
  showMemory,
  onVectorClick,
  onAutoplayToggle,
  onModeChange,
  onViewChange,
  onMemoryToggle
}: ControlPanelProps) {
  const vectors: VectorType[] = ['GOAL', 'OBSTACLE', 'SHIFT'];
  
  const isVectorDisabled = !selectedEntity || (operationMode === 'unsupervised') || (operationMode === 'performance');
  
  return (
    <div className="bg-card/50 border-t border-border p-4">
      <div className="flex items-center justify-between gap-4">
        {/* Vector Buttons */}
        <div className="flex items-center gap-3">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider mr-1">
            Inject Vector
          </div>
          {vectors.map(vector => (
            <VectorButton
              key={vector}
              vector={vector}
              isActive={activeVector === vector}
              isDisabled={isVectorDisabled}
              onClick={() => onVectorClick(vector)}
            />
          ))}
        </div>
        
        {/* Divider */}
        <div className="w-px h-16 bg-border" />
        
        {/* Operation Mode */}
        <div className="flex flex-col gap-2">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Operation Mode
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onModeChange('supervised')}
              className={cn(
                'px-3 py-1.5 text-xs rounded transition-all',
                operationMode === 'supervised'
                  ? 'bg-entity-green/20 text-entity-green border border-entity-green/50'
                  : 'bg-secondary text-foreground/70 hover:bg-secondary/80'
              )}
            >
              <Zap className="w-3 h-3 inline mr-1" />
              Supervised
            </button>
            <button
              onClick={() => onModeChange('unsupervised')}
              className={cn(
                'px-3 py-1.5 text-xs rounded transition-all',
                operationMode === 'unsupervised'
                  ? 'bg-goal-gold/20 text-goal-gold border border-goal-gold/50'
                  : 'bg-secondary text-foreground/70 hover:bg-secondary/80'
              )}
            >
              <Play className="w-3 h-3 inline mr-1" />
              Auto
            </button>
            <button
              onClick={() => onModeChange('performance')}
              className={cn(
                'px-3 py-1.5 text-xs rounded transition-all',
                operationMode === 'performance'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                  : 'bg-secondary text-foreground/70 hover:bg-secondary/80'
              )}
            >
              <Users className="w-3 h-3 inline mr-1" />
              Performance
            </button>
          </div>
          
          {/* Autoplay toggle for unsupervised */}
          {operationMode === 'unsupervised' && (
            <div className="flex items-center gap-2 mt-1">
              <Switch
                checked={isAutoplay}
                onCheckedChange={onAutoplayToggle}
                className="data-[state=checked]:bg-goal-gold"
              />
              <span className="text-xs">
                {isAutoplay ? 'Running' : 'Paused'}
              </span>
            </div>
          )}
        </div>
        
        {/* Divider */}
        <div className="w-px h-16 bg-border" />
        
        {/* View Mode */}
        <div className="flex flex-col gap-2">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
            View Mode
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onViewChange('worldtext')}
              className={cn(
                'px-3 py-1.5 text-xs rounded transition-all',
                viewMode === 'worldtext'
                  ? 'bg-entity-green/20 text-entity-green border border-entity-green/50'
                  : 'bg-secondary text-foreground/70 hover:bg-secondary/80'
              )}
            >
              <LayoutGrid className="w-3 h-3 inline mr-1" />
              Worldtext
            </button>
            <button
              onClick={() => onViewChange('3d')}
              className={cn(
                'px-3 py-1.5 text-xs rounded transition-all',
                viewMode === '3d'
                  ? 'bg-entity-green/20 text-entity-green border border-entity-green/50'
                  : 'bg-secondary text-foreground/70 hover:bg-secondary/80'
              )}
            >
              <Box className="w-3 h-3 inline mr-1" />
              3D
            </button>
            <button
              onClick={() => onViewChange('split')}
              className={cn(
                'px-3 py-1.5 text-xs rounded transition-all',
                viewMode === 'split'
                  ? 'bg-entity-green/20 text-entity-green border border-entity-green/50'
                  : 'bg-secondary text-foreground/70 hover:bg-secondary/80'
              )}
            >
              <Eye className="w-3 h-3 inline mr-1" />
              Split
            </button>
          </div>
          
          {/* Memory toggle */}
          <button
            onClick={onMemoryToggle}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 text-xs rounded transition-all mt-1',
              showMemory
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                : 'bg-secondary text-foreground/70 hover:bg-secondary/80'
            )}
          >
            <Brain className="w-3 h-3" />
            {showMemory ? 'Memory On' : 'Memory Off'}
          </button>
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
        <Globe className="w-3 h-3" />
        <span>
          Constraint: The user cannot type. They can only click to select entity and inject vector.
          {operationMode === 'performance' && ' In Performance mode, audience votes determine the vector.'}
        </span>
      </div>
    </div>
  );
}
