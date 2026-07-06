import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { Heart, ExternalLink, AlertCircle } from 'lucide-react';
import { BrandStyles } from '../styles/brand';

/*
  Publiczna strona podziękowania z prośbą o opinię (X13) — /opinie/{pageId}.
  Czyta bazowy dokument guides/{id}. Strona nie zawiera sekretów ani danych osobowych
  gościa. Odczyt poprzedza anonimowe logowanie — DOKŁADNIE ten wzorzec działa u gości
  w GuestGuideView na produkcji; reguły w repo deklarują publiczny odczyt guides, ale
  stan reguł faktycznie wdrożonych nie jest zweryfikowany (do porównania przy N3).
  Ton celowo nieinwazyjny: najpierw podziękowanie, prośba o opinię jako zaproszenie.
*/
export default function ReviewPageView() {
  const { pageId } = useParams();
  const [page, setPage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        try {
          await signInAnonymously(auth); // listener odpali się ponownie, już z sesją gościa
        } catch (err) {
          console.error('Błąd sesji gościa:', err);
          if (!cancelled) {
            setError('Nie udało się wczytać strony. Odśwież i spróbuj ponownie.');
            setIsLoading(false);
          }
        }
        return;
      }
      try {
        const snap = await getDoc(doc(db, 'guides', pageId));
        if (cancelled) return;
        if (snap.exists() && snap.data().type === 'review') {
          setPage(snap.data());
        } else {
          setError('Strona nie została odnaleziona.');
        }
      } catch (err) {
        console.error('Błąd wczytywania strony opinii:', err);
        if (!cancelled) setError('Nie udało się wczytać strony. Spróbuj ponownie.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    });
    return () => { cancelled = true; unsubscribe(); };
  }, [pageId]);

  if (isLoading) {
    return (
      <div className="wpb">
        <BrandStyles />
        <div className="wpb-center" style={{ flexDirection: 'column', gap: 14 }}>
          <span className="wpb-spin" />
          <p className="wpb-body" style={{ color: 'var(--muted)' }}>Ładowanie…</p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="wpb">
        <BrandStyles />
        <div className="wpb-center">
          <div className="wpb-panel" style={{ textAlign: 'center' }}>
            <span className="wpb-ic" style={{ margin: '0 auto 16px' }}><AlertCircle /></span>
            <h1 className="wpb-h2" style={{ marginBottom: 8 }}>Nie znaleziono strony</h1>
            <p className="wpb-body" style={{ margin: 0 }}>{error || 'Strona nie została odnaleziona.'}</p>
          </div>
        </div>
      </div>
    );
  }

  const links = (page.links || []).filter((l) => l.url);

  return (
    <div className="wpb">
      <BrandStyles />
      <div className="wpb-center" style={{ flexDirection: 'column', gap: 14 }}>
        <div className="wpb-panel" style={{ textAlign: 'center' }}>
          <span className="wpb-ic wpb-ic--green" style={{ margin: '0 auto 16px' }}><Heart /></span>
          {page.property && <span className="wpb-label">{page.property}</span>}
          <h1 className="wpb-h2" style={{ margin: '6px 0 12px' }}>{page.title || 'Dziękujemy za pobyt'}</h1>
          {page.message && (
            <p className="wpb-body" style={{ whiteSpace: 'pre-wrap', textAlign: 'left', margin: '0 0 20px' }}>
              {page.message}
            </p>
          )}
          {links.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {links.map((l, i) => (
                <a key={i} className="wpb-btn wpb-btn--block" href={l.url} target="_blank" rel="noopener noreferrer">
                  {l.label || 'Zostaw opinię'} <ExternalLink />
                </a>
              ))}
            </div>
          )}
          <p className="wpb-meta" style={{ marginTop: 16, textAlign: 'center' }}>To zajmie około minuty.</p>
        </div>
        {/* kredyt spójny z przewodnikiem gościa (GuestGuideView) — zwykły tekst,
            bez linku: jedynym zadaniem strony jest klik w portal opinii */}
        <p className="wpb-meta" style={{ margin: 0 }}>Stworzono za pomocą WynajemPRO</p>
      </div>
    </div>
  );
}
