
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
import ServicesCatalog from './components/ServicesCatalog';
import { DecisionBanner, SignalLog } from './components/AppContent';
import { MOCK_LEADS, MOCK_DEALS, MOCK_PROJECTS, MOCK_WORKFLOWS, MOCK_SUBSCRIPTIONS } from './services/mockData';
import { Lead, AuditResult, User, AuditLog, Deal, Subscription } from './types';
import { generateAuditWithTools } from './services/geminiService';
import { supabase, activeProjectRef, leadOperations, logOperations, projectOperations, subscriptionOperations } from './lib/supabase';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<'public' | 'login' | 'dashboard'>('public');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [currentAudit, setCurrentAudit] = useState<{ lead: Lead; result: AuditResult } | null>(null);
  const [signals, setSignals] = useState<AuditLog[]>([]);
  const [webhookUrl, setWebhookUrl] = useState(() => 
    localStorage.getItem('flowgent_n8n_webhook') || 'https://n8n-production-ecc4.up.railway.app/webhook-test/flowgent-orchestrator'
  );
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          hydrateUser(session.user.id, session.user.email || '');
          refreshData();
        } else {
          setIsLoadingAuth(false);
          setLeads(MOCK_LEADS as any[]);
          setDeals(MOCK_DEALS as any[]);
          setSubscriptions(MOCK_SUBSCRIPTIONS as any[]);
        }
      } catch (e) {
        setIsLoadingAuth(false);
        setLeads(MOCK_LEADS as any[]);
        setDeals(MOCK_DEALS as any[]);
        setSubscriptions(MOCK_SUBSCRIPTIONS as any[]);
      }
    };
    checkAuth();
  }, []);

  const refreshData = async () => {
    await refreshLeads();
    await loadSignals();
    await refreshSubscriptions();
  };

  const loadSignals = async () => {
    const logs = await logOperations.getRecent();
    if (logs) {
      setSignals(logs as any[]);
    } else {
      setSignals([]);
    }
  };

  const refreshSubscriptions = async () => {
    try {
      const data = await subscriptionOperations.getAll();
      if (data && data.length > 0) {
        setSubscriptions(data);
      } else {
        setSubscriptions(MOCK_SUBSCRIPTIONS as any[]);
      }
    } catch (e) {
      setSubscriptions(MOCK_SUBSCRIPTIONS as any[]);
    }
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
      setLeads(MOCK_LEADS as any[]);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const hydrateUser = (userId: string, email: string) => {
    const isAdmin = email.toLowerCase().includes('digitex') || email.toLowerCase().includes('founder') || email.toLowerCase().includes('vishaal') || email.toLowerCase().includes('healthdocs');
    const user: User = { id: userId, name: email.split('@')[0], email, role: isAdmin ? 'admin' : 'client', orgId: 'org-1' };
    setCurrentUser(user);
    setViewState('dashboard');
    setCurrentTab(isAdmin ? 'dashboard' : 'client_dashboard');
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setViewState('dashboard');
    setCurrentTab(user.role === 'admin' ? 'dashboard' : 'client_dashboard');
    refreshData();
  };

  const logAuditEvent = async (text: string, type: string, leadId?: string, payload?: any) => {
    await logOperations.create({ text, type, lead_id: leadId, payload });
    loadSignals();
  };

  const triggerWebhook = async (lead: Lead) => {
    await logAuditEvent(`Syncing: ${lead.business_name} to Orchestrator`, 'webhook', lead.id);
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'lead_captured', payload: lead })
      });
      if (response.ok) {
        await logAuditEvent(`ACK: Node persistent in InsForge for ${lead.business_name}`, 'webhook', lead.id);
        // Mark as synced in local state
        setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, is_synced_to_n8n: true, sync_timestamp: new Date().toISOString() } : l));
      }
    } catch (e) { 
      await logAuditEvent(`Sync Failed: Connectivity timeout for ${lead.business_name}`, 'system', lead.id);
    }
  };

  const handleMoveDeal = async (id: string, direction: 'forward' | 'backward') => {
    const stages: Deal['stage'][] = ['new', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
    const dealToUpdate = deals.find(d => d.id === id);
    if (!dealToUpdate) return;
    const currentIndex = stages.indexOf(dealToUpdate.stage);
    const nextIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;
    const nextStage = stages[nextIndex];
    if (!nextStage) return;
    if (nextStage === 'won') await finalizeDeal(dealToUpdate);
    setDeals(deals.map(d => d.id === id ? { ...d, stage: nextStage, updatedAt: new Date().toISOString() } : d));
  };

  const finalizeDeal = async (deal: Deal) => {
    await logAuditEvent(`Provisioning Infrastructure for partner ${deal.businessName}`, 'system', deal.lead_id || deal.leadId);
    try {
      await projectOperations.create({
        client_name: deal.businessName,
        lead_id: deal.lead_id || deal.leadId,
        status: 'active',
        progress: 0,
        type: 'Automation Stack',
        startDate: new Date().toISOString(),
        nextMilestone: 'Infrastructure Provisioning'
      });
      await subscriptionOperations.create({
        orgId: deal.leadId,
        clientName: deal.businessName,
        planName: 'Growth Automation',
        amount: deal.value > 50000 ? 15000 : 8000,
        status: 'pending_payment',
        billingCycle: 'monthly',
        nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
      await logAuditEvent(`Node Converged: ${deal.businessName} linked to Revenue Cluster.`, 'system', deal.lead_id || deal.leadId);
    } catch (e) {
      console.error("Converge failure", e);
    } finally {
      refreshSubscriptions();
    }
  };

  const handleAudit = async (lead: Lead) => {
    setIsAuditing(true);
    await logAuditEvent(`AI: Initiating Decision Science Audit for ${lead.business_name}`, 'tool', lead.id);
    try {
      const { audit, toolCalls } = await generateAuditWithTools(lead);
      if (toolCalls?.length) {
        for (const call of toolCalls) {
          if (call.name === 'trigger_n8n_signal') await triggerWebhook({ ...lead, ...call.args });
          if (call.name === 'insforge_fetch_docs') {
            await logAuditEvent(`AI researched InsForge Schema: ${call.args.topic}`, 'tool', lead.id);
          }
        }
      }
      await logAuditEvent(`Audit Resolved: ${lead.business_name} score: ${audit.score}%`, 'tool', lead.id, audit);
      setCurrentAudit({ lead: { ...lead, ...audit }, result: audit });
    } catch (e) {
      await logAuditEvent(`Audit Failure: Infrastructure node unreachable.`, 'system', lead.id);
    } finally { 
      setIsAuditing(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setViewState('public');
  };

  const renderTabContent = () => {
    switch(currentTab) {
      case 'dashboard':
        return (
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
                    <div key={l.id || (l as any).place_id} className="p-5 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-between hover:border-blue-500/30 cursor-pointer group" onClick={() => handleAudit(l)}>
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center font-black border border-white/10 group-hover:bg-blue-600 transition-all">
                            {l.business_name.charAt(0)}
                          </div>
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
        );
      case 'service_catalog':
        return <ServicesCatalog />;
      case 'discovery':
        return <ScraperView onPushToN8N={triggerWebhook} onLeadsCaptured={refreshLeads} />;
      case 'strategy_room':
        return <StrategyRoom />;
      case 'hot_opps':
        const hotLeads = leads.filter(l => l && (l.is_hot_opportunity || (l.readiness_score || 0) >= 75));
        return (
          <div className="space-y-10 animate-in fade-in">
            <h2 className="text-4xl font-black text-white italic tracking-tighter">Hot Opportunities</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {hotLeads.length > 0 ? hotLeads.map(l => (
                <LeadCard key={l.id || (l as any).place_id} lead={l} onAudit={handleAudit} />
              )) : (
                <div className="col-span-full py-32 text-center text-slate-500 italic border border-dashed border-white/5 rounded-[48px]">No Hot Opportunities detected. Refresh Discovery Node.</div>
              )}
            </div>
          </div>
        );
      case 'lead_engine':
        return <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">{leads.map(l => <LeadCard key={l.id || (l as any).place_id} lead={l} onAudit={handleAudit} />)}</div>;
      case 'funnel_view':
        return <FunnelView leads={leads} />;
      case 'meetings':
        return <CalendarView />;
      case 'deal_pipeline':
        return <CrmView deals={deals} onMoveDeal={handleMoveDeal} />;
      case 'workflows':
        return <AutomationView workflows={MOCK_WORKFLOWS} onToggleStatus={() => {}} signals={signals as any[]} />;
      case 'revenue_amc':
        return <SubscriptionsView subscriptions={subscriptions} onRefresh={refreshSubscriptions} isAdmin={currentUser?.role === 'admin'} />;
      case 'settings':
        return <SettingsView webhookUrl={webhookUrl} onUpdate={setWebhookUrl} onTest={() => logAuditEvent('Manual Signal Test Dispatched', 'webhook')} activeProjectRef={activeProjectRef} />;
      case 'client_dashboard':
        return <ClientDashboard projects={MOCK_PROJECTS} leadStats={{score: 88, rank: 'Top 5%'}} activityLogs={signals.map(s => ({msg: s.text, time: s.created_at || 'Just now'}))} />;
      default:
        return <div className="py-20 text-center text-slate-500 italic">Node under development. Infrastructure pending sync.</div>;
    }
  };

  if (isLoadingAuth) return <div className="min-h-screen bg-[#030712] flex items-center justify-center text-slate-500 font-black tracking-widest uppercase italic animate-pulse">InsForge Handshake...</div>;
  if (viewState === 'public') return <LandingPage onLeadSubmit={() => {}} onGoToLogin={() => setViewState('login')} />;
  if (viewState === 'login') return <LoginScreen onLogin={handleLogin} onGoBack={() => setViewState('public')} />;
  if (!currentUser) return null;

  return (
    <div className="flex min-h-screen bg-[#030712] font-sans selection:bg-blue-600/30 overflow-hidden text-white">
      <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} userRole={currentUser.role} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-[#0f172a]/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-12 sticky top-0 z-40">
           <div className="flex items-center gap-4">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.4)]"></div>
              <h2 className="font-black text-white uppercase tracking-tighter text-[10px] bg-white/5 px-4 py-2 rounded-xl border border-white/5 italic">Node: {activeProjectRef}</h2>
           </div>
           <div className="flex items-center gap-6">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{currentUser.email}</span>
              <button onClick={handleLogout} className="text-[10px] font-black uppercase tracking-widest px-8 py-3 bg-white text-slate-900 rounded-2xl shadow-xl hover:bg-slate-200 transition-all">Logout</button>
           </div>
        </header>

        <main className="flex-1 p-12 overflow-y-auto custom-scrollbar bg-slate-950/20">
          {renderTabContent()}
        </main>
      </div>

      {isAuditing && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[500] flex flex-col items-center justify-center text-white">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_50px_rgba(37,99,235,0.4)]"></div>
          <p className="font-black uppercase tracking-[0.4em] text-[10px]">Processing Decision Science...</p>
        </div>
      )}

      {currentAudit && (
        <div className="fixed inset-0 bg-[#030712]/95 backdrop-blur-xl z-[100] flex items-center justify-center p-10 overflow-y-auto">
          <div className="bg-slate-900 rounded-[64px] max-w-6xl w-full p-20 relative animate-in zoom-in-95 duration-500 shadow-2xl border border-white/5">
             <button onClick={() => setCurrentAudit(null)} className="absolute top-12 right-12 text-slate-500 p-4 hover:bg-white/5 hover:text-white rounded-full font-black text-xl transition-all">✕</button>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
                <div className="lg:col-span-2 space-y-12">
                   <div>
                     <h2 className="text-6xl font-black text-white tracking-tighter leading-none italic">{currentAudit.lead.business_name}</h2>
                     <p className="text-blue-500 font-black uppercase tracking-widest text-[10px] mt-4 italic">Neural Architecture Audit</p>
                   </div>
                   <DecisionBanner audit={currentAudit.result} />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="p-10 bg-white/5 rounded-[48px] border border-white/5">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 italic">Growth Gaps</h4>
                       <ul className="space-y-4">
                         {currentAudit.result.gaps.map((g, i) => (<li key={i} className="flex gap-4 text-sm font-bold text-slate-300 italic"><span className="text-red-500">✕</span> {g}</li>))}
                       </ul>
                     </div>
                     <div className="p-10 bg-blue-600/10 text-white rounded-[48px] border border-blue-500/20 shadow-xl">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-6 italic">Strategy Path</h4>
                       <ul className="space-y-4">
                         {currentAudit.result.recommendations.map((r, i) => (<li key={i} className="flex gap-4 text-sm font-bold"><span className="text-blue-500">✓</span> {r}</li>))}
                       </ul>
                     </div>
                   </div>
                   <DecisionScienceView nodes={currentAudit.result.decision_logic || []} />
                </div>
                <div className="space-y-12 h-fit sticky top-0">
                  <div className="bg-white p-12 rounded-[56px] text-slate-900 flex flex-col items-center text-center shadow-2xl">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Readiness</span>
                    <span className="text-8xl font-black my-6 tracking-tighter italic">{currentAudit.result.score}%</span>
                  </div>
                  <button onClick={() => triggerWebhook(currentAudit.lead)} className="w-full bg-blue-600 text-white font-black py-6 rounded-[32px] uppercase tracking-widest text-[10px] shadow-xl hover:bg-blue-500 transition-all">Manual Webhook Sync</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
