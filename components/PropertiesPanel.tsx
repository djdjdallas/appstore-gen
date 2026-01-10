import React from 'react';
import { Layer, LayerType, LayerStyle } from '../types';

interface PropertiesPanelProps {
  selectedLayer: Layer | null;
  onUpdate: (updates: Partial<Layer>) => void;
  onDelete: (id: string) => void;
  layers: Layer[];
  onSelect: (id: string) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ selectedLayer, onUpdate, onDelete, layers, onSelect }) => {
  
  const handleStyleChange = (key: keyof LayerStyle, value: any) => {
    if (!selectedLayer) return;
    onUpdate({
      style: {
        ...selectedLayer.style,
        [key]: value
      }
    });
  };

  return (
    <div className="w-80 border-l border-slate-800 bg-slate-900 flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b border-slate-800">
        <h2 className="font-semibold text-slate-100">Layers</h2>
      </div>
      
      {/* Layer List */}
      <div className="max-h-60 overflow-y-auto border-b border-slate-800">
        {layers.slice().reverse().map(layer => (
          <div
            key={layer.id}
            onClick={() => onSelect(layer.id)}
            className={`px-4 py-3 flex items-center gap-2 cursor-pointer hover:bg-slate-800 border-l-2 transition-colors ${
              selectedLayer?.id === layer.id ? 'border-blue-500 bg-slate-800' : 'border-transparent'
            }`}
          >
            <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
              {layer.type[0]}
            </span>
            <span className="text-sm text-slate-300 truncate">{layer.name || layer.content || 'Untitled'}</span>
          </div>
        ))}
        {layers.length === 0 && <div className="p-4 text-sm text-slate-500">No layers</div>}
      </div>

      {/* Properties */}
      <div className="p-4 flex-1">
        <h2 className="font-semibold text-slate-100 mb-4">Properties</h2>
        
        {selectedLayer ? (
          <div className="space-y-4">
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
                  className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200 min-h-[60px]"
                />
              </div>
            )}

            {/* Colors */}
            <div>
               <label className="block text-xs text-slate-500 mb-1">Background / Fill</label>
               <div className="flex gap-2">
                 <input 
                    type="color" 
                    value={selectedLayer.style.backgroundColor || '#000000'}
                    onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                    className="h-8 w-8 rounded cursor-pointer border-0 bg-transparent p-0"
                 />
                 <input
                  type="text"
                  value={selectedLayer.style.backgroundColor || ''}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200"
                  placeholder="#000000"
                />
               </div>
            </div>

            {selectedLayer.type === LayerType.TEXT && (
                <div>
                <label className="block text-xs text-slate-500 mb-1">Text Color</label>
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
                    <label className="block text-xs text-slate-500 mb-1">Rotation</label>
                    <input
                    type="number"
                    value={Math.round(selectedLayer.rotation || 0)}
                    onChange={(e) => onUpdate({ rotation: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200"
                    />
                 </div>
                 {selectedLayer.type === LayerType.TEXT && (
                     <div>
                     <label className="block text-xs text-slate-500 mb-1">Font Size</label>
                     <input
                     type="number"
                     value={selectedLayer.style.fontSize || 16}
                     onChange={(e) => handleStyleChange('fontSize', Number(e.target.value))}
                     className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm text-slate-200"
                     />
                  </div>
                 )}
            </div>

            <div className="pt-4 border-t border-slate-800">
                <button
                    onClick={() => onDelete(selectedLayer.id)}
                    className="w-full py-2 px-4 bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-900/50 rounded text-sm transition-colors"
                >
                    Delete Layer
                </button>
            </div>

          </div>
        ) : (
          <div className="text-center text-slate-500 py-10 text-sm">
            Select a layer to edit properties
          </div>
        )}
      </div>
    </div>
  );
};
