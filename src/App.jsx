import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { auth, analytics, initAnalytics } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { logEvent } from 'firebase/analytics';
import ConsentNotice from './components/ConsentNotice';
import LandingPageV2 from './pages/landing_v2/LandingPageV2';
import { GlobalErrorBoundary } from './GlobalErrorBoundary';
import { WynajemProvider } from './context/WynajemContext';
import { Toaster } from 'react-hot-toast';


// Importujemy nasze strony asynchronicznie, by zmniejszyć początkowy rozmiar paczki
import LandingPageApple from './pages/landing_apple/LandingPageApple';
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LandingPageV3 = lazy(() => import('./pages/landing_v3/LandingPageV3'));
const LandingPageV4 = lazy(() => import('./pages/landing_v4/LandingPageV4'));
const LoginPanelV4 = lazy(() => import('./pages/landing_v4/LoginPanelV4'));
const LoginPanel = lazy(() => import('./pages/LoginPanel'));
const GuestGuideView = lazy(() => import('./pages/GuestGuideView'));
const ManagerApp = lazy(() => import('./ManagerApp')); 
const ManagerAppV4 = lazy(() => import('./pages/dashboard_v4/ManagerAppV4'));
const ManagerAppClaude = lazy(() => import('./pages/dashboard_claude/ManagerAppClaude'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const BlogListPage = lazy(() => import('./pages/BlogListPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const AuthActionHandler = lazy(() => import('./pages/AuthActionHandler'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

// Prosty loader podczas doczytywania paczek
const Loader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
  </div>
);

// Komponent do śledzenia odsłon w Google Analytics
const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    try {
      const currentAnalytics = analytics || initAnalytics();
      if (currentAnalytics) {
        logEvent(currentAnalytics, 'page_view', {
          page_path: location.pathname + location.search,
        });
      }
    } catch (err) {
      console.warn('Analytics blocked by client:', err);
    }
  }, [location]);

  return null;
};

// Komponent zabezpieczający chronione trasy (Protected Routes)
const ProtectedRoute = ({ children }) => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Jeśli użytkownik jest zalogowany przez email/hasło, ale nie zweryfikował maila, blokujemy dostęp
      // TODO: CLEANUP - Przywrócić wymóg weryfikacji e-mail po testach i naprawie App Check (HTTP 403)
      // if (currentUser && !currentUser.emailVerified && currentUser.providerData[0]?.providerId === 'password') {
      //   setUser(null);
      // } else {
        setUser(currentUser);
      // }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};


export default function App() {
  return (
    <>
      <Toaster 
        position="bottom-right" 
        reverseOrder={false}
        toastOptions={{
          style: {
            borderRadius: '16px',
            background: '#333',
            color: '#fff',
            fontWeight: 'bold',
          },
          success: {
            style: {
              background: '#10b981', // Tailwind emerald-500
            },
          },
          error: {
            style: {
              background: '#ef4444', // Tailwind red-500
            },
          },
        }}
      />
      <GlobalErrorBoundary>
        <BrowserRouter>
          <AnalyticsTracker />
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/" element={<LandingPageV4 />} />
              <Route path="/prototyp" element={<LandingPageV2 />} />
              <Route path="/prototyp2" element={<LandingPageApple />} />
              <Route path="/prototyp3" element={<LandingPageV3 />} />
              <Route path="/prototyp4" element={<LandingPageV4 />} />
              <Route path="/prototyp4-login" element={<LoginPanelV4 />} />
              <Route path="/login" element={<LoginPanelV4 />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/regulamin" element={<TermsPage />} />
              <Route path="/prywatnosc" element={<PrivacyPage />} />
              <Route path="/kontakt" element={<ContactPage />} />
              <Route path="/blog" element={<BlogListPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/auth/action" element={<AuthActionHandler />} />
              <Route path="/guide/:guideId" element={<GuestGuideView />} />
              {/* GŁÓWNA wersja produkcyjna dashboardu (przebudowa V4 / Claude) */}
              <Route
                path="/dashboard/*"
                element={
                  <ProtectedRoute>
                    <WynajemProvider>
                      <ManagerAppClaude />
                    </WynajemProvider>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/prototyp4-app/*"
                element={
                  <ProtectedRoute>
                    <WynajemProvider>
                      <ManagerAppV4 />
                    </WynajemProvider>
                  </ProtectedRoute>
                }
              />
              {/* Moja (Claude) wersja przebudowy dashboardu — równolegle do wersji Gemini */}
              <Route
                path="/app-claude/*"
                element={
                  <ProtectedRoute>
                    <WynajemProvider>
                      <ManagerAppClaude />
                    </WynajemProvider>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
          <ConsentNotice onAccept={() => initAnalytics()} />
        </BrowserRouter>
      </GlobalErrorBoundary>
    </>
  );
}
