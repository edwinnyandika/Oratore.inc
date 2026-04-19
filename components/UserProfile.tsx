import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Camera, Mail, User, MapPin, Calendar, CheckCircle2, Shield, Upload } from 'lucide-react';
import { auth } from '../firebase';
import { updateProfile } from 'firebase/auth';

const UserProfile: React.FC = () => {
  const user = auth.currentUser;
  
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdate = async () => {
    if (!user) return;
    setLoading(true);
    setMessage(null);
    try {
      await updateProfile(user, {
        displayName: displayName,
        photoURL: photoURL
      });
      setMessage('Profile updated successfully.');
      setIsEditing(false);
    } catch (error: any) {
      setMessage(`Error updating profile: ${error.message}`);
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoURL(reader.result as string);
        setIsEditing(true); // Trigger edit mode so they can save
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) {
    return <div className="p-12 text-center font-bold text-slate-500">Not authenticated.</div>;
  }

  const joinDate = user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric'
  }) : 'Unknown';

  const lastSignIn = user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString(undefined, {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  }) : 'Unknown';

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 animate-fade-in pb-32">
      <div className="mb-8 border-b border-slate-200 dark:border-slate-800 pb-6 flex justify-between items-end">
        <div>
           <h1 className="text-4xl font-heading font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
             <User className="text-gold" size={32} /> Identity Profile
           </h1>
           <p className="text-slate-500 font-medium mt-2">Manage your core Oratore account details.</p>
        </div>
        <button 
          onClick={isEditing ? handleUpdate : () => setIsEditing(true)}
          disabled={loading}
          className={`px-6 py-2.5 rounded-full font-bold shadow-sm transition-all text-sm flex items-center gap-2 ${
            isEditing 
              ? 'bg-gold text-brand-black hover:scale-105 active:scale-95'
              : 'bg-white dark:bg-charcoal text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 hover:bg-slate-50'
          }`}
        >
          {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold rounded-2xl flex items-center gap-2 text-sm border border-emerald-100 dark:border-emerald-900/50"
        >
          <CheckCircle2 size={16} /> {message}
        </motion.div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white dark:bg-charcoal rounded-[2rem] p-8 shadow-xl border border-slate-100 dark:border-white/5 text-center relative overflow-hidden group">
            {/* Background blur */}
            <div 
              className="absolute inset-0 opacity-20 blur-2xl scale-150 rounded-full" 
              style={{ backgroundImage: `url(${photoURL})`, backgroundSize: 'cover' }} 
            />
            
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
            
            <div className="relative z-10">
              <div 
                className="w-32 h-32 mx-auto rounded-[2rem] bg-slate-100 dark:bg-charcoal-deep mb-6 overflow-hidden shadow-inner border-4 border-white dark:border-charcoal relative cursor-pointer group/avatar"
                onClick={() => isEditing && fileInputRef.current?.click()}
              >
                {photoURL ? (
                  <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-black text-slate-300">
                    {(displayName || user.email || 'O')[0].toUpperCase()}
                  </div>
                )}
                
                {isEditing && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                    <Camera className="text-white" size={24} />
                  </div>
                )}
              </div>
              
              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">
                {displayName || 'Anonymous User'}
              </h2>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-charcoal-deep border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-500">
                 <Shield size={12} className="text-emerald-500" />
                 Verified Account
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-charcoal rounded-[2rem] p-8 shadow-xl border border-slate-100 dark:border-white/5 space-y-6">
             <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Display Name</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    disabled={!isEditing}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-charcoal-deep border-none rounded-2xl font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-gold/30 disabled:opacity-70 disabled:cursor-not-allowed"
                    placeholder="Your Name"
                  />
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>
             </div>
             
             <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Email Address (Managed by Provider)</label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={user.email || ''}
                    disabled
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-charcoal-deep border-none rounded-2xl font-bold text-slate-400 outline-none cursor-not-allowed opacity-70"
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>
             </div>
          </div>

          <div className="bg-white dark:bg-charcoal rounded-[2rem] p-8 shadow-xl border border-slate-100 dark:border-white/5">
             <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white mb-6">Account Meta</h3>
             <div className="grid grid-cols-2 gap-6">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1"><Calendar size={12}/> Member Since</p>
                   <p className="font-bold text-slate-900 dark:text-white text-sm">{joinDate}</p>
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1"><MapPin size={12}/> Last Login</p>
                   <p className="font-bold text-slate-900 dark:text-white text-sm">{lastSignIn}</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
