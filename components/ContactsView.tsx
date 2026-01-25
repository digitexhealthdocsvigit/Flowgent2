
import React, { useState, useEffect } from 'react';
import { leadOperations } from '../lib/supabase';
import { Lead } from '../types';

const ContactsView: React.FC = () => {
  const [contacts, setContacts] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const loadContacts = async () => {
    const data = await leadOperations.getHotLeads();
    if (data) setContacts(data);
    setLoading(false);
  };

  useEffect(() => { loadContacts(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div>
        <h2 className="text-5xl font-black text-white tracking-tighter italic">Hot Opportunities</h2>
        <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]">Neural Nodes Scored ≥ 80: {contacts.length}</p>
      </div>

      <div className="bg-slate-900 rounded-[56px] border border-white/5 p-12 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="pb-8 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Business Identity</th>
                <th className="pb-8 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Agent Temp</th>
                <th className="pb-8 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Neural Score</th>
                <th className="pb-8 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">AI Strategic Insights</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {contacts.length > 0 ? contacts.map((c) => (
                <tr key={c.id} className="hover:bg-white/5 transition-all group">
                  <td className="py-8">
                    <div className="flex items-center gap-6">
                      <div className="w-4 h-4 rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse"></div>
                      <div>
                         <p className="font-black text-xl text-white italic tracking-tight">{c.business_name}</p>
                         <p className="text-[9px] text-slate-500 uppercase tracking-widest">{c.category} • {c.city}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-8">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full bg-red-600/20 text-red-500 border border-red-500/20 shadow-xl">
                      HOT OPPORTUNITY
                    </span>
                  </td>
                  <td className="py-8">
                    <div className="flex flex-col">
                       <span className="text-3xl font-black italic text-red-500 tracking-tighter">{c.readiness_score}%</span>
                       <span className="text-[8px] font-black text-slate-600 uppercase">Velocity Index</span>
                    </div>
                  </td>
                  <td className="py-8">
                    <p className="text-[10px] text-slate-300 font-bold italic leading-relaxed max-w-sm">
                      {c.ai_insights || 'Enrichment complete. Strategy ready for dispatch.'}
                    </p>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="py-32 text-center text-slate-600 font-black uppercase tracking-[0.4em] text-[10px] border border-dashed border-white/5 rounded-3xl">
                    AWAITING NEURAL CLASSIFICATION...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContactsView;
