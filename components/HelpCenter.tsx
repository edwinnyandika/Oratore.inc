import React, { useEffect } from 'react';
import { HelpCircle, Book, MessageCircle, ArrowLeft, ExternalLink, Zap, Shield, Search } from 'lucide-react';

declare global {
  interface Window {
    Tawk_API: any;
    Tawk_LoadStart: any;
  }
}

interface HelpCenterProps {
  onBack: () => void;
}

const HelpCenter: React.FC<HelpCenterProps> = ({ onBack }) => {
  useEffect(() => {
    // Inject Tawk.to Script
    const s1 = document.createElement("script");
    const s0 = document.getElementsByTagName("script")[0];
    s1.async = true;
    s1.src = 'https://embed.tawk.to/6994767ad840b61c35c0504a/1jhlutk8p';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    if (s0 && s0.parentNode) {
      s0.parentNode.insertBefore(s1, s0);
    } else {
      document.head.appendChild(s1);
    }

    // Show widget when on this page
    const checkAndShow = setInterval(() => {
      if (window.Tawk_API && typeof window.Tawk_API.showWidget === 'function') {
        window.Tawk_API.showWidget();
        clearInterval(checkAndShow);
      }
    }, 500);

    return () => {
      clearInterval(checkAndShow);
      // Hide widget when leaving the page to maintain workspace clarity
      if (window.Tawk_API && typeof window.Tawk_API.hideWidget === 'function') {
        window.Tawk_API.hideWidget();
      }
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-slide-up pb-24 px-4 sm:px-0">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 dark:border-slate-800 pb-8 gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-3 bg-white dark:bg-charcoal border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-400 shadow-sm"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h2 className="text-4xl font-heading font-black text-slate-900 dark:text-white tracking-tight">Support Hub</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-lg font-medium italic">Tactical deployment & troubleshooting</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="glass-panel p-8 rounded-[2.5rem] bg-white dark:bg-charcoal border border-slate-200 dark:border-slate-800 shadow-crextio transition-all hover:-translate-y-1">
          <div className="w-12 h-12 bg-gold/10 rounded-2xl flex items-center justify-center text-gold mb-6 shadow-inner">
            <Book size={24} />
          </div>
          <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-white mb-2">Knowledge Core</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 italic leading-relaxed">"Master the Oratore ecosystem with our tactical deep-dive documentation."</p>
          <button className="text-gold text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:gap-3 transition-all">
            Access Files <ExternalLink size={14} />
          </button>
        </div>

        <div className="glass-panel p-8 rounded-[2.5rem] bg-white dark:bg-charcoal border border-slate-200 dark:border-slate-800 shadow-crextio transition-all hover:-translate-y-1 group">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-500 mb-6 shadow-inner">
            <MessageCircle size={24} />
          </div>
          <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-white mb-2">Live Operations</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 italic leading-relaxed">"Connect directly with our engineering field team via real-time uplink."</p>
          <button 
            onClick={() => window.Tawk_API && window.Tawk_API.maximize()}
            className="text-indigo-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:gap-3 transition-all"
          >
            Initiate Link <Zap size={14} className="group-hover:animate-pulse" />
          </button>
        </div>

        <div className="glass-panel p-8 rounded-[2.5rem] bg-white dark:bg-charcoal border border-slate-200 dark:border-slate-800 shadow-crextio transition-all hover:-translate-y-1">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 shadow-inner">
            <Shield size={24} />
          </div>
          <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-white mb-2">Trust & Security</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 italic leading-relaxed">"Manage encryption standards and verified data privacy protocols."</p>
          <button className="text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:gap-3 transition-all">
            Audit Policy <ExternalLink size={14} />
          </button>
        </div>
      </div>

      <div className="glass-panel p-12 rounded-[3.5rem] bg-charcoal dark:bg-charcoal-deep text-white relative overflow-hidden shadow-crextio-dark border border-white/5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold/5 rounded-full blur-[100px] -mr-40 -mt-40"></div>
        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <h3 className="text-3xl font-heading font-black mb-4 tracking-tight">Need specific intelligence?</h3>
          <p className="text-slate-400 mb-10 text-lg">Search our library of tactical business advice for enterprise freelancers.</p>
          <div className="relative group max-w-lg mx-auto">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-gold transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Query the database..." 
              className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-gold/10 text-white font-medium text-lg placeholder:text-slate-600 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;