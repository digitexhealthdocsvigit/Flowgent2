
import React from 'react';
import { Lead } from '../types';

interface FunnelViewProps {
  leads: Lead[];
}

const FunnelView: React.FC<FunnelViewProps> = ({ leads }) => {
  const stages = [
    { label: 'Neural Ingestion', count: 1240, velocity: 'Critical', color: 'bg-blue-600' },
    { label: 'Discovery Node', count: 420, velocity: 'Nominal', color: 'bg-indigo-600' },
    { label: 'Logic Validation', count: 185, velocity: 'High', color: 'bg-purple-600' },
    { label: 'System Integration', count: 42, velocity: 'Complete', color: 'bg-slate-900' },
  ];

  return (
    <div className="space-y-16 animate-in zoom-in-95 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-6xl font-black text-slate-900 tracking-tighter italic leading-none">Velocity Map</h2>
          <p className="text-slate-500 mt-4 font-bold text-lg">Infrastructure Telemetry: Monitoring Flow Inefficiency across Nodes.</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-slate-100 p-6 rounded-3xl border border-slate-200">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Throughput</p>
              <p className="text-2xl font-black text-slate-900 tracking-tighter italic">1,887 Nodes</p>
           </div>
        </div>
      </div>

      <div className="bg-white p-24 rounded-[80px] border border-slate-200 shadow-sm overflow-hidden relative">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(#000 1.5px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        
        <div className="relative flex flex-col gap-16 max-w-5xl mx-auto">
          {stages.map((stage, i) => (
            <div key={i} className="flex items-center gap-16 group">
               <div className="w-48 shrink-0 text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-2 italic">Node Stage 0{i + 1}</p>
                  <h4 className="text-2xl font-black text-slate-900 italic tracking-tight">{stage.label}</h4>
               </div>
               
               <div className="flex-1 relative h-24 bg-slate-50 rounded-[40px] border border-slate-100 flex items-center px-12 group-hover:border-blue-200 transition-all">
                  <div 
                    className={`absolute left-0 top-0 h-full ${stage.color} rounded-[40px] transition-all duration-1000 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)]`} 
                    style={{ width: `${100 - i * 22}%`, opacity: 0.9 }}
                  ></div>
                  <div className="relative z-10 flex justify-between w-full items-center">
                     <span className="text-white font-black text-2xl italic tracking-tighter">{stage.count} DISPATCHED</span>
                     <div className="flex items-center gap-4 bg-white/10 px-6 py-2 rounded-full backdrop-blur-sm">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                        <span className="text-white text-[10px] font-black uppercase tracking-[0.4em]">{stage.velocity}</span>
                     </div>
                  </div>
               </div>
            </div>
          ))}
          
          {/* Velocity Connectors */}
          <div className="absolute top-12 left-[208px] bottom-12 w-1 border-l-2 border-dashed border-slate-200 -z-10"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
         <div className="bg-[#0f172a] p-16 rounded-[64px] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 group-hover:scale-125 transition-transform"></div>
            <h3 className="text-3xl font-black italic mb-10 tracking-tighter">Governance Logic</h3>
            <div className="space-y-8 font-mono text-[11px] text-slate-400">
               <p className="flex gap-4 items-center"><span className="text-blue-500 font-black">NODE_01:</span> Pathfinding optimized for sector "${leads[0]?.category || 'IT'}"</p>
               <p className="flex gap-4 items-center"><span className="text-blue-500 font-black">SIG_DISP:</span> 0x82 Agentic Handshake triggered [SUCCESS]</p>
               <p className="flex gap-4 items-center"><span className="text-blue-500 font-black">VAL_GATE:</span> Privacy policy audit completed for 142 leads</p>
            </div>
         </div>
         <div className="lg:col-span-2 bg-blue-600 p-16 rounded-[64px] text-white flex flex-col justify-between shadow-2xl shadow-blue-600/30 relative overflow-hidden">
            <div className="absolute bottom-0 right-0 opacity-10">
               <svg width="400" height="400" viewBox="0 0 100 100"><circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="2" strokeDasharray="10 10"/></svg>
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-[0.5em] opacity-60 mb-4 italic">Neural Scaling</p>
               <h4 className="text-6xl font-black tracking-tighter italic leading-none">Automate your <br/> Intelligence.</h4>
            </div>
            <div className="mt-12 flex gap-6">
               {[...Array(6)].map((_, i) => (
                 <div key={i} className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center group hover:bg-white hover:text-blue-600 transition-all cursor-crosshair">
                    <div className="w-1.5 h-1.5 bg-white rounded-full group-hover:bg-blue-600"></div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default FunnelView;
