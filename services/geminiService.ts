import { GoogleGenAI, Type } from "@google/genai";
import { Layer, LayerType, CanvasConfig } from '../types';
import { CANVAS_DEFAULTS } from '../constants';

const MODEL_NAME = 'gemini-3-flash-preview';

export const generateLayout = async (
  appName: string,
  description: string,
  stylePreset: string,
  currentCanvas: CanvasConfig
): Promise<{ layers: Layer[]; backgroundColor: string; palette: string[] }> => {
  
  // Guard against missing key
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please set REACT_APP_GEMINI_API_KEY or provided process.env.API_KEY");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    You are a professional App Store screenshot designer. Generate a PRECISE layout.

    App: "${appName}"
    Description: "${description}"
    Style: ${stylePreset}
    Canvas: ${currentCanvas.width}x${currentCanvas.height}

    STRICT LAYOUT RULES:
    1. HEADLINE: Position at y=${Math.round(currentCanvas.height * 0.08)}, centered (x=${currentCanvas.width/2}), width=${currentCanvas.width - 40}
    2. SUBHEADLINE: Position at y=${Math.round(currentCanvas.height * 0.15)}, centered, width=${currentCanvas.width - 60}
    3. DEVICE: Center of canvas (x=${currentCanvas.width/2 - 120}, y=${Math.round(currentCanvas.height * 0.28)}), width=240, height=480
    4. Optional decorative shapes: Keep them subtle, opacity 0.3-0.6, positioned in corners or behind device

    REQUIRED LAYERS (in this exact order):
    1. One background SHAPE (full canvas, subtle gradient or solid)
    2. One DEVICE layer named "${appName} App Screen"
    3. One TEXT layer for headline (bold, 28-36px, high contrast)
    4. One TEXT layer for subheadline (regular, 16-20px)
    5. 0-2 decorative SHAPE layers (circles, rounded rects for visual interest)

    COLOR RULES for "${stylePreset}":
    ${stylePreset === 'dark' ? '- Background: #0f172a to #1e293b range\n- Text: #ffffff or #f1f5f9\n- Accents: #3b82f6, #8b5cf6' : ''}
    ${stylePreset === 'minimal' ? '- Background: #ffffff or #f8fafc\n- Text: #0f172a or #1e293b\n- Accents: #e2e8f0' : ''}
    ${stylePreset === 'bold' ? '- Background: #000000\n- Text: #ffffff\n- Accents: Vibrant colors #ef4444, #f59e0b, #10b981' : ''}
    ${stylePreset === 'colorful' ? '- Background: Gradient from bright colors\n- Text: #ffffff with shadow\n- Accents: Multiple vibrant colors' : ''}

    DO NOT be creative with positioning. Follow the exact coordinates above.

    Ensure you output valid JSON matching the schema.
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
          backgroundColor: { type: Type.STRING, description: "Hex code for background" },
          palette: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Array of 3-5 hex codes used in the design"
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
    
    // Post-process to ensure robust defaults
    const layers = data.layers.map((l: any) => ({
      ...l,
      visible: true,
      locked: false,
      style: l.style || {}
    }));

    return {
      layers,
      backgroundColor: data.backgroundColor,
      palette: data.palette
    };

  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Failed to parse design layout.");
  }
};