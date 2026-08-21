import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, CalendarCheck, Moon, Clock, Plus } from 'lucide-react';
import { channelColor, channelTone } from '../styles';
import { clickableProps } from '../../../utils/a11y';
import { useCountUp } from '../useCountUp';

const WD = ['nd', 'pn', 'wt', 'śr', 'cz', 'pt', 'sb'];
const fmt = (n) => new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(Math.round(Number(n) || 0));
const surname = (guest) => {
  if (!guest) return 'Rezerwacja';
  const parts = guest.trim().split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1] : guest;
};
const iso = (y, m, day) => `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

/*
  Kalendarz (02) — wzorzec: ekran 03-app2. Timeline/gantt: obiekty w wierszach,
  dni miesiąca w kolumnach, rezerwacje jako paski wg kanału. Pod spodem 3 metryki.

  X22 (uwaga testera 2026-08-21): wolne komórki są klikalne — klik = jedna noc,
  przeciągnięcie = zakres. Formularz otwiera się z wypełnionym obiektem i datami.
  X23: filtr obiektu w nagłówku; obejmuje TAKŻE metryki pod kalendarzem, inaczej
  po zawężeniu do jednego domku „wolne noce" liczyłyby się z całego portfela.
*/
export default function CalendarView({
  calendarDate, rentals, properties, onPrev, onNext, onToday, onEditRental,
  selectedProperty = 'all', onChangeProperty, onCreateBooking,
}) {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const cols = `repeat(${daysInMonth}, minmax(30px, 1fr))`;

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const isThisMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayNum = today.getDate();
  const monthLabel = calendarDate.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });

  // X23: filtr obiektu. Nieznana nazwa (obiekt skasowany) → wracamy do wszystkich.
  const visibleProperties = useMemo(() => (
    selectedProperty === 'all' || !properties.some((p) => p.name === selectedProperty)
      ? properties
      : properties.filter((p) => p.name === selectedProperty)
  ), [properties, selectedProperty]);

  // Rezerwacje obiektu w obrębie miesiąca → pozycje pasków
  const barsByProp = useMemo(() => {
    const y = calendarDate.getFullYear(); const m = calendarDate.getMonth();
    const dim = new Date(y, m + 1, 0).getDate();
    const mStart = new Date(y, m, 1).setHours(0, 0, 0, 0);
    const mEnd = new Date(y, m, dim).setHours(0, 0, 0, 0);
    const map = {};
    visibleProperties.forEach((p) => { map[p.name] = []; });
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
  }, [rentals, visibleProperties, calendarDate]);

  /* Dni ZAJĘTE w każdym obiekcie — dokładnie te kolumny, które zakrywa pasek.
     Dzień wyjazdu zostaje wolny (back-to-back), więc da się z niego zacząć nową
     rezerwację; z kalendarza nie da się natomiast zrobić dubla na zajętej nocy. */
  const busyByProp = useMemo(() => {
    const map = {};
    Object.entries(barsByProp).forEach(([name, bars]) => {
      const busy = new Set();
      bars.forEach(({ startNum, endNum, clipEnd }) => {
        const last = clipEnd ? endNum : Math.max(endNum, startNum + 1) - 1;
        for (let d = startNum; d <= last; d++) busy.add(d);
      });
      map[name] = busy;
    });
    return map;
  }, [barsByProp]);

  // Zaznaczanie zakresu myszą: { prop, from, to }
  const [drag, setDrag] = useState(null);

  const startDrag = useCallback((propName, day) => {
    if (busyByProp[propName]?.has(day)) return;
    setDrag({ prop: propName, from: day, to: day });
  }, [busyByProp]);

  // Zaznaczenie nie przejeżdża przez zajęte dni — obcinamy je na ostatnim wolnym.
  const extendDrag = useCallback((propName, day) => {
    setDrag((d) => {
      if (!d || d.prop !== propName) return d;
      const busy = busyByProp[propName];
      const step = day >= d.from ? 1 : -1;
      let to = d.from;
      for (let x = d.from; step > 0 ? x <= day : x >= day; x += step) {
        if (busy?.has(x)) break;
        to = x;
      }
      return { ...d, to };
    });
  }, [busyByProp]);

  useEffect(() => {
    if (!drag) return undefined;
    const finish = () => {
      const from = Math.min(drag.from, drag.to); const to = Math.max(drag.from, drag.to);
      setDrag(null);
      // ostatnia zaznaczona noc + 1 = dzień wyjazdu (tak samo, jak kalendarz rysuje paski)
      const end = new Date(year, month, to + 1);
      onCreateBooking?.(drag.prop, iso(year, month, from), iso(end.getFullYear(), end.getMonth(), end.getDate()));
    };
    const cancel = () => setDrag(null); // przewijanie palcem po siatce nie zakłada rezerwacji
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', cancel);
    return () => { window.removeEventListener('pointerup', finish); window.removeEventListener('pointercancel', cancel); };
  }, [drag, year, month, onCreateBooking]);

  // Ścieżka klawiaturowa (X22): przycisk przy nazwie obiektu. 31 komórek × N obiektów
  // jako osobne przystanki tabulatora byłoby lekarstwem gorszym od choroby.
  const addForProperty = (propName) => {
    const start = isThisMonth ? todayNum : 1;
    const end = new Date(year, month, start + 1);
    onCreateBooking?.(propName, iso(year, month, start), iso(end.getFullYear(), end.getMonth(), end.getDate()));
  };

  const isSelected = (propName, day) => (
    drag?.prop === propName && day >= Math.min(drag.from, drag.to) && day <= Math.max(drag.from, drag.to)
  );

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
    const capacity = visibleProperties.length * dim;
    return {
      count,
      free: Math.max(0, capacity - bookedNights),
      avg: count ? (totalNights / count).toFixed(1).replace('.', ',') : '0',
    };
  }, [barsByProp, visibleProperties.length, calendarDate]);

  // metryki miesiąca wjeżdżają jak w Analityce — wspólny progress
  const { progress } = useCountUp();

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
          {properties.length > 1 && (
            <select className="wpd-select wpd-select--sm" aria-label="Filtruj po obiekcie"
              value={selectedProperty} onChange={(e) => onChangeProperty?.(e.target.value)}>
              <option value="all">Wszystkie obiekty</option>
              {properties.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
            </select>
          )}
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
            {visibleProperties.map((p) => (
              <div className="wpd-cal__row" key={p.name}>
                <div className="wpd-cal__label">
                  <div className="wpd-cal__objname">{p.name}</div>
                  <div className="wpd-cal__objsub">{p.address || p.city || '—'}</div>
                  <button type="button" className="wpd-cal__add" onClick={() => addForProperty(p.name)}
                    title={`Nowa rezerwacja — ${p.name}`} aria-label={`Nowa rezerwacja — ${p.name}`}><Plus /></button>
                </div>
                <div className="wpd-cal__track" style={{ gridTemplateColumns: cols }}>
                  {days.map((d, i) => {
                    const isToday = isThisMonth && d === todayNum;
                    const busy = busyByProp[p.name]?.has(d);
                    const sel = isSelected(p.name, d);
                    return (
                      <div key={d} style={{ gridColumn: i + 1 }}
                        className={`wpd-cal__daycell${isToday ? ' wpd-cal__daycell--today' : ''}${busy ? '' : ' wpd-cal__daycell--free'}${sel ? ' wpd-cal__daycell--sel' : ''}`}
                        title={busy ? undefined : `Nowa rezerwacja — ${p.name}, ${iso(year, month, d)}`}
                        onPointerDown={busy ? undefined : () => startDrag(p.name, d)}
                        onPointerEnter={busy ? undefined : () => extendDrag(p.name, d)} />
                    );
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
          <div className="wpd-stat__value">{Math.round(metrics.count * progress)}</div>
        </div>
        <div className="wpd-stat" style={{ cursor: 'default', minHeight: 0 }}>
          <div className="wpd-stat__head"><p className="wpd-stat__label">Wolnych nocy</p><span className="wpd-stat__ic"><Moon /></span></div>
          <div className="wpd-stat__value">{fmt(metrics.free * progress)}</div>
        </div>
        <div className="wpd-stat" style={{ cursor: 'default', minHeight: 0 }}>
          <div className="wpd-stat__head"><p className="wpd-stat__label">Śr. długość pobytu</p><span className="wpd-stat__ic"><Clock /></span></div>
          <div className="wpd-stat__value">{metrics.avg} <small>nocy</small></div>
        </div>
      </div>
    </>
  );
}
