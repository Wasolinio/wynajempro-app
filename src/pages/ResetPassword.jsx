import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
import { ArrowRight, ArrowLeft, MailCheck } from 'lucide-react';
import { BrandStyles } from '../styles/brand';

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
      await sendPasswordResetEmail(auth, email);
      setIsSuccess(true);
    } catch (err) {
      console.error('Błąd resetowania hasła:', err);
      if (err.code === 'auth/user-not-found') setError('Konto o podanym adresie e-mail nie istnieje.');
      else if (err.code === 'auth/invalid-email') setError('Podany adres e-mail jest nieprawidłowy.');
      else setError('Wystąpił błąd. Spróbuj ponownie później.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="wpb">
        <BrandStyles />
        <div className="wpb-center">
          <div className="wpb-panel" style={{ textAlign: 'center' }}>
            <span className="wpb-ic wpb-ic--green" style={{ margin: '0 auto 18px' }}><MailCheck /></span>
            <h2 className="wpb-h2" style={{ marginBottom: 10 }}>Sprawdź skrzynkę</h2>
            <p className="wpb-body" style={{ color: 'var(--muted)', margin: '0 0 24px' }}>
              Wysłaliśmy link do resetowania hasła na podany adres e-mail. Postępuj zgodnie z instrukcjami w wiadomości.
            </p>
            <button onClick={() => navigate('/login')} className="wpb-btn wpb-btn--primary wpb-btn--block">
              Wróć do logowania <ArrowRight />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wpb">
      <BrandStyles />
      <div className="wpb-center">
        <div className="wpb-panel">
          <Link to="/login" className="wpb-back" style={{ marginBottom: 22 }}><ArrowLeft /> <span>Wróć</span></Link>
          <span className="wpb-label">Odzyskiwanie dostępu</span>
          <h2 className="wpb-h2" style={{ margin: '6px 0 8px' }}>Zresetuj hasło</h2>
          <p className="wpb-body" style={{ color: 'var(--muted)', fontSize: 14, margin: '0 0 24px' }}>
            Podaj adres e-mail powiązany z kontem, a wyślemy Ci link do zmiany hasła.
          </p>

          {error && <div className="wpb-note wpb-note--err" style={{ marginBottom: 18 }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="wpb-field">
              <label className="wpb-flabel">Adres e-mail</label>
              <input className="wpb-input" type="email" name="email" required value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="twoj@email.pl" />
            </div>
            <button type="submit" disabled={isLoading || !email} className="wpb-btn wpb-btn--primary wpb-btn--block">
              {isLoading ? <span className="wpb-spin" style={{ width: 18, height: 18 }} /> : 'Wyślij link'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
