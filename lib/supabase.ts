import { createClient } from '@supabase/supabase-js';

/**
 * Flowgent™ Security & Persistence Layer
 * 
 * Safely resolves Supabase configuration and provides a configuration status flag.
 */

const getEnvValue = (key: string): string | undefined => {
  // 1. Check process.env (Standard/Replit)
  if (typeof process !== 'undefined' && process.env && (process.env as any)[key]) {
    return (process.env as any)[key];
  }
  
  // 2. Check import.meta.env (Vite/ESM)
  const metaEnv = (import.meta as any).env;
  if (metaEnv) {
    if (metaEnv[key]) return metaEnv[key];
    if (metaEnv[`VITE_${key}`]) return metaEnv[`VITE_${key}`];
  }
  
  return undefined;
};

const rawUrl = getEnvValue('SUPABASE_URL');
const rawKey = getEnvValue('SUPABASE_ANON_KEY');

// We determine configuration status based on presence and validity of keys
export const isSupabaseConfigured = !!(rawUrl && rawKey && !rawUrl.includes('placeholder'));

// Constructor requirements: Must provide a string even if in demo mode
const supabaseUrl = rawUrl || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = rawKey || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);