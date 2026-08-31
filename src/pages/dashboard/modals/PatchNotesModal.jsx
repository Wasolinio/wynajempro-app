import React from 'react';
import { Sparkles, X } from 'lucide-react';
import { useDialogA11y } from './useDialogA11y';

/* E4: popup „Co nowego" — patch noty z src/data/patchNotes.js (plik generowany
   z docs/marketing/patch-notes.md). Wzorzec 1:1 jak DailyReportModal. Rodzic podaje
   już przefiltrowane wpisy (nowsze niż lastSeenPatchNote / data rejestracji, maks 5)
   i JEDEN handler zamknięcia — X, klik w tło, Escape i „Rozumiem" robią to samo:
   zapis lastSeenPatchNote + zamknięcie. */

// „29 sierpnia" po polsku; rok dopisujemy tylko, gdy wpis nie jest z bieżącego roku.
// Parsowanie ręczne (bez new Date('RRRR-MM-DD')), żeby strefa czasowa nie przesunęła dnia.
const formatujDate = (dateStr) => {
  const [y, m, d] = String(dateStr).split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  const opts = { day: 'numeric', month: 'long' };
  if (y !== new Date().getFullYear()) opts.year = 'numeric';
  return new Date(y, m - 1, d).toLocaleDateString('pl-PL', opts);
};

function PatchNotesModal({ show, entries, onClose }) {
  const open = show && entries.length > 0;
  const dialogA11y = useDialogA11y(open, onClose);
  if (!open) return null;

  return (
    <div className="wpd-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {/* aria-labelledby + aria-label na X: inne modale panelu tego nie mają (dług
          wzorca, Backlog), ale ten jako jedyny otwiera się SAM — czytnik ekranu musi
          usłyszeć, co mu wyskoczyło (przegląd 2026-08-31). */}
      <div className="wpd-dialog" {...dialogA11y} aria-labelledby="wpd-pn-title">
        <div className="wpd-dialog__head">
          <span className="wpd-dialog__ic"><Sparkles /></span>
          <div>
            <h2 className="wpd-h2" id="wpd-pn-title">Co nowego w panelu</h2>
            <p className="wpd-dialog__sub">Zmiany od Twojej ostatniej wizyty</p>
          </div>
          <button className="wpd-dialog__close" onClick={onClose} aria-label="Zamknij"><X /></button>
        </div>

        <div className="wpd-dialog__body">
          {entries.map((wpis) => (
            <section className="wpd-pn__sec" key={wpis.id}>
              <p className="wpd-pn__date">{formatujDate(wpis.date)}</p>
              <h3 className="wpd-pn__title">{wpis.title}</h3>
              <ul className="wpd-pn__list">
                {wpis.items.map((punkt, i) => (
                  <li className="wpd-pn__item" key={i}>{punkt}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="wpd-dialog__foot">
          <button className="wpd-btn wpd-btn--primary" onClick={onClose}>Rozumiem</button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(PatchNotesModal);
