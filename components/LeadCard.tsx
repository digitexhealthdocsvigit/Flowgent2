
import React from 'react';
import { Lead } from '../types';

interface LeadCardProps {
  lead: Lead;
  onAudit: (lead: Lead) => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onAudit }) => {
  // Hardened data mapping
  const businessName = lead.business_name || (lead as any).businessName || 'Unknown Business';
  const city = lead.city || 'Location Pending';
  const status = lead.lead_status || lead.status || 'discovered';
  const value = lead.est_contract_value || (lead as any).estimated_value || 0;
  const score = lead.readiness_score || lead.score || 0;

  const getStatusBadgeColor = (s: string) => {
    switch(s) {
      case 'no_website': return 'bg-red-600 text-white shadow-lg shadow-red-500/20';
      case 'has_website': return 'bg-green-600 text-white';
      case 'discovered': return 'bg-blue-600 text-white';
      case 'scored': return 'bg-purple-600 text-white';
      case 'converted': return 'bg-slate-900 text-white';
      default: return 'bg-slate-600 text-white';
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:shadow-lg transition-all group relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">{businessName}</h3>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[10px] text-slate-500">{lead.category} • {city}</p>
            <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase ${getStatusBadgeColor(status)}`}>
              {status.replace('_', ' ')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
           {lead.is_synced_to_n8n && (
             <div className="w-6 h-6 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center animate-pulse border border-blue-100" title="Integrated with n8n Orchestrator">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19c.7 0 1.2-.6 1.2-1.2V6.2c0-.7-.5-1.2-1.2-1.2h-11c-.7 0-1.2.5-1.2 1.2v11.6c0 .6.5 1.2 1.2 1.2h11z"/><path d="M15 9h-6"/><path d="M15 13h-6"/><path d="M15 17h-6"/></svg>
             </div>
           )}
           {lead.is_hot_opportunity && (
             <div className="bg-yellow-400 text-yellow-900 px-2 py-1 text-[7px] font-black uppercase tracking-widest rounded shadow-sm">
                Hot
             </div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 border-t border-slate-50 pt-4">
        <div className="space-y-1">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Recommended Pitch</p>
          <p className="text-[10px] font-bold text-blue-700 capitalize">{(lead.pitch_type || 'Discovery').replace('_', ' ')}</p>
        </div>
        <div className="space-y-1 text-right">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Est. Contract Value</p>
          <p className="text-[10px] font-black text-slate-900">₹{value.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-slate-400 font-bold">Readiness Score</span>
          <span className={`font-black ${score > 70 ? 'text-green-600' : 'text-slate-900'}`}>{score}/100</span>
        </div>
        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
          <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${score}%` }}></div>
        </div>
      </div>

      <button onClick={() => onAudit(lead)} className="w-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl hover:bg-slate-800 transition-colors">Run AI Audit</button>
    </div>
  );
};

export default LeadCard;
