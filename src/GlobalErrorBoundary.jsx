import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { BrandStyles } from './styles/brand';

// Widok fallbackowy, gdy aplikacja napotka błąd renderowania — identyfikacja WynajemPRO v2 (.wpb)
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="wpb">
      <BrandStyles />
      <div className="wpb-center">
        <div className="wpb-panel" style={{ textAlign: 'center' }}>
          <span className="wpb-ic" style={{ margin: '0 auto 16px' }}><AlertTriangle /></span>
          <span className="wpb-label">Błąd aplikacji</span>
          <h2 className="wpb-h2" style={{ margin: '6px 0 8px' }}>Ups, coś poszło nie tak</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.55, margin: '0 0 18px' }}>
            Wystąpił nieoczekiwany błąd. Odśwież aplikację — Twoje dane są bezpieczne.
          </p>

          {/* Kontener ze szczegółami błędu, przydatny do debugowania */}
          <div className="wpb-note wpb-note--err" style={{ textAlign: 'left', marginBottom: 20 }}>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, wordBreak: 'break-word',
              display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {error.message}
            </span>
          </div>

          <button onClick={resetErrorBoundary} className="wpb-btn wpb-btn--primary wpb-btn--block">
            <RefreshCw /> Odśwież aplikację
          </button>
        </div>
      </div>
    </div>
  );
}

// Opakowanie na aplikację (lub jej części)
export function GlobalErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Wymuszenie usunięcia cache PWA przed odświeżeniem strony, by uciec z pętli błędu
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            registrations.forEach(registration => registration.unregister());
            window.location.reload(true);
          }).catch(() => window.location.reload(true));
        } else {
          window.location.reload(true);
        }
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
