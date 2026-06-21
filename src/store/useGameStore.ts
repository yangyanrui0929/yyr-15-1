import { create } from 'zustand';
import type {
  GameComponent,
  Scheme,
  Target,
  TriggerEvent,
  SimulationState,
  ArchiveEntry,
  ComponentType,
  DragState,
} from '@/types';
import { loadSchemes, saveSchemes, loadArchive, saveArchive, generateId } from '@/utils/storage';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/utils/constants';
import { createComponent, findComponentAt } from '@/utils/componentFactory';
import { physicsEngine } from '@/utils/physicsEngine';

interface GameState {
  scheme: Scheme;
  simulation: SimulationState;
  selectedComponentId: string | null;
  schemes: Scheme[];
  archive: ArchiveEntry[];
  dragState: DragState;
  rightPanel: 'targets' | 'timeline' | 'logs' | 'archive';
  showSchemeManager: boolean;

  addComponent: (type: ComponentType, x: number, y: number) => void;
  removeComponent: (id: string) => void;
  moveComponent: (id: string, x: number, y: number) => void;
  rotateComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;
  updateComponentParam: (id: string, params: Record<string, unknown>) => void;

  startSimulation: () => void;
  pauseSimulation: () => void;
  resetSimulation: () => void;
  tickSimulation: (delta: number) => void;
  triggerStartComponent: (id: string) => void;

  setDragState: (state: Partial<DragState>) => void;
  setRightPanel: (panel: GameState['rightPanel']) => void;
  setShowSchemeManager: (show: boolean) => void;

  saveCurrentScheme: (name: string) => void;
  loadScheme: (scheme: Scheme) => void;
  deleteScheme: (id: string) => void;
  newScheme: () => void;
  renameScheme: (id: string, name: string) => void;

  loadStoredSchemes: () => void;
  loadStoredArchive: () => void;
  addArchiveEntry: (entry: Omit<ArchiveEntry, 'id' | 'completedAt'>) => void;
}

function findStartComponent(components: GameComponent[]): GameComponent | null {
  if (components.length === 0) return null;
  const sorted = [...components].sort((a, b) => {
    if (a.x !== b.x) return a.x - b.x;
    return a.y - b.y;
  });
  return sorted[0];
}

function createDefaultScheme(): Scheme {
  const dominoes: GameComponent[] = [];
  for (let i = 1; i <= 14; i++) {
    dominoes.push(createComponent('domino', i, 5));
  }

  return {
    id: generateId(),
    name: '新建实验',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    gridWidth: CANVAS_WIDTH,
    gridHeight: CANVAS_HEIGHT,
    components: dominoes,
    targets: [
      {
        id: generateId(),
        type: 'trigger_component',
        description: '触发终点骨牌 [14,5]',
        componentId: dominoes[dominoes.length - 1].id,
        completed: false,
      },
    ],
  };
}

export const useGameStore = create<GameState>((set, get) => ({
  scheme: createDefaultScheme(),
  simulation: {
    status: 'idle',
    currentTime: 0,
    events: [],
    failureReason: null,
    startTime: null,
  },
  selectedComponentId: null,
  schemes: [],
  archive: [],
  dragState: {
    isDragging: false,
    componentType: null,
    componentId: null,
    offsetX: 0,
    offsetY: 0,
  },
  rightPanel: 'targets',
  showSchemeManager: false,

  addComponent: (type, x, y) => {
    const { scheme, simulation } = get();
    if (simulation.status === 'running') return;
    if (x < 0 || x >= scheme.gridWidth || y < 0 || y >= scheme.gridHeight) return;
    if (findComponentAt(scheme.components, x, y)) return;

    const newComp = createComponent(type, x, y);
    set({
      scheme: {
        ...scheme,
        components: [...scheme.components, newComp],
        updatedAt: Date.now(),
      },
      selectedComponentId: newComp.id,
    });
  },

  removeComponent: (id) => {
    const { scheme, simulation, selectedComponentId } = get();
    if (simulation.status === 'running') return;

    set({
      scheme: {
        ...scheme,
        components: scheme.components.filter((c) => c.id !== id),
        updatedAt: Date.now(),
      },
      selectedComponentId: selectedComponentId === id ? null : selectedComponentId,
    });
  },

  moveComponent: (id, x, y) => {
    const { scheme, simulation } = get();
    if (simulation.status === 'running') return;
    if (x < 0 || x >= scheme.gridWidth || y < 0 || y >= scheme.gridHeight) return;

    const existing = findComponentAt(scheme.components, x, y);
    if (existing && existing.id !== id) return;

    set({
      scheme: {
        ...scheme,
        components: scheme.components.map((c) =>
          c.id === id ? { ...c, x, y } : c
        ),
        updatedAt: Date.now(),
      },
    });
  },

  rotateComponent: (id) => {
    const { scheme, simulation } = get();
    if (simulation.status === 'running') return;

    set({
      scheme: {
        ...scheme,
        components: scheme.components.map((c) => {
          if (c.id !== id) return c;
          const newRotation = ((c.rotation + 90) % 360) as GameComponent['rotation'];
          if (c.type === 'domino') {
            const dirMap: Record<number, 'right' | 'down' | 'left' | 'up'> = {
              0: 'right',
              90: 'down',
              180: 'left',
              270: 'up',
            };
            return {
              ...c,
              rotation: newRotation,
              params: { ...c.params, direction: dirMap[newRotation] },
            };
          }
          if (c.type === 'spring') {
            const dirMap: Record<number, 'right' | 'down' | 'left' | 'up'> = {
              0: 'right',
              90: 'down',
              180: 'left',
              270: 'up',
            };
            return {
              ...c,
              rotation: newRotation,
              params: { ...c.params, direction: dirMap[newRotation] },
            };
          }
          if (c.type === 'delayer') {
            const dirMap: Record<number, 'right' | 'down' | 'left' | 'up'> = {
              0: 'right',
              90: 'down',
              180: 'left',
              270: 'up',
            };
            return {
              ...c,
              rotation: newRotation,
              params: { ...c.params, outputDirection: dirMap[newRotation] },
            };
          }
          return { ...c, rotation: newRotation };
        }) as GameComponent[],
        updatedAt: Date.now(),
      },
    });
  },

  selectComponent: (id) => set({ selectedComponentId: id }),

  updateComponentParam: (id, params) => {
    const { scheme, simulation } = get();
    if (simulation.status === 'running') return;

    set({
      scheme: {
        ...scheme,
        components: scheme.components.map((c) =>
          c.id === id ? { ...c, params: { ...c.params, ...params } } : c
        ) as GameComponent[],
        updatedAt: Date.now(),
      },
    });
  },

  startSimulation: () => {
    const { scheme } = get();
    physicsEngine.reset(scheme.components, scheme.targets);

    const startComp = findStartComponent(scheme.components);
    if (startComp) {
      physicsEngine.triggerComponent(startComp.id);
    }

    const engineState = physicsEngine.getState();

    set({
      scheme: {
        ...scheme,
        components: engineState.components as GameComponent[],
        targets: engineState.targets,
      },
      simulation: {
        status: 'running',
        currentTime: 0,
        events: engineState.events,
        failureReason: null,
        startTime: Date.now(),
      },
    });
  },

  pauseSimulation: () => {
    set((state) => ({
      simulation: { ...state.simulation, status: 'paused' },
    }));
  },

  resetSimulation: () => {
    set((state) => ({
      scheme: {
        ...state.scheme,
        components: state.scheme.components.map((c) => ({
          ...c,
          isTriggered: false,
          triggerTime: null,
          triggeredBy: null,
          animating: false,
        })) as GameComponent[],
      },
      simulation: {
        status: 'idle',
        currentTime: 0,
        events: [],
        failureReason: null,
        startTime: null,
      },
    }));
  },

  tickSimulation: (delta) => {
    const { simulation } = get();
    if (simulation.status !== 'running') return;

    const result = physicsEngine.step(delta);
    const state = physicsEngine.getState();

    set((prev) => {
      let newStatus = prev.simulation.status;
      let failureReason = prev.simulation.failureReason;

      const allTargetsCompleted = state.targets.every((t) => t.completed);

      if (allTargetsCompleted) {
        newStatus = 'completed';
      } else if (result.done && result.failureReason) {
        newStatus = 'failed';
        failureReason = result.failureReason;
      }

      const newState = {
        scheme: {
          ...prev.scheme,
          components: state.components as GameComponent[],
          targets: state.targets,
        },
        simulation: {
          ...prev.simulation,
          status: newStatus,
          currentTime: state.currentTime,
          events: state.events,
          failureReason,
        },
      };

      if (newStatus === 'completed' || newStatus === 'failed') {
        get().addArchiveEntry({
          schemeId: prev.scheme.id,
          schemeName: prev.scheme.name,
          duration: state.currentTime,
          componentCount: state.components.length,
          triggerCount: state.components.filter((c) => c.isTriggered).length,
          success: newStatus === 'completed',
          failureReason: failureReason || undefined,
        });
      }

      return newState;
    });
  },

  triggerStartComponent: (id) => {
    const { simulation } = get();
    if (simulation.status !== 'running') return;
    physicsEngine.triggerComponent(id);
  },

  setDragState: (state) =>
    set((prev) => ({
      dragState: { ...prev.dragState, ...state },
    })),

  setRightPanel: (panel) => set({ rightPanel: panel }),
  setShowSchemeManager: (show) => set({ showSchemeManager: show }),

  saveCurrentScheme: (name) => {
    const { scheme, schemes } = get();
    const updatedScheme = { ...scheme, name, updatedAt: Date.now() };
    const existingIdx = schemes.findIndex((s) => s.id === scheme.id);
    let newSchemes: Scheme[];
    if (existingIdx >= 0) {
      newSchemes = [...schemes];
      newSchemes[existingIdx] = updatedScheme;
    } else {
      newSchemes = [...schemes, updatedScheme];
    }
    saveSchemes(newSchemes);
    set({ scheme: updatedScheme, schemes: newSchemes });
  },

  loadScheme: (scheme) => {
    set({
      scheme: {
        ...scheme,
        components: scheme.components.map((c) => ({
          ...c,
          isTriggered: false,
          triggerTime: null,
          triggeredBy: null,
          animating: false,
        })) as GameComponent[],
        targets: scheme.targets.map((t) => ({ ...t, completed: false })),
      },
      simulation: {
        status: 'idle',
        currentTime: 0,
        events: [],
        failureReason: null,
        startTime: null,
      },
      selectedComponentId: null,
      showSchemeManager: false,
    });
  },

  deleteScheme: (id) => {
    const { schemes } = get();
    const newSchemes = schemes.filter((s) => s.id !== id);
    saveSchemes(newSchemes);
    set({ schemes: newSchemes });
  },

  newScheme: () => {
    set({
      scheme: createDefaultScheme(),
      simulation: {
        status: 'idle',
        currentTime: 0,
        events: [],
        failureReason: null,
        startTime: null,
      },
      selectedComponentId: null,
      showSchemeManager: false,
    });
  },

  renameScheme: (id, name) => {
    const { schemes } = get();
    const newSchemes = schemes.map((s) =>
      s.id === id ? { ...s, name, updatedAt: Date.now() } : s
    );
    saveSchemes(newSchemes);
    set({ schemes: newSchemes });
  },

  loadStoredSchemes: () => {
    set({ schemes: loadSchemes() });
  },

  loadStoredArchive: () => {
    set({ archive: loadArchive() });
  },

  addArchiveEntry: (entry) => {
    const { archive } = get();
    const newEntry: ArchiveEntry = {
      ...entry,
      id: generateId(),
      completedAt: Date.now(),
    };
    const newArchive = [newEntry, ...archive].slice(0, 50);
    saveArchive(newArchive);
    set({ archive: newArchive });
  },
}));
