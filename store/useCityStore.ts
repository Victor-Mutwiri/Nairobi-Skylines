
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
  | 'bar'
  | 'power_plant'
  | 'dumpsite';

export type EventType = 'tender_expressway' | null;

// Centralized Configuration for Buildings
export const BUILDING_COSTS: Record<BuildingType, { 
  cost: number; 
  label: string; 
  population?: number; 
  happiness?: number; // Base happiness bonus
  revenue?: number; // Income generated per tick (Tax)
  upkeep?: number; // Cost per tick (Maintenance)
  pollution?: number; // Positive = pollutes, Negative = cleans
  powerConsumption?: number; // Power required
  powerProduction?: number; // Power generated
  description: string;
}> = {
  'runda_house': { 
    cost: 5000, 
    label: 'Runda House', 
    population: 5,
    revenue: 50,
    powerConsumption: 1,
    pollution: 0.1,
    description: 'Low density housing. Needs 1 Power.'
  },
  'kiosk': { 
    cost: 2000, 
    label: 'Kiosk',
    revenue: 25,
    pollution: 0.2,
    description: 'Small business. Adds +1 Corruption.'
  },
  'apartment': { 
    cost: 20000, 
    label: 'Apartment', 
    population: 50,
    revenue: 200,
    powerConsumption: 5,
    pollution: 1,
    description: 'High density. Needs 5 Power.'
  },
  'acacia': { 
    cost: 1000, 
    label: 'Acacia Tree', 
    happiness: 2,
    upkeep: 0,
    pollution: -0.5,
    description: 'Native vegetation. Cleans air.'
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
    powerConsumption: 20,
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
    pollution: -2,
    description: 'The green lung of the city.'
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
    pollution: 0.5, // Noise pollution effectively
    description: 'High income. Noise reduces happiness.'
  },
  'power_plant': {
    cost: 15000,
    label: 'Geothermal Plant',
    upkeep: 400,
    powerProduction: 50,
    pollution: 5,
    description: 'Generates 50 Power. Pollutes.'
  },
  'dumpsite': {
    cost: 8000,
    label: 'Dandora Dump',
    upkeep: 200,
    pollution: -15, // Large reduction (simulating waste management)
    description: 'Manages waste. Reduces overall pollution.'
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
  pollution: number;
  
  // Power System
  powerCapacity: number;
  powerDemand: number;
  isPowerOverlay: boolean;

  tiles: Record<string, TileData>; 
  activeTool: BuildingType | null;

  // Event System State
  tickCount: number;
  activeEvent: EventType;
  kickbackRevenue: number; // Income generated from corrupt deals
  
  // Actions
  setActiveTool: (tool: BuildingType | null) => void;
  togglePowerOverlay: () => void;
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
  pollution: 0,
  powerCapacity: 0,
  powerDemand: 0,
  isPowerOverlay: false,
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
  
  togglePowerOverlay: () => set((state) => ({ isPowerOverlay: !state.isPowerOverlay })),

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
    
    return {
      money: state.money - buildingConfig.cost,
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
    let calcHappiness = 50; // Start with base happiness
    let calcPopulation = 0;
    let calcPollution = 0;
    
    let policeCount = 0;
    let happinessPenalty = 0;

    let calcPowerCapacity = 0;
    let calcPowerDemand = 0;

    // 1. First Pass: Calculate Capacity and Demand
    Object.values(state.tiles).forEach((tile: TileData) => {
        const config = BUILDING_COSTS[tile.type];
        if (config.powerProduction) calcPowerCapacity += config.powerProduction;
        if (config.powerConsumption) calcPowerDemand += config.powerConsumption;
    });

    const isPowerSufficient = calcPowerCapacity >= calcPowerDemand;

    // 2. Second Pass: Calculate Effects based on Power Status
    Object.values(state.tiles).forEach((tile: TileData) => {
      const config = BUILDING_COSTS[tile.type];
      
      const requiresPower = !!config.powerConsumption;
      const isFunctioning = !requiresPower || (requiresPower && isPowerSufficient);

      // Finances
      if (isFunctioning && config.revenue) totalRevenue += config.revenue;
      if (config.upkeep) totalUpkeep += config.upkeep;

      // Population
      if (isFunctioning && config.population) calcPopulation += config.population;

      // Happiness
      if (isFunctioning && config.happiness) calcHappiness += config.happiness;

      // Pollution
      if (isFunctioning && config.pollution) calcPollution += config.pollution;

      // Corruption
      if (tile.type === 'kiosk') calcCorruption += 1;

      // Police
      if (tile.type === 'police_station') policeCount += 1;

      // Bar Proximity
      if (tile.type === 'bar') {
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
         if (nearHouse) happinessPenalty += 1;
      }
    });

    // Ensure pollution doesn't go below 0
    calcPollution = Math.max(0, calcPollution);

    // Finalize Insecurity (Base - Police Mitigation)
    const baseInsecurity = Math.floor(calcPopulation / 10);
    const calcInsecurity = Math.max(0, baseInsecurity - (policeCount * 5));

    // Finalize Corruption (Bribes + Kiosks)
    const eventCorruption = Math.floor(state.kickbackRevenue / 50); 
    const totalCorruption = calcCorruption + eventCorruption;

    // Pollution Penalty
    const pollutionPenalty = calcPollution > 50 ? Math.floor((calcPollution - 50) / 2) : 0;

    // Finalize Happiness
    calcHappiness = calcHappiness - totalCorruption - calcInsecurity - happinessPenalty - pollutionPenalty;
    if (!isPowerSufficient && calcPowerDemand > 0) calcHappiness -= 20; // Blackout penalty
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
        population: calcPopulation,
        happiness: calcHappiness,
        insecurity: calcInsecurity,
        corruption: totalCorruption,
        pollution: calcPollution,
        powerCapacity: calcPowerCapacity,
        powerDemand: calcPowerDemand,
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
      pollution: state.pollution,
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
