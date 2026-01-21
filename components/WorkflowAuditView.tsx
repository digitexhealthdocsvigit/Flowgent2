
import React from 'react';

interface NodeAnalysis {
  name: string;
  role: string;
  relevance: 'Critical' | 'High' | 'Operational';
  status: 'Healthy' | 'Warning' | 'Standby';
  description: string;
  load: string;
}

const WorkflowAuditView: React.FC = () => {
  const nodePool: NodeAnalysis[] = [
    { name: 'MCP Webhook', role: 'Ingestion', relevance: 'Critical', status: 'Healthy', load: '0.02ms', description: 'Primary gateway for Flowgent2 signals. Handles 0x82 node handshakes.' },
    { name: 'ROI Policy Gate', role: 'Governance', relevance: 'High', status: 'Healthy', load: '12ms', description: 'Filters leads by Est. Contract Value > 50k to protect AI token budget.' },
    { name: 'SERP Grounding', role: 'Verification', relevance: 'High', status: 'Healthy', load: '1.2s', description: 'Cross-references Maps data with live Google Search results for validity.' },
    { name: 'Neural Scorer', role: 'Intelligence', relevance: 'Critical', status: 'Healthy', load: '2.4s', description: 'Gemini-powered engine calculating business readiness and gap analysis.' },
    { name: 'Pitch Generator', role: 'Agentic', relevance: 'High', status: 'Standby', load: '3.1s', description: 'Drafts personalized WhatsApp/Email payloads for hot opportunities.' },
    { name: 'DB Persist', role: 'Persistence', relevance: 'Critical', status: 'Healthy', load: '45ms', description: 'Final sync back to InsForge JSK8SNXZ cluster.' }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex justify-between items-end px-4">
        <div>
          <h2 className="text-5xl font-black text-white tracking-tighter italic uppercase leading-none">Workflow Audit</h2>
          <p className="text-slate-500 mt-4 font-bold text-lg">Detailed Assessment of n8n Orchestrator Node Relevance.</p>
        </div>
        <div className="bg-blue-600/10 text-blue-400 px-6 py-2 rounded-xl border border-blue-500/20 text-[10px] font-black uppercase italic">
          Audit Phase: v1.2.4
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900 rounded-[56px] border border-white/5 p-12 shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <svg width="200" height="200" viewBox="0 0 100 100"><circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="2" strokeDasharray="10 10"/></svg>
            </div>
            
            <h3 className="text-2xl font-black text-white mb-10 italic">Node Relevance Matrix</h3>
            
            <div className="space-y-4">
              {nodePool.map((node, i) => (
                <div key={i} className="flex items-center gap-6 p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all group/node">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black italic text-sm ${node.relevance === 'Critical' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {node.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-black text-white text-md tracking-tight group-hover/node:text-blue-400 transition-colors">{node.name}</h4>
                      <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${node.relevance === 'Critical' ? 'bg-blue-500/10 text-blue-500' : 'bg-slate-800 text-slate-500'}`}>
                        {node.relevance}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed">{node.description}</p>
                  </div>
                  <div className="text-right space-y-1 min-w-[80px]">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none">Latency</p>
                    <p className="text-sm font-black text-emerald-400 font-mono italic">{node.load}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-600 p-12 rounded-[56px] text-white shadow-2xl shadow-blue-600/20 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
             <div className="relative z-10">
               <h4 className="text-3xl font-black italic tracking-tighter mb-4">Architect Assessment</h4>
               <p className="text-blue-100 font-bold text-sm leading-relaxed max-w-xl">
                 Your n8n workflow is exceptionally well-structured. The inclusion of the "ROI Policy Gate" is the mark of a production-ready system. It protects your infrastructure from low-value data noise.
               </p>
               <div className="mt-8 flex gap-4">
                  <div className="px-6 py-2 bg-white/10 rounded-xl border border-white/20 text-[10px] font-black uppercase italic">Grounding: ✅ Pass</div>
                  <div className="px-6 py-2 bg-white/10 rounded-xl border border-white/20 text-[10px] font-black uppercase italic">Scalability: ✅ High</div>
               </div>
             </div>
          </div>
        </div>

        <div className="space-y-8 h-fit sticky top-24">
           <div className="bg-[#020617] p-12 rounded-[56px] border border-white/5 text-center space-y-8">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] italic">Orchestration Health</span>
              <div className="relative w-48 h-48 mx-auto">
                 <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.02)" strokeWidth="10"/>
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#2563eb" strokeWidth="10" strokeDasharray="251.2" strokeDashoffset="25.12" strokeLinecap="round"/>
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black italic text-white tracking-tighter">90%</span>
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Node Sync</span>
                 </div>
              </div>
              <p className="text-slate-400 text-[10px] font-bold italic leading-relaxed">
                Workflow latency is within optimal range (v1.2 spec). 
                Memory utilization on Railway cluster is stable.
              </p>
           </div>

           <div className="bg-slate-900 p-10 rounded-[56px] border border-white/5 space-y-6">
              <h4 className="text-xl font-black text-white italic tracking-tighter">Strategic Impact</h4>
              <div className="space-y-4">
                 {[
                   { label: 'Data Enrichment', lift: '+140%', desc: 'Maps + SERP verify' },
                   { label: 'Lead Quality', lift: '+85%', desc: 'AI-Logic filtered' },
                   { label: 'Response Speed', lift: '-92%', desc: 'Instant WH signals' }
                 ].map((stat, i) => (
                   <div key={i} className="flex justify-between border-b border-white/5 pb-4">
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-[8px] text-blue-500 font-bold italic">{stat.desc}</p>
                      </div>
                      <span className="text-xl font-black text-white italic tracking-tighter">{stat.lift}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowAuditView;
