
import React, { useState } from 'react';
import { Subscription } from '../types';
import { subscriptionOperations, logOperations } from '../lib/supabase';

interface SubscriptionsViewProps {
  subscriptions: Subscription[];
  onRefresh?: () => void;
  isAdmin?: boolean;
}

const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({ subscriptions, onRefresh, isAdmin = true }) => {
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [paymentRef, setPaymentRef] = useState('');

  const handleVerify = async (id: string) => {
    if (!paymentRef.trim()) return alert("Enter reference number/screenshot ID");
    
    try {
      await subscriptionOperations.verifyPayment(id, paymentRef);
      await logOperations.create({ 
        text: `Revenue Node Verified: AMC Settlement Confirmed for Subscription #${id}`, 
        type: 'system' 
      });
      setVerifyingId(null);
      setPaymentRef('');
      if (onRefresh) onRefresh();
      alert("Revenue Node Synchronized. Account Active.");
    } catch (e) {
      alert("Infrastructure rejected signal. Check bank status.");
    }
  };

  return (
    <div className="space-y-12 animate-in slide-in-from-right-4 duration-500 p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-5xl font-black text-white tracking-tighter italic leading-none">Revenue Node</h2>
          <p className="text-slate-400 mt-4 font-bold text-lg">Monetization Active: {isAdmin ? 'Administrative Override Protocol' : 'Settlement Queue'}.</p>
        </div>
        <div className="bg-green-600/10 text-green-500 px-8 py-3 rounded-full border border-green-500/20 flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest">Settle Daily • Payout Nominal</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-slate-900 rounded-[56px] border border-white/5 p-12 shadow-2xl overflow-hidden group">
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-black text-white italic">Subscription Lifecycle</h3>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Live Payout Ledger</span>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Node Identifier</th>
                      <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Tier</th>
                      <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-500">AMC Status</th>
                      <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {subscriptions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-white/5 transition-colors group/row">
                        <td className="py-6">
                           <p className="font-black text-white">{sub.clientName}</p>
                           <p className="text-[8px] text-slate-500 uppercase tracking-widest">Ref: {sub.id}</p>
                        </td>
                        <td className="py-6">
                          <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">{sub.planName}</span>
                        </td>
                        <td className="py-6">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${sub.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                            {sub.status}
                          </span>
                        </td>
                        <td className="py-6 text-right">
                           {sub.status === 'paused' && isAdmin ? (
                             verifyingId === sub.id ? (
                               <div className="flex items-center gap-2 justify-end animate-in fade-in">
                                 <input 
                                   className="bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-[10px] font-bold text-white outline-none w-32"
                                   placeholder="TXN-ID"
                                   value={paymentRef}
                                   onChange={e => setPaymentRef(e.target.value)}
                                 />
                                 <button onClick={() => handleVerify(sub.id)} className="bg-green-600 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest">Confirm</button>
                                 <button onClick={() => setVerifyingId(null)} className="text-slate-500 text-[9px] px-2 font-black uppercase">✕</button>
                               </div>
                             ) : (
                               <button onClick={() => setVerifyingId(sub.id)} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all">Verify Payout</button>
                             )
                           ) : (
                             <span className="text-[10px] font-black text-slate-600 uppercase italic">Settled Node</span>
                           )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-blue-600 p-12 rounded-[56px] text-white shadow-2xl shadow-blue-600/20 group">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 italic">Infrastructure MRR</p>
               <h4 className="text-5xl font-black italic tracking-tighter">₹75,000</h4>
               <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest">Active Retention</span>
                  <span className="text-xl font-black italic">8 Nodes</span>
               </div>
            </div>
            <div className="bg-white p-12 rounded-[56px] text-slate-900 shadow-2xl group">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 italic">Revenue Realization</p>
               <h4 className="text-5xl font-black italic tracking-tighter">100%</h4>
               <p className="text-[10px] text-slate-500 font-bold mt-4 uppercase tracking-widest italic">No Inquiry Leakage Detected</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[64px] border border-slate-200 p-16 shadow-2xl relative overflow-hidden group h-fit sticky top-24">
           <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-700"></div>
           <div className="text-center space-y-10">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] italic">Settlement Portal</span>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic leading-none">Collect AMC <br/> Directly</h3>
              </div>
              
              <div className="aspect-square w-full bg-slate-50 rounded-[48px] flex items-center justify-center border-2 border-dashed border-slate-200 relative overflow-hidden group-hover:border-blue-300 transition-all cursor-pointer">
                 <div className="absolute inset-0 flex items-center justify-center opacity-5 text-8xl font-black -rotate-12">PAY</div>
                 <div className="bg-white p-6 rounded-[32px] shadow-2xl relative z-10 border border-slate-100">
                    <div className="w-32 h-32 bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-white font-black text-[10px] uppercase text-center p-4">
                      <div className="text-2xl mb-2">📸</div>
                      Scan QR <br/> to Pay
                    </div>
                 </div>
              </div>

              <div className="space-y-4 text-left p-8 bg-slate-50 rounded-[40px] border border-slate-100">
                 <div className="space-y-1">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">A/C Node Name</p>
                   <p className="text-md font-black text-slate-800 tracking-tight">Digitex Growth Ops</p>
                 </div>
                 <div className="space-y-1">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Bank Protocol</p>
                   <p className="text-md font-black text-slate-800 tracking-tight">ICICI BANK / RAZOR-001</p>
                 </div>
              </div>

              <div className="pt-4 space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                  Infrastructure protocol: Settle first, then sync screenshot via WhatsApp Bridge.
                </p>
                <button 
                  onClick={() => window.open('https://wa.me/91XXXXXXXXXX', '_blank')}
                  className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/20"
                >
                  Contact Support Node
                </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsView;
