
import { createClient } from '@supabase/supabase-js';
import { AuditLog, Project, Subscription, Lead, Deal } from '../types';

// Live InsForge Project Configuration
const INSFORGE_URL = 'https://jsk8snxz.ap-southeast.insforge.app';
const INSFORGE_KEY = 'ik_2ef615853868d11f26c1b6a8cd7550ad';

export const isSupabaseConfigured = true;
export const activeProjectRef = "01144a09-e1ef-40a7-b32b-bfbbd5bafea9";

export const supabase = createClient(INSFORGE_URL, INSFORGE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: { 'Accept': 'application/json' }
  }
});

export const handleSupabaseError = (err: any): string => {
  const msg = err?.message || String(err);
  if (msg.includes('Unexpected token') || msg.includes('doctype') || msg.includes('JSON') || msg.includes('404')) {
    return "INFRASTRUCTURE NODE PAUSED: Project " + activeProjectRef.split('-')[0] + " returned a non-JSON payload. Check project status in InsForge dashboard.";
  }
  return msg;
};

export const leadOperations = {
  async upsert(lead: Partial<Lead>) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      
      const { data, error } = await supabase
        .from('leads')
        .upsert({ ...lead, user_id: userId }, { onConflict: 'place_id' })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Supabase Upsert Failed:", handleSupabaseError(e));
      return lead;
    }
  },

  async getAll() {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Fetch Failed. Check InsForge Indexes.", handleSupabaseError(e));
      return null;
    }
  }
};

export const dealOperations = {
  async getAll() {
    try {
      const { data, error } = await supabase.from('deals').select('*').order('updated_at', { ascending: false });
      if (error) throw error;
      return data;
    } catch (e) { return null; }
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
      return data;
    } catch (e) { return null; }
  }
};

export const logOperations = {
  async create(log: AuditLog) {
    const entry = {
      event_type: log.type || 'system',
      payload: log.payload || { text: log.text },
      source: log.source || 'flowgent_mcp_node',
      lead_id: log.lead_id || null,
      created_at: new Date().toISOString()
    };
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .insert([entry])
        .select();
      if (error) throw error;
      return data;
    } catch (e) {
      return null;
    }
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
    } catch (e) {
      return null;
    }
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
      if (error) throw error;
      return data;
    } catch (e) { return null; }
  },
  async create(subscription: Partial<Subscription>) {
    try {
      const { data, error } = await supabase.from('subscriptions').insert([subscription]).select().single();
      if (error) throw error;
      return data;
    } catch (e) { return subscription; }
  },
  async verifyPayment(id: string, ref: string) {
    try {
      const { data, error } = await supabase.from('subscriptions').update({ status: 'active', payment_ref: ref }).eq('id', id);
      if (error) throw error;
      return data;
    } catch (e) { return null; }
  }
};

export const testInsForgeConnection = async () => {
  try {
    const { error } = await supabase.from('leads').select('id').limit(1);
    return !error;
  } catch { return false; }
};
