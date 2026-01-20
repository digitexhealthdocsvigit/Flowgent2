
import { createClient } from '@supabase/supabase-js';
import { AuditLog, Project, Subscription, Lead, Deal } from '../types';

// Infrastructure Node Configuration
const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL || 'https://jsk8snxz.ap-southeast.insforge.app';
const INSFORGE_KEY = process.env.NEXT_PUBLIC_INSFORGE_API_KEY || 'ik_2ef615853868d11f26c1b6a8cd7550ad';

export const activeProjectRef = "01144a09-e1ef-40a7-b32b-bfbbd5bafea9";

// FIX: Added missing export for isSupabaseConfigured
/**
 * Verifies if the infrastructure credentials are set.
 */
export const isSupabaseConfigured = !!INSFORGE_URL && !!INSFORGE_KEY;

// FIX: Added missing export for handleSupabaseError
/**
 * Standardized error handler for infrastructure signals.
 */
export const handleSupabaseError = (err: any): string => {
  if (typeof err === 'string') return err;
  return err.message || "An unexpected error occurred during the handshake.";
};

export const supabase = createClient(INSFORGE_URL, INSFORGE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

/**
 * InsForge Direct Fetch Connector
 * Optimized for high-velocity lead ingestion and n8n sync.
 */
const insforgeHeaders = {
  'apikey': INSFORGE_KEY,
  'Authorization': `Bearer ${INSFORGE_KEY}`,
  'Content-Type': 'application/json'
};

export const leadOperations = {
  async getAll() {
    try {
      const res = await fetch(`${INSFORGE_URL}/rest/v1/leads?select=*&order=created_at.desc`, {
        headers: insforgeHeaders
      });
      if (!res.ok) throw new Error("Neural Node Unreachable");
      return await res.json();
    } catch (e) {
      console.error("InsForge Fetch Error:", e);
      return null;
    }
  },

  async upsert(lead: Partial<Lead>) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      
      const payload = { ...lead, user_id: userId };
      const res = await fetch(`${INSFORGE_URL}/rest/v1/leads`, {
        method: 'POST',
        headers: { ...insforgeHeaders, 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error("Ingestion Buffer Error");
      return await res.json();
    } catch (e) {
      console.error("InsForge Post Error:", e);
      return lead;
    }
  }
};

export const dealOperations = {
  async getAll() {
    try {
      const res = await fetch(`${INSFORGE_URL}/rest/v1/deals?select=*&order=updated_at.desc`, {
        headers: insforgeHeaders
      });
      return await res.json();
    } catch (e) { return null; }
  },

  async updateStage(dealId: string, newStage: string) {
    try {
      const res = await fetch(`${INSFORGE_URL}/rest/v1/deals?id=eq.${dealId}`, {
        method: 'PATCH',
        headers: insforgeHeaders,
        body: JSON.stringify({ stage: newStage, updated_at: new Date().toISOString() })
      });
      return res.ok;
    } catch (e) { return false; }
  }
};

export const logOperations = {
  async create(log: AuditLog) {
    const entry = {
      event_type: log.type || 'system',
      payload: log.payload || { text: log.text },
      source: log.source || 'flowgent_neural_node',
      lead_id: log.lead_id || null,
      created_at: new Date().toISOString()
    };
    try {
      const { error } = await supabase.from('audit_logs').insert([entry]);
      return !error;
    } catch (e) { return false; }
  },

  async getRecent() {
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    } catch (e) { return null; }
  }
};

export const projectOperations = {
  async create(project: Partial<Project>) {
    try {
      const { data, error } = await supabase.from('projects').insert([project]).select().single();
      if (error) throw error;
      return data;
    } catch (e) { return project; }
  }
};

export const subscriptionOperations = {
  async getAll() {
    try {
      const { data, error } = await supabase.from('subscriptions').select('*');
      return data;
    } catch (e) { return null; }
  },
  async create(subscription: Partial<Subscription>) {
    try {
      const { data, error } = await supabase.from('subscriptions').insert([subscription]).select().single();
      return data;
    } catch (e) { return subscription; }
  },
  async verifyPayment(id: string, ref: string) {
    try {
      const { data, error } = await supabase.from('subscriptions').update({ status: 'active', payment_ref: ref }).eq('id', id);
      return data;
    } catch (e) { return null; }
  }
};

export const testInsForgeConnection = async () => {
  try {
    const res = await fetch(`${INSFORGE_URL}/rest/v1/leads?select=id&limit=1`, {
      headers: insforgeHeaders
    });
    return res.ok;
  } catch { return false; }
};
