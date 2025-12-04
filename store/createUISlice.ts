import { CitySlice, UISlice } from './types';

export const createUISlice: CitySlice<UISlice> = (set, get) => ({
  activeTool: null,
  activeEvent: null,
  isPowerOverlay: false,
  showBudget: false,
  rotation: 0,

  setActiveTool: (tool) => set({ activeTool: tool }),
  togglePowerOverlay: () => set((state) => ({ isPowerOverlay: !state.isPowerOverlay })),
  setShowBudget: (show) => set({ showBudget: show }),
  setRotation: (rotation) => set({ rotation }),
});