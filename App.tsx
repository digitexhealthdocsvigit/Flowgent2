
import React, { useState, useEffect, useMemo } from 'react';
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
import DecisionScienceView from './components/DecisionScienceView';
import AdminInfographic from './components/AdminInfographic';
import { DecisionBanner, SignalLog } from './components/AppContent';
import { MOCK_LEADS, MOCK_DEALS, MOCK_NOTIFICATIONS, MOCK_PROJECTS, MOCK_WORKFLOWS, MOCK_SUBSCRIPTIONS } from './services/mockData';
import { Lead, AuditResult, User, Deal, AutomationWorkflow } from './types';
import { generateAuditWithTools, generateVideoIntro } from './services/geminiService';
import { supabase, isSupabaseConfigured } from './lib/supabase';

/**
 * SettingsView: Terminal Configuration Node
 */
const SettingsView: React.FC<{ webhookUrl: string; onUpdate: (url: string) => void; onTest: () => void }> = ({ webhookUrl, onUpdate, onTest }) => {
  const [localUrl, setLocalUrl] = useState(webhookUrl);
  
  const handleSave = () => {
    onUpdate(localUrl);
    localStorage.setItem('flowgent_n8n_webhook', localUrl);
    alert("Neural Bridge Configured: n8n Orchestrator Updated.");
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic leading-none uppercase">System Architecture</h2>
          <p className="text-slate-500 mt-2 font-medium italic">Terminal ID: flowgent-master-node-01</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-12 rounded-[56px] border border-slate-200 shadow-sm space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 italic">n8n Orchestrator Bridge</h3>
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Production Webhook URI</label>
              <input 
                type="text"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
                value={localUrl}
                onChange={(e) => setLocalUrl(e.target.value)}
                placeholder="https://n8n.your-domain.com/webhook/..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={handleSave} className="bg-slate-900 text-white px-6 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95">Save Config</button>
              <button onClick={onTest} className="bg-blue-600 text-white px-6 py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl active:scale-95">Test Signal</button>
            </div>
          </div>
        </div>

        <div className="bg-[#0f172a] p-12 rounded-[56px] text-white shadow-2xl space-y-8 relative overflow-hidden flex flex-col justify-between">
          <h3 className="text-xl font-black text-blue-400 italic mb-8">Node Telemetry Status</h3>
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Supabase Sync</span>
              <span className="text-green-500 font-black italic text-sm">Synchronized</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">n8n Handshake</span>
              <span className="text-blue-500 font-black italic text-sm">Active</span>
            </div>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600">Infrastructure Build: v2.7.8-stable</p>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [viewState, setViewState] = useState<'public' | 'login' | 'dashboard'>('public');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals] = useState<Deal[]>(MOCK_DEALS);
  const [workflows] = useState<AutomationWorkflow[]>(MOCK_WORKFLOWS);
  const [isAuditing, setIsAuditing] = useState(false);
  const [currentAudit, setCurrentAudit] = useState<{ lead: Lead; result: AuditResult } | null>(null);
  const [signals, setSignals] = useState<{id: string, text: string, type: 'tool' | 'webhook', time: string}[]>([]);
  const [webhookUrl, setWebhookUrl] = useState(() => localStorage.getItem('flowgent_n8n_webhook') || 'https://n8n.digitex.in/webhook/flowgent-orchestrator');
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

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
          fetchProfile(session.user.id, session.user.email || '');
          refreshLeads();
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
    if (!isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (data && !error) {
        setLeads(data.map((l: any) => ({
          ...l,
          business_name: l.business_name || l.businessName || 'Unknown Business',
          lead_status: l.lead_status || l.status || 'discovered',
          readiness_score: l.readiness_score || l.score || 0,
          temperature: l.temperature || (l.readiness_score > 70 ? 'hot' : 'cold'),
          is_hot_opportunity: l.is_hot_opportunity || (l.readiness_score > 75)
        })));
      }
    } catch (e) {
      console.error("Refresh Leads Terminal Error:", e);
    }
  };

  const fetchProfile = (userId: string, email: string) => {
    const isAdmin = email.toLowerCase().includes('digitex') || email.toLowerCase().includes('founder');
    const user: User = { id: userId, name: email.split('@')[0], email, role: isAdmin ? 'admin' : 'client', orgId: 'org-1' };
    setCurrentUser(user);
    setViewState('dashboard');
    setCurrentTab(isAdmin ? 'dashboard' : 'client_dashboard');
    setIsLoadingAuth(false);
  };

  const logSignal = (text: string, type: 'tool' | 'webhook') => {
    setSignals(prev => [{ id: Math.random().toString(), text, type, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 15));
  };

  const triggerWebhook = async (data: any) => {
    logSignal(`Pushing Payload to n8n`, 'webhook');
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'mcp_signal', payload: data, timestamp: new Date().toISOString() })
      });
      if (response.ok) logSignal("n8n Bridge: 200 OK", "webhook");
    } catch (e) {
      logSignal("n8n Bridge: Connection Refused", "webhook");
    }
  };

  const handleAudit = async (lead: Lead) => {
    setIsAuditing(true);
    setCurrentAudit(null);
    logSignal(`Auditing ${lead.business_name}`, 'tool');
    try {
      const { audit, toolCalls } = await generateAuditWithTools(lead);
      if (toolCalls?.length) {
        for (const call of toolCalls) {
          if (call.name === 'trigger_n8n_signal') {
            logSignal(`MCP Dispatch: Signal sent`, 'tool');
            await triggerWebhook({ ...call.args, lead_id: lead.id, readiness: audit.score });
          }
        }
      }
      setCurrentAudit({ lead: { ...lead, ...audit }, result: audit });
    } catch (err) {
      logSignal("Neural Path Failure", "tool");
    } finally {
      setIsAuditing(false);
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    setCurrentUser(null);
    setViewState('public');
  };

  if (isLoadingAuth) return <div className="min-h-screen bg-[#030712] flex items-center justify-center text-slate-500 font-black tracking-widest uppercase italic">Synchronizing Core Terminal...</div>;
  if (viewState === 'public') return <LandingPage onLeadSubmit={() => {}} onGoToLogin={() => setViewState('login')} />;
  if (viewState === 'login') return <LoginScreen onLogin={() => {}} onGoBack={() => setViewState('public')} />;
  if (!currentUser) return null;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-blue-100">
      <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} userRole={currentUser.role} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-12 sticky top-0 z-40">
           <div className="flex items-center gap-4">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
              <h2 className="font-black text-slate-900 uppercase tracking-tighter text-[10px] bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 italic">Node: {currentTab.toUpperCase()}</h2>
           </div>
           <div className="flex items-center gap-6">
            <button onClick={handleLogout} className="text-[10px] font-black uppercase tracking-widest px-8 py-3.5 bg-slate-900 text-white rounded-2xl hover:bg-red-600 transition-all shadow-lg">Logout</button>
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow-xl">{currentUser.name.charAt(0)}</div>
          </div>
        </header>

        <main className="flex-1 p-12 overflow-y-auto custom-scrollbar">
          {currentTab === 'dashboard' && (
            <div className="space-y-10 animate-in fade-in">
              <h2 className="text-6xl font-black text-slate-900 tracking-tighter italic">Founder Portal</h2>
              <AdminInfographic />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-white p-12 rounded-[56px] border border-slate-200 shadow-sm">
                  <h3 className="font-black text-2xl text-slate-900 mb-10 italic">Intelligence Feed</h3>
                  <div className="space-y-6">
                    {leads.slice(0, 5).map(l => (
                      <div key={l.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-between group hover:border-blue-200 cursor-pointer" onClick={() => handleAudit(l)}>
                         <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center font-black text-slate-900 shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all">{l.business_name.charAt(0)}</div>
                            <div>
                               <p className="font-black text-slate-900 text-lg">{l.business_name}</p>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{l.category}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-xl font-black text-blue-600 italic">{l.readiness_score || 0}%</p>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white p-12 rounded-[56px] border border-slate-200 shadow-sm overflow-hidden">
                   <h3 className="font-black text-2xl text-slate-900 mb-10 italic">Signal Telemetry</h3>
                   <SignalLog signals={signals} />
                </div>
              </div>
            </div>
          )}

          {currentTab === 'client_dashboard' && <ClientDashboard projects={MOCK_PROJECTS} leadStats={{ score: 88, rank: '#1' }} activityLogs={[]} />}
          {currentTab === 'hot_opps' && (
            <div className="space-y-10">
               <h2 className="text-6xl font-black text-slate-900 tracking-tighter italic uppercase">Neural Opps</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {leads.filter(l => l.is_hot_opportunity).map(l => <LeadCard key={l.id} lead={l} onAudit={handleAudit} />)}
               </div>
            </div>
          )}
          {currentTab === 'funnel' && <FunnelView leads={leads} />}
          {currentTab === 'scraper' && <ScraperView onPushToN8N={triggerWebhook} onGeneratePitch={() => {}} onGenerateVideo={async (l) => await generateVideoIntro(l.business_name)} />}
          {currentTab === 'leads' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {leads.map(l => <LeadCard key={l.id} lead={l} onAudit={handleAudit} />)}
            </div>
          )}
          {currentTab === 'calendar' && <CalendarView />}
          {currentTab === 'crm' && <CrmView deals={deals} />}
          {currentTab === 'automations' && <AutomationView workflows={workflows} onToggleStatus={() => {}} signals={signals} />}
          {currentTab === 'reports' && <ReportsView />}
          {currentTab === 'billing' && <SubscriptionsView subscriptions={MOCK_SUBSCRIPTIONS} />}
          {currentTab === 'settings' && <SettingsView webhookUrl={webhookUrl} onUpdate={setWebhookUrl} onTest={() => triggerWebhook({ test: true })} />}
        </main>
      </div>

      {isAuditing && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center text-white">
          <div className="w-24 h-24 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-8"></div>
          <p className="font-black uppercase tracking-[0.4em] text-xs italic">Synchronizing Neural Node...</p>
        </div>
      )}

      {currentAudit && (
        <div className="fixed inset-0 bg-[#0f172a]/95 backdrop-blur-xl z-[100] flex items-center justify-center p-10 overflow-y-auto">
          <div className="bg-white rounded-[64px] max-w-6xl w-full p-20 relative animate-in zoom-in-95 duration-500 shadow-2xl overflow-hidden">
             <button onClick={() => setCurrentAudit(null)} className="absolute top-12 right-12 text-slate-300 p-4 hover:bg-slate-50 hover:text-slate-900 rounded-full transition-all z-20 font-black text-xl">✕</button>
             <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-20">
                <div className="lg:col-span-2 space-y-12">
                   <div>
                      <h2 className="text-6xl font-black text-slate-900 tracking-tighter leading-[0.9]">{currentAudit.lead.business_name}</h2>
                      <p className="text-blue-600 font-black uppercase tracking-[0.4em] text-[10px] mt-4 italic">Neural Architecture Audit</p>
                   </div>
                   <DecisionBanner audit={currentAudit.result} />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="p-10 bg-slate-50 rounded-[48px] border border-slate-100">
                         <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 italic">Growth Gaps</h4>
                         <ul className="space-y-4">
                            {currentAudit.result.gaps.map((g, i) => (
                              <li key={i} className="flex gap-4 text-sm font-bold text-slate-800 italic">
                                 <span className="text-red-500">✕</span> {g}
                              </li>
                            ))}
                         </ul>
                      </div>
                      <div className="p-10 bg-[#0f172a] text-white rounded-[48px] shadow-xl">
                         <h4 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-6 italic">Strategy Path</h4>
                         <ul className="space-y-4">
                            {currentAudit.result.recommendations.map((r, i) => (
                              <li key={i} className="flex gap-4 text-sm font-bold">
                                 <span className="text-blue-400">✓</span> {r}
                              </li>
                            ))}
                         </ul>
                      </div>
                   </div>
                   <DecisionScienceView nodes={currentAudit.result.decision_logic || []} />
                </div>
                <div className="space-y-12 h-fit sticky top-0">
                   <div className="bg-slate-900 p-12 rounded-[56px] text-white flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden group">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Readiness Score</span>
                      <span className="text-8xl font-black my-6 tracking-tighter italic">{currentAudit.result.score}%</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
