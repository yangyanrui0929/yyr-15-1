import React, { useRef, useState, useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { GRID_SIZE } from '@/utils/constants';
import { Domino } from '@/components/GameComponents/Domino';
import { Spring } from '@/components/GameComponents/Spring';
import { Magnet } from '@/components/GameComponents/Magnet';
import { Delayer } from '@/components/GameComponents/Delayer';
import type { GameComponent, ComponentType } from '@/types';

export const GameCanvas: React.FC = () => {
  const {
    scheme,
    selectedComponentId,
    simulation,
    dragState,
    addComponent,
    moveComponent,
    removeComponent,
    rotateComponent,
    selectComponent,
    setDragState,
    triggerStartComponent,
  } = useGameStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [draggingExisting, setDraggingExisting] = useState<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  const gridWidth = scheme.gridWidth * GRID_SIZE;
  const gridHeight = scheme.gridHeight * GRID_SIZE;

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
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponentId, simulation.status, removeComponent, rotateComponent, selectComponent]);

  const getGridPosition = (e: React.DragEvent | React.MouseEvent) => {
    if (!canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / GRID_SIZE);
    const y = Math.floor((e.clientY - rect.top) / GRID_SIZE);
    if (x < 0 || x >= scheme.gridWidth || y < 0 || y >= scheme.gridHeight) return null;
    return { x, y };
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOver(true);
    const pos = getGridPosition(e);
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
    const pos = getGridPosition(e);

    if (componentType && pos && simulation.status !== 'running') {
      addComponent(componentType, pos.x, pos.y);
    } else if (draggingExisting && pos) {
      moveComponent(draggingExisting.id, pos.x, pos.y);
      setDraggingExisting(null);
    }

    setDragState({
      isDragging: false,
      componentType: null,
      componentId: null,
    });
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).dataset.grid === 'true') {
      selectComponent(null);
    }
  };

  const handleComponentClick = (comp: GameComponent) => {
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
    e.stopPropagation();

    setDraggingExisting({
      id: comp.id,
      offsetX: e.clientX,
      offsetY: e.clientY,
    });
    setDragState({
      isDragging: true,
      componentType: null,
      componentId: comp.id,
      offsetX: 0,
      offsetY: 0,
    });
    selectComponent(comp.id);
  };

  const renderComponent = (comp: GameComponent) => {
    const commonProps = {
      component: comp as never,
      selected: comp.id === selectedComponentId,
      onClick: () => handleComponentClick(comp),
      onDoubleClick: () => handleComponentDoubleClick(comp),
      onMouseDown: (e: React.MouseEvent) => handleComponentMouseDown(e, comp),
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
        className={`relative rounded-lg shadow-2xl transition-all ${
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
          <div className="absolute top-2 left-2 px-3 py-1 rounded-full bg-lab-success/90 text-lab-primary text-xs font-bold font-mono">
            ▶ 模拟中 {simulation.currentTime.toFixed(2)}s
          </div>
        )}

        {simulation.status === 'completed' && (
          <div className="absolute inset-0 flex items-center justify-center bg-lab-primary/80 rounded-lg z-30">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <div className="font-cinzel text-lab-success text-3xl font-bold mb-2">
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
            <div className="text-center">
              <div className="text-6xl mb-4">💥</div>
              <div className="font-cinzel text-lab-failure text-3xl font-bold mb-2">
                实验失败
              </div>
              <div className="text-lab-muted font-mono text-sm max-w-xs">
                {simulation.failureReason}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
