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
        kickbackRevenue: state.kickbackRevenue + 500,
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
