
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
import { Lead, AuditResult, Notification, User, Deal, AutomationWorkflow, LeadStatus, ServiceTier } from './types';
import { generateAuditWithTools, generateOutreach, generateVideoIntro } from './services/geminiService';
import { calculateLeadScore } from './utils/scoring';
import { ICONS } from './constants';
import { supabase, isSupabaseConfigured } from './lib/supabase';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<'public' | 'login' | 'dashboard'>('public');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>(MOCK_DEALS);
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>(MOCK_WORKFLOWS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isAuditing, setIsAuditing] = useState(false);
  const [currentAudit, setCurrentAudit] = useState<{ lead: Lead; result: AuditResult } | null>(null);
  const [currentPitch, setCurrentPitch] = useState<{ name: string; content: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [signals, setSignals] = useState<{id: string, text: string, type: 'tool' | 'webhook', time: string}[]>([]);
  
  const [filterStatus, setFilterStatus] = useState<LeadStatus | 'all'>('all');
  const [filterHotOnly, setFilterHotOnly] = useState(false);
  const [filterTier, setFilterTier] = useState<ServiceTier | 'all'>('all');
  const [filterSource, setFilterSource] = useState<string | 'all'>('all');
  
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://n8n.digitex.in/webhook/flowgent-orchestrator');
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isEmergencyBypass, setIsEmergencyBypass] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      if (!isSupabaseConfigured) {
        setIsLoadingAuth(false);
        setLeads(MOCK_LEADS as Lead[]);
        return;
      }
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await fetchProfile(session.user.id, session.user.email || '');
          await refreshLeads();
        } else {
          setIsLoadingAuth(false);
          setLeads(MOCK_LEADS as Lead[]);
        }
      } catch (err) {
        setIsLoadingAuth(false);
        setLeads(MOCK_LEADS as Lead[]);
      }
    };
    checkAuth();
  }, []);

  const refreshLeads = async () => {
    if (!isSupabaseConfigured || isEmergencyBypass) return;
    const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (data && !error) {
      setLeads(data.map((l: any) => ({
        id: l.id,
        business_name: l.business_name || l.businessName || 'Unknown Business',
        category: l.category,
        email: l.email,
        website: l.website_url || l.website || '',
        city: l.city || 'Location N/A',
        status: l.lead_status || l.status || 'discovered',
        score: l.score || 0,
        temperature: l.temperature || 'cold',
        created_at: l.created_at,
        lead_status: l.lead_status || l.status || 'discovered',
        pitch_type: l.pitch_type,
        is_hot_opportunity: l.is_hot_opportunity || false,
        service_tier: l.service_tier,
        est_contract_value: l.est_contract_value || l.estimated_value || 0,
        source: l.source || 'manual',
        phone: l.phone,
        rating: l.rating,
        reviews: l.reviews,
        video_pitch_url: l.video_pitch_url
      })));
    }
  };

  const fetchProfile = async (userId: string, email: string) => {
    const isAdmin = email.toLowerCase().includes('digitex') || email.toLowerCase().includes('founder');
    const user: User = { id: userId, name: email.split('@')[0], email, role: isAdmin ? 'admin' : 'client', orgId: 'org-1' };
    setCurrentUser(user);
    setViewState('dashboard');
    setCurrentTab(isAdmin ? 'dashboard' : 'client_dashboard');
    setIsLoadingAuth(false);
  };

  const logSignal = (text: string, type: 'tool' | 'webhook') => {
    setSignals(prev => [{ id: Math.random().toString(), text, type, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 10));
  };

  const handleAudit = async (lead: Lead) => {
    setIsAuditing(true);
    setCurrentAudit(null);
    try {
      const { audit, toolCalls } = await generateAuditWithTools(lead);
      
      // Handle Autonomous n8n Trigger via Gemini Tool Call
      if (toolCalls && toolCalls.length > 0) {
        for (const call of toolCalls) {
          if (call.name === 'trigger_n8n_signal') {
            logSignal(`AI triggered n8n for ${call.args.business_name}`, 'tool');
            await triggerWebhook(call.args);
          }
        }
      }

      if (isSupabaseConfigured && !isEmergencyBypass) {
        await supabase.from('leads').update({ score: audit.score, lead_status: 'scored' }).eq('id', lead.id);
      }

      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, score: audit.score, lead_status: 'scored' } : l));
      setCurrentAudit({ lead, result: audit });
    } catch (err) {
      console.error(err);
    } finally {
      setIsAuditing(false);
    }
  };

  const triggerWebhook = async (data: any) => {
    logSignal(`Dispatching webhook to ${webhookUrl}`, 'webhook');
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'ai_tool_dispatch', data, timestamp: new Date().toISOString() })
      });
      if (response.ok) logSignal("Webhook delivery confirmed", "webhook");
    } catch (e) {
      logSignal("Webhook failure: Check Endpoint", "webhook");
    }
  };

  // Fix: Implemented handleLeadSubmit to process public lead submissions
  const handleLeadSubmit = async (data: any) => {
    const scored = calculateLeadScore({
      business_name: data.businessName,
      website: data.websiteUrl,
      category: data.category,
      city: 'Location Pending'
    });

    const newLead: Lead = {
      id: Math.random().toString(36).substr(2, 9),
      business_name: data.businessName,
      category: data.category,
      email: data.email,
      website: data.websiteUrl,
      city: 'Location Pending',
      status: scored.lead_status,
      score: scored.score,
      temperature: scored.temperature,
      created_at: new Date().toISOString(),
      lead_status: scored.lead_status,
      pitch_type: scored.pitch_type,
      is_hot_opportunity: scored.is_hot_opportunity,
      service_tier: scored.service_tier,
      est_contract_value: scored.est_contract_value,
      source: 'landing_page'
    };

    if (isSupabaseConfigured && !isEmergencyBypass) {
      try {
        await supabase.from('leads').insert([{
          business_name: newLead.business_name,
          category: newLead.category,
          email: newLead.email,
          website_url: newLead.website,
          city: newLead.city,
          lead_status: newLead.lead_status,
          score: newLead.score,
          temperature: newLead.temperature,
          pitch_type: newLead.pitch_type,
          is_hot_opportunity: newLead.is_hot_opportunity,
          service_tier: newLead.service_tier,
          est_contract_value: newLead.est_contract_value,
          source: newLead.source
        }]);
        await refreshLeads();
      } catch (err) {
        setLeads(prev => [newLead, ...prev]);
      }
    } else {
      setLeads(prev => [newLead, ...prev]);
    }
    
    alert("Audit Request Received. Our AI is analyzing your infrastructure.");
  };

  // Fix: Implemented handleConvertToDeal to move an audited lead to the CRM pipeline
  const handleConvertToDeal = async () => {
    if (!currentAudit) return;
    const { lead } = currentAudit;
    
    const newDeal: Deal = {
      id: `d-${Math.random().toString(36).substr(2, 5)}`,
      leadId: lead.id,
      businessName: lead.business_name,
      stage: 'qualified',
      value: lead.est_contract_value || 0,
      updatedAt: new Date().toISOString(),
      service_tier: lead.service_tier,
      pitch_type: lead.pitch_type
    };

    setDeals(prev => [newDeal, ...prev]);
    
    if (isSupabaseConfigured && !isEmergencyBypass) {
      try {
        await supabase.from('leads').update({ lead_status: 'qualified' }).eq('id', lead.id);
        await refreshLeads();
      } catch (err) {
         setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, lead_status: 'qualified', status: 'qualified' } : l));
      }
    } else {
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, lead_status: 'qualified', status: 'qualified' } : l));
    }

    setCurrentAudit(null);
    setCurrentTab('crm');
    alert(`Deal created for ${lead.business_name}!`);
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    setCurrentUser(null);
    setViewState('public');
  };

  const handleAppLogin = (mockUser?: User) => {
    if (mockUser) {
      setCurrentUser(mockUser);
      setViewState('dashboard');
      setCurrentTab(mockUser.role === 'admin' ? 'dashboard' : 'client_dashboard');
    }
  };

  const filteredLeads = leads.filter(l => {
    const bName = l.business_name || '';
    const matchesQuery = bName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || l.lead_status === filterStatus;
    const matchesHot = !filterHotOnly || l.is_hot_opportunity;
    return matchesQuery && matchesStatus && matchesHot;
  });

  if (isLoadingAuth) return <div className="min-h-screen bg-[#030712] flex items-center justify-center text-slate-500 font-black">SYNCING CLOUD NODE...</div>;
  if (viewState === 'public') return <LandingPage onLeadSubmit={handleLeadSubmit} onGoToLogin={() => setViewState('login')} />;
  if (viewState === 'login') return <LoginScreen onLogin={handleAppLogin} onGoBack={() => setViewState('public')} />;
  if (!currentUser) return null;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-blue-100">
      <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} userRole={currentUser.role} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-12 sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <h2 className="font-black text-slate-900 uppercase tracking-widest text-[10px] bg-slate-100 px-4 py-2 rounded-xl">{currentTab}</h2>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={handleLogout} className="text-[10px] font-black uppercase tracking-widest px-8 py-3.5 bg-slate-900 text-white rounded-2xl hover:bg-red-600 transition-all">Logout</button>
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow-xl shadow-blue-500/20">{currentUser.name.charAt(0)}</div>
          </div>
        </header>

        <main className="flex-1 p-12 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                <div>
                  <h2 className="text-5xl font-black text-slate-900 tracking-tighter">System Control</h2>
                  <p className="text-slate-500 mt-1 font-medium italic">MCP Enabled Lead Orchestration.</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => refreshLeads()} className="bg-white border border-slate-300 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">Sync Cloud</button>
                  <button onClick={() => setShowAddLeadModal(true)} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-600/30">+ Register Node</button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-white p-12 rounded-[56px] border border-slate-200 shadow-sm">
                  <h3 className="font-black text-2xl text-slate-900 mb-10">Intelligence Feed</h3>
                  <div className="space-y-6">
                    {leads.slice(0, 4).map(l => (
                      <div key={l.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-between group hover:border-blue-100 cursor-pointer" onClick={() => handleAudit(l)}>
                         <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-white">{l.business_name.charAt(0)}</div>
                            <div>
                               <p className="font-black text-slate-900 text-lg leading-tight tracking-tight">{l.business_name}</p>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{l.category}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-xl font-black text-slate-900">₹{(l.est_contract_value || 0).toLocaleString()}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">EST. VALUE</p>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-10">
                  <div className="bg-[#0f172a] p-12 rounded-[56px] text-white shadow-2xl relative overflow-hidden group">
                    <h3 className="text-3xl font-black tracking-tighter leading-tight">Live Signal Stream</h3>
                    <div className="mt-8 space-y-4 max-h-60 overflow-y-auto font-mono text-[9px] text-slate-400">
                      {signals.length === 0 ? <p className="italic">Awaiting AI tools...</p> : signals.map(s => (
                        <div key={s.id} className="flex gap-3 border-l-2 border-blue-500 pl-4 py-1 animate-in slide-in-from-left-2">
                          <span className="text-blue-500">[{s.time}]</span>
                          <span className={s.type === 'tool' ? 'text-green-400' : 'text-slate-400'}>{s.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === 'leads' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredLeads.map(l => <LeadCard key={l.id} lead={l} onAudit={handleAudit} />)}
              </div>
            </div>
          )}

          {currentTab === 'scraper' && <ScraperView onPushToN8N={triggerWebhook} onGeneratePitch={() => {}} onGenerateVideo={async (s) => await generateVideoIntro(s.business_name)} />}
          {currentTab === 'automations' && <AutomationView workflows={workflows} onToggleStatus={() => {}} />}
          {currentTab === 'crm' && <CrmView deals={deals} />}
          {currentTab === 'client_dashboard' && <ClientDashboard projects={MOCK_PROJECTS} leadStats={{ score: 78, rank: '#12' }} activityLogs={[]} />}
        </main>
      </div>

      {isAuditing && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center text-white">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="font-black uppercase tracking-widest text-[10px]">AI AUDIT & SIGNAL ENGINE ACTIVE</p>
          </div>
        </div>
      )}

      {currentAudit && (
        <div className="fixed inset-0 bg-[#0f172a]/95 backdrop-blur-xl z-[100] flex items-center justify-center p-10 overflow-y-auto">
          <div className="bg-white rounded-[64px] max-w-5xl w-full p-20 relative animate-in zoom-in-95 duration-500 shadow-2xl">
            <button onClick={() => setCurrentAudit(null)} className="absolute top-12 right-12 text-slate-300 p-4 hover:bg-slate-50 hover:text-slate-900 rounded-full transition-all z-10 font-black text-xl">✕</button>
            <div className="flex flex-col xl:flex-row gap-20">
              <div className="flex-1 space-y-12">
                <h2 className="text-6xl font-black text-slate-900 tracking-tighter leading-[0.9]">{currentAudit.lead.business_name} Audit</h2>
                <p className="text-slate-700 font-medium text-xl leading-relaxed italic border-l-4 border-blue-600 pl-8">"{currentAudit.result.summary}"</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="p-10 bg-red-50/50 rounded-[40px] border border-red-100 space-y-6">
                      <h4 className="font-black text-red-600 uppercase text-[10px] tracking-widest">Gaps</h4>
                      <ul className="space-y-4">
                         {currentAudit.result.gaps.map((gap, i) => <li key={i} className="text-sm font-bold text-slate-800 flex gap-4">✕ {gap}</li>)}
                      </ul>
                   </div>
                   <div className="p-10 bg-green-50/50 rounded-[40px] border border-green-100 space-y-6">
                      <h4 className="font-black text-green-600 uppercase text-[10px] tracking-widest">Growth</h4>
                      <ul className="space-y-4">
                         {currentAudit.result.recommendations.map((rec, i) => <li key={i} className="text-sm font-bold text-slate-800 flex gap-4">✓ {rec}</li>)}
                      </ul>
                   </div>
                </div>
                <button onClick={handleConvertToDeal} className="w-full bg-slate-900 text-white font-black py-8 rounded-3xl shadow-2xl uppercase tracking-widest text-xs">Convert to Deal</button>
              </div>
              <div className="w-full xl:w-72 flex flex-col items-center justify-center bg-slate-50 rounded-[56px] p-10">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Readiness</span>
                  <span className="text-8xl font-black text-slate-900 my-4 tracking-tighter">{currentAudit.result.score}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
