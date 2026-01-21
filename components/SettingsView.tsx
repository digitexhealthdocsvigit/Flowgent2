
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
  const [apiHealth, setApiHealth] = useState<'testing' | 'ok' | 'error'>('testing');
  const [telemetry, setTelemetry] = useState(getEnvironmentTelemetry());
  const [diagnosticsLog, setDiagnosticsLog] = useState<string[]>([]);
  const [activeSpecTab, setActiveSpecTab] = useState<'status' | 'blueprint'>('status');

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setDbStatus('testing');
    setApiHealth('testing');
    setDiagnosticsLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Probing Flowgent2 Infrastructure...`]);
    
    const dbOk = await testInsForgeConnection();
    if (dbOk === 'schema_error') setDbStatus('schema_error');
    else if (dbOk === true) setDbStatus('ok');
    else setDbStatus('error');

    try {
      const healthRes = await fetch('/api/health');
      if (healthRes.ok) {
        setApiHealth('ok');
        setDiagnosticsLog(prev => [...prev, `[PASS] /api/health detected. Vercel deployment verified.`]);
      } else {
        setApiHealth('error');
        setDiagnosticsLog(prev => [...prev, `[FAIL] /api/health returned ${healthRes.status}. Check Vercel logs.`]);
      }
    } catch (e) {
      setApiHealth('error');
      setDiagnosticsLog(prev => [...prev, `[FAIL] Failed to reach production API endpoints.`]);
    }

    setTelemetry(getEnvironmentTelemetry());
  };

  const handleSave = () => {
    onUpdate(localUrl);
    localStorage.setItem('flowgent_n8n_webhook', localUrl);
    setDiagnosticsLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Orchestrator URI Persistent.`]);
  };

  const checklist = [
    { label: 'Database Node', status: dbStatus === 'ok' ? 'pass' : dbStatus === 'schema_error' ? 'fail' : 'testing', desc: 'JSK8SNXZ Cluster' },
    { label: 'Production API', status: apiHealth === 'ok' ? 'pass' : 'testing', desc: '/api/health handshake' },
    { label: 'Vercel Vars', status: telemetry.SUPABASE_URL ? 'pass' : 'testing', desc: 'NEXT_PUBLIC_ detection' },
    { label: 'Signal Link', status: 'pending', desc: 'n8n Orchestrator Ready' }
  ];

  return (
    <div className="space-y-10 p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Neural Bridge Diagnostics</h2>
          <p className="text-slate-500 font-bold">Flowgent2 × InsForge Production Validation</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setActiveSpecTab(prev => prev === 'status' ? 'blueprint' : 'status')} className="bg-slate-800 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-slate-700 transition-all">
            {activeSpecTab === 'status' ? 'Show n8n Blueprint' : 'Show Status'}
          </button>
          <button onClick={checkHealth} className="bg-blue-600/10 text-blue-400 border border-blue-500/20 px-6 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-blue-600/20 transition-all">Verify Deployment</button>
          <div className="bg-emerald-600/10 text-emerald-400 px-6 py-2 rounded-xl text-[10px] font-black uppercase italic border border-emerald-500/20">
            Readiness: {dbStatus === 'ok' && apiHealth === 'ok' ? '100%' : '75%'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {activeSpecTab === 'status' ? (
          <>
            <div className="space-y-8">
              <div className="bg-slate-900 p-10 rounded-[48px] border border-white/5 space-y-8 relative overflow-hidden group">
                <h3 className="text-xl font-black text-white italic">Cloud Environment Probe</h3>
                <div className="space-y-3">
                  {[
                    { name: 'SUPABASE_URL (Vercel)', active: telemetry.SUPABASE_URL },
                    { name: 'SUPABASE_ANON_KEY (Vercel)', active: telemetry.SUPABASE_ANON_KEY },
                    { name: 'ENVIRONMENT', active: true, val: telemetry.VERCEL_ENV.toUpperCase() },
                    { name: 'API_ENDPOINT', active: apiHealth === 'ok', val: apiHealth === 'ok' ? 'STABLE' : 'PENDING' }
                  ].map((v, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border border-white/5 group-hover:border-blue-500/20 transition-all">
                       <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{v.name}</span>
                       <span className={`text-[8px] font-black px-3 py-1 rounded-md ${v.active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-500'}`}>
                         {v.val || (v.active ? 'DETECTED' : 'MISSING')}
                       </span>
                    </div>
                  ))}
                </div>
                <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl">
                   <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 text-blue-400/60">Connected Cluster</p>
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
               <div className="flex-1 bg-black/40 rounded-3xl p-6 font-mono text-[10px] text-emerald-400 overflow-y-auto mb-8 leading-relaxed custom-scrollbar min-h-[300px]">
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
          </>
        ) : (
          <div className="lg:col-span-2 bg-[#020617] p-12 rounded-[56px] border border-blue-500/20 space-y-8 animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center">
               <h3 className="text-3xl font-black text-blue-500 italic uppercase">n8n Orchestration Blueprint</h3>
               <div className="px-4 py-2 bg-blue-600/10 rounded-xl border border-blue-500/20 text-[10px] font-black text-blue-400">v1.2 MCP Specification</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-white/5 p-6 rounded-[32px] border border-white/5 space-y-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black">1</div>
                  <h4 className="text-white font-black text-xs uppercase italic">Webhook Trigger</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-bold">Listen for POST requests at `/flowgent-orchestrator`. Ensure CORS allows flowgent2.vercel.app.</p>
               </div>
               <div className="bg-white/5 p-6 rounded-[32px] border border-white/5 space-y-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black">2</div>
                  <h4 className="text-white font-black text-xs uppercase italic">Condition Filter</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-bold">Only process if `readiness_score > 80`. Prioritizes high-ticket infrastructure deals.</p>
               </div>
               <div className="bg-white/5 p-6 rounded-[32px] border border-white/5 space-y-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black">3</div>
                  <h4 className="text-white font-black text-xs uppercase italic">Gemini Agent</h4>
                  <p className="text-[10px] text-slate-500 leading-relaxed font-bold">Draft personalized WhatsApp pitch based on `business_name` and `city` data nodes.</p>
               </div>
            </div>

            <div className="p-8 bg-black/50 border border-white/5 rounded-[32px] font-mono text-[11px] text-blue-400/80 leading-relaxed">
               <p className="text-white font-black mb-4">// n8n Webhook Payload Mapping</p>
               <p>{"{"}</p>
               <p className="pl-4">"event": "lead_captured",</p>
               <p className="pl-4">"payload": {"{"}</p>
               <p className="pl-8">"id": "uuid",</p>
               <p className="pl-8">"business_name": "Example Corp",</p>
               <p className="pl-8">"readiness_score": 92,</p>
               <p className="pl-8">"phone": "+91XXXXXXXXXX"</p>
               <p className="pl-4">{"}"}</p>
               <p>{"}"}</p>
            </div>

            <div className="flex gap-4">
               <button onClick={() => window.open('https://n8n.io', '_blank')} className="bg-white text-slate-900 px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all shadow-xl">Launch n8n Cloud</button>
               <button onClick={() => setActiveSpecTab('status')} className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all">Back to Diagnostics</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsView;
