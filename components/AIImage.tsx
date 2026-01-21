
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
    setNeedsKeySelection(false);

    // Primary API key from environment - system rule: obtained exclusively from process.env.API_KEY
    const apiKey = process.env.API_KEY;

    // Check if user has a key selected in AI Studio
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
      // Create a fresh instance to ensure latest key is used if in AI Studio
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
      
      let errorMessage = err.message || 'Check API Scope';
      let isQuotaError = false;
      let isPermissionError = false;

      // Parse JSON error message if present (common in GenAI SDK)
      try {
        if (typeof errorMessage === 'string' && errorMessage.includes('{')) {
          const jsonStartIndex = errorMessage.indexOf('{');
          const jsonEndIndex = errorMessage.lastIndexOf('}') + 1;
          const jsonStr = errorMessage.substring(jsonStartIndex, jsonEndIndex);
          const parsed = JSON.parse(jsonStr);
          
          if (parsed.error?.code === 429 || parsed.error?.status === 'RESOURCE_EXHAUSTED') {
            isQuotaError = true;
            errorMessage = "QUOTA_EXHAUSTED: Free tier rate limits reached.";
          } else if (parsed.error?.code === 403 || parsed.error?.status === 'PERMISSION_DENIED') {
            isPermissionError = true;
            errorMessage = "PERMISSION_DENIED: Access restricted. Key likely lacks billing.";
          }
        }
      } catch (e) { /* ignore parse errors */ }

      // Also check raw string for common error codes
      if (!isQuotaError && (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED'))) {
        isQuotaError = true;
        errorMessage = "QUOTA_EXHAUSTED: System limits reached on current key.";
      }

      if (isQuotaError || isPermissionError || errorMessage.includes('403') || err.status === 403 || err.status === 429 || errorMessage.toLowerCase().includes('permission')) {
        setError(isQuotaError ? "QUOTA_ERR: Synthesis Limit Reached. Use a personal paid key to continue." : "BUFFER_ERR: Image Generation restricted. Please link a paid project key.");
        setNeedsKeySelection(true);
      } else {
        setError(`Neural Link Failed: ${errorMessage}`);
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
      await aistudio.openSelectKey();
      // Assume success and proceed to generate with high quality
      setCurrentQuality('high');
      // Wait a moment for environment variables to settle
      setTimeout(() => generateImage(), 200);
    }
  };

  const NeuralHUD = ({ message, showAction = false }: { message: string, showAction?: boolean }) => (
    <div className={`bg-[#020617] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2563eb 1.5px, transparent 0)', backgroundSize: '32px 32px' }}></div>
      <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-transparent"></div>
      
      <div className="relative z-10 w-full max-w-md space-y-10">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
             <div className="w-20 h-20 border border-blue-500/30 rounded-full animate-[spin_10s_linear_infinite]"></div>
             <div className="absolute inset-2 border-t-2 border-blue-500 rounded-full animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center text-3xl drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">🧠</div>
          </div>
          <div className="space-y-2">
            <h3 className="text-blue-500 font-black uppercase tracking-[0.4em] text-[10px] italic">Neural Audit Engine</h3>
            <p className="text-slate-200 text-xs font-bold min-h-[1.5rem] italic opacity-80 animate-pulse">"{message}"</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           {[
             { label: 'Leads Scanned', val: stats.leads.toLocaleString(), trend: '+42%' },
             { label: 'Website Gaps', val: stats.gaps.toLocaleString(), trend: 'High' },
             { label: 'Audit Cycle', val: '2.4s', trend: 'Live' },
             { label: 'CVR Probability', val: `${stats.probability.toFixed(1)}%`, trend: 'Hot' }
           ].map((stat, i) => (
             <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl backdrop-blur-sm text-left group/stat hover:border-blue-500/30 transition-all">
                <p className="text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">{stat.label}</p>
                <div className="flex justify-between items-end">
                   <p className="text-lg font-black text-white italic tracking-tighter">{stat.val}</p>
                   <span className="text-[7px] font-black text-blue-500 uppercase tracking-tighter">{stat.trend}</span>
                </div>
             </div>
           ))}
        </div>

        {showAction && (
          <div className="flex flex-col gap-3 pt-6">
            <button 
              onClick={handleOpenKeyPicker}
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
              Link Personal API Key (Pro)
            </button>
            <p className="text-[9px] text-slate-500 italic max-w-xs mx-auto">
              High-quality synthesis requires a personal API key from a project with Imagen enabled and sufficient quota. 
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline ml-1">Learn more about billing.</a>
            </p>
          </div>
        )}
      </div>

      <div className="absolute top-6 left-6 flex gap-1 items-center">
         <div className="w-1 h-1 bg-blue-500 rounded-full animate-ping"></div>
         <span className="text-[8px] font-mono text-blue-600/40 font-black uppercase tracking-widest">LIVE_TELEMETRY: [NODE_JSK8SNXZ]</span>
      </div>
    </div>
  );

  if (isLoading) return <NeuralHUD message={hudText} />;
  
  if (needsKeySelection) {
    return <NeuralHUD message={error || "BUFFER_ERR: INFRASTRUCTURE SIGNAL OFFLINE: KEY REQUIRED."} showAction />;
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
            Link Paid API Key
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
