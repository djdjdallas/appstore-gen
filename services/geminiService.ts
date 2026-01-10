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
    You are a world-class UI/UX designer specializing in high-conversion App Store screenshots.
    
    Task: Design a layered screenshot layout for:
    App Name: "${appName}"
    Description: "${description}"
    Style Vibe: ${stylePreset}
    Canvas Dimensions: ${currentCanvas.width}x${currentCanvas.height}

    Design Rules:
    1. **Visual Hierarchy**: Create a depth-based composition. Background -> Abstract Shapes -> Device Frame -> Headlines -> Floating Elements.
    2. **Device**: Include exactly one 'DEVICE' layer. This represents the phone.
    3. **Images**: Use 'IMAGE' layers for additional visuals (e.g., floating UI cards, avatars, icons, or background photos).
    4. **Image Prompts**: For the 'content' field of 'IMAGE' layers, write a **specific, descriptive prompt** for an AI image generator (e.g., "fitness dashboard UI with heart rate graph", "running shoes icon", "abstract tech waves"). **DO NOT** use generic IDs or "placeholder".
    5. **Device Context**: Name the 'DEVICE' layer descriptively (e.g., "${appName} App Screen") so we can generate a matching UI for it.
    6. **Text**: Write punchy, marketing-oriented copy. 2-3 text layers max (Headline + Subtitle).
    7. **Layout**: Center the main device, but feel free to offset shapes for a dynamic look. Ensure elements fit within ${currentCanvas.width}x${currentCanvas.height}.

    Schema Requirements:
    - Output valid JSON.
    - layers.type enum: ['TEXT', 'SHAPE', 'DEVICE', 'IMAGE']
    - For DEVICE layers, 'content' should be "device_frame".
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