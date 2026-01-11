import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Increased warning limit to accommodate the comprehensive SaaS dashboard bundle
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      // Standard output configuration for maximum compatibility
      output: {
        format: 'es',
      },
    },
  },
});