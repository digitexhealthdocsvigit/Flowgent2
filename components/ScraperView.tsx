
import React, { useState } from 'react';
import { Search, MapPin, AlertCircle, ExternalLink, Zap } from 'lucide-react';
import { searchLocalBusinesses } from '../services/geminiService';
import { calculateLeadScore } from '../utils/scoring';
import { Lead } from '../types';
import { leadOperations, logOperations } from '../lib/supabase';

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
          google_maps_url: r.mapsUrl,
          created_at: new Date().toISOString()
        };
      });

      setBusinesses(scoredBusinesses);
      await logOperations.create({ 
        text: `Neural Scan: ${results.length} nodes detected for "${searchQuery}"`, 
        type: 'tool',
        payload: { query: searchQuery, count: results.length }
      });
    } catch (error) {
      console.error('Discovery failed:', error);
      alert('Terminal Link Error: Neural Path Obstruction.');
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
        await leadOperations.upsert(lead);
        if (lead.readiness_score && lead.readiness_score > 80) {
          await onPushToN8N(lead);
        }
      }
      await logOperations.create({ 
        text: `Sync Success: ${targets.length} nodes integrated with project jsk8snxz`, 
        type: 'webhook',
        payload: { targets: targets.map(t => t.business_name) }
      });
      setSelectedIds(new Set());
      onLeadsCaptured();
      alert("Infrastructure Provisioned. Check Neural Pipeline.");
    } catch (error) {
      console.error('Capture failed:', error);
      alert('Sync Failure: Project Node Rejected Signal.');
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic leading-none">Discovery Terminal</h2>
          <p className="text-slate-500 mt-4 font-bold text-lg">Gemini Grounding: Probing Local Nodes for Structural Gaps.</p>
        </div>
      </div>

      <div className="bg-[#0f172a] p-12 rounded-[64px] border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>
        <div className="flex flex-col lg:flex-row gap-6 relative z-10">
          <div className="flex-1 relative group/input">
            <input 
              type="text"
              placeholder="Enter Target Sector (e.g. Luxury Real Estate)"
              className="w-full bg-white/5 border border-white/10 rounded-[32px] p-8 pl-16 font-black text-xl text-white outline-none focus:ring-4 focus:ring-blue-600/20 focus:border-blue-600 transition-all placeholder:text-slate-600 italic"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && searchBusinesses()}
            />
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500 group-focus-within/input:scale-110 transition-transform">
               <Search size={28} />
            </div>
          </div>
          <button 
            onClick={searchBusinesses}
            disabled={searching}
            className="bg-blue-600 text-white px-16 py-8 rounded-[32px] font-black text-xs uppercase tracking-[0.4em] shadow-2xl shadow-blue-600/30 hover:bg-blue-500 active:scale-95 transition-all disabled:opacity-50 italic flex items-center gap-4"
          >
            {searching ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Probing...
              </>
            ) : (
              <>
                <Zap size={18} fill="currentColor" />
                Initiate Scan
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {businesses.length > 0 && (
          <div className="flex justify-between items-center bg-blue-600 text-white p-8 rounded-[40px] shadow-xl shadow-blue-600/20 animate-in slide-in-from-top-6">
            <div className="flex items-center gap-6">
               <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center font-black italic">0{selectedIds.size}</div>
               <p className="text-xs font-black uppercase tracking-[0.2em] italic">Infrastructure Units Selected for Capture</p>
            </div>
            <button 
              onClick={handleCapture}
              disabled={capturing || selectedIds.size === 0}
              className="bg-white text-blue-600 px-12 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-slate-100 transition-all disabled:opacity-30 shadow-2xl active:scale-95 italic"
            >
              {capturing ? 'Provisioning...' : 'Provision Nodes'}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {businesses.map((lead) => (
            <div 
              key={lead.place_id} 
              onClick={() => toggleSelection(lead.place_id!)}
              className={`bg-white border rounded-[48px] p-12 cursor-pointer transition-all hover:shadow-2xl relative overflow-hidden group ${selectedIds.has(lead.place_id!) ? 'border-blue-600 ring-2 ring-blue-500/10 shadow-blue-100' : 'border-slate-100'}`}
            >
              {selectedIds.has(lead.place_id!) && (
                <div className="absolute top-0 right-0 p-8 text-blue-600 animate-in zoom-in">
                  <Zap size={24} fill="currentColor" />
                </div>
              )}
              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic leading-none group-hover:text-blue-600 transition-colors">{lead.business_name}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">{lead.category}</span>
                      {lead.is_hot_opportunity && (
                        <span className="px-3 py-1 bg-red-600 text-white text-[7px] font-black uppercase rounded-lg shadow-lg shadow-red-500/30 animate-pulse">Critical Link</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-6 text-slate-500">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-blue-500" />
                      <span className="text-[10px] font-bold uppercase tracking-tight">{lead.city}</span>
                    </div>
                    {!lead.has_website && (
                      <div className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-1.5 rounded-full border border-red-100">
                        <AlertCircle size={14} />
                        <span className="text-[9px] font-black uppercase italic tracking-widest leading-none">Website Null</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right space-y-3">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] italic leading-none">Readiness</p>
                  <p className={`text-6xl font-black italic tracking-tighter leading-none ${lead.readiness_score! > 70 ? 'text-blue-600' : 'text-slate-900'}`}>{lead.readiness_score}%</p>
                  <div className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-[9px] font-black tracking-widest inline-block italic">₹{lead.est_contract_value?.toLocaleString('en-IN')} Est.</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {businesses.length === 0 && !searching && (
          <div className="py-40 text-center bg-slate-50 rounded-[80px] border-4 border-dashed border-slate-100">
             <div className="text-8xl mb-10 opacity-10 grayscale">🔭</div>
             <p className="text-slate-400 font-black uppercase tracking-[0.5em] text-xs italic">Terminal awaiting Regional Probing Instructions.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScraperView;
