import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from "@google/generative-ai";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://jsk8snxz.ap-southeast.insforge.app";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || "ik_2ef615853868d11f26c1b6a8cd7550ad";
const GEMINI_API_KEY = process.env.API_KEY || "AIzaSyBPs2T-1zpAo1q_huSx4dOt-CB-aPwPCmY";
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL || "300") * 1000;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
});

const log = (...args) => console.log("[AgentZero]", new Date().toISOString(), ...args);

async function testConnection() {
  try {
    log("🔧 Testing database connection...");
    const { count, error } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      log("❌ Connection test failed:", error.message);
      return false;
    }
    
    log(`✅ Connection successful - ${count} total leads in database`);
    return true;
  } catch (err) {
    log("❌ Connection error:", err.message);
    return false;
  }
}

async function runAgent() {
  try {
    log("🔍 Querying unprocessed leads...");
    
    const { data: leads, error } = await supabase
      .from('leads')
      .select('*')
      .eq('ai_audit_completed', false)
      .limit(5);
    
    if (error) {
      log("❌ Query error:", error.message);
      return;
    }
    
    if (!leads || leads.length === 0) {
      log("✅ No new leads to process");
      return;
    }
    
    log(`📊 Found ${leads.length} leads to process`);
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    for (const lead of leads) {
      log(`📝 Processing: ${lead.business_name} (${lead.city || 'Unknown'})`);
      
      let readiness_score = 50;
      let ai_insights = "";
      
      try {
        const prompt = `Rate this business's digital readiness on a scale of 0-100:
Business: ${lead.business_name}
Category: ${lead.category || 'Unknown'}
City: ${lead.city || 'Unknown'}
Has Website: ${lead.has_website ? 'Yes' : 'No'}

Provide ONLY a number between 0-100 and a brief 1-sentence insight.`;
        
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        const match = text.match(/\b(\d{1,3})\b/);
        readiness_score = match ? parseInt(match[1], 10) : 50;
        readiness_score = Math.min(100, Math.max(0, readiness_score));
        ai_insights = text.substring(0, 300).trim() || "Analysis completed.";
        
        log(`🤖 AI Score: ${readiness_score}/100`);
      } catch (err) {
        log(`⚠️ AI error for ${lead.business_name}:`, err.message);
        ai_insights = "AI analysis temporarily unavailable.";
      }
      
      const temperature = readiness_score >= 80 ? "hot" : 
                         readiness_score >= 50 ? "warm" : "cold";
      const is_hot_opportunity = readiness_score >= 80;
      
      const projected_roi_lift = Math.floor(readiness_score * 1.2);
      const est_contract_value = temperature === "hot" ? 10000 : 
                                 temperature === "warm" ? 5000 : 2000;
      
      const { error: updateError } = await supabase
        .from('leads')
        .update({
          ai_audit_completed: true,
          readiness_score: readiness_score,
          is_hot_opportunity: is_hot_opportunity,
          temperature: temperature,
          ai_insights: ai_insights,
          projected_roi_lift: projected_roi_lift,
          est_contract_value: est_contract_value,
          updated_at: new Date().toISOString()
        })
        .eq('id', lead.id);
      
      if (updateError) {
        log(`❌ Failed to update ${lead.business_name}:`, updateError.message);
      } else {
        log(`✅ Updated: ${lead.business_name} → ${readiness_score}/100 (${temperature})`);
        
        if (is_hot_opportunity) {
          log(`🔥 HOT LEAD ALERT! ${lead.business_name} - Score: ${readiness_score}`);
          log(`   💰 Estimated Monthly Value: ₹${est_contract_value}`);
        }
      }
    }
    
    log("🎉 Processing cycle complete");
    
  } catch (err) {
    log("❌ System error:", err.message);
  }
}

async function initialize() {
  log("🚀 Flowgent Agent Zero - Supabase Edition");
  log(`⏰ Polling interval: ${POLL_INTERVAL / 1000} seconds`);
  log(`🔑 Gemini API Key: ${GEMINI_API_KEY.substring(0, 10)}...`);
  log(`🗄️ Database URL: ${SUPABASE_URL}`);
  
  const connected = await testConnection();
  
  if (connected) {
    log("▶️ Running initial scan...");
    await runAgent();
    log(`⏱️ Next scan in ${POLL_INTERVAL / 1000} seconds`);
    setInterval(runAgent, POLL_INTERVAL);
  } else {
    log("⚠️ Initial connection failed. Retrying every 5 minutes...");
    setInterval(async () => {
      const retryConnected = await testConnection();
      if (retryConnected) {
        await runAgent();
      }
    }, POLL_INTERVAL);
  }
}

initialize().catch(error => {
  log("💥 Fatal initialization error:", error.message);
  process.exit(1);
});
