
import React from 'react';
import { useCityStore } from '../store/useCityStore';
import { Trophy, Crown, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';

const WinModal: React.FC = () => {
  const gameWon = useCityStore((state) => state.gameWon);
  const setGameWon = useCityStore((state) => state.setGameWon);

  if (!gameWon) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-700">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-nairobi-yellow/50 w-full max-w-lg rounded-3xl shadow-2xl relative overflow-hidden text-center p-8">
        
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-nairobi-yellow rounded-full blur-[100px] opacity-20 animate-pulse-slow"></div>
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-nairobi-green rounded-full blur-[100px] opacity-20 animate-pulse-slow"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="bg-nairobi-yellow p-4 rounded-full shadow-lg shadow-yellow-500/50 mb-6 animate-float">
            <Trophy className="w-12 h-12 text-black" />
          </div>

          <h2 className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-nairobi-yellow via-yellow-200 to-yellow-500 mb-2">
            TYCOON STATUS
          </h2>
          
          <div className="flex items-center gap-2 mb-6">
             <Crown className="w-5 h-5 text-nairobi-yellow" />
             <span className="text-slate-300 font-bold uppercase tracking-widest text-sm">Nairobi Conquered</span>
             <Crown className="w-5 h-5 text-nairobi-yellow" />
          </div>

          <p className="text-slate-300 text-lg leading-relaxed mb-8">
            You have constructed the <span className="text-nairobi-yellow font-bold">NBK Tower</span>, the jewel of the skyline. 
            The city is yours. The matatus run on time (mostly), and the lights stay on.
          </p>

          <div className="flex gap-4 w-full">
            <Button 
                size="lg" 
                className="w-full bg-nairobi-yellow hover:bg-yellow-400 text-black shadow-lg shadow-yellow-500/20"
                onClick={() => setGameWon(false)}
            >
                <Sparkles className="w-5 h-5 mr-2" />
                Keep Building
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WinModal;
