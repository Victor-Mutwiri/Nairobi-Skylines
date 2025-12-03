import { CitySlice, UISlice } from './types';

export const createUISlice: CitySlice<UISlice> = (set, get) => ({
  activeTool: null,
  activeEvent: null,
  isPowerOverlay: false,
  showBudget: false,

  setActiveTool: (tool) => set({ activeTool: tool }),
  togglePowerOverlay: () => set((state) => ({ isPowerOverlay: !state.isPowerOverlay })),
  setShowBudget: (show) => set({ showBudget: show }),
});