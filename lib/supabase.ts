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
  
  // Clean up and return
  const trimmed = val?.trim();
  if (!trimmed) return undefined;
  
  // Basic validation for URL to catch common "Copy-Paste" errors
  if (key === 'SUPABASE_URL' && trimmed.startsWith('http') && !trimmed.includes('.supabase.co')) {
    console.warn(`Flowgent Warning: SUPABASE_URL "${trimmed}" looks invalid.`);
  }
  
  return trimmed;
};

const rawUrl = getEnvValue('SUPABASE_URL');
const rawKey = getEnvValue('SUPABASE_ANON_KEY');

// Project Ref check: Supabase URLs usually have a 20-character project ref
// oxecokangorufymfhxw is 18 chars - likely missing 2 characters if it's the standard format.
const looksLikeValidRef = rawUrl?.split('//')[1]?.split('.')[0]?.length === 20;

export const isSupabaseConfigured = !!(rawUrl && rawKey && !rawUrl.includes('placeholder'));
export const hasPotentialDnsIssue = isSupabaseConfigured && !looksLikeValidRef;

// Constructor requirements: Must provide a string even if in demo mode
const supabaseUrl = rawUrl || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = rawKey || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);