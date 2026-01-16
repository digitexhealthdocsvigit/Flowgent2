
import React, { useState, useEffect } from 'react';
import { testInsForgeConnection } from '../lib/supabase';

interface SettingsViewProps {
  webhookUrl: string;
  onUpdate: (url: string) => void;
  onTest: () => void;
  activeProjectRef: string;
}

const SettingsView: React.FC<SettingsViewProps> = ({ webhookUrl, onUpdate, onTest, activeProjectRef }) => {
  const [localUrl, setLocalUrl] = useState(webhookUrl);
  const [dbStatus, setDbStatus] = useState<'testing' | 'ok' | 'error'>('testing');

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setDbStatus('testing');
    const ok = await testInsForgeConnection();
    setDbStatus(ok ? 'ok' : 'error');
  };

  const handleSave = () => {
    onUpdate(localUrl);
    localStorage.setItem('flowgent_n8n_webhook', localUrl);
    alert("Configuration Persistent: Neural Bridge Updated.");
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 p-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">Infrastructure Config</h2>
          <p className="text-slate-500 mt-1 font-bold">Node Management & Orchestration Protocol</p>
        </div>
        <div className="bg-slate-900 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest italic border border-white/5">Build: v2.8.5-pro</div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 p-12 rounded-[56px] border border-white/5 shadow-2xl space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            </div>
            <h3 className="text-xl font-black text-white italic">n8n Neural Proxy</h3>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-2">Orchestrator Endpoint URI</label>
              <input 
                type="text"
                className="w-full bg-slate-800 border border-white/5 rounded-2xl p-5 font-bold text-white outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all shadow-inner"
                value={localUrl}
                onChange={(e) => setLocalUrl(e.target.value)}
                placeholder="https://n8n.instance.com/webhook/..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={handleSave} className="bg-white text-slate-900 px-6 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95 shadow-xl">Apply Changes</button>
              <button onClick={onTest} className="bg-blue-600 text-white px-6 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all active:scale-95 shadow-lg shadow-blue-600/20">Test Signal</button>
            </div>
          </div>
        </div>

        <div className="bg-[#0f172a] p-12 rounded-[56px] text-white border border-white/5 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
           <div>
              <div className="flex justify-between items-start mb-8">
                <h3 className="text-xl font-black text-blue-400 italic leading-none">InsForge <br/> Gateway</h3>
                <div className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${dbStatus === 'ok' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${dbStatus === 'ok' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  {dbStatus === 'testing' ? 'Syncing...' : dbStatus === 'ok' ? 'Active' : 'Offline'}
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Project Hash</span>
                  <span className="text-white font-mono text-xs">{activeProjectRef}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Security Layer</span>
                  <span className="text-blue-500 font-black italic text-sm">ik_v2_encrypted</span>
                </div>
              </div>
           </div>
           <button onClick={checkHealth} className="mt-8 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors text-left underline">Re-verify Infrastructure</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
