import React, { useState, useMemo } from 'react';
import { FileSignature, Search, Printer, RotateCcw } from 'lucide-react';
import { channelTone } from '../styles';

const fmt = (n) => new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(Math.round(Number(n) || 0));
const fmtFull = (d) => {
  const dt = new Date(d);
  if (!d || isNaN(dt.getTime())) return '—';
  return `${dt.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })} (${dt.toLocaleDateString('pl-PL', { weekday: 'long' })})`;
};
const fmtShort = (d) => {
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString('pl-PL');
};

/* Kwota słownie (PLN, pełne złote) — do umowy */
const ONES = ['', 'jeden', 'dwa', 'trzy', 'cztery', 'pięć', 'sześć', 'siedem', 'osiem', 'dziewięć'];
const TEENS = ['dziesięć', 'jedenaście', 'dwanaście', 'trzynaście', 'czternaście', 'piętnaście', 'szesnaście', 'siedemnaście', 'osiemnaście', 'dziewiętnaście'];
const TENS = ['', 'dziesięć', 'dwadzieścia', 'trzydzieści', 'czterdzieści', 'pięćdziesiąt', 'sześćdziesiąt', 'siedemdziesiąt', 'osiemdziesiąt', 'dziewięćdziesiąt'];
const HUNDS = ['', 'sto', 'dwieście', 'trzysta', 'czterysta', 'pięćset', 'sześćset', 'siedemset', 'osiemset', 'dziewięćset'];
const triple = (n) => {
  const h = Math.floor(n / 100); const t = Math.floor((n % 100) / 10); const o = n % 10;
  const parts = [HUNDS[h]];
  if (t === 1) parts.push(TEENS[o]); else { parts.push(TENS[t]); parts.push(ONES[o]); }
  return parts.filter(Boolean).join(' ');
};
const plural = (n, [f1, f24, f5]) => {
  if (n === 1) return f1;
  const t = n % 100; const o = n % 10;
  return o >= 2 && o <= 4 && !(t >= 12 && t <= 14) ? f24 : f5;
};
const slownie = (num) => {
  let n = Math.round(Number(num) || 0);
  if (n === 0) return 'zero złotych';
  const zl = plural(n, ['złoty', 'złote', 'złotych']);
  const mil = Math.floor(n / 1e6); const tys = Math.floor((n % 1e6) / 1000); const rest = n % 1000;
  const p = [];
  if (mil) { p.push(mil === 1 ? 'milion' : `${triple(mil)} ${plural(mil, ['milion', 'miliony', 'milionów'])}`); }
  if (tys) { p.push(tys === 1 ? 'tysiąc' : `${triple(tys)} ${plural(tys, ['tysiąc', 'tysiące', 'tysięcy'])}`); }
  if (rest) p.push(triple(rest));
  return `${p.join(' ')} ${zl}`;
};

/*
  Generator umów (08). Wybór rezerwacji → parametry → umowa najmu krótkoterminowego
  budowana z danych rezerwacji (najemca) i profilu gospodarza (wynajmujący).
  Animacja „pisania" dokumentu przy generowaniu; druk/PDF przez window.print()
  (reguły @media print pokazują wyłącznie arkusz).
*/
export default function ContractGeneratorView({ rentals, hostProfile }) {
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | generating | ready
  const [params, setParams] = useState({
    place: '', contractDate: new Date().toISOString().split('T')[0], guests: '', deposit: '', extra: '',
  });
  const setP = (k, v) => setParams((p) => ({ ...p, [k]: v }));

  const reduced = useMemo(() => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  const bookings = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const list = rentals.filter((r) => r.type === 'booking' && r.date);
    const future = list.filter((r) => new Date(r.endDate || r.date).setHours(0, 0, 0, 0) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    const past = list.filter((r) => new Date(r.endDate || r.date).setHours(0, 0, 0, 0) < today)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    const all = [...future, ...past];
    if (!query.trim()) return all;
    const q = query.toLowerCase();
    return all.filter((r) => {
      const pn = typeof r.property === 'object' ? r.property?.name : r.property;
      return r.guest?.toLowerCase().includes(q) || pn?.toLowerCase().includes(q) || r.date?.includes(q);
    });
  }, [rentals, query]);

  const booking = bookings.find((r) => r.id === selectedId) || rentals.find((r) => r.id === selectedId) || null;

  const pick = (id) => { setSelectedId(id); setPhase('idle'); };
  const generate = () => {
    if (!booking) return;
    if (reduced) { setPhase('ready'); return; }
    setPhase('generating');
    setTimeout(() => setPhase('ready'), 950);
  };

  // Dane umowy
  const c = useMemo(() => {
    if (!booking) return null;
    const propName = typeof booking.property === 'object' ? booking.property?.name : booking.property;
    const income = Number(booking.income) || 0;
    const advance = Number(booking.advancePayment) || 0;
    const s = new Date(booking.date); const e = new Date(booking.endDate || booking.date);
    const nights = Math.max(1, Math.round((e - s) / 86400000) || 1);
    const rest = Math.max(0, income - advance);
    const shortId = String(booking.id || '').slice(-4).toUpperCase();
    const num = `${shortId}/${!isNaN(s.getTime()) ? s.getFullYear() : new Date().getFullYear()}`;
    return { propName, income, advance, rest, nights, shortId, num };
  }, [booking]);

  const idType = hostProfile?.identifierType || 'NIP';
  const guestsN = parseInt(params.guests, 10);
  const depositN = Math.round(Number(String(params.deposit).replace(',', '.')) || 0);

  // Paragrafy umowy (numeracja dynamiczna)
  const paragraphs = useMemo(() => {
    if (!booking || !c) return [];
    const list = [];
    list.push({
      t: 'Przedmiot umowy',
      body: `Wynajmujący oddaje Najemcy do używania obiekt „${c.propName || '—'}" (dalej: „Obiekt") na cele pobytu wypoczynkowego (najem krótkoterminowy), na okres od dnia ${fmtFull(booking.date)} do dnia ${fmtFull(booking.endDate || booking.date)}, tj. ${c.nights} ${c.nights === 1 ? 'dobę' : c.nights < 5 ? 'doby' : 'dób'}.`,
    });
    list.push({
      t: 'Czynsz i płatności',
      body: `Łączny czynsz za cały okres najmu wynosi ${fmt(c.income)} zł (słownie: ${slownie(c.income)}).`
        + (c.advance > 0 ? ` Najemca ${booking.isAdvancePaid ? 'wpłacił' : 'zobowiązuje się wpłacić'} zaliczkę w wysokości ${fmt(c.advance)} zł; pozostała kwota ${fmt(c.rest)} zł płatna jest najpóźniej w dniu rozpoczęcia najmu.` : ' Czynsz płatny jest najpóźniej w dniu rozpoczęcia najmu.')
        + (depositN > 0 ? ` Najemca wpłaca ponadto kaucję zwrotną w wysokości ${fmt(depositN)} zł (słownie: ${slownie(depositN)}), podlegającą zwrotowi w dniu zakończenia najmu po sprawdzeniu stanu Obiektu.` : ''),
    });
    if (guestsN > 0) {
      list.push({
        t: 'Liczba osób',
        body: `Obiekt przeznaczony jest dla maksymalnie ${guestsN} ${guestsN === 1 ? 'osoby' : 'osób'}. Pobyt większej liczby osób wymaga uprzedniej zgody Wynajmującego.`,
      });
    }
    list.push({
      t: 'Obowiązki Najemcy',
      body: 'Najemca zobowiązuje się do korzystania z Obiektu zgodnie z jego przeznaczeniem, przestrzegania regulaminu Obiektu oraz ciszy nocnej, a także do niezwłocznego zgłaszania Wynajmującemu wszelkich szkód. Najemca ponosi odpowiedzialność materialną za szkody powstałe z jego winy lub z winy osób, za które odpowiada.',
    });
    list.push({
      t: 'Wydanie i zwrot Obiektu',
      body: 'Wydanie Obiektu następuje w dniu rozpoczęcia najmu, a jego zwrot — w dniu zakończenia najmu, w stanie niepogorszonym ponad normalne zużycie.',
    });
    list.push({
      t: 'Rezygnacja',
      body: 'W przypadku rezygnacji Najemcy z pobytu wpłacona zaliczka nie podlega zwrotowi, chyba że Strony postanowią inaczej.',
    });
    if (params.extra.trim()) {
      list.push({ t: 'Ustalenia dodatkowe', body: params.extra.trim() });
    }
    list.push({
      t: 'Dane osobowe',
      body: 'Administratorem danych osobowych Najemcy jest Wynajmujący. Dane przetwarzane są wyłącznie w celu zawarcia i realizacji niniejszej umowy.',
    });
    list.push({
      t: 'Postanowienia końcowe',
      body: 'W sprawach nieuregulowanych niniejszą umową zastosowanie mają przepisy Kodeksu cywilnego. Zmiany umowy wymagają formy pisemnej pod rygorem nieważności. Umowę sporządzono w dwóch jednobrzmiących egzemplarzach, po jednym dla każdej ze Stron.',
    });
    return list;
  }, [booking, c, guestsN, depositN, params.extra]);

  return (
    <div className="wpd-ctr-layout">
      {/* ── Lewa: wybór rezerwacji + parametry ── */}
      <div className="wpd-noprint" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="wpd-panel">
          <div className="wpd-panel__head">
            <h2 className="wpd-h2" style={{ fontSize: 15 }}>Wybierz rezerwację</h2>
            <span className="wpd-nav__badge" style={{ marginLeft: 'auto', background: 'var(--inner)', color: 'var(--muted)' }}>{bookings.length}</span>
          </div>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--hairline)' }}>
            <div className="wpd-search" style={{ width: '100%', height: 34 }}>
              <Search />
              <input placeholder="Szukaj gościa lub obiektu…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
          <div className="wpd-ctr-list wpd-list">
            {bookings.map((r) => {
              const pn = typeof r.property === 'object' ? r.property?.name : r.property;
              return (
                <div key={r.id} className={`wpd-row wpd-ctr-row${selectedId === r.id ? ' wpd-ctr-row--on' : ''}`} onClick={() => pick(r.id)}>
                  <div className="wpd-row__main">
                    <div className="wpd-row__name">{r.guest || 'Rezerwacja'}</div>
                    <div className="wpd-row__meta">{pn} · {fmtShort(r.date)} → {fmtShort(r.endDate || r.date)}</div>
                  </div>
                  {r.source && <span className={`wpd-tag wpd-tag--${channelTone(r.source)}`}>{r.source}</span>}
                </div>
              );
            })}
            {bookings.length === 0 && <div className="wpd-empty"><p>Brak rezerwacji do wyboru.</p></div>}
          </div>
        </div>

        <div className="wpd-panel">
          <div className="wpd-panel__head"><h2 className="wpd-h2" style={{ fontSize: 15 }}>Parametry umowy</h2></div>
          <div style={{ padding: 16 }}>
            <div className="wpd-fgrid">
              <div className="wpd-field">
                <label className="wpd-flabel">Miejscowość zawarcia</label>
                <input className="wpd-input" value={params.place} onChange={(e) => setP('place', e.target.value)} placeholder="np. Kraków" />
              </div>
              <div className="wpd-field">
                <label className="wpd-flabel">Data zawarcia</label>
                <input className="wpd-input wpd-input--num" type="date" value={params.contractDate} onChange={(e) => setP('contractDate', e.target.value)} />
              </div>
            </div>
            <div className="wpd-fgrid">
              <div className="wpd-field">
                <label className="wpd-flabel">Liczba osób (opcja)</label>
                <input className="wpd-input wpd-input--num" type="number" min="1" value={params.guests} onChange={(e) => setP('guests', e.target.value)} placeholder="np. 4" />
              </div>
              <div className="wpd-field">
                <label className="wpd-flabel">Kaucja zł (opcja)</label>
                <input className="wpd-input wpd-input--num" type="number" min="0" value={params.deposit} onChange={(e) => setP('deposit', e.target.value)} placeholder="np. 500" />
              </div>
            </div>
            <div className="wpd-field">
              <label className="wpd-flabel">Ustalenia dodatkowe (opcja)</label>
              <textarea className="wpd-textarea" rows="2" value={params.extra} onChange={(e) => setP('extra', e.target.value)} placeholder="np. pobyt ze zwierzęciem, godzina zameldowania…" />
            </div>
            <button className="wpd-btn wpd-btn--primary" style={{ width: '100%' }} disabled={!booking || phase === 'generating'} onClick={generate}>
              <FileSignature /> {phase === 'ready' ? 'Generuj ponownie' : 'Generuj umowę'}
            </button>
            <p className="wpd-fig" style={{ margin: '10px 0 0', textAlign: 'center' }}>Wzór dokumentu — dostosuj do własnych potrzeb</p>
          </div>
        </div>
      </div>

      {/* ── Prawa: arkusz umowy ── */}
      <div>
        {phase === 'generating' && (
          <div className="wpd-ctr-gen wpd-noprint">
            <div className="wpd-ctr-gen__paper">
              {[52, 100, 88, 96, 74, 92, 60, 40].map((w, i) => (
                <div key={i} className={`wpd-ctr-gen__line${i === 0 ? ' wpd-ctr-gen__line--accent' : ''}`}
                  style={{ width: `${w}%`, animationDelay: `${i * 95}ms` }} />
              ))}
            </div>
            <span className="wpd-anl-load"><span className="wpd-spin" style={{ width: 12, height: 12 }} /> Generuję umowę…</span>
          </div>
        )}

        {phase === 'ready' && booking && c && (
          <>
            <div className="wpd-noprint" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 12 }}>
              <button className="wpd-btn wpd-btn--sm" onClick={() => setPhase('idle')}><RotateCcw /> Wyczyść</button>
              <button className="wpd-btn wpd-btn--sm wpd-btn--primary" onClick={() => window.print()}><Printer /> Drukuj / zapisz PDF</button>
            </div>

            <div className={`wpd-ctr-sheet wpd-rise is-in`}>
              <h1 className="wpd-ctr-title">Umowa najmu <em>krótkoterminowego</em></h1>
              <p className="wpd-ctr-meta">
                {params.place.trim() ? `${params.place.trim()}, ` : ''}dnia {fmtShort(params.contractDate)} · nr {c.num}
              </p>

              <div className="wpd-ctr-parties">
                <div className="wpd-ctr-party">
                  <span className="wpd-label">Wynajmujący</span>
                  <b>{hostProfile?.entityName || '—'}</b>
                  {hostProfile?.address && <p>{hostProfile.address}</p>}
                  {hostProfile?.taxIdentifier && <p>{idType}: {hostProfile.taxIdentifier}</p>}
                  {hostProfile?.phone && <p>tel. {hostProfile.phone}</p>}
                  {hostProfile?.email && <p>{hostProfile.email}</p>}
                </div>
                <div className="wpd-ctr-party">
                  <span className="wpd-label">Najemca</span>
                  <b>{booking.guest || '—'}</b>
                  {booking.phone && <p>tel. {booking.phone}</p>}
                  {booking.email && <p>{booking.email}</p>}
                  <p style={{ marginTop: 6, fontStyle: 'italic' }}>Dokument tożsamości: ……………………………</p>
                </div>
              </div>

              {paragraphs.map((par, i) => (
                <div key={i}>
                  <p className="wpd-ctr-h">§ {i + 1}. {par.t}</p>
                  <p className="wpd-ctr-par">{par.body}</p>
                </div>
              ))}

              <div className="wpd-ctr-sign">
                <div><span className="wpd-label">Wynajmujący</span></div>
                <div><span className="wpd-label">Najemca</span></div>
              </div>
            </div>
          </>
        )}

        {phase === 'idle' && (
          <div className="wpd-ctr-empty wpd-noprint">
            <FileSignature style={{ width: 28, height: 28 }} />
            <div>
              <p className="wpd-h2" style={{ fontSize: 16, color: 'var(--ink)', margin: '0 0 4px' }}>
                {booking ? 'Gotowe do wygenerowania' : 'Wybierz rezerwację'}
              </p>
              <p style={{ fontSize: 13, margin: 0 }}>
                {booking
                  ? `Umowa dla: ${booking.guest || '—'} · ${c?.propName || ''}`
                  : 'Wskaż rezerwację z listy po lewej, uzupełnij parametry i wygeneruj umowę.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
