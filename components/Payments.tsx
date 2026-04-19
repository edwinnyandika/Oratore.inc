
import React, { useState } from 'react';
import { Payment, Invoice, InvoiceStatus, TeamMember } from '../types';
import { CreditCard, Plus, ArrowUpRight, Search, CheckCircle, Wallet, Calendar, AlertCircle, Clock, Users, ArrowRight } from 'lucide-react';

interface PaymentsProps {
  payments: Payment[];
  invoices: Invoice[];
  onAddPayment: (payment: Payment) => void;
}

const Payments: React.FC<PaymentsProps> = ({ payments, invoices, onAddPayment }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newPayment, setNewPayment] = useState<Partial<Payment>>({ date: new Date().toISOString().split('T')[0], method: 'Bank Transfer', status: 'Completed' });

  const totalReceived = payments.filter(p => p.status === 'Completed').reduce((sum, p) => sum + p.amount, 0);
  const pendingPayments = payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + p.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPayment.invoiceId && newPayment.amount) {
      const invoice = invoices.find(i => i.id === newPayment.invoiceId);
      
      // Auto-calculate distribution based on invoice splits
      const distribution = invoice?.revenueSplits?.map(split => ({
          memberName: split.memberName,
          amount: (split.percentage / 100) * (newPayment.amount || 0)
      }));

      onAddPayment({
        id: crypto.randomUUID(),
        invoiceId: newPayment.invoiceId,
        clientName: invoice?.clientName || 'Unknown',
        amount: Number(newPayment.amount),
        date: newPayment.date || new Date().toISOString().split('T')[0],
        method: newPayment.method as any,
        reference: newPayment.reference,
        status: newPayment.status as any,
        distribution
      });
      setNewPayment({ date: new Date().toISOString().split('T')[0], method: 'Bank Transfer', status: 'Completed' });
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-8 animate-slide-up pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-slate-200/50 pb-6">
        <div>
            <h2 className="text-4xl font-heading font-bold text-slate-900">Payments</h2>
            <p className="text-slate-500 mt-2 text-lg">Track income and revenue distribution</p>
        </div>
        <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-brand-black text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
        >
            <Plus size={20} /> Record Payment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6 rounded-3xl flex items-center justify-between border border-emerald-100 bg-emerald-50/30">
              <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Received</p>
                  <h3 className="text-3xl font-heading font-black text-emerald-600">${totalReceived.toLocaleString()}</h3>
              </div>
              <div className="p-4 bg-emerald-100 rounded-2xl text-emerald-600"><CheckCircle size={24}/></div>
          </div>
          <div className="glass-panel p-6 rounded-3xl flex items-center justify-between border border-amber-100 bg-amber-50/30">
              <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Pending Clearance</p>
                  <h3 className="text-3xl font-heading font-black text-amber-500">${pendingPayments.toLocaleString()}</h3>
              </div>
              <div className="p-4 bg-amber-100 rounded-2xl text-amber-600"><AlertCircle size={24}/></div>
          </div>
      </div>

      {/* Add Form */}
      {isAdding && (
        <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl animate-slide-up border-t-4 border-t-brand-primary">
          <h3 className="font-heading font-bold text-xl mb-6 text-slate-900 flex items-center gap-2">
             <div className="p-2 bg-slate-100 rounded-lg"><Wallet size={20}/></div>
             Record Transaction
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Invoice</label>
                <select 
                    required
                    className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none font-medium cursor-pointer"
                    value={newPayment.invoiceId || ''}
                    onChange={e => setNewPayment({...newPayment, invoiceId: e.target.value})}
                >
                    <option value="">Select Invoice...</option>
                    {invoices.map(inv => (
                        <option key={inv.id} value={inv.id}>#{inv.invoiceNumber} - {inv.clientName} (${inv.total})</option>
                    ))}
                </select>
            </div>
            <div className="group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Amount Received</label>
                <input 
                    required
                    type="number"
                    className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none font-medium"
                    placeholder="0.00"
                    value={newPayment.amount || ''}
                    onChange={e => setNewPayment({...newPayment, amount: parseFloat(e.target.value)})}
                />
            </div>
            <div className="group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Payment Method</label>
                <select 
                    className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none font-medium cursor-pointer"
                    value={newPayment.method}
                    onChange={e => setNewPayment({...newPayment, method: e.target.value as any})}
                >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="M-Pesa">M-Pesa</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Cash">Cash</option>
                </select>
            </div>
            <div className="group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Date</label>
                <input 
                    type="date"
                    required
                    className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none font-medium text-slate-600"
                    value={newPayment.date}
                    onChange={e => setNewPayment({...newPayment, date: e.target.value})}
                />
            </div>
            <div className="group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Reference ID (Optional)</label>
                <input 
                    className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none font-medium"
                    placeholder="e.g. Transaction ID"
                    value={newPayment.reference || ''}
                    onChange={e => setNewPayment({...newPayment, reference: e.target.value})}
                />
            </div>
            <div className="group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Status</label>
                <select 
                    className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none font-medium cursor-pointer"
                    value={newPayment.status}
                    onChange={e => setNewPayment({...newPayment, status: e.target.value as any})}
                >
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
             <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
             <button type="submit" className="px-6 py-2 bg-brand-primary text-white font-bold rounded-xl hover:bg-indigo-600 shadow-lg shadow-indigo-200 transition-transform hover:scale-105">Save Payment</button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500">Date</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500">Client / Invoice</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500">Revenue Split</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500">Amount</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500 text-right">Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {payments.length === 0 ? (
                     <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                            <CreditCard className="mx-auto mb-2 opacity-30" size={32} />
                            No payments recorded yet.
                        </td>
                    </tr>
                ) : (
                    payments.map((payment) => (
                        <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-500">{payment.date}</td>
                            <td className="px-6 py-4">
                                <span className="font-bold text-slate-900 block">{payment.clientName}</span>
                                {invoices.find(i => i.id === payment.invoiceId)?.invoiceNumber && (
                                    <span className="text-xs text-slate-400">Inv #{invoices.find(i => i.id === payment.invoiceId)?.invoiceNumber}</span>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                {payment.distribution ? (
                                    <div className="space-y-1">
                                        {payment.distribution.map((d, i) => (
                                            <div key={i} className="flex items-center gap-2 text-[10px] font-bold">
                                                <Users size={10} className="text-indigo-400" />
                                                <span className="text-slate-600">{d.memberName}:</span>
                                                <span className="text-emerald-600">${d.amount.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-xs text-slate-400 italic">Self (100%)</span>
                                )}
                            </td>
                            <td className="px-6 py-4 font-heading font-bold text-slate-900 text-base">
                                <div className="flex flex-col">
                                    <span>${payment.amount.toLocaleString()}</span>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{payment.method}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${payment.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                    {payment.status === 'Completed' ? <CheckCircle size={10}/> : <Clock size={10}/>} {payment.status}
                                </span>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payments;
