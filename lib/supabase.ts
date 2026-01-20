
import { createClient } from '@supabase/supabase-js';
import { AuditLog, Project, Subscription, Lead, Deal } from '../types';

// Production Infrastructure Node: Flowagent project JSK8SNXZ
const INSFORGE_URL = 'https://jsk8snxz.ap-southeast.insforge.app';
const INSFORGE_KEY = 'ik_2ef615853868d11f26c1b6a8cd7550ad';

export const activeProjectRef = "01144a09-e1ef-40a7-b32b-bfbbd5bafea9";
export const isSupabaseConfigured = !!INSFORGE_URL && !!INSFORGE_KEY;

export const supabase = createClient(INSFORGE_URL, INSFORGE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export const handleSupabaseError = (err: any): string => {
  if (typeof err === 'string') return err;
  if (err.message?.includes('user_id')) return "Schema Error: user_id column missing in InsForge table.";
  return err.message || "Infrastructure Node Timeout: 0x82";
};

export const leadOperations = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } catch (e) {
      console.error("Lead Sync Failure:", handleSupabaseError(e));
      return null;
    }
  },

  async upsert(lead: Partial<Lead>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      // Ensure user_id is injected for RLS compliance
      const payload = { 
        ...lead, 
        user_id: user?.id || null,
        last_audit_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('leads')
        .upsert(payload, { onConflict: 'place_id' })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (e) {
      console.error("Lead Ingestion Error:", handleSupabaseError(e));
      return lead;
    }
  }
};

export const dealOperations = {
  async getAll() {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return data;
    } catch (e) { 
      console.error("Deal Fetch Error:", e);
      return null; 
    }
  },

  async updateStage(dealId: string, stage: string) {
    try {
      const { data, error } = await supabase
        .from('deals')
        .update({ stage, updated_at: new Date().toISOString() })
        .eq('id', dealId)
        .select()
        .single();
      if (error) throw error;
      return !!data;
    } catch (e) { 
      console.error("Deal Update Error:", e);
      return false; 
    }
  }
};

export const logOperations = {
  async create(log: AuditLog) {
    const { data: { user } } = await supabase.auth.getUser();
    const entry = {
      event_type: log.type || 'system',
      payload: log.payload || { text: log.text },
      source: log.source || 'flowgent_neural_node',
      lead_id: log.lead_id || null,
      user_id: user?.id || null,
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
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('projects')
        .insert([{ ...project, user_id: user?.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (e) { return project; }
  }
};

export const subscriptionOperations = {
  async getAll() {
    try {
      const { data, error } = await supabase.from('subscriptions').select('*');
      if (error) throw error;
      return data;
    } catch (e) { return null; }
  },
  async create(subscription: Partial<Subscription>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('subscriptions')
        .insert([{ ...subscription, user_id: user?.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (e) { return subscription; }
  },
  async verifyPayment(id: string, ref: string) {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .update({ status: 'active', payment_ref: ref })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return !!data;
    } catch (e) {
      console.error("Payment Verification Error:", handleSupabaseError(e));
      throw e;
    }
  }
};

export const testInsForgeConnection = async () => {
  try {
    const { error } = await supabase.from('leads').select('id').limit(1);
    return !error;
  } catch { return false; }
};
