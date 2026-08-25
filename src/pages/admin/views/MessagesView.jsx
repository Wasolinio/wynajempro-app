import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Search, RefreshCw, Mail, FlaskConical, Save, UserSearch } from 'lucide-react';
import { adminCall, fmtNum, fmtDateTime, fmtRelative } from '../adminApi';

const STATUS_META = {
  new: { label: 'Nowe', tone: 'cynober' },
  open: { label: 'W toku', tone: 'amber' },
  closed: { label: 'Zamknięte', tone: 'green' },
};

const FILTERS = [
  { value: 'new', label: 'Nowe' },
  { value: 'open', label: 'W toku' },
  { value: 'closed', label: 'Zamknięte' },
  { value: 'all', label: 'Wszystkie' },
];

/*
  Zgłoszenia (03) — skrzynka z formularza /kontakt.

  Dwie rzeczy, których ten ekran pilnuje, bo obie już raz kosztowały:
  1. Zgłoszenia testowe (`source: kontakt-test`) są DOMYŚLNIE UKRYTE. 2026-08-10 zgłoszenie
     testowe z wymyśloną treścią uruchomiło pełną diagnostykę awarii, której nie było
     (Known-Issues #12). Widać je dopiero po świadomym przełączeniu.
  2. Zgłoszenie ma stan (nowe / w toku / zamknięte) i notatkę. Bez tego skrzynka, do której
     zagląda jedna osoba, po tygodniu przestaje odróżniać obsłużone od nieobsłużonych.
*/
export default function MessagesView({ onDataChanged }) {
  const [rows, setRows] = useState([]);
  const [counts, setCounts] = useState({ new: 0, open: 0, closed: 0, tests: 0 });
  const [status, setStatus] = useState('new');
  const [includeTests, setIncludeTests] = useState(false);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminCall('messages', { status, includeTests, q, limit: 200 });
      setRows(res.rows);
      setCounts(res.counts);
      setSelected((prev) => (prev ? res.rows.find((m) => m.id === prev.id) || null : null));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [status, includeTests, q]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const pick = (m) => {
    setSelected(m);
    setNote(m.note || '');
  };

  const update = async (patch) => {
    if (!selected) return;
    setBusy(true);
    try {
      await adminCall('messageUpdate', { id: selected.id, ...patch });
      toast.success('Zapisane.');
      await load();
      if (onDataChanged) onDataChanged();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const mailtoHref = selected
    ? `mailto:${selected.email}?subject=${encodeURIComponent('Re: Twoje zgłoszenie w WynajemPRO')}`
    : '#';

  return (
    <div className="wpa-split">
      <div>
        <div className="wpa-toolbar">
          <div className="wpd-seg">
            {FILTERS.map((f) => (
              <button key={f.value}
                className={`wpd-seg__btn${status === f.value ? ' wpd-seg__btn--active' : ''}`}
                onClick={() => setStatus(f.value)}>
                {f.label}
                {f.value !== 'all' && counts[f.value] > 0 ? ` (${counts[f.value]})` : ''}
              </button>
            ))}
          </div>
          <div className="wpd-search" style={{ maxWidth: 260 }}>
            <Search />
            <input type="text" placeholder="Szukaj w treści i adresach…" value={q}
              onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="wpa-toolbar__spacer" />
          <button className={`wpd-btn wpd-btn--sm${includeTests ? ' wpd-btn--primary' : ''}`}
            onClick={() => setIncludeTests((v) => !v)}
            title="Zgłoszenia z source: kontakt-test">
            <FlaskConical style={{ width: 14, height: 14 }} />
            Testowe ({counts.tests})
          </button>
          <button className="wpd-btn wpd-btn--sm" onClick={load} disabled={loading}>
            <RefreshCw className={loading ? 'wpd-rotate' : ''} style={{ width: 14, height: 14 }} />
          </button>
        </div>

        <div className="wpd-panel">
          <div className="wpd-list">
            {rows.map((m) => (
              <div key={m.id}
                className={`wpd-row wpa-pick${selected && selected.id === m.id ? ' wpa-pick--on' : ''}`}
                role="button" tabIndex={0}
                onClick={() => pick(m)} onKeyDown={(e) => e.key === 'Enter' && pick(m)}>
                <span className={`wpd-tag wpd-tag--${m.isTest ? 'muted' : STATUS_META[m.status].tone}`}>
                  {m.isTest ? 'TEST' : STATUS_META[m.status].label}
                </span>
                <div className="wpd-row__main">
                  <div className="wpd-row__name" style={{ fontSize: 14 }}>{m.email}</div>
                  <div className="wpd-row__meta" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 11.5 }}>
                    {m.message.slice(0, 110)}{m.message.length > 110 ? '…' : ''}
                  </div>
                </div>
                <span className="wpd-row__when">{fmtRelative(m.createdAt)}</span>
              </div>
            ))}
            {rows.length === 0 && !loading && (
              <div className="wpd-empty">
                <p>{status === 'new' ? 'Brak nowych zgłoszeń.' : 'Nic nie pasuje do filtrów.'}</p>
              </div>
            )}
            {loading && rows.length === 0 && (
              <div className="wpd-empty"><div className="wpd-spin" style={{ margin: '0 auto' }} /></div>
            )}
          </div>
        </div>
        {/* Stopka MUSI mówić o stanie faktycznym. Wcześniej zdanie „testowe są ukryte,
            dopóki ich nie włączysz" renderowało się bezwarunkowo — więc po włączeniu
            przełącznika panel dalej twierdził, że ukrywa, i utwierdzał w przekonaniu,
            że coś nie działa (zgłoszenie właściciela 2026-08-25). */}
        <p className="wpd-fhint" style={{ marginTop: 12 }}>
          {fmtNum(rows.length)} na liście.
          {counts.tests > 0 && (includeTests
            ? ` Zgłoszenia testowe (${fmtNum(counts.tests)}) są WŁĄCZONE i widać je razem z resztą.`
            : ` Zgłoszenia testowe (${fmtNum(counts.tests)}) są ukryte, dopóki ich nie włączysz — testu nie diagnozuje się jak awarii.`)}
        </p>
      </div>

      {/* ── Wybrane zgłoszenie ── */}
      <div className="wpa-detail">
        {!selected && (
          <div className="wpd-soon"><p className="wpd-label">Wybierz zgłoszenie z listy</p></div>
        )}
        {selected && (
          <>
            <div className="wpd-panel">
              <div className="wpd-panel__head">
                <h2 className="wpd-h2" style={{ fontSize: 15, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selected.email}
                </h2>
                <span className={`wpd-tag wpd-tag--${selected.isTest ? 'muted' : STATUS_META[selected.status].tone}`}
                  style={{ marginLeft: 'auto' }}>
                  {selected.isTest ? 'TEST' : STATUS_META[selected.status].label}
                </span>
              </div>
              <div style={{ padding: '14px 20px 18px' }}>
                <p className="wpd-fhint" style={{ marginBottom: 10 }}>
                  {fmtDateTime(selected.createdAt)} · source: {selected.source || '—'}
                </p>
                <div className="wpa-msg">{selected.message}</div>

                {selected.isTest && (
                  <div className="wpd-note wpd-note--info" style={{ marginTop: 14 }}>
                    To zgłoszenie testowe. Potwierdź właścicielowi, że kanał działa — i nie uruchamiaj
                    diagnostyki opisanej w treści.
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                  <a className="wpd-btn wpd-btn--sm wpd-btn--primary" href={mailtoHref}>
                    <Mail style={{ width: 14, height: 14 }} /> Odpowiedz
                  </a>
                  {selected.status !== 'open' && (
                    <button className="wpd-btn wpd-btn--sm" disabled={busy} onClick={() => update({ status: 'open' })}>
                      Wznów
                    </button>
                  )}
                  {selected.status !== 'closed' && (
                    <button className="wpd-btn wpd-btn--sm" disabled={busy} onClick={() => update({ status: 'closed' })}>
                      Zamknij
                    </button>
                  )}
                </div>
                {/* Odpowiedź wychodzi z własnej poczty — panel nie wysyła maili.
                    Kanał wysyłkowy to osobna decyzja (nadawca, SPF/DKIM, ślad w RODO). */}
                <p className="wpd-fhint" style={{ marginTop: 10 }}>
                  „Odpowiedz" otwiera Twojego klienta poczty. Panel nie wysyła wiadomości.
                </p>
              </div>
            </div>

            <div className="wpd-panel" style={{ marginTop: 14 }}>
              <div className="wpd-panel__head">
                <h2 className="wpd-h2" style={{ fontSize: 15 }}>Notatka</h2>
              </div>
              <div style={{ padding: '14px 20px 18px' }}>
                <textarea className="wpd-textarea" rows={4} value={note}
                  placeholder="Co ustalono, co odpisano, czy sprawa wraca…"
                  onChange={(e) => setNote(e.target.value)} />
                <button className="wpd-btn wpd-btn--sm wpd-btn--block" style={{ marginTop: 10 }}
                  disabled={busy || note === (selected.note || '')}
                  onClick={() => update({ note })}>
                  <Save style={{ width: 14, height: 14 }} /> Zapisz notatkę
                </button>
                {selected.updatedAt && (
                  <p className="wpd-fhint" style={{ marginTop: 10 }}>
                    Ostatnia zmiana: {fmtDateTime(selected.updatedAt)}
                  </p>
                )}
              </div>
            </div>

            <div className="wpd-note wpd-note--info" style={{ marginTop: 14 }}>
              <UserSearch style={{ width: 14, height: 14, display: 'inline', verticalAlign: -2, marginRight: 6 }} />
              Diagnozując konto zgłaszającego, wpisz jego adres w zakładce <b>Konta</b> — zacznij od
              poziomu 1 i schodź niżej tylko wtedy, gdy sprawa tego wymaga.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
