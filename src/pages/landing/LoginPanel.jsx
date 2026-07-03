import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider,
  signInWithPopup, signInWithRedirect, getRedirectResult, updateProfile,
  sendEmailVerification, signOut, sendPasswordResetEmail,
  setPersistence, browserLocalPersistence, browserSessionPersistence,
} from 'firebase/auth';
import { auth, db, analytics, initAnalytics } from '../../firebase';
import { logEvent } from 'firebase/analytics';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';

/**
 * LoginPanel — panel logowania/rejestracji w systemie identyfikacji "Wynajem PRO" v1.0.
 *
 * Logika autoryzacji (Firebase: e-mail, Google, weryfikacja e-mail, błędy, 14-dniowy trial)
 * jest identyczna jak w src/pages/LoginPanel.jsx — przebudowana jest wyłącznie warstwa
 * wizualna: paleta marki, fonty (Schibsted Grotesk / Newsreader / IBM Plex Mono),
 * struktura liniami 1px, mono etykiety nad polami, focus cynobrowy, promień 3px.
 */

const LogoMark = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <rect width="24" height="24" rx="4" fill="#17150F" />
    <rect x="5" y="6.5" width="14" height="3" rx="1.5" fill="#A0987F" />
    <rect x="5" y="11.5" width="14" height="3" rx="1.5" fill="#D9492B" />
    <rect x="5" y="16.5" width="14" height="3" rx="1.5" fill="#A0987F" />
  </svg>
);

const GoogleIcon = (props) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...props}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default function LoginPanel() {
  const navigate = useNavigate();

  // Przechwytywanie wyniku Google Redirect (po powrocie z ekranu Google)
  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result?.user) {
          await initializeUserInDatabase(result.user);
          const currentAnalytics = analytics || initAnalytics();
          if (currentAnalytics) logEvent(currentAnalytics, 'login', { method: 'google' });
          navigate('/dashboard');
        }
      })
      .catch((err) => {
        console.error('Google redirect error:', err);
        if (err.code !== 'auth/popup-closed-by-user') {
          setError('Błąd logowania przez Google. Spróbuj ponownie.');
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showVerificationScreen, setShowVerificationScreen] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [resendCooldown, setResendCooldown] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const initializeUserInDatabase = async (user) => {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 14); // 14 dni za darmo
      await setDoc(userDocRef, {
        email: user.email,
        name: formData.name || user.displayName || 'Nowy Użytkownik',
        status: 'trialing',
        trialEndsAt: Timestamp.fromDate(trialEndDate),
        createdAt: Timestamp.fromDate(new Date()),
      });
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown) return;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, verificationEmail, formData.password);
      await sendEmailVerification(userCredential.user);
      await signOut(auth);
      setResendCooldown(true);
      setTimeout(() => setResendCooldown(false), 60000);
    } catch (err) {
      console.error('Błąd ponownego wysyłania:', err);
      setError('Nie udało się wysłać ponownie. Spróbuj za chwilę.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Blokada rejestracji bez akceptacji regulaminu
    if (!isLogin && !acceptTerms) {
      setError('Aby założyć konto, zaakceptuj regulamin i politykę prywatności.');
      return;
    }

    setIsLoading(true);
    try {
      // "Zapamiętaj mnie" — trwała sesja (local) vs sesja przeglądarki (session)
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        await userCredential.user.reload();
        // TODO: CLEANUP - Przywrócić wymóg weryfikacji e-mail po testach
        // if (!userCredential.user.emailVerified) {
        //   setError('Twój adres email nie został jeszcze zweryfikowany. Sprawdź swoją skrzynkę pocztową.');
        //   await signOut(auth);
        //   setIsLoading(false);
        //   return;
        // }
        const currentAnalytics = analytics || initAnalytics();
        if (currentAnalytics) logEvent(currentAnalytics, 'login', { method: 'email' });
        navigate('/dashboard');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        if (formData.name) {
          await updateProfile(userCredential.user, { displayName: formData.name });
        }
        await initializeUserInDatabase(userCredential.user);
        await sendEmailVerification(userCredential.user);
        await signOut(auth);
        const currentAnalytics = analytics || initAnalytics();
        if (currentAnalytics) logEvent(currentAnalytics, 'sign_up', { method: 'email' });
        setVerificationEmail(formData.email);
        setShowVerificationScreen(true);
      }
    } catch (err) {
      console.error('Błąd autoryzacji:', err);
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
      // "Zapamiętaj mnie" obowiązuje też dla logowania Google
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const result = await signInWithPopup(auth, provider);
      await initializeUserInDatabase(result.user);
      const currentAnalytics = analytics || initAnalytics();
      if (currentAnalytics) logEvent(currentAnalytics, 'login', { method: 'google' });
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setIsLoading(false);
        return;
      }
      if (err.code === 'auth/popup-blocked' ||
          err.code === 'auth/unauthorized-domain' ||
          err.code === 'auth/cross-origin-opener-policy-failed' ||
          err.message?.includes('Cross-Origin')) {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectErr) {
          console.error('Google redirect fallback error:', redirectErr);
          setError('Nie udało się zalogować przez Google. Sprawdź połączenie.');
        }
      } else {
        console.error('Google Auth error:', err);
        setError('Błąd podczas logowania przez Google. Spróbuj ponownie.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openReset = () => {
    setResetEmail(formData.email);
    setResetSent(false);
    setError('');
    setShowReset(true);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSent(true);
    } catch (err) {
      console.error('Błąd resetowania hasła:', err);
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

  // ===== EKRAN RESETU HASŁA =====
  if (showReset) {
    return (
      <div className="wp4a wp4a--center">
        <style>{CSS}</style>
        <div className="wp4a-verify">
          <span className="wp4a-verify__mark">
            <LogoMark size={26} />
          </span>
          {resetSent ? (
            <>
              <span className="wp4a-label">Link wysłany</span>
              <h1 className="wp4a-title">Sprawdź swoją skrzynkę</h1>
              <p className="wp4a-sub">Wysłaliśmy link do zmiany hasła na adres:</p>
              <p className="wp4a-verify__email">{resetEmail}</p>
              <div className="wp4a-note">
                Postępuj zgodnie z instrukcjami w wiadomości. Nie widzisz maila?
                Sprawdź folder SPAM.
              </div>
              <button
                onClick={() => { setShowReset(false); setIsLogin(true); setError(''); }}
                className="wp4a-btn wp4a-btn--primary wp4a-btn--full"
              >
                Wróć do logowania →
              </button>
            </>
          ) : (
            <>
              <span className="wp4a-label">Odzyskiwanie dostępu</span>
              <h1 className="wp4a-title">Zresetuj hasło</h1>
              <p className="wp4a-sub">
                Podaj adres e-mail powiązany z kontem, a wyślemy link do zmiany
                hasła.
              </p>
              {error && (
                <div className="wp4a-error" role="alert">
                  <span className="wp4a-error__sign">!</span>
                  <span>{error}</span>
                </div>
              )}
              <form onSubmit={handleResetPassword} className="wp4a-form wp4a-form--reset">
                <label className="wp4a-field">
                  <span className="wp4a-label">Adres e-mail</span>
                  <input
                    type="email" required
                    value={resetEmail}
                    onChange={(e) => { setResetEmail(e.target.value); setError(''); }}
                    placeholder="anna@wynajempro.com"
                  />
                </label>
                <button type="submit" disabled={isLoading || !resetEmail} className="wp4a-btn wp4a-btn--primary wp4a-btn--full">
                  {isLoading ? 'Wysyłam…' : 'Wyślij link do zmiany hasła'}
                </button>
              </form>
              <button
                onClick={() => { setShowReset(false); setError(''); }}
                className="wp4a-textbtn"
              >
                ← Wróć do logowania
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ===== EKRAN WERYFIKACJI EMAIL =====
  if (showVerificationScreen) {
    return (
      <div className="wp4a wp4a--center">
        <style>{CSS}</style>
        <div className="wp4a-verify">
          <span className="wp4a-verify__mark">
            <LogoMark size={26} />
          </span>
          <span className="wp4a-label">Krok 2 z 2 · weryfikacja</span>
          <h1 className="wp4a-title">Sprawdź swoją skrzynkę</h1>
          <p className="wp4a-sub">Wysłaliśmy link weryfikacyjny na adres:</p>
          <p className="wp4a-verify__email">{verificationEmail}</p>
          <div className="wp4a-note">
            Kliknij w link w mailu, aby aktywować konto. Po weryfikacji wróć
            tutaj i zaloguj się normalnie.
          </div>
          <button
            onClick={() => { setShowVerificationScreen(false); setIsLogin(true); setError(''); }}
            className="wp4a-btn wp4a-btn--primary wp4a-btn--full"
          >
            Przejdź do logowania →
          </button>
          <button
            onClick={handleResendVerification}
            disabled={resendCooldown}
            className="wp4a-textbtn"
          >
            {resendCooldown ? 'Wysłano ponownie — poczekaj 60 s' : 'Wyślij link ponownie'}
          </button>
          <p className="wp4a-fineprint">Nie widzisz maila? Sprawdź folder SPAM.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wp4a">
      <style>{CSS}</style>

      {/* ── Kolumna formularza ── */}
      <div className="wp4a__form-col">
        <div className="wp4a__inner">
          <button className="wp4a-brand" onClick={() => navigate('/')} type="button">
            <LogoMark />
            <span className="wp4a-brand__word">Wynajem</span>
            <span className="wp4a-brand__pro">PRO</span>
          </button>

          {/* Zakładki */}
          <div className="wp4a-tabs">
            <button
              type="button"
              className={isLogin ? 'is-active' : ''}
              onClick={() => { setIsLogin(true); setError(''); }}
            >
              Logowanie
            </button>
            <button
              type="button"
              className={!isLogin ? 'is-active' : ''}
              onClick={() => { setIsLogin(false); setError(''); }}
            >
              Rejestracja
            </button>
          </div>

          <h1 className="wp4a-title">
            {isLogin ? 'Witaj ponownie' : 'Załóż darmowe konto'}
          </h1>
          <p className="wp4a-sub">
            {isLogin
              ? 'Zaloguj się, aby wrócić do swojego panelu wynajmu.'
              : 'Rozpocznij 14-dniowy test. Bez karty, bez zobowiązań.'}
          </p>

          {error && (
            <div className="wp4a-error" role="alert">
              <span className="wp4a-error__sign">!</span>
              <span>{error}</span>
            </div>
          )}

          <button onClick={handleGoogleLogin} disabled={isLoading} className="wp4a-btn wp4a-btn--ghost wp4a-btn--full wp4a-google">
            <GoogleIcon />
            {isLogin ? 'Zaloguj się przez Google' : 'Zarejestruj się przez Google'}
          </button>

          <div className="wp4a-divider">
            <span className="wp4a-label wp4a-label--faint">lub adresem e-mail</span>
          </div>

          <form onSubmit={handleSubmit} className="wp4a-form">
            {!isLogin && (
              <label className="wp4a-field">
                <span className="wp4a-label">Imię i nazwisko</span>
                <input
                  type="text" name="name" required
                  value={formData.name} onChange={handleChange}
                  placeholder="np. Jan Kowalski"
                />
              </label>
            )}

            <label className="wp4a-field">
              <span className="wp4a-label">Adres e-mail</span>
              <input
                type="email" name="email" required
                value={formData.email} onChange={handleChange}
                placeholder="anna@wynajempro.com"
              />
            </label>

            <div className="wp4a-field">
              <div className="wp4a-field__top">
                <span className="wp4a-label">Hasło</span>
                {isLogin && (
                  <button type="button" className="wp4a-minilink" onClick={openReset}>
                    Nie pamiętasz hasła?
                  </button>
                )}
              </div>
              <div className="wp4a-pass">
                <input
                  type={showPassword ? 'text' : 'password'} name="password" required
                  value={formData.password} onChange={handleChange}
                  placeholder="••••••••"
                />
                <button type="button" className="wp4a-pass__toggle" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? 'Ukryj' : 'Pokaż'}
                </button>
              </div>
            </div>

            {isLogin ? (
              <label className="wp4a-check">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="wp4a-check__box" aria-hidden="true" />
                <span className="wp4a-check__text">Zapamiętaj mnie na tym urządzeniu</span>
              </label>
            ) : (
              <label className="wp4a-check">
                <input
                  type="checkbox"
                  required
                  checked={acceptTerms}
                  onChange={(e) => { setAcceptTerms(e.target.checked); setError(''); }}
                />
                <span className="wp4a-check__box" aria-hidden="true" />
                <span className="wp4a-check__text">
                  Akceptuję{' '}
                  <Link to="/regulamin" target="_blank">regulamin</Link>{' '}
                  i{' '}
                  <Link to="/prywatnosc" target="_blank">politykę prywatności</Link>.
                </span>
              </label>
            )}

            <button type="submit" disabled={isLoading} className="wp4a-btn wp4a-btn--primary wp4a-btn--full">
              {isLoading
                ? 'Chwila…'
                : isLogin ? 'Zaloguj się do panelu →' : 'Utwórz darmowe konto →'}
            </button>
          </form>

          <div className="wp4a-assure">
            <p><span className="wp4a-dot" /> Nie wymagamy danych karty płatniczej</p>
            <p><span className="wp4a-dot wp4a-dot--green" /> Dane szyfrowane przez Google Cloud</p>
          </div>
        </div>
      </div>

      {/* ── Atramentowy panel z głosem marki ── */}
      <aside className="wp4a__aside">
        <div className="wp4a__aside-inner">
          {isLogin ? (
            <>
              <span className="wp4a-label wp4a-label--ink">Wynajem pod kontrolą</span>
              <h2 className="wp4a-aside-title">
                Twój panel czeka — <em>uporządkowany</em>
              </h2>
              <p className="wp4a-aside-lead">
                Zaloguj się i wróć do tego, na czym skończyłeś. Wszystko w jednym
                precyzyjnym miejscu, dokładnie tak, jak zostawiłeś.
              </p>
              <ul className="wp4a-checklist">
                <li>Aktualny kalendarz wszystkich obiektów</li>
                <li>Zysk netto policzony do dziś</li>
                <li>Meldunki i zadania na dzisiaj</li>
              </ul>
            </>
          ) : (
            <>
              <span className="wp4a-label wp4a-label--ink">Dla mikro-gospodarzy</span>
              <h2 className="wp4a-aside-title">
                Zarządzaj wynajmem z <em>jednego miejsca</em>
              </h2>
              <p className="wp4a-aside-lead">
                Dołącz do gospodarzy, którzy zautomatyzowali pracę, podatki
                i odzyskali wolny czas.
              </p>
              <ul className="wp4a-checklist">
                <li>Ochrona przed overbookingiem (iCal)</li>
                <li>Automatyczne wyliczanie zysków i podatków</li>
                <li>Poranny raport operacyjny dla gospodarza</li>
              </ul>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Style brandowe — scope `.wp4a`. Tokeny 1:1 z brand bookiem.
   ────────────────────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700;800&family=Newsreader:ital,wght@1,400;1,500&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

.wp4a{
  --paper:#F3EFE5; --surface:#FBFAF6; --ink:#17150F;
  --cynober:#D9492B; --cynober-hover:#C23E22;
  --green:#2F6B53; --granat:#234B7A; --amber:#C99A2E;
  --hairline:#DDD5C3; --inner:#EFE9DA;
  --tint-cynober:#F6E5DF; --tint-green:#E7EDE7;
  /* --faint/--label: minimum 4.5:1 (WCAG AA) na --paper dla mikro-etykiet */
  --muted:#524C3F; --faint:#716951; --label:#746C54;
  --ink-on:#E4DDCE; --ink-faint:#8C8576; --ink-label:#6B6555; --ink-line:#2C2920;

  min-height:100vh; display:flex; background:var(--paper); color:var(--ink);
  font-family:'Schibsted Grotesk', system-ui, sans-serif; -webkit-font-smoothing:antialiased;
}
.wp4a *{ box-sizing:border-box; }
.wp4a--center{ align-items:center; justify-content:center; padding:24px; }

/* ── Etykiety / typografia ── */
.wp4a-label{ font-family:'IBM Plex Mono', monospace; font-weight:500; font-size:11px;
  letter-spacing:.10em; text-transform:uppercase; color:var(--label); display:inline-block; }
.wp4a-label--faint{ color:var(--faint); }
.wp4a-label--ink{ color:var(--ink-label); }
.wp4a-label--ink-faint{ color:var(--ink-faint); }
.wp4a-title{ font-weight:800; font-size:30px; letter-spacing:-.03em; line-height:1.1; margin:0 0 8px; }
.wp4a-sub{ font-size:15px; color:var(--muted); margin:0 0 24px; }

/* ── Kolumna formularza ── */
.wp4a__form-col{ flex:1; display:flex; align-items:center; justify-content:center; padding:48px 24px; }
.wp4a__inner{ width:100%; max-width:420px; }

.wp4a-brand{ display:inline-flex; align-items:center; gap:9px; background:none; border:none;
  cursor:pointer; padding:0; margin-bottom:40px; }
.wp4a-brand__word{ font-weight:800; font-size:19px; letter-spacing:-.02em; color:var(--ink); }
.wp4a-brand__pro{ font-family:'IBM Plex Mono', monospace; font-weight:600; font-size:12px;
  letter-spacing:.08em; color:var(--cynober); border:1px solid var(--hairline); border-radius:3px; padding:2px 6px; }

/* ── Zakładki ── */
.wp4a-tabs{ display:flex; gap:24px; border-bottom:1px solid var(--hairline); margin-bottom:28px; }
.wp4a-tabs button{ background:none; border:none; cursor:pointer; padding:0 0 12px; margin-bottom:-1px;
  font-family:'Schibsted Grotesk', sans-serif; font-weight:600; font-size:15px; color:var(--faint);
  border-bottom:2px solid transparent; transition:color .15s, border-color .15s; }
.wp4a-tabs button:hover{ color:var(--ink); }
.wp4a-tabs button.is-active{ color:var(--ink); border-color:var(--cynober); }

/* ── Pola ── */
.wp4a-form{ display:flex; flex-direction:column; gap:18px; }
.wp4a-field{ display:flex; flex-direction:column; gap:8px; }
.wp4a-field__top{ display:flex; align-items:center; justify-content:space-between; }
.wp4a-field input{ font-family:'Schibsted Grotesk', sans-serif; font-size:15px; color:var(--ink);
  background:var(--surface); border:1px solid var(--hairline); border-radius:3px; padding:13px 14px;
  width:100%; outline:none; transition:border-color .15s, background .15s; }
.wp4a-field input::placeholder{ color:var(--faint); }
.wp4a-field input:focus{ border-color:var(--cynober); background:#fff; }
.wp4a-pass{ position:relative; }
.wp4a-pass input{ width:100%; padding-right:64px; }
.wp4a-pass__toggle{ position:absolute; top:50%; right:12px; transform:translateY(-50%);
  background:none; border:none; cursor:pointer; font-family:'IBM Plex Mono', monospace;
  font-size:11px; letter-spacing:.06em; text-transform:uppercase; color:var(--faint); }
.wp4a-pass__toggle:hover{ color:var(--cynober); }
.wp4a-minilink{ font-family:'IBM Plex Mono', monospace; font-size:11px; letter-spacing:.04em;
  color:var(--muted); text-decoration:none; border:none; background:none; cursor:pointer; padding:0;
  border-bottom:1px solid transparent; }
.wp4a-minilink:hover{ color:var(--cynober); border-color:var(--cynober); }
.wp4a-form--reset{ margin-top:4px; width:100%; }

/* ── Checkbox (zapamiętaj mnie / regulamin) ── */
.wp4a-check{ display:flex; align-items:flex-start; gap:11px; cursor:pointer; user-select:none; }
.wp4a-check input{ position:absolute; opacity:0; width:0; height:0; }
.wp4a-check__box{ flex-shrink:0; width:18px; height:18px; margin-top:1px; border:1px solid var(--hairline);
  border-radius:3px; background:var(--surface); position:relative; transition:border-color .15s, background .15s; }
.wp4a-check input:checked + .wp4a-check__box{ background:var(--cynober); border-color:var(--cynober); }
.wp4a-check input:checked + .wp4a-check__box::after{ content:''; position:absolute; left:5px; top:2px;
  width:5px; height:9px; border:solid #fff; border-width:0 2px 2px 0; transform:rotate(45deg); }
.wp4a-check input:focus-visible + .wp4a-check__box{ outline:2px solid var(--cynober); outline-offset:2px; }
.wp4a-check__text{ font-size:14px; color:var(--muted); line-height:1.45; }
.wp4a-check__text a{ color:var(--ink); text-decoration:none; border-bottom:1px solid var(--hairline); }
.wp4a-check__text a:hover{ color:var(--cynober); border-color:var(--cynober); }

/* ── Przyciski ── */
.wp4a-btn{ display:inline-flex; align-items:center; justify-content:center; gap:10px;
  font-family:'Schibsted Grotesk', sans-serif; font-weight:600; font-size:15px;
  padding:14px 22px; border-radius:3px; border:1px solid transparent; cursor:pointer;
  text-decoration:none;
  transition:background .15s, border-color .15s, color .15s, transform .15s cubic-bezier(.22,1,.36,1); }
.wp4a-btn:active:not(:disabled){ transform:scale(.98); }
.wp4a :is(button, a):focus-visible{ outline:2px solid var(--cynober); outline-offset:2px; }
.wp4a-btn--full{ width:100%; }
.wp4a-btn--primary{ background:var(--cynober); color:#fff; }
.wp4a-btn--primary:hover{ background:var(--cynober-hover); }
.wp4a-btn:disabled{ opacity:.6; cursor:default; }
.wp4a-btn--ghost{ background:transparent; color:var(--ink); border-color:var(--hairline); }
.wp4a-btn--ghost:hover{ border-color:var(--ink); }
.wp4a-google{ margin-bottom:0; }

.wp4a-divider{ display:flex; align-items:center; gap:14px; margin:22px 0; }
.wp4a-divider::before,.wp4a-divider::after{ content:''; flex:1; height:1px; background:var(--hairline); }

/* ── Błąd ── */
.wp4a-error{ display:flex; align-items:center; gap:12px; background:var(--tint-cynober);
  border:1px solid #EBD3CB; border-radius:3px; padding:12px 14px; margin-bottom:22px;
  color:var(--cynober); font-size:14px; font-weight:500; }
.wp4a-error__sign{ width:22px; height:22px; flex-shrink:0; border-radius:3px; background:var(--cynober);
  color:#fff; font-weight:700; display:flex; align-items:center; justify-content:center; }

/* ── Zapewnienia ── */
.wp4a-assure{ margin-top:24px; display:flex; flex-direction:column; gap:8px; }
.wp4a-assure p{ font-family:'IBM Plex Mono', monospace; font-size:11px; letter-spacing:.03em;
  color:var(--faint); margin:0; display:flex; align-items:center; gap:8px; }
.wp4a-dot{ width:8px; height:8px; border-radius:2px; background:var(--cynober); flex-shrink:0; }
.wp4a-dot--green{ background:var(--green); }

/* ── Atramentowy panel ── */
.wp4a__aside{ flex:1; background:var(--ink); display:flex; align-items:center; justify-content:center;
  padding:48px;
  background-image:linear-gradient(var(--ink-line) 1px, transparent 1px),
                   linear-gradient(90deg, var(--ink-line) 1px, transparent 1px);
  background-size:32px 32px; background-color:var(--ink); }
.wp4a__aside-inner{ max-width:420px; width:100%; }

.wp4a-aside-title{ font-weight:800; font-size:38px; line-height:1.06; letter-spacing:-.03em;
  color:var(--surface); margin:16px 0 0; }
.wp4a-aside-title em{ font-family:'Newsreader', serif; font-style:italic; font-weight:400; color:var(--ink-on); }
.wp4a-aside-lead{ font-size:17px; color:var(--ink-on); margin:18px 0 0; max-width:36ch; }
.wp4a-checklist{ list-style:none; margin:28px 0 0; padding:0; }
.wp4a-checklist li{ position:relative; padding-left:26px; margin-bottom:14px; color:var(--ink-on); font-size:16px; }
.wp4a-checklist li::before{ content:''; position:absolute; left:0; top:8px; width:10px; height:10px;
  border:1px solid var(--cynober); border-radius:2px; background:transparent; }

/* ── Ekran weryfikacji ── */
.wp4a-verify{ max-width:440px; width:100%; text-align:center; display:flex; flex-direction:column; align-items:center; }
.wp4a-verify__mark{ width:56px; height:56px; border-radius:8px; background:var(--surface);
  border:1px solid var(--hairline); display:flex; align-items:center; justify-content:center; margin-bottom:24px; }
.wp4a-verify .wp4a-label{ margin-bottom:14px; }
.wp4a-verify__email{ font-family:'IBM Plex Mono', monospace; font-weight:600; font-size:16px;
  color:var(--cynober); margin:4px 0 24px; }
.wp4a-note{ background:var(--surface); border:1px solid var(--hairline); border-radius:4px;
  padding:16px 20px; font-size:14px; color:var(--muted); line-height:1.55; margin-bottom:28px; }
.wp4a-verify .wp4a-btn{ margin-bottom:14px; }
.wp4a-textbtn{ background:none; border:none; cursor:pointer; font-family:'Schibsted Grotesk', sans-serif;
  font-weight:600; font-size:14px; color:var(--muted); }
.wp4a-textbtn:hover{ color:var(--cynober); }
.wp4a-textbtn:disabled{ opacity:.5; cursor:default; }
.wp4a-fineprint{ font-family:'IBM Plex Mono', monospace; font-size:11px; letter-spacing:.03em;
  color:var(--faint); margin-top:28px; }

/* ── Responsywność ── */
@media (max-width:900px){
  .wp4a__aside{ display:none; }
  .wp4a__form-col{ padding:40px 24px; }
}
`;
