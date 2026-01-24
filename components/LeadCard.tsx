
import React from 'react';
import { Lead } from '../types';

interface LeadCardProps {
  lead: Lead;
  onAudit: (lead: Lead) => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onAudit }) => {
  const businessName = lead.business_name || (lead as any).businessName || 'Unknown Business';
  const city = lead.city || 'Location Pending';
  const status = lead.status || 'discovered';
  const value = lead.est_contract_value || 0;
  const score = lead.readiness_score || 0;

  const getStatusBadgeColor = (s: string) => {
    switch(s) {
      case 'no_website': return 'bg-red-600 text-white shadow-lg shadow-red-500/30';
      case 'has_website': return 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20';
      case 'discovered': return 'bg-blue-600 text-white';
      case 'scored': return 'bg-purple-600 text-white shadow-lg shadow-purple-500/20';
      case 'converted': return 'bg-slate-900 text-white';
      default: return 'bg-slate-600 text-white';
    }
  };

  return (
    <div className="bg-white p-8 rounded-[40px] border border-slate-200 hover:shadow-2xl transition-all group relative overflow-hidden flex flex-col justify-between h-full">
      <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <h3 className="font-black text-slate-900 group-hover:text-blue-600 transition-colors text-xl tracking-tight leading-tight">{businessName}</h3>
            <div className="flex items-center gap-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{lead.category} • {city}</p>
            </div>
          </div>
          <span className={`text-[8px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${getStatusBadgeColor(status)}`}>
            {status.replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-8 py-6 border-y border-slate-50">
          <div className="space-y-1">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">Recommended Pitch</p>
            <p className="text-xs font-black text-blue-700 italic capitalize">{(lead.pitch_type || 'Discovery').replace('_', ' ')}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">Est. Value</p>
            <p className="text-sm font-black text-slate-900 tracking-tighter italic">₹{value.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-400 font-black uppercase tracking-widest italic">Neural Readiness</span>
            <span className={`font-black italic ${score > 75 ? 'text-green-600' : 'text-slate-900'}`}>{score}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-1000 ${score > 75 ? 'bg-green-500' : 'bg-blue-600'}`} style={{ width: `${score}%` }}></div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {lead.is_hot_opportunity && (
          <div className="bg-red-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-xl shadow-red-500/20 animate-pulse">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">CRITICAL ROI OPPORTUNITY</span>
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        )}
        <button onClick={() => onAudit(lead)} className="w-full bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.3em] py-5 rounded-[24px] hover:bg-slate-800 transition-all active:scale-[0.98] shadow-xl">Initiate AI Audit</button>
      </div>
    </div>
  );
};

export default LeadCard;
