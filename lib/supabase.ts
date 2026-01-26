import { createClient } from '@supabase/supabase-js';
import { Lead, AuditLog, Subscription } from '../types';

/**
 * INSFORGE NODE JSK8SNXZ - PRODUCTION REST CONFIGURATION
 */
const INSFORGE_URL = 'https://jsk8snxz.ap-southeast.insforge.app';
const INSFORGE_KEY = 'ik_2ef615853868d11f26c1b6a8cd7550ad';

const headers = {
  'apikey': INSFORGE_KEY,
  'Authorization': `Bearer ${INSFORGE_KEY}`,
  'Content-Type': 'application/json'
};

export const activeProjectRef = "JSK8SNXZ";

/**
 * NEURAL HANDSHAKE: Connection probe
 * Checks if the leads table exists to confirm handshake.
 */
export async function testInsForgeConnection() {
  try {
    const response = await fetch(`${INSFORGE_URL}/rest/v1/leads?select=id&limit=1`, { headers });
    if (response.status === 404) {
      console.warn("Handshake Blocked: Table 'leads' not found in JSK8SNXZ cluster.");
      return false;
    }
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * LEAD OPERATIONS: Direct REST Protocol
 */
export const leadOperations = {
  async getAll(): Promise<Lead[]> {
    try {
      const response = await fetch(`${INSFORGE_URL}/rest/v1/leads?select=*&order=created_at.desc&limit=15`, { headers });
      return response.ok ? await response.json() : [];
    } catch {
      return [];
    }
  },

  async getHotLeads(): Promise<Lead[]> {
    try {
      const response = await fetch(
        `${INSFORGE_URL}/rest/v1/leads?select=*&ai_audit_completed=eq.true&is_hot_opportunity=eq.true&order=readiness_score.desc`,
        { headers }
      );
      return response.ok ? await response.json() : [];
    } catch {
      return [];
    }
  },

  async create(lead: Partial<Lead>) {
    try {
      const response = await fetch(`${INSFORGE_URL}/rest/v1/leads`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify({
          ...lead,
          created_at: new Date().toISOString()
        })
      });
      return response.ok;
    } catch {
      return false;
    }
  },

  async update(id: string, data: Partial<Lead>) {
    try {
      const response = await fetch(`${INSFORGE_URL}/rest/v1/leads?id=eq.${id}`, {
        method: 'PATCH',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify(data)
      });
      return response.ok;
    } catch {
      return false;
    }
  }
};

/**
 * LOG OPERATIONS: Telemetry logs
 */
export const logOperations = {
  async getRecent(): Promise<AuditLog[]> {
    try {
      const response = await fetch(`${INSFORGE_URL}/rest/v1/audit_logs?select=*&order=created_at.desc&limit=10`, { headers });
      return response.ok ? await response.json() : [];
    } catch {
      return [];
    }
  },
  async create(log: Partial<AuditLog>) {
    try {
      const response = await fetch(`${INSFORGE_URL}/rest/v1/audit_logs`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify({
          ...log,
          created_at: new Date().toISOString(),
          source: 'flowgent_frontend'
        })
      });
      return response.ok;
    } catch {
      return false;
    }
  }
};

export const subscriptionOperations = {
  async getAll(): Promise<Subscription[]> {
    try {
      const response = await fetch(`${INSFORGE_URL}/rest/v1/subscriptions?select=*&order=created_at.desc`, { headers });
      return response.ok ? await response.json() : [];
    } catch {
      return [];
    }
  },
  async verifyPayment(id: string, paymentRef: string) {
    try {
      const response = await fetch(`${INSFORGE_URL}/rest/v1/subscriptions?id=eq.${id}`, {
        method: 'PATCH',
        headers: { ...headers, 'Prefer': 'return=representation' },
        body: JSON.stringify({
          payment_ref: paymentRef,
          status: 'active',
          updated_at: new Date().toISOString()
        })
      });
      return response.ok;
    } catch {
      return false;
    }
  }
};

export const handleSupabaseError = (err: any): string => {
  if (typeof err === 'string') return err;
  return err.message || "Infrastructure Node Timeout: 0x82";
};

// Main SDK Client kept for authentication logic
export const supabase = createClient(INSFORGE_URL, INSFORGE_KEY);