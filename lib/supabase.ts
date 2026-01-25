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
 * NEURAL HANDSHAKE: CONNECTION PROBE
 */
export async function testInsForgeConnection() {
  try {
    const response = await fetch(`${INSFORGE_URL}/rest/v1/leads?select=id&limit=1`, { headers });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * LEAD OPERATIONS: DIRECT REST PROTOCOL
 */
export const leadOperations = {
  async getAll(): Promise<Lead[]> {
    try {
      const response = await fetch(`${INSFORGE_URL}/rest/v1/leads?select=*&order=created_at.desc&limit=25`, { headers });
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
 * LOG OPERATIONS: NEURAL TELEMETRY
 */
export const logOperations = {
  async getRecent(): Promise<AuditLog[]> {
    try {
      const response = await fetch(`${INSFORGE_URL}/rest/v1/audit_logs?select=*&order=created_at.desc&limit=15`, { headers });
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
          source: log.source || 'flowgent_frontend'
        })
      });
      return response.ok;
    } catch {
      return false;
    }
  }
};

/**
 * REVENUE NODE OPERATIONS
 */
export const subscriptionOperations = {
  async getAll(): Promise<Subscription[]> {
    try {
      const response = await fetch(`${INSFORGE_URL}/rest/v1/subscriptions?select=*&order=nextBilling.desc`, { headers });
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
          status: 'active',
          payment_ref: paymentRef,
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

// Main SDK Client kept for authentication compatibility only
export const supabase = createClient(INSFORGE_URL, INSFORGE_KEY);
