
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
 * Generates a Fractal-style Decision Science Audit.
 */
export const generateAuditWithTools = async (lead: Lead): Promise<{ audit: AuditResult, toolCalls?: any[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Perform a Decision Science Audit for "${lead.business_name}" (${lead.category}).
  
  You must calculate:
  1. Business Health Score (0-100)
  2. Radar Metrics (Presence, Automation, SEO, Capture - 0 to 100 each)
  3. Decision Logic Nodes (Explain 3-4 factors that determine this lead's value)
  4. Projected ROI Lift (A string like "₹12.4L Annual Potential")
  
  Return the response in JSON format. Use tool calling if the score is > 75 and it's a high-priority opportunity.`;

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
        summary: "Standard Audit Fallback: System node engaged.",
        gaps: ["Mobile visibility gaps identified"],
        recommendations: ["Initialize Digital Node 01"],
        score: 65,
        radar_metrics: { presence: 40, automation: 20, seo: 30, capture: 10 },
        decision_logic: [{ factor: "System Logic", impact: "medium", reasoning: "Automatic prioritization based on sector data." }]
      }
    };
  }
};

export const generateOutreach = async (lead: Lead): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Draft a high-conversion pitch for ${lead.business_name} in ${lead.city}. Focus on moving them from ${lead.radar_metrics?.presence || 20}% digital presence to 100%.`,
  });
  return response.text || "";
};

export const generateVideoIntro = async (businessName: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `Futuristic cinematic business introduction for ${businessName}. Professional lighting, 4K resolution, sleek animations.`,
    config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
  });
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({operation: operation});
  }
  return `${operation.response?.generatedVideos?.[0]?.video?.uri}&key=${process.env.API_KEY}`;
};

export const searchLocalBusinesses = async (query: string, lat?: number, lng?: number) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Find 5 ${query} businesses in the area. Return as a clean JSON list.`,
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
