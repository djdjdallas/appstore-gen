import React from 'react';
import { ArrowDownTrayIcon, SparklesIcon } from '@heroicons/react/24/solid';

interface ToolbarProps {
  onGenerate: () => void;
  onExport: () => void;
  isGenerating: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onGenerate, onExport, isGenerating }) => {
  return (
    <div className="h-16 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white">Ai</span>
        </div>
        <h1 className="text-lg font-semibold text-slate-100">AppStore Gen</h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            isGenerating
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <SparklesIcon className="w-4 h-4" />
          {isGenerating ? 'Designing...' : 'New Layout'}
        </button>
        
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          Export PNG
        </button>
      </div>
    </div>
  );
};
