import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { logEvent } from 'firebase/analytics';

import { auth, analytics, initAnalytics } from './firebase';
import { WynajemProvider } from './context/WynajemContext';
import { GlobalErrorBoundary } from './GlobalErrorBoundary';
import ConsentNotice from './components/ConsentNotice';

/*
  ── ROUTING APLIKACJI ──
  Jedna, produkcyjna wersja każdego ekranu (identyfikacja WynajemPRO v2).
  Strony ładowane leniwie (code-splitting), by zmniejszyć początkową paczkę.
  Wcześniejsze prototypy i poprzednie wersje są zarchiwizowane w /_legacy (poza buildem).
*/

// Część publiczna (landing, logowanie, treści, przewodnik gościa)
const LandingPage = lazy(() => import('./pages/landing/LandingPage'));
const LoginPanel = lazy(() => import('./pages/landing/LoginPanel'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const AuthActionHandler = lazy(() => import('./pages/AuthActionHandler'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const BlogListPage = lazy(() => import('./pages/BlogListPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const GuestGuideView = lazy(() => import('./pages/GuestGuideView'));

// Część zalogowana (panel zarządzania)
const ManagerApp = lazy(() => import('./pages/dashboard/ManagerApp'));

// Loader wyświetlany podczas doczytywania paczek
const Loader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
  </div>
);

// Śledzenie odsłon w Google Analytics (po zgodzie na cookies)
const AnalyticsTracker = () => {
  const location = useLocation();
  useEffect(() => {
    try {
      const currentAnalytics = analytics || initAnalytics();
      if (currentAnalytics) {
        logEvent(currentAnalytics, 'page_view', { page_path: location.pathname + location.search });
      }
    } catch (err) {
      console.warn('Analytics blocked by client:', err);
    }
  }, [location]);
  return null;
};

// Strażnik tras chronionych — przekierowuje niezalogowanych na /login
const ProtectedRoute = ({ children }) => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // TODO: PRZED LAUNCHEM — przywrócić wymóg weryfikacji e-mail (po naprawie App Check / HTTP 403)
      // if (currentUser && !currentUser.emailVerified && currentUser.providerData[0]?.providerId === 'password') {
      //   setUser(null);
      // } else {
      setUser(currentUser);
      // }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <>
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        toastOptions={{
          style: { borderRadius: '16px', background: '#333', color: '#fff', fontWeight: 'bold' },
          success: { style: { background: '#10b981' } },
          error: { style: { background: '#ef4444' } },
        }}
      />
      <GlobalErrorBoundary>
        <BrowserRouter>
          <AnalyticsTracker />
          <Suspense fallback={<Loader />}>
            <Routes>
              {/* ── Publiczne ── */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPanel />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/auth/action" element={<AuthActionHandler />} />
              <Route path="/regulamin" element={<TermsPage />} />
              <Route path="/prywatnosc" element={<PrivacyPage />} />
              <Route path="/kontakt" element={<ContactPage />} />
              <Route path="/blog" element={<BlogListPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/guide/:guideId" element={<GuestGuideView />} />

              {/* ── Panel zarządzania (chroniony) ── */}
              <Route
                path="/dashboard/*"
                element={
                  <ProtectedRoute>
                    <WynajemProvider>
                      <ManagerApp />
                    </WynajemProvider>
                  </ProtectedRoute>
                }
              />

              {/* Nieznane ścieżki → strona główna */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
          <ConsentNotice onAccept={() => initAnalytics()} />
        </BrowserRouter>
      </GlobalErrorBoundary>
    </>
  );
}
