

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
  | 'fire_station'
  | 'bar'
  | 'power_plant'
  | 'dumpsite'
  | 'informal_settlement'
  | 'nbk_tower'
  | 'reserved'; // Filler for multi-tile buildings

export type ToolType = BuildingType | 'bulldozer';
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
  insecurity?: number; // Contribution to insecurity
  description: string;
  width?: number; // Tiles X
  depth?: number; // Tiles Z
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
  'fire_station': {
    cost: 12000,
    label: 'Fire Station',
    upkeep: 300,
    description: 'Extinguishes nearby fires (Cost: 1000 KES).'
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
  },
  'informal_settlement': {
    cost: 0,
    label: 'Squatter Camp',
    insecurity: 5,
    happiness: -5,
    description: 'Unplanned settlement. Hard to remove.'
  },
  'nbk_tower': {
    cost: 500000,
    label: 'NBK Tower',
    revenue: 5000,
    powerConsumption: 100,
    happiness: 20,
    width: 2,
    depth: 2,
    description: 'The ultimate status symbol. Wins the game. Needs 2x2 space.'
  },
  'reserved': {
    cost: 0,
    label: 'Reserved',
    description: 'Occupied space'
  }
};

// Data stored for a single tile
export interface TileData {
  type: BuildingType;
  x: number;
  z: number;
  rotation: number;
  parentX?: number; // For multi-tile buildings (reserved tiles point to main)
  parentZ?: number;
}

export interface HighScore {
  id: string;
  date: string;
  money: number;
  population: number;
  happiness: number;
  corruption: number;
  ticks: number;
  score: number;
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

  // Time System
  isNight: boolean;

  tiles: Record<string, TileData>; 
  fires: Record<string, number>; // Key: "x,z", Value: duration (ticks)
  activeTool: ToolType | null;

  // Event System State
  tickCount: number;
  activeEvent: EventType;
  kickbackRevenue: number; // Income generated from corrupt deals
  gameWon: boolean;
  
  // Actions
  setActiveTool: (tool: ToolType | null) => void;
  togglePowerOverlay: () => void;
  setIsNight: (isNight: boolean) => void;
  addBuilding: (x: number, z: number, type: BuildingType) => void;
  removeBuilding: (x: number, z: number) => void;
  updateMoney: (amount: number) => void;
  runGameTick: () => number; // Returns net income
  resolveTender: (choice: 'standard' | 'bribe') => void;
  saveGame: () => void;
  saveHighScore: () => void;
  setGameWon: (won: boolean) => void;
}

const SAVE_KEY = 'nairobi_skylines_save_v1';
export const SCORES_KEY = 'nairobi_skylines_highscores';

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
  isNight: false,
  tiles: {},
  fires: {},
  tickCount: 0,
  kickbackRevenue: 0,
  gameWon: false,
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
  setGameWon: (won) => set({ gameWon: won }),
  
  togglePowerOverlay: () => set((state) => ({ isPowerOverlay: !state.isPowerOverlay })),
  
  setIsNight: (isNight) => set({ isNight }),

  addBuilding: (x, z, type) => set((state) => {
    // 1. Check Cost
    const config = BUILDING_COSTS[type];
    if (state.money < config.cost) return state;

    // 2. Check Dimensions and Availability
    const width = config.width || 1;
    const depth = config.depth || 1;
    const tilesToOccupy: string[] = [];

    // Grid boundary check and Occupancy check
    // Assuming grid indices are roughly -10 to 9. We check if key exists.
    for (let dx = 0; dx < width; dx++) {
      for (let dz = 0; dz < depth; dz++) {
        const checkX = x + dx;
        const checkZ = z + dz;
        const key = `${checkX},${checkZ}`;
        
        // Bounds check (Hardcoded 20x20 centered on 0, limits -10 to 9)
        if (checkX < -10 || checkX >= 10 || checkZ < -10 || checkZ >= 10) {
             return state; // Out of bounds
        }

        if (state.tiles[key]) {
             return state; // Occupied
        }
        tilesToOccupy.push(key);
      }
    }

    // 3. Place Tiles
    const newTiles = { ...state.tiles };

    // Main Tile
    newTiles[`${x},${z}`] = { type, x, z, rotation: 0 };

    // Reserved (Filler) Tiles
    for (let dx = 0; dx < width; dx++) {
        for (let dz = 0; dz < depth; dz++) {
            if (dx === 0 && dz === 0) continue; // Skip main tile
            newTiles[`${x + dx},${z + dz}`] = { 
                type: 'reserved', 
                x: x + dx, 
                z: z + dz, 
                rotation: 0,
                parentX: x,
                parentZ: z
            };
        }
    }

    // Check Win Condition immediately
    const isWin = type === 'nbk_tower';
    
    return {
      money: state.money - config.cost,
      tiles: newTiles,
      gameWon: isWin ? true : state.gameWon
    };
  }),

  removeBuilding: (x, z) => set((state) => {
    const key = `${x},${z}`;
    let tile = state.tiles[key];
    
    if (!tile) return state;

    // Handle Reserved Tiles: redirect to parent
    if (tile.type === 'reserved' && tile.parentX !== undefined && tile.parentZ !== undefined) {
        const parentKey = `${tile.parentX},${tile.parentZ}`;
        tile = state.tiles[parentKey];
        if (!tile) return state; // Should not happen
    }

    let penaltyHappiness = 0;
    let penaltyCorruption = 0;

    // Penalty for evicting informal settlements
    if (tile.type === 'informal_settlement') {
       penaltyHappiness = -20;
       penaltyCorruption = 10;
    }

    // Handle Multi-tile Removal
    const config = BUILDING_COSTS[tile.type];
    const width = config.width || 1;
    const depth = config.depth || 1;

    const newTiles = { ...state.tiles };

    // Remove all parts of the building
    for (let dx = 0; dx < width; dx++) {
        for (let dz = 0; dz < depth; dz++) {
            const k = `${tile.x + dx},${tile.z + dz}`;
            delete newTiles[k];
        }
    }
    
    return { 
      tiles: newTiles,
      happiness: Math.max(0, state.happiness + penaltyHappiness),
      corruption: state.corruption + penaltyCorruption
    };
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
    const fireStations: {x: number, z: number}[] = [];
    let happinessPenalty = 0;

    let calcPowerCapacity = 0;
    let calcPowerDemand = 0;

    const tileKeys = Object.keys(state.tiles);

    // 1. First Pass: Calculate Capacity and Demand
    Object.values(state.tiles).forEach((tile: TileData) => {
        if (tile.type === 'reserved') return; // Skip fillers

        const config = BUILDING_COSTS[tile.type];
        if (config.powerProduction) calcPowerCapacity += config.powerProduction;
        if (config.powerConsumption) calcPowerDemand += config.powerConsumption;
        
        if (tile.type === 'fire_station') {
          fireStations.push({x: tile.x, z: tile.z});
        }
    });

    const isPowerSufficient = calcPowerCapacity >= calcPowerDemand;

    // 2. Second Pass: Calculate Effects based on Power Status
    Object.values(state.tiles).forEach((tile: TileData) => {
      if (tile.type === 'reserved') return; // Skip fillers

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

      // Insecurity from Buildings (like slums)
      // Note: Police reduction is calculated later
      if (config.insecurity) {
         // Insecurity is currently calculated globally, but we can track building contributions here implicitly
         // or just let them add to the baseInsecurity. 
         // For now, we'll let them add a flat penalty to happiness via the global stat calculation below.
      }

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

    // --- FIRE LOGIC ---
    let newFires = { ...state.fires };
    let emergencyCost = 0;

    // 1. Extinguish / Update existing fires
    Object.keys(newFires).forEach(key => {
      const [fxStr, fzStr] = key.split(',');
      const fx = parseInt(fxStr);
      const fz = parseInt(fzStr);
      
      // Check if near any fire station (Radius 3)
      let extinguished = false;
      for (const station of fireStations) {
        const dist = Math.abs(station.x - fx) + Math.abs(station.z - fz); // Manhattan distance
        if (dist <= 3) {
          extinguished = true;
          break;
        }
      }

      if (extinguished) {
        delete newFires[key];
        emergencyCost += 1000;
      } else {
        // Fire continues
        newFires[key] += 1; // Increment duration
        happinessPenalty += 2; // Fire makes people unhappy

        // Spread logic: If burnt for > 2 ticks, try spread
        if (newFires[key] > 2) {
           const neighbors = [
            {x: fx+1, z: fz}, {x: fx-1, z: fz}, {x: fx, z: fz+1}, {x: fx, z: fz-1}
           ];
           const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
           const nKey = `${randomNeighbor.x},${randomNeighbor.z}`;
           
           // If neighbor has a building and is not already burning
           const t = state.tiles[nKey];
           if (t && !newFires[nKey] && t.type !== 'road' && t.type !== 'reserved') {
              newFires[nKey] = 0; // Ignite neighbor
           }
        }
      }
    });

    // 2. Random Ignition (5% chance every 5 ticks)
    if (state.tickCount % 5 === 0 && Math.random() < 0.05 && tileKeys.length > 0) {
       // Pick random tile
       const randomKey = tileKeys[Math.floor(Math.random() * tileKeys.length)];
       const tile = state.tiles[randomKey];
       // Roads, fillers, and empty spots don't burn easily
       if (tile.type !== 'road' && tile.type !== 'reserved' && !newFires[randomKey]) {
          newFires[randomKey] = 0;
       }
    }

    // Ensure pollution doesn't go below 0
    calcPollution = Math.max(0, calcPollution);

    // Finalize Insecurity (Base - Police Mitigation + Slum contribution)
    let baseInsecurity = Math.floor(calcPopulation / 10);
    // Add extra insecurity from slums
    Object.values(state.tiles).forEach((t: TileData) => {
        if(t.type === 'informal_settlement') baseInsecurity += 5;
    });
    
    const calcInsecurity = Math.max(0, baseInsecurity - (policeCount * 5));

    // Finalize Corruption (Bribes + Kiosks)
    const eventCorruption = Math.floor(state.kickbackRevenue / 50); 
    const totalCorruption = calcCorruption + eventCorruption;

    // Pollution Penalty
    const pollutionPenalty = calcPollution > 50 ? Math.floor((calcPollution - 50) / 2) : 0;
    
    // Slum Happiness Penalty
    let slumHappinessPenalty = 0;
     Object.values(state.tiles).forEach((t: TileData) => {
        if(t.type === 'informal_settlement') slumHappinessPenalty += 5;
    });

    // Finalize Happiness
    calcHappiness = calcHappiness - totalCorruption - calcInsecurity - happinessPenalty - pollutionPenalty - slumHappinessPenalty;
    if (!isPowerSufficient && calcPowerDemand > 0) calcHappiness -= 20; // Blackout penalty
    calcHappiness = Math.max(0, Math.min(100, calcHappiness));

    // Add Kickback Revenue
    totalRevenue += state.kickbackRevenue;

    const netIncome = totalRevenue - totalUpkeep - emergencyCost;
    
    // Event Trigger Logic
    const newTickCount = state.tickCount + 1;
    let newEvent = state.activeEvent;
    
    if (newTickCount > 0 && newTickCount % 24 === 0 && !state.activeEvent) {
      newEvent = 'tender_expressway';
    }

    // --- LAND GRABBING LOGIC (Squatter Camps) ---
    // Every 10 ticks, if Insecurity > 30
    let newTiles = state.tiles;
    if (newTickCount % 10 === 0 && calcInsecurity > 30) {
        // Find candidates: Empty tiles adjacent to road or apartment
        const candidates: {x: number, z: number}[] = [];
        
        // Helper to check emptiness
        const isEmpty = (x: number, z: number) => !state.tiles[`${x},${z}`];
        
        Object.values(state.tiles).forEach((t: TileData) => {
            if (t.type === 'road' || t.type === 'apartment') {
                 const neighbors = [
                    {x: t.x+1, z: t.z}, {x: t.x-1, z: t.z},
                    {x: t.x, z: t.z+1}, {x: t.x, z: t.z-1}
                 ];
                 neighbors.forEach(n => {
                     // Check bounds 20x20 centered on 0,0? 
                     // GridSystem uses indices approx -10 to 9. We just check if they are already in tiles map.
                     if (n.x >= -10 && n.x < 10 && n.z >= -10 && n.z < 10) {
                         if (isEmpty(n.x, n.z)) {
                             candidates.push(n);
                         }
                     }
                 });
            }
        });

        if (candidates.length > 0) {
            const spot = candidates[Math.floor(Math.random() * candidates.length)];
            const key = `${spot.x},${spot.z}`;
            // Double check it's not taken (duplicates in candidates list possible)
            if (!newTiles[key]) {
                newTiles = {
                    ...newTiles,
                    [key]: { type: 'informal_settlement', x: spot.x, z: spot.z, rotation: Math.floor(Math.random()*4) }
                };
            }
        }
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
        activeEvent: newEvent,
        fires: newFires,
        tiles: newTiles
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
      kickbackRevenue: state.kickbackRevenue,
      fires: state.fires,
      gameWon: state.gameWon
    };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
      console.log("Game Saved Successfully");
    } catch (e) {
      console.error("Failed to save game", e);
    }
  },

  saveHighScore: () => {
    const state = get();
    // Calculate Composite Score
    // Logic: Money (weighted) + Population * 100 + Happiness * 500
    const score = Math.floor(state.money + (state.population * 100) + (state.happiness * 500));
    
    const newScore: HighScore = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString(),
        money: state.money,
        population: state.population,
        happiness: state.happiness,
        corruption: state.corruption,
        ticks: state.tickCount,
        score: score
    };

    let scores: HighScore[] = [];
    try {
        const raw = localStorage.getItem(SCORES_KEY);
        if (raw) scores = JSON.parse(raw);
    } catch(e) { console.error("Error reading high scores", e); }

    scores.push(newScore);
    // Sort descending by score
    scores.sort((a, b) => b.score - a.score);
    // Keep top 5
    scores = scores.slice(0, 5);
    
    try {
        localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
    } catch(e) { console.error("Error saving high score", e); }
  }
}));