import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "https://jsk8snxz.ap-southeast.insforge.app";
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || "ik_2ef615853868d11f26c1b6a8cd7550ad";

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  try {
    const { error } = await supabase.from('leads').select('id').limit(1);
    if (error && error.code !== 'PGRST116') throw error; 
    console.log('AGENT_ZERO_STATUS: OPERATIONAL');
    process.exit(0);
  } catch (err) {
    console.error('AGENT_ZERO_STATUS: DISCONNECTED', err.message);
    process.exit(1);
  }
}

check();