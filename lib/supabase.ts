import { insforge } from './insforge';

export const activeProjectRef = 'JSK8SNXZ';

// Test connection
export async function testConnection() {
  try {
    const { data, error } = await insforge.database
      .from('leads')
      .select('count', { count: 'exact', head: true });
    return !error;
  } catch {
    return false;
  }
}

// Get all leads
export async function getLeads() {
  try {
    const { data, error } = await insforge.database
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

// Get hot leads
export async function getHotLeads() {
  try {
    const { data, error } = await insforge.database
      .from('leads')
      .select('*')
      .eq('ai_audit_completed', true)
      .eq('is_hot_opportunity', true)
      .order('readiness_score', { ascending: false });

    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

// Add new lead
export async function addLead(leadData: any) {
  try {
    const { data, error } = await insforge.database
      .from('leads')
      .insert([leadData])
      .select()
      .single();

    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

// Error handler
export const handleSupabaseError = (err: any): string => {
  if (err?.message) return err.message;
  if (typeof err === 'string') return err;
  return 'An error occurred';
};

// Export the InsForge client as 'supabase' for backward compatibility if needed,
// but preferably we should use 'insforge' directly.
// We keep the 'supabase' export structure to minimize breaking changes,
// wrapping InsForge calls if necessary or just exposing the InsForge database client.
export const supabase = {
  from: (table: string) => insforge.database.from(table)
};

