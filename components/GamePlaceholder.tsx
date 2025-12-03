import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from './ui/Button';

const GamePlaceholder: React.FC = () => {
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
    if (loadingStep < steps.length) {
      const timer = setTimeout(() => {
        setLoadingStep(prev => prev + 1);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [loadingStep, steps.length]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Grid */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
            backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            transform: 'perspective(500px) rotateX(60deg) translateY(100px) scale(2)',
        }}
      />

      <div className="relative z-10 max-w-md w-full text-center space-y-8 bg-slate-900/80 p-8 rounded-2xl border border-slate-800 backdrop-blur-xl shadow-2xl">
        <div className="flex justify-center">
          <Loader2 className="w-12 h-12 text-nairobi-yellow animate-spin" />
        </div>
        
        <div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">
            {loadingStep < steps.length ? "Loading Nairobi..." : "Ready to Build"}
          </h2>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-nairobi-yellow transition-all duration-300 ease-out"
              style={{ width: `${Math.min(100, (loadingStep / (steps.length - 1)) * 100)}%` }}
            />
          </div>
          <p className="text-slate-400 text-sm mt-3 font-mono">
            {loadingStep < steps.length ? steps[loadingStep] : "Engine Ready."}
          </p>
        </div>

        {loadingStep >= steps.length && (
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="p-4 bg-yellow-900/20 border border-yellow-700/50 rounded text-yellow-200 text-sm text-left">
              <strong>Note:</strong> This is a UI demo. The actual 3D WebGL game engine with instanced rendering would be integrated here in the next phase.
            </div>
            <Button onClick={() => navigate('/')} variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Menu
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePlaceholder;