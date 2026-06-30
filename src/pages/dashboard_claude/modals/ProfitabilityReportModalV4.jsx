import React from 'react';
import { BarChart3, X } from 'lucide-react';
import { monthNames } from '../../../utils/constants';

const fmt = (n) => new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(Math.round(Number(n) || 0));

/* Raport rentowności — styl V4. Kontrakt propsów 1:1 z oryginałem. */
function ProfitabilityReportModalV4({ showStatsModal, setShowStatsModal, selectedYear, handleYearChange, availableYears, currentYearData }) {
  if (!showStatsModal) return null;
  const t = currentYearData.total;

  return (
    <div className="wpd-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowStatsModal(false); }}>
      <div className="wpd-dialog wpd-dialog--lg">
        <div className="wpd-dialog__head">
          <span className="wpd-dialog__ic"><BarChart3 /></span>
          <div>
            <h2 className="wpd-h2">Raport rentowności</h2>
            <p className="wpd-dialog__sub">Zestawienie przychodów i kosztów</p>
          </div>
          <select className="wpd-select" style={{ width: 'auto', marginLeft: 'auto' }} value={selectedYear} onChange={(e) => handleYearChange(e.target.value)}>
            {availableYears.map((y) => <option key={y} value={y}>Rok {y}</option>)}
          </select>
          <button className="wpd-dialog__close" onClick={() => setShowStatsModal(false)}><X /></button>
        </div>

        <div className="wpd-dialog__body">
          <div className="wpd-stats" style={{ marginBottom: 24 }}>
            <div className="wpd-stat" style={{ cursor: 'default' }}>
              <p className="wpd-stat__label">Przychód</p>
              <div className="wpd-stat__value">{fmt(t.income)} <small>zł</small></div>
            </div>
            <div className="wpd-stat" style={{ cursor: 'default' }}>
              <p className="wpd-stat__label">Koszty</p>
              <div className="wpd-stat__value" style={{ color: 'var(--cynober)' }}>{fmt(t.costs)} <small>zł</small></div>
            </div>
            <div className="wpd-stat" style={{ cursor: 'default' }}>
              <p className="wpd-stat__label">Podatek</p>
              <div className="wpd-stat__value" style={{ color: 'var(--granat)' }}>{fmt(t.tax)} <small>zł</small></div>
            </div>
            <div className="wpd-stat wpd-stat--dark" style={{ cursor: 'default' }}>
              <p className="wpd-stat__label">Zysk netto</p>
              <div className="wpd-stat__value">{fmt(t.profit)} <small>zł</small></div>
            </div>
          </div>

          <div className="wpd-panel">
            <div className="wpd-panel__head"><h2 className="wpd-h2" style={{ fontSize: 15 }}>Miesiąc po miesiącu</h2></div>
            <table className="wpd-table">
              <thead>
                <tr>
                  <th>Miesiąc</th>
                  <th className="wpd-num">Przychód</th>
                  <th className="wpd-num">Koszty</th>
                  <th className="wpd-num">Podatek</th>
                  <th className="wpd-num">Zysk netto</th>
                </tr>
              </thead>
              <tbody>
                {currentYearData.months.map((m, i) => (
                  <tr key={i} style={{ opacity: m.active ? 1 : 0.4 }}>
                    <td className="wpd-cell-strong">{monthNames[i]}</td>
                    <td className="wpd-num wpd-cell-num" style={{ color: 'var(--green)' }}>{m.income > 0 ? `${fmt(m.income)} zł` : '—'}</td>
                    <td className="wpd-num wpd-cell-num" style={{ color: 'var(--cynober)' }}>{m.costs > 0 ? `${fmt(m.costs)} zł` : '—'}</td>
                    <td className="wpd-num wpd-cell-num" style={{ color: 'var(--granat)' }}>{m.tax > 0 ? `${fmt(m.tax)} zł` : '—'}</td>
                    <td className="wpd-num wpd-cell-num wpd-cell-strong">{m.profit !== 0 ? `${fmt(m.profit)} zł` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(ProfitabilityReportModalV4);
