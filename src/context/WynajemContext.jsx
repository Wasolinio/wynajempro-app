import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { auth, db, functions } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, updateDoc, collection, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
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

export const WynajemProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  
  // Custom Hook pobierający dane (wymaga useEffect/onAuthStateChanged powyżej? Lepiej wewnątrz)
  const { rentals, settings, profile, tasks, loading, profileLoaded } = useFirebaseData(user, selectedYear);

  // STANY SUBSKRYPCJI
  const accountStatus = profile?.accountStatus;
  const trialEndsAt = profile?.trialEndsAt;
  const scheduledDeletionAt = profile?.scheduledDeletionAt;
  // E4: id najnowszego widzianego patch nota („Co nowego"); null = nie widział żadnego.
  // Źródłem pierwszym jest profil (per konto), ale reguła update na users/{uid} porównuje
  // `status` wprost — na koncie historycznym BEZ tego pola porównanie nieistniejącego
  // klucza to deny i zapis odbija (przegląd 2026-08-31, finding 1). Dla takich kont
  // działa zapasowy zapis w localStorage (per urządzenie, klucz z uid) — popup nie wraca
  // wiecznie. Id zaczyna się datą ISO, więc porządek leksykograficzny = chronologiczny.
  const lastSeenPatchNote = useMemo(() => {
    let zapasowy = null;
    try { zapasowy = user ? localStorage.getItem(`wynajempro:pn:${user.uid}`) : null; } catch { /* np. tryb prywatny */ }
    const kandydaci = [profile?.lastSeenPatchNote, zapasowy].filter(Boolean).map(String);
    return kandydaci.length ? kandydaci.sort().at(-1) : null;
  }, [profile?.lastSeenPatchNote, user]);
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
        photos: [],
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

  // Zwraca `true` przy zapisanej zmianie, `false` przy błędzie — wywołujący mogą
  // odróżnić zapis od cichej porażki (dziś nikt tego nie potrzebuje, ale kontrakt
  // zostaje: to kosztowało błąd przy zdjęciach, zanim funkcję zdjęto).
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
    // nieodhaczone.
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

  const deleteTask = useCallback(async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'tasks', id));
      toast.success('Zadanie usunięte');
    } catch (err) {
      console.error('Błąd usuwania zadania:', err);
      toast.error('Nie udało się usunąć zadania');
    }
  }, [user]);

  // E4: patch noty „Co nowego" — zapamiętanie najnowszego widzianego wpisu w profilu.
  // Fire-and-forget z catch: błąd zapisu nie może położyć panelu. Na koncie kanonicznym
  // reguła update przepuszcza to pole (blokuje tylko status/trialEndsAt/pola Stripe);
  // koncie historycznemu bez `status` reguła odbije KAŻDY update (porównanie
  // nieistniejącego klucza = deny), więc catch dopisuje zapasowy ślad w localStorage —
  // bez niego popup wracałby takim kontom przy każdym wejściu (przegląd 2026-08-31).
  const markPatchNotesSeen = useCallback((id) => {
    if (!user || !id) return;
    updateDoc(doc(db, 'users', user.uid), { lastSeenPatchNote: id })
      .catch((err) => {
        console.warn('Nie udało się zapisać widzianych patch notów w profilu:', err);
        try { localStorage.setItem(`wynajempro:pn:${user.uid}`, id); } catch { /* brak localStorage — trudno */ }
      });
  }, [user]);

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
    profileLoaded,
    accountStatus, trialEndsAt, scheduledDeletionAt,
    lastSeenPatchNote, markPatchNotesSeen,
    isCheckoutLoading, isBillingPortalLoading,
    templates, properties, sources, categories, syncLinks, taxSettings, hostProfile, recurringCosts,
    selectedYear, setSelectedYear,
    handleLogout, toggleStatus, completeTask, toggleDynamicTask,
    addTask, updateTask, assignTask, toggleTaskDone, toggleSubtask, deleteTask, assignLegacyReminder,
    isAccessLocked, handleSubscribe, handleManageSubscription,
    isSyncing, handleSyncCalendars,
    db // Wystawienie DB jeśli modal będzie robił bezpośredni update (lepiej nie, ale na razie tak)
  }), [
    user, loading, rentals, settings, profile, tasks,
    profileLoaded,
    accountStatus, trialEndsAt, scheduledDeletionAt,
    lastSeenPatchNote, markPatchNotesSeen,
    isCheckoutLoading, isBillingPortalLoading,
    templates, properties, sources, categories, syncLinks, taxSettings, hostProfile, recurringCosts,
    selectedYear,
    handleLogout, toggleStatus, completeTask, toggleDynamicTask,
    addTask, updateTask, assignTask, toggleTaskDone, toggleSubtask, deleteTask, assignLegacyReminder,
    isAccessLocked, handleSubscribe, handleManageSubscription,
    handleSyncCalendars, isSyncing
  ]);

  return <WynajemContext.Provider value={value}>{children}</WynajemContext.Provider>;
};
