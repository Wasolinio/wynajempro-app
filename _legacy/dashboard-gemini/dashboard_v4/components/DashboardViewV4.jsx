import React, { useMemo } from 'react';

export default function DashboardViewV4({ stats, dailyReport, rentals, upcomingBookings, goCal, goRes }) {
  // Obliczenia na podstawie rzeczywistych danych
  const arrivalsCount = dailyReport.arrivals.length;
  const departuresCount = dailyReport.departures.length;
  
  const toCleanCount = useMemo(() => {
    return dailyReport.tasks.filter(t => t.taskId === 'cleaning').length;
  }, [dailyReport.tasks]);

  const getDayName = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      const day = date.toLocaleDateString('pl-PL', { weekday: 'short' });
      return day.toUpperCase();
    } catch { return ''; }
  };

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0, border: '1px solid #DDD5C3', borderRadius: '4px', background: '#FBFAF6', marginBottom: '24px' }}>
        <div style={{ padding: '20px', borderRight: '1px solid #EFE9DA' }}>
          <div className="mono" style={{ fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#A0987F', marginBottom: '10px' }}>Przychód · Rok</div>
          <div style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-.02em' }}>{stats.income.toLocaleString('pl-PL')} zł</div>
        </div>
        <div style={{ padding: '20px', borderRight: '1px solid #EFE9DA' }}>
          <div className="mono" style={{ fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#A0987F', marginBottom: '10px' }}>Zysk Netto</div>
          <div style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-.02em' }}>{stats.profit.toLocaleString('pl-PL')} zł</div>
        </div>
        <div style={{ padding: '20px', borderRight: '1px solid #EFE9DA' }}>
          <div className="mono" style={{ fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#A0987F', marginBottom: '10px' }}>Przyjazdy dziś</div>
          <div style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-.02em' }}>{arrivalsCount}</div>
          <div className="mono" style={{ fontSize: '11px', color: '#9A917D', marginTop: '6px' }}>+ {departuresCount} WYJAZDÓW</div>
        </div>
        <div style={{ padding: '20px' }}>
          <div className="mono" style={{ fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#A0987F', marginBottom: '10px' }}>Zadania na dziś</div>
          <div style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-.02em' }}>{dailyReport.tasks.length}</div>
          <div className="mono" style={{ fontSize: '11px', color: '#D9492B', marginTop: '6px' }}>{toCleanCount} SPRZĄTAŃ</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
        <div style={{ background: '#FBFAF6', border: '1px solid #DDD5C3', borderRadius: '4px', padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div className="mono" style={{ fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#A0987F' }}>Najbliższe przyjazdy</div>
            <span onClick={goCal} style={{ fontSize: '13px', color: '#D9492B', fontWeight: 600, cursor: 'pointer' }}>Kalendarz →</span>
          </div>
          {upcomingBookings.slice(0, 5).map(booking => (
            <div key={booking.id} onClick={goRes} style={{ display: 'grid', gridTemplateColumns: '54px 1fr auto auto', gap: '14px', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #EFE9DA', cursor: 'pointer' }}>
              <div className="mono" style={{ fontSize: '10px', fontWeight: 600, textAlign: 'center', padding: '5px 0', borderRadius: '3px', background: '#E0D8C6', color: '#3D382E', letterSpacing: '.04em' }}>{getDayName(booking.date)}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '15px', fontWeight: 600 }}>{booking.guest}</div>
                <div className="mono" style={{ fontSize: '10px', color: '#9A917D', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                   {typeof booking.property === 'object' ? booking.property.name : booking.property}
                </div>
              </div>
              <div className="mono" style={{ fontSize: '12px', color: '#524C3F', textAlign: 'right' }}>{booking.date}</div>
              <div className="mono" style={{ fontSize: '10px', color: '#524C3F', background: '#F0EADC', padding: '4px 8px', borderRadius: '3px', letterSpacing: '.04em', textTransform: 'uppercase' }}>{booking.source}</div>
            </div>
          ))}
          {upcomingBookings.length === 0 && (
            <div style={{ padding: '20px 0', color: '#A0987F', fontSize: '14px' }}>Brak nadchodzących rezerwacji.</div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: '#17150F', borderRadius: '4px', padding: '22px', color: '#E4DDCE' }}>
            <div className="mono" style={{ fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#6B6555', marginBottom: '18px' }}>Najbliższe zdarzenia</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
               {dailyReport.arrivals.map(a => (
                 <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                   <span style={{ fontSize: '13px' }}>Przyjazd: {a.guest}</span>
                   <span className="mono" style={{ fontSize: '10px', color: '#A0987F' }}>{typeof a.property === 'object' ? a.property.name : a.property}</span>
                 </div>
               ))}
               {dailyReport.departures.map(d => (
                 <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                   <span style={{ fontSize: '13px' }}>Wyjazd: {d.guest}</span>
                   <span className="mono" style={{ fontSize: '10px', color: '#A0987F' }}>{typeof d.property === 'object' ? d.property.name : d.property}</span>
                 </div>
               ))}
               {dailyReport.arrivals.length === 0 && dailyReport.departures.length === 0 && (
                 <div style={{ color: '#6B6555', fontSize: '13px' }}>Brak przyjazdów i wyjazdów dzisiaj.</div>
               )}
            </div>
          </div>
          <div style={{ background: '#FBFAF6', border: '1px solid #DDD5C3', borderRadius: '4px', padding: '22px' }}>
            <div className="mono" style={{ fontSize: '11px', letterSpacing: '.1em', textTransform: 'uppercase', color: '#A0987F', marginBottom: '14px' }}>Zadania na dziś</div>
            {dailyReport.tasks.length === 0 ? (
               <div style={{ color: '#A0987F', fontSize: '13px' }}>Brak zadań na dziś.</div>
            ) : (
              dailyReport.tasks.slice(0, 5).map(task => (
                <div key={`${task.id}-${task.taskId}`} style={{ display: 'flex', alignItems: 'center', gap: '11px', padding: '9px 0', borderBottom: '1px solid #EFE9DA' }}>
                  <span style={{ width: '16px', height: '16px', borderRadius: '3px', border: '1.5px solid #D9492B', flexShrink: 0 }}></span>
                  <span style={{ fontSize: '14px' }}>{task.text} · {task.property}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
