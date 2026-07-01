import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { BrandStyles } from '../styles/brand';

export default function LegalLayout({ title, subtitle, lastUpdated, children, bare = false, wide = false, label }) {
  return (
    <div className="wpb">
      <BrandStyles />

      <header className="wpb-topbar">
        <div className="wpb-topbar__in">
          <Link to="/" className="wpb-back"><ArrowLeft /> <span>Wróć do strony głównej</span></Link>
          <div className="wpb-topbar__nav">
            <Link to="/login" className="wpb-link">Zarejestruj się</Link>
            <Link to="/" className="wpb-logo">
              <span className="wpb-logo__word">Wynajem</span><span className="wpb-logo__pro">PRO</span>
            </Link>
          </div>
        </div>
      </header>

      <main className={`wpb-container${wide ? '' : ' wpb-narrow'}`}>
        <div className="wpb-head wpb-head--center">
          <span className="wpb-label">{label || (bare ? 'WynajemPRO' : 'Dokument')}</span>
          <h1 className="wpb-h1">{title}</h1>
          {subtitle && <p className="wpb-lead">{subtitle}</p>}
          {lastUpdated && <p className="wpb-meta">Ostatnia aktualizacja: {lastUpdated}</p>}
        </div>

        {bare ? children : <article className="wpb-card wpb-prose">{children}</article>}
      </main>

      <footer className="wpb-footer">
        © {new Date().getFullYear()} WynajemPRO. Wszelkie prawa zastrzeżone.
      </footer>
    </div>
  );
}
