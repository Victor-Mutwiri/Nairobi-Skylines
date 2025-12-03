import { BuildingType } from './types';

export const SAVE_KEY = 'nairobi_skylines_save_v1';
export const SCORES_KEY = 'nairobi_skylines_highscores';

export const BUILDING_COSTS: Record<BuildingType, { 
  cost: number; 
  label: string; 
  population?: number; 
  happiness?: number;
  revenue?: number;
  upkeep?: number;
  pollution?: number;
  powerConsumption?: number;
  powerProduction?: number;
  insecurity?: number;
  description: string;
  width?: number;
  depth?: number;
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
    revenue: 100, 
    pollution: 0.5, 
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
    pollution: -15, 
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
