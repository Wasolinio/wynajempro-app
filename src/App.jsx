import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importujemy nasze nowe strony z folderu pages
import LandingPage from './pages/LandingPage';
import LoginPanel from './pages/LoginPanel';

// Importujemy Twój stary kod menedżera
// (Jeśli zmieniłeś jego nazwę na ManagerApp.jsx, upewnij się, że ścieżka jest poprawna)
import ManagerApp from './ManagerApp'; 

export default function App() {
  return (
    // BrowserRouter to nasza "mapa". To on pozwala używać Link i useNavigate!
    <BrowserRouter>
      <Routes>
        {/* 1. Strona główna - Wizytówka */}
        <Route path="/" element={<LandingPage />} />
        
        {/* 2. Strona Logowania/Rejestracji */}
        <Route path="/login" element={<LoginPanel />} />
        
        {/* 3. Właściwa aplikacja (Twój Menedżer) */}
        <Route path="/dashboard/*" element={<ManagerApp />} />
        
        {/* 4. Bezpiecznik: błędny adres cofa na stronę główną */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}