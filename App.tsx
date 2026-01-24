
import React, { useState, useEffect, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import LeadCard from './components/LeadCard';
import LandingPage from './components/LandingPage';
import LoginScreen from './components/LoginScreen';
import AdminInfographic from './components/AdminInfographic';
import { DecisionBanner, SignalLog } from './components/AppContent';
import { Lead, AuditResult, User, AuditLog, Deal, Subscription, Contact, Company } from './types';
import { generateAuditWithTools } from './services/geminiService';
import { INSFORGE_CONFIG, leadOperations, logOperations, testInsForgeConnection } from './lib/supabase';

// Lazy Loaded Views
const ContactsView = lazy(() => import('./components/ContactsView'));
const FunnelView = lazy(() => import('./components/FunnelView'));
const CrmView = lazy(() => import('./components/CrmView'));
const ScraperView = lazy(() => import('./components/ScraperView'));
const SubscriptionsView = lazy(() => import('./components/SubscriptionsView'));
const StrategyRoom = lazy(() => import('./components/StrategyRoom'));
const SettingsView = lazy(() => import('./components/SettingsView'));
const ServicesCatalog = lazy(() => import('./components/ServicesCatalog'));
const ReportsView = lazy(() => import('./components/ReportsView'));

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
  const [isAuditing, setIsAuditing] = useState(false);
  const [currentAudit, setCurrentAudit] = useState<{ lead: Lead; result: AuditResult; isQuotaError?: boolean } | null>(null);
  const [signals, setSignals] = useState<AuditLog[]>([]);
  const [isNodeOnline, setIsNodeOnline] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);

  useEffect(() => {
    let interval: any;
    if (viewState === 'dashboard') {
      refreshData();
      interval = setInterval(refreshData, 10000);
    }
    return () => clearInterval(interval);
  }, [viewState]);

  const refreshData = async () => {
    const online = await testInsForgeConnection();
    setIsNodeOnline(online);
    
    if (online) {
      const [leadsData, logsData] = await Promise.all([
        leadOperations.getAll(),
        logOperations.getRecent()
      ]);
      if (leadsData) setLeads(leadsData);
      if (logsData) setSignals(logsData);
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setViewState('dashboard');
    setCurrentTab(user.role === 'admin' ? 'dashboard' : 'client_dashboard');
  };

  const handleAudit = async (lead: Lead) => {
    setIsAuditing(true);
    await logOperations.create({ text: `AI: Initiating Precision Audit for ${lead.business_name}`, type: 'tool', lead_id: lead.id });
    try {
      const { audit } = await generateAuditWithTools(lead);
      setCurrentAudit({ lead: { ...lead, ...audit }, result: audit });
      await leadOperations.upsert({ ...lead, ...audit, ai_audit_completed: true });
      await refreshData();
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
                      <div className={`w-2.5 h-2.5 ${isNodeOnline ? 'bg-green-500' : 'bg-red-500'} rounded-full animate-pulse`}></div>
                      <span className="text-[10px] font-black uppercase text-blue-400 italic">Agent Zero: {isNodeOnline ? 'polling' : 'offline'}</span>
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
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{l.city || 'Processing...'}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className={`text-2xl font-black italic tracking-tighter ${l.readiness_score! > 75 ? 'text-green-500' : 'text-blue-500'}`}>{l.readiness_score || 0}%</p>
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Readiness</p>
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
          case 'discovery': return <ScraperView onLeadsCaptured={refreshData} onPushToN8N={() => Promise.resolve()} />;
          case 'contacts': return <ContactsView />;
          case 'deal_pipeline': return <CrmView deals={[]} onUpdateDeal={() => {}} />;
          case 'revenue_amc': return <SubscriptionsView subscriptions={[]} onRefresh={() => {}} isAdmin={currentUser?.role === 'admin'} />;
          case 'strategy_room': return <StrategyRoom />;
          case 'settings': return <SettingsView webhookUrl="" onUpdate={() => {}} onTest={() => {}} activeProjectRef="01144a09" />;
          case 'funnel_view': return <FunnelView leads={leads} />;
          case 'reports': return <ReportsView />;
          case 'service_catalog': return <ServicesCatalog />;
          default: return <div className="py-20 text-center text-slate-500 italic">Node Hydrating...</div>;
        }
      })()}
    </Suspense>
  );

  if (viewState === 'public') return <LandingPage onLeadSubmit={() => {}} onGoToLogin={() => setViewState('login')} />;
  if (viewState === 'login') return <LoginScreen onLogin={handleLogin} onGoBack={() => setViewState('public')} />;
  if (!currentUser) return null;

  return (
    <div className="flex min-h-screen bg-[#030712] font-sans text-white">
      <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} userRole={currentUser.role} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-24 bg-[#0f172a]/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-12 sticky top-0 z-40">
           <div className="flex items-center gap-6">
              <div className={`w-3 h-3 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.4)] ${isNodeOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                <p className="font-black text-white uppercase tracking-tighter text-[10px] italic">
                  Cluster Status: {isNodeOnline ? 'CONNECTED' : 'HANDSHAKE PENDING'}
                </p>
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5">Node: JSK8SNXZ</p>
              </div>
           </div>
           <div className="flex items-center gap-8">
              <div className="text-right">
                <p className="text-sm font-black text-white italic leading-none">{currentUser.name}</p>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">{currentUser.role}</p>
              </div>
              <button onClick={() => setViewState('public')} className="text-[10px] font-black uppercase tracking-widest px-8 py-3 bg-white text-slate-900 rounded-2xl hover:bg-slate-200 transition-all">Logout</button>
           </div>
        </header>
        <main className="flex-1 p-12 overflow-y-auto custom-scrollbar bg-slate-950/20">
          {renderTabContent()}
        </main>
      </div>

      {isAuditing && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[500] flex flex-col items-center justify-center space-y-6">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-black uppercase tracking-[0.5em] text-xs text-blue-500 italic">Processing Neural Audit</p>
        </div>
      )}

      {currentAudit && (
        <div className="fixed inset-0 bg-[#030712]/98 backdrop-blur-3xl z-[100] flex items-center justify-center p-10 overflow-y-auto">
          <div className="bg-slate-900 rounded-[64px] max-w-6xl w-full p-20 relative border border-white/5">
             <button onClick={() => setCurrentAudit(null)} className="absolute top-12 right-12 text-slate-500 p-4 hover:bg-white/5 hover:text-white rounded-full font-black text-xl transition-all">✕</button>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
                <div className="lg:col-span-2 space-y-12">
                   <h2 className="text-7xl font-black text-white tracking-tighter leading-none italic">{currentAudit.lead.business_name}</h2>
                   <DecisionBanner audit={currentAudit.result} />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="p-10 bg-white/5 rounded-[48px] border border-white/5">
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 italic">Gaps</h3>
                       <ul className="space-y-4">
                         {currentAudit.result.gaps.map((g, i) => (<li key={i} className="text-sm font-bold text-slate-300 italic"><span className="text-red-500 mr-2">✕</span>{g}</li>))}
                       </ul>
                     </div>
                     <div className="p-10 bg-blue-600/10 rounded-[48px] border border-blue-500/20">
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-6 italic">Strategy</h3>
                       <ul className="space-y-4">
                         {currentAudit.result.recommendations.map((r, i) => (<li key={i} className="text-sm font-bold text-white italic"><span className="text-blue-500 mr-2">✓</span>{r}</li>))}
                       </ul>
                     </div>
                   </div>
                </div>
                <aside className="space-y-12 text-center">
                  <div className="bg-white p-12 rounded-[56px] text-slate-900 shadow-2xl">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</span>
                    <span className="text-8xl font-black my-6 tracking-tighter italic block leading-none">{currentAudit.result.score}%</span>
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
