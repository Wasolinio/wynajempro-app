import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, CalendarCheck, Moon, Clock } from 'lucide-react';
import { channelColor, channelTone } from '../styles';
import { clickableProps } from '../../../utils/a11y';

const WD = ['nd', 'pn', 'wt', 'śr', 'cz', 'pt', 'sb'];
const fmt = (n) => new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(Math.round(Number(n) || 0));
const surname = (guest) => {
  if (!guest) return 'Rezerwacja';
  const parts = guest.trim().split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1] : guest;
};

/*
  Kalendarz (02) — wzorzec: ekran 03-app2. Timeline/gantt: obiekty w wierszach,
  dni miesiąca w kolumnach, rezerwacje jako paski wg kanału. Pod spodem 3 metryki.
*/
export default function CalendarView({ calendarDate, rentals, properties, onPrev, onNext, onToday, onEditRental }) {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const cols = `repeat(${daysInMonth}, minmax(30px, 1fr))`;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const isThisMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayNum = today.getDate();
  const monthLabel = calendarDate.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });

  // Rezerwacje obiektu w obrębie miesiąca → pozycje pasków
  const barsByProp = useMemo(() => {
    const y = calendarDate.getFullYear(); const m = calendarDate.getMonth();
    const dim = new Date(y, m + 1, 0).getDate();
    const mStart = new Date(y, m, 1).setHours(0, 0, 0, 0);
    const mEnd = new Date(y, m, dim).setHours(0, 0, 0, 0);
    const map = {};
    properties.forEach((p) => { map[p.name] = []; });
    rentals.forEach((r) => {
      if (r.type !== 'booking' || !r.date) return;
      const propName = typeof r.property === 'object' ? r.property?.name : r.property;
      if (!(propName in map)) return;
      const s = new Date(r.date); s.setHours(0, 0, 0, 0);
      const e = new Date(r.endDate || r.date); e.setHours(0, 0, 0, 0);
      if (isNaN(s.getTime()) || e.getTime() < mStart || s.getTime() > mEnd) return;
      const startNum = s.getTime() < mStart ? 1 : s.getDate();
      const endNum = e.getTime() > mEnd ? dim : e.getDate();
      const clipEnd = e.getTime() > mEnd;
      map[propName].push({ r, startNum, endNum, clipEnd, propName });
    });
    return map;
  }, [rentals, properties, calendarDate]);

  // Metryki miesiąca
  const metrics = useMemo(() => {
    const dim = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 0).getDate();
    let count = 0, bookedNights = 0, totalNights = 0;
    Object.values(barsByProp).forEach((arr) => {
      arr.forEach(({ r, startNum, endNum }) => {
        count += 1;
        bookedNights += Math.max(1, endNum - startNum);
        const s = new Date(r.date); const e = new Date(r.endDate || r.date);
        totalNights += Math.max(1, Math.round((e - s) / 86400000) || 1);
      });
    });
    const capacity = properties.length * dim;
    return {
      count,
      free: Math.max(0, capacity - bookedNights),
      avg: count ? (totalNights / count).toFixed(1).replace('.', ',') : '0',
    };
  }, [barsByProp, properties.length, calendarDate]);

  return (
    <>
      <div className="wpd-panel">
        <div className="wpd-cal__head">
          <div className="wpd-cal__nav">
            <button className="wpd-cal__navbtn" onClick={onPrev} title="Poprzedni miesiąc"><ChevronLeft /></button>
            <button className="wpd-cal__navbtn" onClick={onNext} title="Następny miesiąc"><ChevronRight /></button>
          </div>
          <span className="wpd-cal__title">{monthLabel}</span>
          <button className="wpd-btn wpd-btn--sm" onClick={onToday}>Dziś</button>
          <div className="wpd-cal__legend">
            <span className="wpd-cal__leg"><span className="wpd-dot" style={{ background: 'var(--cynober)' }} /> Airbnb</span>
            <span className="wpd-cal__leg"><span className="wpd-dot" style={{ background: 'var(--granat)' }} /> Booking</span>
            <span className="wpd-cal__leg"><span className="wpd-dot" style={{ background: 'var(--amber)' }} /> Nocowanie</span>
            <span className="wpd-cal__leg"><span className="wpd-dot" style={{ background: 'var(--green)' }} /> Bezpośrednia</span>
          </div>
        </div>

        <div className="wpd-cal__scroll">
          <div className="wpd-cal__inner">
            {/* nagłówek dni */}
            <div className="wpd-cal__headrow">
              <div className="wpd-cal__corner" />
              <div className="wpd-cal__track" style={{ gridTemplateColumns: cols, gridAutoRows: 'auto' }}>
                {days.map((d, i) => {
                  const isToday = isThisMonth && d === todayNum;
                  return (
                    <div key={d} className={`wpd-cal__dnum${isToday ? ' wpd-cal__dnum--today' : ''}`} style={{ gridColumn: i + 1 }}>
                      <b>{String(d).padStart(2, '0')}</b>
                      <span>{WD[new Date(year, month, d).getDay()]}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* wiersze obiektów */}
            {properties.map((p) => (
              <div className="wpd-cal__row" key={p.name}>
                <div className="wpd-cal__label">
                  <div className="wpd-cal__objname">{p.name}</div>
                  <div className="wpd-cal__objsub">{p.address || p.city || '—'}</div>
                </div>
                <div className="wpd-cal__track" style={{ gridTemplateColumns: cols }}>
                  {days.map((d, i) => {
                    const isToday = isThisMonth && d === todayNum;
                    return <div key={d} className={`wpd-cal__daycell${isToday ? ' wpd-cal__daycell--today' : ''}`} style={{ gridColumn: i + 1 }} />;
                  })}
                  {barsByProp[p.name]?.map(({ r, startNum, endNum, clipEnd }) => (
                    <div key={r.id} className="wpd-cal__bar"
                      style={{
                        /* gantt hotelowy: pasek = noce, dzień wyjazdu zostaje wolny pod przyjazd
                           back-to-back; rezerwacje jednodniowe i ucięte końcem miesiąca
                           zachowują pełną szerokość */
                        gridColumn: `${startNum} / ${clipEnd ? endNum + 1 : Math.max(endNum, startNum + 1)}`,
                        background: channelColor(r.source),
                        ...(channelTone(r.source) === 'amber' ? { color: 'var(--ink)' } : {}),
                      }}
                      title={`${r.guest || 'Rezerwacja'} · ${r.date}${r.endDate ? ` → ${r.endDate}` : ''}`}
                      {...clickableProps(() => onEditRental(r))}>
                      {surname(r.guest)}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {properties.length === 0 && (
              <div className="wpd-empty">
                <div className="wpd-empty__icon"><CalendarDays /></div>
                <p>Brak obiektów. Dodaj obiekt w Ustawieniach, aby zobaczyć kalendarz.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* metryki pod kalendarzem */}
      <div className="wpd-section wpd-stats" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className="wpd-stat" style={{ cursor: 'default', minHeight: 0 }}>
          <div className="wpd-stat__head"><p className="wpd-stat__label">Rezerwacje w tym mies.</p><span className="wpd-stat__ic"><CalendarCheck /></span></div>
          <div className="wpd-stat__value">{metrics.count}</div>
        </div>
        <div className="wpd-stat" style={{ cursor: 'default', minHeight: 0 }}>
          <div className="wpd-stat__head"><p className="wpd-stat__label">Wolnych nocy</p><span className="wpd-stat__ic"><Moon /></span></div>
          <div className="wpd-stat__value">{fmt(metrics.free)}</div>
        </div>
        <div className="wpd-stat" style={{ cursor: 'default', minHeight: 0 }}>
          <div className="wpd-stat__head"><p className="wpd-stat__label">Śr. długość pobytu</p><span className="wpd-stat__ic"><Clock /></span></div>
          <div className="wpd-stat__value">{metrics.avg} <small>nocy</small></div>
        </div>
      </div>
    </>
  );
}
