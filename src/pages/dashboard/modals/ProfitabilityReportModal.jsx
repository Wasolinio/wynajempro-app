import React, { useMemo } from 'react';
import { BarChart3, X, Printer, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDialogA11y } from './useDialogA11y';
import { profitabilityCsv } from '../../../utils/reportExport';

const fmt = (n) => new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(Math.round(Number(n) || 0));
const propNameOf = (p) => (typeof p === 'object' ? p?.name : p) || '';
const monthIdx = (ym) => { const [y, m] = (ym || '').split('-').map(Number); return (y || 0) * 12 + ((m || 1) - 1); };
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

function ReportRow({ label, value, color, strong }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '3px 0' }}>
      <span className="wpd-body" style={{ fontSize: 13, color: strong ? 'var(--ink)' : 'var(--muted)', fontWeight: strong ? 700 : 400 }}>{label}</span>
      <span className="wpd-mono" style={{ fontSize: 13.5, fontWeight: strong ? 700 : 600, color: color || 'var(--ink)' }}>{fmt(value)} zł</span>
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

  const rep = useMemo(() => {
    const y = Number(selectedYear);
    const now = new Date();
    const nowIdx = now.getFullYear() * 12 + now.getMonth();
    const months = Array.from({ length: 12 }, () => ({ income: 0, commission: 0, media: 0, own: 0, tax: 0, fixed: 0, active: false, profit: 0 }));
    const byProp = {};
    const bump = (name) => (byProp[name] || (byProp[name] = { income: 0, cost: 0 }));

    (rentals || []).forEach((r) => {
      if (!r.date) return;
      const d = new Date(r.date);
      if (isNaN(d.getTime()) || d.getFullYear() !== y) return;
      const mo = d.getMonth();
      const P = bump(propNameOf(r.property));
      if (r.type === 'booking') {
        const inc = Number(r.income) || 0, com = Number(r.commission) || 0, media = Number(r.utilities) || 0, tax = (Number(r.tax) || 0) + (Number(r.vat) || 0);
        months[mo].income += inc; months[mo].commission += com; months[mo].media += media; months[mo].tax += tax; months[mo].active = true;
        P.income += inc; P.cost += com + media + tax;
      } else if (r.type === 'utility') {
        const amt = Number(r.utilities) || 0; if (amt <= 0) return;
        months[mo].own += amt; months[mo].active = true; P.cost += amt;
      }
    });

    (recurringCosts || []).forEach((c) => {
      const start = monthIdx(c.startMonth); const end = c.endMonth ? monthIdx(c.endMonth) : Infinity;
      const from = Math.max(start, y * 12); const to = Math.min(end, y * 12 + 11, nowIdx);
      for (let mi = from; mi <= to; mi++) {
        const amt = Number(c.amount) || 0;
        months[mi % 12].fixed += amt; months[mi % 12].active = true;
        if (c.property) bump(c.property).cost += amt;
      }
    });

    months.forEach((m) => { m.profit = m.income - m.commission - m.media - m.own - m.tax - m.fixed; });
    const T = months.reduce((a, m) => ({
      income: a.income + m.income, commission: a.commission + m.commission, media: a.media + m.media,
      own: a.own + m.own, tax: a.tax + m.tax, fixed: a.fixed + m.fixed,
    }), { income: 0, commission: 0, media: 0, own: 0, tax: 0, fixed: 0 });

    const variable = T.commission + T.media + T.own + T.tax;
    const totalCosts = variable + T.fixed;
    const profit = T.income - totalCosts;
    const margin = T.income > 0 ? Math.round((profit / T.income) * 100) : 0;

    const buckets = [
      { name: 'Prowizje portali', amount: T.commission, color: 'var(--cynober)' },
      { name: 'Media w rezerwacjach', amount: T.media, color: 'var(--granat)' },
      { name: 'Koszty własne', amount: T.own, color: 'var(--green)' },
      { name: 'Podatek i VAT', amount: T.tax, color: 'var(--amber-ink)' },
      { name: 'Koszty stałe', amount: T.fixed, color: 'var(--brick)' },
    ].filter((b) => b.amount > 0).sort((a, b) => b.amount - a.amount);
    const maxBucket = Math.max(1, ...buckets.map((b) => b.amount));

    const objRows = Object.entries(byProp)
      .map(([name, v]) => ({ name, income: v.income, cost: v.cost, profit: v.income - v.cost, margin: v.income > 0 ? Math.round(((v.income - v.cost) / v.income) * 100) : 0 }))
      .filter((o) => o.income > 0 || o.cost > 0)
      .sort((a, b) => b.profit - a.profit);

    return { y, months, T, variable, totalCosts, profit, margin, buckets, maxBucket, objRows };
  }, [rentals, recurringCosts, selectedYear]);

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

  return (
    <div className="wpd-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowStatsModal(false); }}>
      <div className="wpd-dialog wpd-dialog--lg" {...dialogA11y}>
        <div className="wpd-dialog__head wpd-report-noprint">
          <span className="wpd-dialog__ic"><BarChart3 /></span>
          <div>
            <h2 className="wpd-h2">Raport rentowności</h2>
            <p className="wpd-dialog__sub">Pełne zestawienie przychodów, kosztów i zysku</p>
          </div>
          <select className="wpd-select" style={{ width: 'auto', marginLeft: 'auto' }} value={selectedYear} onChange={(e) => handleYearChange(e.target.value)}>
            {availableYears.map((y) => <option key={y} value={y}>Rok {y}</option>)}
          </select>
          <button className="wpd-btn wpd-btn--sm" onClick={() => window.print()} disabled={empty}><Printer /> Drukuj / PDF</button>
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
                    </tr>
                  </thead>
                  <tbody>
                    {rep.months.map((m, i) => (
                      <tr key={i} style={{ opacity: m.active ? 1 : 0.4 }}>
                        <td className="wpd-cell-strong">{MABBR[i]}</td>
                        <td className="wpd-num wpd-cell-num" style={{ color: 'var(--green)' }}>{m.income > 0 ? `${fmt(m.income)} zł` : '—'}</td>
                        <td className="wpd-num wpd-cell-num" style={{ color: 'var(--cynober)' }}>{(m.commission + m.media + m.own) > 0 ? `${fmt(m.commission + m.media + m.own)} zł` : '—'}</td>
                        <td className="wpd-num wpd-cell-num" style={{ color: 'var(--granat)' }}>{m.tax > 0 ? `${fmt(m.tax)} zł` : '—'}</td>
                        <td className="wpd-num wpd-cell-num" style={{ color: 'var(--brick)' }}>{m.fixed > 0 ? `${fmt(m.fixed)} zł` : '—'}</td>
                        <td className="wpd-num wpd-cell-num wpd-cell-strong" style={{ color: m.profit < 0 ? 'var(--cynober)' : 'inherit' }}>{m.active ? `${fmt(m.profit)} zł` : '—'}</td>
                      </tr>
                    ))}
                    <tr className="wpd-rpt-total">
                      <td className="wpd-cell-strong">Razem {rep.y}</td>
                      <td className="wpd-num wpd-cell-num wpd-cell-strong">{fmt(rep.T.income)} zł</td>
                      <td className="wpd-num wpd-cell-num wpd-cell-strong">{fmt(rep.T.commission + rep.T.media + rep.T.own)} zł</td>
                      <td className="wpd-num wpd-cell-num wpd-cell-strong">{fmt(rep.T.tax)} zł</td>
                      <td className="wpd-num wpd-cell-num wpd-cell-strong">{fmt(rep.T.fixed)} zł</td>
                      <td className="wpd-num wpd-cell-num wpd-cell-strong" style={{ color: rep.profit >= 0 ? 'var(--green)' : 'var(--cynober)' }}>{fmt(rep.profit)} zł</td>
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
