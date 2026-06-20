import React, { useState } from 'react';
import { X, FolderOpen, Trash2, Edit3, Play, Clock, Save } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { formatDate } from '@/utils/storage';

export const SchemeManager: React.FC = () => {
  const {
    schemes, showSchemeManager, setShowSchemeManager, loadScheme, deleteScheme, renameScheme, newScheme } =
    useGameStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  if (!showSchemeManager) return null;

  const startRename = (id: string, name: string) => {
    setEditingId(id);
    setEditName(name);
  };

  const confirmRename = () => {
    if (editingId && editName.trim()) {
      renameScheme(editingId, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-lab-secondary border border-lab-accent/30 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-lab-accent/20">
          <div className="flex items-center gap-2">
            <FolderOpen className="text-lab-accent" size={20} />
            <h2 className="font-cinzel text-lab-accent text-lg font-bold tracking-wider">
              方案管理器
            </h2>
          </div>
          <button
            onClick={() => setShowSchemeManager(false)}
            className="p-1 rounded hover:bg-lab-primary text-lab-muted hover:text-lab-text transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {schemes.length === 0 && (
            <div className="text-center py-12 text-lab-muted">
              <div className="text-5xl mb-3 opacity-30">📁</div>
              <p className="text-sm">暂无保存的方案</p>
              <p className="text-xs mt-1">点击"新建"或"保存"创建方案</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {schemes.map((scheme) => (
              <div
                key={scheme.id} className="bg-lab-primary/50 border border-lab-accent/20 rounded-lg p-4 hover:border-lab-accent/50 transition-colors group">
                <div className="flex items-start justify-between mb-3">
                  {editingId === scheme.id ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && confirmRename()}
                      onBlur={confirmRename}
                      autoFocus
                      className="flex-1 bg-lab-secondary border border-lab-accent/50 rounded px-2 py-1 text-lab-text text-sm outline-none focus:border-lab-accent mr-2"
                    />
                  ) : (
                    <h3 className="text-lab-text font-semibold text-sm truncate flex-1">
                      {scheme.name}
                    </h3>
                  )}
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => startRename(scheme.id, scheme.name)}
                      className="p-1 rounded text-lab-muted hover:text-lab-accent hover:bg-lab-accent/10 opacity-0 group-hover:opacity-100 transition-all"
                      title="重命名"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => deleteScheme(scheme.id)}
                      className="p-1 rounded text-lab-muted hover:text-lab-failure hover:bg-lab-failure/10 opacity-0 group-hover:opacity-100 transition-all"
                      title="删除"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-lab-muted mb-3">
                  <div>
                    <span className="text-lab-accent">{scheme.components.length}</span> 个组件
                  </div>
                  <div>
                    <span className="text-lab-accent">{scheme.targets.length}</span> 个目标
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-lab-muted mb-3">
                  <Clock size={12} />
                  {formatDate(scheme.updatedAt)}
                </div>

                <button
                  onClick={() => loadScheme(scheme)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-lab-accent/20 text-lab-accent rounded-md text-xs font-medium hover:bg-lab-accent/30 transition-colors border border-lab-accent/30"
                >
                  <Play size={14} />
                  载入方案
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-lab-accent/20 flex justify-end gap-2">
          <button
            onClick={() => {
              newScheme();
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-lab-neutral/30 text-lab-text rounded-md text-sm font-medium hover:bg-lab-neutral/50 transition-colors"
          >
            新建方案
          </button>
          <button
            onClick={() => setShowSchemeManager(false)}
            className="flex items-center gap-1.5 px-4 py-2 bg-lab-accent text-lab-primary rounded-md text-sm font-bold hover:bg-lab-accent-light transition-colors"
          >
            <Save size={16} />
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
