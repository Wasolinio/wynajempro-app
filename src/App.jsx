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

// Loader wyświetlany podczas doczytywania paczek i sprawdzania sesji.
// Samowystarczalny (inline <style>), bo renderuje się zanim dociągną się arkusze stron.
// Kolory = tokeny identyfikacji v2 (paper / hairline / cynober); opóźnione pojawienie
// (150 ms) zapobiega miganiu spinnera przy szybkich wczytaniach.
const Loader = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F3EFE5' }}>
    <style>{`
      @keyframes wp-load-in{ to{ opacity:1; } }
      @keyframes wp-load-spin{ to{ transform:rotate(360deg); } }
      .wp-load{ width:34px; height:34px; border:2px solid #DDD5C3; border-top-color:#D9492B;
        border-radius:50%; opacity:0;
        animation:wp-load-in .2s ease-out .15s forwards, wp-load-spin .8s linear infinite; }
      @media (prefers-reduced-motion: reduce){ .wp-load{ animation-duration:.2s, 2s; } }
    `}</style>
    <div className="wp-load" />
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
          // Identyfikacja v2: surface + linia 1px ink, radius 4px, zero cieni;
          // ikony statusów w kolorach marki (green / cynober)
          style: {
            background: '#FBFAF6', color: '#17150F', border: '1px solid #17150F',
            borderRadius: '4px', boxShadow: 'none', padding: '12px 16px',
            fontFamily: "'Schibsted Grotesk', system-ui, sans-serif", fontSize: '14px', fontWeight: 500,
          },
          success: { iconTheme: { primary: '#2F6B53', secondary: '#FBFAF6' } },
          error: { iconTheme: { primary: '#D9492B', secondary: '#FBFAF6' } },
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
