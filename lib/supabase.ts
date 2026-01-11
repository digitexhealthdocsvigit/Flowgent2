
import { createClient } from '@supabase/supabase-js';

/**
 * Flowgent™ Security & Persistence Layer
 * 
 * This module resolves Supabase configuration from multiple possible environment sources
 * (Replit, Netlify, Vite, etc.) and provides safe fallbacks to prevent top-level 
 * initialization errors that block the UI from rendering.
 */

const getEnvValue = (key: string): string | undefined => {
  // Check standard process.env (Node/Replit/CommonJS)
  if (typeof process !== 'undefined' && process.env && (process.env as any)[key]) {
    return (process.env as any)[key];
  }
  
  // Check Vite-style import.meta.env (ESM/Modern Bundlers)
  // We check for both the raw key and the VITE_ prefix
  const metaEnv = (import.meta as any).env;
  if (metaEnv) {
    if (metaEnv[key]) return metaEnv[key];
    if (metaEnv[`VITE_${key}`]) return metaEnv[`VITE_${key}`];
  }
  
  return undefined;
};

// Fallback to placeholders if env vars are missing to satisfy createClient's constructor
const supabaseUrl = getEnvValue('SUPABASE_URL') || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = getEnvValue('SUPABASE_ANON_KEY') || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
