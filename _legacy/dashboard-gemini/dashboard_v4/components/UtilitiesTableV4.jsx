import React from 'react';
import { ArrowDown, ArrowUp, Edit, Trash2 } from 'lucide-react';

const UtilitiesTableV4 = ({
  paginatedUtilities,
  utilitySortOrder,
  changeUtilitySortOrder,
  openEditModal,
  handleDeleteClick
}) => {
  return (
    <div style={{ background: '#FBFAF6', border: '1px solid #DDD5C3', borderRadius: '4px', overflow: 'hidden' }}>
      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead className="mono" style={{ background: '#E0D8C6', color: '#3D382E', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.05em' }}>
          <tr>
            <th style={{ padding: '16px 20px', borderBottom: '1px solid #EFE9DA', fontWeight: 600 }}>Opis Kosztu</th>
            <th 
              style={{ padding: '16px 20px', borderBottom: '1px solid #EFE9DA', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => changeUtilitySortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            >
               <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                 Data {utilitySortOrder === 'desc' ? <ArrowDown className="w-3 h-3"/> : <ArrowUp className="w-3 h-3"/>}
               </div>
            </th>
            <th style={{ padding: '16px 20px', borderBottom: '1px solid #EFE9DA', fontWeight: 600, textAlign: 'right' }}>Kwota</th>
            <th style={{ padding: '16px 20px', borderBottom: '1px solid #EFE9DA', fontWeight: 600, textAlign: 'center' }}>Akcje</th>
          </tr>
        </thead>
        <tbody>
          {paginatedUtilities.map((r, index) => (
            <tr key={r.id} style={{ borderBottom: index === paginatedUtilities.length - 1 ? 'none' : '1px solid #EFE9DA', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#F6F1E3'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              <td style={{ padding: '16px 20px' }}>
                <span className="mono" style={{ background: '#E0D8C6', color: '#3D382E', padding: '4px 8px', borderRadius: '3px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em', marginRight: '12px' }}>{r.category}</span> 
                <span style={{ fontWeight: 600, color: '#17150F', fontSize: '14px' }}>{r.guest}</span> 
                <div className="mono" style={{ color: '#9A917D', fontSize: '11px', marginTop: '6px', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                  {typeof r.property === 'object' ? r.property.name : r.property}
                </div>
              </td>
              <td className="mono" style={{ padding: '16px 20px', color: '#524C3F', fontSize: '12px' }}>{r.date}</td>
              <td className="mono" style={{ padding: '16px 20px', textAlign: 'right', fontWeight: 600, color: '#D9492B', fontSize: '14px' }}>{Number(r.utilities).toLocaleString('pl-PL')} zł</td>
              <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                <button onClick={() => openEditModal(r)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', color: '#A0987F' }} onMouseEnter={(e) => e.currentTarget.style.color = '#3D382E'} onMouseLeave={(e) => e.currentTarget.style.color = '#A0987F'}><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDeleteClick(r.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', color: '#A0987F', marginLeft: '4px' }} onMouseEnter={(e) => e.currentTarget.style.color = '#D9492B'} onMouseLeave={(e) => e.currentTarget.style.color = '#A0987F'}><Trash2 className="w-4 h-4" /></button>
              </td>
            </tr>
          ))}
          {paginatedUtilities.length === 0 && (
            <tr>
              <td colSpan="4" style={{ padding: '40px', textAlign: 'center', color: '#A0987F', fontSize: '14px' }}>Brak zarejestrowanych wydatków.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(UtilitiesTableV4);
