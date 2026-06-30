import React from 'react';
import { ArrowLeft, Edit, Trash2, ExternalLink, BookOpen } from 'lucide-react';
import { channelTone } from '../styles';

const fmt = (n) => new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(Math.round(Number(n) || 0));
const up = (s) => (s || '').toUpperCase();
const initials = (name) => (name || 'Gość').split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
const fmtDate = (d) => {
  if (!d) return '—';
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
};

/*
  Szczegóły rezerwacji (05-app2). Lewa kolumna: dane rezerwacji + rozliczenie (realne).
  Prawa: przewodnik dla gości. UWAGA: model danych nie wiąże rezerwacji z przewodnikiem
  (kody/WiFi żyją w kolekcji guides/{id}/secrets per-przewodnik), więc kod/WiFi to pola
  do uzupełnienia, a dojazd bierzemy z profilu gospodarza. Pełne wpięcie kreatora — w dopracowaniu.
*/
export default function BookingDetailView({ booking: r, hostProfile, onBack, onEdit, onDelete }) {
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

  const payTone = r.isPaid ? 'green' : advance > 0 && r.isAdvancePaid ? 'granat' : 'amber';
  const payLabel = r.isPaid ? 'Opłacona' : advance > 0 && r.isAdvancePaid ? 'Zaliczka wpłacona' : 'Do opłacenia';

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
        {/* Lewa: rezerwacja */}
        <div>
          <div className="wpd-panel">
            <div className="wpd-guest">
              <span className="wpd-guest__av">{initials(r.guest)}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="wpd-guest__name">{r.guest || 'Rezerwacja'}</div>
                <div className="wpd-guest__sub">{propName || '—'}</div>
              </div>
              <span className={`wpd-tag wpd-tag--${payTone}`}>{payLabel}</span>
            </div>
            <div className="wpd-cells">
              <div className="wpd-cell">
                <div className="wpd-cell__label">Przyjazd</div>
                <div className="wpd-cell__val">{fmtDate(r.date)}</div>
              </div>
              <div className="wpd-cell">
                <div className="wpd-cell__label">Wyjazd</div>
                <div className="wpd-cell__val">{fmtDate(r.endDate)}</div>
              </div>
              <div className="wpd-cell">
                <div className="wpd-cell__label">Kanał</div>
                <div className="wpd-cell__val wpd-cell__val--accent">{r.source || '—'}</div>
              </div>
            </div>
          </div>

          {(r.email || r.phone || r.guestNote) && (
            <div className="wpd-panel" style={{ marginTop: 16 }}>
              <div className="wpd-panel__head"><h2 className="wpd-h2" style={{ fontSize: 15 }}>Kontakt i notatki</h2></div>
              <div style={{ padding: 16 }}>
                {r.email && <div className="wpd-settle__row"><span className="wpd-settle__k">E-mail</span><span className="wpd-settle__v" style={{ fontFamily: 'inherit' }}>{r.email}</span></div>}
                {r.phone && <div className="wpd-settle__row"><span className="wpd-settle__k">Telefon</span><span className="wpd-settle__v">{r.phone}</span></div>}
                {r.guestNote && <div className="wpd-settle__row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}><span className="wpd-settle__k">Notatka</span><span style={{ fontSize: 13.5, color: 'var(--ink)' }}>{r.guestNote}</span></div>}
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

        {/* Prawa: przewodnik dla gości */}
        <div className="wpd-panel" style={{ alignSelf: 'start' }}>
          <div className="wpd-panel__head">
            <BookOpen style={{ width: 16, height: 16, color: 'var(--cynober)' }} />
            <h2 className="wpd-h2" style={{ fontSize: 15 }}>Przewodnik dla gości</h2>
            <span className="wpd-tag wpd-tag--muted" style={{ marginLeft: 'auto' }}>Roboczy</span>
          </div>
          <div style={{ padding: 18 }}>
            <div className="wpd-guide__code">
              <p className="wpd-guide__codelabel">Kod do skrytki z kluczami</p>
              <div className="wpd-guide__pin wpd-guide__pin--empty">— — — —</div>
              <p className="wpd-guide__note">Ustaw w kreatorze przewodnika — widoczny dla gościa po podpisie.</p>
            </div>
            <div className="wpd-kvgrid">
              <div className="wpd-kv"><div className="wpd-kv__k">WiFi</div><div className="wpd-kv__v" style={{ color: 'var(--faint)' }}>—</div></div>
              <div className="wpd-kv"><div className="wpd-kv__k">Hasło WiFi</div><div className="wpd-kv__v" style={{ color: 'var(--faint)' }}>—</div></div>
            </div>
            <div className="wpd-kv" style={{ marginBottom: 16 }}>
              <div className="wpd-kv__k">Dojazd</div>
              <div className="wpd-kv__v" style={{ fontFamily: 'inherit', fontWeight: 400, fontSize: 13.5, color: hostProfile?.address ? 'var(--ink)' : 'var(--faint)' }}>
                {hostProfile?.address || 'Uzupełnij adres w profilu gospodarza'}
              </div>
            </div>
            <button className="wpd-btn" style={{ width: '100%' }} disabled title="Wpięcie kreatora przewodników — w dopracowaniu">
              <ExternalLink /> Otwórz kreator przewodnika
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
