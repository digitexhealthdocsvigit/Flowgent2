
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { AuditResult, Lead } from "../types";

export const n8nToolDeclaration: FunctionDeclaration = {
  name: 'trigger_n8n_signal',
  parameters: {
    type: Type.OBJECT,
    description: 'Dispatches high-priority signals to the n8n orchestrator for infrastructure provisioning.',
    properties: {
      business_name: { type: Type.STRING },
      est_contract_value: { type: Type.NUMBER },
      pitch_type: { type: Type.STRING },
      is_hot: { type: Type.BOOLEAN }
    },
    required: ['business_name', 'est_contract_value', 'pitch_type', 'is_hot']
  },
};

/**
 * Generates a Fractal-style Decision Science Audit using Gemini 3.
 */
export const generateAuditWithTools = async (lead: Lead): Promise<{ audit: AuditResult, toolCalls?: any[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Perform a high-density Decision Science Audit for "${lead.business_name}" (${lead.category}).
  
  CONTEXT: We are using InsForge as our backend platform. 
  
  You must calculate:
  1. Business Readiness Score (0-100)
  2. Radar Metrics (Presence, Automation, SEO, Capture - 0 to 100 each)
  3. Decision Logic Chain (3-4 nodes)
  4. Projected Annual ROI Lift
  
  Return strictly in JSON format. If score > 80, call 'trigger_n8n_signal'.`;

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
            score: { type: Type.NUMBER },
            projected_roi_lift: { type: Type.STRING },
            radar_metrics: {
              type: Type.OBJECT,
              properties: {
                presence: { type: Type.NUMBER },
                automation: { type: Type.NUMBER },
                seo: { type: Type.NUMBER },
                capture: { type: Type.NUMBER }
              },
              required: ["presence", "automation", "seo", "capture"]
            },
            decision_logic: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  factor: { type: Type.STRING },
                  impact: { type: Type.STRING, enum: ["high", "medium", "low"] },
                  reasoning: { type: Type.STRING }
                },
                required: ["factor", "impact", "reasoning"]
              }
            }
          },
          required: ["summary", "gaps", "recommendations", "score", "radar_metrics", "decision_logic"]
        }
      }
    });

    const audit = JSON.parse(response.text || "{}");
    return { audit, toolCalls: response.functionCalls };
  } catch (error) {
    console.error("Decision Science Error:", error);
    return { 
      audit: {
        summary: "Standard Audit Fallback Node engaged.",
        gaps: ["Infrastructure handshake timeout"],
        recommendations: ["Manually verify InsForge Project Node"],
        score: 65,
        radar_metrics: { presence: 40, automation: 20, seo: 30, capture: 10 },
        decision_logic: [{ factor: "System Error", impact: "high", reasoning: "AI Engine could not verify InsForge documentation in real-time." }]
      }
    };
  }
};

export const searchLocalBusinesses = async (query: string, lat?: number, lng?: number) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    // Rule: Google Maps grounding is only supported in Gemini 2.5 series models.
    model: "gemini-2.5-flash-lite-latest",
    contents: `Locate 5 prime "${query}" businesses for lead acquisition.`,
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: lat && lng ? { latitude: lat, longitude: lng } : undefined
        }
      }
    },
  });

  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  return chunks.filter((c: any) => c.maps).map((c: any) => ({
    business_name: c.maps.title,
    city: c.maps.address,
    rating: c.maps.rating,
    reviews: c.maps.reviewCount,
    has_website: !!c.maps.websiteUri,
    website: c.maps.websiteUri || '',
    phone: c.maps.phoneNumber,
    type: c.maps.type || query,
    mapsUrl: c.maps.uri
  }));
};

export const generateVideoIntro = async (businessName: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `A cinematic technical reveal for "${businessName}" showing data flowing through nodes.`,
    config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
  });
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({operation: operation});
  }
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  return `${downloadLink}&key=${process.env.API_KEY}`;
};
