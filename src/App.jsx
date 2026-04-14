import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Download, Trash2, Home, DollarSign, Wallet, TrendingUp, CheckCircle, XCircle, Landmark, Bell, Mail, Key, Loader2 } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';

// Inicjalizacja bazy danych Firebase w chmurze
// UWAGA: Kiedy przeniesiesz to na własny hosting, zamień ten blok na swoje klucze z Firebase!
const firebaseConfig = {
  apiKey: "AIzaSyDPvqp0lnIQaC-bHZG1HlTyhdFWxhnlF74",
  authDomain: "moje-domki-6c77d.firebaseapp.com",
  projectId: "moje-domki-6c77d",
  storageBucket: "moje-domki-6c77d.firebasestorage.app",
  messagingSenderId: "379384522806",
  appId: "twojstary123",
  measurementId: "G-BZ0SJC201Z"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'moje-domki-app';

export default function App() {
  // Funkcja do obliczania ilości nocy
  const calculateNights = (start, end) => {
    if (!start || !end) return 0;
    const diffTime = new Date(end) - new Date(start);
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  // Funkcja do pobierania nazwy dnia tygodnia
  const getDayName = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      const day = date.toLocaleDateString('pl-PL', { weekday: 'long' });
      return day.charAt(0).toUpperCase() + day.slice(1);
    } catch {
      return '';
    }
  };

  // Stany aplikacji (baza danych)
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rentals, setRentals] = useState([]);

  // Autoryzacja użytkownika
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error("Błąd autoryzacji:", error);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // Pobieranie danych na żywo z chmury (Synchronizacja dla wielu urządzeń)
  useEffect(() => {
    if (!user) return;
    
    const rentalsRef = collection(db, 'artifacts', appId, 'public', 'data', 'rentals');
    
    const unsubscribe = onSnapshot(rentalsRef, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sortowanie od najnowszych
      data.sort((a, b) => Number(b.id) - Number(a.id));
      setRentals(data);
      setLoading(false);
    }, (error) => {
      console.error("Błąd pobierania danych:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newRental, setNewRental] = useState({
    type: 'booking',
    source: 'Booking',
    property: 'Domek 1',
    guest: '',
    email: '',
    phone: '',
    date: new Date().toISOString().split('T')[0],
    endDate: '',
    income: '',
    commission: '',
    utilities: '',
    tax: '',
    isPaid: false,
    directionsSent: false,
    keycodeSent: false,
  });

  // Obliczenia statystyk
  const stats = useMemo(() => {
    let totalIncome = 0;
    let totalCommissions = 0;
    let totalUtilities = 0;
    let totalTax = 0;
    let currentMonthTax = 0;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    rentals.forEach(r => {
      totalIncome += Number(r.income) || 0;
      totalCommissions += Number(r.commission) || 0;
      totalUtilities += Number(r.utilities) || 0;
      
      const taxVal = Number(r.tax) || 0;
      totalTax += taxVal;
      
      // Zliczanie podatku dla obecnego miesiąca
      if (r.date) {
        const rentalDate = new Date(r.date);
        if (rentalDate.getMonth() === currentMonth && rentalDate.getFullYear() === currentYear) {
          currentMonthTax += taxVal;
        }
      }
    });

    const totalCosts = totalCommissions + totalUtilities;

    return {
      income: totalIncome,
      costs: totalCosts,
      commissions: totalCommissions,
      utilities: totalUtilities,
      tax: totalTax,
      currentMonthTax: currentMonthTax,
      profit: totalIncome - totalCosts - totalTax,
    };
  }, [rentals]);

  // System przypomnień
  const reminders = useMemo(() => {
    const tasks = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    rentals.filter(r => r.type === 'booking').forEach(r => {
      if (!r.date) return;
      const arrival = new Date(r.date);
      arrival.setHours(0, 0, 0, 0);
      const diffTime = arrival - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // 7 dni (lub mniej) do przyjazdu - instrukcja dojazdu
      if (diffDays <= 7 && diffDays >= 0 && !r.directionsSent) {
        tasks.push({
          id: r.id,
          type: 'directions',
          guest: r.guest,
          property: r.property,
          days: diffDays,
          icon: <Mail className="w-4 h-4 text-amber-600" />,
          text: `Wyślij instrukcję dojazdu`,
          actionName: 'directionsSent'
        });
      }

      // 1 dzień (lub mniej) do przyjazdu - kod do skrytki
      if (diffDays <= 1 && diffDays >= 0 && !r.keycodeSent) {
        tasks.push({
          id: r.id,
          type: 'keycode',
          guest: r.guest,
          property: r.property,
          days: diffDays,
          icon: <Key className="w-4 h-4 text-red-600" />,
          text: `Wyślij kod do skrytki z kluczami`,
          actionName: 'keycodeSent'
        });
      }
    });
    
    // Sortuj od najpilniejszych
    return tasks.sort((a, b) => a.days - b.days);
  }, [rentals]);

  // Obsługa dodawania (zapis do chmury)
  const handleAddRental = async (e) => {
    e.preventDefault();
    if (!user) return;

    const newId = Date.now().toString();
    const rentalEntry = {
      source: newRental.type === 'booking' ? newRental.source : '-',
      type: newRental.type,
      property: newRental.property,
      guest: newRental.guest,
      email: newRental.type === 'booking' ? newRental.email : '',
      phone: newRental.type === 'booking' ? newRental.phone : '',
      date: newRental.date,
      endDate: newRental.endDate,
      income: Number(newRental.income) || 0,
      commission: Number(newRental.commission) || 0,
      utilities: Number(newRental.utilities) || 0,
      tax: Number(newRental.tax) || 0,
      directionsSent: false,
      keycodeSent: false,
      isPaid: newRental.isPaid,
    };
    
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'rentals', newId);
    await setDoc(docRef, rentalEntry);

    setShowAddModal(false);
    setNewRental({
      type: 'booking',
      source: 'Booking',
      property: 'Domek 1',
      guest: '',
      email: '',
      phone: '',
      date: new Date().toISOString().split('T')[0],
      endDate: '',
      income: '',
      commission: '',
      utilities: '',
      tax: '',
      isPaid: false,
      directionsSent: false,
      keycodeSent: false,
    });
  };

  // Obsługa usuwania (usuwanie z chmury)
  const handleDelete = async (id) => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'rentals', id);
    await deleteDoc(docRef);
  };

  // Zmiana statusu płatności (aktualizacja w chmurze)
  const togglePaidStatus = async (id) => {
    if (!user) return;
    const rental = rentals.find(r => r.id === id);
    if (!rental) return;
    
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'rentals', id);
    await updateDoc(docRef, { isPaid: !rental.isPaid });
  };

  // Oznaczanie zadań (przypomnień) jako wykonane w chmurze
  const completeTask = async (id, fieldName) => {
    if (!user) return;
    const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'rentals', id);
    await updateDoc(docRef, { [fieldName]: true });
  };

  // Eksport do CSV (Dla Google Sheets)
  const exportToCSV = () => {
    const headers = ['Domek', 'Typ_Wpisu', 'Zrodlo', 'Gosc_Opis', 'Email', 'Telefon', 'Data_Przyjazdu', 'Data_Wyjazdu', 'Ilosc_Nocy', 'Przychod', 'Prowizja_Portal', 'Podatek_8', 'Prad_i_Woda', 'Zysk_Netto', 'Rozliczone'];
    const csvContent = [
      headers.join(','),
      ...rentals.map(r => {
        const nights = r.type === 'booking' ? calculateNights(r.date, r.endDate) : 0;
        return [
          `"${r.property}"`,
          `"${r.type === 'booking' ? 'Rezerwacja' : 'Koszty'}"`,
          `"${r.source || '-'}"`,
          `"${r.guest}"`,
          `"${r.email || ''}"`,
          `"${r.phone || ''}"`,
          r.date,
          r.endDate || '',
          nights,
          r.income,
          r.commission,
          r.tax,
          r.utilities,
          (Number(r.income) || 0) - (Number(r.commission) || 0) - (Number(r.tax) || 0) - (Number(r.utilities) || 0),
          r.isPaid ? 'Tak' : 'Nie'
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'wynajmy_raport.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Ekran ładowania przed połączeniem z serwerem
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-slate-600 font-medium">Łączenie z bazą danych i synchronizacja...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Nagłówek */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Home className="w-8 h-8 text-blue-600" />
              Nadzór Wynajmów Krótkoterminowych
            </h1>
            <p className="text-slate-500 mt-1">Zarządzaj domkami letniskowymi, prowizjami i kosztami mediów</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={exportToCSV}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              Eksport CSV
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm shadow-blue-200"
            >
              <Plus className="w-4 h-4" />
              Dodaj wpis
            </button>
          </div>
        </div>

        {/* Panel Przypomnień / Zadań */}
        {reminders.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-amber-800 flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 animate-bounce" /> 
              Ważne przypomnienia ({reminders.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reminders.map((task) => (
                <div key={`${task.id}-${task.type}`} className="flex items-center justify-between bg-white p-3 md:p-4 rounded-xl border border-amber-100 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 bg-amber-100 p-2 rounded-lg">
                      {task.icon}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{task.text}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        <span className="font-semibold text-slate-700">{task.guest}</span> • {task.property}
                      </p>
                      <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${task.days === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {task.days === 0 ? 'Przyjazd dzisiaj!' : `Przyjazd za ${task.days} dni`}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => completeTask(task.id, task.actionName)}
                    className="ml-2 flex items-center justify-center bg-white border border-slate-200 text-slate-600 hover:text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors group"
                    title="Oznacz jako wysłane"
                  >
                    <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Karty podsumowania */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-4 bg-green-100 text-green-700 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">Przychody z najmu</p>
              <p className="text-2xl font-bold text-slate-900">{stats.income.toLocaleString('pl-PL')} zł</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-4 bg-red-100 text-red-700 rounded-xl">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">Koszty (Prowizje + Media)</p>
              <p className="text-2xl font-bold text-slate-900">{stats.costs.toLocaleString('pl-PL')} zł</p>
              <p className="text-xs text-slate-400 mt-1">Prow. {stats.commissions} zł | Media {stats.utilities} zł</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-4 bg-purple-100 text-purple-700 rounded-xl">
              <Landmark className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">Należny Podatek (8%)</p>
              <p className="text-2xl font-bold text-slate-900">{stats.tax.toLocaleString('pl-PL')} zł</p>
              <p className="text-xs text-purple-500 font-medium mt-1">Obecny m-c: {stats.currentMonthTax.toLocaleString('pl-PL')} zł</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-4 bg-blue-100 text-blue-700 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">Zysk Netto</p>
              <p className="text-2xl font-bold text-slate-900">{stats.profit.toLocaleString('pl-PL')} zł</p>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm">
                  <th className="p-4 font-semibold">Domek / Opis</th>
                  <th className="p-4 font-semibold">Termin pobytu</th>
                  <th className="p-4 font-semibold text-right">Przychód</th>
                  <th className="p-4 font-semibold text-right">Prowizja</th>
                  <th className="p-4 font-semibold text-right">Podatek (8%)</th>
                  <th className="p-4 font-semibold text-right">Media</th>
                  <th className="p-4 font-semibold text-right">Zysk</th>
                  <th className="p-4 font-semibold text-center">Status</th>
                  <th className="p-4 font-semibold text-center">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rentals.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="p-8 text-center text-slate-500">
                      Brak wpisów. Kliknij "Dodaj wpis", aby rozpocząć.
                    </td>
                  </tr>
                ) : (
                  rentals.map((rental) => {
                    const profit = (Number(rental.income) || 0) - (Number(rental.commission) || 0) - (Number(rental.utilities) || 0) - (Number(rental.tax) || 0);

                    return (
                      <tr key={rental.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-slate-900">{rental.property}</div>
                          <div className="text-sm text-slate-500 mt-1">
                            {rental.type === 'booking' ? (
                              <div className="flex flex-col gap-1">
                                <span className="flex items-center gap-2">
                                  👤 {rental.guest}
                                  <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-medium border border-slate-200">
                                    {rental.source}
                                  </span>
                                </span>
                                {(rental.email || rental.phone) && (
                                  <div className="text-xs text-slate-400 pl-5 flex flex-col gap-0.5">
                                    {rental.phone && <span>📞 {rental.phone}</span>}
                                    {rental.email && <span>✉️ {rental.email}</span>}
                                  </div>
                                )}
                              </div>
                            ) : (
                              `⚡ ${rental.guest}`
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-slate-600 text-sm">
                          {rental.type === 'booking' ? (
                            <>
                              <div className="flex flex-col gap-0.5">
                                <span>{rental.date} <span className="text-xs text-slate-400">({getDayName(rental.date)})</span></span>
                                <span className="text-slate-400 text-xs">do</span>
                                <span>{rental.endDate || '?'} {rental.endDate && <span className="text-xs text-slate-400">({getDayName(rental.endDate)})</span>}</span>
                              </div>
                              <div className="text-xs text-slate-500 mt-1.5 font-medium bg-slate-100 inline-block px-2 py-0.5 rounded border border-slate-200">
                                {calculateNights(rental.date, rental.endDate)} noclegów
                              </div>
                            </>
                          ) : (
                            <span>{rental.date} <span className="text-xs text-slate-400">({getDayName(rental.date)})</span></span>
                          )}
                        </td>
                        <td className="p-4 text-right font-medium text-green-600">
                          {rental.income > 0 ? `+${Number(rental.income).toLocaleString('pl-PL')} zł` : '-'}
                        </td>
                        <td className="p-4 text-right text-red-500">
                          {rental.commission > 0 ? `-${Number(rental.commission).toLocaleString('pl-PL')} zł` : '-'}
                        </td>
                        <td className="p-4 text-right text-red-500">
                          {rental.tax > 0 ? `-${Number(rental.tax).toLocaleString('pl-PL')} zł` : '-'}
                        </td>
                        <td className="p-4 text-right text-red-500">
                          {rental.utilities > 0 ? `-${Number(rental.utilities).toLocaleString('pl-PL')} zł` : '-'}
                        </td>
                        <td className="p-4 text-right font-bold text-slate-800">
                          {profit.toLocaleString('pl-PL')} zł
                        </td>
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => togglePaidStatus(rental.id)}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                              rental.isPaid 
                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            }`}
                          >
                            {rental.isPaid ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {rental.isPaid ? 'Opłacone' : 'Oczekuje'}
                          </button>
                        </td>
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => handleDelete(rental.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Usuń wpis"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Dodawania */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold text-slate-900">Nowe rozliczenie</h2>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleAddRental} className="p-6 space-y-4 overflow-y-auto">
                
                <div className="flex gap-4 mb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="entryType"
                      value="booking"
                      checked={newRental.type === 'booking'}
                      onChange={() => setNewRental({...newRental, type: 'booking', source: 'Booking', utilities: '', guest: '', email: '', phone: ''})}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Rezerwacja (Najem)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="entryType"
                      value="utility"
                      checked={newRental.type === 'utility'}
                      onChange={() => setNewRental({...newRental, type: 'utility', income: '', commission: '', tax: '', guest: 'Koszty (Miesiąc)', endDate: '', email: '', phone: ''})}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Koszty (Prąd, Podatek, itp.)</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Domek letniskowy</label>
                  <select 
                    value={newRental.property} 
                    onChange={e => setNewRental({...newRental, property: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  >
                    <option value="Domek 1">Domek 1</option>
                    <option value="Domek 2">Domek 2</option>
                  </select>
                </div>

                {newRental.type === 'booking' ? (
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Źródło</label>
                        <select 
                          value={newRental.source} 
                          onChange={e => {
                            const newSource = e.target.value;
                            const updates = { source: newSource };
                            if (newSource === 'Facebook') {
                              updates.commission = '';
                              updates.tax = '';
                            } else if (newRental.income) {
                              updates.tax = (Number(newRental.income) * 0.08).toFixed(2);
                            }
                            setNewRental({...newRental, ...updates});
                          }}
                          className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                        >
                          <option value="Booking">Booking</option>
                          <option value="Airbnb">Airbnb</option>
                          <option value="Facebook">Facebook</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Gość / Rezerwacja</label>
                        <input 
                          required type="text" 
                          value={newRental.guest} onChange={e => setNewRental({...newRental, guest: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="np. Jan Kowalski"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email (Opcjonalnie)</label>
                        <input 
                          type="email" 
                          value={newRental.email} onChange={e => setNewRental({...newRental, email: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="np. jan@kowalski.pl"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Telefon (Opcjonalnie)</label>
                        <input 
                          type="tel" 
                          value={newRental.phone} onChange={e => setNewRental({...newRental, phone: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="np. +48 123 456 789"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Data przyjazdu</label>
                        <input 
                          required type="date" 
                          value={newRental.date} onChange={e => setNewRental({...newRental, date: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Data wyjazdu</label>
                        <input 
                          required type="date" 
                          min={newRental.date}
                          value={newRental.endDate} onChange={e => setNewRental({...newRental, endDate: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Przychód (zł)</label>
                        <input 
                          required type="number" min="0" step="0.01"
                          value={newRental.income} 
                          onChange={e => {
                            const val = e.target.value;
                            setNewRental({
                              ...newRental, 
                              income: val,
                              tax: (val && newRental.source !== 'Facebook') ? (Number(val) * 0.08).toFixed(2) : ''
                            });
                          }}
                          className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Kwota"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Prowizja portalu</label>
                        <input 
                          required={newRental.source !== 'Facebook'}
                          disabled={newRental.source === 'Facebook'}
                          type="number" min="0" step="0.01"
                          value={newRental.commission} onChange={e => setNewRental({...newRental, commission: e.target.value})}
                          className={`w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${newRental.source === 'Facebook' ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                          placeholder={newRental.source === 'Facebook' ? 'Brak' : 'Prowizja'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Podatek 8%</label>
                        <input 
                          required={newRental.source !== 'Facebook'}
                          disabled={newRental.source === 'Facebook'}
                          type="number" min="0" step="0.01"
                          value={newRental.tax} onChange={e => setNewRental({...newRental, tax: e.target.value})}
                          className={`w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${newRental.source === 'Facebook' ? 'bg-slate-100 cursor-not-allowed' : ''}`}
                          placeholder={newRental.source === 'Facebook' ? 'Brak' : 'Podatek'}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Opis kosztu</label>
                        <input 
                          required type="text" 
                          value={newRental.guest} onChange={e => setNewRental({...newRental, guest: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Data wpisu / Miesiąc</label>
                        <input 
                          required type="date" 
                          value={newRental.date} onChange={e => setNewRental({...newRental, date: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Prąd i woda (zł)</label>
                        <input 
                          type="number" min="0" step="0.01"
                          value={newRental.utilities} onChange={e => setNewRental({...newRental, utilities: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Media"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Podatek / Inne opłaty (zł)</label>
                        <input 
                          type="number" min="0" step="0.01"
                          value={newRental.tax} onChange={e => setNewRental({...newRental, tax: e.target.value})}
                          className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                          placeholder="Inne koszty"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" id="isPaid"
                    checked={newRental.isPaid} onChange={e => setNewRental({...newRental, isPaid: e.target.checked})}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <label htmlFor="isPaid" className="text-sm text-slate-700">Oznacz jako rozliczone / opłacone</label>
                </div>

                <div className="flex gap-3 pt-4 mt-4 border-t border-slate-100">
                  <button 
                    type="button" onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
                  >
                    Anuluj
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Zapisz
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}