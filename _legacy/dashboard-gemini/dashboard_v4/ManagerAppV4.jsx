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
import { db } from '../../firebase'; 
import { doc, setDoc, deleteDoc, updateDoc, deleteField } from 'firebase/firestore';
import { useWynajem } from '../../context/WynajemContext';

// STAŁE I LOGIKA BIZNESOWA — wydzielone do osobnych modułów
import GuideBuilder from '../../components/GuideBuilder';
import { 
  propColors, availableColors, DEFAULT_PROPERTIES, DEFAULT_SOURCES, 
  DEFAULT_CATEGORIES, DEFAULT_TEMPLATES, defaultTaxSettings, defaultHostProfile, ITEMS_PER_PAGE 
} from '../../utils/constants';
import FloatingTaskWidget from '../../components/FloatingTaskWidget';
import { calculateTaxes } from '../../utils/taxCalculator';
import ProfitabilityReportModal from '../../components/modals/ProfitabilityReportModal';
import SettingsModal from '../../components/modals/SettingsModal';
import DailyReportModal from '../../components/modals/DailyReportModal';
import AddEditEntryModal from '../../components/modals/AddEditEntryModal';
import UtilitiesTable from '../../components/views/UtilitiesTable';
import RemindersTable from '../../components/views/RemindersTable';
import MobileBookingsList from '../../components/views/MobileBookingsList';
import DesktopBookingsTable from '../../components/views/DesktopBookingsTable';
import CalendarView from '../../components/CalendarView';
import PaywallScreen from '../../components/PaywallScreen';
import DeleteConfirmModal from '../../components/modals/DeleteConfirmModal';
import StatCard from '../../components/StatCard';
import TaxSummaryPanel from '../../components/TaxSummaryPanel';
import CompleteProfileScreen from '../../components/CompleteProfileScreen';
import DashboardViewV4 from './components/DashboardViewV4';
import CalendarViewV4 from './components/CalendarViewV4';
import UtilitiesTableV4 from './components/UtilitiesTableV4';
import RemindersTableV4 from './components/RemindersTableV4';
import GuideBuilderV4 from './components/GuideBuilderV4';
import TaxSummaryPanelV4 from './components/TaxSummaryPanelV4';

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
    const numericFields = ['income', 'advancePayment', 'commission', 'tax', 'vat', 'utilities'];
    numericFields.forEach(field => {
      if (entry[field] === '' || entry[field] === null || entry[field] === undefined) {
        // TODO: PRZED LAUNCHEM APKI
        entry[field] = deleteField();
      } else if (entry[field] !== undefined) {
        const parsed = Number(String(entry[field]).replace(',', '.'));
        entry[field] = isNaN(parsed) ? 0 : parsed;
      }
    });
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
    <div className="font-sans text-[#17150F] bg-[#F3EFE5] min-h-screen">
      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', height: '100vh' }}>
        {/* SIDEBAR */}
        <div style={{ background: '#17150F', color: '#8C8576', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', fontWeight: 800, fontSize: '19px', letterSpacing: '-.02em', color: '#F3EFE5', padding: '22px 22px 24px' }}>
            Wynajem<span className="mono" style={{ fontWeight: 500, fontSize: '12px', background: '#D9492B', color: '#fff', padding: '2px 5px', marginLeft: '3px', letterSpacing: '.05em' }}>PRO</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div onClick={() => changeTab('bookings')} style={mainTab === 'bookings' ? { display: 'flex', alignItems: 'center', gap: '13px', padding: '11px 22px', cursor: 'pointer', fontSize: '14px', borderLeft: '2px solid #D9492B', color: '#F3EFE5', backgroundColor: 'rgba(255,255,255,.05)', fontWeight: 600 } : { display: 'flex', alignItems: 'center', gap: '13px', padding: '11px 22px', cursor: 'pointer', fontSize: '14px', borderLeft: '2px solid transparent', color: '#8C8576', backgroundColor: 'transparent', fontWeight: 500 }}>
              <span className="mono" style={{ fontSize: '11px', opacity: .6 }}>01</span><span>Pulpit</span>
            </div>
            <div onClick={() => changeTab('calendar')} style={mainTab === 'calendar' ? { display: 'flex', alignItems: 'center', gap: '13px', padding: '11px 22px', cursor: 'pointer', fontSize: '14px', borderLeft: '2px solid #D9492B', color: '#F3EFE5', backgroundColor: 'rgba(255,255,255,.05)', fontWeight: 600 } : { display: 'flex', alignItems: 'center', gap: '13px', padding: '11px 22px', cursor: 'pointer', fontSize: '14px', borderLeft: '2px solid transparent', color: '#8C8576', backgroundColor: 'transparent', fontWeight: 500 }}>
              <span className="mono" style={{ fontSize: '11px', opacity: .6 }}>02</span><span>Kalendarz</span>
            </div>
            <div onClick={() => changeTab('utilities')} style={mainTab === 'utilities' ? { display: 'flex', alignItems: 'center', gap: '13px', padding: '11px 22px', cursor: 'pointer', fontSize: '14px', borderLeft: '2px solid #D9492B', color: '#F3EFE5', backgroundColor: 'rgba(255,255,255,.05)', fontWeight: 600 } : { display: 'flex', alignItems: 'center', gap: '13px', padding: '11px 22px', cursor: 'pointer', fontSize: '14px', borderLeft: '2px solid transparent', color: '#8C8576', backgroundColor: 'transparent', fontWeight: 500 }}>
              <span className="mono" style={{ fontSize: '11px', opacity: .6 }}>03</span><span>Wydatki</span>
            </div>
            <div onClick={() => changeTab('reminders')} style={mainTab === 'reminders' ? { display: 'flex', alignItems: 'center', gap: '13px', padding: '11px 22px', cursor: 'pointer', fontSize: '14px', borderLeft: '2px solid #D9492B', color: '#F3EFE5', backgroundColor: 'rgba(255,255,255,.05)', fontWeight: 600 } : { display: 'flex', alignItems: 'center', gap: '13px', padding: '11px 22px', cursor: 'pointer', fontSize: '14px', borderLeft: '2px solid transparent', color: '#8C8576', backgroundColor: 'transparent', fontWeight: 500 }}>
              <span className="mono" style={{ fontSize: '11px', opacity: .6 }}>04</span><span>Zadania</span>
            </div>
            <div onClick={() => changeTab('guides')} style={mainTab === 'guides' ? { display: 'flex', alignItems: 'center', gap: '13px', padding: '11px 22px', cursor: 'pointer', fontSize: '14px', borderLeft: '2px solid #D9492B', color: '#F3EFE5', backgroundColor: 'rgba(255,255,255,.05)', fontWeight: 600 } : { display: 'flex', alignItems: 'center', gap: '13px', padding: '11px 22px', cursor: 'pointer', fontSize: '14px', borderLeft: '2px solid transparent', color: '#8C8576', backgroundColor: 'transparent', fontWeight: 500 }}>
              <span className="mono" style={{ fontSize: '11px', opacity: .6 }}>05</span><span>Przewodniki</span>
            </div>
            <div onClick={() => changeTab('taxes')} style={mainTab === 'taxes' ? { display: 'flex', alignItems: 'center', gap: '13px', padding: '11px 22px', cursor: 'pointer', fontSize: '14px', borderLeft: '2px solid #D9492B', color: '#F3EFE5', backgroundColor: 'rgba(255,255,255,.05)', fontWeight: 600 } : { display: 'flex', alignItems: 'center', gap: '13px', padding: '11px 22px', cursor: 'pointer', fontSize: '14px', borderLeft: '2px solid transparent', color: '#8C8576', backgroundColor: 'transparent', fontWeight: 500 }}>
              <span className="mono" style={{ fontSize: '11px', opacity: .6 }}>06</span><span>Podatki</span>
            </div>
          </div>
          <div className="mono" style={{ margin: '26px 22px 12px', fontSize: '10px', letterSpacing: '.12em', color: '#4F4A3F' }}>ZARZĄDZANIE</div>
          <div style={{ padding: '0 22px', display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div onClick={openSettingsModal} style={{ display: 'flex', alignItems: 'center', gap: '9px', cursor: 'pointer' }}><Settings className="w-4 h-4" /> Ustawienia</div>
            <div onClick={handleSyncCalendars} style={{ display: 'flex', alignItems: 'center', gap: '9px', cursor: 'pointer' }}>
               <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} /> Synchronizuj {isSyncing ? '...' : ''}
            </div>
          </div>
          <div style={{ marginTop: 'auto', borderTop: '1px solid #2C2920', padding: '16px 22px', display: 'flex', alignItems: 'center', gap: '11px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '3px', background: '#D9492B', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>{hostProfile?.entityName ? hostProfile.entityName.substring(0, 2).toUpperCase() : 'JA'}</div>
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#F3EFE5' }}>{hostProfile?.entityName || 'Użytkownik'}</div>
              <div className="mono" style={{ fontSize: '10px', color: '#6B6555', letterSpacing: '.05em' }}>PRO</div>
            </div>
            <div onClick={handleLogout} style={{ marginLeft: 'auto', cursor: 'pointer', color: '#6B6555', fontSize: '18px' }} title="Wyloguj"><LogOut className="w-4 h-4" /></div>
          </div>
        </div>

        {/* MAIN CONTAINER */}
        <div data-app-main style={{ background: '#F3EFE5', overflowY: 'auto', height: '100vh' }}>
          
          {/* HEADER */}
          <div style={{ position: 'sticky', top: 0, zIndex: 10, background: '#F3EFE5', borderBottom: '1px solid #DDD5C3', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '21px', fontWeight: 800, letterSpacing: '-.02em' }}>{mainTab === 'bookings' ? 'Pulpit' : mainTab === 'calendar' ? 'Kalendarz' : mainTab === 'utilities' ? 'Wydatki' : mainTab === 'reminders' ? 'Zadania' : mainTab === 'guides' ? 'Przewodniki' : 'Podatki'}</div>
              <div className="mono" style={{ fontSize: '11px', letterSpacing: '.08em', textTransform: 'uppercase', color: '#A0987F', marginTop: '2px' }}>Rok {selectedYear}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', background: '#FBFAF6', border: '1px solid #DDD5C3', borderRadius: '3px', padding: '9px 13px', width: '230px', color: '#9A917D', fontSize: '14px' }}>
                <Search className="w-4 h-4" />
                <input type="text" placeholder="Szukaj..." value={searchQuery} onChange={(e) => changeSearchQuery(e.target.value)} style={{ background: 'transparent', outline: 'none', width: '100%' }} />
                {searchQuery && <XCircle className="w-4 h-4 cursor-pointer" onClick={() => changeSearchQuery('')} />}
              </div>
              <div onClick={() => setShowDailyReportModal(true)} style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '3px', background: '#FBFAF6', border: '1px solid #DDD5C3', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3D382E', cursor: 'pointer' }}>
                <ClipboardList className="w-5 h-5" />
                {dailyReport.total > 0 && <span style={{ position: 'absolute', top: '9px', right: '10px', width: '6px', height: '6px', borderRadius: '50%', background: '#D9492B' }}></span>}
              </div>
              <button onClick={() => { setNewRental(getDefaultRentalState()); setEditingId(null); setShowAddModal(true); }} style={{ padding: '10px 16px', background: '#D9492B', color: '#fff', border: 'none', borderRadius: '3px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>+ Nowy wpis</button>
            </div>
          </div>

          <div style={{ padding: '28px 32px 60px' }}>
            {/* CONTENT */}
            {mainTab === 'bookings' && <DashboardViewV4 
              stats={stats} 
              dailyReport={dailyReport}
              rentals={rentals}
              upcomingBookings={upcomingBookings}
              goCal={() => changeTab('calendar')}
              goRes={() => changeTab('bookings')}
            />}
            {mainTab === 'calendar' && (
              <CalendarViewV4 
                calendarDate={calendarDate}
                rentals={rentals}
                properties={properties}
                onChangeMonth={changeMonth}
                onSetToday={() => setCalendarDate(new Date())}
                onEditRental={openEditModal}
              />
            )}
            {mainTab === 'utilities' && (
              <UtilitiesTableV4 
                paginatedUtilities={paginatedUtilities}
                utilitySortOrder={utilitySortOrder}
                changeUtilitySortOrder={changeUtilitySortOrder}
                openEditModal={openEditModal}
                handleDeleteClick={handleDeleteClick}
              />
            )}
            {mainTab === 'reminders' && (
              <RemindersTableV4 
                paginatedReminders={paginatedReminders}
                utilitySortOrder={utilitySortOrder}
                changeUtilitySortOrder={changeUtilitySortOrder}
                toggleStatus={toggleStatus}
                openEditModal={openEditModal}
                handleDeleteClick={handleDeleteClick}
              />
            )}
            {mainTab === 'guides' && (
              <GuideBuilderV4 
                user={user} 
                properties={properties} 
              />
            )}
            {mainTab === 'taxes' && (
              <TaxSummaryPanelV4 
                year={selectedYear}
                rentals={rentals}
                taxSettings={taxSettings}
                hostProfile={hostProfile}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* MOŻNA TU ZOSTAWIĆ STARE MODALE LUB DODAĆ NOWE, NA RAZIE ZOSTAWIAMY STARE W STYLU V3 DO CZASU REFAKTORYZACJI MODALI */}
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
  );
}