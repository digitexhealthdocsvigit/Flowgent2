
import React from 'react';
import { Lead, AuditResult, AuditLog } from '../types';

export const DecisionBanner: React.FC<{ audit: AuditResult }> = ({ audit }) => (
  <div className="bg-emerald-600 text-white p-6 rounded-[32px] flex items-center justify-between shadow-xl shadow-emerald-600/20 animate-in slide-in-from-top-4 duration-500 border border-emerald-400/20">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-lg">🧠</div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Founder Strategy</p>
        <p className="font-bold tracking-tight italic">{audit.recommendations[0]}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-[10px] font-black uppercase tracking-widest opacity-60">ROI Lift</p>
      <p className="text-xl font-black italic text-emerald-100">{audit.projected_roi_lift || "+14% Est."}</p>
    </div>
  </div>
);

export const SignalLog: React.FC<{ signals: AuditLog[] }> = ({ signals }) => (
  <div className="space-y-1">
    <div className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 italic">
       <span className="col-span-2">MCP Call / Action</span>
       <span>Type</span>
       <span className="text-right">Time</span>
    </div>
    <div className="divide-y divide-white/5 max-h-[400px] overflow-y-auto custom-scrollbar">
      {signals.map((s, i) => {
        const date = s.created_at ? new Date(s.created_at) : new Date();
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        return (
          <div key={i} className="grid grid-cols-4 gap-4 px-6 py-5 hover:bg-white/5 transition-colors items-center group">
            <div className="col-span-2 space-y-1">
               <p className="text-white font-bold text-xs group-hover:text-emerald-400 transition-colors leading-tight italic uppercase">{s.text}</p>
               <p className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">Source: {s.source || 'flowgent_node'}</p>
            </div>
            <div>
               <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${
                 s.type === 'tool' ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' : 
                 s.type === 'webhook' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 
                 'bg-slate-800 text-slate-400'
               }`}>
                 {s.type === 'tool' ? 'MCP Call' : s.type === 'webhook' ? 'n8n Sig' : 'Node'}
               </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 text-right">{timeStr}</span>
          </div>
        );
      })}
    </div>
    {signals.length === 0 && (
      <div className="py-32 text-center text-slate-600 space-y-4">
        <div className="w-12 h-12 bg-white/5 rounded-full mx-auto flex items-center justify-center">📡</div>
        <p className="font-black uppercase tracking-[0.4em] text-[10px] italic">No MCP logs found. Node JSK8SNXZ Idle.</p>
      </div>
    )}
  </div>
);
