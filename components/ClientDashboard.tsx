
import React from 'react';
import { Project, DecisionNode } from '../types';
import DecisionScienceView from './DecisionScienceView';

interface ClientDashboardProps {
  projects: Project[];
  leadStats: { score: number; rank: string };
  activityLogs: { msg: string; time: string }[];
  decisionLogic?: DecisionNode[];
}

const HealthRadar: React.FC<{ metrics: any }> = ({ metrics = { presence: 80, automation: 45, seo: 60, capture: 30 } }) => {
  const size = 200;
  const center = size / 2;
  const radius = 80;
  
  const points = [
    { x: center, y: center - (radius * (metrics.presence / 100)), label: 'Presence' },
    { x: center + (radius * (metrics.automation / 100)), y: center, label: 'Auto' },
    { x: center, y: center + (radius * (metrics.seo / 100)), label: 'SEO' },
    { x: center - (radius * (metrics.capture / 100)), y: center, label: 'Capture' }
  ];

  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div className="flex flex-col items-center group">
      <svg width={size} height={size} className="overflow-visible">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx={center} cy={center} r={radius/2} fill="none" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
        <line x1={center - radius} y1={center} x2={center + radius} y2={center} stroke="#f1f5f9" strokeWidth="1" />
        <line x1={center} y1={center - radius} x2={center} y2={center + radius} stroke="#f1f5f9" strokeWidth="1" />
        
        <path d={pathData} fill="rgba(37, 99, 235, 0.25)" stroke="#2563eb" strokeWidth="3" className="animate-in fade-in zoom-in duration-1000 group-hover:fill-blue-600/30 transition-all" />
        
        {points.map((p, i) => (
          <text key={i} x={p.x} y={p.y > center ? p.y + 15 : p.y - 10} textAnchor="middle" className="text-[10px] font-black uppercase tracking-widest fill-slate-400 italic">
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  );
};

const ClientDashboard: React.FC<ClientDashboardProps> = ({ projects, leadStats, decisionLogic }) => {
  // Fallback decision nodes if none provided
  const defaultNodes: DecisionNode[] = [
    { factor: "Market Presence", impact: "high", reasoning: "Digital node detected as inactive in tier-1 location." },
    { factor: "Inquiry Leakage", impact: "medium", reasoning: "High volume sector with zero automated capture tools." }
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic">Intelligence Command</h2>
          <p className="text-slate-500 mt-2 font-medium">Neural Flow Layer: 0x82 Active Nodes Dispatching Signals.</p>
        </div>
        <div className="bg-[#0f172a] text-white px-10 py-5 rounded-[32px] flex items-center gap-6 shadow-2xl">
           <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(37,99,235,1)]"></div>
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400">ROI Potential: +₹1.2M Lift</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="bg-white p-12 rounded-[56px] border border-slate-200 shadow-sm flex flex-col items-center justify-center">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 italic">Health Matrix</p>
           <HealthRadar metrics={{ presence: 82, automation: 95, seo: 54, capture: 70 }} />
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-10">
           {[
             { label: 'System Logic Gap', value: '4 Nodes', color: 'text-red-600' },
             { label: 'Automation Velocity', value: '98%', color: 'text-blue-600' },
             { label: 'Scale Efficiency', value: '1.82x', color: 'text-slate-900' }
           ].map((stat, i) => (
             <div key={i} className="bg-white p-12 rounded-[56px] border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-slate-50 rounded-bl-full opacity-50 group-hover:scale-110 transition-transform"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 italic">{stat.label}</p>
                <h3 className={`text-5xl font-black ${stat.color} tracking-tighter italic`}>{stat.value}</h3>
                <div className="w-full bg-slate-100 h-1 rounded-full mt-10 overflow-hidden">
                  <div className={`h-full bg-blue-600 rounded-full transition-all duration-1000`} style={{ width: `${60 + i * 15}%` }}></div>
                </div>
             </div>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <div className="bg-white rounded-[64px] border border-slate-200 p-16 shadow-sm">
            <h3 className="text-3xl font-black text-slate-900 mb-12 tracking-tight italic">Engineering Roadmap</h3>
            <div className="space-y-10">
              {projects.map((p) => (
                <div key={p.id} className="p-10 bg-slate-50 rounded-[48px] border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-all hover:bg-white hover:shadow-xl">
                  <div className="flex items-center gap-8">
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center border border-slate-200 shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all">
                       <span className="text-2xl font-black">0{p.id.slice(-1)}</span>
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-xl tracking-tight italic">{p.name}</h4>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">{p.status} • Node Sync: {p.progress}%</p>
                    </div>
                  </div>
                  <button className="text-[10px] font-black uppercase tracking-[0.2em] px-8 py-4 bg-white border border-slate-200 rounded-2xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm">Inspect Node</button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[64px] border border-slate-200 p-16 shadow-sm">
             <DecisionScienceView nodes={decisionLogic || defaultNodes} />
          </div>
        </div>

        <div className="bg-[#0f172a] rounded-[64px] p-16 text-white shadow-[0_40px_100px_-10px_rgba(15,23,42,0.6)] relative overflow-hidden flex flex-col justify-between group h-fit sticky top-24">
           <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-blue-600/10 rounded-full blur-[80px]"></div>
           <div className="relative z-10">
             <h4 className="text-4xl font-black tracking-tighter italic leading-none">Predictive <br/> ROI Module</h4>
             <p className="text-slate-400 font-medium text-xs mt-4 leading-relaxed">System-calculated projections based on 0x82 active growth signals.</p>
             
             <div className="mt-12 space-y-6">
                {[
                  { label: 'Projected Net Gain', val: '₹14.2L /yr' },
                  { label: 'Throughput Increase', val: '+240%' },
                  { label: 'Labor Offset', val: '142 hrs' }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between border-b border-white/5 pb-6">
                     <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                     <span className="font-black text-blue-500 italic text-xl tracking-tight">{item.val}</span>
                  </div>
                ))}
             </div>
           </div>
           
           <div className="mt-16 pt-12 border-t border-white/5">
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 mb-6 italic">Neural Telemetry</p>
              <div className="flex gap-1.5 h-12 items-end">
                 {[...Array(12)].map((_, i) => (
                   <div key={i} className={`flex-1 rounded-sm bg-blue-600 transition-all duration-700 animate-pulse`} style={{ opacity: 0.1 * (i + 1), height: `${30 + Math.random() * 70}%`, animationDelay: `${i * 0.1}s` }}></div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
