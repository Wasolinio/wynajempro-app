import React from 'react';
import { Check, Clock, RefreshCw, ListChecks, ChevronDown, Camera, GripVertical, CalendarClock } from 'lucide-react';
import { channelColor } from '../styles';
import { plural } from '../../../utils/plural';

/*
  Kartka zadania (moduł Zadania, E3) — wariant pełny (lista dzienna) i `compact`
  (skrzynka „Do przypisania"). Wartości 1:1 z design_handoff_zadania/README.md.

  Przeciąganie: pointerdown na kartce (elementy z data-nodrag są ignorowane w hooku).
  Od partii 2 przeciągać można też kartki szablonowe (source: 'template') — upuszczenie
  MATERIALIZUJE zadanie: powstaje dokument w `tasks` z templateId i przesuniętym `date`,
  a wyliczanie tej pary (rentalId, templateId) jest pomijane (useTasksBoard).
  Ścieżka klawiaturowa: przycisk „Przypisz" (widoczny na hover/focus) otwiera ten sam
  popover co klik w pasek osi. Zdjęcia (tylko source 'task'): przycisk aparatu obok
  „Przypisz" i chip liczby zdjęć otwierają dialog TaskPhotos.
*/

const PRIO_BAR = { wysoki: 'wpd-tk-card__prio--hi', normalny: 'wpd-tk-card__prio--mid', niski: 'wpd-tk-card__prio--low' };
// etykiety priorytetu: kolory tekstu wg README — NIGDY #DDD5C3 (kontrast 1,2:1)
const PRIO_TXT = { wysoki: 'wpd-tk-prio--hi', normalny: 'wpd-tk-prio--mid', niski: 'wpd-tk-prio--low' };
const PRIO_LABEL = { wysoki: 'Pilne', normalny: 'Zwykłe', niski: 'Kiedyś' };

function TaskCard({
  task, compact = false, flash = false, checklistOpen = false,
  onToggleDone, onToggleSubtask, onOpenChecklist, onDragStart, onAssign, onOpenPhotos,
}) {
  const t = task;
  const overdue = t.overdueDays > 0 && !t.done;
  const subsDone = (t.subtasks || []).filter((s) => s.done).length;
  const hasSubs = (t.subtasks || []).length > 0;
  const cls = ['wpd-tk-card',
    compact ? 'wpd-tk-card--compact' : '',
    t.done ? 'wpd-tk-card--done' : '',
    flash ? 'wpd-tk-card--flash' : '',
    t.draggable ? '' : 'wpd-tk-card--static',
  ].filter(Boolean).join(' ');

  const assignBtn = t.draggable && onAssign && (
    <button type="button" className="wpd-tk-card__assign" data-nodrag="1"
      onClick={(e) => onAssign(t, e.currentTarget)}
      aria-label={`Przypisz zadanie: ${t.text}`}>
      <CalendarClock />Przypisz
    </button>
  );
  // zdjęcia tylko dla dokumentów z kolekcji tasks — legacy i szablony nie mają
  // dokumentu, na którym dałoby się je trwale zapisać
  const photosBtn = t.source === 'task' && onOpenPhotos && (
    <button type="button" className="wpd-tk-card__assign" data-nodrag="1"
      onClick={() => onOpenPhotos(t)}
      aria-label={`Zdjęcia zadania: ${t.text}`}>
      <Camera />Zdjęcia
    </button>
  );

  if (compact) {
    return (
      <div className={cls} data-task={t.id}
        onPointerDown={t.draggable && onDragStart ? (e) => onDragStart(e, t) : undefined}>
        <span className={`wpd-tk-card__prio ${PRIO_BAR[t.priority] || PRIO_BAR.normalny}`} />
        <div className="wpd-tk-card__body" style={{ gap: 10 }}>
          <div className="wpd-tk-card__main">
            <div className="wpd-tk-card__title" style={{ textWrap: 'pretty' }}>{t.text}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 6 }}>
              <span className={`wpd-tk-prio ${PRIO_TXT[t.priority] || PRIO_TXT.normalny}`}>{PRIO_LABEL[t.priority] || PRIO_LABEL.normalny}</span>
              {hasSubs && <span className="wpd-tk-prio wpd-tk-prio--low">{subsDone}/{t.subtasks.length} kroki</span>}
              {t.photos?.length > 0 && <span className="wpd-tk-prio wpd-tk-prio--low">zdjęcie</span>}
              {assignBtn}
            </div>
          </div>
          <span className="wpd-tk-card__grip" style={{ paddingTop: 2 }}><GripVertical /></span>
        </div>
      </div>
    );
  }

  return (
    <div className={cls} data-task={t.id}
      onPointerDown={t.draggable && onDragStart ? (e) => onDragStart(e, t) : undefined}>
      <span className={`wpd-tk-card__prio ${PRIO_BAR[t.priority] || PRIO_BAR.normalny}${overdue ? ' wpd-tk-card__prio--pulse' : ''}`} />
      <div className="wpd-tk-card__body">
        <button type="button" data-nodrag="1"
          className={`wpd-tk-check${t.done ? ' wpd-tk-check--on' : ''}`}
          title={t.done ? 'Odznacz' : 'Oznacz jako wykonane'}
          aria-pressed={t.done}
          onClick={() => onToggleDone?.(t)}>
          {/* ptaszek z lucide; rysowanie stroke-dashoffset robi CSS (.wpd-tk-check--on svg path) */}
          {t.done && <Check aria-hidden="true" />}
        </button>

        <div className="wpd-tk-card__main">
          <span className="wpd-tk-card__titlewrap">
            <span className="wpd-tk-card__title">{t.text}</span>
            {t.done && <span className="wpd-tk-card__strike" />}
          </span>

          <div className="wpd-tk-card__meta">
            {overdue && (
              <span className="wpd-tk-over">
                {t.overdueDays === 1 ? '1 dzień po terminie' : `${t.overdueDays} dni po terminie`}
              </span>
            )}
            {t.time && <span className="wpd-tk-time"><Clock />{t.time}</span>}
            {t.guest && (
              <span className="wpd-tk-res">
                <span className="wpd-tk-res__dot" style={{ background: channelColor(t.rentalSource) }} />
                <span className="wpd-tk-res__guest">{t.guest}</span>
                {t.rentalSource && <span className="wpd-tk-res__src">{t.rentalSource}</span>}
              </span>
            )}
            {t.source === 'template' && <span className="wpd-tk-tag">z szablonu</span>}
            {t.recurrence?.label && <span className="wpd-tk-mini"><RefreshCw />{t.recurrence.label}</span>}
            {hasSubs && (
              <button type="button" data-nodrag="1"
                className={`wpd-tk-subs__btn${checklistOpen ? ' wpd-tk-subs__btn--open' : ''}`}
                aria-expanded={checklistOpen}
                onClick={() => onOpenChecklist?.(t.id)}>
                <ListChecks />{subsDone}/{t.subtasks.length}
                <ChevronDown className="wpd-tk-subs__chev" />
              </button>
            )}
            {t.photos?.length > 0 && (
              onOpenPhotos && t.source === 'task' ? (
                <button type="button" className="wpd-tk-mini" data-nodrag="1"
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  onClick={() => onOpenPhotos(t)}
                  aria-label={`Pokaż zdjęcia zadania: ${t.text}`}>
                  <Camera />{t.photos.length > 1 ? `${t.photos.length} ` : ''}{plural(t.photos.length, ['zdjęcie', 'zdjęcia', 'zdjęć'])}
                </button>
              ) : <span className="wpd-tk-mini"><Camera />{plural(t.photos.length, ['zdjęcie', 'zdjęcia', 'zdjęć'])}</span>
            )}
            {assignBtn}
            {photosBtn}
          </div>

          {t.note && <p className="wpd-tk-card__note">{t.note}</p>}

          {hasSubs && checklistOpen && (
            <div className="wpd-tk-subs">
              {t.subtasks.map((s, i) => (
                <button type="button" data-nodrag="1" key={i}
                  className={`wpd-tk-sub${s.done ? ' wpd-tk-sub--done' : ''}`}
                  style={{ animationDelay: `${i * 55}ms` }}
                  aria-pressed={s.done}
                  onClick={() => onToggleSubtask?.(t, i)}>
                  <span className={`wpd-tk-sub__box${s.done ? ' wpd-tk-sub__box--on' : ''}`}>
                    {s.done && <Check aria-hidden="true" />}
                  </span>
                  <span className="wpd-tk-sub__txt">{s.text}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {t.draggable && <span className="wpd-tk-card__grip" aria-hidden="true"><GripVertical /></span>}
      </div>
    </div>
  );
}

export default React.memo(TaskCard);
