import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile, sendEmailVerification, signOut } from 'firebase/auth';
import { auth, db, analytics, initAnalytics } from '../firebase';
import { logEvent } from 'firebase/analytics';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore'; // DODANE: funkcje firestore + Timestamp
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Sparkles, CheckCircle, Quote, Loader2, MailCheck, RefreshCw } from 'lucide-react';

export default function LoginPanel() {
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerificationScreen, setShowVerificationScreen] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); 
  };

  const initializeUserInDatabase = async (user) => {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    // Tworzymy dokument tylko, jeśli nie istnieje (nowa rejestracja)
    if (!userDoc.exists()) {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14); // 14 dni za darmo

      await setDoc(userDocRef, {
        email: user.email,
        name: formData.name || user.displayName || 'Nowy Użytkownik',
        status: 'trialing', // Status początkowy
        trialEndsAt: Timestamp.fromDate(trialEndDate), // Firestore Timestamp
        createdAt: Timestamp.fromDate(new Date())
      });

      // Nie zapisujemy od razu hostProfile przy rejestracji. 
      // Użytkownik zostanie o to poproszony w aplikacji (CompleteProfileScreen).
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown) return;
    try {
      // Logujemy się ponownie, żeby mieć dostęp do obiektu user
      const userCredential = await signInWithEmailAndPassword(auth, verificationEmail, formData.password);
      await sendEmailVerification(userCredential.user);
      await signOut(auth);
      setResendCooldown(true);
      setTimeout(() => setResendCooldown(false), 60000); // 60 sek cooldown
    } catch (err) {
      console.error("Błąd ponownego wysyłania:", err);
      setError('Nie udało się wysłać ponownie. Spróbuj za chwilę.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      if (isLogin) {
        // === LOGOWANIE ===
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        
        // Odśwież token, żeby mieć aktualny emailVerified
        await userCredential.user.reload();
        
        if (!userCredential.user.emailVerified) {
          setError('Twój adres email nie został jeszcze zweryfikowany. Sprawdź swoją skrzynkę pocztową.');
          await signOut(auth);
          setIsLoading(false);
          return;
        }
        
        const currentAnalytics = analytics || initAnalytics();
        if (currentAnalytics) logEvent(currentAnalytics, 'login', { method: 'email' });
        navigate('/dashboard'); 
      } else {
        // === REJESTRACJA ===
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        if (formData.name) {
          await updateProfile(userCredential.user, {
            displayName: formData.name
          });
        }
        await initializeUserInDatabase(userCredential.user);
        
        // Wysyłka linku weryfikacyjnego
        await sendEmailVerification(userCredential.user);
        
        // Wyloguj — konto nieaktywne do weryfikacji
        await signOut(auth);
        
        const currentAnalytics = analytics || initAnalytics();
        if (currentAnalytics) logEvent(currentAnalytics, 'sign_up', { method: 'email' });
        
        // Pokaż ekran weryfikacji
        setVerificationEmail(formData.email);
        setShowVerificationScreen(true);
      }
      
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
      const result = await signInWithPopup(auth, provider);
      await initializeUserInDatabase(result.user); // Google login
      
      const currentAnalytics = analytics || initAnalytics();
      if (currentAnalytics) logEvent(currentAnalytics, 'login', { method: 'google' });
      
      navigate('/dashboard'); 
    } catch (err) {
      console.error("Błąd Google Auth:", err);
      setError('Błąd podczas logowania przez Google. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  };

  // ===== EKRAN WERYFIKACJI EMAIL =====
  if (showVerificationScreen) {
    return (
      <div className="min-h-screen flex font-sans text-slate-900 bg-white selection:bg-blue-200">
        <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-200/50">
              <MailCheck className="w-10 h-10 text-emerald-600" />
            </div>
            
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
              Sprawdź swoją skrzynkę
            </h2>
            
            <p className="text-slate-600 font-medium mb-2">
              Wysłaliśmy link weryfikacyjny na adres:
            </p>
            <p className="text-blue-600 font-bold text-lg mb-8">
              {verificationEmail}
            </p>
            
            <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
              <p className="text-sm text-slate-600 font-medium leading-relaxed">
                Kliknij w link w mailu, aby aktywować swoje konto. 
                Po weryfikacji wróć tutaj i zaloguj się normalnie.
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => { setShowVerificationScreen(false); setIsLogin(true); setError(''); }}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-3.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                Przejdź do logowania <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                onClick={handleResendVerification}
                disabled={resendCooldown}
                className="w-full text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 py-2"
              >
                <RefreshCw className={`w-4 h-4 ${resendCooldown ? 'animate-spin' : ''}`} />
                {resendCooldown ? 'Wysłano ponownie (poczekaj 60s)' : 'Wyślij link ponownie'}
              </button>
            </div>

            <p className="text-xs text-slate-400 mt-8 font-medium">
              Nie widzisz maila? Sprawdź folder SPAM.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex font-sans text-slate-900 bg-white selection:bg-blue-200">
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-1/2 xl:w-5/12 pt-8 pb-12 lg:pt-0">
        <div className="mx-auto w-full max-w-sm lg:max-w-md relative z-10">
          
          <div onClick={() => navigate('/')} className="flex items-center gap-2.5 mb-10 md:mb-16 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <HomeIcon className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tighter text-slate-800">
              Wynajem<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-500">Pro</span>
            </span>
          </div>

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

          {error && (
            <div className="mt-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-medium flex items-center gap-3 animate-in slide-in-from-top-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                <span className="text-red-500 font-bold">!</span>
              </div>
              {error}
            </div>
          )}

          <div className="mt-8">
            <button onClick={handleGoogleLogin} disabled={isLoading} className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-3 rounded-xl text-sm font-bold shadow-sm transition-all disabled:opacity-50">
              <GoogleIcon className="w-5 h-5" />
              {isLogin ? 'Zaloguj się przez Google' : 'Zarejestruj się przez Google'}
            </button>
          </div>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center text-sm font-medium leading-6"><span className="bg-white px-4 text-slate-500">lub kontynuuj adresem e-mail</span></div>
          </div>

          <div className="mt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {!isLogin && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-300 space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Imię i Nazwisko</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><User className="h-5 w-5 text-slate-400" /></div>
                      <input type="text" name="name" required value={formData.name} onChange={handleChange} className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white" placeholder="np. Jan Kowalski" />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Adres e-mail</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-slate-400" /></div>
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white" placeholder="twoj@email.pl" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-bold text-slate-700">Hasło</label>
                  {isLogin && (<Link to="/reset-password" className="text-xs font-bold text-blue-600 hover:text-blue-500 transition-colors">Zapomniałeś hasła?</Link>)}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-slate-400" /></div>
                  <input type={showPassword ? "text" : "password"} name="password" required value={formData.password} onChange={handleChange} className="block w-full pl-11 pr-12 py-3 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors">{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-3.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-2">
                {isLoading ? (<Loader2 className="w-5 h-5 animate-spin" />) : (<>{isLogin ? 'Zaloguj się do panelu' : 'Utwórz darmowe konto'} <ArrowRight className="w-4 h-4" /></>)}
              </button>
            </form>

            {!isLogin && (
              <div className="mt-6 flex flex-col gap-2 items-center justify-center text-center">
                 <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1"><Sparkles className="w-3 h-3 text-amber-500" /> Nie wymagamy podawania danych karty płatniczej.</p>
                 <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1"><Lock className="w-3 h-3 text-emerald-500" /> Twoje dane są szyfrowane przez Google Cloud.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 relative w-full bg-slate-900 items-center justify-center p-12">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[100px] transform-gpu will-change-transform"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-violet-600/20 rounded-full mix-blend-screen filter blur-[100px] transform-gpu will-change-transform"></div>
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:20px_20px] opacity-20"></div>
        </div>

        <div className="relative z-10 max-w-lg w-full flex flex-col">
          {isLogin ? (
            <div className="animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-8 border border-blue-500/30 backdrop-blur-md"><Quote className="w-8 h-8 text-blue-400" /></div>
              <h3 className="text-3xl font-extrabold text-white mb-6 leading-tight">"Odkąd używam WynajemPro, wreszcie przestałem martwić się o overbooking z Booking.com i Airbnb."</h3>
              <div className="flex items-center gap-4 mt-8">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white font-bold text-lg border border-white/20">M</div>
                <div><p className="text-white font-bold">Michał T.</p><p className="text-blue-200 text-sm">Zarządza 4 domkami na wynajem</p></div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in zoom-in duration-500">
              <h3 className="text-4xl font-extrabold text-white mb-6 leading-tight">Zarządzaj domkami letniskowymi z <br/><span className="text-blue-400">jednego miejsca.</span></h3>
              <p className="text-blue-100/80 text-lg mb-10 leading-relaxed max-w-md">Dołącz do grona gospodarzy, którzy zautomatyzowali swoją pracę, podatki i zyskali więcej wolnego czasu.</p>
              <ul className="space-y-5 text-white">
                <li className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30"><CheckCircle className="w-4 h-4 text-emerald-400" /></div><span className="font-medium">Ochrona przed overbookingiem (iCal)</span></li>
                <li className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30"><CheckCircle className="w-4 h-4 text-emerald-400" /></div><span className="font-medium">Automatyczne wyliczanie zysków i podatków</span></li>
                <li className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30"><CheckCircle className="w-4 h-4 text-emerald-400" /></div><span className="font-medium">Inteligentny "Raport Dnia" dla Gospodarza</span></li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Ikony SVG
function HomeIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}

function GoogleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      <path d="M1 1h22v22H1z" fill="none" />
    </svg>
  );
}