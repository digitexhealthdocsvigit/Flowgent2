
import { createClient } from '@supabase/supabase-js';
import { AuditLog, Project, Subscription, Lead } from '../types';

// InsForge Project Configuration - Locked for Launch
const INSFORGE_URL = 'https://jsk8snxz.ap-southeast.insforge.app';
const INSFORGE_KEY = 'ik_2ef615853868d11f26c1b6a8cd7550ad';

export const isSupabaseConfigured = true;

export const getProjectRef = (url: string): string => {
  try {
    const match = url.match(/https?:\/\/([^.]+)\./);
    return match ? match[1] : "insforge-node";
  } catch (e) {
    return "insforge-node";
  }
};

export const activeProjectRef = getProjectRef(INSFORGE_URL);

/**
 * The core infrastructure client for InsForge.
 * Includes explicit headers to request JSON and avoid HTML redirects.
 */
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

/**
 * Specifically catches the "Unexpected token <" or 404 errors.
 */
export const handleSupabaseError = (err: any): string => {
  const msg = err?.message || String(err);
  if (msg.includes('Unexpected token') || msg.includes('doctype') || msg.includes('JSON') || msg.includes('404')) {
    return "INFRASTRUCTURE MISMATCH: The API node at " + INSFORGE_URL + " returned an HTML page (404/Pause). Using Neural Continuity (Mock) mode.";
  }
  return msg;
};

export const leadOperations = {
  async upsert(lead: Partial<Lead>) {
    try {
      const { data, error } = await supabase
        .from('leads')
        .upsert(lead, { onConflict: 'place_id' })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (e) {
      console.warn("Supabase Upsert Failed: Node is volatile.", handleSupabaseError(e));
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
      console.warn("Supabase Fetch Failed: Returning Neural Continuity mocks.", handleSupabaseError(e));
      return null; // Return null to signal App.tsx to use MOCKS
    }
  }
};

export const logOperations = {
  async create(log: AuditLog) {
    const entry = {
      event_type: log.type || 'system',
      payload: log.payload || { text: log.text },
      source: log.source || 'flowgent',
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
  },
  async getAll() {
    try {
      const { data, error } = await supabase.from('projects').select('*');
      if (error) throw error;
      return data;
    } catch (e) { return null; }
  }
};

export const subscriptionOperations = {
  async create(sub: Partial<Subscription>) {
    try {
      const { data, error } = await supabase.from('subscriptions').insert([sub]).select().single();
      if (error) throw error;
      return data;
    } catch (e) { return sub; }
  },
  async getAll() {
    try {
      const { data, error } = await supabase.from('subscriptions').select('*');
      if (error) throw error;
      return data;
    } catch (e) { return null; }
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
