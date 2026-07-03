import React from 'react';
import { Trash2 } from 'lucide-react';
import { useDialogA11y } from './useDialogA11y';

/* Potwierdzenie usunięcia — styl V4. */
export default function DeleteConfirmModal({ onCancel, onConfirm }) {
  // montowany warunkowo przez rodzica → zawsze „otwarty"
  const dialogA11y = useDialogA11y(true, onCancel);
  return (
    <div className="wpd-overlay" style={{ zIndex: 90 }} onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="wpd-dialog wpd-dialog--sm" {...dialogA11y}>
        <div className="wpd-dialog__body" style={{ textAlign: 'center', paddingTop: 32 }}>
          <span className="wpd-dialog__ic" style={{ margin: '0 auto 16px', width: 46, height: 46 }}><Trash2 /></span>
          <h2 className="wpd-h2" style={{ marginBottom: 8 }}>Usuwanie wpisu</h2>
          <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
            Czy na pewno chcesz bezpowrotnie usunąć ten wpis? Tej akcji nie da się cofnąć.
          </p>
        </div>
        <div className="wpd-dialog__foot">
          <button className="wpd-btn" onClick={onCancel}>Anuluj</button>
          <button className="wpd-btn wpd-btn--primary" onClick={onConfirm}>Tak, usuń</button>
        </div>
      </div>
    </div>
  );
}
