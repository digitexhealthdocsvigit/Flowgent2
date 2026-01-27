// ================= AGENT ZERO - ES MODULE COMPATIBLE =================
import 'dotenv/config';
import https from 'https';

console.log("🚀 Flowgent Agent Zero - Production v2.0");
console.log("✅ Starting at:", new Date().toISOString());

// Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// Support both InsForge and Supabase variables, prioritizing InsForge
const DB_URL = process.env.INSFORGE_API_BASE_URL || process.env.SUPABASE_URL;
const DB_KEY = process.env.INSFORGE_API_KEY || process.env.SUPABASE_SERVICE_KEY;
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL || "300000");

const log = (...args) => console.log("[AgentZero]", new Date().toISOString(), ...args);

if (!OPENAI_API_KEY) {
  log("⚠️ OPENAI_API_KEY missing - AI features will be disabled");
  // process.exit(1); // Don't exit, allow running without AI for testing DB connection
}

log("✅ Config loaded");
log("🔑 OpenAI:", OPENAI_API_KEY ? "Present" : "Missing");
log("🗄️ Database:", DB_URL ? "Connected" : "Test Mode");
log("⏰ Interval:", POLL_INTERVAL / 60000, "minutes");

// HTTP client using native https module
async function fetchAPI(url, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const urlObj = new URL(url);
      
      const req = https.request({
        hostname: urlObj.hostname,
        port: urlObj.port || 443,
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: options.headers || {}
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ 
              ok: res.statusCode < 400, 
              status: res.statusCode,
              json: () => JSON.parse(data), 
              text: data 
            });
          } catch {
            resolve({ ok: res.statusCode < 400, status: res.statusCode, text: data });
          }
        });
      });
      
      req.on('error', reject);
      if (options.body) req.write(options.body);
      req.end();
    } catch (error) {
      reject(error);
    }
  });
}

// Database functions
async function getUnprocessedLeads() {
  if (!DB_URL || !DB_KEY) {
    log("⚠️ Running in test mode (No DB credentials)");
    return [
      { id: 1, business_name: "Perfect Gym Mumbai", category: "Fitness", has_website: false },
      { id: 2, business_name: "Spice Route Delhi", category: "Restaurant", has_website: true }
    ];
  }

  try {
    const response = await fetchAPI(
      `${DB_URL}/rest/v1/leads?select=*&ai_audit_completed=eq.false&limit=5`,
      {
        headers: {
          'apikey': DB_KEY,
          'Authorization': `Bearer ${DB_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      log("⚠️ Database query failed:", response.status, response.text ? response.text.substring(0, 100) : '');
      return [];
    }
    
    const leads = response.json();
    log(`📊 Found ${leads.length} unprocessed leads`);
    return leads;
  } catch (error) {
    log("⚠️ Database error:", error.message);
    return [];
  }
}

async function updateLead(leadId, data) {
  if (!DB_URL || !DB_KEY) {
    log(`✅ [TEST] Updated lead ${leadId}: Score ${data.score}/100`);
    return true;
  }

  try {
    const response = await fetchAPI(
      `${DB_URL}/rest/v1/leads?id=eq.${leadId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': DB_KEY,
          'Authorization': `Bearer ${DB_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          ai_audit_completed: true,
          readiness_score: data.score,
          temperature: data.temperature,
          is_hot_opportunity: data.score >= 80,
          ai_insights: data.insights,
          updated_at: new Date().toISOString()
        })
      }
    );

    return response.ok;
  } catch (error) {
    log("⚠️ Update failed:", error.message);
    return false;
  }
}

// OpenAI Analysis
async function analyzeWithOpenAI(business) {
  try {
    log(`🤖 Analyzing: ${business.business_name}`);
    
    const prompt = `Rate digital readiness 0-100 for: ${business.business_name}, ${business.category || 'Unknown'}, Website: ${business.has_website ? 'Yes' : 'No'}. Format: SCORE:[number] TEMP:[hot/warm/cold] INSIGHT:[brief]`;

    const response = await fetchAPI('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI error: ${response.status}`);
    }

    const data = response.json();
    const text = data.choices[0]?.message?.content || "";
    
    const scoreMatch = text.match(/SCORE:\s*(\d+)/i) || text.match(/(\d+)\/100/i);
    const tempMatch = text.match(/TEMP:\s*(\w+)/i);
    const insightMatch = text.match(/INSIGHT:\s*(.+)/i);
    
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;
    const temperature = tempMatch ? tempMatch[1].toLowerCase() : (score >= 80 ? 'hot' : score >= 50 ? 'warm' : 'cold');
    const insights = insightMatch ? insightMatch[1].trim() : text.substring(0, 200);
    
    log(`✅ Score: ${score}/100 (${temperature})`);
    
    return { score, temperature, insights };
    
  } catch (error) {
    log("⚠️ OpenAI error:", error.message);
    return { score: 50, temperature: 'warm', insights: 'Analysis unavailable' };
  }
}

// Main cycle
async function runCycle() {
  console.log("\n" + "=".repeat(50));
  log("🔄 Cycle started");
  
  try {
    const leads = await getUnprocessedLeads();
    
    if (leads.length === 0) {
      log("✅ Queue clear - no unprocessed leads");
      return;
    }
    
    log(`📊 Processing ${leads.length} leads...`);
    
    let processed = 0;
    let hotLeads = 0;
    
    for (const lead of leads) {
      const result = await analyzeWithOpenAI(lead);
      const updated = await updateLead(lead.id, result);
      
      if (updated) {
        processed++;
        if (result.score >= 80) {
          hotLeads++;
          log(`🔥 HOT LEAD! ${lead.business_name}: ${result.score}/100`);
        }
      }
      
      await new Promise(r => setTimeout(r, 1000));
    }
    
    log("\n📊 SUMMARY");
    log(`✅ Processed: ${processed}/${leads.length}`);
    log(`🔥 Hot leads: ${hotLeads}`);
    log(`⏰ Next cycle: ${new Date(Date.now() + POLL_INTERVAL).toISOString()}`);
    
  } catch (error) {
    log("❌ Cycle error:", error.message);
  }
  
  console.log("=".repeat(50));
}

// Initialize
async function init() {
  if (OPENAI_API_KEY) {
    log("🔧 Testing OpenAI connection...");
    
    try {
      const test = await fetchAPI('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: "Say OK" }],
          max_tokens: 5
        })
      });
      
      if (!test.ok) throw new Error(`Test failed: ${test.status}`);
      log("✅ OpenAI connection verified");
    } catch (error) {
      log("❌ OpenAI test failed:", error.message);
      log("⏰ Retrying in 5 minutes...");
      setTimeout(init, 300000);
      return;
    }
  } else {
    log("⚠️ Skipping OpenAI test (Key missing)");
  }
  
  log("🎉 Agent Zero initialized successfully!");
  await runCycle();
  setInterval(runCycle, POLL_INTERVAL);
}

init().catch(e => {
  console.error("💥 Fatal error:", e);
  process.exit(1);
});
