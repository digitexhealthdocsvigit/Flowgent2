
import React, { useState } from 'react';
import ServicesCatalog from './ServicesCatalog';
import AIImage from './AIImage';

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

  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
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
          <button onClick={scrollToPricing} className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">Pricing</button>
          <button onClick={scrollToAudit} className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors">AI Audit</button>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={onGoToLogin} className="text-sm font-bold text-slate-300 hover:text-white transition-colors">Login</button>
          <button onClick={scrollToAudit} className="bg-blue-600 text-white text-xs font-black px-8 py-4 rounded-xl uppercase tracking-[0.2em] hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20">Get Free Audit</button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-12 pt-24 pb-40">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-12 text-center lg:text-left">
            <h1 className="text-[60px] md:text-[90px] font-black leading-[0.9] tracking-tighter">
              Stop Losing <br/>
              <span className="text-blue-500 italic">Uncaptured <br/> Inquiries.</span>
            </h1>
            <p className="text-slate-400 text-xl font-medium max-w-lg">
              Flowgent™ automates your business infrastructure, from lead discovery to WhatsApp-driven conversion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button onClick={scrollToAudit} className="bg-white text-slate-900 px-12 py-6 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-100 transition-all shadow-2xl">Initiate AI Audit</button>
              <button onClick={scrollToServices} className="bg-slate-800 text-white px-12 py-6 rounded-2xl font-black uppercase tracking-widest text-xs border border-white/5 hover:bg-slate-700 transition-all">Explore Possibilities</button>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-[56px] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-[#1e293b]/40 border border-white/5 rounded-[56px] shadow-2xl backdrop-blur-xl overflow-hidden min-h-[550px] flex flex-col">
              <AIImage 
                prompt="A hyper-realistic cinematic masterpiece showing a futuristic digital marketing command center, glowing blue holographic charts, clean glass surfaces, deep navy aesthetic, professional corporate environment, sharp focus, 8k render" 
                aspectRatio="4:3"
                quality="high"
                className="w-full h-full min-h-[450px]"
              />
              <div className="p-12 space-y-6 bg-slate-900/80 backdrop-blur-md mt-auto border-t border-white/5">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <span className="font-black text-lg italic text-white uppercase tracking-tighter">AI Node Discovery</span>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Neural Pathway: Active</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black tracking-tighter text-blue-500">+240%</span>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Throughput Lift</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <section id="services" className="mt-60 space-y-24 scroll-mt-32">
          <div className="text-center space-y-6">
            <h2 className="text-7xl font-black tracking-tighter text-white">Engineering Possibilities</h2>
            <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-xs">A Full-Stack Developer & Growth Agency Stack</p>
          </div>
          <ServicesCatalog isPublic={true} />
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="mt-60 space-y-32 scroll-mt-32">
          <div className="text-center space-y-6">
            <h2 className="text-7xl font-black tracking-tighter text-white">Revenue Node Tiers</h2>
            <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">INVESTMENT IN AUTOMATION SCALING</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              {
                name: "Starter Care",
                price: "2,000",
                desc: "Essential digital node hosting and maintenance.",
                features: ["Domain Management", "Cloud Backup", "SLA Node Support"],
                cta: "Secure Presence",
                color: "bg-slate-800"
              },
              {
                name: "Growth Automation",
                price: "8,000",
                desc: "Full n8n workflow integration & CRM logic.",
                features: ["WhatsApp Funnels", "Automated Lead Capture", "Email Orchestration"],
                cta: "Start Scaling",
                color: "bg-blue-600",
                popular: true
              },
              {
                name: "Business Ops Pro",
                price: "25,000",
                desc: "Complete enterprise business automation stack.",
                features: ["Custom Gemini AI Agents", "Full Infrastructure Provisioning", "Strategic ROI Audit"],
                cta: "Enterprise Access",
                color: "bg-slate-900"
              }
            ].map((plan, i) => (
              <div key={i} className={`${plan.color} p-16 rounded-[64px] relative overflow-hidden flex flex-col justify-between group hover:scale-[1.02] transition-all shadow-2xl`}>
                {plan.popular && (
                  <div className="absolute top-8 right-8 bg-white text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest italic">Most Efficient</div>
                )}
                <div>
                  <h4 className="text-3xl font-black text-white italic tracking-tighter mb-4">{plan.name}</h4>
                  <p className="text-white/60 text-sm font-medium mb-12">{plan.desc}</p>
                  <div className="flex items-baseline gap-2 mb-12">
                    <span className="text-5xl font-black italic tracking-tighter">₹{plan.price}</span>
                    <span className="text-sm font-bold opacity-60">/month</span>
                  </div>
                  <ul className="space-y-4 mb-12">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-3 text-xs font-black uppercase tracking-widest italic text-white/80">
                         <div className="w-1.5 h-1.5 bg-white/20 rounded-full"></div>
                         {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <button onClick={scrollToAudit} className="w-full bg-white text-slate-900 py-6 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all shadow-xl">{plan.cta}</button>
              </div>
            ))}
          </div>
        </section>

        <section id="audit-section" className="mt-60 pb-40 scroll-mt-32">
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
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
