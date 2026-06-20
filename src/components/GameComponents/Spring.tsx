import React from 'react';
import type { SpringComponent } from '@/types';
import { GRID_SIZE } from '@/utils/constants';

interface SpringProps {
  component: SpringComponent;
  selected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

export const Spring: React.FC<SpringProps> = ({
  component,
  selected,
  onClick,
  onDoubleClick,
  onMouseDown,
  style,
}) => {
  const rotationMap: Record<SpringComponent['params']['direction'], number> = {
    right: 0,
    down: 90,
    left: 180,
    up: 270,
  };

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
        style={{ transform: `rotate(${rotationMap[component.params.direction]}deg)` }}
      >
        <div
          className={`w-full h-full rounded-md shadow-lg flex items-center justify-center ${
            component.isTriggered
              ? 'bg-gradient-to-br from-lab-success to-lab-success/70 animate-spring-bounce'
              : 'bg-gradient-to-br from-slate-400 to-slate-600'
          } ${selected ? 'ring-2 ring-lab-accent-light ring-offset-2 ring-offset-lab-primary' : ''}`}
        >
          <div className="w-8 h-6 relative">
            <svg viewBox="0 0 40 30" className="w-full h-full">
              <path
                d="M5 15 L10 5 L15 25 L20 5 L25 25 L30 5 L35 15"
                stroke={component.isTriggered ? '#1a1f3a' : '#f0f4f8'}
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="5" cy="15" r="3" fill={component.isTriggered ? '#1a1f3a' : '#d4a853'} />
              <circle cx="35" cy="15" r="3" fill={component.isTriggered ? '#1a1f3a' : '#d4a853'} />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
