import React, { useRef, useState } from 'react';
import { Camera, X, Trash2, Plus } from 'lucide-react';
import { useDialogA11y } from '../modals/useDialogA11y';

/*
  Zdjęcia zadania (partia 2, krok 7) — minimalny dialog w idiomie panelu:
  podgląd siatki, dodanie z dysku (input file, tylko obrazy), usunięcie.
  Pliki żyją w Storage users/{uid}/tasks/{taskId}/ (storage.rules: właściciel,
  < 10 MB, image/*), metadane w polu `photos` dokumentu (limit 10 — reguły Firestore).
  Dostępne wyłącznie dla zadań z kolekcji `tasks` (source 'task') — legacy i szablony
  nie mają dokumentu, na którym można trwale zapisać zdjęcie.
*/
export default function TaskPhotos({ task, onAdd, onRemove, onClose }) {
  const dialogA11y = useDialogA11y(true, onClose);
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const photos = task?.photos || [];

  const pick = () => fileRef.current?.click();
  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !task) return;
    setBusy(true);
    try { await onAdd(task.id, file, photos); } finally { setBusy(false); }
  };

  return (
    <div className="wpd-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="wpd-dialog wpd-dialog--sm" {...dialogA11y}>
        <div className="wpd-dialog__head">
          <span className="wpd-dialog__ic"><Camera /></span>
          <div style={{ minWidth: 0 }}>
            <h2 className="wpd-h2">Zdjęcia zadania</h2>
            <p className="wpd-dialog__sub" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task?.text}</p>
          </div>
          <button className="wpd-dialog__close" onClick={onClose} title="Zamknij"><X /></button>
        </div>
        <div className="wpd-dialog__body">
          {photos.length === 0 && (
            <div className="wpd-tk-inbox__empty" style={{ marginBottom: 14 }}>Brak zdjęć przy tym zadaniu.</div>
          )}
          <div className="wpd-tk-photos">
            {photos.map((p, i) => (
              <figure className="wpd-tk-photo" key={p.path || i}>
                {/* podgląd w nowej karcie — bez wbudowanej lupy, minimalny idiom */}
                <a href={p.url} target="_blank" rel="noopener noreferrer" title="Otwórz w pełnym rozmiarze">
                  <img src={p.url} alt={`Zdjęcie ${i + 1} zadania`} loading="lazy" />
                </a>
                <button type="button" className="wpd-tk-photo__del" title="Usuń zdjęcie"
                  onClick={() => onRemove(task, i)}><Trash2 /></button>
              </figure>
            ))}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onFile} />
        </div>
        <div className="wpd-dialog__foot">
          <button type="button" className="wpd-btn" onClick={onClose}>Zamknij</button>
          <button type="button" className="wpd-btn wpd-btn--primary" onClick={pick}
            disabled={busy || photos.length >= 10}>
            <Plus />{busy ? 'Wysyłanie…' : photos.length >= 10 ? 'Limit 10 zdjęć' : 'Dodaj zdjęcie'}
          </button>
        </div>
      </div>
    </div>
  );
}
