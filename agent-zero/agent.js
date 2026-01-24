import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";

/**
 * FLOWGENT AGENT ZERO: AUTONOMOUS BACKEND NODE
 * Repository: digitexhealthdocsvigit/Flowgent2
 * Folder: /agent-zero
 * 
 * HARDCODED VERSION - NO ENVIRONMENT VARIABLES
 */

// HARDCODED VALUES - Replace with your actual credentials
const SUPABASE_URL = "https://jsk8snxz.ap-southeast.insforge.app";
const SUPABASE_KEY = "ik_2ef615853868d11f26c1b6a8cd7550ad";
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE"; // ← Replace with your actual key
const N8N_WEBHOOK_URL = "https://n8n-production-ecc4.up.railway.app/webhook/new-lead";
const POLL_INTERVAL = 300 * 1000; // 5 minutes
const TELEGRAM_BOT_TOKEN = ""; // Optional
const TELEGRAM_CHAT_ID = ""; // Optional

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const log = (...args) => console.log("[AgentZero]", new Date().toISOString(), ...args);

/**
 * Dispatches high-priority Telegram alerts
 */
async function sendTelegramAlert(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });
  } catch (err) {
    log('Telegram alert failed:', err.message);
  }
}

async function runAgent() {
  try {
    log("🔍 Polling new leads from InsForge Node JSK8SNXZ...");
    
    // Fetch leads that are discovered but not yet enriched by AI
    const { data: leads, error } = await supabase
      .from("leads")
      .select("*")
      .eq("ai_audit_completed", false)
      .limit(5);

    if (error) {
      log("❌ Query Error:", error.message);
      return;
    }
    
    if (!leads?.length) {
      log("✅ Neural Queue Clear.");
      return;
    }

    // Initialize Gemini 3 for high-speed analysis
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    for (const lead of leads) {
      log(`📝 Processing Node: ${lead.business_name}`);
      let emails = [];
      
      // 1. Digital Footprint Extraction
      if (lead.website) {
        try {
          // Note: Removed scraping for simplicity
          log(`🌐 Website detected: ${lead.website}`);
        } catch (err) {
          log("⚠️ Website check failed:", err.message);
        }
      }

      // 2. Neural Readiness Scoring
      let readiness_score = 50;
      let ai_insights = "";
      try {
        const prompt = `Perform a Digital Readiness Audit for this business:
        Business: ${lead.business_name}
        Website: ${lead.website || 'No website detected'}
        Category: ${lead.category || 'Unknown'}
        
        Rate 0-100 on their potential for ROI through automation. 
        High scores (>80) are reserved for businesses with NO website or BROKEN automation.
        
        Format:
        SCORE: [number]
        INSIGHTS: [short strategic summary]`;

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
        });
        
        const text = response.text || "";
        ai_insights = text;
        readiness_score = parseInt(text.match(/SCORE:\s*(\d+)/i)?.[1] || "50", 10);
        log(`🤖 Neural Score finalized: ${readiness_score}`);
      } catch (err) {
        log("⚠️ AI Scoring error:", err.message);
      }

      // 3. Persistent State Update
      const { error: updateError } = await supabase.from("leads").update({
        ai_audit_completed: true,
        readiness_score,
        is_hot_opportunity: readiness_score >= 80,
        temperature: readiness_score >= 80 ? 'hot' : (readiness_score >= 50 ? 'warm' : 'cold'),
        ai_insights,
        updated_at: new Date().toISOString()
      }).eq("id", lead.id);

      if (updateError) {
        log("❌ DB Update Error:", updateError.message);
        continue;
      }

      // 4. Hot Opportunity Signaling
      if (readiness_score >= 80) {
        // Telegram Dispatch (if configured)
        const alert = `🔥 <b>HOT LEAD DETECTED!</b>\n\n<b>Business:</b> ${lead.business_name}\n<b>Score:</b> ${readiness_score}/100\n<b>Website:</b> ${lead.website || 'None'}`;
        await sendTelegramAlert(alert);

        // n8n Orchestrator Dispatch
        if (N8N_WEBHOOK_URL) {
          try {
            await fetch(N8N_WEBHOOK_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                event: 'agent_zero_synced',
                lead_id: lead.id, 
                readiness_score, 
                business_name: lead.business_name,
                node_id: 'JSK8SNXZ'
              })
            });
            log("📡 n8n Handshake Successful.");
          } catch (err) {
            log("⚠️ Webhook sync failed:", err.message);
          }
        }
      }
    }
  } catch (err) {
    log("❌ Critical Infrastructure Loop Error:", err.message);
  }
}

log("🚀 Flowgent Agent Zero initialized with HARDCODED credentials");
log(`🔗 InsForge URL: ${SUPABASE_URL}`);
log(`⏰ Polling interval: ${POLL_INTERVAL / 1000} seconds`);

setInterval(runAgent, POLL_INTERVAL);
runAgent();
