
import React from 'react';
import { AppSettings, Testimonial } from '../types';
import { Mail, Phone, Globe, Star, MapPin, ExternalLink, Quote, Sparkles } from 'lucide-react';

interface BusinessCardProps {
  settings: AppSettings;
}

const BusinessCard: React.FC<BusinessCardProps> = ({ settings }) => {
  const averageRating = settings.testimonials.length > 0
    ? settings.testimonials.reduce((acc, t) => acc + t.rating, 0) / settings.testimonials.length
    : 5;

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-slide-up">
      <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100 flex flex-col md:flex-row">
        {/* Profile Side */}
        <div className="md:w-1/3 bg-slate-900 text-white p-12 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-brand-secondary"></div>
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-3xl bg-white/10 p-1 ring-4 ring-brand-primary/20">
               <img src={`https://ui-avatars.com/api/?name=${settings.companyName || 'User'}&background=4f46e5&color=fff&size=128`} className="w-full h-full rounded-2xl object-cover" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-xl shadow-lg">
                <Sparkles size={16}/>
            </div>
          </div>
          
          <h2 className="text-2xl font-heading font-black mb-1">{settings.companyName || 'Freelance Studio'}</h2>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-8">Premium Partner</p>
          
          <div className="w-full space-y-4 text-sm text-slate-300">
             <div className="flex items-center gap-3 justify-center"><Mail size={16} className="text-brand-primary"/> {settings.email}</div>
             <div className="flex items-center gap-3 justify-center"><MapPin size={16} className="text-brand-primary"/> {settings.companyAddress || 'Global'}</div>
          </div>

          <div className="mt-auto pt-12 flex items-center gap-2">
             <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < Math.round(averageRating) ? 'currentColor' : 'none'} />)}
             </div>
             <span className="text-xs font-black">{averageRating.toFixed(1)} / 5.0</span>
          </div>
        </div>

        {/* Content Side */}
        <div className="md:w-2/3 p-12 bg-slate-50/50">
           <h3 className="text-2xl font-heading font-bold text-slate-900 mb-8 flex items-center gap-3">
              <Quote size={24} className="text-brand-primary" /> Verified Testimonials
           </h3>

           {settings.testimonials.length === 0 ? (
               <div className="py-20 text-center text-slate-400">
                  <Star size={48} className="mx-auto mb-4 opacity-10" />
                  <p className="font-bold">No testimonials collected yet.</p>
                  <p className="text-sm">Complete an invoice to request your first review!</p>
               </div>
           ) : (
               <div className="grid gap-6">
                  {settings.testimonials.map(t => (
                      <div key={t.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow relative">
                          <div className="flex justify-between items-start mb-4">
                              <div>
                                  <p className="font-bold text-slate-900">{t.clientName}</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.date}</p>
                              </div>
                              <div className="flex text-amber-400">
                                  {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < t.rating ? 'currentColor' : 'none'} />)}
                              </div>
                          </div>
                          <p className="text-slate-600 italic text-sm leading-relaxed">"{t.content}"</p>
                      </div>
                  ))}
               </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default BusinessCard;
