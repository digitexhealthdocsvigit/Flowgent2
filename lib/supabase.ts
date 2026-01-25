import { createClient } from '@supabase/supabase-js';
import { Lead, AuditLog, Subscription } from '../types';

// Direct REST client for InsForge
const INSFORGE_URL = 'https://jsk8snxz.ap-southeast.insforge.app';
const INSFORGE_KEY = 'ik_2ef615853868d11f26c1b6a8cd7550ad';

const headers = {
  'apikey': INSFORGE_KEY,
  'Authorization': `Bearer ${INSFORGE_KEY}`,
  'Content-Type': 'application/json'
};

/**
 * NEURAL HANDSHAKE: CONNECTION PROBE
 */
export async function testConnection() {
  try {
    const response = await fetch(`${INSFORGE_URL}/rest/v1/leads?select=id&limit=1`, { headers });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * LEAD RETRIEVAL: DISCOVERY NODES
 */
export async function getLeads() {
  try {
    const response = await fetch(`${INSFORGE_URL}/rest/v1/leads?select=*&limit=10`, { headers });
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

/**
 * HOT OPPORTUNITY RETRIEVAL: AGENT ZERO ENRICHED
 */
export async function getHotLeads() {
  try {
    const response = await fetch(
      `${INSFORGE_URL}/rest/v1/leads?select=*&ai_audit_completed=eq.true&is_hot_opportunity=eq.true`,
      { headers }
    );
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

/**
 * COMPATIBILITY LAYER FOR FRONTEND COMPONENTS
 * This section ensures that existing UI components function correctly 
 * using the new direct REST logic without requiring modifications to those files.
 */
export const activeProjectRef = "JSK8SNXZ";
export const testInsForgeConnection = testConnection;

export const leadOperations = {
  getAll: getLeads,
  getHotLeads: getHotLeads,
  create: async (lead: Partial<Lead>) => {
    try {
      const response = await fetch(`${INSFORGE_URL}/rest/v1/leads`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify({ ...lead, created_at: new Date().toISOString() })
      });
      return response.ok;
    } catch { return false; }
  },
  update: async (id: string, data: Partial<Lead>) => {
    try {
      const response = await fetch(`${INSFORGE_URL}/rest/v1/leads?id=eq.${id}`, {
        method: 'PATCH',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify(data)
      });
      return response.ok;
    } catch { return false; }
  }
};

export const logOperations = {
  getRecent: async (): Promise<AuditLog[]> => {
    try {
      const response = await fetch(`${INSFORGE_URL}/rest/v1/audit_logs?select=*&order=created_at.desc&limit=15`, { headers });
      return response.ok ? await response.json() : [];
    } catch { return []; }
  },
  create: async (log: Partial<AuditLog>) => {
    try {
      const response = await fetch(`${INSFORGE_URL}/rest/v1/audit_logs`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify({ ...log, created_at: new Date().toISOString() })
      });
      return response.ok;
    } catch { return false; }
  }
};

export const subscriptionOperations = {
  getAll: async (): Promise<Subscription[]> => {
    try {
      const response = await fetch(`${INSFORGE_URL}/rest/v1/subscriptions?select=*&order=nextBilling.desc`, { headers });
      return response.ok ? await response.json() : [];
    } catch { return []; }
  },
  verifyPayment: async (id: string, paymentRef: string) => {
    try {
      const response = await fetch(`${INSFORGE_URL}/rest/v1/subscriptions?id=eq.${id}`, {
        method: 'PATCH',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify({
          status: 'active',
          payment_ref: paymentRef,
          updated_at: new Date().toISOString()
        })
      });
      return response.ok;
    } catch { return false; }
  }
};

export const handleSupabaseError = (err: any): string => {
  if (typeof err === 'string') return err;
  return err.message || "Infrastructure Node Timeout: 0x82";
};

// Kept exclusively for Auth logic in LoginScreen.tsx
export const supabase = createClient(INSFORGE_URL, INSFORGE_KEY);