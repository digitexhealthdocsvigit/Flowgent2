import { createClient } from '@supabase/supabase-js';

/**
 * Flowgent™ Security & Persistence Layer
 * 
 * Safely resolves Supabase configuration and provides a configuration status flag.
 */

const getEnvValue = (key: string): string | undefined => {
  let val: string | undefined;
  
  // 1. Check process.env (Standard/Replit)
  if (typeof process !== 'undefined' && process.env && (process.env as any)[key]) {
    val = (process.env as any)[key];
  }
  
  // 2. Check import.meta.env (Vite/ESM)
  const metaEnv = (import.meta as any).env;
  if (!val && metaEnv) {
    if (metaEnv[key]) val = metaEnv[key];
    else if (metaEnv[`VITE_${key}`]) val = metaEnv[`VITE_${key}`];
  }
  
  return val?.trim();
};

const rawUrl = getEnvValue('SUPABASE_URL');
const rawKey = getEnvValue('SUPABASE_ANON_KEY');

export const isSupabaseConfigured = !!(rawUrl && rawKey && !rawUrl.includes('placeholder'));

/**
 * Extracts the 20-character project reference from the URL
 */
export const getProjectRef = (url: string | undefined): string => {
  if (!url) return "";
  try {
    // Pattern matches the subdomain before .supabase.co
    const match = url.match(/https?:\/\/([^.]+)\.supabase\.co/);
    return match ? match[1] : "";
  } catch (e) {
    return "";
  }
};

const projectRef = getProjectRef(rawUrl);

// Most Supabase projects have exactly 20 characters. 
// Truncated IDs (like the 19-char one in the logs) cause DNS failures.
export const hasPotentialDnsIssue = isSupabaseConfigured && (projectRef.length < 20);
export const activeProjectRef = projectRef;

// Constructor requirements: Must provide a string even if in demo mode
const supabaseUrl = rawUrl || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = rawKey || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);