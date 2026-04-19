import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Invoice, InvoiceItem, Client, InvoiceStatus, InvoiceDesign, 
  SUPPORTED_CURRENCIES, SUPPORTED_LANGUAGES, Project, Installment, KRAConfig, 
  RecurringFrequency, Attachment, ServiceItem, RevenueSplit, TeamMember 
} from '../types';
import { parseInvoiceRequest, translateInvoiceContent, detectLocaleFromAddress, analyzeOptimalSendTime } from '../services/geminiService';
import { speakText, interpretVoiceCommand } from '../services/voiceService';
import { 
  Plus, Trash2, Wand2, Send, Palette, Layout, X, Globe, FileText,
  Landmark, Calendar, ShieldCheck, ChevronDown, CheckCircle, 
  Paperclip, ImageIcon, MessageCircle, Mail, Link, 
  PenTool, Type, RefreshCw, Languages, Sparkles, Zap, Volume2, Mic, MicOff, Lock, Unlock, Shield, Key, Package, Search, Clock, Handshake, Info, Users, Percent, FileType, Upload, Image as ImageIconLucide, TrendingUp, AlertCircle, Timer, History
} from 'lucide-react';

interface InvoiceEditorProps {
  clients: Client[];
  projects?: Project[];
  services?: ServiceItem[];
  onSave: (invoice: Invoice) => void;
  onCancel: () => void;
  initialInvoice?: Invoice;
  defaultCurrency: string;
  defaultLanguage?: string;
  existingInvoices?: Invoice[];
  currentUser?: string;
  numberingFormat?: 'SIMPLE' | 'YEAR_SEQ' | 'CLIENT_YEAR_SEQ';
  companyPin?: string;
  teamMembers?: TeamMember[];
}

const PREMIUM_COLORS = ['#F4CE6B', '#1A1A1A', '#10b981', '#f43f5e', '#8b5cf6', '#f59e0b', '#dc2626', '#2563eb'];
const FONTS = [
  { id: 'inter', name: 'Inter (Modern)' },
  { id: 'playfair', name: 'Playfair (Elegant)' },
  { id: 'mono', name: 'JetBrains (Tech)' },
  { id: 'outfit', name: 'Outfit (Bold)' }
];

const LABELS: Record<string, Record<string, string>> = {
  'en-US': {
    invoice: 'INVOICE', billTo: 'BILL TO', date: 'DATE', dueDate: 'DUE DATE', items: 'ITEMS',
    description: 'DESCRIPTION', quantity: 'QTY', rate: 'RATE', amount: 'AMOUNT',
    subtotal: 'SUBTOTAL', tax: 'TAX', total: 'TOTAL DUE', notes: 'NOTES & TERMS',
    signature: 'AUTHORIZED SIGNATURE'
  }
};

const InvoiceEditor: React.FC<InvoiceEditorProps> = ({ 
  clients, 
  projects = [], 
  services = [],
  onSave, 
  onCancel, 
  initialInvoice, 
  defaultCurrency, 
  defaultLanguage = 'en-US',
  existingInvoices = [], 
  currentUser = 'You', 
  numberingFormat = 'CLIENT_YEAR_SEQ',
  companyPin = '',
  teamMembers = []
}) => {
  const [clientId, setClientId] = useState<string>(initialInvoice?.clientId || '');
  const [invoiceNumber, setInvoiceNumber] = useState<string>(initialInvoice?.invoiceNumber || '');
  const [date, setDate] = useState<string>(initialInvoice?.date || new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>(initialInvoice?.dueDate || '');
  const [items, setItems] = useState<InvoiceItem[]>(initialInvoice?.items || []);
  const [taxRate, setTaxRate] = useState<number>(initialInvoice?.taxRate || 0);
  const [currency, setCurrency] = useState<string>(initialInvoice?.currency || defaultCurrency);
  const [language, setLanguage] = useState<string>(initialInvoice?.language || defaultLanguage);
  const [status, setStatus] = useState<InvoiceStatus>(initialInvoice?.status || InvoiceStatus.DRAFT);
  const [notes, setNotes] = useState<string>(initialInvoice?.notes || '');
  const [recurring, setRecurring] = useState<RecurringFrequency>(initialInvoice?.recurring || 'None');
  const [attachments, setAttachments] = useState<Attachment[]>(initialInvoice?.attachments || []);
  const [isTaxInvoice, setIsTaxInvoice] = useState<boolean>(initialInvoice?.isTaxInvoice || false);
  const [kraConfig, setKraConfig] = useState<KRAConfig | undefined>(initialInvoice?.kraConfig);
  
  const [isPasswordProtected, setIsPasswordProtected] = useState<boolean>(initialInvoice?.isPasswordProtected || false);
  const [password, setPassword] = useState<string>(initialInvoice?.password || '');
  const [allowNegotiation, setAllowNegotiation] = useState<boolean>(initialInvoice?.allowNegotiation || false);
  const [showSecurityPanel, setShowSecurityPanel] = useState(false);
  const [showCatalogModal, setShowCatalogModal] = useState<number | null>(null);

  const [sendTimeRecommendation, setSendTimeRecommendation] = useState<any>(null);
  const [loadingSendTime, setLoadingSendTime] = useState(false);
  const [showSendOptimizer, setShowSendOptimizer] = useState(false);

  const [revenueSplits, setRevenueSplits] = useState<RevenueSplit[]>(initialInvoice?.revenueSplits || [
    { memberId: 'me', memberName: currentUser, percentage: 100 }
  ]);
  const [showCollabPanel, setShowCollabPanel] = useState(false);

  const [showDesignPanel, setShowDesignPanel] = useState(false);
  const [design, setDesign] = useState<InvoiceDesign>(initialInvoice?.design || {
    template: 'modern', themeColor: '#F4CE6B', font: 'inter', paperSize: 'a4', logoSize: 'md', customFooter: 'Thank you for your business!'
  });

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.amount, 0), [items]);
  const taxAmount = useMemo(() => subtotal * (taxRate / 100), [subtotal, taxRate]);
  const total = useMemo(() => subtotal + taxAmount, [subtotal, taxAmount]);

  const senderZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const clientZone = clients.find(c => c.id === clientId)?.timezone || 'UTC';

  useEffect(() => {
    if (!invoiceNumber && numberingFormat) {
      const year = new Date().getFullYear();
      if (numberingFormat === 'SIMPLE') {
        setInvoiceNumber(`INV-${(existingInvoices.length + 1).toString().padStart(3, '0')}`);
      } else if (numberingFormat === 'YEAR_SEQ') {
        setInvoiceNumber(`${year}-${(existingInvoices.length + 1).toString().padStart(4, '0')}`);
      } else if (numberingFormat === 'CLIENT_YEAR_SEQ' && clientId) {
        const client = clients.find(c => c.id === clientId);
        const prefix = client ? client.name.substring(0, 3).toUpperCase() : 'GEN';
        setInvoiceNumber(`${prefix}-${year}-${(existingInvoices.length + 1).toString().padStart(4, '0')}`);
      }
    }
  }, [clientId, numberingFormat, existingInvoices, clients]);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new (window as any).webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceTranscript(transcript);
        setIsListening(false);
        const interpreted = await interpretVoiceCommand(transcript);
        if (interpreted.action === 'ADD_ITEM') {
          const newItem: InvoiceItem = {
            id: crypto.randomUUID(),
            description: interpreted.payload.description || 'New Item',
            quantity: interpreted.payload.quantity || 1,
            rate: interpreted.payload.rate || 0,
            amount: (interpreted.payload.quantity || 1) * (interpreted.payload.rate || 0)
          };
          setItems(prev => [...prev, newItem]);
        } else if (interpreted.action === 'SET_TAX') {
          setTaxRate(interpreted.payload.taxRate || 0);
        } else if (interpreted.action === 'SET_CLIENT') {
          const client = clients.find(c => c.name.toLowerCase().includes(interpreted.payload.clientName?.toLowerCase()));
          if (client) setClientId(client.id);
        }
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [clients]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'logo' | 'signature') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setDesign(prev => ({ ...prev, [target]: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleVoiceCommands = () => {
    if (isListening) recognitionRef.current?.stop();
    else {
      setVoiceTranscript('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const applyServiceFromCatalog = (service: ServiceItem, index: number) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      description: service.name + (service.description ? ` - ${service.description}` : ''),
      rate: service.defaultRate,
      amount: updatedItems[index].quantity * service.defaultRate
    };
    setItems(updatedItems);
    setShowCatalogModal(null);
  };

  const formatMoney = (val: number) => {
    try {
        return new Intl.NumberFormat(language, { style: 'currency', currency: currency }).format(val);
    } catch {
        return `${currency} ${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    }
  };

  const labels = useMemo(() => LABELS[language] || LABELS['en-US'], [language]);
  const isRTL = language === 'ar-SA';

  return (
    <div className="flex flex-col h-full bg-cream dark:bg-charcoal-deep relative transition-colors duration-300" role="region" aria-label="Invoice Editor">
        {/* Hidden File Inputs */}
        <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
        <input type="file" ref={signatureInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'signature')} />

        {/* Catalog Modal */}
        {showCatalogModal !== null && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
             <div className="bg-white dark:bg-charcoal w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-slide-up flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-heading font-black text-slate-900 dark:text-white flex items-center gap-3">
                    <Package className="text-gold" size={28}/> Service Catalog
                  </h3>
                  <button onClick={() => setShowCatalogModal(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400"><X size={24}/></button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                   {services.length === 0 ? (
                      <div className="py-12 text-center text-slate-400">
                        <Package size={48} className="mx-auto mb-4 opacity-10" />
                        <p className="font-bold">Catalog is empty.</p>
                      </div>
                   ) : (
                     services.map(service => (
                       <button 
                         key={service.id}
                         onClick={() => applyServiceFromCatalog(service, showCatalogModal)}
                         className="w-full text-left p-5 bg-slate-50 dark:bg-charcoal-light hover:bg-gold/10 border border-transparent hover:border-gold/30 rounded-2xl transition-all group"
                       >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-slate-900 dark:text-white group-hover:text-gold">{service.name}</span>
                            <span className="font-black text-gold">${service.defaultRate}</span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 italic">{service.description}</p>
                       </button>
                     ))
                   )}
                </div>
             </div>
          </div>
        )}

        {/* Brand Design Panel */}
        {showDesignPanel && (
          <div className="absolute top-24 right-6 w-96 glass-panel p-8 rounded-[2.5rem] shadow-2xl z-50 border border-white dark:border-slate-800 bg-white dark:bg-charcoal animate-slide-up overflow-y-auto max-h-[75vh]">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2"><Palette size={18} className="text-gold"/> Visual Architecture</h4>
              <button onClick={() => setShowDesignPanel(false)} className="text-slate-400 hover:text-slate-900"><X size={18}/></button>
            </div>
            <div className="space-y-8">
              <section>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Identity Assets</label>
                <div className="grid grid-cols-2 gap-4">
                   <button 
                    onClick={() => logoInputRef.current?.click()}
                    className="flex flex-col items-center gap-3 p-4 bg-slate-50 dark:bg-charcoal-deep rounded-2xl border border-dashed border-slate-200 dark:border-white/10 hover:border-gold/50 transition-all group"
                   >
                     <div className="w-12 h-12 rounded-xl bg-white dark:bg-charcoal flex items-center justify-center text-slate-400 group-hover:text-gold overflow-hidden">
                       {design.logo ? <img src={design.logo} className="w-full h-full object-contain" /> : <Upload size={20}/>}
                     </div>
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Upload Logo</span>
                   </button>
                   <button 
                    onClick={() => signatureInputRef.current?.click()}
                    className="flex flex-col items-center gap-3 p-4 bg-slate-50 dark:bg-charcoal-deep rounded-2xl border border-dashed border-slate-200 dark:border-white/10 hover:border-gold/50 transition-all group"
                   >
                     <div className="w-12 h-12 rounded-xl bg-white dark:bg-charcoal flex items-center justify-center text-slate-400 group-hover:text-gold overflow-hidden">
                        {design.signature ? <img src={design.signature} className="w-full h-full object-contain grayscale" /> : <PenTool size={20}/>}
                     </div>
                     <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Authorized Sign</span>
                   </button>
                </div>
              </section>
              <section>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Theme Foundation</label>
                <div className="flex gap-3 flex-wrap">
                  {PREMIUM_COLORS.map(color => (
                    <button 
                      key={color} 
                      onClick={() => setDesign({...design, themeColor: color})}
                      className={`w-10 h-10 rounded-full border-4 transition-all ${design.themeColor === color ? 'border-gold scale-110 shadow-lg' : 'border-white dark:border-charcoal hover:scale-105'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </section>
              <section>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Typography & Layout</label>
                <div className="grid grid-cols-2 gap-3">
                   {FONTS.map(f => (
                     <button 
                      key={f.id}
                      onClick={() => setDesign({...design, font: f.id as any})}
                      className={`p-3 text-left rounded-xl text-xs font-bold transition-all border ${design.font === f.id ? 'bg-gold/10 border-gold text-gold' : 'bg-slate-50 dark:bg-charcoal-deep border-transparent text-slate-500'}`}
                     >
                       {f.name}
                     </button>
                   ))}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:left-6 z-30 flex flex-wrap md:flex-nowrap justify-between items-center gap-3 no-print">
            <div className="glass-panel rounded-full p-1 sm:p-1.5 flex gap-1 shadow-float border border-white/60 bg-white/80 dark:bg-charcoal/80 dark:border-white/5 order-2 md:order-1 w-full md:w-auto overflow-x-auto no-scrollbar">
                 <button 
                  onClick={toggleVoiceCommands} 
                  className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                 >
                    {isListening ? <MicOff size={16} /> : <Mic size={16} />} 
                    <span className="hidden sm:inline">{isListening ? 'Listening...' : 'Voice Command'}</span>
                 </button>
                 <button 
                  onClick={() => { setShowDesignPanel(!showDesignPanel); setShowSecurityPanel(false); setShowSendOptimizer(false); }}
                  className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-full transition-all ${showDesignPanel ? 'text-charcoal bg-gold shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                 >
                    <Palette size={16} />
                    <span className="hidden sm:inline">Brand Design</span>
                 </button>
                 <button 
                  onClick={() => { setShowSendOptimizer(!showSendOptimizer); setShowDesignPanel(false); }}
                  className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-full transition-all ${showSendOptimizer ? 'text-charcoal bg-gold shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                 >
                    <Clock size={16} className={sendTimeRecommendation ? "text-emerald-500" : ""} />
                    <span className="hidden sm:inline">Smart Send</span>
                 </button>
            </div>
            <div className="flex gap-4 items-center">
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-6 py-2.5 bg-white dark:bg-charcoal text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 text-sm font-bold rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all"
                >
                  <FileType size={14} /> PDF
                </button>
                <button 
                  onClick={() => onSave({
                    id: initialInvoice?.id || crypto.randomUUID(),
                    invoiceNumber, clientId,
                    clientName: clients.find(c => c.id === clientId)?.name || '',
                    clientAddress: clients.find(c => c.id === clientId)?.address || '',
                    date, dueDate, items, subtotal, taxRate, taxAmount, total,
                    amountPaid: initialInvoice?.amountPaid || 0,
                    status, notes, currency, language, design, isTaxInvoice, kraConfig,
                    recurring, attachments,
                    createdBy: initialInvoice?.createdBy || currentUser,
                    history: initialInvoice?.history || [],
                    password, isPasswordProtected,
                    senderTimezone: senderZone,
                    clientTimezone: clientZone,
                    allowNegotiation,
                    negotiationStatus: initialInvoice?.negotiationStatus || 'None',
                    proposedAmount: initialInvoice?.proposedAmount,
                    revenueSplits: revenueSplits.length > 1 || revenueSplits[0].percentage < 100 ? revenueSplits : undefined
                  })} 
                  className="flex items-center gap-2 px-8 py-2.5 bg-charcoal dark:bg-gold text-white dark:text-charcoal text-sm font-black uppercase tracking-widest rounded-full hover:opacity-90 shadow-xl transition-all hover:scale-105 active:scale-95"
                >
                  <Send size={14} /> Save Asset
                </button>
            </div>
        </div>

        {/* Smart Send Panel */}
        {showSendOptimizer && (
            <div className="absolute top-24 left-6 w-96 glass-panel p-8 rounded-[2.5rem] shadow-2xl z-50 border border-white dark:border-slate-800 bg-white dark:bg-charcoal animate-slide-up overflow-y-auto max-h-[75vh]">
                 <div className="flex justify-between items-center mb-6">
                    <h4 className="font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2"><Clock size={18} className="text-gold"/> Smart Send Optimization</h4>
                    <button onClick={() => setShowSendOptimizer(false)} className="text-slate-400 hover:text-slate-900"><X size={18}/></button>
                </div>

                {!clientId ? (
                    <div className="py-8 text-center text-slate-400">
                        <Users className="mx-auto mb-4 opacity-10" size={48} />
                        <p className="font-bold">Select a client first</p>
                    </div>
                ) : loadingSendTime ? (
                    <div className="py-12 text-center text-slate-400">
                        <RefreshCw className="animate-spin mx-auto mb-4 text-gold" size={32} />
                        <p className="font-bold">Analyzing habits...</p>
                    </div>
                ) : sendTimeRecommendation ? (
                    <div className="space-y-6">
                        <div className="bg-slate-50 dark:bg-charcoal-deep border border-slate-100 dark:border-slate-800 p-5 rounded-3xl">
                           <div className="flex justify-between items-center mb-4">
                              <div className="text-center flex-1">
                                 <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Me</p>
                                 <p className="text-xs font-bold text-slate-600 dark:text-slate-400 truncate max-w-[80px] mx-auto">{senderZone.split('/').pop()?.replace('_', ' ')}</p>
                              </div>
                              <div className="px-3 flex flex-col items-center">
                                 <div className="w-12 h-px bg-slate-200 dark:bg-slate-800 relative">
                                    <Globe size={10} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-gold" />
                                 </div>
                              </div>
                              <div className="text-center flex-1">
                                 <p className="text-[8px] font-black text-gold uppercase mb-1">Client</p>
                                 <p className="text-xs font-bold text-gold truncate max-w-[80px] mx-auto">{clientZone.split('/').pop()?.replace('_', ' ')}</p>
                              </div>
                           </div>
                        </div>

                        <div className="bg-gold/10 border border-gold/20 p-6 rounded-3xl relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-[10px] font-black uppercase text-gold tracking-widest mb-1">Peak Attention Window</p>
                                <h3 className="text-2xl font-heading font-black text-slate-900 dark:text-white">{sendTimeRecommendation.bestDay}, {sendTimeRecommendation.bestTime}</h3>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-2xl text-center">
                                <p className="text-[9px] font-black uppercase text-emerald-600 tracking-widest mb-1">Success Probability</p>
                                <p className="text-xl font-black text-emerald-700 dark:text-emerald-400">{sendTimeRecommendation.probabilityOfFastPay}%</p>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 p-4 rounded-2xl text-center">
                                <p className="text-[9px] font-black uppercase text-amber-600 tracking-widest mb-1">Profile Intel</p>
                                <p className="text-xs font-bold text-amber-700 dark:text-emerald-400">{sendTimeRecommendation.isCustomToClient ? 'Individual' : 'Industry'}</p>
                            </div>
                        </div>

                        <div className="p-5 bg-charcoal-deep rounded-2xl border border-white/5 shadow-inner">
                            <h5 className="text-[10px] font-black uppercase text-gold tracking-widest mb-2 flex items-center gap-1.5">
                                <Sparkles size={12}/> AI Strategic Insight
                            </h5>
                            <p className="text-xs text-slate-300 leading-relaxed italic">
                                "{sendTimeRecommendation.explanation}"
                            </p>
                        </div>
                        
                        <button className="w-full py-4 bg-gold text-charcoal rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-all shadow-lg active:scale-95">
                            Schedule Dispatch
                        </button>
                    </div>
                ) : (
                    <div className="py-8 text-center text-slate-400">
                        <AlertCircle className="mx-auto mb-4 opacity-10" size={48} />
                        <p className="font-bold">No Data Points</p>
                    </div>
                )}
            </div>
        )}

        <div className="flex-1 overflow-auto bg-slate-100 dark:bg-charcoal-deep/50 p-4 sm:p-8 md:p-12 relative flex flex-col items-center pt-32 sm:pt-40 pb-32 z-10 no-scrollbar">
            {/* Scale Container for Mobile Preview */}
            <div className="w-full flex flex-col items-center origin-top transform transition-transform duration-300 md:scale-100 scale-[0.65] sm:scale-75 lg:scale-100">
                <div 
                  className={`bg-white relative z-20 flex flex-col transition-all duration-500 shadow-2xl p-8 sm:p-12 md:p-16 ${design.paperSize === 'a4' ? 'sheet-a4' : 'sheet-letter'}`}
                  style={{ 
                    fontFamily: design.font === 'serif' ? 'Playfair Display' : design.font === 'mono' ? 'JetBrains Mono' : design.font === 'outfit' ? 'Outfit' : 'Inter',
                    direction: isRTL ? 'rtl' : 'ltr'
                  }}
                  role="document"
                >
                {/* Modern Template Header */}
                <div className={`flex justify-between items-start mb-16 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div>
                        <div className="mb-6">
                            {design.logo ? (
                                <img src={design.logo} className={`object-contain ${design.logoSize === 'sm' ? 'h-12' : design.logoSize === 'lg' ? 'h-24' : 'h-16'}`} />
                            ) : (
                                <div className="w-12 h-12 bg-gold flex items-center justify-center text-charcoal rounded-xl shadow-glow">
                                    <Sparkles size={24} />
                                </div>
                            )}
                        </div>
                        <h1 className="text-5xl font-heading font-black tracking-tighter text-slate-900">{labels.invoice}</h1>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] mt-2 font-mono">{invoiceNumber}</p>
                    </div>
                    <div className={`text-right ${isRTL ? 'text-left' : ''}`}>
                         <p className="font-black text-slate-900 text-lg">{currentUser}</p>
                         <p className="text-sm text-slate-500 mt-1">{companyPin}</p>
                    </div>
                </div>

                <div className={`grid grid-cols-2 gap-16 mb-16 border-t border-slate-100 pt-12 ${isRTL ? 'flex-row-reverse' : ''}`}>
                     <div className={isRTL ? 'text-right' : ''}>
                        <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-4">{labels.billTo}</label>
                        <select 
                            value={clientId}
                            onChange={e => setClientId(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-2xl p-4 font-black text-slate-900 outline-none focus:ring-2 focus:ring-gold/20 appearance-none no-print"
                        >
                            <option value="">Select Counterparty...</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <div className="mt-4 text-sm text-slate-500 font-medium leading-relaxed whitespace-pre-wrap">
                            {clients.find(c => c.id === clientId)?.address || 'Address pending...'}
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-8">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">{labels.date}</label>
                          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-transparent border-b border-slate-200 focus:border-gold outline-none py-2 font-bold" />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">{labels.dueDate}</label>
                          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full bg-transparent border-b border-slate-200 focus:border-gold outline-none py-2 font-bold" />
                        </div>
                     </div>
                </div>

                {/* Items Table */}
                <div className="mb-12 overflow-hidden rounded-[2rem] border border-slate-100 shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                            <tr className={isRTL ? 'flex-row-reverse' : ''}>
                                <th className={`p-5 pl-8 ${isRTL ? 'text-right pr-8 pl-5' : 'text-left'}`}>{labels.description}</th>
                                <th className={`p-5 w-24 ${isRTL ? 'text-left' : 'text-right'}`}>{labels.quantity}</th>
                                <th className={`p-5 w-32 ${isRTL ? 'text-left' : 'text-right'}`}>{labels.rate}</th>
                                <th className={`p-5 pr-8 w-40 ${isRTL ? 'text-left pl-8 pr-5' : 'text-right'}`}>{labels.amount}</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y divide-slate-50`}>
                            {items.map((item, idx) => (
                                <tr key={item.id} className={`group hover:bg-slate-50/50 transition-colors ${isRTL ? 'flex-row-reverse' : ''}`}>
                                    <td className={`p-5 pl-8 ${isRTL ? 'pr-8 pl-5 text-right' : ''}`}>
                                        <div className="relative group/field">
                                          <input value={item.description} onChange={e => { const n = [...items]; n[idx].description = e.target.value; setItems(n); }} className="w-full bg-transparent outline-none font-medium focus:ring-1 focus:ring-gold rounded" />
                                          <button onClick={() => setShowCatalogModal(idx)} className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 bg-gold/10 text-gold rounded-lg opacity-0 group-hover/field:opacity-100 transition-opacity no-print"><Package size={14}/></button>
                                        </div>
                                    </td>
                                    <td className={`p-5 ${isRTL ? 'text-left' : 'text-right'}`}>
                                      <input type="number" value={item.quantity} onChange={e => { const n = [...items]; n[idx].quantity = parseFloat(e.target.value); n[idx].amount = n[idx].quantity * n[idx].rate; setItems(n); }} className="w-full bg-transparent outline-none font-bold text-right" />
                                    </td>
                                    <td className={`p-5 ${isRTL ? 'text-left' : 'text-right'}`}>
                                      <input type="number" value={item.rate} onChange={e => { const n = [...items]; n[idx].rate = parseFloat(e.target.value); n[idx].amount = n[idx].quantity * n[idx].rate; setItems(n); }} className="w-full bg-transparent outline-none font-bold text-right" />
                                    </td>
                                    <td className={`p-5 pr-8 font-bold text-slate-900 flex items-center gap-3 ${isRTL ? 'pl-8 pr-5 flex-row-reverse' : 'justify-end'}`}>
                                        <span className="text-gold">{formatMoney(item.amount)}</span>
                                        <button onClick={() => setItems(items.filter(it => it.id !== item.id))} className="text-slate-200 hover:text-red-500 transition-colors no-print"><Trash2 size={14}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className={`flex justify-between items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="flex-1 space-y-8">
                        <button onClick={() => setItems([...items, { id: crypto.randomUUID(), description: '', quantity: 1, rate: 0, amount: 0 }])} className="no-print flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gold hover:opacity-70 transition-opacity px-5 py-3 bg-gold/10 rounded-xl border border-gold/20">
                            <Plus size={14}/> Add New Item
                        </button>
                        
                        <div className="space-y-4">
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Instructions & Terms</p>
                                <textarea 
                                    className="w-full bg-transparent border-none outline-none text-xs text-slate-600 leading-relaxed italic resize-none"
                                    placeholder="Enter payment instructions or legal terms..."
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>

                        <div className="mt-8">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{labels.signature}</p>
                            <div 
                              onClick={() => signatureInputRef.current?.click()}
                              className="w-64 h-24 border-b-2 border-slate-200 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-slate-50 transition-colors relative group/sign"
                            >
                                {design.signature ? (
                                  <img src={design.signature} className="max-h-full grayscale" />
                                ) : (
                                  <span className="text-slate-200 font-signature text-2xl">Authorized</span>
                                )}
                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover/sign:opacity-100 flex items-center justify-center text-[8px] font-black uppercase text-slate-400">Update Signature</div>
                            </div>
                        </div>
                    </div>

                    <div className={`w-80 space-y-4 ${isRTL ? 'mr-20 ml-0 text-right' : 'ml-20'}`}>
                        <div className="flex justify-between text-sm text-slate-500 font-medium">
                            <span>{labels.subtotal}</span>
                            <span className="text-slate-900 font-bold">{formatMoney(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-500 font-medium">
                            <span>{labels.tax} ({taxRate}%)</span>
                            <span className="text-slate-900 font-bold">{formatMoney(taxAmount)}</span>
                        </div>
                        <div className="flex justify-between text-3xl font-heading font-black border-t-2 border-slate-100 pt-6">
                            <span>{labels.total}</span>
                            <span className="text-gold">{formatMoney(total)}</span>
                        </div>
                    </div>
                </div>
              </div>
            </div>
        </div>
    </div>
  );
};

export default InvoiceEditor;
