import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { Mail, ArrowRight, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Wysłanie linku resetującego hasło z Firebase (ustawienia action_url w Firebase Console decydują o powrocie)
      await sendPasswordResetEmail(auth, email);
      setIsSuccess(true);
    } catch (err) {
      console.error("Błąd resetowania hasła:", err);
      if (err.code === 'auth/user-not-found') {
        setError('Konto o podanym adresie e-mail nie istnieje.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Podany adres e-mail jest nieprawidłowy.');
      } else {
        setError('Wystąpił błąd. Spróbuj ponownie później.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex font-sans text-slate-900 bg-slate-50 selection:bg-blue-200">
        <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-200/50">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
              Sprawdź skrzynkę
            </h2>
            
            <p className="text-slate-600 font-medium leading-relaxed mb-8">
              Wysłaliśmy link do resetowania hasła na podany adres e-mail. Postępuj zgodnie z instrukcjami w wiadomości.
            </p>

            <button
              onClick={() => navigate('/login')}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-3.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              Wróć do logowania <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex font-sans text-slate-900 bg-slate-50 selection:bg-blue-200">
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50">
          
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Wróć
          </Link>

          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
            Zresetuj hasło
          </h2>
          <p className="text-sm text-slate-500 font-medium mb-8">
            Podaj adres e-mail powiązany z Twoim kontem, a wyślemy Ci link do zmiany hasła.
          </p>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-medium flex items-center gap-3 animate-in slide-in-from-top-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <span className="text-red-500 font-bold">!</span>
              </div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Adres e-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white" 
                  placeholder="twoj@email.pl" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading || !email} 
              className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-3.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Wyślij link'}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
