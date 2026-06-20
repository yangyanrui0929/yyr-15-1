import type { GameComponent, Direction } from '@/types';
import { COMPONENT_DEFINITIONS } from './constants';
import { generateId } from './storage';

export function createComponent(
  type: GameComponent['type'],
  x: number,
  y: number
): GameComponent {
  const def = COMPONENT_DEFINITIONS.find((d) => d.type === type)!;

  const base = {
    id: generateId(),
    type,
    x,
    y,
    rotation: 0 as const,
    isTriggered: false,
    triggerTime: null,
    triggeredBy: null,
    animating: false,
  };

  switch (type) {
    case 'domino':
      return {
        ...base,
        type: 'domino' as const,
        params: { direction: 'right' as Direction, fallDuration: 0.4 },
      };
    case 'spring':
      return {
        ...base,
        type: 'spring' as const,
        params: { power: 2, direction: 'right' as Direction },
      };
    case 'magnet':
      return {
        ...base,
        type: 'magnet' as const,
        params: { polarity: 'N' as const, range: 2 },
      };
    case 'delayer':
      return {
        ...base,
        type: 'delayer' as const,
        params: { delayTime: 1.5, outputDirection: 'right' as Direction },
      };
  }
}

export function directionToOffset(direction: Direction): { dx: number; dy: number } {
  switch (direction) {
    case 'left':
      return { dx: -1, dy: 0 };
    case 'right':
      return { dx: 1, dy: 0 };
    case 'up':
      return { dx: 0, dy: -1 };
    case 'down':
      return { dx: 0, dy: 1 };
  }
}

export function rotationToDirection(rotation: number): Direction {
  const r = ((rotation % 360) + 360) % 360;
  switch (r) {
    case 0:
      return 'right';
    case 90:
      return 'down';
    case 180:
      return 'left';
    case 270:
      return 'up';
    default:
      return 'right';
  }
}

export function getEffectiveDirection(comp: GameComponent): Direction {
  if (comp.type === 'domino') {
    return comp.params.direction;
  }
  if (comp.type === 'spring') {
    return comp.params.direction;
  }
  if (comp.type === 'delayer') {
    return comp.params.outputDirection;
  }
  return rotationToDirection(comp.rotation);
}

export function findComponentAt(
  components: GameComponent[],
  x: number,
  y: number
): GameComponent | undefined {
  return components.find((c) => c.x === x && c.y === y);
}

export function getComponentInDirection(
  components: GameComponent[],
  fromX: number,
  fromY: number,
  direction: Direction,
  distance: number = 1
): GameComponent | undefined {
  const { dx, dy } = directionToOffset(direction);
  return findComponentAt(components, fromX + dx * distance, fromY + dy * distance);
}

export function getComponentsInRange(
  components: GameComponent[],
  centerX: number,
  centerY: number,
  range: number
): GameComponent[] {
  return components.filter((c) => {
    const dist = Math.abs(c.x - centerX) + Math.abs(c.y - centerY);
    return dist > 0 && dist <= range;
  });
}
