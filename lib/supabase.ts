// Direct REST client for InsForge
const INSFORGE_URL = 'https://jsk8snxz.ap-southeast.insforge.app';
const INSFORGE_KEY = 'ik_2ef615853868d11f26c1b6a8cd7550ad';

const headers = {
  'apikey': INSFORGE_KEY,
  'Authorization': `Bearer ${INSFORGE_KEY}`,
  'Content-Type': 'application/json'
};

export const activeProjectRef = 'JSK8SNXZ';

// Test connection
export async function testConnection() {
  try {
    const response = await fetch(`${INSFORGE_URL}/rest/v1/leads?select=count&limit=1`, { headers });
    return response.ok;
  } catch {
    return false;
  }
}

// Get all leads
export async function getLeads() {
  try {
    const response = await fetch(`${INSFORGE_URL}/rest/v1/leads?select=*&order=created_at.desc&limit=10`, { headers });
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

// Get hot leads
export async function getHotLeads() {
  try {
    const response = await fetch(
      `${INSFORGE_URL}/rest/v1/leads?select=*&ai_audit_completed=eq.true&is_hot_opportunity=eq.true&order=readiness_score.desc`,
      { headers }
    );
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

// Add new lead
export async function addLead(leadData: any) {
  try {
    const response = await fetch(`${INSFORGE_URL}/rest/v1/leads`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=representation' },
      body: JSON.stringify(leadData)
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data[0];
  } catch {
    return null;
  }
}

// Error handler
export const handleSupabaseError = (err: any): string => {
  if (err?.message) return err.message;
  if (typeof err === 'string') return err;
  return 'An error occurred';
};

// Dummy supabase object for compatibility
export const supabase = {
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null })
  })
};
```

### STEP 3: Update Railway Environment Variables

Make sure these are set in Railway:
```
OPENAI_API_KEY=sk-proj-vovzQCT0Lt-4VvkaiOPY3tSI-1w54VPv3-OcCb4CCV_ihRsc-KSIWmGKFHNpbfed1ijUmjPK6qT3BlbkFJha8QpjdMJA......
SUPABASE_URL=https://jsk8snxz.ap-southeast.insforge.app
SUPABASE_SERVICE_KEY=ik_2ef615853868d11f26c1b6a8cd7550ad
POLL_INTERVAL=300000
