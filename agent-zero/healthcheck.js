import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL || "", 
  process.env.SUPABASE_SERVICE_KEY || ""
);

async function check() {
  try {
    const { error } = await supabase.from('leads').select('id').limit(1);
    if (error) throw error;
    console.log('AGENT_ZERO_STATUS: OPERATIONAL');
    process.exit(0);
  } catch (err) {
    console.error('AGENT_ZERO_STATUS: DISCONNECTED', err.message);
    process.exit(1);
  }
}

check();