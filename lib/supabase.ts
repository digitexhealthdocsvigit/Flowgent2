
import { createClient } from '@supabase/supabase-js';
import { Lead, AuditLog } from '../types';

/**
 * INSFORGE NODE JSK8SNXZ - NEURAL CLOUD BRIDGE
 * Optimized for PostgREST v12.2 (InsForge Standard)
 */
export const INSFORGE_CONFIG = {
  URL: 'https://jsk8snxz.ap-southeast.insforge.app',
  KEY: 'ik_2ef615853868d11f26c1b6a8cd7550ad',
  REST_PATH: '/rest/v1'
};

export const activeProjectRef = "JSK8SNXZ";

/**
 * MANDATORY HEADERS FOR INSFORGE HANDSHAKE
 */
export const getHeaders = () => ({
  'apikey': INSFORGE_CONFIG.KEY,
  'Authorization': `Bearer ${INSFORGE_CONFIG.KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
});

export const leadOperations = {
  async getAll() {
    try {
      const response = await fetch(`${INSFORGE_CONFIG.URL}${INSFORGE_CONFIG.REST_PATH}/leads?select=*&order=created_at.desc&limit=15`, {
        headers: getHeaders()
      });
      if (!response.ok) throw new Error(`Handshake Rejected: ${response.status}`);
      return await response.json();
    } catch (e) {
      console.error("Cluster Sync Failure:", e);
      return null;
    }
  },
  async getContacts() {
    try {
      const response = await fetch(`${INSFORGE_CONFIG.URL}${INSFORGE_CONFIG.REST_PATH}/leads?select=*&ai_audit_completed=eq.true&order=readiness_score.desc`, {
        headers: getHeaders()
      });
      return response.ok ? await response.json() : null;
    } catch (e) { return null; }
  },
  async create(lead: Partial<Lead>) {
    try {
      const response = await fetch(`${INSFORGE_CONFIG.URL}${INSFORGE_CONFIG.REST_PATH}/leads`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ...lead,
          created_at: new Date().toISOString()
        })
      });
      return response.ok;
    } catch (e) { return false; }
  }
};

export const logOperations = {
  async create(log: Partial<AuditLog>) {
    try {
      await fetch(`${INSFORGE_CONFIG.URL}${INSFORGE_CONFIG.REST_PATH}/audit_logs`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ...log,
          created_at: new Date().toISOString(),
          source: log.source || 'flowgent_neural_node'
        })
      });
      return true;
    } catch (e) { return false; }
  },
  async getRecent() {
    try {
      const response = await fetch(`${INSFORGE_CONFIG.URL}${INSFORGE_CONFIG.REST_PATH}/audit_logs?select=*&order=created_at.desc&limit=15`, {
        headers: getHeaders()
      });
      return response.ok ? await response.json() : [];
    } catch (e) { return []; }
  }
};

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
      return response.ok;
    } catch (e) { return false; }
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

export const handleSupabaseError = (err: any): string => {
  if (typeof err === 'string') return err;
  return err.message || "Infrastructure Node Timeout: 0x82";
};

// Main SDK Client (kept for Auth compatibility)
export const supabase = createClient(INSFORGE_CONFIG.URL, INSFORGE_CONFIG.KEY);
