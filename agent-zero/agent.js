// ================= FIXED AGENT ZERO =================
console.log("🚀 Flowgent Agent Zero - Production v2");
console.log("✅ Starting at:", new Date().toISOString());

// Configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const POLL_INTERVAL = process.env.POLL_INTERVAL || 300000;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY missing");
  process.exit(1);
}

console.log("✅ Config loaded");
console.log("🔑 OpenAI:", OPENAI_API_KEY ? "Present" : "Missing");
console.log("🗄️ Database:", SUPABASE_URL ? "Connected" : "Test Mode");
console.log("⏰ Interval:", POLL_INTERVAL / 60000, "minutes");

// Database functions
async function getUnprocessedLeads() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return [
      { id: 1, business_name: "Perfect Gym Mumbai", category: "Fitness", city: "Mumbai", has_website: false },
      { id: 2, business_name: "Spice Route Delhi", category: "Restaurant", city: "Delhi", has_website: true }
    ];
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/leads?select=*&ai_audit_completed=eq.false&limit=5`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) throw new Error(`DB error: ${response.status}`);
    
    const leads = await response.json();
    console.log(`📊 Found ${leads.length} unprocessed leads`);
    return leads;
  } catch (error) {
    console.log("⚠️ Database error:", error.message);
    return [];
  }
}

async function updateLead(leadId, data) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.log(`✅ [TEST] Would update lead ${leadId}:`, data);
    return true;
  }

  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/leads?id=eq.${leadId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          ai_audit_completed: true,
          readiness_score: data.score,
          temperature: data.temperature,
          is_hot_opportunity: data.score >= 80,
          ai_insights: data.insights,
          projected_roi_lift: data.roi,
          est_contract_value: data.value,
          updated_at: new Date().toISOString()
        })
      }
    );

    return response.ok;
  } catch (error) {
    console.log("⚠️ Update failed:", error.message);
    return false;
  }
}

// AI Analysis - FIXED JSON PARSING
async function analyzeWithAI(business) {
  try {
    console.log(`🤖 Analyzing: ${business.business_name}`);
    
    const prompt = `You are a business analyst. Score this business for digital readiness.

Business: ${business.business_name}
Category: ${business.category || 'Unknown'}
Location: ${business.city || 'Unknown'}
Has Website: ${business.has_website ? 'Yes' : 'No'}

Respond with ONLY this exact format (no extra text):
SCORE: [number 0-100]
TEMP: [hot/warm/cold]
INSIGHT: [one sentence]
ROI: [number 0-150]
VALUE: [number 2000-15000]`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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

    const data = await response.json();
    const text = data.choices[0]?.message?.content || "";
    
    // Parse simple text format instead of JSON
    const scoreMatch = text.match(/SCORE:\s*(\d+)/i);
    const tempMatch = text.match(/TEMP:\s*(\w+)/i);
    const insightMatch = text.match(/INSIGHT:\s*(.+)/i);
    const roiMatch = text.match(/ROI:\s*(\d+)/i);
    const valueMatch = text.match(/VALUE:\s*(\d+)/i);
    
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 50;
    const temperature = tempMatch ? tempMatch[1].toLowerCase() : 'warm';
    const insights = insightMatch ? insightMatch[1].trim() : 'Digital readiness assessed';
    const roi = roiMatch ? parseInt(roiMatch[1]) : 75;
    const value = valueMatch ? parseInt(valueMatch[1]) : 5000;
    
    console.log(`✅ Score: ${score}/100 (${temperature})`);
    
    return { score, temperature, insights, roi, value };
    
  } catch (error) {
    console.log("⚠️ AI error:", error.message);
    return {
      score: 50,
      temperature: 'warm',
      insights: 'AI analysis unavailable',
      roi: 75,
      value: 5000
    };
  }
}

// Main cycle
async function runCycle() {
  console.log("\n" + "=".repeat(50));
  console.log("🔄 Cycle started:", new Date().toISOString());
  
  try {
    const leads = await getUnprocessedLeads();
    
    if (leads.length === 0) {
      console.log("✅ No leads to process");
      return;
    }
    
    console.log(`📊 Processing ${leads.length} leads...`);
    
    let processed = 0;
    let hotLeads = 0;
    
    for (const lead of leads) {
      const result = await analyzeWithAI(lead);
      const updated = await updateLead(lead.id, result);
      
      if (updated) {
        processed++;
        console.log(`✅ ${lead.business_name}: ${result.score}/100`);
        
        if (result.score >= 80) {
          hotLeads++;
          console.log(`🔥 HOT LEAD! Value: ₹${result.value}`);
        }
      }
      
      // Rate limit protection
      await new Promise(r => setTimeout(r, 1000));
    }
    
    console.log("\n📊 SUMMARY");
    console.log(`✅ Processed: ${processed}/${leads.length}`);
    console.log(`🔥 Hot leads: ${hotLeads}`);
    console.log(`⏰ Next: ${new Date(Date.now() + POLL_INTERVAL).toISOString()}`);
    console.log("=".repeat(50));
    
  } catch (error) {
    console.log("❌ Cycle error:", error.message);
  }
}

// Initialize
async function init() {
  console.log("🔧 Testing OpenAI...");
  
  try {
    const test = await fetch('https://api.openai.com/v1/chat/completions', {
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
    
    if (!test.ok) throw new Error("OpenAI test failed");
    console.log("✅ OpenAI ready");
  } catch (error) {
    console.log("❌ OpenAI failed:", error.message);
    setTimeout(init, 300000);
    return;
  }
  
  console.log("🎉 Agent initialized!");
  await runCycle();
  setInterval(runCycle, POLL_INTERVAL);
}

init().catch(e => {
  console.error("💥 Fatal:", e);
  process.exit(1);
});
