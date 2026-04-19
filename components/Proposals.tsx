import React, { useState } from 'react';
import { Proposal, ProposalStatus, Client } from '../types';
import { FileSignature, Plus, Search, Filter, Trash2, ArrowRight, CheckCircle2, XCircle, Clock, FileText, Sparkles } from 'lucide-react';

interface ProposalsProps {
  proposals: Proposal[];
  clients: Client[];
  onAddProposal: (proposal: Proposal) => void;
  onUpdateStatus: (id: string, status: ProposalStatus) => void;
  onDeleteProposal: (id: string) => void;
  onConvertToInvoice: (proposal: Proposal) => void;
}

const Proposals: React.FC<ProposalsProps> = ({ 
  proposals, 
  clients, 
  onAddProposal, 
  onUpdateStatus, 
  onDeleteProposal, 
  onConvertToInvoice 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<ProposalStatus | 'ALL'>('ALL');

  const filteredProposals = proposals.filter(p => {
    const matchesSearch = p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.proposalNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: ProposalStatus) => {
    switch (status) {
      case ProposalStatus.ACCEPTED:
        return <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-full text-[9px] font-black border border-emerald-100 dark:border-emerald-900/50 uppercase tracking-widest">Accepted</span>;
      case ProposalStatus.SENT:
        return <span className="px-3 py-1 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-full text-[9px] font-black border border-amber-100 dark:border-amber-900/50 uppercase tracking-widest">Sent</span>;
      case ProposalStatus.DECLINED:
        return <span className="px-3 py-1 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-full text-[9px] font-black border border-red-100 dark:border-red-900/50 uppercase tracking-widest">Declined</span>;
      default:
        return <span className="px-3 py-1 bg-slate-50 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 rounded-full text-[9px] font-black border border-slate-200 dark:border-slate-800 uppercase tracking-widest">Draft</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-200/50 dark:border-slate-800 pb-8">
        <div>
          <h2 className="text-4xl font-heading font-black text-slate-900 dark:text-white tracking-tight">Strategy</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Win your next enterprise contract</p>
        </div>
        <button 
          onClick={() => {}}
          className="bg-charcoal dark:bg-gold text-white dark:text-charcoal px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:scale-105 transition-all flex items-center gap-2"
        >
          <Plus size={16} /> New Proposal
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 justify-between items-center">
        <div className="flex gap-2 p-1 bg-white dark:bg-charcoal rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm w-full xl:w-auto overflow-x-auto">
          {['ALL', ...Object.values(ProposalStatus)].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                filterStatus === status 
                ? 'bg-charcoal dark:bg-gold text-white dark:text-charcoal shadow-md' 
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {status === 'ALL' ? 'All Plans' : status}
            </button>
          ))}
        </div>
        
        <div className="relative w-full xl:w-80 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-gold" size={18} />
          <input 
            type="text" 
            placeholder="Search proposals..." 
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-charcoal border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-gold/20 dark:text-white text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredProposals.length === 0 ? (
          <div className="col-span-full py-24 text-center glass-panel rounded-[3rem] bg-white/50 dark:bg-charcoal/50 border-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="relative w-24 h-24 mx-auto mb-6">
                <FileSignature size={64} className="text-slate-200 dark:text-slate-800 absolute inset-0" />
                <Sparkles size={24} className="text-gold absolute -top-2 -right-2 animate-pulse" />
            </div>
            <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest text-xs">Awaiting strategic ventures</p>
          </div>
        ) : (
          filteredProposals.map(proposal => (
            <div key={proposal.id} className="glass-panel p-8 rounded-[2.5rem] bg-white dark:bg-charcoal border border-slate-200 dark:border-slate-800 hover:border-gold/30 transition-all group flex flex-col h-full shadow-crextio dark:shadow-crextio-dark hover:-translate-y-2">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-charcoal-deep flex items-center justify-center text-slate-400 dark:text-slate-600 group-hover:text-gold transition-colors">
                      <FileText size={20} />
                   </div>
                   <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{proposal.proposalNumber}</p>
                      <h3 className="font-heading font-black text-lg text-slate-900 dark:text-white leading-tight">{proposal.clientName}</h3>
                   </div>
                </div>
                {getStatusBadge(proposal.status)}
              </div>

              <div className="space-y-4 mb-8 flex-1">
                <div className="p-4 bg-slate-50 dark:bg-charcoal-deep rounded-2xl border border-slate-100 dark:border-slate-800">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Contract Valuation</p>
                    <p className="text-2xl font-heading font-black text-gold">{proposal.currency} {proposal.total.toLocaleString()}</p>
                </div>
                <div className="flex justify-between items-center px-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expiration</span>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{new Date(proposal.expiryDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                {proposal.status === ProposalStatus.ACCEPTED ? (
                  <button 
                    onClick={() => onConvertToInvoice(proposal)}
                    className="w-full py-4 bg-gold text-charcoal rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
                  >
                    <FileText size={16} /> Deploy to Invoicing
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                   <button className="w-full py-4 bg-charcoal dark:bg-charcoal-light text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                     <FileSignature size={14} /> Review & Negotiate
                   </button>
                )}
                <div className="flex justify-center pt-2">
                    <button 
                      onClick={() => onDeleteProposal(proposal.id)}
                      className="text-slate-400 dark:text-slate-600 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Proposals;