
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
import DecisionScienceView from './components/DecisionScienceView';
import AdminInfographic from './components/AdminInfographic';
import { DecisionBanner, SignalLog } from './components/AppContent';
import { MOCK_LEADS, MOCK_DEALS, MOCK_NOTIFICATIONS, MOCK_PROJECTS, MOCK_WORKFLOWS } from './services/mockData';
import { Lead, AuditResult, Notification, User, Deal, AutomationWorkflow, LeadStatus } from './types';
import { generateAuditWithTools, generateOutreach, generateVideoIntro } from './services/geminiService';
import { calculateLeadScore } from './utils/scoring';
import { supabase, isSupabaseConfigured } from './lib/supabase';

const App: React.FC = () => {
  const [viewState, setViewState] = useState<'public' | 'login' | 'dashboard'>('public');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [deals, setDeals] = useState<Deal[]>(MOCK_DEALS);
  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>(MOCK_WORKFLOWS);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [isAuditing, setIsAuditing] = useState(false);
  const [currentAudit, setCurrentAudit] = useState<{ lead: Lead; result: AuditResult } | null>(null);
  const [signals, setSignals] = useState<{id: string, text: string, type: 'tool' | 'webhook', time: string}[]>([]);
  const [webhookUrl, setWebhookUrl] = useState('https://n8n.digitex.in/webhook/flowgent-orchestrator');
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
    const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (data && !error) {
      setLeads(data.map((l: any) => ({
        ...l,
        business_name: l.business_name || 'Unknown',
        lead_status: l.lead_status || 'discovered'
      })));
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
    setSignals(prev => [{ id: Math.random().toString(), text, type, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 10));
  };

  const handleAudit = async (lead: Lead) => {
    setIsAuditing(true);
    setCurrentAudit(null);
    try {
      const { audit, toolCalls } = await generateAuditWithTools(lead);
      
      if (toolCalls && toolCalls.length > 0) {
        for (const call of toolCalls) {
          if (call.name === 'trigger_n8n_signal') {
            logSignal(`AI Dispatching n8n signal for ${call.args.business_name}`, 'tool');
            await triggerWebhook(call.args);
          }
        }
      }

      const updatedLead = { 
        ...lead, 
        score: audit.score, 
        radar_metrics: audit.radar_metrics, 
        decision_logic: audit.decision_logic,
        projected_roi_lift: audit.projected_roi_lift
      };

      setLeads(prev => prev.map(l => l.id === lead.id ? updatedLead : l));
      setCurrentAudit({ lead: updatedLead, result: audit });
    } catch (err) {
      console.error(err);
    } finally {
      setIsAuditing(false);
    }
  };

  const triggerWebhook = async (data: any) => {
    logSignal(`Pushing Decision Science payload to n8n`, 'webhook');
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'ai_audit_completed', data, timestamp: new Date().toISOString() })
      });
    } catch (e) {
      logSignal("n8n Connection Refused", "webhook");
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    setCurrentUser(null);
    setViewState('public');
  };

  if (isLoadingAuth) return <div className="min-h-screen bg-[#030712] flex items-center justify-center text-slate-500 font-black tracking-widest uppercase">Initializing Neural Layer...</div>;
  if (viewState === 'public') return <LandingPage onLeadSubmit={() => {}} onGoToLogin={() => setViewState('login')} />;
  if (viewState === 'login') return <LoginScreen onLogin={() => {}} onGoBack={() => setViewState('public')} />;
  if (!currentUser) return null;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-blue-100">
      <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} userRole={currentUser.role} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-12 sticky top-0 z-40">
           <h2 className="font-black text-slate-900 uppercase tracking-widest text-[10px] bg-slate-100 px-4 py-2 rounded-xl">Environment: {currentTab}</h2>
           <div className="flex items-center gap-6">
            <button onClick={handleLogout} className="text-[10px] font-black uppercase tracking-widest px-8 py-3.5 bg-slate-900 text-white rounded-2xl hover:bg-red-600 transition-all">Logout</button>
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow-xl">{currentUser.name.charAt(0)}</div>
          </div>
        </header>

        <main className="flex-1 p-12 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <div className="space-y-10 animate-in fade-in duration-500">
              <div className="flex justify-between items-center">
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic">System Control</h2>
                <div className="bg-[#0f172a] p-6 rounded-3xl text-white shadow-2xl flex items-center gap-6">
                   <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                   <span className="text-[10px] font-black uppercase tracking-widest">Handshake Active: {signals.length} Dispatches</span>
                </div>
              </div>
              
              <AdminInfographic />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-white p-12 rounded-[56px] border border-slate-200 shadow-sm">
                  <h3 className="font-black text-2xl text-slate-900 mb-10 tracking-tight italic">Lead Intelligence Feed</h3>
                  <div className="space-y-6">
                    {leads.slice(0, 5).map(l => (
                      <div key={l.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-between group hover:border-blue-200 cursor-pointer" onClick={() => handleAudit(l)}>
                         <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center font-black text-slate-900 shadow-sm">{l.business_name.charAt(0)}</div>
                            <div>
                               <p className="font-black text-slate-900 text-lg leading-tight tracking-tight">{l.business_name}</p>
                               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{l.category}</p>
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-xl font-black text-blue-600 italic">{l.score}%</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Decision Score</p>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white p-12 rounded-[56px] border border-slate-200 shadow-sm">
                   <h3 className="font-black text-2xl text-slate-900 mb-10 tracking-tight italic">Handshake Telemetry</h3>
                   <SignalLog signals={signals} />
                </div>
              </div>
            </div>
          )}

          {currentTab === 'client_dashboard' && <ClientDashboard projects={MOCK_PROJECTS} leadStats={{ score: 88, rank: '#1' }} activityLogs={[]} />}
          {currentTab === 'hot_opps' && (
            <div className="space-y-10 animate-in slide-in-from-bottom-4">
               <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic">High-Intensity Opportunities</h2>
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
          {currentTab === 'automations' && <AutomationView workflows={workflows} onToggleStatus={() => {}} />}
          {currentTab === 'reports' && <ReportsView />}
        </main>
      </div>

      {isAuditing && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex flex-col items-center justify-center text-white">
          <div className="w-24 h-24 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-8 shadow-[0_0_80px_rgba(37,99,235,0.4)]"></div>
          <p className="font-black uppercase tracking-[0.4em] text-xs">Generating Neural Decision Path...</p>
        </div>
      )}

      {currentAudit && (
        <div className="fixed inset-0 bg-[#0f172a]/95 backdrop-blur-xl z-[100] flex items-center justify-center p-10 overflow-y-auto">
          <div className="bg-white rounded-[64px] max-w-6xl w-full p-20 relative animate-in zoom-in-95 duration-500 shadow-2xl overflow-hidden">
             <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-slate-50 rounded-full -mr-[250px] -mt-[250px]"></div>
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
                      <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Business Readiness</span>
                      <span className="text-8xl font-black my-6 tracking-tighter italic">{currentAudit.result.score}%</span>
                      <div className="bg-blue-600 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest italic">Neural Grade: Alpha</div>
                   </div>

                   <div className="bg-white p-12 rounded-[56px] border border-slate-200 shadow-sm flex flex-col items-center">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8 italic">Health Matrix Radar</h4>
                      <RadarInfographic metrics={currentAudit.result.radar_metrics} />
                   </div>

                   <div className="bg-blue-50 p-10 rounded-[48px] border border-blue-100 flex flex-col gap-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 italic">Predictive Annual Lift</p>
                      <p className="text-3xl font-black text-blue-700 tracking-tighter">{currentAudit.result.projected_roi_lift || "₹14.2L /yr Potential"}</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RadarInfographic: React.FC<{ metrics: any }> = ({ metrics }) => {
  const m = metrics || { presence: 40, automation: 20, seo: 30, capture: 10 };
  const size = 180;
  const center = size / 2;
  const radius = 60;
  
  const points = [
    { x: center, y: center - (radius * (m.presence / 100)), label: 'P' },
    { x: center + (radius * (m.automation / 100)), y: center, label: 'A' },
    { x: center, y: center + (radius * (m.seo / 100)), label: 'S' },
    { x: center - (radius * (m.capture / 100)), y: center, label: 'C' }
  ];
  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div className="relative group">
      <svg width={size} height={size} className="overflow-visible">
         <circle cx={center} cy={center} r={radius} fill="none" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
         <circle cx={center} cy={center} r={radius/2} fill="none" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
         <line x1={center - radius} y1={center} x2={center + radius} y2={center} stroke="#f1f5f9" strokeWidth="1" />
         <line x1={center} y1={center - radius} x2={center} y2={center + radius} stroke="#f1f5f9" strokeWidth="1" />
         <path d={pathData} fill="rgba(37, 99, 235, 0.2)" stroke="#2563eb" strokeWidth="3" className="animate-in zoom-in duration-1000 group-hover:fill-blue-600/30 transition-all" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
         <p className="text-[8px] font-black text-blue-600 bg-white px-2 py-1 rounded shadow-sm">AI CALCULATED</p>
      </div>
    </div>
  );
};

export default App;
