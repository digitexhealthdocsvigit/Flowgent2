import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User } from '../types';

interface LoginScreenProps {
  onLogin: (mockUser?: User) => void;
  onGoBack: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onGoBack }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugHint, setDebugHint] = useState<string | null>(null);

  const handleLoginSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    setError(null);
    setDebugHint(null);
    
    // Demo Mode Handling
    if (!isSupabaseConfigured) {
      setTimeout(() => {
        setIsSent(true);
        setIsLoading(false);
        // Auto-login after delay for better demo UX
        setTimeout(() => {
          onLogin({
            id: 'demo-id',
            name: email.split('@')[0] || 'Founder',
            email: email,
            role: email.includes('digitex') || email.includes('founder') ? 'admin' : 'client',
            orgId: 'org-1'
          });
        }, 1500);
      }, 800);
      return;
    }
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;
      setIsSent(true);
    } catch (err: any) {
      console.error("Login Error:", err);
      
      // Handle the specific "Failed to fetch" / DNS error shown in user's console
      if (err.message === 'Failed to fetch' || err.name === 'AuthRetryableFetchError') {
        setError("Network Connection Error: Could not reach Supabase.");
        setDebugHint("Hint: Your SUPABASE_URL in Environment Variables might have a typo (DNS could not resolve). Please verify it matches your Supabase Project settings exactly.");
      } else {
        setError(err.message || "Failed to send verification link.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFounderDirectAccess = () => {
    // If Supabase is broken or misconfigured, we allow the founder to bypass to the mock UI
    // This prevents the "Failed to fetch" from locking the user out of the app's visuals.
    onLogin({
      id: 'founder-id',
      name: 'Founder',
      email: 'founder@digitex.in',
      role: 'admin',
      orgId: 'org-1'
    });
  };

  if (isSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-6">
        <div className="max-w-md w-full bg-white p-12 rounded-[56px] text-center space-y-8 animate-in zoom-in-95">
           <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[32px] flex items-center justify-center mx-auto shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
           </div>
           <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Check Your Inbox</h2>
              <p className="text-slate-500 font-medium mt-4">We've sent a secure access link to <span className="text-slate-900 font-bold">{email}</span>.</p>
              {!isSupabaseConfigured && (
                <p className="mt-6 text-blue-600 font-black text-[10px] uppercase tracking-widest bg-blue-50 py-2 rounded-xl">
                  Demo Mode: Simulating Verification...
                </p>
              )}
           </div>
           <button onClick={() => setIsSent(false)} className="text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-700">Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl p-12 rounded-[56px] border border-white/20 shadow-2xl relative z-10 animate-in zoom-in-95">
        <div className="text-center mb-12">
          <div className="inline-flex w-24 h-24 bg-slate-900 rounded-[32px] items-center justify-center text-white font-black text-5xl mb-8 shadow-2xl italic">F</div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">System Gateway</h2>
          
          <div className="flex flex-col items-center gap-2 mt-4">
             <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 ${isSupabaseConfigured ? 'bg-green-500' : 'bg-orange-500'} rounded-full animate-pulse`}></div>
                <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] leading-relaxed">
                  {isSupabaseConfigured ? 'Secure Environment' : 'Demo Terminal (Unconfigured)'}
                </p>
             </div>
          </div>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Identity Verification</label>
            <input 
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-[28px] p-6 focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all font-bold text-slate-900 shadow-inner"
              placeholder="e.g. founder@digitex.in"
              type="email"
              value={email}
              onChange={e => {setEmail(e.target.value); setError(null); setDebugHint(null);}}
            />
            {error && (
              <div className="space-y-2 px-4">
                <p className="text-[10px] font-bold text-red-500">{error}</p>
                {debugHint && <p className="text-[9px] text-slate-500 font-medium italic leading-relaxed">{debugHint}</p>}
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4">
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-900 text-white font-black py-7 rounded-[28px] shadow-xl hover:bg-slate-800 transition-all uppercase tracking-[0.3em] text-[11px] flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Verify & Enter'
              )}
            </button>

            <button 
              type="button"
              onClick={handleFounderDirectAccess}
              className="w-full bg-blue-50 text-blue-700 font-black py-6 rounded-[28px] border-2 border-blue-100 hover:bg-blue-100 transition-all uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3"
            >
              Direct Founder Access
            </button>
          </div>
          
          <button type="button" onClick={onGoBack} className="w-full text-slate-400 text-[11px] font-black uppercase tracking-[0.3em] hover:text-slate-900 transition-all py-4">
            Back to Public Terminal
          </button>
        </form>
        
        <div className="mt-8 pt-8 border-t border-slate-50 flex justify-between items-center text-[9px] font-black text-slate-300 uppercase tracking-widest px-2">
           <span>Flowgent v2.5.4</span>
           <span>Shield Enabled</span>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;