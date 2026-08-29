import React, { useMemo, useState } from 'react';
import { plural } from '../utils/plural';

/*
  Mini kalendarz z zajętością obiektu — wzorzec z modułu Zadania
  (design_handoff_zadania/README.md, „Mini kalendarz"). To zarazem propozycja
  docelowego wyboru daty dla całego panelu (dziś input type=date); wymiana
  w innych widokach jest POZA partią 1 — na razie żyje w QuickTaskPopover.

  busyFor(dateStr) → null | { guest, nights, price } — zajętość dnia dostarcza
  wołający (w module liczy ją useTasksBoard z rezerwacji obiektu).
*/

// Święta o stałej dacie (klucz 'MM-DD'). Ruchome (Wielkanoc, Boże Ciało...) świadomie
// pominięte w tej partii — wymagałyby liczenia Paschy, a kalendarz ma tylko sygnalizować.
const HOLIDAYS = {
  '01-01': 'Nowy Rok', '01-06': 'Trzech Króli', '05-01': 'Święto Pracy',
  '05-03': 'Święto Konstytucji 3 Maja', '08-15': 'Wniebowzięcie NMP',
  '11-01': 'Wszystkich Świętych', '11-11': 'Święto Niepodległości',
  '12-25': 'Boże Narodzenie', '12-26': 'Drugi dzień świąt',
};
const DOWS = ['PN', 'WT', 'ŚR', 'CZ', 'PT', 'SB', 'ND'];
const DOW_PL = ['poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota', 'niedziela'];

const dayStr = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

export default function WpdDatePicker({ value, onChange, propertyName, busyFor, busyColor, todayStr }) {
  const [hover, setHover] = useState(null);

  const base = useMemo(() => {
    const src = value || todayStr;
    const [y, m] = String(src || '').split('-').map(Number);
    return y && m ? { y, m: m - 1 } : { y: new Date().getFullYear(), m: new Date().getMonth() };
  }, [value, todayStr]);

  const monthLabel = useMemo(() => {
    const raw = new Date(base.y, base.m, 1).toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, [base]);

  const daysInMonth = new Date(base.y, base.m + 1, 0).getDate();
  const firstDow = (new Date(base.y, base.m, 1).getDay() + 6) % 7; // tydzień od poniedziałku

  const cells = [];
  for (let i = 0; i < firstDow; i += 1) cells.push(null);
  for (let n = 1; n <= daysInMonth; n += 1) {
    const key = dayStr(base.y, base.m, n);
    const mmdd = key.slice(5);
    const dow = (firstDow + n - 1) % 7;
    cells.push({
      n, key, busy: busyFor ? busyFor(key) : null,
      holiday: HOLIDAYS[mmdd] || null, weekend: dow >= 5,
      today: key === todayStr, selected: key === value, dow,
    });
  }

  const hintKey = hover || value;
  const hint = useMemo(() => {
    if (!hintKey || hintKey.slice(0, 7) !== `${base.y}-${String(base.m + 1).padStart(2, '0')}`) {
      return 'Wybierz dzień, żeby zobaczyć zajętość obiektu.';
    }
    const n = Number(hintKey.slice(8));
    const dow = (firstDow + n - 1) % 7;
    const busy = busyFor ? busyFor(hintKey) : null;
    const holiday = HOLIDAYS[hintKey.slice(5)];
    // day+month razem: Intl daje wtedy dopełniacz („24 sierpnia"); sam month:'long'
    // dawał mianownik („24 sierpień") — przegląd code-reviewera
    const dayMonth = new Date(base.y, base.m, n).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' });
    let s = `${dayMonth} · ${DOW_PL[dow]}${holiday ? ` · ${holiday}` : ''}`;
    s += busy
      ? ` — zajęte: ${busy.guest}, ${busy.nights} ${plural(busy.nights, ['noc', 'noce', 'nocy'])}, ${Number(busy.price).toLocaleString('pl-PL')} zł`
      : ' — wolne';
    return s;
  }, [hintKey, base, firstDow, busyFor]);

  return (
    <div className="wpd-tk-cal">
      <div className="wpd-tk-cal__head">
        <span className="wpd-tk-cal__month">{monthLabel}</span>
        {propertyName && <span className="wpd-tk-cal__propname">{propertyName}</span>}
        <span className="wpd-tk-cal__leg"><span className="wpd-tk-cal__legsw" />zajęte</span>
      </div>
      <div className="wpd-tk-cal__dows">
        {DOWS.map((d, i) => (
          <span key={d} className={`wpd-tk-cal__dow${i >= 5 ? ' wpd-tk-cal__dow--we' : ''}`}>{d}</span>
        ))}
      </div>
      <div className="wpd-tk-cal__grid">
        {cells.map((c, i) => (c === null
          ? <span key={`pad-${i}`} className="wpd-tk-cal__day wpd-tk-cal__day--pad" aria-hidden="true" />
          : (
            <button type="button" key={c.key}
              className={['wpd-tk-cal__day',
                c.busy ? 'wpd-tk-cal__day--busy' : '',
                c.today ? 'wpd-tk-cal__day--today' : '',
                c.selected ? 'wpd-tk-cal__day--on' : '',
                c.holiday ? 'wpd-tk-cal__day--holiday' : c.weekend ? 'wpd-tk-cal__day--we' : '',
              ].filter(Boolean).join(' ')}
              style={c.today || c.selected ? { fontWeight: 600 } : undefined}
              title={c.busy ? `${c.busy.guest} · ${c.busy.nights} ${plural(c.busy.nights, ['noc', 'noce', 'nocy'])} · ${Number(c.busy.price).toLocaleString('pl-PL')} zł` : undefined}
              onMouseEnter={() => setHover(c.key)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(c.key)}
              onBlur={() => setHover(null)}
              onClick={() => onChange(c.key)}>
              {c.n}
              {c.busy && <span className="wpd-tk-cal__busybar" style={{ background: busyColor || 'var(--faint)' }} />}
            </button>
          )))}
      </div>
      <p className="wpd-tk-cal__hint">{hint}</p>
    </div>
  );
}
