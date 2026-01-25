// ================= SIMPLE AGENT ZERO =================
// No imports needed at the top

console.log("🚀 Flowgent Agent Zero - Simple Version");
console.log("✅ Starting at:", new Date().toISOString());

// Get API key from Railway environment
const GEMINI_API_KEY = process.env.API_KEY;

// Check if API key exists
if (!GEMINI_API_KEY) {
  console.error("❌ ERROR: API_KEY not found!");
  console.log("Please add API_KEY to Railway Variables");
  console.log("Go to Railway → Your Project → Variables → Add API_KEY");
  process.exit(1);
}

console.log("✅ API Key loaded successfully!");
console.log("🔑 First 10 chars:", GEMINI_API_KEY.substring(0, 10));

// Now import the Google AI library
import { GoogleGenerativeAI } from "@google/generative-ai";

console.log("🤖 Google AI Library loaded");

// Rest of your code...
const POLL_INTERVAL = 300000; // 5 minutes

const log = (...args) => console.log("[AgentZero]", new Date().toISOString(), ...args);

// Test function
async function testAI() {
  try {
    log("Testing Gemini AI connection...");
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent("Say 'Hello from Agent Zero'");
    const response = result.response.text();
    
    log("✅ AI Connection successful!");
    log("🤖 AI says:", response.substring(0, 100));
    
    return true;
  } catch (error) {
    log("❌ AI Connection failed:", error.message);
    return false;
  }
}

// Main function
async function main() {
  log("🔧 Initializing Agent Zero...");
  
  const aiConnected = await testAI();
  
  if (aiConnected) {
    log("🎉 Agent Zero is READY!");
    log(`⏰ Will run every ${POLL_INTERVAL / 1000 / 60} minutes`);
    
    // Run your agent logic here
    // ...
    
  } else {
    log("⚠️ Agent Zero will retry in 5 minutes");
    setTimeout(main, POLL_INTERVAL);
  }
}

// Start the agent
main().catch(error => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});
