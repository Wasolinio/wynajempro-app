import React, { useMemo } from 'react';
import { ArrowRight, CheckCircle, ClipboardList, Banknote, PieChart, LogIn, Sparkles, AlertTriangle, Unlink } from 'lucide-react';
import { SourceTag } from '../SourceTag';
import { plural } from '../../../utils/plural';
import { clickableProps } from '../../../utils/a11y';
import { useCountUp } from '../useCountUp';
import { znajdzKolizjeAktualne, znajdzZnikle } from '../../../utils/bookingConflicts';

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
  pulpit, dailyReport, weekReminders, upcoming, rentals,
  onOpenStats, onGoCalendar, onOpenDailyReport, onEditRental, completeTask,
}) {
  const arrivalsSoon = (upcoming || []).slice(0, 5);
  const tasksToday = dailyReport.tasks;
  // liczby kart wjeżdżają jak w Analityce — wspólny progress, finiszują razem
  const { progress } = useCountUp();

  // X26: kolizje i rezerwacje znikłe z portalu. Liczone z danych, które panel
  // i tak trzyma w pamięci — zero odczytów bazy. iCal nie potrafi ZAPOBIEC
  // podwójnej sprzedaży terminu (portale odświeżają kalendarze co kilka godzin),
  // ale my jako jedyni widzimy wszystkie portale naraz, więc potrafimy DONIEŚĆ.
  const kolizje = useMemo(() => znajdzKolizjeAktualne(rentals), [rentals]);
  const znikle = useMemo(() => znajdzZnikle(rentals), [rentals]);

  const dzien = (d) => (d || '').split('-').reverse().slice(0, 2).join('.');

  return (
    <>
      {(kolizje.length > 0 || znikle.length > 0) && (
        <div className="wpd-alerts">
          {kolizje.length > 0 && (
            <div className="wpd-alert wpd-alert--pilny" role="alert">
              <span className="wpd-alert__ic"><AlertTriangle /></span>
              <div className="wpd-alert__body">
                <p className="wpd-alert__title">
                  {kolizje.length} {plural(kolizje.length, ['termin sprzedany dwa razy', 'terminy sprzedane dwa razy', 'terminów sprzedanych dwa razy'])}
                </p>
                <ul className="wpd-alert__list">
                  {kolizje.slice(0, 3).map((k, i) => (
                    <li key={i} className="wpd-alert__row">
                      <b>{k.property}</b> · <span className="wpd-alert__when">{dzien(k.odDnia)}–{dzien(k.doDnia)}</span>
                      {' — '}
                      {/* `onEditRental` to `openBookingDetail` — bierze CAŁY OBIEKT i sam
                          wyciąga `id`. Przekazanie samego identyfikatora dawało `undefined`
                          i przycisk nie robił nic (recenzja kodu 2026-08-22). Pokryte
                          testem, który te przyciski klika. */}
                      <button type="button" className="wpd-alert__act" onClick={() => onEditRental && onEditRental(k.a)}>
                        {k.a.guest || 'rezerwacja'} ({k.a.source || 'ręczna'})
                      </button>
                      {' × '}
                      <button type="button" className="wpd-alert__act" onClick={() => onEditRental && onEditRental(k.b)}>
                        {k.b.guest || 'rezerwacja'} ({k.b.source || 'ręczna'})
                      </button>
                    </li>
                  ))}
                </ul>
                {kolizje.length > 3 && (
                  <p className="wpd-alert__more">…i jeszcze {kolizje.length - 3}. Pełna lista w kalendarzu.</p>
                )}
              </div>
            </div>
          )}

          {znikle.length > 0 && (
            <div className="wpd-alert wpd-alert--uwaga" role="status">
              <span className="wpd-alert__ic"><Unlink /></span>
              <div className="wpd-alert__body">
                <p className="wpd-alert__title">
                  {znikle.length} {plural(znikle.length, ['rezerwacja zniknęła z portalu', 'rezerwacje zniknęły z portalu', 'rezerwacji zniknęło z portalu'])}
                </p>
                <ul className="wpd-alert__list">
                  {znikle.slice(0, 3).map((r) => (
                    <li key={r.id} className="wpd-alert__row">
                      <b>{r.property}</b> · <span className="wpd-alert__when">{dzien(r.date)}–{dzien(r.endDate || r.date)}</span>
                      {' — '}
                      <button type="button" className="wpd-alert__act" onClick={() => onEditRental && onEditRental(r)}>
                        {r.guest || 'rezerwacja'} ({r.source || 'iCal'})
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="wpd-alert__more">
                  Portal przestał ją podawać — zwykle znaczy to anulowanie. Termin jest już wolny,
                  a rezerwacji nie kasujemy za Ciebie, bo mogą być przy niej Twoje kwoty.
                  Jeśli w zbliżonym terminie widzisz nową rezerwację <b>z tego samego portalu</b>,
                  porównaj daty i gościa — może to być ta sama po zmianie dat.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
      {/* ── Karty metryk ── */}
      <div className="wpd-stats">
        <div className="wpd-stat" {...clickableProps(onOpenStats)}>
          <div className="wpd-stat__head">
            <p className="wpd-stat__label">Przychód · {up(pulpit.monthName)}</p>
            <span className="wpd-stat__ic"><Banknote /></span>
          </div>
          <div className="wpd-stat__value">{fmt(pulpit.monthRevenue * progress)} <small>zł</small></div>
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
          <div className="wpd-stat__value">{Math.round(pulpit.occupancy * progress)}%</div>
          <div className="wpd-stat__foot">
            <div className="wpd-bar"><div className="wpd-bar__fill" style={{ width: `${pulpit.occupancy * progress}%` }} /></div>
          </div>
        </div>

        <div className="wpd-stat" {...clickableProps(onGoCalendar)}>
          <div className="wpd-stat__head">
            <p className="wpd-stat__label">Przyjazdy dziś</p>
            <span className="wpd-stat__ic"><LogIn /></span>
          </div>
          <div className="wpd-stat__value">{Math.round(pulpit.arrivals * progress)}</div>
          <div className="wpd-stat__foot">
            <span className="wpd-stat__sub">{pulpit.departures > 0 ? `+ ${pulpit.departures} ${plural(pulpit.departures, ['wyjazd', 'wyjazdy', 'wyjazdów'])}` : 'brak wyjazdów'}</span>
          </div>
        </div>

        {/* X21: kafel prowadzi do raportu dziennego — w kalendarzu sprzątania nie widać */}
        <div className="wpd-stat" {...clickableProps(onOpenDailyReport || onGoCalendar)}>
          <div className="wpd-stat__head">
            <p className="wpd-stat__label">Do posprzątania</p>
            <span className="wpd-stat__ic"><Sparkles /></span>
          </div>
          <div className="wpd-stat__value">{Math.round(pulpit.cleaning * progress)}</div>
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
                  <SourceTag source={r.source} />
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
