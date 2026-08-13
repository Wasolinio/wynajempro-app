import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'prompt', nie 'autoUpdate' ([[Known-Issues]] #15, decyzja właściciela 2026-08-13):
      // nowa powłoka przejmuje stronę dopiero po kliknięciu „Odśwież" w pasku
      // (src/components/UpdatePrompt.jsx). Automatyczne przeładowanie mogłoby wypaść
      // w środku wypełniania rezerwacji i skasować niezapisane dane.
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      workbox: {
        navigateFallbackDenylist: [/^\/__\//]
      },
      manifest: {
        name: 'WynajemPRO',
        short_name: 'WynajemPRO',
        description: 'Aplikacja menedżera wynajmu krótkoterminowego',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  base: "/",
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'vendor';
          }
          if (id.includes('node_modules/firebase')) {
            return 'firebase';
          }
          if (id.includes('node_modules/lucide-react')) {
            return 'ui';
          }
        }
      }
    }
  }
})