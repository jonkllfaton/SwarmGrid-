import { GridCell } from '../types';

export const initializeGrid = (width: number, height: number): GridCell[][] => {
  const grid: GridCell[][] = [];
  
  for (let y = 0; y < height; y++) {
    grid[y] = [];
    for (let x = 0; x < width; x++) {
      grid[y][x] = {
        x,
        y,
        agents: [],
        resources: {
          compute: 0,
          storage: 0,
          data: 0
        },
        heatLevel: 0
      };
    }
  }
  
  return grid;
};