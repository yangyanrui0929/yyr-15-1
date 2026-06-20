import React from 'react';
import type { DelayerComponent } from '@/types';
import { GRID_SIZE } from '@/utils/constants';

interface DelayerProps {
  component: DelayerComponent;
  selected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

export const Delayer: React.FC<DelayerProps> = ({
  component,
  selected,
  onClick,
  onDoubleClick,
  onMouseDown,
  style,
}) => {
  const rotationMap: Record<DelayerComponent['params']['outputDirection'], number> = {
    right: 0,
    down: 90,
    left: 180,
    up: 270,
  };

  const progress = component.isTriggered && component.triggerTime !== null
    ? Math.min(1, (Date.now() / 1000 - component.triggerTime) / component.params.delayTime)
    : 0;

  return (
    <div
      className={`absolute cursor-pointer select-none ${selected ? 'z-20' : 'z-10'}`}
      style={{
        left: component.x * GRID_SIZE,
        top: component.y * GRID_SIZE,
        width: GRID_SIZE,
        height: GRID_SIZE,
        ...style,
      }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseDown={onMouseDown}
    >
      <div
        className="absolute inset-1 rounded-md transition-transform"
        style={{ transform: `rotate(${rotationMap[component.params.outputDirection]}deg)` }}
      >
        <div
          className={`w-full h-full rounded-md shadow-lg flex items-center justify-center relative ${
            component.isTriggered
              ? 'bg-gradient-to-br from-lab-success to-lab-success/70'
              : 'bg-gradient-to-br from-purple-500 to-purple-700'
          } ${selected ? 'ring-2 ring-lab-accent-light ring-offset-2 ring-offset-lab-primary' : ''}`}
        >
          <svg viewBox="0 0 36 36" className="w-8 h-8 -rotate-90">
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="rgba(240, 244, 248, 0.2)"
              strokeWidth="3"
            />
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="#f0f4f8"
              strokeWidth="3"
              strokeDasharray="94.2"
              strokeDashoffset={component.isTriggered ? 94.2 * (1 - progress) : 94.2}
              strokeLinecap="round"
              className="transition-all duration-100"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lab-text text-xs font-mono font-bold">
              {component.params.delayTime}s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
