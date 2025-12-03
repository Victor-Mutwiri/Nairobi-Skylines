import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, Settings, Pause } from 'lucide-react';
import { Button } from '../components/ui/Button';
import GameCanvas from '../components/GameCanvas';

const GameScreen: React.FC = () => {
  const navigate = useNavigate();
  const [loadingStep, setLoadingStep] = useState(0);

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

  const isLoading = loadingStep < steps.length;

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
        <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6">
          
          {/* Top Bar */}
          <div className="flex justify-between items-start pointer-events-auto">
            <div className="bg-slate-900/90 backdrop-blur border border-slate-700 p-3 rounded-xl flex gap-4 text-white shadow-xl">
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 uppercase tracking-wider">Balance</span>
                <span className="text-nairobi-yellow font-display font-bold text-xl">KES 5,000,000</span>
              </div>
               <div className="w-px bg-slate-700"></div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-400 uppercase tracking-wider">Population</span>
                <span className="font-display font-bold text-xl">0</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="secondary" className="w-10 h-10 p-0 rounded-full flex items-center justify-center">
                <Pause className="w-5 h-5 fill-current" />
              </Button>
              <Button size="sm" variant="outline" className="w-10 h-10 p-0 rounded-full bg-slate-900/90 border-slate-700 hover:bg-slate-800 text-white flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Bottom Bar (Toolbar Placeholder) */}
          <div className="flex justify-center pointer-events-auto">
             <div className="bg-slate-900/90 backdrop-blur border border-slate-700 p-2 rounded-2xl shadow-2xl flex gap-2">
                <Button size="sm" variant="primary" onClick={() => navigate('/')}>
                   <ArrowLeft className="w-4 h-4 mr-2" />
                   Exit to Menu
                </Button>
                {/* Tools will go here later */}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameScreen;