import fetch from "node-fetch";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Try different URL formats - one of these should work
const INSFORGE_URLS = [
  "https://jsk8snxz.ap-southeast.insforge.app",
  "https://jsk8snxz.ap-southeast.insforge.app/rest/v1",
  "https://jsk8snxz.ap-southeast.insforge.app/api"
];

const INSFORGE_KEY = "ik_2ef615853868d11f26c1b6a8cd7550ad";
const GEMINI_API_KEY = "AIzaSyBPs2T-1zpAo1q_huSx4dOt-CB-aPwPCmY";
const POLL_INTERVAL = 300000; // 5 minutes

const log = (...args) => console.log("[AgentZero]", new Date().toISOString(), ...args);

// Test ALL possible URL combinations
async function testAllConnections() {
  log("🔧 Testing all possible InsForge connections...");
  
  const testEndpoints = [
    "/",
    "/rest/v1/",
    "/rest/v1/leads?select=count",
    "/leads?select=count"
  ];
  
  for (const baseUrl of INSFORGE_URLS) {
    for (const endpoint of testEndpoints) {
      const testUrl = baseUrl + endpoint;
      try {
        log(`📡 Testing: ${testUrl}`);
        
        const response = await fetch(testUrl, {
          headers: {
            'apikey': INSFORGE_KEY,
            'Authorization': `Bearer ${INSFORGE_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        });
        
        const status = response.status;
        log(`   Status: ${status} ${response.statusText}`);
        
        if (response.ok) {
          const data = await response.text();
          log(`   ✅ SUCCESS with: ${baseUrl + endpoint}`);
          return { baseUrl, endpoint };
        }
      } catch (error) {
        log(`   ❌ Error: ${error.message}`);
      }
    }
  }
  
  return null;
}

async function getWorkingConnection() {
  // Try environment variables first
  const envUrl = process.env.SUPABASE_URL;
  if (envUrl) {
    log(`⚙️ Using environment URL: ${envUrl}`);
    return envUrl;
  }
  
  // Test all connections
  const working = await testAllConnections();
  if (working) {
    log(`🎯 Using working URL: ${working.baseUrl}`);
    return working.baseUrl;
  }
  
  // Fallback to first URL
  log(`⚠️ No connection worked, using fallback: ${INSFORGE_URLS[0]}`);
  return INSFORGE_URLS[0];
}

async function queryInsForge(table, filters = {}) {
  const baseUrl = await getWorkingConnection();
  const params = new URLSearchParams({ select: '*', limit: '5' });
  
  Object.entries(filters).forEach(([key, value]) => {
    params.append(key, `eq.${value}`);
  });
  
  const url = `${baseUrl}/${table}?${params.toString()}`;
  log(`🔍 Querying: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'apikey': INSFORGE_KEY,
        'Authorization': `Bearer ${INSFORGE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    log(`📊 Query successful, found ${data.length} records`);
    return data;
  } catch (error) {
    log(`❌ Query failed: ${error.message}`);
    throw error;
  }
}

async function updateInsForge(table, id, updates) {
  const baseUrl = await getWorkingConnection();
  const url = `${baseUrl}/${table}?id=eq.${id}`;
  
  log(`✏️ Updating: ${url}`);
  
  try {
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
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    log(`✅ Update successful for ID: ${id}`);
    return await response.json();
  } catch (error) {
    log(`❌ Update failed: ${error.message}`);
    throw error;
  }
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
    
    Provide ONLY a number between 0-100 and brief insights. Example: "85 - This business shows strong potential with good online presence"`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    // Extract score (look for patterns like "85" or "Score: 85")
    const match = text.match(/\b(\d{1,3})\b/);
    const readiness_score = match ? parseInt(match[1], 10) : 50;
    
    // Ensure score is between 0-100
    const clampedScore = Math.min(100, Math.max(0, readiness_score));
    
    const ai_insights = text.substring(0, 300).trim();
    
    log(`🤖 AI Score: ${lead.business_name} → ${clampedScore}/100`);
    
    return {
      readiness_score: clampedScore,
      ai_insights: ai_insights || "AI analysis completed.",
      temperature: clampedScore >= 80 ? "hot" : clampedScore >= 50 ? "warm" : "cold",
      is_hot_opportunity: clampedScore >= 80
    };
  } catch (error) {
    log("⚠️ AI processing error:", error.message);
    return {
      readiness_score: 50,
      ai_insights: "AI analysis unavailable.",
      temperature: "cold",
      is_hot_opportunity: false
    };
  }
}

async function runAgent() {
  try {
    log("🚀 Starting agent cycle...");
    
    // Test connection first
    const baseUrl = await getWorkingConnection();
    log(`🔗 Connected to: ${baseUrl}`);
    
    // Get unprocessed leads
    const leads = await queryInsForge('leads', { ai_audit_completed: false });
    
    if (!leads || leads.length === 0) {
      log("✅ No new leads to process");
      return;
    }
    
    log(`🎯 Processing ${leads.length} leads`);
    
    for (const lead of leads) {
      log(`📝 Lead: ${lead.business_name} (${lead.city})`);
      
      const aiResults = await processLeadWithAI(lead);
      
      // Calculate business metrics
      const projected_roi_lift = Math.floor(aiResults.readiness_score * 1.5);
      const est_contract_value = aiResults.temperature === "hot" ? 10000 : 
                                aiResults.temperature === "warm" ? 5000 : 2000;
      
      const recommended_services = aiResults.readiness_score >= 80 ? 
        ["Full Digital Transformation", "AI Automation", "Analytics Dashboard"] :
        aiResults.readiness_score >= 50 ?
        ["Website + SEO", "Social Media Management", "Google Business"] :
        ["Basic Website", "Online Presence Setup", "Digital Foundation"];
      
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
        await updateInsForge('leads', lead.id, updates);
        log(`✅ Updated: ${lead.business_name} → ${aiResults.readiness_score}/100 (${aiResults.temperature})`);
        
        if (aiResults.is_hot_opportunity) {
          log(`🔥 HOT LEAD! ${lead.business_name} - Score: ${aiResults.readiness_score}`);
          log(`💰 Estimated Value: ₹${est_contract_value}/month`);
        }
      } catch (updateError) {
        log(`❌ Failed to update ${lead.business_name}:`, updateError.message);
      }
    }
    
    log("🎉 Processing complete!");
    
  } catch (error) {
    log("❌ Agent cycle failed:", error.message);
  }
}

// Initialize and run
log("🚀 Flowgent Agent Zero v2.0");
log(`⏰ Polling interval: ${POLL_INTERVAL / 1000} seconds`);
log(`🔑 Using API Key: ${GEMINI_API_KEY.substring(0, 10)}...`);

// Run immediately
runAgent();

// Then run every interval
setInterval(runAgent, POLL_INTERVAL);

// Add error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  log("💥 Uncaught Exception:", error.message);
});

process.on('unhandledRejection', (reason, promise) => {
  log("⚠️ Unhandled Rejection at:", promise, "reason:", reason);
});
