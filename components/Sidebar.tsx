import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ViewState } from '../types';
import { 
  LayoutDashboard, FileText, Edit, Folder, Receipt, Users, 
  BarChart, Settings, Plus, Star, Package, Moon, Sun, Mic, HelpCircle, ChevronRight, X
} from 'lucide-react';

import { User } from 'firebase/auth';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  user?: User | null;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isOpen, setIsOpen, theme, onToggleTheme, user }) => {
  const navItems: { id: ViewState; label: string; icon: any; emoji?: string }[] = [
    { id: 'DASHBOARD', label: 'Overview', icon: LayoutDashboard },
    { id: 'INVOICES', label: 'Financial Assets', icon: FileText },
    { id: 'PROPOSALS', label: 'Strategy', icon: Edit },
    { id: 'SERVICES', label: 'Offerings', icon: Package },
    { id: 'MARKETPLACE', label: 'Marketplace', icon: Star },
    { id: 'PROJECTS', label: 'Ops Center', icon: Folder },
    { id: 'EXPENSES', label: 'Outflow', icon: Receipt },
    { id: 'CLIENTS', label: 'Counterparties', icon: Users },
    { id: 'REPORTS', label: 'Intelligence', icon: BarChart },
  ];

  const handleNav = (id: string) => {
    onChangeView(id as ViewState);
    if (window.innerWidth < 768) setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-charcoal/60 backdrop-blur-md z-[60] md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.aside 
        initial={false}
        animate={{ x: isOpen || window.innerWidth >= 768 ? 0 : -300 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed md:relative inset-y-0 left-0 z-[70] w-72 flex m-0 md:m-4 h-full md:h-[calc(100vh-2rem)] bg-charcoal dark:bg-charcoal-deep md:rounded-[2.5rem] text-white shadow-2xl border-r md:border border-white/5 flex-col overflow-hidden`}
      >
        {/* Close Button Mobile */}
        <button 
          onClick={() => setIsOpen(false)}
          className="md:hidden absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white"
        >
          <X size={20} />
        </button>

        {/* 3D Header Graphic Background */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-gold/20 to-transparent pointer-events-none opacity-30"></div>
      
      <div className="p-8 flex items-center gap-4 relative z-10">
        <div className="relative group">
          <div className="w-14 h-14 rounded-2xl bg-gold flex items-center justify-center text-charcoal shadow-[0_10px_20px_rgba(244,206,107,0.3)] border-2 border-charcoal/10 transition-all duration-500 group-hover:rotate-6">
            <FileText size={28} strokeWidth={2.5} />
          </div>
          <div className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-white dark:bg-charcoal rounded-full flex items-center justify-center border-2 border-gold shadow-lg animate-pulse">
            <Mic size={14} className="text-gold" strokeWidth={3} />
          </div>
        </div>
        <div>
          <h1 className="font-heading font-black text-2xl tracking-tighter leading-none">Oratore</h1>
          <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gold mt-1">Enterprise Core</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto no-scrollbar relative z-10 pt-4">
        {navItems.map(item => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 ${isActive ? 'bg-gold text-charcoal shadow-[0_10px_30px_rgba(244,206,107,0.15)] border border-gold/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-charcoal/10' : 'bg-white/5 group-hover:bg-white/10'}`}>
                   <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-charcoal' : 'text-slate-400'}`}>{item.label}</span>
              </div>
              {isActive && <ChevronRight size={14} className="animate-bounce-x" />}
            </button>
          );
        })}
      </nav>

      {/* Footer Nav Group */}
      <div className="p-6 space-y-2 relative z-10 bg-black/20 backdrop-blur-sm mt-auto">
          {user && (
            <button 
              onClick={() => handleNav('PROFILE')}
              className={`w-full mb-4 flex items-center gap-3 p-2 rounded-2xl transition-all group border ${currentView === 'PROFILE' ? 'bg-gold/10 border-gold/30' : 'bg-transparent border-transparent hover:bg-white/5'}`}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-600 overflow-hidden ring-2 ring-gold/20 flex-shrink-0">
                  <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} alt="User" className="w-full h-full object-cover" />
              </div>
              <div className="text-left overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user.displayName || 'Anonymous User'}</p>
                <p className="text-[9px] text-slate-400 font-medium truncate uppercase tracking-widest">{user.email}</p>
              </div>
            </button>
          )}

          {/* Help Center */}
          <button 
            onClick={() => handleNav('HELP_CENTER')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group ${currentView === 'HELP_CENTER' ? 'bg-gold text-charcoal shadow-glow' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <div className={`p-2 rounded-xl ${currentView === 'HELP_CENTER' ? 'bg-charcoal/10' : 'bg-white/5 group-hover:bg-white/10'}`}>
              <HelpCircle size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Help Center</span>
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={onToggleTheme}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-slate-400 hover:text-white transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/5 group-hover:bg-white/10">
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} className="text-gold" />}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">{theme === 'light' ? 'Night' : 'Day'} Mode</span>
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${theme === 'light' ? 'bg-slate-700' : 'bg-gold'}`}>
              <div className={`absolute top-0.5 w-3 h-3 rounded-full transition-all ${theme === 'light' ? 'left-0.5 bg-white' : 'right-0.5 bg-charcoal'}`}></div>
            </div>
          </button>

          <button onClick={() => handleNav('SETTINGS')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${currentView === 'SETTINGS' ? 'bg-gold text-charcoal shadow-glow' : 'text-slate-400 hover:text-white'}`}>
             <div className={`p-2 rounded-xl ${currentView === 'SETTINGS' ? 'bg-charcoal/10' : 'bg-white/5'}`}>
                <Settings size={18} />
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest">Settings</span>
          </button>
      </div>

      <style>{`
        @keyframes bounce-x {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(3px); }
        }
        .animate-bounce-x { animation: bounce-x 1s infinite; }
      `}</style>
      </motion.aside>
    </>
  );
};

export default Sidebar;