import React, { useRef } from 'react';
import { Layer, LayerType } from '../types';

interface CanvasLayerProps {
  layer: Layer;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent, layerId: string, handle?: string) => void;
}

export const CanvasLayer: React.FC<CanvasLayerProps> = ({ layer, isSelected, onMouseDown }) => {
  const groupRef = useRef<SVGGElement>(null);

  if (!layer.visible) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMouseDown(e, layer.id);
  };

  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    onMouseDown(e, layer.id, handle);
  };

  const commonStyle = {
    opacity: layer.opacity,
    transform: `rotate(${layer.rotation}deg)`,
    transformBox: 'fill-box' as const,
    transformOrigin: 'center',
    cursor: isSelected ? 'move' : 'pointer',
  };

  const renderContent = () => {
    switch (layer.type) {
      case LayerType.TEXT:
        return (
          <foreignObject x={layer.x} y={layer.y} width={layer.width} height={layer.height} style={commonStyle}>
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: layer.style.textAlign || 'center',
                color: layer.style.color || '#000',
                fontSize: `${layer.style.fontSize || 16}px`,
                fontWeight: layer.style.fontWeight || 'normal',
                fontFamily: 'Inter, sans-serif',
                overflow: 'hidden',
                lineHeight: 1.2,
              }}
            >
              {layer.content}
            </div>
          </foreignObject>
        );
      case LayerType.SHAPE:
        return (
          <rect
            x={layer.x}
            y={layer.y}
            width={layer.width}
            height={layer.height}
            rx={layer.style.borderRadius || 0}
            fill={layer.style.backgroundColor || '#ccc'}
            style={commonStyle}
          />
        );
      case LayerType.IMAGE:
        // Use Pollinations.ai for generated images based on the content prompt
        const imageSrc = layer.content.startsWith('http') 
          ? layer.content 
          : `https://image.pollinations.ai/prompt/${encodeURIComponent(layer.content)}?width=${Math.round(layer.width)}&height=${Math.round(layer.height)}&nologo=true`;
        
        return (
          <image
            href={imageSrc}
            x={layer.x}
            y={layer.y}
            width={layer.width}
            height={layer.height}
            preserveAspectRatio="xMidYMid slice"
            style={commonStyle}
          />
        );
      case LayerType.DEVICE:
        // Generate a relevant UI mockup for the device screen based on the layer name
        // e.g., "Fitness App Screen" -> generates fitness UI
        const bezel = 10;
        const screenWidth = layer.width - (bezel * 2);
        const screenHeight = layer.height - (bezel * 2);
        
        // Ensure name isn't too generic for better results, fallback to "mobile app ui"
        const prompt = layer.name && layer.name.length > 5 ? `${layer.name} mobile app UI interface` : "modern mobile app interface design";
        const screenContentUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${Math.round(screenWidth)}&height=${Math.round(screenHeight)}&nologo=true`;

        return (
          <g transform={`translate(${layer.x}, ${layer.y}) rotate(${layer.rotation}, ${layer.width/2}, ${layer.height/2})`} opacity={layer.opacity}>
             {/* Device Body */}
            <rect
              x={0}
              y={0}
              width={layer.width}
              height={layer.height}
              rx={30}
              fill="#111"
              stroke="#333"
              strokeWidth={4}
            />
            {/* Screen Area */}
            <rect
              x={bezel}
              y={bezel}
              width={screenWidth}
              height={screenHeight}
              rx={20}
              fill="#fff"
            />
            {/* Screen Content */}
            <image
               href={screenContentUrl}
               x={bezel}
               y={bezel}
               width={screenWidth}
               height={screenHeight}
               preserveAspectRatio="xMidYMid slice"
               clipPath={`inset(0px round 20px)`}
            />
            {/* Notch */}
            <path d={`M ${layer.width/2 - 40} ${bezel} Q ${layer.width/2 - 30} ${bezel+20} ${layer.width/2} ${bezel+20} Q ${layer.width/2 + 30} ${bezel+20} ${layer.width/2 + 40} ${bezel}`} fill="#111" />
          </g>
        );
      default:
        return null;
    }
  };

  return (
    <g ref={groupRef} onMouseDown={handleMouseDown}>
      {renderContent()}
      
      {/* Selection Box & Handles */}
      {isSelected && (
        <g>
          <rect
            x={layer.x - 2}
            y={layer.y - 2}
            width={layer.width + 4}
            height={layer.height + 4}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray="5,5"
            pointerEvents="none"
          />
          {/* Resize Handles (Simplified: Bottom Right only for this demo) */}
           <rect
            x={layer.x + layer.width - 6}
            y={layer.y + layer.height - 6}
            width={12}
            height={12}
            fill="#3b82f6"
            stroke="#fff"
            strokeWidth="2"
            cursor="nwse-resize"
            onMouseDown={(e) => handleResizeStart(e, 'se')}
          />
        </g>
      )}
    </g>
  );
};