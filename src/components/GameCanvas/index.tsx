import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { GRID_SIZE } from '@/utils/constants';
import { Domino } from '@/components/GameComponents/Domino';
import { Spring } from '@/components/GameComponents/Spring';
import { Magnet } from '@/components/GameComponents/Magnet';
import { Delayer } from '@/components/GameComponents/Delayer';
import type { GameComponent, ComponentType } from '@/types';

const MOVE_THRESHOLD = 5;

export const GameCanvas: React.FC = () => {
  const {
    scheme,
    selectedComponentId,
    simulation,
    addComponent,
    moveComponent,
    removeComponent,
    rotateComponent,
    selectComponent,
    triggerStartComponent,
  } = useGameStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  const movingIdRef = useRef<string | null>(null);
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const didMoveRef = useRef(false);
  const [, forceRender] = useState(0);
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);

  const gridWidth = scheme.gridWidth * GRID_SIZE;
  const gridHeight = scheme.gridHeight * GRID_SIZE;

  const getGridPosition = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((clientX - rect.left) / GRID_SIZE);
    const y = Math.floor((clientY - rect.top) / GRID_SIZE);
    if (x < 0 || x >= scheme.gridWidth || y < 0 || y >= scheme.gridHeight) return null;
    return { x, y };
  }, [scheme.gridWidth, scheme.gridHeight]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedComponentId && simulation.status !== 'running') {
          removeComponent(selectedComponentId);
        }
      }
      if (e.key === 'r' || e.key === 'R') {
        if (selectedComponentId && simulation.status !== 'running') {
          rotateComponent(selectedComponentId);
        }
      }
      if (e.key === 'Escape') {
        selectComponent(null);
        movingIdRef.current = null;
        setGhostPos(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponentId, simulation.status, removeComponent, rotateComponent, selectComponent]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!movingIdRef.current) return;
      const pos = getGridPosition(e.clientX, e.clientY);

      if (startPosRef.current && !didMoveRef.current) {
        const dx = e.clientX - startPosRef.current.x;
        const dy = e.clientY - startPosRef.current.y;
        if (Math.abs(dx) > MOVE_THRESHOLD || Math.abs(dy) > MOVE_THRESHOLD) {
          didMoveRef.current = true;
        }
      }

      if (pos) {
        setGhostPos(pos);
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      const id = movingIdRef.current;
      const moved = didMoveRef.current;
      movingIdRef.current = null;
      startPosRef.current = null;
      didMoveRef.current = false;

      if (id && moved) {
        const pos = getGridPosition(e.clientX, e.clientY);
        if (pos) {
          moveComponent(id, pos.x, pos.y);
        }
      }
      setGhostPos(null);
      forceRender((n) => n + 1);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [getGridPosition, moveComponent]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOver(true);
    const pos = getGridPosition(e.clientX, e.clientY);
    setHoverPos(pos);
  };

  const handleDragLeave = () => {
    setDragOver(false);
    setHoverPos(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setHoverPos(null);

    const componentType = e.dataTransfer.getData('componentType') as ComponentType;
    const pos = getGridPosition(e.clientX, e.clientY);

    if (componentType && pos && simulation.status !== 'running') {
      addComponent(componentType, pos.x, pos.y);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (
      e.target === canvasRef.current ||
      (e.target as HTMLElement).dataset.grid === 'true'
    ) {
      selectComponent(null);
    }
  };

  const handleComponentClick = (comp: GameComponent) => {
    if (didMoveRef.current) return;
    if (simulation.status === 'running') {
      if (!comp.isTriggered) {
        triggerStartComponent(comp.id);
      }
    } else {
      selectComponent(comp.id === selectedComponentId ? null : comp.id);
    }
  };

  const handleComponentDoubleClick = (comp: GameComponent) => {
    if (simulation.status !== 'running') {
      rotateComponent(comp.id);
    }
  };

  const handleComponentMouseDown = (e: React.MouseEvent, comp: GameComponent) => {
    if (simulation.status === 'running') return;
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();

    movingIdRef.current = comp.id;
    startPosRef.current = { x: e.clientX, y: e.clientY };
    didMoveRef.current = false;
    setGhostPos({ x: comp.x, y: comp.y });
    selectComponent(comp.id);
    forceRender((n) => n + 1);
  };

  const isBeingMoved = (id: string) => movingIdRef.current === id && didMoveRef.current;

  const renderComponent = (comp: GameComponent) => {
    const commonProps = {
      component: comp as never,
      selected: comp.id === selectedComponentId,
      onClick: () => handleComponentClick(comp),
      onDoubleClick: () => handleComponentDoubleClick(comp),
      onMouseDown: (e: React.MouseEvent) => handleComponentMouseDown(e, comp),
      style: isBeingMoved(comp.id) ? { opacity: 0.3 } as React.CSSProperties : undefined,
    };

    switch (comp.type) {
      case 'domino':
        return <Domino key={comp.id} {...commonProps} component={comp} />;
      case 'spring':
        return <Spring key={comp.id} {...commonProps} component={comp} />;
      case 'magnet':
        return <Magnet key={comp.id} {...commonProps} component={comp} />;
      case 'delayer':
        return <Delayer key={comp.id} {...commonProps} component={comp} />;
    }
  };

  const isSimRunning = simulation.status === 'running';

  return (
    <div className="flex-1 flex items-center justify-center bg-lab-primary/50 p-8 overflow-auto">
      <div
        ref={canvasRef}
        className={`relative rounded-lg shadow-2xl transition-all select-none ${
          isSimRunning ? 'animate-pulse-glow' : ''
        } ${dragOver ? 'ring-2 ring-lab-accent ring-offset-4 ring-offset-lab-primary' : ''}`}
        style={{
          width: gridWidth,
          height: gridHeight,
          backgroundImage: `
            linear-gradient(rgba(212, 168, 83, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212, 168, 83, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
          backgroundColor: '#1a1f3a',
          border: '2px solid rgba(212, 168, 83, 0.3)',
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleCanvasClick}
      >
        <div data-grid="true" className="absolute inset-0 pointer-events-none">
          {Array.from({ length: scheme.gridWidth + 1 }).map((_, i) => (
            <div
              key={`v-${i}`}
              className="absolute top-0 bottom-0 border-l border-lab-accent/10"
              style={{ left: i * GRID_SIZE }}
              data-grid="true"
            />
          ))}
          {Array.from({ length: scheme.gridHeight + 1 }).map((_, i) => (
            <div
              key={`h-${i}`}
              className="absolute left-0 right-0 border-t border-lab-accent/10"
              style={{ top: i * GRID_SIZE }}
              data-grid="true"
            />
          ))}
        </div>

        {hoverPos && !isSimRunning && (
          <div
            className="absolute pointer-events-none rounded-md border-2 border-lab-accent border-dashed bg-lab-accent/10"
            style={{
              left: hoverPos.x * GRID_SIZE + 2,
              top: hoverPos.y * GRID_SIZE + 2,
              width: GRID_SIZE - 4,
              height: GRID_SIZE - 4,
            }}
            data-grid="true"
          />
        )}

        {ghostPos && movingIdRef.current && didMoveRef.current && (
          <div
            className="absolute pointer-events-none rounded-md border-2 border-lab-success border-solid bg-lab-success/20 z-30"
            style={{
              left: ghostPos.x * GRID_SIZE + 2,
              top: ghostPos.y * GRID_SIZE + 2,
              width: GRID_SIZE - 4,
              height: GRID_SIZE - 4,
            }}
            data-grid="true"
          />
        )}

        {scheme.targets.map((target) => {
          if (target.type !== 'trigger_component' || !target.componentId) return null;
          const comp = scheme.components.find((c) => c.id === target.componentId);
          if (!comp) return null;
          return (
            <div
              key={`target-${target.id}`}
              className={`absolute pointer-events-none rounded-md transition-all ${
                target.completed
                  ? 'border-lab-success bg-lab-success/20'
                  : 'border-lab-failure bg-lab-failure/10 animate-pulse'
              }`}
              style={{
                left: comp.x * GRID_SIZE - 4,
                top: comp.y * GRID_SIZE - 4,
                width: GRID_SIZE + 8,
                height: GRID_SIZE + 8,
                border: '3px dashed',
              }}
              data-grid="true"
            />
          );
        })}

        {scheme.components.map(renderComponent)}

        {isSimRunning && (
          <div className="absolute top-2 left-2 px-3 py-1 rounded-full bg-lab-success/90 text-lab-primary text-xs font-bold font-mono z-20">
            {simulation.currentTime.toFixed(2)}s
          </div>
        )}

        {simulation.status === 'completed' && (
          <div className="absolute inset-0 flex items-center justify-center bg-lab-primary/80 rounded-lg z-30">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <div className="font-cinzel text-lab-success text-3xl font-bold mb-2"
                style={{ fontFamily: "'Microsoft YaHei', 'PingFang SC', 'Cinzel', serif" }}>
                实验成功！
              </div>
              <div className="text-lab-muted font-mono">
                用时 {simulation.currentTime.toFixed(2)}s
              </div>
            </div>
          </div>
        )}

        {simulation.status === 'failed' && (
          <div className="absolute inset-0 flex items-center justify-center bg-lab-primary/80 rounded-lg z-30">
            <div className="text-center px-4">
              <div className="text-6xl mb-4">💥</div>
              <div
                className="font-cinzel text-lab-failure text-3xl font-bold mb-2"
                style={{ fontFamily: "'Microsoft YaHei', 'PingFang SC', 'Cinzel', serif" }}
              >
                实验失败
              </div>
              <div className="text-lab-muted text-sm max-w-xs">
                {simulation.failureReason}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
