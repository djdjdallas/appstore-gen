import React, { useRef } from 'react';
import { Layer, LayerType } from '../types';

interface CanvasLayerProps {
  layer: Layer;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent, layerId: string, handle?: string) => void;
  userScreenshot?: string | null;
}

export const CanvasLayer: React.FC<CanvasLayerProps> = ({
  layer,
  isSelected,
  onMouseDown,
  userScreenshot,
}) => {
  const groupRef = useRef<SVGGElement>(null);

  if (!layer.visible) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (layer.locked) return;
    onMouseDown(e, layer.id);
  };

  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    if (layer.locked) return;
    onMouseDown(e, layer.id, handle);
  };

  const commonStyle = {
    opacity: layer.opacity,
    transform: `rotate(${layer.rotation}deg)`,
    transformBox: 'fill-box' as const,
    transformOrigin: 'center',
    cursor: layer.locked ? 'not-allowed' : isSelected ? 'move' : 'pointer',
  };

  const renderContent = () => {
    switch (layer.type) {
      case LayerType.TEXT:
        return (
          <foreignObject
            x={layer.x}
            y={layer.y}
            width={layer.width}
            height={layer.height}
            style={commonStyle}
          >
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
        // Only render if content is a valid URL or data URL
        const isValidUrl =
          layer.content.startsWith('http') || layer.content.startsWith('data:');

        if (!isValidUrl) {
          // Render placeholder
          return (
            <g style={commonStyle}>
              <rect
                x={layer.x}
                y={layer.y}
                width={layer.width}
                height={layer.height}
                fill="#374151"
                stroke="#4b5563"
                strokeWidth="2"
                strokeDasharray="8,4"
              />
              <text
                x={layer.x + layer.width / 2}
                y={layer.y + layer.height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#9ca3af"
                fontSize="14"
              >
                Image Placeholder
              </text>
            </g>
          );
        }

        return (
          <image
            href={layer.content}
            x={layer.x}
            y={layer.y}
            width={layer.width}
            height={layer.height}
            preserveAspectRatio="xMidYMid slice"
            style={commonStyle}
          />
        );

      case LayerType.DEVICE:
        const bezel = 10;
        const screenWidth = layer.width - bezel * 2;
        const screenHeight = layer.height - bezel * 2;

        return (
          <g
            transform={`translate(${layer.x}, ${layer.y}) rotate(${layer.rotation}, ${layer.width / 2}, ${layer.height / 2})`}
            opacity={layer.opacity}
          >
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
              fill="#1f2937"
            />
            {/* Screen Content - use userScreenshot or show placeholder */}
            {userScreenshot ? (
              <image
                href={userScreenshot}
                x={bezel}
                y={bezel}
                width={screenWidth}
                height={screenHeight}
                preserveAspectRatio="xMidYMid slice"
                clipPath="inset(0px round 20px)"
              />
            ) : (
              <g>
                {/* Placeholder UI elements */}
                <rect
                  x={bezel + 10}
                  y={bezel + 40}
                  width={screenWidth - 20}
                  height={20}
                  rx={4}
                  fill="#374151"
                />
                <rect
                  x={bezel + 10}
                  y={bezel + 70}
                  width={screenWidth - 60}
                  height={12}
                  rx={3}
                  fill="#4b5563"
                />
                <rect
                  x={bezel + 10}
                  y={bezel + 100}
                  width={screenWidth - 20}
                  height={80}
                  rx={8}
                  fill="#374151"
                />
                <rect
                  x={bezel + 10}
                  y={bezel + 200}
                  width={screenWidth - 20}
                  height={60}
                  rx={8}
                  fill="#374151"
                />
                <text
                  x={bezel + screenWidth / 2}
                  y={bezel + screenHeight / 2 + 40}
                  textAnchor="middle"
                  fill="#6b7280"
                  fontSize="12"
                >
                  Upload screenshot
                </text>
              </g>
            )}
            {/* Notch */}
            <path
              d={`M ${layer.width / 2 - 40} ${bezel} Q ${layer.width / 2 - 30} ${bezel + 20} ${layer.width / 2} ${bezel + 20} Q ${layer.width / 2 + 30} ${bezel + 20} ${layer.width / 2 + 40} ${bezel}`}
              fill="#111"
            />
          </g>
        );

      default:
        return null;
    }
  };

  // Resize handle definitions for all 8 directions
  const resizeHandles = [
    { id: 'nw', x: layer.x - 6, y: layer.y - 6, cursor: 'nwse-resize' },
    { id: 'n', x: layer.x + layer.width / 2 - 6, y: layer.y - 6, cursor: 'ns-resize' },
    { id: 'ne', x: layer.x + layer.width - 6, y: layer.y - 6, cursor: 'nesw-resize' },
    { id: 'e', x: layer.x + layer.width - 6, y: layer.y + layer.height / 2 - 6, cursor: 'ew-resize' },
    { id: 'se', x: layer.x + layer.width - 6, y: layer.y + layer.height - 6, cursor: 'nwse-resize' },
    { id: 's', x: layer.x + layer.width / 2 - 6, y: layer.y + layer.height - 6, cursor: 'ns-resize' },
    { id: 'sw', x: layer.x - 6, y: layer.y + layer.height - 6, cursor: 'nesw-resize' },
    { id: 'w', x: layer.x - 6, y: layer.y + layer.height / 2 - 6, cursor: 'ew-resize' },
  ];

  return (
    <g ref={groupRef} onMouseDown={handleMouseDown}>
      {renderContent()}

      {/* Selection Box & All 8 Resize Handles */}
      {isSelected && (
        <g>
          {/* Selection rectangle */}
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

          {/* Lock indicator */}
          {layer.locked && (
            <g>
              <rect
                x={layer.x + layer.width / 2 - 12}
                y={layer.y - 28}
                width={24}
                height={20}
                rx={4}
                fill="#fbbf24"
              />
              <text
                x={layer.x + layer.width / 2}
                y={layer.y - 14}
                textAnchor="middle"
                fill="#000"
                fontSize="12"
              >
                🔒
              </text>
            </g>
          )}

          {/* Resize handles - only show if not locked */}
          {!layer.locked &&
            resizeHandles.map((handle) => (
              <rect
                key={handle.id}
                x={handle.x}
                y={handle.y}
                width={12}
                height={12}
                fill="#3b82f6"
                stroke="#fff"
                strokeWidth="2"
                rx={2}
                cursor={handle.cursor}
                onMouseDown={(e) => handleResizeStart(e, handle.id)}
              />
            ))}
        </g>
      )}
    </g>
  );
};
