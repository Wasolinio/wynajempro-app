import React from 'react';
import { Settings, XCircle, Building, Calendar as CalendarIcon, Copy, Trash2, Plus, Globe, Tags, Bell, Mail, Key, MessageSquare, Phone, CheckSquare, CreditCard, ExternalLink, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const SettingsModal = ({
  showSettingsModal,
  setShowSettingsModal,
  settingsTab,
  setSettingsTab,
  properties,
  editingSyncLinks,
  setEditingSyncLinks,
  user,
  editingHostProfile,
  setEditingHostProfile,
  editingProperties,
  updateProperty,
  removeProperty,
  handleAddProperty,
  newPropertyName,
  setNewPropertyName,
  availableColors,
  newPropertyColor,
  setNewPropertyColor,
  propColors,
  editingSources,
  updateSource,
  removeSource,
  handleAddSource,
  newSourceName,
  setNewSourceName,
  editingCategories,
  updateCategory,
  removeCategory,
  handleAddCategory,
  newCategoryName,
  setNewCategoryName,
  editingTaxSettings,
  setEditingTaxSettings,
  editingTemplates,
  updateTemplate,
  removeTemplate,
  addTemplate,
  accountStatus,
  trialEndsAt,
  handleManageSubscription,
  isBillingPortalLoading,
  saveSettings
}) => {
  if (!showSettingsModal) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-3xl p-8 overflow-y-auto max-h-[90vh] border border-white/50 dark:border-slate-700">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl"><Settings className="w-6 h-6" /></div>
            Ustawienia Systemu
          </h2>
          <button onClick={() => setShowSettingsModal(false)} className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-400"><XCircle className="w-6 h-6" /></button>
        </div>

          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {['hostProfile', 'properties', 'sources', 'categories', 'tax', 'sync', 'reminders', 'subscription'].map((tab) => (
              <button type="button" key={tab} onClick={() => setSettingsTab(tab)} className={`px-4 py-2.5 text-xs uppercase tracking-wider font-extrabold rounded-xl transition-all flex-none text-center ${settingsTab === tab ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}>
                {tab === 'hostProfile' && 'Profil Gospodarza'}
                {tab === 'properties' && 'Nieruchomości'}
                {tab === 'sources' && 'Źródła'}
                {tab === 'categories' && 'Kategorie wydatków'}
                {tab === 'tax' && 'Podatki'}
                {tab === 'sync' && 'Integracje'}
                {tab === 'reminders' && 'Powiadomienia'}
                {tab === 'subscription' && 'Subskrypcja'}
              </button>
            ))}
          </div>
        
        {settingsTab === 'sync' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="bg-blue-50/50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-5 rounded-3xl text-sm font-medium text-blue-900 dark:text-blue-300 leading-relaxed shadow-sm">
              Wklej linki iCal z Bookingu i Airbnb dla swoich obiektów, aby móc je automatycznie synchronizować na głównym ekranie.
            </div>
            {properties.map(p => (
              <div key={p.name} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                <h4 className="font-extrabold text-slate-900 dark:text-white mb-4 text-lg flex items-center gap-2"><Building className="w-5 h-5 text-blue-500"/> {p.name}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                     <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Link iCal Booking.com</label>
                     <input value={editingSyncLinks[p.name]?.booking || ''} onChange={e => setEditingSyncLinks(prev => ({...prev, [p.name]: {...(prev[p.name] || {}), booking: e.target.value}}))} className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none placeholder-slate-400 dark:placeholder-slate-600" placeholder="https://admin.booking.com/..." />
                  </div>
                  <div>
                     <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Link iCal Airbnb</label>
                     <input value={editingSyncLinks[p.name]?.airbnb || ''} onChange={e => setEditingSyncLinks(prev => ({...prev, [p.name]: {...(prev[p.name] || {}), airbnb: e.target.value}}))} className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none placeholder-slate-400 dark:placeholder-slate-600" placeholder="https://www.airbnb.pl/..." />
                  </div>
                </div>
                
                {/* EKSPORT ICAL (CHANNEL MANAGER) */}
                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-700">
                  <label className="block text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest mb-2 flex items-center gap-1.5"><CalendarIcon className="w-3 h-3"/> Eksportuj Kalendarz (iCal)</label>
                  <div className="flex gap-3 items-center">
                    <input readOnly value={`https://us-central1-moje-domki-6c77d.cloudfunctions.net/exportIcal?u=${user?.uid}&p=${encodeURIComponent(p.name)}`} className="flex-1 p-3.5 bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-xl text-xs font-mono text-indigo-800 dark:text-indigo-300 outline-none truncate" />
                    <button type="button" onClick={() => { navigator.clipboard.writeText(`https://us-central1-moje-domki-6c77d.cloudfunctions.net/exportIcal?u=${user?.uid}&p=${encodeURIComponent(p.name)}`); toast.success('Link iCal skopiowany!'); }} className="px-5 py-3.5 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-500/20 dark:hover:bg-indigo-500/30 text-indigo-700 dark:text-indigo-400 font-bold rounded-xl transition-colors whitespace-nowrap flex items-center gap-2">
                      <Copy className="w-4 h-4" /> Kopiuj Link
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {settingsTab === 'hostProfile' && (
           <div className="space-y-5 bg-slate-50/50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 animate-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Pełna nazwa podmiotu / Imię i Nazwisko</label>
                    <input type="text" value={editingHostProfile.entityName || ''} onChange={e => setEditingHostProfile({...editingHostProfile, entityName: e.target.value})} className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Typ Identyfikatora</label>
                      <select value={editingHostProfile.identifierType || 'NIP'} onChange={e => setEditingHostProfile({...editingHostProfile, identifierType: e.target.value})} className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer">
                        <option value="NIP">NIP</option>
                        <option value="PESEL">PESEL</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Twój NIP / PESEL</label>
                      <input type="text" placeholder="np. 1234567890" value={editingHostProfile.taxIdentifier || ''} onChange={e => setEditingHostProfile({...editingHostProfile, taxIdentifier: e.target.value})} className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder-slate-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Adres</label>
                    <input type="text" value={editingHostProfile.address || ''} onChange={e => setEditingHostProfile({...editingHostProfile, address: e.target.value})} className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Numer Telefonu</label>
                      <input type="text" value={editingHostProfile.phone || ''} onChange={e => setEditingHostProfile({...editingHostProfile, phone: e.target.value})} className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Adres e-mail</label>
                      <input type="email" value={editingHostProfile.email || ''} onChange={e => setEditingHostProfile({...editingHostProfile, email: e.target.value})} className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 transition-all" />
                    </div>
                  </div>
              </div>
           </div>
        )}

        {settingsTab === 'properties' && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            {editingProperties.map((prop, idx) => (
              <div key={idx} className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                <div className={`w-10 h-10 rounded-xl shadow-md flex items-center justify-center text-white ${propColors[prop.color || 'blue']?.bg}`}><Building className="w-5 h-5"/></div>
                <input value={prop.name} onChange={(e) => updateProperty(idx, { ...prop, name: e.target.value })} className="flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 outline-none transition-all" />
                <button type="button" onClick={() => removeProperty(idx)} className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"><Trash2 className="w-5 h-5" /></button>
              </div>
            ))}
            <form onSubmit={handleAddProperty} className="flex flex-col gap-4 mt-6 bg-slate-50/50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 border-dashed">
              <div className="flex items-center gap-3">
                 <input value={newPropertyName} onChange={(e) => setNewPropertyName(e.target.value)} className="flex-1 p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-800 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" placeholder="Nazwa nowego obiektu..." />
                 <button type="submit" disabled={!newPropertyName.trim()} className="px-6 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"><Plus className="w-5 h-5" /></button>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                 <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mr-2">Kolor:</span>
                 {availableColors.map(c => (
                   <button type="button" key={c} onClick={() => setNewPropertyColor(c)} className={`w-8 h-8 rounded-full shadow-sm transition-all ${propColors[c].bg} ${newPropertyColor === c ? 'ring-4 ring-offset-2 ring-slate-800 dark:ring-slate-300 scale-110' : 'opacity-40 hover:opacity-100'}`} />
                 ))}
              </div>
            </form>
          </div>
        )}
        {settingsTab === 'sources' && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            {editingSources.map((src, idx) => (<div key={idx} className="flex gap-4 items-center bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-[0_4px_20px_rgb(0,0,0,0.03)]"><div className="p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-400 rounded-xl"><Globe className="w-5 h-5"/></div><input value={src} onChange={(e) => updateSource(idx, e.target.value)} className="flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl text-sm font-bold focus:bg-white dark:focus:bg-slate-800 outline-none" /><button type="button" onClick={() => removeSource(idx)} className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl"><Trash2 className="w-5 h-5" /></button></div>))}
            <form onSubmit={handleAddSource} className="flex items-center gap-3 mt-6">
              <input value={newSourceName} onChange={(e) => setNewSourceName(e.target.value)} className="flex-1 p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl font-bold text-sm focus:bg-white dark:focus:bg-slate-800 outline-none" placeholder="Nowe źródło (np. Booking)..." />
              <button type="submit" disabled={!newSourceName.trim()} className="px-6 py-3.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-200 dark:hover:bg-blue-500/40 disabled:opacity-50"><Plus className="w-5 h-5" /></button>
            </form>
          </div>
        )}
        {settingsTab === 'categories' && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            {editingCategories.map((cat, idx) => (<div key={idx} className="flex gap-4 items-center bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-[0_4px_20px_rgb(0,0,0,0.03)]"><div className="p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-400 rounded-xl"><Tags className="w-5 h-5"/></div><input value={cat} onChange={(e) => updateCategory(idx, e.target.value)} className="flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl text-sm font-bold focus:bg-white dark:focus:bg-slate-800 outline-none" /><button type="button" onClick={() => removeCategory(idx)} className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl"><Trash2 className="w-5 h-5" /></button></div>))}
            <form onSubmit={handleAddCategory} className="flex items-center gap-3 mt-6">
              <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="flex-1 p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl font-bold text-sm focus:bg-white dark:focus:bg-slate-800 outline-none" placeholder="Nowa kategoria kosztów..." />
              <button type="submit" disabled={!newCategoryName.trim()} className="px-6 py-3.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-200 dark:hover:bg-blue-500/40 disabled:opacity-50"><Plus className="w-5 h-5" /></button>
            </form>
          </div>
        )}
        {settingsTab === 'tax' && (
           <div className="space-y-5 bg-slate-50/50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 animate-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer shadow-sm">
                  <input type="radio" checked={editingTaxSettings.taxForm === 'lump_sum'} onChange={() => setEditingTaxSettings({...editingTaxSettings, taxForm: 'lump_sum'})} className="w-5 h-5 text-blue-600 focus:ring-blue-500 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-600"/> 
                  <span className="font-bold text-slate-800 dark:text-slate-200">Ryczałt</span>
                </label>
                <label className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer shadow-sm">
                  <input type="radio" checked={editingTaxSettings.taxForm === 'general'} onChange={() => setEditingTaxSettings({...editingTaxSettings, taxForm: 'general'})} className="w-5 h-5 text-blue-600 focus:ring-blue-500 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-600"/> 
                  <span className="font-bold text-slate-800 dark:text-slate-200">Zasady ogólne (Skala)</span>
                </label>
              </div>

              <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                <label className="flex items-center gap-4 cursor-pointer">
                  <input type="checkbox" checked={editingTaxSettings.isVatPayer} onChange={e => setEditingTaxSettings({...editingTaxSettings, isVatPayer: e.target.checked})} className="w-5 h-5 text-blue-600 focus:ring-blue-500 rounded bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-600"/> 
                  <span className="font-bold text-slate-800 dark:text-slate-200">Jestem czynnym płatnikiem VAT (Podatek liczony od kwoty Netto)</span>
                </label>
                <label className="flex items-center gap-4 cursor-pointer">
                  <input type="checkbox" checked={editingTaxSettings.includeZusInCosts} onChange={e => setEditingTaxSettings({...editingTaxSettings, includeZusInCosts: e.target.checked})} className="w-5 h-5 text-blue-600 focus:ring-blue-500 rounded bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-600"/> 
                  <span className="font-bold text-slate-800 dark:text-slate-200">Uwzględniaj składki ZUS w kosztach obniżających podatek</span>
                </label>
              </div>


              {editingTaxSettings.taxForm === 'general' && (
                <div className="bg-blue-50 dark:bg-blue-500/10 p-5 rounded-2xl border border-blue-200 dark:border-blue-500/30 space-y-4">
                  <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-2">Ustawienia Skali Podatkowej</h4>
                  <div>
                    <label className="block text-[10px] font-extrabold text-blue-800 dark:text-blue-400 uppercase tracking-widest mb-2">Kwota Wolna od Podatku (rocznie)</label>
                    <input type="number" value={editingTaxSettings.taxFreeAmount} onChange={e => setEditingTaxSettings({...editingTaxSettings, taxFreeAmount: Number(e.target.value)})} className="w-full p-3 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-500/50 rounded-xl font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/20 transition-all" />
                  </div>
                </div>
              )}

              {editingTaxSettings.taxForm === 'lump_sum' && (
                <div className="bg-amber-50 dark:bg-amber-500/10 p-5 rounded-2xl border border-amber-200 dark:border-amber-500/30 space-y-4">
                   <h4 className="font-bold text-amber-900 dark:text-amber-300 mb-2">Ustawienia Ryczałtu</h4>
                   <label className="flex items-center gap-4 cursor-pointer">
                    <input type="checkbox" checked={editingTaxSettings.autoThreshold} onChange={e => setEditingTaxSettings({...editingTaxSettings, autoThreshold: e.target.checked})} className="w-5 h-5 text-amber-600 focus:ring-amber-500 rounded bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-600"/> 
                    <span className="font-bold text-amber-900 dark:text-amber-200 text-sm">Automatyczny próg (8.5% do 100k, 12.5% powyżej)</span>
                  </label>
                  {!editingTaxSettings.autoThreshold && (
                    <div>
                      <label className="block text-[10px] font-extrabold text-amber-800 dark:text-amber-400 uppercase tracking-widest mb-2 mt-4">Stała Stawka Ryczałtu (%)</label>
                      <input type="number" step="0.1" value={editingTaxSettings.rate} onChange={e => setEditingTaxSettings({...editingTaxSettings, rate: Number(e.target.value)})} className="w-full p-3 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-500/50 rounded-xl font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-amber-500/20 transition-all" />
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Składka ZUS Zdrowotna (Miesięcznie)</label>
                  <input type="number" value={editingTaxSettings.zusHealth} onChange={e => setEditingTaxSettings({...editingTaxSettings, zusHealth: Number(e.target.value)})} className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-slate-500/10 transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Składka ZUS Społeczna (Miesięcznie)</label>
                  <input type="number" value={editingTaxSettings.zusSocial} onChange={e => setEditingTaxSettings({...editingTaxSettings, zusSocial: Number(e.target.value)})} className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-slate-500/10 transition-all" />
                </div>
              </div>
           </div>
        )}
        {settingsTab === 'reminders' && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            {editingTemplates.map((t, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-[0_4px_20px_rgb(0,0,0,0.03)] items-center">
                <div className="col-span-12 md:col-span-3">
                   <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 ml-1">Krótka Nazwa</label>
                   <input value={t.shortName} onChange={(e) => updateTemplate(idx, 'shortName', e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl text-sm font-bold focus:bg-white dark:focus:bg-slate-800 outline-none" placeholder="np. Kod" />
                </div>
                <div className="col-span-12 md:col-span-4">
                   <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 ml-1">Pełna treść (np. na liście)</label>
                   <input value={t.text} onChange={(e) => updateTemplate(idx, 'text', e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl text-sm font-medium focus:bg-white dark:focus:bg-slate-800 outline-none" placeholder="Wyślij kod do drzwi" />
                </div>
                <div className="col-span-12 md:col-span-2">
                   <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 ml-1">Dni przed</label>
                   <input type="number" value={t.daysBefore} onChange={(e) => updateTemplate(idx, 'daysBefore', Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl text-sm font-bold focus:bg-white dark:focus:bg-slate-800 outline-none text-center" title="Liczba dni przed przyjazdem" />
                </div>
                <div className="col-span-12 md:col-span-2">
                   <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 ml-1">Ikona</label>
                   <select value={t.icon || 'Bell'} onChange={(e) => updateTemplate(idx, 'icon', e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl text-sm font-bold focus:bg-white dark:focus:bg-slate-800 outline-none cursor-pointer">
                     <option value="Bell">Dzwonek</option>
                     <option value="Mail">Mail</option>
                     <option value="Key">Klucz</option>
                     <option value="MessageSquare">Wiadomość</option>
                     <option value="Phone">Telefon</option>
                     <option value="CheckSquare">Zadanie</option>
                   </select>
                </div>
                <div className="col-span-12 md:col-span-1 flex justify-end mt-4 md:mt-0">
                  <button type="button" onClick={() => removeTemplate(idx)} className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>
            ))}
            <button type="button" onClick={addTemplate} className="w-full py-5 mt-4 border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 font-extrabold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-400 transition-colors flex justify-center items-center gap-2"><Plus className="w-5 h-5" /> Dodaj przypomnienie</button>
          </div>
        )}
        {settingsTab === 'subscription' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            {/* Status subskrypcji */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
              <div className="flex items-center gap-4 mb-5">
                <div className={`p-3 rounded-2xl ${accountStatus === 'active' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : accountStatus === 'trialing' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">Status subskrypcji</h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {accountStatus === 'active' && 'Twoja subskrypcja jest aktywna'}
                    {accountStatus === 'trialing' && `Okres próbny${trialEndsAt ? ` — do ${trialEndsAt.toLocaleDateString('pl-PL')}` : ''}`}
                    {accountStatus === 'past_due' && 'Płatność zaległa — zaktualizuj metodę płatności'}
                    {accountStatus === 'canceled' && 'Subskrypcja anulowana'}
                  </p>
                </div>
                <div className="ml-auto">
                  <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                    accountStatus === 'active' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' :
                    accountStatus === 'trialing' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' :
                    'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400'
                  }`}>
                    {accountStatus === 'active' ? 'Aktywna' : accountStatus === 'trialing' ? 'Trial' : accountStatus === 'past_due' ? 'Zaległa' : 'Anulowana'}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">29.99</span>
                  <span className="text-sm font-bold text-slate-500 dark:text-slate-400">zł / miesiąc</span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Plan Gospodarza — pełen dostęp do systemu</p>
              </div>
            </div>

            {/* Akcje zarządzania */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg mb-2">Zarządzaj subskrypcją</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-5">
                W panelu Stripe możesz zmienić kartę płatniczą, anulować subskrypcję lub pobrać faktury VAT.
              </p>

              <button
                type="button"
                onClick={handleManageSubscription}
                disabled={isBillingPortalLoading}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isBillingPortalLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ExternalLink className="w-5 h-5" /> Otwórz panel zarządzania</>}
              </button>
            </div>

            {/* Info o koncie */}
            <div className="bg-blue-50/50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-5 rounded-3xl text-sm font-medium text-blue-900 dark:text-blue-300 leading-relaxed shadow-sm">
              <p className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 shrink-0" /> <strong>Zmiana metody płatności</strong> — zaktualizuj kartę lub dodaj nową bez przerwy w dostępie.</p>
              <p className="flex items-start gap-2 mt-2"><CheckCircle className="w-4 h-4 mt-0.5 shrink-0" /> <strong>Faktury VAT</strong> — pobierz faktury za dowolny miesiąc w formacie PDF.</p>
              <p className="flex items-start gap-2 mt-2"><CheckCircle className="w-4 h-4 mt-0.5 shrink-0" /> <strong>Anulowanie</strong> — anuluj subskrypcję w dowolnym momencie. Dostęp pozostanie do końca opłaconego okresu.</p>
            </div>
          </div>
        )}

        <div className="flex gap-4 pt-8 mt-8 border-t border-slate-100 dark:border-slate-700">
          <button type="button" onClick={() => setShowSettingsModal(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Anuluj</button>
          <button type="button" onClick={saveSettings} className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30 transition-all">Zapisz Ustawienia</button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(SettingsModal);
