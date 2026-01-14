
import React from 'react';
import { AutomationWorkflow } from '../types';

interface AutomationViewProps {
  workflows: AutomationWorkflow[];
  onToggleStatus: (id: string) => void;
  signals?: {id: string, text: string, type: 'tool' | 'webhook', time: string}[];
}

const AutomationView: React.FC<AutomationViewProps> = ({ workflows, onToggleStatus, signals = [] }) => {
  const webhookUrl = "https://n8n.digitex.in/webhook/flowgent-orchestrator";

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    alert("MCP Compliant Endpoint URI copied!");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tighter italic">AI Orchestration Hub</h2>
          <p className="text-slate-700 mt-1 font-medium italic">Gemini Agentic-Tools linked to n8n worker nodes.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white border border-slate-200 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.4)]"></div>
            <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">MCP Handshake: Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#0f172a] rounded-[48px] p-12 text-white shadow-2xl border border-white/5 space-y-8">
           <div className="flex justify-between items-center">
             <h3 className="text-2xl font-black tracking-tight text-blue-400 italic">Titli: n8n Node Config</h3>
             <span className="bg-blue-600/20 text-blue-400 text-[8px] font-black px-3 py-1 rounded-full uppercase italic">Logic Handshake</span>
           </div>
           <div className="space-y-4">
             <p className="text-slate-400 font-medium text-sm leading-relaxed">
               Step 1: Create a <span className="text-white font-bold">Webhook Node</span> in n8n with the URI below.<br/>
               Step 2: Insert a <span className="text-white font-bold">Filter Node</span> (Policy Gate) to check if <code className="text-blue-400">readiness_score > 80</code>.<br/>
               Step 3: Connect to your action tools (WhatsApp, Supabase, or Email).
             </p>
           </div>
           <div className="bg-white/5 border border-white/10 p-6 rounded-2xl font-mono text-[11px] break-all text-blue-300 shadow-inner">
             {webhookUrl}
           </div>
           <button onClick={copyWebhook} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95">Copy Orchestrator URI</button>
        </div>

        <div className="bg-white rounded-[48px] border border-slate-200 p-12 shadow-sm space-y-6">
           <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic">Neural Signal Stream</h3>
           <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
             {signals.length > 0 ? signals.map((log, i) => (
               <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-100 transition-all">
                  <span className="text-xl shrink-0">{log.type === 'tool' ? '🧠' : '📡'}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800 tracking-tight leading-tight">{log.text}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 italic tracking-tighter">{log.time} • Source: {log.type === 'tool' ? 'MCP Tool' : 'Webhook Dispatch'}</p>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
               </div>
             )) : (
               <div className="py-20 text-center opacity-30 italic text-sm">
                 Waiting for autonomous tool calls from Gemini...
               </div>
             )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {workflows.map((wf) => (
          <div key={wf.id} className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6 group hover:border-blue-500 transition-all">
             <div className="flex justify-between items-start">
               <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold shadow-sm">
                 {wf.type.charAt(0).toUpperCase()}
               </div>
               <div className={`w-2.5 h-2.5 rounded-full ${wf.status === 'active' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-slate-300'}`}></div>
             </div>
             <div>
               <h4 className="font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors italic tracking-tight">{wf.name}</h4>
               <div className="flex justify-between items-center mt-3">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Health: {wf.successRate}%</p>
                  <span className="text-[8px] font-black text-blue-600 uppercase tracking-tighter italic">n8n Node</span>
               </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AutomationView;
