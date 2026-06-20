import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Save,
  FolderOpen,
  FilePlus,
  Target,
  Clock,
  ScrollText,
  Award,
} from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { formatTime } from '@/utils/storage';

export const ControlToolbar: React.FC = () => {
  const {
    scheme,
    simulation,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    saveCurrentScheme,
    setShowSchemeManager,
    newScheme,
    rightPanel,
    setRightPanel,
  } = useGameStore();

  const [schemeName, setSchemeName] = useState(scheme.name);
  const [showSaveInput, setShowSaveInput] = useState(false);

  const handleSave = () => {
    if (showSaveInput) {
      saveCurrentScheme(schemeName || '未命名方案');
      setShowSaveInput(false);
    } else {
      setSchemeName(scheme.name);
      setShowSaveInput(true);
    }
  };

  const tabs = [
    { id: 'targets' as const, label: '目标', icon: <Target size={16} /> },
    { id: 'timeline' as const, label: '时间线', icon: <Clock size={16} /> },
    { id: 'logs' as const, label: '日志', icon: <ScrollText size={16} /> },
    { id: 'archive' as const, label: '档案', icon: <Award size={16} /> },
  ];

  return (
    <div className="bg-lab-secondary border-b border-lab-accent/20">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="font-cinzel text-lab-accent text-lg font-bold tracking-widest">
            ⚙ 骨牌因果实验室
          </div>
          <div className="h-6 w-px bg-lab-accent/30 mx-2" />
          {showSaveInput ? (
            <input
              type="text"
              value={schemeName}
              onChange={(e) => setSchemeName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              onBlur={() => handleSave()}
              autoFocus
              className="bg-lab-primary border border-lab-accent/50 rounded px-2 py-1 text-lab-text text-sm font-mono outline-none focus:border-lab-accent"
            />
          ) : (
            <div className="text-lab-text text-sm font-mono">{scheme.name}</div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-lab-primary/50 rounded-lg p-1 mr-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setRightPanel(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  rightPanel === tab.id
                    ? 'bg-lab-accent text-lab-primary'
                    : 'text-lab-muted hover:text-lab-text hover:bg-lab-secondary'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-lab-accent/30 mx-1" />

          {simulation.status === 'idle' || simulation.status === 'completed' || simulation.status === 'failed' ? (
            <button
              onClick={startSimulation}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-lab-success text-lab-primary rounded-md text-sm font-bold hover:bg-lab-success/90 transition-all hover:scale-105 active:scale-95"
            >
              <Play size={16} />
              启动
            </button>
          ) : simulation.status === 'running' ? (
            <button
              onClick={pauseSimulation}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-lab-accent text-lab-primary rounded-md text-sm font-bold hover:bg-lab-accent/90 transition-all"
            >
              <Pause size={16} />
              暂停
            </button>
          ) : (
            <button
              onClick={startSimulation}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-lab-accent text-lab-primary rounded-md text-sm font-bold hover:bg-lab-accent/90 transition-all"
            >
              <Play size={16} />
              继续
            </button>
          )}

          <button
            onClick={resetSimulation}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-lab-neutral/30 text-lab-text rounded-md text-sm font-medium hover:bg-lab-neutral/50 transition-all"
          >
            <RotateCcw size={16} />
            重置
          </button>

          <div className="h-6 w-px bg-lab-accent/30 mx-1" />

          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-lab-accent/20 text-lab-accent rounded-md text-sm font-medium hover:bg-lab-accent/30 transition-all border border-lab-accent/30"
          >
            <Save size={16} />
            保存
          </button>

          <button
            onClick={() => setShowSchemeManager(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-lab-accent/20 text-lab-accent rounded-md text-sm font-medium hover:bg-lab-accent/30 transition-all border border-lab-accent/30"
          >
            <FolderOpen size={16} />
            方案
          </button>

          <button
            onClick={newScheme}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-lab-accent/20 text-lab-accent rounded-md text-sm font-medium hover:bg-lab-accent/30 transition-all border border-lab-accent/30"
          >
            <FilePlus size={16} />
            新建
          </button>

          {simulation.status !== 'idle' && (
            <div className="ml-2 px-3 py-1.5 bg-lab-primary/50 rounded-md font-mono text-sm text-lab-accent">
              {formatTime(simulation.currentTime)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
