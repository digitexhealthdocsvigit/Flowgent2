
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

interface LoginScreenProps {
  onLogin: () => void;
  onGoBack: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onGoBack }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + '/dashboard',
        },
      });

      if (error) throw error;
      setIsSent(true);
    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.message || "Failed to send verification link.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFounderDirectAccess = async () => {
    // For local development or emergency founder access, 
    // we use a predefined identity if the env allows it.
    // In production, this would trigger the normal OTP flow.
    setEmail('founder@digitex.in');
    handleLoginSubmit();
  };

  if (isSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-6">
        <div className="max-w-md w-full bg-white/95 backdrop-blur-xl p-12 rounded-[56px] text-center space-y-8 animate-in zoom-in-95 duration-500">
           <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[32px] flex items-center justify-center mx-auto shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
           </div>
           <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Check Your Inbox</h2>
              <p className="text-slate-500 font-medium mt-4">We've sent a secure access link to <span className="text-slate-900 font-bold">{email}</span>.</p>
           </div>
           <button onClick={() => setIsSent(false)} className="text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-700">Change Email</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-6 relative overflow-hidden">
      {/* Background patterns for "Security" feel */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl p-12 rounded-[56px] border border-white/20 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative z-10 animate-in zoom-in-95 duration-500">
        <div className="text-center mb-12">
          <div className="inline-flex w-24 h-24 bg-slate-900 rounded-[32px] items-center justify-center text-white font-black text-5xl mb-8 shadow-2xl relative group overflow-hidden">
            <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="relative z-10 italic">F</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">System Gateway</h2>
          <div className="flex items-center justify-center gap-2 mt-4">
             <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
             <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] leading-relaxed">
               Secure Environment Active
             </p>
          </div>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-8">
          <div className="space-y-3">
            <div className="flex justify-between items-end px-1">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Identity Verification</label>
               {isLoading && <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest animate-pulse">Validating Identity...</span>}
            </div>
            <input 
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-[28px] p-6 focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300 shadow-inner"
              placeholder="e.g. founder@digitex.in"
              type="email"
              value={email}
              onChange={e => {setEmail(e.target.value); setError(null);}}
            />
            {error && <p className="text-[10px] font-bold text-red-500 px-4">{error}</p>}
          </div>

          <div className="space-y-4 pt-4">
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white font-black py-7 rounded-[28px] shadow-[0_20px_40px_-10px_rgba(15,23,42,0.3)] hover:bg-slate-800 hover:translate-y-[-2px] active:translate-y-[1px] transition-all uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Authenticating...
                </>
              ) : (
                'Verify Identity & Enter'
              )}
            </button>

            <div className="relative py-6 flex items-center">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Or Secure Bypass</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            <button 
              type="button"
              onClick={handleFounderDirectAccess}
              className="w-full bg-blue-50 text-blue-700 font-black py-6 rounded-[28px] border-2 border-blue-100 hover:bg-blue-100 hover:border-blue-200 transition-all uppercase tracking-[0.2em] text-[10px] shadow-sm flex items-center justify-center gap-3 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Direct Founder Access
            </button>
          </div>
          
          <button type="button" onClick={onGoBack} className="w-full text-slate-400 text-[11px] font-black uppercase tracking-[0.3em] hover:text-slate-900 transition-all py-4 hover:tracking-[0.4em]">
            Back to Public Terminal
          </button>
        </form>
        
        <div className="mt-8 pt-8 border-t border-slate-50 flex justify-between items-center text-[9px] font-black text-slate-300 uppercase tracking-widest px-2">
           <span>Flowgent v2.5.4</span>
           <span>Digitex Shield Enabled</span>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
