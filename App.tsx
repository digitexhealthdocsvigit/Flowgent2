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
import { MOCK_LEADS, MOCK_DEALS, MOCK_NOTIFICATIONS, MOCK_PROJECTS, MOCK_SUBSCRIPTIONS, MOCK_WORKFLOWS } from './services/mockData';
import { Lead, AuditResult, Notification, User, Deal, AutomationWorkflow } from './types';
import { generateAudit, generateOutreach } from './services/geminiService';
import { calculateLeadScore } from './utils/scoring';
import { ICONS } from './constants';
import { supabase, isSupabaseConfigured } from './lib/supabase';

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
    const checkAuth = async () => {
      if (!isSupabaseConfigured) {
        setIsLoadingAuth(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await fetchProfile(session.user.id, session.user.email || '');
          await refreshLeads();
        } else {
          setIsLoadingAuth(false);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setIsLoadingAuth(false);
      }
    };

    checkAuth();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await fetchProfile(session.user.id, session.user.email || '');
          await refreshLeads();
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
          setViewState('public');
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const refreshLeads = async () => {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data && !error) {
      const formattedLeads: Lead[] = data.map((l: any) => ({
        id: l.id,
        businessName: l.business_name,
        category: l.category,
        email: l.email,
        websiteUrl: l.website_url,
        city: l.city,
        status: l.status,
        score: l.score,
        temperature: l.temperature,
        createdAt: l.created_at,
        orgId: l.org_id
      }));
      setLeads([...formattedLeads, ...MOCK_LEADS]);
    }
  };

  const fetchProfile = async (userId: string, email: string) => {
    try {
      const isAdmin = email.toLowerCase().includes('digitex') || email.toLowerCase().includes('founder');
      const role = isAdmin ? 'admin' : 'client';
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

  const handleAudit = async (lead: Lead) => {
    setIsAuditing(true);
    setCurrentAudit(null);
    try {
      const result = await generateAudit(lead.businessName, lead.websiteUrl);
      
      if (isSupabaseConfigured) {
        await supabase.from('leads').update({ 
          score: result.score, 
          status: 'audit_viewed' 
        }).eq('id', lead.id);
      }

      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, score: result.score, status: 'audit_viewed' } : l));
      setCurrentAudit({ lead, result });
    } catch (err) {
      console.error(err);
      addNotification('System Error', 'AI Audit Engine failed to reach Gemini node.', 'automation');
    } finally {
      setIsAuditing(false);
    }
  };

  const handleConvertToDeal = async () => {
    if (!currentAudit) return;
    const { lead, result } = currentAudit;
    const value = 50000 + (result.score * 1000);
    
    const newDeal: Deal = {
      id: `d-${Date.now()}`,
      leadId: lead.id,
      businessName: lead.businessName,
      stage: 'new',
      value,
      updatedAt: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      await supabase.from('deals').insert([{
        lead_id: lead.id,
        business_name: lead.businessName,
        stage: 'new',
        value: value
      }]);
      await supabase.from('leads').update({ status: 'converted' }).eq('id', lead.id);
    }

    setDeals([newDeal, ...deals]);
    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: 'converted' } : l));
    addNotification('Deal Created', `${lead.businessName} moved to sales pipeline.`, 'deal');
    setCurrentAudit(null);
    setCurrentTab('crm');
  };

  const handleLeadSubmit = async (data: any) => {
    const { score, temperature } = calculateLeadScore({ ...data, websiteUrl: data.websiteUrl });
    const leadData = {
      businessName: data.businessName,
      websiteUrl: data.websiteUrl,
      category: data.category || 'General',
      email: data.email || 'lead@inquiry.com',
      city: 'Inbound',
      status: 'discovered' as const,
      score,
      temperature,
      createdAt: new Date().toISOString()
    };

    if (isSupabaseConfigured) {
      const { data: savedLead, error } = await supabase.from('leads').insert([{
        business_name: leadData.businessName,
        website_url: leadData.websiteUrl,
        category: leadData.category,
        email: leadData.email,
        city: leadData.city,
        status: leadData.status,
        score: leadData.score,
        temperature: leadData.temperature
      }]).select().single();
      
      if (savedLead && !error) {
        setLeads([{ ...leadData, id: savedLead.id }, ...leads]);
      }
    } else {
      setLeads([{ ...leadData, id: Math.random().toString(36).substr(2, 9) }, ...leads]);
    }
    
    setViewState('login');
  };

  const handleManualLeadAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const data = {
      businessName: formData.get('businessName') as string,
      websiteUrl: formData.get('websiteUrl') as string,
      category: formData.get('category') as string,
      email: formData.get('email') as string || 'manual@lead.com'
    };
    const { score, temperature } = calculateLeadScore(data);
    
    if (isSupabaseConfigured) {
      const { data: saved, error } = await supabase.from('leads').insert([{
        business_name: data.businessName,
        website_url: data.websiteUrl,
        category: data.category,
        email: data.email,
        city: 'Direct Entry',
        status: 'discovered',
        score,
        temperature
      }]).select().single();
      
      if (saved && !error) {
        setLeads([{ 
          id: saved.id, 
          ...data, 
          city: 'Direct Entry', 
          status: 'discovered', 
          score, 
          temperature, 
          createdAt: saved.created_at 
        }, ...leads]);
      }
    } else {
      const newLead: Lead = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        city: 'Direct Entry',
        status: 'discovered',
        score,
        temperature,
        createdAt: new Date().toISOString()
      };
      setLeads([newLead, ...leads]);
    }

    addNotification('Lead Added', `${data.businessName} has been manually registered.`);
    setShowAddLeadModal(false);
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setViewState('public');
  };

  const handleAppLogin = (mockUser?: User) => {
    if (mockUser) {
      setCurrentUser(mockUser);
      setViewState('dashboard');
      setCurrentTab(mockUser.role === 'client' ? 'client_dashboard' : 'dashboard');
    }
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
  if (viewState === 'login') return <LoginScreen onLogin={handleAppLogin} onGoBack={() => setViewState('public')} />;
  
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
            <div className="relative">
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
          {currentTab === 'dashboard' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                  <h2 className="text-5xl font-black text-slate-900 tracking-tighter">System Orchestration</h2>
                  <p className="text-slate-500 mt-1 font-medium italic">Digitex Studio Internal Control Environment.</p>
                </div>
                <div className="flex gap-4 w-full lg:w-auto">
                  <button onClick={() => refreshLeads()} className="flex-1 lg:flex-none bg-white border border-slate-300 px-8 py-4 rounded-2xl font-black text-[10px] text-slate-900 uppercase tracking-widest hover:bg-slate-50">Sync Cloud</button>
                  <button onClick={() => setShowAddLeadModal(true)} className="flex-1 lg:flex-none bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-600/30">+ Register Node</button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
                {[
                  { label: 'Infrastructure Nodes', value: leads.length },
                  { label: 'Hot Targets', value: leads.filter(l => l.temperature === 'hot').length },
                  { label: 'Active Deals', value: deals.length },
                  { label: 'System MRR', value: `₹${(totalMRR / 1000).toFixed(1)}k` }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm hover:shadow-xl transition-all group cursor-pointer">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                    <h3 className="text-4xl font-black text-slate-900 mt-2 tracking-tighter group-hover:text-blue-600 transition-colors">{stat.value}</h3>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-white p-12 rounded-[56px] border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="font-black text-2xl text-slate-900 tracking-tight">Recent Activity</h3>
                    <button onClick={() => setCurrentTab('leads')} className="text-blue-600 font-black text-[10px] uppercase tracking-widest">View All →</button>
                  </div>
                  <div className="space-y-6">
                    {leads.slice(0, 4).map(l => (
                      <div key={l.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-between group hover:bg-white hover:border-blue-100 transition-all cursor-pointer" onClick={() => handleAudit(l)}>
                         <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center font-black text-blue-600 shadow-sm">{l.businessName.charAt(0)}</div>
                            <div>
                               <p className="font-black text-slate-900 text-lg leading-tight tracking-tight">{l.businessName}</p>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 italic">{l.category}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-xl font-black text-slate-900">{l.score}%</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Score</p>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-[#0f172a] p-12 rounded-[56px] text-white shadow-2xl flex flex-col justify-between relative overflow-hidden border border-white/5">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600 opacity-10 rounded-full -mr-24 -mt-24"></div>
                  <div className="relative z-10">
                    <h3 className="text-3xl font-black tracking-tighter leading-tight">Flowgent™ <br/>Efficiency Engine</h3>
                    <p className="text-slate-400 text-sm font-medium mt-6 leading-relaxed">Infrastructure health monitoring {leads.length} active entities. All n8n worker nodes synchronized.</p>
                  </div>
                  <button onClick={() => setCurrentTab('automations')} className="w-full bg-blue-600 py-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] mt-12 shadow-2xl shadow-blue-900/40 relative z-10 active:scale-95">Enter Orchestrator</button>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'scraper' && <ScraperView onPushToN8N={(s) => addNotification('n8n Webhook', `Pushed ${s.name} to orchestrator.`)} onGeneratePitch={async (s) => {
            setIsAuditing(true);
            const p = await generateOutreach(s.name, s.location);
            setCurrentPitch({ name: s.name, content: p });
            setIsAuditing(false);
          }} />}
          {currentTab === 'leads' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="flex justify-between items-center">
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Lead Engine</h2>
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    placeholder="Search Nodes..." 
                    className="bg-white border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:ring-4 focus:ring-blue-600/10 font-bold text-sm"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  <button onClick={() => setShowAddLeadModal(true)} className="px-8 py-4 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl">+ Register</button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredLeads.map(l => <LeadCard key={l.id} lead={l} onAudit={handleAudit} />)}
              </div>
            </div>
          )}
          {currentTab === 'funnel' && <FunnelView leads={leads} />}
          {currentTab === 'calendar' && <CalendarView />}
          {currentTab === 'crm' && <CrmView deals={deals} onMoveDeal={(id, dir) => {
            const stages: Deal['stage'][] = ['new', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
            setDeals(prev => prev.map(deal => {
              if (deal.id === id) {
                const cur = stages.indexOf(deal.stage);
                const next = dir === 'forward' ? Math.min(cur + 1, 5) : Math.max(cur - 1, 0);
                return { ...deal, stage: stages[next] };
              }
              return deal;
            }));
          }} />}
          {currentTab === 'automations' && <AutomationView workflows={workflows} onToggleStatus={(id) => setWorkflows(prev => prev.map(w => w.id === id ? { ...w, status: w.status === 'active' ? 'inactive' : 'active' } : w))} />}
          {currentTab === 'billing' && <SubscriptionsView subscriptions={MOCK_SUBSCRIPTIONS} />}
          {currentTab === 'settings' && (
            <div className="space-y-12 animate-in fade-in duration-500">
               <div>
                  <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Control Center</h2>
                  <p className="text-slate-500 mt-1 font-medium">Manage infrastructure parameters and system links.</p>
               </div>
               <div className="bg-white p-12 rounded-[56px] border border-slate-200 max-w-2xl">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">n8n Webhook Endpoint</label>
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 font-mono text-sm"
                    value={webhookUrl}
                    onChange={e => setWebhookUrl(e.target.value)}
                  />
               </div>
            </div>
          )}
          
          {currentTab === 'client_dashboard' && <ClientDashboard projects={MOCK_PROJECTS} leadStats={{ score: 78, rank: '#12' }} activityLogs={[]} />}
          {currentTab === 'projects' && <ProjectsListView projects={MOCK_PROJECTS} />}
          {currentTab === 'reports' && <ReportsView />}
        </main>
      </div>

      {showAddLeadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white p-12 rounded-[56px] max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300">
             <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Register Node</h3>
                <button onClick={() => setShowAddLeadModal(false)} className="text-slate-400 hover:text-slate-900">✕</button>
             </div>
             <form onSubmit={handleManualLeadAdd} className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Business Name</label>
                   <input required name="businessName" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-600 transition-all font-bold" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Website URL</label>
                   <input name="websiteUrl" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-600 transition-all font-bold" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Contact</label>
                   <input required name="email" type="email" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-600 transition-all font-bold" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</label>
                   <input required name="category" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 outline-none focus:border-blue-600 transition-all font-bold" />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-black py-6 rounded-2xl shadow-xl uppercase tracking-widest text-xs">Create & Score</button>
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
               <h3 className="text-2xl font-black text-slate-900 tracking-tight">AI Orchestrator Active</h3>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-3">Connecting to Gemini Core</p>
            </div>
          </div>
        </div>
      )}

      {currentAudit && (
        <div className="fixed inset-0 bg-[#0f172a]/95 backdrop-blur-xl z-[100] flex items-center justify-center p-10 overflow-y-auto">
          <div className="bg-white rounded-[64px] max-w-5xl w-full shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-500">
            <button onClick={() => setCurrentAudit(null)} className="absolute top-12 right-12 text-slate-300 p-4 hover:bg-slate-50 hover:text-slate-900 rounded-full transition-all z-10 font-black text-xl">✕</button>
            <div className="p-20 flex flex-col xl:flex-row gap-20">
              <div className="flex-1 space-y-12">
                <div>
                   <span className="bg-blue-50 text-blue-600 font-black uppercase tracking-[0.2em] text-[10px] px-5 py-2 rounded-full border border-blue-100">Intelligent Digital Audit Node</span>
                   <h2 className="text-6xl font-black text-slate-900 mt-8 tracking-tighter leading-[0.9]">{currentAudit.lead.businessName} Audit</h2>
                   <p className="text-slate-700 font-medium text-xl mt-8 leading-relaxed italic border-l-4 border-blue-600 pl-8">"{currentAudit.result.summary}"</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="p-10 bg-red-50/50 rounded-[40px] border border-red-100 space-y-6">
                      <h4 className="font-black text-red-600 uppercase text-[10px] tracking-widest">Critical System Gaps</h4>
                      <ul className="space-y-4">
                         {currentAudit.result.gaps.map((gap, i) => <li key={i} className="text-sm font-bold text-slate-800 flex gap-4 items-start"><span className="text-red-500 shrink-0">✕</span> {gap}</li>)}
                      </ul>
                   </div>
                   <div className="p-10 bg-green-50/50 rounded-[40px] border border-green-100 space-y-6">
                      <h4 className="font-black text-green-600 uppercase text-[10px] tracking-widest">Growth Path</h4>
                      <ul className="space-y-4">
                         {currentAudit.result.recommendations.map((rec, i) => <li key={i} className="text-sm font-bold text-slate-800 flex gap-4 items-start"><span className="text-green-500 shrink-0">✓</span> {rec}</li>)}
                      </ul>
                   </div>
                </div>
                <button onClick={handleConvertToDeal} className="w-full bg-blue-600 text-white font-black py-8 rounded-3xl shadow-2xl hover:bg-blue-700 transition-all text-xs uppercase tracking-[0.4em]">Convert to Pipeline Deal</button>
              </div>
              <div className="w-full xl:w-72 flex flex-col items-center justify-center shrink-0">
                 <div className="w-full aspect-square bg-slate-50 rounded-[56px] border border-slate-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest relative z-10">Readiness</span>
                    <span className="text-8xl font-black text-slate-900 my-4 tracking-tighter relative z-10">{currentAudit.result.score}%</span>
                    <div className="w-32 bg-slate-200 h-4 rounded-full mt-6 overflow-hidden relative z-10">
                       <div className="bg-blue-600 h-full" style={{ width: `${currentAudit.result.score}%` }}></div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentPitch && (
        <div className="fixed inset-0 bg-[#0f172a]/90 backdrop-blur-xl z-[100] flex items-center justify-center p-10 overflow-y-auto">
          <div className="bg-white rounded-[56px] max-w-2xl w-full shadow-2xl p-16 relative animate-in slide-in-from-bottom-12 duration-500">
            <button onClick={() => setCurrentPitch(null)} className="absolute top-12 right-12 text-slate-300 p-4 hover:bg-slate-50 hover:text-slate-900 rounded-full transition-all font-black">✕</button>
            <div className="space-y-12">
              <div className="text-center">
                <span className="bg-blue-50 text-blue-600 font-black uppercase text-[10px] tracking-[0.2em] px-5 py-2 rounded-full">AI Outreach Pitch</span>
                <h3 className="text-4xl font-black text-slate-900 mt-6 tracking-tighter">{currentPitch.name}</h3>
              </div>
              <div className="p-10 bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200 font-medium text-slate-800 text-lg leading-relaxed whitespace-pre-wrap italic">
                {currentPitch.content}
              </div>
              <div className="flex gap-6">
                <button onClick={() => { navigator.clipboard.writeText(currentPitch.content); addNotification('Clipboard', 'Pitch copied.'); }} className="flex-1 bg-slate-900 text-white font-black py-6 rounded-2xl uppercase tracking-[0.2em] text-[10px]">Copy to Clipboard</button>
                <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(currentPitch.content)}`, '_blank')} className="flex-1 bg-green-600 text-white font-black py-6 rounded-2xl uppercase tracking-[0.2em] text-[10px]">Send WhatsApp</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;