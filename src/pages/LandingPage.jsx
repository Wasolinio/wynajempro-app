import React, { useState } from 'react';
import { 
  CheckCircle, CalendarDays, Calculator, Bell, BarChart3, 
  ArrowRight, ShieldCheck, XCircle, Coffee, TrendingUp, 
  Users, Sparkles, Menu, ChevronDown, Star, LogIn, 
  HeartHandshake, Building, X, ChevronLeft, ChevronRight, Smartphone, CheckSquare,
  MapPin, Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import RoiCalculator from '../components/RoiCalculator';


export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Akcja kliknięta (Logowanie/Rejestracja)");
  const [isGuestGuideModalOpen, setIsGuestGuideModalOpen] = useState(false);

  // Zastępcza funkcja logowania/rejestracji
  const handleAction = () => {
    setToastMessage("Akcja kliknięta (Logowanie/Rejestracja)");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#fafcff] font-sans text-slate-900 selection:bg-blue-200 relative">
      
      {/* Tost (Zastępcze powiadomienie zamiast alertu) */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-[100] bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      {/* TŁO - NOWOCZESNE ROZMYTE ŚWIATŁA (GLOWING ORBS) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 transform-gpu will-change-transform"></div>
      <div className="absolute top-[10%] right-[-5%] w-[30rem] h-[30rem] bg-violet-400/20 rounded-full mix-blend-multiply filter blur-[120px] opacity-70 transform-gpu will-change-transform"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[40rem] h-[40rem] bg-cyan-300/20 rounded-full mix-blend-multiply filter blur-[120px] opacity-60 transform-gpu will-change-transform"></div>

      {/* STICKY HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
             <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
               <HomeIcon className="w-5 h-5 text-white" />
             </div>
             <span className="font-extrabold text-2xl tracking-tighter">Wynajem<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Pro</span></span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 font-bold text-sm text-slate-600">
            <a href="#funkcje" className="hover:text-indigo-600 transition-colors">Funkcje</a>
            <a href="#jak-to-dziala" className="hover:text-indigo-600 transition-colors">Jak to działa?</a>
            <a href="#opinie" className="hover:text-indigo-600 transition-colors">Opinie</a>
            <a href="#cennik" className="hover:text-indigo-600 transition-colors">Cennik</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900">Zaloguj</Link>
            <Link to="/login" className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-transform hover:-translate-y-0.5">
              Rozpocznij za darmo
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <XCircle className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white/95 backdrop-blur-xl border-b border-slate-100 p-6 flex flex-col gap-6 shadow-2xl">
            <a href="#funkcje" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-slate-700">Funkcje</a>
            <a href="#jak-to-dziala" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-slate-700">Jak to działa?</a>
            <a href="#opinie" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-slate-700">Opinie</a>
            <a href="#cennik" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-slate-700">Cennik</a>
            <hr className="border-slate-100" />
            <Link to="/login" className="text-lg font-bold text-slate-700 text-center">Zaloguj się</Link>
            <Link to="/login" className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-lg font-bold text-center shadow-lg">Rozpocznij za darmo</Link>
          </div>
        )}
      </header>

      <main>

      {/* HERO SECTION (V2) */}
      <section className="relative pt-40 pb-20 md:pt-48 md:pb-32 px-4 overflow-hidden">
        {/* Abstract Blobs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[120px] -z-10 mix-blend-multiply"></div>
        <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-indigo-400/20 rounded-full blur-[100px] -z-10 mix-blend-multiply"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-8 shadow-sm cursor-default hover:bg-indigo-100 transition-colors">
            <Sparkles className="w-4 h-4 text-indigo-500" /> Kreator Cyfrowych Przewodników dla Gości
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-8">
            Zarządzaj najmem krótkoterminowym <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">bez chaosu</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            Zautomatyzuj swój kalendarz, finanse i komunikację z gośćmi w jednym prostym narzędziu, które nie wymaga instrukcji obsługi.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 transition-transform hover:-translate-y-1">
              Rozpocznij 14-dniowy test <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#jak-to-dziala" className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 rounded-2xl font-bold shadow-sm border border-slate-200 transition-colors flex items-center justify-center">
              Zobacz, jak to działa
            </a>
          </div>
          <p className="mt-4 text-xs font-semibold text-slate-500 flex items-center justify-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-500" /> Karta kredytowa nie jest wymagana
          </p>
        </div>

        {/* NOWOCZESNY MOCKUP "BENTO BOX" BAZUJĄCY NA REALNEJ APLIKACJI (Z V1) */}
        <div className="mt-16 md:mt-20 max-w-5xl mx-auto relative perspective-1000 px-2 sm:px-0 z-10">
          <div className="absolute inset-0 bg-gradient-to-t from-[#fafcff] via-transparent to-transparent z-20 h-full w-full pointer-events-none rounded-3xl"></div>
          
          {/* Główny kontener aplikacji */}
          <div className="relative z-10 bg-white/60 backdrop-blur-2xl p-4 md:p-6 rounded-2xl md:rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-white flex flex-col md:flex-row gap-6 transform lg:-rotate-1 hover:rotate-0 transition-transform duration-700 hover:shadow-[0_30px_80px_rgba(0,0,0,0.12)] text-left">
            
            {/* Lewa kolumna: Pulpit Rezerwacji */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-4 md:p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0"><CalendarDays className="w-5 h-5 text-blue-600" /></div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm md:text-base">Przegląd rezerwacji</h3>
                    <p className="text-xs text-slate-500">Najbliższe 7 dni</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hidden sm:block">Pulpit Główny</span>
              </div>
              
              <div className="space-y-3">
                 {/* Rezerwacja 1 (Booking.com) */}
                 <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 transition-colors hover:bg-slate-100 cursor-pointer">
                   <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">Domek nad jeziorem <span className="hidden sm:inline text-xs font-normal text-slate-500">• 12-15 Sie</span></p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Users className="w-3 h-3"/> Jan Kowalski (Booking.com)</p>
                      </div>
                   </div>
                   <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md">Opłacone</span>
                 </div>
                 
                 {/* Rezerwacja 2 (Airbnb) */}
                 <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 transition-colors hover:bg-slate-100 cursor-pointer">
                   <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0"></div>
                      <div>
                        <p className="text-sm font-bold text-slate-700">Apartament Centrum <span className="hidden sm:inline text-xs font-normal text-slate-500">• 14-16 Sie</span></p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5"><Users className="w-3 h-3"/> A. Nowak (Airbnb)</p>
                      </div>
                   </div>
                   <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-md">Zaliczka</span>
                 </div>
                 
                 {/* Alerty/Status Obiektu */}
                 <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 border border-amber-100 border-dashed cursor-pointer hover:bg-amber-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Coffee className="w-4 h-4 text-amber-500 shrink-0" />
                      <p className="text-sm font-medium text-amber-700">Czas na przygotowanie: Domek 2</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                 </div>
              </div>
            </div>

            {/* Prawa kolumna: Lewitujące Widgety */}
            <div className="w-full md:w-72 flex flex-col gap-4 md:gap-6 relative">
              {/* Widget Zysku */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 md:p-6 rounded-2xl shadow-xl text-white transform md:translate-x-[-20px] md:translate-y-[20px] hover:translate-y-[15px] transition-transform duration-500">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Zysk na czysto (Sierpień)</p>
                <p className="text-2xl md:text-3xl font-extrabold text-white mb-2">8 920 <span className="text-base md:text-lg text-slate-400">zł</span></p>
                <div className="flex items-center gap-2 text-emerald-400 text-[10px] md:text-xs font-bold bg-emerald-400/10 w-fit px-2.5 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" /> Po odliczeniu prowizji portali
                </div>
              </div>

              {/* Widget: Raport Dnia */}
              <div className="bg-white p-4 md:p-5 rounded-2xl shadow-lg border border-slate-100 transform md:translate-x-[10px]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 rounded-lg"><Bell className="w-4 h-4 text-blue-600" /></div>
                    <p className="text-sm font-bold text-slate-800">Raport Dnia</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Dziś</span>
                </div>
                
                <div className="space-y-2.5">
                   {/* Zadanie do zrobienia */}
                   <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
                     <div className="w-4 h-4 rounded-full border-2 border-slate-300 mt-0.5 shrink-0 bg-white"></div>
                     <div>
                       <p className="text-xs font-bold text-slate-700">Wyślij PIN do drzwi</p>
                       <p className="text-[10px] text-slate-500 mt-0.5">Domek 1 • do 14:00</p>
                     </div>
                   </div>
                   {/* Zadanie ukończone */}
                   <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100 opacity-60">
                     <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center mt-0.5 shrink-0"><CheckCircle className="w-3 h-3 text-white" /></div>
                     <div>
                       <p className="text-xs font-bold text-slate-700 line-through">Zleć sprzątanie</p>
                       <p className="text-[10px] text-slate-500 mt-0.5">Apartament Centrum</p>
                     </div>
                   </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* BENTO GRID FEATURES (V3: V2 layout, V1 Content) */}
      <section id="funkcje" className="py-24 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Wszystko, czego potrzebujesz.</h2>
            <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto">Skomponowaliśmy funkcje, które zdejmują najwięcej pracy z barków gospodarzy, zamykając je w przepięknym interfejsie.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(250px,auto)]">
            
            {/* Karta 1: Cyfrowy Przewodnik Gościa premium (Duża 2x2) */}
            <div className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[2rem] p-8 md:p-12 border border-indigo-100 relative overflow-hidden group">
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-6 group-hover:scale-110 transition-transform">
                  <Smartphone className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Cyfrowy Przewodnik Gościa premium</h3>
                <p className="text-slate-600 text-base md:text-lg font-medium max-w-md mb-8">Zrezygnuj z drukowanych kartek. Daj gościom wszystko na telefon przed przyjazdem i podnieś standard swoich obiektów.</p>
                
                {/* Mini-mockup: ekran telefonu gościa */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 max-w-sm mb-8 space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <span className="text-lg">📋</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-500">Sieć Wi-Fi</p>
                      <p className="text-sm font-bold text-slate-800 truncate">Domek_WiFi_5G</p>
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-md whitespace-nowrap">Kopiuj hasło</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <span className="text-lg">🔐</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-500">Kod do drzwi</p>
                      <p className="text-sm font-mono font-extrabold text-slate-800 tracking-widest">••••</p>
                    </div>
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-md whitespace-nowrap">Auto w dniu przyjazdu</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-100">
                    <span className="text-lg">🔥</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-500">Instrukcja PPOŻ</p>
                      <p className="text-sm font-bold text-slate-800">Generuj PDF z kodem QR</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setIsGuestGuideModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-md shadow-indigo-600/20 transition-transform hover:-translate-y-0.5 flex items-center gap-2 group w-fit"
                >
                  <Smartphone className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Zobacz, co widzi Twój gość
                </button>
              </div>
            </div>

            {/* Karta 2: Poranny Raport Operacyjny */}
            <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 hover:border-slate-200 transition-colors group">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mb-5 group-hover:scale-110 transition-transform">
                <Coffee className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2 tracking-tight">Poranny raport operacyjny</h3>
              <p className="text-slate-600 font-medium text-sm mb-4">Otwierasz aplikację rano przy kawie i w 5 sekund wiesz, co dzisiaj musisz zrobić. Pełna kontrola nad dniem.</p>
              {/* Mini-harmonogram na dziś */}
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                  <div><span className="font-bold text-slate-700">Domek Ruś 1</span> <span className="text-slate-500">— Zameldowanie 15:00</span> <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded ml-1">Płatność OK</span></div>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0"></span>
                  <div><span className="font-bold text-slate-700">Apt. Elbląg</span> <span className="text-slate-500">— Wymeldowanie 11:00</span> <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded ml-1">🧹 Sprzątanie</span></div>
                </div>
              </div>
            </div>

            {/* Karta 3: iCal Sync — Koniec z podwójnymi rezerwacjami */}
            <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 hover:border-slate-200 transition-colors group">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mb-5 group-hover:scale-110 transition-transform">
                <CalendarDays className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2 tracking-tight">Koniec z podwójnymi rezerwacjami</h3>
              <p className="text-slate-600 font-medium text-sm mb-4">Dwukierunkowa synchronizacja w czasie rzeczywistym. Rezerwacja na Booking natychmiast blokuje kalendarz na Airbnb i w WynajemPRO.</p>
              {/* Wizualizacja przepływu iCal */}
              <div className="flex items-center justify-between gap-1 bg-white rounded-xl p-3 border border-slate-200">
                <div className="text-center flex-1">
                  <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">Booking.com</div>
                </div>
                <span className="text-slate-400 font-bold text-xs shrink-0">⇄</span>
                <div className="text-center flex-1">
                  <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">WynajemPRO</div>
                </div>
                <span className="text-slate-400 font-bold text-xs shrink-0">⇄</span>
                <div className="text-center flex-1">
                  <div className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">Airbnb</div>
                </div>
              </div>
            </div>

            {/* Karta 5: Automatyzacja podatków najmu */}
            <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 hover:border-slate-200 transition-colors group">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mb-5 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2 tracking-tight">Automatyzacja podatków najmu</h3>
              <p className="text-slate-600 font-medium text-sm mb-4">Koniec z ręcznym liczeniem i strachem przed kontrolą za prowizje z Booking/Airbnb. System sam pilnuje wszystkiego.</p>
              {/* Mini-mockup: wskaźnik podatkowy */}
              <div className="space-y-2">
                <div className="bg-white rounded-xl p-2.5 border border-slate-200">
                  <div className="flex justify-between items-center text-[10px] mb-1.5">
                    <span className="font-bold text-slate-500">Przychód YTD</span>
                    <span className="font-bold text-slate-700">98 500 zł / 100 000 zł</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-amber-500 rounded-full" style={{width: '98.5%'}}></div>
                  </div>
                  <p className="text-[10px] text-amber-600 font-bold mt-1">Stawka: 8,5% → Auto-switch na 12,5%</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">VAT-UE (23%): Auto</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Mikrorachunek: Wygenerowany</span>
                </div>
              </div>
            </div>

            {/* Karta 6: Strategia Cenowa — Jeden abonament */}
            <div className="md:col-span-1 bg-slate-900 rounded-[2rem] p-8 overflow-hidden relative group">
              <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users className="w-32 h-32 text-white" />
              </div>
              <div className="relative z-10">
                <h3 className="text-xl font-extrabold text-white mb-2 tracking-tight">Jeden stały abonament. Bez limitu obiektów.</h3>
                <p className="text-slate-400 text-sm font-medium mb-4">Inni każą Ci płacić za każdy pokój lub pobierają prowizję. W WynajemPRO rozwijasz biznes bez dodatkowych kosztów.</p>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-extrabold text-white">29,99 zł</span>
                  <span className="text-sm text-slate-500 font-bold mb-0.5">/ mc</span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium mt-1">Stała cena — 1 domek, czy 10 apartamentów.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* JAK TO DZIAŁA (KROKI) */}
      <section id="jak-to-dziala" className="py-20 md:py-24 bg-slate-50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-xs md:text-sm font-extrabold text-blue-600 tracking-widest uppercase mb-3">Szybki Start</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Jak zacząć korzystać z WynajemPro?</h3>
            <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto font-medium">Nie potrzebujesz instrukcji obsługi. Cały proces od rejestracji do dodania pierwszej rezerwacji zajmie Ci mniej niż 2 minuty.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Linie łączące (tylko na desktopie) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-200 via-violet-200 to-emerald-200 z-0"></div>

            {/* Krok 1 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-slate-50 mb-6 group-hover:border-blue-100 transition-colors">
                <LogIn className="w-10 h-10 text-blue-600" />
              </div>
              <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">Krok 1</div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Załóż darmowe konto</h4>
              <p className="text-slate-600 text-sm font-medium px-4">Podaj e-mail i hasło. Bez podpinania karty, bez ukrytych haczyków. Dostajesz 14 dni na pełne testy.</p>
            </div>

            {/* Krok 2 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-slate-50 mb-6 group-hover:border-violet-100 transition-colors">
                <Building className="w-10 h-10 text-violet-600" />
              </div>
              <div className="bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">Krok 2</div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Dodaj swoje obiekty</h4>
              <p className="text-slate-600 text-sm font-medium px-4">W zakładce "Ustawienia" wpisz nazwy swoich domków lub apartamentów i nadaj im unikalne kolory.</p>
            </div>

            {/* Krok 3 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-slate-50 mb-6 group-hover:border-emerald-100 transition-colors">
                <HeartHandshake className="w-10 h-10 text-emerald-600" />
              </div>
              <div className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">Krok 3</div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Dodaj pierwszą rezerwację</h4>
              <p className="text-slate-600 text-sm font-medium px-4">Zaznacz daty w kalendarzu. System od razu wyliczy Twój zysk na czysto i sam zaplanuje wysyłkę kodu PIN dla gościa.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CASE STUDY (REAL WORLD EXAMPLE) */}
      <section id="case-study" className="py-20 md:py-24 bg-slate-50 border-y border-slate-200 relative z-10 overflow-hidden">
        {/* Tło */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-50/50 skew-x-12 transform -translate-x-20 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-xs md:text-sm font-extrabold text-blue-600 tracking-widest uppercase mb-3">Studium Przypadku</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Narzędzie stworzone przez praktyków</h3>
            <p className="text-slate-600 text-base md:text-lg max-w-3xl mx-auto font-medium">Nie jesteśmy tylko programistami. Jesteśmy gospodarzami, którzy stworzyli system z własnej, palącej potrzeby ułożenia chaosu i odzyskania czasu.</p>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden flex flex-col lg:flex-row transform transition-all duration-500 hover:shadow-[0_30px_80px_-15px_rgba(0,0,0,0.15)]">
            
            {/* Lewa strona - Obraz i statystyki */}
            <div className="lg:w-[45%] bg-gradient-to-br from-slate-900 to-slate-800 p-8 md:p-12 text-white relative flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full filter blur-[80px]"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full filter blur-[80px]"></div>
              
              <div className="relative z-10 mb-12">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/10 shadow-lg">
                  <Building className="w-8 h-8 text-blue-400" />
                </div>
                <h4 className="text-2xl md:text-3xl font-extrabold mb-3 tracking-tight">Domki Letniskowe</h4>
                <p className="text-slate-300 font-medium flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" /> Zarządzanie 5 obiektami na Mazurach</p>
              </div>

              <div className="relative z-10 space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
                  <div className="flex items-center gap-3 mb-1">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <p className="text-blue-300 text-xs font-bold uppercase tracking-wider">Oszczędność czasu</p>
                  </div>
                  <p className="text-3xl font-extrabold">12h <span className="text-base text-slate-400 font-medium">/ miesięcznie</span></p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
                  <div className="flex items-center gap-3 mb-1">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <p className="text-emerald-300 text-xs font-bold uppercase tracking-wider">Eliminacja Pomyłek</p>
                  </div>
                  <p className="text-3xl font-extrabold text-emerald-400">100%</p>
                </div>
              </div>
            </div>

            {/* Prawa strona - Historia */}
            <div className="lg:w-[55%] p-8 md:p-12 flex flex-col justify-center bg-white">
              <h4 className="text-2xl font-bold text-slate-900 mb-8 leading-tight">"Po 3 latach używania Excela i zeszytu powiedzieliśmy dość."</h4>
              
              <div className="space-y-6 text-slate-600 font-medium leading-relaxed">
                <p>
                  Obsługa kilku domków letniskowych to nie tylko zyski, ale też mnóstwo powtarzalnych obowiązków. Pamiętanie o podaniu gościom kodu do skrytki, pilnowanie zaliczek, wystawianie faktur i ciągły strach przed overbookingiem, gdy jednocześnie ogłaszaliśmy się na Booking i Airbnb.
                </p>
                <p>
                  Testowaliśmy popularne "Channel Managery". Były przeładowane setkami funkcji dla wielkich hoteli, niezwykle skomplikowane w obsłudze i kosztowały krocie. Po prostu nie pasowały do naszych potrzeb, a generowanie raportów dla księgowej wciąż przyprawiało o ból głowy.
                </p>
                <p>
                  Dlatego stworzyliśmy <strong className="text-slate-900 font-bold bg-blue-50 px-2 py-0.5 rounded">WynajemPro</strong>. Narzędzie, które automatyzuje generowanie unikalnych wiadomości z kodami PIN, automatycznie synchronizuje nasze kalendarze, a jednym kliknięciem wylicza należny ryczałt. Zero zbędnych opcji. Sama esencja najmu krótkoterminowego.
                </p>
              </div>

              <div className="mt-10 flex items-center gap-4 pt-8 border-t border-slate-100">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold text-xl shadow-inner">
                  K
                </div>
                <div>
                  <p className="font-extrabold text-slate-900 text-lg">Kamil & Zespół WynajemPro</p>
                  <p className="text-sm text-slate-500 font-medium">Twórcy systemu i gospodarze</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PORÓWNANIE (DLA KOGO) - ZREMASTEROWANE DO V3 */}
      <section id="dla-kogo" className="py-24 bg-[#0B1120] text-white relative overflow-hidden">
        {/* Lepsze orby świetlne */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[150px]"></div>
          <div className="absolute -bottom-1/4 -left-1/4 w-[800px] h-[800px] bg-indigo-600/20 rounded-full mix-blend-screen filter blur-[150px]"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 md:mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold mb-6">
              Stworzone dla mikroprzedsiębiorców
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">System szyty na miarę, <br className="hidden md:block"/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">nie skomplikowany moloch.</span></h2>
            <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">Obsługujesz wynajem po godzinach? Zobacz, dlaczego właściciele 1-20 obiektów wybierają lekkie i dedykowane narzędzia, zamiast przepłacać za oprogramowanie hotelowe.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12 text-left items-stretch">
            {/* Karta: Konkurencja */}
            <div className="p-8 md:p-10 bg-slate-800/40 backdrop-blur-xl rounded-[2.5rem] border border-slate-700/50 relative flex flex-col">
              <h3 className="text-slate-200 font-extrabold text-xl md:text-2xl mb-8 flex items-center gap-4 relative z-10">
                <div className="p-3 bg-slate-700/50 rounded-2xl shrink-0"><XCircle className="w-6 h-6 text-slate-400" /></div> 
                Tradycyjne systemy
              </h3>
              <ul className="space-y-5 text-slate-400 text-base flex-1">
                <li className="flex gap-4 items-start"><span className="text-slate-600 font-bold mt-1">×</span> <span className="leading-relaxed">Przeładowany interfejs pełen opcji, których nigdy nie użyjesz.</span></li>
                <li className="flex gap-4 items-start"><span className="text-slate-600 font-bold mt-1">×</span> <span className="leading-relaxed">Koszty sięgające od kilkuset do kilku tysięcy złotych rocznie.</span></li>
                <li className="flex gap-4 items-start"><span className="text-slate-600 font-bold mt-1">×</span> <span className="leading-relaxed">Skomplikowane generowanie raportów "hotelowych".</span></li>
                <li className="flex gap-4 items-start"><span className="text-slate-600 font-bold mt-1">×</span> <span className="leading-relaxed">Brak polskiego Ryczałtu i dedykowanych funkcji pod mały wynajem.</span></li>
              </ul>
            </div>

            {/* Karta: WynajemPro */}
            <div className="p-8 md:p-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2.5rem] border border-blue-400/30 shadow-2xl shadow-blue-900/50 relative flex flex-col transform md:scale-105 z-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <h3 className="text-white font-extrabold text-xl md:text-2xl mb-8 flex items-center gap-4 relative z-10">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md shrink-0"><CheckCircle className="w-6 h-6 text-white" /></div> 
                WynajemPro
              </h3>
              <ul className="space-y-5 text-blue-100 text-base font-medium flex-1 relative z-10">
                <li className="flex gap-4 items-start"><div className="bg-blue-400/30 p-1 rounded mt-0.5 shrink-0"><CheckCircle className="w-3.5 h-3.5 text-white" /></div> <span className="leading-relaxed">Jasny i czytelny pulpit z gotową listą zadań na dany dzień.</span></li>
                <li className="flex gap-4 items-start"><div className="bg-blue-400/30 p-1 rounded mt-0.5 shrink-0"><CheckCircle className="w-3.5 h-3.5 text-white" /></div> <span className="leading-relaxed">Automatycznie generowane przewidniki dla gości na każdy obiekt.</span></li>
                <li className="flex gap-4 items-start"><div className="bg-blue-400/30 p-1 rounded mt-0.5 shrink-0"><CheckCircle className="w-3.5 h-3.5 text-white" /></div> <span className="leading-relaxed">Zautomatyzowane podatki i jedno kliknięcie do podsumowania miesiąca.</span></li>
                <li className="flex gap-4 items-start"><div className="bg-blue-400/30 p-1 rounded mt-0.5 shrink-0"><CheckCircle className="w-3.5 h-3.5 text-white" /></div> <span className="leading-relaxed">Stała, niska cena (29,99 zł) niezależnie od ilości rezerwacji.</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SEKCJA: KALKULATOR ROI */}
      <section className="py-20 md:py-24 bg-slate-50 relative z-10 overflow-hidden border-y border-slate-200">
        {/* Dekoracyjne tło */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-100/30 skew-x-12 transform -translate-x-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-full bg-indigo-100/30 -skew-x-12 transform translate-x-20 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-xs md:text-sm font-extrabold text-indigo-600 tracking-widest uppercase mb-3">Kalkulator Oszczędności</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Przestań oddawać 15% swoich zysków.<br/>Policz, ile tracisz.</h3>
            <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto font-medium">Sprawdź, ile czasu i pieniędzy możesz zaoszczędzić każdego miesiąca, automatyzując obsługę gości i zyskując na bezpośrednich rezerwacjach z WynajemPro.</p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <RoiCalculator />
          </div>
        </div>
      </section>

      {/* CENNIK (PREMIUM) */}
      <section id="cennik" className="py-20 md:py-24 bg-white relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xs md:text-sm font-extrabold text-blue-600 tracking-widest uppercase mb-3">Prosty Cennik</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6">Zwraca się szybciej,<br/>niż jedna doba najmu.</h3>
          <p className="text-slate-600 text-base md:text-lg mb-12 md:mb-16 font-medium">Zrezygnowaliśmy z pobierania prowizji od rezerwacji. Stała opłata, bez żadnych limitów obiektów i rezerwacji.</p>
          
          {/* Główna karta cennika z gradientowym borderem */}
          <div className="relative p-[3px] rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-600 max-w-lg mx-auto shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/40 transition-shadow duration-500">
            
            {/* Wnętrze karty */}
            <div className="bg-slate-900 rounded-[1.8rem] md:rounded-[2.3rem] p-8 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-[10px] md:text-xs font-bold px-6 py-2 rounded-b-2xl shadow-sm whitespace-nowrap">
                OFERTA NA START
              </div>
              
              <h4 className="text-xl md:text-2xl font-bold text-white mb-2 mt-4">Plan Gospodarza</h4>
              <p className="text-slate-400 text-xs md:text-sm mb-6">Wszystkie funkcje bez żadnych limitów.</p>
              
              <div className="flex justify-center items-end gap-1 mb-4">
                <span className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">29,99</span>
                <span className="text-slate-400 font-medium mb-1 md:mb-2 text-sm md:text-base">zł / miesiąc</span>
              </div>
              
              <div className="inline-block bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs md:text-sm font-bold px-4 py-1.5 rounded-lg mb-8 md:mb-10">
                Możesz anulować w dowolnym momencie!
              </div>

              <ul className="text-left space-y-4 md:space-y-5 mb-8 md:mb-10 text-slate-300 text-sm font-medium">
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-blue-500 shrink-0" /> Nielimitowana ilość rezerwacji</li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-blue-500 shrink-0" /> Automatyczne raporty i podatki</li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-blue-500 shrink-0" /> Interaktywny kalendarz wynajmu</li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-blue-500 shrink-0" /> Szyfrowana baza w chmurze</li>
                <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-blue-500 shrink-0" /> Brak ukrytych prowizji</li>
              </ul>

              <button onClick={handleAction} className="w-full bg-white hover:bg-slate-50 text-slate-900 px-6 py-4 rounded-xl text-sm md:text-base font-extrabold shadow-xl transition-transform hover:-translate-y-1">
                Zacznij 14-dniowy test
              </button>
              <div className="mt-5 space-y-2">
                <p className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Nie wymagamy podawania danych karty kredytowej.
                </p>
                <p className="text-[10px] md:text-xs text-slate-500 font-medium">
                  Brak długoterminowych umów. Anulujesz subskrypcję jednym kliknięciem.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4">Często zadawane pytania</h2>
            <p className="text-slate-600 font-medium">Wszystko, co musisz wiedzieć przed startem.</p>
          </div>
          
          <div className="space-y-4">
            <FaqItem 
              question="Czy muszę podpinać kartę płatniczą, żeby zacząć testy?" 
              answer="Absolutnie nie. Rejestrujesz się podając tylko e-mail i hasło. Otrzymujesz 14 dni pełnego dostępu. Decyzję o płatności podejmujesz dopiero, gdy upewnisz się, że system realnie oszczędza Twój czas." 
            />
            <FaqItem 
              question="Czy aplikacja chroni przed overbookingiem (Booking, Airbnb)?" 
              answer="Tak! WynajemPro obsługuje synchronizację kalendarzy w standardzie iCal. Dzięki temu rezerwacje z popularnych portali automatycznie blokują terminy w Twoim kalendarzu, skutecznie zapobiegając tzw. podwójnym rezerwacjom." 
            />
            <FaqItem 
              question="Czy system wylicza polskie podatki (Ryczałt)?" 
              answer="Tak! Nasza aplikacja została stworzona z myślą o polskich realiach. Wspiera m.in. zautomatyzowane wyliczanie Ryczałtu 8,5% wraz z automatycznym przejściem na próg 12,5% po przekroczeniu 100 000 zł." 
            />
            <FaqItem 
              question="Posiadam 5 domków. Czy abonament wyniesie mnie więcej?" 
              answer="Nie. Cena 29,99 zł miesięcznie to opłata ryczałtowa za całe konto. Możesz dodać 1, 5, a nawet 20 obiektów i nielimitowaną liczbę rezerwacji w tej samej, stałej cenie." 
            />
            <FaqItem 
              question="Czy aplikacja działa na telefonie?" 
              answer="Tak, WynajemPro jest w pełni responsywny. Oznacza to, że z powodzeniem możesz dodawać rezerwacje, przeglądać kalendarz i sprawdzać koszty ze swojego smartfona będąc w drodze." 
            />
            <FaqItem 
              question="Co w sytuacji, gdy będę potrzebować pomocy z obsługą?" 
              answer="Nasza aplikacja jest zaprojektowana tak, by nie wymagała szkoleń. Jeśli jednak utkniesz, nasz polskojęzyczny zespół wsparcia jest do Twojej dyspozycji. Zawsze otrzymasz od nas ludzką, zrozumiałą odpowiedź, a nie odpowiedź od bota." 
            />
          </div>
        </div>
      </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-10 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5 opacity-80 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <HomeIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">
              Wynajem<span className="text-blue-600">Pro</span>
            </span>
          </div>
          <div className="text-xs md:text-sm font-medium text-slate-500 text-center">
            © {new Date().getFullYear()} WynajemPro. Wszelkie prawa zastrzeżone.
          </div>
          <div className="flex gap-4 md:gap-6 text-xs md:text-sm font-medium text-slate-500">
            <Link to="/regulamin" className="hover:text-blue-600 transition-colors">Regulamin</Link>
            <Link to="/prywatnosc" className="hover:text-blue-600 transition-colors">Prywatność</Link>
            <Link to="/kontakt" className="hover:text-blue-600 transition-colors">Kontakt</Link>
          </div>
        </div>
      </footer>

      {/* MODAL PRZEWODNIKA GOŚCIA (Pigułka Interaktywności) */}
      {isGuestGuideModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsGuestGuideModalOpen(false)}></div>
          
          {/* Mockup Telefonu */}
          <div className="relative bg-black rounded-[3rem] w-full max-w-[340px] h-[750px] shadow-2xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300 border-[8px] border-black ring-1 ring-slate-800 flex flex-col">
            {/* Notch */}
            <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
              <div className="w-32 h-6 bg-black rounded-b-3xl"></div>
            </div>

            {/* Ekran wewnętrzny (Treść Przewodnika) */}
            <div className="bg-slate-50 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative rounded-[2rem] flex flex-col">
              
              {/* Header z obrazkiem */}
              <div className="h-48 bg-gradient-to-br from-indigo-500 to-blue-600 relative p-6 flex flex-col justify-end text-white shadow-inner shrink-0">
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full p-1.5 cursor-pointer hover:bg-white/30 transition-colors z-20" onClick={() => setIsGuestGuideModalOpen(false)}>
                  <X className="w-5 h-5 text-white" />
                </div>
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1510798831971-661eb04b3739?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-60"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="relative z-10">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-200 mb-1 block">Twój Przewodnik</span>
                  <h3 className="text-2xl font-extrabold leading-tight">Domki Letniskowe</h3>
                  <p className="text-sm font-medium text-slate-300 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Domek nr 2</p>
                </div>
              </div>

              {/* Zawartość */}
              <div className="p-5 space-y-4 shrink-0 mb-auto">
                
                {/* Powitanie */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    Cześć! Witamy w naszym obiekcie. Poniżej znajdziesz wszystkie najważniejsze informacje, które ułatwią Ci pobyt.
                  </p>
                </div>

                {/* Sekcja: Kod PIN */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 group hover:border-blue-200 transition-colors cursor-pointer">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Kod do skrytki na klucze</p>
                    <p className="text-xl font-extrabold text-slate-800 tracking-widest mt-0.5 group-hover:text-blue-600 transition-colors">4921</p>
                  </div>
                </div>

                {/* Sekcja: Wi-Fi */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 group hover:border-blue-200 transition-colors cursor-pointer">
                  <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Sieć Wi-Fi</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">Domek WiFi</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">Hasło: <span className="font-mono bg-slate-100 px-1 rounded text-slate-700">Wiosna2026!</span></p>
                  </div>
                </div>

                {/* Sekcja: Regulamin / Info */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                  <h4 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> Warto wiedzieć
                  </h4>
                  <ul className="text-xs text-slate-600 font-medium space-y-2">
                    <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1 shrink-0"></div> Doba hotelowa kończy się o 11:00.</li>
                    <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1 shrink-0"></div> Śmieci prosimy segregować do pojemników za domkiem.</li>
                    <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1 shrink-0"></div> Grill znajduje się na tarasie (węgiel pod schodami).</li>
                  </ul>
                </div>

                {/* Mapa */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 overflow-hidden relative group cursor-pointer hover:border-blue-200 transition-colors">
                  <h4 className="text-sm font-bold text-slate-800 mb-2">Jak dojechać</h4>
                  <div className="w-full h-24 bg-slate-200 rounded-xl overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center opacity-60 mix-blend-multiply filter grayscale transition-all duration-500 group-hover:grayscale-0 group-hover:opacity-80"></div>
                    <div className="absolute inset-0 bg-blue-600/10 group-hover:bg-transparent transition-colors"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce group-hover:scale-110 transition-transform">
                        <MapPin className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
              
              {/* Stopka telefonu */}
              <div className="p-5 pb-8 pt-4 bg-slate-50 border-t border-slate-200 shrink-0 mt-auto sticky bottom-0 z-20">
                <button 
                  onClick={() => setIsGuestGuideModalOpen(false)}
                  className="w-full bg-slate-900 hover:bg-black text-white text-sm font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-slate-900/20"
                >
                  Zamknij Przewodnik
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Pomocniczy komponent nowoczesnej karty funkcji
function ModernFeatureCard({ icon, color, title, desc }) {
  const colorMap = {
    blue: 'bg-blue-500/10 text-blue-600 ring-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-600 ring-purple-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-600 ring-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-600 ring-amber-500/20',
    pink: 'bg-pink-500/10 text-pink-600 ring-pink-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-600 ring-indigo-500/20',
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 group">
      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mb-5 md:mb-6 ring-1 ${colorMap[color]} group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-lg md:text-xl font-extrabold text-slate-900 mb-2 md:mb-3">{title}</h3>
      <p className="text-sm md:text-base text-slate-600 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}

// Komponent FAQ (Akordeon)
function FaqItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all hover:border-blue-200">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none"
      >
        <span className="font-bold text-slate-800 pr-4">{question}</span>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
      </button>
      <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
        <p className="text-slate-600 text-sm font-medium leading-relaxed border-t border-slate-100 pt-4">
          {answer}
        </p>
      </div>
    </div>
  );
}

// Prosta ikona domku
function HomeIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  );
}