
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import LeadCard from './components/LeadCard';
import ClientDashboard from './components/ClientDashboard';
import FunnelView from './components/FunnelView';
import CalendarView from './components/CalendarView';
import CrmView from './components/CrmView';
import ReportsView from './components/ReportsView';
import LandingPage from './components/LandingPage';
import LoginScreen from './components/LoginScreen';
import AutomationView from './components/AutomationView';
import ScraperView from './components/ScraperView';
import SubscriptionsView from './components/SubscriptionsView';
import StrategyRoom from './components/StrategyRoom';
import DecisionScienceView from './components/DecisionScienceView';
import AdminInfographic from './components/AdminInfographic';
import SettingsView from './components/SettingsView';
import PitchModal from './components/PitchModal';
import { DecisionBanner, SignalLog } from './components/AppContent';
import { MOCK_LEADS, MOCK_DEALS, MOCK_PROJECTS, MOCK_WORKFLOWS, MOCK_SUBSCRIPTIONS } from './services/mockData';
import { Lead, AuditResult, User, AuditLog, Deal } from './types';
import { generateAuditWithTools, generateVideoIntro } from './services/geminiService';
import { supabase, activeProjectRef, leadOperations, logOperations, projectOperations, subscriptionOperations } from './lib/supabase';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [viewState, setViewState] = useState<'public' | 'login' | 'dashboard'>('public');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [currentAudit, setCurrentAudit] = useState<{ lead: Lead; result: AuditResult } | null>(null);
  const [signals, setSignals] = useState<AuditLog[]>([]);
  const [webhookUrl, setWebhookUrl] = useState(() => 
    localStorage.getItem('flowgent_n8n_webhook') || 'https://n8n-production-ecc4.up.railway.app/webhook/flowgent-orchestrator'
  );
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [activePitch, setActivePitch] = useState<{ lead: Lead; pitch: string } | null>(null);
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        fetchProfile(session.user.id, session.user.email || '');
        refreshLeads();
        loadSignals();
      } else {
        setIsLoadingAuth(false);
        setLeads(MOCK_LEADS as any[]);
        setDeals(MOCK_DEALS as any[]);
      }
    };
    checkAuth();
  }, []);

  const loadSignals = async () => {
    const logs = await logOperations.getRecent();
    setSignals(logs);
  };

  const refreshLeads = async () => {
    try {
      const data = await leadOperations.getAll();
      if (data && data.length > 0) {
        setLeads(data.map((l: any) => ({
          ...l,
          business_name: l.business_name || l.businessName || 'Unknown Business',
          lead_status: l.lead_status || l.status || 'discovered',
          readiness_score: l.readiness_score || l.score || 0,
          is_hot_opportunity: l.is_hot_opportunity || (l.readiness_score > 75)
        })));
      } else {
        setLeads(MOCK_LEADS as any[]);
      }
    } catch (error) {
      console.error("Infrastructure Sync Failure:", error);
      setLeads(MOCK_LEADS as any[]);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const fetchProfile = (userId: string, email: string) => {
    const isAdmin = email.toLowerCase().includes('digitex') || email.toLowerCase().includes('founder') || email.toLowerCase().includes('vishaal');
    setCurrentUser({ id: userId, name: email.split('@')[0], email, role: isAdmin ? 'admin' : 'client', orgId: 'org-1' });
    setViewState('dashboard');
    setCurrentTab(isAdmin ? 'dashboard' : 'client_dashboard');
  };

  const triggerWebhook = async (lead: Lead) => {
    await logOperations.create({ 
      text: `Syncing: ${lead.business_name} to Orchestrator`, 
      type: 'webhook' 
    });
    loadSignals();
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          event: 'lead_captured',
          payload: lead
        })
      });
      
      if (response.ok) {
        await logOperations.create({ 
          text: `ACK: Node persistent in InsForge for ${lead.business_name}`, 
          type: 'webhook' 
        });
        loadSignals();
        refreshLeads();
      }
    } catch (e) { 
      await logOperations.create({ 
        text: `Error: Network timeout during sync for ${lead.business_name}`, 
        type: 'system' 
      });
      loadSignals();
    }
  };

  const handleMoveDeal = async (id: string, direction: 'forward' | 'backward') => {
    const stages: Deal['stage'][] = ['new', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
    const updatedDeals = deals.map(deal => {
      if (deal.id === id) {
        const currentIndex = stages.indexOf(deal.stage);
        const nextIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;
        const nextStage = stages[nextIndex] || deal.stage;
        
        // Finalize Logic
        if (nextStage === 'won' && deal.stage !== 'won') {
          finalizeDeal(deal);
        }
        
        return { ...deal, stage: nextStage, updatedAt: new Date().toISOString() };
      }
      return deal;
    });
    setDeals(updatedDeals);
  };

  const finalizeDeal = async (deal: Deal) => {
    await logOperations.create({ text: `Finalizing Infrastructure for ${deal.businessName}`, type: 'system' });
    try {
      // 1. Create Project
      await projectOperations.create({
        name: `${deal.businessName} - Implementation`,
        status: 'active',
        progress: 0,
        type: deal.service_tier?.includes('Presence') ? 'Digital Presence' : 'Automation',
        startDate: new Date().toISOString(),
        nextMilestone: 'Environment Setup',
        velocity_score: 90
      });
      // 2. Create Pending Subscription
      await subscriptionOperations.create({
        orgId: deal.leadId,
        clientName: deal.businessName,
        planName: 'Growth Automation',
        amount: deal.value > 50000 ? 15000 : 8000,
        status: 'paused',
        billingCycle: 'monthly',
        nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
      
      await logOperations.create({ text: `Node Converged: ${deal.businessName} is now a Partner.`, type: 'webhook' });
      loadSignals();
    } catch (e) {
      console.error("Converge failure", e);
    }
  };

  const handleGeneratePitch = async (lead: Lead) => {
    setIsGeneratingPitch(true);
    await logOperations.create({ text: `Gemini: Synthesizing pitch for ${lead.business_name}`, type: 'tool' });
    loadSignals();

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Act as an elite growth engineer. Write a hyper-personalized short pitch for ${lead.business_name} in ${lead.city}. 
      Tone: Professional, Results-oriented. Optimized for WhatsApp. Length: Under 80 words.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      
      setActivePitch({ lead, pitch: response.text || "Pitch synthesis engine offline." });
    } catch (e) {
      console.error("Pitch Error:", e);
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  const handleAudit = async (lead: Lead) => {
    setIsAuditing(true);
    try {
      const { audit, toolCalls } = await generateAuditWithTools(lead);
      if (toolCalls?.length) {
        for (const call of toolCalls) {
          if (call.name === 'trigger_n8n_signal') await triggerWebhook({ ...lead, ...call.args });
        }
      }
      setCurrentAudit({ lead: { ...lead, ...audit }, result: audit });
    } finally { setIsAuditing(false); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setViewState('public');
  };

  if (isLoadingAuth) return <div className="min-h-screen bg-[#030712] flex items-center justify-center text-slate-500 font-black tracking-widest uppercase italic animate-pulse">InsForge Synchronizing...</div>;
  if (viewState === 'public') return <LandingPage onLeadSubmit={() => {}} onGoToLogin={() => setViewState('login')} />;
  if (viewState === 'login') return <LoginScreen onLogin={() => {}} onGoBack={() => setViewState('public')} />;
  if (!currentUser) return null;

  return (
    <div className="flex min-h-screen bg-[#030712] font-sans selection:bg-blue-600/30 overflow-hidden text-white">
      <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} userRole={currentUser.role} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-[#0f172a]/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-12 sticky top-0 z-40">
           <div className="flex items-center gap-4">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.4)]"></div>
              <h2 className="font-black text-white uppercase tracking-tighter text-[10px] bg-white/5 px-4 py-2 rounded-xl border border-white/5 italic">InsForge Node: {activeProjectRef}</h2>
           </div>
           <div className="flex items-center gap-6">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{currentUser.email}</span>
              <button onClick={handleLogout} className="text-[10px] font-black uppercase tracking-widest px-8 py-3 bg-white text-slate-900 rounded-2xl shadow-xl hover:bg-slate-200 transition-all">Logout</button>
           </div>
        </header>

        <main className="flex-1 p-12 overflow-y-auto custom-scrollbar bg-slate-950/20">
          {currentTab === 'dashboard' && (
            <div className="space-y-10 animate-in fade-in">
              <h2 className="text-6xl font-black text-white tracking-tighter italic">Founder Portal</h2>
              <AdminInfographic />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-slate-900/50 p-12 rounded-[56px] border border-white/5 shadow-2xl backdrop-blur-xl">
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="font-black text-2xl text-white italic">Intelligence Feed</h3>
                    <button onClick={refreshLeads} className="text-[10px] font-black uppercase text-blue-500 hover:text-blue-400 transition-colors">Neural Sync</button>
                  </div>
                  <div className="space-y-4">
                    {leads.slice(0, 5).map(l => (
                      <div key={l.id || l.place_id} className="p-5 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-between hover:border-blue-500/30 cursor-pointer group" onClick={() => handleAudit(l)}>
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center font-black border border-white/10 group-hover:bg-blue-600 transition-all">{l.business_name.charAt(0)}</div>
                            <div>
                              <p className="font-black text-white">{l.business_name}</p>
                              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{l.city}</p>
                            </div>
                         </div>
                         <p className="text-xl font-black text-blue-500 italic">{l.readiness_score || 0}%</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-900/50 p-12 rounded-[56px] border border-white/5 shadow-2xl backdrop-blur-xl">
                  <h3 className="font-black text-2xl text-white mb-10 italic">Signal Log</h3>
                  <SignalLog signals={signals} />
                </div>
              </div>
            </div>
          )}

          {currentTab === 'scraper' && <ScraperView onPushToN8N={triggerWebhook} onLeadsCaptured={refreshLeads} />}
          {currentTab === 'strategy_room' && <StrategyRoom />}
          {currentTab === 'leads' && <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">{leads.map(l => <LeadCard key={l.id || l.place_id} lead={l} onAudit={handleAudit} />)}</div>}
          {currentTab === 'hot_opps' && (
            <div className="space-y-10"><h2 className="text-6xl font-black text-white tracking-tighter italic uppercase">Hot Neural Opps</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {leads.filter(l => l.is_hot_opportunity).map(l => <LeadCard key={l.id || l.place_id} lead={l} onAudit={handleAudit} />)}
              </div>
            </div>
          )}
          {currentTab === 'funnel' && <FunnelView leads={leads} />}
          {currentTab === 'calendar' && <CalendarView />}
          {currentTab === 'crm' && <CrmView deals={deals} onMoveDeal={handleMoveDeal} />}
          {currentTab === 'automations' && <AutomationView workflows={MOCK_WORKFLOWS} onToggleStatus={() => {}} signals={signals} />}
          {currentTab === 'reports' && <ReportsView />}
          {currentTab === 'billing' && <SubscriptionsView subscriptions={MOCK_SUBSCRIPTIONS} />}
          {currentTab === 'settings' && <SettingsView webhookUrl={webhookUrl} onUpdate={setWebhookUrl} onTest={() => triggerWebhook(leads[0] || MOCK_LEADS[0])} activeProjectRef={activeProjectRef} />}
        </main>
      </div>

      {(isAuditing || isGeneratingPitch) && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[500] flex flex-col items-center justify-center text-white">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_50px_rgba(37,99,235,0.4)]"></div>
          <p className="font-black uppercase tracking-[0.4em] text-[10px]">{isGeneratingPitch ? 'Synthesizing Neural Pitch...' : 'Syncing Neural Path...'}</p>
        </div>
      )}
      
      {activePitch && <PitchModal lead={activePitch.lead} pitch={activePitch.pitch} onClose={() => setActivePitch(null)} />}

      {currentAudit && (
        <div className="fixed inset-0 bg-[#030712]/95 backdrop-blur-xl z-[100] flex items-center justify-center p-10 overflow-y-auto">
          <div className="bg-slate-900 rounded-[64px] max-w-6xl w-full p-20 relative animate-in zoom-in-95 duration-500 shadow-2xl border border-white/5">
             <button onClick={() => setCurrentAudit(null)} className="absolute top-12 right-12 text-slate-500 p-4 hover:bg-white/5 hover:text-white rounded-full font-black text-xl transition-all">✕</button>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
                <div className="lg:col-span-2 space-y-12">
                   <div><h2 className="text-6xl font-black text-white tracking-tighter leading-none italic">{currentAudit.lead.business_name}</h2><p className="text-blue-500 font-black uppercase tracking-widest text-[10px] mt-4 italic">Neural Architecture Audit</p></div>
                   <DecisionBanner audit={currentAudit.result} /><div className="grid grid-cols-1 md:grid-cols-2 gap-10"><div className="p-10 bg-white/5 rounded-[48px] border border-white/5"><h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 italic">Growth Gaps</h4><ul className="space-y-4">{currentAudit.result.gaps.map((g, i) => (<li key={i} className="flex gap-4 text-sm font-bold text-slate-300 italic"><span className="text-red-500">✕</span> {g}</li>))}</ul></div><div className="p-10 bg-blue-600/10 text-white rounded-[48px] border border-blue-500/20 shadow-xl"><h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-6 italic">Strategy Path</h4><ul className="space-y-4">{currentAudit.result.recommendations.map((r, i) => (<li key={i} className="flex gap-4 text-sm font-bold"><span className="text-blue-500">✓</span> {r}</li>))}</ul></div></div>
                   <DecisionScienceView nodes={currentAudit.result.decision_logic || []} />
                </div>
                <div className="space-y-12 h-fit sticky top-0"><div className="bg-white p-12 rounded-[56px] text-slate-900 flex flex-col items-center text-center shadow-2xl"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Readiness</span><span className="text-8xl font-black my-6 tracking-tighter italic">{currentAudit.result.score}%</span></div></div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
