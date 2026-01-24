
import React, { useState, useEffect } from 'react';
import { leadOperations } from '../lib/supabase';
import { Lead } from '../types';

const ContactsView: React.FC = () => {
  const [contacts, setContacts] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const loadContacts = async () => {
    const data = await leadOperations.getContacts();
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
        <h2 className="text-5xl font-black text-white tracking-tighter italic">Qualified Nodes</h2>
        <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-[10px]">Verified Neural Handshakes: {contacts.length}</p>
      </div>

      <div className="bg-slate-900 rounded-[56px] border border-white/5 p-12 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="pb-8 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Identity</th>
                <th className="pb-8 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Access Port</th>
                <th className="pb-8 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Readiness</th>
                <th className="pb-8 text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Region</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {contacts.length > 0 ? contacts.map((c) => (
                <tr key={c.id} className="hover:bg-white/5 transition-all">
                  <td className="py-8">
                    <div className="flex items-center gap-6">
                      <div className={`w-3 h-3 rounded-full ${c.temperature === 'hot' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-blue-500 animate-pulse'}`}></div>
                      <div>
                         <p className="font-black text-xl text-white italic">{c.business_name}</p>
                         <p className="text-[9px] text-slate-500 uppercase tracking-widest">{c.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-8 font-mono text-blue-400 font-bold text-sm tracking-tighter">{c.phone || 'NO_PORT_SYNC'}</td>
                  <td className="py-8">
                    <div className="flex flex-col">
                       <span className={`text-2xl font-black italic ${c.readiness_score! > 80 ? 'text-green-500' : 'text-white'}`}>{c.readiness_score}%</span>
                       <span className="text-[8px] font-black text-slate-600 uppercase">Neural Weight</span>
                    </div>
                  </td>
                  <td className="py-8 text-[10px] font-black text-slate-500 uppercase italic">{c.city}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-slate-600 font-black uppercase tracking-widest text-[10px]">Awaiting First Qualified Handshake...</td>
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
