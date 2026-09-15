import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { DEMO_KROKI } from '../../data/landingDemo';
import { ZRZUTY_STAN, ZRZUTY_PANELU } from '../../data/zrzutyPanelu';
import { miesiacRokPl, formatujDatePl } from '../../utils/dataPl';
import { PATCH_NOTES } from '../../data/patchNotes';
import panelPulpit from '../../assets/landing/panel-pulpit.webp';
import panelKalendarz from '../../assets/landing/panel-kalendarz.webp';
import panelZadania from '../../assets/landing/panel-zadania.webp';
import panelFinanse from '../../assets/landing/panel-finanse.webp';

/*
  Apple-scroll demo panelu (X2, v2 → v3 2026-09-03).

  Silnik scrolla 1:1 z projektu „Wynajem Landing Scroll.dc.html" (Claude Design):
  sticky 520vh, lewa szyna postępu + bloki tekstu, prawa strona = okno przeglądarki
  z cross-fade między ekranami sterowanym indeksem scrolla; mobile: sticky wyłączony,
  kroki klikalne.

  CO SIĘ ZMIENIŁO (humanizacja landingu, analiza Smoobu §7 pkt 3 „pokazujmy produkt,
  nie ilustrację produktu"): pięć ręcznie złożonych makiet HTML z wymyślonymi gośćmi,
  ręcznie wpisanym „▲ 12%", adresem „app.wynajempro.pl" i funkcjami, których produkt
  nie ma (badge „WYSŁANY", bramka czasowa kodu), ustąpiło czterem ZRZUTOM PRAWDZIWEGO
  PANELU na jawnie przykładowych danych. Zrzuty generuje `npm run zrzuty:build`
  (scripts/zrzuty/) na atrapach e2e — każda liczba na nich jest wynikiem kodu panelu,
  nie ręcznym wpisem. Data „stan z …" i alt-y pochodzą z manifestu generatora
  (src/data/zrzutyPanelu.js), więc nie da się ich zapomnieć odświeżyć razem z obrazem.

  Zasady identyfikacji v2 przywrócone przy okazji: zero cieni (okno i ramka highlightu
  z projektu miały box-shadow), zero kolorów spoza palety (kropki macOS), etykiety
  w tokenach z kontrastem AA. Ramka highlightu zniknęła: mierzyła geometrię z markupu
  makiety, którego już nie ma; obraz mówi sam za siebie.

  ZMIANA WIDOKU PANELU = REGENERACJA ZRZUTÓW (rytuał deploy), inaczej landing zacznie
  kłamać o produkcie — dokładnie to, czego się tu pozbywamy.
*/

const OBRAZY = { pulpit: panelPulpit, kalendarz: panelKalendarz, zadania: panelZadania, finanse: panelFinanse };
const ALT = Object.fromEntries(ZRZUTY_PANELU.map((z) => [z.plik.replace(/^panel-|\.webp$/g, ''), z.alt]));

// geometria okna w nieskalowanych px: chrome 44 + obraz 1160×725 (kadr 1440×900 = 1,6)
const OKNO_W = 1160;
const OKNO_H = 44 + 725;

export default function LandingScrollDemo() {
  const containerRef = useRef(null);
  const slotRef = useRef(null);
  const tickRef = useRef(false);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [winScale, setWinScale] = useState(0.78);
  const [slotW, setSlotW] = useState(360);
  const [compact, setCompact] = useState(false);

  // sterowanie indeksem scrollem (desktop) — 1:1 z silnikiem support.js
  useEffect(() => {
    const mq = window.matchMedia('(max-width:860px)');
    const applyMq = () => setCompact(mq.matches);
    applyMq();
    mq.addEventListener('change', applyMq);

    const compute = () => {
      tickRef.current = false;
      const el = containerRef.current;
      if (!el || mq.matches) return; // na mobile indeks steruje klik, nie scroll
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      let p = total > 0 ? (-rect.top) / total : 0;
      p = Math.max(0, Math.min(1, p));
      let i = Math.floor(p * DEMO_KROKI.length - 0.0001);
      i = Math.max(0, Math.min(DEMO_KROKI.length - 1, i));
      setProgress(p); setIndex(i);
    };
    const onScroll = () => { if (tickRef.current) return; tickRef.current = true; requestAnimationFrame(compute); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    compute();

    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      setSlotW((prev) => (Math.abs(prev - cr.width) > 1 ? cr.width : prev));
      const scale = Math.min(cr.width / OKNO_W, cr.height / OKNO_H, 0.78);
      setWinScale((prev) => (Math.abs(prev - scale) > 0.004 ? Math.max(0.3, scale) : prev));
    });
    if (slotRef.current) ro.observe(slotRef.current);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      mq.removeEventListener('change', applyMq);
      ro.disconnect();
    };
  }, []);

  const scrollToIndex = useCallback((i) => {
    if (compact) { setIndex(i); return; }
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    const target = (i + 0.5) / DEMO_KROKI.length;
    window.scrollTo({ top: window.scrollY + rect.top + target * total, behavior: 'smooth' });
  }, [compact]);

  const active = DEMO_KROKI[index];
  const compactScale = Math.min(slotW / OKNO_W, 0.92); // skala okna na mobile (szerokość slotu)
  const podpis = `Zrzuty z aplikacji, stan z ${miesiacRokPl(ZRZUTY_STAN)}. Obiekty, goście i kwoty są przykładowe.`;

  const okno = (
    <div role="img" data-view={active.key} data-idx={index}
      aria-label={`Podgląd panelu WynajemPRO, widok: ${active.label}. ${ALT[active.key] || ''}`}
      style={{ width: OKNO_W, transform: `scale(${compact ? compactScale : winScale})`,
        transformOrigin: compact ? 'top left' : 'center center', flexShrink: 0, borderRadius: 8, overflow: 'hidden',
        position: compact ? 'absolute' : 'static', top: compact ? 0 : 'auto', left: compact ? 0 : 'auto',
        border: '1px solid var(--hairline)', background: 'var(--paper)' }}>

      {/* chrome przeglądarki — bez kropek macOS (kolory spoza palety) i bez cienia */}
      <div style={{ height: 44, background: 'var(--surface)', borderBottom: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', gap: 16, padding: '0 16px' }}>
        <span className="wp4-label wp4-label--faint" style={{ fontSize: 11, letterSpacing: '.06em' }}>zrzut z aplikacji · dane przykładowe</span>
        <div style={{ flex: 1, height: 26, background: 'var(--paper)', border: '1px solid var(--hairline)', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', maxWidth: 420, margin: '0 auto' }}>
          <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: 'var(--faint)', letterSpacing: '0.02em' }}>wynajempro.com/dashboard</span>
        </div>
        <div style={{ width: 200 }} />
      </div>

      {/* ekrany: cross-fade między zrzutami; pierwszy eager (widoczny od razu), reszta lazy */}
      <div style={{ position: 'relative', height: OKNO_H - 44, background: 'var(--paper)' }}>
        {DEMO_KROKI.map((k, i) => {
          const on = i === index;
          return (
            <img key={k.key} src={OBRAZY[k.key]} alt="" data-active={on ? 'true' : undefined}
              width={1440} height={900} loading={i === 0 ? 'eager' : 'lazy'} decoding="async"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                opacity: on ? 1 : 0, transform: on ? 'scale(1)' : 'scale(0.985)',
                transition: 'opacity .55s cubic-bezier(.22,1,.36,1), transform .55s cubic-bezier(.22,1,.36,1)' }} />
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="wp4-sd" ref={containerRef} id="panel"
      style={{ position: 'relative', height: compact ? 'auto' : '520vh' }}>
      <div className="wp4-sd__sticky"
        style={{ position: compact ? 'static' : 'sticky', top: 0, height: compact ? 'auto' : '100vh',
          display: 'flex', alignItems: 'center', gap: '3vw', padding: '0 clamp(20px,4vw,72px)',
          flexDirection: compact ? 'column' : 'row' }}>

        {/* LEWA: szyna + kroki */}
        <div className="wp4-sd__rail-wrap"
          style={{ width: compact ? '100%' : '35%', minWidth: compact ? 0 : 300, maxWidth: compact ? 'none' : 440,
            display: 'flex', gap: 22, alignItems: 'flex-start', flexShrink: 0, order: compact ? 2 : 1,
            paddingTop: compact ? 24 : 0 }}>
          {!compact && (
            <div style={{ position: 'relative', width: 14, height: 250, flexShrink: 0, marginTop: 6 }}>
              <div style={{ position: 'absolute', left: 6, top: 6, bottom: 6, width: 2, background: 'var(--hairline)', borderRadius: 2 }} />
              <div style={{ position: 'absolute', left: 6, top: 6, width: 2, background: 'var(--cynober)', borderRadius: 2, height: `${(progress * 238).toFixed(1)}px`, transition: 'height .12s linear' }} />
              {DEMO_KROKI.map((k, i) => (
                <button key={k.key} type="button" onClick={() => scrollToIndex(i)} title={k.label}
                  aria-label={`Przejdź do: ${k.label}`}
                  style={{ position: 'absolute', left: 0, top: `${(i / (DEMO_KROKI.length - 1) * 236).toFixed(1)}px`,
                    width: 14, height: 14, borderRadius: '50%', padding: 0, cursor: 'pointer',
                    background: i <= index ? 'var(--cynober)' : 'var(--paper)', border: `2px solid ${i <= index ? 'var(--cynober)' : '#C9C0AD'}`,
                    transform: i === index ? 'scale(1.35)' : 'scale(1)',
                    transition: 'background .4s ease, border-color .4s ease, transform .4s cubic-bezier(.22,1,.36,1)' }} />
              ))}
            </div>
          )}

          <div style={{ position: compact ? 'static' : 'relative', height: compact ? 'auto' : 250, flex: 1, minWidth: 0,
            display: compact ? 'flex' : 'block', flexDirection: 'column', gap: compact ? 10 : 0 }}>
            {DEMO_KROKI.map((k, i) => {
              const on = i === index;
              const blk = (
                <>
                  <div className="wp4-label" style={{ color: on ? 'var(--cynober)' : 'var(--label)', marginBottom: compact ? 8 : 16 }}>
                    {k.label}
                  </div>
                  <h2 style={{ fontSize: compact ? 24 : 38, lineHeight: 1.1, fontWeight: 800, letterSpacing: '-0.025em', margin: `0 0 ${compact ? 6 : 16}px` }}>
                    {k.title}
                  </h2>
                  <p style={{ fontSize: compact ? 14.5 : 16, lineHeight: 1.6, color: 'var(--muted)', margin: 0 }}>{k.body}</p>
                </>
              );
              if (compact) {
                return (
                  <button key={k.key} type="button" onClick={() => setIndex(i)} aria-current={on ? 'true' : undefined}
                    style={{ textAlign: 'left', font: 'inherit', cursor: 'pointer', width: '100%',
                      background: on ? 'var(--surface)' : 'transparent', border: `1px solid ${on ? 'var(--ink)' : 'transparent'}`,
                      borderRadius: 4, padding: '16px 18px', transition: 'background .2s, border-color .2s' }}>
                    {blk}
                  </button>
                );
              }
              return (
                <div key={k.key} style={{ position: 'absolute', inset: 0, opacity: on ? 1 : 0,
                  transform: on ? 'translateY(0)' : 'translateY(16px)', pointerEvents: on ? 'auto' : 'none',
                  transition: 'opacity .5s ease, transform .5s cubic-bezier(.22,1,.36,1)' }}>
                  {blk}
                </div>
              );
            })}
            {compact && (
              <Link to="/login" className="wp4-link wp4-link--strong" style={{ padding: '6px 18px' }}>
                Załóż darmowe konto — 14 dni testów →
              </Link>
            )}
          </div>
        </div>

        {/* PRAWA: okno przeglądarki ze zrzutami + podpis */}
        <div style={{ flex: 1, width: compact ? '100%' : 'auto', minWidth: 0, order: compact ? 1 : 2,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div ref={slotRef} style={{ width: '100%',
            height: compact ? `${Math.round(OKNO_H * compactScale)}px` : '72vh', overflow: compact ? 'hidden' : 'visible',
            display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0, position: 'relative' }}>
            {okno}
          </div>
          <p className="wp4-sd__caption wp4-label wp4-label--faint" style={{ margin: 0, textAlign: 'center', textTransform: 'none', letterSpacing: '.02em' }}>
            {podpis}
          </p>
          {/* pusta lista patch not ukrywa datę, nie kładzie sekcji (przegląd 2026-09-03) */}
          <p className="wp4-label wp4-label--faint" style={{ margin: 0, textAlign: 'center', textTransform: 'none', letterSpacing: '.02em' }}>
            {PATCH_NOTES[0]?.date && <>Ostatnia zmiana w panelu: {formatujDatePl(PATCH_NOTES[0].date, { zRokiem: 'zawsze' })}{' · '}</>}
            <Link to="/co-nowego" style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: 2 }}>Co nowego</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
