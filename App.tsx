
import React, { useState, useEffect, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import LeadCard from './components/LeadCard';
import LandingPage from './components/LandingPage';
import LoginScreen from './components/LoginScreen';
import AdminInfographic from './components/AdminInfographic';
import { DecisionBanner, SignalLog } from './components/AppContent';
import { MOCK_LEADS, MOCK_DEALS, MOCK_SUBSCRIPTIONS } from './services/mockData';
import { Lead, AuditResult, User, AuditLog, Deal, Subscription, Contact, Company } from './types';
import { generateAuditWithTools } from './services/geminiService';
import { supabase, activeProjectRef, leadOperations, logOperations, subscriptionOperations, dealOperations, testInsForgeConnection } from './lib/supabase';

// Lazy Loaded Views
const ClientDashboard = lazy(() => import('./components/ClientDashboard'));
const FunnelView = lazy(() => import('./components/FunnelView'));
const CalendarView = lazy(() => import('./components/CalendarView'));
const CrmView = lazy(() => import('./components/CrmView'));
const ScraperView = lazy(() => import('./components/ScraperView'));
const SubscriptionsView = lazy(() => import('./components/SubscriptionsView'));
const StrategyRoom = lazy(() => import('./components/StrategyRoom'));
const SettingsView = lazy(() => import('./components/SettingsView'));
const ServicesCatalog = lazy(() => import('./components/ServicesCatalog'));
const AutomationView = lazy(() => import('./components/AutomationView'));
const ReportsView = lazy(() => import('./components/ReportsView'));
const ProjectsListView = lazy(() => import('./components/ProjectsListView'));
const WorkflowAuditView = lazy(() => import('./components/WorkflowAuditView'));

const ViewLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    <div className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">
      Syncing Neural Node...
    </div>
  </div>
);

const App: React.FC = () => {
  const [viewState, setViewState] = useState<'public' | 'login' | 'dashboard'>('public');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [currentAudit, setCurrentAudit] = useState<{ lead: Lead; result: AuditResult; isQuotaError?: boolean } | null>(null);
  const [signals, setSignals] = useState<AuditLog[]>([]);
  const [isNodeOnline, setIsNodeOnline] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(() => 
    localStorage.getItem('flowgent_n8n_webhook') || 'https://n8n-production-ecc4.up.railway.app/webhook/flowgent-orchestrator'
  );
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Background Sync Engine (Polls every 10s for Agent Zero updates)
  useEffect(() => {
    let interval: any;
    if (viewState === 'dashboard') {
      interval = setInterval(refreshData, 10000);
    }
    return () => clearInterval(interval);
  }, [viewState]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          hydrateUser(session.user.id, session.user.email || '');
          refreshData();
        } else {
          setIsLoadingAuth(false);
        }
      } catch (e) {
        setIsLoadingAuth(false);
      }
    };
    checkAuth();
    testInsForgeConnection().then(status => setIsNodeOnline(status === true || status === 'schema_error'));
  }, []);

  const refreshData = async () => {
    await Promise.all([
      refreshLeads(),
      refreshDeals(),
      loadSignals(),
      refreshSubscriptions()
    ]);
  };

  const loadSignals = async () => {
    const logs = await logOperations.getRecent();
    if (logs) setSignals(logs as any[]);
  };

  const refreshSubscriptions = async () => {
    const data = await subscriptionOperations.getAll();
    if (data) setSubscriptions(data);
  };

  const refreshDeals = async () => {
    const data = await dealOperations.getAll();
    if (data) setDeals(data as Deal[]);
  };

  const refreshLeads = async () => {
    const data = await leadOperations.getAll();
    if (data) {
      setLeads(data.map((l: any) => ({
        ...l,
        business_name: l.business_name || l.businessName || 'Unknown Business',
        lead_status: l.lead_status || l.status || 'discovered',
        readiness_score: l.readiness_score || l.score || 0,
        is_hot_opportunity: l.is_hot_opportunity || (l.readiness_score > 75)
      })));
    }
    setIsLoadingAuth(false);
  };

  const hydrateUser = (userId: string, email: string) => {
    const isAdmin = email.toLowerCase().includes('digitex') || email.toLowerCase().includes('founder');
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

  const handleAudit = async (lead: Lead) => {
    setIsAuditing(true);
    await logOperations.create({ text: `AI: Initiating Precision Audit for ${lead.business_name}`, type: 'tool', lead_id: lead.id });
    try {
      const { audit, isQuotaError } = await generateAuditWithTools(lead);
      setCurrentAudit({ lead: { ...lead, ...audit }, result: audit, isQuotaError });
      await leadOperations.upsert({ ...lead, ...audit });
      await refreshLeads();
    } catch (e) {
      console.error(e);
    } finally { 
      setIsAuditing(false);
    }
  };

  const renderTabContent = () => (
    <Suspense fallback={<ViewLoader />}>
      {(() => {
        switch(currentTab) {
          case 'dashboard':
            return (
              <div className="space-y-10 animate-in fade-in">
                <div className="flex justify-between items-end">
                   <div>
                     <h2 className="text-6xl font-black text-white tracking-tighter italic">Command Node</h2>
                     <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-xs">Infrastructure Node: JSK8SNXZ • Region: AP-SE</p>
                   </div>
                   <div className="bg-blue-600/10 border border-blue-500/20 px-8 py-4 rounded-3xl flex items-center gap-4">
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-[10px] font-black uppercase text-blue-400 italic">Agent Zero: Polling</span>
                   </div>
                </div>
                
                <AdminInfographic />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <section className="lg:col-span-2 bg-slate-900/50 p-12 rounded-[56px] border border-white/5 shadow-2xl backdrop-blur-xl">
                    <h3 className="font-black text-2xl text-white italic mb-10">Intelligence Feed</h3>
                    <div className="space-y-4">
                      {leads.length > 0 ? leads.slice(0, 5).map(l => (
                        <div key={l.id} className="p-6 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-between hover:bg-white/10 cursor-pointer group transition-all" onClick={() => handleAudit(l)}>
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center font-black border border-white/10 group-hover:bg-blue-600 transition-colors">
                                {l.business_name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-black text-white text-lg">{l.business_name}</p>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{l.city || 'Processing Location...'}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className={`text-2xl font-black italic tracking-tighter ${l.readiness_score > 75 ? 'text-green-500' : 'text-blue-500'}`}>{l.readiness_score || 0}%</p>
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Neural Readiness</p>
                           </div>
                        </div>
                      )) : (
                        <div className="py-20 text-center text-slate-500 italic font-black text-[10px] tracking-widest bg-white/5 rounded-[40px] border border-dashed border-white/10">
                          Awaiting Neural Propagation...
                        </div>
                      )}
                    </div>
                  </section>
                  <section className="bg-slate-900/50 p-12 rounded-[56px] border border-white/5 shadow-2xl backdrop-blur-xl">
                    <h3 className="font-black text-2xl text-white mb-10 italic">System Pulse</h3>
                    <SignalLog signals={signals} />
                  </section>
                </div>
              </div>
            );
          case 'discovery': return <ScraperView onPushToN8N={() => Promise.resolve()} onLeadsCaptured={refreshLeads} />;
          case 'deal_pipeline': return <CrmView deals={deals} onUpdateDeal={refreshDeals} />;
          case 'revenue_amc': return <SubscriptionsView subscriptions={subscriptions} onRefresh={refreshSubscriptions} isAdmin={currentUser?.role === 'admin'} />;
          case 'strategy_room': return <StrategyRoom />;
          case 'settings': return <SettingsView webhookUrl={webhookUrl} onUpdate={setWebhookUrl} onTest={() => {}} activeProjectRef={activeProjectRef} />;
          case 'funnel_view': return <FunnelView leads={leads} />;
          case 'reports': return <ReportsView />;
          case 'service_catalog': return <ServicesCatalog />;
          default: return <div className="py-20 text-center text-slate-500 italic">Node Hydrating...</div>;
        }
      })()}
    </Suspense>
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setViewState('public');
  };

  if (isLoadingAuth) return <ViewLoader />;
  if (viewState === 'public') return <LandingPage onLeadSubmit={() => {}} onGoToLogin={() => setViewState('login')} />;
  if (viewState === 'login') return <LoginScreen onLogin={handleLogin} onGoBack={() => setViewState('public')} />;
  if (!currentUser) return null;

  return (
    <div className="flex min-h-screen bg-[#030712] font-sans selection:bg-blue-600/30 overflow-hidden text-white">
      <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} userRole={currentUser.role} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-24 bg-[#0f172a]/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-12 sticky top-0 z-40">
           <div className="flex items-center gap-6">
              <div className={`w-3 h-3 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.4)] ${isNodeOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                <p className="font-black text-white uppercase tracking-tighter text-[10px] italic">
                  Cluster Status: {isNodeOnline ? 'SYNCHRONIZED' : 'HANDSHAKE PENDING'}
                </p>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Node: {activeProjectRef.split('-')[0]}</p>
              </div>
           </div>
           <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-sm font-black text-white italic leading-none">{currentUser.name}</p>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">{currentUser.role.replace('_', ' ')}</p>
              </div>
              <button onClick={handleLogout} className="text-[10px] font-black uppercase tracking-widest px-8 py-3 bg-white text-slate-900 rounded-2xl hover:bg-slate-200 transition-all">Logout</button>
           </div>
        </header>

        <main className="flex-1 p-12 overflow-y-auto custom-scrollbar bg-slate-950/20">
          {renderTabContent()}
        </main>
      </div>

      {isAuditing && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[500] flex flex-col items-center justify-center space-y-6">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-center space-y-2">
            <p className="font-black uppercase tracking-[0.5em] text-xs text-blue-500 italic">Processing Neural Decision Tree</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic animate-pulse">Consulting Gemini 3 Pro Engine...</p>
          </div>
        </div>
      )}

      {currentAudit && (
        <div className="fixed inset-0 bg-[#030712]/98 backdrop-blur-3xl z-[100] flex items-center justify-center p-10 overflow-y-auto">
          <div className="bg-slate-900 rounded-[64px] max-w-6xl w-full p-20 relative animate-in zoom-in-95 duration-500 shadow-2xl border border-white/5">
             <button onClick={() => setCurrentAudit(null)} className="absolute top-12 right-12 text-slate-500 p-4 hover:bg-white/5 hover:text-white rounded-full font-black text-xl transition-all">✕</button>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
                <div className="lg:col-span-2 space-y-12">
                   <div>
                     <h2 className="text-7xl font-black text-white tracking-tighter leading-none italic">{currentAudit.lead.business_name}</h2>
                     <p className="text-blue-500 font-black uppercase tracking-widest text-[10px] mt-6 italic">Strategic Gap Analysis Protocol Alpha</p>
                   </div>
                   
                   <DecisionBanner audit={currentAudit.result} />
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="p-10 bg-white/5 rounded-[48px] border border-white/5">
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 italic">Infrastructure Gaps</h3>
                       <ul className="space-y-4">
                         {currentAudit.result.gaps.map((g, i) => (<li key={i} className="flex gap-4 text-sm font-bold text-slate-300 italic leading-relaxed"><span className="text-red-500 text-lg">✕</span> {g}</li>))}
                       </ul>
                     </div>
                     <div className="p-10 bg-blue-600/10 text-white rounded-[48px] border border-blue-500/20 shadow-xl">
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-6 italic">Provisioning Path</h3>
                       <ul className="space-y-4">
                         {currentAudit.result.recommendations.map((r, i) => (<li key={i} className="flex gap-4 text-sm font-bold leading-relaxed"><span className="text-blue-500 text-lg">✓</span> {r}</li>))}
                       </ul>
                     </div>
                   </div>
                </div>
                <aside className="space-y-12 h-fit sticky top-0">
                  <div className="bg-white p-12 rounded-[56px] text-slate-900 flex flex-col items-center text-center shadow-2xl border border-white/20">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Readiness Engine</span>
                    <span className="text-8xl font-black my-6 tracking-tighter italic leading-none">{currentAudit.result.score}%</span>
                    <div className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest italic">Scale Potential</div>
                  </div>
                  
                  <div className="p-10 bg-slate-800 rounded-[48px] border border-white/5 text-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Neural Insights</p>
                    <p className="text-sm font-bold text-slate-300 italic leading-relaxed">"{currentAudit.result.summary}"</p>
                  </div>
                </aside>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
