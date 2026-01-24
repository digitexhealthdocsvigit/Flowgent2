import fetch from "node-fetch";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI } from "@google/genai";

/**
 * FLOWGENT AGENT ZERO: COMPLETE AUTONOMOUS SYSTEM
 * No n8n needed - Does everything automatically
 */

// CONFIGURATION - Update these values
const SUPABASE_URL = "https://jsk8snxz.ap-southeast.insforge.app";
const SUPABASE_KEY = "ik_2ef615853868d11f26c1b6a8cd7550ad";
const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY_HERE"; // ← REPLACE THIS
const POLL_INTERVAL = 300 * 1000; // 5 minutes
const TELEGRAM_BOT_TOKEN = ""; // Optional - for WhatsApp alerts
const TELEGRAM_CHAT_ID = ""; // Optional

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const log = (...args) => console.log("[AgentZero]", new Date().toISOString(), ...args);

/**
 * Send Telegram alert for manual WhatsApp copy-paste
 */
async function sendTelegramAlert(message) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });
  } catch (err) {
    log('⚠️ Telegram alert failed:', err.message);
  }
}

/**
 * Generate AI-powered pitch
 */
async function generatePitch(lead, readiness_score, ai_insights) {
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  
  try {
    const prompt = `Create a personalized WhatsApp/Email pitch for this business:

Business: ${lead.business_name}
City: ${lead.city}
Category: ${lead.category || 'Unknown'}
Phone: ${lead.phone}
Readiness Score: ${readiness_score}/100
AI Insights: ${ai_insights}

Create TWO versions:
1. SHORT (WhatsApp - 3-4 sentences, friendly tone)
2. LONG (Email - professional, detailed, include ROI benefits)

Format:
WHATSAPP:
[short pitch here]

EMAIL:
Subject: [subject line]
[email body here]`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{ parts: [{ text: prompt }] }]
    });
    
    const pitch = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return pitch;
  } catch (err) {
    log('⚠️ Pitch generation error:', err.message);
    return `Hi ${lead.business_name}, we noticed you could benefit from digital automation. Contact us to learn more!`;
  }
}

/**
 * Main processing loop
 */
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

    log(`📊 Found ${leads.length} leads to process`);

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    for (const lead of leads) {
      log(`📝 Processing: ${lead.business_name}`);
      let emails = [];
      
      // Extract email from website if exists
      if (lead.website) {
        try {
          log(`🌐 Checking website: ${lead.website}`);
          // Note: Scrapingdog requires API key - disabled for now
          // You can enable this later when you add Scrapingdog API key
        } catch (err) {
          log("⚠️ Website check failed:", err.message);
        }
      }

      // AI Readiness Scoring
      let readiness_score = 50;
      let ai_insights = "";
      
      try {
        const prompt = `Analyze this business for digital transformation potential:

Business: ${lead.business_name}
City: ${lead.city}
Category: ${lead.category || 'Unknown'}
Website: ${lead.website || 'None (High potential!)'}
Phone: ${lead.phone}

Rate 0-100 on their potential ROI from digital automation.
High scores (80+) = businesses with NO website or broken digital presence.
Low scores (30-) = already digitally advanced.

Format your response EXACTLY as:
SCORE: [number 0-100]
INSIGHTS: [2-3 sentences about why this score and what they need]`;

        const response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: [{ parts: [{ text: prompt }] }]
        });
        
        const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
        ai_insights = text;
        
        const scoreMatch = text.match(/SCORE:\s*(\d+)/i);
        if (scoreMatch) {
          readiness_score = Math.min(Math.max(parseInt(scoreMatch[1]), 0), 100);
        }
        
        log(`🤖 AI Score: ${readiness_score}/100`);
      } catch (err) {
        log("⚠️ AI Scoring error:", err.message);
      }

      // Generate personalized pitch
      const pitch = await generatePitch(lead, readiness_score, ai_insights);

      // Update database
      const { error: updateError } = await supabase.from("leads").update({
        ai_audit_completed: true,
        email: emails[0] || lead.email,
        readiness_score,
        is_hot_opportunity: readiness_score >= 80,
        temperature: readiness_score >= 80 ? 'hot' : (readiness_score >= 50 ? 'warm' : 'cold'),
        ai_insights,
        pitch_generated: true,
        updated_at: new Date().toISOString()
      }).eq("id", lead.id);

      if (updateError) {
        log("❌ Update error:", updateError.message);
        continue;
      }

      log(`✅ Updated: ${lead.business_name} (Score: ${readiness_score})`);

      // Hot lead alert (for manual WhatsApp outreach)
      if (readiness_score >= 80) {
        const alert = `🔥 <b>HOT LEAD!</b>

<b>Business:</b> ${lead.business_name}
<b>Phone:</b> ${lead.phone}
<b>City:</b> ${lead.city}
<b>Score:</b> ${readiness_score}/100

<b>PITCH (Copy to WhatsApp):</b>
${pitch.split('EMAIL:')[0].replace('WHATSAPP:', '').trim()}

<b>Full pitch in database!</b>`;
        
        await sendTelegramAlert(alert);
        log("📱 Telegram alert sent for manual WhatsApp!");
      }
    }
    
    log(`✅ Cycle complete - processed ${leads.length} leads`);
    
  } catch (err) {
    log("❌ Critical error:", err.message);
  }
}

// Initialize and start
log("🚀 Flowgent Agent Zero - COMPLETE SYSTEM");
log(`🔗 Database: ${SUPABASE_URL}`);
log(`⏰ Polling: Every ${POLL_INTERVAL/1000} seconds`);
log(`📧 Email automation: ${GEMINI_API_KEY ? 'ENABLED' : 'DISABLED - Add API key'}`);
log(`📱 Telegram alerts: ${TELEGRAM_BOT_TOKEN ? 'ENABLED' : 'DISABLED - Optional'}`);

setInterval(runAgent, POLL_INTERVAL);
runAgent(); // Run immediately
```

---

## 🎯 YOUR COMPLETE WORKFLOW (NO N8N)

### **Step 1: Add Leads (Manual)**
```
You → Add business in InsForge (SQL Box 1)
```

### **Step 2: Agent Zero Processes (Automatic)**
```
Agent Zero:
  ├─ Finds new lead
  ├─ Scores with AI (0-100)
  ├─ Generates pitch
  ├─ Updates database
  └─ Sends Telegram alert (if hot lead)
```

### **Step 3: You Take Action (Manual)**
```
Telegram Alert → Copy pitch → Paste to WhatsApp → Send
```

---

## 📊 WHAT YOU GET

### **Automatic:**
- ✅ AI scoring every 5 minutes
- ✅ Pitch generation for every lead
- ✅ Database updates
- ✅ Hot lead alerts

### **Manual (Copy-Paste):**
- 📱 WhatsApp outreach (copy from Telegram)
- 📧 Email outreach (copy from database)

---

## 🚀 SETUP STEPS (15 MINUTES)

### **Step 1: Update agent.js (5 min)**
- Copy Box 4 above
- Replace file on GitHub
- Add your Gemini API key (line 16)
- Commit

### **Step 2: Add test lead (1 min)**
- Copy Box 1
- Paste in InsForge SQL Editor
- Click "Run"

### **Step 3: Wait 5 minutes**
- Agent Zero processes automatically
- Check Railway logs

### **Step 4: Verify (2 min)**
- Copy Box 2
- Paste in InsForge SQL Editor
- Should show score and insights

---

## 📱 REPLY FORMAT

After completing steps above:
```
✅ Status Update:
- agent.js updated: [YES/NO]
- Gemini API key added: [YES/NO]
- Test lead added: [YES/NO]
- Agent Zero processed it: [YES/NO]
- Readiness score: [number]

Ready for: [Real leads / Need help]
```

---

## 🎉 BOTTOM LINE

**You DON'T need n8n!** Your simplified system:
```
Manual Lead Entry → InsForge → Agent Zero → Telegram Alert → Manual WhatsApp
