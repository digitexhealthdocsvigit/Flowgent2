
import React, { useState } from 'react';
import { ICONS } from '../constants';

interface ScrapedLead {
  id: string;
  name: string;
  location: string;
  phone: string;
  rating: number;
}

interface ScraperViewProps {
  onPushToN8N: (lead: ScrapedLead) => void;
  onGeneratePitch: (lead: ScrapedLead) => void;
}

const ScraperView: React.FC<ScraperViewProps> = ({ onPushToN8N, onGeneratePitch }) => {
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedLeads, setScrapedLeads] = useState<ScrapedLead[]>([
    { id: 'sc1', name: 'Shiva Garments', location: 'Surat, Gujarat', phone: '+91 98765 43210', rating: 4.2 },
    { id: 'sc2', name: 'Apex Logistics', location: 'Navi Mumbai', phone: '+91 88888 77777', rating: 3.8 },
    { id: 'sc3', name: 'Global Pharma Exports', location: 'Ahmedabad', phone: '+91 90000 11111', rating: 4.5 },
  ]);

  const handleStartScrape = () => {
    setIsScraping(true);
    setTimeout(() => {
      setIsScraping(false);
      // Simulate finding a new one
      const newLead = { id: Date.now().toString(), name: 'Bright Lights Mfg', location: 'Pimpri, Pune', phone: '+91 77777 66666', rating: 4.0 };
      setScrapedLeads([newLead, ...scrapedLeads]);
    }, 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tighter">G-Maps Discovery</h2>
          <p className="text-slate-500 mt-1 font-medium italic">Finding businesses with no digital footprint.</p>
        </div>
        <button 
          onClick={handleStartScrape}
          disabled={isScraping}
          className="bg-slate-900 text-white px-8 py-4 rounded-[20px] font-black text-xs uppercase tracking-[0.2em] shadow-xl flex items-center gap-3"
        >
          {isScraping ? (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          )}
          {isScraping ? 'Scraping G-Maps...' : 'Start New Search'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {scrapedLeads.map((lead) => (
          <div key={lead.id} className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-blue-200 transition-all">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center font-black text-2xl border border-red-100">
                {lead.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h4 className="text-xl font-bold text-slate-900">{lead.name}</h4>
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[8px] font-black uppercase rounded border border-red-200">No Website Found</span>
                </div>
                <p className="text-sm text-slate-500 font-medium mt-1">{lead.location} • ⭐ {lead.rating}</p>
                <p className="text-xs text-blue-600 font-bold mt-2">{lead.phone}</p>
              </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <button 
                onClick={() => onGeneratePitch(lead)}
                className="flex-1 md:flex-none px-6 py-3 bg-blue-50 text-blue-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-blue-100 transition-all"
              >
                Generate AI Pitch
              </button>
              <button 
                onClick={() => onPushToN8N(lead)}
                className="flex-1 md:flex-none px-6 py-3 bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all"
              >
                Push to n8n
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScraperView;
