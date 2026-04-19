import React from 'react';
import { motion } from 'motion/react';
import { ViewState } from '../types';
import { LayoutDashboard, FileText, Camera, Users, BarChart } from 'lucide-react';

interface MobileNavProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ currentView, onChangeView }) => {
  const tabs = [
    { id: 'DASHBOARD' as ViewState, label: 'Overview', icon: LayoutDashboard },
    { id: 'INVOICES' as ViewState, label: 'Assets', icon: FileText },
    { id: 'EXPENSES' as ViewState, label: 'Scan', icon: Camera },
    { id: 'CLIENTS' as ViewState, label: 'Partners', icon: Users },
    { id: 'REPORTS' as ViewState, label: 'Intel', icon: BarChart },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[60] pb-[safe-area-inset-bottom] no-print">
        <div className="mx-4 mb-4 glass-dark rounded-[2rem] shadow-2xl flex items-center justify-around p-3 border border-white/10 backdrop-blur-3xl">
            {tabs.map((tab) => {
                const isActive = currentView === tab.id;
                return (
                    <motion.button
                        key={tab.id}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onChangeView(tab.id)}
                        className="flex flex-col items-center gap-1.5 py-1 px-3 relative transition-all"
                    >
                        <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-gold/10 text-gold scale-110' : 'text-slate-500 hover:text-slate-300'}`}>
                            <tab.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-gold' : 'text-slate-500'}`}>
                            {tab.label}
                        </span>
                        {isActive && (
                            <motion.div 
                                layoutId="activeTab"
                                className="absolute -bottom-1 w-1 h-1 bg-gold rounded-full shadow-[0_0_8px_#F4CE6B]"
                            />
                        )}
                    </motion.button>
                );
            })}
        </div>
    </nav>
  );
};

export default MobileNav;