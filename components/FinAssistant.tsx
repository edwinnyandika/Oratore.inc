import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Activity, CheckCircle2, TrendingUp, AlertCircle, Zap, ArrowRight, RefreshCw } from 'lucide-react';
import { generateFinancialInsights } from '../services/geminiService';
import { Invoice, Expense } from '../types';

interface FinAssistantProps {
  invoices: Invoice[];
  expenses: Expense[];
}

interface AnalysisResult {
  healthScore: number;
  summary: string;
  observations: string[];
  actionItems: string[];
  advisoryTone: string;
}

const FinAssistant: React.FC<FinAssistantProps> = ({ invoices, expenses }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AnalysisResult | null>(null);

  const handleTrigger = async () => {
    setIsOpen(true);
    if (!data) {
      setLoading(true);
      const result = await generateFinancialInsights(invoices, expenses);
      setData(result);
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    const result = await generateFinancialInsights(invoices, expenses);
    setData(result);
    setLoading(false);
  };

  const getScoreColor = (score: number) => {
    if (score > 80) return 'text-emerald-500';
    if (score > 50) return 'text-gold';
    return 'text-red-500';
  };

  return (
    <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-[70] flex flex-col items-end gap-4 no-print pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[calc(100vw-2rem)] sm:w-96 bg-white dark:bg-charcoal rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-200 dark:border-slate-800 flex flex-col max-h-[70vh] overflow-hidden pointer-events-auto"
          >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-charcoal-deep/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center text-charcoal shadow-glow">
                <Sparkles size={20} />
              </div>
              <div>
                <h4 className="font-heading font-black text-slate-900 dark:text-white leading-none">FinAssistant</h4>
                <p className="text-[9px] font-black text-gold uppercase tracking-widest mt-1">Strategic AI Core</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
            {loading ? (
              <div className="py-20 text-center space-y-4">
                <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 border-4 border-gold/10 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-gold rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-sm font-bold text-slate-400 animate-pulse uppercase tracking-widest">Processing Intelligence...</p>
              </div>
            ) : data ? (
              <div className="animate-fade-in space-y-8">
                {/* Health Score Hub */}
                <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-charcoal-deep rounded-3xl border border-slate-100 dark:border-white/5 relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fiscal Health Score</p>
                        <div className={`text-5xl font-heading font-black ${getScoreColor(data.healthScore)}`}>
                            {data.healthScore}<span className="text-xl opacity-40">/100</span>
                        </div>
                    </div>
                    <Activity className={`relative z-10 ${getScoreColor(data.healthScore)} opacity-20`} size={64} />
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gold/5 rounded-full blur-2xl"></div>
                </div>

                {/* Summary */}
                <section>
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">High-Level Overview</h5>
                    <div className="p-5 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                        <p className="text-sm font-medium text-slate-700 dark:text-indigo-100 leading-relaxed italic">
                            "{data.summary}"
                        </p>
                    </div>
                </section>

                {/* Observations */}
                <section>
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Strategic Observations</h5>
                    <div className="space-y-3">
                        {data.observations.map((obs, i) => (
                            <div key={i} className="flex gap-3 items-start p-3 bg-white dark:bg-charcoal-light rounded-xl shadow-sm border border-slate-100 dark:border-white/5 transition-transform hover:scale-[1.02]">
                                <TrendingUp size={14} className="mt-1 text-gold shrink-0" />
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-snug">{obs}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Action Items */}
                <section>
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-2">Priority Action Items</h5>
                    <div className="space-y-3">
                        {data.actionItems.map((action, i) => (
                            <div key={i} className="flex gap-3 items-start p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30 group">
                                <CheckCircle2 size={16} className="mt-0.5 text-emerald-500 shrink-0" />
                                <div className="flex-1">
                                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-100">{action}</span>
                                </div>
                                <ArrowRight size={14} className="text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        ))}
                    </div>
                </section>
              </div>
            ) : (
              <div className="py-12 text-center">
                <AlertCircle size={40} className="mx-auto text-slate-200 mb-4" />
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">No Intelligence Cached</p>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          {data && !loading && (
              <div className="p-4 bg-slate-50 dark:bg-charcoal-deep/50 border-t border-slate-100 dark:border-slate-800">
                  <button 
                    onClick={handleRefresh}
                    className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-gold transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={14} /> Refresh Analysis
                  </button>
              </div>
          )}
        </motion.div>
      )}
      </AnimatePresence>

      {/* Main Trigger FAB */}
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleTrigger}
        className={`
          p-4 rounded-full shadow-[0_15px_30px_-5px_rgba(244,206,107,0.4)] pointer-events-auto group relative overflow-hidden
          ${isOpen ? 'bg-charcoal dark:bg-white text-white dark:text-charcoal' : 'bg-gold text-charcoal'}
        `}
      >
        <div className="relative z-10 flex items-center gap-2">
            <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
            {!isOpen && <span className="text-[10px] font-black uppercase tracking-widest pr-2 hidden md:inline">Ask AI</span>}
        </div>
        {!isOpen && (
            <div className="absolute inset-0 bg-white/20 animate-pulse pointer-events-none"></div>
        )}
      </motion.button>
    </div>
  );
};

export default FinAssistant;