import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { AlertTriangle, RefreshCw } from 'lucide-react';

// Widok fallbackowy, gdy aplikacja napotka błąd renderowania
function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-slate-800">Ups, coś poszło nie tak</h2>
        <p className="mb-6 text-sm text-slate-500">
          Wystąpił nieoczekiwany błąd w aplikacji. Przepraszamy za niedogodności.
        </p>
        
        {/* Kontener ze szczegółami błędu, przydatny do debugowania */}
        <div className="mb-8 rounded-lg bg-red-50 p-4 text-left">
          <p className="text-xs font-mono text-red-800 break-words line-clamp-3">
            {error.message}
          </p>
        </div>

        <button
          onClick={resetErrorBoundary}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700"
        >
          <RefreshCw className="h-5 w-5" />
          Odśwież aplikację
        </button>
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
