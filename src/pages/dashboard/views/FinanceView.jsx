import React, { useMemo, useState } from 'react';
import { Download, TrendingUp, Receipt, Wallet, Tag } from 'lucide-react';
import { channelColor } from '../styles';

const fmt = (n) => new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(Math.round(Number(n) || 0));
const MONTHS = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];

const channelLabel = (src = '') => {
  const s = src.toLowerCase();
  if (s.includes('airbnb')) return 'Airbnb';
  if (s.includes('booking')) return 'Booking.com';
  if (s.includes('nocowanie')) return 'Nocowanie';
  return 'Bezpośrednie';
};

/*
  Finanse (05) — wzorzec: ekran 06-app2. Filtr Miesiąc/Rok/Wszystko, 4 KPI
  (wyróżniony "Zysk netto"), wykres miesięczny i podział przychodu wg kanału.
  Pochłania funkcje Wydatków i Podatków ze starej apki.
*/
export default function FinanceView({ rentals, selectedYear, currentYearData, onExport }) {
  const [scope, setScope] = useState('year'); // 'month' | 'year' | 'all'

  const kpi = useMemo(() => {
    const curMonth = new Date().getMonth();
    const inScope = (r) => {
      if (!r.date) return scope === 'all';
      const d = new Date(r.date);
      if (isNaN(d.getTime())) return false;
      if (scope === 'all') return true;
      if (d.getFullYear().toString() !== selectedYear) return false;
      if (scope === 'month') return d.getMonth() === curMonth;
      return true;
    };
    let income = 0, costs = 0, tax = 0, nights = 0;
    const byChannel = {};
    rentals.forEach((r) => {
      if (!inScope(r)) return;
      const inc = Number(r.income) || 0;
      income += inc;
      costs += (Number(r.commission) || 0) + (Number(r.utilities) || 0);
      tax += (Number(r.tax) || 0) + (Number(r.vat) || 0);
      if (r.type === 'booking' && r.date) {
        const s = new Date(r.date); const e = new Date(r.endDate || r.date);
        nights += Math.max(1, Math.round((e - s) / 86400000) || 1);
        if (inc > 0) {
          const key = channelLabel(r.source);
          byChannel[key] = (byChannel[key] || 0) + inc;
        }
      }
    });
    const totalCh = Object.values(byChannel).reduce((a, b) => a + b, 0) || 1;
    const channels = Object.entries(byChannel)
      .map(([name, val]) => ({ name, val, pct: Math.round((val / totalCh) * 100), color: channelColor(name) }))
      .sort((a, b) => b.val - a.val);
    // korekta zaokrągleń, by udziały sumowały się do 100%
    if (channels.length) {
      const diff = 100 - channels.reduce((a, c) => a + c.pct, 0);
      channels[0].pct = Math.max(0, channels[0].pct + diff);
    }
    return {
      income, costs: costs + tax, profit: income - costs - tax,
      avgRate: nights > 0 ? Math.round(income / nights) : 0,
      channels,
    };
  }, [rentals, selectedYear, scope]);

  const monthly = useMemo(() => {
    const arr = currentYearData.months.map((m) => m.income || 0);
    const max = Math.max(1, ...arr);
    return arr.map((v, i) => ({ label: MONTHS[i], value: v, pct: Math.round((v / max) * 100), hi: v === max && v > 0 }));
  }, [currentYearData]);

  return (
    <>
      <div className="wpd-objs__head">
        <div className="wpd-seg">
          <button className={`wpd-seg__btn${scope === 'month' ? ' wpd-seg__btn--active' : ''}`} onClick={() => setScope('month')}>Miesiąc</button>
          <button className={`wpd-seg__btn${scope === 'year' ? ' wpd-seg__btn--active' : ''}`} onClick={() => setScope('year')}>Rok {selectedYear}</button>
          <button className={`wpd-seg__btn${scope === 'all' ? ' wpd-seg__btn--active' : ''}`} onClick={() => setScope('all')}>Wszystko</button>
        </div>
        <button className="wpd-btn" onClick={onExport}><Download /> Eksport PDF</button>
      </div>

      <div className="wpd-stats">
        <div className="wpd-stat" style={{ cursor: 'default' }}>
          <div className="wpd-stat__head"><p className="wpd-stat__label">Przychód brutto</p><span className="wpd-stat__ic"><TrendingUp /></span></div>
          <div className="wpd-stat__value">{fmt(kpi.income)} <small>zł</small></div>
        </div>
        <div className="wpd-stat" style={{ cursor: 'default' }}>
          <div className="wpd-stat__head"><p className="wpd-stat__label">Prowizje i koszty</p><span className="wpd-stat__ic"><Receipt /></span></div>
          <div className="wpd-stat__value" style={{ color: 'var(--cynober)' }}>− {fmt(kpi.costs)} <small>zł</small></div>
        </div>
        <div className="wpd-stat wpd-stat--dark" style={{ cursor: 'default' }}>
          <div className="wpd-stat__head"><p className="wpd-stat__label">Zysk netto</p><span className="wpd-stat__ic"><Wallet /></span></div>
          <div className="wpd-stat__value">{fmt(kpi.profit)} <small>zł</small></div>
        </div>
        <div className="wpd-stat" style={{ cursor: 'default' }}>
          <div className="wpd-stat__head"><p className="wpd-stat__label">Śr. cena / noc</p><span className="wpd-stat__ic"><Tag /></span></div>
          <div className="wpd-stat__value">{fmt(kpi.avgRate)} <small>zł</small></div>
        </div>
      </div>

      <div className="wpd-section wpd-grid-2">
        <div className="wpd-panel">
          <div className="wpd-panel__head"><h2 className="wpd-h2">Przychód miesięczny · {selectedYear}</h2></div>
          <div style={{ padding: '20px' }}>
            <div className="wpd-chartl__bars">
              {monthly.map((m, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }} title={`${m.label}: ${fmt(m.value)} zł`}>
                  <div className={`wpd-chartl__bar${m.hi ? ' wpd-chartl__bar--hi' : ''}`} style={{ height: `${Math.max(2, m.pct)}%`, width: '100%' }} />
                  <span className="wpd-cal__day" style={{ fontSize: 9.5 }}>{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="wpd-panel">
          <div className="wpd-panel__head"><h2 className="wpd-h2">Przychód wg kanału</h2></div>
          <div style={{ padding: '16px 20px' }}>
            {kpi.channels.length === 0 && <div className="wpd-empty"><p>Brak przychodu w tym zakresie.</p></div>}
            {kpi.channels.map((c) => (
              <div className="wpd-share" key={c.name}>
                <div className="wpd-share__top">
                  <span className="wpd-share__name">{c.name}</span>
                  <span className="wpd-share__pct">{c.pct}%</span>
                </div>
                <div className="wpd-share__bar"><div className="wpd-share__fill" style={{ width: `${c.pct}%`, background: c.color }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
