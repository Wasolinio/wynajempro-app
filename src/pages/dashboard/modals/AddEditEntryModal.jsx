import React from 'react';
import { Edit, X, Wallet } from 'lucide-react';

const propName = (p) => (typeof p === 'object' ? p.name : p);

/* Dodaj/edytuj wpis (rezerwacja / koszt / zadanie) — styl V4. Kontrakt propsów 1:1 z oryginałem. */
function AddEditEntryModal({
  showAddModal, handleCloseModal, handleAddRental, editingId,
  newRental, setNewRental, handleRentalChange, properties, sources, categories,
}) {
  if (!showAddModal) return null;

  return (
    <div className="wpd-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}>
      <div className="wpd-dialog">
        <div className="wpd-dialog__head">
          <span className="wpd-dialog__ic"><Edit /></span>
          <div>
            <h2 className="wpd-h2">{editingId ? 'Edytuj wpis' : 'Nowy wpis'}</h2>
            <p className="wpd-dialog__sub">{editingId ? 'Aktualizacja' : 'Dodawanie'} · {newRental.type === 'booking' ? 'Rezerwacja' : newRental.type === 'utility' ? 'Koszt' : 'Zadanie'}</p>
          </div>
          <button className="wpd-dialog__close" onClick={handleCloseModal}><X /></button>
        </div>

        <form onSubmit={handleAddRental} style={{ display: 'contents' }}>
          <div className="wpd-dialog__body">
            <div className="wpd-typetabs">
              <button type="button" className={`wpd-typetab${newRental.type === 'booking' ? ' wpd-typetab--active' : ''}`} onClick={() => setNewRental({ ...newRental, type: 'booking' })}>Rezerwacja</button>
              <button type="button" className={`wpd-typetab${newRental.type === 'utility' ? ' wpd-typetab--active' : ''}`} onClick={() => setNewRental({ ...newRental, type: 'utility' })}>Koszty</button>
              <button type="button" className={`wpd-typetab${newRental.type === 'reminder' ? ' wpd-typetab--active' : ''}`} onClick={() => setNewRental({ ...newRental, type: 'reminder' })}>Zadanie</button>
            </div>

            {newRental.type === 'booking' && (
              <>
                <div className="wpd-field">
                  <label className="wpd-flabel">Wybierz obiekt</label>
                  <select className="wpd-select" value={newRental.property} onChange={(e) => handleRentalChange('property', e.target.value)} required>
                    {properties.map((p) => <option key={propName(p)} value={propName(p)}>{propName(p)}</option>)}
                  </select>
                </div>
                <div className="wpd-fgrid">
                  <div className="wpd-field">
                    <label className="wpd-flabel">Imię i nazwisko</label>
                    <input className="wpd-input" required placeholder="np. Jan Kowalski" value={newRental.guest} onChange={(e) => handleRentalChange('guest', e.target.value)} />
                  </div>
                  <div className="wpd-field">
                    <label className="wpd-flabel">Źródło rezerwacji</label>
                    <select className="wpd-select" value={newRental.source} onChange={(e) => handleRentalChange('source', e.target.value)} required>
                      {sources.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="wpd-fgrid">
                  <div className="wpd-field">
                    <label className="wpd-flabel">E-mail (opcjonalnie)</label>
                    <input className="wpd-input" type="email" placeholder="jan@example.com" value={newRental.email || ''} onChange={(e) => handleRentalChange('email', e.target.value)} />
                  </div>
                  <div className="wpd-field">
                    <label className="wpd-flabel">Telefon (opcjonalnie)</label>
                    <input className="wpd-input wpd-input--num" type="tel" placeholder="+48 000 000 000" value={newRental.phone || ''} onChange={(e) => handleRentalChange('phone', e.target.value)} />
                  </div>
                </div>
                <div className="wpd-field">
                  <label className="wpd-flabel">Prywatna notatka o gościu</label>
                  <textarea className="wpd-textarea" rows="2" placeholder="np. preferuje cichy pokój, ustalenia cenowe…" value={newRental.guestNote || ''} onChange={(e) => handleRentalChange('guestNote', e.target.value)} />
                </div>
                <div className="wpd-fgrid">
                  <div className="wpd-field">
                    <label className="wpd-flabel">Data przyjazdu</label>
                    <input className="wpd-input wpd-input--num" required type="date" value={newRental.date} onChange={(e) => handleRentalChange('date', e.target.value)} />
                  </div>
                  <div className="wpd-field">
                    <label className="wpd-flabel">Data wyjazdu</label>
                    <input className="wpd-input wpd-input--num" required type="date" value={newRental.endDate} onChange={(e) => handleRentalChange('endDate', e.target.value)} />
                  </div>
                </div>
                <div className="wpd-fieldset">
                  <p className="wpd-fieldset__title"><Wallet /> Rozliczenia</p>
                  <div className="wpd-fgrid wpd-fgrid--3">
                    <div className="wpd-field">
                      <label className="wpd-flabel wpd-flabel--green">Przychód brutto</label>
                      <input className="wpd-input wpd-input--num" required type="number" step="0.01" placeholder="0,00" value={newRental.income} onChange={(e) => handleRentalChange('income', e.target.value)} />
                    </div>
                    <div className="wpd-field">
                      <label className="wpd-flabel">Zaliczka (opcja)</label>
                      <input className="wpd-input wpd-input--num" type="number" step="0.01" placeholder="0,00" value={newRental.advancePayment} onChange={(e) => handleRentalChange('advancePayment', e.target.value)} />
                    </div>
                    <div className="wpd-field">
                      <label className="wpd-flabel wpd-flabel--cynober">Prowizja portalu</label>
                      <input className="wpd-input wpd-input--num" type="number" step="0.01" placeholder="0,00" value={newRental.commission} onChange={(e) => handleRentalChange('commission', e.target.value)} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {newRental.type === 'utility' && (
              <>
                <div className="wpd-field">
                  <label className="wpd-flabel">Wybierz obiekt</label>
                  <select className="wpd-select" value={newRental.property} onChange={(e) => handleRentalChange('property', e.target.value)} required>
                    {properties.map((p) => <option key={propName(p)} value={propName(p)}>{propName(p)}</option>)}
                  </select>
                </div>
                <div className="wpd-fgrid">
                  <div className="wpd-field">
                    <label className="wpd-flabel">Kategoria kosztu</label>
                    <select className="wpd-select" value={newRental.category || categories[0]} onChange={(e) => handleRentalChange('category', e.target.value)} required>
                      {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="wpd-field">
                    <label className="wpd-flabel">Data</label>
                    <input className="wpd-input wpd-input--num" required type="date" value={newRental.date} onChange={(e) => handleRentalChange('date', e.target.value)} />
                  </div>
                </div>
                <div className="wpd-field">
                  <label className="wpd-flabel">Szczegóły (np. nr faktury)</label>
                  <input className="wpd-input" required placeholder="np. Faktura PGE 12/2026" value={newRental.guest} onChange={(e) => handleRentalChange('guest', e.target.value)} />
                </div>
                <div className="wpd-field">
                  <label className="wpd-flabel wpd-flabel--cynober">Kwota kosztu</label>
                  <input className="wpd-input wpd-input--num" required type="number" step="0.01" placeholder="Wpisz kwotę w zł" value={newRental.utilities} onChange={(e) => handleRentalChange('utilities', e.target.value)} />
                </div>
              </>
            )}

            {newRental.type === 'reminder' && (
              <>
                <div className="wpd-field">
                  <label className="wpd-flabel">Data przypomnienia</label>
                  <input className="wpd-input wpd-input--num" required type="date" value={newRental.date} onChange={(e) => handleRentalChange('date', e.target.value)} />
                </div>
                <div className="wpd-field">
                  <label className="wpd-flabel">Treść zadania</label>
                  <input className="wpd-input" required placeholder="np. zawieźć klucze, sprawdzić żarówki" value={newRental.text || ''} onChange={(e) => handleRentalChange('text', e.target.value)} />
                </div>
              </>
            )}
          </div>

          <div className="wpd-dialog__foot">
            <button type="button" className="wpd-btn" onClick={handleCloseModal}>Anuluj</button>
            <button type="submit" className="wpd-btn wpd-btn--primary">Zapisz wpis</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default React.memo(AddEditEntryModal);
