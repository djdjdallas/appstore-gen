import React from 'react';
import { Layer, LayerType, LayerStyle, CanvasConfig } from '../types';
import { ScreenshotUploader } from './ScreenshotUploader';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  LockClosedIcon,
  LockOpenIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

interface PropertiesPanelProps {
  selectedLayer: Layer | null;
  onUpdate: (updates: Partial<Layer>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onToggleLock: (id: string) => void;
  layers: Layer[];
  onSelect: (id: string) => void;
  userScreenshot: string | null;
  onScreenshotUpload: (dataUrl: string) => void;
  canvasConfig: CanvasConfig;
  onCanvasUpdate: (updates: Partial<CanvasConfig>) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedLayer,
  onUpdate,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onToggleLock,
  layers,
  onSelect,
  userScreenshot,
  onScreenshotUpload,
  canvasConfig,
  onCanvasUpdate,
}) => {
  const handleStyleChange = (key: keyof LayerStyle, value: string | number) => {
    if (!selectedLayer) return;
    onUpdate({
      style: {
        ...selectedLayer.style,
        [key]: value,
      },
    });
  };

  const selectedIndex = selectedLayer
    ? layers.findIndex((l) => l.id === selectedLayer.id)
    : -1;

  return (
    <div className="w-72 border-l border-slate-800 bg-slate-900 flex flex-col h-full overflow-hidden">
      {/* Layer List Header */}
      <div className="p-3 border-b border-slate-800 flex justify-between items-center">
        <h2 className="font-semibold text-slate-100 text-sm">Layers</h2>
        <span className="text-xs text-slate-500">{layers.length} items</span>
      </div>

      {/* Layer List */}
      <div className="max-h-48 overflow-y-auto border-b border-slate-800">
        {layers
          .slice()
          .reverse()
          .map((layer, idx) => (
            <div
              key={layer.id}
              onClick={() => onSelect(layer.id)}
              className={`px-3 py-2 flex items-center gap-2 cursor-pointer hover:bg-slate-800 border-l-2 transition-colors ${
                selectedLayer?.id === layer.id
                  ? 'border-blue-500 bg-slate-800'
                  : 'border-transparent'
              }`}
            >
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                {layer.type[0]}
              </span>
              <span className="text-xs text-slate-300 truncate flex-1">
                {layer.name || layer.content || 'Untitled'}
              </span>
              {layer.locked && (
                <LockClosedIcon className="w-3 h-3 text-yellow-500" />
              )}
            </div>
          ))}
        {layers.length === 0 && (
          <div className="p-3 text-xs text-slate-500">No layers yet</div>
        )}
      </div>

      {/* Properties Panel */}
      <div className="p-3 flex-1 overflow-y-auto">
        {selectedLayer ? (
          <div className="space-y-3">
            {/* Layer Actions */}
            <div className="flex gap-1 pb-3 border-b border-slate-800">
              <button
                onClick={() => onMoveUp(selectedLayer.id)}
                disabled={selectedIndex === layers.length - 1}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300"
                title="Move Up"
              >
                <ChevronUpIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => onMoveDown(selectedLayer.id)}
                disabled={selectedIndex === 0}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300"
                title="Move Down"
              >
                <ChevronDownIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDuplicate(selectedLayer.id)}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                title="Duplicate"
              >
                <DocumentDuplicateIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => onToggleLock(selectedLayer.id)}
                className={`p-1.5 rounded hover:bg-slate-700 ${
                  selectedLayer.locked
                    ? 'bg-yellow-900/30 text-yellow-500'
                    : 'bg-slate-800 text-slate-300'
                }`}
                title={selectedLayer.locked ? 'Unlock' : 'Lock'}
              >
                {selectedLayer.locked ? (
                  <LockClosedIcon className="w-4 h-4" />
                ) : (
                  <LockOpenIcon className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => onDelete(selectedLayer.id)}
                className="p-1.5 rounded bg-red-900/30 hover:bg-red-900/50 text-red-400 ml-auto"
                title="Delete"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Layer Name */}
            <div>
              <label className="block text-xs text-slate-500 mb-1">Name</label>
              <input
                type="text"
                value={selectedLayer.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200"
              />
            </div>

            {/* Screenshot Uploader for DEVICE type */}
            {selectedLayer.type === LayerType.DEVICE && (
              <ScreenshotUploader
                onUpload={onScreenshotUpload}
                currentScreenshot={userScreenshot}
              />
            )}

            {/* Position */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-500 mb-1">X</label>
                <input
                  type="number"
                  value={Math.round(selectedLayer.x)}
                  onChange={(e) => onUpdate({ x: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Y</label>
                <input
                  type="number"
                  value={Math.round(selectedLayer.y)}
                  onChange={(e) => onUpdate({ y: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200"
                />
              </div>
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Width</label>
                <input
                  type="number"
                  value={Math.round(selectedLayer.width)}
                  onChange={(e) => onUpdate({ width: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Height</label>
                <input
                  type="number"
                  value={Math.round(selectedLayer.height)}
                  onChange={(e) => onUpdate({ height: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200"
                />
              </div>
            </div>

            {/* Content / Text */}
            {selectedLayer.type === LayerType.TEXT && (
              <div>
                <label className="block text-xs text-slate-500 mb-1">Text</label>
                <textarea
                  value={selectedLayer.content}
                  onChange={(e) => onUpdate({ content: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200 min-h-[60px] resize-none"
                />
              </div>
            )}

            {/* Colors */}
            {selectedLayer.type !== LayerType.DEVICE && (
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Background / Fill
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={selectedLayer.style.backgroundColor || '#000000'}
                    onChange={(e) =>
                      handleStyleChange('backgroundColor', e.target.value)
                    }
                    className="h-8 w-8 rounded cursor-pointer border-0 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={selectedLayer.style.backgroundColor || ''}
                    onChange={(e) =>
                      handleStyleChange('backgroundColor', e.target.value)
                    }
                    className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200"
                    placeholder="#000000"
                  />
                </div>
              </div>
            )}

            {selectedLayer.type === LayerType.TEXT && (
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Text Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={selectedLayer.style.color || '#000000'}
                    onChange={(e) => handleStyleChange('color', e.target.value)}
                    className="h-8 w-8 rounded cursor-pointer border-0 bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={selectedLayer.style.color || ''}
                    onChange={(e) => handleStyleChange('color', e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200"
                    placeholder="#000000"
                  />
                </div>
              </div>
            )}

            {/* Style Extra */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Rotation
                </label>
                <input
                  type="number"
                  value={Math.round(selectedLayer.rotation || 0)}
                  onChange={(e) => onUpdate({ rotation: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Opacity
                </label>
                <input
                  type="number"
                  min={0}
                  max={1}
                  step={0.1}
                  value={selectedLayer.opacity}
                  onChange={(e) => onUpdate({ opacity: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200"
                />
              </div>
            </div>

            {selectedLayer.type === LayerType.TEXT && (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    Font Size
                  </label>
                  <input
                    type="number"
                    value={selectedLayer.style.fontSize || 16}
                    onChange={(e) =>
                      handleStyleChange('fontSize', Number(e.target.value))
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    Align
                  </label>
                  <select
                    value={selectedLayer.style.textAlign || 'center'}
                    onChange={(e) =>
                      handleStyleChange(
                        'textAlign',
                        e.target.value as 'left' | 'center' | 'right'
                      )
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>
            )}

            {selectedLayer.type === LayerType.SHAPE && (
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Border Radius
                </label>
                <input
                  type="number"
                  value={selectedLayer.style.borderRadius || 0}
                  onChange={(e) =>
                    handleStyleChange('borderRadius', Number(e.target.value))
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Canvas Background Editor */}
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-3">
                Canvas Background
              </h3>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={canvasConfig.backgroundColor}
                  onChange={(e) =>
                    onCanvasUpdate({ backgroundColor: e.target.value })
                  }
                  className="h-8 w-8 rounded cursor-pointer border-0 bg-transparent p-0"
                />
                <input
                  type="text"
                  value={canvasConfig.backgroundColor}
                  onChange={(e) =>
                    onCanvasUpdate({ backgroundColor: e.target.value })
                  }
                  className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200"
                  placeholder="#000000"
                />
              </div>
            </div>

            {/* Screenshot Upload */}
            <div className="pt-4 border-t border-slate-800">
              <ScreenshotUploader
                onUpload={onScreenshotUpload}
                currentScreenshot={userScreenshot}
              />
            </div>

            <div className="pt-4 border-t border-slate-800">
              <p className="text-xs text-slate-500 text-center">
                Select a layer to edit its properties
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
