import React, { useState, useEffect, useCallback } from 'react';
import { toPng } from 'html-to-image';
import { Toolbar } from './components/Toolbar';
import { Editor } from './components/Editor';
import { PropertiesPanel } from './components/PropertiesPanel';
import { PatternPicker } from './components/PatternPicker';
import { CANVAS_DEFAULTS, STYLE_PRESETS } from './constants';
import { Layer, CanvasConfig, LayerType } from './types';
import { generateLayout } from './services/geminiService';
import { LAYOUT_PATTERNS } from './layoutPatterns';
import { XMarkIcon } from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [canvasConfig, setCanvasConfig] = useState<CanvasConfig>(CANVAS_DEFAULTS);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  // Screenshot Upload State
  const [userScreenshot, setUserScreenshot] = useState<string | null>(null);

  // Pattern Picker State
  const [showPatternPicker, setShowPatternPicker] = useState(true);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);

  // History for Undo/Redo
  const [history, setHistory] = useState<Layer[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [promptAppName, setPromptAppName] = useState('Fitness Tracker Pro');
  const [promptDesc, setPromptDesc] = useState('A dark mode fitness app showing heart rate stats and running maps.');
  const [selectedPreset, setSelectedPreset] = useState(STYLE_PRESETS[3].id);

  // Save to history helper
  const saveToHistory = useCallback((newLayers: Layer[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newLayers);
      // Limit history to 50 states
      if (newHistory.length > 50) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  // Update layers with history tracking
  const updateLayers = useCallback((newLayers: Layer[]) => {
    setLayers(newLayers);
    saveToHistory(newLayers);
  }, [saveToHistory]);

  // Undo function
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setLayers(history[newIndex]);
    }
  }, [historyIndex, history]);

  // Redo function
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setLayers(history[newIndex]);
    }
  }, [historyIndex, history]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const result = await generateLayout(promptAppName, promptDesc, selectedPreset, canvasConfig);
      updateLayers(result.layers);
      setCanvasConfig(prev => ({
        ...prev,
        backgroundColor: result.backgroundColor
      }));
      setShowGenerateModal(false);
    } catch (error) {
      console.error("Generation failed:", error);
      setGenerationError(error instanceof Error ? error.message : 'Failed to generate layout. Please check your API Key and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle pattern selection - opens generation modal with pattern pre-selected
  const handlePatternSelect = (patternId: string) => {
    setSelectedPattern(patternId);
    setShowPatternPicker(false);
    setShowGenerateModal(true);
  };

  // Handle starting from scratch (blank canvas)
  const handleStartBlank = () => {
    setSelectedPattern(null);
    setShowPatternPicker(false);
  };

  const updateSelectedLayer = (updates: Partial<Layer>) => {
    if (!selectedLayerId) return;
    const newLayers = layers.map(l =>
      l.id === selectedLayerId ? { ...l, ...updates } : l
    );
    setLayers(newLayers);
    // Don't save to history on every micro update (drag) - save on mouse up
  };

  // Save current state to history (called after drag/resize operations complete)
  const commitLayerChange = () => {
    saveToHistory(layers);
  };

  const deleteLayer = (id: string) => {
    const newLayers = layers.filter(l => l.id !== id);
    updateLayers(newLayers);
    setSelectedLayerId(null);
  };

  // Duplicate a layer
  const duplicateLayer = (id: string) => {
    const layer = layers.find(l => l.id === id);
    if (layer) {
      const newLayer: Layer = {
        ...layer,
        id: `layer-${Date.now()}`,
        name: `${layer.name} Copy`,
        x: layer.x + 20,
        y: layer.y + 20
      };
      updateLayers([...layers, newLayer]);
      setSelectedLayerId(newLayer.id);
    }
  };

  // Move layer up in z-order
  const moveLayerUp = (id: string) => {
    const index = layers.findIndex(l => l.id === id);
    if (index < layers.length - 1) {
      const newLayers = [...layers];
      [newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
      updateLayers(newLayers);
    }
  };

  // Move layer down in z-order
  const moveLayerDown = (id: string) => {
    const index = layers.findIndex(l => l.id === id);
    if (index > 0) {
      const newLayers = [...layers];
      [newLayers[index], newLayers[index - 1]] = [newLayers[index - 1], newLayers[index]];
      updateLayers(newLayers);
    }
  };

  // Toggle layer lock
  const toggleLayerLock = (id: string) => {
    const newLayers = layers.map(l =>
      l.id === id ? { ...l, locked: !l.locked } : l
    );
    updateLayers(newLayers);
  };

  // Add new text layer
  const addTextLayer = () => {
    const newLayer: Layer = {
      id: `layer-${Date.now()}`,
      type: LayerType.TEXT,
      name: 'New Text',
      x: 100,
      y: 100,
      width: 200,
      height: 50,
      rotation: 0,
      opacity: 1,
      content: 'New Text',
      style: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'normal',
        textAlign: 'center'
      },
      locked: false,
      visible: true
    };
    updateLayers([...layers, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  // Add new shape layer
  const addShapeLayer = () => {
    const newLayer: Layer = {
      id: `layer-${Date.now()}`,
      type: LayerType.SHAPE,
      name: 'New Shape',
      x: 100,
      y: 100,
      width: 150,
      height: 150,
      rotation: 0,
      opacity: 1,
      content: '',
      style: {
        backgroundColor: '#3b82f6',
        borderRadius: 8
      },
      locked: false,
      visible: true
    };
    updateLayers([...layers, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  // Add new device layer
  const addDeviceLayer = () => {
    const newLayer: Layer = {
      id: `layer-${Date.now()}`,
      type: LayerType.DEVICE,
      name: 'App Screen',
      x: Math.round((canvasConfig.width - 240) / 2),
      y: 200,
      width: 240,
      height: 480,
      rotation: 0,
      opacity: 1,
      content: 'device_frame',
      style: {},
      locked: false,
      visible: true
    };
    updateLayers([...layers, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  // Update canvas config
  const updateCanvasConfig = (updates: Partial<CanvasConfig>) => {
    setCanvasConfig(prev => ({ ...prev, ...updates }));
  };

  const handleExport = async () => {
    const svgElement = document.getElementById('editor-canvas');
    if (!svgElement) return;

    try {
      // Export at full App Store resolution (3x scale: 1284 x 2778)
      const dataUrl = await toPng(svgElement, {
        width: 1284,
        height: 2778,
        pixelRatio: 3,
        cacheBust: true,
      });

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${promptAppName.replace(/\s+/g, '-').toLowerCase()}-screenshot.png`;
      link.click();
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please try again.');
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Ignore if typing in input
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      // Delete layer
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedLayerId) {
        e.preventDefault();
        deleteLayer(selectedLayerId);
      }

      // Escape to deselect
      if (e.key === 'Escape') {
        setSelectedLayerId(null);
      }

      // Duplicate (Cmd+D)
      if ((e.metaKey || e.ctrlKey) && e.key === 'd' && selectedLayerId) {
        e.preventDefault();
        duplicateLayer(selectedLayerId);
      }

      // Undo (Cmd+Z)
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Redo (Cmd+Shift+Z)
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      }

      // Arrow key nudge
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedLayerId) {
        e.preventDefault();
        const amount = e.shiftKey ? 10 : 1;
        const layer = layers.find(l => l.id === selectedLayerId);
        if (layer && !layer.locked) {
          const updates: Partial<Layer> = {};
          switch (e.key) {
            case 'ArrowUp': updates.y = layer.y - amount; break;
            case 'ArrowDown': updates.y = layer.y + amount; break;
            case 'ArrowLeft': updates.x = layer.x - amount; break;
            case 'ArrowRight': updates.x = layer.x + amount; break;
          }
          updateSelectedLayer(updates);
          saveToHistory(layers.map(l => l.id === selectedLayerId ? { ...l, ...updates } : l));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLayerId, layers, undo, redo, deleteLayer, duplicateLayer, saveToHistory]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden">
      <Toolbar
        onGenerate={() => setShowGenerateModal(true)}
        onExport={handleExport}
        onPatterns={() => setShowPatternPicker(true)}
        onAddText={addTextLayer}
        onAddShape={addShapeLayer}
        onAddDevice={addDeviceLayer}
        isGenerating={isGenerating}
      />

      <div className="flex flex-1 overflow-hidden">
        <Editor
          layers={layers}
          canvasConfig={canvasConfig}
          selectedLayerId={selectedLayerId}
          onLayerUpdate={updateSelectedLayer}
          onSelectLayer={setSelectedLayerId}
          onCommitChange={commitLayerChange}
          userScreenshot={userScreenshot}
        />

        <PropertiesPanel
          selectedLayer={layers.find(l => l.id === selectedLayerId) || null}
          onUpdate={updateSelectedLayer}
          onDelete={deleteLayer}
          onDuplicate={duplicateLayer}
          onMoveUp={moveLayerUp}
          onMoveDown={moveLayerDown}
          onToggleLock={toggleLayerLock}
          layers={layers}
          onSelect={setSelectedLayerId}
          userScreenshot={userScreenshot}
          onScreenshotUpload={setUserScreenshot}
          canvasConfig={canvasConfig}
          onCanvasUpdate={updateCanvasConfig}
        />
      </div>

      {/* Pattern Picker Modal */}
      <PatternPicker
        isOpen={showPatternPicker}
        onClose={() => setShowPatternPicker(false)}
        onSelect={handlePatternSelect}
        onStartBlank={handleStartBlank}
        selectedPattern={selectedPattern}
      />

      {/* Generation Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">New AI Layout</h2>
              <button onClick={() => setShowGenerateModal(false)} className="text-slate-400 hover:text-white">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Selected Pattern Display */}
              {selectedPattern && (
                <div className="bg-slate-800 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Layout Pattern</span>
                    <p className="text-sm font-medium text-white">
                      {LAYOUT_PATTERNS.find(p => p.id === selectedPattern)?.name || 'Custom'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPatternPicker(true)}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Change
                  </button>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">App Name</label>
                <input
                  value={promptAppName}
                  onChange={e => setPromptAppName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. FitTrack Pro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  value={promptDesc}
                  onChange={e => setPromptDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-md p-2 text-white h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Describe the screen content..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {STYLE_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => setSelectedPreset(preset.id)}
                      className={`p-2 rounded-md text-sm border transition-all ${
                        selectedPreset === preset.id
                          ? 'bg-blue-600/20 border-blue-500 text-white'
                          : 'bg-slate-800 border-transparent text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Display */}
              {generationError && (
                <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 text-red-300 text-sm">
                  {generationError}
                </div>
              )}

              {/* Loading Skeleton */}
              {isGenerating && (
                <div className="space-y-3 animate-pulse">
                  <div className="h-4 bg-slate-700 rounded w-3/4" />
                  <div className="h-4 bg-slate-700 rounded w-1/2" />
                  <div className="h-20 bg-slate-700 rounded" />
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </>
                ) : 'Generate Layout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
