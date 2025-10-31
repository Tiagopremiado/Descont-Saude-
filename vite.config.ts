import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: "Descont'Saúde PWA",
        short_name: "Descont'Saúde",
        description: "A web system for Descont'Saúde to manage clients, dependents, and payments, providing a dedicated portal for clients to access their information and services.",
        theme_color: '#750721',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '.',
        icons: [
          {
            src: '/favicon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
})
