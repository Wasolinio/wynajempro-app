import React, { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react';
import { auth, db, functions } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useFirebaseData } from '../hooks/useFirebaseData';
import { defaultTaxSettings, defaultHostProfile } from '../utils/constants';

const EMPTY_ARRAY = [];
const EMPTY_OBJECT = {};

const WynajemContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useWynajem = () => useContext(WynajemContext);

export const WynajemProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  
  // Custom Hook pobierający dane (wymaga useEffect/onAuthStateChanged powyżej? Lepiej wewnątrz)
  const { rentals, settings, profile, loading } = useFirebaseData(user, selectedYear);

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
      alert('Najpierw dodaj linki iCal w Ustawieniach, aby móc zsynchronizować kalendarze.');
      return;
    }
    setIsSyncing(true);
    try {
      if (auth.currentUser) await auth.currentUser.getIdToken(true);
      const syncICalCalendars = httpsCallable(functions, 'syncICalCalendars');
      const result = await syncICalCalendars({ syncLinks });
      const count = result.data?.newBookingsCount || 0;
      if (count > 0) alert(`Synchronizacja zakończona! Dodano ${count} nowych rezerwacji.`);
      else alert('Synchronizacja zakończona! Brak nowych rezerwacji do pobrania.');
    } catch (err) {
      console.error('Błąd synchronizacji kalendarzy:', err);
      alert('Wystąpił błąd podczas synchronizacji kalendarzy.');
    } finally {
      setIsSyncing(false);
    }
  }, [user, syncLinks]);

  const value = useMemo(() => ({
    user, loading, rentals, settings, profile,
    accountStatus, trialEndsAt, scheduledDeletionAt,
    isCheckoutLoading, isBillingPortalLoading,
    templates, properties, sources, categories, syncLinks, taxSettings, hostProfile, recurringCosts,
    selectedYear, setSelectedYear,
    handleLogout, toggleStatus, completeTask, toggleDynamicTask,
    isAccessLocked, handleSubscribe, handleManageSubscription,
    isSyncing, handleSyncCalendars,
    db // Wystawienie DB jeśli modal będzie robił bezpośredni update (lepiej nie, ale na razie tak)
  }), [
    user, loading, rentals, settings, profile,
    accountStatus, trialEndsAt, scheduledDeletionAt,
    isCheckoutLoading, isBillingPortalLoading,
    templates, properties, sources, categories, syncLinks, taxSettings, hostProfile, recurringCosts,
    selectedYear,
    handleLogout, toggleStatus, completeTask, toggleDynamicTask,
    isAccessLocked, handleSubscribe, handleManageSubscription,
    handleSyncCalendars, isSyncing
  ]);

  return <WynajemContext.Provider value={value}>{children}</WynajemContext.Provider>;
};
