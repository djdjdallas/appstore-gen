import { GoogleGenAI, Type } from "@google/genai";
import { Layer, LayerType, CanvasConfig } from '../types';
import { LAYOUT_PATTERNS, getPositionsFromPattern, LayoutPattern } from '../layoutPatterns';

const MODEL_NAME = 'gemini-2.0-flash';

export const generateLayout = async (
  appName: string,
  description: string,
  stylePreset: string,
  currentCanvas: CanvasConfig,
  patternId?: string | null
): Promise<{ layers: Layer[]; backgroundColor: string; palette: string[] }> => {

  // Guard against missing key
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error("API Key is missing. Please set VITE_GEMINI_API_KEY in your .env.local file");
  }

  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

  // Find pattern if provided
  const pattern = patternId ? LAYOUT_PATTERNS.find(p => p.id === patternId) : null;

  if (pattern) {
    // Pattern-based generation: AI only generates styling and text content
    return generateWithPattern(ai, appName, description, stylePreset, currentCanvas, pattern);
  } else {
    // Fallback: AI generates full layout (legacy behavior)
    return generateFullLayout(ai, appName, description, stylePreset, currentCanvas);
  }
};

// Generate layout using a pattern (AI only styles + text)
async function generateWithPattern(
  ai: GoogleGenAI,
  appName: string,
  description: string,
  stylePreset: string,
  currentCanvas: CanvasConfig,
  pattern: LayoutPattern
): Promise<{ layers: Layer[]; backgroundColor: string; palette: string[] }> {

  const positions = getPositionsFromPattern(pattern, currentCanvas.width, currentCanvas.height);

  const prompt = `
    You are an App Store screenshot designer. Generate ONLY styling and text content.
    The POSITIONS are already determined by the layout pattern.

    App: "${appName}"
    Description: "${description}"
    Style: ${stylePreset}
    Layout Pattern: ${pattern.name} - ${pattern.description}

    Generate:
    1. backgroundColor: A hex color for the canvas background
    2. headlineText: Main headline (2-5 impactful words)
    3. headlineColor: Hex color for headline text
    4. headlineFontSize: Font size (28-42)
    5. subheadlineText: Supporting text (5-12 words) ${pattern.structure.hasSubheadline ? 'REQUIRED' : 'set to empty string'}
    6. subheadlineColor: Hex color for subheadline
    7. palette: Array of 3-5 hex colors used in the design
    8. decorativeShapeColor: Hex color for decorative shapes (if any)
    9. decorativeShapeOpacity: Number 0.1-0.5

    COLOR RULES for "${stylePreset}":
    ${stylePreset === 'dark' ? '- Background: #0f172a to #1e293b range\n- Text: #ffffff or #f1f5f9\n- Accents: #3b82f6, #8b5cf6' : ''}
    ${stylePreset === 'minimal' ? '- Background: #ffffff or #f8fafc\n- Text: #0f172a or #1e293b\n- Accents: #e2e8f0, #94a3b8' : ''}
    ${stylePreset === 'bold' ? '- Background: #000000 or dark gradients\n- Text: #ffffff\n- Accents: Vibrant #ef4444, #f59e0b, #10b981' : ''}
    ${stylePreset === 'colorful' ? '- Background: Vibrant colors like #7c3aed, #ec4899\n- Text: #ffffff\n- Accents: Multiple bright colors' : ''}

    Make the headline compelling and action-oriented. Focus on the app's key benefit.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          backgroundColor: { type: Type.STRING },
          headlineText: { type: Type.STRING },
          headlineColor: { type: Type.STRING },
          headlineFontSize: { type: Type.NUMBER },
          subheadlineText: { type: Type.STRING },
          subheadlineColor: { type: Type.STRING },
          palette: { type: Type.ARRAY, items: { type: Type.STRING } },
          decorativeShapeColor: { type: Type.STRING },
          decorativeShapeOpacity: { type: Type.NUMBER },
        },
        required: ['backgroundColor', 'headlineText', 'headlineColor', 'palette']
      }
    }
  });

  if (!response.text) {
    throw new Error("No response from AI");
  }

  try {
    const data = JSON.parse(response.text);
    const layers: Layer[] = [];
    let layerIndex = 0;

    // Background layer
    layers.push({
      id: `layer-${Date.now()}-${layerIndex++}`,
      type: LayerType.SHAPE,
      name: 'Background',
      x: 0,
      y: 0,
      width: currentCanvas.width,
      height: currentCanvas.height,
      rotation: 0,
      opacity: 1,
      content: '',
      style: { backgroundColor: data.backgroundColor },
      locked: true,
      visible: true,
    });

    // Decorative shapes (if pattern has them)
    if (pattern.structure.hasDecorativeShapes) {
      // Add a couple decorative circles
      layers.push({
        id: `layer-${Date.now()}-${layerIndex++}`,
        type: LayerType.SHAPE,
        name: 'Accent Circle',
        x: currentCanvas.width - 120,
        y: -50,
        width: 200,
        height: 200,
        rotation: 0,
        opacity: data.decorativeShapeOpacity || 0.3,
        content: '',
        style: {
          backgroundColor: data.decorativeShapeColor || data.palette?.[1] || '#3b82f6',
          borderRadius: 100
        },
        locked: false,
        visible: true,
      });

      layers.push({
        id: `layer-${Date.now()}-${layerIndex++}`,
        type: LayerType.SHAPE,
        name: 'Accent Circle 2',
        x: -60,
        y: currentCanvas.height - 200,
        width: 150,
        height: 150,
        rotation: 0,
        opacity: (data.decorativeShapeOpacity || 0.3) * 0.7,
        content: '',
        style: {
          backgroundColor: data.palette?.[2] || data.decorativeShapeColor || '#8b5cf6',
          borderRadius: 75
        },
        locked: false,
        visible: true,
      });
    }

    // Device layer (if pattern has it)
    if (positions.device) {
      layers.push({
        id: `layer-${Date.now()}-${layerIndex++}`,
        type: LayerType.DEVICE,
        name: `${appName} Screenshot`,
        ...positions.device,
        opacity: 1,
        content: 'device_frame',
        style: {},
        locked: false,
        visible: true,
      });
    }

    // Headline
    if (positions.headline) {
      layers.push({
        id: `layer-${Date.now()}-${layerIndex++}`,
        type: LayerType.TEXT,
        name: 'Headline',
        ...positions.headline,
        opacity: 1,
        content: data.headlineText,
        style: {
          color: data.headlineColor,
          fontSize: data.headlineFontSize || 32,
          fontWeight: 'bold',
          textAlign: pattern.structure.headlinePosition.includes('left') ? 'left' : 'center',
        },
        locked: false,
        visible: true,
      });
    }

    // Subheadline
    if (pattern.structure.hasSubheadline && positions.subheadline && data.subheadlineText) {
      layers.push({
        id: `layer-${Date.now()}-${layerIndex++}`,
        type: LayerType.TEXT,
        name: 'Subheadline',
        ...positions.subheadline,
        opacity: 0.85,
        content: data.subheadlineText,
        style: {
          color: data.subheadlineColor || data.headlineColor,
          fontSize: 16,
          fontWeight: 'normal',
          textAlign: pattern.structure.headlinePosition.includes('left') ? 'left' : 'center',
        },
        locked: false,
        visible: true,
      });
    }

    return {
      layers,
      backgroundColor: data.backgroundColor,
      palette: data.palette || [],
    };

  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Failed to generate design. Please try again.");
  }
}

// Generate full layout (legacy behavior - AI controls everything)
async function generateFullLayout(
  ai: GoogleGenAI,
  appName: string,
  description: string,
  stylePreset: string,
  currentCanvas: CanvasConfig
): Promise<{ layers: Layer[]; backgroundColor: string; palette: string[] }> {

  const prompt = `
    You are a professional App Store screenshot designer. Generate a PRECISE layout.

    App: "${appName}"
    Description: "${description}"
    Style: ${stylePreset}
    Canvas: ${currentCanvas.width}x${currentCanvas.height}

    STRICT LAYOUT RULES:
    1. HEADLINE: Position at y=${Math.round(currentCanvas.height * 0.08)}, centered (x=20), width=${currentCanvas.width - 40}
    2. SUBHEADLINE: Position at y=${Math.round(currentCanvas.height * 0.16)}, centered, width=${currentCanvas.width - 60}
    3. DEVICE: Center of canvas (x=${Math.round((currentCanvas.width - 240) / 2)}, y=${Math.round(currentCanvas.height * 0.28)}), width=240, height=480
    4. Optional decorative shapes: Keep them subtle, opacity 0.2-0.4, positioned in corners

    REQUIRED LAYERS (in this exact order):
    1. One background SHAPE (full canvas size, x=0, y=0)
    2. One TEXT layer for headline (bold, 28-36px)
    3. One TEXT layer for subheadline (regular, 14-18px)
    4. One DEVICE layer named "${appName} Screenshot"
    5. 0-2 decorative SHAPE layers (circles with borderRadius)

    COLOR RULES for "${stylePreset}":
    ${stylePreset === 'dark' ? '- Background: #0f172a to #1e293b\n- Text: #ffffff\n- Accents: #3b82f6, #8b5cf6' : ''}
    ${stylePreset === 'minimal' ? '- Background: #ffffff or #f8fafc\n- Text: #0f172a\n- Accents: #e2e8f0' : ''}
    ${stylePreset === 'bold' ? '- Background: #000000\n- Text: #ffffff\n- Accents: #ef4444, #f59e0b' : ''}
    ${stylePreset === 'colorful' ? '- Background: Vibrant colors\n- Text: #ffffff\n- Accents: Multiple bright colors' : ''}

    DO NOT be creative with positioning. Follow the exact coordinates above.
    For DEVICE layers, set 'content' to "device_frame".
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          backgroundColor: { type: Type.STRING },
          palette: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          layers: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING, enum: [LayerType.TEXT, LayerType.SHAPE, LayerType.DEVICE, LayerType.IMAGE] },
                name: { type: Type.STRING },
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
                width: { type: Type.NUMBER },
                height: { type: Type.NUMBER },
                rotation: { type: Type.NUMBER },
                opacity: { type: Type.NUMBER },
                content: { type: Type.STRING },
                style: {
                  type: Type.OBJECT,
                  properties: {
                    color: { type: Type.STRING, nullable: true },
                    backgroundColor: { type: Type.STRING, nullable: true },
                    fontSize: { type: Type.NUMBER, nullable: true },
                    fontWeight: { type: Type.STRING, nullable: true },
                    borderRadius: { type: Type.NUMBER, nullable: true },
                    textAlign: { type: Type.STRING, enum: ['left', 'center', 'right'], nullable: true },
                  }
                }
              },
              required: ['id', 'type', 'x', 'y', 'width', 'height', 'content']
            }
          }
        },
        required: ['backgroundColor', 'layers', 'palette']
      }
    }
  });

  if (!response.text) {
    throw new Error("No response from AI");
  }

  try {
    const data = JSON.parse(response.text);

    // Post-process with defaults and bounds checking
    const layers = data.layers.map((l: Record<string, unknown>, index: number) => ({
      id: l.id || `layer-${Date.now()}-${index}`,
      type: l.type || LayerType.SHAPE,
      name: l.name || `Layer ${index + 1}`,
      x: Math.max(0, Math.min(Number(l.x) || 0, currentCanvas.width - 10)),
      y: Math.max(0, Math.min(Number(l.y) || 0, currentCanvas.height - 10)),
      width: Math.max(10, Number(l.width) || 100),
      height: Math.max(10, Number(l.height) || 100),
      rotation: Number(l.rotation) || 0,
      opacity: l.opacity !== undefined ? Number(l.opacity) : 1,
      content: l.content || '',
      style: {
        backgroundColor: (l.style as Record<string, unknown>)?.backgroundColor || '#cccccc',
        color: (l.style as Record<string, unknown>)?.color || '#ffffff',
        fontSize: Number((l.style as Record<string, unknown>)?.fontSize) || 16,
        fontWeight: (l.style as Record<string, unknown>)?.fontWeight || 'normal',
        borderRadius: Number((l.style as Record<string, unknown>)?.borderRadius) || 0,
        textAlign: ((l.style as Record<string, unknown>)?.textAlign as 'left' | 'center' | 'right') || 'center',
      },
      visible: true,
      locked: l.type === LayerType.SHAPE && index === 0, // Lock background
    }));

    return {
      layers,
      backgroundColor: data.backgroundColor || '#1e293b',
      palette: data.palette || [],
    };

  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Failed to generate design. Please try again.");
  }
}
