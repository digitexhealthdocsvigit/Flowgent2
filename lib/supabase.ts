
import { createClient } from '@supabase/supabase-js';

/**
 * Flowgent™ Infrastructure Layer - InsForge Production Gateway
 */

// InsForge Project Credentials
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

// InsForge handles DNS differently, so we assume valid pathing
export const hasPotentialDnsIssue = false;

/**
 * The core infrastructure client for InsForge
 */
export const supabase = createClient(INSFORGE_URL, INSFORGE_KEY);
