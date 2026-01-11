
import React, { useState } from 'react';

interface LoginScreenProps {
  onLogin: (role: 'admin' | 'client') => void;
  onGoBack: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onGoBack }) => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <div className="max-w-md w-full bg-white p-10 rounded-[40px] border border-slate-200 shadow-2xl shadow-slate-200/50">
        <div className="text-center mb-10">
          <div className="inline-flex w-16 h-16 bg-blue-600 rounded-2xl items-center justify-center text-white font-black text-3xl mb-6 shadow-lg shadow-blue-100">F</div>
          <h2 className="text-3xl font-black text-slate-900">Welcome Back</h2>
          <p className="text-slate-800 font-black uppercase tracking-[0.15em] text-[10px] mt-2">Flowgent™ Core Access</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800">Work Email Address</label>
            <input 
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-900 placeholder:text-slate-500"
              placeholder="name@digitex.in"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <button 
            onClick={() => onLogin(email.includes('digitex') ? 'admin' : 'client')}
            className="w-full bg-slate-900 text-white font-black py-5 rounded-[20px] shadow-xl hover:bg-slate-800 transition-all uppercase tracking-widest text-xs"
          >
            {step === 1 ? 'Send One-Time Access Code' : 'Verify & Enter Dashboard'}
          </button>

          <button onClick={onGoBack} className="w-full text-slate-800 text-xs font-black uppercase tracking-widest hover:text-blue-600 transition-colors py-2">
            Return to Homepage
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
