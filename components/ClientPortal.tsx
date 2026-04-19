import React, { useState, useMemo } from 'react';
import { Client, Invoice, Payment, InvoiceStatus } from '../types';
import { 
  LayoutDashboard, FileText, CreditCard, User, LogOut, 
  Download, ExternalLink, CheckCircle2, AlertCircle, 
  Clock, ArrowRight, ShieldCheck, Mail, MapPin, Phone, 
  Search, Filter, Receipt, Save, Globe, RefreshCw, Mic
} from 'lucide-react';

interface ClientPortalProps {
  client: Client;
  invoices: Invoice[];
  payments: Payment[];
  onBack: () => void;
  onUpdateClient: (clientId: string, updates: Partial<Client>) => void;
  onViewInvoice: (invoiceId: string) => void;
}

const ClientPortal: React.FC<ClientPortalProps> = ({ 
  client, 
  invoices, 
  payments, 
  onBack, 
  onUpdateClient,
  onViewInvoice
}) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'INVOICES' | 'PAYMENTS' | 'SETTINGS'>('DASHBOARD');
  const [formData, setFormData] = useState<Partial<Client>>({
    name: client.name,
    email: client.email,
    phone: client.phone,
    address: client.address
  });
  const [isSaving, setIsSaving] = useState(false);

  const clientInvoices = useMemo(() => invoices.filter(i => i.clientId === client.id), [invoices, client.id]);
  const clientPayments = useMemo(() => payments.filter(p => p.clientName === client.name), [payments, client.name]);

  const stats = useMemo(() => {
    return clientInvoices.reduce((acc, inv) => {
      if (inv.status === InvoiceStatus.PAID) acc.paid += inv.total;
      else acc.outstanding += inv.total;
      return acc;
    }, { paid: 0, outstanding: 0 });
  }, [clientInvoices]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      onUpdateClient(client.id, formData);
      setIsSaving(false);
      alert("Profile updated successfully!");
    }, 1000);
  };

  const NavItem = ({ id, icon: Icon, label }: any) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl transition-all ${activeTab === id ? 'bg-gold text-charcoal shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
    >
      <Icon size={20} />
      <span className="font-bold text-sm">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-cream dark:bg-charcoal-deep flex flex-col md:flex-row transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-white dark:bg-charcoal border-r border-slate-200 dark:border-slate-800 p-8 flex flex-col h-auto md:h-screen sticky top-0 transition-colors">
        <div className="flex items-center gap-4 mb-12">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center text-charcoal shadow-sm">
                <FileText size={20} />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-charcoal rounded-full flex items-center justify-center border border-gold">
                <Mic size={8} className="text-gold" strokeWidth={3} />
            </div>
          </div>
          <div>
            <h1 className="font-heading font-black text-xl tracking-tighter dark:text-white leading-none">Portal</h1>
            <p className="text-[9px] font-bold text-gold uppercase tracking-widest mt-0.5">Verified User</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem id="DASHBOARD" icon={LayoutDashboard} label="Dashboard" />
          <NavItem id="INVOICES" icon={FileText} label="Invoices" />
          <NavItem id="PAYMENTS" icon={CreditCard} label="History" />
          <NavItem id="SETTINGS" icon={User} label="Settings" />
        </nav>

        <div className="pt-8 mt-8 border-t border-slate-100 dark:border-slate-800">
           <button 
             onClick={onBack}
             className="w-full flex items-center gap-3 px-6 py-3 text-slate-400 hover:text-red-500 transition-colors font-bold text-sm"
           >
             <LogOut size={20} /> Exit Portal
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
          
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             <div>
                <h2 className="text-3xl font-heading font-black text-slate-900 dark:text-white tracking-tight">Welcome, {client.name}</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Operational financial control center.</p>
             </div>
             <div className="flex items-center gap-3 bg-white dark:bg-charcoal p-2 pr-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gold text-charcoal flex items-center justify-center font-bold">{client.name.charAt(0)}</div>
                <div>
                   <p className="text-xs font-bold text-slate-900 dark:text-white leading-none">{client.email}</p>
                   <p className="text-[10px] font-black text-gold uppercase mt-1">Verified Account</p>
                </div>
             </div>
          </header>

          {activeTab === 'DASHBOARD' && (
            <div className="space-y-8 animate-slide-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-8 rounded-[2.5rem] bg-charcoal text-white relative overflow-hidden transition-colors">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gold/10 rounded-full blur-[80px] -mr-20 -mt-20"></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Floating Obligations</p>
                    <div className="text-4xl font-heading font-black text-white mb-4">
                      ${stats.outstanding.toLocaleString()}
                    </div>
                </div>
                <div className="glass-panel p-8 rounded-[2.5rem] bg-gold text-charcoal relative overflow-hidden transition-colors">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-[80px] -mr-20 -mt-20"></div>
                    <p className="text-[10px] font-black text-charcoal/60 uppercase tracking-widest mb-2">Total Settlement</p>
                    <div className="text-4xl font-heading font-black mb-4">
                      ${stats.paid.toLocaleString()}
                    </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="glass-panel p-8 rounded-[2.5rem] bg-white dark:bg-charcoal border border-slate-200 dark:border-slate-800 transition-colors">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-heading font-bold text-xl flex items-center gap-2 dark:text-white"><FileText className="text-gold" size={20}/> Active Assets</h3>
                      <button onClick={() => setActiveTab('INVOICES')} className="text-xs font-bold text-gold hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                      {clientInvoices.slice(0, 3).map(inv => (
                        <div key={inv.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-charcoal-deep rounded-2xl hover:bg-gold/10 transition-colors group">
                           <div className="flex items-center gap-4">
                              <div className="p-3 bg-white dark:bg-charcoal rounded-xl shadow-sm"><FileText size={18} className="text-slate-400"/></div>
                              <div>
                                 <p className="font-bold text-slate-900 dark:text-white text-sm">#{inv.invoiceNumber}</p>
                                 <p className="text-[10px] text-slate-400 font-bold uppercase">{inv.date}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="font-heading font-black text-slate-900 dark:text-white">${inv.total.toLocaleString()}</p>
                           </div>
                        </div>
                      ))}
                    </div>
                 </div>

                 <div className="glass-panel p-8 rounded-[2.5rem] bg-white dark:bg-charcoal border border-slate-200 dark:border-slate-800 transition-colors">
                    <h3 className="font-heading font-bold text-xl flex items-center gap-2 mb-6 dark:text-white"><ShieldCheck className="text-emerald-500" size={20}/> Compliance Log</h3>
                    <div className="space-y-6">
                       {client.activity.slice(0, 5).map(act => (
                         <div key={act.id} className="flex gap-4 items-start border-l-2 border-slate-100 dark:border-slate-800 pl-6 relative">
                           <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white dark:bg-charcoal border-2 border-slate-200 dark:border-slate-800"></div>
                           <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{act.description}</p>
                              <p className="text-[10px] text-slate-400 font-medium mt-1">{act.date}</p>
                           </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClientPortal;