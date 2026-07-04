import React, { useState } from 'react';
import { Bell, X, CalendarClock } from 'lucide-react';

/*
  Pływający widget zadań na dziś. Renderowany wewnątrz panelu (.wpd),
  więc korzysta z tokenów var(--…) tego namespace'u — identyfikacja WynajemPRO v2.
*/
export default function FloatingTaskWidget({ tasks = [] }) {
  const [isVisible, setIsVisible] = useState(true);
  if (!isVisible || tasks.length === 0) return null;

  const sortedTasks = [...tasks].sort((a, b) => a.days - b.days);
  const mostUrgent = sortedTasks[0];

  return (
    <div className="wpd-taskwidget" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 50, width: 300, maxWidth: 'calc(100vw - 32px)' }}>
      <div style={{
        // separacja od tła linią 1px ink zamiast cienia — zasada v2 „zero cieni"
        position: 'relative', background: 'var(--surface)', border: '1px solid var(--ink)',
        borderRadius: 4, padding: 18,
      }}>
        <span style={{ position: 'absolute', top: -5, left: -5, width: 12, height: 12, borderRadius: '50%', background: 'var(--cynober)', border: '2px solid var(--surface)' }} />

        <button onClick={() => setIsVisible(false)} title="Ukryj"
          style={{ position: 'absolute', top: 12, right: 12, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--faint)', display: 'flex', padding: 2 }}>
          <X style={{ width: 16, height: 16 }} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 34, height: 34, borderRadius: 3, border: '1px solid var(--hairline)', background: 'var(--paper)', color: 'var(--cynober)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 34px' }}>
            <Bell style={{ width: 16, height: 16 }} />
          </span>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: 14, margin: 0, color: 'var(--ink)' }}>Zadania na dziś</h3>
            <p className="wpd-mono" style={{ fontSize: 11, color: 'var(--cynober)', margin: '2px 0 0' }}>Oczekujące: {tasks.length}</p>
          </div>
        </div>

        <div style={{ marginTop: 14, paddingTop: 13, borderTop: '1px solid var(--hairline)' }}>
          <p className="wpd-mono" style={{ fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--label)', margin: '0 0 8px' }}>Najpilniejsze</p>
          <div style={{ background: 'var(--inner)', border: '1px solid var(--hairline)', borderRadius: 4, padding: 12 }}>
            <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink)', margin: 0, lineHeight: 1.4 }}>{mostUrgent.text}</p>
            <div className="wpd-mono" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 10, color: 'var(--faint)' }}>
              <CalendarClock style={{ width: 13, height: 13 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mostUrgent.property}{mostUrgent.guest ? ` · ${mostUrgent.guest}` : ''}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
