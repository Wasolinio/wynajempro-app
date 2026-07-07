import React from 'react';
import {
  Settings, X, Building2, Calendar as CalendarIcon, Copy, Trash2, Plus, Globe, Tags,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { propHex } from '../styles';
import { useDialogA11y } from './useDialogA11y';

/* Ustawienia APLIKACJI — profil gospodarza, subskrypcja i usunięcie konta
   przeniesione do AccountModal (X6, klik w imię w sidebarze). */
const TABS = [
  ['properties', 'Nieruchomości'], ['sources', 'Źródła'], ['categories', 'Kategorie'],
  ['tax', 'Podatki'], ['sync', 'Integracje'], ['reminders', 'Powiadomienia'],
];

const exportUrl = (uid, name, token) =>
  `https://us-central1-moje-domki-6c77d.cloudfunctions.net/exportIcal?u=${uid}&p=${encodeURIComponent(name)}&token=${token || ''}`;

/* Ustawienia systemu — styl V4. Kontrakt propsów 1:1 z oryginałem. */
function SettingsModal(props) {
  const {
    showSettingsModal, setShowSettingsModal, settingsTab, setSettingsTab,
    editingSyncLinks, setEditingSyncLinks, user,
    editingProperties, updateProperty, removeProperty, handleAddProperty, newPropertyName, setNewPropertyName,
    availableColors, newPropertyColor, setNewPropertyColor,
    editingSources, updateSource, removeSource, handleAddSource, newSourceName, setNewSourceName,
    editingCategories, updateCategory, removeCategory, handleAddCategory, newCategoryName, setNewCategoryName,
    editingTaxSettings, setEditingTaxSettings, editingTemplates, updateTemplate, removeTemplate, addTemplate,
    saveSettings,
  } = props;

  const dialogA11y = useDialogA11y(showSettingsModal, () => setShowSettingsModal(false));

  if (!showSettingsModal) return null;
  const ts = editingTaxSettings;
  const setTs = (patch) => setEditingTaxSettings({ ...ts, ...patch });

  return (
    <div className="wpd-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowSettingsModal(false); }}>
      <div className="wpd-dialog wpd-dialog--lg" {...dialogA11y}>
        <div className="wpd-dialog__head">
          <span className="wpd-dialog__ic"><Settings /></span>
          <div><h2 className="wpd-h2">Ustawienia aplikacji</h2></div>
          <button className="wpd-dialog__close" onClick={() => setShowSettingsModal(false)}><X /></button>
        </div>

        <div className="wpd-dialog__body">
          <div className="wpd-tabs">
            {TABS.map(([key, label]) => (
              <button key={key} type="button" className={`wpd-tab${settingsTab === key ? ' wpd-tab--active' : ''}`} onClick={() => setSettingsTab(key)}>{label}</button>
            ))}
          </div>

          {/* NIERUCHOMOŚCI */}
          {settingsTab === 'properties' && (
            <>
              {editingProperties.map((prop, idx) => (
                <div className="wpd-listrow" key={idx}>
                  <span className="wpd-listrow__ic" style={{ background: propHex(prop.color) }}><Building2 /></span>
                  <input className="wpd-input" value={prop.name} onChange={(e) => updateProperty(idx, { ...prop, name: e.target.value })} />
                  <button type="button" className="wpd-iconbtn wpd-iconbtn--del" onClick={() => removeProperty(idx)}><Trash2 /></button>
                </div>
              ))}
              <form className="wpd-addbox" onSubmit={handleAddProperty}>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input className="wpd-input" value={newPropertyName} onChange={(e) => setNewPropertyName(e.target.value)} placeholder="Nazwa nowego obiektu…" />
                  <button type="submit" className="wpd-btn wpd-btn--primary" disabled={!newPropertyName.trim()}><Plus /></button>
                </div>
                <div className="wpd-swatches">
                  <span className="wpd-flabel" style={{ margin: 0 }}>Kolor</span>
                  {availableColors.map((c) => (
                    <button type="button" key={c} className={`wpd-swatch${newPropertyColor === c ? ' wpd-swatch--on' : ''}`} style={{ background: propHex(c) }} onClick={() => setNewPropertyColor(c)} />
                  ))}
                </div>
              </form>
            </>
          )}

          {/* ŹRÓDŁA */}
          {settingsTab === 'sources' && (
            <>
              {editingSources.map((src, idx) => (
                <div className="wpd-listrow" key={idx}>
                  <span className="wpd-listrow__ic" style={{ background: 'var(--granat)' }}><Globe /></span>
                  <input className="wpd-input" value={src} onChange={(e) => updateSource(idx, e.target.value)} />
                  <button type="button" className="wpd-iconbtn wpd-iconbtn--del" onClick={() => removeSource(idx)}><Trash2 /></button>
                </div>
              ))}
              <form className="wpd-addbox" onSubmit={handleAddSource} style={{ display: 'flex', gap: 10 }}>
                <input className="wpd-input" value={newSourceName} onChange={(e) => setNewSourceName(e.target.value)} placeholder="Nowe źródło (np. Booking)…" />
                <button type="submit" className="wpd-btn wpd-btn--primary" disabled={!newSourceName.trim()}><Plus /></button>
              </form>
            </>
          )}

          {/* KATEGORIE */}
          {settingsTab === 'categories' && (
            <>
              {editingCategories.map((cat, idx) => (
                <div className="wpd-listrow" key={idx}>
                  <span className="wpd-listrow__ic" style={{ background: 'var(--amber)' }}><Tags /></span>
                  <input className="wpd-input" value={cat} onChange={(e) => updateCategory(idx, e.target.value)} />
                  <button type="button" className="wpd-iconbtn wpd-iconbtn--del" onClick={() => removeCategory(idx)}><Trash2 /></button>
                </div>
              ))}
              <form className="wpd-addbox" onSubmit={handleAddCategory} style={{ display: 'flex', gap: 10 }}>
                <input className="wpd-input" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="Nowa kategoria kosztów…" />
                <button type="submit" className="wpd-btn wpd-btn--primary" disabled={!newCategoryName.trim()}><Plus /></button>
              </form>
            </>
          )}

          {/* PODATKI */}
          {settingsTab === 'tax' && (
            <>
              <div className="wpd-fgrid" style={{ marginBottom: 14 }}>
                <label className="wpd-listrow wpd-checkrow" style={{ margin: 0 }}>
                  <input type="radio" checked={ts.taxForm === 'lump_sum'} onChange={() => setTs({ taxForm: 'lump_sum' })} /> Ryczałt
                </label>
                <label className="wpd-listrow wpd-checkrow" style={{ margin: 0 }}>
                  <input type="radio" checked={ts.taxForm === 'general'} onChange={() => setTs({ taxForm: 'general' })} /> Zasady ogólne (skala)
                </label>
              </div>
              <div className="wpd-fieldset" style={{ marginBottom: 14 }}>
                <label className="wpd-checkrow">
                  <input type="checkbox" checked={!!ts.isVatPayer} onChange={(e) => setTs({ isVatPayer: e.target.checked })} />
                  Jestem czynnym płatnikiem VAT (podatek liczony od kwoty netto)
                </label>
                <label className="wpd-checkrow">
                  <input type="checkbox" checked={!!ts.includeZusInCosts} onChange={(e) => setTs({ includeZusInCosts: e.target.checked })} />
                  Uwzględniaj składki ZUS w kosztach obniżających podatek
                </label>
              </div>
              {ts.taxForm === 'general' && (
                <div className="wpd-fieldset" style={{ marginBottom: 14 }}>
                  <p className="wpd-fieldset__title">Ustawienia skali podatkowej</p>
                  <div className="wpd-field">
                    <label className="wpd-flabel">Kwota wolna od podatku (rocznie)</label>
                    <input className="wpd-input wpd-input--num" type="number" value={ts.taxFreeAmount} onChange={(e) => setTs({ taxFreeAmount: Number(e.target.value) })} />
                  </div>
                </div>
              )}
              {ts.taxForm === 'lump_sum' && (
                <div className="wpd-fieldset" style={{ marginBottom: 14 }}>
                  <p className="wpd-fieldset__title">Ustawienia ryczałtu</p>
                  <label className="wpd-checkrow">
                    <input type="checkbox" checked={!!ts.autoThreshold} onChange={(e) => setTs({ autoThreshold: e.target.checked })} />
                    Automatyczny próg (8,5% do 100k, 12,5% powyżej)
                  </label>
                  {!ts.autoThreshold && (
                    <div className="wpd-field" style={{ marginTop: 8 }}>
                      <label className="wpd-flabel">Stała stawka ryczałtu (%)</label>
                      <input className="wpd-input wpd-input--num" type="number" step="0.1" value={ts.rate} onChange={(e) => setTs({ rate: Number(e.target.value) })} />
                    </div>
                  )}
                </div>
              )}
              <div className="wpd-fgrid">
                <div className="wpd-field">
                  <label className="wpd-flabel">Składka ZUS zdrowotna (mies.)</label>
                  <input className="wpd-input wpd-input--num" type="number" value={ts.zusHealth} onChange={(e) => setTs({ zusHealth: Number(e.target.value) })} />
                </div>
                <div className="wpd-field">
                  <label className="wpd-flabel">Składka ZUS społeczna (mies.)</label>
                  <input className="wpd-input wpd-input--num" type="number" value={ts.zusSocial} onChange={(e) => setTs({ zusSocial: Number(e.target.value) })} />
                </div>
              </div>
            </>
          )}

          {/* INTEGRACJE (iCal) */}
          {settingsTab === 'sync' && (
            <>
              <div className="wpd-note wpd-note--info" style={{ marginBottom: 16 }}>
                Wklej linki iCal z Bookingu i Airbnb dla swoich obiektów, aby synchronizować rezerwacje automatycznie.
              </div>
              {editingProperties.map((p) => (
                <div className="wpd-panel" key={p.name} style={{ marginBottom: 14 }}>
                  <div className="wpd-panel__head"><Building2 style={{ width: 16, height: 16, color: 'var(--cynober)' }} /><h2 className="wpd-h2" style={{ fontSize: 15 }}>{p.name}</h2></div>
                  <div style={{ padding: 16 }}>
                    <div className="wpd-fgrid">
                      <div className="wpd-field">
                        <label className="wpd-flabel">Link iCal Booking.com</label>
                        <input className="wpd-input" value={editingSyncLinks[p.name]?.booking || ''} placeholder="https://admin.booking.com/…"
                          onChange={(e) => setEditingSyncLinks((prev) => ({ ...prev, [p.name]: { ...(prev[p.name] || {}), booking: e.target.value } }))} />
                      </div>
                      <div className="wpd-field">
                        <label className="wpd-flabel">Link iCal Airbnb</label>
                        <input className="wpd-input" value={editingSyncLinks[p.name]?.airbnb || ''} placeholder="https://www.airbnb.pl/…"
                          onChange={(e) => setEditingSyncLinks((prev) => ({ ...prev, [p.name]: { ...(prev[p.name] || {}), airbnb: e.target.value } }))} />
                      </div>
                    </div>
                    <div className="wpd-field" style={{ marginTop: 4 }}>
                      <label className="wpd-flabel"><CalendarIcon style={{ width: 11, height: 11, display: 'inline', verticalAlign: '-1px' }} /> Eksportuj kalendarz (iCal)</label>
                      <div className="wpd-codebox">
                        <input readOnly value={exportUrl(user?.uid, p.name, p.secretToken)} />
                        <button type="button" className="wpd-btn wpd-btn--sm" onClick={() => { navigator.clipboard.writeText(exportUrl(user?.uid, p.name, p.secretToken)); toast.success('Link iCal skopiowany!'); }}><Copy /> Kopiuj</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* POWIADOMIENIA (szablony zadań) */}
          {settingsTab === 'reminders' && (
            <>
              {editingTemplates.map((t, idx) => (
                <div className="wpd-panel" key={idx} style={{ marginBottom: 10, padding: 14 }}>
                  <div className="wpd-fgrid" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'end' }}>
                    <div className="wpd-field" style={{ margin: 0 }}>
                      <label className="wpd-flabel">Krótka nazwa</label>
                      <input className="wpd-input" value={t.shortName} onChange={(e) => updateTemplate(idx, 'shortName', e.target.value)} placeholder="np. Kod" />
                    </div>
                    <div className="wpd-field" style={{ margin: 0 }}>
                      <label className="wpd-flabel">Pełna treść</label>
                      <input className="wpd-input" value={t.text} onChange={(e) => updateTemplate(idx, 'text', e.target.value)} placeholder="Wyślij kod do drzwi" />
                    </div>
                  </div>
                  <div className="wpd-fgrid wpd-fgrid--3" style={{ marginTop: 10, alignItems: 'end' }}>
                    <div className="wpd-field" style={{ margin: 0 }}>
                      <label className="wpd-flabel">Dni przed</label>
                      <input className="wpd-input wpd-input--num" type="number" value={t.daysBefore} onChange={(e) => updateTemplate(idx, 'daysBefore', Number(e.target.value))} />
                    </div>
                    <div className="wpd-field" style={{ margin: 0 }}>
                      <label className="wpd-flabel">Ikona</label>
                      <select className="wpd-select" value={t.icon || 'Bell'} onChange={(e) => updateTemplate(idx, 'icon', e.target.value)}>
                        <option value="Bell">Dzwonek</option><option value="Mail">Mail</option><option value="Key">Klucz</option>
                        <option value="MessageSquare">Wiadomość</option><option value="Phone">Telefon</option><option value="CheckSquare">Zadanie</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button type="button" className="wpd-iconbtn wpd-iconbtn--del" onClick={() => removeTemplate(idx)}><Trash2 /></button>
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" className="wpd-btn" style={{ width: '100%', marginTop: 4, borderStyle: 'dashed', padding: 14 }} onClick={addTemplate}><Plus /> Dodaj przypomnienie</button>
            </>
          )}

        </div>

        <div className="wpd-dialog__foot">
          <button type="button" className="wpd-btn" onClick={() => setShowSettingsModal(false)}>Anuluj</button>
          <button type="button" className="wpd-btn wpd-btn--primary" onClick={saveSettings}>Zapisz ustawienia</button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(SettingsModal);
