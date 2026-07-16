import React, { useState } from 'react';
import { Repeat, X } from 'lucide-react';
import { useDialogA11y } from './useDialogA11y';

const propName = (p) => (typeof p === 'object' ? p?.name : p) || '';
const thisMonth = () => new Date().toISOString().slice(0, 7); // YYYY-MM

/*
  Koszt stały (cykliczny) — X4 partia 2. Kwota miesięczna wpisywana raz, liczona
  w każdym aktywnym miesiącu (od startMonth do endMonth lub bezterminowo).
  Modal tylko zbiera dane i woła onSave(cost); id i zapis ogarnia CostsView.
  Kształt: { id, name, amount, category, property, startMonth, endMonth }.
*/
export default function RecurringCostModal({ editing, categories, properties, onCancel, onSave }) {
  const [form, setForm] = useState(() => ({
    name: editing?.name || '',
    amount: editing?.amount ?? '',
    category: editing?.category || categories[0] || 'Inne',
    property: editing?.property || '', // '' = wszystkie obiekty
    startMonth: editing?.startMonth || thisMonth(),
    endMonth: editing?.endMonth || '',
  }));
  const dialogA11y = useDialogA11y(true, onCancel);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const amountNum = Number(String(form.amount).replace(',', '.'));
  const invalidRange = form.endMonth && form.endMonth < form.startMonth;
  const canSave = form.name.trim() && amountNum > 0 && form.startMonth && !invalidRange;

  const submit = (e) => {
    e.preventDefault();
    if (!canSave) return;
    onSave({
      name: form.name.trim().slice(0, 200),
      amount: amountNum,
      category: form.category || 'Inne',
      property: form.property,
      startMonth: form.startMonth,
      endMonth: form.endMonth || '',
    });
  };

  return (
    <div className="wpd-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="wpd-dialog wpd-dialog--sm" {...dialogA11y}>
        <div className="wpd-dialog__head">
          <span className="wpd-dialog__ic"><Repeat /></span>
          <div>
            <h2 className="wpd-h2">{editing ? 'Edytuj koszt stały' : 'Nowy koszt stały'}</h2>
            <p className="wpd-dialog__sub">Kwota miesięczna liczona w każdym aktywnym miesiącu</p>
          </div>
          <button className="wpd-dialog__close" onClick={onCancel}><X /></button>
        </div>

        <form onSubmit={submit} style={{ display: 'contents' }}>
          <div className="wpd-dialog__body">
            <div className="wpd-field">
              <label className="wpd-flabel">Nazwa</label>
              <input className="wpd-input" required value={form.name} maxLength={200}
                placeholder="np. Ubezpieczenie domku" onChange={(e) => set('name', e.target.value)} />
            </div>

            <div className="wpd-fgrid">
              <div className="wpd-field">
                <label className="wpd-flabel">Kwota miesięczna</label>
                <input className="wpd-input wpd-input--num" required type="number" min="0" step="0.01"
                  placeholder="0,00" value={form.amount} onChange={(e) => set('amount', e.target.value)} />
              </div>
              <div className="wpd-field">
                <label className="wpd-flabel">Kategoria</label>
                <select className="wpd-select" value={form.category} onChange={(e) => set('category', e.target.value)}>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  {!categories.includes(form.category) && form.category && <option value={form.category}>{form.category}</option>}
                </select>
              </div>
            </div>

            <div className="wpd-field">
              <label className="wpd-flabel">Obiekt</label>
              <select className="wpd-select" value={form.property} onChange={(e) => set('property', e.target.value)}>
                <option value="">Wszystkie obiekty</option>
                {properties.map((p) => <option key={propName(p)} value={propName(p)}>{propName(p)}</option>)}
              </select>
            </div>

            <div className="wpd-fgrid">
              <div className="wpd-field">
                <label className="wpd-flabel">Od miesiąca</label>
                <input className="wpd-input wpd-input--num" required type="month" value={form.startMonth} onChange={(e) => set('startMonth', e.target.value)} />
              </div>
              <div className="wpd-field">
                <label className="wpd-flabel">Do miesiąca (opcjonalnie)</label>
                <input className="wpd-input wpd-input--num" type="month" min={form.startMonth} value={form.endMonth} onChange={(e) => set('endMonth', e.target.value)} />
              </div>
            </div>
            {invalidRange
              ? <p className="wpd-body" style={{ color: 'var(--cynober)', fontSize: 12.5, margin: '2px 0 0' }}>Miesiąc końcowy nie może być wcześniejszy niż początkowy.</p>
              : <p className="wpd-body" style={{ color: 'var(--faint)', fontSize: 12.5, margin: '2px 0 0' }}>Puste „do" = koszt trwa nadal (bez daty końca).</p>}
          </div>

          <div className="wpd-dialog__foot">
            <button type="button" className="wpd-btn" onClick={onCancel}>Anuluj</button>
            <button type="submit" className="wpd-btn wpd-btn--primary" disabled={!canSave}>
              {editing ? 'Zapisz zmiany' : 'Dodaj koszt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
