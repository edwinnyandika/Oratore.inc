import React, { useEffect, useState, useMemo } from 'react';
import { Invoice, InvoiceStatus, Client, Project, Expense, AppSettings, ViewState } from '../types';
import { 
  XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid 
} from 'recharts';
import { 
  Plus, Users, Activity, Zap, RefreshCw, Package, Globe, TrendingUp, Settings,
  ChevronDown, Calendar, CheckCircle2, Clock, AlertCircle, Coins, ArrowRight, Landmark,
  Sparkles, Rocket, UserCheck, Briefcase, Receipt, FileText, Lightbulb, BookOpen
} from 'lucide-react';
import { predictPaymentForecast, getExchangeRates, MAJOR_CURRENCIES } from '../services/geminiService';

interface DashboardProps {
  invoices: Invoice[];
  clients: Client[];
  projects: Project[];
  expenses: Expense[];
  appSettings: AppSettings;
  onCreateInvoice: () => void;
  onOpenTaxCalculator: () => void;
  onNavigate: (view: ViewState) => void;
}

const AI_TIPS = [
  "successful freelancers invoice within 24 hours of completing work. This reduces payment delays by 40%.",
  "focus on 'Retainer' models for your top 20% clients. Stability in cash flow is the ultimate freelancer superpower.",
  "your brand is your pricing power. A custom signature and logo on your assets can justify a 15% rate increase.",
  "quarterly tax planning isn't just for firms. Set aside 25% of every payment today to avoid end-of-year stress.",
  "follow-up is where the money is. Automate your reminders to trigger at 7 and 14 days post-due.",
  "diversify your client base. No single counterparty should represent more than 30% of your annual revenue."
];

const Dashboard: React.FC<DashboardProps> = ({ 
  invoices, 
  clients, 
  projects, 
  expenses, 
  appSettings,
  onCreateInvoice, 
  onOpenTaxCalculator, 
  onNavigate 
}) => {
  const [forecast, setForecast] = useState<any>(null);
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [ratesLoading, setRatesLoading] = useState(true);
  const [userName, setUserName] = useState(appSettings.userName || 'Partner');
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    setUserName(appSettings.userName || 'Partner');
    
    const fetchRates = async () => {
      setRatesLoading(true);
      const data = await getExchangeRates(appSettings.defaultCurrency || 'USD');
      if (data && data.rates) {
        setExchangeRates(data.rates);
      }
      setRatesLoading(false);
    };
    fetchRates();

    const fetchForecast = async () => {
      const result = await predictPaymentForecast(invoices);
      setForecast(result);
    };
    fetchForecast();
    
    // Pick a random tip on mount
    setTipIndex(Math.floor(Math.random() * AI_TIPS.length));
  }, [appSettings.userName, appSettings.defaultCurrency, invoices]);

  const stats = useMemo(() => {
    const totalRevenue = invoices
      .filter(i => i.status === InvoiceStatus.PAID)
      .reduce((sum, i) => sum + i.total, 0);

    const pendingAmount = invoices
      .filter(i => i.status === InvoiceStatus.PENDING)
      .reduce((sum, i) => sum + i.total, 0);

    const overdueAmount = invoices
      .filter(i => i.status === InvoiceStatus.OVERDUE)
      .reduce((sum, i) => sum + i.total, 0);

    const paidCount = invoices.filter(i => i.status === InvoiceStatus.PAID).length;
    const totalCount = invoices.length;

    return {
      totalRevenue,
      pendingAmount,
      overdueAmount,
      totalInvoices: totalCount,
      paidPercentage: totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0
    };
  }, [invoices]);

  // Onboarding Logic
  const onboardingSteps = useMemo(() => {
    const steps = [
      { 
        id: 'IDENTITY', 
        label: 'Customize Identity', 
        description: 'Set your professional name and workspace theme.', 
        icon: UserCheck, 
        isComplete: appSettings.userName !== 'Taylor', 
        targetView: 'SETTINGS' as ViewState 
      },
      { 
        id: 'CLIENT', 
        label: 'Add a Counterparty', 
        description: 'Register your first client to start billing.', 
        icon: Users, 
        isComplete: clients.length > 0, 
        targetView: 'CLIENTS' as ViewState 
      },
      { 
        id: 'PROJECT', 
        label: 'Create Operations', 
        description: 'Structure your work into high-yield projects.', 
        icon: Briefcase, 
        isComplete: projects.length > 0, 
        targetView: 'PROJECTS' as ViewState 
      },
      { 
        id: 'EXPENSE', 
        label: 'Log Outflow', 
        description: 'Scan a receipt or log a business cost.', 
        icon: Receipt, 
        isComplete: expenses.length > 0, 
        targetView: 'EXPENSES' as ViewState 
      },
      { 
        id: 'INVOICE', 
        label: 'Deploy First Asset', 
        description: 'Generate your professional financial document.', 
        icon: FileText, 
        isComplete: invoices.length > 0, 
        targetView: 'CREATE_INVOICE' as ViewState 
      },
    ];
    
    const completedCount = steps.filter(s => s.isComplete).length;
    const currentStepIndex = steps.findIndex(s => !s.isComplete);
    const nextStep = currentStepIndex !== -1 ? steps[currentStepIndex] : null;

    return { steps, completedCount, nextStep, isAllComplete: completedCount === steps.length };
  }, [appSettings, clients, projects, expenses, invoices]);

  const weeklyActivity = useMemo(() => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const now = new Date();
    return days.map((day, index) => {
      const date = new Date();
      date.setDate(now.getDate() - (6 - index));
      const count = invoices.filter(inv => {
        const invDate = new Date(inv.date);
        return invDate.toDateString() === date.toDateString();
      }).length;
      return { day, value: count };
    });
  }, [invoices]);

  const hasActivity = useMemo(() => weeklyActivity.some(d => d.value > 0), [weeklyActivity]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleNextTip = () => {
    setTipIndex((prev) => (prev + 1) % AI_TIPS.length);
  };

  const isDark = appSettings.theme === 'dark';
  const showWizard = invoices.length === 0 && clients.length === 0;

  return (
    <div className="space-y-6 sm:space-y-8 pb-20 animate-fade-in max-w-7xl mx-auto px-2 sm:px-0">
      {/* Dynamic Currency Ticker */}
      <div className="relative overflow-hidden h-10 bg-charcoal/5 dark:bg-white/5 rounded-2xl flex items-center px-6">
        <div className="flex gap-8 animate-marquee whitespace-nowrap">
          {MAJOR_CURRENCIES.map(curr => (
            <div key={curr} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-charcoal/60 dark:text-slate-400">
              <span className="text-gold">{curr}</span>
              <span>{ratesLoading ? '...' : (exchangeRates[curr]?.toFixed(2) || 'N/A')}</span>
              <TrendingUp size={10} className="text-emerald-500" />
            </div>
          ))}
          {MAJOR_CURRENCIES.map(curr => (
            <div key={`${curr}-dup`} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-charcoal/60 dark:text-slate-400">
              <span className="text-gold">{curr}</span>
              <span>{ratesLoading ? '...' : (exchangeRates[curr]?.toFixed(2) || 'N/A')}</span>
              <TrendingUp size={10} className="text-emerald-500" />
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-heading font-black text-slate-900 dark:text-white tracking-tight transition-colors">
            {getGreeting()}, <span className="text-gold">{userName}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 italic">Building your professional legacy.</p>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={() => onNavigate('SETTINGS')}
             className="w-12 h-12 bg-white dark:bg-charcoal rounded-full flex items-center justify-center shadow-crextio dark:shadow-crextio-dark hover:rotate-12 transition-all"
           >
             <Settings size={20} className="text-slate-600 dark:text-gold" />
           </button>
           <button 
             onClick={onCreateInvoice}
             className="px-8 py-3 bg-charcoal dark:bg-gold text-white dark:text-charcoal rounded-full font-black uppercase tracking-widest text-[10px] shadow-lg hover:scale-105 transition-all flex items-center gap-2"
           >
             <Plus size={16} /> New Asset
           </button>
        </div>
      </header>

      {showWizard ? (
        /* --- ONBOARDING WIZARD VIEW --- */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 bg-white dark:bg-charcoal p-6 sm:p-12 rounded-[2.5rem] shadow-crextio dark:shadow-crextio-dark border border-white dark:border-slate-800 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                
                <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
                    <div className="w-20 h-20 bg-gold/10 rounded-[2rem] flex items-center justify-center text-gold mb-8 shadow-inner animate-bounce-slow">
                        <Rocket size={40} />
                    </div>
                    <h2 className="text-3xl font-heading font-black text-slate-900 dark:text-white mb-4 leading-tight">
                        🎉 Welcome to Oratore, {userName}!
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mb-10 leading-relaxed">
                        Let's get you set up in 3 minutes. Complete the foundational steps below to unlock your full financial intelligence dashboard.
                    </p>

                    {/* Progress Hub */}
                    <div className="w-full bg-slate-50 dark:bg-charcoal-deep rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 mb-10">
                        <div className="flex justify-between items-end mb-6">
                            <div className="text-left">
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Onboarding Progress</p>
                                <div className="flex gap-1.5">
                                    {onboardingSteps.steps.map((s, i) => (
                                        <div 
                                          key={i} 
                                          className={`w-3 h-3 rounded-full transition-all duration-500 ${s.isComplete ? 'bg-emerald-500 scale-110 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-slate-200 dark:bg-slate-800'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <span className="text-2xl font-heading font-black text-gold">
                                {onboardingSteps.completedCount} <span className="text-slate-300">/ 5</span>
                            </span>
                        </div>

                        {onboardingSteps.nextStep && (
                            <div className="bg-white dark:bg-charcoal p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 text-left animate-slide-up flex items-center gap-6">
                                <div className="p-4 bg-gold/10 text-gold rounded-2xl">
                                    <onboardingSteps.nextStep.icon size={28} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black uppercase text-gold tracking-widest mb-1">Current Objective</p>
                                    <h4 className="text-lg font-heading font-bold text-slate-900 dark:text-white leading-tight">{onboardingSteps.nextStep.label}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">{onboardingSteps.nextStep.description}</p>
                                </div>
                                <button 
                                    onClick={() => onNavigate(onboardingSteps.nextStep!.targetView)}
                                    className="p-4 bg-charcoal dark:bg-gold text-white dark:text-charcoal rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg"
                                >
                                    <ArrowRight size={24} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Step List Preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                        {onboardingSteps.steps.slice(0, 3).map((step, i) => (
                            <div key={i} className={`p-4 rounded-2xl border flex items-center gap-3 transition-colors ${step.isComplete ? 'bg-emerald-50/30 border-emerald-100 dark:border-emerald-900/30' : 'bg-transparent border-slate-100 dark:border-slate-800 opacity-50'}`}>
                                <div className={`p-2 rounded-lg ${step.isComplete ? 'text-emerald-500' : 'text-slate-300'}`}>
                                    {step.isComplete ? <CheckCircle2 size={16}/> : <step.icon size={16}/>}
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-tighter ${step.isComplete ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'}`}>{step.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sidebar Wizard Tips */}
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-charcoal dark:bg-charcoal-deep p-8 rounded-[2.5rem] shadow-crextio text-white relative overflow-hidden border border-white/5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>
                    <h3 className="text-xl font-heading font-black flex items-center gap-2 mb-6">
                        <Sparkles size={20} className="text-indigo-400" /> Pro Insight
                    </h3>
                    <div className="space-y-4">
                        <p className="text-sm text-slate-300 leading-relaxed italic">
                            "Freelancers who customize their branding within the first hour see a 40% increase in professional trust from clients."
                        </p>
                        <div className="h-px bg-white/10 w-full"></div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tip of the day</p>
                        <p className="text-xs text-indigo-100">Try using the "Brand Design" panel in the Invoice Editor to upload your high-res logo.</p>
                    </div>
                </div>
                
                <button 
                  onClick={onOpenTaxCalculator} 
                  className="w-full p-8 bg-white dark:bg-charcoal rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-crextio dark:shadow-crextio-dark flex items-center justify-between group hover:border-gold transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-50 dark:bg-charcoal-deep rounded-xl text-slate-400 group-hover:text-gold transition-colors">
                            <Landmark size={24}/>
                        </div>
                        <div className="text-left">
                            <h4 className="font-heading font-bold text-slate-900 dark:text-white">Tax Readiness</h4>
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">AI Liability Estimation</p>
                        </div>
                    </div>
                    <ArrowRight size={20} className="text-slate-300 group-hover:text-gold transition-colors" />
                </button>
            </div>
        </div>
      ) : (
        /* --- STANDARD DASHBOARD VIEW --- */
        <>
            {/* Primary Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                { label: 'Cleared Revenue', value: stats.totalRevenue, status: 'Paid', color: 'emerald' },
                { label: 'Floating Assets', value: stats.pendingAmount, status: 'Pending', color: 'amber' },
                { label: 'Overdue Claims', value: stats.overdueAmount, status: 'Risk', color: 'red' },
                ].map((item, i) => (
                <div key={i} className="bg-white dark:bg-charcoal p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-crextio dark:shadow-crextio-dark border border-cream-dark/30 dark:border-slate-800 hover:scale-[1.02] transition-transform group">
                    <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl group-hover:rotate-12 transition-transform bg-${item.color}-50 dark:bg-${item.color}-950/30 text-${item.color}-600 dark:text-${item.color}-400`}>
                        {item.status === 'Paid' ? <CheckCircle2 size={24}/> : item.status === 'Pending' ? <Clock size={24}/> : <AlertCircle size={24}/>}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-${item.color}-50 dark:bg-${item.color}-950/30 text-${item.color}-600 dark:text-${item.color}-400`}>{item.status}</span>
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-1">{item.label}</p>
                    <h3 className="text-3xl font-heading font-black text-slate-900 dark:text-white">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: appSettings.defaultCurrency || 'USD' }).format(item.value)}
                    </h3>
                </div>
                ))}

                <div className="bg-charcoal dark:bg-charcoal-deep p-8 rounded-[2.5rem] shadow-crextio dark:shadow-crextio-dark text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-[40px] group-hover:scale-150 transition-transform"></div>
                <div className="relative z-10">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4 flex items-center gap-2">
                    <Zap size={14} className="text-gold" /> Velocity Prediction
                    </p>
                    <h3 className="text-4xl font-heading font-black text-white">{stats.paidPercentage}%</h3>
                    <p className="text-xs text-slate-400 mt-2 font-medium">Payment collection health.</p>
                    <div className="w-full h-1.5 bg-white/10 rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-gold transition-all duration-1000" style={{ width: `${stats.paidPercentage}%` }}></div>
                    </div>
                </div>
                </div>
            </div>

            {/* Visualizations */}
            <div className="grid grid-cols-12 gap-8">
                {/* AI Business Coach Card or Financial Trajectory */}
                <div className="col-span-12 lg:col-span-8 bg-white dark:bg-charcoal rounded-[2.5rem] p-8 shadow-crextio dark:shadow-crextio-dark border border-white dark:border-slate-800 transition-colors relative overflow-hidden">
                {!hasActivity ? (
                  /* --- AI BUSINESS COACH CARD --- */
                  <div className="h-full flex flex-col justify-center animate-fade-in relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-14 h-14 bg-gold rounded-[1.25rem] flex items-center justify-center text-charcoal shadow-glow">
                        <Lightbulb size={32} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-heading font-black text-slate-900 dark:text-white">💡 Today's Insight</h3>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Personalized Strategy</p>
                      </div>
                    </div>
                    
                    <div className="mb-10">
                      <p className="text-2xl font-heading font-bold text-slate-700 dark:text-slate-200 leading-snug italic">
                        "{userName}, {AI_TIPS[tipIndex]}"
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center">
                      <button 
                        onClick={onCreateInvoice}
                        className="px-8 py-3.5 bg-charcoal dark:bg-gold text-white dark:text-charcoal rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                      >
                        Create Invoice Now <ArrowRight size={14} />
                      </button>
                      
                      <button 
                        onClick={handleNextTip}
                        className="p-3.5 text-slate-400 hover:text-gold dark:hover:text-gold transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                      >
                        <RefreshCw size={16} className="animate-spin-once" /> New Tip
                      </button>

                      <button 
                        onClick={() => onNavigate('MARKETPLACE')}
                        className="p-3.5 text-slate-400 hover:text-indigo-500 transition-colors flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                      >
                        <BookOpen size={16} /> Learn More
                      </button>
                    </div>

                    {/* Decorative Background Element */}
                    <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-gold/5 rounded-full blur-[80px] pointer-events-none"></div>
                  </div>
                ) : (
                  /* --- FINANCIAL TRAJECTORY CHART --- */
                  <>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                      <div>
                      <h3 className="text-xl font-heading font-black text-slate-900 dark:text-white flex items-center gap-2">
                          <Activity size={20} className="text-gold" /> Financial Trajectory
                      </h3>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mt-1">Activity Index</p>
                      </div>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weeklyActivity}>
                            <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#F4CE6B" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#F4CE6B" stopOpacity={0}/>
                            </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#2C2C2C" : "#F1F5F9"} />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: isDark ? '#475569' : '#94A3B8'}} dy={10} />
                            <Tooltip 
                            contentStyle={{ 
                                borderRadius: '20px', 
                                border: 'none', 
                                boxShadow: '0 10px 30px rgba(0,0,0,0.1)', 
                                padding: '15px',
                                backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                                color: isDark ? '#FFFFFF' : '#1A1A1A'
                            }}
                            cursor={{ stroke: '#F4CE6B', strokeWidth: 2 }}
                            />
                            <Area type="monotone" dataKey="value" stroke="#F4CE6B" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" animationDuration={2000} />
                        </AreaChart>
                        </ResponsiveContainer>
                    </div>
                  </>
                )}
                </div>

                <div className="col-span-12 lg:col-span-4 bg-charcoal dark:bg-charcoal-deep rounded-[2.5rem] p-8 shadow-crextio text-white relative overflow-hidden flex flex-col justify-between border border-white/5">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold to-transparent"></div>
                <div>
                    <h3 className="text-xl font-heading font-black flex items-center gap-2 mb-2">
                    <Coins size={20} className="text-gold" /> Global Hub
                    </h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Real-time Conversion Intel</p>
                </div>
                <div className="space-y-4 my-8">
                    {MAJOR_CURRENCIES.slice(0, 4).map(curr => (
                        <div key={curr} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gold/10 text-gold rounded-xl flex items-center justify-center font-black text-[10px]">{curr.charAt(0)}</div>
                            <span className="font-bold text-xs">{curr} Index</span>
                        </div>
                        <div className="text-right">
                            <div className="font-black text-sm">{ratesLoading ? '...' : (exchangeRates[curr]?.toFixed(2))}</div>
                            <div className="text-[8px] font-black text-emerald-400 uppercase">Live</div>
                        </div>
                        </div>
                    ))}
                </div>
                <button onClick={onOpenTaxCalculator} className="w-full py-4 bg-gold text-charcoal rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2">
                    <Landmark size={14}/> Tax Intelligence <ArrowRight size={12}/>
                </button>
                </div>
            </div>
        </>
      )}

      <style>{`
        @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
            animation: bounce-slow 3s infinite ease-in-out;
        }
        @keyframes spin-once {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .animate-spin-once {
            animation: spin-once 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;