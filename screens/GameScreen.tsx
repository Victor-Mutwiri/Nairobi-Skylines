
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Settings, Pause, Smile, Users, Coins, ShieldAlert, Briefcase, Save, CheckCircle, Zap, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import GameCanvas from '../components/GameCanvas';
import TenderModal from '../components/TenderModal';
import { useCityStore, BUILDING_COSTS, BuildingType } from '../store/useCityStore';

const GameScreen: React.FC = () => {
  const navigate = useNavigate();
  const [loadingStep, setLoadingStep] = useState(0);
  const [incomeNotification, setIncomeNotification] = useState<{ amount: number; id: number } | null>(null);
  const [saveNotification, setSaveNotification] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  // Connect to store
  const money = useCityStore((state) => state.money);
  const population = useCityStore((state) => state.population);
  const happiness = useCityStore((state) => state.happiness);
  const insecurity = useCityStore((state) => state.insecurity);
  const corruption = useCityStore((state) => state.corruption);
  const pollution = useCityStore((state) => state.pollution);
  const powerCapacity = useCityStore((state) => state.powerCapacity);
  const powerDemand = useCityStore((state) => state.powerDemand);
  const isPowerOverlay = useCityStore((state) => state.isPowerOverlay);
  
  const activeTool = useCityStore((state) => state.activeTool);
  const setActiveTool = useCityStore((state) => state.setActiveTool);
  const togglePowerOverlay = useCityStore((state) => state.togglePowerOverlay);
  const runGameTick = useCityStore((state) => state.runGameTick);
  const activeEvent = useCityStore((state) => state.activeEvent);
  const saveGame = useCityStore((state) => state.saveGame);

  const steps = [
    "Initializing Low Poly Engine...",
    "Loading Instanced Geometry...",
    "Generating Terrain (Ngong Hills)...",
    "Spawning Matatus...",
    "Calibrating Traffic AI..."
  ];

  useEffect(() => {
    // Simulate loading sequence
    if (loadingStep < steps.length) {
      const timer = setTimeout(() => {
        setLoadingStep(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [loadingStep, steps.length]);

  // Game Loop: Ticks every 5 seconds (1 Game Day)
  useEffect(() => {
    // Do not tick if loading, paused, or if a modal (event) is active
    if (loadingStep < steps.length || isPaused || activeEvent) return;

    const interval = setInterval(() => {
      const netIncome = runGameTick();
      if (netIncome !== 0) {
        setIncomeNotification({ amount: netIncome, id: Date.now() });
        // Clear notification after animation
        setTimeout(() => setIncomeNotification(null), 2000);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [loadingStep, steps.length, isPaused, runGameTick, activeEvent]);

  const handleSave = () => {
    saveGame();
    setSaveNotification(true);
    setTimeout(() => setSaveNotification(false), 2500);
  };

  const isLoading = loadingStep < steps.length;
  const powerUsagePct = powerCapacity > 0 ? Math.round((powerDemand / powerCapacity) * 100) : 0;
  const isPowerCritical = powerDemand > powerCapacity;

  return (
    <div className="h-screen w-screen bg-black relative overflow-hidden">
      
      {/* 3D Game World */}
      {!isLoading && (
        <div className="absolute inset-0 z-0 animate-in fade-in duration-1000">
           <GameCanvas />
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white">
           <div className="max-w-md w-full text-center space-y-8 p-8">
            <div className="flex justify-center">
              <Loader2 className="w-12 h-12 text-nairobi-yellow animate-spin" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-white mb-2">Loading Nairobi...</h2>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-nairobi-yellow transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(100, (loadingStep / (steps.length - 1)) * 100)}%` }}
                />
              </div>
              <p className="text-slate-400 text-sm mt-3 font-mono">
                {steps[loadingStep]}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* In-Game UI Overlay (HUD) */}
      {!isLoading && (
        <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-4 md:p-6">
          
          {/* Top Bar: Stats */}
          <div className="flex justify-between items-start pointer-events-auto w-full">
            <div className="relative bg-slate-900/90 backdrop-blur border border-slate-700 p-2 md:p-3 rounded-xl flex gap-3 md:gap-4 text-white shadow-xl overflow-x-auto max-w-[80vw]">
              
              {/* Money */}
              <div className="flex items-center gap-2 md:gap-3 min-w-fit">
                <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-nairobi-yellow">
                    <Coins className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-bold">Balance</span>
                  <span className="text-nairobi-yellow font-display font-bold text-lg md:text-xl">KES {money.toLocaleString()}</span>
                </div>
              </div>

               <div className="w-px bg-slate-700 my-1"></div>

              {/* Population */}
              <div className="flex items-center gap-2 md:gap-3 min-w-fit">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <Users className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-bold">Pop</span>
                  <span className="font-display font-bold text-lg md:text-xl">{population.toLocaleString()}</span>
                </div>
              </div>

              <div className="w-px bg-slate-700 my-1"></div>

              {/* Power */}
              <div className="flex items-center gap-2 md:gap-3 min-w-fit">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isPowerCritical ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    <Zap className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-bold">Power</span>
                  <span className={`font-display font-bold text-lg md:text-xl ${isPowerCritical ? 'text-red-400' : 'text-white'}`}>
                    {powerDemand}/{powerCapacity} <span className="text-xs text-slate-400 font-sans">MW</span>
                  </span>
                </div>
              </div>

              <div className="w-px bg-slate-700 my-1"></div>

              {/* Happiness */}
              <div className="flex items-center gap-2 md:gap-3 min-w-fit">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${happiness < 40 ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-nairobi-green'}`}>
                    <Smile className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-bold">Happy</span>
                  <span className="font-display font-bold text-lg md:text-xl">{happiness}%</span>
                </div>
              </div>

              <div className="w-px bg-slate-700 my-1"></div>

              {/* Insecurity */}
              <div className="flex items-center gap-2 md:gap-3 min-w-fit">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${insecurity > 10 ? 'bg-red-500/20 text-red-500' : 'bg-slate-700/50 text-slate-400'}`}>
                    <ShieldAlert className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-bold">Risk</span>
                  <span className="font-display font-bold text-lg md:text-xl">{insecurity}</span>
                </div>
              </div>

              <div className="w-px bg-slate-700 my-1"></div>

               {/* Corruption */}
               <div className="flex items-center gap-2 md:gap-3 min-w-fit">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${corruption > 5 ? 'bg-orange-500/20 text-orange-500' : 'bg-slate-700/50 text-slate-400'}`}>
                    <Briefcase className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-bold">Graft</span>
                  <span className="font-display font-bold text-lg md:text-xl">{corruption}</span>
                </div>
              </div>

              <div className="w-px bg-slate-700 my-1"></div>

               {/* Pollution */}
               <div className="flex items-center gap-2 md:gap-3 min-w-fit">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${pollution > 50 ? 'bg-red-500/20 text-red-500' : 'bg-slate-700/50 text-slate-400'}`}>
                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-bold">Waste</span>
                  <span className="font-display font-bold text-lg md:text-xl">{Math.round(pollution)}</span>
                </div>
              </div>

              {/* Floating Income Notification */}
              {incomeNotification && (
                <div 
                  key={incomeNotification.id}
                  className={`absolute -bottom-8 left-4 font-bold animate-fade-up ${incomeNotification.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}
                >
                  {incomeNotification.amount >= 0 ? '+' : ''}{incomeNotification.amount} KES
                </div>
              )}
            </div>

            <div className="flex gap-2 ml-4">
               {/* Save Button */}
               <Button 
                size="sm" 
                variant="secondary"
                onClick={handleSave}
                className="w-10 h-10 p-0 rounded-full flex items-center justify-center shadow-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white"
                title="Save City"
              >
                <Save className="w-5 h-5" />
              </Button>

              <Button 
                size="sm" 
                variant={isPaused ? "primary" : "secondary"}
                onClick={() => setIsPaused(!isPaused)}
                className="w-10 h-10 p-0 rounded-full flex items-center justify-center shadow-lg"
              >
                <Pause className={`w-5 h-5 fill-current ${isPaused ? 'animate-pulse' : ''}`} />
              </Button>
              <Button size="sm" variant="outline" className="w-10 h-10 p-0 rounded-full bg-slate-900/90 border-slate-700 hover:bg-slate-800 text-white flex items-center justify-center shadow-lg">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
           {/* Save Notification Toast */}
           {saveNotification && (
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-4 fade-in duration-300">
              <CheckCircle className="w-5 h-5" />
              <span className="font-bold">City Saved Successfully</span>
            </div>
           )}

          {/* Bottom Bar: Building Tools */}
          <div className="flex flex-col gap-4 pointer-events-auto">
             
             {/* Power Overlay Toggle */}
             <div className="self-end">
                <Button 
                    size="sm" 
                    onClick={togglePowerOverlay}
                    className={`rounded-full px-4 shadow-xl border ${isPowerOverlay ? 'bg-yellow-500 border-yellow-400 text-black' : 'bg-slate-800 border-slate-600 text-slate-300'}`}
                >
                    <Zap className="w-4 h-4 mr-2" />
                    {isPowerOverlay ? 'Power Overlay ON' : 'Show Power Grid'}
                </Button>
             </div>

             {/* Selected Tool Info Tip */}
             {activeTool && (
                <div className="self-center bg-slate-900/90 border border-nairobi-yellow/50 px-4 py-2 rounded-lg backdrop-blur text-sm text-nairobi-yellow font-medium animate-in slide-in-from-bottom-2">
                   Active Tool: {BUILDING_COSTS[activeTool].label} (KES {BUILDING_COSTS[activeTool].cost.toLocaleString()})
                   <span className="block text-xs text-slate-400 font-normal mt-1">{BUILDING_COSTS[activeTool].description}</span>
                </div>
             )}

             <div className="flex justify-center items-end gap-3 w-full overflow-x-auto pb-2 scrollbar-hide">
                <div className="bg-slate-900/90 backdrop-blur border border-slate-700 p-2 rounded-2xl shadow-2xl flex gap-2">
                    <Button 
                        size="sm" 
                        variant="primary" 
                        className="bg-red-600 hover:bg-red-700 border-none text-white shadow-none h-12 w-12 p-0 flex items-center justify-center rounded-xl"
                        onClick={() => navigate('/')}
                        title="Exit Game"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    
                    <div className="w-px bg-slate-700 mx-1 h-8 self-center"></div>

                    {(Object.keys(BUILDING_COSTS) as BuildingType[]).map((type) => {
                        const config = BUILDING_COSTS[type];
                        const isActive = activeTool === type;
                        const canAfford = money >= config.cost;

                        return (
                            <button
                                key={type}
                                onClick={() => setActiveTool(isActive ? null : type)}
                                disabled={!canAfford}
                                className={`
                                    relative group flex flex-col items-center justify-center w-20 h-20 rounded-xl transition-all duration-200 border-2 min-w-[5rem]
                                    ${isActive 
                                        ? 'bg-nairobi-yellow border-nairobi-yellow text-nairobi-black scale-105 shadow-lg shadow-yellow-500/20' 
                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:border-slate-600'
                                    }
                                    ${!canAfford ? 'opacity-50 cursor-not-allowed grayscale' : ''}
                                `}
                            >
                                <span className={`text-[10px] font-bold uppercase mb-1 leading-none ${isActive ? 'text-black' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                    {config.label}
                                </span>
                                <span className={`text-xs font-mono font-bold ${isActive ? 'text-black' : 'text-nairobi-yellow'}`}>
                                    {config.cost >= 1000 ? `${config.cost/1000}k` : config.cost}
                                </span>
                            </button>
                        );
                    })}
                </div>
             </div>
          </div>
        </div>
      )}
      
      {/* Modals */}
      <TenderModal />

    </div>
  );
};

export default GameScreen;
