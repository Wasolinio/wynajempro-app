import React, { useState } from 'react';
import { LineChart, Receipt, FileBarChart, ArrowRight, FileSpreadsheet } from 'lucide-react';
import AnalyticsView from './AnalyticsView';
import CostsView from './CostsView';

/*
  Finanse (X4, partia 1) — fuzja dawnych pulpitów Finanse (05) i Analityka (06)
  w jeden moduł z podzakładkami:
    • Przegląd  → pełna analityka okresowa (KPI, trend, kanały, ranking obiektów)
    • Koszty i opłaty → rozbicie wydatków (gdzie i na co poszły pieniądze)
    • Raporty   → raport rentowności (istniejący) + zapowiedź eksportu dla księgowego
  Kolejne partie: rozbudowa śledzenia zysków, estetyczny PDF, eksport księgowy.
*/
const TABS = [
  { key: 'overview', label: 'Przegląd', icon: LineChart },
  { key: 'costs', label: 'Koszty i opłaty', icon: Receipt },
  { key: 'reports', label: 'Raporty', icon: FileBarChart },
];

export default function FinanceHub({ rentals, properties, user, categories, recurringCosts, selectedYear, setSelectedYear, onOpenReport }) {
  const [tab, setTab] = useState('overview');

  return (
    <>
      <div className="wpd-tabs" role="tablist" aria-label="Sekcje finansów">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            className={`wpd-tab${tab === t.key ? ' wpd-tab--active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            <t.icon style={{ width: 13, height: 13, display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <AnalyticsView
          rentals={rentals} properties={properties} user={user}
          selectedYear={selectedYear} setSelectedYear={setSelectedYear}
        />
      )}

      {tab === 'costs' && (
        <CostsView
          rentals={rentals} properties={properties} user={user}
          categories={categories} recurringCosts={recurringCosts} selectedYear={selectedYear}
        />
      )}

      {tab === 'reports' && (
        <div className="wpd-section">
          <div className="wpd-panel">
            <div className="wpd-panel__head"><h2 className="wpd-h2" style={{ fontSize: 15 }}>Raporty i eksport</h2></div>
            <div style={{ padding: '16px 18px' }}>
              <button className="wpd-listrow" onClick={onOpenReport}
                style={{ width: '100%', textAlign: 'left', cursor: 'pointer', font: 'inherit' }}>
                <span className="wpd-listrow__ic" style={{ background: 'var(--cynober)' }}><FileBarChart /></span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontWeight: 600, fontSize: 14 }}>Raport rentowności</span>
                  <span className="wpd-body" style={{ display: 'block', color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>
                    Podsumowanie przychodów, kosztów i zysku za wybrany rok — do wglądu i wydruku.
                  </span>
                </span>
                <ArrowRight style={{ width: 16, height: 16, color: 'var(--faint)', flex: '0 0 16px' }} />
              </button>

              <div className="wpd-listrow" style={{ marginBottom: 0, opacity: 0.75 }}>
                <span className="wpd-listrow__ic" style={{ background: 'var(--inner-2)', color: 'var(--faint)' }}><FileSpreadsheet /></span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontWeight: 600, fontSize: 14 }}>Eksport dla księgowego</span>
                  <span className="wpd-body" style={{ display: 'block', color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>
                    Zestawienie przychodów i kosztów w formacie gotowym do rozliczenia (PDF / CSV).
                  </span>
                </span>
                <span className="wpd-label" style={{ flex: '0 0 auto', color: 'var(--amber-ink)' }}>Wkrótce</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
