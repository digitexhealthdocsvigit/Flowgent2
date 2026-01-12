import React from 'react';
import { Deal } from '../types';
import { ICONS } from '../constants';

interface CrmViewProps {
  deals: Deal[];
  onMoveDeal?: (id: string, direction: 'forward' | 'backward') => void;
}

const CrmView: React.FC<CrmViewProps> = ({ deals, onMoveDeal }) => {
  const stages: Deal['stage'][] = ['new', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
  
  const getStageDeals = (stage: Deal['stage']) => deals.filter(d => d.stage === stage);
  const getStageValue = (stage: Deal['stage']) => getStageDeals(stage).reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tighter">Deal Pipeline</h2>
          <p className="text-slate-500 mt-1 font-medium">Managing Digitex Studio automated system sales cycles.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white border border-slate-200 rounded-[24px] px-6 py-4 flex items-center gap-8 shadow-sm">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Pipeline</p>
              <p className="text-2xl font-black text-slate-900 tracking-tighter">₹{deals.reduce((acc, d) => acc + d.value, 0).toLocaleString('en-IN')}</p>
            </div>
            <div className="w-px h-10 bg-slate-100"></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Deals</p>
              <p className="text-2xl font-black text-slate-900 tracking-tighter">{deals.length}</p>
            </div>
          </div>
          <button className="bg-blue-600 text-white px-8 py-4 rounded-[20px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all">+ New Deal</button>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-8 snap-x scrollbar-hide">
        {stages.map((stage) => {
          const stageDeals = getStageDeals(stage);
          const value = getStageValue(stage);
          return (
            <div key={stage} className="min-w-[340px] flex-1 snap-start space-y-5">
              <div className="flex justify-between items-center px-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 capitalize">{stage}</h3>
                  <span className="bg-slate-200 text-slate-700 text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full shadow-inner">{stageDeals.length}</span>
                </div>
                <p className="text-[10px] font-black text-slate-400 tracking-widest">₹{(value / 1000).toFixed(1)}k</p>
              </div>
              
              <div className={`space-y-4 min-h-[500px] rounded-[40px] p-4 border border-dashed transition-colors ${stage === 'won' ? 'bg-green-50/30 border-green-200' : 'bg-slate-100/30 border-slate-200'}`}>
                {stageDeals.map((deal) => (
                  <div key={deal.id} className="bg-white p-7 rounded-[28px] border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-default group relative overflow-hidden">
                    {stage === 'won' && <div className="absolute top-0 right-0 p-3 text-green-500 opacity-20"><ICONS.Check /></div>}
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-800 leading-tight text-lg group-hover:text-blue-600 transition-colors">{deal.businessName}</h4>
                    </div>
                    
                    <div className="space-y-1 mb-4">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        {deal.service_tier || 'Infrastructure Tier TBD'}
                      </p>
                      <p className="text-[10px] font-bold text-blue-600 capitalize">
                         <span className="text-[8px] text-slate-300 mr-1 uppercase">Recommended:</span>
                         {(deal.pitch_type || 'Custom Automation').replace('_', ' ')}
                      </p>
                    </div>

                    <div className="flex justify-between items-end mt-4">
                      <div>
                        <div className="text-2xl font-black text-slate-900 tracking-tighter">₹{deal.value.toLocaleString('en-IN')}</div>
                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Updated {deal.updatedAt.split('T')[0]}</div>
                      </div>
                      
                      <div className="flex gap-1">
                        {onMoveDeal && (
                          <>
                            <button 
                              onClick={() => onMoveDeal(deal.id, 'backward')}
                              disabled={stage === stages[0]}
                              className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 disabled:opacity-30"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                            </button>
                            <button 
                              onClick={() => onMoveDeal(deal.id, 'forward')}
                              disabled={stage === stages[stages.length - 1]}
                              className="w-8 h-8 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-30 shadow-sm"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {stageDeals.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-40 space-y-3">
                    <div className="w-12 h-12 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-200">
                      <ICONS.CRM />
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">Stage Empty</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CrmView;