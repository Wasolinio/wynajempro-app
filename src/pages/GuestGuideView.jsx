import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import {
  MapPin, Wifi, Key, BookOpen, Navigation, ExternalLink, Copy, CheckCircle2, AlertCircle,
  Download, FileText, Home, ShieldAlert, Lock, Unlock, Phone, Mail,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { BrandStyles } from '../styles/brand';
import { safeHref } from '../utils/url';

export default function GuestGuideView() {
  const { guideId } = useParams();
  const [guide, setGuide] = useState(null);
  const [secrets, setSecrets] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedWifi, setCopiedWifi] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);
  const [authUid, setAuthUid] = useState(null);

  const [isAccepted, setIsAccepted] = useState(false);
  const [checkRegulations, setCheckRegulations] = useState(false);
  const [checkPpo, setCheckPpo] = useState(false);
  const [isSavingAcceptance, setIsSavingAcceptance] = useState(false);

  const [hostContact, setHostContact] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthUid(user.uid);
        await fetchGuideData(user.uid);
      } else {
        try {
          const userCredential = await signInAnonymously(auth);
          setAuthUid(userCredential.user.uid);
          await fetchGuideData(userCredential.user.uid);
        } catch (e) {
          console.error('Błąd autentykacji anonimowej:', e);
          setError('Wystąpił błąd autoryzacji sesji. Odśwież stronę.');
          setIsLoading(false);
        }
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guideId]);

  const fetchGuideData = async (uid) => {
    try {
      const docSnap = await getDoc(doc(db, 'guides', guideId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setGuide(data);

        if (data.ownerId) {
          try {
            // publicContact = wąski publiczny kontakt (entityName/phone/email);
            // pełny hostProfile (NIP/PESEL, adres) nie jest już czytelny publicznie (N5 🟡5)
            const hostSnap = await getDoc(doc(db, 'users', data.ownerId, 'settings', 'publicContact'));
            if (hostSnap.exists()) setHostContact(hostSnap.data());
          } catch { /* pomijamy sekcję kontaktu */ }
        }

        try {
          const sigRef = doc(db, 'guides', guideId, 'signatures', uid);
          const sigSnap = await getDoc(sigRef);
          if (sigSnap.exists()) {
            setIsAccepted(true);
            await fetchSecrets();
          } else {
            const oldSessionKey = localStorage.getItem(`wp_guest_${guideId}`);
            if (oldSessionKey) {
              const oldSigSnap = await getDoc(doc(db, 'guides', guideId, 'signatures', oldSessionKey));
              if (oldSigSnap.exists()) {
                await setDoc(sigRef, oldSigSnap.data());
                setIsAccepted(true);
                await fetchSecrets();
              }
              localStorage.removeItem(`wp_guest_${guideId}`);
            }
          }
        } catch (e) {
          console.error('Nie udało się pobrać statusu akceptacji:', e);
        }
      } else {
        setError('Ten przewodnik nie istnieje lub został usunięty.');
      }
    } catch (err) {
      console.error('Błąd ładowania przewodnika:', err);
      setError('Wystąpił błąd podczas ładowania przewodnika. Spróbuj ponownie później.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSecrets = async () => {
    try {
      const secretsSnap = await getDoc(doc(db, 'guides', guideId, 'secrets', 'data'));
      if (secretsSnap.exists()) setSecrets(secretsSnap.data());
    } catch (e) {
      console.error('Nie udało się pobrać danych dostępowych z subkolekcji:', e);
      // Fallback dla starszych przewodników, gdzie sekrety były w głównym dokumencie
      setSecrets({ wifiNetwork: guide?.wifiNetwork, wifiPassword: guide?.wifiPassword, doorPin: guide?.doorPin });
    }
  };

  const handleAccept = async () => {
    if (!authUid) return;
    setIsSavingAcceptance(true);
    try {
      const sigRef = doc(db, 'guides', guideId, 'signatures', authUid);
      await setDoc(sigRef, {
        acceptedRegulations: true,
        acceptedPpo: true,
        acceptedAt: Timestamp.now(),
        acceptedHouseRulesSnapshot: guide.houseRules || '',
        acceptedHouseRulesFileName: guide.houseRulesFile?.name || '',
        acceptedHouseRulesFileUrl: guide.houseRulesFile?.url || '',
        acceptedPpoRulesSnapshot: guide.ppoRules || '',
      });
      await fetchSecrets();
      setIsAccepted(true);
      toast.success('Dane dostępowe zostały odblokowane!', { position: 'top-center' });
    } catch (err) {
      console.error('Błąd zapisu akceptacji:', err);
      toast.error('Wystąpił błąd. Spróbuj ponownie.');
    } finally {
      setIsSavingAcceptance(false);
    }
  };

  const copyToClipboard = (text, setter) => {
    navigator.clipboard.writeText(text);
    toast.success('Skopiowano do schowka!', { position: 'top-center' });
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  // Czy przewodnik ma dane wrażliwe (nowe: flaga hasSensitiveData; stare: pola na dokumencie; po odblokowaniu: secrets)
  const hasSensitiveData = !!(secrets?.wifiNetwork || secrets?.doorPin || guide?.hasSensitiveData || guide?.wifiNetwork || guide?.doorPin);
  const needsAcceptance = hasSensitiveData && (guide?.houseRules || guide?.houseRulesFile || guide?.ppoRules);

  if (isLoading) {
    return (
      <div className="wpb">
        <BrandStyles />
        <div className="wpb-center" style={{ flexDirection: 'column', gap: 14 }}>
          <span className="wpb-spin" />
          <p className="wpb-body" style={{ color: 'var(--muted)' }}>Ładowanie przewodnika…</p>
        </div>
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="wpb">
        <BrandStyles />
        <div className="wpb-center">
          <div className="wpb-panel" style={{ textAlign: 'center' }}>
            <span className="wpb-ic" style={{ margin: '0 auto 16px' }}><AlertCircle /></span>
            <h1 className="wpb-h2" style={{ marginBottom: 8 }}>Brak dostępu</h1>
            <p className="wpb-body" style={{ color: 'var(--muted)', margin: 0 }}>{error || 'Przewodnik nie został odnaleziony.'}</p>
          </div>
        </div>
      </div>
    );
  }

  const RevealCard = ({ icon, title, children }) => (
    <div className="wpb-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <span className="wpb-ic" style={{ width: 38, height: 38 }}>{icon}</span>
        <h2 className="wpb-h2" style={{ fontSize: 16 }}>{title}</h2>
      </div>
      {children}
    </div>
  );

  return (
    <div className="wpb">
      <BrandStyles />

      {/* COVER */}
      <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--hairline)', padding: '28px 18px 34px', textAlign: 'center' }}>
        <div style={{ maxWidth: 460, margin: '0 auto' }}>
          {guide.coverImage ? (
            <img src={guide.coverImage} alt={guide.name}
              style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 4, border: '1px solid var(--hairline)', marginBottom: 20 }} />
          ) : (
            <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: 4, border: '1px solid var(--hairline)', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: 'var(--inner)', backgroundImage: 'linear-gradient(var(--inner-2) 1px, transparent 1px), linear-gradient(90deg, var(--inner-2) 1px, transparent 1px)', backgroundSize: '18px 18px' }}>
              <Home style={{ width: 40, height: 40, color: 'var(--faint)' }} />
            </div>
          )}
          {guide.propertyId && <span className="wpb-tag" style={{ marginBottom: 10 }}>{guide.propertyId}</span>}
          <h1 className="wpb-h1" style={{ fontSize: 30, margin: '6px 0 0' }}>{guide.name}</h1>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 18px 48px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* DANE DOSTĘPOWE (reveal) — bramkowane flagą hasSensitiveData, nie wyciętymi polami */}
        {hasSensitiveData && (
          !isAccepted ? (
            <div className="wpb-card" style={{ textAlign: 'center', padding: 28 }}>
              <span className="wpb-ic" style={{ margin: '0 auto 14px', color: 'var(--amber)' }}><Lock /></span>
              <h2 className="wpb-h2" style={{ fontSize: 17, marginBottom: 6 }}>Dane dostępowe zablokowane</h2>
              <p className="wpb-body" style={{ color: 'var(--muted)', margin: 0 }}>
                {needsAcceptance
                  ? 'Zaakceptuj regulamin poniżej, aby odsłonić hasło Wi-Fi i kod do drzwi.'
                  : 'Kliknij „Odkryj dane dostępowe” poniżej, aby zobaczyć hasło Wi-Fi i kod do drzwi.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: (secrets?.wifiNetwork && secrets?.doorPin) ? '1fr 1fr' : '1fr', gap: 14 }} className="wpb-reveal">
              {secrets?.wifiNetwork && (
                <RevealCard icon={<Wifi />} title="Sieć Wi-Fi">
                  <div>
                    <p className="wpb-flabel" style={{ margin: '0 0 3px' }}>Sieć</p>
                    <p className="wpb-mono" style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 16, margin: 0 }}>{secrets.wifiNetwork}</p>
                  </div>
                  {secrets.wifiPassword && (
                    <>
                      <div>
                        <p className="wpb-flabel" style={{ margin: '0 0 3px' }}>Hasło</p>
                        <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 18, margin: 0, letterSpacing: '.04em' }}>{secrets.wifiPassword}</p>
                      </div>
                      <button onClick={() => copyToClipboard(secrets.wifiPassword, setCopiedWifi)}
                        className={`wpb-btn wpb-btn--block${copiedWifi ? '' : ''}`} style={{ height: 40, fontSize: 13, color: copiedWifi ? 'var(--green)' : 'var(--ink)', borderColor: copiedWifi ? '#D7E2DA' : 'var(--hairline)', background: copiedWifi ? 'var(--tint-green)' : 'var(--surface)' }}>
                        {copiedWifi ? <><CheckCircle2 style={{ width: 15, height: 15 }} /> Skopiowano</> : <><Copy style={{ width: 15, height: 15 }} /> Kopiuj hasło</>}
                      </button>
                    </>
                  )}
                </RevealCard>
              )}

              {secrets?.doorPin && (
                <RevealCard icon={<Key />} title="Dostęp">
                  <div>
                    <p className="wpb-flabel" style={{ margin: '0 0 4px' }}>Kod do drzwi</p>
                    <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 26, margin: 0, letterSpacing: '.18em' }}>{secrets.doorPin}</p>
                  </div>
                  <button onClick={() => copyToClipboard(secrets.doorPin, setCopiedPin)}
                    className="wpb-btn wpb-btn--block" style={{ height: 40, fontSize: 13, color: copiedPin ? 'var(--green)' : 'var(--ink)', borderColor: copiedPin ? '#D7E2DA' : 'var(--hairline)', background: copiedPin ? 'var(--tint-green)' : 'var(--surface)' }}>
                    {copiedPin ? <><CheckCircle2 style={{ width: 15, height: 15 }} /> Skopiowano</> : <><Copy style={{ width: 15, height: 15 }} /> Kopiuj kod</>}
                  </button>
                </RevealCard>
              )}

              {!secrets?.wifiNetwork && !secrets?.doorPin && (
                <div className="wpb-note wpb-note--info">Gospodarz nie zapisał jeszcze danych dostępowych dla tego przewodnika.</div>
              )}
            </div>
          )
        )}

        {/* WSKAZÓWKI DOTARCIA */}
        {(guide.checkInInfo || guide.mapLink) && (
          <div className="wpb-card">
            <h2 className="wpb-h2" style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <MapPin style={{ width: 18, height: 18, color: 'var(--cynober)' }} /> Dotarcie i zameldowanie
            </h2>
            {guide.checkInInfo && <p className="wpb-body" style={{ color: 'var(--muted)', whiteSpace: 'pre-wrap', margin: '0 0 16px' }}>{guide.checkInInfo}</p>}
            {safeHref(guide.mapLink) && (
              <a href={safeHref(guide.mapLink)} target="_blank" rel="noreferrer" className="wpb-btn"><MapPin /> Nawiguj (Mapy Google)</a>
            )}
          </div>
        )}

        {/* ATRAKCJE */}
        {guide.attractions?.length > 0 && (
          <div className="wpb-card">
            <h2 className="wpb-h2" style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Navigation style={{ width: 18, height: 18, color: 'var(--green)' }} /> Polecane miejsca
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="wpb-reveal">
              {guide.attractions.map((attr, idx) => (
                <div key={idx} style={{ background: 'var(--inner)', border: '1px solid var(--hairline)', borderRadius: 4, padding: 16 }}>
                  <h3 style={{ fontWeight: 700, fontSize: 15, margin: '0 0 4px' }}>{attr.name}</h3>
                  {attr.description && <p className="wpb-body" style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 12px' }}>{attr.description}</p>}
                  {safeHref(attr.link) && <a href={safeHref(attr.link)} target="_blank" rel="noreferrer" className="wpb-link" style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 5 }}>Sprawdź <ExternalLink style={{ width: 13, height: 13 }} /></a>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REGULAMIN */}
        {(guide.houseRules || guide.houseRulesFile) && (
          <div className="wpb-card">
            <h2 className="wpb-h2" style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <BookOpen style={{ width: 18, height: 18, color: 'var(--granat)' }} /> Regulamin obiektu
            </h2>
            {guide.houseRules && <p className="wpb-body" style={{ color: 'var(--muted)', whiteSpace: 'pre-wrap', margin: '0 0 16px' }}>{guide.houseRules}</p>}
            {guide.houseRulesFile && safeHref(guide.houseRulesFile.url) && (
              <a href={safeHref(guide.houseRulesFile.url)} target="_blank" rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: 'var(--inner)', border: '1px solid var(--hairline)', borderRadius: 4, textDecoration: 'none', color: 'inherit' }}>
                <span className="wpb-ic" style={{ width: 38, height: 38, color: 'var(--granat)' }}><FileText /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>Pobierz regulamin obiektu</div>
                  <div className="wpb-meta" style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{guide.houseRulesFile.name}</div>
                </div>
                <Download style={{ width: 18, height: 18, color: 'var(--faint)' }} />
              </a>
            )}
          </div>
        )}

        {/* PPOŻ */}
        {guide.ppoRules && (
          <div className="wpb-card">
            <h2 className="wpb-h2" style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <ShieldAlert style={{ width: 18, height: 18, color: 'var(--cynober)' }} /> Instrukcja bezpieczeństwa PPOŻ
            </h2>
            <p className="wpb-body" style={{ color: 'var(--muted)', whiteSpace: 'pre-wrap', margin: 0 }}>{guide.ppoRules}</p>
          </div>
        )}

        {/* AKCEPTACJA */}
        {hasSensitiveData && !isAccepted && (
          <div className="wpb-card" style={{ background: 'var(--tint-granat)', borderColor: '#C9D3E0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: needsAcceptance ? 18 : 0 }}>
              <span className="wpb-ic wpb-ic--granat"><Lock /></span>
              <div>
                <h2 className="wpb-h2" style={{ fontSize: 17 }}>Odblokuj dane dostępowe</h2>
                <p className="wpb-body" style={{ color: 'var(--muted)', fontSize: 13, margin: '2px 0 0' }}>
                  {needsAcceptance ? 'Potwierdź zapoznanie się z dokumentami.' : 'Kliknij, aby odsłonić hasło Wi-Fi i kod.'}
                </p>
              </div>
            </div>

            {needsAcceptance && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                {(guide.houseRules || guide.houseRulesFile) && (
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 11, padding: 14, background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 4, cursor: 'pointer' }}>
                    <input type="checkbox" checked={checkRegulations} onChange={(e) => setCheckRegulations(e.target.checked)} style={{ width: 17, height: 17, marginTop: 1, accentColor: 'var(--cynober)', flex: '0 0 17px' }} />
                    <span style={{ fontSize: 13.5, fontWeight: 500 }}>Potwierdzam zapoznanie się i akceptację Regulaminu obiektu.</span>
                  </label>
                )}
                {guide.ppoRules && (
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 11, padding: 14, background: 'var(--surface)', border: '1px solid var(--hairline)', borderRadius: 4, cursor: 'pointer' }}>
                    <input type="checkbox" checked={checkPpo} onChange={(e) => setCheckPpo(e.target.checked)} style={{ width: 17, height: 17, marginTop: 1, accentColor: 'var(--cynober)', flex: '0 0 17px' }} />
                    <span style={{ fontSize: 13.5, fontWeight: 500 }}>Potwierdzam zapoznanie się i akceptację Instrukcji bezpieczeństwa PPOŻ.</span>
                  </label>
                )}
              </div>
            )}

            <button onClick={handleAccept}
              disabled={isSavingAcceptance || ((guide.houseRules || guide.houseRulesFile) && !checkRegulations) || (guide.ppoRules && !checkPpo)}
              className="wpb-btn wpb-btn--primary wpb-btn--block">
              {isSavingAcceptance ? <span className="wpb-spin" style={{ width: 18, height: 18 }} /> : <><Unlock /> Odkryj dane dostępowe</>}
            </button>
          </div>
        )}

        {/* KONTAKT */}
        {hostContact && (hostContact.entityName || hostContact.phone || hostContact.email) && (
          <div className="wpb-card">
            <h2 className="wpb-h2" style={{ fontSize: 17, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Phone style={{ width: 18, height: 18, color: 'var(--cynober)' }} /> Kontakt z gospodarzem
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {hostContact.entityName && (
                <div><p className="wpb-flabel" style={{ margin: '0 0 2px' }}>Gospodarz</p><p style={{ fontWeight: 600, fontSize: 14, margin: 0 }}>{hostContact.entityName}</p></div>
              )}
              {hostContact.phone && (
                <a href={`tel:${hostContact.phone}`} style={{ textDecoration: 'none' }}>
                  <p className="wpb-flabel" style={{ margin: '0 0 2px' }}>Telefon</p>
                  <p className="wpb-link" style={{ fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Phone style={{ width: 14, height: 14 }} /> {hostContact.phone}</p>
                </a>
              )}
              {hostContact.email && (
                <a href={`mailto:${hostContact.email}`} style={{ textDecoration: 'none' }}>
                  <p className="wpb-flabel" style={{ margin: '0 0 2px' }}>E-mail</p>
                  <p className="wpb-link" style={{ fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Mail style={{ width: 14, height: 14 }} /> {hostContact.email}</p>
                </a>
              )}
            </div>
          </div>
        )}

        <p className="wpb-meta" style={{ textAlign: 'center', marginTop: 8 }}>Stworzono za pomocą WynajemPRO</p>

        <style>{`@media (max-width:560px){ .wpb-reveal{ grid-template-columns:1fr !important; } }`}</style>
      </div>
    </div>
  );
}
