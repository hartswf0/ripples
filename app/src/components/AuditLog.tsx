// RIPPLES: Audit Log - Scrolling log of every ripple
// Tracks the simulation's history

import React, { useRef, useEffect } from 'react';
import type { AuditEntry, VectorType } from '@/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Terminal, 
  Target, 
  Shield, 
  RefreshCw,
  Clock
} from 'lucide-react';

interface AuditLogProps {
  entries: AuditEntry[];
  tick: number;
}

const vectorIcons: Record<VectorType, React.ReactNode> = {
  GOAL: <Target className="w-3 h-3" />,
  OBSTACLE: <Shield className="w-3 h-3" />,
  SHIFT: <RefreshCw className="w-3 h-3" />
};

const vectorColors: Record<VectorType, string> = {
  GOAL: 'text-goal-gold',
  OBSTACLE: 'text-obstacle-red',
  SHIFT: 'text-shift-cyan'
};

export function AuditLog({ entries, tick }: AuditLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to top when new entries arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [entries]);

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="w-80 h-full bg-card/50 border-l border-border flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-[10px] font-medium uppercase tracking-wider">
            Audit Log
          </h2>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">
            Tick: <span className="font-mono text-foreground">{tick}</span>
          </span>
        </div>
      </div>
      
      {/* Log entries */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="p-2 space-y-1">
          {entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs">
              <Terminal className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No ripples recorded yet.</p>
              <p className="text-[10px] mt-1">
                Select an entity and inject a vector to begin.
              </p>
            </div>
          ) : (
            entries.map((entry, index) => (
              <div
                key={`${entry.tick}-${entry.timestamp}`}
                className={cn(
                  'p-2 rounded text-[10px] border border-transparent',
                  'hover:border-border/50 transition-colors',
                  index === 0 && 'bg-secondary/50'
                )}
              >
                {/* Header line */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-muted-foreground">
                    #{entry.tick}
                  </span>
                  <span className={cn(
                    'flex items-center gap-1 font-medium',
                    vectorColors[entry.vector]
                  )}>
                    {vectorIcons[entry.vector]}
                    {entry.vector}
                  </span>
                  <span className="text-muted-foreground ml-auto">
                    {formatTime(entry.timestamp)}
                  </span>
                </div>
                
                {/* Entity name */}
                <div className="font-mono text-entity-green mb-1">
                  {entry.entityName}
                </div>
                
                {/* Result preview */}
                <div className="text-muted-foreground leading-tight line-clamp-2">
                  {entry.result}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
      
      {/* Stats footer */}
      <div className="p-3 border-t border-border">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-secondary/50 rounded p-2">
            <div className="text-lg font-mono text-goal-gold">
              {entries.filter(e => e.vector === 'GOAL').length}
            </div>
            <div className="text-[9px] text-muted-foreground uppercase">Goals</div>
          </div>
          <div className="bg-secondary/50 rounded p-2">
            <div className="text-lg font-mono text-obstacle-red">
              {entries.filter(e => e.vector === 'OBSTACLE').length}
            </div>
            <div className="text-[9px] text-muted-foreground uppercase">Obstacles</div>
          </div>
          <div className="bg-secondary/50 rounded p-2">
            <div className="text-lg font-mono text-shift-cyan">
              {entries.filter(e => e.vector === 'SHIFT').length}
            </div>
            <div className="text-[9px] text-muted-foreground uppercase">Shifts</div>
          </div>
        </div>
      </div>
    </div>
  );
}
