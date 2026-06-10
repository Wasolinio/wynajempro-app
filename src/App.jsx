import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Importujemy nasze strony asynchronicznie, by zmniejszyć początkowy rozmiar paczki
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPanel = lazy(() => import('./pages/LoginPanel'));
const GuestGuideView = lazy(() => import('./pages/GuestGuideView'));
const ManagerApp = lazy(() => import('./ManagerApp')); 
import { GlobalErrorBoundary } from './GlobalErrorBoundary';
import { WynajemProvider } from './context/WynajemContext';

// Prosty loader podczas doczytywania paczek
const Loader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
  </div>
);

// Komponent zabezpieczający chronione trasy (Protected Routes)
const ProtectedRoute = ({ children }) => {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // Jeśli użytkownik jest zalogowany przez email/hasło, ale nie zweryfikował maila, blokujemy dostęp
      if (currentUser && !currentUser.emailVerified && currentUser.providerData[0]?.providerId === 'password') {
        setUser(null);
      } else {
        setUser(currentUser);
      }
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

import { Toaster } from 'react-hot-toast';

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
      <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPanel />} />
          <Route path="/guide/:guideId" element={<GuestGuideView />} />
          <Route 
            path="/dashboard/*" 
            element={
              <GlobalErrorBoundary>
                <ProtectedRoute>
                  <WynajemProvider>
                    <ManagerApp />
                  </WynajemProvider>
                </ProtectedRoute>
              </GlobalErrorBoundary>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
    </>
  );
}