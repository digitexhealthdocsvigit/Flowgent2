
import React, { useState, useEffect } from 'react';
import { leadOperations } from '../lib/supabase';
import { Lead } from '../types';

const ContactsView: React.FC = () => {
  const [contacts, setContacts] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const data = await leadOperations.getAll();
    if (data) {
      setContacts(data.filter((l: Lead) => l.ai_audit_completed));
    }
    setLoading(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-5xl font-black text-white tracking-tighter italic">Qualified Contacts</h2>
          <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]">Verified Neural Nodes</p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-[56px] border border-white/5 p-12 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="pb-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Business Identity</th>
                <th className="pb-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Contact Node</th>
                <th className="pb-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Readiness</th>
                <th className="pb-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Cluster</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {contacts.map((c) => (
                <tr key={c.id} className="hover:bg-white/5 transition-all">
                  <td className="py-8">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${c.temperature === 'hot' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-blue-500'}`}></div>
                      <p className="font-black text-lg text-white italic">{c.business_name}</p>
                    </div>
                  </td>
                  <td className="py-8 font-bold text-slate-400 text-sm">{c.phone || 'Null Phone'}</td>
                  <td className="py-8">
                    <span className={`text-xl font-black italic ${c.readiness_score! > 80 ? 'text-green-500' : 'text-blue-500'}`}>
                      {c.readiness_score}%
                    </span>
                  </td>
                  <td className="py-8 text-[10px] font-black text-slate-500 uppercase italic">{c.city}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ContactsView;
