
import React from 'react';
import { AutomationWorkflow } from '../types';

interface AutomationViewProps {
  workflows: AutomationWorkflow[];
  onToggleStatus: (id: string) => void;
  signals?: {id: string, text: string, type: 'tool' | 'webhook', time: string}[];
}

const AutomationView: React.FC<AutomationViewProps> = ({ workflows, onToggleStatus, signals = [] }) => {
  const webhookUrl = "https://n8n-production-ecc4.up.railway.app/webhook-test/flowgent-orchestrator";

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    alert("MCP Compliant Endpoint URI copied!");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center px-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic leading-none">Neural Orchestrator</h2>
          <p className="text-slate-500 mt-2 font-medium italic">Agentic-Tools linked to InsForge Node JSK8SNXZ.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white border border-slate-200 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.4)]"></div>
            <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">MCP PROXY: ONLINE</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-[#0f172a] rounded-[64px] p-16 text-white shadow-2xl border border-white/5 space-y-10 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg width="150" height="150" viewBox="0 0 100 100"><circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="2" strokeDasharray="10 10"/></svg>
           </div>
           
           <div className="relative z-10 space-y-10">
             <div className="flex justify-between items-center">
               <div className="space-y-1">
                 <h3 className="text-3xl font-black tracking-tight text-blue-400 italic leading-none">n8n Worker Node</h3>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">External Orchestration Layer</p>
               </div>
               <span className="bg-blue-600/20 text-blue-400 text-[9px] font-black px-4 py-1.5 rounded-full uppercase italic tracking-widest border border-blue-500/20">Active Link</span>
             </div>
             
             <div className="space-y-6">
               <div className="p-8 bg-white/5 rounded-[40px] border border-white/10 space-y-4">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Instructions</h4>
                 <div className="space-y-3">
                   <p className="text-slate-300 font-bold text-xs flex gap-3"><span className="text-blue-500">01</span> Webhook Trigger (POST)</p>
                   <p className="text-slate-300 font-bold text-xs flex gap-3"><span className="text-blue-500">02</span> Filter: readiness_score &gt; 80</p>
                   <p className="text-slate-300 font-bold text-xs flex gap-3"><span className="text-blue-500">03</span> Provision: WhatsApp / CRM Sync</p>
                 </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic ml-4">Production Endpoint</label>
                  <div className="bg-black/40 border border-white/10 p-8 rounded-[32px] font-mono text-[10px] break-all text-blue-400 shadow-inner group-hover:border-blue-500/40 transition-all leading-relaxed italic">
                    {webhookUrl}
                  </div>
               </div>
             </div>
             
             <button onClick={copyWebhook} className="w-full bg-blue-600 text-white font-black py-7 rounded-[32px] text-xs uppercase tracking-widest shadow-xl shadow-blue-600/30 hover:bg-blue-500 transition-all active:scale-95">Copy Orchestrator URI</button>
           </div>
        </div>

        <div className="bg-white rounded-[64px] border border-slate-200 p-16 shadow-sm flex flex-col justify-between">
           <div className="space-y-6">
             <div className="flex justify-between items-center">
               <h3 className="text-2xl font-black text-slate-900 italic tracking-tighter">Agent Zero</h3>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                 <span className="text-[9px] font-black uppercase text-blue-500">Polling</span>
               </div>
             </div>
             <p className="text-xs text-slate-500 font-medium leading-relaxed">
               Autonomous node performing background enrichment, scraping, and AI scoring for every incoming lead.
             </p>
             <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
               <div className="flex justify-between items-center">
                 <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Scraping Logic</span>
                 <span className="text-[8px] font-black text-green-600 uppercase">Enabled</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">AI Scoring</span>
                 <span className="text-[8px] font-black text-green-600 uppercase">Active</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Webhook Trigger</span>
                 <span className="text-[8px] font-black text-blue-600 uppercase">Persistent</span>
               </div>
             </div>
           </div>
           <button className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-widest mt-8">View Node Logs</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4 mt-8">
        {workflows.map((wf) => (
          <div key={wf.id} className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm space-y-8 group hover:border-blue-600 transition-all hover:shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
             <div className="flex justify-between items-start">
               <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-xl italic">
                 {wf.type.charAt(0).toUpperCase()}
               </div>
               <div className={`w-3 h-3 rounded-full ${wf.status === 'active' ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-slate-300'}`}></div>
             </div>
             <div>
               <h4 className="font-black text-slate-900 text-xl leading-tight italic tracking-tighter group-hover:text-blue-600 transition-colors">{wf.name}</h4>
               <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Efficiency</p>
                    <p className="font-black text-slate-900 text-sm italic">{wf.successRate}%</p>
                  </div>
                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter italic bg-blue-50 px-3 py-1 rounded-full border border-blue-100">Ready</span>
               </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AutomationView;
