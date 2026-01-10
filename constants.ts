import { CanvasConfig } from './types';

// Standard iPhone Pro Max resolution scaled down for editor performance (aspect ratio maintained)
// 1284 x 2778
export const CANVAS_DEFAULTS: CanvasConfig = {
  width: 1284 / 3, // 428
  height: 2778 / 3, // 926
  backgroundColor: '#1e293b',
};

export const MOCK_DEVICE_FRAME = "https://picsum.photos/400/800"; 

export const STYLE_PRESETS = [
  { id: 'minimal', label: 'Minimalist Clean', color: '#ffffff' },
  { id: 'bold', label: 'Bold & High Contrast', color: '#000000' },
  { id: 'colorful', label: 'Playful & Colorful', color: '#FF5733' },
  { id: 'dark', label: 'Dark Mode Tech', color: '#1e293b' },
];

// Fallback images if generation fails or for placeholders
export const PLACEHOLDER_IMAGES = [
  "https://picsum.photos/400/300",
  "https://picsum.photos/400/400",
  "https://picsum.photos/300/600",
];