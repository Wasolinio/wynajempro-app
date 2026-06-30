import React, { useMemo } from 'react';
import { Plus, Building2 } from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 }).format(Math.round(Number(n) || 0));
const up = (s) => (s || '').toUpperCase();

const relDay = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr); d.setHours(0, 0, 0, 0);
  const t = new Date(); t.setHours(0, 0, 0, 0);
  const diff = Math.round((d - t) / 86400000);
  if (diff === 0) return 'dziś';
  if (diff === 1) return 'jutro';
  return dateStr;
};

/*
  Obiekty (03) — wzorzec: ekran 04-app2. Karty obiektów ze zdjęciem-placeholderem
  (kratka jak w brand booku), statusem, ceną/noc i obłożeniem liczonym z rezerwacji,
  oraz statusem iCal i najbliższym przyjazdem. Pola spoza modelu (adres, typ) pomijam.
*/
export default function ObjectsView({ properties, rentals, selectedYear, onAddProperty, onOpenProperty }) {
  const now = new Date();
  const monthName = now.toLocaleDateString('pl-PL', { month: 'long' });

  const statsByProp = useMemo(() => {
    const map = {};
    const todayTime = new Date().setHours(0, 0, 0, 0);
    // okno obłożenia: bieżący miesiąc
    const mIdx = now.getMonth();
    const daysInMonth = new Date(now.getFullYear(), mIdx + 1, 0).getDate();
    const mStart = new Date(now.getFullYear(), mIdx, 1).setHours(0, 0, 0, 0);
    const mEnd = new Date(now.getFullYear(), mIdx, daysInMonth).setHours(0, 0, 0, 0);

    properties.forEach((p) => { map[p.name] = { income: 0, nights: 0, count: 0, monthNights: 0, nextArrival: null }; });
    rentals.forEach((r) => {
      if (r.type !== 'booking' || !r.date) return;
      const propName = typeof r.property === 'object' ? r.property?.name : r.property;
      const m = map[propName];
      if (!m) return;
      const s = new Date(r.date); const e = new Date(r.endDate || r.date);
      if (s.getFullYear().toString() === selectedYear) {
        m.income += Number(r.income) || 0;
        m.nights += Math.max(1, Math.round((e - s) / 86400000) || 1);
        m.count += 1;
      }
      // noce w bieżącym miesiącu (obłożenie)
      const sT = s.setHours(0, 0, 0, 0); const eT = e.setHours(0, 0, 0, 0);
      if (!(eT < mStart || sT > mEnd)) {
        m.monthNights += Math.max(1, Math.round((Math.min(eT, mEnd) - Math.max(sT, mStart)) / 86400000));
      }
      // najbliższy przyjazd
      const st = new Date(r.date).setHours(0, 0, 0, 0);
      if (st >= todayTime && (m.nextArrival === null || st < m.nextArrival)) m.nextArrival = st;
    });
    Object.values(map).forEach((m) => {
      m.avgRate = m.nights > 0 ? Math.round(m.income / m.nights) : null;
      m.occupancy = Math.min(100, Math.round((m.monthNights / daysInMonth) * 100));
    });
    return map;
  }, [properties, rentals, selectedYear]);

  return (
    <>
      <div className="wpd-objs__head">
        <span className="wpd-label">{properties.length} {properties.length === 1 ? 'obiekt' : 'obiekty'} · wszystkie aktywne</span>
        <button className="wpd-btn" onClick={onAddProperty}><Plus /> Dodaj obiekt</button>
      </div>

      {properties.length === 0 ? (
        <div className="wpd-soon">
          <div className="wpd-soon__card">
            <p className="wpd-label" style={{ marginBottom: 8 }}>Brak obiektów</p>
            <p style={{ margin: '0 0 14px', color: 'var(--muted)', fontSize: 14 }}>Dodaj pierwszy obiekt, aby zacząć.</p>
            <button className="wpd-btn wpd-btn--primary" onClick={onAddProperty}><Plus /> Dodaj obiekt</button>
          </div>
        </div>
      ) : (
        <div className="wpd-objs">
          {properties.map((p, i) => {
            const s = statsByProp[p.name] || {};
            const next = relDay(s.nextArrival ? new Date(s.nextArrival).toISOString().split('T')[0] : null);
            const hasIcal = !!p.secretToken;
            return (
              <div className="wpd-obj" key={p.name} onClick={() => onOpenProperty(p)} style={{ cursor: 'pointer' }}>
                <div className="wpd-obj__photo">
                  <span className="wpd-obj__fot">FOT. {String(i + 1).padStart(2, '0')}</span>
                  <span className="wpd-obj__status"><span className="wpd-dot" style={{ background: 'var(--green-dot)' }} /> Aktywny</span>
                </div>
                <div className="wpd-obj__body">
                  <h3 className="wpd-obj__name">{p.name}</h3>
                  <div className="wpd-obj__addr">{s.count || 0} rezerwacji w {selectedYear}</div>

                  <div className="wpd-obj__metrics">
                    <div>
                      <div className="wpd-obj__mlabel">Śr. cena/noc</div>
                      <div className="wpd-obj__mval">{s.avgRate ? <>{fmt(s.avgRate)} <small>zł</small></> : '—'}</div>
                    </div>
                    <div>
                      <div className="wpd-obj__mlabel">Obłożenie · {up(monthName)}</div>
                      <div className="wpd-obj__mval">{s.occupancy || 0}<small>%</small></div>
                    </div>
                  </div>

                  <div className="wpd-obj__foot">
                    <span className="wpd-obj__footitem">
                      <span className="wpd-dot" style={{ background: hasIcal ? 'var(--green-dot)' : 'var(--amber)', width: 6, height: 6 }} />
                      iCal {hasIcal ? 'OK' : '—'}
                    </span>
                    <span className="wpd-obj__footitem">
                      Najbliższy przyjazd: <b>{next ? up(next) : 'BRAK'}</b>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
