
import React, { useState } from 'react';
import { ICONS } from '../constants';
import { searchLocalBusinesses } from '../services/geminiService';
import { calculateLeadScore } from '../utils/scoring';
import { Lead } from '../types';

interface ScraperViewProps {
  onPushToN8N: (lead: any) => void;
  onGeneratePitch: (lead: any) => void;
  onGenerateVideo: (lead: any) => Promise<string>;
}

const ScraperView: React.FC<ScraperViewProps> = ({ onPushToN8N, onGeneratePitch, onGenerateVideo }) => {
  const [isScraping, setIsScraping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationName, setLocationName] = useState('My Current Location');
  const [scrapedLeads, setScrapedLeads] = useState<Lead[]>([]);
  const [capturedIds, setCapturedIds] = useState<Set<string>>(new Set());

  const handleStartScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    setIsScraping(true);
    setCapturedIds(new Set()); // Reset for new scan
    
    try {
      let lat, lng;
      
      if (locationName === 'My Current Location') {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      }

      const results = await searchLocalBusinesses(searchQuery, lat, lng);
      
      const newLeads: Lead[] = results.map((r: any, index: number) => {
        const businessName = r.business_name || r.name || 'Unknown Node';
        const scored = calculateLeadScore({ 
          business_name: businessName, 
          website: r.has_website ? 'placeholder.com' : '' 
        });
        
        return {
          id: `real-${Date.now()}-${index}`,
          business_name: businessName,
          city: r.city || r.address || 'Location Pending',
          email: r.email || 'discovery@flowgent.io',
          phone: r.phone || 'N/A',
          rating: r.rating || 0,
          reviews: r.reviews || 0,
          google_maps_url: r.mapsUrl || r.uri,
          has_website: r.has_website,
          website: r.website || '',
          category: r.type || r.category || 'General',
          status: scored.lead_status,
          lead_status: scored.lead_status,
          score: scored.score,
          readiness_score: scored.score,
          temperature: scored.temperature,
          est_contract_value: scored.est_contract_value,
          pitch_type: scored.pitch_type,
          is_hot_opportunity: scored.is_hot_opportunity,
          service_tier: scored.service_tier,
          source: 'google_maps',
          created_at: new Date().toISOString()
        };
      });

      setScrapedLeads(newLeads);
    } catch (err) {
      console.error("Discovery Error:", err);
      alert("Terminal Connection Failed: Maps Node Inaccessible.");
    } finally {
      setIsScraping(false);
    }
  };

  const handleCapture = (lead: Lead) => {
    onPushToN8N(lead);
    setCapturedIds(prev => new Set(prev).add(lead.id));
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <svg key={i} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill={i < Math.floor(rating) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className={i < Math.floor(rating) ? "text-yellow-500" : "text-slate-300"}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tighter italic leading-none">Intelligence Discovery</h2>
          <p className="text-slate-500 mt-2 font-medium italic">Gemini Maps Grounding: Sector Penetration Mode.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[48px] border border-slate-200 shadow-xl">
        <form onSubmit={handleStartScrape} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input 
              type="text"
              placeholder="Target Sector (e.g. Real Estate, Fitness)"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 pl-14 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              required
            />
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
          </div>
          <div className="md:w-64 relative">
             <input 
              type="text"
              placeholder="Regional Node (optional)"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 pl-14 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
              value={locationName}
              onChange={e => setLocationName(e.target.value)}
            />
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
          </div>
          <button 
            type="submit"
            disabled={isScraping}
            className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
          >
            {isScraping ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Scan Maps Node'
            )}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {scrapedLeads.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-[56px] border border-dashed border-slate-200">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                <span className="text-3xl">🔭</span>
             </div>
             <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] italic">No neural clusters found. Initiate regional scan above.</p>
          </div>
        ) : (
          scrapedLeads.map((lead) => (
            <div key={lead.id} className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-10 group hover:border-blue-300 transition-all animate-in slide-in-from-bottom-4">
              <div className="flex items-center gap-8 flex-1">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl border border-blue-500 relative shadow-lg shadow-blue-500/20">
                  {lead.business_name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-4">
                    <h4 className="text-2xl font-black text-slate-900 tracking-tighter italic leading-none">{lead.business_name}</h4>
                    {!lead.has_website && (
                      <span className="px-3 py-1 bg-red-600 text-white text-[8px] font-black uppercase rounded shadow-lg shadow-red-500/30 animate-pulse">NO WEBSITE</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 font-bold mt-2 italic">{lead.city}</p>
                  <div className="flex items-center gap-6 mt-4">
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                      {renderStars(lead.rating || 0)}
                      <span className="text-[10px] font-black text-slate-400">{lead.rating}</span>
                    </div>
                    {lead.phone && (
                      <span className="text-[10px] font-black text-blue-600 flex items-center gap-2 uppercase tracking-widest">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        {lead.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="text-right mb-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Infrastructure Value</p>
                  <p className="text-3xl font-black text-slate-900 tracking-tighter italic leading-none">₹{lead.est_contract_value?.toLocaleString('en-IN')}</p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleCapture(lead)}
                    disabled={capturedIds.has(lead.id)}
                    className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl active:scale-95 ${
                      capturedIds.has(lead.id) 
                      ? 'bg-green-100 text-green-600 border border-green-200' 
                      : 'bg-slate-900 text-white hover:bg-blue-600'
                    }`}
                  >
                    {capturedIds.has(lead.id) ? 'Captured' : 'Capture Node'}
                  </button>
                  <button 
                    onClick={() => onGeneratePitch(lead)}
                    className="bg-blue-50 text-blue-600 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-100 transition-all border border-blue-100"
                  >
                    Neural Pitch
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isScraping && (
        <div className="fixed inset-0 bg-[#030712]/95 backdrop-blur-xl z-[200] flex items-center justify-center">
           <div className="text-center space-y-10 animate-in zoom-in-95">
              <div className="relative w-48 h-48 mx-auto">
                 <div className="absolute inset-0 border-[10px] border-blue-600/10 rounded-full"></div>
                 <div className="absolute inset-0 border-[10px] border-t-blue-600 rounded-full animate-spin shadow-[0_0_80px_rgba(37,99,235,0.4)]"></div>
                 <div className="absolute inset-0 flex items-center justify-center text-6xl">📡</div>
              </div>
              <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">Scanning Neural Channels</h3>
              <p className="text-blue-500 font-black uppercase tracking-[0.4em] text-xs italic">Syncing Gemini Maps Grounding Bridge...</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default ScraperView;
