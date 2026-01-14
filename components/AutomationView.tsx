
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
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tighter italic leading-none">AI Orchestration Hub</h2>
          <p className="text-slate-700 mt-2 font-medium italic">Gemini Agentic-Tools linked to n8n worker nodes.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white border border-slate-200 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.4)]"></div>
            <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">MCP Handshake: Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#0f172a] rounded-[48px] p-12 text-white shadow-2xl border border-white/5 space-y-8 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg width="100" height="100" viewBox="0 0 100 100"><circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="2" strokeDasharray="10 10"/></svg>
           </div>
           
           <div className="relative z-10 space-y-8">
             <div className="flex justify-between items-center">
               <h3 className="text-2xl font-black tracking-tight text-blue-400 italic">Titli: n8n Node Config</h3>
               <span className="bg-blue-600/20 text-blue-400 text-[8px] font-black px-3 py-1 rounded-full uppercase italic tracking-widest">Infrastructure Link</span>
             </div>
             
             <div className="space-y-4">
               <p className="text-slate-400 font-medium text-sm leading-relaxed">
                 <span className="text-white font-bold block mb-1">Worker Setup Protocol:</span>
                 1. Set up a <span className="text-white font-bold">Webhook Node</span> in n8n (POST method).<br/>
                 2. Add an <span className="text-white font-bold">IF Node</span> to enforce the <code className="text-blue-400">readiness_score &gt; 80</code> policy gate.<br/>
                 3. Connect to your automation toolset (WhatsApp Business, CRM, or SMTP).
               </p>
             </div>

             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Production Orchestrator URI</label>
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl font-mono text-[11px] break-all text-blue-300 shadow-inner group-hover:border-blue-500/30 transition-all">
                  {webhookUrl}
                </div>
             </div>
             
             <button onClick={copyWebhook} className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-95">Copy MCP Endpoint</button>
           </div>
        </div>

        <div className="bg-white rounded-[48px] border border-slate-200 p-12 shadow-sm space-y-6 flex flex-col">
           <h3 className="text-2xl font-black text-slate-900 tracking-tighter italic">Infrastructure Signal Log</h3>
           <div className="space-y-4 flex-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
             {signals.length > 0 ? signals.map((log, i) => (
               <div key={i} className="flex items-center gap-4 p-5 bg-slate-50 rounded-[28px] border border-slate-100 group hover:bg-white hover:border-blue-100 transition-all hover:shadow-lg">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${log.type === 'tool' ? 'bg-blue-50' : 'bg-slate-100'}`}>
                    {log.type === 'tool' ? '🧠' : '📡'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800 tracking-tight leading-tight">{log.text}</p>
                    <div className="flex items-center gap-2 mt-2">
                       <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${log.type === 'tool' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                          {log.type === 'tool' ? 'Neural Dispatch' : 'Infrastructure ACK'}
                       </span>
                       <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic tracking-tighter">{log.time}</span>
                    </div>
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
               </div>
             )) : (
               <div className="py-24 text-center">
                 <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                    <span className="text-2xl opacity-20">📡</span>
                 </div>
                 <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] italic">Monitoring for AI handshakes...</p>
               </div>
             )}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {workflows.map((wf) => (
          <div key={wf.id} className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6 group hover:border-blue-500 transition-all hover:shadow-xl">
             <div className="flex justify-between items-start">
               <div className="w-12 h-12 bg-slate-50 text-slate-900 rounded-2xl flex items-center justify-center font-bold shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all">
                 {wf.type.charAt(0).toUpperCase()}
               </div>
               <div className={`w-2.5 h-2.5 rounded-full ${wf.status === 'active' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-slate-300'}`}></div>
             </div>
             <div>
               <h4 className="font-black text-slate-900 leading-tight italic tracking-tight group-hover:text-blue-600 transition-colors">{wf.name}</h4>
               <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-50">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Efficiency: {wf.successRate}%</p>
                  <span className="text-[8px] font-black text-blue-600 uppercase tracking-tighter italic tracking-tight">n8n Node</span>
               </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AutomationView;
