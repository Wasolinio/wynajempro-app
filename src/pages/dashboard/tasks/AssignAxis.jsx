import React from 'react';
import { Plus } from 'lucide-react';

/*
  Oś przypisania (moduł Zadania, E3) — 7 dni × obiekty; wartości i geometria pasków
  z design_handoff_zadania/README.md („Panel Oś przypisania").
  Cele przeciągania to atrybuty data-drop czytane przez useTaskDrag przez
  document.elementFromPoint: pasek = data-drop="res", wolna komórka = data-drop="day",
  komórka pod paskiem = data-drop="busy" (nieaktywna). Podświetlenia celów ustawia
  hook imperatywnie klasami --target (bez setState w pętli przeciągania).
  Ścieżka klawiaturowa: przycisk „+" w wierszu (idiom .wpd-cal__add) otwiera
  szybkie zadanie dla obiektu.
*/
export default function AssignAxis({ days, rows, rangeLabel, onBarClick, onCellAdd }) {
  return (
    <div className="wpd-panel wpd-tk-axis-in" style={{ overflow: 'hidden' }}>
      <div className="wpd-tk-axis__head">
        <h2 className="wpd-h2">Oś przypisania</h2>
        <span className="wpd-label" style={{ letterSpacing: '.08em' }}>{rangeLabel}</span>
        <div style={{ flex: '1 1 auto' }} />
        <span className="wpd-tk-axis__leg">
          <span className="wpd-tk-axis__swatch" style={{ background: 'var(--granat)' }} />pasek = rezerwacja
        </span>
        <span className="wpd-tk-axis__leg">
          <span className="wpd-tk-axis__swatch wpd-tk-axis__swatch--free" />wolny dzień = sam termin
        </span>
      </div>

      <div className="wpd-tk-axis__scroll">
        <div className="wpd-tk-axis__inner">
          <div className="wpd-tk-axis__headrow">
            <div className="wpd-tk-axis__corner" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
              {days.map((d) => (
                <div key={d.key} className={`wpd-tk-axis__dnum${d.today ? ' wpd-tk-axis__dnum--today' : ''}`}>
                  <b>{d.num}</b>
                  <span>{d.dow}</span>
                </div>
              ))}
            </div>
          </div>

          {rows.map((row) => (
            <div className="wpd-tk-axis__row" key={row.property}>
              <div className="wpd-tk-axis__label">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="wpd-tk-dot" style={{ background: row.color }} />
                  <span className="wpd-tk-axis__objname">{row.property}</span>
                </div>
                {row.sub && <div className="wpd-tk-axis__objsub">{row.sub}</div>}
                <button type="button" className="wpd-tk-axis__add"
                  title={`Nowe zadanie — ${row.property}`}
                  aria-label={`Nowe zadanie — ${row.property}`}
                  onClick={(e) => onCellAdd(row.property, days[0].key, e.currentTarget)}>
                  <Plus />
                </button>
              </div>
              <div className="wpd-tk-axis__track">
                <div className="wpd-tk-axis__cells">
                  {row.cells.map((c) => (
                    <div key={c.dayKey}
                      data-drop={c.busy ? 'busy' : 'day'}
                      data-day={c.dayKey} data-prop={row.property}
                      className={['wpd-tk-cell',
                        c.busy ? '' : 'wpd-tk-cell--free',
                        !c.busy && c.weekend ? 'wpd-tk-cell--weekend' : '',
                      ].filter(Boolean).join(' ')}>
                      <span className="wpd-tk-cell__glow" data-glow="1" />
                    </div>
                  ))}
                </div>
                {row.bars.map((b) => (
                  <button type="button" key={b.rentalId}
                    data-drop="res" data-res={b.rentalId} data-prop={row.property}
                    className="wpd-tk-bar-res"
                    style={{ left: b.left, width: b.width, background: b.color, borderRadius: b.radius }}
                    title={`Szybkie zadanie — ${b.guest}`}
                    onClick={(e) => onBarClick(b, e.currentTarget)}>
                    <span className="wpd-tk-bar-res__guest">{b.guest}</span>
                    <span className="wpd-tk-bar-res__add">
                      {b.source && <span className="wpd-tk-bar-res__src">{b.source}</span>}
                      <Plus />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
