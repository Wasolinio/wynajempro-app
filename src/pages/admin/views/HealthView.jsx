import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { RefreshCw, Trash2, CreditCard, MailWarning, Clock, Unlink, BookX, Archive, ShieldOff, AlertTriangle, FileQuestion } from 'lucide-react';
import { adminCall, fmtDate, fmtDateTime, fmtRelative } from '../adminApi';

const Section = ({ icon, title, hint, rows, empty, render, tone = 'faint' }) => {
  const Icon = icon;
  return (
  <div className="wpd-panel wpd-section">
    <div className="wpd-panel__head">
      <Icon style={{ width: 17, height: 17, color: rows.length ? `var(--${tone})` : 'var(--faint)' }} />
      <h2 className="wpd-h2">{title}</h2>
      <span className="wpd-label" style={{ marginLeft: 'auto' }}>{rows.length}</span>
    </div>
    {hint && <p className="wpd-fhint" style={{ padding: '12px 20px 0' }}>{hint}</p>}
    <div className="wpd-list">
      {rows.map(render)}
      {rows.length === 0 && <div className="wpd-empty"><p>{empty}</p></div>}
    </div>
  </div>
  );
};

/*
  Porządek (05) — rzeczy, które nie są awarią, ale są zobowiązaniem.

  Ekran zbiera stany, które w normalnym panelu nie mają gdzie się pokazać: konta czekające
  na skasowanie, rozjazdy między Auth a bazą, przewodniki bez właściciela (czyli dane Gości
  bez administratora) i zgłoszenia przekraczające proponowany okres przechowywania.
  Panel tylko RAPORTUJE — kasowanie należy do cyklicznej funkcji `deleteExpiredAccountsData`,
  która ma na to własne, sprawdzane ponownie kryteria.
*/
export default function HealthView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [blad, setBlad] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setBlad('');
    try {
      setData(await adminCall('health'));
    } catch (err) {
      // Toast znika, spinner zostaje — bez tego ekran wyglądałby jak zawieszony.
      toast.error(err.message);
      setBlad(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!data) {
    if (blad) {
      return (
        <div className="wpd-panel" style={{ padding: '32px 24px', textAlign: 'center' }}>
          <AlertTriangle style={{ width: 26, height: 26, color: 'var(--cynober)' }} />
          <h2 className="wpd-h2" style={{ margin: '12px 0 8px' }}>Nie udało się pobrać danych</h2>
          <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '0 auto', maxWidth: 520, lineHeight: 1.6 }}>{blad}</p>
          <button className="wpd-btn wpd-btn--sm wpd-btn--primary" style={{ marginTop: 16 }} onClick={load}>
            <RefreshCw style={{ width: 14, height: 14 }} /> Spróbuj ponownie
          </button>
        </div>
      );
    }
    return <div className="wpd-empty"><div className="wpd-spin" style={{ margin: '0 auto' }} /></div>;
  }

  const row = (tag, tone, main, meta, when) => (
    <div className="wpd-row" key={`${tag}-${main}-${meta}`}>
      <span className={`wpd-tag wpd-tag--${tone}`}>{tag}</span>
      <div className="wpd-row__main">
        <div className="wpd-row__name" style={{ fontSize: 14 }}>{main}</div>
        <div className="wpd-row__meta">{meta}</div>
      </div>
      {when && <span className="wpd-row__when">{when}</span>}
    </div>
  );

  return (
    <>
      <div className="wpa-toolbar">
        <span className="wpd-label">stan na {fmtDateTime(data.generatedAt)}</span>
        <div className="wpa-toolbar__spacer" />
        <button className="wpd-btn wpd-btn--sm" onClick={load} disabled={loading}>
          <RefreshCw className={loading ? 'wpd-rotate' : ''} style={{ width: 14, height: 14 }} /> Odśwież
        </button>
      </div>

      <Section
        icon={Trash2} tone="cynober"
        title="Zaplanowane usunięcie danych"
        hint="Konta anulowane, którym biegnie 30-dniowa karencja. Skasuje je nocna funkcja, jeśli w międzyczasie nie wrócą do płatności."
        rows={data.scheduledDeletion}
        empty="Nic nie czeka na skasowanie."
        render={(r) => row('USUŃ', 'cynober', r.email || r.uid, r.uid, fmtRelative(r.at))}
      />

      <Section
        icon={CreditCard} tone="amber"
        title="Zaległość w płatności"
        hint="Stripe zgłosił nieudaną płatność. Konto widzi ekran blokady — warto odezwać się, zanim samo odejdzie."
        rows={data.pastDue}
        empty="Brak zaległości."
        render={(r) => row('PAST DUE', 'amber', r.email || r.uid, r.uid, r.since ? `ostatnia wpłata ${fmtDate(r.since)}` : '')}
      />

      <Section
        icon={Clock} tone="amber"
        title="Trial wygasł, konto zostało"
        hint="Kandydaci do odezwania się albo do przedłużenia trialu w zakładce Konta."
        rows={data.expiredTrials}
        empty="Żaden trial nie wisi po terminie."
        render={(r) => row('TRIAL', 'muted', r.email || r.uid, r.uid, fmtRelative(r.endedAt))}
      />

      <Section
        icon={MailWarning} tone="amber"
        title="Adres niepotwierdzony"
        hint="Konto nie wejdzie do panelu, dopóki nie kliknie linku z wiadomości. Częsty powód zgłoszenia „nie mogę się zalogować”."
        rows={data.unverified}
        empty="Wszystkie adresy potwierdzone."
        render={(r) => row('BRAK', 'amber', r.email || r.uid, r.uid, `rejestracja ${fmtRelative(r.createdAt)}`)}
      />

      <Section
        icon={ShieldOff} tone="amber"
        title="Odcięte, ale bez daty usunięcia"
        hint="Konta anulowane bez zaplanowanego usunięcia — zwykle odcięte ręcznie z panelu. Nocne czyszczenie ich nie ruszy (wymaga daty usunięcia albo statusu trialu), więc zostają w bazie bezterminowo razem z rezerwacjami, przewodnikami i podpisami gości. Panel ich nie kasuje: okres przechowywania dla tej grupy to decyzja, która jeszcze nie zapadła."
        rows={data.revokedNoRetention || []}
        empty="Żadne konto nie wisi poza ścieżką retencji."
        render={(r) => row('BEZ DATY', 'amber', r.email || r.uid, r.uid, r.canceledAt ? `odcięte ${fmtRelative(r.canceledAt)}` : '')}
      />

      <Section
        icon={Unlink} tone="cynober"
        title="Rozjazd Auth ↔ baza"
        hint="Login bez dokumentu albo dokument bez loginu. Zwykle przerwana rejestracja albo ślad po kasowaniu konta; jedno i drugie blokuje wejście do panelu."
        rows={[
          ...data.missingDoc.map((r) => ({ ...r, kind: 'BEZ DOKU' })),
          ...data.missingAuth.map((r) => ({ ...r, kind: 'BEZ LOGINU' })),
        ]}
        empty="Auth i baza zgodne."
        render={(r) => row(r.kind, 'cynober', r.email || r.uid, r.uid, r.createdAt ? fmtRelative(r.createdAt) : r.status)}
      />

      <Section
        icon={BookX} tone="cynober"
        title="Przewodniki bez właściciela"
        hint="Przewodnik żyje, a konta właściciela już nie ma. W środku mogą być podpisy gości i sekrety (WiFi, PIN) — dane osobowe bez administratora. Kasować przez callable deleteGuide, nie ręcznie: kliencki delete osierociłby subkolekcje i pliki."
        rows={data.orphanGuides}
        empty="Każdy przewodnik ma żywego właściciela."
        render={(r) => row(r.type === 'review' ? 'OPINIE' : 'PRZEW.', 'cynober', r.name || r.id, `owner: ${r.ownerId || '—'}`, '')}
      />

      <Section
        icon={FileQuestion} tone="amber"
        title="Dokumenty-widma po sesjach gości"
        hint="Dokumenty w kolekcji users należące do anonimowych sesji gości (otwarcie przewodnika). Nie są kontami i nigdy nie będą, a niosą adres e-mail — dane osobowe bez właściciela i bez ścieżki usunięcia. Pola wskazują na nazewnictwo z nieużywanej już wersji kodu. Panel ich nie kasuje: to decyzja właściciela."
        rows={data.staleGuestDocs || []}
        empty="Brak dokumentów-widm."
        render={(r) => row('WIDMO', 'amber', r.uid, `pola: ${(r.pola || []).join(', ') || '—'}`, r.maEmail ? 'z adresem e-mail' : '')}
      />

      <div className="wpd-panel wpd-section">
        <div className="wpd-panel__head">
          <Archive style={{ width: 17, height: 17, color: data.messagesOverRetention.count ? 'var(--amber)' : 'var(--faint)' }} />
          <h2 className="wpd-h2">Okres przechowywania zgłoszeń</h2>
          <span className="wpd-label" style={{ marginLeft: 'auto' }}>{data.messagesOverRetention.count}</span>
        </div>
        <div style={{ padding: '16px 20px 20px' }}>
          <p style={{ fontSize: 13.5, margin: 0, lineHeight: 1.6 }}>
            {data.messagesOverRetention.count > 0
              ? <>Zgłoszeń zakończonych ponad {data.messagesOverRetention.months} miesięcy temu: <b>{data.messagesOverRetention.count}</b>.</>
              : <>Żadne zgłoszenie nie przekracza {data.messagesOverRetention.months} miesięcy od zakończenia korespondencji.</>}
            {data.messagesOverRetention.oldest && <> Najstarsze: {fmtDate(data.messagesOverRetention.oldest)}.</>}
          </p>
          {/* Okres zatwierdzony 2026-08-26 (Polityka §2); kasuje nocny cleanupContactMessages. */}
          <div className="wpd-note wpd-note--info" style={{ marginTop: 14 }}>
            {data.messagesOverRetention.months} miesięcy od zakończenia korespondencji — okres
            <b> zatwierdzony i zapisany w Polityce prywatności §2</b>. Zgłoszenia po terminie kasuje
            automatycznie nocny przebieg (codziennie 03:45). Koniec korespondencji to ostatnia
            aktywność w wątku: wpłynięcie zgłoszenia albo czynność administratora. Licznik wyżej
            powinien być zerowy — utrzymująca się wartość oznacza, że nocne kasowanie nie działa.
          </div>
        </div>
      </div>
    </>
  );
}
