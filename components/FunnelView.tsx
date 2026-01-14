
import React from 'react';
import { Lead } from '../types';

interface FunnelViewProps {
  leads: Lead[];
}

const FunnelView: React.FC<FunnelViewProps> = ({ leads }) => {
  const getStageCount = (status: string) => leads.filter(l => l.status === status).length;

  const stages = [
    { label: 'Ingestion', count: 1420, velocity: 'High', color: 'bg-blue-600' },
    { label: 'AI Validation', count: 380, velocity: 'Medium', color: 'bg-indigo-600' },
    { label: 'Agentic Score', count: 95, velocity: 'High', color: 'bg-purple-600' },
    { label: 'Closed Node', count: 42, velocity: 'Optimized', color: 'bg-slate-900' },
  ];

  return (
    <div className="space-y-12 animate-in zoom-in-95 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tighter">System Velocity Map</h2>
          <p className="text-slate-500 mt-1 font-medium">Orchestration telemetry across the Fractal Decision Layer.</p>
        </div>
      </div>

      <div className="bg-white p-20 rounded-[64px] border border-slate-200 shadow-sm overflow-hidden relative">
        {/* Fractal Background Grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="relative flex flex-col gap-12 max-w-4xl mx-auto">
          {stages.map((stage, i) => (
            <div key={i} className="flex items-center gap-12 group">
               <div className="w-40 shrink-0 text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stage {i + 1}</p>
                  <h4 className="text-lg font-black text-slate-900">{stage.label}</h4>
               </div>
               
               <div className="flex-1 relative h-20 bg-slate-50 rounded-full border border-slate-100 flex items-center px-10">
                  <div 
                    className={`absolute left-0 top-0 h-full ${stage.color} rounded-full transition-all duration-1000 shadow-xl`} 
                    style={{ width: `${100 - i * 20}%`, opacity: 0.8 }}
                  ></div>
                  <div className="relative z-10 flex justify-between w-full">
                     <span className="text-white font-black text-xl italic">{stage.count} Nodes</span>
                     <span className="text-white/50 text-[10px] font-black uppercase tracking-[0.3em]">{stage.velocity} Velocity</span>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
         <div className="bg-[#0f172a] p-12 rounded-[56px] text-white">
            <h3 className="text-2xl font-black italic mb-8">AI Governance Logic</h3>
            <div className="space-y-6 font-mono text-[10px] text-slate-400">
               <p className="border-l-2 border-blue-600 pl-4 py-1">Executing Neural Pathfinding: [SUCCESS]</p>
               <p className="border-l-2 border-blue-600 pl-4 py-1">Validating Market Signals: [142 Gaps Found]</p>
               <p className="border-l-2 border-blue-600 pl-4 py-1">Optimizing ROI Curve: [98.2% Accuracy]</p>
            </div>
         </div>
         <div className="bg-blue-600 p-12 rounded-[56px] text-white flex flex-col justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Enterprise Infographic</p>
            <h4 className="text-4xl font-black tracking-tighter">Scale Your Intelligence.</h4>
            <div className="mt-8 flex gap-4">
               {[...Array(4)].map((_, i) => (
                 <div key={i} className="w-8 h-8 rounded-lg bg-white/20 border border-white/20 flex items-center justify-center">
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
};

export default FunnelView;
