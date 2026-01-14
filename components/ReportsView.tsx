
import React from 'react';

const ReportsView: React.FC = () => {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic leading-none">Intelligence Hub</h2>
          <p className="text-slate-500 mt-4 font-bold text-lg">Infrastructure Reports: Quantifying Neural Growth & Scaling.</p>
        </div>
        <button className="bg-white border border-slate-200 px-8 py-4 rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">Export Data Node</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white p-12 rounded-[56px] border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="font-black text-2xl text-slate-900 tracking-tight italic">Velocity Intelligence</h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100">Live: lead_velocity_index</span>
          </div>
          <div className="h-64 flex items-end justify-between gap-6">
            {[
              { label: 'Scored', val: 92, color: 'bg-blue-600' },
              { label: 'Converted', val: 45, color: 'bg-indigo-600' },
              { label: 'Hot', val: 78, color: 'bg-blue-400' },
              { label: 'Lost', val: 12, color: 'bg-slate-200' },
              { label: 'New', val: 65, color: 'bg-blue-500' }
            ].map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                <div 
                  className={`w-full ${d.color} rounded-2xl transition-all duration-1000 group-hover:scale-x-105 shadow-lg group-hover:shadow-blue-500/20`} 
                  style={{ height: `${d.val}%`, opacity: 0.8 }}
                ></div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0f172a] p-12 rounded-[56px] text-white shadow-2xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <svg width="120" height="120" viewBox="0 0 100 100"><circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="2" strokeDasharray="10 10"/></svg>
          </div>
          <div>
            <h3 className="text-3xl font-black italic tracking-tighter">Automation <br/> Efficiency</h3>
            <p className="text-slate-400 text-xs mt-4 font-medium leading-relaxed">System-calculated throughput saving 42 manual hours/week.</p>
          </div>
          <div className="mt-8 flex items-center justify-center">
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12"/>
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#2563eb" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="50.24" strokeLinecap="round" className="animate-in fade-in duration-1000"/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black italic">82%</span>
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500">Node Sync</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[56px] border border-slate-200 p-12 shadow-sm">
        <h3 className="font-black text-2xl text-slate-900 mb-10 italic tracking-tight">Regional Node Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { region: 'Mumbai Node', leads: 420, conversion: '12%', color: 'border-blue-100' },
            { region: 'Bangalore Node', leads: 850, conversion: '18%', color: 'border-blue-100' },
            { region: 'Cloud Cluster', leads: 120, conversion: '24%', color: 'border-indigo-100' },
          ].map((r, i) => (
            <div key={i} className={`p-10 bg-slate-50 rounded-[40px] border ${r.color} group hover:bg-white hover:shadow-xl transition-all`}>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic mb-6">{r.region}</p>
              <div className="flex justify-between items-end">
                <div>
                  <h4 className="text-4xl font-black text-slate-900 italic tracking-tighter">{r.leads}</h4>
                  <p className="text-xs text-slate-500 font-bold mt-1">Monthly Ingest</p>
                </div>
                <div className="text-right">
                  <span className="text-blue-600 font-black text-xl italic">{r.conversion}</span>
                  <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">CVR LIFT</p>
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
