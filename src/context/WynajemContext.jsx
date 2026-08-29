import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { auth, db, functions, storage } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, updateDoc, collection, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { useFirebaseData } from '../hooks/useFirebaseData';
import { defaultTaxSettings, defaultHostProfile } from '../utils/constants';
import { nextOccurrence } from '../utils/taskRecurrence';
import { plural } from '../utils/plural';

const EMPTY_ARRAY = [];
const EMPTY_OBJECT = {};

const WynajemContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useWynajem = () => useContext(WynajemContext);

// Rozszerzenie pliku zdjęcia wyprowadzamy z typu MIME, nigdy z nazwy pliku
// użytkownika (patrz komentarz przy addTaskPhoto).
const EXT_OBRAZU = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/heic': 'heic', 'image/heif': 'heif', 'image/gif': 'gif' };

export const WynajemProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  
  // Custom Hook pobierający dane (wymaga useEffect/onAuthStateChanged powyżej? Lepiej wewnątrz)
  const { rentals, settings, profile, tasks, loading } = useFirebaseData(user, selectedYear);

  // STANY SUBSKRYPCJI
  const accountStatus = profile?.accountStatus;
  const trialEndsAt = profile?.trialEndsAt;
  const scheduledDeletionAt = profile?.scheduledDeletionAt;
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isBillingPortalLoading, setIsBillingPortalLoading] = useState(false);

  // USTAWIENIA
  const templates = settings?.templates || EMPTY_ARRAY;
  const properties = settings?.properties || EMPTY_ARRAY;
  const sources = settings?.sources || EMPTY_ARRAY;
  const categories = settings?.categories || EMPTY_ARRAY;
  const syncLinks = settings?.syncLinks || EMPTY_OBJECT;
  const taxSettings = settings?.taxSettings || defaultTaxSettings;
  const hostProfile = settings?.hostProfile || defaultHostProfile;
  const recurringCosts = settings?.recurringCosts || EMPTY_ARRAY;

  // CZYNNOSCI FIREBASE AUTH
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        if (!currentUser.emailVerified && currentUser.providerData[0]?.providerId === 'password') {
          signOut(auth);
          return;
        }
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Błąd podczas wylogowywania:", error);
    }
  }, []);

  // AKCJE DLA RENTALS (MEMOIZOWANE)
  const toggleStatus = useCallback(async (id, field) => {
    const r = rentals.find(r => r.id === id);
    if (r && user) await updateDoc(doc(db, 'users', user.uid, 'rentals', id), { [field]: !r[field] });
  }, [rentals, user]);

  const completeTask = useCallback(async (id, taskId, current) => {
    if (!user) return;
    const updates = taskId === 'manual' ? { isCompleted: true } : { [`completedTasks.${taskId}`]: current !== undefined ? !current : true };
    if (taskId === 'directions') updates.directionsSent = true;
    if (taskId === 'keycode') updates.keycodeSent = true;
    await updateDoc(doc(db, 'users', user.uid, 'rentals', id), updates);
  }, [user]);

  const toggleDynamicTask = useCallback(async (id, taskId, currentValue) => {
    if (!user) return;
    const updates = { [`completedTasks.${taskId}`]: !currentValue };
    if (taskId === 'directions') updates.directionsSent = !currentValue;
    if (taskId === 'keycode') updates.keycodeSent = !currentValue;
    await updateDoc(doc(db, 'users', user.uid, 'rentals', id), updates);
  }, [user]);

  // AKCJE DLA ZADAŃ — kolekcja users/{uid}/tasks (E3, moduł Zadania; wzór jak wyżej).
  // Id nadaje addDoc — NIE Date.now().toString(): dwa zadania w tej samej milisekundzie
  // nadpisałyby się (pułapka z IMPLEMENTACJA.md §6). Wszystkie „braki" zapisujemy jako
  // null/'' jawnie, bo model traktuje null jako stan (date:null = skrzynka do przypisania).
  const addTask = useCallback(async (draft) => {
    if (!user) return null;
    try {
      const docRef = await addDoc(collection(db, 'users', user.uid, 'tasks'), {
        text: (draft.text || '').trim(),
        propertyName: draft.propertyName ?? null,
        rentalId: draft.rentalId ?? null,
        templateId: draft.templateId ?? null,
        date: draft.date ?? null,
        time: draft.time || '',
        priority: draft.priority || 'normalny',
        note: draft.note || '',
        subtasks: draft.subtasks || [],
        recurrence: draft.recurrence ?? null,
        photos: draft.photos || [],
        done: false,
        doneAt: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast.success('Zadanie dodane');
      return docRef.id;
    } catch (err) {
      console.error('Błąd dodawania zadania:', err);
      toast.error('Nie udało się dodać zadania');
      return null;
    }
  }, [user]);

  // Zwraca `true` przy zapisanej zmianie, `false` przy błędzie — wywołujący, którzy
  // po zapisie ruszają PLIKI (addTaskPhoto/removeTaskPhoto), muszą odróżnić jedno od
  // drugiego. Bez tego kasowały plik mimo odrzuconego zapisu dokumentu i zostawiały
  // w zadaniu martwy kafelek nie do usunięcia (przegląd 2026-08-29). Pozostali
  // wywołujący wartość ignorują — zachowanie bez zmian.
  const updateTask = useCallback(async (id, updates) => {
    if (!user) return false;
    try {
      await updateDoc(doc(db, 'users', user.uid, 'tasks', id), { ...updates, updatedAt: serverTimestamp() });
      return true;
    } catch (err) {
      console.error('Błąd aktualizacji zadania:', err);
      toast.error('Nie udało się zapisać zmiany zadania');
      return false;
    }
  }, [user]);

  // Przypisanie z osi: pasek rezerwacji daje date+rentalId+propertyName,
  // wolny dzień daje date+propertyName (rentalId=null). Null jest tu wartością, nie brakiem.
  const assignTask = useCallback(async (id, { date, rentalId, propertyName }) => {
    await updateTask(id, { date: date ?? null, rentalId: rentalId ?? null, propertyName: propertyName ?? null });
  }, [updateTask]);

  const toggleTaskDone = useCallback(async (task) => {
    // zadanie zostaje na liście po odhaczeniu (decyzja właściciela w handoffie) —
    // stąd toggle, nie kasowanie; doneAt czyścimy przy cofnięciu
    const markingDone = !task.done;
    await updateTask(task.id, { done: markingDone, doneAt: markingDone ? serverTimestamp() : null });
    // Powtarzalność (partia 2): odhaczenie zadania z `recurrence` tworzy następne
    // wystąpienie (taskRecurrence liczy termin; afterCheckout dostaje też rezerwację).
    // Cofnięcie odhaczenia niczego nie tworzy ani nie kasuje. Podzadania wracają
    // nieodhaczone, zdjęcia NIE jadą dalej (dokumentują konkretne wykonanie).
    if (markingDone && task.recurrence?.kind && user) {
      const next = nextOccurrence(task, { rentals });
      if (next) {
        try {
          await addDoc(collection(db, 'users', user.uid, 'tasks'), {
            text: task.text,
            propertyName: task.propertyName ?? null,
            rentalId: next.rentalId ?? null,
            templateId: null,
            date: next.date,
            time: task.time || '',
            priority: task.priority || 'normalny',
            note: task.note || '',
            subtasks: (task.subtasks || []).map((s) => ({ ...s, done: false })),
            recurrence: task.recurrence,
            photos: [],
            done: false,
            doneAt: null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          toast.success('Powtarzalne — utworzono następne wystąpienie');
        } catch (err) {
          console.error('Błąd tworzenia następnego wystąpienia:', err);
          toast.error('Nie udało się utworzyć następnego wystąpienia');
        }
      }
    }
  }, [updateTask, user, rentals]);

  const toggleSubtask = useCallback(async (task, index) => {
    const subtasks = (task.subtasks || []).map((s, i) => (i === index ? { ...s, done: !s.done } : s));
    await updateTask(task.id, { subtasks });
  }, [updateTask]);

  // ZDJĘCIA ZADAŃ (partia 2, krok 7): Storage users/{uid}/tasks/{taskId}/{uuid}.{ext}.
  // Limit 10 zdjęć pilnowany tu i w regułach Firestore (photos <= 10); rozmiar i typ
  // pilnują storage.rules, a rozmiar dodatkowo my — po to, żeby użytkownik dostał
  // konkretny powód zamiast ogólnej porażki po minucie wysyłania (idiom GuideBuilder).
  //
  // ⚠️ Rozszerzenie bierzemy z `file.type`, NIGDY z `file.name`: nazwa bez kropki
  // (typowa po zrzucie z komunikatora, np. „Anna Kowalska") trafiała w całości
  // do nazwy obiektu, a stamtąd do publicznego adresu pobrania — czyli dokładnie
  // tam, gdzie komentarz obiecywał, że danych osobowych nie ma (przegląd 2026-08-29).
  const addTaskPhoto = useCallback(async (taskId, file, existingPhotos = []) => {
    if (!user || !file) return false;
    if ((existingPhotos || []).length >= 10) {
      toast.error('Zadanie może mieć najwyżej 10 zdjęć');
      return false;
    }
    if (!String(file.type || '').startsWith('image/')) {
      toast.error('Dodać można tylko zdjęcie');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Zdjęcie może mieć najwyżej 10 MB');
      return false;
    }
    let path = null;
    try {
      const ext = EXT_OBRAZU[file.type] || 'jpg';
      const id = window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).slice(2);
      path = `users/${user.uid}/tasks/${taskId}/${id}.${ext}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      // Zapis dokumentu jest tym, co czyni plik widocznym. Gdy się nie uda, plik
      // sprzątamy od razu — inaczej zostaje w Storage z żywym adresem pobrania,
      // niewidoczny w żadnym UI, więc nie do usunięcia przez gospodarza.
      const zapisano = await updateTask(taskId, { photos: [...(existingPhotos || []), { path, url }] });
      if (!zapisano) {
        await deleteObject(ref(storage, path)).catch(() => {});
        return false;
      }
      return true;
    } catch (err) {
      console.error('Błąd dodawania zdjęcia:', err);
      toast.error('Nie udało się dodać zdjęcia');
      if (path) await deleteObject(ref(storage, path)).catch(() => {});
      return false;
    }
  }, [user, updateTask]);

  const removeTaskPhoto = useCallback(async (task, index) => {
    if (!user) return;
    const photo = (task.photos || [])[index];
    if (!photo) return;
    try {
      // Najpierw dokument (źródło prawdy dla UI), plik TYLKO po potwierdzonym zapisie:
      // przy odrzuconym zapisie skasowany plik zostawiałby w zadaniu kafelek
      // z martwym adresem, którego nie da się już usunąć.
      const zapisano = await updateTask(task.id, { photos: task.photos.filter((_, i) => i !== index) });
      if (!zapisano) return;
      if (photo.path) await deleteObject(ref(storage, photo.path)).catch((err) => console.warn('Plik zdjęcia nie dał się usunąć:', err?.code));
    } catch (err) {
      console.error('Błąd usuwania zdjęcia:', err);
      toast.error('Nie udało się usunąć zdjęcia');
    }
  }, [user, updateTask]);

  // LEGACY (okres zgodnościowy do migracji w partii 2): jednorazowe zadanie z `rentals`
  // (type:'reminder') przypisujemy aktualizując jego własny dokument — `date` i `property`
  // są w allowliście isValidRental. Linku do rezerwacji ten model nie ma, więc upuszczenie
  // na pasek zapisuje wyłącznie termin i obiekt.
  const assignLegacyReminder = useCallback(async (id, { date, propertyName }) => {
    if (!user || !date) return;
    try {
      const updates = { date };
      if (propertyName) updates.property = propertyName;
      await updateDoc(doc(db, 'users', user.uid, 'rentals', id), updates);
    } catch (err) {
      console.error('Błąd przypisania zadania (legacy):', err);
      toast.error('Nie udało się przypisać zadania');
    }
  }, [user]);

  // Kasujemy ZDJĘCIA PRZED dokumentem — dokument jest jedynym tropicielem plików,
  // więc usunięty pierwszy zostawiłby je w Storage z żywymi adresami pobrania i bez
  // żadnego UI do ich usunięcia (dialog zdjęć otwiera się tylko z kartki zadania).
  // Dokładnie ta klasa błędu wyszła w audycie N5 przy przewodnikach (finding F3),
  // stąd ta sama kolejność co w deleteGuideCompletely: pliki → dokument, a błąd
  // Storage NIE jest połykany, żeby kolejna próba mogła dokończyć.
  const deleteTask = useCallback(async (id) => {
    if (!user) return;
    try {
      const zadanie = (tasks || []).find((t) => t.id === id);
      for (const photo of (zadanie?.photos || [])) {
        if (photo?.path) await deleteObject(ref(storage, photo.path));
      }
      await deleteDoc(doc(db, 'users', user.uid, 'tasks', id));
      toast.success('Zadanie usunięte');
    } catch (err) {
      console.error('Błąd usuwania zadania:', err);
      toast.error('Nie udało się usunąć zadania');
    }
  }, [user, tasks]);

  // STRIPE / PAYWALL
  const isAccessLocked = useCallback(() => {
    if (accountStatus === 'active') return false;
    if (accountStatus === 'past_due') return true;
    if (accountStatus === 'canceled') return true;
    
    if (trialEndsAt) {
      // Bezpieczna konwersja (Firestore rules obsługują string i timestamp)
      const endsAtDate = typeof trialEndsAt.toDate === 'function' ? trialEndsAt.toDate() : new Date(trialEndsAt);
      const now = new Date();
      if (now > endsAtDate) return true;
    }
    return false;
  }, [accountStatus, trialEndsAt]);

  const handleSubscribe = useCallback(async () => {
    setIsCheckoutLoading(true);
    try {
        if (auth.currentUser) await auth.currentUser.getIdToken(true);
        const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
        const result = await createCheckoutSession({
            successUrl: window.location.origin + '/dashboard',
            cancelUrl: window.location.origin + '/dashboard',
        });
        if (result.data?.url) window.location.assign(result.data.url);
        else throw new Error('Nie otrzymano URL sesji płatności');
    } catch (err) {
        console.error("Błąd tworzenia sesji checkoutu:", err);
        let message = 'Wystąpił problem z wczytaniem płatności. Spróbuj ponownie.';
        if (err.code === 'functions/unauthenticated') message = 'Sesja wygasła. Wyloguj się i zaloguj ponownie.';
        else if (err.code === 'functions/permission-denied') message = 'Brak uprawnień. Upewnij się, że Twój adres email jest zweryfikowany.';
        alert(message);
        setIsCheckoutLoading(false);
    }
  }, []);

  const handleManageSubscription = useCallback(async () => {
    setIsBillingPortalLoading(true);
    try {
      if (auth.currentUser) await auth.currentUser.getIdToken(true);
      const createBillingPortalSession = httpsCallable(functions, 'createBillingPortalSession');
      const result = await createBillingPortalSession({ returnUrl: window.location.origin + '/dashboard' });
      if (result.data?.url) window.location.assign(result.data.url);
      else throw new Error('Nie otrzymano URL panelu zarządzania');
    } catch (err) {
      console.error('Błąd otwierania panelu subskrypcji:', err);
      let message = 'Nie udało się otworzyć panelu zarządzania subskrypcją.';
      if (err.code === 'functions/failed-precondition') message = 'Nie masz jeszcze aktywnej subskrypcji do zarządzania.';
      alert(message);
    } finally {
      setIsBillingPortalLoading(false);
    }
  }, []);

  // SYNCHRONIZACJA ICAL
  const [isSyncing, setIsSyncing] = useState(false);
  const handleSyncCalendars = useCallback(async () => {
    if (!user) return;
    if (Object.keys(syncLinks).length === 0) {
      toast.error('Najpierw dodaj linki iCal w Ustawieniach, aby móc zsynchronizować kalendarze.');
      return;
    }
    setIsSyncing(true);
    try {
      if (auth.currentUser) await auth.currentUser.getIdToken(true);
      const syncICalCalendars = httpsCallable(functions, 'syncICalCalendars');
      const result = await syncICalCalendars({ syncLinks });
      const d = result.data || {};

      // X26: silnik nie tylko dodaje. Komunikat mówi o wszystkich czterech wynikach
      // uzgodnienia, bo „zaktualizowano 1" i „zniknęła 1" to dla gospodarza
      // ważniejsze informacje niż „dodano 0" — a dawny alert pokazywał tylko to ostatnie.
      const czesci = [];
      if (d.dodane) czesci.push(`nowe: ${d.dodane}`);
      if (d.zmienione) czesci.push(`zaktualizowane: ${d.zmienione}`);
      if (d.wrocone) czesci.push(`przywrócone: ${d.wrocone}`);
      if (d.znikle) czesci.push(`zniknęły z portalu: ${d.znikle}`);

      if (czesci.length === 0) {
        toast.success('Kalendarze aktualne — bez zmian.');
      } else {
        toast.success(`Synchronizacja zakończona (${czesci.join(', ')}).`);
      }
      if (d.bledy) {
        const kanal = plural(d.bledy, ['kanału', 'kanałów', 'kanałów']);
        toast.error(`Nie udało się pobrać ${d.bledy} ${kanal} — sprawdź linki w Ustawieniach.`);
      }
    } catch (err) {
      console.error('Błąd synchronizacji kalendarzy:', err);
      toast.error('Wystąpił błąd podczas synchronizacji kalendarzy.');
    } finally {
      setIsSyncing(false);
    }
  }, [user, syncLinks]);

  const value = useMemo(() => ({
    user, loading, rentals, settings, profile, tasks,
    accountStatus, trialEndsAt, scheduledDeletionAt,
    isCheckoutLoading, isBillingPortalLoading,
    templates, properties, sources, categories, syncLinks, taxSettings, hostProfile, recurringCosts,
    selectedYear, setSelectedYear,
    handleLogout, toggleStatus, completeTask, toggleDynamicTask,
    addTask, updateTask, assignTask, toggleTaskDone, toggleSubtask, deleteTask, assignLegacyReminder,
    addTaskPhoto, removeTaskPhoto,
    isAccessLocked, handleSubscribe, handleManageSubscription,
    isSyncing, handleSyncCalendars,
    db // Wystawienie DB jeśli modal będzie robił bezpośredni update (lepiej nie, ale na razie tak)
  }), [
    user, loading, rentals, settings, profile, tasks,
    accountStatus, trialEndsAt, scheduledDeletionAt,
    isCheckoutLoading, isBillingPortalLoading,
    templates, properties, sources, categories, syncLinks, taxSettings, hostProfile, recurringCosts,
    selectedYear,
    handleLogout, toggleStatus, completeTask, toggleDynamicTask,
    addTask, updateTask, assignTask, toggleTaskDone, toggleSubtask, deleteTask, assignLegacyReminder,
    addTaskPhoto, removeTaskPhoto,
    isAccessLocked, handleSubscribe, handleManageSubscription,
    handleSyncCalendars, isSyncing
  ]);

  return <WynajemContext.Provider value={value}>{children}</WynajemContext.Provider>;
};
