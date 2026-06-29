import React, { useState, useEffect } from 'react';
import { db, storage } from '../../../firebase';
import { collection, query, where, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { QRCodeSVG } from 'qrcode.react';
import { Plus, Edit2, Trash2, Link as LinkIcon, Save, X, Image as ImageIcon, Copy, MapPin, Wifi, Key, BookOpen, Navigation, Loader2, FileText, Upload, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GuideBuilderV4({ user, properties }) {
  const [guides, setGuides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingGuide, setEditingGuide] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

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
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setGuides(fetched);
    } catch (err) {
      console.error("Błąd pobierania przewodników:", err);
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
      id: `guide_${Date.now()}`,
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
      attractions: []
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
        secrets = {
          wifiNetwork: guide.wifiNetwork || '',
          wifiPassword: guide.wifiPassword || '',
          doorPin: guide.doorPin || ''
        };
      }
    } catch (e) {
      console.error("Błąd pobierania sekretów do edycji:", e);
    } finally {
      setIsLoading(false);
    }

    setEditingGuide({ 
      ...guide, 
      ...secrets,
      ppoRules: guide.ppoRules || defaultPpoRules 
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten przewodnik? Ten link przestanie działać dla gości.')) {
      try {
        await deleteDoc(doc(db, 'guides', id));
        toast.success('Usunięto przewodnik');
        setGuides(guides.filter(g => g.id !== id));
      } catch (err) {
        console.error("Błąd usuwania przewodnika:", err);
        toast.error('Błąd podczas usuwania');
      }
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      alert("Plik jest za duży. Maksymalny rozmiar to 5MB.");
      return;
    }

    setUploadingImage(true);
    try {
      const storageRef = ref(storage, `guides/${editingGuide.id}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setEditingGuide({ ...editingGuide, coverImage: url });
    } catch (err) {
      console.error("Błąd przesyłania zdjęcia:", err);
      alert("Nie udało się przesłać zdjęcia.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      alert("Plik jest za duży. Maksymalny rozmiar to 5MB.");
      return;
    }

    setUploadingFile(true);
    try {
      const storageRef = ref(storage, `guides/${editingGuide.id}/rules_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setEditingGuide({ ...editingGuide, houseRulesFile: { name: file.name, url } });
    } catch (err) {
      console.error("Błąd przesyłania pliku:", err);
      alert("Nie udało się przesłać pliku. Upewnij się, że ma format PDF lub DOC/DOCX.");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleRemoveFile = async () => {
    if (window.confirm("Czy na pewno usunąć ten plik regulaminu?")) {
      setEditingGuide({ ...editingGuide, houseRulesFile: null });
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingGuide.name) return;
    
    setIsSaving(true);
    try {
      const isNew = !guides.some(g => g.id === editingGuide.id);
      const docRef = doc(db, 'guides', editingGuide.id);
      
      const { wifiNetwork, wifiPassword, doorPin, ...publicGuideData } = editingGuide;
      const hasSensitiveData = !!(wifiNetwork || wifiPassword || doorPin);

      const guideDataToSave = {
        ...publicGuideData,
        hasSensitiveData,
        ownerId: user.uid,
        updatedAt: serverTimestamp()
      };
      
      if (isNew) {
        await setDoc(docRef, {
          ...guideDataToSave,
          createdAt: serverTimestamp()
        });
      } else {
        await updateDoc(docRef, guideDataToSave);
      }

      if (hasSensitiveData) {
        const secretsRef = doc(db, 'guides', editingGuide.id, 'secrets', 'data');
        await setDoc(secretsRef, {
          wifiNetwork: wifiNetwork || '',
          wifiPassword: wifiPassword || '',
          doorPin: doorPin || ''
        });
      }

      toast.success(isNew ? 'Przewodnik został zapisany' : 'Przewodnik został zaktualizowany');
      setEditingGuide(null);
      fetchGuides();
    } catch (err) {
      console.error("Błąd zapisu przewodnika:", err);
      toast.error('Wystąpił błąd podczas zapisywania');
    } finally {
      setIsSaving(false);
    }
  };

  const addAttraction = () => {
    setEditingGuide({
      ...editingGuide,
      attractions: [...editingGuide.attractions, { name: '', description: '', link: '' }]
    });
  };

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
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}><Loader2 className="w-8 h-8 animate-spin" style={{ color: '#A0987F' }} /></div>;
  }

  const inputStyle = {
    width: '100%', padding: '12px', background: '#FBFAF6', border: '1px solid #DDD5C3', borderRadius: '4px', fontSize: '14px', color: '#17150F', outline: 'none'
  };
  const labelStyle = { display: 'block', fontSize: '10px', fontWeight: 600, color: '#9A917D', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '8px' };
  const cardStyle = { background: '#FBFAF6', border: '1px solid #DDD5C3', borderRadius: '4px', padding: '24px' };
  const headerStyle = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 600, color: '#17150F', marginBottom: '20px' };

  if (editingGuide) {
    const publicUrl = `${window.location.origin}/guide/${editingGuide.id}`;
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#17150F', margin: 0 }}>
              {guides.some(g => g.id === editingGuide.id) ? 'Edytuj Przewodnik' : 'Nowy Przewodnik'}
            </h2>
            <p className="mono" style={{ fontSize: '10px', color: '#9A917D', marginTop: '4px', letterSpacing: '.05em', textTransform: 'uppercase' }}>Zaprojektuj stronę powitalną dla gości</p>
          </div>
          <button onClick={() => setEditingGuide(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', color: '#A0987F' }}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', gridColumn: '1 / -1' }}>
            
            {/* Podstawowe */}
            <div style={cardStyle}>
              <h3 style={headerStyle}><MapPin className="w-5 h-5" style={{ color: '#3D382E' }}/> Podstawowe Informacje</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Nazwa przewodnika</label>
                  <input required value={editingGuide.name} onChange={e => setEditingGuide({...editingGuide, name: e.target.value})} style={inputStyle} placeholder="np. Informator - Domek Leśny" />
                </div>
                <div>
                  <label style={labelStyle}>Powiązany Obiekt</label>
                  <select value={editingGuide.propertyId} onChange={e => setEditingGuide({...editingGuide, propertyId: e.target.value})} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">(Brak powiązania)</option>
                    {properties.map(p => (
                      <option key={p.name} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Zdjęcie Główne (Okładka)</label>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  {editingGuide.coverImage && (
                    <img src={editingGuide.coverImage} alt="Cover" style={{ width: '96px', height: '96px', borderRadius: '4px', objectFit: 'cover', border: '1px solid #DDD5C3' }} />
                  )}
                  <label style={{ flex: 1, border: '1px dashed #DDD5C3', borderRadius: '4px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: '#F6F1E3' }}>
                    {uploadingImage ? (
                       <Loader2 className="w-6 h-6 animate-spin" style={{ color: '#A0987F' }} />
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 mb-2" style={{ color: '#A0987F' }} />
                        <span className="mono" style={{ fontSize: '10px', color: '#524C3F', fontWeight: 600 }}>Wgraj zdjęcie (max 5MB)</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploadingImage} />
                  </label>
                </div>
              </div>
            </div>

            {/* Dostęp i Wi-Fi */}
            <div style={cardStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={headerStyle}><Wifi className="w-5 h-5" style={{ color: '#3D382E' }}/> Sieć Wi-Fi</h3>
                  <div>
                    <label style={labelStyle}>Nazwa sieci (SSID)</label>
                    <input value={editingGuide.wifiNetwork} onChange={e => setEditingGuide({...editingGuide, wifiNetwork: e.target.value})} style={inputStyle} placeholder="np. Domek_Goscie" />
                  </div>
                  <div>
                    <label style={labelStyle}>Hasło</label>
                    <input value={editingGuide.wifiPassword} onChange={e => setEditingGuide({...editingGuide, wifiPassword: e.target.value})} style={inputStyle} placeholder="np. supertajnehaslo123" />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={headerStyle}><Key className="w-5 h-5" style={{ color: '#3D382E' }}/> Dostęp do Obiektu</h3>
                  <div>
                    <label style={labelStyle}>Kod do drzwi / kłódki (Opcjonalnie)</label>
                    <input value={editingGuide.doorPin} onChange={e => setEditingGuide({...editingGuide, doorPin: e.target.value})} style={{ ...inputStyle, fontFamily: 'monospace', letterSpacing: '2px' }} placeholder="np. 1234#" />
                  </div>
                  <div>
                    <label style={labelStyle}>Dodatkowe instrukcje zameldowania</label>
                    <textarea rows="3" value={editingGuide.checkInInfo} onChange={e => setEditingGuide({...editingGuide, checkInInfo: e.target.value})} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Kluczyk znajduje się w skrytce..." />
                  </div>
                  <div>
                    <label style={labelStyle}>Link do mapy z dokładną lokalizacją</label>
                    <input value={editingGuide.mapLink || ''} onChange={e => setEditingGuide({...editingGuide, mapLink: e.target.value})} style={inputStyle} placeholder="https://maps.app.goo.gl/..." />
                  </div>
                </div>
              </div>
            </div>

            {/* Regulamin */}
            <div style={cardStyle}>
               <h3 style={headerStyle}><BookOpen className="w-5 h-5" style={{ color: '#3D382E' }}/> Ważne Zasady / Regulamin</h3>
               <textarea rows="4" value={editingGuide.houseRules} onChange={e => setEditingGuide({...editingGuide, houseRules: e.target.value})} style={{ ...inputStyle, resize: 'vertical', marginBottom: '16px' }} placeholder="1. Cisza nocna..." />
               
               <div style={{ paddingTop: '16px', borderTop: '1px solid #EFE9DA' }}>
                 <label style={labelStyle}>Lub wgraj plik z regulaminem (PDF, DOC)</label>
                 {editingGuide.houseRulesFile ? (
                   <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#F6F1E3', borderRadius: '4px', border: '1px solid #DDD5C3' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                       <FileText className="w-6 h-6" style={{ color: '#3D382E' }} />
                       <span style={{ fontSize: '14px', fontWeight: 600, color: '#17150F', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{editingGuide.houseRulesFile.name}</span>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                       <a href={editingGuide.houseRulesFile.url} target="_blank" rel="noreferrer" style={{ padding: '8px', background: '#FBFAF6', border: '1px solid #DDD5C3', borderRadius: '4px', color: '#524C3F' }}>
                         <LinkIcon className="w-4 h-4" />
                       </a>
                       <button type="button" onClick={handleRemoveFile} style={{ padding: '8px', background: '#FBFAF6', border: '1px solid #DDD5C3', borderRadius: '4px', color: '#D9492B', cursor: 'pointer' }}>
                         <Trash2 className="w-4 h-4" />
                       </button>
                     </div>
                   </div>
                 ) : (
                   <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '16px', border: '1px dashed #DDD5C3', borderRadius: '4px', cursor: 'pointer', background: '#F6F1E3' }}>
                     {uploadingFile ? (
                       <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#A0987F' }} />
                     ) : (
                       <>
                         <Upload className="w-5 h-5" style={{ color: '#A0987F' }} />
                         <span className="mono" style={{ fontSize: '10px', color: '#524C3F', fontWeight: 600 }}>Wybierz plik (.pdf, .doc)</span>
                       </>
                     )}
                     <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} style={{ display: 'none' }} disabled={uploadingFile} />
                   </label>
                 )}
               </div>
            </div>

            {/* PPOZ */}
            <div style={cardStyle}>
               <h3 style={headerStyle}><ShieldAlert className="w-5 h-5" style={{ color: '#D9492B' }}/> Instrukcja Bezpieczeństwa PPOŻ</h3>
               <p style={{ fontSize: '12px', color: '#9A917D', marginBottom: '16px' }}>Ten tekst jest automatycznie generowany. Możesz go edytować.</p>
               <textarea rows="6" value={editingGuide.ppoRules || ''} onChange={e => setEditingGuide({...editingGuide, ppoRules: e.target.value})} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>

            {/* Atrakcje */}
            <div style={cardStyle}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                 <h3 style={{ margin: 0, ...headerStyle, marginBottom: 0 }}><Navigation className="w-5 h-5" style={{ color: '#3D382E' }}/> Lokalne Atrakcje i Restauracje</h3>
                 <button type="button" onClick={addAttraction} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', background: '#E0D8C6', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: 600, color: '#3D382E', cursor: 'pointer' }}>
                   <Plus className="w-4 h-4" /> Dodaj
                 </button>
               </div>
               
               {editingGuide.attractions.length === 0 ? (
                 <p style={{ fontSize: '14px', color: '#9A917D', fontStyle: 'italic' }}>Brak dodanych atrakcji. Kliknij "Dodaj", aby polecić gościom fajne miejsca.</p>
               ) : (
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                   {editingGuide.attractions.map((attr, idx) => (
                     <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', background: '#F6F1E3', padding: '16px', borderRadius: '4px', border: '1px solid #DDD5C3' }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <input value={attr.name} onChange={e => updateAttraction(idx, 'name', e.target.value)} style={inputStyle} placeholder="Nazwa miejsca" />
                          <input value={attr.description} onChange={e => updateAttraction(idx, 'description', e.target.value)} style={inputStyle} placeholder="Krótki opis" />
                          <input value={attr.link} onChange={e => updateAttraction(idx, 'link', e.target.value)} style={inputStyle} placeholder="Link do mapy" />
                        </div>
                        <button type="button" onClick={() => removeAttraction(idx)} style={{ padding: '8px', background: 'transparent', border: 'none', color: '#D9492B', cursor: 'pointer' }}>
                          <Trash2 className="w-5 h-5" />
                        </button>
                     </div>
                   ))}
                 </div>
               )}
            </div>
            
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <div style={{ ...cardStyle, position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button type="submit" disabled={isSaving || !editingGuide.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '16px', background: isSaving || !editingGuide.name ? '#E0D8C6' : '#17150F', color: isSaving || !editingGuide.name ? '#A0987F' : '#FBFAF6', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 600, cursor: isSaving || !editingGuide.name ? 'not-allowed' : 'pointer' }}>
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} 
                  Zapisz Przewodnik
                </button>
                <button type="button" onClick={() => setEditingGuide(null)} style={{ width: '100%', padding: '16px', background: 'transparent', border: '1px solid #DDD5C3', borderRadius: '4px', fontSize: '14px', fontWeight: 600, color: '#524C3F', cursor: 'pointer' }}>
                  Anuluj
                </button>
              </div>

              {guides.some(g => g.id === editingGuide.id) && (
                <div style={{ borderTop: '1px solid #EFE9DA', paddingTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h4 className="mono" style={{ fontSize: '12px', fontWeight: 600, color: '#17150F', textTransform: 'uppercase', letterSpacing: '.05em', textAlign: 'center', margin: 0 }}>Udostępnij Gościom</h4>
                  
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '16px', background: '#FFF', borderRadius: '4px', border: '1px solid #DDD5C3' }}>
                    <QRCodeSVG value={publicUrl} size={150} level="M" />
                  </div>
                  
                  <div style={{ position: 'relative' }}>
                    <input readOnly value={publicUrl} className="mono" style={{ ...inputStyle, paddingRight: '40px', fontSize: '10px' }} />
                    <button type="button" onClick={() => { navigator.clipboard.writeText(publicUrl); toast.success('Skopiowano link'); }} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', padding: '6px', background: 'transparent', border: 'none', color: '#17150F', cursor: 'pointer' }} title="Kopiuj link">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  <a href={publicUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '12px', background: '#F6F1E3', border: '1px solid #DDD5C3', borderRadius: '4px', fontSize: '14px', fontWeight: 600, color: '#17150F', textDecoration: 'none' }}>
                    <LinkIcon className="w-4 h-4" /> Otwórz Podgląd
                  </a>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', background: '#FBFAF6', border: '1px solid #DDD5C3', borderRadius: '4px', padding: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#17150F', margin: 0 }}>Przewodniki dla Gości</h2>
          <p className="mono" style={{ fontSize: '10px', color: '#9A917D', marginTop: '8px', letterSpacing: '.05em', textTransform: 'uppercase' }}>Twórz strony powitalne z informacjami o obiekcie</p>
        </div>
        <button onClick={handleCreateNew} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#17150F', color: '#FBFAF6', border: 'none', borderRadius: '4px', padding: '12px 24px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
          <Plus className="w-5 h-5" /> Nowy Przewodnik
        </button>
      </div>

      {guides.length === 0 ? (
        <div style={{ background: '#F6F1E3', border: '1px dashed #DDD5C3', borderRadius: '4px', padding: '48px', textAlign: 'center' }}>
          <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: '#A0987F' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#17150F', marginBottom: '8px' }}>Brak przewodników</h3>
          <p style={{ fontSize: '14px', color: '#524C3F' }}>Kliknij "Nowy Przewodnik", aby stworzyć pierwszy cyfrowy informator.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {guides.map(guide => (
            <div key={guide.id} style={{ display: 'flex', flexDirection: 'column', background: '#FBFAF6', border: '1px solid #DDD5C3', borderRadius: '4px', overflow: 'hidden' }}>
              {guide.coverImage ? (
                <div style={{ height: '160px', width: '100%', position: 'relative' }}>
                  <img src={guide.coverImage} alt={guide.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }}></div>
                  {guide.propertyId && (
                    <span className="mono" style={{ position: 'absolute', bottom: '12px', left: '16px', background: '#FBFAF6', color: '#17150F', padding: '4px 8px', borderRadius: '2px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' }}>
                      {guide.propertyId}
                    </span>
                  )}
                </div>
              ) : (
                <div style={{ height: '160px', width: '100%', background: '#F6F1E3', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <BookOpen className="w-12 h-12" style={{ color: '#E0D8C6' }} />
                  {guide.propertyId && (
                    <span className="mono" style={{ position: 'absolute', bottom: '12px', left: '16px', background: '#FBFAF6', color: '#17150F', padding: '4px 8px', borderRadius: '2px', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' }}>
                      {guide.propertyId}
                    </span>
                  )}
                </div>
              )}
              
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#17150F', margin: '0 0 8px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{guide.name}</h3>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                  {guide.wifiNetwork && <span className="mono" style={{ background: '#F6F1E3', border: '1px solid #EFE9DA', color: '#3D382E', padding: '4px 8px', borderRadius: '2px', fontSize: '10px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><Wifi className="w-3 h-3"/> Wi-Fi</span>}
                  {guide.doorPin && <span className="mono" style={{ background: '#F6F1E3', border: '1px solid #EFE9DA', color: '#3D382E', padding: '4px 8px', borderRadius: '2px', fontSize: '10px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><Key className="w-3 h-3"/> PIN</span>}
                  {guide.attractions?.length > 0 && <span className="mono" style={{ background: '#F6F1E3', border: '1px solid #EFE9DA', color: '#3D382E', padding: '4px 8px', borderRadius: '2px', fontSize: '10px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>{guide.attractions.length} Atrakcji</span>}
                </div>
                
                <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #EFE9DA', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleEdit(guide)} style={{ padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#524C3F' }}>
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(guide.id)} style={{ padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#D9492B' }}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/guide/${guide.id}`); toast.success('Skopiowano link'); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#F6F1E3', border: '1px solid #DDD5C3', borderRadius: '4px', color: '#17150F', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
                    <Copy className="w-3.5 h-3.5" /> Kopiuj Link
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
