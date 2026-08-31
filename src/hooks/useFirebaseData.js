import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { collection, doc, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  DEFAULT_PROPERTIES, DEFAULT_SOURCES, DEFAULT_CATEGORIES, 
  DEFAULT_TEMPLATES, defaultTaxSettings, defaultHostProfile, availableColors 
} from '../utils/constants';

export const useFirebaseData = (user, selectedYear) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);

  /*
    React Query jest tu wyłącznie POJEMNIKIEM na dane, których prawdziwym źródłem są
    nasłuchy `onSnapshot` niżej. Zapytania nie chodzą po sieć — ich `queryFn` zwracał
    wartości domyślne, z komentarzem „zawsze nadpisywane przez onSnapshot".

    ⚠️ To założenie było odwrotne do prawdy. Nadpisanie działa w drugą stronę: gdy React
    Query uzna dane za nieświeże i odpali `queryFn` PO tym, jak snapshot zapisał prawdziwe
    wartości, to **wartości domyślne kasują prawdziwe**. Dla `profile` znaczy to zejście do
    `accountStatus: 'trialing'` i `trialEndsAt: null`, przy których `isAccessLocked()`
    zwraca `false` — czyli **ekran blokady przestaje się pokazywać kontu bez dostępu**.
    Zdiagnozowane 2026-08-21 na koncie z odebranym dostępem: zamiast paywalla pokazał się
    ekran uzupełniania profilu, którego z kolei nie dało się zapisać (reguły słusznie
    odmawiają zapisu bez subskrypcji) — ślepy zaułek bez żadnego komunikatu.

    Poprawka: `queryFn` przestaje być destrukcyjny — zwraca to, co już leży w pamięci
    podręcznej, a wartości domyślne tylko wtedy, gdy nie ma jeszcze nic. Do tego
    `staleTime: Infinity`, bo dane pilnuje nasłuch, a nie odświeżanie React Query.
  */
  const zachowaj = (klucz, domyslne) => () => {
    const obecne = queryClient.getQueryData(klucz);
    return obecne === undefined ? domyslne : obecne;
  };

  const { data: rentals = [] } = useQuery({
    queryKey: ['rentals', user?.uid, selectedYear],
    queryFn: zachowaj(['rentals', user?.uid, selectedYear], []),
    staleTime: Infinity,
    enabled: !!user,
  });

  const { data: settings = { 
    properties: DEFAULT_PROPERTIES, 
    sources: DEFAULT_SOURCES, 
    categories: DEFAULT_CATEGORIES, 
    templates: DEFAULT_TEMPLATES, 
    taxSettings: defaultTaxSettings, 
    syncLinks: {} 
  } } = useQuery({
    queryKey: ['settings', user?.uid],
    queryFn: zachowaj(['settings', user?.uid], {
      properties: DEFAULT_PROPERTIES,
      sources: DEFAULT_SOURCES,
      categories: DEFAULT_CATEGORIES,
      templates: DEFAULT_TEMPLATES,
      taxSettings: defaultTaxSettings,
      syncLinks: {},
    }),
    staleTime: Infinity,
    enabled: !!user,
  });

  const { data: profile = { accountStatus: 'trialing', trialEndsAt: null, scheduledDeletionAt: null, lastSeenPatchNote: null } } = useQuery({
    queryKey: ['profile', user?.uid],
    // Najważniejsze z trzech: od tych wartości zależy, czy pokaże się ekran blokady.
    queryFn: zachowaj(['profile', user?.uid], { accountStatus: 'trialing', trialEndsAt: null, scheduledDeletionAt: null, lastSeenPatchNote: null }),
    staleTime: Infinity,
    enabled: !!user,
  });

  // E3 (moduł Zadania): zadania gospodarza. BEZ filtra roku — zadanie bez `date`
  // (skrzynka „do przypisania") nigdy nie przeszłoby przez warunek where('date', ...),
  // dokładnie ten problem zablokował trzymanie zadań w `rentals` (IMPLEMENTACJA.md §1).
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', user?.uid],
    queryFn: zachowaj(['tasks', user?.uid], []),
    staleTime: Infinity,
    enabled: !!user,
  });

  // E4: czy snapshot profilu DOJECHAŁ (a nie tylko: czy skończył się loading rentals).
  // Popup „Co nowego" nie może się otwierać na wartościach domyślnych profilu — na
  // zimnym cache rentals potrafi wygrać wyścig z profilem i popup błyskał userowi,
  // który wszystko widział (przegląd 2026-08-31, finding 2).
  const [profileLoaded, setProfileLoaded] = useState(false);
  useEffect(() => { setProfileLoaded(false); }, [user?.uid]);

  useEffect(() => {
    if (!user) return;

    // Subskrypcja Profilu Użytkownika
    const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      setProfileLoaded(true); // także gałąź self-heal: wiemy już, co jest (a czego nie ma) w profilu
      if (docSnap.exists()) {
        const data = docSnap.data();
        queryClient.setQueryData(['profile', user.uid], {
          // 'status' jest kanoniczne (pisze je webhook Stripe i rejestracja);
          // accountStatus tylko jako alias historyczny — precedencja jak w firestore.rules
          accountStatus: data.status || data.accountStatus || 'trialing',
          trialEndsAt: data.trialEndsAt ? (data.trialEndsAt.toDate ? data.trialEndsAt.toDate() : new Date(data.trialEndsAt)) : null,
          scheduledDeletionAt: data.scheduledDeletionAt ? (data.scheduledDeletionAt.toDate ? data.scheduledDeletionAt.toDate() : new Date(data.scheduledDeletionAt)) : null,
          // E4: id najnowszego widzianego patch nota („Co nowego"); brak pola = nigdy nie widział
          lastSeenPatchNote: data.lastSeenPatchNote || null,
        });
      } else {
        // SELF-HEAL: Brak dokumentu usera (stare konta zepsute błędem).
        // Tworzymy na nowo z 14-dniowym trialem.
        const trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 14);
        import('firebase/firestore').then(({ setDoc, serverTimestamp, Timestamp }) => {
          setDoc(doc(db, 'users', user.uid), {
            email: user.email || '',
            createdAt: serverTimestamp(),
            // MUSI być 'status' — reguła create w firestore.rules wymaga status=='trialing'
            status: 'trialing',
            trialEndsAt: Timestamp.fromDate(trialEndDate)
          }).catch(console.error);
        });
      }
    });

    // Subskrypcja Ustawień (Settings)
    const unsubSettings = onSnapshot(collection(db, 'users', user.uid, 'settings'), (snapshot) => {
      if (!snapshot.empty) {
        let newSettings = { properties: DEFAULT_PROPERTIES, sources: DEFAULT_SOURCES, categories: DEFAULT_CATEGORIES, templates: DEFAULT_TEMPLATES, taxSettings: defaultTaxSettings, syncLinks: {}, hostProfile: defaultHostProfile, recurringCosts: [] };

        snapshot.docs.forEach(docSnap => {
          const id = docSnap.id;
          const data = docSnap.data();
          if (id === 'reminders' && data.items) newSettings.templates = data.items;
          if (id === 'properties' && data.items) {
             newSettings.properties = data.items.map((p, i) => typeof p === 'string' ? { name: p, color: availableColors[i % availableColors.length] } : p);
          }
          if (id === 'sources' && data.items) newSettings.sources = data.items;
          if (id === 'categories' && data.items) newSettings.categories = data.items;
          if (id === 'tax') newSettings.taxSettings = { ...defaultTaxSettings, ...data };
          if (id === 'syncLinks') newSettings.syncLinks = data.links || {};
          if (id === 'hostProfile') newSettings.hostProfile = { ...defaultHostProfile, ...data };
          if (id === 'recurringCosts' && Array.isArray(data.items)) newSettings.recurringCosts = data.items;
        });

        // samonaprawa kont sprzed rozdzielenia kontaktu publicznego (N5 🟡5):
        // hostProfile przestał być publiczny; gościom przewodnika służy publicContact
        const hostDoc = snapshot.docs.find((d) => d.id === 'hostProfile');
        if (hostDoc && hostDoc.data().showPublicContact !== false && !snapshot.docs.some((d) => d.id === 'publicContact')) {
          const hp = hostDoc.data();
          // e-mail = publicEmail (osobne pole), NIE adres logowania (RODO F4)
          setDoc(doc(db, 'users', user.uid, 'settings', 'publicContact'), {
            entityName: hp.entityName || '', phone: hp.phone || '', email: hp.publicEmail || '',
          }).catch(() => { /* bez subskrypcji zapis odpadnie — kontakt po prostu nie wyświetli się gościom */ });
        }

        queryClient.setQueryData(['settings', user.uid], newSettings);
      }
    }, (error) => {
      console.warn('Brak dostępu do ustawień (subskrypcja nieaktywna):', error.code);
    });

    // Subskrypcja Zadań (E3) — cała kolekcja na żywo, jak settings (bez zapytania z warunkami)
    const unsubTasks = onSnapshot(collection(db, 'users', user.uid, 'tasks'), (snapshot) => {
      const data = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      queryClient.setQueryData(['tasks', user.uid], data);
    }, (error) => {
      console.warn('Brak dostępu do zadań (subskrypcja nieaktywna):', error.code);
      queryClient.setQueryData(['tasks', user.uid], []);
    });

    return () => { unsubSettings(); unsubProfile(); unsubTasks(); };
  }, [user, queryClient]);

  useEffect(() => {
    if (!user || !selectedYear) return;
    // Asynchronously set loading to avoid cascading renders warning
    const timeoutId = setTimeout(() => {
      setLoading(true);
    }, 0);

    // Subskrypcja Rezerwacji (Rentals) z lazy loadingiem dla danego roku
    // Pobieramy też końcówkę poprzedniego i początek następnego, aby pokryć rezerwacje na przełomie lat
    const yearStart = `${parseInt(selectedYear) - 1}-11-01`;
    const yearEnd = `${parseInt(selectedYear) + 1}-02-28`;
    
    const q = query(
      collection(db, 'users', user.uid, 'rentals'),
      where('date', '>=', yearStart),
      where('date', '<=', yearEnd)
    );

    const unsubRentals = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(), 
        property: typeof doc.data().property === 'object' ? doc.data().property.name : doc.data().property 
      }));
      queryClient.setQueryData(['rentals', user.uid, selectedYear], data);
      setLoading(false);
    }, (error) => {
      console.warn('Brak dostępu do rezerwacji (subskrypcja nieaktywna):', error.code);
      queryClient.setQueryData(['rentals', user.uid, selectedYear], []);
      setLoading(false);
    });

    return () => { 
      clearTimeout(timeoutId);
      unsubRentals(); 
    };
  }, [user, queryClient, selectedYear]);

  return { rentals, settings, profile, tasks, loading, profileLoaded };
};
