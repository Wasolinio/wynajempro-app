import React from 'react';
import { ArrowLeft, Edit, Trash2, Phone, Mail, CheckCircle, ClipboardList, Moon, RefreshCw, Users } from 'lucide-react';
import { channelTone } from '../styles';
import { plural } from '../../../utils/plural';

const fmt = (n) => new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(Math.round(Number(n) || 0));
const initials = (name) => (name || 'Gość').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

// Pełna data: "2 lipca 2026" + dzień tygodnia
const fmtFull = (d) => {
  if (!d) return null;
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return null;
  return {
    date: dt.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }),
    weekday: cap(dt.toLocaleDateString('pl-PL', { weekday: 'long' })),
  };
};
const fmtShort = (d) => {
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return '—';
  return `${dt.toLocaleDateString('pl-PL', { weekday: 'short' })}, ${dt.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })}`;
};

/*
  Szczegóły rezerwacji. Lewa kolumna: karta gościa (pełne daty z dniem tygodnia),
  kontakt (klikalne tel:/mailto:) i rozliczenie. Prawa: zadania i przypomnienia
  z szablonów (templates) z odhaczaniem — stan w rentals.completedTasks.
*/
export default function BookingDetailView({ booking: r, templates = [], toggleDynamicTask, onBack, onEdit, onDelete }) {
  if (!r) return null;
  const propName = typeof r.property === 'object' ? r.property?.name : r.property;
  const income = Number(r.income) || 0;
  const commission = Number(r.commission) || 0;
  const tax = (Number(r.tax) || 0) + (Number(r.vat) || 0);
  const advance = Number(r.advancePayment) || 0;
  const s = r.date ? new Date(r.date) : null;
  const e = new Date(r.endDate || r.date);
  const nights = s && !isNaN(e.getTime()) ? Math.max(1, Math.round((e - s) / 86400000) || 1) : 1;
  const rate = nights > 0 ? Math.round(income / nights) : income;
  const payout = income - commission - tax;
  const shortId = String(r.id || '').slice(-4).toUpperCase();

  const arrival = fmtFull(r.date);
  const departure = fmtFull(r.endDate);

  const payTone = r.isPaid ? 'green' : advance > 0 && r.isAdvancePaid ? 'granat' : 'amber';
  const payLabel = r.isPaid ? 'Opłacona' : advance > 0 && r.isAdvancePaid ? 'Zaliczka wpłacona' : 'Do opłacenia';
  const telHref = r.phone ? `tel:${String(r.phone).replace(/[^\d+]/g, '')}` : null;

  // Zadania z szablonów — stan ukończenia jak w dailyReport/tabeli rezerwacji
  const isDone = (t) => !!(r.completedTasks?.[t.id] || (t.id === 'directions' && r.directionsSent) || (t.id === 'keycode' && r.keycodeSent));
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tasks = templates.map((t) => {
    let due = null;
    if (s && !isNaN(s.getTime())) { due = new Date(s); due.setHours(0, 0, 0, 0); due.setDate(due.getDate() - (t.daysBefore || 0)); }
    return { ...t, done: isDone(t), due, overdue: due && due < today && !isDone(t) };
  });
  const doneCount = tasks.filter((t) => t.done).length;

  const contactLink = { fontFamily: 'inherit', fontWeight: 600, color: 'var(--cynober)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 7 };

  return (
    <>
      <div className="wpd-bc">
        <button onClick={onBack}><ArrowLeft style={{ width: 12, height: 12, display: 'inline', verticalAlign: '-1px' }} /> Rezerwacje</button>
        <span>›</span>
        <span className="wpd-bc__cur">Rezerwacja #{shortId}</span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', gap: 8 }}>
          <button className="wpd-btn wpd-btn--sm" onClick={() => onEdit(r)} style={{ textTransform: 'none', letterSpacing: 0 }}><Edit /> Edytuj</button>
          <button className="wpd-btn wpd-btn--sm wpd-btn--danger" onClick={() => onDelete(r.id)} style={{ textTransform: 'none', letterSpacing: 0 }}><Trash2 /> Usuń</button>
        </span>
      </div>

      <div className="wpd-grid-2">
        {/* Lewa: gość + kontakt + rozliczenie */}
        <div>
          <div className="wpd-panel">
            <div className="wpd-guest">
              <span className="wpd-guest__av">{initials(r.guest)}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="wpd-guest__name">{r.guest || 'Rezerwacja'}</div>
                <div className="wpd-guest__sub">{propName || '—'} · #{shortId}</div>
              </div>
              <span style={{ display: 'inline-flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {r.source && <span className={`wpd-tag wpd-tag--${channelTone(r.source)}`}>{r.source}</span>}
                {r.syncId && <span className="wpd-tag wpd-tag--muted"><RefreshCw style={{ width: 10, height: 10 }} /> iCal</span>}
                <span className={`wpd-tag wpd-tag--${payTone}`}>{payLabel}</span>
              </span>
            </div>
            <div className={`wpd-cells${r.guests ? ' wpd-cells--4' : ''}`}>
              <div className="wpd-cell">
                <div className="wpd-cell__label">Przyjazd</div>
                <div className="wpd-cell__val" style={{ fontSize: 14.5 }}>{arrival ? arrival.date : '—'}</div>
                {arrival && <div className="wpd-cell__label" style={{ marginTop: 4, marginBottom: 0, color: 'var(--faint)' }}>{arrival.weekday}</div>}
              </div>
              <div className="wpd-cell">
                <div className="wpd-cell__label">Wyjazd</div>
                <div className="wpd-cell__val" style={{ fontSize: 14.5 }}>{departure ? departure.date : '—'}</div>
                {departure && <div className="wpd-cell__label" style={{ marginTop: 4, marginBottom: 0, color: 'var(--faint)' }}>{departure.weekday}</div>}
              </div>
              <div className="wpd-cell">
                <div className="wpd-cell__label">Pobyt</div>
                <div className="wpd-cell__val" style={{ fontSize: 14.5, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Moon style={{ width: 14, height: 14, color: 'var(--faint)' }} /> {nights} {nights === 1 ? 'noc' : nights < 5 ? 'noce' : 'nocy'}
                </div>
                <div className="wpd-cell__label" style={{ marginTop: 4, marginBottom: 0, color: 'var(--faint)' }}>{fmt(rate)} zł / noc</div>
              </div>
              {r.guests ? (
                <div className="wpd-cell">
                  <div className="wpd-cell__label">Goście</div>
                  <div className="wpd-cell__val" style={{ fontSize: 14.5, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <Users style={{ width: 14, height: 14, color: 'var(--faint)' }} /> {r.guests} {plural(r.guests, ['osoba', 'osoby', 'osób'])}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {(r.email || r.phone || r.guestNote) && (
            <div className="wpd-panel" style={{ marginTop: 16 }}>
              <div className="wpd-panel__head"><h2 className="wpd-h2" style={{ fontSize: 15 }}>Kontakt i notatki</h2></div>
              <div style={{ padding: 16 }}>
                {r.phone && (
                  <div className="wpd-settle__row">
                    <span className="wpd-settle__k">Telefon</span>
                    <a href={telHref} className="wpd-settle__v" style={contactLink} title="Zadzwoń">
                      <Phone style={{ width: 14, height: 14 }} /> <span className="wpd-mono">{r.phone}</span>
                    </a>
                  </div>
                )}
                {r.email && (
                  <div className="wpd-settle__row">
                    <span className="wpd-settle__k">E-mail</span>
                    <a href={`mailto:${r.email}`} className="wpd-settle__v" style={contactLink} title="Napisz e-mail">
                      <Mail style={{ width: 14, height: 14 }} /> {r.email}
                    </a>
                  </div>
                )}
                {r.guestNote && (
                  <div className="wpd-settle__row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                    <span className="wpd-settle__k">Notatka</span>
                    <span style={{ fontSize: 13.5, color: 'var(--ink)', whiteSpace: 'pre-wrap' }}>{r.guestNote}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="wpd-panel" style={{ marginTop: 16 }}>
            <div className="wpd-panel__head"><h2 className="wpd-h2" style={{ fontSize: 15 }}>Rozliczenie</h2></div>
            <div style={{ padding: '6px 18px 14px' }}>
              <div className="wpd-settle__row"><span className="wpd-settle__k">{fmt(rate)} zł × {nights} {nights === 1 ? 'noc' : nights < 5 ? 'noce' : 'nocy'}</span><span className="wpd-settle__v">{fmt(income)} zł</span></div>
              {commission > 0 && <div className="wpd-settle__row"><span className="wpd-settle__k">Prowizja portalu</span><span className="wpd-settle__v" style={{ color: 'var(--cynober)' }}>− {fmt(commission)} zł</span></div>}
              {tax > 0 && <div className="wpd-settle__row"><span className="wpd-settle__k">Podatek</span><span className="wpd-settle__v" style={{ color: 'var(--granat)' }}>− {fmt(tax)} zł</span></div>}
              {advance > 0 && <div className="wpd-settle__row"><span className="wpd-settle__k">Zaliczka {r.isAdvancePaid ? '(wpłacona)' : '(oczekuje)'}</span><span className="wpd-settle__v">{fmt(advance)} zł</span></div>}
              <div className="wpd-settle__row wpd-settle__row--total"><span className="wpd-settle__k">Do wypłaty</span><span className="wpd-settle__v">{fmt(payout)} zł</span></div>
            </div>
          </div>
        </div>

        {/* Prawa: zadania i przypomnienia */}
        <div className="wpd-panel" style={{ alignSelf: 'start' }}>
          <div className="wpd-panel__head">
            <ClipboardList style={{ width: 16, height: 16, color: 'var(--cynober)' }} />
            <h2 className="wpd-h2" style={{ fontSize: 15 }}>Zadania i przypomnienia</h2>
            <span className="wpd-rep__count" style={{ marginLeft: 'auto' }}>{doneCount}/{tasks.length}</span>
          </div>
          <div className="wpd-list">
            {tasks.map((t) => (
              <div className="wpd-row" key={t.id}>
                <button
                  className={`wpd-check ${t.done ? 'wpd-check--on' : 'wpd-check--off'}`}
                  title={t.done ? 'Oznacz jako niewykonane' : 'Oznacz jako wykonane'}
                  onClick={() => toggleDynamicTask(r.id, t.id, t.done)}
                ><CheckCircle /></button>
                <div className="wpd-row__main">
                  <div className="wpd-row__name" style={t.done ? { textDecoration: 'line-through', color: 'var(--faint)' } : undefined}>{t.text || t.shortName}</div>
                  <div className="wpd-row__meta" style={t.overdue ? { color: 'var(--cynober)' } : undefined}>
                    {t.due ? `Do: ${fmtShort(t.due)}` : ''}{t.due && t.daysBefore != null ? ' · ' : ''}{t.daysBefore != null ? `${t.daysBefore} dni przed przyjazdem` : ''}{t.overdue ? ' · zaległe' : ''}
                  </div>
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
              <div className="wpd-empty">
                <p>Brak szablonów zadań.<br />Dodaj je w Ustawieniach → Powiadomienia.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
