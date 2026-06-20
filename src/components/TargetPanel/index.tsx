import React from 'react';
import { Check, X, Plus } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { generateId } from '@/utils/storage';

export const TargetPanel: React.FC = () => {
  const { scheme, simulation, selectedComponentId } = useGameStore();
  const isEditing = simulation.status === 'idle';

  const addTarget = () => {
    if (!isEditing) return;
    const targetComp = scheme.components.find((c) => c.id === selectedComponentId);

    const newTarget = targetComp
      ? {
          id: generateId(),
          type: 'trigger_component' as const,
          description: `触发 ${targetComp.type === 'domino' ? '骨牌' : targetComp.type === 'spring' ? '弹簧' : targetComp.type === 'magnet' ? '磁石' : '延时器'} [${targetComp.x},${targetComp.y}]`,
          componentId: targetComp.id,
          completed: false,
        }
      : {
          id: generateId(),
          type: 'all_triggered' as const,
          description: '触发所有可触发组件',
          completed: false,
        };

    useGameStore.setState((state) => ({
      scheme: {
        ...state.scheme,
        targets: [...state.scheme.targets, newTarget],
        updatedAt: Date.now(),
      },
    }));
  };

  const removeTarget = (id: string) => {
    if (!isEditing) return;
    useGameStore.setState((state) => ({
      scheme: {
        ...state.scheme,
        targets: state.scheme.targets.filter((t) => t.id !== id),
        updatedAt: Date.now(),
      },
    }));
  };

  const completedCount = scheme.targets.filter((t) => t.completed).length;

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-lab-accent/20 flex items-center justify-between">
        <div>
          <h3 className="font-cinzel text-lab-accent font-bold text-sm tracking-wider">
            实验目标
          </h3>
          <p className="text-lab-muted text-xs mt-1">
            进度 {completedCount}/{scheme.targets.length}
          </p>
        </div>
        {isEditing && (
          <button
            onClick={addTarget}
            className="p-1.5 rounded-md bg-lab-accent/20 text-lab-accent hover:bg-lab-accent/30 transition-colors"
            title="添加目标"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      <div className="flex-1 p-3 space-y-2 overflow-y-auto">
        {scheme.targets.length === 0 && (
          <div className="text-lab-muted text-xs text-center py-8">
            {isEditing ? '点击 + 添加目标' : '暂无目标'}
          </div>
        )}

        {scheme.targets.map((target) => (
          <div
            key={target.id}
            className={`p-3 rounded-lg border transition-all group ${
              target.completed
                ? 'bg-lab-success/10 border-lab-success/30'
                : 'bg-lab-primary/50 border-lab-accent/20'
            }`}
          >
            <div className="flex items-start gap-2">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  target.completed
                    ? 'bg-lab-success text-lab-primary'
                    : 'bg-lab-neutral/30 text-lab-muted'
                }`}
              >
                {target.completed ? <Check size={12} /> : <div className="w-2 h-2 rounded-full bg-current" />}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm ${
                    target.completed ? 'text-lab-success line-through' : 'text-lab-text'
                  }`}
                >
                  {target.description}
                </p>
                <p className="text-lab-muted text-xs mt-1">
                  类型：
                  {target.type === 'trigger_component'
                    ? '触发指定组件'
                    : target.type === 'all_triggered'
                    ? '全部触发'
                    : '限时挑战'}
                </p>
              </div>
              {isEditing && (
                <button
                  onClick={() => removeTarget(target.id)}
                  className="p-1 rounded text-lab-muted hover:text-lab-failure hover:bg-lab-failure/10 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isEditing && (
        <div className="p-3 border-t border-lab-accent/20">
          <div className="text-lab-muted text-xs">
            <p>💡 提示：选中组件后点击 + 可添加"触发该组件"目标</p>
          </div>
        </div>
      )}
    </div>
  );
};
