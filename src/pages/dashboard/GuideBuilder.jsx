import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase';
import { collection, query, where, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, deleteField, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { QRCodeSVG } from 'qrcode.react';
import {
  Plus, Edit, Trash2, Link as LinkIcon, Save, X, Image as ImageIcon, Copy, MapPin, Wifi,
  Key, BookOpen, Navigation, FileText, Upload, ShieldAlert,
} from 'lucide-react';
import toast from 'react-hot-toast';
import DeleteConfirmModal from './modals/DeleteConfirmModal';
import { normalizeUrl } from '../../utils/url';

const MAX_UPLOAD = 10 * 1024 * 1024; // 10 MB

/*
  Kreator przewodników dla gości — styl V4.
  LOGIKA przeniesiona 1:1 z src/components/GuideBuilder.jsx (fetch/edit/delete/upload/save/
  atrakcje/sekrety/QR). Zmieniona wyłącznie warstwa wizualna (namespace .wpd) + limit 5→10 MB.
*/
export default function GuideBuilder({ user, properties }) {
  const [guides, setGuides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingGuide, setEditingGuide] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  // potwierdzenia w brandowym dialogu zamiast window.confirm: { title, message, action }
  const [confirmBox, setConfirmBox] = useState(null);

  useEffect(() => {
    fetchGuides();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchGuides = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const q = query(collection(db, 'guides'), where('ownerId', '==', user.uid));
      const snap = await getDocs(q);
      const fetched = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      // strony opinii (type:'review', X13) żyją w tej samej kolekcji, ale mają własny edytor (ReviewBuilder)
      setGuides(fetched.filter((g) => g.type !== 'review'));
    } catch (err) {
      console.error('Błąd pobierania przewodników:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const defaultPpoRules = `- Zakaz używania otwartego ognia wewnątrz obiektu.
- Korzystanie z kominka/grilla dozwolone wyłącznie zgodnie z przeznaczeniem; nie pozostawiaj rozpalonego ognia bez nadzoru.
- Przed opuszczeniem obiektu upewnij się, że wszystkie urządzenia elektryczne i grzewcze są wyłączone.
- Upewnij się, że znasz lokalizację gaśnicy znajdującej się w obiekcie.`;

  const handleCreateNew = () => {
    setEditingGuide({
      // UUID zamiast Date.now(): id jest w publicznym URL i w ścieżce Storage —
      // musi być nieodgadywalne (okno uploadu przed pierwszym zapisem, storage.rules)
      id: `guide_${window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)}`,
      name: '',
      propertyId: properties.length > 0 ? properties[0].name : '',
      coverImage: '',
      wifiNetwork: '',
      wifiPassword: '',
      doorPin: '',
      checkInInfo: '',
      houseRules: '',
      houseRulesFile: null,
      ppoRules: defaultPpoRules,
      mapLink: '',
      attractions: [],
    });
  };

  const handleEdit = async (guide) => {
    setIsLoading(true);
    let secrets = { wifiNetwork: '', wifiPassword: '', doorPin: '' };
    try {
      const secretsSnap = await getDoc(doc(db, 'guides', guide.id, 'secrets', 'data'));
      if (secretsSnap.exists()) {
        secrets = secretsSnap.data();
      } else {
        secrets = { wifiNetwork: guide.wifiNetwork || '', wifiPassword: guide.wifiPassword || '', doorPin: guide.doorPin || '' };
      }
    } catch (e) {
      console.error('Błąd pobierania sekretów do edycji:', e);
    } finally {
      setIsLoading(false);
    }
    setEditingGuide({ ...guide, ...secrets, ppoRules: guide.ppoRules || defaultPpoRules });
  };

  const deleteGuide = async (id) => {
    try {
      await deleteDoc(doc(db, 'guides', id));
      toast.success('Usunięto przewodnik');
      setGuides((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      console.error('Błąd usuwania przewodnika:', err);
      toast.error('Błąd podczas usuwania');
    }
  };

  const handleDelete = (id) => setConfirmBox({
    title: 'Usuwanie przewodnika',
    message: 'Czy na pewno chcesz usunąć ten przewodnik? Ten link przestanie działać dla gości.',
    action: () => deleteGuide(id),
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_UPLOAD) {
      toast.error('Plik jest za duży. Maksymalny rozmiar to 10 MB.');
      return;
    }
    setUploadingImage(true);
    try {
      const storageRef = ref(storage, `guides/${editingGuide.id}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setEditingGuide({ ...editingGuide, coverImage: url });
    } catch (err) {
      console.error('Błąd przesyłania zdjęcia:', err);
      toast.error('Nie udało się przesłać zdjęcia.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_UPLOAD) {
      toast.error('Plik jest za duży. Maksymalny rozmiar to 10 MB.');
      return;
    }
    setUploadingFile(true);
    try {
      const storageRef = ref(storage, `guides/${editingGuide.id}/rules_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setEditingGuide({ ...editingGuide, houseRulesFile: { name: file.name, url } });
    } catch (err) {
      console.error('Błąd przesyłania pliku:', err);
      toast.error('Nie udało się przesłać pliku. Upewnij się, że ma format PDF lub DOC/DOCX.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleRemoveFile = () => setConfirmBox({
    title: 'Usuwanie pliku',
    message: 'Czy na pewno usunąć ten plik regulaminu?',
    action: () => setEditingGuide((prev) => ({ ...prev, houseRulesFile: null })),
  });

  // wspólny dla obu gałęzi renderu (lista / edycja)
  const confirmModal = confirmBox && (
    <DeleteConfirmModal
      title={confirmBox.title}
      message={confirmBox.message}
      onCancel={() => setConfirmBox(null)}
      onConfirm={() => { confirmBox.action(); setConfirmBox(null); }}
    />
  );

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingGuide.name) return;
    setIsSaving(true);
    try {
      const isNew = !guides.some((g) => g.id === editingGuide.id);
      const docRef = doc(db, 'guides', editingGuide.id);
      const { wifiNetwork, wifiPassword, doorPin, ...publicGuideData } = editingGuide;
      const hasSensitiveData = !!(wifiNetwork || wifiPassword || doorPin);
      // łącza bez protokołu dostają https:// — strona publiczna renderuje href
      // wyłącznie dla http(s) (safeHref), więc bez normalizacji zniknęłyby gościom
      publicGuideData.mapLink = normalizeUrl(publicGuideData.mapLink);
      publicGuideData.attractions = (publicGuideData.attractions || []).map((a) => ({ ...a, link: normalizeUrl(a.link) }));
      const guideDataToSave = { ...publicGuideData, hasSensitiveData, ownerId: user.uid, updatedAt: serverTimestamp() };

      if (isNew) {
        await setDoc(docRef, { ...guideDataToSave, createdAt: serverTimestamp() });
      } else {
        // migracja legacy przy każdej edycji: sekrety znikają z publicznego dokumentu
        // (żyją wyłącznie w secrets/data); reguły blokują ich dodawanie/zmianę (N5 🔴2)
        await updateDoc(docRef, { ...guideDataToSave, wifiNetwork: deleteField(), wifiPassword: deleteField(), doorPin: deleteField() });
      }

      const secretsRef = doc(db, 'guides', editingGuide.id, 'secrets', 'data');
      if (hasSensitiveData) {
        await setDoc(secretsRef, { wifiNetwork: wifiNetwork || '', wifiPassword: wifiPassword || '', doorPin: doorPin || '' });
      } else if (!isNew) {
        // wyczyszczenie pól w edytorze usuwa też stare wartości z secrets/data
        await deleteDoc(secretsRef);
      }

      toast.success(isNew ? 'Przewodnik został zapisany' : 'Przewodnik został zaktualizowany');
      setEditingGuide(null);
      fetchGuides();
    } catch (err) {
      console.error('Błąd zapisu przewodnika:', err);
      toast.error('Wystąpił błąd podczas zapisywania');
    } finally {
      setIsSaving(false);
    }
  };

  const addAttraction = () => setEditingGuide({ ...editingGuide, attractions: [...editingGuide.attractions, { name: '', description: '', link: '' }] });
  const updateAttraction = (index, field, value) => {
    const updated = [...editingGuide.attractions];
    updated[index][field] = value;
    setEditingGuide({ ...editingGuide, attractions: updated });
  };
  const removeAttraction = (index) => {
    const updated = [...editingGuide.attractions];
    updated.splice(index, 1);
    setEditingGuide({ ...editingGuide, attractions: updated });
  };

  if (isLoading) {
    return <div className="wpd-empty"><div className="wpd-spin" style={{ margin: '0 auto' }} /></div>;
  }

  // --- WIDOK FORMULARZA (EDYCJA / TWORZENIE) ---
  if (editingGuide) {
    const publicUrl = `${window.location.origin}/guide/${editingGuide.id}`;
    const isExisting = guides.some((g) => g.id === editingGuide.id);

    return (
      <>
        {confirmModal}
        <div className="wpd-panel" style={{ marginBottom: 18 }}>
          <div className="wpd-panel__head">
            <div>
              <h2 className="wpd-h2">{isExisting ? 'Edytuj przewodnik' : 'Nowy przewodnik'}</h2>
              <p className="wpd-dialog__sub" style={{ marginTop: 4 }}>Strona powitalna dla gości</p>
            </div>
            <button className="wpd-dialog__close" style={{ marginLeft: 'auto' }} onClick={() => setEditingGuide(null)}><X /></button>
          </div>
        </div>

        <form onSubmit={handleSave} className="wpd-gb-form">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Podstawowe informacje */}
            <div className="wpd-panel">
              <div className="wpd-panel__head"><MapPin style={{ width: 16, height: 16, color: 'var(--cynober)' }} /><h2 className="wpd-h2" style={{ fontSize: 15 }}>Podstawowe informacje</h2></div>
              <div style={{ padding: 18 }}>
                <div className="wpd-fgrid">
                  <div className="wpd-field">
                    <label className="wpd-flabel">Nazwa przewodnika</label>
                    <input className="wpd-input" required value={editingGuide.name} onChange={(e) => setEditingGuide({ ...editingGuide, name: e.target.value })} placeholder="np. Informator — Domek Leśny" />
                  </div>
                  <div className="wpd-field">
                    <label className="wpd-flabel">Powiązany obiekt</label>
                    <select className="wpd-select" value={editingGuide.propertyId} onChange={(e) => setEditingGuide({ ...editingGuide, propertyId: e.target.value })}>
                      <option value="">(Brak powiązania)</option>
                      {properties.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="wpd-field" style={{ marginBottom: 0 }}>
                  <label className="wpd-flabel">Zdjęcie główne (okładka)</label>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    {editingGuide.coverImage && <img src={editingGuide.coverImage} alt="Okładka" className="wpd-cover" />}
                    <label className="wpd-up" style={{ flex: 1 }}>
                      {uploadingImage ? <div className="wpd-spin" /> : (<><ImageIcon /><span className="wpd-up__txt">Kliknij, aby wgrać zdjęcie (max 10MB)</span></>)}
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploadingImage} />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Dostęp i Wi-Fi */}
            <div className="wpd-panel">
              <div className="wpd-panel__head"><Key style={{ width: 16, height: 16, color: 'var(--amber)' }} /><h2 className="wpd-h2" style={{ fontSize: 15 }}>Dostęp i Wi-Fi</h2></div>
              <div style={{ padding: 18 }}>
                <div className="wpd-fgrid">
                  <div className="wpd-field">
                    <label className="wpd-flabel"><Wifi style={{ width: 11, height: 11, display: 'inline', verticalAlign: '-1px' }} /> Nazwa sieci (SSID)</label>
                    <input className="wpd-input" value={editingGuide.wifiNetwork} onChange={(e) => setEditingGuide({ ...editingGuide, wifiNetwork: e.target.value })} placeholder="np. Domek_Goscie" />
                  </div>
                  <div className="wpd-field">
                    <label className="wpd-flabel">Hasło Wi-Fi</label>
                    <input className="wpd-input" value={editingGuide.wifiPassword} onChange={(e) => setEditingGuide({ ...editingGuide, wifiPassword: e.target.value })} placeholder="np. supertajnehaslo123" />
                  </div>
                </div>
                <div className="wpd-field">
                  <label className="wpd-flabel">Kod do drzwi / kłódki (opcjonalnie)</label>
                  <input className="wpd-input wpd-input--num" value={editingGuide.doorPin} onChange={(e) => setEditingGuide({ ...editingGuide, doorPin: e.target.value })} placeholder="np. 1234#" style={{ letterSpacing: '.1em' }} />
                </div>
                <div className="wpd-field">
                  <label className="wpd-flabel">Dodatkowe instrukcje zameldowania</label>
                  <textarea className="wpd-textarea" rows="3" value={editingGuide.checkInInfo} onChange={(e) => setEditingGuide({ ...editingGuide, checkInInfo: e.target.value })} placeholder="Kluczyk znajduje się w skrytce obok drzwi…" />
                </div>
                <div className="wpd-field" style={{ marginBottom: 0 }}>
                  <label className="wpd-flabel">Link do mapy (Google Maps)</label>
                  <input className="wpd-input" value={editingGuide.mapLink || ''} onChange={(e) => setEditingGuide({ ...editingGuide, mapLink: e.target.value })} placeholder="https://maps.app.goo.gl/…" />
                </div>
              </div>
            </div>

            {/* Regulamin */}
            <div className="wpd-panel">
              <div className="wpd-panel__head"><BookOpen style={{ width: 16, height: 16, color: 'var(--granat)' }} /><h2 className="wpd-h2" style={{ fontSize: 15 }}>Ważne zasady / regulamin</h2></div>
              <div style={{ padding: 18 }}>
                <div className="wpd-field">
                  <textarea className="wpd-textarea" rows="4" value={editingGuide.houseRules} onChange={(e) => setEditingGuide({ ...editingGuide, houseRules: e.target.value })} placeholder={'1. Cisza nocna obowiązuje w godzinach…\n2. Zakaz palenia wewnątrz obiektu…'} />
                </div>
                <div className="wpd-field" style={{ marginBottom: 0 }}>
                  <label className="wpd-flabel">Lub wgraj plik z regulaminem (PDF, DOC)</label>
                  {editingGuide.houseRulesFile ? (
                    <div className="wpd-filechip">
                      <span className="wpd-filechip__name"><FileText style={{ width: 16, height: 16, color: 'var(--granat)', flex: '0 0 16px' }} /><b>{editingGuide.houseRulesFile.name}</b></span>
                      <span style={{ display: 'flex', gap: 6 }}>
                        <a className="wpd-iconbtn" href={editingGuide.houseRulesFile.url} target="_blank" rel="noreferrer" title="Podgląd"><LinkIcon /></a>
                        <button type="button" className="wpd-iconbtn wpd-iconbtn--del" onClick={handleRemoveFile} title="Usuń plik"><Trash2 /></button>
                      </span>
                    </div>
                  ) : (
                    <label className="wpd-up" style={{ flexDirection: 'row' }}>
                      {uploadingFile ? <div className="wpd-spin" /> : (<><Upload /><span className="wpd-up__txt">Wybierz plik z urządzenia (.pdf, .doc)</span></>)}
                      <input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFileUpload} style={{ display: 'none' }} disabled={uploadingFile} />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* PPOŻ */}
            <div className="wpd-panel">
              <div className="wpd-panel__head"><ShieldAlert style={{ width: 16, height: 16, color: 'var(--cynober)' }} /><h2 className="wpd-h2" style={{ fontSize: 15 }}>Instrukcja bezpieczeństwa PPOŻ</h2></div>
              <div style={{ padding: 18 }}>
                <p style={{ fontSize: 12, color: 'var(--faint)', margin: '0 0 12px' }}>Tekst generowany automatycznie. Możesz go dowolnie edytować.</p>
                <textarea className="wpd-textarea" rows="6" value={editingGuide.ppoRules || ''} onChange={(e) => setEditingGuide({ ...editingGuide, ppoRules: e.target.value })} placeholder="Wpisz zasady bezpieczeństwa przeciwpożarowego…" />
              </div>
            </div>

            {/* Atrakcje */}
            <div className="wpd-panel">
              <div className="wpd-panel__head">
                <Navigation style={{ width: 16, height: 16, color: 'var(--green)' }} /><h2 className="wpd-h2" style={{ fontSize: 15 }}>Lokalne atrakcje i restauracje</h2>
                <button type="button" className="wpd-btn wpd-btn--sm" style={{ marginLeft: 'auto' }} onClick={addAttraction}><Plus /> Dodaj</button>
              </div>
              <div style={{ padding: 18 }}>
                {editingGuide.attractions.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--faint)', margin: 0 }}>Brak atrakcji. Kliknij „Dodaj", aby polecić gościom ciekawe miejsca.</p>
                ) : editingGuide.attractions.map((attr, idx) => (
                  <div className="wpd-attr" key={idx}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>
                      <input className="wpd-input" value={attr.name} onChange={(e) => updateAttraction(idx, 'name', e.target.value)} placeholder="Nazwa miejsca (np. Pizzeria Napoli)" />
                      <input className="wpd-input" value={attr.description} onChange={(e) => updateAttraction(idx, 'description', e.target.value)} placeholder="Krótki opis, dlaczego warto…" />
                      <input className="wpd-input" value={attr.link} onChange={(e) => updateAttraction(idx, 'link', e.target.value)} placeholder="Link do Google Maps lub strony www" />
                    </div>
                    <button type="button" className="wpd-iconbtn wpd-iconbtn--del" onClick={() => removeAttraction(idx)}><Trash2 /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel boczny publikacji */}
          <div className="wpd-panel" style={{ position: 'sticky', top: 88 }}>
            <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button type="submit" className="wpd-btn wpd-btn--primary" disabled={isSaving || !editingGuide.name}>
                <Save /> {isSaving ? 'Zapisuję…' : 'Zapisz przewodnik'}
              </button>
              <button type="button" className="wpd-btn" onClick={() => setEditingGuide(null)}>Anuluj</button>

              {isExisting && (
                <div style={{ borderTop: '1px solid var(--hairline)', paddingTop: 16, marginTop: 4 }}>
                  <p className="wpd-flabel" style={{ textAlign: 'center', marginBottom: 12 }}>Udostępnij gościom</p>
                  <div className="wpd-qr"><QRCodeSVG value={publicUrl} size={150} level="M" fgColor="#17150F" /></div>
                  <div className="wpd-codebox" style={{ marginTop: 12 }}>
                    <input readOnly value={publicUrl} />
                    <button type="button" className="wpd-btn wpd-btn--sm" onClick={() => { navigator.clipboard.writeText(publicUrl); toast.success('Skopiowano link'); }}><Copy /></button>
                  </div>
                  <a className="wpd-btn" style={{ width: '100%', marginTop: 10 }} href={publicUrl} target="_blank" rel="noreferrer"><LinkIcon /> Otwórz podgląd</a>
                </div>
              )}
            </div>
          </div>
        </form>
      </>
    );
  }

  // --- WIDOK LISTY ---
  return (
    <>
      {confirmModal}
      <div className="wpd-objs__head">
        <span className="wpd-label">Przewodniki dla gości — mobilne strony powitalne</span>
        <button className="wpd-btn wpd-btn--primary" onClick={handleCreateNew}><Plus /> Nowy przewodnik</button>
      </div>

      {guides.length === 0 ? (
        <div className="wpd-soon">
          <div className="wpd-soon__card" style={{ textAlign: 'center' }}>
            <BookOpen style={{ width: 26, height: 26, color: 'var(--faint)', margin: '0 auto 10px', display: 'block' }} />
            <p className="wpd-h2" style={{ fontSize: 16, marginBottom: 6 }}>Brak przewodników</p>
            <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 14px' }}>Stwórz pierwszy cyfrowy informator dla gości.</p>
            <button className="wpd-btn wpd-btn--primary" onClick={handleCreateNew}><Plus /> Nowy przewodnik</button>
          </div>
        </div>
      ) : (
        <div className="wpd-objs">
          {guides.map((guide) => (
            <div className="wpd-obj" key={guide.id}>
              <div className="wpd-gcard__cover">
                {guide.coverImage ? <img src={guide.coverImage} alt={guide.name} /> : <BookOpen style={{ width: 30, height: 30, color: 'var(--faint)' }} />}
                {guide.propertyId && <span className="wpd-gcard__prop">{guide.propertyId}</span>}
              </div>
              <div className="wpd-obj__body">
                <h3 className="wpd-obj__name" style={{ marginBottom: 10 }}>{guide.name}</h3>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {guide.wifiNetwork && <span className="wpd-tag wpd-tag--granat"><Wifi style={{ width: 11, height: 11 }} /> Wi-Fi</span>}
                  {guide.doorPin && <span className="wpd-tag wpd-tag--amber"><Key style={{ width: 11, height: 11 }} /> Kod PIN</span>}
                  {guide.attractions?.length > 0 && <span className="wpd-tag wpd-tag--green">{guide.attractions.length} atrakcji</span>}
                </div>
                <div className="wpd-obj__foot" style={{ justifyContent: 'space-between' }}>
                  <span style={{ display: 'flex', gap: 6 }}>
                    <button className="wpd-iconbtn" title="Edytuj" onClick={() => handleEdit(guide)}><Edit /></button>
                    <button className="wpd-iconbtn wpd-iconbtn--del" title="Usuń" onClick={() => handleDelete(guide.id)}><Trash2 /></button>
                  </span>
                  <button className="wpd-btn wpd-btn--sm" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/guide/${guide.id}`); toast.success('Skopiowano link'); }}><Copy /> Kopiuj link</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
