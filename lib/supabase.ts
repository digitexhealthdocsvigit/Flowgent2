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
 * Includes explicit headers to request JSON and avoid HTML redirects from misconfigured proxies.
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
 * Resolves the "Unexpected Token <" error.
 * This occurs when the Supabase URL points to a project that is paused, deleted,
 * or where the proxy serves an HTML landing page instead of the REST API.
 */
export const handleSupabaseError = (err: any): string => {
  const msg = err?.message || String(err);
  if (msg.includes('Unexpected token') || msg.includes('doctype') || msg.includes('JSON')) {
    return "GATEWAY MISMATCH: THE INFRASTRUCTURE (URL) RETURNED AN HTML PAGE INSTEAD OF API DATA. THIS USUALLY MEANS THE PROJECT IS PAUSED OR THE URL IS MISCONFIGURED. PLEASE USE 'EMERGENCY OVERRIDE' TO BOOT IN SIMULATION MODE.";
  }
  return msg;
};

// In-memory continuity buffer for when the DB is unreachable
const _logBuffer: AuditLog[] = [];

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
      console.warn("DB Persistence unavailable. Lead stored in transient memory.", e);
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
      return data || [];
    } catch (e) {
      // Return empty array to trigger mock fallback in the App component
      return [];
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
    
    // Always add to local buffer for immediate UI feedback
    _logBuffer.unshift({ ...log, created_at: entry.created_at } as AuditLog);
    if (_logBuffer.length > 50) _logBuffer.pop();

    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .insert([entry])
        .select();
      if (error) throw error;
      return data;
    } catch (error) {
      console.warn("Audit persistence failed. Using Neural Continuity Buffer.", error);
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
      return (data || []).map(d => ({
        id: d.id,
        text: d.payload?.text || `Event: ${d.event_type}`,
        type: d.event_type,
        payload: d.payload,
        created_at: d.created_at,
        lead_id: d.lead_id
      }));
    } catch (error) {
      // Fallback to local memory buffer if DB is returning HTML/404
      return _logBuffer.map(l => ({
        ...l,
        text: l.payload?.text || l.text
      }));
    }
  }
};

export const projectOperations = {
  async create(project: Partial<Project>) {
    try {
      const { data, error } = await supabase.from('projects').insert([project]).select().single();
      if (error) throw error;
      return data;
    } catch (e) {
      return project;
    }
  },
  async getAll() {
    try {
      const { data, error } = await supabase.from('projects').select('*');
      if (error) throw error;
      return data || [];
    } catch (e) {
      return [];
    }
  }
};

export const subscriptionOperations = {
  async create(sub: Partial<Subscription>) {
    try {
      const { data, error } = await supabase.from('subscriptions').insert([sub]).select().single();
      if (error) throw error;
      return data;
    } catch (e) {
      return sub;
    }
  },
  async getAll() {
    try {
      const { data, error } = await supabase.from('subscriptions').select('*');
      if (error) throw error;
      return data || [];
    } catch (e) {
      return [];
    }
  },
  async verifyPayment(id: string, ref: string) {
    try {
      const { data, error } = await supabase.from('subscriptions').update({ status: 'active', payment_ref: ref }).eq('id', id);
      if (error) throw error;
      return data;
    } catch (e) {
      return null;
    }
  }
};

export const testInsForgeConnection = async () => {
  try {
    const { error } = await supabase.from('leads').select('id').limit(1);
    // If it returns an HTML error, error will be truthy or JSON parse will fail
    return !error;
  } catch {
    return false;
  }
};