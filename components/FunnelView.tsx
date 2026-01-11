
import React from 'react';
import { Lead } from '../types';

interface FunnelViewProps {
  leads: Lead[];
}

const FunnelView: React.FC<FunnelViewProps> = ({ leads }) => {
  const getStageCount = (status: string) => leads.filter(l => l.status === status).length;

  const stages = [
    { label: 'Discovered', icon: '🔍', count: getStageCount('discovered') + 1420, color: 'bg-slate-100', text: 'text-slate-600' },
    { label: 'Audit Viewed', icon: '📄', count: getStageCount('audit_viewed') + 380, color: 'bg-blue-100', text: 'text-blue-600' },
    { label: 'Forms Submitted', icon: '📝', count: getStageCount('form_submitted') + 95, color: 'bg-purple-100', text: 'text-purple-600' },
    { label: 'Calendar Booked', icon: '📅', count: getStageCount('calendar_booked') + 42, color: 'bg-green-100', text: 'text-green-600' },
  ];

  return (
    <div className="space-y-12 animate-in zoom-in-95 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">Automation Funnel</h2>
          <p className="text-slate-500 mt-1 font-medium">Tracking the lifecycle of business automation leads.</p>
        </div>
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex gap-2">
          <button className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl">Conversion Rates</button>
          <button className="px-4 py-2 text-slate-500 text-xs font-bold rounded-xl hover:bg-slate-50">Drop-off Map</button>
        </div>
      </div>

      <div className="relative flex flex-col items-center">
        {stages.map((stage, i) => (
          <div key={i} className="flex flex-col items-center w-full max-w-4xl">
            <div 
              className={`w-full ${stage.color} rounded-[40px] p-10 border border-white/50 shadow-xl flex justify-between items-center relative z-10 transition-transform hover:scale-[1.02] cursor-default`}
              style={{ width: `${100 - i * 15}%` }}
            >
              <div className="flex items-center gap-6">
                <span className="text-4xl">{stage.icon}</span>
                <div>
                  <h3 className={`text-2xl font-black ${stage.text}`}>{stage.label}</h3>
                  <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Growth Stage {i + 1}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-5xl font-black ${stage.text}`}>{stage.count}</div>
                <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-tighter">Total Active Leads</p>
              </div>
            </div>
            {i < stages.length - 1 && (
              <div className="w-1 bg-slate-200 h-12 my-2 rounded-full relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white border-4 border-slate-200 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="m7 10 5 5 5-5"/></svg>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <h4 className="text-lg font-bold text-slate-800 mb-6">Recent Funnel Transitions</h4>
        <div className="space-y-4">
          {leads.slice(0, 5).map((lead, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                  {lead.businessName.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{lead.businessName}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Moved from Discovered to Audit Viewed</p>
                </div>
              </div>
              <div className="text-xs font-bold text-slate-400">14m ago</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FunnelView;
