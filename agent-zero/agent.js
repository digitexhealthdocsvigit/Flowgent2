import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";

const SUPABASE_URL = "https://jsk8snxz.ap-southeast.insforge.app";
const SUPABASE_KEY = "ik_2ef615853868d11f26c1b6a8cd7550ad";
const GEMINI_API_KEY = "AIzaSyBPs2T-1zpAo1q_huSx4dOt-CB-aPwPCmY";
const POLL_INTERVAL = 300000;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
  db: { schema: 'public' }
});

const log = (...args) => console.log("[AgentZero]", new Date().toISOString(), ...args);

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
        const prompt = `Rate this business digital readiness 0-100: ${lead.business_name}, ${lead.category}, Has website: ${lead.has_website}`;
        
        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: prompt,
        });
        
        const text = response.text || "";
        const match = text.match(/(\d+)\/100|Score:\s*(\d+)/i);
        readiness_score = match ? parseInt(match[1] || match[2], 10) : 50;
        ai_insights = text.substring(0, 500);
        
        log(`🤖 Score: ${readiness_score}/100`);
      } catch (err) {
        log("⚠️ AI error:", err.message);
        readiness_score = 50;
      }

      const temperature = readiness_score >= 80 ? "hot" : readiness_score >= 50 ? "warm" : "cold";
      
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

log("🚀 Flowgent Agent Zero initialized");
log(`⏰ Polling every ${POLL_INTERVAL / 1000} seconds`);

runAgent();
setInterval(runAgent, POLL_INTERVAL);
