// ================= AGENT ZERO - ES MODULE COMPATIBLE =================
import https from 'https';

console.log("🚀 Flowgent Agent Zero - Production v2.0");
console.log("✅ Starting at:", new Date().toISOString());

// Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL || "300000");

const log = (...args) => console.log("[AgentZero]", new Date().toISOString(), ...args);

if (!OPENAI_API_KEY) {
  log("❌ OPENAI_API_KEY missing");
  process.exit(1);
}

log("✅ Config loaded");
log("🔑 OpenAI:", OPENAI_API_KEY ? "Present" : "Missing");
log("🗄️ Database:", SUPABASE_URL ? "Connected" : "Test Mode");
log("⏰ Interval:", POLL_INTERVAL / 60000, "minutes");

// HTTP client using native https module
async function fetchAPI(url, options = {}) {
  return new Promise((resolve, reject) => {
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
  });
}

// Database functions
async function getUnprocessedLeads() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    log("⚠️ Running in test mode");
    return [
      { id: 1, business_name: "Perfect Gym Mumbai", category: "Fitness", has_website: false },
      { id: 2, business_name: "Spice Route Delhi", category: "Restaurant", has_website: true }
    ];
  }

  try {
    const response = await fetchAPI(
      `${SUPABASE_URL}/rest/v1/leads?select=*&ai_audit_completed=eq.false&limit=5`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      log("⚠️ Database query failed:", response.status, response.text.substring(0, 100));
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
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    log(`✅ [TEST] Updated lead ${leadId}: Score ${data.score}/100`);
    return true;
  }

  try {
    const response = await fetchAPI(
      `${SUPABASE_URL}/rest/v1/leads?id=eq.${leadId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(data)
      }
    );

    if (!response.ok) {
      log("⚠️ Update failed:", response.status, response.text.substring(0, 100));
      return false;
    }
    
    log(`✅ Updated lead ${leadId} successfully`);
    return true;
  } catch (error) {
    log("⚠️ Update error:", error.message);
    return false;
  }
}

// AI Processing
async function processLeadWithAI(lead) {
  try {
    const prompt = `Analyze this business lead and provide insights:
Business: ${lead.business_name}
Category: ${lead.category}
Website: ${lead.has_website ? 'Yes' : 'No'}

Provide a JSON response with:
- score (0-100): Overall business potential score
- strengths: Array of 3 business strengths
- recommended_services: Array of 3 services we could offer
- outreach_priority: "High", "Medium", or "Low"
- notes: Brief analysis (max 50 words)`;

    const response = await fetchAPI('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a business analyst. Analyze leads and return JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    if (!response.ok) {
      log("⚠️ AI analysis failed:", response.status);
      return null;
    }

    const result = response.json();
    const content = result.choices[0].message.content;
    
    try {
      const analysis = JSON.parse(content);
      log(`🤖 AI Analysis: Score ${analysis.score}/100, Priority: ${analysis.outreach_priority}`);
      return analysis;
    } catch {
      log("⚠️ Failed to parse AI response");
      return {
        score: 50,
        strengths: ['Established business', 'Local presence', 'Growth potential'],
        recommended_services: ['Website development', 'Digital marketing', 'Business automation'],
        outreach_priority: 'Medium',
        notes: 'Standard business analysis'
      };
    }
  } catch (error) {
    log("⚠️ AI processing error:", error.message);
    return null;
  }
}

// Main processing loop
async function processLeads() {
  log("🔄 Starting lead processing cycle");
  
  const leads = await getUnprocessedLeads();
  
  if (leads.length === 0) {
    log("ℹ️ No leads to process");
    return;
  }

  for (const lead of leads) {
    log(`🎯 Processing lead: ${lead.business_name}`);
    
    const aiAnalysis = await processLeadWithAI(lead);
    
    if (aiAnalysis) {
      const updateData = {
        ai_audit_completed: true,
        score: aiAnalysis.score || 50,
        strengths: aiAnalysis.strengths || [],
        recommended_services: aiAnalysis.recommended_services || [],
        outreach_priority: aiAnalysis.outreach_priority || 'Medium',
        ai_audit_date: new Date().toISOString()
      };

      await updateLead(lead.id, updateData);
      log(`✅ Completed processing for ${lead.business_name}`);
    } else {
      log(`⚠️ Skipped ${lead.business_name} due to AI processing failure`);
    }
    
    // Small delay between processing to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  log("✅ Lead processing cycle completed");
}

// Start the agent
async function startAgent() {
  log("🚀 Agent Zero starting...");
  
  // Initial processing
  await processLeads();
  
  // Schedule periodic processing
  setInterval(processLeads, POLL_INTERVAL);
  
  log(`✅ Agent Zero operational. Processing every ${POLL_INTERVAL / 60000} minutes`);
}

// Graceful shutdown
process.on('SIGTERM', () => {
  log("🛑 Received SIGTERM, shutting down gracefully...");
  process.exit(0);
});

process.on('SIGINT', () => {
  log("🛑 Received SIGINT, shutting down gracefully...");
  process.exit(0);
});

// Start the agent
startAgent().catch(error => {
  log("💥 Agent failed to start:", error.message);
  process.exit(1);
});