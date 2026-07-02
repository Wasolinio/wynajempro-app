import React, { useState, useMemo, useCallback } from 'react';
import {
  LayoutDashboard, CalendarDays, Building2, List, BarChart3, BookOpen, LineChart, FileSignature,
  Search, Bell, Plus, Settings, Power, RefreshCw, ChevronLeft, ChevronRight,
  Mail, Key, MessageSquare, Phone, CheckSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { db } from '../../firebase';
import { doc, setDoc, deleteDoc, updateDoc, deleteField } from 'firebase/firestore';
import { useWynajem } from '../../context/WynajemContext';

import {
  propColors, availableColors, defaultTaxSettings, defaultHostProfile, ITEMS_PER_PAGE,
} from '../../utils/constants';
import { calculateTaxes } from '../../utils/taxCalculator';

// Modale w stylu V4 (własne)
import ProfitabilityReportModal from './modals/ProfitabilityReportModal';
import DailyReportModal from './modals/DailyReportModal';
import AddEditEntryModal from './modals/AddEditEntryModal';
import DeleteConfirmModal from './modals/DeleteConfirmModal';
import SettingsModal from './modals/SettingsModal';
import PaywallScreen from '../../components/PaywallScreen';
import CompleteProfileScreen from '../../components/CompleteProfileScreen';
import FloatingTaskWidget from '../../components/FloatingTaskWidget';

import { DASHBOARD_CSS } from './styles';
import PulpitView from './views/PulpitView';
import BookingsView from './views/BookingsView';
import CalendarView from './views/CalendarView';
import ObjectsView from './views/ObjectsView';
import FinanceView from './views/FinanceView';
import BookingDetailView from './views/BookingDetailView';
import AnalyticsView from './views/AnalyticsView';
import ContractGeneratorView from './views/ContractGeneratorView';
import GuideBuilder from './GuideBuilder';

const getIconComponent = (name) => {
  switch (name) {
    case 'Mail': return <Mail />;
    case 'Key': return <Key />;
    case 'MessageSquare': return <MessageSquare />;
    case 'Phone': return <Phone />;
    case 'CheckSquare': return <CheckSquare />;
    case 'Settings': return <Settings />;
    default: return <Bell />;
  }
};

const NAV = [
  { key: 'pulpit', num: '01', label: 'Pulpit', icon: LayoutDashboard },
  { key: 'calendar', num: '02', label: 'Kalendarz', icon: CalendarDays },
  { key: 'objects', num: '03', label: 'Obiekty', icon: Building2 },
  { key: 'bookings', num: '04', label: 'Rezerwacje', icon: List },
  { key: 'finance', num: '05', label: 'Finanse', icon: BarChart3 },
  { key: 'analytics', num: '06', label: 'Analityka', icon: LineChart },
  { key: 'guides', num: '07', label: 'Przewodniki', icon: BookOpen },
  { key: 'contracts', num: '08', label: 'Generator umów', icon: FileSignature },
];

const todaySubtitle = () => {
  const s = new Date().toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return s.toUpperCase();
};
const VIEW_META = {
  pulpit: { title: 'Pulpit', sub: todaySubtitle() },
  calendar: { title: 'Kalendarz', sub: 'Rezerwacje wszystkich obiektów' },
  objects: { title: 'Obiekty', sub: 'Twoje miejsca na wynajem' },
  bookings: { title: 'Rezerwacje', sub: 'Wszystkie rezerwacje' },
  finance: { title: 'Finanse', sub: 'Przychody, koszty i wypłaty' },
  analytics: { title: 'Analityka', sub: 'Statystyki: miesiąc · kwartał · półrocze · rok' },
  guides: { title: 'Przewodniki', sub: 'Cyfrowe informatory dla gości' },
  contracts: { title: 'Generator umów', sub: 'Umowy najmu z danych rezerwacji' },
};

export default function ManagerApp() {
  const {
    user, loading, rentals,
    accountStatus, trialEndsAt, scheduledDeletionAt,
    isCheckoutLoading, isBillingPortalLoading,
    templates, properties, sources, categories, syncLinks, taxSettings, hostProfile,
    selectedYear, setSelectedYear,
    handleLogout, toggleStatus, completeTask, toggleDynamicTask,
    isAccessLocked, handleSubscribe, handleManageSubscription,
    isSyncing, handleSyncCalendars,
  } = useWynajem();

  // ── UI ──
  const [activeView, setActiveView] = useState('pulpit');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDailyReportModal, setShowDailyReportModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState('sync');
  const [itemToDelete, setItemToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [bookingFilter, setBookingFilter] = useState('upcoming');
  const [bookingSortOrder, setBookingSortOrder] = useState('upcoming');
  const [utilitySortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [calendarDate, setCalendarDate] = useState(new Date());

  const changeMonth = useCallback((offset) => {
    setCalendarDate((prev) => { const d = new Date(prev); d.setMonth(d.getMonth() + offset); return d; });
  }, []);

  // Stany edycji ustawień
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

  const [detailId, setDetailId] = useState(null);
  const openBookingDetail = useCallback((r) => { setDetailId(r.id); }, []);

  const changeView = useCallback((v) => { setActiveView(v); setCurrentPage(1); setDetailId(null); }, []);
  const changeBookingFilter = useCallback((f) => { setBookingFilter(f); setCurrentPage(1); }, []);
  const changeBookingSortOrder = useCallback((u) => { setBookingSortOrder(u); setCurrentPage(1); }, []);
  const changeSearchQuery = useCallback((val) => { setSearchQuery(val); setCurrentPage(1); }, []);

  const getDefaultRentalState = useCallback(() => ({
    type: 'booking', source: sources.length > 0 ? sources[0] : '', property: properties.length > 0 ? properties[0].name : '',
    category: categories.length > 0 ? categories[0] : '', guest: '', email: '', phone: '', guestNote: '', text: '',
    date: new Date().toISOString().split('T')[0], endDate: '', income: '', advancePayment: '', isAdvancePaid: false, commission: '',
    utilities: '', tax: '', vat: '', isPaid: false, isCompleted: false, completedTasks: {}, syncId: '',
  }), [sources, properties, categories]);

  const [newRental, setNewRental] = useState(getDefaultRentalState());

  const getDayName = useCallback((dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      const day = date.toLocaleDateString('pl-PL', { weekday: 'long' });
      return day.charAt(0).toUpperCase() + day.slice(1);
    } catch { return ''; }
  }, []);

  // ── Dane ──
  const availableYears = useMemo(() => {
    const cur = new Date().getFullYear();
    const years = new Set();
    for (let i = cur - 2; i <= cur + 2; i++) years.add(i.toString());
    years.add(selectedYear);
    return Array.from(years).sort((a, b) => b - a);
  }, [selectedYear]);

  const handleYearChange = useCallback((y) => { setSelectedYear(y); setCurrentPage(1); }, [setSelectedYear]);

  const dailyReport = useMemo(() => {
    const today = new Date();
    const localTodayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const arrivals = []; const departures = []; const tasks = [];
    rentals.forEach((r) => {
      if (r.type === 'booking') {
        const propNameStr = typeof r.property === 'object' ? r.property.name : r.property;
        if (r.date === localTodayStr) arrivals.push({ ...r, propNameStr });
        if (r.endDate === localTodayStr) departures.push({ ...r, propNameStr });
        if (r.date) {
          const arr = new Date(r.date);
          if (!isNaN(arr.getTime())) {
            arr.setHours(0, 0, 0, 0);
            const tm = new Date(); tm.setHours(0, 0, 0, 0);
            const diffDays = Math.ceil((arr - tm) / 86400000);
            templates.forEach((t) => {
              const isCompleted = r.completedTasks?.[t.id] || (t.id === 'directions' && r.directionsSent) || (t.id === 'keycode' && r.keycodeSent);
              if (diffDays <= (t.daysBefore || 0) && diffDays >= -30 && !isCompleted) {
                tasks.push({ id: r.id, taskId: t.id, guest: r.guest, property: propNameStr, days: diffDays, icon: getIconComponent(t.icon || 'Bell'), text: t.text || t.shortName });
              }
            });
          }
        }
      } else if (r.type === 'reminder' && !r.isCompleted && r.date) {
        const d = new Date(r.date);
        if (!isNaN(d.getTime())) {
          d.setHours(0, 0, 0, 0);
          const tm = new Date(); tm.setHours(0, 0, 0, 0);
          const diffDays = Math.ceil((d - tm) / 86400000);
          if (diffDays <= 0 && diffDays >= -30) {
            tasks.push({ id: r.id, taskId: 'manual', property: 'Własne zadanie', days: diffDays, text: r.text || 'Brak opisu' });
          }
        }
      }
    });
    return { arrivals, departures, tasks, total: arrivals.length + departures.length + tasks.length, dateStr: localTodayStr };
  }, [rentals, templates]);

  const displayedRentals = useMemo(() => rentals.filter((r) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (r.guest?.toLowerCase().includes(q) || r.text?.toLowerCase().includes(q) || r.property?.toLowerCase().includes(q) || r.phone?.includes(q) || r.email?.includes(q) || r.guestNote?.toLowerCase().includes(q) || r.date?.includes(q) || r.source?.toLowerCase().includes(q));
    }
    if (!r.date) return false;
    const d = new Date(r.date);
    if (isNaN(d.getTime())) return false;
    return d.getFullYear().toString() === selectedYear;
  }), [rentals, selectedYear, searchQuery]);

  const { allBookings, upcomingBookings, archivedBookings, remindersList } = useMemo(() => {
    const todayTime = new Date().setHours(0, 0, 0, 0);
    const sortFn = (list, isBooking = true) => [...list].sort((a, b) => {
      const tA = new Date(a.date).getTime() || 0; const tB = new Date(b.date).getTime() || 0;
      if (isBooking && bookingSortOrder === 'upcoming') {
        const pA = tA < todayTime; const pB = tB < todayTime;
        if (pA && !pB) return 1; if (!pA && pB) return -1;
        return !pA && !pB ? tA - tB : tB - tA;
      }
      return (isBooking ? bookingSortOrder : utilitySortOrder) === 'desc' ? tB - tA : tA - tB;
    });
    const bookings = sortFn(displayedRentals.filter((r) => r.type === 'booking'), true);
    return {
      allBookings: bookings,
      upcomingBookings: bookings.filter((r) => new Date(r.endDate || r.date).setHours(0, 0, 0, 0) >= todayTime),
      archivedBookings: bookings.filter((r) => new Date(r.endDate || r.date).setHours(0, 0, 0, 0) < todayTime),
      utilitiesList: sortFn(displayedRentals.filter((r) => r.type === 'utility'), false),
      remindersList: sortFn(displayedRentals.filter((r) => r.type === 'reminder'), false),
    };
  }, [displayedRentals, bookingSortOrder, utilitySortOrder]);

  const displayedBookings = bookingFilter === 'all' ? allBookings : bookingFilter === 'upcoming' ? upcomingBookings : archivedBookings;
  const getPaginated = (list) => list.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Gdy szukamy — pokazujemy wyniki w widoku Rezerwacje
  const renderView = searchQuery && ['calendar', 'objects', 'finance', 'analytics', 'pulpit', 'guides', 'contracts'].includes(activeView) ? 'bookings' : activeView;
  const paginatedBookings = getPaginated(displayedBookings);
  const currentTotalPages = Math.ceil(displayedBookings.length / ITEMS_PER_PAGE) || 1;

  const yearlyStats = useMemo(() => {
    const data = {};
    rentals.forEach((r) => {
      if (!r.date || r.type === 'reminder') return;
      const d = new Date(r.date);
      if (isNaN(d.getTime())) return;
      const year = d.getFullYear().toString(); const month = d.getMonth();
      if (!data[year]) data[year] = { total: { income: 0, costs: 0, tax: 0, profit: 0 }, months: Array.from({ length: 12 }, () => ({ income: 0, costs: 0, tax: 0, profit: 0, active: false })) };
      const inc = Number(r.income) || 0; const cst = (Number(r.commission) || 0) + (Number(r.utilities) || 0);
      const tax = (Number(r.tax) || 0) + (Number(r.vat) || 0); const prf = inc - cst - tax;
      data[year].total.income += inc; data[year].total.costs += cst; data[year].total.tax += tax; data[year].total.profit += prf;
      const m = data[year].months[month];
      m.income += inc; m.costs += cst; m.tax += tax; m.profit += prf; m.active = true;
    });
    return data;
  }, [rentals]);

  const currentYearData = useMemo(() => yearlyStats[selectedYear] || { total: { income: 0, costs: 0, tax: 0, profit: 0 }, months: Array.from({ length: 12 }, () => ({ income: 0, costs: 0, tax: 0, profit: 0, active: false })) }, [yearlyStats, selectedYear]);

  const weekReminders = useMemo(() => {
    const limit = new Date(new Date().setDate(new Date().getDate() + 7));
    return remindersList.filter((r) => !r.isCompleted && new Date(r.date) <= limit);
  }, [remindersList]);

  // Metryki Pulpitu (obłożenie, przychód miesiąca, wykres 7 dni)
  const pulpit = useMemo(() => {
    const now = new Date();
    const mIdx = now.getMonth();
    const monthName = now.toLocaleDateString('pl-PL', { month: 'long' });
    const prevName = new Date(now.getFullYear(), mIdx - 1, 1).toLocaleDateString('pl-PL', { month: 'long' });
    const cm = currentYearData.months[mIdx] || { income: 0 };
    const pm = currentYearData.months[(mIdx + 11) % 12] || { income: 0 };
    const delta = pm.income > 0 ? Math.round(((cm.income - pm.income) / pm.income) * 100) : null;

    // obłożenie: noce zarezerwowane w bieżącym miesiącu / (liczba obiektów × dni miesiąca)
    const daysInMonth = new Date(now.getFullYear(), mIdx + 1, 0).getDate();
    const mStart = new Date(now.getFullYear(), mIdx, 1).setHours(0, 0, 0, 0);
    const mEnd = new Date(now.getFullYear(), mIdx + 1, 0).setHours(23, 59, 59, 999);
    let nights = 0;
    rentals.forEach((r) => {
      if (r.type !== 'booking' || !r.date) return;
      const s = new Date(r.date).setHours(0, 0, 0, 0);
      const e = new Date(r.endDate || r.date).setHours(0, 0, 0, 0);
      if (isNaN(s)) return;
      const from = Math.max(s, mStart); const to = Math.min(e, mEnd);
      if (to >= from) nights += Math.max(1, Math.round((to - from) / 86400000));
    });
    const occupancy = properties.length ? Math.min(100, Math.round((nights / (properties.length * daysInMonth)) * 100)) : 0;

    // wykres przychodu z ostatnich 7 dni (wg daty przyjazdu)
    const DOW = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb'];
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      let v = 0;
      rentals.forEach((r) => { if (r.type === 'booking' && r.date === key) v += Number(r.income) || 0; });
      days.push({ label: DOW[d.getDay()], value: v });
    }
    const max = Math.max(1, ...days.map((d) => d.value));
    days.forEach((d) => { d.pct = Math.round((d.value / max) * 100); d.hi = d.value === max && d.value > 0; });

    return {
      monthName, prevName, monthRevenue: cm.income, delta, occupancy,
      arrivals: dailyReport.arrivals.length, departures: dailyReport.departures.length,
      cleaning: dailyReport.departures.length, cleaningInfo: dailyReport.departures[0]?.propNameStr || null,
      chart: days,
    };
  }, [rentals, properties, currentYearData, dailyReport]);

  // Szczegóły rezerwacji — pobierane „na żywo" z rentals (aktualne po edycji)
  const detailBooking = detailId ? rentals.find((r) => r.id === detailId) : null;

  // ── Akcje ──
  const handleCloseModal = useCallback(() => { setShowAddModal(false); setEditingId(null); setNewRental(getDefaultRentalState()); }, [getDefaultRentalState]);

  const openEditModal = useCallback((r) => {
    setEditingId(r.id);
    setNewRental({ ...r, email: r.email || '', phone: r.phone || '', text: r.text || '', guestNote: r.guestNote || '', advancePayment: r.advancePayment || '', commission: r.commission || '', tax: r.tax || '', vat: r.vat || '', utilities: r.utilities || '' });
    setShowAddModal(true);
  }, []);

  const handleDeleteClick = useCallback((id) => setItemToDelete(id), []);

  const handleRentalChange = (field, value) => {
    const updated = { ...newRental, [field]: value };
    if (['income', 'commission', 'source', 'date'].includes(field) && updated.type === 'booking') {
      if (updated.source === 'Facebook') { updated.tax = ''; updated.vat = ''; updated.commission = ''; }
      else { const { vat, tax } = calculateTaxes(updated, rentals, taxSettings, editingId); updated.vat = vat; updated.tax = tax; }
    }
    setNewRental(updated);
  };

  const handleAddRental = async (e) => {
    e.preventDefault();
    if (!user) return;
    const { id: _id, ...entry } = newRental;
    ['income', 'advancePayment', 'commission', 'tax', 'vat', 'utilities'].forEach((field) => {
      if (entry[field] === '' || entry[field] === null || entry[field] === undefined) entry[field] = deleteField();
      else { const parsed = Number(String(entry[field]).replace(',', '.')); entry[field] = isNaN(parsed) ? 0 : parsed; }
    });
    const docRef = editingId ? doc(db, 'users', user.uid, 'rentals', editingId) : doc(db, 'users', user.uid, 'rentals', Date.now().toString());
    try {
      await (editingId ? updateDoc : setDoc)(docRef, entry);
      toast.success(editingId ? 'Zaktualizowano pomyślnie!' : 'Dodano pomyślnie!');
      handleCloseModal();
    } catch (err) { console.error(err); toast.error('Wystąpił błąd podczas zapisywania'); }
  };

  const confirmDelete = useCallback(async () => {
    if (!user || !itemToDelete) return;
    try { await deleteDoc(doc(db, 'users', user.uid, 'rentals', itemToDelete)); toast.success('Pomyślnie usunięto wpis'); }
    catch (err) { console.error(err); toast.error('Błąd podczas usuwania'); }
    finally { setItemToDelete(null); }
  }, [user, itemToDelete]);

  const openSettingsModal = useCallback(() => {
    setEditingTemplates(JSON.parse(JSON.stringify(templates)));
    const retrofitted = properties.map((p) => {
      const u = { ...p };
      if (!u.id) u.id = window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
      if (!u.secretToken) u.secretToken = window.crypto?.randomUUID ? window.crypto.randomUUID().replace(/-/g, '') : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      return u;
    });
    setEditingProperties(retrofitted);
    setEditingSources([...sources]); setEditingCategories([...categories]);
    setEditingTaxSettings(taxSettings); setEditingHostProfile(hostProfile);
    setEditingSyncLinks(JSON.parse(JSON.stringify(syncLinks)));
    setSettingsTab('sync'); setShowSettingsModal(true);
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
      toast.success('Ustawienia zostały zapisane'); setShowSettingsModal(false);
    } catch (err) { console.error(err); toast.error('Błąd podczas zapisywania ustawień'); }
  }, [user, editingTemplates, editingProperties, editingSources, editingCategories, editingTaxSettings, editingHostProfile, editingSyncLinks]);

  const updateProperty = (i, v) => { const u = [...editingProperties]; u[i] = v; setEditingProperties(u); };
  const removeProperty = (i) => { const u = [...editingProperties]; u.splice(i, 1); setEditingProperties(u); };
  const handleAddProperty = (e) => {
    e.preventDefault();
    if (newPropertyName.trim()) {
      const secretToken = window.crypto?.randomUUID ? window.crypto.randomUUID().replace(/-/g, '') : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const id = window.crypto?.randomUUID ? window.crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
      setEditingProperties([...editingProperties, { id, name: newPropertyName.trim(), color: newPropertyColor, secretToken }]);
      setNewPropertyName(''); setNewPropertyColor('blue');
    }
  };
  const updateSource = (i, v) => { const u = [...editingSources]; u[i] = v; setEditingSources(u); };
  const removeSource = (i) => { const u = [...editingSources]; u.splice(i, 1); setEditingSources(u); };
  const handleAddSource = (e) => { e.preventDefault(); if (newSourceName.trim()) { setEditingSources([...editingSources, newSourceName.trim()]); setNewSourceName(''); } };
  const updateCategory = (i, v) => { const u = [...editingCategories]; u[i] = v; setEditingCategories(u); };
  const removeCategory = (i) => { const u = [...editingCategories]; u.splice(i, 1); setEditingCategories(u); };
  const handleAddCategory = (e) => { e.preventDefault(); if (newCategoryName.trim()) { setEditingCategories([...editingCategories, newCategoryName.trim()]); setNewCategoryName(''); } };
  const updateTemplate = (i, f, v) => { const u = [...editingTemplates]; u[i][f] = v; setEditingTemplates(u); };
  const removeTemplate = (i) => { const u = [...editingTemplates]; u.splice(i, 1); setEditingTemplates(u); };
  const addTemplate = () => setEditingTemplates([...editingTemplates, { id: `task_${Date.now()}`, text: 'Nowe zadanie...', shortName: 'Zadanie', daysBefore: 3, icon: 'CheckSquare' }]);

  const openSettingsOn = useCallback((tab) => { openSettingsModal(); setSettingsTab(tab); }, [openSettingsModal]);

  // ── Ekrany bramkujące ──
  if (loading) return (<div className="wpd"><style>{DASHBOARD_CSS}</style><div className="wpd-loader"><div className="wpd-spin" /></div></div>);
  if (isAccessLocked()) return (
    <PaywallScreen accountStatus={accountStatus} scheduledDeletionAt={scheduledDeletionAt}
      onSubscribe={handleSubscribe} isCheckoutLoading={isCheckoutLoading}
      onManageSubscription={handleManageSubscription} isBillingPortalLoading={isBillingPortalLoading}
      onLogout={handleLogout} />
  );
  if (!hostProfile.entityName) return <CompleteProfileScreen user={user} onComplete={() => {}} />;

  const meta = VIEW_META[activeView] || VIEW_META.pulpit;
  const userName = hostProfile.entityName || user?.displayName || 'Gospodarz';
  const userInitials = userName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const planLabel = accountStatus === 'active' ? 'Plan Gospodarz' : accountStatus === 'trialing' ? 'Okres próbny' : 'Plan Gospodarz';

  // status synchronizacji w sidebarze
  const syncRows = [
    { name: 'Airbnb', on: Object.keys(syncLinks).some((k) => k.toLowerCase().includes('airbnb')) },
    { name: 'Booking.com', on: Object.keys(syncLinks).some((k) => k.toLowerCase().includes('booking')) },
    { name: 'Nocowanie', on: Object.keys(syncLinks).some((k) => k.toLowerCase().includes('nocowanie')) },
  ];

  return (
    <div className="wpd">
      <style>{DASHBOARD_CSS}</style>
      <div className="wpd-shell">
        {/* ── Sidebar ── */}
        <aside className="wpd-side">
          <div className="wpd-side__brand">
            <span className="wpd-logo__word">Wynajem</span>
            <span className="wpd-logo__pro">PRO</span>
          </div>
          <nav className="wpd-nav">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.key}
                  className={`wpd-nav__item${activeView === item.key ? ' wpd-nav__item--active' : ''}`}
                  onClick={() => changeView(item.key)}>
                  <span className="wpd-nav__num">{item.num}</span>
                  <Icon style={{ width: 17, height: 17 }} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="wpd-sync">
            <button className="wpd-sync__title" onClick={handleSyncCalendars} disabled={isSyncing}
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              Synchronizacja <RefreshCw style={{ width: 11, height: 11, color: 'var(--on-side-faint)' }} className={isSyncing ? 'wpd-spin' : ''} />
            </button>
            {syncRows.map((s) => (
              <div className="wpd-sync__row" key={s.name}>
                <span className="wpd-sync__dot" style={{ background: s.on ? 'var(--green-dot)' : 'var(--amber)' }} />
                <span className="wpd-sync__name">{s.name}</span>
                <span className="wpd-sync__time">{s.on ? 'OK' : '—'}</span>
              </div>
            ))}
          </div>

          <div className="wpd-user">
            <span className="wpd-user__av">{userInitials}</span>
            <div style={{ minWidth: 0 }}>
              <div className="wpd-user__name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
              <div className="wpd-user__plan">{planLabel}</div>
            </div>
            <button className="wpd-user__out" title="Wyloguj" onClick={handleLogout}><Power /></button>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="wpd-main">
          <header className="wpd-top">
            <div className="wpd-top__title">
              <h1>{detailBooking ? 'Szczegóły rezerwacji' : searchQuery ? 'Wyniki wyszukiwania' : meta.title}</h1>
              <p className="wpd-top__sub">{detailBooking ? `${detailBooking.guest || 'Rezerwacja'} · ${detailBooking.date || ''}` : searchQuery ? `Fraza: ${searchQuery}` : meta.sub}</p>
            </div>
            <div className="wpd-top__spacer" />
            <div className="wpd-search">
              <Search />
              <input type="text" placeholder="Szukaj rezerwacji…" value={searchQuery}
                onChange={(e) => changeSearchQuery(e.target.value)} />
            </div>
            <button className="wpd-iconbtn" title="Ustawienia" onClick={openSettingsModal}><Settings /></button>
            <button className="wpd-iconbtn" title="Raport dzienny" onClick={() => setShowDailyReportModal(true)}>
              <Bell />{dailyReport.total > 0 && <span className="wpd-iconbtn__dot" />}
            </button>
            <button className="wpd-btn wpd-btn--primary" onClick={() => { setNewRental(getDefaultRentalState()); setShowAddModal(true); }}>
              <Plus /> Rezerwacja
            </button>
          </header>

          <main className="wpd-content">
            {detailBooking ? (
              <BookingDetailView
                booking={detailBooking} templates={templates} toggleDynamicTask={toggleDynamicTask}
                onBack={() => setDetailId(null)} onEdit={openEditModal}
                onDelete={(id) => { setDetailId(null); handleDeleteClick(id); }}
              />
            ) : (
            <>
            {renderView === 'pulpit' && (
              <PulpitView
                pulpit={pulpit} dailyReport={dailyReport} weekReminders={weekReminders} properties={properties}
                upcoming={upcomingBookings}
                onOpenStats={() => setShowStatsModal(true)} onGoCalendar={() => changeView('calendar')}
                onEditRental={openBookingDetail} completeTask={completeTask} getDayName={getDayName}
              />
            )}

            {renderView === 'bookings' && (
              <>
                <BookingsView
                  paginatedBookings={paginatedBookings} properties={properties}
                  bookingFilter={bookingFilter} changeBookingFilter={changeBookingFilter}
                  counts={{ all: allBookings.length, upcoming: upcomingBookings.length, archived: archivedBookings.length }}
                  bookingSortOrder={bookingSortOrder} changeBookingSortOrder={changeBookingSortOrder}
                  toggleStatus={toggleStatus} openEditModal={openEditModal} handleDeleteClick={handleDeleteClick}
                  onOpenDetail={openBookingDetail}
                />
                <div className="wpd-pager">
                  <button className="wpd-btn wpd-btn--sm" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}><ChevronLeft /> Poprzednia</button>
                  <span className="wpd-pager__info">Strona {currentPage} / {currentTotalPages}</span>
                  <button className="wpd-btn wpd-btn--sm" disabled={currentPage === currentTotalPages} onClick={() => setCurrentPage((p) => p + 1)}>Następna <ChevronRight /></button>
                </div>
              </>
            )}

            {renderView === 'calendar' && (
              <CalendarView
                calendarDate={calendarDate} rentals={rentals} properties={properties}
                onPrev={() => changeMonth(-1)} onNext={() => changeMonth(1)} onToday={() => setCalendarDate(new Date())}
                onEditRental={openBookingDetail}
              />
            )}
            {renderView === 'objects' && (
              <ObjectsView
                properties={properties} rentals={rentals} selectedYear={selectedYear}
                onAddProperty={() => openSettingsOn('properties')} onOpenProperty={() => openSettingsOn('properties')}
              />
            )}
            {renderView === 'finance' && (
              <FinanceView
                rentals={rentals} selectedYear={selectedYear} currentYearData={currentYearData}
                onExport={() => setShowStatsModal(true)}
              />
            )}
            {renderView === 'analytics' && (
              <AnalyticsView
                rentals={rentals} properties={properties} user={user}
                selectedYear={selectedYear} setSelectedYear={setSelectedYear}
              />
            )}
            {renderView === 'guides' && (
              <GuideBuilder user={user} properties={properties} />
            )}
            {renderView === 'contracts' && (
              <ContractGeneratorView rentals={rentals} hostProfile={hostProfile} />
            )}
            </>
            )}
          </main>
        </div>
      </div>

      {/* ── Modale (reużyte, restyl w etapie 2) ── */}
      <ProfitabilityReportModal showStatsModal={showStatsModal} setShowStatsModal={setShowStatsModal}
        selectedYear={selectedYear} handleYearChange={handleYearChange} availableYears={availableYears} currentYearData={currentYearData} />
      <DailyReportModal showDailyReportModal={showDailyReportModal} setShowDailyReportModal={setShowDailyReportModal}
        dailyReport={dailyReport} completeTask={completeTask} />
      <SettingsModal
        showSettingsModal={showSettingsModal} setShowSettingsModal={setShowSettingsModal}
        settingsTab={settingsTab} setSettingsTab={setSettingsTab}
        properties={properties} editingSyncLinks={editingSyncLinks} setEditingSyncLinks={setEditingSyncLinks}
        user={user} editingHostProfile={editingHostProfile} setEditingHostProfile={setEditingHostProfile}
        editingProperties={editingProperties} updateProperty={updateProperty} removeProperty={removeProperty}
        handleAddProperty={handleAddProperty} newPropertyName={newPropertyName} setNewPropertyName={setNewPropertyName}
        availableColors={availableColors} newPropertyColor={newPropertyColor} setNewPropertyColor={setNewPropertyColor}
        propColors={propColors} editingSources={editingSources} updateSource={updateSource} removeSource={removeSource}
        handleAddSource={handleAddSource} newSourceName={newSourceName} setNewSourceName={setNewSourceName}
        editingCategories={editingCategories} updateCategory={updateCategory} removeCategory={removeCategory}
        handleAddCategory={handleAddCategory} newCategoryName={newCategoryName} setNewCategoryName={setNewCategoryName}
        editingTaxSettings={editingTaxSettings} setEditingTaxSettings={setEditingTaxSettings}
        editingTemplates={editingTemplates} updateTemplate={updateTemplate} removeTemplate={removeTemplate} addTemplate={addTemplate}
        accountStatus={accountStatus} trialEndsAt={trialEndsAt} handleManageSubscription={handleManageSubscription}
        isBillingPortalLoading={isBillingPortalLoading} saveSettings={saveSettings} />
      <AddEditEntryModal showAddModal={showAddModal} handleCloseModal={handleCloseModal} handleAddRental={handleAddRental}
        editingId={editingId} newRental={newRental} setNewRental={setNewRental} handleRentalChange={handleRentalChange}
        properties={properties} sources={sources} categories={categories} />
      {itemToDelete && <DeleteConfirmModal onCancel={() => setItemToDelete(null)} onConfirm={confirmDelete} />}
      <FloatingTaskWidget tasks={dailyReport.tasks} />
    </div>
  );
}
