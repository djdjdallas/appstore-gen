import React from 'react';
import {
  ArrowDownTrayIcon,
  SparklesIcon,
  Squares2X2Icon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/solid';
import { Square2StackIcon } from '@heroicons/react/24/outline';

interface ToolbarProps {
  onGenerate: () => void;
  onExport: () => void;
  onPatterns: () => void;
  onAddText: () => void;
  onAddShape: () => void;
  onAddDevice: () => void;
  isGenerating: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onGenerate,
  onExport,
  onPatterns,
  onAddText,
  onAddShape,
  onAddDevice,
  isGenerating,
}) => {
  return (
    <div className="h-14 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-4">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="font-bold text-white text-sm">Ai</span>
        </div>
        <h1 className="text-lg font-semibold text-slate-100">AppStore Gen</h1>
      </div>

      {/* Center: Add Layer Buttons */}
      <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
        <button
          onClick={onAddText}
          className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-1.5"
          title="Add Text Layer"
        >
          <span className="text-base font-bold">T</span>
          <span className="hidden sm:inline">Text</span>
        </button>
        <button
          onClick={onAddShape}
          className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-1.5"
          title="Add Shape Layer"
        >
          <Square2StackIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Shape</span>
        </button>
        <button
          onClick={onAddDevice}
          className="px-3 py-1.5 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-1.5"
          title="Add Device Layer"
        >
          <DevicePhoneMobileIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Device</span>
        </button>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onPatterns}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
        >
          <Squares2X2Icon className="w-4 h-4" />
          <span className="hidden sm:inline">Patterns</span>
        </button>

        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            isGenerating
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          <SparklesIcon className="w-4 h-4" />
          {isGenerating ? 'Generating...' : 'Generate'}
        </button>

        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium bg-green-600 hover:bg-green-500 text-white transition-colors"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          Export PNG
        </button>
      </div>
    </div>
  );
};
