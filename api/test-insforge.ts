
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(url, key);

export default async function handler(req: any, res: any) {
  try {
    const { data, error } = await supabase.from('leads').select('id').limit(1);
    if (error) {
      return res.status(500).json({ success: false, error: error.message, code: error.code });
    }
    return res.status(200).json({ success: true, cluster: "JSK8SNXZ", status: "Connected" });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
