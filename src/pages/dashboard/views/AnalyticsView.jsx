import React, { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Banknote, Wallet, PieChart, Tag, TrendingUp, TrendingDown,
  Minus, CalendarDays, Moon, Clock, ClipboardList,
} from 'lucide-react';
import { db } from '../../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { channelColor, propHex } from '../styles';
import { useCountUp } from '../useCountUp';

const MONTHS = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];
const MONTHS_SHORT = ['Sty', 'Lut', 'Mar', 'Kwi', 'Maj', 'Cze', 'Lip', 'Sie', 'Wrz', 'Paź', 'Lis', 'Gru'];
const PERIODS = [['month', 'Miesiąc'], ['quarter', 'Kwartał'], ['half', 'Półrocze'], ['year', 'Rok'], ['range', 'Zakres']];

const fmt = (n) => new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(Math.round(Number(n) || 0));
const fmtDate = (d) => new Date(d).toLocaleDateString('pl-PL');
const lastDay = (y, m) => new Date(y, m + 1, 0).getDate();
const channelLabel = (src = '') => {
  const s = src.toLowerCase();
  if (s.includes('airbnb')) return 'Airbnb';
  if (s.includes('booking')) return 'Booking.com';
  if (s.includes('nocowanie')) return 'Nocowanie';
  return 'Bezpośrednie';
};

function Delta({ curr, prev, ppMode, label }) {
  if (prev === null || prev === undefined) return <span className="wpd-delta wpd-delta--flat">— brak danych porównania</span>;
  const diff = ppMode ? Math.round(curr - prev) : (prev > 0 ? Math.round(((curr - prev) / prev) * 100) : (curr > 0 ? 100 : 0));
  const dir = diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat';
  const Icon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;
  return (
    <span className={`wpd-delta wpd-delta--${dir}`}>
      <Icon style={{ width: 12, height: 12 }} /> {diff > 0 ? '+' : ''}{diff}{ppMode ? ' pp' : '%'} {label}
    </span>
  );
}

function HBar({ name, dot, mainVal, sub, pct, color, shown, delay }) {
  return (
    <div className="wpd-hbar">
      <div className="wpd-hbar__head">
        <span className="wpd-hbar__name">{dot && <span className="wpd-dot" style={{ background: dot }} />}{name}</span>
        <span className="wpd-hbar__val"><b>{mainVal}</b>{sub ? ` · ${sub}` : ''}</span>
      </div>
      <div className="wpd-hbar__track">
        <div className="wpd-hbar__fill" style={{ width: `${pct}%`, background: color, transform: shown ? 'scaleX(1)' : 'scaleX(0)', transitionDelay: `${delay}ms` }} />
      </div>
    </div>
  );
}

function Trend({ buckets, prevBuckets, maxV, shown }) {
  return (
    <div className="wpd-trend__bars">
      {buckets.map((b, i) => {
        const h = Math.round((b.income / maxV) * 100);
        const hi = !prevBuckets && b.income === maxV && b.income > 0;
        const pv = prevBuckets ? prevBuckets[i] : null;
        const ph = pv ? Math.round((pv.income / maxV) * 100) : 0;
        return (
          <div className="wpd-trend__col" key={i}>
            <div className="wpd-trend__tip">
              {b.full}<br /><b>{fmt(b.income)} zł</b>{pv ? <> · rok temu <b>{fmt(pv.income)} zł</b></> : <> · zysk {fmt(b.profit)} zł</>}
            </div>
            <div className="wpd-trend__barwrap">
              {pv && <div className="wpd-trend__bar wpd-trend__bar--ghost" style={{ height: `${Math.max(0, ph)}%`, transform: shown ? 'scaleY(1)' : 'scaleY(0)', transitionDelay: `${Math.min(i * 22, 400)}ms` }} />}
              <div className={`wpd-trend__bar${hi ? ' wpd-trend__bar--hi' : ''}`}
                style={{ height: `${Math.max(2, h)}%`, background: prevBuckets ? 'var(--cynober)' : undefined, transform: shown ? 'scaleY(1)' : 'scaleY(0)', transitionDelay: `${Math.min(i * 22, 400)}ms` }} />
            </div>
            <span className="wpd-trend__x">{b.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function Report({ data, compareLabel, yoy }) {
  const { cur, prev } = data;
  // animacja liczb i wejścia sekcji — wspólny wzorzec panelu (hook wyciągnięty stąd)
  const { progress, shown } = useCountUp();

  return (
    <>
      <div className={`wpd-kpi wpd-rise${shown ? ' is-in' : ''}`}>
        <div className="wpd-stat" style={{ cursor: 'default' }}>
          <div className="wpd-stat__head"><p className="wpd-stat__label">Przychód</p><span className="wpd-stat__ic"><Banknote /></span></div>
          <div className="wpd-stat__value">{fmt(cur.income * progress)} <small>zł</small></div>
          <div className="wpd-stat__foot"><Delta curr={cur.income} prev={prev?.income} label={compareLabel} /></div>
        </div>
        <div className="wpd-stat wpd-stat--dark" style={{ cursor: 'default' }}>
          <div className="wpd-stat__head"><p className="wpd-stat__label">Zysk netto</p><span className="wpd-stat__ic"><Wallet /></span></div>
          <div className="wpd-stat__value">{fmt(cur.profit * progress)} <small>zł</small></div>
          <div className="wpd-stat__foot"><Delta curr={cur.profit} prev={prev?.profit} label={compareLabel} /></div>
        </div>
        <div className="wpd-stat" style={{ cursor: 'default' }}>
          <div className="wpd-stat__head"><p className="wpd-stat__label">Obłożenie</p><span className="wpd-stat__ic"><PieChart /></span></div>
          <div className="wpd-stat__value">{Math.round(cur.occ * progress)}<small>%</small></div>
          <div className="wpd-stat__foot"><Delta curr={cur.occ} prev={prev?.occ} ppMode label={compareLabel} /></div>
        </div>
        <div className="wpd-stat" style={{ cursor: 'default' }}>
          <div className="wpd-stat__head"><p className="wpd-stat__label">Śr. cena / noc</p><span className="wpd-stat__ic"><Tag /></span></div>
          <div className="wpd-stat__value">{fmt(cur.avgRate * progress)} <small>zł</small></div>
          <div className="wpd-stat__foot"><Delta curr={cur.avgRate} prev={prev?.avgRate} label={compareLabel} /></div>
        </div>
      </div>

      <div className={`wpd-section wpd-panel wpd-rise${shown ? ' is-in' : ''}`} style={{ transitionDelay: '60ms' }}>
        <div className="wpd-trend__head">
          <h2 className="wpd-h2" style={{ fontSize: 15 }}>Przychód w okresie</h2>
          <div className="wpd-trend__legend">
            {yoy ? (
              <>
                <span className="wpd-trend__leg"><span className="wpd-dot" style={{ background: 'var(--cynober)' }} /> Bieżący</span>
                <span className="wpd-trend__leg"><span className="wpd-dot" style={{ background: 'transparent', border: '1px dashed var(--faint)' }} /> Rok temu</span>
              </>
            ) : (
              <>
                <span className="wpd-trend__leg"><span className="wpd-dot" style={{ background: 'var(--cynober)' }} /> Najlepszy</span>
                <span className="wpd-trend__leg"><span className="wpd-dot" style={{ background: 'var(--inner-2)' }} /> Pozostałe</span>
              </>
            )}
          </div>
        </div>
        <div className="wpd-trend__body"><Trend buckets={data.buckets} prevBuckets={data.prevBuckets} maxV={data.maxV} shown={shown} /></div>
      </div>

      <div className={`wpd-section wpd-grid-2 wpd-rise${shown ? ' is-in' : ''}`} style={{ transitionDelay: '120ms' }}>
        <div className="wpd-panel">
          <div className="wpd-panel__head"><h2 className="wpd-h2" style={{ fontSize: 15 }}>Przychód wg kanału</h2></div>
          <div style={{ padding: '10px 18px 16px' }}>
            {data.channels.length === 0 && <p className="wpd-body" style={{ color: 'var(--faint)', margin: '10px 0' }}>Brak przychodu w tym okresie.</p>}
            {data.channels.map((c, i) => (
              <HBar key={c.name} name={c.name} mainVal={`${c.pct}%`} sub={`${fmt(c.val)} zł`} pct={c.pct} color={c.color} shown={shown} delay={i * 60} />
            ))}
          </div>
        </div>
        <div className="wpd-panel">
          <div className="wpd-panel__head"><h2 className="wpd-h2" style={{ fontSize: 15 }}>Ranking obiektów</h2></div>
          <div style={{ padding: '10px 18px 16px' }}>
            {data.propsRank.filter((p) => p.income > 0).length === 0 && <p className="wpd-body" style={{ color: 'var(--faint)', margin: '10px 0' }}>Brak rezerwacji w tym okresie.</p>}
            {data.propsRank.filter((p) => p.income > 0).map((p, i) => (
              <HBar key={p.name} name={p.name} dot={p.color} mainVal={`${fmt(p.income)} zł`} sub={`${p.occ}% obł.`} pct={p.pct} color={p.color} shown={shown} delay={i * 60} />
            ))}
          </div>
        </div>
      </div>

      <div className={`wpd-section wpd-stats wpd-rise${shown ? ' is-in' : ''}`} style={{ gridTemplateColumns: 'repeat(4,1fr)', transitionDelay: '180ms' }}>
        {[
          { icon: <CalendarDays />, label: 'Rezerwacje', val: fmt(cur.bookings) },
          { icon: <Moon />, label: 'Noce zarezerwowane', val: fmt(cur.nights) },
          { icon: <Clock />, label: 'Śr. długość pobytu', val: `${cur.avgStay.toFixed(1).replace('.', ',')} nocy` },
          { icon: <Wallet />, label: 'Koszty + podatek', val: `${fmt(cur.cost + cur.tax)} zł` },
        ].map((s) => (
          <div className="wpd-stat" key={s.label} style={{ cursor: 'default', minHeight: 0 }}>
            <div className="wpd-stat__head"><p className="wpd-stat__label">{s.label}</p><span className="wpd-stat__ic">{s.icon}</span></div>
            <div className="wpd-stat__value" style={{ fontSize: 22 }}>{s.val}</div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function AnalyticsView({ rentals, properties, selectedYear, setSelectedYear, user }) {
  const year = parseInt(selectedYear, 10);
  const [periodType, setPeriodType] = useState('month');
  const [anchorMonth, setAnchorMonth] = useState(() => new Date().getMonth());
  const [rangeFrom, setRangeFrom] = useState(`${year}-08-15`);
  const [rangeTo, setRangeTo] = useState(`${year}-12-24`);
  const [compareMode, setCompareMode] = useState('prev'); // 'prev' | 'yoy'
  const [allRentals, setAllRentals] = useState(null);


  // Pełna historia rezerwacji (poza rocznym zakresem kontekstu) — dla zakresów i porównań YoY
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getDocs(collection(db, 'users', user.uid, 'rentals'))
      .then((snap) => { if (!cancelled) setAllRentals(snap.docs.map((d) => ({ id: d.id, ...d.data() }))); })
      .catch((e) => console.error('Analityka: nie udało się pobrać pełnej historii:', e));
    return () => { cancelled = true; };
  }, [user]);

  const source = allRentals ?? rentals;

  const data = useMemo(() => {
    // ── Zakres bieżący + granulacja ──
    let start, end, gran, label;
    if (periodType === 'range') {
      let s = new Date(`${rangeFrom}T00:00:00`); let e = new Date(`${rangeTo}T00:00:00`);
      if (isNaN(s.getTime()) || isNaN(e.getTime())) { s = new Date(year, 0, 1); e = new Date(year, 11, 31); }
      if (s > e) { const t = s; s = e; e = t; }
      start = s; end = e;
      gran = (Math.round((end - start) / 86400000) + 1) <= 62 ? 'day' : 'month';
      label = `${fmtDate(start)} – ${fmtDate(end)}`;
    } else if (periodType === 'year') { start = new Date(year, 0, 1); end = new Date(year, 11, 31); gran = 'month'; label = `Rok ${year}`; }
    else if (periodType === 'half') { const h = Math.floor(anchorMonth / 6); start = new Date(year, h * 6, 1); end = new Date(year, h * 6 + 5, lastDay(year, h * 6 + 5)); gran = 'month'; label = `${h === 0 ? 'I' : 'II'} półrocze ${year}`; }
    else if (periodType === 'quarter') { const q = Math.floor(anchorMonth / 3); start = new Date(year, q * 3, 1); end = new Date(year, q * 3 + 2, lastDay(year, q * 3 + 2)); gran = 'month'; label = `Kw. ${q + 1} ${year}`; }
    else { start = new Date(year, anchorMonth, 1); end = new Date(year, anchorMonth, lastDay(year, anchorMonth)); gran = 'day'; label = `${MONTHS[anchorMonth]} ${year}`; }

    // ── Zakres porównania ──
    let prevStart, prevEnd, prevLabel;
    if (compareMode === 'yoy') {
      prevStart = new Date(start); prevStart.setFullYear(prevStart.getFullYear() - 1);
      prevEnd = new Date(end); prevEnd.setFullYear(prevEnd.getFullYear() - 1);
      prevLabel = 'r/r';
    } else if (periodType === 'range') {
      const span = Math.round((end - start) / 86400000) + 1;
      prevEnd = new Date(start); prevEnd.setDate(prevEnd.getDate() - 1);
      prevStart = new Date(prevEnd); prevStart.setDate(prevStart.getDate() - (span - 1));
      prevLabel = 'vs poprz.';
    } else if (periodType === 'year') { prevStart = new Date(year - 1, 0, 1); prevEnd = new Date(year - 1, 11, 31); prevLabel = 'vs poprz.'; }
    else if (periodType === 'half') { const h = Math.floor(anchorMonth / 6); prevStart = new Date(year, (h - 1) * 6, 1); prevEnd = new Date(year, (h - 1) * 6 + 5, lastDay(year, (h - 1) * 6 + 5)); prevLabel = 'vs poprz.'; }
    else if (periodType === 'quarter') { const q = Math.floor(anchorMonth / 3); prevStart = new Date(year, (q - 1) * 3, 1); prevEnd = new Date(year, (q - 1) * 3 + 2, lastDay(year, (q - 1) * 3 + 2)); prevLabel = 'vs poprz.'; }
    else { prevStart = new Date(year, anchorMonth - 1, 1); prevEnd = new Date(year, anchorMonth - 1, lastDay(year, anchorMonth - 1)); prevLabel = 'vs poprz.'; }

    const sTs = new Date(start).setHours(0, 0, 0, 0);
    const eTs = new Date(end).setHours(0, 0, 0, 0);
    const days = Math.round((eTs - sTs) / 86400000) + 1;
    const psTs = new Date(prevStart).setHours(0, 0, 0, 0);
    const peTs = new Date(prevEnd).setHours(0, 0, 0, 0);
    const pdays = Math.round((peTs - psTs) / 86400000) + 1;

    const core = (startTs, endTs, nDays) => {
      let income = 0, cost = 0, tax = 0, nights = 0, bookings = 0, stay = 0;
      source.forEach((r) => {
        if (!r.date) return;
        const d = new Date(r.date).setHours(0, 0, 0, 0);
        const inP = d >= startTs && d <= endTs;
        if (inP) { income += Number(r.income) || 0; cost += (Number(r.commission) || 0) + (Number(r.utilities) || 0); tax += (Number(r.tax) || 0) + (Number(r.vat) || 0); }
        if (r.type === 'booking') {
          const s = new Date(r.date).setHours(0, 0, 0, 0);
          const e = new Date(r.endDate || r.date).setHours(0, 0, 0, 0);
          if (!(e < startTs || s > endTs)) nights += Math.max(1, Math.round((Math.min(e, endTs) - Math.max(s, startTs)) / 86400000));
          if (inP) { bookings += 1; stay += Math.max(1, Math.round((e - s) / 86400000) || 1); }
        }
      });
      const occ = properties.length ? Math.min(100, Math.round((nights / (properties.length * nDays)) * 100)) : 0;
      return { income, cost, tax, profit: income - cost - tax, nights, bookings, occ, avgRate: nights ? Math.round(income / nights) : 0, avgStay: bookings ? stay / bookings : 0 };
    };

    const cur = core(sTs, eTs, days);
    const prev = core(psTs, peTs, pdays);

    // ── Kubełki trendu ──
    const buildBuckets = (bStartTs, bEndTs, g) => {
      const arr = [];
      if (g === 'day') {
        const n = Math.round((bEndTs - bStartTs) / 86400000) + 1;
        for (let i = 0; i < n; i++) { const d = new Date(bStartTs); d.setDate(d.getDate() + i); arr.push({ income: 0, cost: 0, tax: 0, label: String(d.getDate()).padStart(2, '0'), full: `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}` }); }
      } else {
        const bs = new Date(bStartTs); const be = new Date(bEndTs);
        const multiYr = be.getFullYear() !== bs.getFullYear();
        let d = new Date(bs.getFullYear(), bs.getMonth(), 1);
        const endM = be.getFullYear() * 12 + be.getMonth();
        while (d.getFullYear() * 12 + d.getMonth() <= endM) {
          arr.push({ income: 0, cost: 0, tax: 0, label: MONTHS_SHORT[d.getMonth()] + (multiYr ? ` '${String(d.getFullYear()).slice(2)}` : ''), full: `${MONTHS[d.getMonth()]} ${d.getFullYear()}` });
          d = new Date(d.getFullYear(), d.getMonth() + 1, 1);
        }
      }
      return arr;
    };
    const idxOf = (dTs, bStartTs, g) => {
      if (g === 'day') return Math.round((dTs - bStartTs) / 86400000);
      const d = new Date(dTs); const s = new Date(bStartTs);
      return (d.getFullYear() * 12 + d.getMonth()) - (s.getFullYear() * 12 + s.getMonth());
    };

    const buckets = buildBuckets(sTs, eTs, gran);
    const prevBuckets = compareMode === 'yoy' ? buildBuckets(psTs, peTs, gran) : null;
    const byChannel = {}; const byProp = {};
    properties.forEach((p) => { byProp[p.name] = { income: 0, nights: 0, color: p.color }; });

    source.forEach((r) => {
      if (!r.date) return;
      const dTs = new Date(r.date).setHours(0, 0, 0, 0);
      if (dTs >= sTs && dTs <= eTs) {
        const bi = idxOf(dTs, sTs, gran);
        if (buckets[bi]) { buckets[bi].income += Number(r.income) || 0; buckets[bi].cost += (Number(r.commission) || 0) + (Number(r.utilities) || 0); buckets[bi].tax += (Number(r.tax) || 0) + (Number(r.vat) || 0); }
        if (r.type === 'booking') {
          const inc = Number(r.income) || 0;
          if (inc > 0) { const k = channelLabel(r.source); byChannel[k] = (byChannel[k] || 0) + inc; }
          const pn = typeof r.property === 'object' ? r.property?.name : r.property;
          if (byProp[pn]) { byProp[pn].income += inc; const e = new Date(r.endDate || r.date).setHours(0, 0, 0, 0); byProp[pn].nights += Math.max(1, Math.round((e - dTs) / 86400000) || 1); }
        }
      }
      if (prevBuckets && dTs >= psTs && dTs <= peTs) {
        const bi = idxOf(dTs, psTs, gran);
        if (prevBuckets[bi]) prevBuckets[bi].income += Number(r.income) || 0;
      }
    });
    buckets.forEach((b) => { b.profit = b.income - b.cost - b.tax; });

    const curMax = Math.max(1, ...buckets.map((b) => b.income));
    const prevMax = prevBuckets ? Math.max(1, ...prevBuckets.map((b) => b.income)) : 0;
    const maxV = Math.max(curMax, prevMax);

    const chTotal = Object.values(byChannel).reduce((a, b) => a + b, 0) || 1;
    const channels = Object.entries(byChannel).map(([name, val]) => ({ name, val, pct: Math.round((val / chTotal) * 100), color: channelColor(name) })).sort((a, b) => b.val - a.val);
    const maxProp = Math.max(1, ...Object.values(byProp).map((p) => p.income));
    const propsRank = Object.entries(byProp).map(([name, p]) => ({ name, income: p.income, occ: properties.length ? Math.min(100, Math.round((p.nights / days) * 100)) : 0, pct: Math.round((p.income / maxProp) * 100), color: propHex(p.color) })).sort((a, b) => b.income - a.income).slice(0, 6);

    return { cur, prev, buckets, prevBuckets, maxV, channels, propsRank, label, prevLabel };
  }, [source, properties, year, periodType, anchorMonth, rangeFrom, rangeTo, compareMode]);

  const shift = (dir) => {
    if (periodType === 'year') { setSelectedYear(String(year + dir)); return; }
    const stepMap = { month: 1, quarter: 3, half: 6 };
    let m = anchorMonth + dir * stepMap[periodType];
    if (m < 0) { setSelectedYear(String(year - 1)); m += 12; }
    else if (m > 11) { setSelectedYear(String(year + 1)); m -= 12; }
    setAnchorMonth(m);
  };

  const { cur } = data;
  const empty = cur.income === 0 && cur.cost === 0 && cur.bookings === 0;
  const yoy = compareMode === 'yoy';
  const periodKey = `${year}-${periodType}-${anchorMonth}-${compareMode}-${rangeFrom}-${rangeTo}`;

  return (
    <>
      <div className="wpd-anl-bar">
        <div className="wpd-seg">
          {PERIODS.map(([val, lbl]) => (
            <button key={val} className={`wpd-seg__btn${periodType === val ? ' wpd-seg__btn--active' : ''}`} onClick={() => setPeriodType(val)}>{lbl}</button>
          ))}
        </div>

        {periodType === 'range' ? (
          <div className="wpd-date">
            <input type="date" value={rangeFrom} onChange={(e) => setRangeFrom(e.target.value)} />
            <span className="wpd-date__sep">→</span>
            <input type="date" value={rangeTo} onChange={(e) => setRangeTo(e.target.value)} />
          </div>
        ) : (
          <div className="wpd-step">
            <button className="wpd-step__btn" onClick={() => shift(-1)} title="Poprzedni okres"><ChevronLeft /></button>
            <span className="wpd-step__label"><small>Okres</small>{data.label}</span>
            <button className="wpd-step__btn" onClick={() => shift(1)} title="Następny okres"><ChevronRight /></button>
          </div>
        )}

        <div className="wpd-anl-bar__sp" />
        {allRentals === null && <span className="wpd-anl-load"><span className="wpd-spin wpd-spin--xs" /> Wczytuję historię</span>}
        <div className="wpd-seg">
          <button className={`wpd-seg__btn${compareMode === 'prev' ? ' wpd-seg__btn--active' : ''}`} onClick={() => setCompareMode('prev')}>Poprzedni okres</button>
          <button className={`wpd-seg__btn${compareMode === 'yoy' ? ' wpd-seg__btn--active' : ''}`} onClick={() => setCompareMode('yoy')}>Rok do roku</button>
        </div>
      </div>

      {empty ? (
        <div className="wpd-soon"><div className="wpd-soon__card" style={{ textAlign: 'center' }}>
          <ClipboardList style={{ width: 26, height: 26, color: 'var(--faint)', margin: '0 auto 10px', display: 'block' }} />
          <p className="wpd-h2" style={{ fontSize: 16, marginBottom: 6 }}>Brak danych za ten okres</p>
          <p style={{ color: 'var(--muted)', fontSize: 13, margin: 0 }}>Wybierz inny okres lub zakres dat, aby zobaczyć statystyki.</p>
        </div></div>
      ) : (
        <Report key={periodKey} data={data} compareLabel={data.prevLabel} yoy={yoy} />
      )}
    </>
  );
}
