import { create } from 'zustand';
import { CityState } from './types';
import { SAVE_KEY } from './constants';
import { createEconomySlice } from './createEconomySlice';
import { createGridSlice } from './createGridSlice';
import { createUISlice } from './createUISlice';

// Re-export for backward compatibility with existing components
export * from './types';
export * from './constants';

const loadInitialState = () => {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load save game:", e);
  }
  return {};
};

export const useCityStore = create<CityState>((...a) => ({
  ...createEconomySlice(...a),
  ...createGridSlice(...a),
  ...createUISlice(...a),
  ...loadInitialState(), // Overwrite default slice state with saved data if available
}));
