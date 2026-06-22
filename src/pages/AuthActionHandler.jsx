import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { applyActionCode, verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '../firebase';
import { CheckCircle, XCircle, Loader2, Key, MailCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function AuthActionHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const mode = searchParams.get('mode');
  const actionCode = searchParams.get('oobCode');
  
  // States
  const [isProcessing, setIsProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Password Reset Specific States
  const [newPassword, setNewPassword] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!mode || !actionCode) {
      setError('Nieprawidłowy lub niekompletny link weryfikacyjny.');
      setIsProcessing(false);
      return;
    }

    handleAction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, actionCode]);

  const handleAction = async () => {
    try {
      if (mode === 'verifyEmail') {
        // Obsługa weryfikacji adresu e-mail
        await applyActionCode(auth, actionCode);
        setSuccess(true);
      } else if (mode === 'resetPassword') {
        // Krok 1: Weryfikacja kodu resetu hasła i pobranie maila użytkownika
        const email = await verifyPasswordResetCode(auth, actionCode);
        setAccountEmail(email);
        // Po udanej weryfikacji zdejmujemy loader, aby użytkownik mógł wpisać nowe hasło
      } else if (mode === 'recoverEmail') {
        // Opcjonalnie: Obsługa odzyskiwania starego adresu po nieautoryzowanej zmianie
        setError('Funkcja przywracania e-maila jest obecnie niedostępna w tej aplikacji.');
      } else {
        setError('Nieznana akcja.');
      }
    } catch (err) {
      console.error('Action error:', err);
      // Przetwarzanie popularnych błędów Firebase
      switch (err.code) {
        case 'auth/expired-action-code':
          setError('Ten link wygasł. Poproś o nowy link w panelu logowania.');
          break;
        case 'auth/invalid-action-code':
          setError('Ten link jest nieprawidłowy lub został już wykorzystany.');
          break;
        case 'auth/user-disabled':
          setError('Twoje konto zostało zablokowane.');
          break;
        case 'auth/user-not-found':
          setError('Nie znaleziono użytkownika przypisanego do tego konta.');
          break;
        case 'auth/weak-password':
          setError('Twoje nowe hasło jest za słabe. Musi mieć co najmniej 6 znaków.');
          break;
        default:
          setError('Wystąpił nieoczekiwany błąd. Spróbuj ponownie.');
      }
    } finally {
      // Dla verifyEmail zdejmujemy spinner po zakończeniu. Dla resetPassword zdejmujemy po pobraniu maila.
      if (mode !== 'resetPassword' || error) {
         setIsProcessing(false);
      } else if (mode === 'resetPassword' && accountEmail) {
         setIsProcessing(false);
      }
    }
  };

  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);
    
    if (newPassword.length < 6) {
      setError('Hasło musi składać się z co najmniej 6 znaków.');
      setIsProcessing(false);
      return;
    }

    try {
      await confirmPasswordReset(auth, actionCode, newPassword);
      setSuccess(true);
    } catch (err) {
      console.error('Password reset confirm error:', err);
      if (err.code === 'auth/expired-action-code') {
        setError('Kod wygasł w trakcie zmiany hasła. Wyślij prośbę ponownie.');
      } else {
        setError('Błąd podczas zapisywania nowego hasła.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const renderContent = () => {
    if (isProcessing) {
      return (
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">Przetwarzanie żądania...</h2>
          <p className="text-slate-500">Poczekaj chwilę, komunikujemy się z serwerem.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Wystąpił problem</h2>
          <p className="text-slate-600 mb-8">{error}</p>
          <Link 
            to="/login"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Wróć do logowania
          </Link>
        </div>
      );
    }

    if (mode === 'verifyEmail') {
      if (success) {
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <MailCheck className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">E-mail zweryfikowany!</h2>
            <p className="text-slate-600 mb-8">Twój adres e-mail został pomyślnie potwierdzony. Możesz teraz w pełni korzystać z konta WynajemPRO.</p>
            <Link 
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors w-full"
            >
              Przejdź do logowania
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        );
      }
    }

    if (mode === 'resetPassword') {
      if (success) {
        return (
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Hasło zostało zmienione</h2>
            <p className="text-slate-600 mb-8">Możesz teraz zalogować się do swojego konta używając nowego hasła.</p>
            <Link 
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors w-full"
            >
              Zaloguj się
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        );
      }

      return (
        <div>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Key className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Zresetuj hasło</h2>
            <p className="text-slate-500 text-sm">Wprowadź nowe hasło dla konta <strong className="text-slate-700">{accountEmail}</strong>.</p>
          </div>

          <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nowe hasło
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Minimum 6 znaków"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
              Zapisz nowe hasło
            </button>
          </form>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen flex font-sans text-slate-900 bg-slate-50 selection:bg-blue-200">
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
        
        {/* Brand Header */}
        <Link to="/" className="mb-8 flex items-center gap-2 group">
          <div className="bg-blue-600 p-2 rounded-xl group-hover:bg-blue-700 transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">WynajemPRO</span>
        </Link>

        {/* Action Card */}
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
          {renderContent()}
        </div>

      </div>
    </div>
  );
}
