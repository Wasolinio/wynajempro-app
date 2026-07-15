import React, { useState } from 'react';
import { UserCog, ArrowRight } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { BrandStyles } from '../styles/brand';

export default function CompleteProfileScreen({ user, onComplete }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.displayName || '',
    identifierType: 'NIP',
    taxIdentifier: '',
    address: '',
    phone: '',
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await setDoc(doc(db, 'users', user.uid, 'settings', 'hostProfile'), {
        entityName: formData.name,
        identifierType: formData.identifierType,
        taxIdentifier: formData.taxIdentifier,
        address: formData.address,
        phone: formData.phone,
        email: user.email,
      });
      // lustro publiczne dla przewodnika gościa — hostProfile (NIP/adres) nie jest publiczny (N5 🟡5)
      await setDoc(doc(db, 'users', user.uid, 'settings', 'publicContact'), {
        entityName: formData.name,
        phone: formData.phone,
        email: user.email,
      });
      if (onComplete) onComplete();
    } catch (err) {
      console.error('Błąd podczas zapisywania profilu:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="wpb">
      <BrandStyles />
      <div className="wpb-center">
        <div className="wpb-panel wpb-panel--wide">
          <div style={{ textAlign: 'center', marginBottom: 26 }}>
            <span className="wpb-ic" style={{ margin: '0 auto 16px' }}><UserCog /></span>
            <span className="wpb-label">Konfiguracja konta</span>
            <h2 className="wpb-h2" style={{ margin: '6px 0 8px' }}>Dokończ konfigurację</h2>
            <p className="wpb-body" style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>
              Aby w pełni korzystać z narzędzi księgowych, podaj podstawowe dane swojej działalności.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="wpb-field">
              <label className="wpb-flabel">Pełna nazwa podmiotu / Imię i nazwisko</label>
              <input className="wpb-input" type="text" name="name" required value={formData.name}
                onChange={handleChange} placeholder="np. Domki Letniskowe Ruś" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="wpb-field">
                <label className="wpb-flabel">Identyfikator</label>
                <select className="wpb-select" name="identifierType" value={formData.identifierType} onChange={handleChange}>
                  <option value="NIP">NIP</option>
                  <option value="PESEL">PESEL</option>
                </select>
              </div>
              <div className="wpb-field">
                <label className="wpb-flabel">Nr NIP / PESEL (opcjonalnie)</label>
                <input className="wpb-input" type="text" name="taxIdentifier" value={formData.taxIdentifier}
                  onChange={handleChange} placeholder="1234567890" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="wpb-field">
                <label className="wpb-flabel">Adres</label>
                <input className="wpb-input" type="text" name="address" required value={formData.address}
                  onChange={handleChange} placeholder="Ulica, miasto" />
              </div>
              <div className="wpb-field">
                <label className="wpb-flabel">Telefon</label>
                <input className="wpb-input" type="text" name="phone" required value={formData.phone}
                  onChange={handleChange} placeholder="123 456 789" />
              </div>
            </div>

            <button type="submit" disabled={isLoading || !formData.name}
              className="wpb-btn wpb-btn--primary wpb-btn--block" style={{ marginTop: 10 }}>
              {isLoading ? <span className="wpb-spin" style={{ width: 18, height: 18 }} />
                : <>Zapisz i przejdź do aplikacji <ArrowRight /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
