import { useMemo } from 'react';
import { taskDueDate, isTaskDue } from '../../../utils/taskSchedule';
import { propHex } from '../styles';

/*
  Selektor modułu Zadania (E3): scala TRZY źródła w jeden znormalizowany obraz
  (design_handoff_zadania/IMPLEMENTACJA.md §1):

  1. kolekcja `users/{uid}/tasks` — zadania ręczne (source: 'task'),
  2. zadania z szablonów — NIE są zapisywane, liczone w locie z templates × rentals
     jak dailyReport w ManagerApp; syntetyczne id `tpl:{rentalId}:{templateId}`,
     odhaczanie przez istniejące toggleDynamicTask (source: 'template'). Termin liczy
     WYŁĄCZNIE utils/taskSchedule (X20) — tu tylko konsumujemy taskDueDate/isTaskDue.
  3. LEGACY `rentals` z type:'reminder' — odczyt zgodnościowy do czasu migracji
     (partia 2); dedup z kolekcją tasks po kluczu text+date+propertyName
     (source: 'legacy', odhaczanie przez toggleStatus(id, 'isCompleted')).

  Zwraca (kontrakt z IMPLEMENTACJA.md §4):
  { sections, inbox, counters, axis, busyOn, filterOptions, visibleCount }
*/

const MONTHS_PL = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca',
  'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
const MONTHS_SHORT = ['STY', 'LUT', 'MAR', 'KWI', 'MAJ', 'CZE', 'LIP', 'SIE', 'WRZ', 'PAŹ', 'LIS', 'GRU'];
const DOW_SHORT = ['ND', 'PN', 'WT', 'ŚR', 'CZ', 'PT', 'SB'];
const DOW_PL = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];

// Daty WYŁĄCZNIE lokalnie (getFullYear/getMonth/getDate), nie toISOString —
// toISOString przesuwa dzień na UTC i o północy psuje wszystkie sekcje (pułapka §6).
export const localDayStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parseDay = (s) => {
  if (!s) return null;
  const [y, m, d] = String(s).split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};
const diffDays = (fromStr, toStr) => {
  const a = parseDay(fromStr); const b = parseDay(toStr);
  if (!a || !b) return null;
  return Math.round((b - a) / 86400000);
};
export const wordDate = (dateStr) => {
  const d = parseDay(dateStr);
  return d ? `${d.getDate()} ${MONTHS_PL[d.getMonth()]}` : '';
};
// „25 SIE · WT" — treść plakietki celu przy przeciąganiu (CSS robi uppercase)
export const axisDate = (dateStr) => {
  const d = parseDay(dateStr);
  return d ? `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} · ${DOW_SHORT[d.getDay()]}` : '';
};

const propName = (p) => (typeof p === 'object' ? p?.name : p);

export function useTasksBoard({ tasks, rentals, templates, properties, filter = 'all', today = null }) {
  return useMemo(() => {
    const now = today ? parseDay(today) : new Date();
    now.setHours(0, 0, 0, 0);
    const todayStr = localDayStr(now);

    /* ── okno 7 dni od dziś ── */
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now); d.setDate(d.getDate() + i);
      const dow = d.getDay();
      return {
        key: localDayStr(d), num: String(d.getDate()), dow: DOW_SHORT[dow],
        today: i === 0, weekend: dow === 0 || dow === 6,
        label: i === 0 ? 'Dziś' : i === 1 ? 'Jutro' : DOW_PL[dow].charAt(0).toUpperCase() + DOW_PL[dow].slice(1),
        sub: i <= 1 ? `${DOW_PL[dow]}, ${d.getDate()} ${MONTHS_PL[d.getMonth()]}` : `${d.getDate()} ${MONTHS_PL[d.getMonth()]}`,
      };
    });
    const rangeLabel = days[0].num === days[6].num ? '' : (() => {
      const a = parseDay(days[0].key); const b = parseDay(days[6].key);
      return a.getMonth() === b.getMonth()
        ? `${a.getDate()}–${b.getDate()} ${MONTHS_PL[a.getMonth()]}`
        : `${a.getDate()} ${MONTHS_PL[a.getMonth()]} – ${b.getDate()} ${MONTHS_PL[b.getMonth()]}`;
    })();

    /* ── kolory i kolejność obiektów ── */
    const propList = (properties || []).map((p) => ({ name: propName(p), color: propHex(p?.color) }))
      .filter((p) => p.name);
    const propColor = new Map(propList.map((p) => [p.name, p.color]));

    /* ── rezerwacje (do chipów, osi i kalendarza zajętości) ── */
    const bookings = (rentals || []).filter((r) => r.type === 'booking' && r.date);
    const rentalById = new Map(bookings.map((r) => [r.id, r]));

    /* ── 1. kolekcja tasks ── */
    const fromCollection = (tasks || []).map((t) => ({
      id: t.id, source: 'task', draggable: true,
      text: t.text || '', propertyName: t.propertyName || null,
      rentalId: t.rentalId || null, templateId: t.templateId || null,
      date: t.date || null, time: t.time || '', priority: t.priority || 'normalny',
      note: t.note || '', subtasks: t.subtasks || [], recurrence: t.recurrence || null,
      photos: t.photos || [], done: !!t.done,
    }));
    const dedupKeys = new Set(fromCollection.map((t) => `${t.text}|${t.date || ''}|${t.propertyName || ''}`));

    /* ── 2. zadania z szablonów, liczone w locie ── */
    const fromTemplates = [];
    bookings.forEach((r) => {
      const rPropName = propName(r.property) || null;
      (templates || []).forEach((t) => {
        const due = taskDueDate(r, t);
        if (!due) return;
        const dueStr = localDayStr(due);
        const isDone = !!(r.completedTasks?.[t.id] || (t.id === 'directions' && r.directionsSent) || (t.id === 'keycode' && r.keycodeSent));
        // przeszłość: to samo okno co pulpit (isTaskDue = do 30 dni po kotwicy, X20);
        // przyszłość: bez ograniczeń — rok i tak przycina subskrypcja rentals
        if (dueStr < todayStr && !isTaskDue(r, t, now)) return;
        fromTemplates.push({
          id: `tpl:${r.id}:${t.id}`, source: 'template', draggable: false,
          text: t.text || t.shortName || '', propertyName: rPropName,
          rentalId: r.id, templateId: t.id,
          date: dueStr, time: '', priority: 'normalny', note: '', subtasks: [],
          recurrence: null, photos: [], done: isDone,
        });
      });
    });

    /* ── 3. LEGACY rentals type:'reminder' (odczyt zgodnościowy; dedup jak §6) ── */
    const fromLegacy = (rentals || [])
      .filter((r) => r.type === 'reminder')
      .map((r) => ({
        id: r.id, source: 'legacy', draggable: true,
        text: r.text || 'Brak opisu', propertyName: propName(r.property) || null,
        rentalId: null, templateId: null,
        date: r.date || null, time: '', priority: 'normalny', note: '', subtasks: [],
        recurrence: null, photos: [], done: !!r.isCompleted,
      }))
      .filter((t) => !dedupKeys.has(`${t.text}|${t.date || ''}|${t.propertyName || ''}`));

    const all = [...fromCollection, ...fromTemplates, ...fromLegacy];

    /* ── wzbogacenie: zaległość + chip rezerwacji ── */
    const enrich = (t) => {
      const overdueDays = t.date && t.date < todayStr ? diffDays(t.date, todayStr) : 0;
      const rental = t.rentalId ? rentalById.get(t.rentalId) : null;
      return {
        ...t, overdueDays,
        guest: rental?.guest || '', rentalSource: rental?.source || '',
        propertyColor: t.propertyName ? (propColor.get(t.propertyName) || '#716951') : '#716951',
      };
    };
    const enriched = all.map(enrich);

    /* ── filtr obiektu ── */
    const inFilter = (t) => filter === 'all' || (t.propertyName || '') === filter;
    const dated = enriched.filter((t) => t.date && inFilter(t));

    /* ── sekcje: Zaległe → Dziś → Jutro → dni → Później ── */
    const groupBy = (list) => {
      const groups = propList.map((p) => ({
        property: p.name, color: p.color,
        tasks: list.filter((t) => t.propertyName === p.name),
      }));
      groups.push({ property: 'Bez obiektu', color: '#716951', tasks: list.filter((t) => !t.propertyName || !propColor.has(t.propertyName)) });
      return groups.filter((g) => g.tasks.length > 0);
    };

    const sections = [];
    const overdue = dated.filter((t) => t.overdueDays > 0);
    if (overdue.length) {
      sections.push({
        id: 'overdue', label: 'Zaległe', sub: `przed ${wordDate(todayStr)}`,
        tone: 'overdue', count: overdue.length, groups: groupBy(overdue),
      });
    }
    days.forEach((d) => {
      const inDay = dated.filter((t) => t.date === d.key);
      if (!inDay.length) return;
      sections.push({ id: d.key, label: d.label, sub: d.sub, tone: 'normal', count: inDay.length, groups: groupBy(inDay) });
    });
    const later = dated.filter((t) => t.date > days[6].key);
    if (later.length) {
      sections.push({
        id: 'later', label: 'Później', sub: `po ${wordDate(days[6].key)}`,
        tone: 'normal', count: later.length, groups: groupBy(later),
      });
    }

    /* ── skrzynka: bez daty (null = do przypisania), tylko z kolekcji/legacy ── */
    const inbox = enriched.filter((t) => !t.date && !t.done);

    /* ── liczniki ── */
    const counters = {
      remaining: enriched.filter((t) => !t.done).length,
      overdue: overdue.filter((t) => !t.done).length,
      today: enriched.filter((t) => t.date === todayStr && !t.done).length,
      inbox: inbox.length,
      done: enriched.filter((t) => t.done).length,
    };

    /* ── oś przypisania: 7 dni × obiekty ── */
    const rows = propList.map((p) => {
      const propBookings = bookings.filter((r) => propName(r.property) === p.name && r.endDate);
      const inWindow = propBookings
        .map((r) => ({ r, s: diffDays(todayStr, r.date), e: diffDays(todayStr, r.endDate) }))
        .filter(({ s, e }) => s !== null && e !== null && e >= 0 && s <= 6);
      const bars = inWindow.map(({ r, s, e }) => {
        // geometria z README: lewy brzeg w połowie dnia przyjazdu, prawy w połowie dnia
        // wyjazdu; przycięcie do 0/100%, gdy rezerwacja wystaje poza okno
        const left = s < 0 ? 0 : ((s + 0.5) / 7) * 100;
        const right = e > 6 ? 100 : ((e + 0.5) / 7) * 100;
        return {
          rentalId: r.id, guest: r.guest || 'Rezerwacja', source: r.source || '',
          propertyName: p.name, color: p.color,
          arrival: r.date, departure: r.endDate, sIdx: s, eIdx: e,
          left: `${left.toFixed(2)}%`, width: `${(right - left).toFixed(2)}%`,
          radius: s < 0 ? '0 3px 3px 0' : e > 6 ? '3px 0 0 3px' : '3px',
        };
      });
      const busy = new Set();
      inWindow.forEach(({ s, e }) => {
        for (let i = Math.max(0, s); i <= Math.min(6, e); i += 1) busy.add(i);
      });
      const cells = days.map((d, i) => ({ dayKey: d.key, busy: busy.has(i), weekend: d.weekend }));
      // surowy obiekt PO NAZWIE (nie po indeksie — wpis bez nazwy przesunąłby podpisy);
      // adres/miejscowość to pola opcjonalne, bez nich podpisu po prostu nie ma
      const raw = (properties || []).find((pp) => propName(pp) === p.name) || {};
      return { property: p.name, color: p.color, sub: raw.address || raw.city || '', bars, cells };
    });

    /* ── zajętość dnia (mini kalendarz w popoverze): noce jak w prototypie ── */
    const busyOn = (propertyNameArg, dateStr) => {
      const hit = bookings.find((r) => propName(r.property) === propertyNameArg
        && r.endDate && r.date <= dateStr && dateStr < r.endDate);
      if (!hit) return null;
      const nights = Math.max(1, diffDays(hit.date, hit.endDate) || 1);
      return { guest: hit.guest || 'Rezerwacja', nights, price: Number(hit.income) || 0 };
    };

    /* ── filtr obiektu (custom select) ── */
    const countFor = (name) => enriched.filter((t) => t.date && (name === 'all' || (t.propertyName || '') === name)).length;
    // shortName: na przycisku selecta „Wszystkie", w menu pełne „Wszystkie obiekty" (jak w prototypie)
    const filterOptions = [{ value: 'all', name: 'Wszystkie obiekty', shortName: 'Wszystkie', color: '#716951', count: countFor('all') }]
      .concat(propList.map((p) => ({ value: p.name, name: p.name, color: p.color, count: countFor(p.name) })));

    return {
      todayStr, days, rangeLabel, sections, inbox, counters,
      axis: { days, rows }, busyOn, filterOptions,
      visibleCount: dated.length,
      monthsShort: MONTHS_SHORT,
    };
  }, [tasks, rentals, templates, properties, filter, today]);
}
