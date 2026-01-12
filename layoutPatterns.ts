import { LayerType } from './types';

// Canvas: 428 x 926 (1/3 scale of 1284x2778)

export interface LayoutPattern {
  id: string;
  name: string;
  description: string;

  // Fixed structure - positions are percentages of canvas
  structure: {
    hasDevice: boolean;
    devicePosition: 'center' | 'bottom-right' | 'bottom-left' | 'tilted-center' | 'hand-held' | 'none';
    deviceSize: 'small' | 'medium' | 'large' | 'full';

    headlinePosition: 'top-center' | 'top-left' | 'center' | 'bottom-left' | 'bottom-center';
    hasSubheadline: boolean;

    hasBadges: boolean;
    badgePosition: 'below-headline' | 'bottom-left' | 'above-device' | 'none';

    hasLogo: boolean;
    logoPosition: 'top-left' | 'top-center' | 'bottom-center' | 'none';

    backgroundType: 'solid' | 'gradient' | 'photo' | 'pattern';
    hasDecorativeShapes: boolean;
  };

  // Suggested styles for this pattern
  suggestedStyles: string[];
}

export const LAYOUT_PATTERNS: LayoutPattern[] = [
  {
    id: 'hero-centered',
    name: 'Hero Centered',
    description: 'Clean centered device with headline above. Great for showcasing UI.',
    structure: {
      hasDevice: true,
      devicePosition: 'center',
      deviceSize: 'large',
      headlinePosition: 'top-center',
      hasSubheadline: true,
      hasBadges: false,
      badgePosition: 'none',
      hasLogo: false,
      logoPosition: 'none',
      backgroundType: 'solid',
      hasDecorativeShapes: false,
    },
    suggestedStyles: ['minimal', 'dark'],
  },

  {
    id: 'tilted-dramatic',
    name: 'Tilted Dramatic',
    description: 'Angled device with bold headline. High-impact, editorial feel.',
    structure: {
      hasDevice: true,
      devicePosition: 'tilted-center',
      deviceSize: 'large',
      headlinePosition: 'top-left',
      hasSubheadline: true,
      hasBadges: false,
      badgePosition: 'none',
      hasLogo: false,
      logoPosition: 'none',
      backgroundType: 'solid',
      hasDecorativeShapes: false,
    },
    suggestedStyles: ['dark', 'bold'],
  },

  {
    id: 'lifestyle-overlay',
    name: 'Lifestyle Photo',
    description: 'Full-bleed photo with text overlay. Emotional, lifestyle-focused.',
    structure: {
      hasDevice: false,
      devicePosition: 'none',
      deviceSize: 'small',
      headlinePosition: 'bottom-left',
      hasSubheadline: true,
      hasBadges: true,
      badgePosition: 'below-headline',
      hasLogo: true,
      logoPosition: 'top-left',
      backgroundType: 'photo',
      hasDecorativeShapes: false,
    },
    suggestedStyles: ['dark'],
  },

  {
    id: 'bold-stacked',
    name: 'Bold Stacked Text',
    description: 'Giant stacked headlines, minimal imagery. Statement-making.',
    structure: {
      hasDevice: false,
      devicePosition: 'none',
      deviceSize: 'small',
      headlinePosition: 'center',
      hasSubheadline: false,
      hasBadges: false,
      badgePosition: 'none',
      hasLogo: true,
      logoPosition: 'bottom-center',
      backgroundType: 'gradient',
      hasDecorativeShapes: true,
    },
    suggestedStyles: ['bold', 'colorful'],
  },

  {
    id: 'device-with-badges',
    name: 'Device + Awards',
    description: 'Device with App Store badges and social proof. Trust-building.',
    structure: {
      hasDevice: true,
      devicePosition: 'bottom-right',
      deviceSize: 'medium',
      headlinePosition: 'top-left',
      hasSubheadline: true,
      hasBadges: true,
      badgePosition: 'bottom-left',
      hasLogo: false,
      logoPosition: 'none',
      backgroundType: 'gradient',
      hasDecorativeShapes: true,
    },
    suggestedStyles: ['colorful', 'bold'],
  },

  {
    id: 'feature-spotlight',
    name: 'Feature Spotlight',
    description: 'Device with highlighted feature area. Great for specific features.',
    structure: {
      hasDevice: true,
      devicePosition: 'center',
      deviceSize: 'large',
      headlinePosition: 'top-center',
      hasSubheadline: true,
      hasBadges: false,
      badgePosition: 'none',
      hasLogo: false,
      logoPosition: 'none',
      backgroundType: 'solid',
      hasDecorativeShapes: true,
    },
    suggestedStyles: ['bold', 'dark'],
  },

  {
    id: 'gradient-glow',
    name: 'Gradient Glow',
    description: 'Dark gradient with glowing accents. Premium, tech-forward.',
    structure: {
      hasDevice: true,
      devicePosition: 'center',
      deviceSize: 'medium',
      headlinePosition: 'top-center',
      hasSubheadline: true,
      hasBadges: false,
      badgePosition: 'none',
      hasLogo: false,
      logoPosition: 'none',
      backgroundType: 'gradient',
      hasDecorativeShapes: true,
    },
    suggestedStyles: ['dark'],
  },

  {
    id: 'split-comparison',
    name: 'Split Screen',
    description: 'Two-panel layout for before/after or feature comparison.',
    structure: {
      hasDevice: true,
      devicePosition: 'bottom-right',
      deviceSize: 'medium',
      headlinePosition: 'top-left',
      hasSubheadline: true,
      hasBadges: false,
      badgePosition: 'none',
      hasLogo: false,
      logoPosition: 'none',
      backgroundType: 'solid',
      hasDecorativeShapes: true,
    },
    suggestedStyles: ['minimal', 'bold'],
  },
];

// Helper to get pixel positions from pattern structure
export const getPositionsFromPattern = (
  pattern: LayoutPattern,
  canvasWidth: number,
  canvasHeight: number
): Record<string, { x: number; y: number; width: number; height: number; rotation: number }> => {
  const positions: Record<string, { x: number; y: number; width: number; height: number; rotation: number }> = {};

  // Device sizes
  const deviceSizes = {
    small: { width: 160, height: 340 },
    medium: { width: 200, height: 420 },
    large: { width: 240, height: 500 },
    full: { width: 280, height: 580 },
  };

  const deviceSize = deviceSizes[pattern.structure.deviceSize];

  // Device positions
  if (pattern.structure.hasDevice) {
    switch (pattern.structure.devicePosition) {
      case 'center':
        positions.device = {
          x: (canvasWidth - deviceSize.width) / 2,
          y: canvasHeight * 0.28,
          ...deviceSize,
          rotation: 0,
        };
        break;
      case 'tilted-center':
        positions.device = {
          x: (canvasWidth - deviceSize.width) / 2 + 20,
          y: canvasHeight * 0.25,
          ...deviceSize,
          rotation: 8,
        };
        break;
      case 'bottom-right':
        positions.device = {
          x: canvasWidth - deviceSize.width - 20,
          y: canvasHeight * 0.35,
          ...deviceSize,
          rotation: -5,
        };
        break;
      case 'bottom-left':
        positions.device = {
          x: 20,
          y: canvasHeight * 0.35,
          ...deviceSize,
          rotation: 5,
        };
        break;
    }
  }

  // Headline positions
  switch (pattern.structure.headlinePosition) {
    case 'top-center':
      positions.headline = {
        x: 20,
        y: canvasHeight * 0.08,
        width: canvasWidth - 40,
        height: 100,
        rotation: 0,
      };
      break;
    case 'top-left':
      positions.headline = {
        x: 20,
        y: canvasHeight * 0.06,
        width: canvasWidth * 0.7,
        height: 140,
        rotation: 0,
      };
      break;
    case 'center':
      positions.headline = {
        x: 20,
        y: canvasHeight * 0.35,
        width: canvasWidth - 40,
        height: 200,
        rotation: 0,
      };
      break;
    case 'bottom-left':
      positions.headline = {
        x: 20,
        y: canvasHeight * 0.65,
        width: canvasWidth * 0.8,
        height: 120,
        rotation: 0,
      };
      break;
    case 'bottom-center':
      positions.headline = {
        x: 20,
        y: canvasHeight * 0.75,
        width: canvasWidth - 40,
        height: 100,
        rotation: 0,
      };
      break;
  }

  // Subheadline (relative to headline)
  if (pattern.structure.hasSubheadline && positions.headline) {
    positions.subheadline = {
      x: positions.headline.x,
      y: positions.headline.y + positions.headline.height + 10,
      width: positions.headline.width,
      height: 60,
      rotation: 0,
    };
  }

  // Logo positions
  if (pattern.structure.hasLogo) {
    switch (pattern.structure.logoPosition) {
      case 'top-left':
        positions.logo = { x: 20, y: 20, width: 120, height: 40, rotation: 0 };
        break;
      case 'top-center':
        positions.logo = { x: (canvasWidth - 50) / 2, y: 20, width: 50, height: 50, rotation: 0 };
        break;
      case 'bottom-center':
        positions.logo = { x: (canvasWidth - 120) / 2, y: canvasHeight - 60, width: 120, height: 40, rotation: 0 };
        break;
    }
  }

  // Badge positions
  if (pattern.structure.hasBadges) {
    switch (pattern.structure.badgePosition) {
      case 'below-headline':
        positions.badges = {
          x: 20,
          y: (positions.subheadline?.y || positions.headline.y) + 80,
          width: canvasWidth - 40,
          height: 60,
          rotation: 0,
        };
        break;
      case 'bottom-left':
        positions.badges = {
          x: 20,
          y: canvasHeight - 150,
          width: 180,
          height: 120,
          rotation: 0,
        };
        break;
    }
  }

  return positions;
};

// Generate default layers from a pattern (before AI styling)
export const generateDefaultLayersFromPattern = (
  pattern: LayoutPattern,
  canvasWidth: number,
  canvasHeight: number,
  appName: string = 'Your App'
): Array<{
  type: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  content: string;
  style: Record<string, unknown>;
}> => {
  const positions = getPositionsFromPattern(pattern, canvasWidth, canvasHeight);
  const layers: Array<{
    type: string;
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    opacity: number;
    content: string;
    style: Record<string, unknown>;
  }> = [];

  // Background
  layers.push({
    type: LayerType.SHAPE,
    name: 'Background',
    x: 0,
    y: 0,
    width: canvasWidth,
    height: canvasHeight,
    rotation: 0,
    opacity: 1,
    content: '',
    style: { backgroundColor: '#1e293b' },
  });

  // Device
  if (positions.device) {
    layers.push({
      type: LayerType.DEVICE,
      name: `${appName} Screenshot`,
      ...positions.device,
      opacity: 1,
      content: 'device_frame',
      style: {},
    });
  }

  // Headline
  if (positions.headline) {
    layers.push({
      type: LayerType.TEXT,
      name: 'Headline',
      ...positions.headline,
      opacity: 1,
      content: appName,
      style: {
        color: '#ffffff',
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: pattern.structure.headlinePosition.includes('left') ? 'left' : 'center',
      },
    });
  }

  // Subheadline
  if (positions.subheadline) {
    layers.push({
      type: LayerType.TEXT,
      name: 'Subheadline',
      ...positions.subheadline,
      opacity: 0.8,
      content: 'Your app description goes here',
      style: {
        color: '#94a3b8',
        fontSize: 16,
        fontWeight: 'normal',
        textAlign: pattern.structure.headlinePosition.includes('left') ? 'left' : 'center',
      },
    });
  }

  return layers;
};
