
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

  const generateImage = async (forceModel?: string) => {
    setIsLoading(true);
    setError(null);
    setNeedsKeySelection(false);

    const aistudio = (window as any).aistudio;
    const apiKey = process.env.API_KEY;

    // Proactive check: If key is missing or we are in High Quality mode without a selected key
    if (!apiKey || (currentQuality === 'high' && aistudio && !(await aistudio.hasSelectedApiKey()))) {
      if (aistudio) {
        setNeedsKeySelection(true);
        setIsLoading(false);
        return;
      } else if (!apiKey) {
        setError("Infrastructure Signal Offline (Missing API Key)");
        setIsLoading(false);
        return;
      }
    }

    try {
      const ai = new GoogleGenAI({ apiKey: apiKey! });
      const modelName = forceModel || (currentQuality === 'high' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image');
      
      // Hyper-refined prompt for "Enhanced Relevance"
      const enhancedPrompt = `A high-end commercial masterpiece: ${prompt}. Cinematic lighting, 8k octane render, professional photography, clean sharp focus, futuristic business aesthetic, deep blue and emerald teal tones, luxury tech atmosphere.`;

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
        throw new Error("Empty Neural Buffer");
      }
    } catch (err: any) {
      console.error("AI Image Gen Error:", err);
      
      // Specific 403 handling for Pro model or permission issues
      if (err.message?.includes('403') || err.status === 403 || err.message?.includes('permission')) {
        if (currentQuality === 'high' && !forceModel) {
          setNeedsKeySelection(true);
        } else {
          setError("Neural Access Restricted (403)");
        }
      } else {
        setError("Synthesis Failed: Check Console");
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
      // Proceed immediately to retry as per race condition guidelines
      generateImage();
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-slate-900 flex flex-col items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-500 italic border border-white/5 overflow-hidden ${className}`}>
        <div className="relative w-12 h-12 mb-4">
          <div className="absolute inset-0 border-2 border-blue-600/20 rounded-full"></div>
          <div className="absolute inset-0 border-2 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <span className="animate-pulse">Synthesizing Node...</span>
      </div>
    );
  }

  if (needsKeySelection) {
    return (
      <div className={`bg-slate-950 flex flex-col items-center justify-center p-8 text-center border border-blue-500/20 ${className}`}>
        <div className="text-3xl mb-4">⚡</div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-6 italic leading-relaxed">
          Infrastructure Offline. <br/> Connect a Paid Project Key.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-[220px]">
          <button 
            onClick={handleOpenKeyPicker}
            className="bg-blue-600 text-white px-6 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            Connect Infrastructure
          </button>
          <button 
            onClick={() => { setCurrentQuality('standard'); generateImage('gemini-2.5-flash-image'); }}
            className="text-[8px] font-black text-slate-600 uppercase tracking-widest hover:text-slate-300 transition-colors"
          >
            Try Standard Mode
          </button>
        </div>
        <p className="mt-4 text-[7px] font-medium text-slate-700 uppercase tracking-tighter">Required for gemini-3-pro-image-preview</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-slate-950 flex flex-col items-center justify-center p-6 text-center ${className} border border-white/5`}>
        <div className="text-xl mb-2 opacity-40 font-black italic text-red-500">BUFFER_ERR</div>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic mb-4">
          {error}
        </p>
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => generateImage()}
            className="text-[9px] font-black text-blue-500 uppercase tracking-widest hover:underline"
          >
            Re-Initialize
          </button>
          {error.includes('Key') && (window as any).aistudio && (
            <button 
              onClick={handleOpenKeyPicker}
              className="text-[9px] font-black text-emerald-500 uppercase tracking-widest hover:underline"
            >
              Select Key
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden group ${className}`}>
      <img 
        src={imageUrl!} 
        alt={alt} 
        className="object-cover w-full h-full animate-in fade-in duration-1000 group-hover:scale-110 transition-transform duration-[2000ms]" 
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default AIImage;
