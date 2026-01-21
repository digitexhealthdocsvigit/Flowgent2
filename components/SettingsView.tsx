
import React, { useState, useEffect } from 'react';
import { testInsForgeConnection, activeProjectRef, getEnvironmentTelemetry } from '../lib/supabase';

interface SettingsViewProps {
  webhookUrl: string;
  onUpdate: (url: string) => void;
  onTest: () => void;
  activeProjectRef: string;
}

const SettingsView: React.FC<SettingsViewProps> = ({ webhookUrl, onUpdate, onTest }) => {
  const [localUrl, setLocalUrl] = useState(webhookUrl);
  const [dbStatus, setDbStatus] = useState<'testing' | 'ok' | 'error' | 'schema_error'>('testing');
  const [telemetry, setTelemetry] = useState(getEnvironmentTelemetry());
  const [diagnosticsLog, setDiagnosticsLog] = useState<string[]>([]);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setDbStatus('testing');
    setDiagnosticsLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Probing Neural Node JSK8SNXZ...`]);
    
    const status = await testInsForgeConnection();
    
    if (status === 'schema_error') {
      setDbStatus('schema_error');
      setDiagnosticsLog(prev => [...prev, `[FAIL] Schema Error: user_id column reference failed.`]);
    } else if (status === true) {
      setDbStatus('ok');
      setDiagnosticsLog(prev => [...prev, `[PASS] Node ACK Received. Handshake successful.`]);
    } else {
      setDbStatus('error');
      setDiagnosticsLog(prev => [...prev, `[FAIL] Timeout: Could not reach cluster jsk8snxz.`]);
    }
    setTelemetry(getEnvironmentTelemetry());
  };

  const handleSave = () => {
    onUpdate(localUrl);
    localStorage.setItem('flowgent_n8n_webhook', localUrl);
    setDiagnosticsLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Orchestrator URI Persistent.`]);
  };

  const checklist = [
    { label: 'Cloud Connectivity', status: dbStatus === 'ok' ? 'pass' : 'testing', desc: 'lib/supabase.ts ↔ Node' },
    { label: 'Schema Alignment', status: dbStatus === 'schema_error' ? 'fail' : dbStatus === 'ok' ? 'pass' : 'testing', desc: 'user_id detection' },
    { label: 'Production Vercel', status: telemetry.VERCEL_ENV !== 'development' ? 'pass' : 'testing', desc: `Runtime: ${telemetry.VERCEL_ENV}` },
    { label: 'Signal Orchestration', status: 'pending', desc: 'n8n Webhook Signal Ready' }
  ];

  return (
    <div className="space-y-10 p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Neural Bridge Diagnostics</h2>
          <p className="text-slate-500 font-bold">Flowgent × InsForge Verification Document</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={checkHealth} className="bg-blue-600/10 text-blue-400 border border-blue-500/20 px-6 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-blue-600/20 transition-all">Run System Audit</button>
          <div className="bg-emerald-600/10 text-emerald-400 px-6 py-2 rounded-xl text-[10px] font-black uppercase italic border border-emerald-500/20">
            Readiness: {dbStatus === 'ok' ? '100%' : '80%'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="bg-slate-900 p-10 rounded-[48px] border border-white/5 space-y-8 relative overflow-hidden group">
            <h3 className="text-xl font-black text-white italic">Cloud Environment Probe</h3>
            <div className="space-y-3">
              {[
                { name: 'NEXT_PUBLIC_SUPABASE_URL', active: telemetry.SUPABASE_URL },
                { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', active: telemetry.SUPABASE_ANON_KEY },
                { name: 'INSFORGE_URL (Alias)', active: telemetry.INSFORGE_URL },
                { name: 'INSFORGE_KEY (Alias)', active: telemetry.INSFORGE_KEY }
              ].map((v, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 group-hover:border-blue-500/20 transition-all">
                   <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{v.name}</span>
                   <span className={`text-[8px] font-black px-3 py-1 rounded-md ${v.active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-500'}`}>
                     {v.active ? 'DETECTED' : 'MISSING'}
                   </span>
                </div>
              ))}
            </div>
            <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl">
               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Connected Node</p>
               <p className="text-lg font-black text-blue-400 font-mono tracking-tighter">NODE_{telemetry.CONNECTED_ENDPOINT.toUpperCase()}</p>
            </div>
          </div>

          <div className="bg-slate-900 p-10 rounded-[48px] border border-white/5 space-y-6">
            <h3 className="text-xl font-black text-white italic">Signal Gateway</h3>
            <div className="space-y-4">
              <input 
                type="text" 
                className="w-full bg-slate-800 border border-white/5 rounded-2xl p-5 font-bold text-blue-400 outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all shadow-inner"
                value={localUrl}
                onChange={(e) => setLocalUrl(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <button onClick={handleSave} className="bg-white text-slate-900 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95 shadow-xl">Lock URI</button>
                <button onClick={onTest} className="bg-blue-600 text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all active:scale-95 shadow-lg">Ping Webhook</button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-black/40 p-10 rounded-[48px] border border-white/5 flex flex-col backdrop-blur-md">
           <h3 className="text-xl font-black text-white italic mb-6">Neural Handshake Log</h3>
           <div className="flex-1 bg-black/40 rounded-3xl p-6 font-mono text-[10px] text-emerald-400 overflow-y-auto mb-8 leading-relaxed custom-scrollbar">
             {diagnosticsLog.map((log, i) => <p key={i} className="mb-2 opacity-80 font-medium">➜ {log}</p>)}
             {diagnosticsLog.length === 0 && <p className="text-slate-700 italic">No events cached.</p>}
           </div>
           <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic mb-2">Launch Readiness Checklist</h4>
              {checklist.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                   <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${item.status === 'pass' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : item.status === 'fail' ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`}></div>
                      <div>
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">{item.label}</p>
                        <p className="text-[8px] text-slate-500 font-bold uppercase">{item.desc}</p>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
