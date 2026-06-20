import type { ComponentDefinition } from '@/types';

export const GRID_SIZE = 50;
export const CANVAS_WIDTH = 16;
export const CANVAS_HEIGHT = 10;

export const COMPONENT_DEFINITIONS: ComponentDefinition[] = [
  {
    type: 'domino',
    name: '骨牌',
    description: '被触发后会向指定方向倒下，撞倒相邻的骨牌',
    icon: 'rectangle-vertical',
    defaultParams: {
      direction: 'right',
      fallDuration: 0.4,
    },
  },
  {
    type: 'spring',
    name: '弹簧',
    description: '被触发后会弹开，强力推动指定方向的组件',
    icon: 'arrow-right-left',
    defaultParams: {
      power: 2,
      direction: 'right',
    },
  },
  {
    type: 'magnet',
    name: '磁石',
    description: '被触发后产生磁力，吸引范围内的金属骨牌',
    icon: 'magnet',
    defaultParams: {
      polarity: 'N',
      range: 2,
    },
  },
  {
    type: 'delayer',
    name: '延时器',
    description: '接收信号后延迟指定时间再向输出方向传递',
    icon: 'timer',
    defaultParams: {
      delayTime: 1.5,
      outputDirection: 'right',
    },
  },
];

export const STORAGE_KEYS = {
  SCHEMES: 'domino-lab-schemes',
  ARCHIVE: 'domino-lab-archive',
  CURRENT_SCHEME: 'domino-lab-current',
};
