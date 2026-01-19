
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

/**
 * MCP-Compliant Tool for Orchestration.
 * Aligned with InsForge 'audit_logs' and 'leads' table schema.
 */
export const n8nToolDeclaration: FunctionDeclaration = {
  name: 'trigger_n8n_signal',
  parameters: {
    type: Type.OBJECT,
    description: 'Dispatches high-priority signals to the n8n orchestrator for infrastructure provisioning and lead hydration.',
    properties: {
      business_name: { type: Type.STRING },
      est_contract_value: { type: Type.NUMBER, description: 'Projected value based on infrastructure gaps.' },
      pitch_type: { type: Type.STRING, enum: ['website_development', 'seo', 'automation', 'crm_setup'] },
      is_hot: { type: Type.BOOLEAN },
      node_id: { type: Type.STRING, description: 'The unique InsForge node reference (e.g., JSK8SNXZ).' }
    },
    required: ['business_name', 'est_contract_value', 'pitch_type', 'is_hot', 'node_id']
  },
};

/**
 * MCP Documentation Tool.
 * Used to learn about InsForge specific instructions.
 */
export const insforgeDocsTool: FunctionDeclaration = {
  name: 'insforge_fetch_docs',
  parameters: {
    type: Type.OBJECT,
    description: 'Fetches technical documentation from the InsForge backend to ensure compatible tool calls and database schema alignment.',
    properties: {
      topic: { type: Type.STRING, description: 'Specific documentation node to research (e.g., "auth", "realtime", "mcp").' }
    },
    required: ['topic']
  },
};

/**
 * Generates an Enterprise-Grade Decision Science Audit.
 * Uses Gemini 3 Pro for advanced reasoning and function calling.
 */
export const generateAuditWithTools = async (lead: Lead): Promise<{ audit: AuditResult, toolCalls?: any[] }> => {
  const ai = getAI();
  if (!ai) return { audit: getSimulatedAudit() };
  
  const prompt = `Act as the Flowgent Technical Architect. 
  Perform a High-Density Decision Science Audit for "${lead.business_name}" (${lead.category}).
  
  PLATFORM CONTEXT:
  - Project Node: JSK8SNXZ (InsForge AP-Southeast)
  - Target Tables: leads, audit_logs, subscriptions
  - Schema Policy: Enforce readiness_score > 80 for automated n8n dispatch.
  
  TASK:
  1. Call 'insforge_fetch_docs' to verify infrastructure protocols if unclear.
  2. Calculate ROI, Radar Metrics, and Decision Logic.
  3. If score > 80, call 'trigger_n8n_signal' to provision the node.
  
  Return strictly in JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are the Flowgent AI Intelligence Layer. Your goal is to maximize ROI for founders by identifying digital infrastructure gaps and automating outreach through InsForge and n8n.",
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
    console.error("Audit Engine Critical Failure:", error);
    return { audit: getSimulatedAudit() };
  }
};

const getSimulatedAudit = (): AuditResult => ({
  summary: "Continuity Mode: Neural link established, using localized intelligence cache.",
  gaps: ["External API latency", "Infrastructure handshake pending"],
  recommendations: ["Manually sync InsForge project secrets"],
  score: 72,
  radar_metrics: { presence: 50, automation: 30, seo: 40, capture: 20 },
  decision_logic: [{ factor: "Continuity Check", impact: "high", reasoning: "AI is running in standalone mode due to project node status." }]
});

export const searchLocalBusinesses = async (query: string, lat?: number, lng?: number) => {
  const ai = getAI();
  if (!ai) return [];
  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-lite-latest",
      contents: `Find 5 prime leads for "${query}" in India. Focus on high-intent businesses with digital gaps.`,
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
