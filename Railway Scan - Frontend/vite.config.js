/* eslint-disable no-undef */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'unsafe-none',
      'Cross-Origin-Embedder-Policy': 'unsafe-none',
      'Cross-Origin-Resource-Policy': 'cross-origin',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks - handle node_modules
          if (id.includes('node_modules')) {
            // React core packages (most specific first)
            if (id.includes('/react/') || id.includes('/react-dom/') || 
                id.includes('/react-router-dom/') || id.includes('/react-router/') ||
                id.includes('/scheduler/') || id.includes('/@remix-run/')) {
              return 'react-vendor'
            }
            // Chart libraries
            if (id.includes('/recharts/') || id.includes('/d3-') || 
                id.includes('/victory-vendor/')) {
              return 'chart-vendor'
            }
            // Form libraries
            if (id.includes('/react-hook-form/') || id.includes('/yup/') || 
                id.includes('/@hookform/')) {
              return 'form-vendor'
            }
            // All other vendor dependencies
            return 'vendor'
          }

          // Role-based code splitting for application code
          if (id.includes('src/routes/InspectorRoutes') || 
              id.includes('src/pages/inspector') || 
              id.includes('src/components/inspector') ||
              id.includes('src/layouts/InspectorLayout')) {
            return 'inspector'
          }

          if (id.includes('src/routes/DepotOfficerRoutes') || 
              id.includes('src/pages/depot-officer') || 
              id.includes('src/components/depot-officer') ||
              id.includes('src/layouts/DepotOfficerLayout')) {
            return 'depot-officer'
          }

          if (id.includes('src/routes/ZonalManagerRoutes') || 
              id.includes('src/pages/zonal-manager') || 
              id.includes('src/components/zonal-manager') ||
              id.includes('src/layouts/ZonalManagerLayout')) {
            return 'zonal-manager'
          }

          if (id.includes('src/routes/AdminRoutes') || 
              id.includes('src/pages/admin') || 
              id.includes('src/components/admin') ||
              id.includes('src/layouts/AdminLayout')) {
            return 'admin'
          }
        },
      },
    },
  },
})
