
import { GoogleGenAI, Type } from "@google/genai";
import { AuditResult } from "../types";

const API_KEY = process.env.API_KEY || "";

export const generateAudit = async (businessName: string, websiteUrl: string): Promise<AuditResult> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const prompt = `Act as a senior business automation consultant. Perform a digital audit for "${businessName}" at "${websiteUrl}". 
  Provide a detailed summary of their potential online gaps (no website, poor SEO, no booking system, slow performance) and specific recommendations for automation (CRM, AI Chatbots, Automated Follow-ups).
  Return the response in a structured JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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

    const result = JSON.parse(response.text);
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
  const ai = new GoogleGenAI({ apiKey: API_KEY });
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
