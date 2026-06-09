import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  DEFAULT_PROPERTIES, DEFAULT_SOURCES, DEFAULT_CATEGORIES, 
  DEFAULT_TEMPLATES, defaultTaxSettings, defaultHostProfile, availableColors 
} from '../utils/constants';

export const useFirebaseData = (user, selectedYear) => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);

  // Używamy React Query jako źródła prawdy.
  // Zapewniamy pustą/domyślną strukturę początkową na wypadek oczekiwania.
  const { data: rentals = [] } = useQuery({
    queryKey: ['rentals', user?.uid, selectedYear],
    queryFn: () => [], // Zawsze nadpisywane przez onSnapshot
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
    queryFn: () => ({ 
      properties: DEFAULT_PROPERTIES, 
      sources: DEFAULT_SOURCES, 
      categories: DEFAULT_CATEGORIES, 
      templates: DEFAULT_TEMPLATES, 
      taxSettings: defaultTaxSettings, 
      syncLinks: {} 
    }), 
    enabled: !!user,
  });

  const { data: profile = { accountStatus: 'trialing', trialEndsAt: null, scheduledDeletionAt: null } } = useQuery({
    queryKey: ['profile', user?.uid],
    queryFn: () => ({ accountStatus: 'trialing', trialEndsAt: null, scheduledDeletionAt: null }),
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) return;
    
    // Subskrypcja Profilu Użytkownika
    const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        queryClient.setQueryData(['profile', user.uid], {
          accountStatus: data.status || 'trialing',
          trialEndsAt: data.trialEndsAt ? (data.trialEndsAt.toDate ? data.trialEndsAt.toDate() : new Date(data.trialEndsAt)) : null,
          scheduledDeletionAt: data.scheduledDeletionAt ? (data.scheduledDeletionAt.toDate ? data.scheduledDeletionAt.toDate() : new Date(data.scheduledDeletionAt)) : null,
        });
      }
    });

    // Subskrypcja Ustawień (Settings)
    const unsubSettings = onSnapshot(collection(db, 'users', user.uid, 'settings'), (snapshot) => {
      if (!snapshot.empty) {
        let newSettings = { properties: DEFAULT_PROPERTIES, sources: DEFAULT_SOURCES, categories: DEFAULT_CATEGORIES, templates: DEFAULT_TEMPLATES, taxSettings: defaultTaxSettings, syncLinks: {}, hostProfile: defaultHostProfile };

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
        });
        
        queryClient.setQueryData(['settings', user.uid], newSettings);
      }
    }, (error) => {
      console.warn('Brak dostępu do ustawień (subskrypcja nieaktywna):', error.code);
    });

    return () => { unsubSettings(); unsubProfile(); };
  }, [user, queryClient]);

  useEffect(() => {
    if (!user || !selectedYear) return;
    setLoading(true);

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

    return () => { unsubRentals(); };
  }, [user, queryClient, selectedYear]);

  return { rentals, settings, profile, loading };
};
