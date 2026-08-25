import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  // Rozgrzewka serwera deweloperskiego ([[Known-Issues]] #18).
  // PO CO: `vite dev` transformuje moduły dopiero na żądanie. Lokalnie graf jest ciepły
  // w `node_modules/.vite` i trwa to milisekundy, ale na runnerze CI jest zimny przy KAŻDYM
  // przebiegu — pierwsze wejście na trasę publiczną nie mieściło się w oknie asercji
  // i testy widziały pusty `#root`. Rozgrzewka każe Vite przemielić graf od razu po starcie,
  // zamiast czekać na pierwszego klienta.
  server: {
    warmup: {
      clientFiles: ['./src/main.jsx', './src/App.jsx', './src/pages/**/*.jsx'],
    },
  },
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
        // Ten sam błąd co w index.html: niebieski z szablonu, obcy identyfikacji.
        // theme_color maluje pasek systemowy i ekran startowy PWA.
        theme_color: '#17150F',
        background_color: '#F3EFE5',
        display: 'standalone',
        icons: [
          // Oba pliki to render wariantu maskable (pełne tło atramentowe, paski
          // w polu bezpiecznym 80%), więc deklarujemy 'any maskable' — system może
          // je dociąć do własnego kształtu bez obcinania znaku.
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
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