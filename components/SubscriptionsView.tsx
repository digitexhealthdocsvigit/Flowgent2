
import React from 'react';
import { Subscription } from '../types';

interface SubscriptionsViewProps {
  subscriptions: Subscription[];
}

const SubscriptionsView: React.FC<SubscriptionsViewProps> = ({ subscriptions }) => {
  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tighter">Recurring Revenue (AMC)</h2>
          <p className="text-slate-500 mt-1 font-medium">Managing Digitex Studio long-term automation retainers.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total MRR</p>
            <p className="text-xl font-black text-slate-900">₹{subscriptions.filter(s => s.status === 'active').reduce((acc, s) => acc + s.amount, 0).toLocaleString('en-IN')}</p>
          </div>
          <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20">+ Add Subscription</button>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Client Name</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Plan</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Next Billing</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <p className="font-bold text-slate-800">{sub.clientName}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">ID: {sub.id}</p>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border ${
                    sub.planName === 'Business Ops Pro' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                    sub.planName === 'Growth Automation' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                    'bg-slate-50 text-slate-600 border-slate-100'
                  }`}>
                    {sub.planName}
                  </span>
                </td>
                <td className="px-8 py-6 font-black text-slate-900">₹{sub.amount.toLocaleString('en-IN')}</td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${sub.status === 'active' ? 'bg-green-500' : sub.status === 'paused' ? 'bg-orange-400' : 'bg-red-400'}`}></div>
                    <span className="text-xs font-bold text-slate-600 capitalize">{sub.status}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-sm font-medium text-slate-500">{sub.nextBilling}</td>
                <td className="px-8 py-6 text-right">
                  <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Projected Annual Revenue', value: '₹14.2 Lakh', icon: '📈' },
          { label: 'Customer Lifetime Value', value: '₹1.8 Lakh', icon: '💎' },
          { label: 'Churn Rate (Q4)', value: '1.2%', icon: '📉' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm flex items-center gap-6">
            <span className="text-4xl">{stat.icon}</span>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h4 className="text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionsView;
