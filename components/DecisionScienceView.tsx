
import React from 'react';
import { DecisionNode } from '../types';

interface DecisionScienceViewProps {
  nodes: DecisionNode[];
}

const DecisionScienceView: React.FC<DecisionScienceViewProps> = ({ nodes }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Neural Decision Tree</h3>
      <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-slate-200 before:border-l before:border-dashed before:border-slate-300">
        {nodes.map((node, i) => (
          <div key={i} className="relative">
            <div className={`absolute -left-[25px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm z-10 ${
              node.impact === 'high' ? 'bg-red-500 shadow-red-200' : 
              node.impact === 'medium' ? 'bg-blue-500 shadow-blue-200' : 'bg-slate-300'
            }`}></div>
            <div className="bg-slate-50 border border-slate-100 p-6 rounded-[28px] group hover:border-blue-200 transition-all">
               <div className="flex justify-between items-center mb-2">
                  <h4 className="font-black text-slate-900 text-sm tracking-tight">{node.factor}</h4>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                    node.impact === 'high' ? 'bg-red-100 text-red-600' : 
                    node.impact === 'medium' ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {node.impact} Impact
                  </span>
               </div>
               <p className="text-xs text-slate-600 font-medium leading-relaxed italic">"{node.reasoning}"</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DecisionScienceView;
