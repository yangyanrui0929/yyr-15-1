export type ComponentType = 'domino' | 'spring' | 'magnet' | 'delayer';

export type Direction = 'left' | 'right' | 'up' | 'down';

export interface BaseComponent {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  rotation: 0 | 90 | 180 | 270;
  isTriggered: boolean;
  triggerTime: number | null;
  triggeredBy: string | null;
  animating: boolean;
}

export interface DominoComponent extends BaseComponent {
  type: 'domino';
  params: {
    direction: Direction;
    fallDuration: number;
  };
}

export interface SpringComponent extends BaseComponent {
  type: 'spring';
  params: {
    power: number;
    direction: Direction;
  };
}

export interface MagnetComponent extends BaseComponent {
  type: 'magnet';
  params: {
    polarity: 'N' | 'S';
    range: number;
  };
}

export interface DelayerComponent extends BaseComponent {
  type: 'delayer';
  params: {
    delayTime: number;
    outputDirection: Direction;
  };
}

export type GameComponent = DominoComponent | SpringComponent | MagnetComponent | DelayerComponent;

export interface Target {
  id: string;
  type: 'trigger_component' | 'all_triggered' | 'time_limit';
  description: string;
  componentId?: string;
  maxTime?: number;
  completed: boolean;
}

export type EventType = 'trigger' | 'fall' | 'spring_push' | 'magnet_pull' | 'delay_start' | 'delay_end' | 'success' | 'failure';

export interface TriggerEvent {
  id: string;
  timestamp: number;
  sourceId: string | null;
  targetId: string | null;
  eventType: EventType;
  description: string;
}

export interface Scheme {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  gridWidth: number;
  gridHeight: number;
  components: GameComponent[];
  targets: Target[];
}

export interface ArchiveEntry {
  id: string;
  schemeId: string;
  schemeName: string;
  completedAt: number;
  duration: number;
  componentCount: number;
  triggerCount: number;
  success: boolean;
  failureReason?: string;
}

export type SimulationStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed';

export interface SimulationState {
  status: SimulationStatus;
  currentTime: number;
  events: TriggerEvent[];
  failureReason: string | null;
  startTime: number | null;
}

export interface ComponentDefinition {
  type: ComponentType;
  name: string;
  description: string;
  icon: string;
  defaultParams: GameComponent['params'];
}

export interface DragState {
  isDragging: boolean;
  componentType: ComponentType | null;
  componentId: string | null;
  offsetX: number;
  offsetY: number;
}
