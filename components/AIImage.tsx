
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

  const generateImage = async (forceModel?: string) => {
    setIsLoading(true);
    setError(null);
    setNeedsKeySelection(false);

    // Check for developer environment requirements
    const aistudio = (window as any).aistudio;
    
    // For high quality, we MUST check if a key has been selected as per guidelines
    if (quality === 'high' && aistudio) {
      const hasKey = await aistudio.hasSelectedApiKey();
      if (!hasKey) {
        setNeedsKeySelection(true);
        setIsLoading(false);
        return;
      }
    }

    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      setError("API Key Missing");
      setIsLoading(false);
      return;
    }

    try {
      // Create fresh instance to ensure we pick up the latest key from selection dialog
      const ai = new GoogleGenAI({ apiKey });
      
      // Determine model: use preview for high quality, flash for standard
      const modelName = forceModel || (quality === 'high' ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image');
      
      // Enhanced prompt engineering for "Better Relevant" images
      const enhancedPrompt = `${prompt}. High-end commercial aesthetic, ultra-sharp 8k resolution, volumetric lighting, photorealistic textures, masterfully composed, professional color grading, tech-forward atmosphere.`;

      const response = await ai.models.generateContent({
        model: modelName,
        contents: {
          parts: [{ text: enhancedPrompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio,
            // imageSize is only for gemini-3-pro-image-preview
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
      
      // Handle Permission Denied (403)
      if (err.message?.includes('403') || err.status === 403) {
        if (quality === 'high' && !forceModel) {
          // If high-quality failed with 403, try falling back to standard flash-image
          console.warn("High-quality model permission denied. Falling back to Flash...");
          generateImage('gemini-2.5-flash-image');
          return;
        }
        setError("Permission Denied. Paid API Key Required.");
      } else {
        setError("Generation Stalled");
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateImage();
  }, [prompt, aspectRatio, quality]);

  const handleOpenKeyPicker = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      await aistudio.openSelectKey();
      // Assume success and retry
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
        <span className="animate-pulse">Neural Rendering...</span>
      </div>
    );
  }

  if (needsKeySelection) {
    return (
      <div className={`bg-slate-950 flex flex-col items-center justify-center p-8 text-center border border-blue-500/20 ${className}`}>
        <div className="text-xl mb-4">🔑</div>
        <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-6 italic leading-relaxed">
          High-Quality rendering requires <br/> a paid project API key.
        </p>
        <button 
          onClick={handleOpenKeyPicker}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg"
        >
          Select Paid API Key
        </button>
        <button 
          onClick={() => { quality = 'standard' as any; generateImage('gemini-2.5-flash-image'); }}
          className="mt-4 text-[8px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors"
        >
          Use Standard Quality (Free)
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-slate-950 flex flex-col items-center justify-center p-6 text-center ${className} border border-white/5`}>
        <div className="text-2xl mb-2 opacity-20 italic">0xERR</div>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic mb-4">
          {error}
        </p>
        <button 
          onClick={() => generateImage()}
          className="text-[8px] font-black text-blue-500 uppercase tracking-widest hover:underline"
        >
          Retry Neural Link
        </button>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden group ${className}`}>
      <img 
        src={imageUrl!} 
        alt={alt} 
        className="object-cover w-full h-full animate-in fade-in duration-1000 group-hover:scale-105 transition-transform duration-1000" 
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default AIImage;
