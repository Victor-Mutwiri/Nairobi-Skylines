import { CitySlice, EconomySlice, HighScore } from './types';
import { SCORES_KEY } from './constants';

export const createEconomySlice: CitySlice<EconomySlice> = (set, get) => ({
  money: 50000,
  population: 0,
  happiness: 50,
  insecurity: 0,
  corruption: 0,
  pollution: 0,
  kickbackRevenue: 0,
  gameWon: false,
  taxRate: 1.0, // Default 100% (Normal)
  financials: {
    income: { residential: 0, commercial: 0, industrial: 0, agricultural: 0, tolls: 0, kickbacks: 0, total: 0 },
    expenses: { infrastructure: 0, services: 0, emergency: 0, total: 0 },
    net: 0
  },

  updateMoney: (amount) => set((state) => ({
    money: state.money + amount
  })),

  setTaxRate: (rate) => set({ taxRate: rate }),

  resolveTender: (choice) => set((state) => {
    if (choice === 'reject') {
        return { activeEvent: null };
    }

    // Construct the Expressway (Visual + Gameplay Impact)
    // We build it along Z = -9 (Back edge of map)
    const newTiles = { ...state.tiles };
    
    // Build pillars every 2 units
    for (let x = -10; x < 10; x++) {
        // Only place actual pillars every 2 units, but logic handles single tile
        if (x % 2 === 0) {
             const key = `${x},-9`;
             newTiles[key] = {
                type: 'expressway_pillar',
                x: x,
                z: -9,
                rotation: 0,
                hasRoadAccess: true, // It's a road itself
                isPowered: true // Streetlights
             };
        }
    }

    if (choice === 'standard') {
      return {
        money: state.money - 10000,
        happiness: Math.min(100, state.happiness + 5),
        tiles: newTiles,
        activeEvent: null
      };
    } else {
      // Bribe choice
      return {
        money: state.money - 2000,
        corruption: state.corruption + 10,
        kickbackRevenue: state.kickbackRevenue + 500,
        tiles: newTiles, // Still build it
        activeEvent: null
      };
    }
  }),

  setGameWon: (won) => set({ gameWon: won }),

  saveHighScore: () => {
    const state = get();
    // Calculate Composite Score
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
});