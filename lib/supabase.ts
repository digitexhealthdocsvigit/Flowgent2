import { createClient } from '@supabase/supabase-js';
import { AuditLog, Project, Subscription, Lead, Deal } from '../types';

/**
 * FINAL MAPPING: Flowgent2 x InsForge Neural Cloud Bridge
 */
export const INSFORGE_CONFIG = {
  URL: 'https://jsk8snxz.ap-southeast.insforge.app',
  KEY: 'ik_2ef615853868d11f26c1b6a8cd7550ad',
  REST_PATH: '/rest/v1'
};

export const activeProjectRef = "01144a09-e1ef-40a7-b32b-bfbbd5bafea9";

export const supabase = createClient(INSFORGE_CONFIG.URL, INSFORGE_CONFIG.KEY);

export const getHeaders = () => ({
  'apikey': INSFORGE_CONFIG.KEY,
  'Authorization': `Bearer ${INSFORGE_CONFIG.KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
});

export const handleSupabaseError = (err: any): string => {
  if (typeof err === 'string') return err;
  return err.message || "Infrastructure Node Timeout: 0x82";
};

export const leadOperations = {
  async getAll() {
    try {
      const response = await fetch(`${INSFORGE_CONFIG.URL}${INSFORGE_CONFIG.REST_PATH}/leads?select=*&order=created_at.desc&limit=20`, {
        headers: getHeaders()
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (e) {
      console.error("Lead Sync Failure:", e);
      return null;
    }
  },
  async upsert(lead: Partial<Lead>) {
    try {
      const response = await fetch(`${INSFORGE_CONFIG.URL}${INSFORGE_CONFIG.REST_PATH}/leads`, {
        method: 'POST',
        headers: { ...getHeaders(), 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify({
          ...lead,
          last_audit_at: new Date().toISOString()
        })
      });
      if (!response.ok) throw new Error("POST Failed");
      const data = await response.json();
      return data[0];
    } catch (e) {
      throw new Error(handleSupabaseError(e));
    }
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
      const response = await fetch(`${INSFORGE_CONFIG.URL}${INSFORGE_CONFIG.REST_PATH}/audit_logs`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(entry)
      });
      return response.ok;
    } catch (e) { return false; }
  },
  async getRecent() {
    try {
      const response = await fetch(`${INSFORGE_CONFIG.URL}${INSFORGE_CONFIG.REST_PATH}/audit_logs?select=*&order=created_at.desc&limit=15`, {
        headers: getHeaders()
      });
      return await response.json();
    } catch (e) { return null; }
  }
};

// Fix: Added subscriptionOperations to handle AMC settlement and revenue node synchronization.
export const subscriptionOperations = {
  async verifyPayment(id: string, paymentRef: string) {
    try {
      const response = await fetch(`${INSFORGE_CONFIG.URL}${INSFORGE_CONFIG.REST_PATH}/subscriptions?id=eq.${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({
          status: 'active',
          payment_ref: paymentRef,
          updated_at: new Date().toISOString()
        })
      });
      if (!response.ok) throw new Error("PATCH Failed");
      return true;
    } catch (e) {
      throw new Error(handleSupabaseError(e));
    }
  }
};

export const testInsForgeConnection = async () => {
  try {
    const response = await fetch(`${INSFORGE_CONFIG.URL}${INSFORGE_CONFIG.REST_PATH}/leads?select=id&limit=1`, {
      headers: getHeaders()
    });
    return response.ok;
  } catch { return false; }
};

export const getEnvironmentTelemetry = () => ({
  SUPABASE_URL: true,
  SUPABASE_ANON_KEY: true,
  VERCEL_ENV: 'production',
  CONNECTED_ENDPOINT: 'jsk8snxz'
});