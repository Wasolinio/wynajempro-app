import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Search, RefreshCw, Copy, ShieldCheck, ShieldAlert, Eye, EyeOff, Layers,
} from 'lucide-react';
import {
  adminCall, fmtNum, fmtDate, fmtDateTime, fmtRelative, STATUS_LABEL, STATUS_TONE,
} from '../adminApi';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Wszystkie statusy' },
  { value: 'trialing', label: 'Trial' },
  { value: 'active', label: 'Aktywna' },
  { value: 'past_due', label: 'Zaległość' },
  { value: 'canceled', label: 'Anulowana' },
  { value: 'brak dokumentu', label: 'Bez dokumentu' },
];

/** 1–365, z domyślnym 14 dla pustego i niepoprawnego pola. */
const dniTrialu = (wartosc) => {
  const n = Math.floor(Number(wartosc));
  if (!Number.isFinite(n) || n < 1) return 14;
  return Math.min(n, 365);
};

const Kv = ({ k, v, mono }) => (
  <div className="wpa-kv">
    <span className="wpa-kv__k">{k}</span>
    <span className={`wpa-kv__v${mono ? ' wpa-kv__v--mono' : ''}`}>{v}</span>
  </div>
);

/*
  Konta (02) — lista po lewej, szczegóły wybranego konta po prawej.

  Zakres celowo zatrzymany na poziomie 1 (konto i subskrypcja). Ustawienia to osobne
  kliknięcie, a dane Gości — rezerwacje, podpisy — panel wyłącznie LICZY i nigdy nie
  pokazuje. To ta sama granica, co w docs/support/Proces-obslugi-zgloszen.md: wobec
  danych Gości Operator jest procesorem, nie administratorem.
*/
export default function UsersView({ onDataChanged }) {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [obciete, setObciete] = useState(false);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [trialDays, setTrialDays] = useState(14);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminCall('users', { q, status, limit: 200 });
      setRows(res.rows);
      setTotal(res.total);
      setObciete(Boolean(res.truncated));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [q, status]);

  // Wyszukiwanie z opóźnieniem — każde naciśnięcie klawisza to wywołanie funkcji.
  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const openDetail = useCallback(async (uid, opts = {}) => {
    setSelected(uid);
    setDetailLoading(true);
    try {
      const res = await adminCall('user', { uid, ...opts });
      setDetail(res);
    } catch (err) {
      toast.error(err.message);
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const runAction = async (mode, extra = {}) => {
    if (!detail) return;
    setBusy(true);
    try {
      await adminCall('grantAccess', { uid: detail.account.uid, mode, ...extra });
      toast.success(
        mode === 'trial' ? `Trial przedłużony o ${extra.days} dni.`
          : mode === 'active' ? 'Dostęp nadany (status: aktywna).'
            : 'Dostęp odebrany (status: anulowana).'
      );
      await openDetail(detail.account.uid);
      await load();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const copyUid = (uid) => {
    navigator.clipboard.writeText(uid).then(
      () => toast.success('UID skopiowany.'),
      () => toast.error('Nie udało się skopiować.')
    );
  };

  // Akcje dostępu wymagają OBU stron konta: dokumentu (bo tam idzie status)
  // i loginu Auth (bo tam idzie claim). Brak którejkolwiek = akcja nic nie da,
  // a przy okazji zostawiłaby konto w stanie połowicznym.
  const brakKonta = Boolean(detail && (detail.account.missingDoc || detail.account.missingAuth));

  return (
    <div className="wpa-split">
      <div>
        <div className="wpa-toolbar">
          <div className="wpd-search" style={{ maxWidth: 320 }}>
            <Search />
            <input type="text" placeholder="E-mail, nazwa albo UID…" value={q}
              onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className="wpd-select wpd-select--sm" value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <div className="wpa-toolbar__spacer" />
          <span className="wpd-label">{fmtNum(total)} kont</span>
          <button className="wpd-btn wpd-btn--sm" onClick={load} disabled={loading}>
            <RefreshCw className={loading ? 'wpd-rotate' : ''} style={{ width: 14, height: 14 }} /> Odśwież
          </button>
        </div>

        {obciete && (
          <div className="wpd-note wpd-note--danger" style={{ marginBottom: 14 }}>
            Skan rezerwacji sięgnął limitu bezpieczeństwa — kolumna „Rezerw." pokazuje
            liczby <b>zaniżone</b>. Trzeba przejść na liczniki agregujące.
          </div>
        )}
        <div className="wpd-panel">
          <table className="wpd-table wpa-table">
            <thead>
              <tr>
                <th>Konto</th>
                <th>Status</th>
                <th>Rejestracja</th>
                <th className="wpd-num">Rezerw.</th>
                <th>Ostatnie logowanie</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.uid}
                  className={`wpa-pick${selected === r.uid ? ' wpa-pick--on' : ''}`}
                  onClick={() => openDetail(r.uid)}>
                  <td>
                    <div className="wpd-cell-strong">{r.email || '(bez adresu)'}</div>
                    <div className="wpd-cell-sub">
                      {r.name || '—'}
                      {r.isAdmin && ' · ADMIN'}
                      {r.emailVerified === false && ' · ADRES NIEPOTWIERDZONY'}
                    </div>
                  </td>
                  <td>
                    <span className={`wpd-tag wpd-tag--${STATUS_TONE[r.status] || 'muted'}`}>
                      {STATUS_LABEL[r.status] || r.status}
                    </span>
                    {r.trialEndsAt && <div className="wpd-cell-sub">do {fmtRelative(r.trialEndsAt)}</div>}
                  </td>
                  <td className="wpd-cell-num">{fmtDate(r.createdAt)}</td>
                  <td className="wpd-num wpd-cell-num">{r.rentals}</td>
                  <td className="wpd-cell-num">{r.lastSignInAt ? fmtRelative(r.lastSignInAt) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length === 0 && !loading && (
            <div className="wpd-empty"><p>Żadne konto nie pasuje do filtrów.</p></div>
          )}
          {loading && rows.length === 0 && (
            <div className="wpd-empty"><div className="wpd-spin" style={{ margin: '0 auto' }} /></div>
          )}
        </div>
      </div>

      {/* ── Szczegóły konta ── */}
      <div className="wpa-detail">
        {!detail && !detailLoading && (
          <div className="wpd-soon"><p className="wpd-label">Wybierz konto z listy</p></div>
        )}
        {detailLoading && (
          <div className="wpd-panel" style={{ padding: 40, textAlign: 'center' }}>
            <div className="wpd-spin" style={{ margin: '0 auto' }} />
          </div>
        )}
        {detail && !detailLoading && (
          <>
            <div className="wpd-panel">
              <div className="wpd-panel__head">
                <h2 className="wpd-h2" style={{ fontSize: 15, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {detail.account.email || '(bez adresu)'}
                </h2>
                <button className="wpd-iconbtn" title="Kopiuj UID" style={{ marginLeft: 'auto' }}
                  onClick={() => copyUid(detail.account.uid)}><Copy /></button>
              </div>
              <div style={{ padding: '4px 20px 16px' }}>
                <Kv k="UID" v={detail.account.uid} mono />
                <Kv k="Nazwa" v={detail.account.name || '—'} />
                <Kv k="Status" v={
                  <span className={`wpd-tag wpd-tag--${STATUS_TONE[detail.account.status] || 'muted'}`}>
                    {STATUS_LABEL[detail.account.status] || detail.account.status}
                  </span>
                } />
                <Kv k="Rejestracja" v={fmtDateTime(detail.account.createdAt || detail.account.createdAtAuth)} mono />
                <Kv k="Trial do" v={detail.account.trialEndsAt
                  ? `${fmtDateTime(detail.account.trialEndsAt)} (${fmtRelative(detail.account.trialEndsAt)})` : '—'} mono />
                <Kv k="Adres e-mail" v={detail.account.emailVerified === null ? 'brak loginu'
                  : detail.account.emailVerified ? 'potwierdzony' : 'NIEPOTWIERDZONY'} />
                <Kv k="Logowanie" v={detail.account.provider === 'google.com' ? 'Google' : 'hasło'} />
                <Kv k="Ostatnie logowanie" v={detail.account.lastSignInAt
                  ? `${fmtDateTime(detail.account.lastSignInAt)} (${fmtRelative(detail.account.lastSignInAt)})` : '—'} mono />
                <Kv k="Stripe" v={detail.account.hasStripeSubscription ? 'subskrypcja'
                  : detail.account.hasStripeCustomer ? 'klient bez subskrypcji' : '—'} />
                {detail.account.scheduledDeletionAt && (
                  <Kv k="Usunięcie danych" v={fmtDateTime(detail.account.scheduledDeletionAt)} mono />
                )}
                <Kv k="Dane" v={`${detail.counts.rentals} rezerwacji · ${detail.counts.guides} przewodników`} mono />
                <Kv k="Profil gospodarza" v={detail.counts.hasHostProfile ? 'uzupełniony' : 'brak'} />
              </div>
            </div>

            {/* Rozjazd claim ↔ dokument to najczęstsza przyczyna „zapłaciłem, a widzę paywall". */}
            {detail.mismatch && (
              <div className="wpd-note wpd-note--danger" style={{ marginTop: 14 }}>
                <b>Rozjazd uprawnień.</b> Token mówi „{detail.mismatch.claim}", dokument „{detail.mismatch.document}".
                Reguły czytają najpierw claim — konto może widzieć paywall mimo opłaconej subskrypcji
                albo odwrotnie. Nadanie dostępu poniżej ustawia oba naraz.
              </div>
            )}
            {detail.account.missingDoc && (
              <div className="wpd-note wpd-note--danger" style={{ marginTop: 14 }}>
                Login istnieje, ale nie ma dokumentu <code>users/{detail.account.uid}</code>.
                Konto nie wejdzie do panelu, dopóki front go nie odtworzy przy najbliższym logowaniu.
                Akcje dostępu są wyłączone — nie miałyby na czym zapisać statusu.
              </div>
            )}
            {detail.account.missingAuth && (
              <div className="wpd-note wpd-note--danger" style={{ marginTop: 14 }}>
                Dokument istnieje, ale <b>nie ma loginu</b> — użytkownik Auth został usunięty.
                Akcje dostępu są wyłączone: nie ma komu wydać tokenu, a sam zapis statusu
                zostawiłby konto w stanie połowicznym.
              </div>
            )}

            {/* ── Działania ── */}
            <div className="wpd-panel" style={{ marginTop: 14 }}>
              <div className="wpd-panel__head">
                <ShieldCheck style={{ width: 16, height: 16, color: 'var(--cynober)' }} />
                <h2 className="wpd-h2" style={{ fontSize: 15 }}>Dostęp</h2>
              </div>
              <div style={{ padding: '14px 20px 18px' }} className="wpa-actions">
                <div className="wpa-actions__row">
                  {/* Puste pole dawało `days: 0`; serwer traktował zero jako brak wartości
                      i przedłużał o 14 dni, a komunikat meldował „o 0 dni". Zaciskamy tutaj,
                      żeby wysłana liczba była tą samą, którą widać na ekranie i w toaście. */}
                  <input className="wpd-input wpd-input--num" type="number" min="1" max="365"
                    value={trialDays} onChange={(e) => setTrialDays(e.target.value)}
                    onBlur={() => setTrialDays(dniTrialu(trialDays))}
                    aria-label="Liczba dni trialu" />
                  <button className="wpd-btn wpd-btn--sm" disabled={busy || brakKonta}
                    onClick={() => runAction('trial', { days: dniTrialu(trialDays) })}>
                    Przedłuż trial
                  </button>
                </div>
                <div className="wpa-actions__row">
                  <button className="wpd-btn wpd-btn--sm wpd-btn--primary" disabled={busy || brakKonta}
                    onClick={() => {
                      if (window.confirm('Nadać pełny dostęp (status „aktywna") bez subskrypcji Stripe?')) runAction('active');
                    }}>
                    Nadaj dostęp (beta)
                  </button>
                  <button className="wpd-btn wpd-btn--sm" disabled={busy || brakKonta}
                    onClick={() => {
                      if (window.confirm(
                        'Odebrać dostęp? Konto zobaczy ekran blokady, dane NIE zostaną usunięte.\n\n'
                        + 'Konto z aktywną subskrypcją Stripe zostanie odrzucone — tam anuluje się '
                        + 'w Stripe, bo panel nie zatrzymuje płatności.'
                      )) runAction('revoke');
                    }}>
                    <ShieldAlert style={{ width: 14, height: 14 }} /> Odbierz
                  </button>
                </div>
                <p className="wpd-fhint">
                  Zmiana ustawia status w dokumencie i claim w tokenie naraz. Konto zobaczy skutek
                  po odświeżeniu tokenu — zwykle przy następnym wejściu do panelu.
                  Na koncie z żywą subskrypcją Stripe webhook nadpisze status przy najbliższym zdarzeniu.
                </p>
              </div>
            </div>

            {/* ── Poziom 2 ── */}
            <div className="wpd-panel" style={{ marginTop: 14 }}>
              <div className="wpd-panel__head">
                <Layers style={{ width: 16, height: 16, color: 'var(--faint)' }} />
                <h2 className="wpd-h2" style={{ fontSize: 15 }}>Ustawienia konta</h2>
                <span className="wpd-label" style={{ marginLeft: 'auto' }}>poziom 2</span>
              </div>
              <div style={{ padding: '14px 20px 18px' }}>
                {!detail.settings && (
                  <>
                    <p className="wpd-fhint" style={{ marginBottom: 12 }}>
                      Odczyt ustawień to sięgnięcie po dane osobowe gospodarza. Wchodzisz tu tylko wtedy,
                      gdy konto i subskrypcja nie wyjaśniły sprawy. Każde otwarcie trafia do dziennika.
                    </p>
                    <button className="wpd-btn wpd-btn--sm wpd-btn--block"
                      onClick={() => openDetail(detail.account.uid, { level: 2 })}>
                      <Eye style={{ width: 14, height: 14 }} /> Pokaż ustawienia
                    </button>
                  </>
                )}
                {detail.settings && (
                  <>
                    {detail.settings.hostProfile ? (
                      <>
                        <Kv k="Podmiot" v={detail.settings.hostProfile.entityName || '—'} />
                        <Kv k="Identyfikator" v={
                          <>
                            <span className="wpa-kv__v--mono">
                              {detail.settings.hostProfile.identifierType || '—'} {detail.settings.hostProfile.taxIdentifier || '—'}
                            </span>
                            {!detail.settings.hostProfile.taxIdentifierRevealed && detail.settings.hostProfile.taxIdentifier && (
                              <button className="wpd-alink" style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: 8 }}
                                onClick={() => {
                                  if (window.confirm('Odsłonić pełny identyfikator? Może to być PESEL. Fakt odsłonięcia zapisuje się w dzienniku.')) {
                                    openDetail(detail.account.uid, { level: 2, revealTaxId: true });
                                  }
                                }}>odsłoń</button>
                            )}
                          </>
                        } />
                        <Kv k="Adres" v={detail.settings.hostProfile.address || '—'} />
                        <Kv k="Telefon" v={detail.settings.hostProfile.phone || '—'} />
                        <Kv k="E-mail w profilu" v={detail.settings.hostProfile.email || '—'} />
                      </>
                    ) : (
                      <p className="wpd-fhint">Profil gospodarza nieuzupełniony.</p>
                    )}
                    <Kv k="Obiekty" v={detail.settings.properties ? `${detail.settings.properties.count}` : '0'} mono />
                    <Kv k="Źródła" v={detail.settings.sources ? `${detail.settings.sources.count}` : '0'} mono />
                    <Kv k="Koszty stałe" v={detail.settings.recurringCosts ? `${detail.settings.recurringCosts.count}` : '0'} mono />
                    <Kv k="Stawka podatku" v={detail.settings.tax && detail.settings.tax.rate !== null ? `${detail.settings.tax.rate}%` : '—'} mono />
                    <Kv k="Linki iCal" v={
                      detail.settings.syncLinks && detail.settings.syncLinks.length
                        ? detail.settings.syncLinks.map((l) => `${l.key}: ${l.url}`).join(', ')
                        : '—'
                    } mono />
                    <button className="wpd-btn wpd-btn--sm wpd-btn--block" style={{ marginTop: 12 }}
                      onClick={() => openDetail(detail.account.uid)}>
                      <EyeOff style={{ width: 14, height: 14 }} /> Ukryj
                    </button>
                  </>
                )}
              </div>
            </div>

            <p className="wpd-fhint" style={{ marginTop: 12 }}>
              Rezerwacji i podpisów gości panel nie pokazuje — to dane, wobec których Operator jest
              procesorem. Gdy zgłoszenie naprawdę ich wymaga, idzie się ścieżką z
              <code> docs/support/Proces-obslugi-zgloszen.md</code>.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
