import React from 'react';
import { Edit, X, Wallet, Users } from 'lucide-react';
import { useDialogA11y } from './useDialogA11y';
import { guestsTotal } from '../../../utils/guestCount';

const propName = (p) => (typeof p === 'object' ? p.name : p);

/* Dodaj/edytuj wpis (rezerwacja / koszt / zadanie) — styl V4. Kontrakt propsów 1:1 z oryginałem. */
function AddEditEntryModal({
  showAddModal, handleCloseModal, handleAddRental, editingId,
  newRental, setNewRental, handleRentalChange, properties, sources, categories,
}) {
  const dialogA11y = useDialogA11y(showAddModal, handleCloseModal);
  if (!showAddModal) return null;

  // X14: podgląd tego, co trafi do pola `guests` — suma osób (dorośli + dzieci).
  const personsTotal = guestsTotal(newRental.adults, newRental.children);

  return (
    <div className="wpd-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}>
      <div className="wpd-dialog" {...dialogA11y}>
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
                {/* X14: „Liczba gości" rozbita na dorosłych, dzieci i zwierzęta.
                    Zapisywane pole `guests` = dorośli + dzieci (podgląd pod polami). */}
                <div className="wpd-fieldset" style={{ marginBottom: 16 }}>
                  <p className="wpd-fieldset__title"><Users /> Goście</p>
                  <div className="wpd-fgrid wpd-fgrid--3">
                    <div className="wpd-field">
                      <label className="wpd-flabel">Dorośli</label>
                      <input className="wpd-input wpd-input--num" type="number" min="0" step="1" placeholder="np. 2" aria-label="Dorośli" value={newRental.adults ?? ''} onChange={(e) => handleRentalChange('adults', e.target.value)} />
                    </div>
                    <div className="wpd-field">
                      <label className="wpd-flabel">Dzieci</label>
                      <input className="wpd-input wpd-input--num" type="number" min="0" step="1" placeholder="np. 2" aria-label="Dzieci" value={newRental.children ?? ''} onChange={(e) => handleRentalChange('children', e.target.value)} />
                    </div>
                    <div className="wpd-field">
                      <label className="wpd-flabel">Zwierzęta</label>
                      <input className="wpd-input wpd-input--num" type="number" min="0" step="1" placeholder="np. 1" aria-label="Zwierzęta" value={newRental.pets ?? ''} onChange={(e) => handleRentalChange('pets', e.target.value)} />
                    </div>
                  </div>
                  <p className="wpd-fhint">
                    {personsTotal === null
                      ? 'Pola opcjonalne. Zwierzęta nie wliczają się do liczby osób.'
                      : <>Łącznie osób: <strong>{personsTotal}</strong> · zwierzęta liczone osobno</>}
                  </p>
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
                {/* E3: NOWE zadanie zapisuje się do users/{uid}/tasks (jedna ścieżka
                    z modułem Zadania) — stąd priorytet, godzina, notatka i obiekt.
                    Edycja istniejącego wpisu legacy (rentals) ignoruje te pola do migracji. */}
                <div className="wpd-field">
                  <label className="wpd-flabel">Treść zadania</label>
                  <input className="wpd-input" required placeholder="np. zawieźć klucze, sprawdzić żarówki" value={newRental.text || ''} onChange={(e) => handleRentalChange('text', e.target.value)} />
                </div>
                <div className="wpd-fgrid">
                  <div className="wpd-field">
                    <label className="wpd-flabel">Data przypomnienia</label>
                    <input className="wpd-input wpd-input--num" required type="date" value={newRental.date} onChange={(e) => handleRentalChange('date', e.target.value)} />
                  </div>
                  <div className="wpd-field">
                    <label className="wpd-flabel">Obiekt (opcjonalnie)</label>
                    <select className="wpd-select" value={newRental.property || ''} onChange={(e) => handleRentalChange('property', e.target.value)}>
                      <option value="">Bez obiektu</option>
                      {properties.map((p) => <option key={propName(p)} value={propName(p)}>{propName(p)}</option>)}
                    </select>
                  </div>
                </div>
                {/* Godzina/Priorytet/Notatka TYLKO przy nowym zadaniu: edycja istniejącego wpisu
                    legacy pisze do rentals, gdzie tych pól nie ma — pokazywanie ich obiecywałoby
                    zapis, który po cichu przepada (przegląd code-reviewera, partia 1 E3) */}
                {!editingId && (
                  <>
                    <div className="wpd-fgrid">
                      <div className="wpd-field">
                        <label className="wpd-flabel">Godzina (opcjonalnie)</label>
                        <input className="wpd-input wpd-input--num" type="time" value={newRental.taskTime || ''} onChange={(e) => handleRentalChange('taskTime', e.target.value)} />
                      </div>
                      <div className="wpd-field">
                        <label className="wpd-flabel">Priorytet</label>
                        <select className="wpd-select" value={newRental.taskPriority || 'normalny'} onChange={(e) => handleRentalChange('taskPriority', e.target.value)}>
                          <option value="wysoki">Pilne</option>
                          <option value="normalny">Zwykłe</option>
                          <option value="niski">Kiedyś</option>
                        </select>
                      </div>
                    </div>
                    <div className="wpd-field">
                      <label className="wpd-flabel">Notatka (opcjonalnie)</label>
                      <textarea className="wpd-textarea" rows="2" placeholder="np. ciepła barwa, E27 — dwie zostały w szafce" value={newRental.taskNote || ''} onChange={(e) => handleRentalChange('taskNote', e.target.value)} />
                    </div>
                  </>
                )}
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
