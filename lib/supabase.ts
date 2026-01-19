
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
 * Specifically catches the "Unexpected Token <" error which occurs when 
 * the URL points to a web page/dashboard instead of the API.
 */
export const handleSupabaseError = (err: any): string => {
  const msg = err?.message || String(err);
  if (msg.includes('Unexpected token') || msg.includes('doctype') || msg.includes('JSON')) {
    return "INFRASTRUCTURE ERROR: The gateway (URL) returned an HTML page. This usually means the Supabase URL is pointing to a dashboard/landing page instead of the API endpoint. Use 'Emergency Override' to continue.";
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
      console.warn("DB Upsert failed, using volatile memory.", e);
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
      console.warn("Audit persistence failed. Storing in Continuity Buffer.", error);
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
      return _logBuffer.map(l => ({
        ...l,
        text: l.payload?.text || l.text
      }));
    }
  }
};

export const projectOperations = {
  async create(project: Partial<Project>) {
    const { data, error } = await supabase.from('projects').insert([project]).select().single();
    if (error) throw error;
    return data;
  },
  async getAll() {
    const { data, error } = await supabase.from('projects').select('*');
    if (error) throw error;
    return data || [];
  }
};

export const subscriptionOperations = {
  async create(sub: Partial<Subscription>) {
    const { data, error } = await supabase.from('subscriptions').insert([sub]).select().single();
    if (error) throw error;
    return data;
  },
  async getAll() {
    const { data, error } = await supabase.from('subscriptions').select('*');
    if (error) throw error;
    return data || [];
  },
  async verifyPayment(id: string, ref: string) {
    const { data, error } = await supabase.from('subscriptions').update({ status: 'active', payment_ref: ref }).eq('id', id);
    if (error) throw error;
    return data;
  }
};

export const testInsForgeConnection = async () => {
  try {
    const { error } = await supabase.from('leads').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
};
