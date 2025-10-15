import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendor libraries em chunks específicos
          'mui': ['@mui/material', '@mui/icons-material', '@mui/x-data-grid', '@mui/x-date-pickers'],
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase': ['@supabase/supabase-js'],
          'utils': ['date-fns', 'zod', 'lucide-react'],
          'forms': ['react-hook-form', '@hookform/resolvers'],
          'charts': ['recharts'],
          'query': ['@tanstack/react-query', '@tanstack/react-table'],
          'notifications': ['react-hot-toast']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: true,
      },
    },
  },
}));
