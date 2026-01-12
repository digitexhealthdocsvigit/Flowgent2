
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

  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case 'no_website': return 'bg-red-600 text-white shadow-lg shadow-red-500/20'; // Prominent Red per requirements
      case 'has_website': return 'bg-green-600 text-white';
      case 'discovered': return 'bg-blue-600 text-white';
      case 'scored': return 'bg-purple-600 text-white';
      case 'converted': return 'bg-slate-900 text-white';
      default: return 'bg-slate-600 text-white';
    }
  };

  const renderStars = (rating: number = 0) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <svg key={i} xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill={i < Math.floor(rating) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className={i < Math.floor(rating) ? "text-yellow-500" : "text-slate-300"}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:shadow-lg transition-all group relative overflow-hidden">
      {lead.is_hot_opportunity && (
        <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-3 py-1 text-[8px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm z-10">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          Hot Opportunity
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">{lead.businessName}</h3>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-[10px] text-slate-500">{lead.category} • {lead.city}</p>
            <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase ${getStatusBadgeColor(lead.lead_status || lead.status)}`}>
              {(lead.lead_status || lead.status).replace('_', ' ')}
            </span>
          </div>
        </div>
        <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase border ${getTemperatureColor(lead.temperature)}`}>
          {lead.temperature}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="space-y-1">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Recommended Pitch</p>
          <p className="text-[10px] font-bold text-blue-700 capitalize">{(lead.pitch_type || 'Discovery').replace('_', ' ')}</p>
        </div>
        <div className="space-y-1 text-right">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Est. Contract Value</p>
          <p className="text-[10px] font-black text-slate-900">₹{lead.estimated_value?.toLocaleString('en-IN') || 'TBD'}</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center text-[10px]">
          <div className="flex items-center gap-2">
            {renderStars(lead.rating)}
            <span className="text-slate-400 font-bold">{lead.rating}</span>
          </div>
          <span className={`font-black ${lead.score > 70 ? 'text-green-600' : lead.score > 40 ? 'text-orange-500' : 'text-red-500'}`}>{lead.score}/100</span>
        </div>
        <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
          <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${lead.score}%` }}></div>
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-5">
        {lead.phone && (
          <a href={`tel:${lead.phone}`} className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-2 w-fit">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            {lead.phone}
          </a>
        )}
        <p className="text-[9px] text-slate-400 font-medium italic">{lead.service_tier}</p>
      </div>

      <div className="flex gap-2">
        <button 
          onClick={() => onAudit(lead)}
          className="flex-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
        >
          Run AI Audit
        </button>
        <div className="px-3 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center text-[8px] font-black uppercase tracking-tighter border border-slate-200">
          {(lead.source || 'Manual').replace('_', ' ')}
        </div>
      </div>
    </div>
  );
};

export default LeadCard;
