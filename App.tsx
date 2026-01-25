
import React, { useState, useEffect, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import LoginScreen from './components/LoginScreen';
import AdminInfographic from './components/AdminInfographic';
import { SignalLog } from './components/AppContent';
import { Lead, User, AuditLog, Subscription } from './types';
import { leadOperations, logOperations, subscriptionOperations, testInsForgeConnection, activeProjectRef } from './lib/supabase';

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
    <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Establishing Neural Link...</p>
  </div>
);

const App: React.FC = () => {
  const [viewState, setViewState] = useState<'public' | 'login' | 'dashboard'>('public');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [signals, setSignals] = useState<AuditLog[]>([]);
  const [isNodeOnline, setIsNodeOnline] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);

  // Sync state with infrastructure node JSK8SNXZ
  const refreshData = async () => {
    const isOnline = await testInsForgeConnection();
    setIsNodeOnline(isOnline);
    
    if (isOnline) {
      const [leadsData, logsData, subsData] = await Promise.all([
        leadOperations.getAll(),
        logOperations.getRecent(),
        subscriptionOperations.getAll()
      ]);
      if (leadsData) setLeads(leadsData);
      if (logsData) setSignals(logsData);
      if (subsData) setSubscriptions(subsData);
    }
    setIsHydrating(false);
  };

  useEffect(() => {
    let interval: any;
    if (viewState === 'dashboard') {
      refreshData();
      // Polling for live updates from Agent Zero
      interval = setInterval(refreshData, 10000);
    }
    return () => clearInterval(interval);
  }, [viewState]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setViewState('dashboard');
    setCurrentTab(user.role === 'client' ? 'client_dashboard' : 'dashboard');
  };

  const renderTabContent = () => (
    <Suspense fallback={<ViewLoader />}>
      {(() => {
        if (isHydrating && viewState === 'dashboard') return <ViewLoader />;
        switch(currentTab) {
          case 'dashboard':
            return (
              <div className="space-y-10 animate-in fade-in">
                <div className="flex justify-between items-end">
                   <div>
                     <h2 className="text-6xl font-black text-white tracking-tighter italic leading-none">Command Node</h2>
                     <p className="text-slate-500 font-bold mt-4 uppercase tracking-widest text-xs">Project Node: {activeProjectRef} • Cluster: AP-SE</p>
                   </div>
                   <div className="bg-blue-600/10 border border-blue-500/20 px-8 py-4 rounded-3xl flex items-center gap-6 shadow-2xl">
                      <div className={`w-3 h-3 ${isNodeOnline ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]'} rounded-full animate-pulse`}></div>
                      <span className="text-[10px] font-black uppercase text-blue-400 italic tracking-widest">
                        CLUSTER STATUS: {isNodeOnline ? 'SYNCHRONIZED' : 'CONNECTION ERROR'}
                      </span>
                   </div>
                </div>
                
                <AdminInfographic />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <section className="lg:col-span-2 bg-slate-900/50 p-12 rounded-[56px] border border-white/5 shadow-2xl backdrop-blur-xl">
                    <h3 className="font-black text-2xl text-white italic mb-10">Intelligence Feed</h3>
                    <div className="space-y-4">
                      {leads.length > 0 ? leads.map(l => (
                        <div key={l.id} className="p-6 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-between hover:bg-white/10 transition-all group">
                           <div className="flex items-center gap-6">
                              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center font-black border border-white/10 group-hover:bg-blue-600 transition-colors">
                                {l.business_name ? l.business_name.charAt(0) : 'L'}
                              </div>
                              <div>
                                <p className="font-black text-white text-lg tracking-tight">{l.business_name}</p>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{l.city} • {l.category}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className={`text-2xl font-black italic tracking-tighter ${l.readiness_score! >= 80 ? 'text-red-500' : 'text-blue-500'}`}>
                                {l.readiness_score || 0}%
                              </p>
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Neural Score</p>
                           </div>
                        </div>
                      )) : (
                        <div className="py-24 text-center text-slate-600 font-black text-[10px] tracking-[0.4em] bg-white/5 rounded-[40px] border border-dashed border-white/10">
                          AWAITING AGENT ZERO PROPAGATION...
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
          case 'settings': return <SettingsView />;
          case 'deal_pipeline': return <CrmView deals={[]} />;
          case 'strategy_room': return <StrategyRoom />;
          case 'revenue_amc': return <SubscriptionsView subscriptions={subscriptions} isAdmin={currentUser?.role === 'admin'} onRefresh={refreshData} />;
          case 'funnel_view': return <FunnelView leads={leads} />;
          case 'service_catalog': return <ServicesCatalog isPublic={false} />;
          case 'reports': return <ReportsView />;
          default: return <ViewLoader />;
        }
      })()}
    </Suspense>
  );

  if (viewState === 'public') return <LandingPage onLeadSubmit={() => setViewState('login')} onGoToLogin={() => setViewState('login')} />;
  if (viewState === 'login') return <LoginScreen onLogin={handleLogin} onGoBack={() => setViewState('public')} />;
  if (!currentUser) return null;

  return (
    <div className="flex min-h-screen bg-[#030712] font-sans text-white">
      <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} userRole={currentUser.role} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-[#0f172a]/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-12 z-40">
           <div className="flex items-center gap-4">
              <div className={`w-2.5 h-2.5 rounded-full ${isNodeOnline ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-red-500'} animate-pulse`}></div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">
                Node {activeProjectRef}: {isNodeOnline ? 'ONLINE' : 'HANDSHAKE PENDING'}
              </p>
           </div>
           <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs font-black text-white italic">{currentUser.name}</p>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{currentUser.role}</p>
              </div>
              <button onClick={() => setViewState('public')} className="text-[10px] font-black uppercase px-6 py-2 bg-white text-slate-900 rounded-xl hover:bg-slate-200 transition-all">Sign Out</button>
           </div>
        </header>
        <main className="flex-1 p-12 overflow-y-auto custom-scrollbar bg-slate-950/20">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
