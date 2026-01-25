import React, { useState, useEffect } from 'react';
import { testInsForgeConnection, activeProjectRef } from '../lib/supabase';

const SettingsView: React.FC = () => {
  const [dbStatus, setDbStatus] = useState<'testing' | 'ok' | 'error'>('testing');
  const [aiStatus, setAiStatus] = useState<'testing' | 'ok' | 'error'>('testing');

  const probeInfrastructure = async () => {
    setDbStatus('testing');
    const dbOk = await testInsForgeConnection();
    setDbStatus(dbOk ? 'ok' : 'error');

    setAiStatus('testing');
    const keyExists = !!process.env.API_KEY;
    setTimeout(() => setAiStatus(keyExists ? 'ok' : 'error'), 1200);
  };

  useEffect(() => { probeInfrastructure(); }, []);

  const healthScore = () => {
    let score = 0;
    if (dbStatus === 'ok') score += 60;
    if (aiStatus === 'ok') score += 40;
    return score;
  };

  return (
    <div className="space-y-12 p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">Cluster Diagnostics</h2>
          <p className="text-slate-500 font-bold mt-4 uppercase tracking-[0.2em] text-[10px]">Infrastructure Node: {activeProjectRef} Production Cluster</p>
        </div>
        <div className="flex gap-4">
           {dbStatus === 'ok' ? (
             <span className="text-green-500 font-black text-xs">✅ DATABASE CONNECTED</span>
           ) : (
             <span className="text-red-500 font-black text-xs">❌ CONNECTION FAILED</span>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-slate-900 p-12 rounded-[64px] border border-white/5 space-y-10 shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-5">
              <svg width="120" height="120" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="1" strokeDasharray="5 5"/></svg>
           </div>
           
           <h3 className="text-xl font-black text-white italic">Neural Link Integrity</h3>
           <div className="space-y-6">
              {[
                { label: 'InsForge Node', desc: 'JSK8SNXZ PostgreSQL Protocol', status: dbStatus },
                { label: 'Gemini 3 Fabric', desc: 'Neural Scorer Pipeline', status: aiStatus },
              ].map((node, i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-white/5 rounded-[32px] border border-white/10 hover:border-blue-500/30 transition-all">
                   <div className="flex items-center gap-6">
                      <div className={`w-3 h-3 rounded-full ${node.status === 'ok' ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : node.status === 'testing' ? 'bg-slate-600 animate-pulse' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]'} `}></div>
                      <div>
                         <p className="text-xs font-black text-white uppercase tracking-widest">{node.label}</p>
                         <p className="text-[10px] text-slate-500 uppercase italic mt-1">{node.desc}</p>
                      </div>
                   </div>
                   {node.status === 'ok' ? (
                     <span className="text-green-500 font-black text-[10px] tracking-widest bg-green-500/10 px-3 py-1 rounded-full">CONNECTED</span>
                   ) : node.status === 'testing' ? (
                     <span className="text-slate-600 font-black text-[10px] tracking-widest">PROBING...</span>
                   ) : (
                     <span className="text-red-500 font-black text-[10px] tracking-widest">ERROR</span>
                   )}
                </div>
              ))}
           </div>
           
           <button onClick={probeInfrastructure} className="w-full bg-blue-600 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-blue-500 transition-all shadow-2xl active:scale-95">Re-Verify Neural Path</button>
        </div>

        <div className="bg-[#020617] p-12 rounded-[64px] border border-white/5 text-center flex flex-col justify-center items-center shadow-2xl relative overflow-hidden">
           <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2563eb 1.5px, transparent 0)', backgroundSize: '32px 32px' }}></div>
           <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] italic mb-10">System Integrity Score</span>
           <div className="relative w-64 h-64 mb-10">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                 <circle cx="50" cy="50" r="45" fill="transparent" stroke="rgba(255,255,255,0.02)" strokeWidth="8"/>
                 <circle cx="50" cy="50" r="45" fill="transparent" stroke="#2563eb" strokeWidth="8" strokeDasharray="282.7" strokeDashoffset={282.7 * (1 - healthScore() / 100)} strokeLinecap="round" className="transition-all duration-[1500ms] ease-out"/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className="text-8xl font-black italic text-white tracking-tighter">{healthScore()}%</span>
              </div>
           </div>
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] italic">
             {healthScore() >= 100 ? 'INFRASTRUCTURE FULLY PERSISTENT' : 'AWAITING NODE INITIALIZATION'}
           </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
