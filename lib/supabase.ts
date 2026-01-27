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

// Export as testInsForgeConnection for compatibility
export const testInsForgeConnection = testConnection;

// Lead operations
export const leadOperations = {
  getAll: getLeads,
  getHotLeads,
  create: addLead,
  update: async (id: string, updates: any) => {
    try {
      const { data, error } = await insforge.database
        .from('leads')
        .update(updates)
        .eq('place_id', id)
        .select()
        .single();
      return !error ? data : null;
    } catch {
      return null;
    }
  },
  delete: async (id: string) => {
    try {
      const { error } = await insforge.database
        .from('leads')
        .delete()
        .eq('place_id', id);
      return !error;
    } catch {
      return false;
    }
  }
};

// Log operations
export const logOperations = {
  getRecent: async () => {
    try {
      const { data, error } = await insforge.database
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      return !error ? data : [];
    } catch {
      return [];
    }
  },
  create: async (logData: any) => {
    try {
      const { data, error } = await insforge.database
        .from('audit_logs')
        .insert([logData])
        .select()
        .single();
      return !error ? data : null;
    } catch {
      return null;
    }
  }
};

// Subscription operations
export const subscriptionOperations = {
  getAll: async () => {
    try {
      const { data, error } = await insforge.database
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });
      return !error ? data : [];
    } catch {
      return [];
    }
  },
  verifyPayment: async (id: string, paymentRef: string) => {
    try {
      const { data, error } = await insforge.database
        .from('subscriptions')
        .update({ 
          status: 'active',
          payment_reference: paymentRef,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      return !error ? data : null;
    } catch {
      return null;
    }
  }
};

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

