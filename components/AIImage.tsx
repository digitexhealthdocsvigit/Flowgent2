
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
    
    // For high quality Pro model, we must use a selected key
    if (currentQuality === 'high' && aistudio) {
      const hasKey = await aistudio.hasSelectedApiKey();
      if (!hasKey) {
        setNeedsKeySelection(true);
        setIsLoading(false);
        return;
      }
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      setError("Infrastructure Signal Offline");
      setIsLoading(false);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const modelName = forceModel || (currentQuality === 'high' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image');
      
      const enhancedPrompt = `${prompt}. High-end commercial studio photography, cinematic lighting, ultra-sharp focus, 8k resolution, elegant tech-focused composition, vibrant and professional color palette.`;

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
        throw new Error("Payload Empty");
      }
    } catch (err: any) {
      console.error("AI Image Gen Error:", err);
      
      if (err.message?.includes('403') || err.status === 403 || err.message?.includes('permission')) {
        if (currentQuality === 'high' && !forceModel) {
          setNeedsKeySelection(true);
        } else {
          setError("Neural Access Restricted (403)");
        }
      } else {
        setError("Synthesis Interrupted");
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

  if (isLoading) {
    return (
      <div className={`bg-slate-900 flex flex-col items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-500 italic border border-white/5 overflow-hidden ${className}`}>
        <div className="relative w-12 h-12 mb-4">
          <div className="absolute inset-0 border-2 border-blue-600/20 rounded-full"></div>
          <div className="absolute inset-0 border-2 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
        <span className="animate-pulse">Rendering {currentQuality === 'high' ? 'Pro' : 'Flash'} Node...</span>
      </div>
    );
  }

  if (needsKeySelection) {
    return (
      <div className={`bg-slate-950 flex flex-col items-center justify-center p-8 text-center border border-blue-500/20 ${className}`}>
        <div className="text-2xl mb-4">💎</div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-6 italic leading-relaxed">
          High-Fidelity imagery requires <br/> a paid project API key.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-[200px]">
          <button 
            onClick={handleOpenKeyPicker}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
          >
            Select Paid Key
          </button>
          <button 
            onClick={() => { setCurrentQuality('standard'); generateImage('gemini-2.5-flash-image'); }}
            className="text-[8px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors"
          >
            Fallback to Standard
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-slate-950 flex flex-col items-center justify-center p-6 text-center ${className} border border-white/5`}>
        <div className="text-2xl mb-2 opacity-20 italic">BUFFER_ERR</div>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic mb-4">
          {error}
        </p>
        <button 
          onClick={() => generateImage()}
          className="text-[8px] font-black text-blue-500 uppercase tracking-widest hover:underline"
        >
          Re-Initialize
        </button>
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
