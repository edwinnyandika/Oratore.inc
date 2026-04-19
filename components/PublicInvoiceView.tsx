import React, { useState, useEffect, useMemo } from 'react';
import { Invoice, InvoiceDesign, DisputeMessage } from '../types';
import { 
  CheckCircle, Clock, ShieldCheck, Download, CreditCard, ChevronLeft, 
  Lock, ArrowRight, ShieldAlert, Globe, Handshake, MessageSquare, Save, 
  X, RefreshCw, Star, Award, CheckCircle2, AlertTriangle, Send, User, Bot, PenTool
} from 'lucide-react';

interface PublicInvoiceViewProps {
  invoice: Invoice;
  onBack: () => void;
  onPayment: () => void;
  onProposeAmount?: (amount: number, note: string) => void;
  onRaiseDispute?: (itemIds: string[], reason: string) => void;
  onSendDisputeMessage?: (message: string) => void;
  onView?: () => void;
  stats?: {
    totalPaid: number;
    avgRating: number;
    countriesServed: number;
  };
}

const LABELS: Record<string, Record<string, string>> = {
  'en-US': {
    invoice: 'INVOICE', billTo: 'BILL TO', date: 'DATE', dueDate: 'DUE DATE', items: 'ITEMS',
    description: 'DESCRIPTION', quantity: 'QTY', rate: 'RATE', amount: 'AMOUNT',
    subtotal: 'SUBTOTAL', tax: 'TAX', total: 'TOTAL DUE', notes: 'NOTES & TERMS',
    signature: 'AUTHORIZED SIGNATURE'
  }
};

const PublicInvoiceView: React.FC<PublicInvoiceViewProps> = ({ 
  invoice, onBack, onPayment, onProposeAmount, onRaiseDispute, onSendDisputeMessage, onView, stats 
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(!invoice.isPasswordProtected);
  const [error, setError] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Dispute UI States
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [selectedDisputeItems, setSelectedDisputeItems] = useState<string[]>([]);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeMsgInput, setDisputeMsgInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Negotiation UI States
  const [showNegotiation, setShowNegotiation] = useState(false);
  const [proposalAmount, setProposalAmount] = useState<string>(invoice.proposedAmount?.toString() || invoice.total.toString());
  const [proposalNote, setProposalNote] = useState(invoice.negotiationNote || '');

  // Automatically track view when unlocked
  useEffect(() => {
    if (isUnlocked && onView) {
      onView();
    }
  }, [isUnlocked, onView]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const isRTL = invoice.language === 'ar-SA';
  const design = invoice.design || { template: 'modern', themeColor: '#4f46e5', font: 'inter', paperSize: 'a4', logoSize: 'md' };
  const labels = useMemo(() => LABELS[invoice.language] || LABELS['en-US'], [invoice.language]);

  const formatMoney = (val: number) => {
    try {
        return new Intl.NumberFormat(invoice.language, { style: 'currency', currency: invoice.currency }).format(val);
    } catch {
        return `${invoice.currency} ${val.toLocaleString()}`;
    }
  };

  const handleUnlock = (e: React.FormEvent) => {
      e.preventDefault();
      if (passwordInput === invoice.password) {
          setIsUnlocked(true);
          setError(false);
      } else {
          setError(true);
          setTimeout(() => setError(false), 2000);
      }
  };

  const submitProposal = async () => {
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    onProposeAmount?.(parseFloat(proposalAmount), proposalNote);
    setIsSubmitting(false);
    setShowNegotiation(false);
  };

  const submitDispute = async () => {
    if (selectedDisputeItems.length === 0 || !disputeReason) return;
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    onRaiseDispute?.(selectedDisputeItems, disputeReason);
    setIsSubmitting(false);
    setShowDisputeModal(false);
    setDisputeReason('');
    setSelectedDisputeItems([]);
  };

  const sendDisputeReply = () => {
    if (!disputeMsgInput.trim()) return;
    onSendDisputeMessage?.(disputeMsgInput);
    setDisputeMsgInput('');
  };

  if (!isUnlocked) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
             <div className="absolute inset-0 opacity-10 pointer-events-none">
                 <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary rounded-full blur-[120px]"></div>
                 <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-secondary rounded-full blur-[120px]"></div>
             </div>
             
             <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl animate-slide-up border border-white/20 relative z-10">
                 <div className="w-20 h-20 bg-indigo-50 text-brand-primary rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <Lock size={40} />
                 </div>
                 
                 <div className="text-center mb-10">
                    <h2 className="text-2xl font-heading font-black text-slate-900 mb-2">Private Document</h2>
                    <p className="text-slate-500 text-sm font-medium">Invoice <b>#{invoice.invoiceNumber}</b> is password protected by {invoice.createdBy || 'the freelancer'}.</p>
                 </div>

                 <form onSubmit={handleUnlock} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Access Key</label>
                        <input 
                            autoFocus
                            type="password"
                            placeholder="Enter password..."
                            className={`w-full p-4 bg-slate-50 border-2 rounded-2xl outline-none font-bold text-center tracking-[0.3em] transition-all ${error ? 'border-red-500 animate-shake bg-red-50' : 'border-slate-100 focus:border-brand-primary'}`}
                            value={passwordInput}
                            onChange={(e) => setPasswordInput(e.target.value)}
                        />
                        {error && (
                            <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest text-center mt-2 flex items-center justify-center gap-1">
                                <ShieldAlert size={12}/> Incorrect Access Key
                            </p>
                        )}
                    </div>
                    
                    <button 
                        type="submit"
                        className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                        Unlock Invoice <ArrowRight size={18} />
                    </button>
                 </form>

                 <div className="mt-12 flex justify-center">
                    <button 
                        onClick={onBack}
                        className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
                    >
                        Cancel Access
                    </button>
                 </div>
             </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 animate-fade-in relative">
        <button 
            onClick={onBack}
            className="fixed top-8 left-8 p-3 bg-white text-slate-900 rounded-full shadow-lg border border-slate-100 hover:scale-110 transition-all z-50 flex items-center gap-2 pr-5 font-bold text-sm no-print"
        >
            <ChevronLeft size={20}/> Back to Workspace
        </button>

        <div className="w-full max-w-4xl mb-8 flex flex-col md:flex-row justify-between items-center gap-6 no-print">
            <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                    <ShieldCheck size={24} />
                 </div>
                 <div>
                    <h2 className="text-xl font-heading font-bold text-slate-900 leading-tight">Secure Payment Gateway</h2>
                    <p className="text-sm text-slate-400 font-medium">Verify your invoice and pay securely.</p>
                 </div>
            </div>
            
            <div className="flex gap-3">
                 {!invoice.dispute?.isDisputed && invoice.negotiationStatus !== 'Accepted' && (
                    <button onClick={() => setShowDisputeModal(true)} className="px-6 py-3 bg-white border border-red-100 text-red-600 rounded-2xl font-bold flex items-center gap-2 hover:bg-red-50 transition-all shadow-sm">
                        <AlertTriangle size={18}/> Dispute
                    </button>
                 )}
                 {invoice.allowNegotiation && invoice.negotiationStatus !== 'Accepted' && !invoice.dispute?.isDisputed && (
                    <button onClick={() => setShowNegotiation(true)} className="px-6 py-3 bg-white border border-indigo-100 text-indigo-600 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-50 transition-all shadow-sm">
                        <Handshake size={18}/> Make an Offer
                    </button>
                 )}
                 <button onClick={onPayment} className="px-8 py-3 bg-brand-black text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                    <CreditCard size={18}/> Pay Now
                 </button>
                 <button onClick={() => window.print()} className="px-3 py-3 bg-slate-200 text-slate-700 rounded-2xl hover:bg-slate-300 transition-all">
                    <Download size={18} />
                 </button>
            </div>
        </div>

        <div 
            className={`bg-white shadow-2xl p-16 relative overflow-hidden ${design.paperSize === 'a4' ? 'sheet-a4' : 'sheet-letter'}`}
            style={{ 
                fontFamily: design.font === 'serif' ? 'Playfair Display' : design.font === 'mono' ? 'JetBrains Mono' : design.font === 'outfit' ? 'Outfit' : 'Inter',
                direction: isRTL ? 'rtl' : 'ltr'
            }}
        >
             {/* Status Badges */}
             {invoice.dispute?.isDisputed && (
                <div className="absolute top-0 right-0 bg-red-500 text-white px-12 py-2 rotate-45 translate-x-12 translate-y-4 font-black text-[10px] uppercase tracking-widest shadow-lg z-50">
                    Dispute Active
                </div>
             )}
             {invoice.negotiationStatus === 'Proposed' && !invoice.dispute?.isDisputed && (
                <div className="absolute top-0 right-0 bg-amber-400 text-amber-950 px-12 py-2 rotate-45 translate-x-12 translate-y-4 font-black text-[10px] uppercase tracking-widest shadow-lg z-50">
                    Proposal Pending
                </div>
             )}

             {/* Header Section mirrored from Editor */}
             {design.template === 'modern' ? (
                <div className={`flex justify-between items-start mb-16 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div>
                        {design.logo ? (
                            <img src={design.logo} className={`mb-6 object-contain ${design.logoSize === 'sm' ? 'h-10' : design.logoSize === 'lg' ? 'h-24' : 'h-16'}`} />
                        ) : (
                            <div className="w-14 h-14 rounded-2xl bg-brand-black flex items-center justify-center text-white font-black text-2xl shadow-lg mb-4">I</div>
                        )}
                        <h2 className="text-xl font-heading font-black tracking-tight text-slate-900">Oratore</h2>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Issued in: {invoice.senderTimezone || 'UTC'}</p>
                    </div>
                    <div className={isRTL ? 'text-left flex-1' : 'text-right flex-1'}>
                        <h1 className="text-7xl font-heading font-black opacity-10 mb-4 tracking-tighter" style={{ color: design.themeColor }}>
                           {labels.invoice}
                        </h1>
                        <div className="bg-slate-50 p-4 rounded-2xl inline-flex items-center border border-slate-100">
                            <span className={`text-xs font-bold text-slate-400 tracking-widest uppercase ${isRTL ? 'ml-3' : 'mr-3'}`}>No.</span>
                            <span className="font-bold text-slate-900 text-xl font-mono">{invoice.invoiceNumber}</span>
                        </div>
                    </div>
                </div>
             ) : design.template === 'classic' ? (
                <div className="mb-16 border-b-4 border-slate-900 pb-8">
                    <div className="flex justify-center mb-8">
                        {design.logo ? <img src={design.logo} className="h-20 object-contain" /> : <h2 className="text-4xl font-serif font-black tracking-widest text-slate-900 uppercase">Oratore</h2>}
                    </div>
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-2xl font-serif font-bold text-slate-900" style={{ color: design.themeColor }}>{labels.invoice}</h1>
                            <p className="text-sm font-bold text-slate-500">#{invoice.invoiceNumber}</p>
                        </div>
                        <div className="text-right text-xs font-medium text-slate-500">
                            <p>Freelancer Network</p>
                            <p>{invoice.senderTimezone}</p>
                        </div>
                    </div>
                </div>
             ) : (
                <div className="mb-16 flex justify-between items-start">
                    <div className="max-w-[200px]">
                        {design.logo && <img src={design.logo} className="h-10 object-contain mb-4" />}
                        <h1 className="text-3xl font-light text-slate-400 tracking-widest uppercase">{labels.invoice}</h1>
                        <p className="text-sm font-bold text-slate-900 mt-2">#{invoice.invoiceNumber}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-lg font-bold text-slate-900">Oratore</h2>
                        <p className="text-xs text-slate-500">{invoice.senderTimezone}</p>
                    </div>
                </div>
             )}

             <div className={`grid grid-cols-2 gap-20 mb-16 ${isRTL ? 'text-right' : ''}`}>
                     <div>
                        <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">{labels.billTo}</label>
                        <p className="text-xl font-bold text-slate-900">{invoice.clientName}</p>
                        <div className="mt-2 text-sm text-slate-500 font-medium leading-relaxed whitespace-pre-wrap">
                            {invoice.clientAddress}
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-8">
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">{labels.date}</label>
                          <p className="font-bold text-slate-700">{invoice.date}</p>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">{labels.dueDate}</label>
                          <p className="font-bold text-slate-700">{invoice.dueDate}</p>
                        </div>
                     </div>
                </div>

                <div className={`mb-12 overflow-hidden ${design.template === 'minimal' ? 'border-t border-b border-slate-100' : 'rounded-3xl border border-slate-100 shadow-sm'}`}>
                    <table className="w-full text-sm">
                        <thead className={`${design.template === 'minimal' ? 'bg-white' : 'bg-slate-50'} text-slate-500 font-bold text-[10px] uppercase tracking-widest`}>
                            <tr className={isRTL ? 'flex-row-reverse' : ''}>
                                <th className={`p-5 pl-8 ${isRTL ? 'text-right pr-8 pl-5' : 'text-left'}`}>{labels.description}</th>
                                <th className={`p-5 w-24 ${isRTL ? 'text-left' : 'text-right'}`}>{labels.quantity}</th>
                                <th className={`p-5 w-32 ${isRTL ? 'text-left' : 'text-right'}`}>{labels.rate}</th>
                                <th className={`p-5 pr-8 w-40 ${isRTL ? 'text-left pl-8 pr-5' : 'text-right'}`}>{labels.amount}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {invoice.items.map((item) => (
                                <tr key={item.id} className={`group relative ${isRTL ? 'flex-row-reverse' : ''} ${invoice.dispute?.disputedItemIds.includes(item.id) ? 'bg-red-50/50' : ''}`}>
                                    <td className={`p-5 pl-8 font-medium text-slate-700 ${isRTL ? 'pr-8 pl-5 text-right' : ''}`}>
                                        {item.description}
                                        {invoice.dispute?.disputedItemIds.includes(item.id) && (
                                            <span className="block text-[9px] font-black text-red-500 uppercase mt-1">Item Flagged</span>
                                        )}
                                    </td>
                                    <td className={`p-5 text-slate-600 ${isRTL ? 'text-left' : 'text-right'}`}>
                                        {item.quantity}
                                    </td>
                                    <td className={`p-5 text-slate-600 ${isRTL ? 'text-left' : 'text-right'}`}>
                                        {formatMoney(item.rate)}
                                    </td>
                                    <td className={`p-5 pr-8 font-bold text-slate-900 ${isRTL ? 'pl-8 pr-5 text-right' : 'text-right'}`}>
                                        {formatMoney(item.amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className={`flex justify-between items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="flex-1 space-y-8">
                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{labels.notes}</p>
                             <p className="text-xs text-slate-600 leading-relaxed italic whitespace-pre-wrap">{invoice.notes || 'Default payment terms apply.'}</p>
                        </div>
                        
                        {(design.signature || design.template === 'classic') && (
                            <div className="mt-8">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{labels.signature}</p>
                                <div className="w-64 h-24 border-b-2 border-slate-200 flex items-center justify-center overflow-hidden">
                                    {design.signature ? <img src={design.signature} className="max-h-full grayscale" /> : <span className="text-slate-200 font-signature text-2xl">Authorized</span>}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={`w-80 space-y-4 ${isRTL ? 'mr-20 ml-0 text-right' : 'ml-20'}`}>
                        <div className="flex justify-between text-sm text-slate-500 font-medium">
                            <span>{labels.subtotal}</span>
                            <span className="text-slate-900 font-bold">{formatMoney(invoice.subtotal)}</span>
                        </div>
                        <div className="flex justify-between items-end border-t-2 border-slate-100 pt-6">
                            <div className="flex flex-col">
                                <span className="text-3xl font-heading font-black">{labels.total}</span>
                            </div>
                            <span className="text-3xl font-heading font-black" style={{ color: design.themeColor }}>{formatMoney(invoice.total)}</span>
                        </div>
                    </div>
                </div>

                {design.customFooter && <div className="mt-16 pt-8 border-t border-slate-100 text-center text-xs text-slate-400 italic">{design.customFooter}</div>}
        </div>

        <div className="mt-12 flex flex-col items-center gap-2 opacity-50 no-print">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-500"/> SSL SECURE PAYMENT SYSTEM
            </p>
            <p className="text-slate-300 text-[9px] font-bold">Oratore Global Verified Professional</p>
        </div>
    </div>
  );
};

export default PublicInvoiceView;