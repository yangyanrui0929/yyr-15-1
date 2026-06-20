import React, { useEffect } from 'react';
import { ComponentLibrary } from '@/components/ComponentLibrary';
import { GameCanvas } from '@/components/GameCanvas';
import { ControlToolbar } from '@/components/ControlToolbar';
import { TargetPanel } from '@/components/TargetPanel';
import { TimelinePanel } from '@/components/TimelinePanel';
import { LogPanel } from '@/components/LogPanel';
import { ArchivePanel } from '@/components/ArchivePanel';
import { SchemeManager } from '@/components/SchemeManager';
import { useGameStore } from '@/store/useGameStore';
import { useSimulation } from '@/hooks/useSimulation';

export const Lab: React.FC = () => {
  const { rightPanel, loadStoredSchemes, loadStoredArchive } = useGameStore();
  useSimulation();

  useEffect(() => {
    loadStoredSchemes();
    loadStoredArchive();
  }, [loadStoredSchemes, loadStoredArchive]);

  const renderRightPanel = () => {
    switch (rightPanel) {
      case 'targets':
        return <TargetPanel />;
      case 'timeline':
        return <TimelinePanel />;
      case 'logs':
        return <LogPanel />;
      case 'archive':
        return <ArchivePanel />;
      default:
        return <TargetPanel />;
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-lab-primary text-lab-text overflow-hidden">
      <ControlToolbar />

      <div className="flex-1 flex overflow-hidden">
        <ComponentLibrary />
        <GameCanvas />

        <div className="w-80 bg-lab-secondary border-l border-lab-accent/20 flex flex-col h-full">
          {renderRightPanel()}
        </div>
      </div>

      <SchemeManager />
    </div>
  );
};
