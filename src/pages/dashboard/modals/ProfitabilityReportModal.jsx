import React, { useMemo, useState } from 'react';
import { BarChart3, X, Printer, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDialogA11y } from './useDialogA11y';
import { profitabilityCsv } from '../../../utils/reportExport';
import { buildReport } from '../../../utils/profitabilityReport';

const fmt = (n) => new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(Math.round(Number(n) || 0));
// Udziały podajemy z jednym miejscem po przecinku — przy kosztach rzędu kilkuset złotych
// zaokrąglenie do pełnych procent gubi różnicę między pozycją 0,4% a 1,4%.
const proc = (v, miejsca = 1) => (v === null || v === undefined ? '—' : `${(Number(v) * 100).toFixed(miejsca).replace('.', ',')}%`);
const MABBR = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];

/* Kolumnowy wykres zysku miesiąc po miesiącu — inline SVG (bez bibliotek).
   Jedna seria (zysk netto): dodatni zielony, ujemny cynober, linia zera.
   Tożsamość niesie oś miesięcy + etykiety wartości, nie sam kolor (dataviz). */
function MonthlyProfitChart({ months }) {
  const W = 720, H = 188, padX = 10, padTop = 20, padBot = 30;
  const plotH = H - padTop - padBot;
  const profits = months.map((m) => m.profit);
  const maxPos = Math.max(0, ...profits);
  const maxNeg = Math.max(0, ...profits.map((p) => -p));
  const range = (maxPos + maxNeg) || 1;
  const zeroY = padTop + plotH * (maxPos / range);
  const bw = (W - padX * 2) / 12;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Zysk netto miesiąc po miesiącu" style={{ display: 'block' }}>
      <line x1={padX} y1={zeroY} x2={W - padX} y2={zeroY} stroke="var(--ink)" strokeWidth="1" opacity="0.35" />
      {months.map((m, i) => {
        const x = padX + i * bw + bw * 0.22;
        const barW = bw * 0.56;
        const h = plotH * (Math.abs(m.profit) / range);
        const pos = m.profit >= 0;
        const y = pos ? zeroY - h : zeroY;
        const color = pos ? 'var(--green)' : 'var(--cynober)';
        return (
          <g key={i}>
            {m.active && Math.abs(m.profit) > 0.5 && (
              <rect x={x} y={y} width={barW} height={Math.max(1.5, h)} rx="2" fill={color} />
            )}
            {m.active && Math.abs(m.profit) >= range * 0.06 && (
              <text x={x + barW / 2} y={pos ? y - 4 : y + h + 10} textAnchor="middle"
                fontSize="8.5" fontFamily="'IBM Plex Mono', monospace" fill="var(--faint)">{fmt(m.profit)}</text>
            )}
            <text x={x + barW / 2} y={H - 10} textAnchor="middle" fontSize="9.5" fill="var(--faint)">{MABBR[i]}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* `wpd-rpt-kv` nie ma stylu na ekranie — to wyłącznie zaczep dla arkusza druku,
   który zagęszcza te wiersze razem z resztą dokumentu (X18 partia C). */
function ReportRow({ label, value, color, strong, suffix = ' zł' }) {
  return (
    <div className="wpd-rpt-kv" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '3px 0' }}>
      <span className="wpd-body" style={{ fontSize: 13, color: strong ? 'var(--ink)' : 'var(--muted)', fontWeight: strong ? 700 : 400 }}>{label}</span>
      <span className="wpd-mono" style={{ fontSize: 13.5, fontWeight: strong ? 700 : 600, color: color || 'var(--ink)' }}>{fmt(value)}{suffix}</span>
    </div>
  );
}

/*
  Raport rentowności (X4 partia 3) — pełne P&L roku z kosztami stałymi (spójne
  z zakładką Koszty i opłaty). Wykres zysku miesiąc po miesiącu + struktura kosztów
  (inline SVG), tabela miesięczna, rentowność wg obiektu. Druk → PDF (window.print
  + arkusz @media print), eksport CSV dla księgowego.
*/
function ProfitabilityReportModal({ showStatsModal, setShowStatsModal, selectedYear, handleYearChange, availableYears, rentals = [], recurringCosts = [], hostProfile }) {
  const dialogA11y = useDialogA11y(showStatsModal, () => setShowStatsModal(false));
  // Rejestr pozycji potrafi mieć kilkanaście stron przy pełnym sezonie, więc do wydruku
  // wchodzi TYLKO na życzenie. Na ekranie jest zawsze — tam długość nie przeszkadza.
  const [rejestrWDruku, setRejestrWDruku] = useState(false);

  const rep = useMemo(() => buildReport(rentals, recurringCosts, selectedYear), [rentals, recurringCosts, selectedYear]);

  if (!showStatsModal) return null;

  const exportCsv = () => {
    try {
      const blob = new Blob([profitabilityCsv(rentals, recurringCosts, selectedYear)], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `raport_wynajempro_${selectedYear}.csv`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success('Pobrano plik CSV dla księgowego');
    } catch (e) { console.error('Błąd eksportu CSV:', e); toast.error('Nie udało się wygenerować pliku.'); }
  };

  const generatedAt = new Date().toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
  const empty = rep.T.income === 0 && rep.totalCosts === 0;

  // Nazwa pliku PDF i tytuł dokumentu biorą się z `document.title`, czyli domyślnie
  // z tytułu strony aplikacji — księgowy dostawał plik nazwany hasłem reklamowym
  // („WynajemPRO - Prosty system do zarządzania…"), zgłoszone 2026-08-13. Podmieniamy
  // na czas drukowania i przywracamy po. `afterprint` odpala się także po anulowaniu
  // okna drukowania, więc tytuł wraca również wtedy.
  const drukuj = () => {
    const poprzedniTytul = document.title;
    const podmiot = hostProfile?.entityName ? ` — ${hostProfile.entityName}` : '';
    document.title = `Raport rentowności ${rep.y}${podmiot}`;
    const przywroc = () => {
      document.title = poprzedniTytul;
      window.removeEventListener('afterprint', przywroc);
    };
    window.addEventListener('afterprint', przywroc);
    window.print();
  };

  return (
    <div className="wpd-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowStatsModal(false); }}>
      <div className="wpd-dialog wpd-dialog--lg" {...dialogA11y}>
        <div className="wpd-dialog__head wpd-report-noprint">
          <span className="wpd-dialog__ic"><BarChart3 /></span>
          <div>
            <h2 className="wpd-h2">Raport rentowności</h2>
            <p className="wpd-dialog__sub">Pełne zestawienie przychodów, kosztów i zysku</p>
          </div>
          <select className="wpd-select" style={{ width: 'auto' }} value={selectedYear} onChange={(e) => handleYearChange(e.target.value)}>
            {availableYears.map((y) => <option key={y} value={y}>Rok {y}</option>)}
          </select>
          <label className="wpd-check" style={{ marginLeft: 'auto', fontSize: 12.5, whiteSpace: 'nowrap' }} title="Rejestr potrafi zająć kilkanaście stron — domyślnie zostaje poza wydrukiem">
            <input type="checkbox" checked={rejestrWDruku} onChange={(e) => setRejestrWDruku(e.target.checked)} />
            <span className="wpd-check__box" aria-hidden="true" />
            <span>Rejestr w wydruku</span>
          </label>
          <button className="wpd-btn wpd-btn--sm" onClick={drukuj} disabled={empty}><Printer /> Drukuj / PDF</button>
          <button className="wpd-btn wpd-btn--sm" onClick={exportCsv} disabled={empty}><FileSpreadsheet /> CSV</button>
          <button className="wpd-dialog__close" onClick={() => setShowStatsModal(false)}><X /></button>
        </div>

        <div className="wpd-dialog__body wpd-report-print">
          {/* Nagłówek widoczny wyłącznie na wydruku */}
          <div className="wpd-report-onlyprint wpd-rpt-head">
            <div>
              <div className="wpd-rpt-head__title">Raport rentowności {rep.y}</div>
              <div className="wpd-rpt-head__ent">{hostProfile?.entityName || 'Gospodarz'}</div>
            </div>
            <div className="wpd-rpt-head__meta">WynajemPRO · wygenerowano {generatedAt}</div>
          </div>

          {empty ? (
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
              <BarChart3 style={{ width: 28, height: 28, color: 'var(--faint)', margin: '0 auto 12px', display: 'block' }} />
              <p className="wpd-h2" style={{ fontSize: 16, marginBottom: 6 }}>Brak danych za rok {rep.y}</p>
              <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>Dodaj rezerwacje i koszty, aby wygenerować raport rentowności.</p>
            </div>
          ) : (
            <>
              <div className="wpd-stats wpd-rpt-section" style={{ marginBottom: 22 }}>
                <div className="wpd-stat" style={{ cursor: 'default' }}>
                  <p className="wpd-stat__label">Przychód</p>
                  <div className="wpd-stat__value" style={{ color: 'var(--green)' }}>{fmt(rep.T.income)} <small>zł</small></div>
                </div>
                <div className="wpd-stat" style={{ cursor: 'default' }}>
                  <p className="wpd-stat__label">Koszty łącznie</p>
                  <div className="wpd-stat__value" style={{ color: 'var(--cynober)' }}>{fmt(rep.totalCosts)} <small>zł</small></div>
                  <p className="wpd-stat__foot">w tym stałe {fmt(rep.T.fixed)} zł</p>
                </div>
                <div className="wpd-stat wpd-stat--dark" style={{ cursor: 'default' }}>
                  <p className="wpd-stat__label">Zysk netto</p>
                  <div className="wpd-stat__value" style={{ color: rep.profit >= 0 ? 'var(--green)' : 'var(--cynober)' }}>{fmt(rep.profit)} <small>zł</small></div>
                </div>
                <div className="wpd-stat" style={{ cursor: 'default' }}>
                  <p className="wpd-stat__label">Marża</p>
                  <div className="wpd-stat__value">{rep.margin}<small>%</small></div>
                  <p className="wpd-stat__foot">zysk / przychód</p>
                </div>
              </div>

              <p className="wpd-mono wpd-rpt-section" style={{ fontSize: 11, color: 'var(--faint)', margin: '-12px 0 18px', letterSpacing: '.03em' }}>
                Koszty / przychody: {proc(rep.statystyki.kosztyDoPrzychodow)} · pozycji w raporcie: {rep.pozycji} · rezerwacji: {rep.statystyki.rezerwacji}
              </p>

              <div className="wpd-panel wpd-rpt-section" style={{ marginBottom: 18 }}>
                <div className="wpd-panel__head"><h2 className="wpd-h2" style={{ fontSize: 15 }}>Zysk miesiąc po miesiącu</h2></div>
                <div style={{ padding: '14px 14px 6px' }}>
                  <MonthlyProfitChart months={rep.months} />
                </div>
              </div>

              <div className="wpd-panel wpd-rpt-section" style={{ marginBottom: 18 }}>
                <div className="wpd-panel__head"><h2 className="wpd-h2" style={{ fontSize: 15 }}>Struktura kosztów</h2></div>
                <div style={{ padding: '12px 18px 16px' }}>
                  {rep.buckets.map((b) => {
                    const pct = Math.round((b.amount / (rep.totalCosts || 1)) * 100);
                    const bar = Math.round((b.amount / rep.maxBucket) * 100);
                    return (
                      <div className="wpd-hbar" key={b.name}>
                        <div className="wpd-hbar__head">
                          <span className="wpd-hbar__name"><span className="wpd-dot" style={{ background: b.color }} />{b.name}</span>
                          <span className="wpd-hbar__val"><b>{fmt(b.amount)} zł</b> · {pct}%</span>
                        </div>
                        <div className="wpd-hbar__track"><div className="wpd-hbar__fill" style={{ width: `${bar}%`, background: b.color, transform: 'scaleX(1)' }} /></div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="wpd-panel wpd-rpt-section" style={{ marginBottom: 18 }}>
                <div className="wpd-panel__head"><h2 className="wpd-h2" style={{ fontSize: 15 }}>Klasyfikacja kosztów</h2></div>
                <table className="wpd-table">
                  <thead>
                    <tr>
                      <th>Grupa i kategoria</th>
                      <th className="wpd-num">Kwota</th>
                      <th className="wpd-num">Udział w kosztach</th>
                      <th className="wpd-num">Udział w przychodach</th>
                      <th className="wpd-num">Pozycji</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rep.grupyKosztow.map((g) => (
                      <React.Fragment key={g.nazwa}>
                        <tr>
                          <td className="wpd-cell-strong"><span className="wpd-dot" style={{ background: g.color }} />{g.nazwa}</td>
                          <td className="wpd-num wpd-cell-num wpd-cell-strong">{fmt(g.amount)} zł</td>
                          <td className="wpd-num wpd-cell-num wpd-cell-strong">{proc(g.udzialKoszt)}</td>
                          <td className="wpd-num wpd-cell-num">{proc(g.udzialPrzychod)}</td>
                          <td className="wpd-num wpd-cell-num">{g.count}</td>
                        </tr>
                        {/* Kategorie pokazujemy tylko wtedy, gdy wnoszą coś ponad nazwę grupy. */}
                        {g.kategorie.length > 1 && g.kategorie.map((k) => (
                          <tr key={g.nazwa + k.nazwa} style={{ opacity: 0.85 }}>
                            <td style={{ paddingLeft: 26, color: 'var(--muted)' }}>{k.nazwa}</td>
                            <td className="wpd-num wpd-cell-num">{fmt(k.amount)} zł</td>
                            <td className="wpd-num wpd-cell-num">{proc(k.udzialKoszt)}</td>
                            <td className="wpd-num wpd-cell-num">—</td>
                            <td className="wpd-num wpd-cell-num">{k.count}</td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                    <tr className="wpd-rpt-total">
                      <td className="wpd-cell-strong">Razem koszty</td>
                      <td className="wpd-num wpd-cell-num wpd-cell-strong">{fmt(rep.totalCosts)} zł</td>
                      <td className="wpd-num wpd-cell-num wpd-cell-strong">100,0%</td>
                      <td className="wpd-num wpd-cell-num wpd-cell-strong">{proc(rep.statystyki.kosztyDoPrzychodow)}</td>
                      <td className="wpd-num wpd-cell-num wpd-cell-strong">{rep.grupyKosztow.reduce((a, g) => a + g.count, 0)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {rep.zrodlaPrzychodu.length > 0 && (
                <div className="wpd-panel wpd-rpt-section" style={{ marginBottom: 18 }}>
                  <div className="wpd-panel__head"><h2 className="wpd-h2" style={{ fontSize: 15 }}>Struktura przychodów</h2></div>
                  <table className="wpd-table">
                    <thead>
                      <tr>
                        <th>Źródło rezerwacji</th>
                        <th className="wpd-num">Kwota</th>
                        <th className="wpd-num">Udział</th>
                        <th className="wpd-num">Rezerwacji</th>
                        <th className="wpd-num">Średnia</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rep.zrodlaPrzychodu.map((z) => (
                        <tr key={z.nazwa}>
                          <td className="wpd-cell-strong">{z.nazwa}</td>
                          <td className="wpd-num wpd-cell-num" style={{ color: 'var(--green)' }}>{fmt(z.amount)} zł</td>
                          <td className="wpd-num wpd-cell-num">{proc(z.udzial)}</td>
                          <td className="wpd-num wpd-cell-num">{z.count}</td>
                          <td className="wpd-num wpd-cell-num">{fmt(z.amount / z.count)} zł</td>
                        </tr>
                      ))}
                      <tr className="wpd-rpt-total">
                        <td className="wpd-cell-strong">Razem przychody</td>
                        <td className="wpd-num wpd-cell-num wpd-cell-strong">{fmt(rep.T.income)} zł</td>
                        <td className="wpd-num wpd-cell-num wpd-cell-strong">100,0%</td>
                        <td className="wpd-num wpd-cell-num wpd-cell-strong">{rep.statystyki.rezerwacji}</td>
                        <td className="wpd-num wpd-cell-num wpd-cell-strong">{fmt(rep.statystyki.srednia)} zł</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}

              <div className="wpd-panel wpd-rpt-section" style={{ marginBottom: 18 }}>
                <div className="wpd-panel__head"><h2 className="wpd-h2" style={{ fontSize: 15 }}>Miesiąc po miesiącu</h2></div>
                <table className="wpd-table">
                  <thead>
                    <tr>
                      <th>Miesiąc</th>
                      <th className="wpd-num">Przychód</th>
                      <th className="wpd-num">Koszty</th>
                      <th className="wpd-num">Podatek</th>
                      <th className="wpd-num">Stałe</th>
                      <th className="wpd-num">Zysk netto</th>
                      <th className="wpd-num">Marża</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rep.months.map((m, i) => (
                      <tr key={i} className={m.active ? undefined : 'wpd-rpt-idle'}>
                        <td className="wpd-cell-strong">{MABBR[i]}</td>
                        <td className="wpd-num wpd-cell-num" style={{ color: 'var(--green)' }}>{m.income > 0 ? `${fmt(m.income)} zł` : '—'}</td>
                        <td className="wpd-num wpd-cell-num" style={{ color: 'var(--cynober)' }}>{(m.commission + m.media + m.own) > 0 ? `${fmt(m.commission + m.media + m.own)} zł` : '—'}</td>
                        <td className="wpd-num wpd-cell-num" style={{ color: 'var(--granat)' }}>{m.tax > 0 ? `${fmt(m.tax)} zł` : '—'}</td>
                        <td className="wpd-num wpd-cell-num" style={{ color: 'var(--brick)' }}>{m.fixed > 0 ? `${fmt(m.fixed)} zł` : '—'}</td>
                        <td className="wpd-num wpd-cell-num wpd-cell-strong" style={{ color: m.profit < 0 ? 'var(--cynober)' : 'inherit' }}>{m.active ? `${fmt(m.profit)} zł` : '—'}</td>
                        <td className="wpd-num wpd-cell-num">{m.active && m.margin !== null ? `${m.margin}%` : '—'}</td>
                      </tr>
                    ))}
                    <tr className="wpd-rpt-total">
                      <td className="wpd-cell-strong">Razem {rep.y}</td>
                      <td className="wpd-num wpd-cell-num wpd-cell-strong">{fmt(rep.T.income)} zł</td>
                      <td className="wpd-num wpd-cell-num wpd-cell-strong">{fmt(rep.T.commission + rep.T.media + rep.T.own)} zł</td>
                      <td className="wpd-num wpd-cell-num wpd-cell-strong">{fmt(rep.T.tax)} zł</td>
                      <td className="wpd-num wpd-cell-num wpd-cell-strong">{fmt(rep.T.fixed)} zł</td>
                      <td className="wpd-num wpd-cell-num wpd-cell-strong" style={{ color: rep.profit >= 0 ? 'var(--green)' : 'var(--cynober)' }}>{fmt(rep.profit)} zł</td>
                      <td className="wpd-num wpd-cell-num wpd-cell-strong">{rep.margin}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {rep.objRows.length > 0 && (
                <div className="wpd-panel wpd-rpt-section">
                  <div className="wpd-panel__head"><h2 className="wpd-h2" style={{ fontSize: 15 }}>Rentowność wg obiektu</h2></div>
                  <table className="wpd-table">
                    <thead>
                      <tr>
                        <th>Obiekt</th>
                        <th className="wpd-num">Przychód</th>
                        <th className="wpd-num">Koszty</th>
                        <th className="wpd-num">Zysk</th>
                        <th className="wpd-num">Marża</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rep.objRows.map((o) => (
                        <tr key={o.name}>
                          <td className="wpd-cell-strong">{o.name || '—'}</td>
                          <td className="wpd-num wpd-cell-num" style={{ color: 'var(--green)' }}>{fmt(o.income)} zł</td>
                          <td className="wpd-num wpd-cell-num" style={{ color: 'var(--cynober)' }}>{fmt(o.cost)} zł</td>
                          <td className="wpd-num wpd-cell-num wpd-cell-strong" style={{ color: o.profit < 0 ? 'var(--cynober)' : 'inherit' }}>{fmt(o.profit)} zł</td>
                          <td className="wpd-num wpd-cell-num">{o.income > 0 ? `${o.margin}%` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="wpd-panel wpd-rpt-section" style={{ marginTop: 18, marginBottom: 18 }}>
                <div className="wpd-panel__head"><h2 className="wpd-h2" style={{ fontSize: 15 }}>Statystyki operacyjne</h2></div>
                <div style={{ padding: '12px 18px 16px' }}>
                  <ReportRow label="Liczba rezerwacji" value={rep.statystyki.rezerwacji} suffix="" />
                  <ReportRow label="Średnia wartość rezerwacji" value={rep.statystyki.srednia} />
                  <ReportRow label="Najwyższa rezerwacja" value={rep.statystyki.najwyzsza} />
                  <ReportRow label="Najniższa rezerwacja" value={rep.statystyki.najnizsza} />
                  <div className="wpd-rpt-kv" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '3px 0' }}>
                    <span className="wpd-body" style={{ fontSize: 13, color: 'var(--muted)' }}>Średnia prowizja portali (od rezerwacji z prowizją)</span>
                    <span className="wpd-mono" style={{ fontSize: 13.5, fontWeight: 600 }}>{proc(rep.statystyki.sredniaProwizja)}</span>
                  </div>
                  <div className="wpd-rpt-kv" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '3px 0' }}>
                    <span className="wpd-body" style={{ fontSize: 13, color: 'var(--muted)' }}>Efektywna stawka podatku (podatek + VAT / przychód)</span>
                    <span className="wpd-mono" style={{ fontSize: 13.5, fontWeight: 600 }}>{proc(rep.statystyki.efektywnaStawkaPodatku)}</span>
                  </div>
                  <div className="wpd-rpt-kv" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '3px 0' }}>
                    <span className="wpd-body" style={{ fontSize: 13, color: 'var(--muted)' }}>Koszty / przychody</span>
                    <span className="wpd-mono" style={{ fontSize: 13.5, fontWeight: 600 }}>{proc(rep.statystyki.kosztyDoPrzychodow)}</span>
                  </div>
                </div>
              </div>

              {rep.rejestr.length > 0 && (
                <div className={`wpd-panel wpd-rpt-section wpd-rpt-register${rejestrWDruku ? '' : ' wpd-report-noprint'}`} style={{ marginBottom: 18 }}>
                  <div className="wpd-panel__head">
                    <h2 className="wpd-h2" style={{ fontSize: 15 }}>Rejestr pozycji ({rep.rejestr.length})</h2>
                  </div>
                  <table className="wpd-table">
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Typ</th>
                        <th>Obiekt</th>
                        <th>Źródło / kategoria</th>
                        <th>Opis</th>
                        <th className="wpd-num">Przychód</th>
                        <th className="wpd-num">Koszty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rep.rejestr.map((r, i) => {
                        const koszty = (r.Prowizja || 0) + (r.Podatek || 0) + (r.VAT || 0) + (r.Media || 0) + (r.Koszt || 0);
                        return (
                          <tr key={`${r.Data}-${i}`}>
                            <td className="wpd-mono" style={{ fontSize: 12 }}>{r.Data}</td>
                            <td>{r.Typ}</td>
                            <td>{r.Obiekt || '—'}</td>
                            <td>{r['Źródło / kategoria'] || '—'}</td>
                            <td style={{ color: 'var(--muted)' }}>{r.Opis || '—'}</td>
                            <td className="wpd-num wpd-cell-num" style={{ color: 'var(--green)' }}>{r.Przychód > 0 ? `${fmt(r.Przychód)} zł` : '—'}</td>
                            <td className="wpd-num wpd-cell-num" style={{ color: 'var(--cynober)' }}>{koszty > 0 ? `${fmt(koszty)} zł` : '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <p className="wpd-body" style={{ fontSize: 11.5, color: 'var(--faint)', padding: '10px 18px 14px', margin: 0 }}>
                    Kolumna „Koszty" przy rezerwacji sumuje prowizję, podatek, VAT i media przypisane do tego pobytu.
                    Ten sam zestaw pozycji, z kwotami rozbitymi na osobne kolumny, wychodzi w eksporcie CSV.
                  </p>
                </div>
              )}

              <div className="wpd-panel wpd-rpt-section wpd-rpt-method" style={{ marginBottom: 4 }}>
                <div className="wpd-panel__head"><h2 className="wpd-h2" style={{ fontSize: 15 }}>Metodyka i ograniczenia</h2></div>
                <div style={{ padding: '12px 18px 16px', fontSize: 12.5, lineHeight: 1.55, color: 'var(--muted)' }}>
                  <p style={{ margin: '0 0 8px' }}>
                    <b style={{ color: 'var(--ink)' }}>Zakres.</b> Raport obejmuje wyłącznie pozycje wprowadzone do WynajemPRO z datą w roku {rep.y}
                    {' '}— {rep.pozycji} pozycji. Przychód wykazano w kwocie brutto, a prowizje portali ujęto jako koszt.
                  </p>
                  <p style={{ margin: '0 0 8px' }}>
                    <b style={{ color: 'var(--ink)' }}>Podatek.</b> Podatek i VAT obciążają wynik w tym zestawieniu, choć nie są kosztem operacyjnym.
                    Przy ocenie samej opłacalności najmu warto patrzeć na wynik przed podatkiem.
                  </p>
                  <p style={{ margin: '0 0 8px' }}>
                    <b style={{ color: 'var(--ink)' }}>Koszty stałe.</b> Rozliczane za miesiące faktycznie poniesione — w roku bieżącym do miesiąca bieżącego włącznie,
                    nie za cały rok z góry.
                  </p>
                  <p style={{ margin: 0 }}>
                    <b style={{ color: 'var(--ink)' }}>Ograniczenie.</b> Raport widzi tylko to, co zostało wpisane do aplikacji. Jeżeli koszty takie jak sprzątanie,
                    materiały czy amortyzacja nie są ewidencjonowane, wykazana marża jest <b style={{ color: 'var(--ink)' }}>wyższa niż rzeczywista</b>.
                    Pozycje nie mają też numerów dokumentów źródłowych — przy rozliczeniu z księgowym trzeba je zestawić z fakturami samodzielnie.
                  </p>
                </div>
              </div>

              <p className="wpd-report-onlyprint wpd-rpt-foot">
                Raport wygenerowany w WynajemPRO {generatedAt}. Wartości orientacyjne — do rozliczenia z księgowym użyj eksportu CSV.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(ProfitabilityReportModal);
