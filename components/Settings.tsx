import React, { useState } from 'react';
import { AppSettings, SUPPORTED_CURRENCIES, SUPPORTED_LANGUAGES, TeamMember } from '../types';
import { Save, Users, CreditCard, Trash2, UserPlus, Shield, Landmark, Hash, Star, Languages, User, Camera, Sun, Moon, CheckCircle, Globe } from 'lucide-react';

interface SettingsProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onViewTerms: () => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSave, onViewTerms }) => {
  const [formData, setFormData] = useState<AppSettings>(settings);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAvatarChange = () => {
    const randomAvatar = `https://ui-avatars.com/api/?name=${formData.userName}&background=F4CE6B&color=1A1A1A&size=256&bold=true`;
    setFormData({ ...formData, avatar: randomAvatar });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-slide-up">
      <div className="border-b border-slate-200/50 dark:border-slate-800 pb-6 flex justify-between items-end">
        <div>
            <h2 className="text-4xl font-heading font-black text-slate-900 dark:text-white">Workspace</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg italic">Strategic system preferences</p>
        </div>
        {saved && <span className="text-emerald-500 font-bold text-sm animate-pulse flex items-center gap-2"><CheckCircle size={16}/> Applied</span>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-32">
        {/* Profile Management */}
        <div className="glass-panel rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-charcoal shadow-sm transition-colors duration-300">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center gap-5 bg-slate-50/30 dark:bg-charcoal-deep/30">
                <div className="w-12 h-12 bg-gold text-charcoal rounded-2xl flex items-center justify-center shadow-inner"><User size={24} /></div>
                <div><h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white">Profile Identity</h3><p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Verified professional representation</p></div>
            </div>
            <div className="p-8 flex flex-col md:flex-row gap-10 items-start">
                <div className="relative group">
                    <div className="w-32 h-32 rounded-3xl overflow-hidden bg-cream dark:bg-charcoal-deep border-4 border-white dark:border-charcoal-light shadow-xl transition-transform group-hover:scale-[1.02]">
                        <img 
                          src={formData.avatar || `https://ui-avatars.com/api/?name=${formData.userName}&background=1A1A1A&color=F4CE6B&bold=true`} 
                          alt="Avatar" 
                          className="w-full h-full object-cover"
                        />
                    </div>
                    <button 
                      type="button"
                      onClick={handleAvatarChange}
                      className="absolute -bottom-2 -right-2 p-2.5 bg-charcoal dark:bg-gold text-white dark:text-charcoal rounded-xl shadow-lg border-2 border-white dark:border-charcoal transition-transform hover:scale-110 active:scale-95"
                    >
                      <Camera size={16} />
                    </button>
                </div>
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Legal Name</label>
                        <input type="text" value={formData.userName || ''} onChange={e => setFormData({...formData, userName: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-charcoal-deep border-none rounded-2xl outline-none focus:ring-2 focus:ring-gold/20 font-bold dark:text-white transition-colors" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Account Email</label>
                        <input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-charcoal-deep border-none rounded-2xl outline-none focus:ring-2 focus:ring-gold/20 font-bold dark:text-white transition-colors" />
                    </div>
                </div>
            </div>
        </div>

        {/* Theme Switching */}
        <div className="glass-panel rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-charcoal shadow-sm transition-colors duration-300">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center gap-5 bg-slate-50/30 dark:bg-charcoal-deep/30">
                <div className="w-12 h-12 bg-charcoal dark:bg-gold text-white dark:text-charcoal rounded-2xl flex items-center justify-center shadow-inner">
                    {formData.theme === 'light' ? <Sun size={24} /> : <Moon size={24} />}
                </div>
                <div><h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white">Interface Aura</h3><p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Select your environmental aesthetic</p></div>
            </div>
            <div className="p-8 grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, theme: 'light'})}
                  className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${formData.theme === 'light' ? 'border-gold bg-gold/5' : 'border-slate-100 dark:border-slate-800 dark:bg-charcoal-deep/50'}`}
                >
                    <Sun size={32} className={formData.theme === 'light' ? 'text-charcoal' : 'text-slate-300'} />
                    <span className="font-black text-[10px] uppercase tracking-widest dark:text-slate-400">Daylight</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, theme: 'dark'})}
                  className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all ${formData.theme === 'dark' ? 'border-gold bg-gold/5' : 'border-slate-100 dark:border-slate-800 dark:bg-charcoal-deep/50'}`}
                >
                    <Moon size={32} className={formData.theme === 'dark' ? 'text-gold' : 'text-slate-300'} />
                    <span className="font-black text-[10px] uppercase tracking-widest dark:text-slate-400">Midnight</span>
                </button>
            </div>
        </div>

        {/* Global Hub Settings */}
        <div className="glass-panel rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-charcoal shadow-sm transition-colors duration-300">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center gap-5 bg-slate-50/30 dark:bg-charcoal-deep/30">
                <div className="w-12 h-12 bg-gold/10 text-gold rounded-2xl flex items-center justify-center shadow-inner"><Globe size={24} /></div>
                <div><h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white">Regional Hub</h3><p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Fiscal and localization standards</p></div>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Preferred Valuation</label>
                    <select value={formData.defaultCurrency} onChange={e => setFormData({...formData, defaultCurrency: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-charcoal-deep border-none rounded-2xl outline-none focus:ring-2 focus:ring-gold/20 font-bold dark:text-white transition-colors">
                        {SUPPORTED_CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Linguistic standard</label>
                    <select value={formData.defaultLanguage} onChange={e => setFormData({...formData, defaultLanguage: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-charcoal-deep border-none rounded-2xl outline-none focus:ring-2 focus:ring-gold/20 font-bold dark:text-white transition-colors">
                        {SUPPORTED_LANGUAGES.map(lang => (
                            <option key={lang.code} value={lang.code}>{lang.native}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>

        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[40] w-full max-w-xl px-4">
            <button type="submit" className="w-full bg-charcoal dark:bg-gold text-white dark:text-charcoal p-5 rounded-full font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 active:scale-95 text-xs">
                <Save size={18} /> Commit Changes
            </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;