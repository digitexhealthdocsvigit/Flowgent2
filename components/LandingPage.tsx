
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
    inquiries: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      setStep(step + 1);
    } else {
      onLeadSubmit(formData);
    }
  };

  return (
    <div className="min-h-screen bg-white selection:bg-blue-100">
      <nav className="flex justify-between items-center px-12 py-8 sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">F</div>
          <span className="font-black text-xl tracking-tighter text-slate-900">Flowgent™</span>
        </div>
        <button onClick={onGoToLogin} className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors">Client Login</button>
      </nav>

      <main className="max-w-6xl mx-auto px-12 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">A Digitex Studio Brand</span>
            <h1 className="text-7xl font-black text-slate-900 leading-[1.1] tracking-tighter">
              Stop Losing Leads To <span className="text-blue-600">Manual Processes.</span>
            </h1>
            <p className="text-xl text-slate-700 font-medium leading-relaxed max-w-lg">
              We build automated business systems that capture inquiries, follow up via AI, and book meetings while you sleep.
            </p>
            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-200 shadow-sm"></div>)}
              </div>
              <p className="text-sm text-slate-700 font-bold">Trusted by 200+ Growth-Ready Businesses</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-10 rounded-[48px] shadow-2xl shadow-blue-100/50">
            <div className="mb-8 border-b border-slate-200 pb-6">
              <h3 className="text-2xl font-black text-slate-900">Request AI Digital Audit</h3>
              <p className="text-slate-700 text-xs font-black mt-2 uppercase tracking-widest">Step {step} of 2</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 ? (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-800">Business Name</label>
                    <input 
                      required
                      className="w-full bg-white border border-slate-300 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 font-bold placeholder:text-slate-400"
                      placeholder="e.g. Acme Manufacturing"
                      value={formData.businessName}
                      onChange={e => setFormData({...formData, businessName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-800">Current Website URL</label>
                    <input 
                      required
                      className="w-full bg-white border border-slate-300 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-900 font-bold placeholder:text-slate-400"
                      placeholder="https://yourbusiness.com"
                      value={formData.websiteUrl}
                      onChange={e => setFormData({...formData, websiteUrl: e.target.value})}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-800">Monthly Inquiries</label>
                    <select 
                      required
                      className="w-full bg-white border border-slate-300 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 font-bold"
                      value={formData.inquiries}
                      onChange={e => setFormData({...formData, inquiries: e.target.value})}
                    >
                      <option value="">Select Range</option>
                      <option value="0-10">0 - 10 Inquiries</option>
                      <option value="10-50">10 - 50 Inquiries</option>
                      <option value="50+">50+ Inquiries</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-800">Business Sector</label>
                    <input 
                      required
                      className="w-full bg-white border border-slate-300 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 font-bold placeholder:text-slate-400"
                      placeholder="e.g. Real Estate, Exports, Retail"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    />
                  </div>
                </>
              )}

              <button className="w-full bg-blue-600 text-white font-black py-5 rounded-[20px] shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all uppercase tracking-[0.2em] text-xs">
                {step === 1 ? 'Next: Qualify My Business' : 'Generate My Audit Now'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
