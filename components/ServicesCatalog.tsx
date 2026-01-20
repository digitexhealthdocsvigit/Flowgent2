
import React from 'react';
import AIImage from './AIImage';

const ServicesCatalog: React.FC<{ isPublic?: boolean }> = ({ isPublic = false }) => {
  const categories = [
    {
      title: "Automation & AI Systems",
      icon: "🤖",
      color: "blue",
      prompt: "A minimalist 3D robotic hand interacting with a glowing hologram of a business dashboard, clean studio lighting, futuristic blue theme",
      items: [
        { name: "WhatsApp Lead Capture", desc: "Automated site leads → WhatsApp follow-ups → CRM sync." },
        { name: "Gemini AI Agents", desc: "Custom chatbots and knowledge assistants tailored to your brand." },
        { name: "n8n Orchestration", desc: "Real-time sync between business apps and analytics pipelines." },
        { name: "Email Orchestration", desc: "Drip campaigns driven by AI-scored user behavior." }
      ]
    },
    {
      title: "Developer Infrastructure",
      icon: "⚙️",
      color: "indigo",
      prompt: "A sophisticated crystal-clear glass server rack with internal glowing circuits, representing high-speed cloud infrastructure, macro photography",
      items: [
        { name: "Next.js Development", desc: "High-performance corporate websites and progressive web apps." },
        { name: "Supabase Backend", desc: "Enterprise-grade database design and serverless infrastructure." },
        { name: "API Integration", desc: "Bespoke connectors for HubSpot, Zoho, Salesforce, and more." },
        { name: "Vercel Deployment", desc: "Optimized cloud hosting with edge-side rendering and security." }
      ]
    },
    {
      title: "Growth & Marketing",
      icon: "📈",
      color: "purple",
      prompt: "An elegant 3D upward trending arrow made of light particles, shattering through dark glass layers, representing high-velocity business growth",
      items: [
        { name: "Performance Marketing", desc: "Google and Meta Ads end-to-end management with AI tracking." },
        { name: "SEO Intelligence", desc: "Content strategy driven by real-time neural search trends." },
        { name: "Funnel Science", desc: "Conversion audit and UI/UX optimization for lead capture nodes." },
        { name: "CRM Deployment", desc: "Setting up sales pipelines with automated qualification logic." }
      ]
    },
    {
      title: "Client Systems Integration",
      icon: "📡",
      color: "slate",
      prompt: "Stylized 3D speech bubbles morphing into golden digital tokens, vibrant messaging app colors, professional digital marketing concept",
      items: [
        { name: "Communication Layers", desc: "WhatsApp, Email, SMS, and Push notification orchestration." },
        { name: "Appointment Nodes", desc: "Cal.com and Google Calendar automated scheduling systems." },
        { name: "Payment Gateways", desc: "Razorpay and Stripe settlement portal integrations." },
        { name: "Security Protocols", desc: "E2E encryption and infrastructure audit logs for compliance." }
      ]
    }
  ];

  return (
    <div className={`space-y-24 ${isPublic ? '' : 'animate-in fade-in duration-500'}`}>
      {!isPublic && (
        <div className="flex justify-between items-center px-12">
          <div>
            <h2 className="text-5xl font-black text-white tracking-tighter italic leading-none">Service Catalog</h2>
            <p className="text-slate-500 mt-4 font-bold text-lg">Infrastructure Capabilities: Deployable Agency Modules.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 px-12">
        {categories.map((cat, i) => (
          <div key={i} className={`bg-slate-900/50 rounded-[56px] border border-white/5 shadow-2xl backdrop-blur-xl relative overflow-hidden group flex flex-col`}>
            <div className="h-64 relative overflow-hidden">
               <AIImage 
                 prompt={cat.prompt} 
                 aspectRatio="16:9" 
                 className="w-full h-full group-hover:scale-110 transition-transform duration-1000"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
            </div>
            
            <div className="p-12 relative z-10 flex-1">
              <div className="flex items-center gap-4 mb-10">
                <span className="text-4xl">{cat.icon}</span>
                <h3 className="text-3xl font-black text-white italic tracking-tighter">{cat.title}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cat.items.map((item, j) => (
                  <div key={j} className="bg-white/5 border border-white/5 p-6 rounded-[32px] hover:border-blue-500/30 transition-all group/item">
                    <h4 className="font-black text-white text-sm mb-2 group-hover/item:text-blue-400 transition-colors">{item.name}</h4>
                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed italic">{item.desc}</p>
                    <div className="mt-4 flex justify-between items-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                      <span className="text-[8px] font-black uppercase text-blue-500 tracking-widest">Connect Node</span>
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-12 bg-blue-600 p-16 rounded-[64px] text-white flex flex-col md:flex-row justify-between items-center shadow-2xl shadow-blue-600/30 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="relative z-10 max-w-lg">
           <h4 className="text-4xl font-black italic tracking-tighter mb-4">Request Custom Module</h4>
           <p className="text-blue-100 font-medium text-sm leading-relaxed">Need a specialized neural pathway for your industry? Our development team can provision bespoke infrastructure on demand.</p>
        </div>
        <button className="relative z-10 mt-8 md:mt-0 bg-white text-blue-600 px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all shadow-xl">Contact Engineering</button>
      </div>
    </div>
  );
};

export default ServicesCatalog;
