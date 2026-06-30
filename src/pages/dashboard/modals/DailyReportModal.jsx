import React from 'react';
import { ClipboardList, X, LogIn, LogOut, CheckSquare, CheckCircle } from 'lucide-react';

/* Raport dzienny — styl V4. Kontrakt propsów 1:1 z oryginałem. */
function DailyReportModal({ showDailyReportModal, setShowDailyReportModal, dailyReport, completeTask }) {
  if (!showDailyReportModal || !dailyReport) return null;
  const close = () => setShowDailyReportModal(false);

  return (
    <div className="wpd-overlay" style={{ zIndex: 85 }} onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="wpd-dialog">
        <div className="wpd-dialog__head">
          <span className="wpd-dialog__ic"><ClipboardList /></span>
          <div>
            <h2 className="wpd-h2">Raport dnia</h2>
            <p className="wpd-dialog__sub">{dailyReport.dateStr}</p>
          </div>
          <button className="wpd-dialog__close" onClick={close}><X /></button>
        </div>

        <div className="wpd-dialog__body">
          {/* Przyjazdy */}
          <section className="wpd-rep__sec">
            <div className="wpd-rep__head">
              <LogIn style={{ color: 'var(--green)' }} />
              <h3>Przyjazdy</h3><span className="wpd-rep__count">{dailyReport.arrivals.length}</span>
            </div>
            {dailyReport.arrivals.length === 0
              ? <div className="wpd-rep__empty">Dzisiaj nikt nie przyjeżdża.</div>
              : dailyReport.arrivals.map((r) => (
                <div className="wpd-rep__item" key={r.id}>
                  <span className="wpd-rep__accent" style={{ background: 'var(--green)' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="wpd-rep__name">{r.guest || 'Rezerwacja'}</div>
                    <div className="wpd-rep__meta">{r.propNameStr}</div>
                  </div>
                  <span className={`wpd-tag wpd-tag--${r.isPaid ? 'green' : 'amber'}`}>{r.isPaid ? 'Opłacone' : 'Do opłacenia'}</span>
                </div>
              ))}
          </section>

          {/* Wyjazdy */}
          <section className="wpd-rep__sec">
            <div className="wpd-rep__head">
              <LogOut style={{ color: 'var(--cynober)' }} />
              <h3>Wyjazdy</h3><span className="wpd-rep__count">{dailyReport.departures.length}</span>
            </div>
            {dailyReport.departures.length === 0
              ? <div className="wpd-rep__empty">Brak wyjazdów na dzisiaj.</div>
              : dailyReport.departures.map((r) => (
                <div className="wpd-rep__item" key={r.id}>
                  <span className="wpd-rep__accent" style={{ background: 'var(--cynober)' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="wpd-rep__name">{r.guest || 'Rezerwacja'}</div>
                    <div className="wpd-rep__meta">{r.propNameStr}</div>
                  </div>
                  <span className="wpd-tag">Sprzątanie</span>
                </div>
              ))}
          </section>

          {/* Zadania */}
          <section className="wpd-rep__sec">
            <div className="wpd-rep__head">
              <CheckSquare style={{ color: 'var(--granat)' }} />
              <h3>Zadania</h3><span className="wpd-rep__count">{dailyReport.tasks.length}</span>
            </div>
            {dailyReport.tasks.length === 0
              ? <div className="wpd-rep__empty">Wszystko gotowe. Możesz odpocząć.</div>
              : dailyReport.tasks.map((t) => (
                <div className="wpd-rep__item" key={`${t.id}-${t.taskId}`}>
                  <span style={{ color: 'var(--muted)', display: 'flex' }}>{t.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="wpd-rep__name">{t.text}</div>
                    <div className="wpd-rep__meta">{t.property}{t.guest ? ` · ${t.guest}` : ''}</div>
                  </div>
                  <button className="wpd-check wpd-check--off" title="Oznacz jako wykonane" onClick={() => completeTask(t.id, t.taskId)}><CheckCircle /></button>
                </div>
              ))}
          </section>
        </div>
      </div>
    </div>
  );
}

export default React.memo(DailyReportModal);
