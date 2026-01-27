import React, { useState, useEffect } from 'react';
import { SignInButton, SignUpButton, SignedIn, SignedOut, useUser, useAuth } from '@insforge/react';
import { User } from '../types';

interface LoginScreenProps {
  onLogin: (user: User) => void;
  onGoBack: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onGoBack }) => {
  const { user, isLoaded: userLoaded } = useUser();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const [hasVeoKey, setHasVeoKey] = useState(false);

  useEffect(() => {
    // Check if user is authenticated and call onLogin
    if (authLoaded && isSignedIn && user && userLoaded) {
      const userData: User = {
        id: user.id,
        name: user.profile?.name || user.email?.split('@')[0] || 'User',
        email: user.email || '',
        role: 'user',
        orgId: 'org-1'
      };
      onLogin(userData);
    }
  }, [authLoaded, isSignedIn, user, userLoaded, onLogin]);

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030712] px-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] bg-blue-600/10 rounded-full blur-[160px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-900/10 rounded-full blur-[140px]"></div>
      </div>

      <div className="max-w-md w-full bg-white p-12 rounded-[64px] shadow-2xl relative z-10 border border-white/40 animate-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-3xl mx-auto mb-6 italic shadow-xl shadow-slate-900/30">F</div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">System Access</h2>
          <div className="flex items-center justify-center gap-2 mt-3">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
               Node Cluster: InsForge
             </p>
          </div>
        </div>

        <div className="space-y-6">
          {!hasVeoKey && (
            <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl space-y-4">
              <h4 className="text-[10px] font-black text-blue-700 uppercase tracking-widest italic">VEO NODE CONFIG REQUIRED</h4>
              <button onClick={handleApiKeySelection} className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all">CONFIGURE API KEY</button>
            </div>
          )}

          <SignedOut>
            <div className="space-y-4">
              <SignInButton className="w-full bg-slate-900 text-white font-black py-7 rounded-3xl shadow-2xl hover:bg-slate-800 transition-all uppercase tracking-[0.3em] text-[11px]" />
              <SignUpButton className="w-full bg-blue-600 text-white font-black py-6 rounded-3xl shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all uppercase tracking-[0.2em] text-[10px]" />
            </div>
          </SignedOut>

          <SignedIn>
            <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-green-50 text-green-600 rounded-[32px] flex items-center justify-center mx-auto border border-green-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Gateway Open</h2>
              <p className="text-slate-500 font-medium leading-relaxed">Authentication successful. Redirecting...</p>
            </div>
          </SignedIn>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-50 text-center">
          <button onClick={onGoBack} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">← PUBLIC PORTAL</button>
        </div>
        
        <div className="mt-8 flex justify-center">
           <span className="text-[8px] font-black text-slate-200 uppercase tracking-widest italic tracking-tighter">Autonomous Continuity Protocol Active</span>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;