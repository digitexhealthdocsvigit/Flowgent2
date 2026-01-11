
import React from 'react';

const ReportsView: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">Performance Analytics</h2>
          <p className="text-slate-500 mt-1 font-medium italic">Data-driven insights into your business automation ROI.</p>
        </div>
        <button className="bg-white border border-slate-200 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors">Download PDF Report</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
          <h3 className="font-bold text-xl text-slate-800 mb-8">Lead Conversion Trend</h3>
          <div className="h-64 flex items-end justify-between gap-4">
            {[45, 60, 40, 80, 55, 90, 75].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-4">
                <div 
                  className="w-full bg-blue-600 rounded-t-xl transition-all duration-1000" 
                  style={{ height: `${h}%`, opacity: 0.3 + (i * 0.1) }}
                ></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Day {i+1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-bold">Automation Efficiency</h3>
            <p className="text-slate-400 text-sm mt-2">Tracking time saved via automated follow-ups.</p>
          </div>
          <div className="mt-8 flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="8"/>
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#2563eb" strokeWidth="8" strokeDasharray="251.2" strokeDashoffset="50.24" strokeLinecap="round"/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black">82%</span>
                <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Response Rate</span>
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-slate-400 font-medium mt-6">System saved 42 manual work hours this week.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <h3 className="font-bold text-xl text-slate-800 mb-6">Regional Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { region: 'North India', leads: 420, conversion: '12%' },
            { region: 'South India', leads: 850, conversion: '18%' },
            { region: 'International', leads: 120, conversion: '24%' },
          ].map((r, i) => (
            <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{r.region}</p>
              <div className="flex justify-between items-end mt-4">
                <div>
                  <h4 className="text-2xl font-black text-slate-900">{r.leads}</h4>
                  <p className="text-xs text-slate-500 font-medium">Monthly Leads</p>
                </div>
                <div className="text-right">
                  <span className="text-green-600 font-black">{r.conversion}</span>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">CVR</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
