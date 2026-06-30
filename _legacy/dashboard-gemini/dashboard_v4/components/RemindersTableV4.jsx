import React from 'react';
import { ArrowDown, ArrowUp, Edit, Trash2, Bell } from 'lucide-react';

const RemindersTableV4 = ({
  paginatedReminders,
  utilitySortOrder,
  changeUtilitySortOrder,
  toggleStatus,
  openEditModal,
  handleDeleteClick
}) => {
  return (
    <div style={{ background: '#FBFAF6', border: '1px solid #DDD5C3', borderRadius: '4px', overflow: 'hidden' }}>
      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead className="mono" style={{ background: '#E0D8C6', color: '#3D382E', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.05em' }}>
          <tr>
            <th style={{ padding: '16px 20px', borderBottom: '1px solid #EFE9DA', fontWeight: 600 }}>Zadanie</th>
            <th 
              style={{ padding: '16px 20px', borderBottom: '1px solid #EFE9DA', fontWeight: 600, cursor: 'pointer', textAlign: 'center' }}
              onClick={() => changeUtilitySortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            >
               <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                 Termin {utilitySortOrder === 'desc' ? <ArrowDown className="w-3 h-3"/> : <ArrowUp className="w-3 h-3"/>}
               </div>
            </th>
            <th style={{ padding: '16px 20px', borderBottom: '1px solid #EFE9DA', fontWeight: 600, textAlign: 'center' }}>Status</th>
            <th style={{ padding: '16px 20px', borderBottom: '1px solid #EFE9DA', fontWeight: 600, textAlign: 'center' }}>Akcje</th>
          </tr>
        </thead>
        <tbody>
          {paginatedReminders.map((r, index) => (
            <tr key={r.id} style={{ borderBottom: index === paginatedReminders.length - 1 ? 'none' : '1px solid #EFE9DA', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#F6F1E3'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              <td style={{ padding: '16px 20px', fontWeight: 600, color: '#17150F', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bell className="w-4 h-4 text-[#D9492B]" /> {r.text}
              </td>
              <td className="mono" style={{ padding: '16px 20px', textAlign: 'center', color: '#524C3F', fontSize: '12px' }}>{r.date}</td>
              <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                <button 
                  onClick={() => toggleStatus(r.id, 'isCompleted')} 
                  className="mono"
                  style={{ 
                    padding: '6px 12px', 
                    borderRadius: '3px', 
                    fontSize: '10px', 
                    fontWeight: 600, 
                    textTransform: 'uppercase', 
                    letterSpacing: '.04em',
                    cursor: 'pointer',
                    background: r.isCompleted ? '#E0D8C6' : 'transparent', 
                    color: r.isCompleted ? '#3D382E' : '#A0987F', 
                    border: r.isCompleted ? '1px solid #E0D8C6' : '1px solid #DDD5C3'
                  }}
                >
                  {r.isCompleted ? '✔ Wykonane' : 'Oczekuje'}
                </button>
              </td>
              <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                <button onClick={() => openEditModal(r)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', color: '#A0987F' }} onMouseEnter={(e) => e.currentTarget.style.color = '#3D382E'} onMouseLeave={(e) => e.currentTarget.style.color = '#A0987F'}><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDeleteClick(r.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', color: '#A0987F', marginLeft: '4px' }} onMouseEnter={(e) => e.currentTarget.style.color = '#D9492B'} onMouseLeave={(e) => e.currentTarget.style.color = '#A0987F'}><Trash2 className="w-4 h-4" /></button>
              </td>
            </tr>
          ))}
          {paginatedReminders.length === 0 && (
            <tr>
              <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#A0987F', fontSize: '14px' }}>Brak przypomnień.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(RemindersTableV4);
