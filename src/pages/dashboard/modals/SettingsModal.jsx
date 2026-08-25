import React from 'react';
import {
  Settings, X, Building2, Calendar as CalendarIcon, Copy, Trash2, Plus, Globe, Tags,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { propHex } from '../styles';
import { useDialogA11y } from './useDialogA11y';
import { WHEN_OPTIONS, whenValue, whenDays, describeTimingSentence } from '../../../utils/taskSchedule';
import { domyslnyTryb } from '../../../utils/taxSummary';

/* Ustawienia APLIKACJI — profil gospodarza, subskrypcja i usunięcie konta
   przeniesione do AccountModal (X6, klik w imię w sidebarze). */
const TABS = [
  ['properties', 'Nieruchomości'], ['sources', 'Źródła'], ['categories', 'Kategorie'],
  ['tax', 'Podatki'], ['sync', 'Integracje'], ['reminders', 'Powiadomienia'],
];

// X26: drugim parametrem jest ID obiektu, nie nazwa. Adres wydany po nazwie ginął
// przy zmianie nazwy obiektu w panelu — Booking.com zaczynał dostawać 403 i po cichu
// przestawał widzieć blokady terminów. Funkcja `exportIcal` przyjmuje nadal oba,
// żeby adresy wklejone do portali przed tą zmianą działały bez ruszania ich.
const exportUrl = (uid, propertyId, token) =>
  `https://us-central1-moje-domki-6c77d.cloudfunctions.net/exportIcal?u=${uid}&p=${encodeURIComponent(propertyId)}&token=${token || ''}`;

/* Ustawienia systemu — styl V4. Kontrakt propsów 1:1 z oryginałem. */
function SettingsModal(props) {
  const {
    showSettingsModal, setShowSettingsModal, settingsTab, setSettingsTab,
    editingSyncLinks, setEditingSyncLinks, user,
    editingProperties, updateProperty, removeProperty, handleAddProperty, newPropertyName, setNewPropertyName,
    availableColors, newPropertyColor, setNewPropertyColor,
    editingSources, updateSource, removeSource, handleAddSource, newSourceName, setNewSourceName,
    editingCategories, updateCategory, removeCategory, handleAddCategory, newCategoryName, setNewCategoryName,
    editingTaxSettings, setEditingTaxSettings, editingTemplates, updateTemplate, updateTemplateTiming, removeTemplate, addTemplate,
    saveSettings,
  } = props;

  const dialogA11y = useDialogA11y(showSettingsModal, () => setShowSettingsModal(false));
  /* X20: przy 0 dni „przed" i „po" wypadają w ten sam dzień, więc z samych danych nie da się
     odtworzyć, co gospodarz wybrał na liście — a lista nie może mu skakać pod palcami
     w trakcie ustawiania. Wybór trzymamy więc lokalnie, po id szablonu. */
  const [pickedWhen, setPickedWhen] = React.useState({});
  const whenFor = (t) => pickedWhen[t.id] ?? whenValue(t);
  const pickWhen = (idx, t, when) => {
    setPickedWhen((prev) => ({ ...prev, [t.id]: when }));
    updateTemplateTiming(idx, when, whenDays(t));
  };

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
              {/* X25: podstawa wynajmu przed formą opodatkowania — od niej zależy,
                  czy w ogóle doliczamy składkę zdrowotną i odliczenie 50%. Bez wartości
                  domyślnej: zgadywanie cudzego statusu podatkowego kosztuje realne pieniądze
                  w obie strony (analiza prawna 2026-08-24, §B1). */}
              <div className="wpd-fieldset" style={{ marginBottom: 14 }}>
                <p className="wpd-fieldset__title">Jak wynajmujesz</p>
                <div className="wpd-fgrid">
                  <label className="wpd-listrow wpd-checkrow" style={{ margin: 0 }}>
                    <input type="radio" checked={ts.rentalBasis === 'private'} onChange={() => setTs({ rentalBasis: 'private' })} />
                    Najem prywatny — wynajmuję poza działalnością gospodarczą
                  </label>
                  <label className="wpd-listrow wpd-checkrow" style={{ margin: 0 }}>
                    <input type="radio" checked={ts.rentalBasis === 'business'} onChange={() => setTs({ rentalBasis: 'business' })} />
                    Działalność gospodarcza — mam wpis w CEIDG
                  </label>
                </div>
                <p className="wpd-fhint" style={{ marginTop: 8 }}>
                  Nie wiemy, która opcja jest Twoja — zależy to od tego, jak faktycznie wynajmujesz.
                  Od tej odpowiedzi zależy, czy doliczamy do wyliczenia składkę zdrowotną.
                  Jeśli masz wątpliwości, zapytaj księgową.
                </p>
              </div>

              <div className="wpd-fgrid" style={{ marginBottom: 14 }}>
                <label className="wpd-listrow wpd-checkrow" style={{ margin: 0 }}>
                  <input type="radio" checked={ts.taxForm === 'lump_sum'} onChange={() => setTs({ taxForm: 'lump_sum' })} /> Ryczałt
                </label>
                <label className="wpd-listrow wpd-checkrow" style={{ margin: 0 }}>
                  <input type="radio" checked={ts.taxForm === 'general'} onChange={() => setTs({ taxForm: 'general' })} /> Zasady ogólne (skala)
                </label>
              </div>
              <div className="wpd-fieldset" style={{ marginBottom: 14 }}>
                <p className="wpd-fieldset__title">Status VAT</p>
                <label className="wpd-checkrow">
                  <input type="checkbox" checked={!!ts.isVatPayer} onChange={(e) => setTs({ isVatPayer: e.target.checked })} />
                  Czynny podatnik VAT — podatek liczony od kwoty netto
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
                    <p className="wpd-fhint">
                      Jeśli masz etat, kwotę wolną uwzględnia już pracodawca — wtedy zostaw tu 0,
                      żeby nie odjąć jej dwa razy. Kwota wolna jest jedna na wszystkie Twoje dochody,
                      nie osobna dla wynajmu.
                    </p>
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
              {/* X25: pola ZUS pokazujemy TYLKO tam, gdzie faktycznie coś robią.
                  Wcześniej oba stały tu zawsze, a przy ryczałcie — czyli formie domyślnej —
                  `zusHealth` nie było używane w ŻADNYM wyliczeniu w całej aplikacji, a
                  `zusSocial` wchodziło wyłącznie przy zasadach ogólnych. Gospodarz wpisywał
                  kwoty i miał prawo sądzić, że są liczone. To gorsze niż brak funkcji. */}
              {ts.taxForm === 'lump_sum' ? (
                <div className="wpd-fieldset" style={{ marginBottom: 14 }}>
                  <p className="wpd-fieldset__title">Składka zdrowotna</p>
                  {ts.rentalBasis === 'business' ? (
                    <p className="wpd-fhint">
                      Przy ryczałcie w działalności zależy od progu Twojego rocznego przychodu,
                      a ten aplikacja zna — więc liczymy ją sami i pokazujemy w Finansach,
                      w zakładce Podatki. Nie musisz jej tutaj wpisywać.
                    </p>
                  ) : ts.rentalBasis === 'private' ? (
                    <p className="wpd-fhint">
                      Przy najmie prywatnym nie doliczamy jej do wyliczenia — najem poza
                      działalnością nie jest tytułem do ubezpieczenia zdrowotnego.
                    </p>
                  ) : (
                    <p className="wpd-fhint">
                      Nie doliczamy jej, dopóki nie wiemy, czy wynajmujesz w ramach działalności.
                      Odpowiedź wyżej, w „Jak wynajmujesz".
                    </p>
                  )}
                  <div className="wpd-field" style={{ marginTop: 8 }}>
                    <label className="wpd-flabel">Składka ZUS społeczna (mies.)</label>
                    <input className="wpd-input wpd-input--num" type="number" value={ts.zusSocial}
                      onChange={(e) => setTs({ zusSocial: Number(e.target.value) })} />
                    <p className="wpd-fhint">Wpisz 0, jeśli nie płacisz społecznych (np. przy zbiegu z umową o pracę).</p>
                  </div>
                </div>
              ) : (
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
              )}

              {/* Wybór trybu — drugie miejsce obok samego widoku podatków. Tutaj, bo
                  gospodarz szuka w ustawieniach trwałych preferencji; tam, bo przełącza
                  się w chwili, gdy faktycznie potrzebuje szczegółów (decyzja 2026-08-24). */}
              <div className="wpd-fieldset" style={{ marginTop: 14 }}>
                <p className="wpd-fieldset__title">Widok podatków</p>
                <p className="wpd-fhint">Domyślnie wynika z Twojej formy opodatkowania. Możesz to zmienić na stałe.</p>
                <label className="wpd-checkrow">
                  <input type="radio" checked={(ts.viewMode || domyslnyTryb(ts)) === 'prosty'}
                    onChange={() => setTs({ viewMode: 'prosty' })} />
                  Podsumowanie — jedna liczba: ile odłożyć
                </label>
                <label className="wpd-checkrow">
                  <input type="radio" checked={(ts.viewMode || domyslnyTryb(ts)) === 'szczegolowy'}
                    onChange={() => setTs({ viewMode: 'szczegolowy' })} />
                  Szczegóły dla księgowego — rozbicie kwot i rozkład miesięczny
                </label>
                <p className="wpd-fhint wpd-mono" style={{ marginTop: 8 }}>
                  Domyślnie: ryczałt → Podsumowanie, zasady ogólne → Szczegóły
                </p>
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
                        <input readOnly value={exportUrl(user?.uid, p.id || p.name, p.secretToken)} />
                        <button type="button" className="wpd-btn wpd-btn--sm" onClick={() => { navigator.clipboard.writeText(exportUrl(user?.uid, p.id || p.name, p.secretToken)); toast.success('Link iCal skopiowany!'); }}><Copy /> Kopiuj</button>
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
                  {/* X20: termin składamy z listy „kiedy" i liczby dni BEZ ZNAKU. Dawne pole
                      „Dni przed" przyjmowało wartości ujemne (jedyny sposób na zadanie po
                      przyjeździe) i nie mówiło, co robią — pytanie testera z 21.08.2026. */}
                  <div className="wpd-fgrid wpd-fgrid--3" style={{ marginTop: 10, alignItems: 'end' }}>
                    <div className="wpd-field" style={{ margin: 0 }}>
                      <label className="wpd-flabel">Kiedy</label>
                      <select className="wpd-select" value={whenFor(t)}
                        onChange={(e) => pickWhen(idx, t, e.target.value)}>
                        {WHEN_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div className="wpd-field" style={{ margin: 0 }}>
                      <label className="wpd-flabel">Ile dni</label>
                      <input className="wpd-input wpd-input--num" type="number" min="0" step="1" value={whenDays(t)}
                        onChange={(e) => updateTemplateTiming(idx, whenFor(t), e.target.value)} />
                    </div>
                    <div className="wpd-field" style={{ margin: 0 }}>
                      <label className="wpd-flabel">Ikona</label>
                      <select className="wpd-select" value={t.icon || 'Bell'} onChange={(e) => updateTemplate(idx, 'icon', e.target.value)}>
                        <option value="Bell">Dzwonek</option><option value="Mail">Mail</option><option value="Key">Klucz</option>
                        <option value="MessageSquare">Wiadomość</option><option value="Phone">Telefon</option><option value="CheckSquare">Zadanie</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
                    <p className="wpd-fhint" style={{ margin: 0, flex: 1 }}>{describeTimingSentence(t)}</p>
                    <button type="button" className="wpd-iconbtn wpd-iconbtn--del" title="Usuń przypomnienie" onClick={() => removeTemplate(idx)}><Trash2 /></button>
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
