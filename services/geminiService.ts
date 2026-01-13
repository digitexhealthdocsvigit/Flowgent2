
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { AuditResult, Lead } from "../types";

// Tool Definition for MCP-style connection to n8n
export const n8nToolDeclaration: FunctionDeclaration = {
  name: 'trigger_n8n_signal',
  parameters: {
    type: Type.OBJECT,
    description: 'Dispatches a high-priority lead signal to the n8n orchestrator for automated outreach.',
    properties: {
      business_name: { type: Type.STRING, description: 'The verified name of the business.' },
      est_contract_value: { type: Type.NUMBER, description: 'Calculated potential value in INR.' },
      pitch_type: { type: Type.STRING, description: 'The specific service to be pitched (e.g., website_development).' },
      is_hot: { type: Type.BOOLEAN, description: 'True if the lead meets high-intent criteria.' }
    },
    required: ['business_name', 'est_contract_value', 'pitch_type', 'is_hot']
  },
};

/**
 * Perform a digital audit using Tools to potentially trigger n8n
 */
export const generateAuditWithTools = async (lead: Lead): Promise<{ audit: AuditResult, toolCalls?: any[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Perform a digital audit for "${lead.business_name}" at "${lead.website}". 
  If the business score is above 80 and they have NO website, you MUST use the trigger_n8n_signal tool 
  to initiate a website development pitch immediately.
  
  Otherwise, just return the audit results in JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ functionDeclarations: [n8nToolDeclaration] }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            gaps: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            score: { type: Type.NUMBER }
          },
          required: ["summary", "gaps", "recommendations", "score"]
        }
      }
    });

    const audit = JSON.parse(response.text || "{}");
    return { audit, toolCalls: response.functionCalls };
  } catch (error) {
    console.error("Gemini Tool Error:", error);
    return { 
      audit: {
        summary: "Standard Audit Backup engaged. LEAD: " + lead.business_name,
        gaps: ["Mobile responsiveness issues", "No integrated booking"],
        recommendations: ["Deploy Flowgent Capture Node"],
        score: 65
      }
    };
  }
};

/**
 * Generate outreach text for WhatsApp/Email.
 */
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
    return response.text || "Hi, we noticed your business is growing but missing a digital infrastructure.";
  } catch (error) {
    return "Hi, noticed your business in Google Maps. You're missing a website! Interested?";
  }
};

/**
 * Find real businesses using Google Maps Grounding.
 */
export const searchLocalBusinesses = async (query: string, lat?: number, lng?: number): Promise<any[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Find 5 businesses related to "${query}" in the location. Provide JSON array with keys: name, address, rating, phone, mapsUrl, has_website, website.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite-latest",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: lat && lng ? { latitude: lat, longitude: lng } : undefined
          }
        }
      }
    });

    const text = response.text;
    const jsonMatch = text.match(/\[.*\]/s);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch (error) {
    console.error("Maps Grounding Error:", error);
    return [];
  }
};

/**
 * Generates a cinematic AI video intro for a lead using the Veo model.
 */
export const generateVideoIntro = async (businessName: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const prompt = `A cinematic office fly-through with holograms showing "${businessName}" and "DIGITAL TRANSFORMATION".`;
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
    });
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 8000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
  } catch (error: any) {
    throw error;
  }
};
