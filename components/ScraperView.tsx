
import React, { useState } from 'react';
import { Search, MapPin, AlertCircle, ExternalLink, Zap, PlusCircle } from 'lucide-react';
import { searchLocalBusinesses } from '../services/geminiService';
import { calculateLeadScore } from '../utils/scoring';
import { Lead } from '../types';
import { INSFORGE_CONFIG, getHeaders, logOperations } from '../lib/supabase';

interface ScraperViewProps {
  onLeadsCaptured: () => void;
  onPushToN8N: (lead: any) => Promise<void>;
}

const ScraperView: React.FC<ScraperViewProps> = ({ onLeadsCaptured }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [businesses, setBusinesses] = useState<Lead[]>([]);
  const [searching, setSearching] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manualLead, setManualLead] = useState({ name: '', phone: '', city: '' });

  const searchBusinesses = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setBusinesses([]);

    try {
      const results = await searchLocalBusinesses(searchQuery);
      const scored: Lead[] = results.map((r: any) => ({
        place_id: r.mapsUrl || `pl_${Date.now()}_${Math.random()}`,
        business_name: r.business_name,
        city: r.city || 'India',
        phone: r.phone || 'N/A',
        rating: r.rating || 0,
        has_website: r.has_website,
        website: r.website || '',
        category: r.type || searchQuery,
        readiness_score: calculateLeadScore({ website: r.website }).score,
        status: 'discovered',
        source: 'google_maps',
        google_maps_url: r.mapsUrl,
        created_at: new Date().toISOString()
      }));
      setBusinesses(scored);
    } catch (e) {
      alert('Probing Instruction Failed.');
    } finally {
      setSearching(false);
    }
  };

  const handleCapture = async (lead: Lead) => {
    setCapturing(true);
    try {
      const response = await fetch(`${INSFORGE_CONFIG.URL}${INSFORGE_CONFIG.REST_PATH}/leads`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(lead)
      });
      if (response.ok) {
        await logOperations.create({ text: `Provisioned Node: ${lead.business_name}`, type: 'webhook' });
        onLeadsCaptured();
        alert("Node Synchronized Successfully.");
      }
    } catch (e) {
      alert("Handshake Rejected.");
    } finally {
      setCapturing(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualLead.name) return;
    
    const lead: Partial<Lead> = {
      place_id: 'manual_' + Date.now(),
      business_name: manualLead.name,
      phone: manualLead.phone,
      city: manualLead.city,
      category: 'Manual Entry',
      has_website: false,
      ai_audit_completed: false,
      source: 'manual',
      status: 'discovered',
      created_at: new Date().toISOString()
    };

    await handleCapture(lead as Lead);
    setManualLead({ name: '', phone: '', city: '' });
    setShowManual(false);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-5xl font-black text-white tracking-tighter italic italic">Discovery Terminal</h2>
          <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-xs">Node JSK8SNXZ Discovery Layer</p>
        </div>
        <button 
          onClick={() => setShowManual(!showManual)}
          className="bg-blue-600/10 text-blue-400 px-6 py-3 rounded-2xl font-black text-[10px] uppercase border border-blue-500/20 hover:bg-blue-600/20 transition-all flex items-center gap-2"
        >
          <PlusCircle size={14} /> {showManual ? 'Exit Terminal' : 'Manual Entry'}
        </button>
      </div>

      {showManual && (
        <div className="bg-white p-12 rounded-[48px] shadow-2xl animate-in slide-in-from-top-4">
          <form onSubmit={handleManualSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <input required placeholder="Business Name" className="bg-slate-100 p-4 rounded-2xl font-bold text-slate-900 outline-none" value={manualLead.name} onChange={e => setManualLead({...manualLead, name: e.target.value})} />
            <input placeholder="Phone Node" className="bg-slate-100 p-4 rounded-2xl font-bold text-slate-900 outline-none" value={manualLead.phone} onChange={e => setManualLead({...manualLead, phone: e.target.value})} />
            <input placeholder="City Cluster" className="bg-slate-100 p-4 rounded-2xl font-bold text-slate-900 outline-none" value={manualLead.city} onChange={e => setManualLead({...manualLead, city: e.target.value})} />
            <button className="bg-blue-600 text-white p-4 rounded-2xl font-black uppercase tracking-widest text-xs">Sync Node</button>
          </form>
        </div>
      )}

      <div className="bg-[#0f172a] p-12 rounded-[64px] border border-white/5 shadow-2xl relative overflow-hidden group">
        <div className="flex flex-col lg:flex-row gap-6 relative z-10">
          <input 
            type="text"
            placeholder="Enter Sector for Neural Probing"
            className="flex-1 bg-white/5 border border-white/10 rounded-[32px] p-8 font-black text-xl text-white outline-none focus:border-blue-600 transition-all italic"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button 
            onClick={searchBusinesses}
            disabled={searching}
            className="bg-blue-600 text-white px-16 py-8 rounded-[32px] font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-blue-500 transition-all italic flex items-center gap-4"
          >
            {searching ? 'Probing...' : 'Initiate Scan'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {businesses.map((lead) => (
          <div key={lead.place_id} className="bg-white rounded-[48px] p-12 border border-slate-100 relative group overflow-hidden">
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic leading-none mb-6">{lead.business_name}</h3>
            <div className="flex flex-wrap gap-4 text-slate-500 mb-8">
               <span className="bg-slate-100 px-3 py-1 rounded-full text-[9px] font-black uppercase">{lead.city}</span>
               <span className="bg-slate-100 px-3 py-1 rounded-full text-[9px] font-black uppercase">{lead.category}</span>
            </div>
            <button 
              onClick={() => handleCapture(lead)}
              className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all"
            >
              Sync to Infrastructure
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScraperView;
