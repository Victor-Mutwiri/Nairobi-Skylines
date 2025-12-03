import { create } from 'zustand';

// Define the types of buildings available
export type BuildingType = 'residential' | 'commercial' | 'industrial' | 'road' | 'park';

// Data stored for a single tile
export interface TileData {
  type: BuildingType;
  x: number;
  z: number;
  rotation: number; // 0, 1, 2, 3 (multipliers of 90 degrees)
}

// Main State Interface
interface CityState {
  money: number;
  population: number;
  tiles: Record<string, TileData>; // Key format: "x,z" (e.g., "5,-3")
  
  // Actions
  addBuilding: (x: number, z: number, type: BuildingType) => void;
  removeBuilding: (x: number, z: number) => void;
  updateMoney: (amount: number) => void;
}

export const useCityStore = create<CityState>((set) => ({
  money: 50000, // Starting budget (KES)
  population: 0,
  tiles: {},

  addBuilding: (x, z, type) => set((state) => {
    const key = `${x},${z}`;
    
    // Prevent building if tile is occupied (for now, simplistic)
    if (state.tiles[key]) {
      return state;
    }

    // Cost logic could go here, but keeping it simple for now
    return {
      tiles: {
        ...state.tiles,
        [key]: { type, x, z, rotation: 0 }
      }
    };
  }),

  removeBuilding: (x, z) => set((state) => {
    const key = `${x},${z}`;
    const newTiles = { ...state.tiles };
    delete newTiles[key];
    return { tiles: newTiles };
  }),

  updateMoney: (amount) => set((state) => ({
    money: state.money + amount
  }))
}));
