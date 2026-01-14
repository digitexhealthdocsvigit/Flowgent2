
import React from 'react';
import { AutomationWorkflow } from '../types';

interface AutomationViewProps {
  workflows: AutomationWorkflow[];
  onToggleStatus: (id: string) => void;
}

const AutomationView: React.FC<AutomationViewProps> = ({ workflows, onToggleStatus }) => {
  const webhookUrl = "https://n8n.digitex.in/webhook/flowgent-orchestrator";

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    alert("MCP Compliant Endpoint URI copied!");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tighter">AI Orchestration Hub</h2>
          <p className="text-slate-700 mt-1 font-medium italic">Gemini Agentic-Tools linked to n8n worker nodes.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white border border-slate-200 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">MCP Handshake: Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#0f172a] rounded-[48px] p-12 text-white shadow-2xl border border-white/5 space-y-8">
           <div className="flex justify-between items-center">
             <h3 className="text-2xl font-black tracking-tight text-blue-400">Signal Endpoint</h3>
             <span className="bg-blue-600/20 text-blue-400 text-[8px] font-black px-3 py-1 rounded-full uppercase">Secure Handshake</span>
           </div>
           <p className="text-slate-400 font-medium">This MCP-compliant URI receives autonomous tool calls from the Gemini AI Orchestrator for real-world execution.</p>
           <div className="bg-white/5 border border-white/10 p-6 rounded-2xl font-mono text-[11px] break-all text-blue-300 shadow-inner">
             {webhookUrl}
           </div>
           <button onClick={copyWebhook} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all">Copy MCP URI</button>
        </div>

        <div className="bg-white rounded-[48px] border border-slate-200 p-12 shadow-sm space-y-6">
           <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Live Orchestrator Logs</h3>
           <div className="space-y-4">
             {[
               { icon: '📡', text: 'n8n Webhook Listener: Sync Active', time: 'READY' },
               { icon: '🧠', text: 'Gemini 3 Pro Tool: trigger_n8n_signal loaded', time: 'SYNCED' },
               { icon: '🔒', text: 'MCP Handshake Signature: digitex-2026-v2', time: 'SECURE' },
               { icon: '✓', text: 'Autonomous dispatch gate open', time: 'ACTIVE' }
             ].map((log, i) => (
               <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-blue-100 transition-all">
                  <span className="text-xl shrink-0">{log.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">{log.text}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{log.time}</p>
                  </div>
               </div>
             ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {workflows.map((wf) => (
          <div key={wf.id} className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6 group hover:border-blue-500 transition-all">
             <div className="flex justify-between items-start">
               <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold">
                 {wf.type.charAt(0).toUpperCase()}
               </div>
               <div className={`w-2.5 h-2.5 rounded-full ${wf.status === 'active' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-slate-300'}`}></div>
             </div>
             <div>
               <h4 className="font-bold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{wf.name}</h4>
               <div className="flex justify-between items-center mt-3">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Efficiency: {wf.successRate}%</p>
                  <span className="text-[8px] font-black text-blue-600 uppercase tracking-tighter">n8n Node</span>
               </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AutomationView;
