
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
  const [debugInfo, setDebugInfo] = useState<{ url: string; msg: string } | null>(null);

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
        }, 1000);
      }, 500);
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
      
      const isFetchError = err.message?.toLowerCase().includes('fetch') || err.name === 'AuthRetryableFetchError';
      
      if (isFetchError) {
        setError("Network Error: Could not reach Supabase.");
        const activeUrl = (supabase as any).supabaseUrl || "Unknown";
        setDebugInfo({
          url: activeUrl,
          msg: "This is usually caused by a typo in the SUPABASE_URL environment variable. Check for 'oxecok' vs 'oxecol' in your Vercel settings."
        });
      } else {
        setError(err.message || "Failed to send verification link.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBypass = () => {
    onLogin({
      id: 'founder-bypass',
      name: 'Founder',
      email: 'founder@digitex.in',
      role: 'admin',
      orgId: 'org-1'
    });
  };

  if (isSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-6 text-center">
        <div className="max-w-md w-full bg-white p-12 rounded-[56px] space-y-8 animate-in zoom-in-95">
           <div className="w-20 h-20 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
           </div>
           <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Magic Link Sent</h2>
           <p className="text-slate-500 font-medium">Access granted. Please check <span className="font-bold text-slate-900">{email}</span> to continue.</p>
           <button onClick={() => setIsSent(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-6">
      <div className="max-w-md w-full bg-white p-12 rounded-[56px] shadow-2xl animate-in zoom-in-95">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-3xl mx-auto mb-6 italic shadow-xl">F</div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Identity Gateway</h2>
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest mt-2 flex items-center justify-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-green-500' : 'bg-orange-400'} animate-pulse`}></span>
            {isSupabaseConfigured ? 'Production Stack' : 'Internal Demo'}
          </p>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Work Email</label>
            <input 
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 outline-none focus:border-blue-600 transition-all font-bold text-slate-900"
              placeholder="e.g. founder@digitex.in"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-5 bg-red-50 border border-red-100 rounded-2xl space-y-3">
              <p className="text-[10px] font-black text-red-600 uppercase tracking-tight">{error}</p>
              {debugInfo && (
                <div className="bg-white p-3 rounded-lg border border-red-200 overflow-hidden">
                   <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Target URL (Check for typos):</p>
                   <code className="text-[9px] text-red-800 font-mono break-all">{debugInfo.url}</code>
                </div>
              )}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-blue-600 text-white font-black py-6 rounded-2xl shadow-xl uppercase tracking-widest text-xs disabled:opacity-50"
          >
            {isLoading ? 'Sending Link...' : 'Request Access'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
          <button 
            onClick={onGoBack}
            className="w-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
          >
            ← Back to Landing Page
          </button>
          <button 
            onClick={handleBypass}
            className="w-full text-[9px] font-bold text-slate-300 hover:text-blue-400 transition-colors uppercase tracking-tighter"
          >
            Bypass for Internal Demo
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
