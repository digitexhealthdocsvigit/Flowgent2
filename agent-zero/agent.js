import fetch from "node-fetch";
import { GoogleGenerativeAI } from "@google/generative-ai";

const INSFORGE_URL = process.env.SUPABASE_URL || "https://jsk8snxz.ap-southeast.insforge.app";
const INSFORGE_KEY = process.env.SUPABASE_SERVICE_KEY || "ik_2ef615853868d11f26c1b6a8cd7550ad";
const GEMINI_API_KEY = process.env.API_KEY || "AIzaSyBPs2T-1zpAo1q_huSx4dOt-CB-aPwPCmY";
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL || "300") * 1000;

const log = (...args) => console.log("[AgentZero]", new Date().toISOString(), ...args);

async function queryInsForge(table, filters = {}) {
  const params = new URLSearchParams({ select: '*', limit: '5' });
  
  Object.entries(filters).forEach(([key, value]) => {
    params.append(key, `eq.${value}`);
  });
  
  const url = `${INSFORGE_URL}/rest/v1/${table}?${params.toString()}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'apikey': INSFORGE_KEY,
      'Authorization': `Bearer ${INSFORGE_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Query failed: ${response.status} - ${text.substring(0, 200)}`);
  }
  
  return await response.json();
}

async function updateInsForge(table, id, data) {
  const url = `${INSFORGE_URL}/rest/v1/${table}?id=eq.${id}`;
  
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'apikey': INSFORGE_KEY,
      'Authorization': `Bearer ${INSFORGE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Update failed: ${response.status} - ${text.substring(0, 200)}`);
  }
  
  return await response.json();
}

async function runAgent() {
  try {
    log("🔍 Polling new leads from InsForge...");
    
    const leads = await queryInsForge('leads', { ai_audit_completed: false });
    
    if (!leads?.length) {
      log("✅ No new leads to process.");
      return;
    }

    log(`📊 Found ${leads.length} leads to process`);

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    for (const lead of leads) {
      log(`📝 Processing: ${lead.business_name}`);
      
      let readiness_score = 50;
      let ai_insights = "";
      
      try {
        const prompt = `Rate this business digital readiness 0-100: ${lead.business_name}, ${lead.category || 'Unknown'}, Has website: ${lead.has_website}`;
        
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        const match = text.match(/(\d+)\/100|Score:\s*(\d+)/i);
        readiness_score = match ? parseInt(match[1] || match[2], 10) : 50;
        ai_insights = text.substring(0, 500);
        
        log(`🤖 Score: ${readiness_score}/100`);
      } catch (err) {
        log("⚠️ AI error:", err.message);
        readiness_score = 50;
      }

      const temperature = readiness_score >= 80 ? "hot" : readiness_score >= 50 ? "warm" : "cold";
      
      try {
        await updateInsForge('leads', lead.id, {
          ai_audit_completed: true,
          readiness_score: readiness_score,
          is_hot_opportunity: readiness_score >= 80,
          temperature: temperature,
          ai_insights: ai_insights,
          updated_at: new Date().toISOString()
        });
        
        log(`✅ Updated: ${lead.business_name} (${readiness_score} - ${temperature})`);
        
        if (readiness_score >= 80) {
          log(`🔥 HOT LEAD: ${lead.business_name} - Score: ${readiness_score}`);
        }
      } catch (updateErr) {
        log("❌ Update error:", updateErr.message);
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
