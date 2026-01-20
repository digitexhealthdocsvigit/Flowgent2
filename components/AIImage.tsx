
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

interface AIImageProps {
  prompt: string;
  aspectRatio?: "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
  className?: string;
  alt?: string;
}

const AIImage: React.FC<AIImageProps> = ({ prompt, aspectRatio = "1:1", className = "", alt = "AI Visual" }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const generateImage = async () => {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        setIsLoading(false);
        return;
      }

      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: `${prompt}. High quality, 3D render, professional tech aesthetic, clean lighting.` }],
          },
          config: {
            imageConfig: {
              aspectRatio: aspectRatio
            }
          }
        });

        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64EncodeString = part.inlineData.data;
            setImageUrl(`data:image/png;base64,${base64EncodeString}`);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("AI Image Gen Error:", err);
        setError(true);
        setIsLoading(false);
      }
    };

    generateImage();
  }, [prompt, aspectRatio]);

  if (isLoading) {
    return (
      <div className={`bg-slate-800/50 animate-pulse flex flex-col items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-600 italic border border-white/5 ${className}`}>
        <div className="w-8 h-8 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mb-2"></div>
        Generating Neural Visual...
      </div>
    );
  }

  if (error || !imageUrl) {
    return (
      <div className={`bg-slate-900 flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-700 italic border border-white/5 ${className}`}>
        Static Buffer Ready
      </div>
    );
  }

  return (
    <img 
      src={imageUrl} 
      alt={alt} 
      className={`object-cover ${className} animate-in fade-in duration-1000`} 
    />
  );
};

export default AIImage;
