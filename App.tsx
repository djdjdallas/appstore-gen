import React, { useState, useEffect } from 'react';
import { Toolbar } from './components/Toolbar';
import { Editor } from './components/Editor';
import { PropertiesPanel } from './components/PropertiesPanel';
import { CANVAS_DEFAULTS, STYLE_PRESETS } from './constants';
import { Layer, CanvasConfig } from './types';
import { generateLayout } from './services/geminiService';
import { XMarkIcon } from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [layers, setLayers] = useState<Layer[]>([]);
  const [canvasConfig, setCanvasConfig] = useState<CanvasConfig>(CANVAS_DEFAULTS);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  
  // Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [promptAppName, setPromptAppName] = useState('Fitness Tracker Pro');
  const [promptDesc, setPromptDesc] = useState('A dark mode fitness app showing heart rate stats and running maps.');
  const [selectedPreset, setSelectedPreset] = useState(STYLE_PRESETS[3].id);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateLayout(promptAppName, promptDesc, selectedPreset, canvasConfig);
      setLayers(result.layers);
      setCanvasConfig(prev => ({
        ...prev,
        backgroundColor: result.backgroundColor
      }));
      setShowGenerateModal(false);
    } catch (error) {
      console.error("Generation failed:", error);
      alert("Failed to generate layout. Please check your API Key and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const updateSelectedLayer = (updates: Partial<Layer>) => {
    if (!selectedLayerId) return;
    setLayers(prev => prev.map(l => 
      l.id === selectedLayerId ? { ...l, ...updates } : l
    ));
  };

  const deleteLayer = (id: string) => {
    setLayers(prev => prev.filter(l => l.id !== id));
    setSelectedLayerId(null);
  };

  const handleExport = () => {
    const svgElement = document.getElementById('editor-canvas');
    if (!svgElement) return;

    // Serialize SVG
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgElement);

    // Add XML namespaces
    if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if(!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)){
        source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }

    // Convert to Blob
    const blob = new Blob([source], {type: "image/svg+xml;charset=utf-8"});
    const url = URL.createObjectURL(blob);
    
    // Create download link
    const link = document.createElement("a");
    link.href = url;
    link.download = `app-store-screenshot-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden">
      <Toolbar 
        onGenerate={() => setShowGenerateModal(true)} 
        onExport={handleExport}
        isGenerating={isGenerating}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Editor 
          layers={layers}
          canvasConfig={canvasConfig}
          selectedLayerId={selectedLayerId}
          onLayerUpdate={updateSelectedLayer}
          onSelectLayer={setSelectedLayerId}
        />
        
        <PropertiesPanel 
          selectedLayer={layers.find(l => l.id === selectedLayerId) || null}
          onUpdate={updateSelectedLayer}
          onDelete={deleteLayer}
          layers={layers}
          onSelect={setSelectedLayerId}
        />
      </div>

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
                <label className="block text-sm font-medium text-slate-300 mb-1">Style Style</label>
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

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                    <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating Magic...
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
