// RIPPLES: Operative Ecologies - Main Application
// A generative world simulator using the Worldtext aesthetic

import { useWorldState } from '@/hooks/useWorldState';
import { Sidebar } from '@/components/Sidebar';
import { WorldtextViewport } from '@/components/WorldtextViewport';
import { ControlPanel } from '@/components/ControlPanel';
import { AuditLog } from '@/components/AuditLog';
import { Visualization3D } from '@/components/Visualization3D';
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
    ripples,
    isTransitioning,
    crossScenarioRipples,
    emergentPatterns,
    viewMode,
    operationMode,
    showMemory,
    changeScenario,
    selectEntity,
    triggerRipple,
    toggleAutoplay,
    setMode,
    setView,
    toggleMemoryView,
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
          emergentPatterns={emergentPatterns}
          onScenarioChange={changeScenario}
          onEntitySelect={selectEntity}
        />
        
        {/* Center - Viewport */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Viewport header */}
          <div className="bg-card/30 border-b border-border px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {viewMode === 'worldtext' ? 'Worldtext Viewport' : 
                 viewMode === '3d' ? '3D Visualization' : 'Split View'}
              </span>
              <span className="text-[10px] text-muted-foreground">
                |
              </span>
              <span className="text-[10px] text-entity-green font-mono">
                {currentScenario.name}
              </span>
              <span className="text-[10px] text-muted-foreground">
                |
              </span>
              <span className={cn(
                'text-[10px] font-medium',
                operationMode === 'supervised' && 'text-entity-green',
                operationMode === 'unsupervised' && 'text-goal-gold',
                operationMode === 'performance' && 'text-purple-400'
              )}>
                {operationMode === 'supervised' && 'SUPERVISED (Human-in-the-Loop)'}
                {operationMode === 'unsupervised' && 'UNSUPERVISED (Autoplay)'}
                {operationMode === 'performance' && 'PERFORMANCE (Audience Voting)'}
              </span>
            </div>
            <div className="flex items-center gap-4">
              {lastRipple && (
                <span className="text-[10px] animate-fade-in">
                  <span className="text-muted-foreground">Last ripple:</span>{' '}
                  <span className="text-entity-green font-mono">{lastRipple.sourceEntity.name}</span>{' '}
                  <span className={cn(
                    lastRipple.vector === 'GOAL' && 'text-goal-gold',
                    lastRipple.vector === 'OBSTACLE' && 'text-obstacle-red',
                    lastRipple.vector === 'SHIFT' && 'text-shift-cyan'
                  )}>
                    → {lastRipple.vector}
                  </span>
                  {lastRipple.propagationDepth > 0 && (
                    <span className="text-orange-400 ml-1">
                      (+{lastRipple.targetEntities.length} propagated)
                    </span>
                  )}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground font-mono">
                Tick: {tick}
              </span>
            </div>
          </div>
          
          {/* Viewport content */}
          <div className="flex-1 p-4 min-h-0">
            {viewMode === 'worldtext' && (
              <WorldtextViewport
                cells={worldtext}
                selectedEntity={selectedEntity}
                isTransitioning={isTransitioning}
                onEntityClick={selectEntity}
                scenarioEntities={currentScenario.entities}
                showMemory={showMemory}
              />
            )}
            
            {viewMode === '3d' && (
              <div className="w-full h-full terminal-border rounded overflow-hidden">
                <Visualization3D
                  entities={currentScenario.entities}
                  selectedEntity={selectedEntity}
                  lastRipple={lastRipple}
                  showConnections={true}
                  showMemory={showMemory}
                  onEntityClick={selectEntity}
                />
              </div>
            )}
            
            {viewMode === 'split' && (
              <div className="w-full h-full flex gap-4">
                <div className="flex-1">
                  <WorldtextViewport
                    cells={worldtext}
                    selectedEntity={selectedEntity}
                    isTransitioning={isTransitioning}
                    onEntityClick={selectEntity}
                    scenarioEntities={currentScenario.entities}
                    showMemory={showMemory}
                  />
                </div>
                <div className="flex-1 terminal-border rounded overflow-hidden">
                  <Visualization3D
                    entities={currentScenario.entities}
                    selectedEntity={selectedEntity}
                    lastRipple={lastRipple}
                    showConnections={true}
                    showMemory={showMemory}
                    onEntityClick={selectEntity}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Control Panel */}
          <ControlPanel
            selectedEntity={selectedEntity}
            activeVector={activeVector}
            isAutoplay={isAutoplay}
            operationMode={operationMode}
            viewMode={viewMode}
            showMemory={showMemory}
            onVectorClick={triggerRipple}
            onAutoplayToggle={toggleAutoplay}
            onModeChange={setMode}
            onViewChange={setView}
            onMemoryToggle={toggleMemoryView}
          />
        </div>
        
        {/* Right sidebar - Audit Log */}
        <AuditLog
          entries={auditLog}
          tick={tick}
          ripples={ripples}
          crossScenarioRipples={crossScenarioRipples}
          emergentPatterns={emergentPatterns}
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
            Imaginary Relationalities Framework
          </span>
        </div>
        <div className="flex items-center gap-4 text-muted-foreground">
          <span>
            Entities: <span className="text-foreground font-mono">{currentScenario.entities.length}</span>
          </span>
          <span>
            Ripples: <span className="text-foreground font-mono">{ripples.length}</span>
          </span>
          <span>
            Patterns: <span className="text-foreground font-mono">{emergentPatterns.length}</span>
          </span>
          <span>
            Log: <span className="text-foreground font-mono">{auditLog.length}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default App;
