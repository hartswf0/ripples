// RIPPLES: Sidebar - Scenario selection and entity pool
// Displays available scenarios and current entities

import React from 'react';
import type { Scenario, Entity } from '@/types';
import { cn } from '@/lib/utils';
import { 
  Box, 
  Home, 
  Trees, 
  Building2, 
  Warehouse,
  CircleDot,
  Wind,
  Mountain,
  Clock,
  Zap,
  Brain
} from 'lucide-react';

interface SidebarProps {
  scenarios: Scenario[];
  currentScenario: Scenario;
  entities: Entity[];
  selectedEntity: Entity | null;
  emergentPatterns: { id: string; name: string; occurrenceCount: number }[];
  onScenarioChange: (scenarioId: string) => void;
  onEntitySelect: (entity: Entity) => void;
}

const scenarioIcons: Record<string, React.ReactNode> = {
  cupboard: <Box className="w-4 h-4" />,
  abandoned_house: <Home className="w-4 h-4" />,
  forest: <Trees className="w-4 h-4" />,
  urban_jungle: <Building2 className="w-4 h-4" />,
};

const entityTypeIcons: Record<string, React.ReactNode> = {
  animate: <CircleDot className="w-3 h-3" />,
  inanimate: <Box className="w-3 h-3" />,
  abstract: <Zap className="w-3 h-3" />,
  weather: <Wind className="w-3 h-3" />,
  geological: <Mountain className="w-3 h-3" />,
  temporal: <Clock className="w-3 h-3" />,
};

const entityTypeColors: Record<string, string> = {
  animate: 'text-entity-green',
  inanimate: 'text-muted-foreground',
  abstract: 'text-purple-400',
  weather: 'text-blue-400',
  geological: 'text-amber-700',
  temporal: 'text-pink-400',
};

export function Sidebar({
  scenarios,
  currentScenario,
  entities,
  selectedEntity,
  emergentPatterns,
  onScenarioChange,
  onEntitySelect
}: SidebarProps) {
  return (
    <div className="w-72 h-full bg-card/50 border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Warehouse className="w-5 h-5 text-entity-green" />
          <h1 className="text-sm font-semibold tracking-wider">
            RIPPLES
          </h1>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-widest">
          Operative Ecologies
        </p>
      </div>
      
      {/* Scenarios */}
      <div className="flex-1 overflow-auto">
        <div className="p-3">
          <h2 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Preset Scenarios
          </h2>
          <div className="space-y-1">
            {scenarios.map(scenario => (
              <button
                key={scenario.id}
                onClick={() => onScenarioChange(scenario.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 text-left text-xs rounded transition-all duration-150',
                  currentScenario.id === scenario.id
                    ? 'bg-entity-green/10 text-entity-green border border-entity-green/30'
                    : 'text-foreground/70 hover:bg-secondary hover:text-foreground'
                )}
              >
                <span className={cn(
                  'transition-colors',
                  currentScenario.id === scenario.id ? 'text-entity-green' : 'text-muted-foreground'
                )}>
                  {scenarioIcons[scenario.id] || <Box className="w-4 h-4" />}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{scenario.name}</div>
                  <div className="text-[9px] text-muted-foreground truncate">
                    {scenario.boundary} • {scenario.physics}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Entity Pool */}
        <div className="p-3 border-t border-border">
          <h2 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Entity Pool ({entities.length})
          </h2>
          <div className="space-y-1">
            {entities.map(entity => (
              <button
                key={entity.id}
                onClick={() => onEntitySelect(entity)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 text-left text-xs rounded transition-all duration-150',
                  selectedEntity?.id === entity.id
                    ? 'bg-entity-green/10 text-entity-green border border-entity-green/30'
                    : 'text-foreground/70 hover:bg-secondary hover:text-foreground'
                )}
              >
                <span className={cn(
                  entityTypeColors[entity.type] || 'text-muted-foreground',
                  selectedEntity?.id === entity.id && 'text-entity-green'
                )}>
                  {entityTypeIcons[entity.type] || <CircleDot className="w-3 h-3" />}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{entity.name}</span>
                    {entity.memory.length > 0 && (
                      <span className="text-[9px] bg-secondary px-1 rounded">
                        {entity.memory.length}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-muted-foreground truncate">
                      {entity.state}
                    </span>
                    <span className={cn(
                      'text-[9px]',
                      entity.energy > 70 ? 'text-entity-green' :
                      entity.energy > 30 ? 'text-goal-gold' : 'text-obstacle-red'
                    )}>
                      {entity.energy}%
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Emergent Patterns */}
        {emergentPatterns.length > 0 && (
          <div className="p-3 border-t border-border">
            <h2 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
              <Brain className="w-3 h-3" />
              Emergent Patterns
            </h2>
            <div className="space-y-1">
              {emergentPatterns.slice(0, 3).map(pattern => (
                <div
                  key={pattern.id}
                  className="px-3 py-2 text-xs bg-secondary/50 rounded"
                >
                  <div className="font-medium text-foreground/80">{pattern.name}</div>
                  <div className="text-[9px] text-muted-foreground">
                    Observed {pattern.occurrenceCount} time{pattern.occurrenceCount > 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Current Scenario Info */}
        <div className="p-3 border-t border-border">
          <h2 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Current Environment
          </h2>
          <div className="bg-secondary/50 rounded p-3">
            <div className="text-xs font-medium text-foreground">
              {currentScenario.name}
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
              {currentScenario.description}
            </p>
            
            {/* Environmental Factors */}
            <div className="mt-2 pt-2 border-t border-border/50 grid grid-cols-2 gap-2">
              <div className="text-[9px]">
                <span className="text-muted-foreground">Temp:</span>{' '}
                <span className="text-foreground">{currentScenario.environmentalFactors.temperature}°C</span>
              </div>
              <div className="text-[9px]">
                <span className="text-muted-foreground">Humidity:</span>{' '}
                <span className="text-foreground">{currentScenario.environmentalFactors.humidity}%</span>
              </div>
              <div className="text-[9px]">
                <span className="text-muted-foreground">Light:</span>{' '}
                <span className="text-foreground">{currentScenario.environmentalFactors.lightLevel}%</span>
              </div>
              <div className="text-[9px]">
                <span className="text-muted-foreground">Noise:</span>{' '}
                <span className="text-foreground">{currentScenario.environmentalFactors.noiseLevel}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t border-border">
        <div className="text-[9px] text-muted-foreground text-center">
          Worldtext Engine v2.0 • Imaginary Relationalities
        </div>
      </div>
    </div>
  );
}
