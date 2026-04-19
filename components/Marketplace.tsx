import React, { useState } from 'react';
import { MarketplaceTemplate, AppSettings, InvoiceDesign } from '../types';
import { ShoppingBag, Upload, Star, Download, TrendingUp, DollarSign, ArrowRight, ShieldCheck, Sparkles, Filter, CheckCircle2, User, Layout, Palette, X, Box } from 'lucide-react';

interface MarketplaceProps {
  templates: MarketplaceTemplate[];
  onPurchase: (template: MarketplaceTemplate) => void;
  onUpload: (template: Partial<MarketplaceTemplate>) => void;
  settings: AppSettings;
}

const Marketplace: React.FC<MarketplaceProps> = ({ templates, onPurchase, onUpload, settings }) => {
  const [activeTab, setActiveTab] = useState<'SHOP' | 'SELL' | 'INVENTORY'>('SHOP');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const userBalance = settings.balance || 0;
  const purchasedIds = settings.purchasedTemplateIds || [];

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.sellerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200/50 dark:border-slate-800 pb-8">
        <div>
          <h2 className="text-4xl font-heading font-black text-slate-900 dark:text-white tracking-tight">Marketplace</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Acquire elite brand architecture</p>
        </div>
        <div className="flex bg-white dark:bg-charcoal p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <button 
            onClick={() => setActiveTab('SHOP')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'SHOP' ? 'bg-charcoal dark:bg-gold text-white dark:text-charcoal shadow-lg' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <ShoppingBag size={14} /> Acquisition
          </button>
          <button 
            onClick={() => setActiveTab('SELL')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'SELL' ? 'bg-charcoal dark:bg-gold text-white dark:text-charcoal shadow-lg' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <TrendingUp size={14} /> Sell Hub
          </button>
          <button 
            onClick={() => setActiveTab('INVENTORY')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'INVENTORY' ? 'bg-charcoal dark:bg-gold text-white dark:text-charcoal shadow-lg' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <ShieldCheck size={14} /> My Vault
          </button>
        </div>
      </div>

      {activeTab === 'SHOP' && (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 group">
              <input 
                type="text" 
                placeholder="Search elite templates..." 
                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-charcoal border border-slate-200 dark:border-slate-800 rounded-3xl outline-none focus:ring-2 focus:ring-gold/20 dark:text-white transition-all font-medium"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-gold" size={20} />
            </div>
            <div className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-charcoal rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
               <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold"><DollarSign size={16}/></div>
               <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Reserve: ${userBalance.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredTemplates.map(template => {
              const isPurchased = purchasedIds.includes(template.id);
              const isOwner = template.sellerId === settings.email;

              return (
                <div key={template.id} className="group rounded-[2.5rem] overflow-hidden hover:shadow-crextio-dark transition-all duration-500 border border-transparent hover:border-gold/20 flex flex-col h-full bg-white dark:bg-charcoal">
                   <div className="aspect-[4/5] bg-slate-50 dark:bg-charcoal-deep relative overflow-hidden flex items-center justify-center p-8 group-hover:bg-gold/5 transition-colors">
                      {/* Elite Visual Preview with 3D Depth */}
                      <div className="w-full h-full border-2 border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-charcoal shadow-crextio dark:shadow-crextio-dark flex flex-col p-4 space-y-2 group-hover:scale-[1.05] transition-transform duration-500">
                          <div className="h-6 w-20 rounded" style={{ backgroundColor: template.design.themeColor, opacity: 0.3 }}></div>
                          <div className="h-2 w-full rounded bg-slate-100 dark:bg-white/5"></div>
                          <div className="h-2 w-2/3 rounded bg-slate-100 dark:bg-white/5"></div>
                          <div className="flex-1"></div>
                          <div className="h-8 w-full rounded bg-gold/10 border border-dashed border-gold/30"></div>
                      </div>
                      <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 dark:bg-charcoal/90 backdrop-blur rounded-full text-[9px] font-black uppercase tracking-tighter border border-slate-100 dark:border-white/5 shadow-sm flex items-center gap-1">
                        <Star size={10} className="text-gold fill-gold" /> {template.rating}
                      </div>
                   </div>
                   <div className="p-8 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-heading font-black text-xl text-slate-900 dark:text-white">{template.name}</h3>
                        <span className="text-gold font-black text-xl">${template.price}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 leading-relaxed italic">"{template.description}"</p>
                      <div className="flex items-center gap-2 mb-8">
                         <div className="w-7 h-7 rounded-xl bg-gold/10 flex items-center justify-center text-[10px] font-black text-gold">
                            {template.sellerName.charAt(0)}
                         </div>
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{template.sellerName}</span>
                      </div>
                      <div className="mt-auto">
                        <button 
                          onClick={() => !isPurchased && !isOwner && onPurchase(template)}
                          disabled={isPurchased || isOwner}
                          className={`w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 transition-all ${
                            isPurchased || isOwner 
                            ? 'bg-slate-100 dark:bg-charcoal-deep text-slate-400 dark:text-slate-600 cursor-default' 
                            : 'bg-charcoal dark:bg-gold text-white dark:text-charcoal hover:scale-[1.02] shadow-xl active:scale-95'
                          }`}
                        >
                          {isPurchased || isOwner ? <ShieldCheck size={16}/> : <Download size={16} />}
                          {isPurchased ? 'Secured in Vault' : isOwner ? 'Author Mode' : 'Acquire License'}
                        </button>
                      </div>
                   </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'SELL' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-slide-up">
           <div className="xl:col-span-1 space-y-6">
              <div className="glass-panel p-8 rounded-[3rem] bg-charcoal dark:bg-charcoal-deep text-white relative overflow-hidden shadow-crextio-dark border border-white/5">
                <div className="absolute top-0 right-0 w-40 h-40 bg-gold/10 rounded-full blur-[80px] -mr-15 -mt-15"></div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Royalties</p>
                <div className="text-5xl font-heading font-black text-gold mb-2">${(userBalance * 0.8).toFixed(2)}</div>
                <p className="text-[10px] text-slate-500 font-bold uppercase mt-4">Verified Merchant</p>
              </div>
              <div className="glass-panel p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-charcoal transition-colors">
                <h4 className="font-heading font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2 uppercase tracking-tight"><Sparkles size={18} className="text-gold"/> Insights</h4>
                <div className="space-y-4">
                    {[
                        "High-contrast Gold themes trending.",
                        "Mobile-first layouts earn 30% more.",
                        "Add 'Audit-ready' tags to listings."
                    ].map((tip, i) => (
                        <div key={i} className="p-4 bg-slate-50 dark:bg-charcoal-deep rounded-2xl text-[11px] font-bold text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-white/5">
                            {tip}
                        </div>
                    ))}
                </div>
              </div>
           </div>

           <div className="xl:col-span-2 space-y-8">
              <div className="glass-panel p-12 rounded-[3rem] bg-white dark:bg-charcoal border-2 border-slate-200 dark:border-slate-800 border-dashed flex flex-col items-center justify-center text-center group transition-all hover:border-gold/30">
                 <div className="w-24 h-24 bg-gold/10 rounded-[2rem] flex items-center justify-center text-gold mb-6 shadow-inner group-hover:scale-110 transition-transform">
                    <Upload size={40} />
                 </div>
                 <h3 className="text-3xl font-heading font-black text-slate-900 dark:text-white mb-2">Publish Architecture</h3>
                 <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8 text-sm leading-relaxed font-medium">Contribute to the global ecosystem and earn passive yields from your custom designs.</p>
                 <button 
                  onClick={() => setShowUploadModal(true)}
                  className="px-10 py-4 bg-charcoal dark:bg-gold text-white dark:text-charcoal rounded-3xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-3"
                 >
                    Publish Logic <ArrowRight size={16} />
                 </button>
              </div>
           </div>
        </div>
      )}

      {activeTab === 'INVENTORY' && (
          <div className="space-y-8 animate-slide-up">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {purchasedIds.length === 0 ? (
                  <div className="col-span-full py-24 text-center glass-panel rounded-[3rem] bg-slate-50/50 dark:bg-charcoal/50 border-2 border-dashed border-slate-200 dark:border-slate-800">
                    <Box size={64} className="mx-auto mb-6 text-slate-200 dark:text-slate-800" />
                    <p className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-xs">Your vault is empty</p>
                    <button onClick={() => setActiveTab('SHOP')} className="text-gold text-[10px] font-black uppercase tracking-[0.2em] mt-4 hover:underline">Launch Acquisition</button>
                  </div>
                ) : (
                    templates.filter(t => purchasedIds.includes(t.id)).map(template => (
                        <div key={template.id} className="glass-panel p-6 rounded-[2.5rem] bg-white dark:bg-charcoal border border-slate-200 dark:border-slate-800 hover:border-gold transition-all group shadow-sm hover:shadow-crextio dark:hover:shadow-crextio-dark">
                             <div className="h-44 bg-slate-50 dark:bg-charcoal-deep rounded-3xl mb-4 flex items-center justify-center text-slate-300 dark:text-slate-700 group-hover:bg-gold/5 transition-colors">
                                <Palette size={40} />
                             </div>
                             <h4 className="font-heading font-black text-slate-900 dark:text-white mb-1 leading-tight">{template.name}</h4>
                             <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-6">Secured Asset</p>
                             <button className="w-full py-3 bg-charcoal dark:bg-white text-white dark:text-charcoal rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all">Apply to Invoices</button>
                        </div>
                    ))
                )}
              </div>
          </div>
      )}
    </div>
  );
};

export default Marketplace;