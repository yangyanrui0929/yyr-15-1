import React from 'react';
import { Trophy, Clock, Layers, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { formatDate, formatTime } from '@/utils/storage';

export const ArchivePanel: React.FC = () => {
  const { archive } = useGameStore();

  const successCount = archive.filter((a) => a.success).length;
  const totalDuration = archive.filter((a) => a.success).reduce((sum, a) => sum + a.duration, 0);
  const avgDuration = successCount > 0 ? totalDuration / successCount : 0;
  const totalTriggers = archive.reduce((sum, a) => sum + a.triggerCount, 0);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-lab-accent/20">
        <h3 className="font-cinzel text-lab-accent font-bold text-sm tracking-wider">
          作品档案
        </h3>
        <p className="text-lab-muted text-xs mt-1">共 {archive.length} 条记录</p>
      </div>

      <div className="grid grid-cols-2 gap-2 p-3 border-b border-lab-accent/10">
        <div className="bg-lab-primary/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-lab-success text-xs mb-1">
            <Trophy size={14} />
            成功次数
          </div>
          <div className="font-mono text-xl text-lab-text font-bold">
            {successCount}
            <span className="text-lab-muted text-xs font-normal ml-1">
              / {archive.length}
            </span>
          </div>
        </div>
        <div className="bg-lab-primary/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-lab-accent text-xs mb-1">
            <Clock size={14} />
            平均用时
          </div>
          <div className="font-mono text-xl text-lab-text font-bold">
            {avgDuration.toFixed(2)}
            <span className="text-lab-muted text-xs font-normal ml-1">s</span>
          </div>
        </div>
        <div className="bg-lab-primary/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-blue-400 text-xs mb-1">
            <Layers size={14} />
            总组件数
          </div>
          <div className="font-mono text-xl text-lab-text font-bold">
            {archive.reduce((sum, a) => sum + a.componentCount, 0)}
          </div>
        </div>
        <div className="bg-lab-primary/50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-purple-400 text-xs mb-1">
            <Zap size={14} />
            总触发数
          </div>
          <div className="font-mono text-xl text-lab-text font-bold">
            {totalTriggers}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {archive.length === 0 && (
          <div className="text-lab-muted text-center py-8">
            <div className="text-4xl mb-2 opacity-30">🏆</div>
            <p className="text-sm">暂无实验记录</p>
            <p className="text-xs mt-1">完成实验后记录将保存在这里</p>
          </div>
        )}

        {archive.map((entry) => (
          <div
            key={entry.id}
            className={`p-3 rounded-lg border transition-all ${
              entry.success
                ? 'bg-lab-success/5 border-lab-success/20'
                : 'bg-lab-failure/5 border-lab-failure/20'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {entry.success ? (
                  <CheckCircle2 size={16} className="text-lab-success" />
                ) : (
                  <AlertCircle size={16} className="text-lab-failure" />
                )}
                <span className={`text-sm font-semibold ${entry.success ? 'text-lab-success' : 'text-lab-failure'}`}>
                  {entry.schemeName}
                </span>
              </div>
              <span className="text-lab-muted text-xs">{formatDate(entry.completedAt)}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-lab-muted">用时</span>
                <div className="font-mono text-lab-text">{formatTime(entry.duration)}</div>
              </div>
              <div>
                <span className="text-lab-muted">组件</span>
                <div className="font-mono text-lab-text">{entry.componentCount}</div>
              </div>
              <div>
                <span className="text-lab-muted">触发</span>
                <div className="font-mono text-lab-text">{entry.triggerCount}</div>
              </div>
            </div>

            {entry.failureReason && (
              <div className="mt-2 pt-2 border-t border-lab-failure/20">
                <p className="text-lab-failure text-xs truncate">
                  ⚠ {entry.failureReason}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
