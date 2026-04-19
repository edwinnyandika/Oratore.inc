
import React, { useState, useEffect } from 'react';
import { Client, ClientActivity, SUPPORTED_LANGUAGES } from '../types';
import { User, Mail, MapPin, Plus, Trash2, Phone, Building, ArrowRight, X, Sparkles, Clock, Tag, MessageSquare, Send, Calendar, DollarSign, Activity, Languages, Globe, RefreshCw, ExternalLink } from 'lucide-react';
import { analyzeClientBehavior, generateClientEmail, detectTimezoneFromAddress } from '../services/geminiService';

interface ClientsProps {
  clients: Client[];
  onAddClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
  onOpenPortal?: (clientId: string) => void;
}

const EmptyClientsIllustration = () => (
    <svg width="220" height="180" viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-6 opacity-90">
        <circle cx="110" cy="90" r="70" fill="#F8FAFC" />
        <g opacity="0.9">
            <rect x="70" y="60" width="80" height="60" rx="12" fill="white" stroke="#E2E8F0" strokeWidth="2" className="drop-shadow-sm" />
            <circle cx="110" cy="80" r="12" fill="#F1F5F9" />
            <path d="M94 106C94 101.582 97.5817 98 102 98H118C122.418 98 126 101.582 126 106V108H94V106Z" fill="#F1F5F9" />
        </g>
        <g transform="translate(160, 60)">
            <circle cx="0" cy="0" r="20" fill="white" stroke="#CBD5E1" strokeWidth="1" className="drop-shadow-sm"/>
            <path d="M0 -8V8M-8 0H8" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
        </g>
    </svg>
);

const DualClock = ({ timezone }: { timezone: string }) => {
    const [times, setTimes] = useState({ you: '', client: '' });
    
    useEffect(() => {
        const update = () => {
            const now = new Date();
            setTimes({
                you: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                client: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: timezone })
            });
        };
        update();
        const timer = setInterval(update, 60000);
        return () => clearInterval(timer);
    }, [timezone]);

    return (
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 p-3 rounded-2xl">
            <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase text-slate-400">You</span>
                <span className="font-mono font-bold text-slate-900">{times.you}</span>
            </div>
            <div className="w-px h-6 bg-slate-200"></div>
            <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase text-brand-primary">Client</span>
                <span className="font-mono font-bold text-slate-900">{times.client}</span>
            </div>
        </div>
    );
};

const Clients: React.FC<ClientsProps> = ({ clients, onAddClient, onDeleteClient, onOpenPortal }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [newClient, setNewClient] = useState<Partial<Client>>({ tags: [], status: 'Active', defaultLanguage: 'en-US', timezone: 'UTC' });
  const [tagInput, setTagInput] = useState('');
  const [detectingZone, setDetectingZone] = useState(false);
  
  // AI States
  const [aiInsight, setAiInsight] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [emailContext, setEmailContext] = useState('');
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [generatingEmail, setGeneratingEmail] = useState(false);

  // --- Handlers ---
  const handleAutoDetectZone = async () => {
      if(!newClient.address) return;
      setDetectingZone(true);
      const zone = await detectTimezoneFromAddress(newClient.address);
      setNewClient({ ...newClient, timezone: zone });
      setDetectingZone(false);
  };

  const handleAddTag = () => {
      if(tagInput.trim() && !newClient.tags?.includes(tagInput.trim())) {
          setNewClient({...newClient, tags: [...(newClient.tags || []), tagInput.trim()]});
          setTagInput('');
      }
  };

  const handleRemoveTag = (tag: string) => {
      setNewClient({...newClient, tags: newClient.tags?.filter(t => t !== tag)});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newClient.name && newClient.email) {
      onAddClient({
        id: crypto.randomUUID(),
        name: newClient.name,
        email: newClient.email,
        address: newClient.address || '',
        phone: newClient.phone || '',
        tags: newClient.tags || [],
        activity: [{ id: crypto.randomUUID(), type: 'NOTE', date: new Date().toISOString().split('T')[0], description: 'Client created.' }],
        status: 'Active',
        paymentTerms: newClient.paymentTerms || 'Due on Receipt',
        notes: newClient.notes || '',
        defaultLanguage: newClient.defaultLanguage || 'en-US',
        timezone: newClient.timezone || 'UTC'
      });
      setNewClient({ tags: [], status: 'Active', defaultLanguage: 'en-US', timezone: 'UTC' });
      setIsAdding(false);
    }
  };

  const handleAnalyzeClient = async () => {
      if(!selectedClient) return;
      setAnalyzing(true);
      const insight = await analyzeClientBehavior(selectedClient.name, selectedClient.activity);
      setAiInsight(insight);
      setAnalyzing(false);
  };

  const handleGenerateEmail = async (type: 'reminder' | 'thank_you' | 'check_in') => {
      if(!selectedClient) return;
      setGeneratingEmail(true);
      const email = await generateClientEmail(selectedClient.name, type, emailContext || 'General follow up');
      setGeneratedEmail(email);
      setGeneratingEmail(false);
  };

  // --- Views ---

  const renderClientDetail = (client: Client) => (
      <div className="fixed sm:absolute inset-0 bg-[#f8fafc] z-30 animate-slide-up flex flex-col h-full overflow-hidden">
          {/* Header */}
          <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 sm:py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm relative no-print">
              <div className="flex items-center gap-4 sm:gap-6">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center font-heading font-bold text-2xl sm:text-3xl shadow-inner text-white bg-gradient-to-br from-indigo-500 to-purple-600`}>
                        {client.name.charAt(0)}
                  </div>
                  <div>
                      <h2 className="text-xl sm:text-3xl font-heading font-bold text-slate-900 line-clamp-1">{client.name}</h2>
                      <div className="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-2 overflow-x-auto no-scrollbar pb-1">
                           <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider ${client.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                               {client.status}
                           </span>
                           {client.tags.map(tag => (
                               <span key={tag} className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] sm:text-xs font-bold border border-slate-200">
                                   <Tag size={10} /> {tag}
                               </span>
                           ))}
                      </div>
                  </div>
              </div>
              <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto overflow-x-auto no-scrollbar sm:overflow-visible pb-2 sm:pb-0">
                  <button 
                    onClick={() => onOpenPortal?.(client.id)}
                    className="shrink-0 flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-900 text-white rounded-xl sm:rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg"
                  >
                     <ExternalLink size={16}/> Portal
                  </button>
                  <DualClock timezone={client.timezone || 'UTC'} />
                  <button onClick={() => { setSelectedClient(null); setAiInsight(null); setGeneratedEmail(''); }} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900 absolute top-4 right-4 sm:relative sm:top-0 sm:right-0">
                      <X size={24} />
                  </button>
              </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left Column: Profile & Contact */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                            <User size={20} className="text-brand-primary"/> Profile
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
                                <div className="flex items-center gap-2 text-slate-700 font-medium mt-1">
                                    <Mail size={16} /> {client.email}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Timezone</label>
                                <div className="flex items-center gap-2 text-slate-700 font-medium mt-1">
                                    <Globe size={16} className="text-indigo-400" /> {client.timezone || 'UTC'}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Preferred Language</label>
                                <div className="flex items-center gap-2 text-slate-700 font-medium mt-1">
                                    <Languages size={16} /> {SUPPORTED_LANGUAGES.find(l => l.code === client.defaultLanguage)?.native || 'English'}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Address</label>
                                <div className="flex items-center gap-2 text-slate-700 font-medium mt-1">
                                    <MapPin size={16} /> {client.address}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                         <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                            <DollarSign size={20} className="text-emerald-500"/> Billing Settings
                        </h3>
                        <div className="space-y-4">
                             <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Payment Terms</label>
                                <p className="font-medium text-slate-700 mt-1">{client.paymentTerms || 'Due on Receipt'}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase">Notes</label>
                                <p className="text-sm text-slate-600 mt-1 italic leading-relaxed">"{client.notes || 'No specific notes.'}"</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Middle Column: Activity & AI */}
                <div className="space-y-6">
                     {/* AI Insights Card */}
                    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-3xl shadow-lg text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-brand-primary rounded-full blur-[50px] opacity-30 -mr-10 -mt-10 group-hover:opacity-40 transition-opacity"></div>
                        <div className="relative z-10">
                            <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2 text-indigo-100">
                                <span className="p-1.5 bg-brand-primary rounded-lg shadow-glow"><Sparkles size={16} /></span> AI Insights
                            </h3>
                            {aiInsight ? (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="flex items-center justify-between bg-white/10 p-3 rounded-xl">
                                        <span className="text-sm font-bold text-indigo-200">Payment Rating</span>
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${aiInsight.rating === 'Excellent' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>{aiInsight.rating}</span>
                                    </div>
                                    <p className="text-sm text-indigo-100 leading-relaxed">{aiInsight.summary}</p>
                                    <div className="bg-brand-primary/20 p-3 rounded-xl border border-brand-primary/30">
                                        <p className="text-xs font-bold text-brand-primary uppercase mb-1">Suggestion</p>
                                        <p className="text-xs font-medium">{aiInsight.suggestion}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-sm text-indigo-300 mb-4">Analyze client behavior and payment history.</p>
                                    <button onClick={handleAnalyzeClient} disabled={analyzing} className="px-4 py-2 bg-white text-slate-900 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-colors disabled:opacity-50">
                                        {analyzing ? 'Analyzing...' : 'Generate Insights'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex-1">
                        <h3 className="font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
                            <Activity size={20} className="text-slate-400"/> Activity Timeline
                        </h3>
                        <div className="space-y-6 pl-2">
                            {client.activity && client.activity.length > 0 ? (
                                client.activity.map((act, i) => (
                                    <div key={act.id} className="relative pl-6 pb-2 border-l border-slate-100 last:border-0">
                                        <div className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm ${
                                            act.type === 'PAYMENT_RECEIVED' ? 'bg-emerald-500' : 
                                            act.type === 'INVOICE_SENT' ? 'bg-brand-primary' : 'bg-slate-300'
                                        }`}></div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{act.description}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{act.type.replace('_', ' ')}</p>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">{act.date}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 italic">No recent activity.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Communication */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-full flex flex-col">
                        <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                            <MessageSquare size={20} className="text-brand-primary"/> Communication
                        </h3>
                        
                        <div className="flex-1 bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100 overflow-y-auto max-h-[300px]">
                            {generatedEmail ? (
                                <div className="space-y-2 animate-fade-in">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-slate-400 uppercase">Draft Email</span>
                                        <button onClick={() => setGeneratedEmail('')} className="text-xs text-red-500 hover:underline">Clear</button>
                                    </div>
                                    <textarea 
                                        className="w-full h-48 bg-white p-3 rounded-xl border border-slate-200 text-sm text-slate-700 resize-none outline-none focus:border-brand-primary"
                                        value={generatedEmail}
                                        onChange={(e) => setGeneratedEmail(e.target.value)}
                                    />
                                    <button className="w-full py-2 bg-brand-primary text-white rounded-xl font-bold text-sm hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2">
                                        <Send size={16} /> Send Email
                                    </button>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                                    <Sparkles className="mb-2 opacity-50" size={24} />
                                    <p className="text-sm">Use AI to draft a message</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-400 uppercase">Context (Optional)</label>
                            <input 
                                className="w-full p-3 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-primary/20"
                                placeholder="e.g. Invoice #102 is 5 days late"
                                value={emailContext}
                                onChange={e => setEmailContext(e.target.value)}
                            />
                            <div className="grid grid-cols-3 gap-2">
                                <button onClick={() => handleGenerateEmail('reminder')} disabled={generatingEmail} className="py-2 px-1 bg-slate-100 hover:bg-slate-200 rounded-xl text-[10px] font-bold text-slate-600 transition-colors">
                                    Payment Reminder
                                </button>
                                <button onClick={() => handleGenerateEmail('check_in')} disabled={generatingEmail} className="py-2 px-1 bg-slate-100 hover:bg-slate-200 rounded-xl text-[10px] font-bold text-slate-600 transition-colors">
                                    Check In
                                </button>
                                <button onClick={() => handleGenerateEmail('thank_you')} disabled={generatingEmail} className="py-2 px-1 bg-slate-100 hover:bg-slate-200 rounded-xl text-[10px] font-bold text-slate-600 transition-colors">
                                    Thank You
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
      </div>
  );

  return (
    <div className="relative h-full">
      {selectedClient && renderClientDetail(selectedClient)}

      <div className="space-y-8 animate-slide-up pb-12">
        <div className="flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-slate-200/50 pb-6">
            <div>
                <h2 className="text-4xl font-heading font-bold text-slate-900">Clients</h2>
                <p className="text-slate-500 mt-2 text-lg">Manage your customer relationships</p>
            </div>
            <button 
                onClick={() => setIsAdding(!isAdding)}
                className={`
                    flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5
                    ${isAdding ? 'bg-slate-100 text-slate-600' : 'bg-brand-black text-white hover:bg-slate-800'}
                `}
            >
                {isAdding ? <X size={20}/> : <Plus size={20} />} 
                <span>{isAdding ? 'Cancel' : 'Add Client'}</span>
            </button>
        </div>

        {isAdding && (
            <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl animate-slide-up relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-brand-primary"></div>
            <h3 className="font-heading font-bold text-2xl mb-8 text-slate-900 flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-xl text-brand-primary"><User size={24}/></div>
                New Client Profile
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Basic Info */}
                <div className="space-y-6">
                    <div className="space-y-2 group">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Company / Name</label>
                        <input 
                            required
                            placeholder="Acme Inc."
                            className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary/20 outline-none font-medium"
                            value={newClient.name || ''}
                            onChange={e => setNewClient({...newClient, name: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2 group">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                        <input 
                            required
                            type="email"
                            placeholder="billing@acme.com"
                            className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary/20 outline-none font-medium"
                            value={newClient.email || ''}
                            onChange={e => setNewClient({...newClient, email: e.target.value})}
                        />
                    </div>
                     <div className="space-y-2 group">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Address</label>
                        <div className="flex gap-2">
                             <input 
                                placeholder="Street, City, Country"
                                className="flex-1 p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary/20 outline-none font-medium"
                                value={newClient.address || ''}
                                onChange={e => setNewClient({...newClient, address: e.target.value})}
                            />
                            <button 
                                type="button" 
                                onClick={handleAutoDetectZone}
                                disabled={detectingZone || !newClient.address}
                                className="p-4 bg-indigo-50 text-brand-primary rounded-2xl hover:bg-indigo-100 transition-colors disabled:opacity-50"
                                title="Detect Timezone"
                            >
                                {detectingZone ? <RefreshCw className="animate-spin" size={20}/> : <Globe size={20}/>}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Details & Tags */}
                <div className="space-y-6">
                    <div className="space-y-2 group">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Timezone</label>
                        <div className="relative">
                            <select
                                className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary/20 outline-none font-medium cursor-pointer appearance-none"
                                value={newClient.timezone}
                                onChange={e => setNewClient({...newClient, timezone: e.target.value})}
                            >
                                <option value="UTC">UTC</option>
                                <option value="America/New_York">New York (EST)</option>
                                <option value="America/Los_Angeles">Los Angeles (PST)</option>
                                <option value="Europe/London">London (GMT)</option>
                                <option value="Europe/Paris">Paris (CET)</option>
                                <option value="Africa/Nairobi">Nairobi (EAT)</option>
                                <option value="Asia/Dubai">Dubai (GST)</option>
                                <option value="Asia/Tokyo">Tokyo (JST)</option>
                                <option value="Australia/Sydney">Sydney (AEDT)</option>
                            </select>
                            <Clock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                        </div>
                    </div>
                    <div className="space-y-2 group">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Payment Terms</label>
                        <select
                            className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary/20 outline-none font-medium cursor-pointer"
                            value={newClient.paymentTerms}
                            onChange={e => setNewClient({...newClient, paymentTerms: e.target.value as any})}
                        >
                            <option value="Due on Receipt">Due on Receipt</option>
                            <option value="Net 7">Net 7</option>
                            <option value="Net 15">Net 15</option>
                            <option value="Net 30">Net 30</option>
                        </select>
                    </div>
                    <div className="space-y-2 group">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Tags</label>
                        <div className="flex gap-2 mb-2 flex-wrap">
                            {newClient.tags?.map(tag => (
                                <span key={tag} className="px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-xs font-bold flex items-center gap-1">
                                    {tag} <button type="button" onClick={() => handleRemoveTag(tag)}><X size={12}/></button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input 
                                placeholder="Add tag (e.g. VIP)"
                                className="flex-1 p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none font-medium text-sm"
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                            />
                            <button type="button" onClick={handleAddTag} className="p-3 bg-slate-200 rounded-xl hover:bg-slate-300 transition-colors"><Plus size={18}/></button>
                        </div>
                    </div>
                </div>
                
                <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Internal Notes</label>
                    <textarea 
                        className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-brand-primary/20 outline-none font-medium h-24 resize-none"
                        placeholder="Key details about this client..."
                        value={newClient.notes || ''}
                        onChange={e => setNewClient({...newClient, notes: e.target.value})}
                    />
                </div>
            </div>

            <div className="flex gap-4 justify-end pt-6 border-t border-slate-100">
                <button type="button" onClick={() => setIsAdding(false)} className="px-8 py-3 text-slate-500 hover:bg-slate-50 rounded-2xl font-bold transition-colors">Cancel</button>
                <button type="submit" className="px-8 py-3 bg-brand-primary text-white rounded-2xl hover:bg-indigo-600 font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-105 flex items-center gap-2">
                    Save Client <ArrowRight size={18} />
                </button>
            </div>
            </form>
        )}

        {clients.length === 0 && !isAdding ? (
            <div className="glass-panel p-16 text-center rounded-3xl flex flex-col items-center justify-center animate-fade-in border-2 border-dashed border-slate-200 min-h-[400px]">
                <EmptyClientsIllustration />
                <h3 className="font-heading font-bold text-3xl text-slate-900 mb-3">No clients yet</h3>
                <p className="text-slate-500 max-w-md mx-auto mb-8 text-lg">Add your first client to start sending professional invoices and tracking payments.</p>
                <button 
                    onClick={() => setIsAdding(true)}
                    className="px-8 py-4 bg-brand-primary text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-105 flex items-center gap-3 text-lg"
                >
                    <Plus size={24} /> Add Your First Client
                </button>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {clients.map((client, idx) => (
                <div 
                    key={client.id} 
                    onClick={() => setSelectedClient(client)}
                    className="glass-panel p-6 rounded-3xl hover:shadow-card-hover transition-all duration-300 group relative flex flex-col h-full hover:-translate-y-1 cursor-pointer border border-transparent hover:border-brand-primary/20"
                >
                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDeleteClient(client.id); }} 
                            className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-5 mb-6">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-heading font-bold text-3xl shadow-inner text-white bg-gradient-to-br ${
                            idx % 3 === 0 ? 'from-indigo-400 to-purple-500' : 
                            idx % 3 === 1 ? 'from-blue-400 to-cyan-500' : 
                            'from-emerald-400 to-teal-500'
                        }`}>
                            {client.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-heading font-bold text-xl text-slate-900 leading-tight mb-1">{client.name}</h3>
                            <div className="flex gap-2 flex-wrap">
                                {client.tags?.slice(0, 2).map(tag => (
                                    <span key={tag} className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] font-bold text-slate-500 uppercase">{tag}</span>
                                ))}
                                {(client.tags?.length || 0) > 2 && <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[10px] font-bold text-slate-500">+{client.tags.length - 2}</span>}
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-4 text-sm text-slate-500 flex-1">
                        <div className="flex items-center gap-3">
                            <Mail size={16} className="text-slate-400"/>
                            <span className="truncate font-medium">{client.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Globe size={16} className="text-indigo-300"/>
                            <span className="truncate font-bold text-indigo-500 text-xs">{client.timezone || 'UTC'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Languages size={16} className="text-slate-400"/>
                            <span className="truncate font-medium">{SUPPORTED_LANGUAGES.find(l => l.code === client.defaultLanguage)?.native || 'English'}</span>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                            <Activity size={12}/> {client.status}
                        </span>
                        <span className="text-xs font-bold text-brand-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            View Profile <ArrowRight size={12}/>
                        </span>
                    </div>
                </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default Clients;
