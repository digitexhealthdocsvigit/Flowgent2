
import { createClient } from '@supabase/supabase-js';
import { AuditLog, Project, Subscription } from '../types';

// InsForge Project Configuration - Locked for Launch
const INSFORGE_URL = 'https://jsk8snxz.ap-southeast.insforge.app';
const INSFORGE_KEY = 'ik_2ef615853868d11f26c1b6a8cd7550ad';

export const isSupabaseConfigured = true;

/**
 * Extracts the project reference/subdomain from the InsForge URL
 */
export const getProjectRef = (url: string): string => {
  try {
    const match = url.match(/https?:\/\/([^.]+)\./);
    return match ? match[1] : "insforge-node";
  } catch (e) {
    return "insforge-node";
  }
};

export const activeProjectRef = getProjectRef(INSFORGE_URL);

export const hasPotentialDnsIssue = activeProjectRef.length !== 20 && !INSFORGE_URL.includes('insforge.app');

/**
 * The core infrastructure client for InsForge
 */
export const supabase = createClient(INSFORGE_URL, INSFORGE_KEY, {
  auth: {
    persistSession: false,
  },
  db: {
    schema: 'public'
  }
});

// Database Tables Interface
export interface Lead {
  id?: string;
  place_id?: string;
  business_name: string;
  phone?: string;
  city?: string;
  category?: string;
  rating?: number;
  readiness_score?: number;
  is_hot_opportunity?: boolean;
  est_contract_value?: number;
  projected_roi_lift?: number;
  has_website?: boolean;
  website?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
  score?: number; 
  temperature?: string;
  radar_metrics?: {
    presence?: number;
    automation?: number;
    seo?: number;
    capture?: number;
  };
  decision_logic?: any[];
}

export const leadOperations = {
  async upsert(lead: Lead) {
    const { data, error } = await supabase
      .from('leads')
      .upsert(lead, { onConflict: 'place_id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async updateStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('leads')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    return data;
  }
};

export const projectOperations = {
  async create(project: Omit<Project, 'id'>) {
    const { data, error } = await supabase
      .from('projects')
      .insert([project])
      .select()
      .single();
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
  async create(sub: Omit<Subscription, 'id'>) {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([sub])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async getAll() {
    const { data, error } = await supabase.from('subscriptions').select('*');
    if (error) throw error;
    return data || [];
  },
  async verifyPayment(id: string, ref: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ status: 'active', payment_ref: ref })
      .eq('id', id);
    if (error) throw error;
    return data;
  }
};

export const logOperations = {
  async create(log: Omit<AuditLog, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert([{ ...log, created_at: new Date().toISOString() }])
      .select();
    if (error) console.error("Log entry failed", error);
    return data;
  },

  async getRecent() {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) return [];
    return data;
  }
};

export const testInsForgeConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('count')
      .limit(1);
    if (error) return false;
    return true;
  } catch (err) {
    return false;
  }
};
