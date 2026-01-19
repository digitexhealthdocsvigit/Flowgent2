
import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, activeProjectRef, handleSupabaseError } from '../lib/supabase';
import { User } from '../types';

interface LoginScreenProps {
  onLogin: (user: User) => void;
  onGoBack: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onGoBack }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasVeoKey, setHasVeoKey] = useState(false);

  useEffect(() => {
    const checkApiKey = async () => {
      if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setHasVeoKey(hasKey);
      }
    };
    checkApiKey();
  }, []);

  const handleApiKeySelection = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      setHasVeoKey(true);
    }
  };

  const handleLoginSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin }
      });
      if (error) throw error;
      setIsSent(true);
    } catch (err: any) {
      console.error("Auth Failure:", err);
      setError(handleSupabaseError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmergencyAccess = () => {
    // Directly invoke parent login handler with Founder credentials
    onLogin({
      id: 'founder-emergency-node',
      name: 'Digitex Founder',
      email: email || 'digitex.studio@gmail.com',
      role: 'admin',
      orgId: 'org-1'
    });
  };

  if (isSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712] px-6 text-center">
        <div className="max-w-md w-full bg-white p-12 rounded-[64px] space-y-8 animate-in zoom-in-95 duration-500 shadow-2xl">
           <div className="w-24 h-24 bg-green-50 text-green-600 rounded-[32px] flex items-center justify-center mx-auto border border-green-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
           </div>
           <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Gateway Open</h2>
              <p className="text-slate-500 font-medium mt-4 leading-relaxed">Check <span className="font-bold text-slate-900">{email}</span>. One-time link dispatched.</p>
           </div>
           <button onClick={() => setIsSent(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Return</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030712] px-6 relative overflow-hidden">
      <div className="max-w-md w-full bg-white p-12 rounded-[64px] shadow-2xl relative z-10 border border-white/40 animate-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-3xl mx-auto mb-6 italic">F</div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">System Access</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-2">Production Stack • {activeProjectRef}</p>
        </div>

        <div className="space-y-6">
          {!hasVeoKey && (
            <button onClick={handleApiKeySelection} className="w-full bg-blue-50 border border-blue-100 text-blue-600 font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest">CONFIGURE VEO API KEY</button>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <input 
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-6 outline-none focus:border-blue-600 transition-all font-bold text-slate-900"
              placeholder="founder@digitex.in"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />

            {error && (
              <div className="p-6 bg-red-50 border border-red-100 rounded-[32px] space-y-3">
                <p className="text-[10px] font-black text-red-700 uppercase leading-tight">{error}</p>
                <p className="text-[9px] text-red-500 font-medium italic">Diagnostic: gateway_returned_html_payload</p>
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white font-black py-7 rounded-3xl shadow-2xl uppercase tracking-[0.3em] text-[11px] disabled:opacity-50">
                {isLoading ? 'SYNCING...' : 'SEND IDENTITY LINK'}
              </button>
              <button type="button" onClick={handleEmergencyAccess} className="w-full bg-blue-600 text-white font-black py-6 rounded-3xl shadow-xl uppercase tracking-[0.2em] text-[10px]">
                MANUAL EMERGENCY OVERRIDE
              </button>
            </div>
          </form>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-50 text-center">
          <button onClick={onGoBack} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">← PUBLIC PORTAL</button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
