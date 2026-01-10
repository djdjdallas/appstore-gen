export enum LayerType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  SHAPE = 'SHAPE',
  DEVICE = 'DEVICE'
}

export interface LayerStyle {
  backgroundColor?: string;
  color?: string;
  fontSize?: number;
  fontWeight?: string | number;
  fontFamily?: string;
  borderRadius?: number;
  textAlign?: 'left' | 'center' | 'right';
  shadow?: boolean;
}

export interface Layer {
  id: string;
  type: LayerType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  content: string; // Text content or Image URL
  style: LayerStyle;
  locked: boolean;
  visible: boolean;
}

export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor: string;
}

export interface DesignSystem {
  palette: string[];
  font: string;
  vibe: string;
}

export interface GenerationRequest {
  appName: string;
  description: string;
  stylePreset: string;
}