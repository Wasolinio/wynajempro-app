import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { TrendingUp, Inbox } from 'lucide-react';
import { useWynajem } from '../../../context/WynajemContext';
import { useTasksBoard, wordDate, axisDate } from '../tasks/useTasksBoard';
import TaskCard from '../tasks/TaskCard';
import AssignAxis from '../tasks/AssignAxis';
import QuickTaskPopover from '../tasks/QuickTaskPopover';
import TaskPhotos from '../tasks/TaskPhotos';
import { useTaskDrag } from '../tasks/useTaskDrag';
import WpdSelect from '../../../components/WpdSelect';
import { plural } from '../../../utils/plural';

/*
  Widok „Zadania" (E3, partia 1) — design_handoff_zadania/README.md.
  Układ od góry: pasek liczników (licznik przewijający cyfry) → oś przypisania →
  dwie kolumny: lista dzienna (sekcje Zaległe → Dziś → Jutro → dni → Później,
  podgrupy po obiekcie) + sticky skrzynka „Do przypisania" i kafel JAK PRZYPISAĆ.
  Przypisywanie: przeciągnięcie kartki (useTaskDrag), klik w pasek rezerwacji
  (QuickTaskPopover) oraz ścieżka klawiaturowa („+" w wierszu osi, „Przypisz" na kartce).
*/

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function RollCounter({ value }) {
  const chars = String(Math.min(99, Math.max(0, value))).padStart(2, '0').split('');
  return (
    <div className="wpd-tk-roll" role="img" aria-label={`Pozostało ${value}`}>
      {chars.map((c, i) => (
        <span className="wpd-tk-roll__col" key={i}>
          <span className="wpd-tk-roll__strip" style={{ transform: `translateY(-${Number(c) * 40}px)` }}>
            {DIGITS.map((n) => <span key={n}>{n}</span>)}
          </span>
        </span>
      ))}
    </div>
  );
}

export default function TasksView({ registerQuickAdd, onDeleteTask }) {
  const {
    tasks, rentals, templates, properties,
    addTask, updateTask, assignTask, toggleTaskDone, toggleSubtask,
    toggleDynamicTask, toggleStatus, assignLegacyReminder,
    addTaskPhoto, removeTaskPhoto,
  } = useWynajem();

  const [filter, setFilter] = useState('all');
  const board = useTasksBoard({ tasks, rentals, templates, properties, filter });

  const [openChecklists, setOpenChecklists] = useState({});
  const [quick, setQuick] = useState(null); // { context, task, initialDay, anchor }
  const [flashId, setFlashId] = useState(null);
  const [announce, setAnnounce] = useState('');
  const [photosTaskId, setPhotosTaskId] = useState(null); // dialog zdjęć (partia 2)

  useEffect(() => {
    if (!flashId) return undefined;
    const t = setTimeout(() => setFlashId(null), 1000);
    return () => clearTimeout(t);
  }, [flashId]);

  /* ── mapa wszystkich zadań i pasków (dla drag & drop i przypisań) ── */
  const taskById = useMemo(() => {
    const m = new Map();
    board.sections.forEach((s) => s.groups.forEach((g) => g.tasks.forEach((t) => m.set(t.id, t))));
    board.inbox.forEach((t) => m.set(t.id, t));
    return m;
  }, [board]);
  const barByRental = useMemo(() => {
    const m = new Map();
    board.axis.rows.forEach((row) => row.bars.forEach((b) => m.set(b.rentalId, b)));
    return m;
  }, [board]);

  /* ── szybkie zadanie: pozycjonowanie wg README (clamp 12 / bottom+10 / wysokość 572) ── */
  const anchorFor = (rect, alignRight = false) => {
    const wish = Math.min(560, window.innerHeight - 24);
    const top = Math.max(12, Math.min(rect.bottom + 10, window.innerHeight - wish - 12));
    const rawLeft = alignRight ? rect.right - 352 : rect.left;
    const left = Math.min(Math.max(12, rawLeft), window.innerWidth - 372);
    return { top, left, maxHeight: window.innerHeight - top - 16 };
  };

  const openForBar = useCallback((bar, el) => {
    setQuick({
      context: {
        rentalId: bar.rentalId, guest: bar.guest, propertyName: bar.propertyName,
        arrival: bar.arrival, departure: bar.departure,
      },
      task: null, initialDay: bar.arrival, anchor: anchorFor(el.getBoundingClientRect()),
    });
  }, []);

  const openForCell = useCallback((propertyName, dayKey, el) => {
    setQuick({
      context: { rentalId: null, guest: '', propertyName, arrival: null, departure: null },
      task: null, initialDay: dayKey, anchor: anchorFor(el.getBoundingClientRect()),
    });
  }, []);

  const openBlank = useCallback((el) => {
    setQuick({
      context: null, task: null, initialDay: null,
      anchor: anchorFor(el.getBoundingClientRect(), true),
    });
  }, []);

  const openAssign = useCallback((task, el) => {
    setQuick({ context: null, task, initialDay: task.date ?? null, anchor: anchorFor(el.getBoundingClientRect()) });
  }, []);

  // topbar „+ Zadanie" żyje w ManagerApp — widok rejestruje mu swój otwieracz
  useEffect(() => {
    registerQuickAdd?.(openBlank);
    return () => registerQuickAdd?.(null);
  }, [registerQuickAdd, openBlank]);

  const announceAssigned = useCallback((who, date) => {
    setAnnounce(date ? `Zadanie przypisane: ${who}, ${wordDate(date)}` : `Zadanie dodane: ${who}`);
  }, []);

  // Materializacja zadania z szablonu (partia 2, krok 6): powstaje dokument w `tasks`
  // z templateId i PRZESUNIĘTYM date; gość, obiekt i rezerwacja zostają z pobytu-matki —
  // zadanie z szablonu dotyczy TEGO pobytu, przeciągnięcie zmienia mu termin, nie
  // właściciela (decyzja własna, raportowana). Board pomija odtąd wyliczanie tej pary.
  const materializeTemplate = useCallback(async (task, { date, time = '', priority = null, text = null }) => {
    const id = await addTask({
      text: text ?? task.text,
      propertyName: task.propertyName,
      rentalId: task.rentalId,
      templateId: task.templateId,
      date: date ?? null,
      time,
      priority: priority || task.priority || 'normalny',
    });
    if (id) {
      setFlashId(id);
      announceAssigned(task.guest || task.propertyName || 'zadanie', date);
    }
  }, [addTask, announceAssigned]);

  const submitQuick = useCallback(async (draft) => {
    const q = quick;
    setQuick(null);
    if (!q) return;
    if (q.task) {
      // tryb „Przypisz" z kartki: aktualizacja istniejącego zadania (bez zmiany rezerwacji)
      if (q.task.source === 'template') {
        await materializeTemplate(q.task, draft);
        return;
      }
      if (q.task.source === 'legacy') {
        await assignLegacyReminder(q.task.id, { date: draft.date, propertyName: q.task.propertyName });
      } else {
        await updateTask(q.task.id, { text: draft.text, date: draft.date, time: draft.time, priority: draft.priority });
      }
      setFlashId(q.task.id);
      announceAssigned(q.task.propertyName || 'bez obiektu', draft.date);
      return;
    }
    const id = await addTask({
      ...draft,
      rentalId: q.context?.rentalId ?? null,
      propertyName: q.context?.propertyName ?? null,
    });
    if (id) {
      setFlashId(id);
      if (q.context) announceAssigned(q.context.guest || q.context.propertyName, draft.date);
    }
  }, [quick, addTask, updateTask, assignLegacyReminder, announceAssigned, materializeTemplate]);

  /* ── przeciąganie ── */
  const resolveDrop = useCallback((el, x) => {
    const kind = el.getAttribute('data-drop');
    if (kind === 'res') {
      const rentalId = el.getAttribute('data-res');
      const bar = barByRental.get(rentalId);
      if (!bar) return null;
      const track = el.parentElement; // .wpd-tk-axis__track
      const box = track.getBoundingClientRect();
      let i = Math.floor((x - box.left) / (box.width / 7));
      i = Math.max(0, Math.min(6, i));
      // dzień, na który spadła kartka, przycięty do zakresu paska w oknie
      i = Math.max(Math.max(0, bar.sIdx), Math.min(Math.min(6, bar.eIdx), i));
      return { rentalId, propertyName: bar.propertyName, date: board.days[i].key, guest: bar.guest };
    }
    if (kind === 'day') {
      return {
        rentalId: null, propertyName: el.getAttribute('data-prop'),
        date: el.getAttribute('data-day'), guest: '',
      };
    }
    return null;
  }, [barByRental, board.days]);

  const labelFor = useCallback((info) => (
    info.rentalId ? `${axisDate(info.date)} → ${info.guest}` : `${axisDate(info.date)} → ${info.propertyName}`
  ), []);

  const onDrop = useCallback(async (taskId, info) => {
    const task = taskById.get(taskId);
    if (!task) return;
    if (task.source === 'template') {
      await materializeTemplate(task, { date: info.date });
      return;
    }
    if (task.source === 'legacy') {
      await assignLegacyReminder(taskId, { date: info.date, propertyName: info.propertyName });
      // legacy nie zapisuje linku do rezerwacji — komunikat uczciwie mówi o obiekcie
      // i terminie, nie o gościu (przegląd code-reviewera)
      announceAssigned(info.propertyName, info.date);
    } else {
      await assignTask(taskId, { date: info.date, rentalId: info.rentalId, propertyName: info.propertyName });
      announceAssigned(info.guest || info.propertyName, info.date);
    }
    setFlashId(taskId);
  }, [taskById, assignTask, assignLegacyReminder, announceAssigned, materializeTemplate]);

  const { begin } = useTaskDrag({ resolveDrop, labelFor, onDrop });

  /* ── odhaczanie wg źródła zadania ── */
  const handleToggleDone = useCallback((task) => {
    if (task.source === 'template') toggleDynamicTask(task.rentalId, task.templateId, task.done);
    else if (task.source === 'legacy') toggleStatus(task.id, 'isCompleted');
    else toggleTaskDone(task);
  }, [toggleDynamicTask, toggleStatus, toggleTaskDone]);

  const handleToggleSubtask = useCallback((task, index) => {
    if (task.source === 'task') toggleSubtask(task, index);
  }, [toggleSubtask]);

  const handleOpenChecklist = useCallback((id) => {
    setOpenChecklists((s) => ({ ...s, [id]: !s[id] }));
  }, []);

  /* ── popover: zajętość i kolor obiektu kalendarza ── */
  const calProperty = quick?.context?.propertyName || quick?.task?.propertyName || properties[0]?.name || '';
  const calRow = board.axis.rows.find((r) => r.property === calProperty);
  const busyForCal = useCallback((dateStr) => board.busyOn(calProperty, dateStr), [board, calProperty]);

  const renderCard = (t, compact = false) => (
    <TaskCard key={t.id} task={t} compact={compact}
      flash={flashId === t.id}
      checklistOpen={!!openChecklists[t.id]}
      onToggleDone={handleToggleDone}
      onToggleSubtask={handleToggleSubtask}
      onOpenChecklist={handleOpenChecklist}
      onDragStart={begin}
      onAssign={openAssign}
      onOpenPhotos={(task) => setPhotosTaskId(task.id)}
      // usuwanie idzie wspólnym dialogiem potwierdzenia panelu; flaga mówi, w której
      // kolekcji leży dokument (tasks vs legacy rentals)
      onDelete={onDeleteTask ? (task) => onDeleteTask(task.id, task.source === 'task') : undefined} />
  );

  // dialog zdjęć czyta zadanie NA ŻYWO z planszy — po uploadzie/usunięciu snapshot
  // odświeża photos bez zamykania dialogu
  const photosTask = photosTaskId ? taskById.get(photosTaskId) : null;

  return (
    <div>
      {/* pasek liczników */}
      <div className="wpd-tk-bar">
        <div className="wpd-tk-bar__cell" style={{ minWidth: 0 }}>
          <p className="wpd-label" style={{ margin: '0 0 6px' }}>Pozostało</p>
          <RollCounter value={board.counters.remaining} />
        </div>
        <div className="wpd-tk-bar__cell">
          <p className="wpd-label" style={{ margin: '0 0 8px' }}>Zaległe</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span className="wpd-tk-num wpd-tk-num--over" data-testid="tk-count-overdue">{board.counters.overdue}</span>
            <span className="wpd-tk-mini">wymaga decyzji</span>
          </div>
        </div>
        <div className="wpd-tk-bar__cell">
          <p className="wpd-label" style={{ margin: '0 0 8px' }}>Bez rezerwacji</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span className="wpd-tk-num" data-testid="tk-count-inbox">{board.counters.inbox}</span>
            <span className="wpd-tk-mini">do przypisania</span>
          </div>
        </div>
        <div className="wpd-tk-bar__hint">
          <TrendingUp />
          <p>Przeciągnij kartkę na pasek rezerwacji — zadanie przypnie się do gościa i terminu.</p>
        </div>
      </div>

      {/* oś przypisania */}
      <AssignAxis days={board.axis.days} rows={board.axis.rows} rangeLabel={board.rangeLabel}
        onBarClick={openForBar} onCellAdd={openForCell} />

      {/* dwie kolumny: lista + skrzynka */}
      <div className="wpd-tk-layout">
        <div className="wpd-tk-list">
          <div className="wpd-tk-toolbar">
            <WpdSelect label="Obiekt" ariaLabel="Filtruj zadania po obiekcie"
              value={filter} onChange={setFilter} options={board.filterOptions} />
            <span className="wpd-tk-toolbar__count">
              {board.visibleCount} {plural(board.visibleCount, ['zadanie', 'zadania', 'zadań'])} w widoku
            </span>
          </div>

          {board.sections.length === 0 && (
            <div className="wpd-tk-inbox__empty">Nic do zrobienia w tym widoku.</div>
          )}

          {board.sections.map((sec) => (
            <div key={sec.id} className={`wpd-tk-sec${sec.tone === 'overdue' ? ' wpd-tk-sec--over' : ''}`}>
              <div className="wpd-tk-sec__head">
                <span className="wpd-tk-sec__title">{sec.label}</span>
                <span className="wpd-tk-sec__sub">{sec.sub}</span>
                <span className="wpd-tk-sec__count">{sec.count}</span>
              </div>
              {sec.groups.map((grp) => (
                <div key={grp.property} className="wpd-tk-grp">
                  <div className="wpd-tk-grp__head">
                    <span className="wpd-tk-dot" style={{ background: grp.color }} />
                    <span className="wpd-tk-grp__name">{grp.property}</span>
                    <span className="wpd-tk-grp__rule" />
                  </div>
                  <div className="wpd-tk-grp__items">
                    {grp.tasks.map((t) => renderCard(t))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="wpd-tk-side">
          <div className="wpd-tk-inbox">
            <div className="wpd-tk-inbox__head">
              <Inbox />
              <h2 className="wpd-tk-inbox__title">Do przypisania</h2>
              <span className="wpd-tk-inbox__count">{board.counters.inbox}</span>
            </div>
            <div className="wpd-tk-inbox__body">
              {board.inbox.map((t) => renderCard(t, true))}
              {board.inbox.length === 0 && (
                <div className="wpd-tk-inbox__empty">Wszystko przypisane.</div>
              )}
            </div>
          </div>

          <div className="wpd-tk-howto">
            <p className="wpd-tk-howto__title">Jak przypisać</p>
            <div className="wpd-tk-howto__row">
              <span className="wpd-tk-howto__num">01</span>
              <span className="wpd-tk-howto__txt">Kartkę na <b>pasek rezerwacji</b> — bierze gościa i dzień, na który spadła.</span>
            </div>
            <div className="wpd-tk-howto__row">
              <span className="wpd-tk-howto__num">02</span>
              <span className="wpd-tk-howto__txt">Na <b>wolny dzień</b> — bierze sam termin i obiekt.</span>
            </div>
            <div className="wpd-tk-howto__row">
              <span className="wpd-tk-howto__num">03</span>
              <span className="wpd-tk-howto__txt">Klik w pasek otwiera <b>szybkie zadanie</b> przy tej rezerwacji.</span>
            </div>
          </div>
        </div>
      </div>

      {/* komunikat dla czytnika ekranu po przypisaniu */}
      <div className="wpd-tk-sr" aria-live="polite">{announce}</div>

      {/* PORTAL do korzenia .wpd: widok siedzi w .wpd-view, którego wypełniona animacja
          transformu (wpd-view-in, fill both) robi z niego containing block dla
          position:fixed — popover renderowany w środku zjeżdżałby o wysokość topbara
          i paddingu (zmierzone: 98 px w dół, stopka poza ekranem). Korzeń .wpd nie ma
          transformu, a trzyma tokeny var(--...) — dlatego on, nie document.body. */}
      {photosTask && createPortal(
        <TaskPhotos task={photosTask} onAdd={addTaskPhoto} onRemove={removeTaskPhoto}
          onClose={() => setPhotosTaskId(null)} />,
        document.querySelector('.wpd') || document.body,
      )}

      {quick && createPortal(
        <QuickTaskPopover
          anchor={quick.anchor}
          context={quick.context}
          assignTask={quick.task}
          initialDay={quick.initialDay}
          busyFor={busyForCal}
          calendarProperty={calProperty}
          busyColor={calRow?.color}
          todayStr={board.todayStr}
          onSubmit={submitQuick}
          onClose={() => setQuick(null)} />,
        document.querySelector('.wpd') || document.body,
      )}
    </div>
  );
}
