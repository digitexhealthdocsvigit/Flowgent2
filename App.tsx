
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import LeadCard from './components/LeadCard';
import ClientDashboard from './components/ClientDashboard';
import FunnelView from './components/FunnelView';
import CalendarView from './components/CalendarView';
import CrmView from './components/CrmView';
import ReportsView from './components/ReportsView';
import ProjectsListView from './components/ProjectsListView';
import LandingPage from './components/LandingPage';
import LoginScreen from './components/LoginScreen';
import AutomationView from './components/AutomationView';
import SubscriptionsView from './components/SubscriptionsView';
import ScraperView from './components/ScraperView';
import NotificationCenter from './components/NotificationCenter';
import { MOCK_LEADS, MOCK_DEALS, MOCK_NOTIFICATIONS, MOCK_PROJECTS, MOCK_USER, MOCK_CLIENT, MOCK_SUBSCRIPTIONS, MOCK_WORKFLOWS } from './services/mockData';
import { Lead, AuditResult, Notification, User, Deal } from './types';
import { generateAudit, generateOutreach } from './services/geminiService';
import { calculateLeadScore } from './utils/scoring';
import { ICONS } from './constants';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<'public' | 'login' | 'dashboard'>('public');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [deals, setDeals] = useState<Deal[]>(MOCK_DEALS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [currentAudit, setCurrentAudit] = useState<{ lead: Lead; result: AuditResult } | null>(null);
  const [currentPitch, setCurrentPitch] = useState<{ name: string; content: string } | null>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentUser) {
      setCurrentTab(currentUser.role === 'client' ? 'client_dashboard' : 'dashboard');
    }
  }, [currentUser]);

  const handlePushToN8N = (scraped: any) => {
    setNotifications([{
      id: Math.random().toString(),
      type: 'automation',
      title: 'n8n Webhook Fired',
      message: `Lead ${scraped.name} pushed to external automation server.`,
      timestamp: 'Just now',
      isRead: false
    }, ...notifications]);
  };

  const handleGeneratePitch = async (scraped: any) => {
    setIsAuditing(true);
    const pitch = await generateOutreach(scraped.name, scraped.location);
    setCurrentPitch({ name: scraped.name, content: pitch });
    setIsAuditing(false);
  };

  const handleAudit = async (lead: Lead) => {
    setIsAuditing(true);
    setCurrentAudit(null);
    try {
      const result = await generateAudit(lead.businessName, lead.websiteUrl);
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, score: result.score, status: 'audit_viewed' } : l));
      setCurrentAudit({ lead, result });
    } catch (err) {
      console.error(err);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleConvertToDeal = () => {
    if (!currentAudit) return;
    const { lead, result } = currentAudit;
    const newDeal: Deal = {
      id: `d-${Date.now()}`,
      leadId: lead.id,
      businessName: lead.businessName,
      stage: 'new',
      value: 50000 + (result.score * 1000),
      updatedAt: new Date().toISOString()
    };
    setDeals([newDeal, ...deals]);
    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: 'converted' } : l));
    
    setNotifications([{
      id: Math.random().toString(),
      type: 'deal',
      title: 'Conversion Successful',
      message: `${lead.businessName} has been moved to Deal Pipeline.`,
      timestamp: 'Just now',
      isRead: false
    }, ...notifications]);

    setCurrentAudit(null);
    setCurrentTab('crm');
  };

  const handleLeadSubmit = (data: any) => {
    const { score, temperature } = calculateLeadScore({ ...data, websiteUrl: data.websiteUrl });
    const newLead: Lead = {
      id: Math.random().toString(36).substr(2, 9),
      businessName: data.businessName,
      websiteUrl: data.websiteUrl,
      category: data.category || 'General',
      email: 'lead@inquiry.com',
      city: 'Inbound',
      status: 'discovered',
      score,
      temperature,
      createdAt: new Date().toISOString()
    };
    setLeads([newLead, ...leads]);
    setViewState('dashboard');
    setCurrentUser(MOCK_USER);
  };

  const moveDeal = (dealId: string, direction: 'forward' | 'backward') => {
    const stages: Deal['stage'][] = ['new', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
    setDeals(prev => prev.map(deal => {
      if (deal.id === dealId) {
        const currentIndex = stages.indexOf(deal.stage);
        const nextIndex = direction === 'forward' ? Math.min(currentIndex + 1, stages.length - 1) : Math.max(currentIndex - 1, 0);
        return { ...deal, stage: stages[nextIndex], updatedAt: new Date().toISOString() };
      }
      return deal;
    }));
  };

  if (viewState === 'public') return <LandingPage onLeadSubmit={handleLeadSubmit} onGoToLogin={() => setViewState('login')} />;
  if (viewState === 'login') return <LoginScreen onLogin={(role) => { setCurrentUser(role === 'admin' ? MOCK_USER : MOCK_CLIENT); setViewState('dashboard'); }} onGoBack={() => setViewState('public')} />;
  if (!currentUser) return null;

  return (
    <div className="flex min-h-screen selection:bg-blue-100">
      <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} userRole={currentUser.role} />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-12 sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <h2 className="font-black text-slate-900 uppercase tracking-widest text-[11px] bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">{currentTab.replace('_', ' ')}</h2>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => { setViewState('public'); setCurrentUser(null); }} className="text-[10px] font-black uppercase tracking-widest px-4 py-2 bg-slate-100 text-slate-800 rounded-xl hover:bg-slate-200 transition-colors">Logout</button>
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)} 
                className="p-3 bg-slate-100 rounded-2xl relative hover:bg-slate-200 transition-all shadow-sm text-slate-900"
              >
                <ICONS.Bell />
                {notifications.filter(n => !n.isRead).length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full border border-white"></span>}
              </button>
              {showNotifications && <NotificationCenter notifications={notifications} onMarkAsRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))} onClose={() => setShowNotifications(false)} />}
            </div>
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-slate-200">{currentUser.name.charAt(0)}</div>
          </div>
        </header>
        <main className="flex-1 p-12 bg-slate-50 overflow-y-auto">
          {currentTab === 'dashboard' && <div className="space-y-8 animate-in fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">System Overview</h2>
                <p className="text-slate-700 mt-1 font-medium">Flowgent™ Core Monitoring Dashboard.</p>
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setCurrentTab('reports')} 
                  className="bg-white border border-slate-300 px-6 py-3 rounded-2xl font-black text-[10px] text-slate-900 uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
                >
                  Generate Intelligence Report
                </button>
                <button onClick={() => setCurrentTab('automations')} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20">
                  + Launch Workflow
                </button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-6">
              {[
                { label: 'Scraped Leads', value: leads.length },
                { label: 'Hot Targets', value: leads.filter(l => l.temperature === 'hot').length },
                { label: 'Active Deals', value: deals.length },
                { label: 'Revenue Pipeline', value: `₹${(deals.reduce((acc, b) => acc + b.value, 0) / 100000).toFixed(1)}L` }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-7 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{stat.label}</p>
                  <h3 className="text-3xl font-black text-slate-900 mt-2 tracking-tighter">{stat.value}</h3>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-8">
               <div className="col-span-2 bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="font-bold text-xl text-slate-800 tracking-tight">Recent Discovery Activity</h3>
                    <button onClick={() => setCurrentTab('leads')} className="text-blue-700 font-black text-[10px] uppercase tracking-widest hover:text-blue-800 transition-colors">View All Engine</button>
                  </div>
                  <div className="space-y-4">
                    {leads.slice(0, 3).map(l => (
                      <div key={l.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center font-bold text-blue-600 shadow-sm">{l.businessName.charAt(0)}</div>
                            <div>
                               <p className="font-bold text-slate-900 text-sm">{l.businessName}</p>
                               <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{l.category}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-sm font-black text-slate-900">{l.score}/100</p>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Health</p>
                         </div>
                      </div>
                    ))}
                  </div>
               </div>
               <div className="bg-slate-900 p-10 rounded-[40px] text-white shadow-2xl flex flex-col justify-between">
                  <h3 className="text-2xl font-black tracking-tighter leading-tight">Automation <br/>Efficiency Engine</h3>
                  <p className="text-slate-400 text-sm font-medium mt-4">Infrastructure health checking active for {leads.length} entities. High-priority workflows running.</p>
                  <button onClick={() => setCurrentTab('automations')} className="w-full bg-blue-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest mt-10 hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/40">Enter n8n Orchestrator</button>
               </div>
            </div>
          </div>}
          {currentTab === 'scraper' && <ScraperView onPushToN8N={handlePushToN8N} onGeneratePitch={handleGeneratePitch} />}
          {currentTab === 'leads' && (
            <div className="space-y-8 animate-in fade-in">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tighter">Lead Engine</h2>
                <p className="text-slate-700 mt-1 font-medium italic">Scoring & AI-auditing the next generation of clients.</p>
              </div>
              <div className="grid grid-cols-3 gap-6">{leads.map(l => <LeadCard key={l.id} lead={l} onAudit={handleAudit} />)}</div>
            </div>
          )}
          {currentTab === 'funnel' && <FunnelView leads={leads} />}
          {currentTab === 'calendar' && <CalendarView />}
          {currentTab === 'crm' && <CrmView deals={deals} onMoveDeal={moveDeal} />}
          {currentTab === 'automations' && <AutomationView workflows={MOCK_WORKFLOWS} />}
          {currentTab === 'billing' && <SubscriptionsView subscriptions={MOCK_SUBSCRIPTIONS} />}
          {currentTab === 'projects' && <ProjectsListView projects={MOCK_PROJECTS} />}
          {currentTab === 'reports' && <ReportsView />}
          {currentTab === 'client_dashboard' && <ClientDashboard projects={MOCK_PROJECTS} leadStats={{ score: 78, rank: '#12' }} activityLogs={[]} />}
          {currentTab === 'settings' && (
            <div className="space-y-12 animate-in fade-in">
               <div>
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tighter">Platform Control</h2>
                  <p className="text-slate-700 font-medium mt-1">Manage infrastructure, security, and source code integrations.</p>
               </div>
               
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm space-y-8">
                     <h3 className="font-bold text-xl text-slate-900">Entity Details</h3>
                     <div className="space-y-4">
                        <div>
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Legal Organization</p>
                           <p className="font-black text-slate-900 text-lg">Digitex Studio</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Brand Authority</p>
                           <p className="font-black text-blue-600 text-lg uppercase tracking-widest">Flowgent™</p>
                        </div>
                     </div>
                     <div className="pt-6 border-t border-slate-100 flex gap-4">
                        <button className="px-6 py-3 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-xl">Team Management</button>
                        <button className="px-6 py-3 bg-slate-100 text-slate-700 font-black text-[10px] uppercase tracking-widest rounded-xl border border-slate-200">Security Audit</button>
                     </div>
                  </div>

                  <div className="bg-slate-50 border-2 border-dashed border-slate-200 p-10 rounded-[40px] space-y-8">
                     <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                           <div className="p-3 bg-white rounded-2xl shadow-sm">
                              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                           </div>
                           <h3 className="font-bold text-xl text-slate-900">GitHub Source Control</h3>
                        </div>
                        <span className="bg-green-100 text-green-700 px-3 py-1 text-[10px] font-black uppercase rounded-lg border border-green-200">Connected</span>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Repository</p>
                        <p className="font-black text-slate-900 mt-1">digitexhealthdocsvigit/Flowgent</p>
                        <p className="text-xs text-slate-600 mt-2 font-medium italic">Continuous Deployment active for branch: <span className="text-blue-600 font-bold">main</span></p>
                     </div>
                     <button className="w-full bg-white border border-slate-300 text-slate-900 font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all shadow-sm">Manage Repo Settings</button>
                  </div>
               </div>
            </div>
          )}
        </main>
      </div>

      {isAuditing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white p-10 rounded-[40px] max-w-sm w-full text-center space-y-6 shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div>
               <h3 className="text-xl font-black text-slate-900">Flowgent AI Active</h3>
               <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mt-2">Connecting to Gemini Core-3</p>
            </div>
          </div>
        </div>
      )}

      {currentAudit && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-10 overflow-y-auto">
          <div className="bg-white rounded-[48px] max-w-4xl w-full shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300">
            <button onClick={() => setCurrentAudit(null)} className="absolute top-10 right-10 text-slate-400 p-3 hover:bg-slate-50 rounded-full transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <div className="p-16 flex gap-16">
              <div className="flex-1 space-y-10">
                <div>
                   <span className="text-blue-600 font-black uppercase tracking-widest text-[10px]">AI Business Intelligence</span>
                   <h2 className="text-5xl font-black text-slate-900 mt-4 tracking-tighter leading-tight">{currentAudit.lead.businessName} Audit</h2>
                   <p className="text-slate-800 font-medium text-lg mt-6 leading-relaxed">{currentAudit.result.summary}</p>
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="p-6 bg-red-50/50 rounded-3xl border border-red-100">
                      <h4 className="font-black text-red-600 uppercase text-[10px] tracking-widest mb-4">Critical Gaps</h4>
                      <ul className="space-y-3">
                         {currentAudit.result.gaps.map((gap, i) => <li key={i} className="text-xs font-bold text-slate-900 flex gap-2"><span className="text-red-600">•</span> {gap}</li>)}
                      </ul>
                   </div>
                   <div className="p-6 bg-green-50/50 rounded-3xl border border-green-100">
                      <h4 className="font-black text-green-600 uppercase text-[10px] tracking-widest mb-4">Growth Strategy</h4>
                      <ul className="space-y-3">
                         {currentAudit.result.recommendations.map((rec, i) => <li key={i} className="text-xs font-bold text-slate-900 flex gap-2"><span className="text-green-600">✓</span> {rec}</li>)}
                      </ul>
                   </div>
                </div>
                <button onClick={handleConvertToDeal} className="w-full bg-blue-600 text-white font-black py-6 rounded-2xl shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all text-xs uppercase tracking-[0.2em]">Convert Lead to CRM Deal</button>
              </div>
              <div className="w-64 flex flex-col items-center justify-center shrink-0">
                 <div className="w-full aspect-square bg-slate-50 rounded-[48px] border border-slate-100 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Market Readiness</span>
                    <span className="text-7xl font-black text-slate-900 my-2">{currentAudit.result.score}%</span>
                    <div className="w-32 bg-slate-200 h-2 rounded-full mt-4 overflow-hidden">
                       <div className="bg-blue-600 h-full" style={{ width: `${currentAudit.result.score}%` }}></div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentPitch && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-10 overflow-y-auto">
          <div className="bg-white rounded-[40px] max-w-2xl w-full shadow-2xl p-12 relative animate-in slide-in-from-bottom-8 duration-300">
            <button onClick={() => setCurrentPitch(null)} className="absolute top-10 right-10 text-slate-400 p-3 hover:bg-slate-50 rounded-full transition-all font-black">✕</button>
            <div className="space-y-8">
              <div>
                <span className="text-blue-600 font-black uppercase text-[10px] tracking-widest">AI Generated Outreach Pitch</span>
                <h3 className="text-3xl font-black text-slate-900 mt-2 tracking-tighter">{currentPitch.name}</h3>
              </div>
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-200 font-medium text-slate-900 leading-relaxed whitespace-pre-wrap border-dashed">
                {currentPitch.content}
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    const msg = encodeURIComponent(currentPitch.content);
                    window.open(`https://wa.me/?text=${msg}`, '_blank');
                  }}
                  className="flex-1 bg-green-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-green-600/20 hover:bg-green-700 transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  Send via WhatsApp
                </button>
                <button 
                   onClick={() => {
                     navigator.clipboard.writeText(currentPitch.content);
                     setNotifications([{ id: Date.now().toString(), title: 'Copied!', message: 'Pitch copied to clipboard.', type: 'automation', timestamp: 'Just now', isRead: false }, ...notifications]);
                   }}
                   className="flex-1 bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-slate-800 transition-all text-xs uppercase tracking-widest"
                >
                  Copy to Clipboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
