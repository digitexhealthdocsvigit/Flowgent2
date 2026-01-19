
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { AuditResult, Lead } from "../types";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("AI System: No API Key detected. Using simulated logic.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

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

export const insforgeDocsTool: FunctionDeclaration = {
  name: 'insforge_fetch_docs',
  parameters: {
    type: Type.OBJECT,
    description: 'Fetches documentation and platform instructions from the InsForge backend to ensure compatible tool calls.',
    properties: {
      topic: { type: Type.STRING, description: 'The specific documentation topic or node type to research.' }
    },
    required: ['topic']
  },
};

/**
 * Generates a Fractal-style Decision Science Audit.
 */
export const generateAuditWithTools = async (lead: Lead): Promise<{ audit: AuditResult, toolCalls?: any[] }> => {
  const ai = getAI();
  if (!ai) return { audit: getSimulatedAudit() };
  
  const prompt = `Perform a high-density Decision Science Audit for "${lead.business_name}" (${lead.category}).
  CONTEXT: Using InsForge platform node JSK8SNXZ. Calculate Readiness, Radar Metrics, and ROI.
  Return strictly in JSON format. If score > 80, call 'trigger_n8n_signal'.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        tools: [{ functionDeclarations: [n8nToolDeclaration, insforgeDocsTool] }],
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
    return { audit: getSimulatedAudit() };
  }
};

const getSimulatedAudit = (): AuditResult => ({
  summary: "Continuity Mode: Standard Audit Fallback.",
  gaps: ["Infrastructure handshake timeout", "API Key verification required"],
  recommendations: ["Manually verify InsForge Project Node"],
  score: 65,
  radar_metrics: { presence: 40, automation: 20, seo: 30, capture: 10 },
  decision_logic: [{ factor: "API Check", impact: "high", reasoning: "AI Engine is running in simulation due to key latency." }]
});

export const searchLocalBusinesses = async (query: string, lat?: number, lng?: number) => {
  const ai = getAI();
  if (!ai) return [];
  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-lite-latest",
      contents: `Locate 5 prime "${query}" businesses for lead acquisition. Return standard grounding data.`,
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
  } catch (e) {
    return [];
  }
};

export const generateVideoIntro = async (businessName: string): Promise<string> => {
  const ai = getAI();
  if (!ai) return "";
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `Cinematic reveal for "${businessName}" with high-tech dashboard atmosphere.`,
    config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
  });
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({operation: operation});
  }
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  return `${downloadLink}&key=${process.env.API_KEY}`;
};
