import React from 'react';
import { useCityStore } from '../store/useCityStore';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from './ui/Button';

const TenderModal: React.FC = () => {
  const activeEvent = useCityStore((state) => state.activeEvent);
  const resolveTender = useCityStore((state) => state.resolveTender);

  if (activeEvent !== 'tender_expressway') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-nairobi-yellow/20 to-slate-900 p-6 border-b border-slate-700 flex items-center gap-4">
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

        {/* Content */}
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-bold text-white">Nairobi Expressway Tender</h3>
          <p className="text-slate-300 leading-relaxed">
            The government is issuing a tender for the new elevated highway project. 
            Two consortiums have bid for the project. How do you want to proceed?
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {/* Option A: Standard */}
            <div className="border border-slate-700 bg-slate-800/50 p-4 rounded-xl hover:border-green-500/50 transition-colors group">
              <div className="mb-3 flex items-center gap-2">
                 <CheckCircle className="w-5 h-5 text-green-500" />
                 <span className="font-bold text-white">Standard Process</span>
              </div>
              <p className="text-xs text-slate-400 mb-4 h-10">
                Follow strict procurement rules. Public trust increases, but it's expensive.
              </p>
              <div className="flex flex-col gap-1 text-xs mb-4 font-mono">
                <span className="text-red-400">Cost: KES 10,000</span>
                <span className="text-green-400">Happiness: +5</span>
              </div>
              <Button 
                size="sm" 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={() => resolveTender('standard')}
              >
                Approve (Legal)
              </Button>
            </div>

            {/* Option B: Bribe */}
            <div className="border border-slate-700 bg-slate-800/50 p-4 rounded-xl hover:border-orange-500/50 transition-colors group">
              <div className="mb-3 flex items-center gap-2">
                 <XCircle className="w-5 h-5 text-orange-500" />
                 <span className="font-bold text-white">"Kitu Kidogo"</span>
              </div>
              <p className="text-xs text-slate-400 mb-4 h-10">
                Accept a facilitation fee to fast-track a cheaper contractor. 
              </p>
              <div className="flex flex-col gap-1 text-xs mb-4 font-mono">
                <span className="text-green-400">Cost: KES 2,000</span>
                <span className="text-red-400">Corruption: +10</span>
                <span className="text-nairobi-yellow">Kickback: +500/day</span>
              </div>
              <Button 
                size="sm" 
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                onClick={() => resolveTender('bribe')}
              >
                Facilitate (Corrupt)
              </Button>
            </div>
          </div>
        </div>
        
        {/* Footer decoration */}
        <div className="h-1 w-full bg-gradient-to-r from-nairobi-yellow via-nairobi-green to-nairobi-red"></div>
      </div>
    </div>
  );
};

export default TenderModal;