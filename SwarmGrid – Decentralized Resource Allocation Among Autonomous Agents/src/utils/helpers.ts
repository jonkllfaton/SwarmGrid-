import { AgentType } from '../types';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 10);
};

export const generateRandomColor = (type: AgentType): string => {
  // Generate colors based on agent type, with variations
  const baseColors = {
    provider: [65, 170, 120], // green-ish
    consumer: [200, 80, 100],  // red-ish
    hybrid: [130, 100, 200]    // purple-ish
  };
  
  const base = baseColors[type];
  
  // Add some variation
  const r = Math.max(0, Math.min(255, base[0] + (Math.random() * 40 - 20)));
  const g = Math.max(0, Math.min(255, base[1] + (Math.random() * 40 - 20)));
  const b = Math.max(0, Math.min(255, base[2] + (Math.random() * 40 - 20)));
  
  return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
};

export const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};