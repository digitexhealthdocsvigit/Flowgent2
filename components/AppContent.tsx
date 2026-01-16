
import React from 'react';
import { Lead, AuditResult, AuditLog } from '../types';

export const DecisionBanner: React.FC<{ audit: AuditResult }> = ({ audit }) => (
  <div className="bg-blue-600 text-white p-6 rounded-[32px] flex items-center justify-between shadow-xl shadow-blue-600/20 animate-in slide-in-from-top-4 duration-500">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-lg">💡</div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">System Recommendation</p>
        <p className="font-bold tracking-tight">{audit.recommendations[0]}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-[10px] font-black uppercase tracking-widest opacity-60">ROI Lift</p>
      <p className="text-xl font-black italic">{audit.projected_roi_lift || "+14% Est."}</p>
    </div>
  </div>
);

export const SignalLog: React.FC<{ signals: AuditLog[] }> = ({ signals }) => (
  <div className="space-y-4 font-mono text-[10px]">
    {signals.map((s, i) => {
      const date = s.created_at ? new Date(s.created_at) : new Date();
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      return (
        <div key={i} className="flex gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl animate-in fade-in duration-300">
          <span className="text-blue-500 font-black shrink-0">[{timeStr}]</span>
          <div className="space-y-1">
            <p className="text-white font-bold uppercase tracking-tight">{s.text}</p>
            <p className="text-slate-500">
              Node: {s.type === 'tool' ? 'Autonomous AI Agent' : s.type === 'webhook' ? 'n8n Cloud Node' : 'Infrastructure Stack'}
            </p>
          </div>
        </div>
      );
    })}
    {signals.length === 0 && (
      <div className="py-20 text-center opacity-30 italic">
        Monitoring neural pathways for activity...
      </div>
    )}
  </div>
);
