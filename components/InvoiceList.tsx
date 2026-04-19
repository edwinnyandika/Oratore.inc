import React, { useState } from 'react';
import { Invoice, InvoiceStatus } from '../types';
import { Edit, Trash2, Search, FileText, CheckCircle, Clock, AlertTriangle, ExternalLink } from 'lucide-react';

interface InvoiceListProps {
  invoices: Invoice[];
  onEdit: (invoice: Invoice) => void;
  onDuplicate: (invoice: Invoice) => void;
  onDelete: (id: string) => void;
  onTrackView: (id: string) => void;
  onUpdateNegotiation?: (id: string, status: 'Accepted' | 'Declined') => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({ invoices, onEdit, onDelete, onTrackView }) => {
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredInvoices = invoices.filter(inv => {
    const matchesStatus = filterStatus === 'ALL' || inv.status === filterStatus;
    const matchesSearch = inv.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: InvoiceStatus) => {
    let colorClass = '';
    let Icon = Clock;
    switch (status) {
      case InvoiceStatus.PAID: 
        colorClass = 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50'; 
        Icon = CheckCircle;
        break;
      case InvoiceStatus.PENDING: 
        colorClass = 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50'; 
        Icon = Clock;
        break;
      case InvoiceStatus.OVERDUE: 
        colorClass = 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50'; 
        Icon = AlertTriangle;
        break;
      default: 
        colorClass = 'bg-slate-50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800';
        Icon = FileText;
    }
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${colorClass}`}>
            <Icon size={10} strokeWidth={3} />
            {status}
        </span>
    );
  };

  return (
    <div className="space-y-6 animate-slide-up">
        <div className="flex flex-col xl:flex-row gap-4 justify-between items-center">
            <div className="flex gap-2 p-1 bg-white dark:bg-charcoal rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto transition-colors">
                {['ALL', ...Object.values(InvoiceStatus)].map((status) => (
                    <button key={status} onClick={() => setFilterStatus(status as any)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === status ? 'bg-charcoal dark:bg-gold text-white dark:text-charcoal' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>{status}</button>
                ))}
            </div>
            <div className="relative w-full xl:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Search archive..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white dark:bg-charcoal border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-gold/20 transition-all dark:text-white text-sm" />
            </div>
        </div>

        <div className="glass-panel rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-xl bg-white dark:bg-charcoal transition-colors">
            <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-sm min-w-[700px] md:min-w-0">
                    <thead className="bg-slate-50/80 dark:bg-charcoal-deep/50 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                        <th className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-slate-400">Identity</th>
                        <th className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-slate-400">Counterparty</th>
                        <th className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-slate-400">Valuation</th>
                        <th className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-slate-400">Status</th>
                        <th className="px-8 py-5 font-black text-[10px] uppercase tracking-widest text-slate-400 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredInvoices.length === 0 ? (
                        <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs opacity-50">No documents found</td></tr>
                    ) : (
                        filteredInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors group">
                            <td className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-slate-100 dark:bg-charcoal-deep rounded-xl text-slate-400 group-hover:text-gold transition-all"><FileText size={18}/></div>
                                    <div>
                                        <p className="font-black text-slate-900 dark:text-white font-mono">#{inv.invoiceNumber}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{inv.date}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-8 py-6 font-bold text-slate-700 dark:text-slate-300">{inv.clientName}</td>
                            <td className="px-8 py-6 font-black text-slate-900 dark:text-white text-lg">${inv.total.toLocaleString()}</td>
                            <td className="px-8 py-6">{getStatusBadge(inv.status)}</td>
                            <td className="px-8 py-6 text-right">
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => onTrackView(inv.id)} className="p-2 text-slate-400 hover:text-gold transition-colors"><ExternalLink size={18}/></button>
                                    <button onClick={() => onEdit(inv)} className="p-2 text-slate-400 hover:text-indigo-500 transition-colors"><Edit size={18}/></button>
                                    <button onClick={() => onDelete(inv.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                                </div>
                            </td>
                        </tr>
                        ))
                    )}
                </tbody>
            </table>
          </div>
        </div>
    </div>
  );
};

export default InvoiceList;