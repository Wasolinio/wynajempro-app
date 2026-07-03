import React from 'react';
import { ArrowRight, CheckCircle, ClipboardList, Banknote, PieChart, LogIn, Sparkles } from 'lucide-react';
import { channelTone } from '../styles';
import { plural } from '../../../utils/plural';
import { clickableProps } from '../../../utils/a11y';

const fmt = (n) => new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(Math.round(Number(n) || 0));
const up = (s) => (s || '').toUpperCase();

const relDay = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr); d.setHours(0, 0, 0, 0);
  const t = new Date(); t.setHours(0, 0, 0, 0);
  const diff = Math.round((d - t) / 86400000);
  if (diff === 0) return 'dziś';
  if (diff === 1) return 'jutro';
  if (diff === -1) return 'wczoraj';
  return dateStr;
};

/*
  Pulpit (01) — wzorzec: ekran 02-app2 z identyfikacji WynajemPRO.
  4 karty metryk + panel najbliższych przyjazdów + ciemny wykres 7 dni + zadania na dziś.
*/
export default function PulpitView({
  pulpit, dailyReport, weekReminders, upcoming,
  onOpenStats, onGoCalendar, onEditRental, completeTask,
}) {
  const arrivalsSoon = (upcoming || []).slice(0, 5);
  const tasksToday = dailyReport.tasks;

  return (
    <>
      {/* ── Karty metryk ── */}
      <div className="wpd-stats">
        <div className="wpd-stat" {...clickableProps(onOpenStats)}>
          <div className="wpd-stat__head">
            <p className="wpd-stat__label">Przychód · {up(pulpit.monthName)}</p>
            <span className="wpd-stat__ic"><Banknote /></span>
          </div>
          <div className="wpd-stat__value">{fmt(pulpit.monthRevenue)} <small>zł</small></div>
          <div className="wpd-stat__foot">
            {pulpit.delta === null
              ? <span className="wpd-stat__sub">Bieżący miesiąc</span>
              : <span className={`wpd-stat__delta${pulpit.delta >= 0 ? ' wpd-stat__delta--up' : ''}`}>
                  {pulpit.delta >= 0 ? '▲' : '▼'} {Math.abs(pulpit.delta)}% vs {pulpit.prevName}
                </span>}
          </div>
        </div>

        <div className="wpd-stat" {...clickableProps(onGoCalendar)}>
          <div className="wpd-stat__head">
            <p className="wpd-stat__label">Obłożenie</p>
            <span className="wpd-stat__ic"><PieChart /></span>
          </div>
          <div className="wpd-stat__value">{pulpit.occupancy}%</div>
          <div className="wpd-stat__foot">
            <div className="wpd-bar"><div className="wpd-bar__fill" style={{ width: `${pulpit.occupancy}%` }} /></div>
          </div>
        </div>

        <div className="wpd-stat" {...clickableProps(onGoCalendar)}>
          <div className="wpd-stat__head">
            <p className="wpd-stat__label">Przyjazdy dziś</p>
            <span className="wpd-stat__ic"><LogIn /></span>
          </div>
          <div className="wpd-stat__value">{pulpit.arrivals}</div>
          <div className="wpd-stat__foot">
            <span className="wpd-stat__sub">{pulpit.departures > 0 ? `+ ${pulpit.departures} ${plural(pulpit.departures, ['wyjazd', 'wyjazdy', 'wyjazdów'])}` : 'brak wyjazdów'}</span>
          </div>
        </div>

        <div className="wpd-stat" {...clickableProps(onGoCalendar)}>
          <div className="wpd-stat__head">
            <p className="wpd-stat__label">Do posprzątania</p>
            <span className="wpd-stat__ic"><Sparkles /></span>
          </div>
          <div className="wpd-stat__value">{pulpit.cleaning}</div>
          <div className="wpd-stat__foot">
            <span className="wpd-stat__sub wpd-stat__sub--accent">{pulpit.cleaningInfo ? `${up(pulpit.cleaningInfo)} · dziś` : '—'}</span>
          </div>
        </div>
      </div>

      {/* ── Najbliższe przyjazdy + wykres ── */}
      <div className="wpd-section wpd-grid-2">
        <div className="wpd-panel">
          <div className="wpd-panel__head">
            <h2 className="wpd-h2">Najbliższe przyjazdy i wyjazdy</h2>
            <button className="wpd-alink" style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }} onClick={onGoCalendar}>
              Kalendarz <ArrowRight />
            </button>
          </div>
          <div className="wpd-list">
            {arrivalsSoon.map((r) => {
              const propName = typeof r.property === 'object' ? r.property?.name : r.property;
              return (
                <div className="wpd-row" key={r.id} {...clickableProps(() => onEditRental(r))} style={{ cursor: 'pointer' }}>
                  <span className="wpd-row__tag">PRZY</span>
                  <div className="wpd-row__main">
                    <div className="wpd-row__name">{r.guest || 'Rezerwacja'}</div>
                    <div className="wpd-row__meta">{propName || '—'}</div>
                  </div>
                  <span className="wpd-row__when"><b>{relDay(r.date)}</b></span>
                  {r.source && <span className={`wpd-tag wpd-tag--${channelTone(r.source)}`}>{r.source}</span>}
                </div>
              );
            })}
            {arrivalsSoon.length === 0 && <div className="wpd-empty"><p>Brak nadchodzących przyjazdów.</p></div>}
          </div>
        </div>

        <div className="wpd-chart">
          <p className="wpd-chart__title">Przychód · ostatnie 7 dni</p>
          <div className="wpd-chart__bars">
            {pulpit.chart.map((d, i) => (
              <div className="wpd-chart__col" key={i} title={`${fmt(d.value)} zł`}>
                <div className={`wpd-chart__bar${d.hi ? ' wpd-chart__bar--hi' : ''}`} style={{ height: `${Math.max(4, d.pct)}%` }} />
                <span className="wpd-chart__x">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Zadania na dziś ── */}
      <div className="wpd-section wpd-panel">
        <div className="wpd-panel__head">
          <ClipboardList style={{ width: 17, height: 17, color: 'var(--cynober)' }} />
          <h2 className="wpd-h2">Zadania na dziś</h2>
          <span className="wpd-label" style={{ marginLeft: 'auto' }}>{tasksToday.length + weekReminders.length} pozycji</span>
        </div>
        <div className="wpd-list">
          {tasksToday.map((t) => (
            <div className="wpd-row" key={`${t.id}-${t.taskId}`}>
              <span className="wpd-row__tag">{t.days <= 0 ? 'DZIŚ' : `D-${t.days}`}</span>
              <div className="wpd-row__main">
                <div className="wpd-row__name">{t.text}</div>
                <div className="wpd-row__meta">{t.property}{t.guest ? ` · ${t.guest}` : ''}</div>
              </div>
              {t.taskId === 'manual' && (
                <button className="wpd-check wpd-check--off" title="Oznacz jako zrobione" onClick={() => completeTask(t.id, 'manual')}><CheckCircle /></button>
              )}
            </div>
          ))}
          {weekReminders.map((task) => (
            <div className="wpd-row" key={task.id}>
              <span className="wpd-row__tag">TYDZIEŃ</span>
              <div className="wpd-row__main">
                <div className="wpd-row__name">{task.text}</div>
                <div className="wpd-row__meta">{task.date}</div>
              </div>
              <button className="wpd-check wpd-check--off" title="Oznacz jako zrobione" onClick={() => completeTask(task.id, 'manual')}><CheckCircle /></button>
            </div>
          ))}
          {tasksToday.length === 0 && weekReminders.length === 0 && (
            <div className="wpd-empty"><p>Brak zadań na dziś. Wszystko ogarnięte.</p></div>
          )}
        </div>
      </div>
    </>
  );
}
