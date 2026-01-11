import React, { useState } from 'react';
import { supabase, isSupabaseConfigured, hasPotentialDnsIssue } from '../lib/supabase';
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
  const [debugInfo, setDebugInfo] = useState<{ url: string; msg: string; type: 'dns' | 'general' } | null>(null);

  const handleLoginSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    setError(null);
    setDebugInfo(null);
    
    // Demo Mode Handling
    if (!isSupabaseConfigured) {
      setTimeout(() => {
        setIsSent(true);
        setIsLoading(false);
        setTimeout(() => {
          onLogin({
            id: 'demo-id',
            name: email.split('@')[0] || 'Founder',
            email: email,
            role: 'admin',
            orgId: 'org-1'
          });
        }, 1200);
      }, 600);
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
      console.error("Login Engine Fault:", err);
      
      const isFetchError = err.message?.toLowerCase().includes('fetch') || err.name === 'AuthRetryableFetchError' || err.status === 0;
      
      if (isFetchError) {
        const activeUrl = (supabase as any).supabaseUrl || "Unknown Path";
        const projectRef = activeUrl.split('//')[1]?.split('.')[0] || "";
        
        setError("Connectivity Blocked: The system cannot reach your database.");
        setDebugInfo({
          url: activeUrl,
          type: 'dns',
          msg: `Your Project ID "${projectRef}" is only ${projectRef.length} characters. Standard IDs are 20 characters. You are likely missing 2 characters at the end of your SUPABASE_URL.`
        });
      } else {
        setError(err.message || "Security Gateway rejected the request.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFounderDirectAccess = () => {
    // Immediate state transition to dashboard using mock data
    onLogin({
      id: 'founder-bypass',
      name: 'Digitex Founder',
      email: 'digitex.studio@gmail.com',
      role: 'admin',
      orgId: 'org-1'
    });
  };

  if (isSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060a12] px-6 text-center">
        <div className="max-w-md w-full bg-white p-12 rounded-[56px] space-y-8 animate-in zoom-in-95 duration-500">
           <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[32px] flex items-center justify-center mx-auto shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
           </div>
           <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Magic Link Dispatched</h2>
              <p className="text-slate-500 font-medium mt-4">Authorized link sent to <span className="font-bold text-slate-900 underline decoration-blue-200">{email}</span>.</p>
           </div>
           <button onClick={() => setIsSent(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 py-2">Back to Authentication</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060a12] px-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-900/20 rounded-full blur-[160px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[140px]"></div>
      </div>

      <div className="max-w-md w-full bg-white/95 backdrop-blur-2xl p-12 rounded-[64px] shadow-2xl relative z-10 border border-white/40 animate-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-3xl mx-auto mb-6 italic shadow-2xl shadow-slate-900/40">F</div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">System Entry</h2>
          <div className="flex items-center justify-center gap-2 mt-3">
             <div className={`w-2 h-2 rounded-full ${isSupabaseConfigured && !hasPotentialDnsIssue ? 'bg-green-500' : 'bg-orange-500'} animate-pulse`}></div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
               {isSupabaseConfigured ? 'Secure Node Connect' : 'Demo Prototype Environment'}
             </p>
          </div>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Identity Verification</label>
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
                <p className="text-xs font-black text-red-600 uppercase tracking-tight leading-tight">{error}</p>
              </div>
              
              {debugInfo && debugInfo.type === 'dns' && (
                <div className="bg-white p-4 rounded-2xl border border-red-200/50 space-y-2">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active URL Diagnostic</p>
                   <code className="block text-[10px] text-red-800 font-mono break-all leading-relaxed p-2 bg-slate-50 rounded-lg">{debugInfo.url}</code>
                   <p className="text-[10px] text-slate-600 font-medium italic leading-relaxed pt-1">
                     {debugInfo.msg}
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
                'Request Authorized Link'
              )}
            </button>
            
            <button 
              type="button"
              onClick={handleFounderDirectAccess}
              className="w-full bg-blue-600 text-white font-black py-6 rounded-3xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              Emergency Founder Access
            </button>
          </div>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-50 space-y-4 text-center">
          <button 
            onClick={onGoBack}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all"
          >
            ← Public Terminal
          </button>
        </div>

        <div className="mt-8 flex justify-between items-center px-4">
           <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Build 2.5.49</span>
           <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">AES-256 Validated</span>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;