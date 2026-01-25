// ================= AGENT ZERO - FINAL WORKING VERSION =================
console.log("🚀 Flowgent Agent Zero - Connected Version");
console.log("✅ Starting at:", new Date().toISOString());

// Configuration - MUST MATCH Railway variable names EXACTLY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const POLL_INTERVAL = process.env.POLL_INTERVAL || 300000;
const SUPABASE_URL = process.env.SUPABASE_URL;  // ✅ This matches Railway
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;  // ✅ This matches Railway

console.log("🔍 Checking configuration...");
console.log("✅ OpenAI Key present:", !!OPENAI_API_KEY);
console.log("✅ Supabase URL present:", !!SUPABASE_URL);
console.log("✅ Supabase Key present:", !!SUPABASE_KEY);
console.log("⏰ Poll interval:", POLL_INTERVAL / 1000 / 60, "minutes");

if (!OPENAI_API_KEY) {
  console.error("❌ ERROR: OPENAI_API_KEY missing");
  process.exit(1);
}

// Database test
async function testDatabase() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.log("❌ Database credentials missing");
    return false;
  }
  
  try {
    console.log("🔗 Testing database connection...");
    console.log("📡 URL:", SUPABASE_URL);
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    if (response.ok) {
      console.log("✅ Database connection successful!");
      return true;
    } else {
      console.log("❌ Database connection failed:", response.status);
      return false;
    }
  } catch (error) {
    console.log("❌ Database error:", error.message);
    return false;
  }
}

// Get real leads from database
async function getRealLeads() {
  try {
    console.log("📊 Fetching real leads from database...");
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/leads?select=*&ai_audit_completed=eq.false&limit=5`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.log("❌ Database query failed:", response.status);
      return [];
    }
    
    const leads = await response.json();
    console.log(`✅ Found ${leads.length} real leads in database`);
    return leads;
  } catch (error) {
    console.log("❌ Fetch error:", error.message);
    return [];
  }
}

// AI Analysis
async function analyzeWithAI(business) {
  try {
    console.log(`🤖 AI analyzing: ${business.business_name || business.name || 'Unknown'}`);
    
    const prompt = `Analyze digital readiness for: ${JSON.stringify(business, null, 2)}`;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ 
          role: "user", 
          content: `${prompt}\n\nReturn JSON: {"score":0-100,"insight":"text","temperature":"hot/warm/cold"}`
        }],
        max_tokens: 150
      })
    });
    
    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content || '{"score":50,"insight":"Default","temperature":"warm"}');
    
    result.score = Math.min(100, Math.max(0, result.score || 50));
    console.log(`✅ AI Score: ${result.score}/100 (${result.temperature})`);
    
    return result;
  } catch (error) {
    console.log("⚠️ AI error:", error.message);
    return { score: 50, insight: "Error", temperature: "warm" };
  }
}

// Main function
async function main() {
  console.log("\n" + "=".repeat(50));
  
  // Test database
  const dbConnected = await testDatabase();
  
  if (!dbConnected) {
    console.log("⚠️ Running in test mode (no database)");
    
    // Test with sample data
    const testLeads = [
      { id: 1, business_name: "Test Business 1", city: "Test City" },
      { id: 2, business_name: "Test Business 2", city: "Test City" }
    ];
    
    for (const lead of testLeads) {
      const aiResult = await analyzeWithAI(lead);
      console.log(`📝 ${lead.business_name}: ${aiResult.score}/100`);
    }
    
  } else {
    console.log("🎉 CONNECTED TO REAL DATABASE!");
    
    // Get real leads
    const realLeads = await getRealLeads();
    
    if (realLeads.length === 0) {
      console.log("✅ No unprocessed leads found in database");
    } else {
      console.log(`📊 Processing ${realLeads.length} real leads...`);
      
      for (const lead of realLeads) {
        const aiResult = await analyzeWithAI(lead);
        
        // Update the lead in database
        const updateResponse = await fetch(`${SUPABASE_URL}/rest/v1/leads?id=eq.${lead.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            ai_audit_completed: true,
            readiness_score: aiResult.score,
            temperature: aiResult.temperature,
            ai_insights: aiResult.insight,
            updated_at: new Date().toISOString()
          })
        });
        
        if (updateResponse.ok) {
          console.log(`✅ Updated lead ${lead.id} in database`);
          if (aiResult.score >= 80) {
            console.log(`🔥 HOT LEAD: ${lead.business_name}`);
          }
        }
      }
    }
  }
  
  console.log("\n" + "=".repeat(50));
  console.log("✅ Agent cycle completed");
  console.log("⏰ Next run in", POLL_INTERVAL / 1000 / 60, "minutes");
  console.log("=".repeat(50));
}

// Initialize
async function initialize() {
  console.log("🔧 Initializing Agent Zero...");
  
  // Test OpenAI
  try {
    const test = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Say 'Ready'" }],
        max_tokens: 10
      })
    });
    
    if (!test.ok) throw new Error("OpenAI failed");
    console.log("✅ OpenAI connected");
  } catch {
    console.log("❌ OpenAI failed, retrying in 5 min");
    setTimeout(initialize, 300000);
    return;
  }
  
  // Run first cycle
  await main();
  
  // Schedule
  setInterval(main, POLL_INTERVAL);
}

// Start
initialize().catch(error => {
  console.error("💥 Fatal:", error);
  process.exit(1);
});
