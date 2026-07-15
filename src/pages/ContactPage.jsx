import React, { useState } from 'react';
import LegalLayout from './LegalLayout';
import { Mail, ShieldCheck, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export default function ContactPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // zapis do contact_messages (reguły: create-only, walidacja kształtu) — wcześniej
  // formularz tylko pokazywał toast, a treść przepadała (Known-Issues #6)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !message || isSending) return;
    setIsSending(true);
    try {
      await addDoc(collection(db, 'contact_messages'), {
        email: email.trim().slice(0, 320),
        message: message.trim().slice(0, 5000),
        createdAt: serverTimestamp(),
        source: 'kontakt',
      });
      setIsSubmitted(true);
      toast.success('Wiadomość została wysłana!');
      setEmail('');
      setMessage('');
    } catch (err) {
      console.error('Błąd wysyłki formularza kontaktowego:', err);
      toast.error('Nie udało się wysłać wiadomości. Napisz na kontakt@wynajempro.pl');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <LegalLayout title="Kontakt" subtitle="Chętnie pomożemy rozwiać Twoje wątpliwości" bare wide>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }} className="wpb-contact">
        {/* Lewa: informacje */}
        <div>
          <p className="wpb-lead" style={{ margin: '0 0 22px' }}>
            Masz pytania dotyczące subskrypcji, zgłoszenie techniczne lub chcesz usunąć konto wraz z danymi?
            Napisz do nas bezpośrednio lub skorzystaj z formularza.
          </p>

          <div className="wpb-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <span className="wpb-ic"><Mail /></span>
            <div>
              <p className="wpb-label" style={{ marginBottom: 4 }}>E-mail kontaktowy</p>
              <a href="mailto:kontakt@wynajempro.pl" className="wpb-link" style={{ fontSize: 18, fontWeight: 700 }}>
                kontakt@wynajempro.pl
              </a>
            </div>
          </div>

          <div className="wpb-card" style={{ padding: 20 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15, margin: '0 0 6px' }}>
              <ShieldCheck style={{ width: 17, height: 17, color: 'var(--green)' }} /> Czas odpowiedzi
            </h3>
            <p className="wpb-note" style={{ border: 'none', padding: 0 }}>
              Staramy się odpowiadać na wszystkie zgłoszenia w ciągu 24–48 godzin roboczych.
            </p>
          </div>
        </div>

        {/* Prawa: formularz */}
        <div className="wpb-card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 17, margin: '0 0 20px' }}>
            <Mail style={{ width: 18, height: 18, color: 'var(--cynober)' }} /> Formularz kontaktowy
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="wpb-field">
              <label className="wpb-flabel">Adres e-mail</label>
              <input className="wpb-input" type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="twoj@email.com" />
            </div>
            <div className="wpb-field">
              <label className="wpb-flabel">Treść wiadomości</label>
              <textarea className="wpb-textarea" required value={message} rows="4"
                onChange={(e) => setMessage(e.target.value)} placeholder="W czym możemy pomóc?" />
            </div>
            <button type="submit" className="wpb-btn wpb-btn--primary wpb-btn--block" disabled={isSending}>
              {isSending ? 'Wysyłanie…' : <><Send /> Wyślij wiadomość</>}
            </button>
          </form>
          {isSubmitted && (
            <p className="wpb-note wpb-note--ok" style={{ marginTop: 14, textAlign: 'center' }}>
              Wiadomość została wysłana!
            </p>
          )}
        </div>
      </div>

      <style>{`@media (max-width:820px){ .wpb-contact{ grid-template-columns:1fr !important; } }`}</style>
    </LegalLayout>
  );
}
