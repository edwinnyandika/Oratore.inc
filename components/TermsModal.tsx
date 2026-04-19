import React, { useState, useRef, useEffect } from 'react';
import { Shield, Check, X, Lock } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
  mode: 'onboarding' | 'view';
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, onAccept, mode }) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
        if (scrollTop + clientHeight >= scrollHeight - 20) {
          setHasScrolledToBottom(true);
        }
      }
    };

    const ref = contentRef.current;
    if (ref) {
      ref.addEventListener('scroll', handleScroll);
      if (ref.scrollHeight <= ref.clientHeight) {
        setHasScrolledToBottom(true);
      }
    }

    return () => {
      if (ref) ref.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-slide-up relative">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 bg-white/50 backdrop-blur-sm flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-brand-primary/10 rounded-2xl">
                <Shield className="text-brand-primary" size={28} />
            </div>
            <div>
                <h2 className="text-2xl font-heading font-bold text-slate-900">Terms & Conditions</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Last updated: Oct 2023</p>
            </div>
          </div>
          {mode === 'view' && (
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors">
              <X size={24} />
            </button>
          )}
        </div>

        {/* Scrollable Content */}
        <div 
          ref={contentRef}
          className="flex-1 overflow-y-auto p-8 text-sm text-slate-600 leading-7 space-y-6 scroll-smooth"
        >
            {mode === 'onboarding' && (
                <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl mb-6 text-blue-800 flex items-start gap-4 shadow-sm">
                    <Lock size={20} className="mt-1 shrink-0" />
                    <div>
                        <p className="font-bold mb-1">Action Required</p>
                        <p className="text-blue-700/80 leading-snug">Please read our terms completely. You must scroll to the bottom of this document to enable the acceptance button.</p>
                    </div>
                </div>
            )}

            <section>
                <h3 className="text-lg font-bold text-slate-900 mb-2">1. Introduction</h3>
                <p>Welcome to Invoicely. By accessing or using our website and software provided, you agree to be bound by these Terms of Service and our Privacy Policy.</p>
            </section>
            
            <section>
                <h3 className="text-lg font-bold text-slate-900 mb-2">2. Use of Service</h3>
                <p>Invoicely provides invoicing and financial tracking tools for freelancers. You agree to use the Service only for lawful purposes and in accordance with these Terms.</p>
            </section>
            
            <section>
                <h3 className="text-lg font-bold text-slate-900 mb-2">3. User Accounts</h3>
                <p>You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party.</p>
            </section>
            
            <section>
                <h3 className="text-lg font-bold text-slate-900 mb-2">4. Intellectual Property</h3>
                <p>The Service and its original content, features, and functionality are and will remain the exclusive property of Invoicely and its licensors.</p>
            </section>
            
            <section>
                <h3 className="text-lg font-bold text-slate-900 mb-2">5. Limitation of Liability</h3>
                <p>In no event shall Invoicely, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.</p>
            </section>

            <section>
                <h3 className="text-lg font-bold text-slate-900 mb-2">6. Termination</h3>
                <p>We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
            </section>

            <div className="pt-12 pb-4 flex justify-center">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">--- End of Document ---</span>
            </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-4 relative z-10">
            {mode === 'view' ? (
                <button 
                    onClick={onClose}
                    className="px-8 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 font-bold transition-all shadow-lg hover:shadow-xl"
                >
                    Close
                </button>
            ) : (
                <>
                    <button 
                        className="px-6 py-3 text-slate-500 hover:text-slate-900 font-bold hover:bg-slate-100 rounded-2xl transition-colors"
                        onClick={() => alert("You must accept the terms to use the application.")}
                    >
                        Decline
                    </button>
                    <button 
                        onClick={onAccept}
                        disabled={!hasScrolledToBottom}
                        className={`
                            flex items-center gap-2 px-8 py-3 rounded-2xl font-bold transition-all transform
                            ${hasScrolledToBottom 
                                ? 'bg-brand-primary text-white hover:bg-indigo-600 shadow-lg shadow-indigo-200 cursor-pointer hover:scale-105' 
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
                        `}
                        title={!hasScrolledToBottom ? "Please scroll to the bottom of the terms to accept" : ""}
                    >
                        <Check size={20} /> Accept & Continue
                    </button>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default TermsModal;