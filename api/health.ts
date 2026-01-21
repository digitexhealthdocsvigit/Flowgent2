
export default function handler(req: any, res: any) {
  res.status(200).json({
    vercel_env: process.env.VERCEL_ENV || 'unknown',
    supabase_url: !!(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL),
    anon_key: !!(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY),
    timestamp: new Date().toISOString(),
    node_id: "JSK8SNXZ",
    status: "Neural Bridge Operational"
  });
}
