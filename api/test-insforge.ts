
import { createClient } from '@insforge/sdk';

const url = process.env.INSFORGE_API_BASE_URL || process.env.VITE_INSFORGE_API_BASE_URL || '';
const key = process.env.INSFORGE_API_KEY || process.env.VITE_INSFORGE_API_KEY || '';

const insforge = createClient({
  baseUrl: url,
  apiKey: key
});

export default async function handler(req: any, res: any) {
  try {
    const { data, error } = await insforge.database.from('leads').select('id').limit(1);
    if (error) {
      return res.status(500).json({ success: false, error: error.message, code: error.code });
    }
    return res.status(200).json({ success: true, cluster: "JSK8SNXZ", status: "Connected" });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
