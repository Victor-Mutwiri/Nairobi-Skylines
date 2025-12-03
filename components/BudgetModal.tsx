import React from 'react';
import { useCityStore } from '../store/useCityStore';
import { X, TrendingUp, TrendingDown, Coins, AlertTriangle } from 'lucide-react';

const BudgetModal: React.FC = () => {
  const showBudget = useCityStore((state) => state.showBudget);
  const setShowBudget = useCityStore((state) => state.setShowBudget);
  const financials = useCityStore((state) => state.financials);
  const taxRate = useCityStore((state) => state.taxRate) || 1.0;
  const setTaxRate = useCityStore((state) => state.setTaxRate);

  if (!showBudget) return null;

  const formatMoney = (amount: number) => `KES ${amount.toLocaleString()}`;

  // Tax Rate Options
  const handleTaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTaxRate(parseFloat(e.target.value));
  };

  const getTaxLabel = (rate: number) => {
      if (rate <= 0.6) return { label: "Tax Haven", color: "text-green-400", desc: "+Happiness (Huge)" };
      if (rate <= 0.9) return { label: "Low", color: "text-green-300", desc: "+Happiness" };
      if (rate === 1.0) return { label: "Normal", color: "text-slate-300", desc: "No Effect" };
      if (rate <= 1.3) return { label: "High", color: "text-orange-400", desc: "-Happiness" };
      if (rate <= 1.6) return { label: "Very High", color: "text-red-400", desc: "--Happiness" };
      return { label: "Extortion", color: "text-red-600 font-bold", desc: "Riots Likely" };
  };

  const taxInfo = getTaxLabel(taxRate);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-nairobi-yellow" />
            <h2 className="text-lg font-bold text-white">Financial Report & Policy</h2>
          </div>
          <button onClick={() => setShowBudget(false)} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Tax Control Section */}
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
             <div className="flex justify-between items-center mb-3">
                 <h3 className="font-bold text-sm uppercase text-slate-300">Income Tax Rate</h3>
                 <div className="text-right">
                     <span className={`block text-lg font-display font-bold ${taxInfo.color}`}>{taxInfo.label} ({(taxRate * 10).toFixed(0)}%)</span>
                     <span className="text-xs text-slate-400">{taxInfo.desc}</span>
                 </div>
             </div>
             <input 
               type="range" 
               min="0.5" 
               max="2.0" 
               step="0.1" 
               value={taxRate}
               onChange={handleTaxChange}
               className="w-full accent-nairobi-yellow h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
             />
             <div className="flex justify-between text-xs text-slate-500 mt-2 font-mono">
                 <span>5%</span>
                 <span>10%</span>
                 <span>15%</span>
                 <span>20%</span>
             </div>
          </div>

          {/* Income Section */}
          <div>
             <div className="flex items-center gap-2 mb-2 text-green-400">
                <TrendingUp className="w-4 h-4" />
                <h3 className="font-bold uppercase tracking-wider text-xs">Revenue Sources</h3>
             </div>
             <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-300">
                    <span>Residential Tax</span>
                    <span>{formatMoney(financials.income.residential)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                    <span>Commercial Tax</span>
                    <span>{formatMoney(financials.income.commercial)}</span>
                </div>
                {financials.income.industrial > 0 && (
                     <div className="flex justify-between text-slate-300">
                        <span>Industrial Tax</span>
                        <span>{formatMoney(financials.income.industrial)}</span>
                    </div>
                )}
                 {financials.income.agricultural > 0 && (
                     <div className="flex justify-between text-slate-300">
                        <span>Agricultural Sales</span>
                        <span>{formatMoney(financials.income.agricultural)}</span>
                    </div>
                )}
                {financials.income.tolls > 0 && (
                    <div className="flex justify-between text-slate-300">
                        <span>Expressway Tolls</span>
                        <span>{formatMoney(financials.income.tolls)}</span>
                    </div>
                )}
                {financials.income.kickbacks > 0 && (
                    <div className="flex justify-between text-slate-300">
                        <span>Unofficial Fees (Kickbacks)</span>
                        <span>{formatMoney(financials.income.kickbacks)}</span>
                    </div>
                )}
                <div className="border-t border-slate-700 pt-1 flex justify-between font-bold text-green-400 mt-1">
                    <span>Total Income</span>
                    <span>{formatMoney(financials.income.total)}</span>
                </div>
             </div>
          </div>

          {/* Expense Section */}
          <div>
             <div className="flex items-center gap-2 mb-2 text-red-400">
                <TrendingDown className="w-4 h-4" />
                <h3 className="font-bold uppercase tracking-wider text-xs">Expenses</h3>
             </div>
             <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-300">
                    <span>Road Maintenance</span>
                    <span>{formatMoney(financials.expenses.infrastructure)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                    <span>Public Services (Police/Power/Parks)</span>
                    <span>{formatMoney(financials.expenses.services)}</span>
                </div>
                {financials.expenses.emergency > 0 && (
                     <div className="flex justify-between text-red-300">
                        <span>Emergency Responses</span>
                        <span>{formatMoney(financials.expenses.emergency)}</span>
                    </div>
                )}
                <div className="border-t border-slate-700 pt-1 flex justify-between font-bold text-red-400 mt-1">
                    <span>Total Expenses</span>
                    <span>{formatMoney(financials.expenses.total)}</span>
                </div>
             </div>
          </div>

          {/* Net Result */}
          <div className={`p-4 rounded-xl flex justify-between items-center font-bold text-lg border ${financials.net >= 0 ? 'bg-green-900/20 border-green-800 text-green-400' : 'bg-red-900/20 border-red-800 text-red-400'}`}>
             <span>Net Daily Rate</span>
             <span>{financials.net >= 0 ? '+' : ''}{formatMoney(financials.net)}</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BudgetModal;