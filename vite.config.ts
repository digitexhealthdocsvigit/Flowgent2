import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Raised to 2000kB to silence warnings for the integrated SaaS bundle
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        // Optimized chunking strategy using only confirmed available modules
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-lib': ['@supabase/supabase-js', '@google/genai']
        },
      },
    },
    // Minification settings for production efficiency
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Maintain logs for founder diagnostics
      },
    },
  },
});