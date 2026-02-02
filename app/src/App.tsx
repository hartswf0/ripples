// RIPPLES: Operative Ecologies - Main Application
// A generative world simulator using the Worldtext aesthetic

import { useWorldState } from '@/hooks/useWorldState';
import { Sidebar } from '@/components/Sidebar';
import { WorldtextViewport } from '@/components/WorldtextViewport';
import { ControlPanel } from '@/components/ControlPanel';
import { AuditLog } from '@/components/AuditLog';
import { cn } from '@/lib/utils';

function App() {
  const {
    tick,
    currentScenario,
    selectedEntity,
    activeVector,
    worldtext,
    auditLog,
    isAutoplay,
    lastRipple,
    isTransitioning,
    changeScenario,
    selectEntity,
    triggerRipple,
    toggleAutoplay,
    allScenarios
  } = useWorldState();

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden">
      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Scenario selection & Entity pool */}
        <Sidebar
          scenarios={allScenarios}
          currentScenario={currentScenario}
          entities={currentScenario.entities}
          selectedEntity={selectedEntity}
          onScenarioChange={changeScenario}
          onEntitySelect={selectEntity}
        />
        
        {/* Center - Worldtext Viewport */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Viewport header */}
          <div className="bg-card/30 border-b border-border px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Worldtext Viewport
              </span>
              <span className="text-[10px] text-muted-foreground">
                |
              </span>
              <span className="text-[10px] text-entity-green font-mono">
                {currentScenario.name}
              </span>
            </div>
            <div className="flex items-center gap-4">
              {lastRipple && (
                <span className="text-[10px] animate-fade-in">
                  <span className="text-muted-foreground">Last ripple:</span>{' '}
                  <span className="text-entity-green font-mono">{lastRipple.entity.name}</span>{' '}
                  <span className={cn(
                    lastRipple.vector === 'GOAL' && 'text-goal-gold',
                    lastRipple.vector === 'OBSTACLE' && 'text-obstacle-red',
                    lastRipple.vector === 'SHIFT' && 'text-shift-cyan'
                  )}>
                    → {lastRipple.vector}
                  </span>
                </span>
              )}
              <span className="text-[10px] text-muted-foreground font-mono">
                Tick: {tick}
              </span>
            </div>
          </div>
          
          {/* Worldtext display */}
          <div className="flex-1 p-4 min-h-0">
            <WorldtextViewport
              cells={worldtext}
              selectedEntity={selectedEntity}
              isTransitioning={isTransitioning}
              onEntityClick={selectEntity}
              scenarioEntities={currentScenario.entities}
            />
          </div>
          
          {/* Control Panel */}
          <ControlPanel
            selectedEntity={selectedEntity}
            activeVector={activeVector}
            isAutoplay={isAutoplay}
            onVectorClick={triggerRipple}
            onAutoplayToggle={toggleAutoplay}
          />
        </div>
        
        {/* Right sidebar - Audit Log */}
        <AuditLog
          entries={auditLog}
          tick={tick}
        />
      </div>
      
      {/* Bottom status bar */}
      <div className="bg-card/50 border-t border-border px-4 py-1.5 flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-4">
          <span className="text-muted-foreground">
            RIPPLES: <span className="text-foreground">Operative Ecologies</span>
          </span>
          <span className="text-muted-foreground">|</span>
          <span className="text-muted-foreground">
            Mode: <span className={cn(
              'font-medium',
              isAutoplay ? 'text-goal-gold' : 'text-entity-green'
            )}>
              {isAutoplay ? 'UNSUPERVISED (Autoplay)' : 'SUPERVISED (Human-in-the-Loop)'}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-4 text-muted-foreground">
          <span>
            Entities: <span className="text-foreground font-mono">{currentScenario.entities.length}</span>
          </span>
          <span>
            Log entries: <span className="text-foreground font-mono">{auditLog.length}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default App;
