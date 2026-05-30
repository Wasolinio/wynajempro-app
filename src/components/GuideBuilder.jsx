import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { QRCodeSVG } from 'qrcode.react';
import { Plus, Edit2, Trash2, Link as LinkIcon, Save, X, Image as ImageIcon, Copy, MapPin, Wifi, Key, BookOpen, Navigation, Loader2, FileText, Upload, File as FileIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GuideBuilder({ user, properties }) {
  const [guides, setGuides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingGuide, setEditingGuide] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    fetchGuides();
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
      attractions: []
    });
  };

  const handleEdit = (guide) => {
    setEditingGuide({ ...guide });
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
      const guideData = {
        ...editingGuide,
        ownerId: user.uid,
        updatedAt: serverTimestamp()
      };
      
      if (isNew) {
        await setDoc(docRef, {
          ...guideData,
          createdAt: serverTimestamp()
        });
        toast.success('Przewodnik został zapisany');
      } else {
        await updateDoc(docRef, guideData);
        toast.success('Przewodnik został zaktualizowany');
      }

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
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  }

  // --- WIDOK FORMULARZA (EDYCJA / TWORZENIE) ---
  if (editingGuide) {
    const publicUrl = `${window.location.origin}/guide/${editingGuide.id}`;
    
    return (
      <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              {guides.some(g => g.id === editingGuide.id) ? 'Edytuj Przewodnik' : 'Nowy Przewodnik'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Zaprojektuj idealną stronę powitalną dla swoich gości</p>
          </div>
          <button onClick={() => setEditingGuide(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-slate-400 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Podstawowe Informacje */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-5">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" /> Podstawowe Informacje
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Nazwa przewodnika</label>
                  <input required value={editingGuide.name} onChange={e => setEditingGuide({...editingGuide, name: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" placeholder="np. Informator - Domek Leśny" />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Powiązany Obiekt</label>
                  <select value={editingGuide.propertyId} onChange={e => setEditingGuide({...editingGuide, propertyId: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer">
                    <option value="">(Brak powiązania)</option>
                    {properties.map(p => (
                      <option key={p.name} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Zdjęcie Główne (Okładka)</label>
                <div className="flex gap-4 items-center">
                  {editingGuide.coverImage && (
                    <img src={editingGuide.coverImage} alt="Cover" className="w-24 h-24 rounded-2xl object-cover shadow-sm border border-slate-200 dark:border-slate-700" />
                  )}
                  <label className="flex-1 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors group">
                    {uploadingImage ? (
                       <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-slate-400 group-hover:text-blue-500 mb-2 transition-colors" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Kliknij, aby wgrać zdjęcie (max 5MB)</span>
                      </>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
                  </label>
                </div>
              </div>
            </div>

            {/* Dostęp i Wi-Fi */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Wifi className="w-5 h-5 text-blue-500" /> Sieć Wi-Fi
                  </h3>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Nazwa sieci (SSID)</label>
                    <input value={editingGuide.wifiNetwork} onChange={e => setEditingGuide({...editingGuide, wifiNetwork: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-blue-500" placeholder="np. Domek_Goscie" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Hasło</label>
                    <input value={editingGuide.wifiPassword} onChange={e => setEditingGuide({...editingGuide, wifiPassword: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-blue-500" placeholder="np. supertajnehaslo123" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Key className="w-5 h-5 text-amber-500" /> Dostęp do Obiektu
                  </h3>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Kod do drzwi / kłódki (Opcjonalnie)</label>
                    <input value={editingGuide.doorPin} onChange={e => setEditingGuide({...editingGuide, doorPin: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-blue-500 font-mono tracking-widest" placeholder="np. 1234#" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Dodatkowe instrukcje zameldowania</label>
                    <textarea rows="3" value={editingGuide.checkInInfo} onChange={e => setEditingGuide({...editingGuide, checkInInfo: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-blue-500" placeholder="Kluczyk znajduje się w skrytce obok drzwi..." />
                  </div>
                </div>
              </div>
            </div>

            {/* Regulamin */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
               <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-500" /> Ważne Zasady / Regulamin
                </h3>
                <textarea rows="4" value={editingGuide.houseRules} onChange={e => setEditingGuide({...editingGuide, houseRules: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-blue-500 mb-2" placeholder="1. Cisza nocna obowiązuje w godzinach...&#10;2. Zakaz palenia wewnątrz obiektu..." />
                
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3">Lub wgraj plik z regulaminem (PDF, DOC)</label>
                  {editingGuide.houseRulesFile ? (
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <FileText className="w-6 h-6 text-blue-500 shrink-0" />
                        <span className="text-sm font-bold text-blue-700 dark:text-blue-400 truncate">{editingGuide.houseRulesFile.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a href={editingGuide.houseRulesFile.url} target="_blank" rel="noreferrer" className="p-1.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-blue-600 rounded-lg shadow-sm transition-colors" title="Podgląd">
                          <LinkIcon className="w-4 h-4" />
                        </a>
                        <button type="button" onClick={handleRemoveFile} className="p-1.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-red-500 rounded-lg shadow-sm transition-colors" title="Usuń plik">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                      {uploadingFile ? (
                        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Wybierz plik z urządzenia (.pdf, .doc)</span>
                        </>
                      )}
                      <input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFileUpload} className="hidden" disabled={uploadingFile} />
                    </label>
                  )}
                </div>
            </div>

            {/* Atrakcje */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
               <div className="flex justify-between items-center">
                 <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Navigation className="w-5 h-5 text-emerald-500" /> Lokalne Atrakcje i Restauracje
                  </h3>
                  <button type="button" onClick={addAttraction} className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Dodaj
                  </button>
               </div>
               
               {editingGuide.attractions.length === 0 ? (
                 <p className="text-sm text-slate-500 italic">Brak dodanych atrakcji. Kliknij "Dodaj", aby polecić gościom fajne miejsca.</p>
               ) : (
                 <div className="space-y-4">
                   {editingGuide.attractions.map((attr, idx) => (
                     <div key={idx} className="flex gap-4 items-start bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <div className="flex-1 space-y-3">
                          <input value={attr.name} onChange={e => updateAttraction(idx, 'name', e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold outline-none focus:border-blue-500" placeholder="Nazwa miejsca (np. Pizzeria Napoli)" />
                          <input value={attr.description} onChange={e => updateAttraction(idx, 'description', e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-blue-500" placeholder="Krótki opis, dlaczego warto odwiedzić..." />
                          <input value={attr.link} onChange={e => updateAttraction(idx, 'link', e.target.value)} className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:border-blue-500 text-blue-600" placeholder="Link do Google Maps lub strony www" />
                        </div>
                        <button type="button" onClick={() => removeAttraction(idx)} className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                     </div>
                   ))}
                 </div>
               )}
            </div>
            
          </div>

          <div className="space-y-6">
            {/* Panel Boczny Publikacji */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-6 sticky top-6">
              
              <div className="flex flex-col gap-3">
                <button type="submit" disabled={isSaving || !editingGuide.name} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} 
                  Zapisz Przewodnik
                </button>
                <button type="button" onClick={() => setEditingGuide(null)} className="w-full py-3.5 px-4 rounded-xl font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                  Anuluj
                </button>
              </div>

              {guides.some(g => g.id === editingGuide.id) && (
                <div className="border-t border-slate-100 dark:border-slate-700 pt-6 space-y-4">
                  <h4 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wider text-center">Udostępnij Gościom</h4>
                  
                  <div className="flex justify-center p-4 bg-white rounded-2xl shadow-sm border border-slate-200">
                    <QRCodeSVG value={publicUrl} size={150} level="M" />
                  </div>
                  
                  <div className="relative group">
                    <input readOnly value={publicUrl} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-500 pr-10" />
                    <button type="button" onClick={() => { navigator.clipboard.writeText(publicUrl); toast.success('Skopiowano link'); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Kopiuj link">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  <a href={publicUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 transition-colors">
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

  // --- WIDOK LISTY ---
  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Przewodniki dla Gości</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Twórz piękne, mobilne strony powitalne z informacjami o obiekcie, Wi-Fi i atrakcjach.</p>
        </div>
        <button onClick={handleCreateNew} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-blue-500/30 transition-all whitespace-nowrap">
          <Plus className="w-5 h-5" /> Nowy Przewodnik
        </button>
      </div>

      {guides.length === 0 ? (
        <div className="bg-slate-50/50 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-12 text-center">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Brak przewodników</h3>
          <p className="text-slate-500 max-w-md mx-auto">Kliknij "Nowy Przewodnik", aby stworzyć swój pierwszy cyfrowy informator dla gości.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {guides.map(guide => (
            <div key={guide.id} className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              {guide.coverImage ? (
                <div className="h-40 w-full overflow-hidden relative">
                  <img src={guide.coverImage} alt={guide.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  {guide.propertyId && (
                    <span className="absolute bottom-3 left-4 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full">
                      {guide.propertyId}
                    </span>
                  )}
                </div>
              ) : (
                <div className="h-40 w-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center relative">
                  <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                  {guide.propertyId && (
                    <span className="absolute bottom-3 left-4 bg-slate-800/50 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full">
                      {guide.propertyId}
                    </span>
                  )}
                </div>
              )}
              
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 line-clamp-1">{guide.name}</h3>
                
                <div className="flex gap-2 mb-4 text-xs font-bold text-slate-500 flex-wrap">
                  {guide.wifiNetwork && <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md flex items-center gap-1"><Wifi className="w-3 h-3"/> Wi-Fi</span>}
                  {guide.doorPin && <span className="bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-md flex items-center gap-1"><Key className="w-3 h-3"/> Kod PIN</span>}
                  {guide.attractions?.length > 0 && <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-md flex items-center gap-1">{guide.attractions.length} Atrakcji</span>}
                </div>
                
                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(guide)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(guide.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/guide/${guide.id}`); toast.success('Skopiowano link'); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg transition-colors">
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
