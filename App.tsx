import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import MobileNav from './components/MobileNav';
import Dashboard from './components/Dashboard';
import InvoiceList from './components/InvoiceList';
import InvoiceEditor from './components/InvoiceEditor';
import Clients from './components/Clients';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Expenses from './components/Expenses';
import Projects from './components/Projects';
import Payments from './components/Payments';
import Proposals from './components/Proposals';
import Services from './components/Services';
import TaxCalculator from './components/TaxCalculator';
import BusinessCard from './components/BusinessCard';
import Marketplace from './components/Marketplace';
import PublicInvoiceView from './components/PublicInvoiceView';
import ClientPortal from './components/ClientPortal';
import HelpCenter from './components/HelpCenter';
import FinAssistant from './components/FinAssistant';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import UserProfile from './components/UserProfile';
import { ViewState, Invoice, Client, InvoiceStatus, AppSettings, Expense, Project, Payment, MarketplaceTemplate, Proposal, ProposalStatus, ServiceItem, DisputeMessage, TeamMember } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, Sparkles, X, WifiOff, FileText, Plus, Mic, Settings as SettingsIcon } from 'lucide-react';
import { generateFinancialInsights } from './services/geminiService';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

const MOCK_MARKETPLACE: MarketplaceTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Midnight Electric',
    description: 'A striking dark-themed invoice designed for high-end creative agencies and software studios.',
    price: 12.99,
    sellerName: 'Studio Aura',
    sellerId: 'studio@aura.com',
    downloads: 1420,
    rating: 4.9,
    tags: ['Dark', 'Tech', 'Modern'],
    design: { template: 'community', themeColor: '#4f46e5', font: 'outfit', paperSize: 'a4', logoSize: 'md' }
  },
  {
    id: 'tpl-2',
    name: 'Parisian Minimal',
    description: 'Boutique-style minimalist design with elegant serifs and generous whitespace. Perfect for consultants.',
    price: 8.50,
    sellerName: 'Luxe Brands',
    sellerId: 'luxe@design.fr',
    downloads: 890,
    rating: 4.7,
    tags: ['Minimal', 'Elegant', 'Serif'],
    design: { template: 'community', themeColor: '#0f172a', font: 'playfair', paperSize: 'a4', logoSize: 'sm' }
  }
];

const MOCK_PROPOSALS: Proposal[] = [
  {
    id: 'prop-1',
    proposalNumber: 'PRP-2024-001',
    clientId: 'c1',
    clientName: 'Acme Corp',
    date: '2024-01-10',
    expiryDate: '2024-02-10',
    items: [
      { id: 'item-1', description: 'Rebranding Strategy', quantity: 1, rate: 5000, amount: 5000 },
      { id: 'item-2', description: 'Web Development', quantity: 1, rate: 15000, amount: 15000 }
    ],
    subtotal: 20000,
    taxRate: 0,
    taxAmount: 0,
    total: 20000,
    status: ProposalStatus.ACCEPTED,
    currency: 'USD'
  }
];

const MOCK_SERVICES: ServiceItem[] = [
  { id: 'srv-1', name: 'UI/UX Design', description: 'High-fidelity mobile and web interfaces.', defaultRate: 150, category: 'Design' },
  { id: 'srv-2', name: 'Full-Stack Development', description: 'React + Node.js professional build.', defaultRate: 200, category: 'Dev' }
];

const MOCK_TEAM: TeamMember[] = [
  { id: 'tm-1', name: 'Sarah Chen', role: 'Lead UI/UX Designer', email: 'sarah@design.io', avatar: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=4f46e5&color=fff' },
  { id: 'tm-2', name: 'Marco Rossi', role: 'Full Stack Dev', email: 'marco@build.it', avatar: 'https://ui-avatars.com/api/?name=Marco+Rossi&background=10b981&color=fff' },
  { id: 'tm-3', name: 'Elena Vance', role: 'Copywriter', email: 'elena@write.ly', avatar: 'https://ui-avatars.com/api/?name=Elena+Vance&background=f43f5e&color=fff' }
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('LANDING');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && (currentView === 'LANDING' || currentView === 'AUTH')) {
        setCurrentView('DASHBOARD');
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [currentView]);
  
  // Storage logic
  const [invoices, setInvoices] = useState<Invoice[]>(() => JSON.parse(localStorage.getItem('invoicely_invoices_v10') || '[]'));
  const [clients, setClients] = useState<Client[]>(() => JSON.parse(localStorage.getItem('invoicely_clients_v10') || '[]'));
  const [expenses, setExpenses] = useState<Expense[]>(() => JSON.parse(localStorage.getItem('invoicely_expenses_v10') || '[]'));
  const [projects, setProjects] = useState<Project[]>(() => JSON.parse(localStorage.getItem('invoicely_projects_v10') || '[]'));
  const [payments, setPayments] = useState<Payment[]>(() => JSON.parse(localStorage.getItem('invoicely_payments_v10') || '[]'));
  const [proposals, setProposals] = useState<Proposal[]>(() => JSON.parse(localStorage.getItem('invoicely_proposals_v10') || JSON.stringify(MOCK_PROPOSALS)));
  const [services, setServices] = useState<ServiceItem[]>(() => JSON.parse(localStorage.getItem('invoicely_services_v10') || JSON.stringify(MOCK_SERVICES)));
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('invoicely_settings_v10');
    if (saved) return JSON.parse(saved);
    return {
      userName: "Taylor",
      email: "freelancer@pro.com",
      theme: 'light',
      defaultCurrency: "USD",
      defaultLanguage: "en-US",
      testimonials: [],
      numberingFormat: "CLIENT_YEAR_SEQ",
      balance: 250,
      purchasedTemplateIds: ["tpl-1"],
      teamMembers: MOCK_TEAM
    };
  });
  const [marketplaceTemplates, setMarketplaceTemplates] = useState<MarketplaceTemplate[]>(() => {
    const saved = localStorage.getItem('invoicely_marketplace_v2');
    return saved ? JSON.parse(saved) : MOCK_MARKETPLACE;
  });
  
  const [editingInvoice, setEditingInvoice] = useState<Invoice | undefined>(undefined);
  const [trackingInvoice, setTrackingInvoice] = useState<Invoice | undefined>(undefined);
  const [portalClientId, setPortalClientId] = useState<string | null>(null);

  // Apply Theme
  useEffect(() => {
    if (appSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appSettings.theme]);

  useEffect(() => {
    localStorage.setItem('invoicely_invoices_v10', JSON.stringify(invoices));
    localStorage.setItem('invoicely_clients_v10', JSON.stringify(clients));
    localStorage.setItem('invoicely_expenses_v10', JSON.stringify(expenses));
    localStorage.setItem('invoicely_projects_v10', JSON.stringify(projects));
    localStorage.setItem('invoicely_payments_v10', JSON.stringify(payments));
    localStorage.setItem('invoicely_proposals_v10', JSON.stringify(proposals));
    localStorage.setItem('invoicely_services_v10', JSON.stringify(services));
    localStorage.setItem('invoicely_settings_v10', JSON.stringify(appSettings));
    localStorage.setItem('invoicely_marketplace_v2', JSON.stringify(marketplaceTemplates));
  }, [invoices, clients, expenses, projects, payments, proposals, services, appSettings, marketplaceTemplates]);

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
        window.removeEventListener('online', handleStatus);
        window.removeEventListener('offline', handleStatus);
    };
  }, []);

  const handleSaveInvoice = (invoice: Invoice) => {
    const existingIndex = invoices.findIndex(i => i.id === invoice.id);
    if (existingIndex >= 0) {
      const updated = [...invoices];
      updated[existingIndex] = invoice;
      setInvoices(updated);
    } else {
      setInvoices([invoice, ...invoices]);
    }
    setCurrentView('INVOICES');
    setEditingInvoice(undefined);
  };

  const handleTrackInvoiceView = (id: string) => {
      setInvoices(prev => prev.map(i => {
          if (i.id === id) {
              const currentTracking = i.tracking || { views: 0, emailOpens: 0 };
              return { 
                ...i, 
                tracking: { 
                  ...currentTracking, 
                  views: currentTracking.views + 1, 
                  lastViewedAt: new Date().toISOString() 
                } 
              };
          }
          return i;
      }));
  };

  const handleSimulateClientView = (id: string) => {
      const inv = invoices.find(i => i.id === id);
      if (!inv) return;
      handleTrackInvoiceView(id);
      setTrackingInvoice(invoices.find(i => i.id === id));
      setCurrentView('CLIENT_VIEW');
  };

  const handleOpenClientPortal = (id: string) => {
    setPortalClientId(id);
    setCurrentView('CLIENT_PORTAL');
  };

  const handleUpdateClientFromPortal = (clientId: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, ...updates } : c));
  };

  const handlePurchaseTemplate = (template: MarketplaceTemplate) => {
    if (appSettings.balance && appSettings.balance >= template.price) {
      setAppSettings(prev => ({
        ...prev,
        balance: (prev.balance || 0) - template.price,
        purchasedTemplateIds: [...(prev.purchasedTemplateIds || []), template.id]
      }));
      alert(`Success! You have purchased ${template.name}`);
    } else {
      alert("Insufficient balance to purchase this template.");
    }
  };

  const handleConvertProposalToInvoice = (proposal: Proposal) => {
    const client = clients.find(c => c.id === proposal.clientId);
    const newInvoice: Invoice = {
      id: crypto.randomUUID(),
      invoiceNumber: `INV-${proposal.proposalNumber.split('-').pop() || Date.now()}`,
      clientId: proposal.clientId,
      clientName: proposal.clientName,
      clientAddress: client?.address || '',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: proposal.items,
      subtotal: proposal.subtotal,
      taxRate: proposal.taxRate,
      taxAmount: proposal.taxAmount,
      total: proposal.total,
      amountPaid: 0,
      status: InvoiceStatus.PENDING,
      currency: proposal.currency,
      language: client?.defaultLanguage || appSettings.defaultLanguage,
      recurring: 'None',
      attachments: [],
      notes: proposal.notes,
      design: appSettings.defaultDesign || {
        template: 'modern',
        themeColor: '#4f46e5',
        font: 'inter',
        paperSize: 'a4',
        logoSize: 'md'
      }
    };
    setInvoices([newInvoice, ...invoices]);
    setEditingInvoice(newInvoice);
    setCurrentView('CREATE_INVOICE');
  };

  const handleNegotiationUpdate = (id: string, status: 'Accepted' | 'Declined') => {
      setInvoices(invoices.map(inv => {
          if (inv.id === id) {
              if (status === 'Accepted' && inv.proposedAmount) {
                  const ratio = inv.proposedAmount / inv.total;
                  const newItems = inv.items.map(item => ({
                      ...item,
                      rate: item.rate * ratio,
                      amount: item.amount * ratio
                  }));
                  return { 
                      ...inv, 
                      negotiationStatus: status, 
                      total: inv.proposedAmount, 
                      subtotal: inv.subtotal * ratio,
                      taxAmount: inv.taxAmount * ratio,
                      items: newItems 
                  };
              }
              return { ...inv, negotiationStatus: status };
          }
          return inv;
      }));
  };

  const handleClientProposeAmount = (amount: number, note: string) => {
      if (!trackingInvoice) return;
      const updated = invoices.map(inv => {
          if (inv.id === trackingInvoice.id) {
              return { ...inv, proposedAmount: amount, negotiationNote: note, negotiationStatus: 'Proposed' as const };
          }
          return inv;
      });
      setInvoices(updated);
      setTrackingInvoice(updated.find(i => i.id === trackingInvoice.id));
  };

  const handleClientRaiseDispute = (itemIds: string[], reason: string) => {
    if (!trackingInvoice) return;
    const updated = invoices.map(inv => {
      if (inv.id === trackingInvoice.id) {
        return { 
          ...inv, 
          dispute: { 
            isDisputed: true, 
            disputedItemIds: itemIds, 
            reason, 
            status: 'Open' as const, 
            thread: [] 
          } 
        };
      }
      return inv;
    });
    setInvoices(updated);
    setTrackingInvoice(updated.find(i => i.id === trackingInvoice.id));
  };

  const handleClientSendDisputeMessage = (message: string) => {
    if (!trackingInvoice || !trackingInvoice.dispute) return;
    const newMessage: DisputeMessage = {
      id: crypto.randomUUID(),
      sender: 'Client',
      message,
      timestamp: new Date().toISOString()
    };
    const updated = invoices.map(inv => {
      if (inv.id === trackingInvoice.id && inv.dispute) {
        return { 
          ...inv, 
          dispute: { 
            ...inv.dispute, 
            thread: [...inv.dispute.thread, newMessage] 
          } 
        };
      }
      return inv;
    });
    setInvoices(updated);
    setTrackingInvoice(updated.find(i => i.id === trackingInvoice.id));
  };

  const socialProofStats = React.useMemo(() => {
    const totalPaid = invoices.filter(i => i.status === InvoiceStatus.PAID).length;
    const avgRating = appSettings.testimonials.length > 0 
        ? appSettings.testimonials.reduce((sum, t) => sum + t.rating, 0) / appSettings.testimonials.length 
        : 5.0;
    
    const countries = new Set(clients.map(c => {
        const parts = c.address.split(',');
        return parts.length > 0 ? parts[parts.length - 1].trim() : null;
    }).filter(Boolean));
    
    return {
        totalPaid,
        avgRating,
        countriesServed: Math.max(1, countries.size)
    };
  }, [invoices, clients, appSettings.testimonials]);

  if (currentView === 'CLIENT_VIEW' && trackingInvoice) {
      return (
          <PublicInvoiceView 
            invoice={trackingInvoice} 
            onBack={() => setCurrentView('INVOICES')} 
            onPayment={() => alert("Payment logic integrated.")} 
            onProposeAmount={handleClientProposeAmount}
            onRaiseDispute={handleClientRaiseDispute}
            onSendDisputeMessage={handleClientSendDisputeMessage}
            onView={() => handleTrackInvoiceView(trackingInvoice.id)}
            stats={socialProofStats}
          />
      );
  }

  if (authLoading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-charcoal-deep text-gold"><Sparkles className="animate-spin" size={32} /></div>;
  }

  if (currentView === 'LANDING' && !user) {
    return <LandingPage onNavigate={setCurrentView} />;
  }

  if (currentView === 'AUTH' && !user) {
    return <AuthPage onNavigate={setCurrentView} onLoginSuccess={() => setCurrentView('DASHBOARD')} />;
  }

  if (currentView === 'CLIENT_PORTAL' && portalClientId) {

    const activeClient = clients.find(c => c.id === portalClientId);
    if (activeClient) {
      return (
        <ClientPortal 
          client={activeClient}
          invoices={invoices}
          payments={payments}
          onBack={() => setCurrentView('CLIENTS')}
          onUpdateClient={handleUpdateClientFromPortal}
          onViewInvoice={handleSimulateClientView}
        />
      );
    }
  }

  return (
    <div className="flex h-screen overflow-hidden font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {!isOnline && (
          <div className="fixed top-0 left-0 w-full bg-gold text-charcoal text-[10px] font-black text-center py-1.5 z-[100] flex items-center justify-center gap-2 uppercase tracking-widest">
              <WifiOff size={12} /> Working Offline • Sync Active
          </div>
      )}

      {/* Desktop Sidebar */}
      <Sidebar 
        currentView={currentView} 
        onChangeView={(v) => { setCurrentView(v); if(v === 'CREATE_INVOICE') setEditingInvoice(undefined); }}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
        theme={appSettings.theme}
        onToggleTheme={() => setAppSettings(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }))}
        user={user}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-cream dark:bg-charcoal-deep transition-colors duration-300">
        
        {/* Compact Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 bg-charcoal text-white z-20 m-4 rounded-2xl no-print shadow-lg">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all active:scale-95"
              >
                <Menu size={20} />
              </button>
              <div className="flex items-center gap-2">
                <div className="relative group scale-[0.6] origin-left">
                  <div className="w-14 h-14 rounded-2xl bg-gold flex items-center justify-center text-charcoal shadow-[0_10px_20px_rgba(244,206,107,0.3)] border-2 border-charcoal/10 transition-all duration-500 group-hover:rotate-6">
                    <FileText size={28} strokeWidth={2.5} />
                  </div>
                  <div className="absolute -top-1.5 -right-1.5 w-7 h-7 bg-white dark:bg-charcoal rounded-full flex items-center justify-center border-2 border-gold shadow-lg animate-pulse">
                    <Mic size={14} className="text-gold" strokeWidth={3} />
                  </div>
                </div>
                <span className="font-heading font-black text-[1.1rem] tracking-tight -ml-3">Oratore</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => setCurrentView('SETTINGS')} className="p-2 bg-white/10 rounded-xl"><SettingsIcon size={20} /></button>
                <button 
                  onClick={() => setCurrentView('PROFILE')} 
                  className="w-8 h-8 rounded-full bg-slate-600 border-2 border-gold overflow-hidden hover:scale-105 transition-transform"
                >
                    <img src={user?.photoURL || appSettings.avatar || `https://ui-avatars.com/api/?name=${user?.displayName || appSettings.userName}`} alt="User" className="w-full h-full object-cover" />
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar scroll-smooth pb-32 md:pb-8">
          <div className="max-w-[1600px] mx-auto h-full pb-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="h-full"
              >
                {currentView === 'PROFILE' && <UserProfile />}
                {currentView === 'DASHBOARD' && (
                  <Dashboard 
                    invoices={invoices} 
                    clients={clients} 
                    projects={projects}
                    expenses={expenses}
                    appSettings={appSettings}
                    onCreateInvoice={() => setCurrentView('CREATE_INVOICE')} 
                    onOpenTaxCalculator={() => setCurrentView('TAX_CALCULATOR')}
                    onNavigate={(v) => { setCurrentView(v); if(v === 'CREATE_INVOICE') setEditingInvoice(undefined); }}
                  />
                )}
                {currentView === 'INVOICES' && (
                    <div className="space-y-8">
                       <div className="flex justify-between items-end border-b border-slate-200/50 dark:border-slate-800 pb-4">
                          <h1 className="text-4xl font-heading font-black text-slate-900 dark:text-white">Invoices</h1>
                          <button onClick={() => { setEditingInvoice(undefined); setCurrentView('CREATE_INVOICE'); }} className="hidden md:block bg-charcoal dark:bg-gold text-white dark:text-charcoal px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:opacity-90 transition-all">New Asset</button>
                       </div>
                       <InvoiceList 
                        invoices={invoices} 
                        onEdit={(inv) => { setEditingInvoice(inv); setCurrentView('CREATE_INVOICE'); }} 
                        onDuplicate={(inv) => { setEditingInvoice({...inv, id: crypto.randomUUID(), invoiceNumber: '', status: InvoiceStatus.DRAFT}); setCurrentView('CREATE_INVOICE'); }} 
                        onDelete={(id) => setInvoices(invoices.filter(i => i.id !== id))} 
                        onTrackView={handleSimulateClientView}
                        onUpdateNegotiation={handleNegotiationUpdate}
                       />
                    </div>
                )}
                {currentView === 'PROPOSALS' && <Proposals proposals={proposals} clients={clients} onAddProposal={(p) => setProposals([p, ...proposals])} onUpdateStatus={(id, status) => setProposals(proposals.map(p => p.id === id ? { ...p, status } : p))} onDeleteProposal={(id) => setProposals(proposals.filter(p => p.id !== id))} onConvertToInvoice={handleConvertProposalToInvoice} />}
                {currentView === 'SERVICES' && <Services services={services} onAddService={s => setServices([s, ...services])} onUpdateService={s => setServices(services.map(i => i.id === s.id ? s : i))} onDeleteService={id => setServices(services.filter(s => s.id !== id))} />}
                {currentView === 'MARKETPLACE' && <Marketplace templates={marketplaceTemplates} settings={appSettings} onPurchase={handlePurchaseTemplate} onUpload={(tpl) => setMarketplaceTemplates([...marketplaceTemplates, { ...tpl, id: crypto.randomUUID(), downloads: 0, rating: 5.0, tags: ['Community'], design: { template: 'community', themeColor: '#4f46e5', font: 'inter', paperSize: 'a4', logoSize: 'md' } } as MarketplaceTemplate])} />}
                {currentView === 'CREATE_INVOICE' && <InvoiceEditor clients={clients} projects={projects} services={services} onSave={handleSaveInvoice} onCancel={() => setCurrentView('INVOICES')} initialInvoice={editingInvoice} defaultCurrency={appSettings.defaultCurrency} defaultLanguage={appSettings.defaultLanguage} existingInvoices={invoices} numberingFormat={appSettings.numberingFormat} companyPin={appSettings.companyPin} teamMembers={appSettings.teamMembers} />}
                {currentView === 'BUSINESS_CARD' && <BusinessCard settings={appSettings} />}
                {currentView === 'CLIENTS' && <Clients clients={clients} onAddClient={(c) => setClients([...clients, c])} onDeleteClient={(id) => setClients(clients.filter(c => c.id !== id))} onOpenPortal={handleOpenClientPortal} />}
                {currentView === 'EXPENSES' && <Expenses expenses={expenses} projects={projects} onAddExpense={(e) => setExpenses([e, ...expenses])} onDeleteExpense={(id) => setExpenses(expenses.filter(e => e.id !== id))} />}
                {currentView === 'PROJECTS' && <Projects projects={projects} clients={clients} invoices={invoices} expenses={expenses} onAddProject={(p) => setProjects([p, ...projects])} onDeleteProject={(id) => setProjects(projects.filter(p => p.id !== id))} />}
                {currentView === 'REPORTS' && <Reports invoices={invoices} expenses={expenses} />}
                {currentView === 'SETTINGS' && <Settings settings={appSettings} onSave={setAppSettings} onViewTerms={() => {}} />}
                {currentView === 'TAX_CALCULATOR' && <TaxCalculator invoices={invoices} defaultCurrency={appSettings.defaultCurrency} />}
                {currentView === 'HELP_CENTER' && <HelpCenter onBack={() => setCurrentView('DASHBOARD')} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        
        {/* Global Bottom Navigation (Mobile Only) */}
        <MobileNav 
          currentView={currentView}
          onChangeView={(v) => { setCurrentView(v); if(v === 'CREATE_INVOICE') setEditingInvoice(undefined); }}
        />

        {/* New Refined FinAssistant placed in standard Bottom-Right Position */}
        <FinAssistant invoices={invoices} expenses={expenses} />
        
      </main>
    </div>
  );
};

export default App;