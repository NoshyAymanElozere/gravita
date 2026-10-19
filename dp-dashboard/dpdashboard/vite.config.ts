import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-grid': ['ag-grid-community', 'ag-grid-react'],
          'vendor-charts': ['recharts'],
          'vendor-query': ['@tanstack/react-query', 'axios', 'i18next', 'react-i18next'],
        },
      },
    },
  },
  server: {
    port: 5173,
  },
  preview: {
    port: 5173,
  },
})
