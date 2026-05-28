import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Download, Trash2, Home, DollarSign, Wallet, TrendingUp, CheckCircle, 
  XCircle, Landmark, Bell, Mail, Key, Loader2, BarChart3, CalendarDays, List, 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Edit, ArrowDown, ArrowUp, 
  Settings, MessageSquare, CheckSquare, Phone, Building, Globe, Percent, Tags, 
  Search, ClipboardList, LogIn, LogOut, Sun, RefreshCw, Moon, Lock // Dodano Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// IMPORTUJEMY FIREBASE ORAZ STRIPE
import { auth, db, functions } from './firebase'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

// --- WSPÓLNE HELPERY I DANE ---
const propColors = {
  blue: { bg: 'bg-blue-500', solid: 'bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/20', advance: 'bg-blue-50 dark:bg-blue-500/20 border-blue-500 text-blue-800 dark:text-blue-300 border-[2px] border-solid font-bold', dashed: 'bg-blue-50 dark:bg-transparent border-blue-400 dark:border-blue-500/50 text-blue-700 dark:text-blue-400 border-2 border-dashed' },
  emerald: { bg: 'bg-emerald-500', solid: 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20', advance: 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-300 border-[2px] border-solid font-bold', dashed: 'bg-emerald-50 dark:bg-transparent border-emerald-400 dark:border-emerald-500/50 text-emerald-700 dark:text-emerald-400 border-2 border-dashed' },
  violet: { bg: 'bg-violet-500', solid: 'bg-violet-500 border-violet-500 text-white shadow-md shadow-violet-500/20', advance: 'bg-violet-50 dark:bg-violet-500/20 border-violet-500 text-violet-800 dark:text-violet-300 border-[2px] border-solid font-bold', dashed: 'bg-violet-50 dark:bg-transparent border-violet-400 dark:border-violet-500/50 text-violet-700 dark:text-violet-400 border-2 border-dashed' },
  amber: { bg: 'bg-amber-500', solid: 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/20', advance: 'bg-amber-50 dark:bg-amber-500/20 border-amber-500 text-amber-900 dark:text-amber-300 border-[2px] border-solid font-bold', dashed: 'bg-amber-50 dark:bg-transparent border-amber-400 dark:border-amber-500/50 text-amber-700 dark:text-amber-400 border-2 border-dashed' },
  rose: { bg: 'bg-rose-500', solid: 'bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/20', advance: 'bg-rose-50 dark:bg-rose-500/20 border-rose-500 text-rose-800 dark:text-rose-300 border-[2px] border-solid font-bold', dashed: 'bg-rose-50 dark:bg-transparent border-rose-400 dark:border-rose-500/50 text-rose-700 dark:text-rose-400 border-2 border-dashed' },
  cyan: { bg: 'bg-cyan-500', solid: 'bg-cyan-500 border-cyan-500 text-white shadow-md shadow-cyan-500/20', advance: 'bg-cyan-50 dark:bg-cyan-500/20 border-cyan-500 text-cyan-800 dark:text-cyan-300 border-[2px] border-solid font-bold', dashed: 'bg-cyan-50 dark:bg-transparent border-cyan-400 dark:border-cyan-500/50 text-cyan-700 dark:text-cyan-400 border-2 border-dashed' },
  pink: { bg: 'bg-pink-500', solid: 'bg-pink-500 border-pink-500 text-white shadow-md shadow-pink-500/20', advance: 'bg-pink-50 dark:bg-pink-500/20 border-pink-500 text-pink-800 dark:text-pink-300 border-[2px] border-solid font-bold', dashed: 'bg-pink-50 dark:bg-transparent border-pink-400 dark:border-pink-500/50 text-pink-700 dark:text-pink-400 border-2 border-dashed' },
  slate: { bg: 'bg-slate-500', solid: 'bg-slate-600 border-slate-600 text-white shadow-md shadow-slate-500/20', advance: 'bg-slate-50 dark:bg-slate-500/20 border-slate-500 text-slate-800 dark:text-slate-300 border-[2px] border-solid font-bold', dashed: 'bg-slate-50 dark:bg-transparent border-slate-400 dark:border-slate-500/50 text-slate-700 dark:text-slate-400 border-2 border-dashed' },
};
const availableColors = Object.keys(propColors);

const getIconComponent = (name, className) => {
  switch(name) {
    case 'Mail': return <Mail className={className} />;
    case 'Key': return <Key className={className} />;
    case 'MessageSquare': return <MessageSquare className={className} />;
    case 'Phone': return <Phone className={className} />;
    case 'CheckSquare': return <CheckSquare className={className} />;
    case 'Settings': return <Settings className={className} />;
    default: return <Bell className={className} />;
  }
};

// --- DOMYŚLNE WARTOŚCI STARTOWE (DLA NOWYCH UŻYTKOWNIKÓW) ---
const DEFAULT_PROPERTIES = [
  { name: 'Domek nad Jeziorem', color: 'blue' },
  { name: 'Apartament Centrum', color: 'emerald' },
  { name: 'Domek w Górach', color: 'amber' }
];
const DEFAULT_SOURCES = ['Booking.com', 'Airbnb', 'Facebook', 'Strona www', 'Z polecenia', 'Inne'];
const DEFAULT_CATEGORIES = ['Prąd', 'Woda', 'Sprzątanie', 'Środki czystości', 'Naprawy', 'Gaz', 'Internet', 'Inne'];
const DEFAULT_TEMPLATES = [
  { id: 'directions', text: 'Wyślij wskazówki dojazdu', shortName: 'Dojazd', daysBefore: 3, icon: 'Mail' },
  { id: 'keycode', text: 'Wyślij kod do drzwi', shortName: 'Kod', daysBefore: 1, icon: 'Key' },
  { id: 'cleaning', text: 'Zleć sprzątanie', shortName: 'Sprzątanie', daysBefore: 0, icon: 'CheckSquare' }
];
const defaultTaxSettings = { 
  taxForm: 'lump_sum', 
  autoThreshold: true, 
  rate: 8.5, 
  isVatPayer: false,
  zusHealth: 0,
  zusSocial: 0,
  taxFreeAmount: 30000,
  includeZusInCosts: true
};

// --- GŁÓWNA APLIKACJA ---
export default function RentalManager() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rentals, setRentals] = useState([]);
  
  // NOWE: STANY SUBSKRYPCJI
  const [accountStatus, setAccountStatus] = useState('active'); // active, trialing
  const [trialEndsAt, setTrialEndsAt] = useState(null);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  // Stany UI
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDailyReportModal, setShowDailyReportModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState('sync'); 
  const [itemToDelete, setItemToDelete] = useState(null); 
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [searchQuery, setSearchQuery] = useState(''); 
  const [isSyncing, setIsSyncing] = useState(false); 

  // DARK MODE STATE
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Stany Edycji i Ustawień z domyślnymi wartościami
  const [editingId, setEditingId] = useState(null);
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);
  const [editingTemplates, setEditingTemplates] = useState([]);
  
  const [properties, setProperties] = useState(DEFAULT_PROPERTIES);
  const [editingProperties, setEditingProperties] = useState([]);
  const [newPropertyName, setNewPropertyName] = useState('');
  const [newPropertyColor, setNewPropertyColor] = useState('blue');
  
  const [sources, setSources] = useState(DEFAULT_SOURCES);
  const [editingSources, setEditingSources] = useState([]);
  const [newSourceName, setNewSourceName] = useState('');
  
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [editingCategories, setEditingCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [syncLinks, setSyncLinks] = useState({});
  const [editingSyncLinks, setEditingSyncLinks] = useState({});

  const [taxSettings, setTaxSettings] = useState(defaultTaxSettings);
  const [editingTaxSettings, setEditingTaxSettings] = useState(defaultTaxSettings);

  // --- NOWY SYSTEM NAWIGACJI ---
  const [mainTab, setMainTab] = useState('bookings'); 
  const [bookingFilter, setBookingFilter] = useState('upcoming'); 
  
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [bookingSortOrder, setBookingSortOrder] = useState('upcoming'); 
  const [utilitySortOrder, setUtilitySortOrder] = useState('desc'); 
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  const changeTab = (tab) => { setMainTab(tab); setCurrentPage(1); };
  const changeBookingFilter = (filter) => { setBookingFilter(filter); setCurrentPage(1); };
  const changeBookingSortOrder = (updater) => { setBookingSortOrder(updater); setCurrentPage(1); };
  const changeUtilitySortOrder = (updater) => { setUtilitySortOrder(updater); setCurrentPage(1); };
  const changeSearchQuery = (val) => { setSearchQuery(val); setCurrentPage(1); };

  const getDefaultRentalState = () => ({
    type: 'booking', source: sources.length > 0 ? sources[0] : '', property: properties.length > 0 ? properties[0].name : '', 
    category: categories.length > 0 ? categories[0] : '', guest: '', email: '', phone: '', guestNote: '', text: '',
    date: new Date().toISOString().split('T')[0], endDate: '', income: '', advancePayment: '', isAdvancePaid: false, commission: '',
    utilities: '', tax: '', vat: '', isPaid: false, isCompleted: false, completedTasks: {}, syncId: ''
  });

  const [newRental, setNewRental] = useState(getDefaultRentalState());

  const getDayName = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      const day = date.toLocaleDateString('pl-PL', { weekday: 'long' });
      return day.charAt(0).toUpperCase() + day.slice(1);
    } catch { return ''; }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Dodatkowa bariera: jeśli mail nie jest zweryfikowany (konto email/hasło), wyloguj
        if (!currentUser.emailVerified && currentUser.providerData[0]?.providerId === 'password') {
          signOut(auth);
          navigate('/login');
          return;
        }
        setUser(currentUser);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    
    // NASŁUCHIWANIE STATUSU SUBSKRYPCJI
    const userProfileRef = doc(db, 'users', user.uid);
    const unsubProfile = onSnapshot(userProfileRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAccountStatus(data.status || 'trialing'); // status podawany przez Stripe lub tworzony przy rejestracji
        if (data.trialEndsAt) {
          // Obsługa obu formatów: Firestore Timestamp (nowe konta) i ISO string (stare konta)
          const endDate = data.trialEndsAt.toDate ? data.trialEndsAt.toDate() : new Date(data.trialEndsAt);
          setTrialEndsAt(endDate);
        }
      }
    });

    // Subskrypcje Firebase - Tabele
    const rentalsRef = collection(db, 'users', user.uid, 'rentals');
    const unsubRentals = onSnapshot(rentalsRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), property: typeof doc.data().property === 'object' ? doc.data().property.name : doc.data().property }));
      setRentals(data); setLoading(false);
    }, (error) => {
      // Gdy subskrypcja wygasła, reguły Firestore odrzucą odczyt — obsługujemy to łagodnie
      console.warn('Brak dostępu do rezerwacji (subskrypcja nieaktywna):', error.code);
      setRentals([]);
      setLoading(false);
    });

    const settingsRef = collection(db, 'users', user.uid, 'settings');
    const unsubSettings = onSnapshot(settingsRef, (snapshot) => {
      if (!snapshot.empty) {
        let hasProps = false, hasSources = false, hasCats = false, hasReminders = false, hasTax = false;
        snapshot.docs.forEach(docSnap => {
          const id = docSnap.id;
          const data = docSnap.data();
          if (id === 'reminders' && data.items) { setTemplates(data.items); hasReminders = true; }
          if (id === 'properties' && data.items) {
             const formatted = data.items.map((p, i) => typeof p === 'string' ? { name: p, color: availableColors[i % availableColors.length] } : p);
             setProperties(formatted);
             hasProps = true;
          }
          if (id === 'sources' && data.items) { setSources(data.items); hasSources = true; }
          if (id === 'categories' && data.items) { setCategories(data.items); hasCats = true; }
          if (id === 'tax') { setTaxSettings({ ...defaultTaxSettings, ...data }); hasTax = true; }
          if (id === 'syncLinks') setSyncLinks(data.links || {});
        });
        
        if (!hasProps) setProperties(DEFAULT_PROPERTIES);
        if (!hasSources) setSources(DEFAULT_SOURCES);
        if (!hasCats) setCategories(DEFAULT_CATEGORIES);
        if (!hasReminders) setTemplates(DEFAULT_TEMPLATES);
        if (!hasTax) setTaxSettings(defaultTaxSettings);
      }
    }, (error) => {
      // Gdy subskrypcja wygasła, reguły Firestore odrzucą odczyt ustawień — ignorujemy łagodnie
      console.warn('Brak dostępu do ustawień (subskrypcja nieaktywna):', error.code);
    });

    return () => { unsubRentals(); unsubSettings(); unsubProfile(); };
  }, [user]);



  // --- ZABEZPIECZENIE DOSTĘPU (PAYWALL STRIPE) ---
  const isAccessLocked = () => {
    if (accountStatus === 'active') return false; // Konto aktywne (opłacone), wpuszczamy
    if (accountStatus === 'past_due') return true; // Zaległa płatność, blokujemy
    if (accountStatus === 'canceled') return true; // Subskrypcja anulowana, blokujemy
    
    // Konto w okresie próbnym, sprawdzamy datę
    if (trialEndsAt) {
        const now = new Date();
        if (now > trialEndsAt) return true; // Czas minął, blokujemy
    }
    return false; // Trial nadal trwa, wpuszczamy
  };

  const handleSubscribe = async () => {
    setIsCheckoutLoading(true);
    try {
        // Odświeżamy token użytkownika, aby App Check i auth claims były aktualne
        if (auth.currentUser) {
          await auth.currentUser.getIdToken(true);
        }

        // Wywołujemy Cloud Function, która bezpiecznie tworzy sesję Stripe Checkout
        const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
        const result = await createCheckoutSession({
            successUrl: window.location.origin + '/dashboard',
            cancelUrl: window.location.origin + '/dashboard',
        });

        // Przekierowujemy do bramki płatności Stripe
        if (result.data?.url) {
            window.location.assign(result.data.url);
        } else {
            throw new Error('Nie otrzymano URL sesji płatności');
        }
    } catch (err) {
        console.error("Błąd tworzenia sesji checkoutu:", err);
        
        let message = 'Wystąpił problem z wczytaniem płatności. Spróbuj ponownie.';
        if (err.code === 'functions/unauthenticated') {
          message = 'Sesja wygasła. Wyloguj się i zaloguj ponownie.';
        } else if (err.code === 'functions/permission-denied') {
          message = 'Brak uprawnień. Upewnij się, że Twój adres email jest zweryfikowany.';
        } else if (err.message?.includes('app-check')) {
          message = 'Weryfikacja bezpieczeństwa nie powiodła się. Wyłącz blokady reklam i spróbuj ponownie.';
        }
        
        alert(message);
        setIsCheckoutLoading(false);
    }
  };


  // --- OBLICZANIE DANYCH ---
  const availableYears = useMemo(() => {
    const years = new Set(rentals.map(r => {
      if (!r.date) return null;
      const d = new Date(r.date);
      return isNaN(d.getTime()) ? null : d.getFullYear().toString();
    }).filter(Boolean));
    years.add(new Date().getFullYear().toString());
    return Array.from(years).sort((a,b) => b - a);
  }, [rentals]);

  const handleYearChange = (newYearStr) => {
    setSelectedYear(newYearStr);
    setCurrentPage(1);
    const newYear = parseInt(newYearStr, 10);
    const currYear = new Date().getFullYear();
    if (newYear === currYear) {
      setCalendarDate(new Date());
    } else {
      setCalendarDate(new Date(newYear, 0, 1)); 
    }
  };

  const dailyReport = useMemo(() => {
    const today = new Date();
    const localTodayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const arrivals = []; const departures = []; const tasks = [];

    rentals.forEach(r => {
      if (r.type === 'booking') {
        const propNameStr = typeof r.property === 'object' ? r.property.name : r.property;

        if (r.date === localTodayStr) arrivals.push({...r, propNameStr});
        if (r.endDate === localTodayStr) departures.push({...r, propNameStr});

        if (r.date) {
          const arr = new Date(r.date); 
          if (!isNaN(arr.getTime())) {
            arr.setHours(0,0,0,0);
            const todayMidnight = new Date(); todayMidnight.setHours(0,0,0,0);
            const diffDays = Math.ceil((arr - todayMidnight) / 86400000);
            templates.forEach(t => {
              const isCompleted = r.completedTasks?.[t.id] || (t.id === 'directions' && r.directionsSent) || (t.id === 'keycode' && r.keycodeSent);
              if (diffDays <= (t.daysBefore || 0) && diffDays >= -30 && !isCompleted) {
                tasks.push({ id: r.id, taskId: t.id, guest: r.guest, property: propNameStr, days: diffDays, icon: getIconComponent(t.icon || 'Bell', `w-5 h-5 text-blue-500`), text: t.text || t.shortName });
              }
            });
          }
        }
      } else if (r.type === 'reminder' && r.date === localTodayStr && !r.isCompleted) {
        tasks.push({ id: r.id, taskId: 'manual', property: 'Własne zadanie', days: 0, icon: <Bell className="w-5 h-5 text-purple-500" />, text: r.text || 'Brak opisu' });
      }
    });
    return { arrivals, departures, tasks, total: arrivals.length + departures.length + tasks.length, dateStr: localTodayStr };
  }, [rentals, templates]);

  const displayedRentals = useMemo(() => {
    return rentals.filter(r => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (r.guest?.toLowerCase().includes(q) || r.text?.toLowerCase().includes(q) || r.property?.toLowerCase().includes(q) || r.phone?.includes(q) || r.email?.includes(q) || r.guestNote?.toLowerCase().includes(q) || r.date?.includes(q) || r.source?.toLowerCase().includes(q));
      }
      if (!r.date) return false;
      const d = new Date(r.date);
      if (isNaN(d.getTime())) return false;
      return d.getFullYear().toString() === selectedYear;
    });
  }, [rentals, selectedYear, searchQuery]);

  const { allBookings, upcomingBookings, archivedBookings, utilitiesList, remindersList } = useMemo(() => {
    const todayTime = new Date().setHours(0, 0, 0, 0);
    const sortFn = (list, isBooking = true) => [...list].sort((a, b) => {
      const tA = new Date(a.date).getTime() || 0; const tB = new Date(b.date).getTime() || 0;
      if (isBooking && bookingSortOrder === 'upcoming') {
        const isPastA = tA < todayTime; const isPastB = tB < todayTime;
        if (isPastA && !isPastB) return 1; if (!isPastA && isPastB) return -1;
        return !isPastA && !isPastB ? tA - tB : tB - tA;
      }
      return (isBooking ? bookingSortOrder : utilitySortOrder) === 'desc' ? tB - tA : tA - tB;
    });

    const bookings = sortFn(displayedRentals.filter(r => r.type === 'booking'), true);
    return {
      allBookings: bookings,
      upcomingBookings: bookings.filter(r => new Date(r.endDate || r.date).setHours(0,0,0,0) >= todayTime),
      archivedBookings: bookings.filter(r => new Date(r.endDate || r.date).setHours(0,0,0,0) < todayTime),
      utilitiesList: sortFn(displayedRentals.filter(r => r.type === 'utility'), false),
      remindersList: sortFn(displayedRentals.filter(r => r.type === 'reminder'), false)
    };
  }, [displayedRentals, bookingSortOrder, utilitySortOrder]);

  const displayedBookings = bookingFilter === 'all' ? allBookings : bookingFilter === 'upcoming' ? upcomingBookings : archivedBookings;
  
  const getPaginated = (list) => list.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const paginatedBookings = getPaginated(displayedBookings);
  const paginatedUtilities = getPaginated(utilitiesList);
  const paginatedReminders = getPaginated(remindersList);

  const renderMainTab = searchQuery && mainTab === 'calendar' ? 'bookings' : mainTab;

  let currentTotalPages = 1;
  if (renderMainTab === 'utilities') {
    currentTotalPages = Math.ceil(utilitiesList.length / ITEMS_PER_PAGE) || 1;
  } else if (renderMainTab === 'reminders') {
    currentTotalPages = Math.ceil(remindersList.length / ITEMS_PER_PAGE) || 1;
  } else {
    currentTotalPages = Math.ceil(displayedBookings.length / ITEMS_PER_PAGE) || 1;
  }

  const stats = useMemo(() => {
    let inc = 0, cst = 0, tax = 0, mTax = 0;
    const isCurYr = selectedYear === new Date().getFullYear().toString();
    displayedRentals.forEach(r => {
      inc += Number(r.income) || 0; cst += (Number(r.commission) || 0) + (Number(r.utilities) || 0);
      const t = (Number(r.tax) || 0) + (Number(r.vat) || 0); tax += t;
      
      if (r.date && isCurYr && !searchQuery) {
        const dObj = new Date(r.date);
        if (!isNaN(dObj.getTime()) && dObj.getMonth() === new Date().getMonth()) mTax += t;
      }
    });
    return { income: inc, costs: cst, tax, currentMonthTax: mTax, profit: inc - cst - tax, isViewingCurrentYear: isCurYr };
  }, [displayedRentals, selectedYear, searchQuery]);

  const yearlyStats = useMemo(() => {
    const yearsData = {};
    rentals.forEach(r => {
      if (!r.date || r.type === 'reminder') return;
      const dateObj = new Date(r.date);
      if (isNaN(dateObj.getTime())) return;
      
      const year = dateObj.getFullYear().toString();
      const month = dateObj.getMonth();
      
      if (!yearsData[year]) {
        yearsData[year] = {
          total: { income: 0, costs: 0, tax: 0, profit: 0 },
          months: Array.from({length: 12}, () => ({ income: 0, costs: 0, tax: 0, profit: 0, active: false }))
        };
      }
      
      const inc = Number(r.income) || 0; const comm = Number(r.commission) || 0;
      const util = Number(r.utilities) || 0; 
      const tax = (Number(r.tax) || 0) + (Number(r.vat) || 0);
      const cst = comm + util; const prf = inc - cst - tax;
      
      yearsData[year].total.income += inc; yearsData[year].total.costs += cst;
      yearsData[year].total.tax += tax; yearsData[year].total.profit += prf;
      yearsData[year].months[month].income += inc; yearsData[year].months[month].costs += cst;
      yearsData[year].months[month].tax += tax; yearsData[year].months[month].profit += prf;
      yearsData[year].months[month].active = true;
    });
    return yearsData;
  }, [rentals]);

  const currentYearData = useMemo(() => {
    return yearlyStats[selectedYear] || { total: { income: 0, costs: 0, tax: 0, profit: 0 }, months: Array.from({length: 12}, () => ({ income: 0, costs: 0, tax: 0, profit: 0, active: false })) };
  }, [yearlyStats, selectedYear]);

  const monthNames = useMemo(() => ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'], []);

  // --- LOGIKA SYNCHRONIZACJI ICAL ---
  const handleSyncCalendars = async () => {
    if (!user) return;
    
    // Zabezpieczenie przed brakiem linków
    if (Object.keys(syncLinks).length === 0) {
      alert('Najpierw dodaj linki iCal w Ustawieniach (zakładka Integracje), aby móc zsynchronizować kalendarze.');
      return;
    }

    setIsSyncing(true);
    let newBookingsCount = 0;

    for (const propName of Object.keys(syncLinks)) {
      const links = syncLinks[propName];
      if (!links) continue;

      const sourcesToSync = [];
      if (links.booking) sourcesToSync.push({ name: 'Booking', url: links.booking });
      if (links.airbnb) sourcesToSync.push({ name: 'Airbnb', url: links.airbnb });

      for (const source of sourcesToSync) {
        try {
          const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(source.url)}`;
          const response = await fetch(proxyUrl);
          const data = await response.text();

          const events = [];
          const lines = data.split(/\r\n|\n|\r/);
          let currentEvent = null;

          lines.forEach(line => {
            if (line.startsWith('BEGIN:VEVENT')) currentEvent = {};
            else if (line.startsWith('END:VEVENT') && currentEvent) {
              events.push(currentEvent);
              currentEvent = null;
            }
            else if (currentEvent) {
              if (line.startsWith('DTSTART')) {
                  const match = line.match(/DTSTART(?:;[^:]+)?:(.*)/);
                  if(match) currentEvent.start = match[1].substring(0,8);
              }
              if (line.startsWith('DTEND')) {
                  const match = line.match(/DTEND(?:;[^:]+)?:(.*)/);
                  if(match) currentEvent.end = match[1].substring(0,8);
              }
              if (line.startsWith('SUMMARY')) {
                  const match = line.match(/SUMMARY(?:;[^:]+)?:(.*)/);
                  if(match) currentEvent.summary = match[1];
              }
            }
          });

          for (const e of events) {
            if (!e.start || !e.end) continue;
            const startDate = `${e.start.substring(0,4)}-${e.start.substring(4,6)}-${e.start.substring(6,8)}`;
            const endDate = `${e.end.substring(0,4)}-${e.end.substring(4,6)}-${e.end.substring(6,8)}`;
            const syncId = `sync_${source.name}_${propName}_${startDate}_${endDate}`;
            
            const exists = rentals.some(r => r.syncId === syncId || (r.property === propName && r.date === startDate && r.source === source.name));

            if (!exists) {
              const newId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
              const isBlocked = e.summary?.toLowerCase().includes('blocked') || e.summary?.toLowerCase().includes('niedostępne');
              await setDoc(doc(db, 'users', user.uid, 'rentals', newId), {
                type: 'booking', property: propName, source: source.name,
                guest: isBlocked ? `Blokada (${source.name})` : (e.summary || `Gość ${source.name}`),
                date: startDate, endDate: endDate, income: 0, advancePayment: 0, isAdvancePaid: false,
                commission: 0, tax: 0, vat: 0, utilities: 0, isPaid: false, completedTasks: {}, syncId: syncId, guestNote: ''
              });
              newBookingsCount++;
            }
          }
        } catch (err) { console.error(`Błąd synchronizacji dla ${source.name}:`, err); }
      }
    }
    setIsSyncing(false);
    if(newBookingsCount > 0) alert(`Synchronizacja zakończona! Dodano ${newBookingsCount} nowych rezerwacji.`);
    else alert(`Synchronizacja zakończona! Brak nowych rezerwacji do pobrania.`);
  };

  // --- AKCJE FIREBASE I FUNKCJE ---
  
  // ROZBUDOWANY KALKULATOR PODATKÓW (Z ZUS i kwotą wolną)
  const calculateTaxes = (rentalObj, allRentals, settings, currentEditingId) => {
    const inc = Number(rentalObj.income) || 0;
    const comm = Number(rentalObj.commission) || 0;
    
    let vatAmt = 0;
    if (settings.isVatPayer) {
      vatAmt = inc - (inc / 1.08); 
    }
    const netInc = inc - vatAmt; 
    
    let taxBase = netInc;
    if (settings.taxForm === 'general') {
      taxBase = Math.max(0, netInc - comm);
    }

    let taxAmt = 0;
    if (settings.taxForm === 'lump_sum' && settings.autoThreshold) {
      let ytdNetInc = 0;
      const currentYear = new Date(rentalObj.date || new Date()).getFullYear();
      const currentDate = new Date(rentalObj.date || new Date()).getTime();
      const currIdNum = Number(currentEditingId || Date.now());

      allRentals.forEach(r => {
        if (r.type === 'booking' && r.id !== currentEditingId) {
          if (!r.date) return;
          const rDateObj = new Date(r.date);
          if (rDateObj.getFullYear() === currentYear) {
            const rTime = rDateObj.getTime();
            if (rTime < currentDate || (rTime === currentDate && Number(r.id) < currIdNum)) {
               const rInc = Number(r.income) || 0;
               const rVat = settings.isVatPayer ? (rInc - (rInc / 1.08)) : 0;
               ytdNetInc += (rInc - rVat);
            }
          }
        }
      });
      
      if (ytdNetInc >= 100000) {
        taxAmt = taxBase * 0.125; 
      } else if (ytdNetInc + netInc <= 100000) {
        taxAmt = taxBase * 0.085; 
      } else {
        const belowThreshold = 100000 - ytdNetInc;
        const aboveThreshold = netInc - belowThreshold;
        taxAmt = (belowThreshold * 0.085) + (aboveThreshold * 0.125);
      }
    } else if (settings.taxForm === 'general') {
        // Skala podatkowa z kwotą wolną
        let ytdNetIncome = 0;
        let ytdCosts = 0;
        const currentYear = new Date(rentalObj.date || new Date()).getFullYear();
        const currentDate = new Date(rentalObj.date || new Date()).getTime();
        const currIdNum = Number(currentEditingId || Date.now());

        allRentals.forEach(r => {
          if (r.id !== currentEditingId && r.date) {
            const rDateObj = new Date(r.date);
            if (rDateObj.getFullYear() === currentYear) {
              const rTime = rDateObj.getTime();
              if (rTime < currentDate || (rTime === currentDate && Number(r.id) < currIdNum)) {
                 if (r.type === 'booking') {
                     const rInc = Number(r.income) || 0;
                     const rVat = settings.isVatPayer ? (rInc - (rInc / 1.08)) : 0;
                     ytdNetIncome += (rInc - rVat);
                     ytdCosts += (Number(r.commission) || 0);
                 } else if (r.type === 'utility') {
                     ytdCosts += (Number(r.utilities) || 0);
                 }
              }
            }
          }
        });
        
        let yearlyZusDeduction = 0;
        if (settings.includeZusInCosts) {
           const monthNum = new Date(rentalObj.date || new Date()).getMonth() + 1;
           yearlyZusDeduction = (Number(settings.zusSocial) || 0) * monthNum;
        }

        const currentCumulativeProfit = Math.max(0, ytdNetIncome - ytdCosts - yearlyZusDeduction);
        const newCumulativeProfit = Math.max(0, ytdNetIncome + netInc - ytdCosts - comm - yearlyZusDeduction);
        
        const taxFree = Number(settings.taxFreeAmount) || 30000;
        let oldTax = 0; let newTax = 0;

        if (currentCumulativeProfit > taxFree) {
            if (currentCumulativeProfit <= 120000) oldTax = (currentCumulativeProfit - taxFree) * 0.12;
            else oldTax = ((120000 - taxFree) * 0.12) + ((currentCumulativeProfit - 120000) * 0.32);
        }
        if (newCumulativeProfit > taxFree) {
            if (newCumulativeProfit <= 120000) newTax = (newCumulativeProfit - taxFree) * 0.12;
            else newTax = ((120000 - taxFree) * 0.12) + ((newCumulativeProfit - 120000) * 0.32);
        }
        taxAmt = Math.max(0, newTax - oldTax);

    } else {
      // Stała stawka (np. 19% liniowy)
      taxAmt = taxBase * (Number(settings.rate) / 100);
    }
    
    return {
      vat: vatAmt > 0 ? vatAmt.toFixed(2) : '',
      tax: taxAmt > 0 ? taxAmt.toFixed(2) : ''
    };
  };

  const handleCloseModal = () => { setShowAddModal(false); setEditingId(null); setNewRental(getDefaultRentalState()); };
  
  const openEditModal = (r) => { 
    setEditingId(r.id); 
    setNewRental({
      ...r,
      email: r.email || '',
      phone: r.phone || '',
      text: r.text || '',
      guestNote: r.guestNote || '',
      advancePayment: r.advancePayment || '',
      commission: r.commission || '',
      tax: r.tax || '',
      vat: r.vat || '',
      utilities: r.utilities || '',
    }); 
    setShowAddModal(true); 
  };
  
  const handleDeleteClick = (id) => { setItemToDelete(id); };

  const handleRentalChange = (field, value) => {
    const updated = { ...newRental, [field]: value };
    if (['income', 'commission', 'source', 'date'].includes(field) && updated.type === 'booking') {
      if (updated.source === 'Facebook') { 
         updated.tax = ''; updated.vat = ''; updated.commission = ''; 
      } else {
         const { vat, tax } = calculateTaxes(updated, rentals, taxSettings, editingId);
         updated.vat = vat;
         updated.tax = tax;
      }
    }
    setNewRental(updated);
  };

  const handleAddRental = async (e) => {
    e.preventDefault();
    if (!user) return;
    const entry = { ...newRental };
    if (entry.type === 'booking') {
      entry.income = Number(entry.income) || 0; entry.advancePayment = Number(entry.advancePayment) || 0;
      entry.commission = Number(entry.commission) || 0; entry.tax = Number(entry.tax) || 0; entry.vat = Number(entry.vat) || 0;
    } else if (entry.type === 'utility') { entry.utilities = Number(entry.utilities) || 0; }
    const docRef = editingId ? doc(db, 'users', user.uid, 'rentals', editingId) : doc(db, 'users', user.uid, 'rentals', Date.now().toString());
    await (editingId ? updateDoc : setDoc)(docRef, entry);
    handleCloseModal();
  };

  const confirmDelete = async () => { if (!user || !itemToDelete) return; await deleteDoc(doc(db, 'users', user.uid, 'rentals', itemToDelete)); setItemToDelete(null); };

  const toggleStatus = async (id, field) => {
    const r = rentals.find(r => r.id === id);
    if (r && user) await updateDoc(doc(db, 'users', user.uid, 'rentals', id), { [field]: !r[field] });
  };

  const completeTask = async (id, taskId, current) => {
    if (!user) return;
    const updates = taskId === 'manual' ? { isCompleted: true } : { [`completedTasks.${taskId}`]: current !== undefined ? !current : true };
    if (taskId === 'directions') updates.directionsSent = true;
    if (taskId === 'keycode') updates.keycodeSent = true;
    await updateDoc(doc(db, 'users', user.uid, 'rentals', id), updates);
  };

  const toggleDynamicTask = async (id, taskId, currentValue) => {
    if (!user) return;
    const updates = { [`completedTasks.${taskId}`]: !currentValue };
    if (taskId === 'directions') updates.directionsSent = !currentValue;
    if (taskId === 'keycode') updates.keycodeSent = !currentValue;
    await updateDoc(doc(db, 'users', user.uid, 'rentals', id), updates);
  };

  const exportToCSV = () => {
    const headers = ['Domek', 'Typ', 'Kategoria', 'Gosc_Opis', 'Telefon', 'Email', 'Notatka', 'Przyjazd_Data', 'Wyjazd', 'Przychod', 'Zaliczka', 'Zaliczka_Wplynela', 'Kwota_Kosztu', 'Zysk', 'Status_Calkowity'];
    const allSorted = [...displayedRentals].filter(r => r.type !== 'reminder').sort((a, b) => {
      const tA = new Date(a.date).getTime(); const tB = new Date(b.date).getTime(); return (isNaN(tB) ? 0 : tB) - (isNaN(tA) ? 0 : tA);
    });
    const csvContent = [headers.join(','), ...allSorted.map(r => [`"${r.property}"`, `"${r.type}"`, `"${r.category || ''}"`, `"${r.guest}"`, `"${r.phone || ''}"`, `"${r.email || ''}"`, `"${r.guestNote || ''}"`, r.date, r.endDate || '', r.income, r.advancePayment || 0, r.isAdvancePaid ? 'Tak' : 'Nie', r.utilities, (Number(r.income) - Number(r.commission) - Number(r.tax) - Number(r.vat || 0) - Number(r.utilities)), r.isPaid ? 'Tak' : 'Nie'].join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.setAttribute('download', `raport_wynajmow_${selectedYear}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  };

  const openSettingsModal = () => {
    setEditingTemplates(JSON.parse(JSON.stringify(templates)));
    setEditingProperties([...properties]); 
    setEditingSources([...sources]); 
    setEditingCategories([...categories]);
    setEditingTaxSettings(taxSettings); 
    setEditingSyncLinks(JSON.parse(JSON.stringify(syncLinks)));
    setSettingsTab('sync'); 
    setShowSettingsModal(true);
  };

  const saveSettings = async () => {
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid, 'settings', 'reminders'), { items: editingTemplates });
    await setDoc(doc(db, 'users', user.uid, 'settings', 'properties'), { items: editingProperties });
    await setDoc(doc(db, 'users', user.uid, 'settings', 'sources'), { items: editingSources });
    await setDoc(doc(db, 'users', user.uid, 'settings', 'categories'), { items: editingCategories });
    await setDoc(doc(db, 'users', user.uid, 'settings', 'tax'), editingTaxSettings);
    await setDoc(doc(db, 'users', user.uid, 'settings', 'syncLinks'), { links: editingSyncLinks });
    setShowSettingsModal(false);
  };

  const changeMonth = (offset) => {
    const newDate = new Date(calendarDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCalendarDate(newDate);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Błąd podczas wylogowywania:", error);
    }
  };

  const updateProperty = (index, newValue) => { const updated = [...editingProperties]; updated[index] = newValue; setEditingProperties(updated); };
  const removeProperty = (index) => { const updated = [...editingProperties]; updated.splice(index, 1); setEditingProperties(updated); };
  const handleAddProperty = (e) => { 
    e.preventDefault();
    if (newPropertyName.trim() !== '') { 
      setEditingProperties([...editingProperties, { name: newPropertyName.trim(), color: newPropertyColor }]); 
      setNewPropertyName(''); 
      setNewPropertyColor('blue'); 
    } 
  };

  const updateSource = (index, value) => { const updated = [...editingSources]; updated[index] = value; setEditingSources(updated); };
  const removeSource = (index) => { const updated = [...editingSources]; updated.splice(index, 1); setEditingSources(updated); };
  const handleAddSource = (e) => { 
    e.preventDefault();
    if (newSourceName.trim() !== '') { 
      setEditingSources([...editingSources, newSourceName.trim()]); 
      setNewSourceName(''); 
    } 
  };

  const updateCategory = (index, value) => { const updated = [...editingCategories]; updated[index] = value; setEditingCategories(updated); };
  const removeCategory = (index) => { const updated = [...editingCategories]; updated.splice(index, 1); setEditingCategories(updated); };
  const handleAddCategory = (e) => { 
    e.preventDefault();
    if (newCategoryName.trim() !== '') { 
      setEditingCategories([...editingCategories, newCategoryName.trim()]); 
      setNewCategoryName(''); 
    } 
  };

  const updateTemplate = (index, field, value) => { const updated = [...editingTemplates]; updated[index][field] = value; setEditingTemplates(updated); };
  const removeTemplate = (index) => { const updated = [...editingTemplates]; updated.splice(index, 1); setEditingTemplates(updated); };
  const addTemplate = () => { 
    setEditingTemplates([...editingTemplates, { 
      id: `task_${Date.now()}`, 
      text: 'Nowe zadanie...', 
      shortName: 'Zadanie', 
      daysBefore: 3, 
      icon: 'CheckSquare' 
    }]); 
  };

  // --- RENDEROWANIE KALENDARZA SIATKOWEGO ---
  const calendarView = useMemo(() => {
    const year = calendarDate.getFullYear(); const month = calendarDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const blanks = Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 });
    
    return (
      <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors duration-300">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 capitalize tracking-wide">{calendarDate.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}</h3>
          <div className="flex gap-2">
            <button onClick={() => changeMonth(-1)} className="p-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-white dark:hover:bg-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors shadow-sm"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={() => setCalendarDate(new Date())} className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-bold hover:bg-white dark:hover:bg-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors shadow-sm">Dzisiaj</button>
            <button onClick={() => changeMonth(1)} className="p-2 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-white dark:hover:bg-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors shadow-sm"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="p-5 overflow-x-auto">
          <div className="grid grid-cols-7 min-w-[700px] border-t border-l border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
            {['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Ndz'].map(d => <div key={d} className="bg-slate-50/80 dark:bg-slate-800/80 p-3 text-center text-[11px] font-extrabold text-slate-500 dark:text-slate-400 border-r border-b border-slate-100 dark:border-slate-700 uppercase tracking-widest">{d}</div>)}
            {blanks.map((_, i) => <div key={`b-${i}`} className="bg-slate-50/30 dark:bg-slate-900/30 border-r border-b border-slate-100 dark:border-slate-700 min-h-[140px]"></div>)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayStart = new Date(year, month, i + 1).setHours(0,0,0,0);
              const isToday = new Date().setHours(0,0,0,0) === dayStart;
              const dayRentals = rentals.filter(r => r.type === 'booking' && r.date && r.endDate && dayStart >= new Date(r.date).setHours(0,0,0,0) && dayStart <= new Date(r.endDate).setHours(0,0,0,0));
              
              return (
                <div key={i} className={`bg-white dark:bg-slate-800 min-h-[140px] p-2.5 flex flex-col gap-1.5 border-r border-b border-slate-100 dark:border-slate-700 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-700/50 ${isToday ? 'bg-blue-50/40 dark:bg-blue-900/20' : ''}`}>
                  <span className={`text-xs font-extrabold self-end mb-1 ${isToday ? 'bg-blue-600 dark:bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-md shadow-blue-500/30' : 'text-slate-400 dark:text-slate-500'}`}>{i + 1}</span>
                  <div className="flex flex-col gap-1.5 overflow-y-auto no-scrollbar">
                    {dayRentals.map(r => {
                      const col = propColors[properties.find(p => p.name === r.property)?.color || 'slate'];
                      const isStart = dayStart === new Date(r.date).setHours(0,0,0,0);
                      const isEnd = dayStart === new Date(r.endDate).setHours(0,0,0,0);
                      const timeLabel = (isStart && isEnd) ? '(1 d.)' : isStart ? '↘ Przyj.' : isEnd ? '↖ Wyj.' : '';
                      return (
                        <div key={r.id} onClick={() => openEditModal(r)} className={`text-[10px] px-2 py-1.5 rounded-lg cursor-pointer leading-tight transition-all hover:opacity-80 hover:scale-[1.02] ${r.isPaid ? col.solid : r.isAdvancePaid ? col.advance : col.dashed}`}>
                          <span className="font-extrabold truncate block">{r.property}</span>
                          <div className="flex justify-between items-center gap-1 mt-1">
                            <span className="truncate font-medium opacity-90">{r.guest}</span>
                            {timeLabel && <span className="bg-black/15 dark:bg-black/30 px-1.5 py-0.5 rounded-md font-bold">{timeLabel}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }, [calendarDate, rentals, properties]);

  // --- EKRAN ŁADOWANIA ---
  if (loading) return <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900 flex items-center justify-center"><Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-500 animate-spin" /></div>;

  // --- EKRAN BLOKADY (PAYWALL) ---
  if (isAccessLocked()) {
      return (
          <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-900 dark:text-slate-100 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/10 rounded-full filter blur-[100px] pointer-events-none"></div>
            
            <div className="max-w-md w-full bg-white dark:bg-slate-800 p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-black/50 text-center border border-slate-100 dark:border-slate-700 relative z-10">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-blue-500/30">
                    <Lock className="w-10 h-10" />
                </div>
                
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">Koniec okresu próbnego</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">
                    Twój darmowy 14-dniowy dostęp do WynajemPro dobiegł końca. Odblokuj pełen panel zarządzania rezerwacjami, integracje z kalendarzami i automatyczne raporty księgowe.
                </p>
                
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 mb-8">
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Plan Gospodarza</p>
                    <p className="text-4xl font-black text-slate-900 dark:text-white">29.99 <span className="text-lg text-slate-500 dark:text-slate-400 font-bold">zł / msc</span></p>
                </div>

                <button 
                    onClick={handleSubscribe} 
                    disabled={isCheckoutLoading}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {isCheckoutLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Odblokuj dostęp'}
                </button>
                
                <button 
                    onClick={handleLogout} 
                    className="mt-6 text-sm font-bold text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                    Wyloguj się
                </button>
            </div>
          </div>
      );
  }

  // --- ZWYKŁY RENDER APLIKACJI (JEŚLI ODBLOKOWANE) ---
  return (
    <div className={`min-h-screen bg-[#f8fafc] dark:bg-slate-900 relative font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300`}>
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-300/10 dark:bg-blue-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] pointer-events-none transition-colors duration-300 transform-gpu will-change-transform"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-indigo-300/10 dark:bg-indigo-500/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] pointer-events-none transition-colors duration-300 transform-gpu will-change-transform"></div>

      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-8 relative z-10">
        
        {/* NAGŁÓWEK - MODERN GLASSMORPHISM */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl p-6 lg:px-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white dark:border-slate-700 transition-colors duration-300">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3 tracking-tight transition-colors duration-300">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl shadow-lg shadow-blue-500/30 text-white">
                 <Home className="w-6 h-6" /> 
              </div>
              Wynajem<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-500 dark:from-blue-400 dark:to-violet-400">Pro</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium text-sm ml-12 transition-colors duration-300">Panel Zarządzania Rezerwacjami</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Wyszukiwarka */}
            <div className="flex-1 lg:flex-none flex items-center bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl p-1.5 border border-slate-200/60 dark:border-slate-700/60 focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:border-blue-400 dark:focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all shadow-sm">
              <Search className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
              <input type="text" placeholder="Szukaj wpisów..." value={searchQuery} onChange={(e) => changeSearchQuery(e.target.value)} className="bg-transparent font-bold text-slate-700 dark:text-slate-200 text-sm outline-none px-3 py-1.5 w-full md:w-36 lg:w-48 placeholder-slate-400 dark:placeholder-slate-500" />
              {searchQuery && <button onClick={() => changeSearchQuery('')} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 mr-1"><XCircle className="w-4 h-4" /></button>}
            </div>

            {/* Wybór Roku */}
            <div className="flex-1 md:flex-none flex items-center bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl p-1.5 border border-slate-200/60 dark:border-slate-700/60 shadow-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
              <CalendarIcon className="w-4 h-4 ml-3 text-slate-400" />
              <select value={selectedYear} onChange={(e) => handleYearChange(e.target.value)} disabled={!!searchQuery} className="bg-transparent font-bold text-sm outline-none pl-2 pr-3 py-1.5 cursor-pointer text-slate-700 dark:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed">
                {!searchQuery && availableYears.map(year => <option key={year} value={year}>Rok {year}</option>)}
                {searchQuery && <option>Historia</option>}
              </select>
            </div>

            {/* Przyciski Akcji */}
            <button onClick={handleSyncCalendars} disabled={isSyncing} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 px-5 py-3 rounded-2xl hover:bg-emerald-100 dark:hover:bg-emerald-500/20 font-bold text-sm text-emerald-700 dark:text-emerald-400 transition-all shadow-sm hover:shadow disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>

            <button onClick={() => setShowDailyReportModal(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/60 dark:border-indigo-500/20 px-5 py-3 rounded-2xl hover:bg-indigo-100 dark:hover:bg-indigo-500/20 font-bold text-sm text-indigo-700 dark:text-indigo-400 transition-all shadow-sm hover:shadow relative">
              <ClipboardList className="w-4 h-4" /> <span className="hidden sm:inline">Raport</span>
              {dailyReport.total > 0 && <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] font-extrabold w-5 h-5 flex items-center justify-center rounded-full shadow-md">{dailyReport.total}</span>}
            </button>

            <button onClick={exportToCSV} className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-slate-600 dark:text-slate-300 transition-all shadow-sm" title="Eksportuj do CSV">
              <Download className="w-4 h-4" />
            </button>

            <button onClick={openSettingsModal} className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-slate-600 dark:text-slate-300 transition-all shadow-sm"><Settings className="w-4 h-4" /></button>
            
            {/* PRZYCISK TRYBU CIEMNEGO */}
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-slate-600 dark:text-slate-300 transition-all shadow-sm" title="Zmień motyw">
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* PRZYCISK WYLOGOWANIA */}
            <button onClick={handleLogout} className="flex items-center justify-center gap-2 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-700 px-4 py-3 rounded-2xl hover:bg-rose-100 dark:hover:bg-rose-500/20 font-medium text-rose-600 dark:text-rose-400 transition-all shadow-sm" title="Wyloguj się">
              <LogOut className="w-4 h-4" />
            </button>

            <button onClick={() => { setNewRental(getDefaultRentalState()); setShowAddModal(true); }} className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white px-6 py-3 rounded-2xl hover:from-blue-700 hover:to-indigo-700 font-bold text-sm shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all"><Plus className="w-5 h-5" /> Dodaj wpis</button>
          </div>
        </div>

        {/* PRZYPOMNIENIA NA PULPICIE */}
        {!searchQuery && remindersList.filter(r => !r.isCompleted && new Date(r.date) <= new Date(new Date().setDate(new Date().getDate() + 7))).length > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200/60 dark:border-amber-700/30 rounded-[2rem] p-6 shadow-sm transition-colors duration-300">
            <h2 className="text-lg font-extrabold text-amber-900 dark:text-amber-400 flex items-center gap-2 mb-4"><Bell className="w-5 h-5 text-amber-500 animate-bounce" /> Ważne zadania na ten tydzień</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {remindersList.filter(r => !r.isCompleted && new Date(r.date) <= new Date(new Date().setDate(new Date().getDate() + 7))).map(task => (
                <div key={task.id} className="flex items-center justify-between bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm p-4 rounded-2xl border border-amber-100 dark:border-amber-700/50 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-amber-100 dark:bg-amber-500/20 p-2 rounded-xl text-amber-600 dark:text-amber-400"><Bell className="w-4 h-4" /></div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{task.text}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{task.date} ({getDayName(task.date)})</p>
                    </div>
                  </div>
                  <button onClick={() => completeTask(task.id, 'manual')} className="p-2 text-slate-300 dark:text-slate-600 hover:text-green-500 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-xl transition-all"><CheckCircle className="w-6 h-6" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STATYSTYKI KARTY (SOFT UI) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={<DollarSign className="w-7 h-7"/>} label="Przychody całkowite" value={stats.income} color="green" onClick={() => setShowStatsModal(true)} />
          <StatCard icon={<Wallet className="w-7 h-7"/>} label="Koszty całkowite" value={stats.costs} color="red" sub="Prowizje + Media" onClick={() => setShowStatsModal(true)} />
          <StatCard icon={<Landmark className="w-7 h-7"/>} label="Podatek całkowity" value={stats.tax} color="purple" onClick={() => setShowStatsModal(true)} />
          <StatCard icon={<TrendingUp className="w-7 h-7"/>} label="Zysk Netto" value={stats.profit} color="blue" onClick={() => setShowStatsModal(true)} />
        </div>

        {/* GŁÓWNA NAWIGACJA (SEGMENTED CONTROL) */}
        <div className="flex justify-center md:justify-start">
          <div className="bg-slate-200/60 dark:bg-slate-900/50 p-1.5 rounded-2xl inline-flex flex-wrap gap-1 shadow-inner transition-colors duration-300">
            <button onClick={() => changeTab('bookings')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${mainTab === 'bookings' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'}`}><List className="w-4 h-4 shrink-0" /> Rezerwacje</button>
            <button onClick={() => changeTab('calendar')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${mainTab === 'calendar' ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'}`}><CalendarIcon className="w-4 h-4 shrink-0" /> Kalendarz</button>
            <button onClick={() => changeTab('utilities')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${mainTab === 'utilities' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'}`}><DollarSign className="w-4 h-4 shrink-0" /> Wydatki <span className="bg-slate-100 dark:bg-slate-700 px-1.5 rounded-md text-xs">{utilitiesList.length}</span></button>
            <button onClick={() => changeTab('reminders')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${mainTab === 'reminders' ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'}`}><CheckSquare className="w-4 h-4 shrink-0" /> Zadania <span className="bg-slate-100 dark:bg-slate-700 px-1.5 rounded-md text-xs">{remindersList.length}</span></button>
          </div>
        </div>

        {/* ZAWARTOŚĆ GŁÓWNA */}
        {renderMainTab !== 'calendar' ? (
          <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col transition-colors duration-300">
            
            {/* ZAKŁADKI REZERWACJI (TABS) - Widoczne tylko dla rezerwacji */}
            {renderMainTab === 'bookings' && (
              <div className="bg-slate-50/50 dark:bg-slate-800/50 px-6 pt-6 pb-2 border-b border-slate-100 dark:border-slate-700">
                 <div className="flex bg-slate-200/50 dark:bg-slate-900/50 p-1.5 rounded-2xl gap-1 overflow-x-auto no-scrollbar shrink-0 w-max max-w-full shadow-inner">
                    <button onClick={() => changeBookingFilter('all')} className={`px-5 py-2 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${bookingFilter === 'all' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}>Wszystkie ({allBookings.length})</button>
                    <button onClick={() => changeBookingFilter('upcoming')} className={`px-5 py-2 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${bookingFilter === 'upcoming' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}>Nadchodzące ({upcomingBookings.length})</button>
                    <button onClick={() => changeBookingFilter('archived')} className={`px-5 py-2 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${bookingFilter === 'archived' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}>Archiwalne ({archivedBookings.length})</button>
                 </div>
              </div>
            )}

            <div className="overflow-x-auto">
              {renderMainTab === 'utilities' ? (
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-slate-50/50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                    <tr>
                      <th className="p-5 font-extrabold">Opis Kosztu</th>
                      <th className="p-5 font-extrabold cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={() => changeUtilitySortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}>
                         <div className="flex items-center gap-1">Data {utilitySortOrder === 'desc' ? <ArrowDown className="w-3.5 h-3.5"/> : <ArrowUp className="w-3.5 h-3.5"/>}</div>
                      </th>
                      <th className="p-5 text-right font-extrabold">Kwota</th>
                      <th className="p-5 text-center font-extrabold">Akcje</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                    {paginatedUtilities.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="p-5"><span className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold text-[10px] px-2.5 py-1 rounded-lg mr-3 shadow-sm">{r.category}</span> <span className="font-bold text-slate-800 dark:text-slate-200">{r.guest}</span> <div className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1.5">{r.property}</div></td>
                        <td className="p-5 text-sm font-medium text-slate-600 dark:text-slate-300">{r.date}</td>
                        <td className="p-5 text-right font-extrabold text-red-500 dark:text-rose-400">{Number(r.utilities).toLocaleString('pl-PL')} zł</td>
                        <td className="p-5 text-center">
                          <button onClick={() => openEditModal(r)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteClick(r.id)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : renderMainTab === 'reminders' ? (
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-slate-50/50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                    <tr>
                      <th className="p-5 font-extrabold">Zadanie</th>
                      <th className="p-5 font-extrabold cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-center" onClick={() => changeUtilitySortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}>
                         <div className="flex items-center justify-center gap-1">Termin {utilitySortOrder === 'desc' ? <ArrowDown className="w-3.5 h-3.5"/> : <ArrowUp className="w-3.5 h-3.5"/>}</div>
                      </th>
                      <th className="p-5 text-center font-extrabold">Status</th>
                      <th className="p-5 text-center font-extrabold">Akcje</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                    {paginatedReminders.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="p-5 font-extrabold text-slate-800 dark:text-slate-200"><Bell className="inline w-4 h-4 text-amber-500 mr-2"/> {r.text}</td>
                        <td className="p-5 text-center text-sm font-medium text-slate-600 dark:text-slate-300">{r.date}</td>
                        <td className="p-5 text-center"><button onClick={() => toggleStatus(r.id, 'isCompleted')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${r.isCompleted ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-500'}`}>{r.isCompleted ? '✔ Wykonane' : 'Oczekuje'}</button></td>
                        <td className="p-5 text-center">
                          <button onClick={() => openEditModal(r)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteClick(r.id)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-rose-400 hover:bg-red-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full text-left min-w-[1100px]">
                  <thead className="bg-slate-50/50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                    <tr>
                      <th className="p-5 font-extrabold">Domek / Gość</th>
                      <th className="p-5 font-extrabold cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors" onClick={() => changeBookingSortOrder(prev => prev === 'upcoming' ? 'desc' : prev === 'desc' ? 'asc' : 'upcoming')}>
                         <div className="flex items-center gap-1">Termin {bookingSortOrder === 'upcoming' ? <CalendarDays className="w-3.5 h-3.5 text-blue-500"/> : bookingSortOrder === 'desc' ? <ArrowDown className="w-3.5 h-3.5"/> : <ArrowUp className="w-3.5 h-3.5"/>}</div>
                      </th>
                      <th className="p-5 text-right font-extrabold">Przychód</th>
                      <th className="p-5 text-right font-extrabold">Prowizja</th>
                      {taxSettings.isVatPayer && <th className="p-5 text-right font-extrabold">VAT</th>}
                      <th className="p-5 text-right font-extrabold">Podatek</th>
                      <th className="p-5 text-right text-blue-600 dark:text-blue-400 font-extrabold">Zysk Netto</th>
                      <th className="p-5 font-extrabold">Zadania</th>
                      <th className="p-5 text-center font-extrabold">Status</th>
                      <th className="p-5 text-center font-extrabold">Akcje</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                    {paginatedBookings.map(r => {
                      const propColor = propColors[properties.find(p => p.name === r.property)?.color || 'slate'];
                      return (
                        <tr key={r.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-colors group">
                          <td className="p-5">
                            <div className="font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                               <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${propColor?.bg}`}></div> 
                               {r.property}
                            </div>
                            <div className="text-sm font-medium text-slate-600 dark:text-slate-400 ml-4 mt-1.5 flex items-center gap-2">
                               {r.guest} 
                               <span className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-sm px-1.5 py-0.5 rounded-md text-[10px] text-slate-500 dark:text-slate-300 font-bold">{r.source}</span>
                            </div>
                            {(r.email || r.phone) && (
                              <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1.5 ml-4 flex flex-col gap-0.5">
                                {r.phone && <a href={`tel:${r.phone.replace(/\s+/g, '')}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-fit flex items-center gap-1"><Phone className="w-3 h-3"/> {r.phone}</a>}
                                {r.email && <a href={`mailto:${r.email}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-fit flex items-center gap-1"><Mail className="w-3 h-3"/> {r.email}</a>}
                              </div>
                            )}
                            {r.guestNote && (
                              <div className="text-[11px] text-amber-700 dark:text-amber-400 mt-2 ml-4 p-2 bg-gradient-to-r from-amber-50 to-yellow-50/50 dark:from-amber-500/10 dark:to-yellow-500/10 rounded-lg border border-amber-100/60 dark:border-amber-500/20 w-max max-w-xs font-medium shadow-sm flex items-start gap-1.5">
                                <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5" /> <span>{r.guestNote}</span>
                              </div>
                            )}
                          </td>
                          <td className="p-5 text-sm font-bold text-slate-700 dark:text-slate-300">{r.date} <br/><span className="text-xs font-medium text-slate-400 dark:text-slate-500">do {r.endDate}</span></td>
                          <td className="p-5 text-right font-extrabold text-emerald-600 dark:text-emerald-400">{Number(r.income).toLocaleString('pl-PL')} zł {Number(r.advancePayment)>0 && <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold mt-1 bg-indigo-50 dark:bg-indigo-500/10 inline-block px-1.5 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-500/20">zal. {Number(r.advancePayment).toLocaleString('pl-PL')} zł</div>}</td>
                          <td className="p-5 text-right font-bold text-rose-500 dark:text-rose-400">{Number(r.commission).toLocaleString('pl-PL')} zł</td>
                          {taxSettings.isVatPayer && <td className="p-5 text-right font-bold text-pink-500 dark:text-pink-400">{Number(r.vat).toLocaleString('pl-PL')} zł</td>}
                          <td className="p-5 text-right font-bold text-violet-600 dark:text-violet-400">{Number(r.tax).toLocaleString('pl-PL')} zł</td>
                          <td className="p-5 text-right font-black text-slate-900 dark:text-white text-base">{(Number(r.income) - Number(r.commission) - Number(r.tax) - Number(r.vat || 0)).toLocaleString('pl-PL')} zł</td>
                          <td className="p-5">
                            <div className="flex flex-col gap-2.5 w-max">
                              {templates.map(t => {
                                const isCompleted = r.completedTasks?.[t.id] || (t.id === 'directions' && r.directionsSent) || (t.id === 'keycode' && r.keycodeSent);
                                return (
                                  <label key={t.id} className="flex items-center gap-2 cursor-pointer group/task">
                                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/30' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 group-hover/task:border-blue-400 dark:group-hover/task:border-blue-500'}`}>
                                      {isCompleted && <CheckCircle className="w-3 h-3" />}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={isCompleted || false} onChange={() => toggleDynamicTask(r.id, t.id, isCompleted)} />
                                    <span className={`text-[11px] font-bold transition-colors ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 group-hover/task:text-slate-800 dark:group-hover/task:text-slate-200'}`}>{t.shortName}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </td>
                          <td className="p-5 text-center flex flex-col gap-2 items-center justify-center">
                            <button onClick={() => toggleStatus(r.id, 'isPaid')} className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition-all shadow-sm w-full max-w-[100px] ${r.isPaid ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/20' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'}`}>Opłacone {r.isPaid ? '✔' : ''}</button>
                            {Number(r.advancePayment) > 0 && (
                               <button onClick={() => toggleStatus(r.id, 'isAdvancePaid')} className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition-all shadow-sm w-full max-w-[100px] ${r.isAdvancePaid ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-100 dark:hover:bg-indigo-500/20' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'}`}>Zaliczka {r.isAdvancePaid ? '✔' : ''}</button>
                            )}
                          </td>
                          <td className="p-5 text-center">
                             <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <button onClick={() => openEditModal(r)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/20 rounded-xl transition-all shadow-sm"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteClick(r.id)} className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/20 rounded-xl transition-all shadow-sm"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            
            {/* PAGINACJA */}
            <div className="flex justify-center items-center gap-4 p-5 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-5 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-sm text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-800 transition-colors shadow-sm">Poprzednia</button>
              <span className="font-extrabold text-sm text-slate-700 dark:text-slate-300 bg-slate-200/50 dark:bg-slate-900/50 px-4 py-2 rounded-xl">Strona {currentPage} z {currentTotalPages}</span>
              <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === currentTotalPages} className="px-5 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-sm text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-800 transition-colors shadow-sm">Następna</button>
            </div>
          </div>
        ) : calendarView}

        {/* --- MODALE --- */}
        
        {/* MODAL: RAPORT RENTOWNOŚCI (Z PRZYCHODÓW) */}
        {showStatsModal && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] border border-white/50 dark:border-slate-700">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 rounded-t-[2rem] shrink-0">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/30"><BarChart3 className="w-6 h-6" /></div>
                  <div><h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Raport Rentowności</h2><p className="text-sm font-medium text-slate-500 dark:text-slate-400">Zestawienie przychodów i kosztów</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <select value={selectedYear} onChange={(e) => handleYearChange(e.target.value)} className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-200 outline-none shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all">
                    {availableYears.map(year => <option key={year} value={year}>Rok {year}</option>)}
                  </select>
                  <button onClick={() => setShowStatsModal(false)} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-500 dark:text-slate-400"><XCircle className="w-6 h-6" /></button>
                </div>
              </div>
              <div className="p-8 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                  <div className="bg-emerald-50/50 dark:bg-emerald-500/10 p-5 rounded-3xl border border-emerald-100 dark:border-emerald-500/20"><p className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Przychód</p><p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{currentYearData.total.income.toLocaleString('pl-PL')} zł</p></div>
                  <div className="bg-rose-50/50 dark:bg-rose-500/10 p-5 rounded-3xl border border-rose-100 dark:border-rose-500/20"><p className="text-[10px] font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-1">Koszty</p><p className="text-2xl font-black text-rose-700 dark:text-rose-300">{currentYearData.total.costs.toLocaleString('pl-PL')} zł</p></div>
                  <div className="bg-violet-50/50 dark:bg-violet-500/10 p-5 rounded-3xl border border-violet-100 dark:border-violet-500/20"><p className="text-[10px] font-extrabold text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-1">Podatek</p><p className="text-2xl font-black text-violet-700 dark:text-violet-300">{currentYearData.total.tax.toLocaleString('pl-PL')} zł</p></div>
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-5 rounded-3xl shadow-lg shadow-blue-500/30"><p className="text-[10px] font-extrabold text-blue-100 uppercase tracking-widest mb-1">Zysk Netto</p><p className="text-2xl font-black text-white">{currentYearData.total.profit.toLocaleString('pl-PL')} zł</p></div>
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white mb-5 flex items-center gap-2"><CalendarDays className="w-5 h-5 text-blue-500" /> Miesiąc po miesiącu</h3>
                <div className="border border-slate-100 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider"><tr><th className="p-4 font-extrabold">Miesiąc</th><th className="p-4 font-extrabold text-right">Przychód</th><th className="p-4 font-extrabold text-right">Koszty</th><th className="p-4 font-extrabold text-right">Podatek</th><th className="p-4 font-extrabold text-right text-blue-600 dark:text-blue-400">Zysk Netto</th></tr></thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                      {currentYearData.months.map((m, i) => (
                        <tr key={i} className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${!m.active ? 'opacity-40 bg-slate-50/30 dark:bg-slate-900/30' : ''}`}>
                          <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{monthNames[i]}</td>
                          <td className="p-4 text-right font-bold text-emerald-600 dark:text-emerald-400">{m.income > 0 ? `${m.income.toLocaleString('pl-PL')} zł` : '-'}</td>
                          <td className="p-4 text-right font-bold text-rose-500 dark:text-rose-400">{m.costs > 0 ? `${m.costs.toLocaleString('pl-PL')} zł` : '-'}</td>
                          <td className="p-4 text-right font-bold text-violet-600 dark:text-violet-400">{m.tax > 0 ? `${m.tax.toLocaleString('pl-PL')} zł` : '-'}</td>
                          <td className="p-4 text-right font-black text-slate-900 dark:text-white text-base">{m.profit !== 0 ? `${m.profit.toLocaleString('pl-PL')} zł` : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: RAPORT DZIENNY */}
        {showDailyReportModal && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-[70] animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] border border-white/50 dark:border-slate-700">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-indigo-50/50 to-blue-50/50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-t-[2rem]">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-2xl shadow-lg shadow-indigo-500/30"><Sun className="w-6 h-6" /></div>
                  <div><h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Raport Dnia</h2><p className="text-sm font-medium text-slate-500 dark:text-slate-400">Zdarzenia na dzisiaj ({dailyReport.dateStr})</p></div>
                </div>
                <button onClick={() => setShowDailyReportModal(false)} className="p-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-400 shadow-sm"><XCircle className="w-6 h-6" /></button>
              </div>
              <div className="p-8 overflow-y-auto space-y-10 bg-slate-50/30 dark:bg-slate-900/30">
                <section>
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2"><LogIn className="w-6 h-6 text-emerald-500 bg-emerald-100 dark:bg-emerald-500/20 p-1 rounded-lg" /> Przyjazdy dzisiaj ({dailyReport.arrivals.length})</h3>
                  {dailyReport.arrivals.length === 0 ? <p className="text-sm font-medium text-slate-500 italic bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">Brak zaplanowanych przyjazdów.</p> : dailyReport.arrivals.map(r => (
                    <div key={r.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 border-l-4 border-l-emerald-500 shadow-[0_4px_20px_rgb(0,0,0,0.03)] mb-4 flex justify-between items-center">
                      <div><p className="font-bold text-slate-800 dark:text-slate-200 text-lg">{r.guest}</p><p className="text-sm font-medium text-slate-500 mt-1">{r.propNameStr}</p></div>
                      <div className="text-right flex flex-col gap-1.5 items-end">
                         <span className={`text-[10px] font-bold px-3 py-1.5 rounded-xl ${r.isPaid ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'}`}>{r.isPaid ? 'Opłacone' : 'Do opłacenia'}</span>
                         {Number(r.advancePayment) > 0 && !r.isPaid && <span className={`text-[10px] font-bold px-3 py-1.5 rounded-xl ${r.isAdvancePaid ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>{r.isAdvancePaid ? 'Zaliczka wpłynęła' : 'Brak zaliczki'}</span>}
                      </div>
                    </div>
                  ))}
                </section>
                <section>
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2"><LogOut className="w-6 h-6 text-rose-500 bg-rose-100 dark:bg-rose-500/20 p-1 rounded-lg" /> Wyjazdy dzisiaj ({dailyReport.departures.length})</h3>
                  {dailyReport.departures.length === 0 ? <p className="text-sm font-medium text-slate-500 italic bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">Brak zaplanowanych wyjazdów.</p> : dailyReport.departures.map(r => (
                    <div key={r.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 border-l-4 border-l-rose-500 shadow-[0_4px_20px_rgb(0,0,0,0.03)] mb-4 flex justify-between items-center">
                      <div><p className="font-bold text-slate-800 dark:text-slate-200 text-lg">{r.guest}</p><p className="text-sm font-medium text-slate-500 mt-1">{r.propNameStr}</p></div>
                      <span className="text-[10px] font-extrabold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase tracking-wide">Zaplanuj sprzątanie</span>
                    </div>
                  ))}
                </section>
                <section>
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2"><CheckSquare className="w-6 h-6 text-blue-500 bg-blue-100 dark:bg-blue-500/20 p-1 rounded-lg" /> Zadania na dziś ({dailyReport.tasks.length})</h3>
                  {dailyReport.tasks.length === 0 ? <p className="text-sm font-medium text-slate-500 italic bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">Wszystko gotowe! Możesz odpocząć. ☕</p> : dailyReport.tasks.map(t => (
                    <div key={`${t.id}-${t.taskId}`} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 border-l-4 border-l-blue-500 shadow-[0_4px_20px_rgb(0,0,0,0.03)] mb-4 flex justify-between items-center">
                      <div><p className="font-bold text-slate-800 dark:text-slate-200">{t.text}</p><p className="text-sm font-medium text-slate-500 mt-1">{t.guest} • {t.property}</p></div>
                      <button onClick={() => completeTask(t.id, t.taskId)} className="text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 p-3 rounded-xl transition-all shadow-sm border border-transparent hover:border-emerald-100 dark:hover:border-emerald-500/30" title="Wykonane"><CheckCircle className="w-6 h-6" /></button>
                    </div>
                  ))}
                </section>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: USTAWIENIA */}
        {showSettingsModal && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-3xl p-8 overflow-y-auto max-h-[90vh] border border-white/50 dark:border-slate-700">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl"><Settings className="w-6 h-6" /></div>
                  Ustawienia Systemu
                </h2>
                <button onClick={() => setShowSettingsModal(false)} className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-400"><XCircle className="w-6 h-6" /></button>
              </div>

              <div className="flex flex-wrap bg-slate-100/80 dark:bg-slate-800 p-1.5 rounded-2xl mb-8 gap-1 shadow-inner">
                {['sync', 'properties', 'sources', 'categories', 'tax', 'reminders'].map(tab => (
                  <button type="button" key={tab} onClick={() => setSettingsTab(tab)} className={`px-4 py-2.5 text-xs uppercase tracking-wider font-extrabold rounded-xl transition-all flex-1 text-center ${settingsTab === tab ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}>
                    {tab === 'sync' ? 'Integracje' : tab === 'properties' ? 'Obiekty' : tab === 'sources' ? 'Źródła' : tab === 'categories' ? 'Kategorie' : tab === 'tax' ? 'Podatki' : 'Zadania'}
                  </button>
                ))}
              </div>
              
              {settingsTab === 'sync' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="bg-blue-50/50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-5 rounded-3xl text-sm font-medium text-blue-900 dark:text-blue-300 leading-relaxed shadow-sm">
                    Wklej linki iCal z Bookingu i Airbnb dla swoich obiektów, aby móc je automatycznie synchronizować na głównym ekranie.
                  </div>
                  {properties.map(p => (
                    <div key={p.name} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                      <h4 className="font-extrabold text-slate-900 dark:text-white mb-4 text-lg flex items-center gap-2"><Building className="w-5 h-5 text-blue-500"/> {p.name}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                           <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Link iCal Booking.com</label>
                           <input value={editingSyncLinks[p.name]?.booking || ''} onChange={e => setEditingSyncLinks(prev => ({...prev, [p.name]: {...(prev[p.name] || {}), booking: e.target.value}}))} className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none placeholder-slate-400 dark:placeholder-slate-600" placeholder="https://admin.booking.com/..." />
                        </div>
                        <div>
                           <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Link iCal Airbnb</label>
                           <input value={editingSyncLinks[p.name]?.airbnb || ''} onChange={e => setEditingSyncLinks(prev => ({...prev, [p.name]: {...(prev[p.name] || {}), airbnb: e.target.value}}))} className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none placeholder-slate-400 dark:placeholder-slate-600" placeholder="https://www.airbnb.pl/..." />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {settingsTab === 'properties' && (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                  {editingProperties.map((prop, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                      <div className={`w-10 h-10 rounded-xl shadow-md flex items-center justify-center text-white ${propColors[prop.color || 'blue'].bg}`}><Building className="w-5 h-5"/></div>
                      <input value={prop.name} onChange={(e) => updateProperty(idx, { ...prop, name: e.target.value })} className="flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-800 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500 outline-none transition-all" />
                      <button type="button" onClick={() => removeProperty(idx)} className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  ))}
                  <form onSubmit={handleAddProperty} className="flex flex-col gap-4 mt-6 bg-slate-50/50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 border-dashed">
                    <div className="flex items-center gap-3">
                       <input value={newPropertyName} onChange={(e) => setNewPropertyName(e.target.value)} className="flex-1 p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm text-slate-800 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" placeholder="Nazwa nowego obiektu..." />
                       <button type="submit" disabled={!newPropertyName.trim()} className="px-6 py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"><Plus className="w-5 h-5" /></button>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                       <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mr-2">Kolor:</span>
                       {availableColors.map(c => (
                         <button type="button" key={c} onClick={() => setNewPropertyColor(c)} className={`w-8 h-8 rounded-full shadow-sm transition-all ${propColors[c].bg} ${newPropertyColor === c ? 'ring-4 ring-offset-2 ring-slate-800 dark:ring-slate-300 scale-110' : 'opacity-40 hover:opacity-100'}`} />
                       ))}
                    </div>
                  </form>
                </div>
              )}
              {settingsTab === 'sources' && (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                  {editingSources.map((src, idx) => (<div key={idx} className="flex gap-4 items-center bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-[0_4px_20px_rgb(0,0,0,0.03)]"><div className="p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-400 rounded-xl"><Globe className="w-5 h-5"/></div><input value={src} onChange={(e) => updateSource(idx, e.target.value)} className="flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl text-sm font-bold focus:bg-white dark:focus:bg-slate-800 outline-none" /><button type="button" onClick={() => removeSource(idx)} className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl"><Trash2 className="w-5 h-5" /></button></div>))}
                  <form onSubmit={handleAddSource} className="flex items-center gap-3 mt-6">
                    <input value={newSourceName} onChange={(e) => setNewSourceName(e.target.value)} className="flex-1 p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl font-bold text-sm focus:bg-white dark:focus:bg-slate-800 outline-none" placeholder="Nowe źródło (np. Booking)..." />
                    <button type="submit" disabled={!newSourceName.trim()} className="px-6 py-3.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-200 dark:hover:bg-blue-500/40 disabled:opacity-50"><Plus className="w-5 h-5" /></button>
                  </form>
                </div>
              )}
              {settingsTab === 'categories' && (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                  {editingCategories.map((cat, idx) => (<div key={idx} className="flex gap-4 items-center bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-[0_4px_20px_rgb(0,0,0,0.03)]"><div className="p-2.5 bg-slate-50 dark:bg-slate-900 text-slate-400 rounded-xl"><Tags className="w-5 h-5"/></div><input value={cat} onChange={(e) => updateCategory(idx, e.target.value)} className="flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl text-sm font-bold focus:bg-white dark:focus:bg-slate-800 outline-none" /><button type="button" onClick={() => removeCategory(idx)} className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl"><Trash2 className="w-5 h-5" /></button></div>))}
                  <form onSubmit={handleAddCategory} className="flex items-center gap-3 mt-6">
                    <input value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="flex-1 p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl font-bold text-sm focus:bg-white dark:focus:bg-slate-800 outline-none" placeholder="Nowa kategoria kosztów..." />
                    <button type="submit" disabled={!newCategoryName.trim()} className="px-6 py-3.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-200 dark:hover:bg-blue-500/40 disabled:opacity-50"><Plus className="w-5 h-5" /></button>
                  </form>
                </div>
              )}
              {settingsTab === 'tax' && (
                 <div className="space-y-5 bg-slate-50/50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 animate-in slide-in-from-right-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer shadow-sm">
                        <input type="radio" checked={editingTaxSettings.taxForm === 'lump_sum'} onChange={() => setEditingTaxSettings({...editingTaxSettings, taxForm: 'lump_sum'})} className="w-5 h-5 text-blue-600 focus:ring-blue-500 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-600"/> 
                        <span className="font-bold text-slate-800 dark:text-slate-200">Ryczałt</span>
                      </label>
                      <label className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 cursor-pointer shadow-sm">
                        <input type="radio" checked={editingTaxSettings.taxForm === 'general'} onChange={() => setEditingTaxSettings({...editingTaxSettings, taxForm: 'general'})} className="w-5 h-5 text-blue-600 focus:ring-blue-500 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-600"/> 
                        <span className="font-bold text-slate-800 dark:text-slate-200">Zasady ogólne (Skala)</span>
                      </label>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                      <label className="flex items-center gap-4 cursor-pointer">
                        <input type="checkbox" checked={editingTaxSettings.isVatPayer} onChange={e => setEditingTaxSettings({...editingTaxSettings, isVatPayer: e.target.checked})} className="w-5 h-5 text-blue-600 focus:ring-blue-500 rounded bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-600"/> 
                        <span className="font-bold text-slate-800 dark:text-slate-200">Jestem czynnym płatnikiem VAT (Podatek liczony od kwoty Netto)</span>
                      </label>
                      <label className="flex items-center gap-4 cursor-pointer">
                        <input type="checkbox" checked={editingTaxSettings.includeZusInCosts} onChange={e => setEditingTaxSettings({...editingTaxSettings, includeZusInCosts: e.target.checked})} className="w-5 h-5 text-blue-600 focus:ring-blue-500 rounded bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-600"/> 
                        <span className="font-bold text-slate-800 dark:text-slate-200">Uwzględniaj składki ZUS w kosztach obniżających podatek</span>
                      </label>
                    </div>

                    {editingTaxSettings.taxForm === 'general' && (
                      <div className="bg-blue-50 dark:bg-blue-500/10 p-5 rounded-2xl border border-blue-200 dark:border-blue-500/30 space-y-4">
                        <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-2">Ustawienia Skali Podatkowej</h4>
                        <div>
                          <label className="block text-[10px] font-extrabold text-blue-800 dark:text-blue-400 uppercase tracking-widest mb-2">Kwota Wolna od Podatku (rocznie)</label>
                          <input type="number" value={editingTaxSettings.taxFreeAmount} onChange={e => setEditingTaxSettings({...editingTaxSettings, taxFreeAmount: Number(e.target.value)})} className="w-full p-3 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-500/50 rounded-xl font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-blue-500/20 transition-all" />
                        </div>
                      </div>
                    )}

                    {editingTaxSettings.taxForm === 'lump_sum' && (
                      <div className="bg-amber-50 dark:bg-amber-500/10 p-5 rounded-2xl border border-amber-200 dark:border-amber-500/30 space-y-4">
                         <h4 className="font-bold text-amber-900 dark:text-amber-300 mb-2">Ustawienia Ryczałtu</h4>
                         <label className="flex items-center gap-4 cursor-pointer">
                          <input type="checkbox" checked={editingTaxSettings.autoThreshold} onChange={e => setEditingTaxSettings({...editingTaxSettings, autoThreshold: e.target.checked})} className="w-5 h-5 text-amber-600 focus:ring-amber-500 rounded bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-600"/> 
                          <span className="font-bold text-amber-900 dark:text-amber-200 text-sm">Automatyczny próg (8.5% do 100k, 12.5% powyżej)</span>
                        </label>
                        {!editingTaxSettings.autoThreshold && (
                          <div>
                            <label className="block text-[10px] font-extrabold text-amber-800 dark:text-amber-400 uppercase tracking-widest mb-2 mt-4">Stała Stawka Ryczałtu (%)</label>
                            <input type="number" step="0.1" value={editingTaxSettings.rate} onChange={e => setEditingTaxSettings({...editingTaxSettings, rate: Number(e.target.value)})} className="w-full p-3 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-500/50 rounded-xl font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-amber-500/20 transition-all" />
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Składka ZUS Zdrowotna (Miesięcznie)</label>
                        <input type="number" value={editingTaxSettings.zusHealth} onChange={e => setEditingTaxSettings({...editingTaxSettings, zusHealth: Number(e.target.value)})} className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-slate-500/10 transition-all" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Składka ZUS Społeczna (Miesięcznie)</label>
                        <input type="number" value={editingTaxSettings.zusSocial} onChange={e => setEditingTaxSettings({...editingTaxSettings, zusSocial: Number(e.target.value)})} className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-slate-500/10 transition-all" />
                      </div>
                    </div>
                 </div>
              )}
              {settingsTab === 'reminders' && (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                  {editingTemplates.map((t, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-[0_4px_20px_rgb(0,0,0,0.03)] items-center">
                      <div className="col-span-12 md:col-span-3">
                         <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 ml-1">Krótka Nazwa</label>
                         <input value={t.shortName} onChange={(e) => updateTemplate(idx, 'shortName', e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl text-sm font-bold focus:bg-white dark:focus:bg-slate-800 outline-none" placeholder="np. Kod" />
                      </div>
                      <div className="col-span-12 md:col-span-4">
                         <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 ml-1">Pełna treść (np. na liście)</label>
                         <input value={t.text} onChange={(e) => updateTemplate(idx, 'text', e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl text-sm font-medium focus:bg-white dark:focus:bg-slate-800 outline-none" placeholder="Wyślij kod do drzwi" />
                      </div>
                      <div className="col-span-12 md:col-span-2">
                         <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 ml-1">Dni przed</label>
                         <input type="number" value={t.daysBefore} onChange={(e) => updateTemplate(idx, 'daysBefore', Number(e.target.value))} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl text-sm font-bold focus:bg-white dark:focus:bg-slate-800 outline-none text-center" title="Liczba dni przed przyjazdem" />
                      </div>
                      <div className="col-span-12 md:col-span-2">
                         <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1 ml-1">Ikona</label>
                         <select value={t.icon || 'Bell'} onChange={(e) => updateTemplate(idx, 'icon', e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-xl text-sm font-bold focus:bg-white dark:focus:bg-slate-800 outline-none cursor-pointer">
                           <option value="Bell">Dzwonek</option>
                           <option value="Mail">Mail</option>
                           <option value="Key">Klucz</option>
                           <option value="MessageSquare">Wiadomość</option>
                           <option value="Phone">Telefon</option>
                           <option value="CheckSquare">Zadanie</option>
                         </select>
                      </div>
                      <div className="col-span-12 md:col-span-1 flex justify-end mt-4 md:mt-0">
                        <button type="button" onClick={() => removeTemplate(idx)} className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={addTemplate} className="w-full py-5 mt-4 border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 font-extrabold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-400 transition-colors flex justify-center items-center gap-2"><Plus className="w-5 h-5" /> Dodaj przypomnienie</button>
                </div>
              )}

              <div className="flex gap-4 pt-8 mt-8 border-t border-slate-100 dark:border-slate-700">
                <button type="button" onClick={() => setShowSettingsModal(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Anuluj</button>
                <button type="button" onClick={saveSettings} className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30 transition-all">Zapisz Ustawienia</button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: DODAWANIA / EDYCJI */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-2xl p-8 overflow-y-auto max-h-[90vh] border border-white/50 dark:border-slate-700">
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
                   <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl"><Edit className="w-6 h-6" /></div>
                   {editingId ? 'Edytuj wpis' : 'Nowy wpis'}
                 </h2>
                 <button onClick={handleCloseModal} className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-slate-400"><XCircle className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleAddRental} className="space-y-5">
                
                <div className="flex gap-1 bg-slate-100/80 dark:bg-slate-800 p-1.5 rounded-2xl mb-6 shadow-inner">
                  <button type="button" onClick={() => setNewRental({...newRental, type:'booking'})} className={`flex-1 py-3 text-xs uppercase tracking-wider font-extrabold rounded-xl transition-all ${newRental.type === 'booking' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}>Rezerwacja</button>
                  <button type="button" onClick={() => setNewRental({...newRental, type:'utility'})} className={`flex-1 py-3 text-xs uppercase tracking-wider font-extrabold rounded-xl transition-all ${newRental.type === 'utility' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}>Koszty</button>
                  <button type="button" onClick={() => setNewRental({...newRental, type:'reminder'})} className={`flex-1 py-3 text-xs uppercase tracking-wider font-extrabold rounded-xl transition-all ${newRental.type === 'reminder' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}`}>Zadanie</button>
                </div>
                
                {newRental.type === 'booking' ? (
                  <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 ml-1">Wybierz Obiekt</label>
                      <select value={newRental.property} onChange={e => handleRentalChange('property', e.target.value)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer" required>
                        {properties.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 ml-1">Imię i Nazwisko</label>
                        <input required placeholder="np. Jan Kowalski" value={newRental.guest} onChange={e => handleRentalChange('guest', e.target.value)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder-slate-400 dark:placeholder-slate-500" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 ml-1">Źródło Rezerwacji</label>
                        <select value={newRental.source} onChange={e => handleRentalChange('source', e.target.value)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer" required>
                          {sources.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 ml-1">Adres e-mail (Opcjonalnie)</label>
                        <input type="email" placeholder="jan@example.com" value={newRental.email} onChange={e => handleRentalChange('email', e.target.value)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder-slate-400 dark:placeholder-slate-500" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 ml-1">Telefon (Opcjonalnie)</label>
                        <input type="tel" placeholder="+48 000 000 000" value={newRental.phone} onChange={e => handleRentalChange('phone', e.target.value)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder-slate-400 dark:placeholder-slate-500" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 ml-1">Prywatna notatka o gościu</label>
                      <textarea placeholder="np. Gość preferuje cichy pokój, ustalenia cenowe..." value={newRental.guestNote || ''} onChange={e => handleRentalChange('guestNote', e.target.value)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all resize-none placeholder-slate-400 dark:placeholder-slate-500" rows="2" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 ml-1">Data przyjazdu</label>
                        <input required type="date" value={newRental.date} onChange={e => handleRentalChange('date', e.target.value)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 ml-1">Data wyjazdu</label>
                        <input required type="date" value={newRental.endDate} onChange={e => handleRentalChange('endDate', e.target.value)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" />
                      </div>
                    </div>

                    <div className="bg-slate-50/50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 mt-2">
                      <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-500"/> Rozliczenia</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2 ml-1">Przychód Brutto</label>
                          <input required type="number" placeholder="0.00" value={newRental.income} onChange={e => handleRentalChange('income', e.target.value)} className="w-full p-3 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/30 rounded-xl font-bold text-emerald-700 dark:text-emerald-400 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder-emerald-300 dark:placeholder-emerald-700" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2 ml-1">Zaliczka (Opcja)</label>
                          <input type="number" placeholder="0.00" value={newRental.advancePayment} onChange={e => handleRentalChange('advancePayment', e.target.value)} className="w-full p-3 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-500/30 rounded-xl font-bold text-indigo-700 dark:text-indigo-400 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder-indigo-300 dark:placeholder-indigo-700" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-2 ml-1">Prowizja Portalu</label>
                          <input type="number" placeholder="0.00" value={newRental.commission} onChange={e => handleRentalChange('commission', e.target.value)} className="w-full p-3 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-500/30 rounded-xl font-bold text-rose-700 dark:text-rose-400 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all placeholder-rose-300 dark:placeholder-rose-700" />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : newRental.type === 'utility' ? (
                  <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 ml-1">Wybierz Obiekt</label>
                      <select value={newRental.property} onChange={e => handleRentalChange('property', e.target.value)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" required>
                        {properties.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 ml-1">Kategoria Kosztu</label>
                        <select value={newRental.category} onChange={e => handleRentalChange('category', e.target.value)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" required>
                          {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 ml-1">Data</label>
                        <input required type="date" value={newRental.date} onChange={e => handleRentalChange('date', e.target.value)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 ml-1">Szczegóły (np. nr faktury)</label>
                      <input required placeholder="np. Faktura PGE 12/2023" value={newRental.guest} onChange={e => handleRentalChange('guest', e.target.value)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder-slate-400 dark:placeholder-slate-500" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-widest mb-2 ml-1">Kwota Kosztu</label>
                      <input required type="number" placeholder="Wpisz kwotę w zł" value={newRental.utilities} onChange={e => handleRentalChange('utilities', e.target.value)} className="w-full p-4 bg-rose-50/50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl font-black text-rose-700 dark:text-rose-400 text-lg outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all placeholder-rose-300 dark:placeholder-rose-800" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 ml-1">Data przypomnienia</label>
                      <input required type="date" value={newRental.date} onChange={e => handleRentalChange('date', e.target.value)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2 ml-1">Treść zadania</label>
                      <input required placeholder="np. Zawieźć klucze lub sprawdzić żarówki" value={newRental.text} onChange={e => handleRentalChange('text', e.target.value)} className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-800 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder-slate-400 dark:placeholder-slate-500" />
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-8 mt-8 border-t border-slate-100 dark:border-slate-700">
                  <button type="button" onClick={handleCloseModal} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Anuluj</button>
                  <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white rounded-2xl font-bold shadow-lg shadow-blue-500/30 transition-all">Zapisz Wpis</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: POTWIERDZENIE USUNIĘCIA */}
        {itemToDelete && (
          <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-sm p-8 text-center border border-white/50 dark:border-slate-700">
              <div className="w-20 h-20 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner"><Trash2 className="w-10 h-10" /></div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3">Usuwanie wpisu</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">Czy na pewno chcesz bezpowrotnie usunąć ten wpis z bazy danych? Tej akcji nie da się cofnąć.</p>
              <div className="flex gap-4">
                <button onClick={() => setItemToDelete(null)} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Anuluj</button>
                <button onClick={confirmDelete} className="flex-1 py-3.5 bg-rose-600 text-white rounded-xl font-bold shadow-lg shadow-rose-500/30 hover:bg-rose-700 transition-colors">Tak, usuń</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// --- POMOCNICZA KARTA STATYSTYK ---
function StatCard({ icon, label, value, color, sub, onClick }) {
  const styles = {
    green: { bg: "bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20", iconBg: "bg-gradient-to-br from-emerald-400 to-emerald-500 shadow-emerald-500/30", text: "text-emerald-900 dark:text-emerald-100" },
    red: { bg: "bg-rose-50/50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20", iconBg: "bg-gradient-to-br from-rose-400 to-rose-500 shadow-rose-500/30", text: "text-rose-900 dark:text-rose-100" },
    purple: { bg: "bg-violet-50/50 dark:bg-violet-500/10 border-violet-100 dark:border-violet-500/20", iconBg: "bg-gradient-to-br from-violet-400 to-violet-500 shadow-violet-500/30", text: "text-violet-900 dark:text-violet-100" },
    blue: { bg: "bg-blue-50/50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20", iconBg: "bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30", text: "text-blue-900 dark:text-blue-100" },
  };
  const style = styles[color];
  return (
    <div onClick={onClick} className={`p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 cursor-pointer border bg-white dark:bg-slate-800 border-slate-100/60 dark:border-slate-700 group`}>
      <div className="flex items-center gap-5">
        <div className={`p-4 rounded-2xl text-white shadow-lg ${style.iconBg} group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
        <div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold mb-1 uppercase tracking-widest">{label}</p>
          <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">{Number(value).toLocaleString('pl-PL')} <span className="text-lg text-slate-400 dark:text-slate-500 font-bold">zł</span></p>
          {sub && <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-bold">{sub}</p>}
        </div>
      </div>
    </div>
  );
}