
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
import SubscriptionsView from './components/SubscriptionsView';
import DecisionScienceView from './components/DecisionScienceView';
import AdminInfographic from './components/AdminInfographic';
import SettingsView from './components/SettingsView';
import PitchModal from './components/PitchModal';
import { DecisionBanner, SignalLog } from './components/AppContent';
import { MOCK_LEADS, MOCK_DEALS, MOCK_PROJECTS, MOCK_WORKFLOWS, MOCK_SUBSCRIPTIONS } from './services/mockData';
import { Lead, AuditResult, User } from './types';
import { generateAuditWithTools, generateVideoIntro } from './services/geminiService';
import { supabase, isSupabaseConfigured, activeProjectRef } from './lib/supabase';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [viewState, setViewState] = useState<'public' | 'login' | 'dashboard'>('public');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [currentAudit, setCurrentAudit] = useState<{ lead: Lead; result: AuditResult } | null>(null);
  const [signals, setSignals] = useState<{id: string, text: string, type: 'tool' | 'webhook', time: string}[]>([]);
  const [webhookUrl, setWebhookUrl] = useState(() => 
    localStorage.getItem('flowgent_n8n_webhook') || 'https://n8n-production-ecc4.up.railway.app/webhook/flowgent-orchestrator'
  );
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [activePitch, setActivePitch] = useState<{ lead: Lead; pitch: string } | null>(null);
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        fetchProfile(session.user.id, session.user.email || '');
        refreshLeads();
      } else {
        setIsLoadingAuth(false);
        setLeads(MOCK_LEADS as Lead[]);
      }
    };
    checkAuth();
  }, []);

  const refreshLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) {
        setLeads(data.map((l: any) => ({
          ...l,
          business_name: l.business_name || l.businessName || 'Unknown Business',
          lead_status: l.lead_status || l.status || 'discovered',
          readiness_score: l.readiness_score || l.score || 0,
          is_hot_opportunity: l.is_hot_opportunity || (l.readiness_score > 75)
        })));
      }
      if (error) throw error;
    } catch (error) {
      console.error("InsForge Sync Error:", error);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const fetchProfile = (userId: string, email: string) => {
    const isAdmin = email.toLowerCase().includes('digitex') || email.toLowerCase().includes('founder') || email.toLowerCase().includes('antigravity');
    setCurrentUser({ id: userId, name: email.split('@')[0], email, role: isAdmin ? 'admin' : 'client', orgId: 'org-1' });
    setViewState('dashboard');
    setCurrentTab(isAdmin ? 'dashboard' : 'client_dashboard');
  };

  const triggerWebhook = async (lead: Lead) => {
    const signalId = Math.random().toString();
    setSignals(prev => [{ 
      id: signalId, 
      text: `n8n Trigger: Ingesting ${lead.business_name}`, 
      type: 'webhook', 
      time: new Date().toLocaleTimeString() 
    }, ...prev].slice(0, 15));
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          event: 'lead_captured',
          source: 'flowgent_terminal_v2',
          lead_data: {
            place_id: lead.id, // Primary Key for n8n Upsert
            business_name: lead.business_name,
            phone: lead.phone,
            city: lead.city,
            rating: lead.rating,
            readiness_score: lead.readiness_score || lead.score,
            has_website: lead.has_website,
            category: lead.category,
            est_contract_value: lead.est_contract_value,
            is_hot_opportunity: lead.is_hot_opportunity,
            timestamp: new Date().toISOString()
          }
        })
      });
      
      if (response.ok) {
        setSignals(prev => [{ 
          id: Math.random().toString(), 
          text: `ACK: ${lead.business_name} persistent in InsForge`, 
          type: 'webhook', 
          time: new Date().toLocaleTimeString() 
        }, ...prev]);
        // Delay refresh slightly to allow n8n to complete the upsert
        setTimeout(refreshLeads, 1500);
      }
    } catch (e) { 
      console.error("n8n Orchestration Node Failure:", e);
      setSignals(prev => [{ 
        id: Math.random().toString(), 
        text: `Error: n8n node refused handshake`, 
        type: 'webhook', 
        time: new Date().toLocaleTimeString() 
      }, ...prev]);
    }
  };

  const handleGeneratePitch = async (lead: Lead) => {
    setIsGeneratingPitch(true);
    setSignals(prev => [{ 
      id: Math.random().toString(), 
      text: `Gemini: Synthesizing customized pitch node`, 
      type: 'tool', 
      time: new Date().toLocaleTimeString() 
    }, ...prev]);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Act as a world-class senior growth consultant. Write a hyper-personalized short pitch for ${lead.business_name} in ${lead.city}. 
      Sector: ${lead.category}. 
      Status: ${lead.has_website ? 'Has website but lacks conversion automation' : 'NO digital presence (Urgent opportunity)'}.
      Tone: Elite, Direct, Engineering-led.
      Format: Optimized for WhatsApp/Direct Message.
      CTA: A free Digital Readiness Audit.
      Length: Under 70 words.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      
      setActivePitch({ lead, pitch: response.text || "Pitch synthesis failed. Manual outreach required." });
    } catch (e) {
      console.error("Neural Pitch Error:", e);
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  const handleAudit = async (lead: Lead) => {
    setIsAuditing(true);
    try {
      const { audit, toolCalls } = await generateAuditWithTools(lead);
      if (toolCalls?.length) {
        for (const call of toolCalls) {
          if (call.name === 'trigger_n8n_signal') {
            await triggerWebhook({ ...lead, ...call.args });
          }
          if (call.name === 'insforge_fetch_docs') {
            setSignals(prev => [{ id: Math.random().toString(), text: `MCP: Consulted docs for "${call.args.topic}"`, type: 'tool', time: new Date().toLocaleTimeString() }, ...prev]);
          }
        }
      }
      setCurrentAudit({ lead: { ...lead, ...audit }, result: audit });
    } finally { setIsAuditing(false); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setViewState('public');
  };

  if (isLoadingAuth) return <div className="min-h-screen bg-[#030712] flex items-center justify-center text-slate-500 font-black tracking-widest uppercase italic">InsForge Synchronizing...</div>;
  if (viewState === 'public') return <LandingPage onLeadSubmit={() => {}} onGoToLogin={() => setViewState('login')} />;
  if (viewState === 'login') return <LoginScreen onLogin={() => {}} onGoBack={() => setViewState('public')} />;
  if (!currentUser) return null;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-blue-100">
      <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} userRole={currentUser.role} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-12 sticky top-0 z-40">
           <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <h2 className="font-black text-slate-900 uppercase tracking-tighter text-[10px] bg-slate-50 px-4 py-2 rounded-xl border border-slate-100 italic">InsForge Active: {activeProjectRef}</h2>
           </div>
           <div className="flex items-center gap-6">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{currentUser.email}</span>
              <button onClick={handleLogout} className="text-[10px] font-black uppercase tracking-widest px-8 py-3 bg-slate-900 text-white rounded-2xl shadow-lg hover:bg-red-600 transition-all">Logout</button>
           </div>
        </header>

        <main className="flex-1 p-12 overflow-y-auto custom-scrollbar">
          {currentTab === 'dashboard' && (
            <div className="space-y-10 animate-in fade-in">
              <h2 className="text-6xl font-black text-slate-900 tracking-tighter italic">Founder Portal</h2>
              <AdminInfographic />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-white p-12 rounded-[56px] border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="font-black text-2xl text-slate-900 italic">Intelligence Feed</h3>
                    <button onClick={refreshLeads} className="text-[10px] font-black uppercase text-blue-600 hover:text-blue-700 transition-colors">Sync Now</button>
                  </div>
                  <div className="space-y-4">
                    {leads.length > 0 ? leads.slice(0, 5).map(l => (
                      <div key={l.id} className="p-5 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-between hover:border-blue-200 cursor-pointer group" onClick={() => handleAudit(l)}>
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center font-black border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-all">{l.business_name.charAt(0)}</div>
                            <div>
                              <p className="font-black text-slate-800">{l.business_name}</p>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{l.city}</p>
                            </div>
                         </div>
                         <div className="text-right">
                           <p className="text-xl font-black text-blue-600 italic">{l.readiness_score || 0}%</p>
                           <p className="text-[8px] font-black text-slate-300 uppercase italic">Ready</p>
                         </div>
                      </div>
                    )) : (
                      <div className="py-20 text-center opacity-30 italic">No persistent leads detected in InsForge.</div>
                    )}
                  </div>
                </div>
                <div className="bg-white p-12 rounded-[56px] border border-slate-200 shadow-sm"><h3 className="font-black text-2xl text-slate-900 mb-10 italic">Signal Log</h3><SignalLog signals={signals} /></div>
              </div>
            </div>
          )}

          {currentTab === 'client_dashboard' && <ClientDashboard projects={MOCK_PROJECTS} leadStats={{ score: 88, rank: '#1' }} activityLogs={[]} />}
          {currentTab === 'hot_opps' && (
            <div className="space-y-10"><h2 className="text-6xl font-black text-slate-900 tracking-tighter italic uppercase">Hot Neural Opps</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {leads.filter(l => l.is_hot_opportunity).map(l => <LeadCard key={l.id} lead={l} onAudit={handleAudit} />)}
              </div>
            </div>
          )}
          {currentTab === 'funnel' && <FunnelView leads={leads} />}
          {currentTab === 'scraper' && <ScraperView onPushToN8N={triggerWebhook} onGeneratePitch={handleGeneratePitch} onGenerateVideo={async (l) => await generateVideoIntro(l.business_name)} />}
          {currentTab === 'leads' && <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">{leads.map(l => <LeadCard key={l.id} lead={l} onAudit={handleAudit} />)}</div>}
          {currentTab === 'calendar' && <CalendarView />}
          {currentTab === 'crm' && <CrmView deals={MOCK_DEALS} />}
          {currentTab === 'automations' && <AutomationView workflows={MOCK_WORKFLOWS} onToggleStatus={() => {}} signals={signals} />}
          {currentTab === 'reports' && <ReportsView />}
          {currentTab === 'billing' && <SubscriptionsView subscriptions={MOCK_SUBSCRIPTIONS} />}
          {currentTab === 'settings' && <SettingsView webhookUrl={webhookUrl} onUpdate={setWebhookUrl} onTest={() => triggerWebhook(leads[0] || MOCK_LEADS[0])} activeProjectRef={activeProjectRef} />}
        </main>
      </div>

      {(isAuditing || isGeneratingPitch) && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[300] flex flex-col items-center justify-center text-white">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_50px_rgba(37,99,235,0.4)]"></div>
          <p className="font-black uppercase tracking-[0.4em] text-[10px]">{isGeneratingPitch ? 'Synthesizing Pitch...' : 'Syncing Neural Path...'}</p>
        </div>
      )}
      
      {activePitch && <PitchModal lead={activePitch.lead} pitch={activePitch.pitch} onClose={() => setActivePitch(null)} />}

      {currentAudit && (
        <div className="fixed inset-0 bg-[#0f172a]/95 backdrop-blur-xl z-[100] flex items-center justify-center p-10 overflow-y-auto">
          <div className="bg-white rounded-[64px] max-w-6xl w-full p-20 relative animate-in zoom-in-95 duration-500 shadow-2xl">
             <button onClick={() => setCurrentAudit(null)} className="absolute top-12 right-12 text-slate-300 p-4 hover:bg-slate-50 hover:text-slate-900 rounded-full font-black text-xl transition-all">✕</button>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
                <div className="lg:col-span-2 space-y-12">
                   <div><h2 className="text-6xl font-black text-slate-900 tracking-tighter leading-none">{currentAudit.lead.business_name}</h2><p className="text-blue-600 font-black uppercase tracking-widest text-[10px] mt-4 italic">Neural Architecture Audit</p></div>
                   <DecisionBanner audit={currentAudit.result} /><div className="grid grid-cols-1 md:grid-cols-2 gap-10"><div className="p-10 bg-slate-50 rounded-[48px] border border-slate-100"><h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 italic">Growth Gaps</h4><ul className="space-y-4">{currentAudit.result.gaps.map((g, i) => (<li key={i} className="flex gap-4 text-sm font-bold text-slate-800 italic"><span className="text-red-500">✕</span> {g}</li>))}</ul></div><div className="p-10 bg-[#0f172a] text-white rounded-[48px] shadow-xl"><h4 className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-6 italic">Strategy Path</h4><ul className="space-y-4">{currentAudit.result.recommendations.map((r, i) => (<li key={i} className="flex gap-4 text-sm font-bold"><span className="text-blue-400">✓</span> {r}</li>))}</ul></div></div>
                   <DecisionScienceView nodes={currentAudit.result.decision_logic || []} />
                </div>
                <div className="space-y-12 h-fit sticky top-0"><div className="bg-slate-900 p-12 rounded-[56px] text-white flex flex-col items-center text-center shadow-2xl"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Readiness</span><span className="text-8xl font-black my-6 tracking-tighter italic">{currentAudit.result.score}%</span></div></div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
