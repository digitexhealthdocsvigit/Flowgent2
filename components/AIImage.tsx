import React, { useState, useEffect } from 'react';

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

  // Gemini AI disabled per user request - using OpenAI only
  console.warn("AIImage Component: Gemini AI disabled per user request. Using placeholder images.");

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

    // Use placeholder images instead of Gemini AI
    try {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a simple placeholder image based on the prompt
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Create a gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#1e40af'); // blue-700
        gradient.addColorStop(1, '#065f46'); // emerald-800
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add some text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('AI Image Placeholder', canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = '16px Arial';
        ctx.fillText(prompt.substring(0, 50) + '...', canvas.width / 2, canvas.height / 2 + 20);
        
        const dataUrl = canvas.toDataURL('image/png');
        setImageUrl(dataUrl);
      } else {
        throw new Error('Canvas not supported');
      }
      
      setIsLoading(false);
    } catch (err: any) {
      console.error("Placeholder Image Error:", err);
      setError(`Placeholder generation failed: ${err.message}`);
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