// RIPPLES: Worldtext Viewport - The main terminal display
// Displays the operative text grid with syntax highlighting and animations

import React, { useRef } from 'react';
import type { WorldtextCell, Entity } from '@/types';
import { cn } from '@/lib/utils';

interface WorldtextViewportProps {
  cells: WorldtextCell[];
  selectedEntity: Entity | null;
  isTransitioning: boolean;
  onEntityClick: (entity: Entity) => void;
  scenarioEntities: Entity[];
}

export function WorldtextViewport({
  cells,
  selectedEntity,
  isTransitioning,
  onEntityClick,
  scenarioEntities
}: WorldtextViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Group cells by row for rendering
  const rows = React.useMemo(() => {
    const rowMap = new Map<number, WorldtextCell[]>();
    cells.forEach(cell => {
      if (!rowMap.has(cell.y)) {
        rowMap.set(cell.y, []);
      }
      rowMap.get(cell.y)!.push(cell);
    });
    return Array.from(rowMap.entries()).sort((a, b) => a[0] - b[0]);
  }, [cells]);

  // Get cell styling based on type
  const getCellClassName = (cell: WorldtextCell): string => {
    const baseClasses = 'inline-block px-0.5 py-0 text-[11px] leading-tight font-mono cursor-default transition-all duration-200';
    
    switch (cell.type) {
      case 'entity':
        return cn(
          baseClasses,
          'text-entity-green glow-entity',
          cell.isActive && 'animate-pulse-glow bg-entity-green/10'
        );
      case 'goal':
        return cn(
          baseClasses,
          'text-goal-gold glow-goal',
          'animate-fade-in'
        );
      case 'obstacle':
        return cn(
          baseClasses,
          'text-obstacle-red glow-obstacle',
          'animate-fade-in'
        );
      case 'shift':
        return cn(
          baseClasses,
          'text-shift-cyan glow-shift',
          'animate-fade-in'
        );
      case 'transition':
        return cn(
          baseClasses,
          'text-foreground/80',
          'animate-fade-in'
        );
      default:
        return cn(
          baseClasses,
          'text-text-dim hover:text-foreground/60',
          cell.isActive && 'text-foreground/80'
        );
    }
  };

  // Handle cell click
  const handleCellClick = (cell: WorldtextCell) => {
    if (cell.entityId) {
      const entity = scenarioEntities.find(e => e.id === cell.entityId);
      if (entity) {
        onEntityClick(entity);
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        'relative w-full h-full overflow-auto bg-background terminal-border p-4',
        'font-mono text-xs leading-relaxed',
        isTransitioning && 'animate-ripple-flash'
      )}
    >
      {/* Grid background pattern */}
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
      
      {/* Scanline effect */}
      <div className="absolute inset-0 scanline pointer-events-none opacity-20" />
      
      {/* Worldtext content */}
      <div className="relative z-10">
        {rows.map(([y, rowCells]) => (
          <div key={y} className="whitespace-pre">
            {rowCells.map(cell => (
              <span
                key={cell.id}
                className={cn(
                  getCellClassName(cell),
                  cell.entityId && 'cursor-pointer hover:bg-entity-green/5'
                )}
                onClick={() => handleCellClick(cell)}
                style={{
                  opacity: cell.opacity,
                  animationDelay: `${(cell.x + cell.y) * 10}ms`
                }}
              >
                {cell.text}
              </span>
            ))}
          </div>
        ))}
      </div>
      
      {/* Entity highlight overlay */}
      {selectedEntity && (
        <div className="absolute bottom-4 left-4 right-4 bg-card/90 border border-entity-green/30 p-3 rounded animate-slide-up">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-entity-green animate-pulse mt-1.5" />
            <div>
              <div className="text-entity-green font-medium text-sm">
                {selectedEntity.name}
              </div>
              <div className="text-muted-foreground text-xs mt-1">
                {selectedEntity.description}
              </div>
              <div className="text-text-dim text-[10px] mt-1 uppercase tracking-wider">
                State: {selectedEntity.state}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Transition flash overlay */}
      {isTransitioning && (
        <div className="absolute inset-0 bg-entity-green/5 pointer-events-none animate-ripple-flash" />
      )}
    </div>
  );
}
