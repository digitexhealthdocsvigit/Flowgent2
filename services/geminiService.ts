import { GoogleGenAI, Type } from "@google/genai";
import { AuditResult } from "../types";

export const generateAudit = async (businessName: string, websiteUrl: string): Promise<AuditResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Act as a senior business automation consultant. Perform a digital audit for "${businessName}" at "${websiteUrl}". 
  Provide a detailed summary of their potential online gaps (no website, poor SEO, no booking system, slow performance) and specific recommendations for automation (CRM, AI Chatbots, Automated Follow-ups).
  Return the response in a structured JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            gaps: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            score: { type: Type.NUMBER }
          },
          required: ["summary", "gaps", "recommendations", "score"]
        }
      }
    });

    const text = response.text || "{}";
    const result = JSON.parse(text);
    return result as AuditResult;
  } catch (error) {
    console.error("Gemini Audit Error:", error);
    return {
      summary: "We analyzed your digital presence and found several opportunities for improvement in your lead capture and follow-up processes.",
      gaps: ["Slow response time to inquiries", "Lack of automated meeting scheduling", "Unoptimized mobile experience"],
      recommendations: ["Implement Flowgent™ CRM for lead tracking", "Integrate automated WhatsApp follow-ups", "Deploy AI-driven audit tools for your clients"],
      score: 45
    };
  }
};

export const generateOutreach = async (businessName: string, location: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Write a short, professional WhatsApp pitch for the business owner of "${businessName}" in "${location}". 
  Mention that they currently don't have a business website and are missing out on at least 20-30 leads a month. 
  Propose a "Business Automation System" including a site and CRM. Keep it friendly and ROI-focused.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    return response.text || "Hi, we noticed your business is growing but missing a digital infrastructure. Let's talk about automating your leads.";
  } catch (error) {
    return "Hi, noticed your business in Google Maps. You're missing a website! We can help automate your sales. Interested?";
  }
};

/**
 * Generates a cinematic AI video intro for a lead using the Veo model.
 * Handles specific API Key selection errors by throwing a retryable error signal.
 */
export const generateVideoIntro = async (businessName: string): Promise<string> => {
  // Fresh instance to ensure current environment API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const prompt = `A highly cinematic, professional 3D animated corporate video intro. 
    The camera flies through a futuristic glass office. Floating holograms display the text "${businessName}" 
    and "DIGITAL TRANSFORMATION IN PROGRESS". 
    Ultra-modern, sleek, blue and silver lighting, 4k resolution, smooth camera movement.`;

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 8000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video production node timed out.");

    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
  } catch (error: any) {
    console.error("Veo Engine Error:", error);
    
    // Check for "Requested entity was not found" which indicates an API Key / Project mismatch
    if (error.message?.includes("Requested entity was not found")) {
      throw new Error("API_KEY_RESET_REQUIRED");
    }
    
    throw error;
  }
};