import React, { useState } from 'react';

interface LandingPageProps {
  onLeadSubmit: (data: any) => void;
  onGoToLogin: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLeadSubmit, onGoToLogin }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: '',
    websiteUrl: '',
    category: '',
    revenue: '',
    inquiries: '',
    email: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      onLeadSubmit(formData);
    }
  };

  const scrollToAudit = () => {
    document.getElementById('audit-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToServices = () => {
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white selection:bg-blue-500/30 font-sans">
      {/* Navigation Header */}
      <nav className="flex justify-between items-center px-12 py-8 sticky top-0 bg-[#0f172a]/80 backdrop-blur-md z-50 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/20 italic">F</div>
          <div>
            <span className="font-black text-2xl tracking-tighter text-white block leading-none">Flowgent™</span>
          </div>
        </div>
        <div className="hidden lg:flex items-center gap-12">
          <button onClick={scrollToServices} className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">Services</button>
          <button onClick={scrollToAudit} className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">AI Audit</button>
          <button onClick={onGoToLogin} className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">Founder Portal</button>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={onGoToLogin} className="text-sm font-bold text-slate-300 hover:text-white transition-colors">Login</button>
          <button onClick={scrollToAudit} className="bg-blue-600 text-white text-xs font-black px-8 py-4 rounded-xl uppercase tracking-[0.2em] hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20">Get Free Audit</button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-12 pt-24 pb-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-12">
            <h1 className="text-[90px] font-black leading-[0.9] tracking-tighter">
              Flowgent Does <br/>
              <span className="text-blue-500 italic">What Agencies <br/> Don't.</span>
            </h1>
            
            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-blue-600/10 border border-blue-500/20 rounded-full flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div>
                  <h4 className="text-2xl font-black tracking-tight">Capture Every Inquiry</h4>
                  <p className="text-slate-400 font-medium mt-1">Unified lead ingestion from Web, WhatsApp, and Google Maps.</p>
                </div>
              </div>
              <div className="flex gap-6 items-start">
                <div className="w-12 h-12 bg-blue-600/10 border border-blue-500/20 rounded-full flex items-center justify-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div>
                  <h4 className="text-2xl font-black tracking-tight">Automated Nurturing</h4>
                  <p className="text-slate-400 font-medium mt-1">Instant email and message triggers based on lead score.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#1e293b]/40 border border-white/5 p-12 rounded-[56px] shadow-2xl backdrop-blur-xl relative">
            <h3 className="text-3xl font-black mb-12 tracking-tight">System Architecture</h3>
            <div className="space-y-6">
              <div className="bg-blue-600 p-8 rounded-3xl flex justify-between items-center shadow-lg shadow-blue-500/20">
                <span className="font-black text-lg">Scraper & Ingestion</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/></svg>
              </div>
              <div className="bg-[#2a374a] p-8 rounded-3xl flex justify-between items-center border border-white/5 opacity-60">
                <span className="font-black text-lg">AI Audit Engine</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <div className="bg-[#2a374a] p-8 rounded-3xl flex justify-between items-center border border-white/5 opacity-60">
                <span className="font-black text-lg">CRM & Automations</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10c0 5.5 4.5 10 10 10s10-4.5 10-10V2h-10z"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
            </div>
            <div className="mt-16 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">POWERED BY N8N & GEMINI AI</p>
            </div>
          </div>
        </div>

        <section id="services" className="mt-60 space-y-32">
          <div className="text-center space-y-6">
            <h2 className="text-7xl font-black tracking-tighter text-white">Our Service Modules</h2>
            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">END-TO-END BUSINESS AUTOMATION</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {[
              {
                title: "Digital Presence Systems",
                desc: "Strategic websites and landing pages designed to convert cold traffic into hot leads. Built with high-speed architecture and SEO first.",
                features: ["Enterprise Architecture", "Mobile First Design", "Inbound Funnel Integration"],
                icon: "🌐"
              },
              {
                title: "Lead & CRM Orchestration",
                desc: "Custom-built CRM pipelines linked to your WhatsApp and Email. Capture leads 24/7 and manage them with SaaS-level efficiency.",
                features: ["WhatsApp Automation", "Lead Scoring", "Cal.com Integration"],
                icon: "⚡"
              },
              {
                title: "AI Growth Engine",
                desc: "AI-driven digital audits that reveal exactly where your business is leaking revenue. Intelligence reports compiled in seconds.",
                features: ["Gemini AI Analysis", "Competitor Gaps", "ROI Roadmaps"],
                icon: "🧠"
              }
            ].map((service, i) => (
              <div key={i} className="bg-slate-100/5 border border-white/5 p-12 rounded-[56px] space-y-8 backdrop-blur-sm group hover:bg-white/10 transition-all border-b-4 border-b-transparent hover:border-b-blue-600">
                <div className="text-6xl">{service.icon}</div>
                <div className="space-y-4">
                  <h4 className="text-3xl font-black tracking-tight">{service.title}</h4>
                  <p className="text-slate-400 leading-relaxed font-medium">{service.desc}</p>
                </div>
                <ul className="space-y-3 pt-6">
                  {service.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm font-bold text-slate-300">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section id="audit-section" className="mt-60 pb-40">
          <div className="bg-blue-600 rounded-[64px] p-24 relative overflow-hidden shadow-2xl shadow-blue-500/20">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white opacity-5 rounded-full -mr-[300px] -mt-[300px]"></div>
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-8 text-white">
                <h2 className="text-6xl font-black tracking-tighter leading-[0.9]">Start Your Digital <br/> Transformation.</h2>
                <p className="text-blue-100 text-lg font-medium leading-relaxed opacity-80">
                  Run a system audit today. No strings attached. 
                  Flowgent™ - Powered by Digitex Studio's 11 years of engineering excellence.
                </p>
              </div>

              <div className="bg-white p-12 rounded-[48px] text-slate-900 shadow-2xl">
                <div className="mb-8 border-b border-slate-100 pb-8 flex justify-between items-center">
                  <h3 className="text-2xl font-black tracking-tight">AI System Audit</h3>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step {step} of 3</span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {step === 1 ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Business Legal Name</label>
                        <input 
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 outline-none focus:ring-2 focus:ring-blue-600 transition-all font-bold"
                          placeholder="e.g. Digitex Studio"
                          value={formData.businessName}
                          onChange={e => setFormData({...formData, businessName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Current Domain / Website</label>
                        <input 
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 outline-none focus:ring-2 focus:ring-blue-600 transition-all font-bold"
                          placeholder="https://yourbusiness.com"
                          value={formData.websiteUrl}
                          onChange={e => setFormData({...formData, websiteUrl: e.target.value})}
                        />
                      </div>
                    </>
                  ) : step === 2 ? (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Inquiry Volume / Month</label>
                        <input 
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 outline-none focus:ring-2 focus:ring-blue-600 transition-all font-bold"
                          placeholder="e.g. 50"
                          value={formData.inquiries}
                          onChange={e => setFormData({...formData, inquiries: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Industry Sector</label>
                        <input 
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 outline-none focus:ring-2 focus:ring-blue-600 transition-all font-bold"
                          placeholder="e.g. Manufacturing"
                          value={formData.category}
                          onChange={e => setFormData({...formData, category: e.target.value})}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2 animate-in slide-in-from-right-4 duration-300">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Secure Contact Email</label>
                      <input 
                        required
                        type="email"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 outline-none focus:ring-2 focus:ring-blue-600 transition-all font-bold"
                        placeholder="founder@yourbusiness.com"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                      <p className="text-[9px] font-bold text-slate-400 mt-2 px-1">We'll send the audit results to this address.</p>
                    </div>
                  )}

                  <button className="w-full bg-slate-900 text-white font-black py-6 rounded-2xl shadow-xl hover:bg-slate-800 transition-all uppercase tracking-[0.2em] text-[10px]">
                    {step === 1 ? 'Next' : step === 2 ? 'Verify Enterprise Data' : 'Submit for AI Audit'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-12 py-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500">
        <p className="text-[10px] font-black uppercase tracking-widest">© 2026 Flowgent™ — A Digitex Studio Company</p>
        <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest">
          <button onClick={() => alert("Privacy Policy coming soon.")} className="hover:text-white transition-colors">Privacy Policy</button>
          <button onClick={() => alert("Terms of Service coming soon.")} className="hover:text-white transition-colors">Terms of Service</button>
          <a href="https://github.com/digitexhealthdocsvigit/Flowgent" className="hover:text-white transition-colors underline">GitHub Repo</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;