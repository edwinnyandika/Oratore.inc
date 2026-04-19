import React, { useState } from 'react';
import { Project, Client, Invoice, Expense } from '../types';
import { Briefcase, Plus, Calendar, CheckCircle, Clock, AlertCircle, Trash2, ArrowRight, CheckSquare, Square, DollarSign, Tag, X, Sparkles } from 'lucide-react';

interface ProjectsProps {
  projects: Project[];
  clients: Client[];
  invoices: Invoice[];
  expenses: Expense[];
  onAddProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
}

const Projects: React.FC<ProjectsProps> = ({ projects, clients, invoices, expenses, onAddProject, onDeleteProject }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newProject, setNewProject] = useState<Partial<Project>>({ status: 'Active', tags: [] });
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !newProject.tags?.includes(tagInput.trim())) {
      setNewProject({ ...newProject, tags: [...(newProject.tags || []), tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewProject({ ...newProject, tags: newProject.tags?.filter(t => t !== tag) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProject.name && newProject.clientId) {
      onAddProject({
        id: crypto.randomUUID(),
        name: newProject.name,
        clientId: newProject.clientId,
        status: newProject.status as any,
        budget: Number(newProject.budget) || 0,
        deadline: newProject.deadline || '',
        tasks: [],
        tags: newProject.tags || []
      });
      setNewProject({ status: 'Active', tags: [] });
      setTagInput('');
      setIsAdding(false);
    }
  };

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Unknown Client';
  
  const getProjectStats = (projectId: string) => {
      const projectInvoices = invoices.filter(inv => inv.projectId === projectId);
      const invoicedAmount = projectInvoices.reduce((sum, inv) => sum + inv.total, 0);
      const projectExpenses = expenses.filter(exp => exp.projectId === projectId).reduce((sum, exp) => sum + exp.amount, 0);
      const profit = invoicedAmount - projectExpenses;
      
      return { invoicedAmount, projectExpenses, profit, count: projectInvoices.length };
  };

  return (
    <div className="space-y-8 animate-slide-up pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-slate-200/50 pb-6">
        <div>
            <h2 className="text-4xl font-heading font-bold text-slate-900">Projects</h2>
            <p className="text-slate-500 mt-2 text-lg">Manage deliverables and profitability</p>
        </div>
        <button 
            onClick={() => setIsAdding(!isAdding)}
            className="bg-brand-black text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center gap-2"
        >
            {isAdding ? <X size={20} /> : <Plus size={20} />} 
            <span>{isAdding ? 'Cancel' : 'New Project'}</span>
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="glass-panel p-8 rounded-3xl animate-slide-up relative overflow-hidden mb-8 shadow-card-hover bg-white">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
           <h3 className="font-heading font-bold text-xl mb-6 text-slate-900 flex items-center gap-2">
             <Briefcase size={20} className="text-blue-500"/> New Project Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="group">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Project Name</label>
                  <input 
                    required
                    className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-medium"
                    placeholder="e.g. Q4 Marketing Campaign"
                    value={newProject.name || ''}
                    onChange={e => setNewProject({...newProject, name: e.target.value})}
                  />
              </div>
              <div className="group">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Client</label>
                  <select 
                    required
                    className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-medium cursor-pointer"
                    value={newProject.clientId || ''}
                    onChange={e => setNewProject({...newProject, clientId: e.target.value})}
                  >
                      <option value="">Select Client...</option>
                      {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
              </div>
              <div className="group">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Total Budget ($)</label>
                  <input 
                    type="number"
                    className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-medium"
                    placeholder="0.00"
                    value={newProject.budget || ''}
                    onChange={e => setNewProject({...newProject, budget: parseFloat(e.target.value)})}
                  />
              </div>
              <div className="group">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Deadline</label>
                  <input 
                    type="date"
                    className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-medium text-slate-600"
                    value={newProject.deadline || ''}
                    onChange={e => setNewProject({...newProject, deadline: e.target.value})}
                  />
              </div>
              <div className="group md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Project Tags</label>
                  <div className="flex gap-2 mb-3 flex-wrap">
                      {newProject.tags?.map(tag => (
                          <span key={tag} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold flex items-center gap-1.5 border border-indigo-100">
                              {tag} <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-red-500 transition-colors"><X size={12}/></button>
                          </span>
                      ))}
                  </div>
                  <div className="flex gap-2">
                      <div className="relative flex-1">
                          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input 
                              placeholder="Add tag (e.g. Branding, SEO, Q4)"
                              className="w-full pl-10 p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-medium text-sm"
                              value={tagInput}
                              onChange={e => setTagInput(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                          />
                      </div>
                      <button type="button" onClick={handleAddTag} className="px-5 bg-indigo-50 text-brand-primary rounded-xl hover:bg-indigo-100 transition-colors font-bold text-xs uppercase tracking-widest">
                        Add Tag
                      </button>
                  </div>
              </div>
          </div>
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
             <button type="button" onClick={() => setIsAdding(false)} className="px-8 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors">Cancel</button>
             <button type="submit" className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-blue-700 shadow-lg shadow-indigo-200 transition-transform hover:scale-105 flex items-center gap-2">
                <Sparkles size={18}/> Launch Project
             </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map(project => {
              const { invoicedAmount, projectExpenses, profit, count } = getProjectStats(project.id);
              
              return (
                <div key={project.id} className="glass-panel p-6 rounded-3xl hover:shadow-card-hover transition-all hover:-translate-y-1 group relative overflow-hidden flex flex-col bg-white border border-slate-200">
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${project.status === 'Active' ? 'bg-emerald-500' : project.status === 'Completed' ? 'bg-blue-500' : 'bg-amber-500'}`}></div>
                    
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 block">{getClientName(project.clientId)}</span>
                            <h3 className="font-heading font-black text-xl text-slate-900 leading-tight mb-3 group-hover:text-brand-primary transition-colors">{project.name}</h3>
                            <div className="flex gap-1.5 flex-wrap">
                                {project.tags?.map(tag => (
                                    <span key={tag} className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[9px] font-black text-slate-500 uppercase tracking-tighter shadow-sm">{tag}</span>
                                ))}
                            </div>
                        </div>
                        <button onClick={() => onDeleteProject(project.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                            <Trash2 size={18} />
                        </button>
                    </div>

                    <div className="flex gap-2 mb-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-sm ${
                            project.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                            project.status === 'Completed' ? 'bg-indigo-50 text-brand-primary border-indigo-100' : 
                            'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                            {project.status}
                        </span>
                        {project.deadline && (
                            <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-50 text-slate-400 border border-slate-200 flex items-center gap-1 shadow-sm">
                                <Clock size={10} /> {new Date(project.deadline).toLocaleDateString()}
                            </span>
                        )}
                    </div>

                    <div className="space-y-4 mb-4 flex-1">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Invoiced</p>
                                <p className="font-heading font-black text-slate-900 text-lg">${invoicedAmount.toLocaleString()}</p>
                            </div>
                            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Budget</p>
                                <p className="font-heading font-black text-slate-500 text-lg">${project.budget.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center p-4 rounded-2xl border border-emerald-100 bg-emerald-50/20">
                             <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600"><DollarSign size={14}/></div>
                                <span className="text-xs font-black text-emerald-800 uppercase tracking-tighter">Current Yield</span>
                             </div>
                             <span className={`font-mono font-black text-lg ${profit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>${profit.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="mt-2 pt-4 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex -space-x-2">
                           {[1,2,3].map(i => (
                             <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                {String.fromCharCode(64 + i)}
                             </div>
                           ))}
                        </div>
                        <button className="text-brand-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                           Milestones <ArrowRight size={12}/>
                        </button>
                    </div>
                </div>
              );
          })}
          
          {projects.length === 0 && !isAdding && (
               <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 shadow-inner">
                   <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                      <Briefcase className="opacity-20" size={40}/>
                   </div>
                   <h3 className="font-heading font-bold text-2xl text-slate-900 mb-2">No active projects</h3>
                   <p className="text-slate-500 max-w-xs mx-auto mb-8">Structure your freelance work into projects to track total yields and client performance.</p>
                   <button onClick={() => setIsAdding(true)} className="px-8 py-3 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-600 transition-all shadow-lg">Create First Project</button>
               </div>
          )}
      </div>
    </div>
  );
};

export default Projects;