
import React from 'react';
import { Subscription } from '../types';

interface SubscriptionsViewProps {
  subscriptions: Subscription[];
}

const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({ subscriptions }) => {
  return (
    <div className="space-y-12 animate-in slide-in-from-right-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic leading-none">Revenue Engine</h2>
          <p className="text-slate-500 mt-4 font-bold text-lg">Monetization Node: Manual Settlement Protocol Enabled.</p>
        </div>
        <div className="bg-green-100 text-green-700 px-8 py-3 rounded-full border border-green-200 flex items-center gap-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest">Payout Cycle: Daily Settlement</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white rounded-[56px] border border-slate-200 p-12 shadow-sm overflow-hidden group">
             <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-black text-slate-900 italic">Active Retainers</h3>
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Syncing with InsForge CRM</span>
             </div>
             <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Client Node</th>
                    <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Architecture Tier</th>
                    <th className="pb-6 text-[10px] font-black uppercase tracking-widest text-slate-400">AMC / Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors group/row">
                      <td className="py-6 font-black text-slate-800">{sub.clientName}</td>
                      <td className="py-6">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{sub.planName}</span>
                      </td>
                      <td className="py-6 font-black text-slate-900">₹{sub.amount.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-blue-600 p-12 rounded-[56px] text-white shadow-2xl shadow-blue-600/30 group">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 italic">Infrastructure MRR</p>
               <h4 className="text-5xl font-black italic tracking-tighter">₹75,000</h4>
               <div className="mt-8 pt-8 border-t border-white/10 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest">Growth Factor</span>
                  <span className="text-xl font-black italic">+18% MoM</span>
               </div>
            </div>
            <div className="bg-slate-900 p-12 rounded-[56px] text-white shadow-2xl group">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-2 italic">System ROI Lift</p>
               <h4 className="text-5xl font-black italic tracking-tighter">1.82x</h4>
               <p className="text-[10px] text-slate-500 font-bold mt-6 uppercase tracking-widest leading-relaxed">Automation offsets 142 labor hours per node.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[64px] border border-slate-200 p-16 shadow-xl relative overflow-hidden group h-fit sticky top-24">
           <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50/50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-700"></div>
           <div className="text-center space-y-10">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] italic">Settlement Portal</span>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic leading-none">Collect AMC <br/> Directly</h3>
              </div>
              
              <div className="aspect-square w-full bg-slate-50 rounded-[48px] flex items-center justify-center border-2 border-dashed border-slate-200 relative overflow-hidden hover:border-blue-400 transition-all cursor-pointer">
                 <div className="absolute inset-0 flex items-center justify-center opacity-5 text-8xl font-black -rotate-12">PAY</div>
                 <div className="bg-white p-6 rounded-[32px] shadow-2xl relative z-10 border border-slate-100">
                    <div className="w-32 h-32 bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-white font-black text-[10px] uppercase text-center p-4">
                      <div className="text-2xl mb-2">📸</div>
                      Scan QR to <br/> Pay
                    </div>
                 </div>
              </div>

              <div className="space-y-4 text-left p-10 bg-slate-50 rounded-[40px] border border-slate-100 shadow-inner">
                 <div className="space-y-1 group/item">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic group-hover/item:text-blue-500 transition-colors">Bank Node Name</p>
                   <p className="text-md font-black text-slate-800">[Your Real Bank Name]</p>
                 </div>
                 <div className="space-y-1 group/item">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic group-hover/item:text-blue-500 transition-colors">Account Routing</p>
                   <p className="text-md font-black text-slate-800">IFSC: [Your IFSC Code]</p>
                 </div>
                 <div className="space-y-1 group/item">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic group-hover/item:text-blue-500 transition-colors">A/C Identifier</p>
                   <p className="text-md font-black text-slate-800">NO: [Your Account Number]</p>
                 </div>
              </div>

              <div className="pt-4 space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                  Platform protocol: Settle first, then sync. Dispatch receipt via WhatsApp bridge.
                </p>
                <button className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/20">
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
