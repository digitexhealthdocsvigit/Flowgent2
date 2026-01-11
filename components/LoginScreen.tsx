
import React, { useState } from 'react';

interface LoginScreenProps {
  onLogin: (role: 'admin' | 'client') => void;
  onGoBack: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onGoBack }) => {
  const [email, setEmail] = useState('');

  const handleLoginSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // Logic: Emails containing 'digitex' gain Admin access
    const role = email.toLowerCase().includes('digitex') ? 'admin' : 'client';
    onLogin(role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-6">
      <div className="max-w-md w-full bg-white p-12 rounded-[48px] border border-white/10 shadow-2xl shadow-blue-500/10">
        <div className="text-center mb-12">
          <div className="inline-flex w-20 h-20 bg-blue-600 rounded-[28px] items-center justify-center text-white font-black text-4xl mb-8 shadow-xl shadow-blue-500/20 italic">F</div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Gateway</h2>
          <p className="text-slate-400 font-black uppercase tracking-[0.15em] text-[10px] mt-4 leading-relaxed">
            Authorized Access Only
          </p>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Corporate or Client Email</label>
            <input 
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-3xl p-5 focus:ring-2 focus:ring-blue-600 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-300"
              placeholder="e.g. founder@digitex.in"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <button 
              type="submit"
              className="w-full bg-slate-900 text-white font-black py-6 rounded-3xl shadow-2xl hover:bg-slate-800 transition-all uppercase tracking-[0.2em] text-[10px]"
            >
              Verify Identity & Enter
            </button>

            <div className="relative py-4 flex items-center">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-4 text-[9px] font-black text-slate-300 uppercase tracking-widest">Or Secure Bypass</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            <button 
              type="button"
              onClick={() => onLogin('admin')}
              className="w-full bg-blue-50 text-blue-600 font-black py-5 rounded-3xl border border-blue-100 hover:bg-blue-100 transition-all uppercase tracking-[0.2em] text-[9px]"
            >
              Direct Digitex Founder Login
            </button>
          </div>
          
          <button type="button" onClick={onGoBack} className="w-full text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-slate-900 transition-colors py-2">
            Back to System Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
