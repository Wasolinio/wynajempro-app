import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Users, Inbox, Mail, Activity, ScrollText,
  RefreshCw, Power, ArrowLeft, ShieldAlert, WifiOff, AlertTriangle,
} from 'lucide-react';

import { auth } from '../../firebase';
import { DASHBOARD_CSS } from '../dashboard/styles';
import { ADMIN_CSS } from './styles';
import { adminCall } from './adminApi';

import OverviewView from './views/OverviewView';
import UsersView from './views/UsersView';
import MessagesView from './views/MessagesView';
import NewsletterView from './views/NewsletterView';
import HealthView from './views/HealthView';
import AuditView from './views/AuditView';

const NAV = [
  { key: 'overview', num: '01', label: 'Przegląd', icon: LayoutDashboard, title: 'Przegląd', sub: 'Rejestracje, subskrypcje, stan produktu' },
  { key: 'users', num: '02', label: 'Konta', icon: Users, title: 'Konta', sub: 'Wyszukiwanie, diagnostyka, dostęp' },
  { key: 'messages', num: '03', label: 'Zgłoszenia', icon: Inbox, title: 'Zgłoszenia serwisowe', sub: 'Skrzynka z formularza kontaktowego' },
  { key: 'newsletter', num: '04', label: 'Newsletter', icon: Mail, title: 'Newsletter', sub: 'Zapisy wraz z dowodem zgody' },
  { key: 'health', num: '05', label: 'Porządek', icon: Activity, title: 'Porządek w danych', sub: 'Zobowiązania, rozjazdy, retencja' },
  { key: 'audit', num: '06', label: 'Dziennik', icon: ScrollText, title: 'Dziennik administratora', sub: 'Kto, kiedy i po co sięgnął po dane' },
];

/*
  PANEL ADMINISTRATORA — powłoka.

  Ta sama identyfikacja co panel gospodarza (namespace `.wpd` + dodatek `.wpa`), bo to ten
  sam produkt oglądany od drugiej strony. Wyróżnia go wyłącznie znacznik ADMIN w sidebarze
  i cegła zamiast cynobru na tym znaczniku — dość, żeby nie pomylić okien, za mało, żeby
  budować drugi język wizualny.

  Uprawnienie sprawdzają DWA miejsca i to nie jest nadmiarowość:
   • tutaj — claim `admin` w tokenie, żeby nie pokazywać ekranów bez treści,
   • w funkcji `adminApi` — ten sam claim, i to jest jedyna prawdziwa bramka.
  Kto podmieni sobie stan w przeglądarce, zobaczy puste widoki i błędy 403.
*/
export default function AdminApp() {
  const [state, setState] = useState('checking'); // checking | denied | error | ready
  const [bladTokenu, setBladTokenu] = useState('');
  const [view, setView] = useState('overview');
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bladPrzegladu, setBladPrzegladu] = useState('');
  const [email, setEmail] = useState('');

  // Token wydany PRZED nadaniem claimu nie ma o nim pojęcia — wymuszamy odświeżenie,
  // żeby nadanie uprawnienia nie wymagało wylogowania i logowania z powrotem.
  useEffect(() => {
    let alive = true;
    (async () => {
      const user = auth.currentUser;
      if (!user) { if (alive) setState('denied'); return; }
      try {
        const token = await user.getIdTokenResult(true);
        if (!alive) return;
        setEmail(user.email || '');
        setState(token.claims.admin === true ? 'ready' : 'denied');
      } catch (err) {
        // NIE 'denied'. `getIdTokenResult(true)` idzie po sieć, więc offline albo
        // chwilowa awaria kończyły się ekranem „Brak uprawnień" z instrukcją nadania
        // claimu, który administrator ma. Odmowa to odmowa, awaria to awaria.
        if (!alive) return;
        setEmail(user.email || '');
        setBladTokenu(err && err.message ? err.message : 'Nie udało się odświeżyć tokenu.');
        setState('error');
      }
    })();
    return () => { alive = false; };
  }, []);

  const loadOverview = useCallback(async (fresh = false) => {
    setLoading(true);
    setBladPrzegladu('');
    try {
      setOverview(await adminCall('overview', fresh ? { fresh: true } : {}));
    } catch (err) {
      // Sam toast nie wystarczy: znika po kilku sekundach, a `overview` zostaje null,
      // więc ekran kręciłby spinner w nieskończoność. Pierwsze wejście po wdrożeniu
      // to najbardziej prawdopodobny moment na błąd — i wtedy trzeba widzieć POWÓD.
      toast.error(err.message);
      setBladPrzegladu(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (state === 'ready') loadOverview();
  }, [state, loadOverview]);

  const handleLogout = () => signOut(auth).then(() => { window.location.href = '/login'; });

  if (state === 'checking') {
    return (
      <div className="wpd">
        <style>{DASHBOARD_CSS}{ADMIN_CSS}</style>
        <div className="wpd-loader"><div className="wpd-spin" /></div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="wpd">
        <style>{DASHBOARD_CSS}{ADMIN_CSS}</style>
        <div className="wpa-gate">
          <div className="wpa-gate__box">
            <WifiOff style={{ width: 30, height: 30, color: 'var(--amber)' }} />
            <h1 style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-.02em', margin: '14px 0 8px' }}>
              Nie udało się sprawdzić uprawnień
            </h1>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>
              To nie znaczy, że ich nie masz — sprawdzenie wymaga połączenia z siecią i właśnie
              się nie powiodło.
            </p>
            <p className="wpd-fhint" style={{ marginTop: 12 }}>{bladTokenu}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 18, justifyContent: 'center' }}>
              <button className="wpd-btn wpd-btn--sm wpd-btn--primary" onClick={() => window.location.reload()}>
                Spróbuj ponownie
              </button>
              <Link className="wpd-btn wpd-btn--sm" to="/dashboard">Do panelu</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'denied') {
    return (
      <div className="wpd">
        <style>{DASHBOARD_CSS}{ADMIN_CSS}</style>
        <div className="wpa-gate">
          <div className="wpa-gate__box">
            <ShieldAlert style={{ width: 30, height: 30, color: 'var(--cynober)' }} />
            <h1 style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-.02em', margin: '14px 0 8px' }}>
              Brak uprawnień
            </h1>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>
              To konto nie ma uprawnienia administratora. Nadaje się je kluczem serwisowym:
            </p>
            {/* Komenda musi być tą, która ZADZIAŁA: skrypt wymaga uruchomienia z katalogu
                functions/ (tam leży firebase-admin) i klucza serwisowego w zmiennej. */}
            <code style={{
              display: 'block', marginTop: 12, padding: '10px 12px', background: 'var(--inner)',
              border: '1px solid var(--hairline)', borderRadius: 3, fontSize: 11.5,
              wordBreak: 'break-all', textAlign: 'left', lineHeight: 1.7,
            }}>
              cd functions{'\n'}GOOGLE_APPLICATION_CREDENTIALS=/ścieżka/klucz.json \{'\n'}
              {'  '}node set-admin-claim.cjs {email || '<e-mail>'}
            </code>
            <div style={{ display: 'flex', gap: 8, marginTop: 18, justifyContent: 'center' }}>
              <Link className="wpd-btn wpd-btn--sm" to="/dashboard">Do panelu</Link>
              <button className="wpd-btn wpd-btn--sm" onClick={handleLogout}>Wyloguj</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const meta = NAV.find((n) => n.key === view);
  const newMessages = overview ? overview.messages.new : 0;

  return (
    <div className="wpd">
      <style>{DASHBOARD_CSS}{ADMIN_CSS}</style>
      <div className="wpd-shell">
        <aside className="wpd-side">
          <div className="wpd-side__brand">
            <span className="wpd-logo__word">Wynajem</span>
            <span className="wpd-logo__pro">PRO</span>
            <span className="wpa-badge">Admin</span>
          </div>

          <nav className="wpd-nav">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.key}
                  className={`wpd-nav__item${view === item.key ? ' wpd-nav__item--active' : ''}`}
                  onClick={() => setView(item.key)}>
                  <span className="wpd-nav__num">{item.num}</span>
                  <Icon style={{ width: 17, height: 17 }} />
                  <span>{item.label}</span>
                  {item.key === 'messages' && newMessages > 0 && (
                    <span className="wpd-sync__time" style={{ color: 'var(--cynober)' }}>{newMessages}</span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Granica zakresu wypisana tam, gdzie się pracuje — nie w dokumencie obok. */}
          <p className="wpa-side-note">
            Panel czyta dane serwerowo i tylko do odczytu poza polami statusu.
            Rezerwacji i podpisów gości nie pokazuje — liczy je.
          </p>

          <div className="wpd-user">
            <div style={{ minWidth: 0, flex: '1 1 auto' }}>
              <div className="wpd-user__name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {email || 'administrator'}
              </div>
              <div className="wpd-user__plan">tryb administratora</div>
            </div>
            <Link className="wpd-user__out" to="/dashboard" title="Panel gospodarza"><ArrowLeft /></Link>
            <button className="wpd-user__out" style={{ marginLeft: 6 }} title="Wyloguj" onClick={handleLogout}><Power /></button>
          </div>
        </aside>

        <div className="wpd-main">
          {/* Nawigacja dla wąskich ekranów — sidebar znika poniżej 980 px (reguła
              odziedziczona z panelu gospodarza). Ta sama lista, poziomo. */}
          <nav className="wpa-mnav">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.key}
                  className={`wpa-mnav__item${view === item.key ? ' wpa-mnav__item--on' : ''}`}
                  onClick={() => setView(item.key)}>
                  <Icon style={{ width: 16, height: 16 }} />
                  <span>{item.label}</span>
                  {item.key === 'messages' && newMessages > 0 && (
                    <span className="wpa-mnav__count">{newMessages}</span>
                  )}
                </button>
              );
            })}
            <button className="wpa-mnav__out" title="Wyloguj" onClick={handleLogout}><Power /></button>
          </nav>

          <header className="wpd-top">
            <div className="wpd-top__title">
              <h1>{meta.title}</h1>
              <p className="wpd-top__sub">{meta.sub}</p>
            </div>
            <div className="wpd-top__spacer" />
            {view === 'overview' && (
              <button className="wpd-btn wpd-btn--sm" onClick={() => loadOverview(true)} disabled={loading}>
                <RefreshCw className={loading ? 'wpd-rotate' : ''} style={{ width: 14, height: 14 }} /> Odśwież
              </button>
            )}
          </header>

          <main className="wpd-content wpa-content">
            <div className="wpd-view" key={view}>
              {view === 'overview' && (
                overview ? <OverviewView data={overview} onGo={setView} />
                  : bladPrzegladu ? (
                    <div className="wpd-panel" style={{ padding: '32px 24px', textAlign: 'center' }}>
                      <AlertTriangle style={{ width: 26, height: 26, color: 'var(--cynober)' }} />
                      <h2 className="wpd-h2" style={{ margin: '12px 0 8px' }}>Nie udało się pobrać danych</h2>
                      <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '0 auto', maxWidth: 520, lineHeight: 1.6 }}>
                        {bladPrzegladu}
                      </p>
                      <button className="wpd-btn wpd-btn--sm wpd-btn--primary" style={{ marginTop: 16 }}
                        onClick={() => loadOverview(true)}>
                        <RefreshCw style={{ width: 14, height: 14 }} /> Spróbuj ponownie
                      </button>
                    </div>
                  )
                  : <div className="wpd-empty"><div className="wpd-spin" style={{ margin: '0 auto' }} /></div>
              )}
              {view === 'users' && <UsersView onDataChanged={() => loadOverview(true)} />}
              {view === 'messages' && <MessagesView onDataChanged={() => loadOverview(true)} />}
              {view === 'newsletter' && <NewsletterView />}
              {view === 'health' && <HealthView />}
              {view === 'audit' && <AuditView />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
