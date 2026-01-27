
import fetch from "node-fetch";
import dotenv from "dotenv";
import { createClient } from "@insforge/sdk";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

/**
 * FLOWGENT AGENT ZERO: AUTONOMOUS BACKEND NODE
 * Repository: digitexhealthdocsvigit/flowgent-agentzero
 */

// Initialize InsForge client
const insforge = createClient({
  baseUrl: process.env.INSFORGE_API_BASE_URL || process.env.SUPABASE_URL || "",
  apiKey: process.env.INSFORGE_API_KEY || process.env.SUPABASE_SERVICE_KEY || ""
});

// Alias database client for compatibility
const db = insforge.database;

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL || "300") * 1000;

const log = (...args) => console.log("[AgentZero]", new Date().toISOString(), ...args);

async function runAgent() {
  try {
    log("Polling new lead nodes for neural enrichment...");
    
    const { data: leads, error } = await db
      .from("leads")
      .select("*")
      .eq("enriched", false)
      .limit(5);

    if (error) throw error;
    if (!leads?.length) return log("Infrastructure idle. Queue clear.");

    // Initialize AI right before use
    const geminiKey = process.env.GEMINI_API_KEY;
    const insforgeKey = process.env.INSFORGE_API_KEY || (process.env.API_KEY?.startsWith('ik_') ? process.env.API_KEY : null);
    
    let googleAI = null;

    if (geminiKey) {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      googleAI = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    } else if (!insforgeKey) {
      log("⚠️ AI Key missing. Skipping enrichment.");
      return;
    }

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
        let text = "50";
        const prompt = `Rate this business lead from 0–100 for digital automation readiness. 
          Return ONLY the numeric score.
          Business: ${lead.business_name}
          Website: ${lead.website || 'None'}
          Category: ${lead.category || 'Unknown'}`;

        if (googleAI) {
          const response = await googleAI.generateContent({
            contents: prompt,
            config: {
              thinkingConfig: { thinkingBudget: 0 }
            }
          });
          text = response.text || "50";
        } else {
          // Use InsForge AI
          const { data, error } = await insforge.ai.completion({
            model: 'gpt-3.5-turbo',
            prompt: prompt
          });
          if (error) throw error;
          // Assuming InsForge returns { choices: [{ message: { content: "..." } }] } or similar
          // If the SDK abstracts it to data.content, we might need to adjust.
          // Based on typical OpenAI proxies:
          text = data?.choices?.[0]?.message?.content || JSON.stringify(data);
        }
        
        readiness_score = parseInt(text.match(/\d+/)?.[0] || "50", 10);
      } catch (err) {
        log("Neural scoring error:", err.message);
      }

      await db.from("leads").update({
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
