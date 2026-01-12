import React, { useState, useRef, useCallback } from 'react';
import { Layer, CanvasConfig } from '../types';
import { CanvasLayer } from './CanvasLayer';
import { CANVAS_DEFAULTS } from '../constants';

interface EditorProps {
  layers: Layer[];
  canvasConfig: CanvasConfig;
  selectedLayerId: string | null;
  onLayerUpdate: (updates: Partial<Layer>) => void;
  onSelectLayer: (id: string | null) => void;
}

export const Editor: React.FC<EditorProps> = ({
  layers,
  canvasConfig,
  selectedLayerId,
  onLayerUpdate,
  onSelectLayer
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState<'move' | 'resize'>('move');
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // Convert mouse event to SVG coordinates
  const getMousePos = (e: React.MouseEvent | MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const CTM = svgRef.current.getScreenCTM();
    if (!CTM) return { x: 0, y: 0 };
    return {
      x: (e.clientX - CTM.e) / CTM.a,
      y: (e.clientY - CTM.f) / CTM.d
    };
  };

  const handleMouseDown = (e: React.MouseEvent, layerId: string, handle?: string) => {
    onSelectLayer(layerId);
    setIsDragging(true);
    const pos = getMousePos(e);
    setStartPos(pos);
    setDragType(handle ? 'resize' : 'move');
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !selectedLayerId) return;

    const currentPos = getMousePos(e);
    const dx = currentPos.x - startPos.x;
    const dy = currentPos.y - startPos.y;
    
    // Find current layer to get its current values
    const layer = layers.find(l => l.id === selectedLayerId);
    if (!layer) return;

    if (dragType === 'move') {
      onLayerUpdate({
        x: layer.x + dx,
        y: layer.y + dy
      });
    } else if (dragType === 'resize') {
       onLayerUpdate({
        width: Math.max(10, layer.width + dx),
        height: Math.max(10, layer.height + dy)
       });
    }

    setStartPos(currentPos);
  }, [isDragging, selectedLayerId, startPos, dragType, layers, onLayerUpdate]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="flex-1 bg-slate-950 overflow-auto relative flex p-8">
       {/* Canvas Container */}
       <div 
        className="shadow-2xl shadow-black relative m-auto shrink-0 transition-all duration-200"
        style={{ width: canvasConfig.width, height: canvasConfig.height }}
       >
         <svg
            id="editor-canvas"
            ref={svgRef}
            width={canvasConfig.width}
            height={canvasConfig.height}
            viewBox={`0 0 ${canvasConfig.width} ${canvasConfig.height}`}
            className="bg-white block"
            style={{ backgroundColor: canvasConfig.backgroundColor }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseDown={() => onSelectLayer(null)} // Deselect on background click
         >
            {/* Background Grid (Optional visual aid) */}
            <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="0.5"/>
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" pointerEvents="none" />

            {/* Layers */}
            {layers.map((layer) => (
                <CanvasLayer
                    key={layer.id}
                    layer={layer}
                    isSelected={layer.id === selectedLayerId}
                    onMouseDown={handleMouseDown}
                />
            ))}
         </svg>
       </div>
       
       <div className="fixed bottom-4 left-4 text-slate-500 text-xs bg-slate-900/80 px-2 py-1 rounded border border-slate-800 pointer-events-none z-10">
          {Math.round(canvasConfig.width)} x {Math.round(canvasConfig.height)} px
       </div>
    </div>
  );
};