
import fetch from "node-fetch";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

/**
 * FLOWGENT AGENT ZERO: AUTONOMOUS BACKEND NODE
 * Repository: digitexhealthdocsvigit/flowgent-agentzero
 */

const supabase = createClient(
  process.env.SUPABASE_URL || "", 
  process.env.SUPABASE_SERVICE_KEY || ""
);

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL || "300") * 1000;

const log = (...args) => console.log("[AgentZero]", new Date().toISOString(), ...args);

async function runAgent() {
  try {
    log("Polling new lead nodes for neural enrichment...");
    
    const { data: leads, error } = await supabase
      .from("leads")
      .select("*")
      .eq("enriched", false)
      .limit(5);

    if (error) throw error;
    if (!leads?.length) return log("Infrastructure idle. Queue clear.");

    // Initialize AI right before use
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

    for (const lead of leads) {
      log(`Processing node: ${lead.business_name || lead.name}`);
      let emails = [];
      
      if (lead.website && process.env.SCRAPINGDOG_API_KEY) {
        try {
          const scrapeUrl = `https://api.scrapingdog.com/scrape?api_key=${process.env.SCRAPINGDOG_API_KEY}&url=${encodeURIComponent(lead.website)}`;
          const response = await fetch(scrapeUrl);
          const html = await response.text();
          const matches = html.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g);
          emails = [...new Set(matches || [])];
        } catch (err) {
          log("Scraping failure:", err.message);
        }
      }

      let readiness_score = 50;
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Rate this business lead from 0–100 for digital automation readiness. 
          Return ONLY the numeric score.
          Business: ${lead.business_name}
          Website: ${lead.website || 'None'}
          Category: ${lead.category || 'Unknown'}`,
          config: {
            thinkingConfig: { thinkingBudget: 0 }
          }
        });
        
        const text = response.text || "50";
        readiness_score = parseInt(text.match(/\d+/)?.[0] || "50", 10);
      } catch (err) {
        log("Neural scoring error:", err.message);
      }

      await supabase.from("leads").update({
        enriched: true,
        emails,
        readiness_score,
        updated_at: new Date().toISOString()
      }).eq("id", lead.id);

      if (N8N_WEBHOOK_URL) {
        await fetch(N8N_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            event: 'agent_zero_synced',
            lead_id: lead.id, 
            readiness_score, 
            node_id: 'JSK8SNXZ'
          })
        }).catch(err => log("Webhook sync error:", err.message));
      }
    }
  } catch (err) {
    log("Critical Infrastructure Loop Error:", err.message);
  }
}

log("Flowgent Agent Zero operational. Interval: " + (POLL_INTERVAL/1000) + "s");
setInterval(runAgent, POLL_INTERVAL);
runAgent();
