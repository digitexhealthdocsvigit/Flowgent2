
import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured, hasPotentialDnsIssue, activeProjectRef } from '../lib/supabase';
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
  const [debug, setDebug] = useState<{ url: string; ref: string; count: number } | null>(null);
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
      setHasVeoKey(true); // Assume success as per instructions
    }
  };

  const handleLoginSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    setError(null);
    setDebug(null);
    
    // Fallback if environment variables aren't set at all
    if (!isSupabaseConfigured) {
      setTimeout(() => {
        onLogin({
          id: 'demo-user',
          name: email.split('@')[0] || 'Founder',
          email: email,
          role: 'admin',
          orgId: 'org-demo'
        });
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
      console.error("Infrastructure Handshake Failed:", err);
      
      const isDnsError = err.message?.toLowerCase().includes('fetch') || err.name === 'AuthRetryableFetchError' || err.status === 0;
      
      if (isDnsError) {
        setError("Network Path Inaccessible (DNS Resolution Error)");
        setDebug({
          url: (supabase as any).supabaseUrl || "N/A",
          ref: activeProjectRef,
          count: activeProjectRef.length
        });
      } else {
        setError(err.message || "The authentication gateway rejected this request.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmergencyAccess = () => {
    onLogin({
      id: 'founder-emergency-id',
      name: 'Digitex Founder',
      email: 'digitex.studio@gmail.com',
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
              <p className="text-slate-500 font-medium mt-4 leading-relaxed">Check <span className="font-bold text-slate-900">{email}</span>. A single-use authentication link is waiting for you.</p>
           </div>
           <button onClick={() => setIsSent(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Return to Terminal</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030712] px-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-blue-600/10 rounded-full blur-[160px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-900/10 rounded-full blur-[140px]"></div>
      </div>

      <div className="max-w-md w-full bg-white p-12 rounded-[64px] shadow-[0_32px_128px_-12px_rgba(0,0,0,0.5)] relative z-10 border border-white/40 animate-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-3xl mx-auto mb-6 italic shadow-xl shadow-slate-900/30">F</div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">System Access</h2>
          <div className="flex items-center justify-center gap-2 mt-3">
             <div className={`w-2 h-2 rounded-full ${isSupabaseConfigured && !hasPotentialDnsIssue ? 'bg-green-500' : 'bg-orange-500'} animate-pulse`}></div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
               {isSupabaseConfigured ? 'Production Stack' : 'Internal Prototype Mode'}
             </p>
          </div>
        </div>

        <div className="space-y-6">
          {!hasVeoKey && (
            <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl space-y-4">
              <h4 className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Mandatory: Veo Cloud Node Config</h4>
              <p className="text-xs text-blue-800 font-medium leading-relaxed">
                To use video generation (Veo 3.1), you must select a paid API key. 
                <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline ml-1 font-black">Learn more.</a>
              </p>
              <button 
                onClick={handleApiKeySelection}
                className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20"
              >
                Configure Veo API Key
              </button>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Secure Email</label>
              <input 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-6 outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-bold text-slate-900 shadow-inner"
                placeholder="founder@digitex.in"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            {error && (
              <div className="p-6 bg-red-50 border border-red-100 rounded-[32px] space-y-4 animate-in slide-in-from-top-2">
                <div className="flex gap-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="text-red-500 shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <p className="text-xs font-black text-red-700 uppercase tracking-tight leading-tight">{error}</p>
                </div>
                
                {debug && (
                  <div className="bg-white p-5 rounded-2xl border border-red-200/50 space-y-4">
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Project ID</p>
                        <code className="block text-[10px] text-red-800 font-mono break-all p-2 bg-slate-50 rounded-lg">{debug.ref}</code>
                     </div>
                     
                     <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-slate-500 uppercase tracking-tighter">Character Count:</span>
                        <span className={`${debug.count === 20 ? 'text-green-600' : 'text-red-600'} font-black px-2 py-1 rounded-md bg-slate-100`}>
                          {debug.count} / 20
                        </span>
                     </div>

                     <p className="text-[10px] text-slate-600 font-medium leading-relaxed bg-blue-50/50 p-3 rounded-xl border border-blue-100/50">
                       <span className="font-black text-blue-800 mr-1">FIX:</span> 
                       Your Project URL is truncated. Re-copy it from Supabase Settings &gt; API. It must be exactly 20 characters before '.supabase.co'.
                     </p>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-slate-900 text-white font-black py-7 rounded-3xl shadow-2xl hover:bg-slate-800 transition-all uppercase tracking-[0.3em] text-[11px] disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  'Send Identity Link'
                )}
              </button>
              
              {(error || !isSupabaseConfigured) && (
                <button 
                  type="button"
                  onClick={handleEmergencyAccess}
                  className="w-full bg-blue-600 text-white font-black py-6 rounded-3xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 animate-in fade-in duration-500 active:scale-[0.98]"
                >
                  Manual Emergency Override
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-50 text-center">
          <button 
            onClick={onGoBack}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all"
          >
            ← Public Portal
          </button>
        </div>

        <div className="mt-8 flex justify-between items-center px-4">
           <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Build 2.6.5</span>
           <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic">Veo Cloud Enabled</span>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
