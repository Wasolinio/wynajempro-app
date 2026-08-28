import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarPlus } from 'lucide-react';
import {
  clampToToday, taskEventContent, buildTaskIcs, buildGoogleCalendarUrl, downloadIcs,
} from '../../utils/addToCalendar';

/*
  E6: przycisk „Dodaj do kalendarza" przy wierszu zadania (wzorzec Booksy).
  Klik odsłania dwie opcje: Google Calendar (szablon wydarzenia w nowej karcie —
  na Androidzie otwiera aplikację kalendarza) i Apple / plik .ics (pobranie).

  Menu jest pozycjonowane `fixed` od prostokąta przycisku, nie `absolute` w wierszu:
  listy zadań żyją w kontenerach z overflow (tabela Rezerwacji przewija się poziomo,
  a overflow-x:auto przycina też pionowo) i popover absolute zostałby w nich obcięty.

  Dwie pułapki złapane na zrzutach e2e, o które to rozbicie dba:
  1. Menu renderuje się PORTALEM do korzenia `.wpd` (tokeny var(--…) zostają w zasięgu),
     bo `.wpd-view` ma animację wejścia transformem z `fill-mode: both` — Chrome traktuje
     element z taką (nawet zakończoną) animacją jak transformowany, a transformowany
     przodek przechwytuje `position:fixed` i menu lądowało o wysokość topbara niżej,
     przewijając się razem z treścią.
  2. Samo kliknięcie potrafi wywołać scroll (przeglądarka dosuwa fokusowany przycisk
     przy krawędzi ekranu), dlatego menu PRZELICZA pozycję przy scrollu/resize
     (i raz po otwarciu, po najbliższej klatce), zamiast zamykać się na scroll —
     zamykanie ubijało menu w chwili otwarcia.

  `dateStr` to gotowy termin 'YYYY-MM-DD' — liczy go wołający (dla szablonów przez
  taskSchedule, X20). Bez poprawnej daty przycisk się nie renderuje.
*/
export default function AddToCalendarButton({ dateStr, text, property, guest, uid, small }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const [host, setHost] = useState(null); // korzeń .wpd — cel portalu
  const btnRef = useRef(null);
  const menuRef = useRef(null);

  // pozycja menu od prostokąta przycisku; przy dole ekranu menu otwiera się w górę
  const place = useCallback(() => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    const up = window.innerHeight - r.bottom < 120;
    setPos({
      right: Math.max(8, Math.round(window.innerWidth - r.right)),
      top: up ? null : Math.round(r.bottom + 6),
      bottom: up ? Math.round(window.innerHeight - r.top + 6) : null,
    });
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const raf = requestAnimationFrame(place); // scroll dosunięcia fokusa już się dokonał
    const onDown = (e) => {
      if (btnRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open, place]);

  // Zadanie zaległe dostaje wydarzenie DZIŚ, nie w przeszłości (gdzie alarm nigdy nie
  // odpali) — klamra w tym jednym miejscu obowiązuje wszystkie trzy widoki zadań.
  const eventDate = clampToToday(dateStr);
  if (!eventDate) return null;

  const { summary, details } = taskEventContent({ text, property, guest });

  const toggle = (e) => {
    e.stopPropagation();
    if (open) { setOpen(false); return; }
    setHost(e.currentTarget.closest('.wpd'));
    place();
    setOpen(true);
  };

  const saveIcs = () => {
    downloadIcs(buildTaskIcs({ dateStr: eventDate, summary, details, uid }), `zadanie_${eventDate}.ics`);
    setOpen(false);
  };

  const menu = open && pos ? (
    <div ref={menuRef} className="wpd-calmenu" role="menu" aria-label="Dodaj do kalendarza"
      style={{ right: pos.right, top: pos.top ?? 'auto', bottom: pos.bottom ?? 'auto' }}>
      <a className="wpd-calmenu__item" role="menuitem"
        href={buildGoogleCalendarUrl({ dateStr: eventDate, summary, details })}
        target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
        Google Calendar
      </a>
      <button type="button" className="wpd-calmenu__item" role="menuitem" onClick={saveIcs}>
        Apple / plik .ics
      </button>
    </div>
  ) : null;

  return (
    <span style={{ display: 'inline-flex' }}>
      <button type="button" ref={btnRef} className={`wpd-iconbtn${small ? ' wpd-iconbtn--row' : ''}`}
        title="Dodaj do kalendarza" aria-haspopup="menu" aria-expanded={open} onClick={toggle}>
        <CalendarPlus />
      </button>
      {menu && (host ? createPortal(menu, host) : menu)}
    </span>
  );
}
