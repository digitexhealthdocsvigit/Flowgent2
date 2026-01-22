
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

interface AIImageProps {
  prompt: string;
  aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
  className?: string;
  alt?: string;
  quality?: 'standard' | 'high';
}

const AIImage: React.FC<AIImageProps> = ({ 
  prompt, 
  aspectRatio = "1:1", 
  className = "", 
  alt = "AI Visual",
  quality = 'standard'
}) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
  const [needsKeySelection, setNeedsKeySelection] = useState(false);
  const [currentQuality, setCurrentQuality] = useState(quality);
  const [hudText, setHudText] = useState("Initializing Neural Link...");
  const [stats, setStats] = useState({ leads: 2184, gaps: 732, probability: 78 });

  const hudPhrases = [
    "Scanning regional business clusters...",
    "Identifying missing digital footprints...",
    "Auditing web presence...",
    "Cross-verifying social identity...",
    "Neural link established ✅",
    "Synthesizing visual logic...",
    "Detecting uncaptured inquiry nodes...",
    "Calculating digital readiness score..."
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setHudText(hudPhrases[i % hudPhrases.length]);
      i++;
      setStats(prev => ({
        leads: prev.leads + (Math.random() > 0.5 ? 1 : -1),
        gaps: prev.gaps + (Math.random() > 0.5 ? 1 : -1),
        probability: Math.min(99, Math.max(70, prev.probability + (Math.random() > 0.5 ? 0.1 : -0.1)))
      }));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const generateImage = async (forceModel?: string) => {
    setIsLoading(true);
    setError(null);
    setIsQuotaExceeded(false);
    setNeedsKeySelection(false);

    // Primary API key from environment - system rule: obtained exclusively from process.env.API_KEY
    const apiKey = process.env.API_KEY;

    // Check if user has a key selected in AI Studio context
    const aistudio = (window as any).aistudio;
    if (aistudio && currentQuality === 'high') {
      const hasKey = await aistudio.hasSelectedApiKey();
      if (!hasKey) {
        setNeedsKeySelection(true);
        setIsLoading(false);
        return;
      }
    }

    if (!apiKey && !aistudio) {
      setError("INFRASTRUCTURE OFFLINE: Vercel Variable 'API_KEY' required.");
      setIsLoading(false);
      return;
    }

    try {
      // Create a fresh instance right before making an API call to ensure it always uses the most up-to-date API key
      const ai = new GoogleGenAI({ apiKey: apiKey! });
      
      // Select model based on task type and user choice
      const modelName = forceModel || (currentQuality === 'high' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image');
      
      const enhancedPrompt = `High-end commercial masterpiece photography: ${prompt}. Cinematic volumetric lighting, ultra-sharp 8k resolution, professional tech aesthetic, deep navy and emerald blue color grading, clean and prestigious composition.`;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: {
          parts: [{ text: enhancedPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio,
            ...(modelName === 'gemini-3-pro-image-preview' ? { imageSize: '1K' } : {})
          }
        }
      });

      const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      
      if (part?.inlineData) {
        setImageUrl(`data:image/png;base64,${part.inlineData.data}`);
        setIsLoading(false);
      } else {
        throw new Error("Neural Buffer Timeout: Content Synthesis Failed.");
      }
    } catch (err: any) {
      console.error("AI Image Gen Error:", err);
      
      let errorMessage = '';
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err.message) {
        errorMessage = err.message;
      } else {
        errorMessage = JSON.stringify(err);
      }

      // Detect Quota Exceeded (429) specifically
      const is429 = errorMessage.includes('429') || 
                    errorMessage.includes('RESOURCE_EXHAUSTED') || 
                    (err.status === 429);

      if (is429) {
        setIsQuotaExceeded(true);
        setError("NEURAL_QUOTA_EXHAUSTED: Shared buffer capacity reached.");
      } else if (errorMessage.includes('403') || errorMessage.includes('PERMISSION_DENIED') || err.status === 403) {
        setNeedsKeySelection(true);
        setError("PERMISSION_DENIED: Access restricted. Project billing required.");
      } else {
        setError(`Neural Link Failed: ${errorMessage.slice(0, 80)}...`);
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateImage();
  }, [prompt, aspectRatio, currentQuality]);

  const handleOpenKeyPicker = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      // Trigger the key selection dialog per system instructions
      await aistudio.openSelectKey();
      
      // Proceed immediately to retry with high quality setting
      setTimeout(() => {
        setCurrentQuality('high');
        generateImage();
      }, 500);
    }
  };

  const NeuralHUD = ({ message, showAction = false, type = 'status' }: { message: string, showAction?: boolean, type?: 'status' | 'error' | 'quota' }) => (
    <div className={`bg-[#020617] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2563eb 1.5px, transparent 0)', backgroundSize: '32px 32px' }}></div>
      <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-transparent"></div>
      
      <div className="relative z-10 w-full max-w-md space-y-10">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
             <div className={`w-20 h-20 border ${type === 'quota' ? 'border-amber-500/30' : 'border-blue-500/30'} rounded-full animate-[spin_10s_linear_infinite]`}></div>
             <div className={`absolute inset-2 border-t-2 ${type === 'quota' ? 'border-amber-500' : 'border-blue-500'} rounded-full animate-spin`}></div>
             <div className="absolute inset-0 flex items-center justify-center text-3xl drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
               {type === 'quota' ? '⚡' : type === 'error' ? '📡' : '🧠'}
             </div>
          </div>
          <div className="space-y-2 px-4">
            <h3 className={`${type === 'quota' ? 'text-amber-500' : 'text-blue-500'} font-black uppercase tracking-[0.4em] text-[10px] italic`}>
              {type === 'quota' ? 'Neural Capacity Alert' : 'Neural Audit Engine'}
            </h3>
            <p className="text-slate-200 text-xs font-bold italic opacity-80 animate-pulse leading-relaxed">"{message}"</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           {[
             { label: 'Infrastructure', val: '0x82_JSK8', trend: 'NODE_READY' },
             { label: 'Cluster Load', val: type === 'quota' ? 'MAX' : '92%', trend: type === 'quota' ? 'STALLED' : 'STABLE' },
             { label: 'Sync Cycle', val: '2.4s', trend: 'LIVE' },
             { label: 'Signal Path', val: type === 'quota' ? 'REJECTED' : 'OPEN', trend: 'E2E' }
           ].map((stat, i) => (
             <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl backdrop-blur-sm text-left group/stat hover:border-blue-500/30 transition-all">
                <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">{stat.label}</p>
                <div className="flex justify-between items-end">
                   <p className="text-sm font-black text-white italic tracking-tighter">{stat.val}</p>
                   <span className={`text-[7px] font-black uppercase tracking-tighter ${stat.trend === 'REJECTED' || stat.trend === 'STALLED' ? 'text-amber-500' : 'text-blue-500'}`}>{stat.trend}</span>
                </div>
             </div>
           ))}
        </div>

        {showAction && (
          <div className="flex flex-col gap-3 pt-6">
            <button 
              onClick={handleOpenKeyPicker}
              className={`bg-blue-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-3`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
              Link Personal API Key
            </button>
            <p className="text-[9px] text-slate-500 italic max-w-xs mx-auto leading-relaxed">
              Shared infrastructure is currently at capacity. Please link your own Gemini API key (GCP project with billing) to bypass these limits.
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline ml-1">Learn more.</a>
            </p>
          </div>
        )}
      </div>

      <div className="absolute top-6 left-6 flex gap-1 items-center">
         <div className={`w-1 h-1 ${type === 'quota' ? 'bg-amber-500' : 'bg-blue-500'} rounded-full animate-ping`}></div>
         <span className={`text-[8px] font-mono ${type === 'quota' ? 'text-amber-500/40' : 'text-blue-600/40'} font-black uppercase tracking-widest`}>LIVE_TELEMETRY: [NODE_JSK8SNXZ]</span>
      </div>
    </div>
  );

  if (isLoading) return <NeuralHUD message={hudText} />;
  
  if (isQuotaExceeded) {
    return <NeuralHUD message="BUFFER_CAPACITY_REACHED: Shared API quota exhausted for this cycle. Switch to a personal node to continue." showAction type="quota" />;
  }

  if (needsKeySelection) {
    return <NeuralHUD message="PERMISSION_DENIED: Access restricted. Linking a paid project API key is required for image generation." showAction type="error" />;
  }

  if (error || !imageUrl) {
    return (
      <div className={`bg-[#020617] flex flex-col items-center justify-center p-12 text-center border border-red-900/10 ${className}`}>
        <div className="text-3xl mb-4 opacity-50 grayscale contrast-125">📡</div>
        <p className="text-red-500 font-black uppercase tracking-widest text-[10px] italic mb-6">{error || 'Synthesis Stalled'}</p>
        <div className="flex flex-col gap-4">
          <button 
            onClick={() => generateImage()}
            className="text-[9px] font-black text-blue-500 uppercase tracking-widest hover:underline active:scale-95"
          >
            Retry Neural Handshake
          </button>
          <button 
            onClick={handleOpenKeyPicker}
            className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-colors"
          >
            Provision Personal Key
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden group ${className}`}>
      <img 
        src={imageUrl} 
        alt={alt} 
        className="object-cover w-full h-full animate-in fade-in duration-1000 group-hover:scale-110 transition-transform duration-[5000ms]" 
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none"></div>
      
      <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-lg italic">Neural Render Active</span>
      </div>
    </div>
  );
};

export default AIImage;
