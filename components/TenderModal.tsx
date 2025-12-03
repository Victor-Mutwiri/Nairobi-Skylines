import React from 'react';
import { useCityStore } from '../store/useCityStore';
import { AlertTriangle, CheckCircle, XCircle, X } from 'lucide-react';
import { Button } from './ui/Button';

const TenderModal: React.FC = () => {
  const activeEvent = useCityStore((state) => state.activeEvent);
  const resolveTender = useCityStore((state) => state.resolveTender);
  const money = useCityStore((state) => state.money);

  if (activeEvent !== 'tender_expressway') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-nairobi-yellow/20 to-slate-900 p-6 border-b border-slate-700 flex items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-nairobi-yellow/20 p-3 rounded-full">
                <AlertTriangle className="w-8 h-8 text-nairobi-yellow" />
            </div>
            <div>
                <h2 className="text-xl font-display font-bold text-white uppercase tracking-wide">
                Contract Opportunity
                </h2>
                <p className="text-nairobi-yellow text-sm font-bold">Ministry of Roads & Transport</p>
            </div>
          </div>
          <button onClick={() => resolveTender('reject')} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Nairobi Expressway Tender</h3>
          <p className="text-slate-300 leading-relaxed">
            The government is issuing a tender for the new elevated highway project. 
            Two consortiums have bid for the project. This will generate massive toll revenue but increase noise pollution.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {/* Option A: Standard */}
            <div className="border border-slate-700 bg-slate-800/50 p-4 rounded-xl hover:border-green-500/50 transition-colors group flex flex-col justify-between">
              <div>
                  <div className="mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-bold text-white">Standard Process</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">
                    Follow strict procurement rules. Public trust increases, but it's expensive.
                  </p>
                  <div className="flex flex-col gap-1 text-xs mb-4 font-mono">
                    <span className={`${money < 10000 ? 'text-red-500 font-bold' : 'text-red-400'}`}>Cost: KES 10,000</span>
                    <span className="text-green-400">Happiness: +5</span>
                    <span className="text-yellow-400">Builds Expressway</span>
                  </div>
              </div>
              <Button 
                size="sm" 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => resolveTender('standard')}
                disabled={money < 10000}
              >
                Approve (Legal)
              </Button>
            </div>

            {/* Option B: Bribe */}
            <div className="border border-slate-700 bg-slate-800/50 p-4 rounded-xl hover:border-orange-500/50 transition-colors group flex flex-col justify-between">
              <div>
                  <div className="mb-3 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-orange-500" />
                    <span className="font-bold text-white">"Kitu Kidogo"</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">
                    Accept a facilitation fee to fast-track a cheaper contractor. 
                  </p>
                  <div className="flex flex-col gap-1 text-xs mb-4 font-mono">
                    <span className={`${money < 2000 ? 'text-red-500 font-bold' : 'text-green-400'}`}>Cost: KES 2,000</span>
                    <span className="text-red-400">Corruption: +10</span>
                    <span className="text-nairobi-yellow">Kickback: +500/day</span>
                  </div>
              </div>
              <Button 
                size="sm" 
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                onClick={() => resolveTender('bribe')}
                disabled={money < 2000}
              >
                Facilitate (Corrupt)
              </Button>
            </div>
          </div>
          
           {/* Reject Option */}
           <div className="mt-4 pt-4 border-t border-slate-700/50 text-center">
             <button 
                onClick={() => resolveTender('reject')}
                className="text-slate-400 hover:text-white text-sm font-medium transition-colors"
             >
                Reject Project (No Cost)
             </button>
           </div>

        </div>
        
        {/* Footer decoration */}
        <div className="h-1 w-full bg-gradient-to-r from-nairobi-yellow via-nairobi-green to-nairobi-red"></div>
      </div>
    </div>
  );
};

export default TenderModal;