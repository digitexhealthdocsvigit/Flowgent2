
import React, { useState } from 'react';
import { searchLocalBusinesses } from '../services/geminiService';
import { calculateLeadScore } from '../utils/scoring';
import { Lead, leadOperations } from '../lib/supabase';

interface ScraperViewProps {
  onLeadsCaptured: () => void;
  onPushToN8N: (lead: any) => Promise<void>;
}

const ScraperView: React.FC<ScraperViewProps> = ({ onLeadsCaptured, onPushToN8N }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('Mumbai, India');
  const [businesses, setBusinesses] = useState<Lead[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [capturing, setCapturing] = useState(false);

  const searchBusinesses = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setBusinesses([]);
    setSelectedIds(new Set());

    try {
      const results = await searchLocalBusinesses(searchQuery);
      
      const scoredBusinesses: Lead[] = results.map((r: any) => {
        const scored = calculateLeadScore({ 
          business_name: r.business_name, 
          website: r.website 
        });
        
        return {
          place_id: r.mapsUrl || `pl_${Date.now()}_${Math.random()}`,
          business_name: r.business_name,
          city: r.city || location,
          phone: r.phone || 'N/A',
          rating: r.rating || 0,
          has_website: r.has_website,
          website: r.website || '',
          category: r.type || searchQuery,
          readiness_score: scored.score,
          is_hot_opportunity: scored.is_hot_opportunity,
          est_contract_value: scored.est_contract_value,
          status: 'discovered',
          source: 'google_maps',
          created_at: new Date().toISOString()
        };
      });

      setBusinesses(scoredBusinesses);
    } catch (error) {
      console.error('Discovery failed:', error);
      alert('Terminal Link Error: Maps Node Inaccessible.');
    } finally {
      setSearching(false);
    }
  };

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleCapture = async () => {
    const targets = businesses.filter(b => selectedIds.has(b.place_id!));
    if (targets.length === 0) return;

    setCapturing(true);
    try {
      for (const lead of targets) {
        // 1. Persist to InsForge
        await leadOperations.upsert(lead);
        // 2. Dispatch to n8n
        await onPushToN8N(lead);
      }
      setSelectedIds(new Set());
      onLeadsCaptured();
      alert(`Neural Sync Complete: ${targets.length} nodes captured.`);
    } catch (error) {
      console.error('Capture failed:', error);
      alert('Sync Failure: Infrastructure rejected capture signal.');
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter italic leading-none">Discovery Engine</h2>
          <p className="text-slate-400 mt-2 font-medium italic">Gemini Maps Grounding: Identifying Digital Gaps.</p>
        </div>
      </div>

      <div className="bg-slate-900/50 p-8 rounded-[48px] border border-white/5 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input 
              type="text"
              placeholder="Target Sector (e.g. Gym, Luxury Spa)"
              className="w-full bg-slate-800/50 border border-white/10 rounded-2xl p-5 pl-12 font-bold text-white outline-none focus:ring-4 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && searchBusinesses()}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
          </div>
          <button 
            onClick={searchBusinesses}
            disabled={searching}
            className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/20 hover:bg-blue-500 active:scale-95 transition-all disabled:opacity-50"
          >
            {searching ? 'Scanning...' : 'Initiate Scan'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {businesses.length > 0 && (
          <div className="flex justify-between items-center bg-blue-600/10 p-6 rounded-3xl border border-blue-500/20">
            <p className="text-xs font-black text-blue-400 uppercase tracking-widest italic">{selectedIds.size} Nodes Selected for Capture</p>
            <button 
              onClick={handleCapture}
              disabled={capturing || selectedIds.size === 0}
              className="bg-green-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-green-500 transition-all disabled:opacity-30 shadow-lg shadow-green-600/20"
            >
              {capturing ? 'Syncing...' : 'Capture Selected Nodes'}
            </button>
          </div>
        )}

        {businesses.map((lead) => (
          <div 
            key={lead.place_id} 
            onClick={() => toggleSelection(lead.place_id!)}
            className={`bg-slate-900 border rounded-[40px] p-8 cursor-pointer transition-all hover:bg-slate-800/50 ${selectedIds.has(lead.place_id!) ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-2xl' : 'border-white/5'}`}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-2xl font-black text-white tracking-tighter italic">{lead.business_name}</h3>
                  {lead.is_hot_opportunity && (
                    <span className="px-3 py-1 bg-red-600 text-white text-[8px] font-black uppercase rounded shadow-lg shadow-red-500/30 animate-pulse">Hot Opp</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-6 text-slate-400">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span className="text-xs font-bold">{lead.city}</span>
                  </div>
                  {!lead.has_website && (
                    <div className="flex items-center gap-2 text-red-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      <span className="text-xs font-black uppercase italic tracking-widest">No Website</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    <span className="text-xs font-bold">{lead.phone}</span>
                  </div>
                </div>
              </div>
              <div className="text-right space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic leading-none">Readiness</p>
                <p className={`text-4xl font-black italic tracking-tighter ${lead.readiness_score! > 70 ? 'text-blue-500' : 'text-white'}`}>{lead.readiness_score}%</p>
                <p className="text-[10px] font-bold text-green-500 italic">Est. ₹{lead.est_contract_value?.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        ))}

        {businesses.length === 0 && !searching && (
          <div className="py-32 text-center bg-slate-900/30 rounded-[64px] border border-dashed border-white/5">
             <div className="text-6xl mb-6 opacity-20">🔭</div>
             <p className="text-slate-500 font-black uppercase tracking-[0.4em] text-[10px] italic">Monitoring local nodes. Initiate regional scan to begin.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScraperView;
