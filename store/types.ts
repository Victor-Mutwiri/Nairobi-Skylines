import { StateCreator } from 'zustand';

// --- Domain Types ---

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
  | 'reserved';

export type ToolType = BuildingType | 'bulldozer';
export type EventType = 'tender_expressway' | null;

export interface TileData {
  type: BuildingType;
  x: number;
  z: number;
  rotation: number;
  parentX?: number; 
  parentZ?: number;
  hasRoadAccess?: boolean;
  isPowered?: boolean;
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

// --- Slice Interfaces ---

export interface EconomySlice {
  money: number;
  population: number;
  happiness: number;
  insecurity: number;
  corruption: number;
  pollution: number;
  kickbackRevenue: number;
  gameWon: boolean;
  
  updateMoney: (amount: number) => void;
  resolveTender: (choice: 'standard' | 'bribe') => void;
  saveHighScore: () => void;
  setGameWon: (won: boolean) => void;
}

export interface UISlice {
  activeTool: ToolType | null;
  activeEvent: EventType;
  isPowerOverlay: boolean;
  isNight: boolean;

  setActiveTool: (tool: ToolType | null) => void;
  togglePowerOverlay: () => void;
  setIsNight: (isNight: boolean) => void;
}

export interface GridSlice {
  tiles: Record<string, TileData>;
  fires: Record<string, number>;
  tickCount: number;
  powerCapacity: number;
  powerDemand: number;
  trafficDensity: number;

  addBuilding: (x: number, z: number, type: BuildingType) => void;
  removeBuilding: (x: number, z: number) => void;
  runGameTick: () => number; // Returns net income
  saveGame: () => void;
}

// --- Main Store Interface ---

export type CityState = EconomySlice & UISlice & GridSlice;

export type CitySlice<T> = StateCreator<CityState, [], [], T>;
