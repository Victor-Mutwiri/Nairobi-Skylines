import { create } from 'zustand';

// Define the types of buildings available
export type BuildingType = 'runda_house' | 'kiosk' | 'apartment' | 'acacia' | 'road';

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
    
    // Prevent building if tile is occupied
    if (state.tiles[key]) {
      return state;
    }

    // Update Tiles
    const newTiles = {
      ...state.tiles,
      [key]: { type, x, z, rotation: 0 }
    };

    // Simple Population/Money Logic based on building type
    let newPopulation = state.population;
    let cost = 0;

    switch (type) {
      case 'runda_house':
        cost = 5000;
        newPopulation += 5;
        break;
      case 'apartment':
        cost = 20000;
        newPopulation += 50;
        break;
      case 'kiosk':
        cost = 2000;
        break;
      case 'acacia':
        cost = 1000;
        break;
      case 'road':
        cost = 500;
        break;
    }

    if (state.money < cost) {
      return state; // Not enough money
    }

    return {
      money: state.money - cost,
      population: newPopulation,
      tiles: newTiles
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