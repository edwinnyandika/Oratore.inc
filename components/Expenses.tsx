
import React, { useState, useRef, useEffect } from 'react';
import { Expense, Project } from '../types';
import { Receipt, Plus, Tag, Calendar, DollarSign, Trash2, ArrowUpRight, Briefcase, Camera, X, RefreshCw, Check, Sparkles, AlertCircle, Filter } from 'lucide-react';
import { extractReceiptData, ExtractedReceipt } from '../services/ocrService';

interface ExpensesProps {
  expenses: Expense[];
  projects: Project[];
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

const Expenses: React.FC<ExpensesProps> = ({ expenses, projects, onAddExpense, onDeleteExpense }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({ date: new Date().toISOString().split('T')[0], category: 'Other' });
  const [filterCategory, setFilterCategory] = useState<string>('All');
  
  // Scanner UI States
  const [showScanner, setShowScanner] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<ExtractedReceipt | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const categories = ['All', 'Software', 'Travel', 'Office', 'Subcontractor', 'Other'];

  const filteredExpenses = expenses.filter(e => 
    filterCategory === 'All' || e.category === filterCategory
  );

  const totalFilteredExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // --- Camera Logic ---
  const startCamera = async () => {
    setScanError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
      }
    } catch (err) {
      setScanError("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsCapturing(false);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const context = canvasRef.current.getContext('2d');
    if (!context) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);
    
    const base64Image = canvasRef.current.toDataURL('image/jpeg', 0.8);
    stopCamera();
    
    setIsProcessing(true);
    const result = await extractReceiptData(base64Image);
    setIsProcessing(false);

    if (result) {
      setScanResult(result);
    } else {
      setScanError("Could not read receipt. Please try again with a clearer photo.");
      startCamera();
    }
  };

  const handleConfirmScan = () => {
    if (scanResult) {
      onAddExpense({
        id: crypto.randomUUID(),
        description: scanResult.merchantName,
        amount: scanResult.amount,
        category: scanResult.category,
        date: scanResult.date,
      });
      setShowScanner(false);
      setScanResult(null);
    }
  };

  // --- Standard Form Handlers ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newExpense.description && newExpense.amount) {
      onAddExpense({
        id: crypto.randomUUID(),
        description: newExpense.description,
        amount: Number(newExpense.amount),
        category: newExpense.category as any,
        date: newExpense.date || new Date().toISOString().split('T')[0],
        projectId: newExpense.projectId
      });
      setNewExpense({ date: new Date().toISOString().split('T')[0], category: 'Other', description: '', amount: 0, projectId: '' });
      setIsAdding(false);
    }
  };

  const getCategoryColor = (category: string) => {
      switch(category) {
          case 'Software': return 'bg-purple-50 text-purple-600 border-purple-100';
          case 'Travel': return 'bg-blue-50 text-blue-600 border-blue-100';
          case 'Office': return 'bg-amber-50 text-amber-600 border-amber-100';
          case 'Subcontractor': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
          default: return 'bg-slate-50 text-slate-600 border-slate-200';
      }
  };

  return (
    <div className="space-y-8 animate-slide-up pb-12">
      {/* Receipt Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-xl p-4 sm:p-8">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl relative animate-slide-up">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 text-brand-primary rounded-xl"><Camera size={20}/></div>
                        <h3 className="font-heading font-bold text-slate-900 text-xl">Receipt Scanner</h3>
                    </div>
                    <button onClick={() => { stopCamera(); setShowScanner(false); setScanResult(null); }} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20}/></button>
                </div>

                <div className="p-8">
                    {!scanResult ? (
                        <div className="relative aspect-[4/3] bg-slate-900 rounded-3xl overflow-hidden shadow-inner group">
                            {isCapturing ? (
                                <>
                                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                                    {/* Scanning HUD */}
                                    <div className="absolute inset-0 border-[20px] border-black/20 pointer-events-none"></div>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="w-64 h-80 border-2 border-white/40 rounded-3xl relative">
                                            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-brand-primary rounded-tl-xl"></div>
                                            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-brand-primary rounded-tr-xl"></div>
                                            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-brand-primary rounded-bl-xl"></div>
                                            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-brand-primary rounded-br-xl"></div>
                                            
                                            {isProcessing && (
                                                <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary/80 shadow-[0_0_15px_#4f46e5] animate-[scan_2s_ease-in-out_infinite]"></div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {!isProcessing && (
                                        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                                            <button 
                                                onClick={capturePhoto}
                                                className="w-20 h-20 bg-white rounded-full p-1 border-4 border-brand-primary/20 hover:scale-105 active:scale-95 transition-all shadow-xl"
                                            >
                                                <div className="w-full h-full bg-white rounded-full border-2 border-brand-primary shadow-inner"></div>
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : !isProcessing && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-white gap-4">
                                    <Camera size={48} className="opacity-20" />
                                    <button onClick={startCamera} className="bg-brand-primary px-8 py-3 rounded-2xl font-bold hover:bg-indigo-600 transition-all">Start Camera</button>
                                </div>
                            )}

                            {isProcessing && (
                                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-4">
                                    <RefreshCw size={40} className="animate-spin text-brand-primary" />
                                    <p className="font-bold text-lg">AI Extracting Data...</p>
                                    <p className="text-slate-300 text-sm">Hold on, we're reading the receipt</p>
                                </div>
                            )}

                            {scanError && (
                                <div className="absolute top-4 left-4 right-4 bg-red-500/90 text-white p-3 rounded-xl flex items-center gap-3 text-sm font-bold">
                                    <AlertCircle size={18}/> {scanError}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6 animate-slide-up">
                            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl text-center">
                                <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg"><Check size={24}/></div>
                                <h4 className="text-emerald-900 font-bold text-lg">Receipt Read Successfully!</h4>
                                <p className="text-emerald-700 text-sm">Please verify the details below.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Merchant</label>
                                    <p className="font-bold text-slate-900">{scanResult.merchantName}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Amount</label>
                                    <p className="font-heading font-bold text-2xl text-brand-primary">${scanResult.amount.toFixed(2)}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Date</label>
                                    <p className="font-bold text-slate-900">{scanResult.date}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Category</label>
                                    <p className="font-bold text-slate-900">{scanResult.category}</p>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button onClick={() => { setScanResult(null); startCamera(); }} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors">Retake Photo</button>
                                <button onClick={handleConfirmScan} className="flex-2 py-4 bg-brand-primary text-white rounded-2xl font-bold hover:bg-indigo-600 shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-[0.98]">Confirm & Add Expense</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <style>{`
                @keyframes scan {
                    0%, 100% { top: 0; }
                    50% { top: 100%; }
                }
            `}</style>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-slate-200/50 pb-6">
        <div>
            <h2 className="text-4xl font-heading font-bold text-slate-900">Expenses</h2>
            <p className="text-slate-500 mt-2 text-lg">Track your business costs</p>
        </div>
        <div className="flex gap-4">
            <div className="bg-white border border-slate-200 px-6 py-2 rounded-2xl flex flex-col items-end shadow-sm hidden md:flex">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Selected Total</span>
                <span className="text-xl font-heading font-bold text-slate-900">${totalFilteredExpenses.toLocaleString()}</span>
            </div>
            <button 
                onClick={() => setShowScanner(true)}
                className="bg-brand-primary text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-lg hover:shadow-indigo-200 flex items-center gap-2 group border border-indigo-400/20"
            >
                <Camera size={20} className="group-hover:rotate-12 transition-transform" /> 
                <span>Scan Receipt</span>
            </button>
            <button 
                onClick={() => setIsAdding(!isAdding)}
                className="bg-brand-black text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
                <Plus size={20} /> 
                <span>Manual Entry</span>
            </button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
            <Filter size={16} className="text-slate-400" />
            <div className="flex gap-2 p-1 bg-white rounded-xl border border-slate-200 shadow-sm w-fit overflow-x-auto">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                            filterCategory === cat ? 'bg-brand-black text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
        </div>

        {isAdding && (
          <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl animate-slide-up border-t-4 border-t-brand-primary">
            <h3 className="font-heading font-bold text-xl mb-6 text-slate-900 flex items-center gap-2">
               <div className="p-2 bg-slate-100 rounded-lg"><Receipt size={20}/></div>
               New Expense Entry
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="md:col-span-2 group">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Description</label>
                  <input 
                      required
                      placeholder="e.g. Adobe Subscription"
                      className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none font-medium"
                      value={newExpense.description || ''}
                      onChange={e => setNewExpense({...newExpense, description: e.target.value})}
                  />
              </div>
              <div className="group">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Amount</label>
                  <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                      <input 
                          required
                          type="number"
                          placeholder="0.00"
                          className="w-full pl-8 p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none font-bold text-slate-900"
                          value={newExpense.amount || ''}
                          onChange={e => setNewExpense({...newExpense, amount: parseFloat(e.target.value)})}
                      />
                  </div>
              </div>
              <div className="group">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Category</label>
                  <select 
                      className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none font-medium cursor-pointer"
                      value={newExpense.category}
                      onChange={e => setNewExpense({...newExpense, category: e.target.value as any})}
                  >
                      {categories.filter(c => c !== 'All').map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                      ))}
                  </select>
              </div>
              <div className="group">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Date</label>
                  <input 
                      type="date"
                      required
                      className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none font-medium text-slate-600"
                      value={newExpense.date}
                      onChange={e => setNewExpense({...newExpense, date: e.target.value})}
                  />
              </div>
              <div className="group md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Project (Optional)</label>
                  <select 
                      className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-brand-primary/20 outline-none font-medium cursor-pointer"
                      value={newExpense.projectId || ''}
                      onChange={e => setNewExpense({...newExpense, projectId: e.target.value})}
                  >
                      <option value="">-- No Project --</option>
                      {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                  </select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
               <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
               <button type="submit" className="px-6 py-2 bg-brand-primary text-white font-bold rounded-xl hover:bg-indigo-600 shadow-lg shadow-indigo-200 transition-transform hover:scale-105">Save Expense</button>
            </div>
          </form>
        )}
      </div>

      <div className="glass-panel rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500">Date</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500">Description</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500">Project</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500">Category</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500">Amount</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-slate-500 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {filteredExpenses.length === 0 ? (
                     <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                            <Receipt className="mx-auto mb-2 opacity-30" size={32} />
                            {filterCategory === 'All' ? 'No expenses recorded yet.' : `No ${filterCategory} expenses found.`}
                        </td>
                    </tr>
                ) : (
                    filteredExpenses.map((expense) => (
                        <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-slate-500">{expense.date}</td>
                            <td className="px-6 py-4 font-bold text-slate-900">{expense.description}</td>
                            <td className="px-6 py-4">
                                {expense.projectId ? (
                                    <span className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                        <Briefcase size={12}/> {projects.find(p => p.id === expense.projectId)?.name}
                                    </span>
                                ) : (
                                    <span className="text-slate-400 text-xs">-</span>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getCategoryColor(expense.category)}`}>
                                    {expense.category}
                                </span>
                            </td>
                            <td className="px-6 py-4 font-mono font-bold text-slate-900">-${expense.amount.toFixed(2)}</td>
                            <td className="px-6 py-4 text-right">
                                <button onClick={() => onDeleteExpense(expense.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                                    <Trash2 size={16} />
                                </button>
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

export default Expenses;
