import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ViewState } from '../types';
import { ArrowLeft, Mail, Lock, LogIn, UserPlus, Info, Github, FileText, Mic } from 'lucide-react';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider
} from 'firebase/auth';

interface AuthPageProps {
  onNavigate: (view: ViewState) => void;
  onLoginSuccess: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onNavigate, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onLoginSuccess();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
          // Igore popup closed
      } else {
          setError(err.message || 'Google Auth failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth, provider);
      onLoginSuccess();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
          // Igore popup closed
      } else {
        setError(err.message || 'GitHub Auth failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
      }
      onLoginSuccess();
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
         setError('Email/Password login is not enabled in the Firebase Console. Please enable it in Firebase > Authentication > Sign-in method.');
      } else {
         setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-charcoal-deep flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      <button 
        onClick={() => onNavigate('LANDING')}
        className="absolute top-8 left-8 p-3 bg-white dark:bg-charcoal text-slate-900 dark:text-white rounded-full shadow-lg border border-slate-100 dark:border-white/5 hover:scale-110 transition-all z-50"
      >
        <ArrowLeft size={20} />
      </button>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-charcoal rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-white/5 p-10 relative z-10"
      >
        <div className="text-center mb-10">
          <div className="relative group mx-auto w-fit mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gold flex items-center justify-center text-charcoal shadow-[0_10px_20px_rgba(244,206,107,0.3)] border-2 border-charcoal/10 transition-all duration-500 group-hover:rotate-6">
              <FileText size={32} strokeWidth={2.5} />
            </div>
            <div className="absolute -top-1.5 -right-1.5 w-8 h-8 bg-white dark:bg-charcoal rounded-full flex items-center justify-center border-2 border-gold shadow-lg animate-pulse">
              <Mic size={16} className="text-gold" strokeWidth={3} />
            </div>
          </div>
          <h1 className="text-3xl font-heading font-black text-slate-900 dark:text-white">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            {isLogin ? 'Enter your credentials to access your workspace.' : 'Join the premium operating system for independents.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-2xl flex gap-3 text-red-600 dark:text-red-400 text-sm">
             <Info className="flex-shrink-0 mt-0.5" size={16} />
             <p className="leading-relaxed font-medium">{error}</p>
          </div>
        )}

        <div className="flex gap-4 mb-8">
            <button 
                onClick={handleGoogleLogin} 
                className="flex-1 py-3 px-4 bg-slate-50 dark:bg-charcoal-deep border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-100 dark:hover:bg-charcoal transition-all flex items-center justify-center gap-2 font-bold text-sm"
                type="button"
            >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l2.85-2.22.83-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
            </button>
            <button 
                onClick={handleGithubLogin} 
                className="flex-1 py-3 px-4 bg-slate-50 dark:bg-charcoal-deep border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-100 dark:hover:bg-charcoal transition-all flex items-center justify-center gap-2 font-bold text-sm pt-[2px]"
                type="button"
            >
                <Github size={20} className="text-slate-900 dark:text-white" />
                GitHub
            </button>
        </div>

        <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-slate-200 dark:bg-white/10"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Or continue with email</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-white/10"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Display Name</label>
              <div className="relative">
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-charcoal-deep border-none rounded-2xl font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-gold/30"
                  placeholder="Jane Doe"
                />
                <UserPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Email Address</label>
            <div className="relative">
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-charcoal-deep border-none rounded-2xl font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-gold/30"
                placeholder="hello@example.com"
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Password</label>
            <div className="relative">
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-charcoal-deep border-none rounded-2xl font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-gold/30"
                placeholder="••••••••"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 mt-4 bg-brand-black dark:bg-gold text-white dark:text-brand-black rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:hover:scale-100"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isLogin ? (
              <><LogIn size={18} /> Access Workspace</>
            ) : (
              <><UserPlus size={18} /> Create Account</>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 font-bold text-slate-900 dark:text-white hover:text-gold dark:hover:text-gold transition-colors"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
