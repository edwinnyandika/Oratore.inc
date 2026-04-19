
import React, { useState, useEffect } from 'react';
import { calculateTaxLiability } from '../services/geminiService';
import { Landmark, Calculator, Sparkles, TrendingUp, Wallet, ArrowRight, RefreshCw, Info, CheckCircle2 } from 'lucide-react';
import { Invoice, SUPPORTED_CURRENCIES } from '../types';

interface TaxCalculatorProps {
  invoices: Invoice[];
  defaultCurrency: string;
}

const TaxCalculator: React.FC<TaxCalculatorProps> = ({ invoices, defaultCurrency }) => {
  const [incomeType, setIncomeType] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [manualIncome, setManualIncome] = useState<number>(0);
  const [currency, setCurrency] = useState(defaultCurrency);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const annualIncome = invoices
    .filter(i => i.status === 'Paid')
    .reduce((sum, i) => sum + i.total, 0);

  const handleCalculate = async () => {
    setLoading(true);
    const income = incomeType === 'AUTO' ? annualIncome : manualIncome;
    const data = await calculateTaxLiability(income, currency);
    setResult(data);
    setLoading(false);
  };

  useEffect(() => {
    if (annualIncome > 0 && !result) handleCalculate();
  }, [annualIncome]);

  return (
    <div className="space-y-8 animate-slide-up pb-12 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-slate-200/50 pb-6">
        <div>
            <h2 className="text-4xl font-heading font-bold text-slate-900">Tax Intelligence</h2>
            <p className="text-slate-500 mt-2 text-lg">AI-driven liability estimation & savings</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
             <button onClick={() => setIncomeType('AUTO')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${incomeType === 'AUTO' ? 'bg-white shadow-sm text-brand-primary' : 'text-slate-500'}`}>Auto (Paid Invoices)</button>
             <button onClick={() => setIncomeType('MANUAL')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${incomeType === 'MANUAL' ? 'bg-white shadow-sm text-brand-primary' : 'text-slate-500'}`}>Manual Entry</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-6">
              <div className="glass-panel p-6 rounded-3xl border border-slate-200">
                  <h3 className="font-heading font-bold text-slate-900 mb-6 flex items-center gap-2">
                      <Calculator size={18} className="text-brand-primary"/> Parameters
                  </h3>
                  <div className="space-y-4">
                      <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Annual Income</label>
                          {incomeType === 'AUTO' ? (
                              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-brand-primary font-heading font-bold text-2xl">
                                  {SUPPORTED_CURRENCIES.find(c => c.code === currency)?.symbol}{annualIncome.toLocaleString()}
                              </div>
                          ) : (
                              <input 
                                type="number" 
                                value={manualIncome} 
                                onChange={(e) => setManualIncome(parseFloat(e.target.value))} 
                                className="w-full p-4 bg-slate-50 rounded-2xl text-2xl font-heading font-bold outline-none focus:ring-2 focus:ring-brand-primary/20"
                                placeholder="0.00"
                              />
                          )}
                      </div>
                      <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Base Currency</label>
                          <select 
                            value={currency} 
                            onChange={(e) => setCurrency(e.target.value)} 
                            className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none"
                          >
                              {SUPPORTED_CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                          </select>
                      </div>
                      <button 
                        onClick={handleCalculate}
                        disabled={loading}
                        className="w-full py-4 bg-brand-black text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                          {loading ? <RefreshCw className="animate-spin" size={18}/> : <Sparkles size={18}/>}
                          Estimate Tax
                      </button>
                  </div>
              </div>
          </div>

          {/* Result Panel */}
          <div className="lg:col-span-2 space-y-6">
               {result ? (
                   <div className="space-y-6 animate-fade-in">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="glass-panel p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary rounded-full blur-[60px] opacity-30"></div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Estimated Liability</p>
                                <div className="text-4xl font-heading font-black text-brand-primary">
                                    {result.estimatedTaxRate}%
                                </div>
                                <p className="text-2xl font-heading font-bold mt-2">
                                    {SUPPORTED_CURRENCIES.find(c => c.code === currency)?.symbol}{result.taxAmount.toLocaleString()}
                                </p>
                            </div>
                            <div className="glass-panel p-8 rounded-3xl bg-emerald-500 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-[60px] opacity-20"></div>
                                <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest mb-2">Suggested Monthly Savings</p>
                                <div className="text-4xl font-heading font-black">
                                    {SUPPORTED_CURRENCIES.find(c => c.code === currency)?.symbol}{result.monthlySavingsSuggestion.toLocaleString()}
                                </div>
                                <div className="flex items-center gap-2 mt-4 text-emerald-100 text-xs font-bold bg-white/10 w-fit px-3 py-1 rounded-full">
                                    <TrendingUp size={14}/> 12-month goal
                                </div>
                            </div>
                       </div>

                       <div className="glass-panel p-8 rounded-3xl border border-indigo-100 bg-indigo-50/20">
                           <h4 className="font-heading font-bold text-slate-900 flex items-center gap-2 mb-4">
                               <Info size={18} className="text-brand-primary"/> Expert Advice
                           </h4>
                           <p className="text-slate-600 leading-relaxed mb-6 italic">"{result.advisoryNote}"</p>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               {result.optimizationTips.map((tip: string, idx: number) => (
                                   <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                                       <div className="p-1 bg-emerald-50 text-emerald-500 rounded-md mt-0.5"><CheckCircle2 size={14}/></div>
                                       <span className="text-sm font-medium text-slate-700">{tip}</span>
                                   </div>
                               ))}
                           </div>
                       </div>
                   </div>
               ) : (
                   <div className="glass-panel p-16 rounded-[2.5rem] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 text-center">
                       <Calculator className="w-16 h-16 text-slate-200 mb-4"/>
                       <h3 className="text-xl font-heading font-bold text-slate-400">Ready to calculate?</h3>
                       <p className="text-slate-400 max-w-xs mt-2">Adjust your parameters and click estimate to see your projected tax liability.</p>
                   </div>
               )}
          </div>
      </div>
    </div>
  );
};

export default TaxCalculator;
