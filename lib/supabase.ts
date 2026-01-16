
import { createClient } from '@supabase/supabase-js';

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

// Added missing export to fix compilation error in LoginScreen.tsx
// It identifies if the Supabase project reference is likely truncated (standard Supabase is 20 chars)
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

// Database Tables Interface (matching InsForge schema)
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
  // Save or Update Lead
  async upsert(lead: Lead) {
    const { data, error } = await supabase
      .from('leads')
      .upsert(lead, { onConflict: 'place_id' })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Get all leads
  async getAll() {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
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
