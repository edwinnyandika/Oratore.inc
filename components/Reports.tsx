
import React from 'react';
import { Invoice, Expense } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie 
} from 'recharts';
import { 
  FileText, TrendingUp, AlertOctagon, Landmark, 
  Users, Wallet, TrendingDown, Sparkles 
} from 'lucide-react';

interface ReportsProps {
  invoices: Invoice[];
  expenses: Expense[];
}

const Reports: React.FC<ReportsProps> = ({ invoices, expenses }) => {
  const paidInvoices = invoices.filter(inv => inv.status === 'Paid');
  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  const totalTax = paidInvoices.reduce((sum, inv) => sum + (inv.taxAmount || 0), 0);
  const netProfit = totalRevenue - totalExpenses - totalTax;

  // Client Revenue Data
  const clientRevenueMap = paidInvoices.reduce((acc, inv) => {
      acc[inv.clientName] = (acc[inv.clientName] || 0) + inv.total;
      return acc;
  }, {} as Record<string, number>);

  const clientData = Object.keys(clientRevenueMap).map(name => ({
      name,
      value: clientRevenueMap[name]
  })).sort((a, b) => b.value - a.value).slice(0, 5);

  const COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-8 animate-slide-up pb-12">
        <div className="border-b border-slate-200/50 pb-6">
            <h2 className="text-4xl font-heading font-bold text-slate-900">Reports & Analytics</h2>
            <p className="text-slate-500 mt-2 text-lg">Financial insights and profitability summary</p>
        </div>

        {/* Global Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
                <h3 className="text-3xl font-heading font-bold text-slate-900">${totalRevenue.toLocaleString()}</h3>
                <div className="mt-2 flex items-center gap-1 text-emerald-500 text-xs font-bold">
                    <TrendingUp size={14}/> Gross Earnings
                </div>
            </div>
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Expenses</p>
                <h3 className="text-3xl font-heading font-bold text-slate-900">${totalExpenses.toLocaleString()}</h3>
                <div className="mt-2 flex items-center gap-1 text-red-500 text-xs font-bold">
                    <TrendingDown size={14}/> Business Costs
                </div>
            </div>
            <div className="glass-panel p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Estimated Tax</p>
                <h3 className="text-3xl font-heading font-bold text-slate-900">${totalTax.toLocaleString()}</h3>
                <div className="mt-2 flex items-center gap-1 text-amber-500 text-xs font-bold">
                    <Landmark size={14}/> Calculated Liability
                </div>
            </div>
            <div className="glass-panel p-6 rounded-3xl border border-brand-primary/10 bg-indigo-50/30 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-brand-primary rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Net Profit</p>
                <h3 className="text-3xl font-heading font-bold text-brand-primary">${netProfit.toLocaleString()}</h3>
                <div className="mt-2 flex items-center gap-1 text-brand-primary text-xs font-bold">
                    <Sparkles size={14}/> Take-home Pay
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Top Clients Chart */}
            <div className="glass-panel p-8 rounded-[2.5rem] flex flex-col bg-white border border-slate-200 shadow-sm lg:col-span-1">
                <h3 className="text-xl font-heading font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Users className="text-blue-500"/> Revenue by Client
                </h3>
                <div className="flex-1 flex items-center justify-center relative min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={clientData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {clientData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(val: number) => `$${val.toLocaleString()}`} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-2 mt-4">
                    {clientData.map((entry, index) => (
                        <div key={entry.name} className="flex justify-between items-center text-xs font-bold text-slate-600 p-2 bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                {entry.name}
                            </div>
                            <span className="text-slate-900">${entry.value.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Profitability Analysis */}
            <div className="glass-panel p-8 rounded-[2.5rem] bg-slate-900 text-white lg:col-span-2 relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-primary rounded-full blur-[100px] opacity-10"></div>
                <h3 className="text-xl font-heading font-bold mb-8 flex items-center gap-2 relative z-10">
                    <Wallet className="text-emerald-400" size={24}/> Cash Flow Insights
                </h3>
                <div className="space-y-8 relative z-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Efficiency Ratio</p>
                             <div className="text-4xl font-heading font-black text-emerald-400">
                                {totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0'}%
                             </div>
                             <p className="text-xs text-slate-300 mt-2">of every dollar earned is pure profit.</p>
                        </div>
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Expense Burden</p>
                             <div className="text-4xl font-heading font-black text-red-400">
                                {totalRevenue > 0 ? ((totalExpenses / totalRevenue) * 100).toFixed(1) : '0.0'}%
                             </div>
                             <p className="text-xs text-slate-300 mt-2">overhead costs relative to revenue.</p>
                        </div>
                    </div>
                    
                    <div className="p-6 bg-indigo-500/10 rounded-3xl border border-brand-primary/20">
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2"><Sparkles size={14} className="text-indigo-400"/> AI Business Health</h4>
                        <p className="text-sm text-indigo-100 leading-relaxed italic">
                            "Based on your current numbers, your profit margins are healthy. Consider reinvesting 15% of your net profit into 'Software' to automate more of your workflow and increase your hourly efficiency."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Reports;
