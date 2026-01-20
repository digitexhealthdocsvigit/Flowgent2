
import React, { useState, useEffect } from 'react';
import { testInsForgeConnection, activeProjectRef } from '../lib/supabase';

interface SettingsViewProps {
  webhookUrl: string;
  onUpdate: (url: string) => void;
  onTest: () => void;
  activeProjectRef: string;
}

const SettingsView: React.FC<SettingsViewProps> = ({ webhookUrl, onUpdate, onTest }) => {
  const [localUrl, setLocalUrl] = useState(webhookUrl);
  const [dbStatus, setDbStatus] = useState<'testing' | 'ok' | 'error'>('testing');
  const [showMcpGuide, setShowMcpGuide] = useState(true);

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
    alert("Infrastructure Link Persistent.");
  };

  const mcpConfig = JSON.stringify({
    "mcpServers": {
      "insforge": {
        "command": "npx",
        "args": ["-y", "@insforge/mcp@latest"],
        "env": {
          "API_KEY": "ik_2ef615853868d11f26c1b6a8cd7550ad",
          "API_BASE_URL": "https://jsk8snxz.ap-southeast.insforge.app"
        }
      }
    }
  }, null, 2);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter italic uppercase">Platform Architecture</h2>
          <p className="text-slate-500 mt-1 font-bold">Node Management: {activeProjectRef}</p>
        </div>
        <div className="bg-emerald-600/10 text-emerald-400 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest italic border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          MCP v1.2 Ready
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="bg-slate-900 p-12 rounded-[56px] border border-white/5 shadow-2xl space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              </div>
              <h3 className="text-xl font-black text-white italic">Neural Orchestrator</h3>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-2">n8n Gateway URI</label>
                <input 
                  type="text"
                  className="w-full bg-slate-800 border border-white/5 rounded-2xl p-5 font-bold text-blue-400 outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all shadow-inner"
                  value={localUrl}
                  onChange={(e) => setLocalUrl(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={handleSave} className="bg-white text-slate-900 px-6 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95 shadow-xl">Update Link</button>
                <button onClick={onTest} className="bg-blue-600 text-white px-6 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all active:scale-95 shadow-lg">Test Handshake</button>
              </div>
            </div>
          </div>

          <div className="bg-emerald-950/20 p-12 rounded-[56px] text-white border border-emerald-500/10 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
             <div>
                <div className="flex justify-between items-start mb-8">
                  <h3 className="text-xl font-black text-emerald-400 italic leading-none">InsForge <br/> Node Health</h3>
                  <div className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${dbStatus === 'ok' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${dbStatus === 'ok' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                    {dbStatus === 'testing' ? 'Syncing...' : dbStatus === 'ok' ? 'Online' : 'Restricted'}
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">MCP Call Log</span>
                    <span className="text-emerald-500 font-black italic text-xs">Awaiting Activity...</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">DB Persistence</span>
                    <span className="text-white font-mono text-xs italic">Readiness: High</span>
                  </div>
                </div>
             </div>
             <button onClick={checkHealth} className="mt-8 text-[10px] font-black text-emerald-500/50 uppercase tracking-widest hover:text-emerald-400 transition-colors text-left underline italic">Refresh Infrastructure</button>
          </div>
        </div>

        <div className="bg-slate-900/50 p-12 rounded-[56px] border border-white/5 shadow-2xl space-y-8 backdrop-blur-xl">
           <div className="flex justify-between items-center">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M7 7h10"/><path d="M7 12h10"/><path d="M7 17h10"/></svg>
                </div>
                <h3 className="text-xl font-black text-white italic">Founder MCP Setup</h3>
             </div>
             <button 
               onClick={() => setShowMcpGuide(!showMcpGuide)}
               className="text-[10px] font-black uppercase text-emerald-500 hover:text-emerald-400 transition-colors"
             >
               {showMcpGuide ? 'Hide' : 'Reveal'}
             </button>
           </div>

           <div className="space-y-6">
             <p className="text-slate-400 text-sm font-medium leading-relaxed italic">
               Claude Desktop Configuration for project <span className="text-white font-mono">{activeProjectRef.split('-')[0]}</span>.
             </p>
             
             {showMcpGuide && (
               <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                 <div className="bg-black/40 rounded-3xl p-8 space-y-4 border border-white/5">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">JSON Payload (Claude Desktop)</p>
                    <pre className="text-[10px] font-mono text-emerald-300 overflow-x-auto p-4 bg-black/20 rounded-xl custom-scrollbar leading-relaxed">
                      {mcpConfig}
                    </pre>
                    <button 
                      onClick={() => { navigator.clipboard.writeText(mcpConfig); alert("MCP Config Payload Copied."); }}
                      className="w-full bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 font-black py-4 rounded-2xl text-[9px] uppercase tracking-widest transition-all"
                    >
                      Copy Configuration
                    </button>
                 </div>
                 <div className="p-8 bg-slate-900 border border-white/5 rounded-[32px] space-y-6">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Live Handshake Test</h4>
                    <div className="space-y-3 font-mono text-[10px]">
                       <p className="text-slate-400 flex gap-4"><span className="text-emerald-500">PROMPT:</span> "Learn about my InsForge leads via MCP."</p>
                       <p className="text-slate-400 flex gap-4"><span className="text-emerald-500">EXPECTED:</span> Call to fetch-docs on JSK8SNXZ.</p>
                    </div>
                 </div>
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
