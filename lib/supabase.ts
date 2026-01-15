
import { createClient } from '@supabase/supabase-js';

/**
 * Flowgent™ Infrastructure Layer - InsForge Gateway
 */

// Your Specific InsForge Project Credentials
const INSFORGE_URL = 'https://jsk8snxz.ap-southeast.insforge.app';
const INSFORGE_KEY = 'ik_2ef615853868d11f26c1b6a8cd7550ad';

export const isSupabaseConfigured = true; // Hardcoded as we have the credentials

export const getProjectRef = (url: string): string => {
  try {
    const match = url.match(/https?:\/\/([^.]+)\./);
    return match ? match[1] : "insforge-node";
  } catch (e) {
    return "insforge-node";
  }
};

export const activeProjectRef = getProjectRef(INSFORGE_URL);

// Fix: Exported hasPotentialDnsIssue to satisfy the import in LoginScreen.tsx.
// Implementation checks for the 20-character rule unless it's an InsForge domain.
export const hasPotentialDnsIssue = activeProjectRef.length !== 20 && !INSFORGE_URL.includes('insforge.app');

export const supabase = createClient(INSFORGE_URL, INSFORGE_KEY);
