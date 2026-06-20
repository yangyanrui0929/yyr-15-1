import React, { useRef, useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { formatTime } from '@/utils/storage';

const eventColors: Record<string, string> = {
  trigger: 'text-lab-success',
  fall: 'text-lab-accent',
  spring_push: 'text-blue-400',
  magnet_pull: 'text-purple-400',
  delay_start: 'text-yellow-400',
  delay_end: 'text-green-400',
  success: 'text-lab-success',
  failure: 'text-lab-failure',
};

export const TimelinePanel: React.FC = () => {
  const { simulation, scheme, selectComponent } = useGameStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  const maxTime = Math.max(simulation.currentTime, 5, ...simulation.events.map((e) => e.timestamp));
  const pxPerSecond = 60;

  useEffect(() => {
    if (scrollRef.current && simulation.status === 'running') {
      scrollRef.current.scrollLeft = simulation.currentTime * pxPerSecond;
    }
  }, [simulation.currentTime, simulation.status]);

  const triggeredComponents = scheme.components.filter((c) => c.isTriggered && c.triggerTime !== null);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-lab-accent/20">
        <h3 className="font-cinzel text-lab-accent font-bold text-sm tracking-wider">
          触发时间线
        </h3>
        <p className="text-lab-muted text-xs mt-1">
          {simulation.events.length} 个事件 · {triggeredComponents.length} 个组件已触发
        </p>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-3 border-b border-lab-accent/10">
          <div className="text-xs text-lab-muted mb-2">组件触发时刻</div>
          <div
            ref={scrollRef}
            className="overflow-x-auto pb-2"
            style={{ scrollbarWidth: 'thin' }}
          >
            <div
              className="relative h-20"
              style={{ width: Math.max(maxTime * pxPerSecond + 100, 600) }}
            >
              {Array.from({ length: Math.ceil(maxTime) + 1 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 border-l border-lab-accent/10"
                  style={{ left: i * pxPerSecond }}
                >
                  <span className="absolute -bottom-1 text-lab-muted text-xs transform -translate-x-1/2">
                    {i}s
                  </span>
                </div>
              ))}

              {simulation.status !== 'idle' && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-lab-failure z-10"
                  style={{ left: simulation.currentTime * pxPerSecond }}
                >
                  <div className="absolute -top-1 -left-1.5 w-3 h-3 rounded-full bg-lab-failure" />
                </div>
              )}

              <div className="relative h-12">
                {triggeredComponents.map((comp) => (
                  <button
                    key={comp.id}
                    onClick={() => selectComponent(comp.id)}
                    className="absolute top-2 transform -translate-x-1/2 group"
                    style={{ left: (comp.triggerTime || 0) * pxPerSecond }}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 transition-transform group-hover:scale-150 ${
                        comp.type === 'domino'
                          ? 'bg-lab-accent border-lab-accent-light'
                          : comp.type === 'spring'
                          ? 'bg-slate-400 border-slate-300'
                          : comp.type === 'magnet'
                          ? 'bg-lab-failure border-red-400'
                          : 'bg-purple-500 border-purple-400'
                      }`}
                    />
                    <div className="absolute top-5 left-1/2 transform -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-lab-primary border border-lab-accent/30 rounded px-2 py-1 text-xs text-lab-text z-20">
                      {comp.type === 'domino' ? '骨牌' : comp.type === 'spring' ? '弹簧' : comp.type === 'magnet' ? '磁石' : '延时器'}
                      [{comp.x},{comp.y}] · {(comp.triggerTime || 0).toFixed(2)}s
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="text-xs text-lab-muted mb-2">事件列表</div>
          <div className="space-y-1">
            {simulation.events.length === 0 && (
              <div className="text-lab-muted text-xs text-center py-8">
                启动模拟后显示事件
              </div>
            )}
            {simulation.events.map((event, idx) => (
              <button
                key={event.id}
                onClick={() => event.targetId && selectComponent(event.targetId)}
                className={`w-full flex items-start gap-2 p-2 rounded hover:bg-lab-secondary/50 text-left transition-colors ${
                  idx === simulation.events.length - 1 ? 'bg-lab-secondary/30' : ''
                }`}
              >
                <span className="text-lab-muted font-mono text-xs w-16 flex-shrink-0 pt-0.5">
                  {formatTime(event.timestamp)}
                </span>
                <span className={`text-xs ${eventColors[event.eventType] || 'text-lab-text'}`}>
                  {event.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
