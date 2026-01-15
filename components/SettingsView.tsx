
import React, { useState } from 'react';

interface SettingsViewProps {
  webhookUrl: string;
  onUpdate: (url: string) => void;
  onTest: () => void;
  activeProjectRef: string;
}

const SettingsView: React.FC<SettingsViewProps> = ({ webhookUrl, onUpdate, onTest, activeProjectRef }) => {
  const [localUrl, setLocalUrl] = useState(webhookUrl);

  const handleSave = () => {
    onUpdate(localUrl);
    localStorage.setItem('flowgent_n8n_webhook', localUrl);
    alert("System Architecture Updated: Neural Bridge Active.");
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic uppercase">System Architecture</h2>
        <div className="bg-slate-900 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest italic">Build: v2.8.2-stable</div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-12 rounded-[56px] border border-slate-200 shadow-sm space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 italic">n8n Orchestrator Bridge</h3>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Production Webhook URI</label>
              <input 
                type="text"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
                value={localUrl}
                onChange={(e) => setLocalUrl(e.target.value)}
                placeholder="https://n8n.your-domain.com/webhook/..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={handleSave} className="bg-slate-900 text-white px-6 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95">Save Config</button>
              <button onClick={onTest} className="bg-blue-600 text-white px-6 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl active:scale-95">Test Signal</button>
            </div>
          </div>
        </div>

        <div className="bg-[#0f172a] p-12 rounded-[56px] text-white shadow-2xl flex flex-col justify-between relative overflow-hidden">
           <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-blue-600/10 rounded-full blur-3xl"></div>
           <div>
              <h3 className="text-xl font-black text-blue-400 italic mb-8">InsForge Node: {activeProjectRef}</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Platform</span>
                  <span className="text-blue-500 font-black italic text-sm">InsForge Core</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Handshake</span>
                  <span className="text-green-500 font-black italic text-sm">Synchronized</span>
                </div>
              </div>
           </div>
           <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600 mt-12">Infrastructure Managed by Digitex Studio</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
