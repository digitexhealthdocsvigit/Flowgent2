
import { createClient } from '@supabase/supabase-js';
import { Lead, AuditLog, Subscription } from '../types';

/**
 * INSFORGE NODE JSK8SNXZ - PRODUCTION REST CONFIGURATION
 */
export const INSFORGE_CONFIG = {
  URL: 'https://jsk8snxz.ap-southeast.insforge.app',
  REST_PATH: '/rest/v1',
  API_KEY: 'ik_2ef615853868d11f26c1b6a8cd7550ad'
};

export const activeProjectRef = "JSK8SNXZ";

/**
 * MANDATORY HEADERS FOR INSFORGE HANDSHAKE
 */
export const getHeaders = () => ({
  'apikey': INSFORGE_CONFIG.API_KEY,
  'Authorization': `Bearer ${INSFORGE_CONFIG.API_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
});

export const leadOperations = {
  async getAll() {
    try {
      const url = `${INSFORGE_CONFIG.URL}${INSFORGE_CONFIG.REST_PATH}/leads?select=*&order=created_at.desc&limit=25`;
      const response = await fetch(url, { headers: getHeaders() });
      if (!response.ok) throw new Error(`Handshake Rejected: ${response.status}`);
      return await response.json();
    } catch (e) {
      console.error("Cluster Sync Failure:", e);
      return null;
    }
  },

  async getHotLeads() {
    try {
      const url = `${INSFORGE_CONFIG.URL}${INSFORGE_CONFIG.REST_PATH}/leads?select=*&ai_audit_completed=eq.true&is_hot_opportunity=eq.true&order=readiness_score.desc`;
      const response = await fetch(url, { headers: getHeaders() });
      return response.ok ? await response.json() : null;
    } catch (e) {
      console.error("Hot Lead Fetch Failure:", e);
      return null;
    }
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
  },

  async update(id: string, data: Partial<Lead>) {
    try {
      const response = await fetch(`${INSFORGE_CONFIG.URL}${INSFORGE_CONFIG.REST_PATH}/leads?id=eq.${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return response.ok;
    } catch (e) { return false; }
  }
};

// Added subscriptionOperations to resolve module resolution error in SubscriptionsView.tsx
export const subscriptionOperations = {
  async getAll() {
    try {
      const url = `${INSFORGE_CONFIG.URL}${INSFORGE_CONFIG.REST_PATH}/subscriptions?select=*&order=nextBilling.desc`;
      const response = await fetch(url, { headers: getHeaders() });
      return response.ok ? await response.json() : [];
    } catch (e) {
      console.error("Subscription Fetch Failure:", e);
      return [];
    }
  },
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

export const logOperations = {
  async getRecent() {
    try {
      const url = `${INSFORGE_CONFIG.URL}${INSFORGE_CONFIG.REST_PATH}/audit_logs?select=*&order=created_at.desc&limit=15`;
      const response = await fetch(url, { headers: getHeaders() });
      return response.ok ? await response.json() : [];
    } catch (e) { return []; }
  },
  async create(log: Partial<AuditLog>) {
    try {
      await fetch(`${INSFORGE_CONFIG.URL}${INSFORGE_CONFIG.REST_PATH}/audit_logs`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ...log,
          created_at: new Date().toISOString(),
          source: log.source || 'flowgent_frontend'
        })
      });
      return true;
    } catch (e) { return false; }
  }
};

export const testInsForgeConnection = async () => {
  try {
    const url = `${INSFORGE_CONFIG.URL}${INSFORGE_CONFIG.REST_PATH}/leads?select=id&limit=1`;
    const response = await fetch(url, { headers: getHeaders() });
    return response.ok;
  } catch { return false; }
};

export const handleSupabaseError = (err: any): string => {
  if (typeof err === 'string') return err;
  return err.message || "Infrastructure Node Timeout: 0x82";
};

// Main SDK Client kept for authentication compatibility
export const supabase = createClient(INSFORGE_CONFIG.URL, INSFORGE_CONFIG.API_KEY);
