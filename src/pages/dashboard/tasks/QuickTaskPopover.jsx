import React, { useEffect, useRef, useState } from 'react';
import { ClipboardList, X, CalendarDays } from 'lucide-react';
import { useDialogA11y } from '../modals/useDialogA11y';
import WpdDatePicker from '../../../components/WpdDatePicker';

/*
  Szybkie zadanie (popover) — design_handoff_zadania/README.md, „Szybkie zadanie".
  Trzy konteksty otwarcia:
  - klik w pasek rezerwacji na osi → context = { rentalId, guest, propertyName, arrival, departure },
  - przycisk „+ Zadanie" w topbarze / „+" w wierszu osi → context bez rezerwacji,
  - przycisk „Przypisz" na kartce (ścieżka klawiaturowa) → assignTask = istniejące zadanie,
    zapis aktualizuje je zamiast tworzyć nowe.
  Puste pole treści NIE zapisuje — fokus wraca do inputa.
  Scrim ma także klasę .wpd-overlay, żeby Escape z useDialogA11y widział ten dialog
  jako wierzchni (hook szuka najbliższego .wpd-overlay).
*/

const ddmm = (dateStr) => (dateStr ? `${dateStr.slice(8, 10)}.${dateStr.slice(5, 7)}` : '');

const PRIOS = [
  { value: 'wysoki', label: 'Pilne' },
  { value: 'normalny', label: 'Zwykłe' },
  { value: 'niski', label: 'Kiedyś' },
];

export default function QuickTaskPopover({
  anchor, context, assignTask = null, initialDay = null, busyFor, calendarProperty, busyColor, todayStr,
  onSubmit, onClose,
}) {
  const dialogA11y = useDialogA11y(true, onClose);
  const inputRef = useRef(null);

  // Zadanie LEGACY (rentals type:'reminder'): trwale zapisuje się TYLKO termin i obiekt
  // (assignLegacyReminder) — treść/priorytet/godzina są dla niego nietrwałe, więc ich
  // nie oferujemy, a chip „BEZ TERMINU" znika (wpis w rentals musi mieć datę).
  // Przegląd code-reviewera: UI nie może obiecywać zapisu, którego nie będzie.
  const legacy = assignTask?.source === 'legacy';

  const [text, setText] = useState(assignTask ? assignTask.text : '');
  const [day, setDay] = useState(initialDay);
  const [time, setTime] = useState(assignTask ? (assignTask.time || '') : '');
  const [prio, setPrio] = useState(assignTask ? (assignTask.priority || 'normalny') : 'normalny');
  const [calOpen, setCalOpen] = useState(false);

  useEffect(() => { if (!legacy) inputRef.current?.focus(); }, [legacy]);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) { inputRef.current?.focus(); return; }
    if (legacy && !day) return; // legacy bez daty nie istnieje — nic do zapisania
    onSubmit({ text: trimmed, date: day, time, priority: prio });
  };

  const chips = [];
  if (context?.rentalId) {
    chips.push({ kind: 'przyjazd', label: ddmm(context.arrival), value: context.arrival });
    if (context.departure) chips.push({ kind: 'wyjazd', label: ddmm(context.departure), value: context.departure });
  }
  chips.push({ kind: 'dziś', label: ddmm(todayStr), value: todayStr });
  if (!legacy) chips.push({ kind: 'bez', label: 'terminu', value: null });
  // remis wartości (np. przyjazd dziś): zaznaczony jest PIERWSZY pasujący chip w kolejności
  // przyjazd → wyjazd → dziś → bez — dwa podświetlone chipy wyglądałyby jak dwa terminy
  const selectedChip = chips.findIndex((c) => c.value === day);

  const sub = context?.rentalId
    ? `${context.guest || 'Rezerwacja'} · ${context.propertyName || ''}`
    : context?.propertyName
      ? `bez rezerwacji · ${context.propertyName}` // „+" w wierszu osi: obiekt znany, gościa brak
      : assignTask
        ? `przypisanie · ${assignTask.propertyName || 'bez obiektu'}`
        : 'bez rezerwacji · trafi do skrzynki';

  return (
    <div className="wpd-overlay wpd-tk-pop__scrim"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="wpd-tk-pop" {...dialogA11y} aria-label="Szybkie zadanie"
        style={{ top: anchor.top, left: anchor.left, maxHeight: anchor.maxHeight }}>
        <div className="wpd-tk-pop__head">
          <span className="wpd-tk-pop__ic"><ClipboardList /></span>
          <div style={{ flex: '1 1 auto', minWidth: 0 }}>
            <h3 className="wpd-tk-pop__title">Szybkie zadanie</h3>
            <p className="wpd-tk-pop__sub">{sub}</p>
          </div>
          <button type="button" className="wpd-tk-pop__close" title="Zamknij" onClick={onClose}><X /></button>
        </div>

        <div className="wpd-tk-pop__body">
          <input ref={inputRef} className="wpd-input" placeholder="np. dowieźć ręczniki"
            value={text} onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
            disabled={legacy}
            aria-label="Treść zadania" />

          <p className="wpd-tk-pop__label">Termin</p>
          <div className="wpd-tk-chips">
            {chips.map((c, i) => (
              <button type="button" key={c.kind}
                className={`wpd-tk-chip${selectedChip === i ? ' wpd-tk-chip--on' : ''}`}
                onClick={() => { setDay(c.value); setCalOpen(false); }}>
                <span className="wpd-tk-chip__kind">{c.kind}</span>{c.label}
              </button>
            ))}
            <button type="button"
              className={`wpd-tk-chip${calOpen ? ' wpd-tk-chip--on' : ''}`}
              aria-expanded={calOpen}
              onClick={() => setCalOpen((v) => !v)}>
              <CalendarDays style={{ width: 13, height: 13 }} />Kalendarz
            </button>
          </div>

          {calOpen && (
            <WpdDatePicker value={day} todayStr={todayStr}
              propertyName={calendarProperty} busyFor={busyFor} busyColor={busyColor}
              onChange={(key) => setDay(key)} />
          )}

          {!legacy && (
          <div className="wpd-tk-timegrid">
            <div>
              <p className="wpd-tk-pop__label">Priorytet</p>
              <div className="wpd-tk-prio-row" role="group" aria-label="Priorytet">
                {PRIOS.map((p) => (
                  <button type="button" key={p.value}
                    className={`wpd-tk-prio-btn${prio === p.value ? ' wpd-tk-prio-btn--on' : ''}`}
                    aria-pressed={prio === p.value}
                    onClick={() => setPrio(p.value)}>{p.label}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="wpd-tk-pop__label">Godzina</p>
              <input className="wpd-tk-time-input" placeholder="--:--" value={time}
                onChange={(e) => setTime(e.target.value)} aria-label="Godzina" />
            </div>
          </div>
          )}
        </div>

        <div className="wpd-tk-pop__foot">
          <button type="button" className="wpd-btn" onClick={onClose}>Anuluj</button>
          <button type="button" className="wpd-btn wpd-btn--primary" onClick={submit}>
            {assignTask ? 'Przypisz zadanie' : 'Dodaj zadanie'}
          </button>
        </div>
      </div>
    </div>
  );
}
