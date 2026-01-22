import fetch from "node-fetch";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL || "300") * 1000;

// Initialize Gemini SDK
// Note: Using process.env.API_KEY as per standard platform rules
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY });

const log = (...args) => console.log("[AgentZero]", new Date().toISOString(), ...args);

async function runAgent() {
  try {
    log("Polling new leads...");
    const { data: leads, error } = await supabase
      .from("leads")
      .select("*")
      .eq("enriched", false)
      .limit(5);
      
    if (error) throw error;
    if (!leads?.length) return log("No new leads found.");

    for (const lead of leads) {
      log(`Processing lead: ${lead.business_name || lead.name}`);
      let emails = [];
      
      // 1. Scraping Logic
      if (lead.website) {
        try {
          const scrapeUrl = `https://api.scrapingdog.com/scrape?api_key=${process.env.SCRAPINGDOG_API_KEY}&url=${encodeURIComponent(lead.website)}`;
          const response = await fetch(scrapeUrl);
          const html = await response.text();
          // Simple regex to find emails in HTML
          const emailMatches = html.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g);
          emails = [...new Set(emailMatches || [])];
          log(`Found ${emails.length} emails.`);
        } catch (err) {
          log("Scrapingdog error:", err.message);
        }
      }

      // 2. AI Scoring Logic
      let readiness_score = lead.readiness_score || 0;
      try {
        const prompt = `Rate this business lead from 0–100 for sales readiness based on the following data. 
        Higher scores indicate a clear need for digital automation or website development.
        
        Business Name: ${lead.business_name}
        Website: ${lead.website || 'None'}
        Captured Emails: ${emails.join(", ") || "None"}
        Category: ${lead.category || 'Unknown'}
        
        Return ONLY the numeric score between 0 and 100.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
        });
        
        const text = response.text || "50";
        const num = parseInt(text.match(/\d+/)?.[0] || "50", 10);
        readiness_score = Math.min(Math.max(num, 0), 100);
        log(`Neural readiness score: ${readiness_score}`);
      } catch (err) {
        log("Gemini scoring error:", err.message);
      }

      // 3. Update Database
      await supabase.from("leads").update({
        enriched: true,
        emails,
        readiness_score,
        updated_at: new Date().toISOString()
      }).eq("id", lead.id);

      // 4. Trigger Orchestrator
      if (N8N_WEBHOOK_URL) {
        try {
          await fetch(N8N_WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              event: 'agent_zero_enrichment',
              lead_id: lead.id, 
              readiness_score, 
              emails, 
              business_name: lead.business_name 
            })
          });
          log("Orchestrator signal dispatched.");
        } catch (err) {
          log("Webhook signal error:", err.message);
        }
      }
    }
  } catch (err) {
    log("Infrastructure loop error:", err.message);
  }
}

log("Flowgent Agent Zero: Operational. Polling interval set to " + (POLL_INTERVAL/1000) + "s");
setInterval(runAgent, POLL_INTERVAL);
// Initial run
runAgent();
