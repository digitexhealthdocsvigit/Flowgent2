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

  const hudPhrases = [
    "Scanning regional business clusters...",
    "Identifying missing digital footprints...",
    "Auditing web presence...",
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
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const generateImage = async (forceModel?: string) => {
    setIsLoading(true);
    setError(null);
    setIsQuotaExceeded(false);
    setNeedsKeySelection(false);

    // Mandatory check for AI Studio Key Selection per system rules for premium models
    const aistudio = (window as any).aistudio;
    if (aistudio && currentQuality === 'high') {
      const hasKey = await aistudio.hasSelectedApiKey();
      if (!hasKey) {
        setNeedsKeySelection(true);
        setIsLoading(true); // Keep loading state until they click
        setIsLoading(false);
        return;
      }
    }

    try {
      const apiKey = import.meta.env.VITE_API_KEY || import.meta.env.VITE_GEMINI_API_KEY || '';
      if (!apiKey) {
        throw new Error('API key must be set when using the Gemini API.');
      }
      const ai = new GoogleGenAI({ apiKey });
      
      const modelName = forceModel || (currentQuality === 'high' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image');
      
      const enhancedPrompt = `High-end commercial masterpiece photography: ${prompt}. Cinematic volumetric lighting, ultra-sharp 8k resolution, professional tech aesthetic, deep navy and emerald blue color grading.`;

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
      
      const errorMessage = err.message || JSON.stringify(err);
      const is429 = errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED');

      if (is429) {
        setIsQuotaExceeded(true);
        setError("NEURAL_QUOTA_EXHAUSTED: System limits reached. Manual key injection required.");
      } else if (errorMessage.includes('403') || errorMessage.includes('PERMISSION_DENIED')) {
        setNeedsKeySelection(true);
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
      await aistudio.openSelectKey();
      // Assume success and retry
      setCurrentQuality('high');
      generateImage();
    }
  };

  const NeuralHUD = ({ message, showAction = false, type = 'status' }: { message: string, showAction?: boolean, type?: 'status' | 'error' | 'quota' }) => (
    <div className={`bg-[#020617] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden ${className} min-h-[300px]`}>
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2563eb 1.5px, transparent 0)', backgroundSize: '32px 32px' }}></div>
      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
             <div className={`w-16 h-16 border ${type === 'quota' ? 'border-amber-500/30' : 'border-blue-500/30'} rounded-full animate-[spin_10s_linear_infinite]`}></div>
             <div className={`absolute inset-1.5 border-t-2 ${type === 'quota' ? 'border-amber-500' : 'border-blue-500'} rounded-full animate-spin`}></div>
             <div className="absolute inset-0 flex items-center justify-center text-2xl">
               {type === 'quota' ? '⚡' : type === 'error' ? '📡' : '🧠'}
             </div>
          </div>
          <div className="space-y-1">
            <h3 className={`${type === 'quota' ? 'text-amber-500' : 'text-blue-500'} font-black uppercase tracking-[0.4em] text-[10px] italic`}>
              {type === 'quota' ? 'Quota Exhausted' : 'Neural Audit Engine'}
            </h3>
            <p className="text-slate-200 text-xs font-bold italic opacity-80 animate-pulse leading-snug">"{message}"</p>
          </div>
        </div>

        {showAction && (
          <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
            <button 
              onClick={handleOpenKeyPicker}
              className="bg-blue-600 text-white px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
            >
              Link Personal API Key
            </button>
            <p className="text-[9px] text-slate-500 italic leading-relaxed px-4">
              Access high-fidelity image generation by linking a paid Gemini API key from your project.
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline block mt-1">Billing Documentation</a>
            </p>
          </div>
        )}
      </div>
      <div className="absolute top-4 left-4">
         <span className={`text-[7px] font-mono ${type === 'quota' ? 'text-amber-500/40' : 'text-blue-600/40'} font-black uppercase tracking-widest`}>STATUS: {type.toUpperCase()}</span>
      </div>
    </div>
  );

  if (isLoading) return <NeuralHUD message={hudText} />;
  if (isQuotaExceeded) return <NeuralHUD message="RESOURCE_EXHAUSTED: Neural quota reached. Link a personal key to continue." showAction type="quota" />;
  if (needsKeySelection) return <NeuralHUD message="AUTHENTICATION_REQUIRED: High-fidelity node requires a personal API key." showAction type="error" />;

  if (error || !imageUrl) {
    return (
      <div className={`bg-[#020617] flex flex-col items-center justify-center p-8 text-center border border-white/5 ${className} min-h-[300px]`}>
        <p className="text-slate-500 font-black uppercase tracking-widest text-[9px] mb-4">{error || 'Handshake Stalled'}</p>
        <button onClick={() => generateImage()} className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline">Retry Signal</button>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden group ${className}`}>
      <img src={imageUrl} alt={alt} className="object-cover w-full h-full animate-in fade-in duration-1000 group-hover:scale-105 transition-transform duration-[4000ms]" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default AIImage;