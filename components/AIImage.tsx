
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

  const hudPhrases = [
    "Scanning regional business clusters...",
    "Identifying missing digital footprints...",
    "Auditing web presence...",
    "Cross-verifying social identity...",
    "Neural link established ✅",
    "Synthesizing visual logic..."
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (isLoading) {
        setHudText(hudPhrases[i % hudPhrases.length]);
        i++;
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [isLoading]);

  const generateImage = async (forceModel?: string) => {
    setIsLoading(true);
    setError(null);
    setNeedsKeySelection(false);

    const aistudio = (window as any).aistudio;
    const apiKey = process.env.API_KEY;

    // Hardened check for environment configuration
    if (aistudio) {
      const hasKey = await aistudio.hasSelectedApiKey();
      if (!hasKey) {
        setNeedsKeySelection(true);
        setIsLoading(false);
        return;
      }
    } else if (!apiKey) {
      // If we're not in the AI Studio environment and have no key, we can't generate
      setError("Infrastructure Signal Offline: Key Required");
      setIsLoading(false);
      return;
    }

    try {
      // Use the injected key or the one from AI Studio
      const ai = new GoogleGenAI({ apiKey: apiKey! });
      const modelName = forceModel || (currentQuality === 'high' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image');
      
      const enhancedPrompt = `Masterpiece commercial photography: ${prompt}. Cinematic lighting, 8k resolution, volumetric data overlay effects, sharp focus, professional tech aesthetic, deep blue and emerald teal accents.`;

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
        throw new Error("Empty Payload");
      }
    } catch (err: any) {
      console.error("AI Image Gen Error:", err);
      
      if (err.message?.includes('403') || err.status === 403 || err.message?.toLowerCase().includes('permission')) {
        setNeedsKeySelection(true);
      } else {
        setError("Synthesis Failure: Buffer Empty");
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
      generateImage();
    }
  };

  const NeuralHUD = ({ message, showButton = false }: { message: string, showButton?: boolean }) => (
    <div className={`bg-[#020617] flex flex-col items-center justify-center p-12 text-center relative overflow-hidden ${className}`}>
      {/* HUD Background Decoration */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#2563eb 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#2563eb10_0%,_transparent_70%)]"></div>
      
      {/* Animated Elements */}
      <div className="relative z-10 space-y-8 max-w-sm">
        <div className="flex justify-center">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-blue-600/20 rounded-full animate-pulse"></div>
            <div className="absolute inset-2 border-2 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-2xl">🧠</div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-blue-500 font-black uppercase tracking-[0.4em] text-[10px] italic">Neural Discovery Node</h3>
          <p className="text-slate-300 text-sm font-bold min-h-[40px] italic">"{message}"</p>
          
          <div className="flex justify-center gap-1 h-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-1 bg-blue-600 rounded-full animate-pulse" style={{ height: `${30 + Math.random() * 70}%`, animationDelay: `${i * 0.2}s` }}></div>
            ))}
          </div>
        </div>

        {showButton && (
          <div className="pt-4 flex flex-col gap-3">
            <button 
              onClick={handleOpenKeyPicker}
              className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
            >
              Connect Infrastructure
            </button>
            <button 
              onClick={() => { setCurrentQuality('standard'); generateImage('gemini-2.5-flash-image'); }}
              className="text-[8px] font-black text-slate-600 uppercase tracking-widest hover:text-slate-400 transition-colors"
            >
              Attempt Standard Link
            </button>
          </div>
        )}
      </div>

      {/* Edge Decals */}
      <div className="absolute top-8 left-8 text-[8px] font-mono text-blue-600/30 font-black uppercase">NODE_STATUS: {isLoading ? 'SYNCING' : 'OFFLINE'}</div>
      <div className="absolute bottom-8 right-8 text-[8px] font-mono text-blue-600/30 font-black uppercase">RE_INIT_GATEWAY: [JSK8SNXZ]</div>
    </div>
  );

  if (isLoading) return <NeuralHUD message={hudText} />;
  
  if (needsKeySelection) {
    return <NeuralHUD message="Infrastructure Key Not Detected. Action Required." showButton />;
  }

  if (error || !imageUrl) {
    return (
      <div className={`bg-[#020617] flex flex-col items-center justify-center p-12 text-center border border-red-900/20 ${className}`}>
        <div className="text-4xl mb-4 opacity-50">📡</div>
        <p className="text-red-500 font-black uppercase tracking-widest text-[10px] italic mb-6">BUFFER_ERR: {error || 'Synthesis Stalled'}</p>
        <button 
          onClick={() => generateImage()}
          className="bg-white/5 border border-white/10 text-slate-400 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
        >
          Re-Initialize
        </button>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden group ${className}`}>
      <img 
        src={imageUrl} 
        alt={alt} 
        className="object-cover w-full h-full animate-in fade-in duration-1000 group-hover:scale-105 transition-transform duration-[4000ms]" 
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default AIImage;
