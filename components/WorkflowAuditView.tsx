
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
    { name: 'MCP Webhook', role: 'Ingestion', relevance: 'Critical', status: 'Healthy', load: '0.02ms', description: 'Primary gateway for Flowgent2 signals. Handles 0x82 node handshakes from React frontend.' },
    { name: 'ROI Policy Gate', role: 'Governance', relevance: 'High', status: 'Healthy', load: '12ms', description: 'Filters leads by Est. Contract Value > 50k to protect platform profitability.' },
    { name: 'SERP Grounding', role: 'Verification', relevance: 'High', status: 'Healthy', load: '1.2s', description: 'Cross-references Maps data with live Google Search results to eliminate false positives.' },
    { name: 'Neural Scorer', role: 'Intelligence', relevance: 'Critical', status: 'Healthy', load: '2.4s', description: 'Tiered scoring engine (Gemini 1.5) calculating business readiness and digital gap analysis.' },
    { name: 'WhatsApp Dispatch', role: 'Agentic', relevance: 'High', status: 'Healthy', load: '3.1s', description: 'Automated outreach node triggering personalized pitches for hot opportunities.' },
    { name: 'CRM Persistence', role: 'Storage', relevance: 'Critical', status: 'Healthy', load: '45ms', description: 'Final sync back to InsForge JSK8SNXZ PostgreSQL cluster for deal tracking.' }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-500 max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic uppercase leading-none">n8n Orchestration Audit</h2>
          <p className="text-slate-500 mt-4 font-bold text-lg">Infrastructure Assessment: Analyzing node-to-node relevance and ROI logic.</p>
        </div>
        <div className="bg-blue-600/10 text-blue-400 px-6 py-2 rounded-xl border border-blue-500/20 text-[10px] font-black uppercase italic">
          Project Node: 0x82-JSK8
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900 rounded-[56px] border border-white/5 p-8 md:p-12 shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <svg width="200" height="200" viewBox="0 0 100 100"><circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="2" strokeDasharray="10 10"/></svg>
            </div>
            
            <h3 className="text-2xl font-black text-white mb-10 italic">Node Impact & Relevance Matrix</h3>
            
            <div className="space-y-4">
              {nodePool.map((node, i) => (
                <div key={i} className="flex flex-col md:flex-row md:items-center gap-6 p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all group/node">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black italic text-sm shrink-0 ${node.relevance === 'Critical' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 text-slate-400'}`}>
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
                  <div className="flex justify-between md:flex-col md:text-right space-y-1 min-w-[80px]">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none">Performance</p>
                    <p className="text-sm font-black text-emerald-400 font-mono italic">{node.load}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-600 p-8 md:p-12 rounded-[56px] text-white shadow-2xl shadow-blue-600/20 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-1000"></div>
             <div className="relative z-10">
               <h4 className="text-3xl font-black italic tracking-tighter mb-4">Final System Assessment</h4>
               <p className="text-blue-100 font-bold text-sm leading-relaxed max-w-xl">
                 Audit complete. Your n8n workflow identifies the "High ROI" leads effectively. The "SERP Signals" node is the key differentiator—it ensures the platform only targets businesses with a genuine infrastructure gap.
               </p>
               <div className="mt-8 flex flex-wrap gap-4">
                  <div className="px-6 py-2 bg-white/10 rounded-xl border border-white/20 text-[10px] font-black uppercase italic">Grounding Confidence: 98%</div>
                  <div className="px-6 py-2 bg-white/10 rounded-xl border border-white/20 text-[10px] font-black uppercase italic">Strategy Alignment: Optimal</div>
               </div>
             </div>
          </div>
        </div>

        <div className="space-y-8 h-fit lg:sticky lg:top-24">
           <div className="bg-[#020617] p-12 rounded-[56px] border border-white/5 text-center space-y-8 shadow-2xl">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] italic">Orchestration Health</span>
              <div className="relative w-48 h-48 mx-auto">
                 <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.02)" strokeWidth="10"/>
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#2563eb" strokeWidth="10" strokeDasharray="251.2" strokeDashoffset="25.12" strokeLinecap="round" className="animate-in fade-in duration-1000"/>
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black italic text-white tracking-tighter">92%</span>
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Sync Score</span>
                 </div>
              </div>
              <p className="text-slate-400 text-[10px] font-bold italic leading-relaxed">
                Workflow latency is within optimal range (v1.2 spec). 
                Neural pathways are persistent.
              </p>
           </div>

           <div className="bg-slate-900 p-10 rounded-[56px] border border-white/5 space-y-6 shadow-xl">
              <h4 className="text-xl font-black text-white italic tracking-tighter">Architectural Insights</h4>
              <div className="space-y-4">
                 {[
                   { label: 'Data Enrichment', lift: '+140%', desc: 'Maps + SERP Cross-Verify' },
                   { label: 'Lead Scoring', lift: '+85%', desc: 'Gemini-Logic Filtered' },
                   { label: 'Outreach Efficiency', lift: '-92%', desc: 'Automated WhatsApp Payloads' }
                 ].map((stat, i) => (
                   <div key={i} className="flex justify-between border-b border-white/5 pb-4 last:border-0 group/stat">
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover/stat:text-blue-500 transition-colors">{stat.label}</p>
                        <p className="text-[8px] text-slate-600 font-bold italic">{stat.desc}</p>
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
