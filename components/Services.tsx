
import React, { useState } from 'react';
import { ServiceItem } from '../types';
import { Plus, Trash2, Edit2, Search, Package, DollarSign, Tag, X, Save, Sparkles, RefreshCw, Info, ArrowUpRight } from 'lucide-react';
import { fetchMarketPriceSuggestions } from '../services/geminiService';

interface ServicesProps {
  services: ServiceItem[];
  onAddService: (service: ServiceItem) => void;
  onUpdateService: (service: ServiceItem) => void;
  onDeleteService: (id: string) => void;
}

const Services: React.FC<ServicesProps> = ({ services, onAddService, onUpdateService, onDeleteService }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<Partial<ServiceItem>>({ name: '', description: '', defaultRate: 0, category: '' });
  const [researching, setResearching] = useState(false);
  const [aiPricing, setAiPricing] = useState<any>(null);

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Added missing startEdit function to populate form with service data for modification
  const startEdit = (service: ServiceItem) => {
    setFormData(service);
    setEditingId(service.id);
    setIsAdding(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    if (editingId) onUpdateService({ ...formData, id: editingId } as ServiceItem);
    else onAddService({ ...formData, id: crypto.randomUUID() } as ServiceItem);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', defaultRate: 0, category: '' });
    setAiPricing(null);
    setIsAdding(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-slate-200/50 dark:border-slate-800 pb-6">
        <div>
          <h2 className="text-4xl font-heading font-black text-slate-900 dark:text-white tracking-tight">Offerings</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Inventory of professional services</p>
        </div>
        <button 
          onClick={() => { setIsAdding(true); setEditingId(null); setFormData({ name: '', description: '', defaultRate: 0, category: '' }); }}
          className="bg-charcoal dark:bg-gold text-white dark:text-charcoal px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:scale-105 transition-all flex items-center gap-2"
        >
          <Plus size={16} /> New Template
        </button>
      </div>

      <div className="relative group max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-gold transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="Search catalog..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-charcoal border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-gold/20 dark:text-white text-sm"
        />
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-[2.5rem] animate-slide-up relative overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-charcoal shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gold"></div>
          <div className="flex justify-between items-center mb-10">
            <h3 className="font-heading font-black text-2xl text-slate-900 dark:text-white flex items-center gap-3">
              <Package size={24} className="text-gold"/> 
              {editingId ? 'Modify Offering' : 'Define Offering'}
            </h3>
            <button type="button" onClick={resetForm} className="text-slate-400 hover:text-red-500 transition-colors"><X size={24}/></button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 mb-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Service Label</label>
              <input 
                required
                className="w-full p-4 bg-slate-50 dark:bg-charcoal-deep border-none rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none font-bold dark:text-white"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Baseline Rate ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gold" size={18} />
                <input 
                  type="number"
                  className="w-full p-4 pl-10 bg-slate-50 dark:bg-charcoal-deep border-none rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none font-bold dark:text-white"
                  value={formData.defaultRate || ''}
                  onChange={e => setFormData({ ...formData, defaultRate: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Strategic Description</label>
              <textarea 
                className="w-full p-4 bg-slate-50 dark:bg-charcoal-deep border-none rounded-2xl focus:ring-2 focus:ring-gold/20 outline-none font-medium h-24 resize-none dark:text-white"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button type="button" onClick={resetForm} className="px-8 py-3 text-slate-500 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors">Discard</button>
            <button type="submit" className="px-10 py-4 bg-charcoal dark:bg-gold text-white dark:text-charcoal rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:scale-105 transition-all">
              <Save size={16} /> Commit Offering
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredServices.map(service => (
          <div key={service.id} className="glass-panel p-8 rounded-[2.5rem] bg-white dark:bg-charcoal border border-slate-200 dark:border-slate-800 hover:shadow-crextio dark:hover:shadow-crextio-dark transition-all group flex flex-col h-full hover:-translate-y-2">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gold/10 dark:bg-gold/5 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                <Package size={28} />
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(service)} className="p-2 text-slate-400 hover:text-gold transition-all"><Edit2 size={16} /></button>
                <button onClick={() => onDeleteService(service.id)} className="p-2 text-slate-400 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-heading font-black text-slate-900 dark:text-white mb-2 leading-tight">{service.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed mb-6 italic">"{service.description || 'No specific description provided.'}"</p>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
               <div className="flex flex-col">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Base Valuation</span>
                 <span className="text-2xl font-heading font-black text-slate-900 dark:text-white">${service.defaultRate.toLocaleString()}</span>
               </div>
               <div className="text-gold bg-gold/10 p-2.5 rounded-xl"><DollarSign size={20} /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;
