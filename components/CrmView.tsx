
import React, { useState, useEffect } from 'react';
import { Deal, DealNote, DealTask } from '../types';
import { ICONS } from '../constants';
import { dealOperations, noteOperations, taskOperations } from '../services/crmService';

interface CrmViewProps {
  deals: Deal[];
  onMoveDeal?: (id: string, direction: 'forward' | 'backward') => void;
  onUpdateDeal?: (deal: Deal) => void;
}

// Remove the props since we'll fetch data directly from InsForge
const CrmView: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);

useEffect(() => {
    loadDeals();
  }, []);

  const loadDeals = async () => {
    setLoading(true);
    try {
      const fetchedDeals = await dealOperations.getAll();
      setDeals(fetchedDeals);
    } catch (error) {
      console.error('Error loading deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const stages: Deal['stage'][] = ['Discovered', 'Contacted', 'Engaged', 'Qualified', 'Converted'];
  
  const getStageDeals = (stage: Deal['stage']) => deals.filter(d => d.stage === stage);
  const getStageValue = (stage: Deal['stage']) => getStageDeals(stage).reduce((acc, d) => acc + d.value, 0);

  const handleAddNote = async (deal: Deal) => {
    const text = prompt("Enter Note Text:");
    if (!text) return;
    
    try {
      const newNote = await noteOperations.create(deal.id, text, "Founder");
      if (newNote) {
        // Refresh the selected deal with the new note
        const updatedDeal = await dealOperations.getById(deal.id);
        if (updatedDeal) {
          setSelectedDeal(updatedDeal);
          // Also refresh the deals list
          loadDeals();
        }
      }
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleAddTask = async (deal: Deal) => {
    const title = prompt("Task Title:");
    if (!title) return;
    
    try {
      const newTask = await taskOperations.create(deal.id, title);
      if (newTask) {
        // Refresh the selected deal with the new task
        const updatedDeal = await dealOperations.getById(deal.id);
        if (updatedDeal) {
          setSelectedDeal(updatedDeal);
          // Also refresh the deals list
          loadDeals();
        }
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleMoveDeal = async (id: string, direction: 'forward' | 'backward') => {
    try {
      const success = await dealOperations.moveStage(id, direction);
      if (success) {
        // Refresh the deals list
        loadDeals();
        // If we're viewing this deal, refresh it too
        if (selectedDeal && selectedDeal.id === id) {
          const updatedDeal = await dealOperations.getById(id);
          if (updatedDeal) {
            setSelectedDeal(updatedDeal);
          }
        }
      }
    } catch (error) {
      console.error('Error moving deal:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center px-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tighter italic">AI Deal Pipeline</h2>
          <p className="text-slate-500 mt-1 font-medium">Synced with InsForge Infrastructure Node: 01144a09</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white border border-slate-200 rounded-[24px] px-6 py-4 flex items-center gap-8 shadow-sm">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Pipeline</p>
              <p className="text-2xl font-black text-slate-900 tracking-tighter">₹{deals.reduce((acc, d) => acc + d.value, 0).toLocaleString('en-IN')}</p>
            </div>
          </div>
          <button 
            onClick={async () => {
              // Simple deal creation for demo
              const businessName = prompt("Business Name:");
              if (!businessName) return;
              
              const newDeal = await dealOperations.create({
                businessName,
                value: 10000,
                stage: 'Discovered'
              });
              
              if (newDeal) {
                loadDeals(); // Refresh the list
              }
            }}
            className="bg-blue-600 text-white px-8 py-4 rounded-[20px] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all"
          >
            + Manual Deal
          </button>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-8 snap-x scrollbar-hide">
        {stages.map((stage) => {
          const stageDeals = getStageDeals(stage);
          const value = getStageValue(stage);
          return (
            <div key={stage} className="min-w-[340px] flex-1 snap-start space-y-5">
              <div className="flex justify-between items-center px-6">
                <div className="flex items-center gap-3">
                  <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">{stage}</h3>
                  <span className="bg-slate-200 text-slate-700 text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full shadow-inner">{stageDeals.length}</span>
                </div>
                <p className="text-[10px] font-black text-slate-400 tracking-widest">₹{(value / 1000).toFixed(1)}k</p>
              </div>
              
              <div className={`space-y-4 min-h-[550px] rounded-[48px] p-4 border border-dashed transition-colors ${stage === 'Converted' ? 'bg-green-50/40 border-green-200' : 'bg-slate-100/30 border-slate-200'}`}>
                {stageDeals.map((deal) => (
                  <div key={deal.id} 
                    onClick={() => setSelectedDeal(deal)}
                    className="bg-white p-7 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-slate-800 leading-tight text-lg group-hover:text-blue-600 transition-colors">{deal.businessName}</h4>
                    </div>
                    
                    <div className="space-y-1 mb-4">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        {deal.service_tier || 'Tier 1 - Digital Presence'}
                      </p>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-bold text-blue-600 capitalize">
                           {(deal.pitch_type || 'Custom Automation').replace('_', ' ')}
                         </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-end mt-4">
                      <div className="text-2xl font-black text-slate-900 tracking-tighter">₹{deal.value.toLocaleString('en-IN')}</div>
                      <div className="flex gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleMoveDeal(deal.id, 'forward'); }}
                          disabled={stage === stages[stages.length - 1]}
                          className="w-8 h-8 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 disabled:opacity-30 shadow-sm transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDeal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[600] flex items-center justify-center p-10">
          <div className="bg-white rounded-[56px] w-full max-w-4xl max-h-[90vh] overflow-y-auto p-12 shadow-2xl animate-in zoom-in-95 relative border border-white/20">
            <button onClick={() => setSelectedDeal(null)} className="absolute top-10 right-10 text-slate-400 hover:text-slate-900 transition-colors p-2">✕</button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-10">
                <div>
                  <h3 className="text-5xl font-black text-slate-900 tracking-tighter italic leading-none">{selectedDeal.businessName}</h3>
                  <div className="mt-6 flex gap-3">
                     <span className="text-[10px] font-black uppercase tracking-widest bg-blue-600 text-white px-4 py-1.5 rounded-full">{selectedDeal.stage}</span>
                     <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full">₹{selectedDeal.value.toLocaleString()}</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 italic">Timeline & Notes</h4>
                    <button onClick={() => handleAddNote(selectedDeal)} className="text-[10px] font-black text-blue-600 uppercase tracking-widest">+ Add Note</button>
                  </div>
                  <div className="space-y-4">
                    {(selectedDeal.notes || []).length > 0 ? selectedDeal.notes?.map(note => (
                      <div key={note.id} className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                        <p className="text-sm font-medium text-slate-800 italic leading-relaxed">"{note.text}"</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase mt-4">{note.author} • {new Date(note.created_at).toLocaleDateString()}</p>
                      </div>
                    )) : (
                      <div className="text-center py-12 bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Notes logged.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-10">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 italic">Action Items</h4>
                    <button onClick={() => handleAddTask(selectedDeal)} className="text-[10px] font-black text-blue-600 uppercase tracking-widest">+ Create Task</button>
                  </div>
                  <div className="space-y-3">
                    {(selectedDeal.tasks || []).map(task => (
                      <div key={task.id} className="flex items-center justify-between p-6 bg-white border border-slate-200 rounded-[28px] hover:border-blue-200 transition-all">
                        <div className="flex items-center gap-4">
                           <input 
                             type="checkbox" 
                             checked={task.is_completed} 
                             onChange={async (e) => {
                               // Update task completion status
                               await taskOperations.update(task.id, { is_completed: e.target.checked });
                               // Refresh the selected deal
                               const updatedDeal = await dealOperations.getById(selectedDeal.id);
                               if (updatedDeal) {
                                 setSelectedDeal(updatedDeal);
                               }
                             }}
                             className="w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-600" 
                           />
                           <span className={`text-sm font-bold ${task.is_completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>{task.title}</span>
                        </div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(task.due_date).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#0f172a] p-10 rounded-[48px] text-white shadow-xl relative overflow-hidden">
                   <div className="relative z-10">
                     <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2 italic">Neural Signal Handshake</p>
                     <p className="text-xs font-bold leading-relaxed opacity-80">This deal is synced to InsForge project node JSK8SNXZ. Attachments are stored in the secure cloud vault.</p>
                     <div className="mt-8 flex gap-3">
                        <button className="flex-1 bg-white text-slate-900 font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest">View Files</button>
                        <button className="flex-1 bg-blue-600 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest">Sync CRM</button>
                     </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrmView;
