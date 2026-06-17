import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Plus, Download, Trash2, Home, DollarSign, Wallet, TrendingUp, CheckCircle, 
  XCircle, Landmark, Bell, Mail, Key, Loader2, BarChart3, CalendarDays, List, 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Edit, ArrowDown, ArrowUp, 
  Settings, MessageSquare, CheckSquare, Phone, Building, Globe, Percent, Tags, 
  Search, ClipboardList, LogIn, LogOut, Sun, RefreshCw, Moon, Lock, CreditCard, ExternalLink,
  AlertTriangle, Clock, BookOpen, Copy
} from 'lucide-react';
import toast from 'react-hot-toast';

// IMPORTUJEMY FIREBASE ORAZ STRIPE
import { db } from './firebase'; 
import { doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useWynajem } from './context/WynajemContext';

// STAŁE I LOGIKA BIZNESOWA — wydzielone do osobnych modułów
import GuideBuilder from './components/GuideBuilder';
import { 
  propColors, availableColors, DEFAULT_PROPERTIES, DEFAULT_SOURCES, 
  DEFAULT_CATEGORIES, DEFAULT_TEMPLATES, defaultTaxSettings, defaultHostProfile, ITEMS_PER_PAGE 
} from './utils/constants';
import FloatingTaskWidget from './components/FloatingTaskWidget';
import { calculateTaxes } from './utils/taxCalculator';
import ProfitabilityReportModal from './components/modals/ProfitabilityReportModal';
import SettingsModal from './components/modals/SettingsModal';
import DailyReportModal from './components/modals/DailyReportModal';
import AddEditEntryModal from './components/modals/AddEditEntryModal';
import UtilitiesTable from './components/views/UtilitiesTable';
import RemindersTable from './components/views/RemindersTable';
import MobileBookingsList from './components/views/MobileBookingsList';
import DesktopBookingsTable from './components/views/DesktopBookingsTable';
import CalendarView from './components/CalendarView';
import PaywallScreen from './components/PaywallScreen';
import DeleteConfirmModal from './components/modals/DeleteConfirmModal';
import StatCard from './components/StatCard';
import TaxSummaryPanel from './components/TaxSummaryPanel';
import CompleteProfileScreen from './components/CompleteProfileScreen';

// --- WSPÓLNE HELPERY ---
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

// --- GŁÓWNA APLIKACJA ---
export default function RentalManager() {
  const { 
    user, loading, rentals, 
    accountStatus, trialEndsAt, scheduledDeletionAt,
    isCheckoutLoading, isBillingPortalLoading,
    templates, properties, sources, categories, syncLinks, taxSettings, hostProfile,
    selectedYear, setSelectedYear,
    handleLogout, toggleStatus, completeTask, toggleDynamicTask,
    isAccessLocked, handleSubscribe, handleManageSubscription,
    isSyncing, handleSyncCalendars
  } = useWynajem();

  // Stany UI
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDailyReportModal, setShowDailyReportModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState('sync'); 
  const [itemToDelete, setItemToDelete] = useState(null); 
  const [searchQuery, setSearchQuery] = useState('');

  // DARK MODE STATE
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Stany Edycji i Ustawień z domyślnymi wartościami
  const [editingId, setEditingId] = useState(null);
  const [editingTemplates, setEditingTemplates] = useState([]);
  
  const [editingProperties, setEditingProperties] = useState([]);
  const [newPropertyName, setNewPropertyName] = useState('');
  const [newPropertyColor, setNewPropertyColor] = useState('blue');
  
  const [editingSources, setEditingSources] = useState([]);
  const [newSourceName, setNewSourceName] = useState('');
  
  const [editingCategories, setEditingCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const [editingSyncLinks, setEditingSyncLinks] = useState({});
  const [editingTaxSettings, setEditingTaxSettings] = useState(defaultTaxSettings);
  const [editingHostProfile, setEditingHostProfile] = useState(defaultHostProfile);

  // --- NOWY SYSTEM NAWIGACJI ---
  const [mainTab, setMainTab] = useState('bookings'); 
  const [bookingFilter, setBookingFilter] = useState('upcoming'); 
  
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [bookingSortOrder, setBookingSortOrder] = useState('upcoming'); 
  const [utilitySortOrder, setUtilitySortOrder] = useState('desc'); 
  const [currentPage, setCurrentPage] = useState(1);

  const changeTab = useCallback((tab) => { setMainTab(tab); setCurrentPage(1); }, []);
  const changeBookingFilter = useCallback((filter) => { setBookingFilter(filter); setCurrentPage(1); }, []);
  const changeBookingSortOrder = useCallback((updater) => { setBookingSortOrder(updater); setCurrentPage(1); }, []);
  const changeUtilitySortOrder = useCallback((updater) => { setUtilitySortOrder(updater); setCurrentPage(1); }, []);
  const changeSearchQuery = useCallback((val) => { setSearchQuery(val); setCurrentPage(1); }, []);

  const getDefaultRentalState = useCallback(() => ({
    type: 'booking', source: sources.length > 0 ? sources[0] : '', property: properties.length > 0 ? properties[0].name : '', 
    category: categories.length > 0 ? categories[0] : '', guest: '', email: '', phone: '', guestNote: '', text: '',
    date: new Date().toISOString().split('T')[0], endDate: '', income: '', advancePayment: '', isAdvancePaid: false, commission: '',
    utilities: '', tax: '', vat: '', isPaid: false, isCompleted: false, completedTasks: {}, syncId: ''
  }), [sources, properties, categories]);

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

  // useEffect(() => {
  //   if (!user && !loading) {
  //     navigate('/login');
  //   }
  // }, [user, loading, navigate]);
  // W protectedRoute to jest ogarniane, tu nawigacja nie jest super niezbędna


  // --- OBLICZANIE DANYCH ---
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = new Set();
    for (let i = currentYear - 2; i <= currentYear + 2; i++) {
      years.add(i.toString());
    }
    years.add(selectedYear); // Zapewnia, że wybrany rok zawsze jest dostępny
    return Array.from(years).sort((a, b) => b - a);
  }, [selectedYear]);

  const handleYearChange = useCallback((newYearStr) => {
    setSelectedYear(newYearStr);
    setCurrentPage(1);
    const newYear = parseInt(newYearStr, 10);
    const currYear = new Date().getFullYear();
    if (newYear === currYear) {
      setCalendarDate(new Date());
    } else {
      setCalendarDate(new Date(newYear, 0, 1)); 
    }
  }, [setSelectedYear]);

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
      } else if (r.type === 'reminder' && !r.isCompleted && r.date) {
        const d = new Date(r.date);
        if (!isNaN(d.getTime())) {
          d.setHours(0,0,0,0);
          const todayMidnight = new Date(); todayMidnight.setHours(0,0,0,0);
          const diffDays = Math.ceil((d - todayMidnight) / 86400000);
          if (diffDays <= 0 && diffDays >= -30) {
            tasks.push({ id: r.id, taskId: 'manual', property: 'Własne zadanie', days: diffDays, icon: <Bell className="w-5 h-5 text-purple-500" />, text: r.text || 'Brak opisu' });
          }
        }
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



  // --- AKCJE FIREBASE I FUNKCJE ---
  const handleCloseModal = useCallback(() => { setShowAddModal(false); setEditingId(null); setNewRental(getDefaultRentalState()); }, [getDefaultRentalState]);
  
  const openEditModal = useCallback((r) => { 
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
  }, []);
  
  const handleDeleteClick = useCallback((id) => { setItemToDelete(id); }, []);

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
    const { id: _id, ...entry } = newRental;
    if (entry.type === 'booking') {
      entry.income = Number(entry.income) || 0; entry.advancePayment = Number(entry.advancePayment) || 0;
      entry.commission = Number(entry.commission) || 0; entry.tax = Number(entry.tax) || 0; entry.vat = Number(entry.vat) || 0;
    } else if (entry.type === 'utility') { entry.utilities = Number(entry.utilities) || 0; }
    const docRef = editingId ? doc(db, 'users', user.uid, 'rentals', editingId) : doc(db, 'users', user.uid, 'rentals', Date.now().toString());
    
    try {
      await (editingId ? updateDoc : setDoc)(docRef, entry);
      toast.success(editingId ? 'Zaktualizowano pomyślnie!' : 'Dodano pomyślnie!');
      handleCloseModal();
    } catch (err) {
      console.error(err);
      toast.error('Wystąpił błąd podczas zapisywania');
    }
  };

  const confirmDelete = useCallback(async () => { 
    if (!user || !itemToDelete) return; 
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'rentals', itemToDelete)); 
      toast.success('Pomyślnie usunięto wpis');
    } catch (err) {
      console.error(err);
      toast.error('Błąd podczas usuwania');
    } finally {
      setItemToDelete(null); 
    }
  }, [user, itemToDelete]);




  const openSettingsModal = useCallback(() => {
    setEditingTemplates(JSON.parse(JSON.stringify(templates)));
    
    // Retrofit legacy properties lacking an id or secretToken
    const retrofittedProperties = properties.map(p => {
      const updated = { ...p };
      if (!updated.id) {
        updated.id = typeof window !== 'undefined' && window.crypto?.randomUUID 
          ? window.crypto.randomUUID() 
          : Math.random().toString(36).substring(2, 15);
      }
      if (!updated.secretToken) {
        updated.secretToken = typeof window !== 'undefined' && window.crypto?.randomUUID 
          ? window.crypto.randomUUID().replace(/-/g, '') 
          : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      }
      return updated;
    });
    setEditingProperties(retrofittedProperties); 
    setEditingSources([...sources]); 
    setEditingCategories([...categories]);
    setEditingTaxSettings(taxSettings); 
    setEditingHostProfile(hostProfile);
    setEditingSyncLinks(JSON.parse(JSON.stringify(syncLinks)));
    setSettingsTab('sync'); 
    setShowSettingsModal(true);
  }, [templates, properties, sources, categories, taxSettings, hostProfile, syncLinks]);

  const saveSettings = useCallback(async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid, 'settings', 'reminders'), { items: editingTemplates });
      await setDoc(doc(db, 'users', user.uid, 'settings', 'properties'), { items: editingProperties });
      await setDoc(doc(db, 'users', user.uid, 'settings', 'sources'), { items: editingSources });
      await setDoc(doc(db, 'users', user.uid, 'settings', 'categories'), { items: editingCategories });
      await setDoc(doc(db, 'users', user.uid, 'settings', 'tax'), editingTaxSettings);
      await setDoc(doc(db, 'users', user.uid, 'settings', 'hostProfile'), editingHostProfile);
      await setDoc(doc(db, 'users', user.uid, 'settings', 'syncLinks'), { links: editingSyncLinks });
      toast.success('Ustawienia zostały zapisane');
      setShowSettingsModal(false);
    } catch (err) {
      console.error(err);
      toast.error('Błąd podczas zapisywania ustawień');
    }
  }, [user, editingTemplates, editingProperties, editingSources, editingCategories, editingTaxSettings, editingHostProfile, editingSyncLinks]);

  const changeMonth = useCallback((offset) => {
    setCalendarDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  }, []);





  const updateProperty = (index, newValue) => { const updated = [...editingProperties]; updated[index] = newValue; setEditingProperties(updated); };
  const removeProperty = (index) => { const updated = [...editingProperties]; updated.splice(index, 1); setEditingProperties(updated); };
  const handleAddProperty = (e) => { 
    e.preventDefault();
    if (newPropertyName.trim() !== '') { 
      const secretToken = typeof window !== 'undefined' && window.crypto?.randomUUID 
        ? window.crypto.randomUUID().replace(/-/g, '') 
        : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      const id = typeof window !== 'undefined' && window.crypto?.randomUUID 
        ? window.crypto.randomUUID() 
        : Math.random().toString(36).substring(2, 15);

      setEditingProperties([...editingProperties, { 
        id, 
        name: newPropertyName.trim(), 
        color: newPropertyColor,
        secretToken 
      }]); 
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

  // --- EKRAN ŁADOWANIA ---
  if (loading) return <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-900 flex items-center justify-center"><Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-500 animate-spin" /></div>;

  // --- EKRAN BLOKADY (PAYWALL) ---
  if (isAccessLocked()) {
    return (
      <PaywallScreen
        accountStatus={accountStatus}
        scheduledDeletionAt={scheduledDeletionAt}
        onSubscribe={handleSubscribe}
        isCheckoutLoading={isCheckoutLoading}
        onManageSubscription={handleManageSubscription}
        isBillingPortalLoading={isBillingPortalLoading}
        onLogout={handleLogout}
      />
    );
  }

  // --- EKRAN UZUPEŁNIANIA PROFILU (Gdy brakuje nazwy) ---
  const isHostProfileIncomplete = !hostProfile.entityName;
  if (isHostProfileIncomplete) {
    return (
      <CompleteProfileScreen 
        user={user} 
        onComplete={() => {
          // Stan zostanie automatycznie zaktualizowany przez listenera z useFirebaseData
        }} 
      />
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
            <button onClick={() => changeTab('guides')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${mainTab === 'guides' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'}`}><BookOpen className="w-4 h-4 shrink-0" /> Przewodniki</button>
            <button onClick={() => changeTab('taxes')} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${mainTab === 'taxes' ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50'}`}><Landmark className="w-4 h-4 shrink-0" /> Podatki</button>
          </div>
        </div>

        {/* ZAWARTOŚĆ GŁÓWNA */}
        {renderMainTab !== 'calendar' && renderMainTab !== 'guides' && renderMainTab !== 'taxes' ? (
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
                <UtilitiesTable 
                  paginatedUtilities={paginatedUtilities}
                  utilitySortOrder={utilitySortOrder}
                  changeUtilitySortOrder={changeUtilitySortOrder}
                  openEditModal={openEditModal}
                  handleDeleteClick={handleDeleteClick}
                />
              ) : renderMainTab === 'reminders' ? (
                <RemindersTable 
                  paginatedReminders={paginatedReminders}
                  utilitySortOrder={utilitySortOrder}
                  changeUtilitySortOrder={changeUtilitySortOrder}
                  toggleStatus={toggleStatus}
                  openEditModal={openEditModal}
                  handleDeleteClick={handleDeleteClick}
                />
              ) : (
                <>
                  {/* ===== WIDOK MOBILNY: KARTY (md:hidden) ===== */}
                  <MobileBookingsList 
                    paginatedBookings={paginatedBookings}
                    propColors={propColors}
                    properties={properties}
                    toggleStatus={toggleStatus}
                    templates={templates}
                    toggleDynamicTask={toggleDynamicTask}
                    openEditModal={openEditModal}
                    handleDeleteClick={handleDeleteClick}
                  />

                  {/* ===== WIDOK DESKTOP: TABELA (hidden md:block) ===== */}
                  <DesktopBookingsTable 
                    paginatedBookings={paginatedBookings}
                    propColors={propColors}
                    properties={properties}
                    bookingSortOrder={bookingSortOrder}
                    changeBookingSortOrder={changeBookingSortOrder}
                    taxSettings={taxSettings}
                    toggleStatus={toggleStatus}
                    templates={templates}
                    toggleDynamicTask={toggleDynamicTask}
                    openEditModal={openEditModal}
                    handleDeleteClick={handleDeleteClick}
                  />
                </>
              )}
            </div>
            
            {/* PAGINACJA */}
            <div className="flex justify-center items-center gap-4 p-5 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-5 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-sm text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-800 transition-colors shadow-sm">Poprzednia</button>
              <span className="font-extrabold text-sm text-slate-700 dark:text-slate-300 bg-slate-200/50 dark:bg-slate-900/50 px-4 py-2 rounded-xl">Strona {currentPage} z {currentTotalPages}</span>
              <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === currentTotalPages} className="px-5 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 font-bold text-sm text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:hover:bg-white dark:disabled:hover:bg-slate-800 transition-colors shadow-sm">Następna</button>
            </div>
          </div>
        ) : renderMainTab === 'guides' ? (
          <GuideBuilder user={user} properties={properties} />
        ) : renderMainTab === 'taxes' ? (
          <div className="p-8">
            <TaxSummaryPanel 
              year={selectedYear} 
              rentals={rentals} 
              taxSettings={taxSettings} 
              hostProfile={hostProfile}
            />
          </div>
        ) : <CalendarView 
          calendarDate={calendarDate} 
          rentals={rentals} 
          properties={properties} 
          onChangeMonth={changeMonth} 
          onSetToday={() => setCalendarDate(new Date())} 
          onEditRental={openEditModal} 
        />}

        {/* --- MODALE --- */}
        
        {/* MODAL: RAPORT RENTOWNOŚCI (Z PRZYCHODÓW) */}
        <ProfitabilityReportModal 
          showStatsModal={showStatsModal}
          setShowStatsModal={setShowStatsModal}
          selectedYear={selectedYear}
          handleYearChange={handleYearChange}
          availableYears={availableYears}
          currentYearData={currentYearData}
        />

        {/* MODAL: RAPORT DZIENNY */}
        <DailyReportModal 
          showDailyReportModal={showDailyReportModal}
          setShowDailyReportModal={setShowDailyReportModal}
          dailyReport={dailyReport}
          completeTask={completeTask}
        />

        {/* MODAL: USTAWIENIA */}
        <SettingsModal 
          showSettingsModal={showSettingsModal}
          setShowSettingsModal={setShowSettingsModal}
          settingsTab={settingsTab}
          setSettingsTab={setSettingsTab}
          properties={properties}
          editingSyncLinks={editingSyncLinks}
          setEditingSyncLinks={setEditingSyncLinks}
          user={user}
          editingHostProfile={editingHostProfile}
          setEditingHostProfile={setEditingHostProfile}
          editingProperties={editingProperties}
          updateProperty={updateProperty}
          removeProperty={removeProperty}
          handleAddProperty={handleAddProperty}
          newPropertyName={newPropertyName}
          setNewPropertyName={setNewPropertyName}
          availableColors={availableColors}
          newPropertyColor={newPropertyColor}
          setNewPropertyColor={setNewPropertyColor}
          propColors={propColors}
          editingSources={editingSources}
          updateSource={updateSource}
          removeSource={removeSource}
          handleAddSource={handleAddSource}
          newSourceName={newSourceName}
          setNewSourceName={setNewSourceName}
          editingCategories={editingCategories}
          updateCategory={updateCategory}
          removeCategory={removeCategory}
          handleAddCategory={handleAddCategory}
          newCategoryName={newCategoryName}
          setNewCategoryName={setNewCategoryName}
          editingTaxSettings={editingTaxSettings}
          setEditingTaxSettings={setEditingTaxSettings}
          editingTemplates={editingTemplates}
          updateTemplate={updateTemplate}
          removeTemplate={removeTemplate}
          addTemplate={addTemplate}
          accountStatus={accountStatus}
          trialEndsAt={trialEndsAt}
          handleManageSubscription={handleManageSubscription}
          isBillingPortalLoading={isBillingPortalLoading}
          saveSettings={saveSettings}
        />

        {/* MODAL: DODAWANIA / EDYCJI */}
        <AddEditEntryModal 
          showAddModal={showAddModal}
          handleCloseModal={handleCloseModal}
          handleAddRental={handleAddRental}
          editingId={editingId}
          newRental={newRental}
          setNewRental={setNewRental}
          handleRentalChange={handleRentalChange}
          properties={properties}
          sources={sources}
          categories={categories}
        />

        {/* MODAL: POTWIERDZENIE USUNIĘCIA */}
        {itemToDelete && (
          <DeleteConfirmModal 
            onCancel={() => setItemToDelete(null)} 
            onConfirm={confirmDelete} 
          />
        )}

        <FloatingTaskWidget tasks={dailyReport.tasks} />
      </div>
    </div>
  );
}