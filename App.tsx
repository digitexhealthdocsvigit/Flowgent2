import React, { useState, useEffect, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import LoginScreen from './components/LoginScreen';
import AdminInfographic from './components/AdminInfographic';
import { SignalLog } from './components/AppContent';
import { Lead, User, AuditLog, Subscription } from './types';
import { leadOperations, logOperations, subscriptionOperations, testInsForgeConnection, activeProjectRef } from './lib/supabase';
import { useAuth, useUser, SignedIn, SignedOut, SignInButton, SignUpButton } from '@insforge/react';

// Lazy Loaded Views
const ContactsView = lazy(() => import('./components/ContactsView'));
const FunnelView = lazy(() => import('./components/FunnelView'));
const CrmView = lazy(() => import('./components/CrmView'));
const ScraperView = lazy(() => import('./components/ScraperView'));
const SubscriptionsView = lazy(() => import('./components/SubscriptionsView'));
const StrategyRoom = lazy(() => import('./components/StrategyRoom'));
const SettingsView = lazy(() => import('./components/SettingsView'));
const EcommerceView = lazy(() => import('./components/EcommerceView'));

const ReportsView = lazy(() => import('./components/ReportsView'));

const ViewLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Establishing Neural Link...</p>
  </div>
);

const App: React.FC = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user: insforgeUser } = useUser();
  const [viewState, setViewState] = useState<'public' | 'login' | 'dashboard'>('public');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [signals, setSignals] = useState<AuditLog[]>([]);
  const [isNodeOnline, setIsNodeOnline] = useState(false);
  const [isHydrating, setIsHydrating] = useState(true);

  // Map InsForge user to our User type
  useEffect(() => {
    if (isLoaded && isSignedIn && insforgeUser) {
      const mappedUser: User = {
        id: insforgeUser.id,
        email: insforgeUser.email || '',
        name: insforgeUser.profile?.name || 'User',
        role: 'admin', // Default role, you can customize this based on your needs
      };
      setCurrentUser(mappedUser);
      setViewState('dashboard');
    }
  }, [isSignedIn, insforgeUser, isLoaded]);

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
    } else {
      console.warn("Cluster Sync Failed: Handshake Pending.");
    }
    setIsHydrating(false);
  };

  useEffect(() => {
    let interval: any;
    if (viewState === 'dashboard') {
      refreshData();
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
                        CLUSTER STATUS: {isNodeOnline ? 'SYNCHRONIZED' : 'HANDSHAKE PENDING'}
                      </span>
                   </div>
                </div>
                
                <AdminInfographic />

                {!isNodeOnline && (
                  <div className="p-12 bg-red-600/10 border border-red-500/20 rounded-[40px] text-center space-y-4">
                    <h3 className="text-xl font-black text-red-500 uppercase tracking-widest italic">Database Setup Required</h3>
                    <p className="text-slate-400 text-sm max-w-lg mx-auto leading-relaxed">
                      The cluster is unreachable because the 'leads' table is missing. 
                      Please run the initialization SQL in your InsForge dashboard to complete the handshake.
                    </p>
                  </div>
                )}

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
                              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">AI Neural Score</p>
                           </div>
                        </div>
                      )) : (
                        <div className="py-24 text-center text-slate-600 font-black text-[10px] tracking-[0.4em] bg-white/5 rounded-[40px] border border-dashed border-white/10">
                          {isNodeOnline ? 'AWAITING AGENT ZERO PROPAGATION...' : 'SYNC WITH JSK8SNXZ PENDING...'}
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
          case 'deal_pipeline': return <CrmView />;
          case 'strategy_room': return <StrategyRoom />;
          case 'revenue_amc': return <SubscriptionsView subscriptions={subscriptions} isAdmin={currentUser?.role === 'admin'} onRefresh={refreshData} />;
          case 'funnel_view': return <FunnelView leads={leads} />;
          case 'service_catalog': return <EcommerceView />;
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
      <SignedIn>
        <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} userRole={currentUser?.role || 'admin'} />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <header className="h-20 bg-[#0f172a]/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-12 z-40">
             <div className="flex items-center gap-4">
                <div className={`w-2.5 h-2.5 rounded-full ${isNodeOnline ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]'} animate-pulse`}></div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">
                  Node {activeProjectRef}: {isNodeOnline ? 'ONLINE' : 'HANDSHAKE PENDING'}
                </p>
             </div>
             <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs font-black text-white italic">{currentUser?.name}</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{currentUser?.role}</p>
                </div>
                <button onClick={() => {
                  // TODO: Implement sign out with InsForge
                  setViewState('public');
                  setCurrentUser(null);
                }} className="text-[10px] font-black uppercase px-6 py-2 bg-white text-slate-900 rounded-xl hover:bg-slate-200 transition-all">Sign Out</button>
             </div>
          </header>
          <main className="flex-1 p-12 overflow-y-auto custom-scrollbar bg-slate-950/20">
            {renderTabContent()}
          </main>
        </div>
      </SignedIn>
      
      <SignedOut>
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#030712] p-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-black text-white italic mb-4">Flowgent™</h1>
              <p className="text-slate-400 mb-8">AI Business Intelligence Platform</p>
            </div>
            
            <div className="bg-slate-900/50 p-8 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-xl space-y-6">
              <h2 className="text-2xl font-black text-white text-center">Sign In</h2>
              
              <div className="space-y-4">
                <SignInButton className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-blue-500 transition-all">
                  Sign In
                </SignInButton>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-slate-900 text-slate-500">or</span>
                  </div>
                </div>
                
                <SignUpButton className="w-full bg-slate-800 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-700 transition-all">
                  Create Account
                </SignUpButton>
              </div>
              
              <div className="text-center text-slate-500 text-xs mt-6">
                <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
              </div>
            </div>
          </div>
        </div>
      </SignedOut>
    </div>
  );
};

export default App;
