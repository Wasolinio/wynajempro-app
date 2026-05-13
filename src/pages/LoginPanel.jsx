import React, { useState } from 'react';
import { useNavigate, Link, BrowserRouter, useInRouterContext } from 'react-router-dom';

// --- UWAGA: IMPORTY FIREBASE ---
// Na potrzeby podglądu wizualnego, oryginalne importy zostały zakomentowane.
// ODKOMENTUJ poniższe linie w swoim właściwym projekcie w VSCode:
// import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
// import { auth } from './firebase'; 

// --- MOCK FIREBASE (Tylko do podglądu, USUŃ TEN BLOK w swoim projekcie) ---

// ---------------------------------------------------------------------------

import { 
  Mail, Lock, Eye, EyeOff, User, ArrowRight, 
  Sparkles, CheckCircle, Quote, Loader2 
} from 'lucide-react';

// Główna zawartość panelu logowania
export default function LoginPanel() {
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        if (formData.name) {
          await updateProfile(userCredential.user, {
            displayName: formData.name
          });
        }
      }
      navigate('/dashboard'); 
      
    } catch (err) {
      console.error("Błąd autoryzacji:", err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Nieprawidłowy e-mail lub hasło.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Konto z tym adresem e-mail już istnieje.');
      } else if (err.code === 'auth/weak-password') {
        setError('Hasło jest za słabe (wymagane minimum 6 znaków).');
      } else {
        setError(isLogin ? 'Nie udało się zalogować. Sprawdź dane.' : 'Błąd rejestracji. Spróbuj ponownie.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard'); 
    } catch (err) {
      console.error("Błąd Google Auth:", err);
      setError('Błąd podczas logowania przez Google. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans text-slate-900 bg-white selection:bg-blue-200">
      
      {/* LEWA STRONA - Formularz */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-1/2 xl:w-5/12 pt-8 pb-12 lg:pt-0">
        <div className="mx-auto w-full max-w-sm lg:max-w-md relative z-10">
          
          {/* Logo */}
          <div 
            onClick={() => navigate('/')} 
            className="flex items-center gap-2.5 mb-10 md:mb-16 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <HomeIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tighter text-slate-800">
              Wynajem<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-500">Pro</span>
            </span>
          </div>

          {/* Nagłówek formularza */}
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {isLogin ? 'Witaj ponownie' : 'Załóż darmowe konto'}
            </h2>
            <p className="mt-2 text-sm text-slate-500 font-medium">
              {isLogin ? (
                <>
                  Nie masz jeszcze konta?{' '}
                  <button onClick={() => { setIsLogin(false); setError(''); }} className="font-bold text-blue-600 hover:text-blue-500 transition-colors">
                    Rozpocznij 14-dniowy test
                  </button>
                </>
              ) : (
                <>
                  Masz już konto?{' '}
                  <button onClick={() => { setIsLogin(true); setError(''); }} className="font-bold text-blue-600 hover:text-blue-500 transition-colors">
                    Zaloguj się
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Wyświetlanie błędów */}
          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-medium flex items-center gap-3 animate-in slide-in-from-top-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <span className="text-red-500 font-bold">!</span>
              </div>
              {error}
            </div>
          )}

          {/* Opcje logowania społecznościowego */}
          <div className="mt-8">
            <button 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-3 rounded-xl text-sm font-bold shadow-sm transition-all disabled:opacity-50"
            >
              <GoogleIcon className="w-5 h-5" />
              {isLogin ? 'Zaloguj się przez Google' : 'Zarejestruj się przez Google'}
            </button>
          </div>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-sm font-medium leading-6">
              <span className="bg-white px-4 text-slate-500">lub kontynuuj adresem e-mail</span>
            </div>
          </div>

          {/* Główny Formularz */}
          <div className="mt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {!isLogin && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Imię lub nazwa firmy</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                      placeholder="np. Domki Letniskowe Ruś"
                    />
                  </div>
                </div>
              )}

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
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                    placeholder="twoj@email.pl"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-bold text-slate-700">Hasło</label>
                  {isLogin && (
                    <Link to="/reset-password" className="text-xs font-bold text-blue-600 hover:text-blue-500 transition-colors">
                      Zapomniałeś hasła?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-11 pr-12 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-3.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-2"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Zaloguj się do panelu' : 'Utwórz darmowe konto'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {!isLogin && (
              <div className="mt-6 flex flex-col gap-2 items-center justify-center text-center">
                 <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" /> Nie wymagamy podawania danych karty płatniczej.
                 </p>
                 <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-500" /> Twoje dane są szyfrowane przez Google Cloud.
                 </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PRAWA STRONA - Element wizerunkowy (ukryty na mobile) */}
      <div className="hidden lg:flex flex-1 relative w-full bg-slate-900 overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-violet-600/20 rounded-full mix-blend-screen filter blur-[100px]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:20px_20px] opacity-20"></div>
        </div>

        <div className="relative z-10 max-w-lg w-full flex flex-col">
          {isLogin ? (
            <div className="animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-8 border border-blue-500/30 backdrop-blur-md">
                <Quote className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-3xl font-extrabold text-white mb-6 leading-tight">
                "Odkąd używam WynajemPro, wreszcie przestałem martwić się o overbooking z Booking.com i Airbnb."
              </h3>
              <div className="flex items-center gap-4 mt-8">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white font-bold text-lg border border-white/20">M</div>
                <div>
                  <p className="text-white font-bold">Michał T.</p>
                  <p className="text-blue-200 text-sm">Zarządza 4 domkami na wynajem</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in duration-500">
              <h3 className="text-4xl font-extrabold text-white mb-6 leading-tight">
                Zarządzaj domkami letniskowymi z <br/><span className="text-blue-400">jednego miejsca.</span>
              </h3>
              <p className="text-blue-100/80 text-lg mb-10 leading-relaxed max-w-md">
                Dołącz do grona gospodarzy, którzy zautomatyzowali swoją pracę, podatki i zyskali więcej wolnego czasu.
              </p>
              
              <ul className="space-y-5 text-white">
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="font-medium">Ochrona przed overbookingiem (iCal)</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="font-medium">Automatyczne wyliczanie zysków i podatków</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="font-medium">Inteligentny "Raport Dnia" dla Gospodarza</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}