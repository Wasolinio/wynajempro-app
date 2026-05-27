import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importujemy nasze strony asynchronicznie, by zmniejszyć początkowy rozmiar paczki
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPanel = lazy(() => import('./pages/LoginPanel'));
const ManagerApp = lazy(() => import('./ManagerApp')); 

// Prosty loader podczas doczytywania paczek
const Loader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-slate-50">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPanel />} />
          <Route path="/dashboard/*" element={<ManagerApp />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}