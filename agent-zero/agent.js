import pkg from 'pg';
const { Pool } = pkg;
import { GoogleGenerativeAI } from "@google/generative-ai";

// PostgreSQL Connection for InsForge
const PG_CONFIG = {
  host: 'jsk8snxz.ap-southeast.insforge.app',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'ik_2ef615853868d11f26c1b6a8cd7550ad',
  ssl: { rejectUnauthorized: false }
};

const GEMINI_API_KEY = 'AIzaSyBPs2T-1zpAo1q_huSx4dOt-CB-aPwPCmY';
const POLL_INTERVAL = 300000; // 5 minutes

const log = (...args) => console.log("[AgentZero]", new Date().toISOString(), ...args);

// Create PostgreSQL connection pool
const pool = new Pool(PG_CONFIG);

// Test connection
async function testConnection() {
  try {
    log("🔧 Testing PostgreSQL connection...");
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as time');
    client.release();
    log(`✅ PostgreSQL connected at ${result.rows[0].time}`);
    return true;
  } catch (error) {
    log(`❌ PostgreSQL connection failed: ${error.message}`);
    return false;
  }
}

// Get unprocessed leads
async function getUnprocessedLeads() {
  try {
    const query = `
      SELECT id, business_name, city, category, has_website 
      FROM leads 
      WHERE ai_audit_completed = false
      LIMIT 5
    `;
    
    log("🔍 Querying leads from PostgreSQL...");
    const result = await pool.query(query);
    log(`📊 Found ${result.rows.length} unprocessed leads`);
    return result.rows;
  } catch (error) {
    log(`❌ Query error: ${error.message}`);
    return [];
  }
}

// Update lead
async function updateLead(leadId, updates) {
  const fields = Object.keys(updates);
  const values = Object.values(updates);
  
  const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
  
  const query = `
    UPDATE leads 
    SET ${setClause}
    WHERE id = $1
  `;
  
  const queryValues = [leadId, ...values];
  
  try {
    await pool.query(query, queryValues);
    log(`✅ Updated lead ID ${leadId}`);
  } catch (error) {
    log(`❌ Update error: ${error.message}`);
  }
}

// AI processing
async function processLeadWithAI(lead) {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  try {
    const prompt = `Rate this business digital readiness 0-100: ${lead.business_name}, ${lead.category}, ${lead.city}, Has website: ${lead.has_website}`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    const match = text.match(/\b(\d{1,3})\b/);
    const score = match ? parseInt(match[1], 10) : 50;
    const finalScore = Math.min(100, Math.max(0, score));
    
    log(`🤖 AI Score: ${lead.business_name} → ${finalScore}/100`);
    
    return {
      readiness_score: finalScore,
      ai_insights: text.substring(0, 300),
      temperature: finalScore >= 80 ? "hot" : finalScore >= 50 ? "warm" : "cold",
      is_hot_opportunity: finalScore >= 80
    };
  } catch (error) {
    log(`⚠️ AI error: ${error.message}`);
    return {
      readiness_score: 50,
      ai_insights: "AI analysis unavailable",
      temperature: "cold",
      is_hot_opportunity: false
    };
  }
}

// Main agent
async function runAgent() {
  try {
    log("🚀 Starting agent cycle...");
    
    const leads = await getUnprocessedLeads();
    
    if (leads.length === 0) {
      log("✅ No leads to process");
      return;
    }
    
    for (const lead of leads) {
      log(`📝 Processing: ${lead.business_name}`);
      
      const aiResults = await processLeadWithAI(lead);
      
      const updates = {
        ai_audit_completed: true,
        readiness_score: aiResults.readiness_score,
        is_hot_opportunity: aiResults.is_hot_opportunity,
        temperature: aiResults.temperature,
        ai_insights: aiResults.ai_insights,
        updated_at: new Date()
      };
      
      await updateLead(lead.id, updates);
      
      log(`✅ Updated: ${lead.business_name} (${aiResults.readiness_score} - ${aiResults.temperature})`);
      
      if (aiResults.is_hot_opportunity) {
        log(`🔥 HOT LEAD: ${lead.business_name} - Score: ${aiResults.readiness_score}`);
      }
    }
    
    log("🎉 Cycle complete!");
    
  } catch (error) {
    log(`❌ Agent error: ${error.message}`);
  }
}

// Initialize
async function initialize() {
  log("🚀 Flowgent Agent Zero - PostgreSQL Direct");
  log(`⏰ Polling every ${POLL_INTERVAL / 1000} seconds`);
  
  const connected = await testConnection();
  
  if (connected) {
    await runAgent();
    setInterval(runAgent, POLL_INTERVAL);
  } else {
    log("⚠️ Connection failed, will retry");
    setInterval(async () => {
      const retry = await testConnection();
      if (retry) await runAgent();
    }, POLL_INTERVAL);
  }
}

initialize().catch(error => {
  log(`💥 Fatal: ${error.message}`);
  process.exit(1);
});
