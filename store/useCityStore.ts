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
  | 'uhuru_park'
  | 'police_station'
  | 'bar';

export type EventType = 'tender_expressway' | null;

// Centralized Configuration for Buildings
export const BUILDING_COSTS: Record<BuildingType, { 
  cost: number; 
  label: string; 
  population?: number; 
  happiness?: number; // Base happiness bonus
  revenue?: number; // Income generated per tick (Tax)
  upkeep?: number; // Cost per tick (Maintenance)
  description: string;
}> = {
  'runda_house': { 
    cost: 5000, 
    label: 'Runda House', 
    population: 5,
    revenue: 50,
    description: 'Low density suburban housing. Generates tax.'
  },
  'kiosk': { 
    cost: 2000, 
    label: 'Kiosk',
    revenue: 25,
    description: 'Small business. Adds +1 Corruption.'
  },
  'apartment': { 
    cost: 20000, 
    label: 'Apartment', 
    population: 50,
    revenue: 200,
    description: 'High density residential. High tax revenue.'
  },
  'acacia': { 
    cost: 1000, 
    label: 'Acacia Tree', 
    happiness: 2,
    upkeep: 0,
    description: 'Native vegetation. Improves aesthetics.'
  },
  'road': { 
    cost: 500, 
    label: 'Road',
    upkeep: 2, 
    description: 'Basic infrastructure. Costs upkeep.'
  },
  'kicc': { 
    cost: 100000, 
    label: 'KICC', 
    population: 100, 
    happiness: 10,
    upkeep: 500,
    revenue: 200,
    description: 'Iconic conference center. High maintenance.'
  },
  'times_tower': { 
    cost: 80000, 
    label: 'Times Tower', 
    population: 150,
    revenue: 1000, 
    description: 'Corporate headquarters. Huge tax generator.'
  },
  'jamia_mosque': { 
    cost: 40000, 
    label: 'Jamia Mosque', 
    happiness: 15,
    upkeep: 100,
    description: 'Cultural landmark.'
  },
  'uhuru_park': { 
    cost: 10000, 
    label: 'Uhuru Park', 
    happiness: 20,
    upkeep: 200,
    description: 'The green lung of the city. Costs upkeep.'
  },
  'police_station': {
    cost: 15000,
    label: 'Police Station',
    upkeep: 500,
    description: 'Reduces Insecurity by 5.'
  },
  'bar': {
    cost: 5000,
    label: 'Club/Bar',
    revenue: 100, // High income
    description: 'High income. Noise reduces happiness of neighbors.'
  }
};

// Data stored for a single tile
export interface TileData {
  type: BuildingType;
  x: number;
  z: number;
  rotation: number; 
}

// Main State Interface
interface CityState {
  money: number;
  population: number;
  happiness: number;
  insecurity: number;
  corruption: number;
  tiles: Record<string, TileData>; 
  activeTool: BuildingType | null;

  // Event System State
  tickCount: number;
  activeEvent: EventType;
  kickbackRevenue: number; // Income generated from corrupt deals
  
  // Actions
  setActiveTool: (tool: BuildingType | null) => void;
  addBuilding: (x: number, z: number, type: BuildingType) => void;
  removeBuilding: (x: number, z: number) => void;
  updateMoney: (amount: number) => void;
  runGameTick: () => number; // Returns net income
  resolveTender: (choice: 'standard' | 'bribe') => void;
  saveGame: () => void;
}

const SAVE_KEY = 'nairobi_skylines_save_v1';

const DEFAULT_STATE = {
  money: 50000,
  population: 0,
  happiness: 50,
  insecurity: 0,
  corruption: 0,
  tiles: {},
  tickCount: 0,
  kickbackRevenue: 0,
};

// Helper to load initial state synchronously
const loadInitialState = () => {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with default to ensure new fields are present if schema updates
      return { ...DEFAULT_STATE, ...parsed };
    }
  } catch (e) {
    console.error("Failed to load save game:", e);
  }
  return DEFAULT_STATE;
};

export const useCityStore = create<CityState>((set, get) => ({
  ...loadInitialState(), // Initialize from LocalStorage
  
  activeTool: null,
  activeEvent: null,

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

    // Calculate new Population immediately (additive)
    const newPopulation = state.population + (buildingConfig.population || 0);
    
    return {
      money: state.money - buildingConfig.cost,
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
  })),

  resolveTender: (choice) => set((state) => {
    if (choice === 'standard') {
      return {
        money: state.money - 10000,
        happiness: Math.min(100, state.happiness + 5),
        activeEvent: null
      };
    } else {
      // Bribe choice
      return {
        money: state.money - 2000,
        corruption: state.corruption + 10,
        kickbackRevenue: state.kickbackRevenue + 500, // Generate future "income"
        activeEvent: null
      };
    }
  }),

  runGameTick: () => {
    const state = get();
    let totalRevenue = 0;
    let totalUpkeep = 0;
    
    let calcCorruption = 0;
    let calcInsecurity = 0;
    let calcHappiness = 50; // Start with base happiness

    let policeCount = 0;
    let happinessPenalty = 0;

    // Base Insecurity derived from Population (1 insecurity per 10 people)
    let baseInsecurity = Math.floor(state.population / 10);

    Object.values(state.tiles).forEach((tile: TileData) => {
      const config = BUILDING_COSTS[tile.type];
      
      // 1. Finances
      if (config.revenue) totalRevenue += config.revenue;
      if (config.upkeep) totalUpkeep += config.upkeep;

      // 2. Base Happiness from Buildings (Parks, Mosques)
      if (config.happiness) calcHappiness += config.happiness;

      // 3. Corruption Calculation
      if (tile.type === 'kiosk') {
        calcCorruption += 1;
      }

      // 4. Police Count
      if (tile.type === 'police_station') {
        policeCount += 1;
      }

      // 5. Bar Logic (Noise Pollution)
      if (tile.type === 'bar') {
         // Check immediate neighbors (North, South, East, West)
         const neighbors = [
            {x: tile.x + 1, z: tile.z}, {x: tile.x - 1, z: tile.z},
            {x: tile.x, z: tile.z + 1}, {x: tile.x, z: tile.z - 1}
         ];
         
         let nearHouse = false;
         for (const n of neighbors) {
            const key = `${n.x},${n.z}`;
            const neighborTile = state.tiles[key];
            if (neighborTile && (neighborTile.type === 'runda_house' || neighborTile.type === 'apartment')) {
                nearHouse = true;
                break;
            }
         }
         
         if (nearHouse) {
             happinessPenalty += 1; // Reduces global happiness by 1 per offending bar
         }
      }
    });

    // Finalize Insecurity (Base - Police Mitigation)
    calcInsecurity = Math.max(0, baseInsecurity - (policeCount * 5));

    // Finalize Corruption (Bribes + Kiosks)
    const eventCorruption = Math.floor(state.kickbackRevenue / 50); 
    const totalCorruption = calcCorruption + eventCorruption;

    // Finalize Happiness
    calcHappiness = calcHappiness - totalCorruption - calcInsecurity - happinessPenalty;
    calcHappiness = Math.max(0, Math.min(100, calcHappiness));

    // Add Kickback Revenue
    totalRevenue += state.kickbackRevenue;

    const netIncome = totalRevenue - totalUpkeep;
    
    // Event Trigger Logic
    const newTickCount = state.tickCount + 1;
    let newEvent = state.activeEvent;
    
    if (newTickCount > 0 && newTickCount % 24 === 0 && !state.activeEvent) {
      newEvent = 'tender_expressway';
    }

    set({ 
        money: state.money + netIncome,
        happiness: calcHappiness,
        insecurity: calcInsecurity,
        corruption: totalCorruption,
        tickCount: newTickCount,
        activeEvent: newEvent
    });
    
    return netIncome;
  },

  saveGame: () => {
    const state = get();
    const dataToSave = {
      money: state.money,
      population: state.population,
      happiness: state.happiness,
      insecurity: state.insecurity,
      corruption: state.corruption,
      tiles: state.tiles,
      tickCount: state.tickCount,
      kickbackRevenue: state.kickbackRevenue
    };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
      console.log("Game Saved Successfully");
    } catch (e) {
      console.error("Failed to save game", e);
    }
  }
}));