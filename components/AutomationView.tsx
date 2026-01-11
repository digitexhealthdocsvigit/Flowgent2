
import React from 'react';
import { AutomationWorkflow } from '../types';

interface AutomationViewProps {
  workflows: AutomationWorkflow[];
}

const AutomationView: React.FC<AutomationViewProps> = ({ workflows }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tighter">Workflow Monitoring</h2>
          <p className="text-slate-700 mt-1 font-medium">Real-time oversight of Flowgent™ automation engine (n8n powered).</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white border border-slate-200 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">GitHub CI/CD: Connected</span>
          </div>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">+ New Workflow</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workflows.map((wf) => (
          <div key={wf.id} className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm group hover:border-blue-200 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  {wf.type === 'email' && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>}
                  {wf.type === 'whatsapp' && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}
                  {wf.type === 'scoring' && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v10"/><path d="m16 8-4 4-4-4"/><path d="M4.5 20.5 12 13l7.5 7.5"/></svg>}
                  {wf.type === 'calendar' && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 leading-tight">{wf.name}</h4>
                  <p className="text-[10px] text-slate-700 font-black uppercase tracking-widest mt-1">Last Run: {wf.lastRun}</p>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${wf.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`}></div>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Success Rate</p>
                <p className="text-xl font-black text-slate-900">{wf.successRate}%</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Triggers Today</p>
                <p className="text-xl font-black text-slate-900">142</p>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button className="flex-1 py-3 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all">Configure</button>
              <button className="px-4 py-3 bg-slate-100 text-slate-700 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all border border-slate-200">Logs</button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 p-10 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10 scale-150">
          <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
        </div>
        <div className="max-w-xl">
          <h3 className="text-2xl font-bold leading-tight">Infrastructure Health: digitexhealthdocsvigit/Flowgent</h3>
          <p className="text-slate-400 text-sm mt-4 leading-relaxed font-medium">Repository is connected. CI/CD pipelines are passing. Webhooks linked to n8n worker nodes. Average build time: <span className="text-blue-400">42s</span>.</p>
        </div>
        <button className="mt-8 px-8 py-4 bg-white text-slate-900 font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-100 transition-all">View GitHub Actions</button>
      </div>
    </div>
  );
};

export default AutomationView;
