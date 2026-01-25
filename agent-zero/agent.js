
import fetch from "node-fetch";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

/**
 * FLOWGENT AGENT ZERO: AUTONOMOUS BACKEND NODE
 * Project Node: JSK8SNXZ
 * Resolves 404 errors by sanitizing the API endpoint URL.
 */

// Resilient variable mapping to handle Railway naming variations
const rawUrl = process.env.SUPABASE_URL || process.env.INSFORGE_URL || "https://jsk8snxz.ap-southeast.insforge.app";
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, ''); // Strip rest/v1 to prevent SDK doubling
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.INSFORGE_API_KEY || process.env.INSFORGE_APT_KEY || "ik_2ef615853868d11f26c1b6a8cd7550ad";
const geminiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || process.env.GEMTNT_APT_KEY;

const log = (...args) => console.log("[AgentZero]", new Date().toISOString(), ...args);

// Validation Check before initialization
if (!supabaseUrl || !supabaseKey) {
  log("❌ CRITICAL: Database credentials missing.");
  log("Ensure SUPABASE_URL and SUPABASE_SERVICE_KEY are set in Railway.");
  process.exit(1); 
}

const supabase = createClient(supabaseUrl, supabaseKey);

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || process.env.NBN_WEBHOOK_URL;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL || "300") * 1000;

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
    log("🔍 Polling leads from InsForge Node JSK8SNXZ...");
    
    const { data: leads, error } = await supabase
      .from("leads")
      .select("*")
      .eq("ai_audit_completed", false)
      .limit(5);

    if (error) {
      log("❌ Query Error:", error.message);
      if (error.message.includes('leads')) {
        log("💡 Recommendation: Run the leads table migration SQL in InsForge Dashboard.");
      }
      return;
    }
    
    if (!leads?.length) {
      log("✅ Neural Queue Clear.");
      return;
    }

    if (!geminiKey) {
      log("⚠️ AI Scoring skipped: GEMINI_API_KEY not found.");
      return;
    }

    const ai = new GoogleGenAI({ apiKey: geminiKey });

    for (const lead of leads) {
      log(`📝 Processing Node: ${lead.business_name}`);
      
      // Neural Readiness Scoring
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

      // Persistent State Update
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

      // Hot Opportunity Signaling
      if (readiness_score >= 80) {
        const alert = `🔥 <b>HOT LEAD DETECTED!</b>\n\n<b>Business:</b> ${lead.business_name}\n<b>Score:</b> ${readiness_score}/100\n<b>Website:</b> ${lead.website || 'None'}`;
        await sendTelegramAlert(alert);

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

log(`🚀 Agent Zero operational on Node JSK8SNXZ (URL: ${supabaseUrl})`);
setInterval(runAgent, POLL_INTERVAL);
runAgent();
