import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { applyActionCode, verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { auth } from '../firebase';
import { XCircle, Key, MailCheck, CheckCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { BrandStyles } from '../styles/brand';

export default function AuthActionHandler() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const actionCode = searchParams.get('oobCode');

  const [isProcessing, setIsProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
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
        await applyActionCode(auth, actionCode);
        setSuccess(true);
      } else if (mode === 'resetPassword') {
        const email = await verifyPasswordResetCode(auth, actionCode);
        setAccountEmail(email);
      } else if (mode === 'recoverEmail') {
        setError('Funkcja przywracania e-maila jest obecnie niedostępna w tej aplikacji.');
      } else {
        setError('Nieznana akcja.');
      }
    } catch (err) {
      console.error('Action error:', err);
      switch (err.code) {
        case 'auth/expired-action-code': setError('Ten link wygasł. Poproś o nowy link w panelu logowania.'); break;
        case 'auth/invalid-action-code': setError('Ten link jest nieprawidłowy lub został już wykorzystany.'); break;
        case 'auth/user-disabled': setError('Twoje konto zostało zablokowane.'); break;
        case 'auth/user-not-found': setError('Nie znaleziono użytkownika przypisanego do tego konta.'); break;
        case 'auth/weak-password': setError('Twoje nowe hasło jest za słabe. Musi mieć co najmniej 6 znaków.'); break;
        default: setError('Wystąpił nieoczekiwany błąd. Spróbuj ponownie.');
      }
    } finally {
      if (mode !== 'resetPassword' || error) setIsProcessing(false);
      else if (mode === 'resetPassword' && accountEmail) setIsProcessing(false);
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
      if (err.code === 'auth/expired-action-code') setError('Kod wygasł w trakcie zmiany hasła. Wyślij prośbę ponownie.');
      else setError('Błąd podczas zapisywania nowego hasła.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderContent = () => {
    if (isProcessing) {
      return (
        <div style={{ textAlign: 'center' }}>
          <span className="wpb-spin" style={{ margin: '0 auto 16px' }} />
          <h2 className="wpb-h2" style={{ marginBottom: 6 }}>Przetwarzanie żądania…</h2>
          <p className="wpb-body" style={{ color: 'var(--muted)', margin: 0 }}>Poczekaj chwilę, komunikujemy się z serwerem.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ textAlign: 'center' }}>
          <span className="wpb-ic" style={{ margin: '0 auto 16px', color: 'var(--cynober)' }}><XCircle /></span>
          <h2 className="wpb-h2" style={{ marginBottom: 8 }}>Wystąpił problem</h2>
          <p className="wpb-body" style={{ color: 'var(--muted)', margin: '0 0 24px' }}>{error}</p>
          <Link to="/login" className="wpb-btn wpb-btn--block">Wróć do logowania</Link>
        </div>
      );
    }

    if (mode === 'verifyEmail' && success) {
      return (
        <div style={{ textAlign: 'center' }}>
          <span className="wpb-ic wpb-ic--green" style={{ margin: '0 auto 16px' }}><MailCheck /></span>
          <h2 className="wpb-h2" style={{ marginBottom: 8 }}>E-mail zweryfikowany!</h2>
          <p className="wpb-body" style={{ color: 'var(--muted)', margin: '0 0 24px' }}>Twój adres e-mail został potwierdzony. Możesz teraz w pełni korzystać z konta WynajemPRO.</p>
          <Link to="/login" className="wpb-btn wpb-btn--primary wpb-btn--block">Przejdź do logowania <ArrowRight /></Link>
        </div>
      );
    }

    if (mode === 'resetPassword' && success) {
      return (
        <div style={{ textAlign: 'center' }}>
          <span className="wpb-ic wpb-ic--green" style={{ margin: '0 auto 16px' }}><CheckCircle /></span>
          <h2 className="wpb-h2" style={{ marginBottom: 8 }}>Hasło zostało zmienione</h2>
          <p className="wpb-body" style={{ color: 'var(--muted)', margin: '0 0 24px' }}>Możesz teraz zalogować się używając nowego hasła.</p>
          <Link to="/login" className="wpb-btn wpb-btn--primary wpb-btn--block">Zaloguj się <ArrowRight /></Link>
        </div>
      );
    }

    if (mode === 'resetPassword') {
      return (
        <div>
          <div style={{ textAlign: 'center', marginBottom: 22 }}>
            <span className="wpb-ic" style={{ margin: '0 auto 16px' }}><Key /></span>
            <h2 className="wpb-h2" style={{ marginBottom: 8 }}>Zresetuj hasło</h2>
            <p className="wpb-body" style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>
              Wprowadź nowe hasło dla konta <strong style={{ color: 'var(--ink)' }}>{accountEmail}</strong>.
            </p>
          </div>
          <form onSubmit={handlePasswordResetSubmit}>
            <div className="wpb-field">
              <label className="wpb-flabel">Nowe hasło</label>
              <div style={{ position: 'relative' }}>
                <input className="wpb-input" type={showPassword ? 'text' : 'password'} value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 6 znaków" required minLength={6}
                  style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--faint)', display: 'flex', padding: 4 }}>
                  {showPassword ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isProcessing} className="wpb-btn wpb-btn--primary wpb-btn--block">
              Zapisz nowe hasło
            </button>
          </form>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="wpb">
      <BrandStyles />
      <div className="wpb-center" style={{ flexDirection: 'column', gap: 26 }}>
        <Link to="/" className="wpb-logo">
          <span className="wpb-logo__word" style={{ fontSize: 22 }}>Wynajem</span>
          <span className="wpb-logo__pro" style={{ fontSize: 11 }}>PRO</span>
        </Link>
        <div className="wpb-panel">{renderContent()}</div>
      </div>
    </div>
  );
}
