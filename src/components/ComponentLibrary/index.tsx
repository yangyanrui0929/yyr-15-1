import React from 'react';
import { RectangleVertical, ArrowRightLeft, Magnet, Timer } from 'lucide-react';
import { COMPONENT_DEFINITIONS } from '@/utils/constants';
import { useGameStore } from '@/store/useGameStore';
import type { ComponentType } from '@/types';

const iconMap: Record<ComponentType, React.ReactNode> = {
  domino: <RectangleVertical size={24} />,
  spring: <ArrowRightLeft size={24} />,
  magnet: <Magnet size={24} />,
  delayer: <Timer size={24} />,
};

export const ComponentLibrary: React.FC = () => {
  const { setDragState, simulation } = useGameStore();
  const disabled = simulation.status === 'running';

  const handleDragStart = (e: React.DragEvent, type: ComponentType) => {
    if (disabled) return;
    e.dataTransfer.setData('componentType', type);
    e.dataTransfer.effectAllowed = 'copy';
    setDragState({
      isDragging: true,
      componentType: type,
      componentId: null,
      offsetX: 0,
      offsetY: 0,
    });
  };

  const handleDragEnd = () => {
    setDragState({
      isDragging: false,
      componentType: null,
      componentId: null,
    });
  };

  return (
    <div className="w-56 bg-lab-secondary border-r border-lab-accent/20 flex flex-col h-full">
      <div className="p-4 border-b border-lab-accent/20">
        <h2 className="font-cinzel text-lab-accent text-lg font-bold tracking-wider">
          组件库
        </h2>
        <p className="text-lab-muted text-xs mt-1">拖拽组件到画布</p>
      </div>

      <div className="flex-1 p-3 space-y-3 overflow-y-auto">
        {COMPONENT_DEFINITIONS.map((def) => (
          <div
            key={def.type}
            draggable={!disabled}
            onDragStart={(e) => handleDragStart(e, def.type)}
            onDragEnd={handleDragEnd}
            className={`p-3 rounded-lg border transition-all cursor-grab active:cursor-grabbing ${
              disabled
                ? 'opacity-50 cursor-not-allowed border-lab-neutral/30'
                : 'border-lab-accent/30 bg-lab-primary/50 hover:border-lab-accent hover:bg-lab-primary hover:shadow-lg hover:shadow-lab-accent/10 hover:-translate-y-0.5'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-md flex items-center justify-center ${
                  disabled
                    ? 'bg-lab-neutral/30 text-lab-muted'
                    : 'bg-lab-accent/20 text-lab-accent'
                }`}
              >
                {iconMap[def.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-lab-text font-semibold text-sm">{def.name}</div>
                <div className="text-lab-muted text-xs mt-0.5 line-clamp-2">
                  {def.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-lab-accent/20">
        <div className="text-lab-muted text-xs space-y-1">
          <p className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-lab-accent" />
            单击选中组件
          </p>
          <p className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-lab-success" />
            双击旋转组件
          </p>
          <p className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-lab-failure" />
            Delete 删除组件
          </p>
        </div>
      </div>
    </div>
  );
};
