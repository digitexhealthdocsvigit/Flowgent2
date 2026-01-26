import fetch from "node-fetch";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

/**
 * FLOWGENT AGENT ZERO: AUTONOMOUS BACKEND NODE
 * Project Node: JSK8SNXZ
 * Handshake Layer for OpenAI/Gemini Intelligence
 */

const supabaseUrl = process.env.SUPABASE_URL || "https://jsk8snxz.ap-southeast.insforge.app";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || "ik_2ef615853868d11f26c1b6a8cd7550ad";
const geminiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

const log = (...args) => console.log("[AgentZero]", new Date().toISOString(), ...args);

if (!supabaseUrl || !supabaseKey) {
  log("❌ CRITICAL: Infrastructure credentials missing.");
  process.exit(1); 
}

const supabase = createClient(supabaseUrl, supabaseKey);
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL || "300") * 1000;

async function runAgent() {
  try {
    log("🔍 Syncing with JSK8SNXZ cluster...");
    
    const { data: leads, error } = await supabase
      .from("leads")
      .select("*")
      .eq("ai_audit_completed", false)
      .limit(5);

    if (error) {
      log("❌ Handshake Error:", error.message);
      return;
    }
    
    if (!leads?.length) {
      log("✅ Node Queue Clear.");
      return;
    }

    if (!geminiKey) {
      log("⚠️ Neural Scorer Offline: API_KEY missing.");
      return;
    }

    const ai = new GoogleGenAI({ apiKey: geminiKey });

    for (const lead of leads) {
      log(`📝 Analyzing Node: ${lead.business_name}`);
      
      let readiness_score = 50;
      let ai_insights = "";
      
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Audit Business: ${lead.business_name}. Digital Readiness Score (0-100).`,
          config: { thinkingConfig: { thinkingBudget: 0 } }
        });
        
        const text = response.text || "Score: 50";
        ai_insights = text;
        readiness_score = parseInt(text.match(/\d+/)?.[0] || "50", 10);
        log(`🤖 Score Optimized: ${readiness_score}`);
      } catch (err) {
        log("⚠️ AI Engine Error:", err.message);
      }

      const { error: updateError } = await supabase.from("leads").update({
        ai_audit_completed: true,
        readiness_score,
        is_hot_opportunity: readiness_score >= 80,
        temperature: readiness_score >= 80 ? 'hot' : 'warm',
        ai_insights,
        updated_at: new Date().toISOString()
      }).eq("id", lead.id);

      if (updateError) log("❌ Persistence Failure:", updateError.message);
    }
  } catch (err) {
    log("❌ Critical Infrastructure Loop Error:", err.message);
  }
}

log(`🚀 Agent Zero operational on Node JSK8SNXZ`);
runAgent();
setInterval(runAgent, POLL_INTERVAL);