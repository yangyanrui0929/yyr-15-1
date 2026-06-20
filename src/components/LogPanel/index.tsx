import React, { useRef, useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { formatTime } from '@/utils/storage';
import type { TriggerEvent } from '@/types';

const eventTypeLabels: Record<TriggerEvent['eventType'], string> = {
  trigger: '触发',
  fall: '倒下',
  spring_push: '弹簧',
  magnet_pull: '磁力',
  delay_start: '延时开始',
  delay_end: '延时结束',
  success: '成功',
  failure: '失败',
};

const eventTypeColors: Record<TriggerEvent['eventType'], string> = {
  trigger: 'bg-lab-success/20 text-lab-success border-lab-success/30',
  fall: 'bg-lab-accent/20 text-lab-accent border-lab-accent/30',
  spring_push: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  magnet_pull: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  delay_start: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  delay_end: 'bg-green-500/20 text-green-400 border-green-500/30',
  success: 'bg-lab-success/20 text-lab-success border-lab-success/30',
  failure: 'bg-lab-failure/20 text-lab-failure border-lab-failure/30',
};

export const LogPanel: React.FC = () => {
  const { simulation, scheme, selectComponent } = useGameStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [simulation.events.length]);

  const getComponentInfo = (id: string | null) => {
    if (!id) return null;
    const comp = scheme.components.find((c) => c.id === id);
    if (!comp) return null;
    const typeName =
      comp.type === 'domino' ? '骨牌' : comp.type === 'spring' ? '弹簧' : comp.type === 'magnet' ? '磁石' : '延时器';
    return { comp, typeName };
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-lab-accent/20 flex items-center justify-between">
        <div>
          <h3 className="font-cinzel text-lab-accent font-bold text-sm tracking-wider">
            触发日志
          </h3>
          <p className="text-lab-muted text-xs mt-1">共 {simulation.events.length} 条记录</p>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              simulation.status === 'running' ? 'bg-lab-success animate-pulse' : 'bg-lab-neutral'
            }`}
          />
          <span className="text-lab-muted">
            {simulation.status === 'running'
              ? '记录中'
              : simulation.status === 'idle'
              ? '空闲'
              : simulation.status === 'completed'
              ? '完成'
              : '已停止'}
          </span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 font-mono text-xs">
        {simulation.events.length === 0 && (
          <div className="text-lab-muted text-center py-8">
            <div className="text-4xl mb-2 opacity-30">📜</div>
            <p>暂无日志记录</p>
            <p className="mt-1">启动模拟开始记录</p>
          </div>
        )}

        {simulation.events.map((event, idx) => {
          const sourceInfo = getComponentInfo(event.sourceId);
          const targetInfo = getComponentInfo(event.targetId);

          return (
            <div
              key={event.id}
              className={`flex items-start gap-2 py-1.5 px-2 rounded mb-1 ${
                idx === simulation.events.length - 1
                  ? 'bg-lab-accent/5'
                  : 'hover:bg-lab-secondary/30'
              }`}
            >
              <span className="text-lab-muted w-16 flex-shrink-0">
                {formatTime(event.timestamp)}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] border flex-shrink-0 ${
                  eventTypeColors[event.eventType]
                }`}
              >
                {eventTypeLabels[event.eventType]}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-lab-text">{event.description}</span>
                {targetInfo && (
                  <button
                    onClick={() => selectComponent(targetInfo.comp.id)}
                    className="ml-1 text-lab-accent hover:underline"
                  >
                    [定位]
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {simulation.status === 'failed' && simulation.failureReason && (
        <div className="p-3 border-t border-lab-failure/30 bg-lab-failure/10">
          <div className="flex items-start gap-2">
            <span className="text-lab-failure">⚠</span>
            <div>
              <div className="text-lab-failure text-xs font-bold">失败原因</div>
              <div className="text-lab-muted text-xs mt-0.5">{simulation.failureReason}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
