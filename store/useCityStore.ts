
import { create } from 'zustand';

// Define the types of buildings available
export type BuildingType = 
  | 'runda_house' 
  | 'kiosk' 
  | 'apartment' 
  | 'acacia' 
  | 'road'
  | 'kicc'
  | 'times_tower'
  | 'jamia_mosque'
  | 'uhuru_park';

// Centralized Configuration for Buildings
export const BUILDING_COSTS: Record<BuildingType, { 
  cost: number; 
  label: string; 
  population?: number; 
  happiness?: number;
  description: string;
}> = {
  'runda_house': { 
    cost: 5000, 
    label: 'Runda House', 
    population: 5,
    description: 'Low density suburban housing.'
  },
  'kiosk': { 
    cost: 2000, 
    label: 'Kiosk',
    description: 'Small commercial unit for locals.'
  },
  'apartment': { 
    cost: 20000, 
    label: 'Apartment', 
    population: 50,
    description: 'High density residential block.'
  },
  'acacia': { 
    cost: 1000, 
    label: 'Acacia Tree', 
    happiness: 2,
    description: 'Native vegetation. Improves aesthetics.'
  },
  'road': { 
    cost: 500, 
    label: 'Road',
    description: 'Basic infrastructure.'
  },
  'kicc': { 
    cost: 100000, 
    label: 'KICC', 
    population: 100, 
    happiness: 10,
    description: 'Iconic conference center. Boosts tourism.'
  },
  'times_tower': { 
    cost: 80000, 
    label: 'Times Tower', 
    population: 150,
    description: 'Corporate headquarters. High employment.'
  },
  'jamia_mosque': { 
    cost: 40000, 
    label: 'Jamia Mosque', 
    happiness: 15,
    description: 'Cultural landmark.'
  },
  'uhuru_park': { 
    cost: 10000, 
    label: 'Uhuru Park', 
    happiness: 20,
    description: 'The green lung of the city.'
  },
};

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
  happiness: number;
  tiles: Record<string, TileData>; // Key format: "x,z" (e.g., "5,-3")
  activeTool: BuildingType | null;
  
  // Actions
  setActiveTool: (tool: BuildingType | null) => void;
  addBuilding: (x: number, z: number, type: BuildingType) => void;
  removeBuilding: (x: number, z: number) => void;
  updateMoney: (amount: number) => void;
}

export const useCityStore = create<CityState>((set, get) => ({
  money: 50000, // Starting budget (KES)
  population: 0,
  happiness: 75,
  tiles: {},
  activeTool: null,

  setActiveTool: (tool) => set({ activeTool: tool }),

  addBuilding: (x, z, type) => set((state) => {
    const key = `${x},${z}`;
    
    // Prevent building if tile is occupied
    if (state.tiles[key]) {
      return state;
    }

    const buildingConfig = BUILDING_COSTS[type];

    // Check if player has enough money
    if (state.money < buildingConfig.cost) {
      return state;
    }

    // Update Tiles
    const newTiles = {
      ...state.tiles,
      [key]: { type, x, z, rotation: 0 }
    };

    // Calculate new stats
    const newPopulation = state.population + (buildingConfig.population || 0);
    const newHappiness = Math.min(100, state.happiness + (buildingConfig.happiness || 0));

    return {
      money: state.money - buildingConfig.cost,
      population: newPopulation,
      happiness: newHappiness,
      tiles: newTiles
    };
  }),

  removeBuilding: (x, z) => set((state) => {
    const key = `${x},${z}`;
    const newTiles = { ...state.tiles };
    
    // Optional: Refund logic could go here
    
    delete newTiles[key];
    return { tiles: newTiles };
  }),

  updateMoney: (amount) => set((state) => ({
    money: state.money + amount
  }))
}));
