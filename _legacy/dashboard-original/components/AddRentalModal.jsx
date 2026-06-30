import React from 'react';
import { Edit, XCircle, DollarSign } from 'lucide-react';

export default function AddRentalModal({
  show,
  onClose,
  editingId,
  newRental,
  setNewRental,
  handleRentalChange,
  handleAddRental,
  properties,
  sources,
  categories
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-2xl p-8 overflow-y-auto max-h-[90vh] border border-white/50 dark:border-slate-700">
        <div className="flex justify-between items-center mb-8">
           <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
             <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl"><Edit className="w-6 h-6" /></div>
             {editingId ? 'Edytuj wpis' : 'Nowy wpis'}
           </h2>
           <button onClick={onClose} className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-400"><XCircle className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleAddRental} className="space-y-5">
          
          <div className="flex gap-1 bg-slate-100/80 dark:bg-slate-800 p-1.5 rounded-2xl mb-6 shadow-inner">
            <button type="button" onClick={() => setNewRental({...newRental, type:'booking'})} className={`flex-1 py-3 text-xs uppercase tracking-wider font-extrabold rounded-xl transition-all ${newRental.type === 'booking' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}>Rezerwacja</button>
            <button type="button" onClick={() => setNewRental({...newRental, type:'utility'})} className={`flex-1 py-3 text-xs uppercase tracking-wider font-extrabold rounded-xl transition-all ${newRental.type === 'utility' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}>Koszty</button>
            <button type="button" onClick={() => setNewRental({...newRental, type:'reminder'})} className={`flex-1 py-3 text-xs uppercase tracking-wider font-extrabold rounded-xl transition-all ${newRental.type === 'reminder' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}>Zadanie</button>
          </div>
          
          {newRental.type === 'booking' ? (
            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 ml-1">Wybierz Obiekt</label>
                <select value={newRental.property} onChange={e => handleRentalChange('property', e.target.value)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer" required>
                  {properties.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 ml-1">Imię i Nazwisko</label>
                  <input required placeholder="np. Jan Kowalski" value={newRental.guest} onChange={e => handleRentalChange('guest', e.target.value)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder-slate-400 dark:placeholder-slate-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 ml-1">Źródło Rezerwacji</label>
                  <select value={newRental.source} onChange={e => handleRentalChange('source', e.target.value)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer" required>
                    {sources.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 ml-1">Adres e-mail (Opcjonalnie)</label>
                  <input type="email" placeholder="jan@example.com" value={newRental.email} onChange={e => handleRentalChange('email', e.target.value)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder-slate-400 dark:placeholder-slate-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 ml-1">Telefon (Opcjonalnie)</label>
                  <input type="tel" placeholder="+48 000 000 000" value={newRental.phone} onChange={e => handleRentalChange('phone', e.target.value)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder-slate-400 dark:placeholder-slate-500" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 ml-1">Prywatna notatka o gościu</label>
                <textarea placeholder="np. Gość preferuje cichy pokój, ustalenia cenowe..." value={newRental.guestNote || ''} onChange={e => handleRentalChange('guestNote', e.target.value)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none placeholder-slate-400 dark:placeholder-slate-500" rows="2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 ml-1">Data przyjazdu</label>
                  <input required type="date" value={newRental.date} onChange={e => handleRentalChange('date', e.target.value)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 ml-1">Data wyjazdu</label>
                  <input required type="date" value={newRental.endDate} onChange={e => handleRentalChange('endDate', e.target.value)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" />
                </div>
              </div>

              <div className="bg-slate-50/50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 mt-2">
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-500"/> Rozliczenia</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2 ml-1">Przychód Brutto</label>
                    <input required type="number" placeholder="0.00" value={newRental.income} onChange={e => handleRentalChange('income', e.target.value)} className="w-full p-3 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/30 rounded-xl font-bold text-emerald-700 dark:text-emerald-400 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder-emerald-300 dark:placeholder-emerald-700" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2 ml-1">Zaliczka (Opcja)</label>
                    <input type="number" placeholder="0.00" value={newRental.advancePayment} onChange={e => handleRentalChange('advancePayment', e.target.value)} className="w-full p-3 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-500/30 rounded-xl font-bold text-indigo-700 dark:text-indigo-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder-indigo-300 dark:placeholder-indigo-700" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-2 ml-1">Prowizja Portalu</label>
                    <input type="number" placeholder="0.00" value={newRental.commission} onChange={e => handleRentalChange('commission', e.target.value)} className="w-full p-3 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-500/30 rounded-xl font-bold text-rose-700 dark:text-rose-400 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all placeholder-rose-300 dark:placeholder-rose-700" />
                  </div>
                </div>
              </div>
            </div>
          ) : newRental.type === 'utility' ? (
            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 ml-1">Wybierz Obiekt</label>
                <select value={newRental.property} onChange={e => handleRentalChange('property', e.target.value)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" required>
                  {properties.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 ml-1">Kategoria Kosztu</label>
                  <select value={newRental.category} onChange={e => handleRentalChange('category', e.target.value)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" required>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 ml-1">Data</label>
                  <input required type="date" value={newRental.date} onChange={e => handleRentalChange('date', e.target.value)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 ml-1">Szczegóły (np. nr faktury)</label>
                <input required placeholder="np. Faktura PGE 12/2023" value={newRental.guest} onChange={e => handleRentalChange('guest', e.target.value)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder-slate-400 dark:placeholder-slate-500" />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-2 ml-1">Kwota Kosztu</label>
                <input required type="number" placeholder="Wpisz kwotę w zł" value={newRental.utilities} onChange={e => handleRentalChange('utilities', e.target.value)} className="w-full p-4 bg-rose-50/50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl font-black text-rose-700 dark:text-rose-400 text-lg outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all placeholder-rose-300 dark:placeholder-rose-800" />
              </div>
            </div>
          ) : (
            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 ml-1">Data przypomnienia</label>
                <input required type="date" value={newRental.date} onChange={e => handleRentalChange('date', e.target.value)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 ml-1">Treść zadania</label>
                <input required placeholder="np. Zawieźć klucze lub sprawdzić żarówki" value={newRental.text} onChange={e => handleRentalChange('text', e.target.value)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder-slate-400 dark:placeholder-slate-500" />
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-8 mt-8 border-t border-slate-100 dark:border-slate-700">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Anuluj</button>
            <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30 transition-all">Zapisz Wpis</button>
          </div>
        </form>
      </div>
    </div>
  );
}
