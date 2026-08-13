import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'
import { initMonitoring } from './monitoring'

// Zbieranie błędów — bez VITE_SENTRY_DSN nie robi nic i nie dociąga SDK.
initMonitoring()

// Rozwiązanie problemu "Failed to fetch dynamically imported module" (cache PWA/Vite)
window.addEventListener('vite:preloadError', () => {
  window.location.reload();
});
// Inicjalizacja klienta React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Firestore nasłuchuje w tle, więc nie musimy refetchować przy focusie okna
      staleTime: 1000 * 60 * 5, // 5 minut
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
