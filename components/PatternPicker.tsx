import React from 'react';
import { LAYOUT_PATTERNS, LayoutPattern } from '../layoutPatterns';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface PatternPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (patternId: string) => void;
  onStartBlank: () => void;
  selectedPattern: string | null;
}

export const PatternPicker: React.FC<PatternPickerProps> = ({
  isOpen,
  onClose,
  onSelect,
  onStartBlank,
  selectedPattern,
}) => {
  if (!isOpen) return null;

  // Mini SVG preview for each pattern
  const renderPatternPreview = (pattern: LayoutPattern) => {
    const { structure } = pattern;

    return (
      <svg viewBox="0 0 428 926" className="w-full h-full">
        {/* Background */}
        <rect width="428" height="926" fill="#1e293b" rx="20" />

        {/* Logo */}
        {structure.hasLogo && structure.logoPosition === 'top-left' && (
          <rect x="20" y="20" width="60" height="20" fill="#64748b" rx="4" />
        )}
        {structure.hasLogo && structure.logoPosition === 'top-center' && (
          <rect x="189" y="20" width="50" height="50" fill="#64748b" rx="8" />
        )}
        {structure.hasLogo && structure.logoPosition === 'bottom-center' && (
          <rect x="154" y="866" width="120" height="40" fill="#64748b" rx="4" />
        )}

        {/* Headline */}
        {structure.headlinePosition === 'top-center' && (
          <>
            <rect x="80" y="70" width="268" height="24" fill="#fff" rx="4" />
            {structure.hasSubheadline && (
              <rect x="100" y="110" width="228" height="12" fill="#94a3b8" rx="2" />
            )}
          </>
        )}
        {structure.headlinePosition === 'top-left' && (
          <>
            <rect x="20" y="60" width="200" height="24" fill="#fff" rx="4" />
            <rect x="20" y="90" width="180" height="24" fill="#fff" rx="4" />
            {structure.hasSubheadline && (
              <rect x="20" y="130" width="160" height="12" fill="#94a3b8" rx="2" />
            )}
          </>
        )}
        {structure.headlinePosition === 'center' && (
          <>
            <rect x="40" y="350" width="348" height="40" fill="#fff" rx="4" />
            <rect x="60" y="400" width="308" height="40" fill="#fff" rx="4" />
          </>
        )}
        {structure.headlinePosition === 'bottom-left' && (
          <>
            <rect x="20" y="620" width="280" height="24" fill="#fff" rx="4" />
            <rect x="20" y="650" width="240" height="24" fill="#fff" rx="4" />
            {structure.hasSubheadline && (
              <rect x="20" y="690" width="200" height="12" fill="#94a3b8" rx="2" />
            )}
          </>
        )}
        {structure.headlinePosition === 'bottom-center' && (
          <>
            <rect x="80" y="720" width="268" height="24" fill="#fff" rx="4" />
            {structure.hasSubheadline && (
              <rect x="100" y="760" width="228" height="12" fill="#94a3b8" rx="2" />
            )}
          </>
        )}

        {/* Device */}
        {structure.hasDevice && (
          <g>
            {structure.devicePosition === 'center' && (
              <rect x="94" y="200" width="240" height="500" fill="#374151" rx="24" />
            )}
            {structure.devicePosition === 'tilted-center' && (
              <rect
                x="114"
                y="200"
                width="240"
                height="500"
                fill="#374151"
                rx="24"
                transform="rotate(8, 234, 450)"
              />
            )}
            {structure.devicePosition === 'bottom-right' && (
              <rect
                x="208"
                y="300"
                width="200"
                height="420"
                fill="#374151"
                rx="20"
                transform="rotate(-5, 308, 510)"
              />
            )}
            {structure.devicePosition === 'bottom-left' && (
              <rect
                x="20"
                y="300"
                width="200"
                height="420"
                fill="#374151"
                rx="20"
                transform="rotate(5, 120, 510)"
              />
            )}
          </g>
        )}

        {/* Decorative shapes */}
        {structure.hasDecorativeShapes && (
          <g>
            <circle cx="380" cy="100" r="80" fill="#3b82f6" opacity="0.3" />
            <circle cx="50" cy="800" r="60" fill="#8b5cf6" opacity="0.2" />
          </g>
        )}

        {/* Badges */}
        {structure.hasBadges && (
          <g>
            <rect x="20" y="780" width="100" height="30" fill="#3b82f6" rx="4" opacity="0.6" />
            <rect x="20" y="820" width="80" height="20" fill="#fbbf24" rx="4" opacity="0.5" />
          </g>
        )}
      </svg>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white">Choose a Layout Pattern</h2>
            <p className="text-slate-400 text-sm mt-1">
              Pick a structure, then AI will style it for your app
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {LAYOUT_PATTERNS.map((pattern) => (
              <button
                key={pattern.id}
                onClick={() => onSelect(pattern.id)}
                className={`group flex flex-col rounded-xl p-3 border transition-all hover:scale-[1.02] ${
                  selectedPattern === pattern.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-500'
                }`}
              >
                <div className="aspect-[428/926] w-full rounded-lg overflow-hidden bg-slate-950 mb-3">
                  {renderPatternPreview(pattern)}
                </div>
                <span className="text-sm font-medium text-white text-left">{pattern.name}</span>
                <span className="text-xs text-slate-400 mt-1 text-left line-clamp-2">
                  {pattern.description}
                </span>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {pattern.suggestedStyles.map((style) => (
                    <span
                      key={style}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300"
                    >
                      {style}
                    </span>
                  ))}
                </div>
              </button>
            ))}

            {/* Blank Canvas Option */}
            <button
              onClick={onStartBlank}
              className="group flex flex-col rounded-xl p-3 border border-dashed border-slate-600 bg-slate-800/30 hover:border-slate-500 transition-all hover:scale-[1.02]"
            >
              <div className="aspect-[428/926] w-full rounded-lg overflow-hidden bg-slate-950 mb-3 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-3 rounded-full border-2 border-dashed border-slate-600 flex items-center justify-center">
                    <span className="text-3xl text-slate-500">+</span>
                  </div>
                  <span className="text-sm text-slate-400">Start Blank</span>
                </div>
              </div>
              <span className="text-sm font-medium text-white text-left">Blank Canvas</span>
              <span className="text-xs text-slate-400 mt-1 text-left">
                Start from scratch with an empty canvas
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
