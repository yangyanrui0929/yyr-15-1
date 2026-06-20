import React from 'react';
import type { MagnetComponent } from '@/types';
import { GRID_SIZE } from '@/utils/constants';

interface MagnetProps {
  component: MagnetComponent;
  selected: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

export const Magnet: React.FC<MagnetProps> = ({
  component,
  selected,
  onClick,
  onDoubleClick,
  onMouseDown,
  style,
}) => {
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
      <div className="absolute inset-1 rounded-md">
        {component.isTriggered && (
          <>
            <div
              className="absolute inset-0 rounded-full border-2 border-lab-success/40 animate-magnet-pulse"
              style={{ animationDelay: '0s' }}
            />
            <div
              className="absolute inset-0 rounded-full border-2 border-lab-success/30 animate-magnet-pulse"
              style={{ animationDelay: '0.5s' }}
            />
          </>
        )}
        <div
          className={`w-full h-full rounded-md shadow-lg overflow-hidden flex ${
            component.isTriggered
              ? ''
              : selected
              ? 'ring-2 ring-lab-accent-light ring-offset-2 ring-offset-lab-primary'
              : ''
          }`}
        >
          <div
            className={`flex-1 flex items-center justify-center font-bold text-sm ${
              component.params.polarity === 'N'
                ? component.isTriggered
                  ? 'bg-lab-success'
                  : 'bg-lab-failure'
                : component.isTriggered
                ? 'bg-lab-success/60'
                : 'bg-slate-300'
            } text-lab-primary`}
          >
            N
          </div>
          <div
            className={`flex-1 flex items-center justify-center font-bold text-sm ${
              component.params.polarity === 'S'
                ? component.isTriggered
                  ? 'bg-lab-success'
                  : 'bg-lab-failure'
                : component.isTriggered
                ? 'bg-lab-success/60'
                : 'bg-slate-300'
            } text-lab-primary`}
          >
            S
          </div>
        </div>
      </div>
    </div>
  );
};
