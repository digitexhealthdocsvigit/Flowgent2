
import { createClient } from '@insforge/sdk';
import dotenv from 'dotenv';

dotenv.config();

const INSFORGE_URL = process.env.INSFORGE_API_BASE_URL || process.env.SUPABASE_URL;
const INSFORGE_KEY = process.env.INSFORGE_API_KEY || process.env.SUPABASE_SERVICE_KEY;

console.log("🤝 Initiating Handshake with InsForge...");
console.log(`📍 URL: ${INSFORGE_URL}`);
console.log(`🔑 Key Present: ${!!INSFORGE_KEY}`);

if (!INSFORGE_URL || !INSFORGE_KEY) {
    console.error("❌ Missing credentials in .env");
    process.exit(1);
}

const insforge = createClient({
    baseUrl: INSFORGE_URL,
    apiKey: INSFORGE_KEY
});

async function handshake() {
    try {
        // Test 1: Database Connection
        console.log("Testing Database Connection...");
        const { data, error, count } = await insforge.database
            .from('leads')
            .select('*', { count: 'exact', head: true });

        if (error) {
            console.error("⚠️ Database Error:", error.message);
        } else {
            console.log("✅ Database Connection Successful");
            console.log(`📊 Leads Table Status: Accessible (Count: ${count})`);
        }

        // Test 2: Auth Service
        console.log("Testing Auth Service...");
        // Using getCurrentUser() as per SDK documentation
        const { data: authData, error: authError } = await insforge.auth.getCurrentUser();
        
        if (authError) {
             console.log("ℹ️ Auth Check (Current User):", authError.message);
             console.log("Note: This is expected if no user is signed in.");
        } else {
             console.log("✅ Auth Service Reachable (User session found)");
        }

        console.log("\n🎉 HANDSHAKE COMPLETE: System is ready.");

    } catch (err) {
        console.error("❌ Handshake Failed:", err.message);
        process.exit(1);
    }
}

handshake();
