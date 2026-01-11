
import React, { useState } from 'react';
import { ICONS } from '../constants';

interface ScrapedLead {
  id: string;
  name: string;
  location: string;
  phone: string;
  rating: number;
  videoUrl?: string;
}

interface ScraperViewProps {
  onPushToN8N: (lead: ScrapedLead) => void;
  onGeneratePitch: (lead: ScrapedLead) => void;
  onGenerateVideo: (lead: ScrapedLead) => Promise<string>;
}

const ScraperView: React.FC<ScraperViewProps> = ({ onPushToN8N, onGeneratePitch, onGenerateVideo }) => {
  const [isScraping, setIsScraping] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState<string | null>(null);
  const [scrapedLeads, setScrapedLeads] = useState<ScrapedLead[]>([
    { id: 'sc1', name: 'Shiva Garments', location: 'Surat, Gujarat', phone: '+91 98765 43210', rating: 4.2 },
    { id: 'sc2', name: 'Apex Logistics', location: 'Navi Mumbai', phone: '+91 88888 77777', rating: 3.8 },
    { id: 'sc3', name: 'Global Pharma Exports', location: 'Ahmedabad', phone: '+91 90000 11111', rating: 4.5 },
  ]);

  const handleStartScrape = () => {
    setIsScraping(true);
    setTimeout(() => {
      setIsScraping(false);
      const newLead = { id: Date.now().toString(), name: 'Bright Lights Mfg', location: 'Pimpri, Pune', phone: '+91 77777 66666', rating: 4.0 };
      setScrapedLeads([newLead, ...scrapedLeads]);
    }, 3000);
  };

  const handleVideoGeneration = async (lead: ScrapedLead) => {
    setIsVideoLoading(lead.id);
    try {
      const videoUrl = await onGenerateVideo(lead);
      setScrapedLeads(prev => prev.map(l => l.id === lead.id ? { ...l, videoUrl } : l));
    } catch (e) {
      alert("Video generation failed. Ensure your Veo API Key is valid and billing is enabled.");
    } finally {
      setIsVideoLoading(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tighter">G-Maps Discovery</h2>
          <p className="text-slate-500 mt-1 font-medium italic">Finding businesses with no digital footprint.</p>
        </div>
        <button 
          onClick={handleStartScrape}
          disabled={isScraping}
          className="bg-slate-900 text-white px-8 py-4 rounded-[20px] font-black text-xs uppercase tracking-[0.2em] shadow-xl flex items-center gap-3 active:scale-95 transition-all"
        >
          {isScraping ? (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          )}
          {isScraping ? 'Searching Cloud Nodes...' : 'Start New Search'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {scrapedLeads.map((lead) => (
          <div key={lead.id} className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm flex flex-col items-stretch gap-8 group hover:border-blue-300 transition-all">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center font-black text-2xl border border-red-100">
                  {lead.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h4 className="text-xl font-bold text-slate-900">{lead.name}</h4>
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[8px] font-black uppercase rounded border border-red-200">Gap Detected</span>
                  </div>
                  <p className="text-sm text-slate-500 font-medium mt-1">{lead.location} • ⭐ {lead.rating}</p>
                  <p className="text-xs text-blue-600 font-bold mt-2">{lead.phone}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                <button 
                  onClick={() => handleVideoGeneration(lead)}
                  disabled={isVideoLoading === lead.id}
                  className={`flex-1 md:flex-none px-6 py-3 ${lead.videoUrl ? 'bg-green-50 text-green-600' : 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'} font-black text-[10px] uppercase tracking-widest rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2`}
                >
                  {isVideoLoading === lead.id ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Veo Rendering...
                    </>
                  ) : lead.videoUrl ? (
                    'Intro Video Ready'
                  ) : (
                    '🎥 AI Video Intro'
                  )}
                </button>
                <button 
                  onClick={() => onGeneratePitch(lead)}
                  className="flex-1 md:flex-none px-6 py-3 bg-blue-50 text-blue-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-blue-100 transition-all"
                >
                  Generate AI Pitch
                </button>
                <button 
                  onClick={() => onPushToN8N(lead)}
                  className="flex-1 md:flex-none px-6 py-3 bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all"
                >
                  Push to n8n
                </button>
              </div>
            </div>

            {lead.videoUrl && (
              <div className="mt-4 animate-in slide-in-from-top-4 duration-500">
                <video 
                  src={lead.videoUrl} 
                  controls 
                  className="w-full h-auto rounded-[32px] shadow-2xl border border-slate-200 aspect-video bg-slate-900"
                  poster="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1074&auto=format&fit=crop"
                />
                <div className="mt-4 flex justify-between items-center px-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Generated by Veo 3.1 Fast Node</p>
                  <button 
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = lead.videoUrl!;
                      link.download = `${lead.name}-Intro.mp4`;
                      link.click();
                    }}
                    className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                  >
                    Download MP4
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {isVideoLoading && (
        <div className="fixed inset-0 bg-[#030712]/90 backdrop-blur-xl z-[150] flex items-center justify-center p-10">
          <div className="max-w-md w-full text-center space-y-10 animate-in zoom-in-95 duration-700">
            <div className="relative w-40 h-40 mx-auto">
               <div className="absolute inset-0 border-[8px] border-blue-600/10 rounded-full"></div>
               <div className="absolute inset-0 border-[8px] border-t-blue-600 rounded-full animate-spin shadow-[0_0_60px_rgba(37,99,235,0.4)]"></div>
               <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl">🎬</span>
               </div>
            </div>
            <div>
              <h3 className="text-3xl font-black text-white tracking-tighter uppercase italic">Veo Rendering Engine</h3>
              <p className="text-blue-200/60 font-black text-[10px] uppercase tracking-[0.4em] mt-6">
                Personalizing Cinematic Assets for Lead Outreach...
              </p>
            </div>
            <div className="space-y-3 bg-white/5 p-8 rounded-3xl border border-white/10">
              <p className="text-xs text-slate-400 font-medium italic">"Great things take a moment. Your cinematic business intro is being calculated by our Veo Cloud nodes."</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScraperView;
