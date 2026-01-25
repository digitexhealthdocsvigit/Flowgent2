// ================= SAFE AGENT ZERO WITH OPENAI =================
console.log("🚀 Flowgent Agent Zero - Secure Version");
console.log("✅ Starting at:", new Date().toISOString());

// Get API key from Railway environment ONLY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const POLL_INTERVAL = process.env.POLL_INTERVAL || 300000;

// Check if API key exists
if (!OPENAI_API_KEY) {
  console.error("❌ ERROR: OPENAI_API_KEY not found in Railway Variables!");
  console.log("=========================================");
  console.log("TO FIX THIS:");
  console.log("1. Go to Railway Dashboard");
  console.log("2. Click on your project 'Flowgent2'");
  console.log("3. Click 'Variables' tab");
  console.log("4. Add NEW variable:");
  console.log("   - Key: OPENAI_API_KEY");
  console.log("   - Value: [Your NEW OpenAI API Key]");
  console.log("5. Railway will auto-restart");
  console.log("=========================================");
  process.exit(1);
}

console.log("✅ Config loaded successfully!");
console.log("🔑 API Key first 10 chars:", OPENAI_API_KEY.substring(0, 10) + "...");
console.log("⏰ Poll interval:", POLL_INTERVAL / 1000 / 60, "minutes");

// Test OpenAI connection
async function testOpenAI() {
  try {
    console.log("🤖 Testing OpenAI connection...");
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "user", content: "Say 'Hello from Agent Zero' in one sentence." }
        ],
        max_tokens: 20
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    const message = data.choices[0]?.message?.content || "No response";
    
    console.log("✅ OpenAI Connection successful!");
    console.log("💬 OpenAI says:", message);
    
    return true;
  } catch (error) {
    console.log("❌ OpenAI Connection failed:", error.message);
    console.log("⚠️ Check your API key and credit balance");
    return false;
  }
}

// Main function
async function main() {
  console.log("\n" + "=".repeat(50));
  console.log("🔧 Initializing Agent Zero...");
  
  const connected = await testOpenAI();
  
  if (connected) {
    console.log("🎉 Agent Zero is READY and connected!");
    console.log("🚀 Agent will start processing leads...");
    
    // Start agent logic here
    // ...
    
    // Schedule next run
    console.log("⏰ Next run in", POLL_INTERVAL / 1000 / 60, "minutes");
    setInterval(async () => {
      console.log("\n🔄 Scheduled run starting...");
      // Add your agent logic here
    }, POLL_INTERVAL);
    
  } else {
    console.log("⚠️ Will retry connection in 5 minutes");
    setTimeout(main, 300000);
  }
}

// Start
main().catch(error => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});
