import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, CheckCircle2, Zap, Palette, Globe, Play, Sparkles, FileText, Mic, Twitter, Linkedin, Github } from 'lucide-react';
import { ViewState } from '../types';

interface LandingPageProps {
  onNavigate: (view: ViewState) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-charcoal-deep font-sans overflow-x-hidden selection:bg-gold/30">
      {/* Navigation */}
      <nav className="fixed w-full z-50 py-6 px-8 flex justify-between items-center bg-white/70 dark:bg-charcoal-deep/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
          <div className="relative group scale-75 md:scale-100 origin-left">
            <div className="w-14 h-14 rounded-2xl bg-gold flex items-center justify-center text-charcoal shadow-[0_10px_20px_rgba(244,206,107,0.3)] border-2 border-charcoal/10 transition-all duration-500 group-hover:rotate-6">
              <FileText size={28} strokeWidth={2.5} />
            </div>
            <div className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-white dark:bg-charcoal rounded-full flex items-center justify-center border-2 border-gold shadow-lg animate-pulse">
              <Mic size={14} className="text-gold" strokeWidth={3} />
            </div>
          </div>
          <div>
            <span className="block text-2xl font-heading font-black tracking-tighter text-slate-900 dark:text-white leading-none">Oratore</span>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gold mt-1">Enterprise Core</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('AUTH')} className="hidden sm:block text-slate-600 dark:text-slate-300 font-bold hover:text-slate-900 dark:hover:text-white transition-colors">
            Log In
          </button>
          <button onClick={() => onNavigate('AUTH')} className="px-6 py-2.5 bg-brand-black dark:bg-white text-white dark:text-brand-black rounded-full font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-sm">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-32 px-4 md:px-8 max-w-7xl mx-auto relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gold/20 via-amber-600/5 to-transparent blur-3xl pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl mx-auto z-10 relative"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-charcoal shadow-sm border border-slate-200 dark:border-white/10 font-bold text-xs uppercase tracking-widest mb-8">
            <Sparkles size={14} className="text-gold" /> 
            <span className="text-slate-700 dark:text-slate-300">Oratore 2.0 is live</span>
            <span className="bg-gold/20 text-gold px-2 py-0.5 rounded-full ml-2">Read Announcement</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-heading font-black tracking-tighter text-slate-900 dark:text-white leading-[1.05] mb-8">
            The Operating System for <span className="text-transparent bg-clip-text bg-gradient-to-br from-gold to-amber-600">Modern Creatives</span>
          </h1>
          <p className="text-xl md:text-xl text-slate-500 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Stop juggling spreadsheets and clunky PDFs. Give your clients a premium, portal-driven experience while you automate invoicing and ops.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <button onClick={() => onNavigate('AUTH')} className="w-full sm:w-auto px-8 py-4 bg-brand-black dark:bg-white text-white dark:text-brand-black rounded-full font-black text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
              Start Free Trial <ArrowRight size={20} />
            </button>
            <button onClick={() => onNavigate('AUTH')} className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-charcoal border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-full font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
              <Play size={20} className="fill-slate-900 dark:fill-white" /> Watch Trailer
            </button>
          </div>

          <div className="flex flex-col items-center justify-center gap-3">
             <div className="flex -space-x-3">
                {[...Array(5)].map((_, i) => (
                  <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-10 h-10 rounded-full border-2 border-slate-50 dark:border-charcoal-deep" alt="User avatar" />
                ))}
             </div>
             <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
               Trusted by <span className="text-slate-900 dark:text-white">10,000+</span> top freelancers globally
             </p>
          </div>
        </motion.div>

        {/* Floating App Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="relative mx-auto max-w-6xl mt-24 rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-slate-200/50 dark:border-white/10 ring-4 ring-white/50 dark:ring-white/5"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-100 dark:from-charcoal-deep via-transparent to-transparent z-10" />
          <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2000" alt="App Dashboard Preview" className="w-full h-auto object-cover opacity-90 dark:opacity-80 scale-[1.02] transform transition-transform duration-700 hover:scale-100" />
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
             <button onClick={() => onNavigate('AUTH')} className="w-20 h-20 bg-white/20 backdrop-blur-md border border-white/40 rounded-full flex items-center justify-center text-white hover:scale-110 hover:bg-white/30 transition-all shadow-2xl">
                 <Play size={32} className="ml-2 fill-white" />
             </button>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-4">
             <div className="glass-panel px-6 py-4 rounded-2xl flex items-center gap-4 shadow-xl border border-white/20">
                <CheckCircle2 className="text-emerald-500" size={24} />
                <div>
                   <p className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 tracking-widest drop-shadow-sm">Invoice #042 Paid</p>
                   <p className="text-lg font-bold text-slate-900 dark:text-white drop-shadow-sm">$4,500.00</p>
                </div>
             </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-4 md:px-8 bg-white dark:bg-charcoal border-y border-slate-200 dark:border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-heading font-black text-slate-900 dark:text-white mb-6">Everything you need.<br/>Nothing you don't.</h2>
            <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Thoughtfully designed tools that get out of your way and let you focus on what really matters—doing great work.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Palette, title: 'Bespoke Invoicing', desc: 'Craft beautiful, brand-aligned invoices that stand out and get paid up to 2x faster in the modern marketplace.' },
              { icon: Zap, title: 'Smart Follow-ups', desc: 'AI-driven payment reminders that protect your client relationships while ensuring you never miss a payout.' },
              { icon: ShieldCheck, title: 'Client Portals', desc: 'Give your clients a premium dashboard to view proposals, pay invoices, and manage their documents securely.' }
            ].map((feature, i) => (
              <div key={i} className="p-10 rounded-[2.5rem] bg-slate-50 dark:bg-charcoal-deep border border-slate-100 dark:border-white/5 hover:border-gold/30 hover:shadow-2xl hover:shadow-gold/5 transition-all duration-300 group">
                <div className="w-16 h-16 bg-white dark:bg-charcoal rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <feature.icon className="text-gold" size={28} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{feature.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-lg">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-charcoal-deep pt-24 pb-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-6 gap-12 mb-16">
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative group scale-75 origin-left">
                <div className="w-14 h-14 rounded-2xl bg-gold flex items-center justify-center text-charcoal shadow-[0_5px_10px_rgba(244,206,107,0.2)] border-2 border-charcoal/10">
                  <FileText size={28} strokeWidth={2.5} />
                </div>
                <div className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-white dark:bg-charcoal rounded-full flex items-center justify-center border-2 border-gold shadow-lg">
                  <Mic size={14} className="text-gold" strokeWidth={3} />
                </div>
              </div>
              <div>
                <span className="block text-2xl font-heading font-black tracking-tighter text-slate-900 dark:text-white leading-none">Oratore</span>
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm">
              The premium operating system for modern creatives, consultants, and independent agencies. Built for scale, designed for speed.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white dark:bg-charcoal border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-brand-black dark:hover:text-white hover:border-gold transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white dark:bg-charcoal border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-brand-black dark:hover:text-white hover:border-gold transition-colors">
                <Linkedin size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white dark:bg-charcoal border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-brand-black dark:hover:text-white hover:border-gold transition-colors">
                <Github size={18} />
              </a>
            </div>
          </div>
          
          <div className="col-span-1">
            <h4 className="font-bold text-slate-900 dark:text-white mb-6">Product</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-gold transition-colors">Invoicing</a></li>
              <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-gold transition-colors">Proposals</a></li>
              <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-gold transition-colors">Client Portal</a></li>
              <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-gold transition-colors">Integrations</a></li>
              <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-gold transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="font-bold text-slate-900 dark:text-white mb-6">Resources</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-gold transition-colors">Help Center</a></li>
              <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-gold transition-colors">Blog</a></li>
              <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-gold transition-colors">Freelance Guide</a></li>
              <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-gold transition-colors">Invoice Templates</a></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="font-bold text-slate-900 dark:text-white mb-6">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-gold transition-colors">About Us</a></li>
              <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-gold transition-colors">Careers</a></li>
              <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-gold transition-colors">Manifesto</a></li>
              <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-gold transition-colors">Contact</a></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h4 className="font-bold text-slate-900 dark:text-white mb-6">Legal</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-gold transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-gold transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-gold transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="text-slate-500 dark:text-slate-400 hover:text-gold transition-colors">Security</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">© 2026 Oratore Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-glow pointer-events-none"></div>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest text-[10px]">All Systems Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
