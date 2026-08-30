import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react'
            }
            if (id.includes('framer-motion') || id.includes('lucide-react')) {
              return 'vendor-ui'
            }
            if (id.includes('@tanstack') || id.includes('axios')) {
              return 'vendor-query'
            }
            if (id.includes('i18next')) {
              return 'vendor-i18n'
            }
            if (id.includes('jspdf')) {
              return 'vendor-pdf'
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
})
