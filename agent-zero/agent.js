import fetch from "node-fetch";
import { GoogleGenerativeAI } from "@google/generative-ai";

const INSFORGE_URL = "https://jsk8snxz.ap-southeast.insforge.app";
const INSFORGE_KEY = "ik_2ef615853868d11f26c1b6a8cd7550ad";
const GEMINI_API_KEY = "AIzaSyBPs2T-1zpAo1q_huSx4dOt-CB-aPwPCmY";
const POLL_INTERVAL = 300000; // 5 minutes

const log = (...args) => console.log("[AgentZero]", new Date().toISOString(), ...args);

// Simple function to test InsForge connection
async function testConnection() {
  try {
    const testUrl = `${INSFORGE_URL}/rest/v1/leads?select=count`;
    log(`🔧 Testing: ${testUrl}`);
    
    const response = await fetch(testUrl, {
      headers: {
        'apikey': INSFORGE_KEY,
        'Authorization': `Bearer ${INSFORGE_KEY}`
      }
    });
    
    if (response.ok) {
      log("✅ InsForge connection successful");
      return true;
    }
    return false;
  } catch (error) {
    log("❌ Connection test failed:", error.message);
    return false;
  }
}

async function getUnprocessedLeads() {
  const url = `${INSFORGE_URL}/rest/v1/leads?ai_audit_completed=eq.false&select=*&limit=5`;
  
  log(`📡 Fetching from: ${url}`);
  
  const response = await fetch(url, {
    headers: {
      'apikey': INSFORGE_KEY,
      'Authorization': `Bearer ${INSFORGE_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch leads: ${response.status} - ${text}`);
  }
  
  return await response.json();
}

async function updateLead(leadId, updates) {
  const url = `${INSFORGE_URL}/rest/v1/leads?id=eq.${leadId}`;
  
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'apikey': INSFORGE_KEY,
      'Authorization': `Bearer ${INSFORGE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(updates)
  });
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to update lead: ${response.status} - ${text}`);
  }
  
  return await response.json();
}

async function processLeadWithAI(lead) {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  try {
    const prompt = `Rate this business digital readiness 0-100: 
    Business: ${lead.business_name}
    Category: ${lead.category || 'Unknown'}
    City: ${lead.city || 'Unknown'}
    Has Website: ${lead.has_website ? 'Yes' : 'No'}
    
    Provide a score and brief insights.`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Extract score (look for patterns like "85/100" or "Score: 85")
    const match = text.match(/(\d+)\/100|Score:\s*(\d+)/i);
    const readiness_score = match ? parseInt(match[1] || match[2], 10) : 50;
    
    // Clean insights text
    const ai_insights = text.substring(0, 500).trim();
    
    log(`🤖 AI Score for ${lead.business_name}: ${readiness_score}/100`);
    
    return {
      readiness_score,
      ai_insights,
      temperature: readiness_score >= 80 ? "hot" : readiness_score >= 50 ? "warm" : "cold",
      is_hot_opportunity: readiness_score >= 80
    };
  } catch (error) {
    log("⚠️ AI processing error:", error.message);
    return {
      readiness_score: 50,
      ai_insights: "AI analysis failed",
      temperature: "cold",
      is_hot_opportunity: false
    };
  }
}

async function runAgent() {
  try {
    log("🔍 Checking for new leads...");
    
    // Test connection first
    const connected = await testConnection();
    if (!connected) {
      log("⚠️ Skipping this cycle - InsForge not reachable");
      return;
    }
    
    const leads = await getUnprocessedLeads();
    
    if (!leads || leads.length === 0) {
      log("✅ No new leads to process");
      return;
    }
    
    log(`📊 Found ${leads.length} leads to process`);
    
    for (const lead of leads) {
      log(`📝 Processing: ${lead.business_name}`);
      
      const aiResults = await processLeadWithAI(lead);
      
      // Calculate business value estimates
      const projected_roi_lift = Math.floor(aiResults.readiness_score * 1.5);
      const est_contract_value = aiResults.temperature === "hot" ? 10000 : 
                                aiResults.temperature === "warm" ? 5000 : 2000;
      
      const recommended_services = aiResults.readiness_score < 30 ? 
        ["Basic Website", "Google Business Profile"] :
        aiResults.readiness_score < 70 ?
        ["Website + SEO", "Social Media Setup"] :
        ["Full Digital Transformation", "AI Automation"];
      
      const updates = {
        ai_audit_completed: true,
        readiness_score: aiResults.readiness_score,
        is_hot_opportunity: aiResults.is_hot_opportunity,
        temperature: aiResults.temperature,
        ai_insights: aiResults.ai_insights,
        recommended_services: recommended_services,
        projected_roi_lift: projected_roi_lift,
        est_contract_value: est_contract_value,
        updated_at: new Date().toISOString()
      };
      
      try {
        await updateLead(lead.id, updates);
        log(`✅ Updated: ${lead.business_name} (${aiResults.readiness_score} - ${aiResults.temperature})`);
        
        if (aiResults.is_hot_opportunity) {
          log(`🔥 HOT LEAD ALERT: ${lead.business_name} - Score: ${aiResults.readiness_score}`);
          log(`💰 Estimated Value: ₹${est_contract_value}/month`);
        }
      } catch (updateError) {
        log("❌ Failed to update lead:", updateError.message);
      }
    }
    
    log("🎯 Processing complete");
    
  } catch (error) {
    log("❌ Agent error:", error.message);
  }
}

// Main execution
log("🚀 Flowgent Agent Zero - Production Ready");
log(`⏰ Polling every ${POLL_INTERVAL / 1000} seconds`);

// Run immediately, then on interval
runAgent();
setInterval(runAgent, POLL_INTERVAL);
