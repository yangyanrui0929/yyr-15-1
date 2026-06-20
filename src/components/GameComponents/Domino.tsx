import React from 'react';
import type { DominoComponent } from '@/types';
import { GRID_SIZE } from '@/utils/constants';

interface DominoProps {
  component: DominoComponent;
  selected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

export const Domino: React.FC<DominoProps> = ({
  component,
  selected,
  onClick,
  onDoubleClick,
  onMouseDown,
  style,
}) => {
  const rotationMap: Record<DominoComponent['params']['direction'], number> = {
    right: 0,
    down: 90,
    left: 180,
    up: 270,
  };

  const directionRotation = rotationMap[component.params.direction];
  const fallRotation = component.isTriggered ? 90 : 0;

  return (
    <div
      className={`absolute cursor-pointer select-none transition-all duration-200 ${
        selected ? 'z-20' : 'z-10'
      }`}
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
        className={`absolute inset-1 rounded-sm transition-transform duration-300 origin-bottom-left ${
          component.isTriggered ? 'animate-fall' : ''
        }`}
        style={{
          transform: `rotate(${directionRotation}deg)`,
          transformOrigin: 'center center',
        }}
      >
        <div
          className={`w-full h-full rounded-sm shadow-lg ${
            component.isTriggered
              ? 'bg-gradient-to-br from-lab-success to-lab-success/70'
              : 'bg-gradient-to-br from-lab-accent to-lab-accent/70'
          } ${selected ? 'ring-2 ring-lab-accent-light ring-offset-2 ring-offset-lab-primary' : ''}`}
          style={{
            transform: component.isTriggered ? `rotate(${fallRotation}deg)` : 'none',
            transformOrigin: 'bottom right',
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1 h-6 bg-lab-primary/40 rounded-full" />
          </div>
          <div
            className="absolute -right-1 top-1/2 -translate-y-1/2 w-0 h-0"
            style={{
              borderTop: '4px solid transparent',
              borderBottom: '4px solid transparent',
              borderLeft: '6px solid rgba(26, 31, 58, 0.6)',
            }}
          />
        </div>
      </div>
    </div>
  );
};
