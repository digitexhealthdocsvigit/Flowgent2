
import React, { useState } from 'react';
import { calculateLeadScore } from '../utils/scoring';
import { Lead } from '../types';
import { leadOperations } from '../lib/supabase';
import { PlusCircle } from 'lucide-react';

interface ScraperViewProps {
  onLeadsCaptured: () => void;
  onPushToN8N: (lead: any) => Promise<void>;
}

const ScraperView: React.FC<ScraperViewProps> = ({ onLeadsCaptured }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [businesses, setBusinesses] = useState<Lead[]>([]);
  const [searching, setSearching] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [manualForm, setManualForm] = useState({ name: '', phone: '', city: '' });
  const [showManual, setShowManual] = useState(false);

  const searchBusinesses = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setBusinesses([]);
    try {
      // Gemini API disabled per user request - using simulated search instead
      console.warn("ScraperView: Gemini AI disabled per user request. Using simulated business search.");
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate simulated business results based on search query
      const simulatedResults = [
        {
          business_name: `${searchQuery} Solutions Ltd.`,
          city: 'Mumbai',
          phone: '+91-22-1234-5678',
          has_website: true,
          website: `https://${searchQuery.toLowerCase().replace(/\s+/g, '-')}-solutions.com`,
          type: searchQuery
        },
        {
          business_name: `Premier ${searchQuery} Services`,
          city: 'Delhi',
          phone: '+91-11-9876-5432',
          has_website: false,
          website: '',
          type: searchQuery
        },
        {
          business_name: `${searchQuery} India Pvt. Ltd.`,
          city: 'Bangalore',
          phone: '+91-80-5555-1234',
          has_website: true,
          website: `https://www.${searchQuery.toLowerCase().replace(/\s+/g, '')}.in`,
          type: searchQuery
        }
      ];
      
      const scored: Lead[] = simulatedResults.map((r: any) => ({
        place_id: `sim_${Date.now()}_${Math.random()}`,
        business_name: r.business_name,
        city: r.city || 'India',
        phone: r.phone || 'N/A',
        has_website: r.has_website,
        website: r.website || '',
        category: r.type || searchQuery,
        readiness_score: calculateLeadScore({ website: r.website }).score,
        status: 'discovered',
        source: 'simulated_search',
        created_at: new Date().toISOString()
      }));
      setBusinesses(scored);
    } catch (e) {
      alert('Search Error: Simulated data only');
    } finally { setSearching(false); }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.name) return;
    setCapturing(true);
    
    const newLead: Partial<Lead> = {
      place_id: 'manual_' + Date.now(),
      business_name: manualForm.name,
      phone: manualForm.phone,
      city: manualForm.city,
      category: 'Manual Entry',
      has_website: false,
      ai_audit_completed: false,
      source: 'manual',
      status: 'discovered',
      created_at: new Date().toISOString()
    };

    const success = await leadOperations.create(newLead);
    if (success) {
      onLeadsCaptured();
      setManualForm({ name: '', phone: '', city: '' });
      setShowManual(false);
      alert("Node Provisioned Successfully.");
    } else {
      alert("Cluster Rejection: Verify Database Schema.");
    }
    setCapturing(false);
  };

  return (
    <div className="space-y-12 animate-in fade-in p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-5xl font-black text-white tracking-tighter italic">Discovery Terminal</h2>
          <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-[10px]">Node Cluster: JSK8SNXZ</p>
        </div>
        <button onClick={() => setShowManual(!showManual)} className="bg-blue-600/10 text-blue-400 px-6 py-3 rounded-2xl font-black text-[10px] uppercase border border-blue-500/20 hover:bg-blue-600/20 transition-all flex items-center gap-2">
          <PlusCircle size={14} /> {showManual ? 'Exit Terminal' : 'Manual Ingest'}
        </button>
      </div>

      {showManual && (
        <div className="bg-white p-12 rounded-[48px] shadow-2xl animate-in slide-in-from-top-4">
          <form onSubmit={handleManualSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <input required placeholder="Business Name" className="bg-slate-100 p-4 rounded-2xl font-bold text-slate-900 outline-none" value={manualForm.name} onChange={e => setManualForm({...manualForm, name: e.target.value})} />
            <input placeholder="Contact Phone" className="bg-slate-100 p-4 rounded-2xl font-bold text-slate-900 outline-none" value={manualForm.phone} onChange={e => setManualForm({...manualForm, phone: e.target.value})} />
            <input placeholder="City Hub" className="bg-slate-100 p-4 rounded-2xl font-bold text-slate-900 outline-none" value={manualForm.city} onChange={e => setManualForm({...manualForm, city: e.target.value})} />
            <button disabled={capturing} className="bg-blue-600 text-white p-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-500 disabled:opacity-50">Provision Node</button>
          </form>
        </div>
      )}

      <div className="bg-[#0f172a] p-12 rounded-[64px] border border-white/5 shadow-2xl">
        <div className="flex flex-col lg:flex-row gap-6">
          <input 
            type="text"
            placeholder="Target Sector for Neural Probing (e.g. Manufacturing in Mumbai)"
            className="flex-1 bg-white/5 border border-white/10 rounded-[32px] p-8 font-black text-xl text-white outline-none focus:border-blue-600 transition-all italic"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button 
            onClick={searchBusinesses}
            disabled={searching}
            className="bg-blue-600 text-white px-16 py-8 rounded-[32px] font-black text-xs uppercase tracking-[0.4em] shadow-2xl hover:bg-blue-500 transition-all italic"
          >
            {searching ? 'Probing...' : 'Initiate Scan'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {businesses.map((lead) => (
          <div key={lead.place_id} className="bg-white rounded-[48px] p-12 border border-slate-100 relative group overflow-hidden">
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic leading-none mb-6">{lead.business_name}</h3>
            <div className="flex flex-wrap gap-4 text-slate-500 mb-8 font-bold uppercase text-[9px]">
               <span className="bg-slate-100 px-3 py-1 rounded-full">{lead.city}</span>
               <span className="bg-slate-100 px-3 py-1 rounded-full">{lead.category}</span>
            </div>
            <button 
              onClick={async () => {
                setCapturing(true);
                const ok = await leadOperations.create(lead);
                if (ok) { onLeadsCaptured(); alert("Provisioned."); }
                setCapturing(false);
              }}
              disabled={capturing}
              className="w-full bg-slate-900 text-white font-black py-5 rounded-3xl text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all disabled:opacity-50"
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
