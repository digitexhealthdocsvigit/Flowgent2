
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
import { Lead, AuditResult, Notification, User, Deal, AutomationWorkflow } from './types';
import { generateAudit, generateOutreach } from './services/geminiService';
import { calculateLeadScore } from './utils/scoring';
import { ICONS } from './constants';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<'public' | 'login' | 'dashboard'>('public');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [deals, setDeals] = useState<Deal[]>(MOCK_DEALS);
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>(MOCK_WORKFLOWS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [currentAudit, setCurrentAudit] = useState<{ lead: Lead; result: AuditResult } | null>(null);
  const [currentPitch, setCurrentPitch] = useState<{ name: string; content: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://n8n.digitex.in/webhook/flowgent-orchestrator');
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial Auth Check
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetchProfile(session.user.id, session.user.email || '');
      } else {
        setIsLoadingAuth(false);
      }
    };

    checkAuth();

    // Listen for Auth Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await fetchProfile(session.user.id, session.user.email || '');
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setViewState('public');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string, email: string) => {
    try {
      // In a real app, you'd fetch from your 'users' table
      // const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
      
      // For this migration phase, we simulate the profile fetch based on our security audit rules
      // (Email containing 'digitex' is admin)
      const role = email.toLowerCase().includes('digitex') ? 'admin' : 'client';
      const user: User = {
        id: userId,
        name: email.split('@')[0],
        email: email,
        role: role as any,
        orgId: 'org-1'
      };
      
      setCurrentUser(user);
      setViewState('dashboard');
      setCurrentTab(role === 'client' ? 'client_dashboard' : 'dashboard');
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const addNotification = (title: string, message: string, type: Notification['type'] = 'automation') => {
    const newNotif: Notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: 'Just now',
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handlePushToN8N = (scraped: any) => {
    addNotification('n8n Webhook Fired', `Lead "${scraped.name}" pushed to: ${webhookUrl}`);
  };

  const handleGeneratePitch = async (scraped: any) => {
    setIsAuditing(true);
    try {
      const pitch = await generateOutreach(scraped.name, scraped.location);
      setCurrentPitch({ name: scraped.name, content: pitch });
    } finally {
      setIsAuditing(false);
    }
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
      addNotification('System Error', 'AI Audit Engine failed to reach Gemini node.', 'automation');
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
    addNotification('Deal Created', `${lead.businessName} moved to sales pipeline.`, 'deal');
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
    // Redirect to login to verify identity after lead submission if needed
    setViewState('login');
  };

  const handleManualLeadAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = {
      businessName: formData.get('businessName') as string,
      websiteUrl: formData.get('websiteUrl') as string,
      category: formData.get('category') as string,
    };
    const { score, temperature } = calculateLeadScore(data);
    const newLead: Lead = {
      id: Math.random().toString(36).substr(2, 9),
      ...data,
      email: 'manual@lead.com',
      city: 'Direct Entry',
      status: 'discovered',
      score,
      temperature,
      createdAt: new Date().toISOString()
    };
    setLeads([newLead, ...leads]);
    addNotification('Lead Added', `${data.businessName} has been manually registered.`);
    setShowAddLeadModal(false);
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

  const toggleWorkflow = (id: string) => {
    setWorkflows(prev => prev.map(wf => wf.id === id ? { ...wf, status: wf.status === 'active' ? 'inactive' : 'active' } : wf));
    addNotification('Workflow State Change', `Automation Node status updated.`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setViewState('public');
  };

  const handleGenericAction = (name: string) => {
    addNotification('System Trigger', `${name} initialized via Orchestrator.`);
  };

  const filteredLeads = leads.filter(l => 
    l.businessName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalMRR = MOCK_SUBSCRIPTIONS.filter(s => s.status === 'active').reduce((acc, s) => acc + s.amount, 0);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="space-y-4 text-center">
           <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Securing Session...</p>
        </div>
      </div>
    );
  }

  if (viewState === 'public') return <LandingPage onLeadSubmit={handleLeadSubmit} onGoToLogin={() => setViewState('login')} />;
  if (viewState === 'login') return <LoginScreen onLogin={() => setViewState('dashboard')} onGoBack={() => setViewState('public')} />;
  
  if (!currentUser) return null;

  return (
    <div className="flex min-h-screen bg-slate-50 selection:bg-blue-100 font-sans">
      <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} userRole={currentUser.role} />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-12 sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <h2 className="font-black text-slate-900 uppercase tracking-[0.2em] text-[10px] bg-slate-100 px-4 py-2 rounded-xl border border-slate-200">{currentTab.replace('_', ' ')}</h2>
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-green-50 rounded-xl border border-green-100">
               <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
               <span className="text-[9px] font-black uppercase text-green-700 tracking-widest">Automation Engine: Active</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={handleLogout} className="text-[10px] font-black uppercase tracking-widest px-8 py-3.5 bg-slate-900 text-white rounded-2xl hover:bg-red-600 transition-all shadow-lg shadow-slate-200 active:scale-95">Logout</button>
            <div className="relative" ref={notificationRef}>
              <button onClick={() => setShowNotifications(!showNotifications)} className="p-3.5 bg-slate-100 rounded-2xl relative hover:bg-slate-200 transition-all shadow-sm text-slate-900">
                <ICONS.Bell />
                {notifications.filter(n => !n.isRead).length > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>}
              </button>
              {showNotifications && <NotificationCenter notifications={notifications} onMarkAsRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))} onClose={() => setShowNotifications(false)} />}
            </div>
            <div className="flex items-center gap-3">
               <div className="text-right hidden sm:block">
                  <p className="text-xs font-black text-slate-900 leading-none">{currentUser.name}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{currentUser.role}</p>
               </div>
               <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-xl shadow-blue-500/20">{currentUser.name.charAt(0)}</div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-12 overflow-y-auto">
          {currentTab === 'dashboard' && <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter">System Orchestration</h2>
                <p className="text-slate-500 mt-1 font-medium italic">Digitex Studio Internal Control Environment.</p>
              </div>
              <div className="flex gap-4 w-full lg:w-auto">
                <button onClick={() => handleGenericAction('Intelligence Report Generation')} className="flex-1 lg:flex-none bg-white border border-slate-300 px-8 py-4 rounded-2xl font-black text-[10px] text-slate-900 uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm active:scale-95">
                  Generate Intelligence Report
                </button>
                <button onClick={() => handleGenericAction('Manual Workflow Launch')} className="flex-1 lg:flex-none bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 active:scale-95">
                  + Launch Workflow
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
              {[
                { label: 'Infrastructure Nodes', value: leads.length },
                { label: 'Hot Targets', value: leads.filter(l => l.temperature === 'hot').length },
                { label: 'Active Deals', value: deals.length },
                { label: 'System MRR', value: `₹${(totalMRR / 1000).toFixed(1)}k` }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm hover:shadow-xl transition-all group cursor-pointer" onClick={() => handleGenericAction(`Stat Drilldown: ${stat.label}`)}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                  <h3 className="text-4xl font-black text-slate-900 mt-2 tracking-tighter group-hover:text-blue-600 transition-colors">{stat.value}</h3>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
               <div className="lg:col-span-2 bg-white p-12 rounded-[56px] border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="font-black text-2xl text-slate-900 tracking-tight">Recent Discovery Engine Activity</h3>
                    <button onClick={() => setCurrentTab('leads')} className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:text-blue-800 transition-all">View All Nodes →</button>
                  </div>
                  <div className="space-y-6">
                    {leads.slice(0, 4).map(l => (
                      <div key={l.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-between group hover:bg-white hover:border-blue-100 transition-all cursor-pointer" onClick={() => handleAudit(l)}>
                         <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center font-black text-blue-600 shadow-sm group-hover:scale-110 transition-transform">{l.businessName.charAt(0)}</div>
                            <div>
                               <p className="font-black text-slate-900 text-lg leading-tight tracking-tight">{l.businessName}</p>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 italic">{l.category}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-xl font-black text-slate-900">{l.score}%</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">System Score</p>
                         </div>
                      </div>
                    ))}
                  </div>
               </div>
               
               <div className="bg-[#0f172a] p-12 rounded-[56px] text-white shadow-2xl flex flex-col justify-between relative overflow-hidden border border-white/5">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600 opacity-10 rounded-full -mr-24 -mt-24"></div>
                  <div className="relative z-10">
                    <h3 className="text-3xl font-black tracking-tighter leading-tight">Infrastructure <br/>Efficiency Engine</h3>
                    <p className="text-slate-400 text-sm font-medium mt-6 leading-relaxed">Infrastructure health checking active for {leads.length} entities. 14 n8n nodes synchronized. High-priority workflows running in parallel.</p>
                  </div>
                  <button onClick={() => setCurrentTab('automations')} className="w-full bg-blue-600 py-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] mt-12 hover:bg-blue-700 transition-all shadow-2xl shadow-blue-900/40 relative z-10 active:scale-95">Enter Flowgent™ Orchestrator</button>
               </div>
            </div>
          </div>}
          {currentTab === 'scraper' && <ScraperView onPushToN8N={handlePushToN8N} onGeneratePitch={handleGeneratePitch} />}
          {currentTab === 'leads' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Lead Discovery Node</h2>
                  <p className="text-slate-500 mt-1 font-medium italic">Scoring & AI-auditing for Digitex Studio growth.</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                    </div>
                    <input 
                      type="text" 
                      placeholder="Search Nodes..." 
                      className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all font-bold text-sm"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={() => setShowAddLeadModal(true)}
                    className="px-8 py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-200 active:scale-95"
                  >
                    + Register Lead
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredLeads.map(l => <LeadCard key={l.id} lead={l} onAudit={handleAudit} />)}
                {filteredLeads.length === 0 && (
                  <div className="col-span-full py-20 text-center space-y-4">
                    <p className="text-2xl font-black text-slate-300">No matching infrastructure nodes found.</p>
                    <button onClick={() => setSearchQuery('')} className="text-blue-600 font-black text-sm uppercase tracking-widest">Clear Search</button>
                  </div>
                )}
              </div>
            </div>
          )}
          {currentTab === 'funnel' && <FunnelView leads={leads} />}
          {currentTab === 'calendar' && <CalendarView />}
          {currentTab === 'crm' && <CrmView deals={deals} onMoveDeal={moveDeal} />}
          {currentTab === 'automations' && <AutomationView workflows={workflows} onToggleStatus={toggleWorkflow} />}
          {currentTab === 'billing' && <SubscriptionsView subscriptions={MOCK_SUBSCRIPTIONS} />}
          {currentTab === 'projects' && <ProjectsListView projects={MOCK_PROJECTS} />}
          {currentTab === 'reports' && <ReportsView />}
          {currentTab === 'client_dashboard' && <ClientDashboard projects={MOCK_PROJECTS} leadStats={{ score: 78, rank: '#12' }} activityLogs={[]} />}
          {currentTab === 'settings' && (
            <div className="space-y-12 animate-in fade-in duration-500">
               <div>
                  <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Platform Control</h2>
                  <p className="text-slate-500 mt-1 font-medium italic">Infrastructure, security, and repository synchronization.</p>
               </div>
               
               <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                  <div className="bg-white p-12 rounded-[56px] border border-slate-200 shadow-sm space-y-10">
                     <h3 className="font-black text-2xl text-slate-900 tracking-tight">System Entity Details</h3>
                     <div className="space-y-6">
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Legal Organization</p>
                           <p className="font-black text-slate-900 text-xl tracking-tight">Digitex Studio</p>
                        </div>
                        <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                           <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Active Brand Authority</p>
                           <p className="font-black text-blue-600 text-xl uppercase tracking-[0.1em]">FLOWGENT™</p>
                        </div>
                     </div>
                     <div className="pt-6 border-t border-slate-100 space-y-8">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Orchestrator Webhook Endpoint (n8n)</p>
                          <input 
                            type="text" 
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 font-mono text-xs text-slate-600"
                            value={webhookUrl}
                            onChange={e => setWebhookUrl(e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <button onClick={() => handleGenericAction('Team Management')} className="flex-1 px-8 py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-200 active:scale-95">Team Management</button>
                          <button onClick={() => handleGenericAction('Security Audit')} className="flex-1 px-8 py-4 bg-white text-slate-700 font-black text-[10px] uppercase tracking-widest rounded-2xl border border-slate-200 shadow-sm active:scale-95">Security Audit</button>
                        </div>
                     </div>
                  </div>

                  <div className="bg-[#0f172a] border border-white/5 p-12 rounded-[56px] space-y-10 shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
                     <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4">
                           <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                           </div>
                           <div>
                              <h3 className="font-black text-2xl text-white tracking-tight">GitHub Integration</h3>
                              <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Status: Synchronized</p>
                           </div>
                        </div>
                        <span className="bg-green-600/20 text-green-400 px-4 py-1.5 text-[9px] font-black uppercase rounded-lg border border-green-500/30">Active CI/CD</span>
                     </div>
                     <div className="space-y-4">
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Target Repository</p>
                           <p className="font-bold text-white text-lg font-mono">digitexhealthdocsvigit/Flowgent</p>
                        </div>
                        <p className="text-xs text-slate-400 font-medium italic px-2">Continuous Deployment active for branch: <span className="text-blue-400 font-bold">main</span></p>
                     </div>
                     <button onClick={() => handleGenericAction('GitHub Repository Management')} className="w-full bg-white text-slate-900 font-black py-5 rounded-2xl text-[10px] uppercase tracking-[0.3em] hover:bg-slate-100 transition-all shadow-xl shadow-white/5 active:scale-95">Manage Repository Link</button>
                  </div>
               </div>
            </div>
          )}
        </main>
      </div>

      {/* Manual Lead Modal - Improvised missing feature */}
      {showAddLeadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white p-12 rounded-[56px] max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300">
             <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Register Lead Node</h3>
                <button onClick={() => setShowAddLeadModal(false)} className="text-slate-400 hover:text-slate-900">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
             </div>
             <form onSubmit={handleManualLeadAdd} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Business Name</label>
                   <input required name="businessName" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-600 transition-all font-bold" placeholder="e.g. Apex Global" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Website URL</label>
                   <input name="websiteUrl" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-600 transition-all font-bold" placeholder="https://..." />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</label>
                   <input required name="category" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-600 transition-all font-bold" placeholder="e.g. Logistics" />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-black py-6 rounded-2xl shadow-xl shadow-blue-500/20 uppercase tracking-widest text-xs">Create Lead & Score</button>
             </form>
          </div>
        </div>
      )}

      {isAuditing && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white p-12 rounded-[56px] max-w-sm w-full text-center space-y-8 shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="relative w-24 h-24 mx-auto">
               <div className="absolute inset-0 border-8 border-blue-600/10 rounded-full"></div>
               <div className="absolute inset-0 border-8 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <div>
               <h3 className="text-2xl font-black text-slate-900 tracking-tight">Flowgent AI Active</h3>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-3">Connecting to Gemini Intelligence Core-3</p>
            </div>
            <div className="space-y-2">
               <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full animate-progress-indefinite"></div>
               </div>
               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Compiling Market Analysis...</p>
            </div>
          </div>
        </div>
      )}

      {currentAudit && (
        <div className="fixed inset-0 bg-[#0f172a]/95 backdrop-blur-xl z-[100] flex items-center justify-center p-10 overflow-y-auto">
          <div className="bg-white rounded-[64px] max-w-5xl w-full shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-500 border border-white/10">
            <button onClick={() => setCurrentAudit(null)} className="absolute top-12 right-12 text-slate-300 p-4 hover:bg-slate-50 hover:text-slate-900 rounded-full transition-all z-10">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
            <div className="p-20 flex flex-col xl:flex-row gap-20">
              <div className="flex-1 space-y-12">
                <div>
                   <span className="bg-blue-50 text-blue-600 font-black uppercase tracking-[0.2em] text-[10px] px-5 py-2 rounded-full border border-blue-100">Intelligent Digital Audit Node</span>
                   <h2 className="text-6xl font-black text-slate-900 mt-8 tracking-tighter leading-[0.9]">{currentAudit.lead.businessName} Audit</h2>
                   <p className="text-slate-700 font-medium text-xl mt-8 leading-relaxed italic border-l-4 border-blue-600 pl-8">"{currentAudit.result.summary}"</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="p-10 bg-red-50/50 rounded-[40px] border border-red-100 space-y-6">
                      <h4 className="font-black text-red-600 uppercase text-[10px] tracking-widest flex items-center gap-3">
                        <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span> Critical System Gaps
                      </h4>
                      <ul className="space-y-4">
                         {currentAudit.result.gaps.map((gap, i) => <li key={i} className="text-sm font-bold text-slate-800 flex gap-4 items-start leading-tight"><span className="text-red-500 shrink-0">✕</span> {gap}</li>)}
                      </ul>
                   </div>
                   <div className="p-10 bg-green-50/50 rounded-[40px] border border-green-100 space-y-6">
                      <h4 className="font-black text-green-600 uppercase text-[10px] tracking-widest flex items-center gap-3">
                        <span className="w-2 h-2 bg-green-600 rounded-full"></span> Growth Optimization Path
                      </h4>
                      <ul className="space-y-4">
                         {currentAudit.result.recommendations.map((rec, i) => <li key={i} className="text-sm font-bold text-slate-800 flex gap-4 items-start leading-tight"><span className="text-green-500 shrink-0">✓</span> {rec}</li>)}
                      </ul>
                   </div>
                </div>
                <button onClick={handleConvertToDeal} className="w-full bg-blue-600 text-white font-black py-8 rounded-3xl shadow-2xl shadow-blue-500/30 hover:bg-blue-700 transition-all text-xs uppercase tracking-[0.4em]">Convert to Pipeline Deal</button>
              </div>
              <div className="w-full xl:w-72 flex flex-col items-center justify-center shrink-0">
                 <div className="w-full aspect-square bg-slate-50 rounded-[56px] border border-slate-100 flex flex-col items-center justify-center text-center shadow-inner relative overflow-hidden group">
                    <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">System Readiness Index</span>
                    <span className="text-8xl font-black text-slate-900 my-4 tracking-tighter relative z-10">{currentAudit.result.score}%</span>
                    <div className="w-32 bg-slate-200 h-4 rounded-full mt-6 overflow-hidden relative z-10 border border-white">
                       <div className="bg-blue-600 h-full shadow-lg" style={{ width: `${currentAudit.result.score}%` }}></div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentPitch && (
        <div className="fixed inset-0 bg-[#0f172a]/90 backdrop-blur-xl z-[100] flex items-center justify-center p-10 overflow-y-auto">
          <div className="bg-white rounded-[56px] max-w-2xl w-full shadow-2xl p-16 relative animate-in slide-in-from-bottom-12 duration-500 border border-white/10">
            <button onClick={() => setCurrentPitch(null)} className="absolute top-12 right-12 text-slate-300 p-4 hover:bg-slate-50 hover:text-slate-900 rounded-full transition-all font-black">✕</button>
            <div className="space-y-12">
              <div className="text-center">
                <span className="bg-blue-50 text-blue-600 font-black uppercase text-[10px] tracking-[0.2em] px-5 py-2 rounded-full border border-blue-100">AI High-Conversion Pitch</span>
                <h3 className="text-4xl font-black text-slate-900 mt-6 tracking-tighter">{currentPitch.name}</h3>
              </div>
              <div className="p-10 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 font-medium text-slate-800 text-lg leading-relaxed whitespace-pre-wrap italic shadow-inner">
                {currentPitch.content}
              </div>
              <div className="flex flex-col sm:flex-row gap-6">
                <button 
                  onClick={() => {
                    const msg = encodeURIComponent(currentPitch.content);
                    window.open(`https://wa.me/?text=${msg}`, '_blank');
                  }}
                  className="flex-1 bg-green-600 text-white font-black py-6 rounded-2xl shadow-2xl shadow-green-600/30 hover:bg-green-700 transition-all flex items-center justify-center gap-4 text-xs uppercase tracking-[0.2em]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  Send via WhatsApp
                </button>
                <button 
                   onClick={() => {
                     navigator.clipboard.writeText(currentPitch.content);
                     addNotification('Clipboard Sync', 'Pitch copied to local system buffers.');
                   }}
                   className="flex-1 bg-slate-900 text-white font-black py-6 rounded-2xl hover:bg-slate-800 transition-all text-xs uppercase tracking-[0.2em] shadow-2xl"
                >
                  Copy to System
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
