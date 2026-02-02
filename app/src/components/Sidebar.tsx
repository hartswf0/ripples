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
  CircleDot
} from 'lucide-react';

interface SidebarProps {
  scenarios: Scenario[];
  currentScenario: Scenario;
  entities: Entity[];
  selectedEntity: Entity | null;
  onScenarioChange: (scenarioId: string) => void;
  onEntitySelect: (entity: Entity) => void;
}

const scenarioIcons: Record<string, React.ReactNode> = {
  cupboard: <Box className="w-4 h-4" />,
  abandoned_house: <Home className="w-4 h-4" />,
  forest: <Trees className="w-4 h-4" />,
  urban_jungle: <Building2 className="w-4 h-4" />,
};

export function Sidebar({
  scenarios,
  currentScenario,
  entities,
  selectedEntity,
  onScenarioChange,
  onEntitySelect
}: SidebarProps) {
  return (
    <div className="w-64 h-full bg-card/50 border-r border-border flex flex-col">
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
                <span className="font-medium">{scenario.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Entity Pool */}
        <div className="p-3 border-t border-border">
          <h2 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Entity Pool
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
                <CircleDot className={cn(
                  'w-3 h-3',
                  selectedEntity?.id === entity.id ? 'text-entity-green' : 'text-muted-foreground'
                )} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{entity.name}</div>
                  <div className="text-[9px] text-muted-foreground truncate">
                    {entity.type}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        
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
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t border-border">
        <div className="text-[9px] text-muted-foreground text-center">
          Worldtext Engine v1.0
        </div>
      </div>
    </div>
  );
}
