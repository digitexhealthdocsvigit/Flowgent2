import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";

/**
 * FLOWGENT AGENT ZERO: COMPLETE AUTONOMOUS SYSTEM
 */

// FUZZY CODE - Works with ANY environment variable names
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.INSFORGE_URL || "https://jsk8snxz.ap-southeast.insforge.app";
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.INSFORGE_API_KEY || process.env.INSFORGE_APT_KEY || "ik_2ef615853868d11f26c1b6a8cd7550ad";
const GEMINI_API_KEY = process.env.API_KEY || process.env.GEMINI_API_KEY || process.env.GEMTNT_APT_KEY || "YOUR_GEMINI_API_KEY_HERE";
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL || "300") * 1000;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const log = (...args) => console.log(`[AgentZero]`, new Date().toISOString(), ...args);

async function runAgent() {
  try {
    log("🔍 Polling new leads from InsForge...");
    
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
      log("✅ No new leads to process.");
      return;
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    for (const lead of leads) {
      log(`📝 Processing: ${lead.business_name}`);
      
      let readiness_score = 50;
      let ai_insights = "";
      
      try {
        const prompt = `Rate this business's digital readiness (0-100):
        Business: ${lead.business_name}
        Category: ${lead.category || 'Unknown'}
        Has Website: ${lead.has_website ? 'Yes' : 'No'}
        
        Format: SCORE: [number] | INSIGHTS: [text]`;
        
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
        });
        
        const text = response.text || "";
        const match = text.match(/SCORE:\s*(\d+)/i);
        readiness_score = match ? parseInt(match[1], 10) : 50;
        ai_insights = text;
        
        log(`🤖 Score: ${readiness_score}/100`);
      } catch (err) {
        log("⚠️ AI error:", err.message);
      }

      const temperature = readiness_score >= 80 ? 'hot' : (readiness_score >= 50 ? 'warm' : 'cold');
      
      const { error: updateError } = await supabase.from("leads").update({
        ai_audit_completed: true,
        readiness_score: readiness_score,
        is_hot_opportunity: readiness_score >= 80,
        temperature: temperature,
        ai_insights: ai_insights,
        updated_at: new Date().toISOString()
      }).eq("id", lead.id);

      if (updateError) {
        log("❌ Update error:", updateError.message);
      } else {
        log(`✅ Updated: ${lead.business_name} (${readiness_score} - ${temperature})`);
        
        if (readiness_score >= 80) {
          log(`🔥 HOT LEAD: ${lead.business_name} - Score: ${readiness_score}`);
        }
      }
    }
  } catch (err) {
    log("❌ System error:", err.message);
  }
}

log("🚀 Flowgent Agent Zero initialized with FUZZY variables");
log(`📊 Polling every ${POLL_INTERVAL / 1000} seconds`);

runAgent();
setInterval(runAgent, POLL_INTERVAL);
