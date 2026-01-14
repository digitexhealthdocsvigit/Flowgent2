
import React from 'react';
import { Project } from '../types';
import { ICONS } from '../constants';

interface ClientDashboardProps {
  projects: Project[];
  leadStats: { score: number; rank: string };
  activityLogs: { msg: string; time: string }[];
}

const HealthRadar: React.FC<{ metrics: any }> = ({ metrics = { presence: 80, automation: 45, seo: 60, capture: 30 } }) => {
  // SVG Radar logic
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
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Grid lines */}
        <circle cx={center} cy={center} r={radius} fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx={center} cy={center} r={radius/2} fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
        <line x1={center - radius} y1={center} x2={center + radius} y2={center} stroke="#e2e8f0" strokeWidth="1" />
        <line x1={center} y1={center - radius} x2={center} y2={center + radius} stroke="#e2e8f0" strokeWidth="1" />
        
        {/* Data Path */}
        <path d={pathData} fill="rgba(37, 99, 235, 0.2)" stroke="#2563eb" strokeWidth="2" className="animate-in fade-in zoom-in duration-1000" />
        
        {/* Labels */}
        {points.map((p, i) => (
          <text key={i} x={p.x} y={p.y > center ? p.y + 15 : p.y - 10} textAnchor="middle" className="text-[10px] font-black uppercase tracking-tighter fill-slate-400">
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  );
};

const ClientDashboard: React.FC<ClientDashboardProps> = ({ projects, leadStats }) => {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Growth Command</h2>
          <p className="text-slate-500 mt-1 font-medium">Fractal Intelligence Layer: Decision Science Active.</p>
        </div>
        <div className="bg-slate-900 text-white px-8 py-4 rounded-2xl flex items-center gap-4">
           <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
           <span className="text-[10px] font-black uppercase tracking-widest">System ROI: +34% Projected</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm flex flex-col items-center justify-center">
           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Business Health Radar</p>
           <HealthRadar metrics={{ presence: 78, automation: 92, seo: 45, capture: 60 }} />
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { label: 'Intelligence Depth', value: 'Quantum', color: 'text-blue-600' },
             { label: 'Automation Velocity', value: '0.82s', color: 'text-green-600' },
             { label: 'Decision Nodes', value: '14 Active', color: 'text-purple-600' }
           ].map((stat, i) => (
             <div key={i} className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
                <h3 className={`text-4xl font-black text-slate-900 tracking-tighter`}>{stat.value}</h3>
                <div className="w-full bg-slate-100 h-1 rounded-full mt-6">
                  <div className={`h-full bg-blue-600 rounded-full w-[${70 + i * 10}%]`}></div>
                </div>
             </div>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white rounded-[56px] border border-slate-200 p-12 shadow-sm">
          <h3 className="text-2xl font-black text-slate-900 mb-10 tracking-tight italic">Engineering Roadmap</h3>
          <div className="space-y-8">
            {projects.map((p) => (
              <div key={p.id} className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm group-hover:scale-110 transition-transform">
                     <span className="text-xl font-black">P{p.id.slice(-1)}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 tracking-tight">{p.name}</h4>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{p.status} • {p.progress}% Completeness</p>
                  </div>
                </div>
                <button className="text-[10px] font-black uppercase tracking-widest px-6 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-900 hover:text-white transition-all">Audit Module</button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0f172a] rounded-[56px] p-12 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
           <div>
             <h4 className="text-3xl font-black tracking-tighter italic">Predictive ROI <br/> Infographic</h4>
             <div className="mt-10 space-y-4">
                {[
                  { label: 'Year 1 Impact', val: '₹14.2L' },
                  { label: 'Efficiency Gain', val: '220%' },
                  { label: 'Scale Potential', val: 'Global' }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between border-b border-white/10 pb-4">
                     <span className="text-slate-400 text-xs font-medium">{item.label}</span>
                     <span className="font-black text-blue-400">{item.val}</span>
                  </div>
                ))}
             </div>
           </div>
           <div className="mt-12">
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-blue-500 mb-4">Neural Architecture</p>
              <div className="flex gap-2">
                 {[...Array(6)].map((_, i) => (
                   <div key={i} className={`h-8 flex-1 rounded-sm bg-blue-600 transition-all`} style={{ opacity: 0.1 * (i + 1), height: `${20 + Math.random() * 30}px` }}></div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
