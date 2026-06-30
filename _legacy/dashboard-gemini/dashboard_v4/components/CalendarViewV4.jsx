import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { propColors } from '../../../utils/constants';

const CalendarViewV4 = ({ calendarDate, rentals, properties, onChangeMonth, onSetToday, onEditRental }) => {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const blanks = Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 });

  return (
    <div style={{ background: '#FBFAF6', border: '1px solid #DDD5C3', borderRadius: '4px', overflow: 'hidden', marginBottom: '24px' }}>
      {/* Header */}
      <div style={{ padding: '20px', borderBottom: '1px solid #EFE9DA', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-.02em', textTransform: 'capitalize' }}>
          {calendarDate.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => onChangeMonth(-1)} style={{ padding: '8px', border: '1px solid #DDD5C3', borderRadius: '3px', background: '#FBFAF6', cursor: 'pointer' }}>
            <ChevronLeft className="w-4 h-4 text-[#3D382E]" />
          </button>
          <button onClick={onSetToday} className="mono" style={{ padding: '8px 16px', border: '1px solid #DDD5C3', borderRadius: '3px', background: '#FBFAF6', fontSize: '11px', fontWeight: 600, letterSpacing: '.05em', cursor: 'pointer', textTransform: 'uppercase' }}>
            Dzisiaj
          </button>
          <button onClick={() => onChangeMonth(1)} style={{ padding: '8px', border: '1px solid #DDD5C3', borderRadius: '3px', background: '#FBFAF6', cursor: 'pointer' }}>
            <ChevronRight className="w-4 h-4 text-[#3D382E]" />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div style={{ overflowX: 'auto', padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(100px, 1fr))', borderTop: '1px solid #EFE9DA', borderLeft: '1px solid #EFE9DA', borderRadius: '3px', overflow: 'hidden' }}>
          {['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz'].map(d => (
            <div key={d} className="mono" style={{ background: '#E0D8C6', padding: '10px', textAlign: 'center', fontSize: '10px', fontWeight: 600, color: '#3D382E', borderRight: '1px solid #EFE9DA', borderBottom: '1px solid #EFE9DA', textTransform: 'uppercase', letterSpacing: '.05em' }}>
              {d}
            </div>
          ))}

          {blanks.map((_, i) => (
             <div key={`b-${i}`} style={{ background: '#F0EADC', borderRight: '1px solid #EFE9DA', borderBottom: '1px solid #EFE9DA', minHeight: '120px' }}></div>
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayStart = new Date(year, month, i + 1).setHours(0,0,0,0);
            const isToday = new Date().setHours(0,0,0,0) === dayStart;
            const dayRentals = rentals.filter(r => r.type === 'booking' && r.date && r.endDate && dayStart >= new Date(r.date).setHours(0,0,0,0) && dayStart <= new Date(r.endDate).setHours(0,0,0,0));

            return (
              <div key={i} style={{ background: isToday ? '#F6F1E3' : '#FBFAF6', minHeight: '120px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px', borderRight: '1px solid #EFE9DA', borderBottom: '1px solid #EFE9DA' }}>
                <span className="mono" style={{ fontSize: '11px', fontWeight: 700, alignSelf: 'flex-end', marginBottom: '4px', color: isToday ? '#D9492B' : '#A0987F', background: isToday ? '#FBFAF6' : 'transparent', padding: isToday ? '2px 6px' : '0', borderRadius: '2px', border: isToday ? '1px solid #D9492B' : 'none' }}>
                  {i + 1}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
                  {dayRentals.map(r => {
                    const col = propColors[properties.find(p => p.name === (typeof r.property === 'object' ? r.property.name : r.property))?.color || 'slate'];
                    const isStart = dayStart === new Date(r.date).setHours(0,0,0,0);
                    const isEnd = dayStart === new Date(r.endDate).setHours(0,0,0,0);
                    const timeLabel = (isStart && isEnd) ? '(1 d.)' : isStart ? '↘ Przyj.' : isEnd ? '↖ Wyj.' : '';
                    return (
                      <div key={r.id} onClick={() => onEditRental(r)} className={r.isPaid ? col?.solid : r.isAdvancePaid ? col?.advance : col?.dashed} style={{ fontSize: '10px', padding: '6px 8px', borderRadius: '3px', cursor: 'pointer', lineHeight: '1.2' }}>
                        <span style={{ fontWeight: 800, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{typeof r.property === 'object' ? r.property.name : r.property}</span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>{r.guest}</span>
                          {timeLabel && <span className="mono" style={{ background: 'rgba(0,0,0,0.15)', padding: '2px 4px', borderRadius: '2px', fontWeight: 600, fontSize: '9px' }}>{timeLabel}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default React.memo(CalendarViewV4);
