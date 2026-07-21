import React from 'react';
import { CheckCircle, XCircle, Edit, Trash2, ArrowDown, ArrowUp, CalendarDays } from 'lucide-react';
import { propHex } from '../styles';
import { SourceTag } from '../SourceTag';
import { clickableProps } from '../../../utils/a11y';

const fmt = (n) => (n || n === 0 ? new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(Math.round(Number(n) || 0)) : '—');

/*
  Rezerwacje (02) — tabela rezerwacji z filtrami (wszystkie / nadchodzące / archiwalne),
  sortowaniem po dacie i przełącznikiem statusu płatności. Logika 1:1 z oryginałem,
  prezentacja w stylu V4.
*/
export default function BookingsView({
  paginatedBookings, properties,
  bookingFilter, changeBookingFilter, counts,
  bookingSortOrder, changeBookingSortOrder,
  toggleStatus, openEditModal, handleDeleteClick, onOpenDetail,
}) {
  const propColor = (name) => {
    const p = properties.find((x) => x.name === name);
    return propHex(p?.color);
  };

  const toggleSort = () => changeBookingSortOrder((o) => (o === 'desc' ? 'asc' : o === 'asc' ? 'upcoming' : 'desc'));
  const sortIcon = bookingSortOrder === 'asc' ? <ArrowUp /> : <ArrowDown />;
  const sortLabel = bookingSortOrder === 'upcoming' ? 'Nadchodzące' : bookingSortOrder === 'asc' ? 'Rosnąco' : 'Malejąco';

  return (
    <div className="wpd-panel">
      <div className="wpd-panel__head">
        <div className="wpd-seg">
          <button className={`wpd-seg__btn${bookingFilter === 'all' ? ' wpd-seg__btn--active' : ''}`}
            onClick={() => changeBookingFilter('all')}>Wszystkie<span className="wpd-seg__count">{counts.all}</span></button>
          <button className={`wpd-seg__btn${bookingFilter === 'upcoming' ? ' wpd-seg__btn--active' : ''}`}
            onClick={() => changeBookingFilter('upcoming')}>Nadchodzące<span className="wpd-seg__count">{counts.upcoming}</span></button>
          <button className={`wpd-seg__btn${bookingFilter === 'archived' ? ' wpd-seg__btn--active' : ''}`}
            onClick={() => changeBookingFilter('archived')}>Archiwalne<span className="wpd-seg__count">{counts.archived}</span></button>
          <button className={`wpd-seg__btn${bookingFilter === 'tasks' ? ' wpd-seg__btn--active' : ''}`}
            onClick={() => changeBookingFilter('tasks')}>Zadania<span className="wpd-seg__count">{counts.tasks ?? 0}</span></button>
        </div>
      </div>

      {bookingFilter === 'tasks' ? (
        <div style={{ overflowX: 'auto' }}>
          <table className="wpd-table">
            <thead>
              <tr>
                {/* bez przełącznika sortowania: zadania sortuje `utilitySortOrder`,
                    więc `bookingSortOrder` z tego nagłówka byłby martwym przyciskiem */}
                <th>Termin</th>
                <th>Zadanie</th>
                <th>Obiekt</th>
                <th>Status</th>
                <th className="wpd-num">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {paginatedBookings.map((r) => {
                const propName = typeof r.property === 'object' ? r.property?.name : r.property;
                return (
                  <tr key={r.id}>
                    <td className="wpd-cell-num">{r.date || '—'}</td>
                    <td className="wpd-cell-strong">{r.text || r.guest || '—'}</td>
                    <td>
                      {propName ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                          <span className="wpd-dot" style={{ background: propColor(propName) }} />
                          {propName}
                        </span>
                      ) : <span style={{ color: 'var(--faint)' }}>—</span>}
                    </td>
                    <td>
                      <button
                        className={`wpd-check ${r.isCompleted ? 'wpd-check--on' : 'wpd-check--off'}`}
                        title={r.isCompleted ? 'Zrobione' : 'Oznacz jako zrobione'}
                        onClick={() => toggleStatus(r.id, 'isCompleted')}
                      >{r.isCompleted ? <CheckCircle /> : <XCircle style={{ opacity: 0 }} />}</button>
                    </td>
                    <td className="wpd-num">
                      <span style={{ display: 'inline-flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="wpd-iconbtn" title="Edytuj" onClick={() => openEditModal(r)}><Edit /></button>
                        <button className="wpd-iconbtn wpd-btn--danger" title="Usuń" onClick={() => handleDeleteClick(r.id)}><Trash2 /></button>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {paginatedBookings.length === 0 && (
            <div className="wpd-empty">
              <div className="wpd-empty__icon"><CheckCircle /></div>
              <p>Brak zadań. Dodasz je przyciskiem „+ Rezerwacja" — zakładka „Zadanie".</p>
            </div>
          )}
        </div>
      ) : (
      <div style={{ overflowX: 'auto' }}>
        <table className="wpd-table">
          <thead>
            <tr>
              <th>Obiekt</th>
              <th>Gość</th>
              <th>
                <button className="wpd-table__sort" onClick={toggleSort} title="Zmień sortowanie">
                  Termin {sortIcon} <span style={{ color: 'var(--faint)' }}>({sortLabel})</span>
                </button>
              </th>
              <th>Źródło</th>
              <th className="wpd-num">Przychód</th>
              <th>Status</th>
              <th className="wpd-num">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {paginatedBookings.map((r) => {
              const propName = typeof r.property === 'object' ? r.property?.name : r.property;
              return (
                <tr key={r.id} {...clickableProps(() => onOpenDetail?.(r))} style={{ cursor: 'pointer' }}>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <span className="wpd-dot" style={{ background: propColor(propName) }} />
                      <span className="wpd-cell-strong">{propName || '—'}</span>
                    </span>
                  </td>
                  <td>
                    <div className="wpd-cell-strong">{r.guest || '—'}</div>
                    {r.phone && <div className="wpd-cell-sub wpd-cell-num">{r.phone}</div>}
                  </td>
                  <td className="wpd-cell-num">
                    {r.date || '—'}{r.endDate ? <span style={{ color: 'var(--faint)' }}> → {r.endDate}</span> : ''}
                  </td>
                  <td>
                    {r.source
                      ? <SourceTag source={r.source} />
                      : <span className="wpd-tag wpd-tag--muted">—</span>}
                  </td>
                  <td className="wpd-num wpd-cell-num wpd-cell-strong">{fmt(r.income)} zł</td>
                  <td>
                    <button
                      className={`wpd-check ${r.isPaid ? 'wpd-check--on' : 'wpd-check--off'}`}
                      title={r.isPaid ? 'Opłacone' : 'Oznacz jako opłacone'}
                      onClick={(e) => { e.stopPropagation(); toggleStatus(r.id, 'isPaid'); }}
                    >{r.isPaid ? <CheckCircle /> : <XCircle style={{ opacity: 0 }} />}</button>
                  </td>
                  <td className="wpd-num">
                    <span style={{ display: 'inline-flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button className="wpd-iconbtn" title="Edytuj" onClick={(e) => { e.stopPropagation(); openEditModal(r); }}><Edit /></button>
                      <button className="wpd-iconbtn wpd-btn--danger" title="Usuń" onClick={(e) => { e.stopPropagation(); handleDeleteClick(r.id); }}><Trash2 /></button>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {paginatedBookings.length === 0 && (
          <div className="wpd-empty">
            <div className="wpd-empty__icon"><CalendarDays /></div>
            <p>Brak rezerwacji w tym widoku.</p>
          </div>
        )}
      </div>
      )}
    </div>
  );
}
