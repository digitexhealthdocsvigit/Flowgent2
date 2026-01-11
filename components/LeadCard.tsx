
import React from 'react';
import { Lead } from '../types';

interface LeadCardProps {
  lead: Lead;
  onAudit: (lead: Lead) => void;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, onAudit }) => {
  const getTemperatureColor = (temp: string) => {
    switch(temp) {
      case 'hot': return 'bg-red-100 text-red-700 border-red-200';
      case 'warm': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'cold': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:shadow-lg transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{lead.businessName}</h3>
          <p className="text-xs text-slate-500">{lead.category} • {lead.city}</p>
        </div>
        <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase border ${getTemperatureColor(lead.temperature)}`}>
          {lead.temperature}
        </span>
      </div>

      <div className="space-y-3 mb-5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-slate-400">Digital Score</span>
          <span className={`font-bold ${lead.score > 70 ? 'text-green-600' : lead.score > 40 ? 'text-orange-500' : 'text-red-500'}`}>{lead.score}/100</span>
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${lead.score}%` }}></div>
        </div>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={() => onAudit(lead)}
          className="flex-1 bg-slate-900 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6"/><path d="M8 11h6"/></svg>
          Run AI Audit
        </button>
        <button className="px-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      </div>
    </div>
  );
};

export default LeadCard;
