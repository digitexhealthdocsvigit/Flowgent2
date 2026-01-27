import { createClient } from '@insforge/sdk';

// Environment variables should be loaded by Vite
const INSFORGE_URL = import.meta.env.VITE_INSFORGE_BASE_URL || process.env.VITE_INSFORGE_BASE_URL || 'https://jsk8snxz.ap-southeast.insforge.app';
const INSFORGE_KEY = import.meta.env.VITE_INSFORGE_ANON_KEY || process.env.VITE_INSFORGE_ANON_KEY || 'ik_2ef615853868d11f26c1b6a8cd7550ad';

if (!INSFORGE_URL || !INSFORGE_KEY) {
  console.warn('InsForge credentials missing. Please check your .env file.');
}

export const insforge = createClient({
  baseUrl: INSFORGE_URL,
  anonKey: INSFORGE_KEY
});

export default insforge;
