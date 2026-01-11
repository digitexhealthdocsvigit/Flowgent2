import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Raised to 2000kB to definitively silence the warning for large SaaS bundles
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        // Breaking down the bundle into smaller, more manageable pieces for better caching
        manualChunks: {
          'vendor-core': ['react', 'react-dom'],
          'vendor-utils': ['@supabase/supabase-js', '@google/genai'],
          'vendor-ui': ['lucide-react'] // Assuming potential future use
        },
      },
    },
    // Ensure clean builds
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
      },
    },
  },
});