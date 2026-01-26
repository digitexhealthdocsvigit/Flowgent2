const INSFORGE_URL = 'https://jsk8snxz.ap-southeast.insforge.app';
const INSFORGE_KEY = 'ik_2ef615853868d11f26c1b6a8cd7550ad';

const headers = {
  'apikey': INSFORGE_KEY,
  'Authorization': `Bearer ${INSFORGE_KEY}`,
  'Content-Type': 'application/json'
};

export async function testConnection() {
  try {
    const response = await fetch(`${INSFORGE_URL}/rest/v1/leads?select=count&limit=1`, { headers });
    return response.ok;
  } catch {
    return false;
  }
}

export async function getLeads() {
  try {
    const response = await fetch(`${INSFORGE_URL}/rest/v1/leads?select=*&limit=10`, { headers });
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

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
