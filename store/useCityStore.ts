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
}

export const useCityStore = create<CityState>((set, get) => ({
  money: 50000, // Starting budget (KES)
  population: 0,
  happiness: 50, // Base happiness
  insecurity: 0,
  corruption: 0,
  tiles: {},
  activeTool: null,
  
  tickCount: 0,
  activeEvent: null,
  kickbackRevenue: 0,

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
    
    // NOTE: Happiness, Insecurity, Corruption are recalculated during the Game Tick
    // to ensure complex rules (adjacency, global counts) are applied consistently.

    return {
      money: state.money - buildingConfig.cost,
      population: newPopulation,
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
    // Each station reduces insecurity by 5
    calcInsecurity = Math.max(0, baseInsecurity - (policeCount * 5));

    // Finalize Corruption
    // Add base corruption from kiosks + persistent corruption from events (stored in state.corruption is tricky if we overwrite it)
    // Current strategy: Recalculate dynamic corruption from buildings, then ADD state-based corruption (from events).
    // To do this correctly without infinite growth, we need to separate "Building Corruption" from "Event Corruption".
    // For now, let's assume `state.corruption` tracks the event-based permanent corruption, and we add the kiosk count to it for display/happiness.
    // However, state.corruption is currently overwritten in the prev implementation.
    // FIX: We will treat `state.corruption` as the 'Base/Event' corruption. We won't overwrite it, we will just return a derived value or update a `displayCorruption`?
    // Actually, simpler: Let's make `corruption` in state be the *total*.
    // But we need to know how much comes from buildings vs events.
    // For this step, I will simplify: Corruption = Kiosks + (Legacy Corruption from Bribes).
    // I need to store `legacyCorruption` separately if I want to re-calculate every tick.
    // OR: Just don't reset corruption every tick?
    // The current pattern `calcCorruption = 0; ... loop ... set({ corruption: calcCorruption })` wipes event progress.
    
    // REFACTORING LOGIC for Persistence:
    // We'll calculate `buildingCorruption`.
    // We'll have a `baseCorruption` state variable (added implicitly via logic below).
    // Actually, let's assume `state.corruption` holds the TOTAL.
    // But `runGameTick` rebuilds stats from scratch.
    // We need a variable for `eventCorruption` in the store. 
    // Since I can't easily change the interface in the middle of this block without a full rewrite,
    // I will use `kickbackRevenue` as a proxy for corruption level from bribes (since bribes add revenue).
    // 1 Bribe = +10 Corruption and +500 Revenue. So Corruption from Bribes ~= kickbackRevenue / 50.
    
    const eventCorruption = Math.floor(state.kickbackRevenue / 50); 
    const totalCorruption = calcCorruption + eventCorruption;

    // Finalize Happiness
    // Penalties: Corruption, Insecurity, Noise
    calcHappiness = calcHappiness - totalCorruption - calcInsecurity - happinessPenalty;
    // Clamp Happiness
    calcHappiness = Math.max(0, Math.min(100, calcHappiness));

    // Add Kickback Revenue
    totalRevenue += state.kickbackRevenue;

    const netIncome = totalRevenue - totalUpkeep;
    
    // Event Trigger Logic
    // Trigger every 24 ticks (approx 2 minutes at 5s/tick)
    // Only trigger if no event is active
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
  }
}));