
import React from 'react';

const AdminInfographic: React.FC = () => {
  return (
    <div className="relative h-64 w-full bg-[#0f172a] rounded-[40px] border border-white/5 overflow-hidden p-8">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#2563eb 1px, transparent 1px), linear-gradient(90deg, #2563eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      
      <div className="relative z-10 h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500 mb-1">Neural Throughput</p>
            <h4 className="text-2xl font-black text-white italic tracking-tighter">Velocity: 0.92/sec</h4>
          </div>
          <div className="flex gap-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-1 h-6 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
            ))}
          </div>
        </div>

        <div className="flex items-end gap-3 h-24">
          {[40, 70, 45, 90, 65, 80, 50, 85, 95, 60, 75, 55].map((h, i) => (
            <div key={i} className="flex-1 flex flex-col gap-1 items-center group">
              <div 
                className="w-full bg-blue-600/20 border-t-2 border-blue-500 transition-all group-hover:bg-blue-500/40" 
                style={{ height: `${h}%` }}
              ></div>
              <div className="w-1 h-1 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          ))}
        </div>

        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-500">
          <span>Node Cluster: Mumbai-01</span>
          <span className="text-green-500">Infrastructure Optimized</span>
        </div>
      </div>
    </div>
  );
};

export default AdminInfographic;
