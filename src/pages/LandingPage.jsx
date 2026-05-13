import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle, CalendarDays, Calculator, Bell, BarChart3, 
  ArrowRight, ShieldCheck, XCircle, Coffee, TrendingUp, 
  Users, Sparkles, Menu, ChevronDown, Star, LogIn, 
  HeartHandshake, Building, X, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("Akcja kliknięta (Logowanie/Rejestracja)");

  // Referencja do karuzeli
  const carouselRef = useRef(null);

  // Stan opinii
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({ author: '', role: '', text: '', rating: 5 });
  const [opinions, setOpinions] = useState([
    {
      id: 1,
      author: "Anna K.",
      role: "Zarządza 3 apartamentami w Sopocie",
      text: "Wcześniej próbowałam korzystać z dużych systemów hotelowych, ale płaciłam za funkcje, których nigdy nie użyłam. WynajemPro jest genialny w swojej prostocie. Raport podatkowy to złoto!",
      rating: 5,
      verified: true,
      initial: "A",
      avatarBg: "bg-blue-100",
      avatarText: "text-blue-700"
    },
    {
      id: 2,
      author: "Michał T.",
      role: "Właściciel 5 domków w Bieszczadach",
      text: "Wreszcie pożegnałem się z zeszytem i Excelem. Możliwość dodawania rezerwacji z telefonu, gdziekolwiek jestem, to mistrzostwo. Do tego widzę dokładnie, czy gość wpłacił już zaliczkę. Gorąco polecam każdemu.",
      rating: 5,
      verified: true,
      initial: "M",
      avatarBg: "bg-amber-100",
      avatarText: "text-amber-700"
    },
    {
      id: 3,
      author: "Katarzyna W.",
      role: "Wynajmuje apartament w Warszawie",
      text: "Zawsze zapominałam o wysłaniu kodu PIN w dniu przyjazdu gości. Odkąd korzystam z przypomnień w WynajemPro, aplikacja myśli za mnie. To niesamowita ulga dla głowy!",
      rating: 5,
      verified: true,
      initial: "K",
      avatarBg: "bg-violet-100",
      avatarText: "text-violet-700"
    }
  ]);

  const handleAddReview = (e) => {
    e.preventDefault();
    const newOp = {
      id: Date.now(),
      author: newReview.author || "Anonim",
      role: newReview.role || "Użytkownik WynajemPro",
      text: newReview.text,
      rating: newReview.rating,
      verified: true,
      initial: newReview.author ? newReview.author.charAt(0).toUpperCase() : "U",
      avatarBg: "bg-emerald-100",
      avatarText: "text-emerald-700"
    };
    
    // Dodajemy nową opinię na początek listy
    setOpinions([newOp, ...opinions]);
    setIsReviewModalOpen(false);
    setNewReview({ author: '', role: '', text: '', rating: 5 }); // czyszczenie formularza
    setToastMessage("Twoja opinia została dodana! Dziękujemy.");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);

    // Automatycznie przewiń na początek karuzeli po dodaniu opinii
    if (carouselRef.current) {
      setTimeout(() => {
        carouselRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  // Funkcje obsługi karuzeli (przewijanie)
  const scrollLeft = () => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.children[0].offsetWidth + 24; // 24 to gap (1.5rem)
      carouselRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.children[0].offsetWidth + 24;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Zastępcza funkcja logowania/rejestracji
  const handleAction = () => {
    setToastMessage("Akcja kliknięta (Logowanie/Rejestracja)");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#fafcff] font-sans text-slate-900 selection:bg-blue-200 overflow-x-hidden relative scroll-smooth">
      
      {/* Tost (Zastępcze powiadomienie zamiast alertu) */}
      {showToast && (
        <div className="fixed bottom-4 right-4 z-[100] bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      {/* TŁO - NOWOCZESNE ROZMYTE ŚWIATŁA (GLOWING ORBS) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/30 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"></div>
      <div className="absolute top-[10%] right-[-5%] w-[30rem] h-[30rem] bg-violet-400/20 rounded-full mix-blend-multiply filter blur-[120px] opacity-70"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[40rem] h-[40rem] bg-cyan-300/20 rounded-full mix-blend-multiply filter blur-[120px] opacity-60"></div>

      {/* NAWIGACJA */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-xl z-50 border-b border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-2.5 hover:opacity-80 transition-opacity cursor-pointer z-50" onClick={() => window.scrollTo(0, 0)}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <HomeIcon className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-2xl tracking-tighter text-slate-800">
                Wynajem<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-500">Pro</span>
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex gap-10 font-bold text-sm text-slate-500">
              <a href="#funkcje" className="hover:text-blue-600 transition-colors">Możliwości</a>
              <a href="#jak-to-dziala" className="hover:text-blue-600 transition-colors">Jak to działa?</a>
              <a href="#opinie" className="hover:text-blue-600 transition-colors">Opinie</a>
              <a href="#cennik" className="hover:text-blue-600 transition-colors">Cennik</a>
            </div>

            {/* Desktop Buttons */}
            <div className="hidden md:flex gap-4 items-center">
              <Link to="/login" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"> Zaloguj się  </Link>
              <Link to="/login" className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-xl shadow-slate-900/20 transition-all hover:scale-105 hover:-translate-y-0.5">
  Wypróbuj za darmo
</Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center z-50">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                className="text-slate-600 hover:text-slate-900 p-2"
              >
                {isMobileMenuOpen ? <XCircle className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-100 shadow-2xl py-6 px-6 flex flex-col gap-6 animate-in slide-in-from-top-4">
            <a href="#funkcje" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-slate-600 hover:text-blue-600">Możliwości</a>
            <a href="#jak-to-dziala" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-slate-600 hover:text-blue-600">Jak to działa?</a>
            <a href="#opinie" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-slate-600 hover:text-blue-600">Opinie</a>
            <a href="#cennik" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-slate-600 hover:text-blue-600">Cennik</a>
            <div className="h-px bg-slate-100 w-full my-2"></div>
            <button onClick={() => { setIsMobileMenuOpen(false); handleAction(); }} className="text-lg font-bold text-slate-600 text-left">Zaloguj się</button>
            <button onClick={() => { setIsMobileMenuOpen(false); handleAction(); }} className="bg-blue-600 text-white px-6 py-3 rounded-xl text-lg font-bold shadow-lg shadow-blue-600/20 text-center">
              Wypróbuj za darmo (14 dni)
            </button>
          </div>
        )}
      </nav>

      {/* SEKCJA HERO */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200/60 shadow-sm text-slate-700 text-xs font-bold mb-8 backdrop-blur-md hover:border-blue-300 transition-colors cursor-default">
            <Sparkles className="w-4 h-4 text-amber-400" /> Stworzone przez wynajmujących, dla wynajmujących.
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-8 tracking-tight">
            Zarabiaj na wynajmie. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600">
              Odpoczywaj od formalności.
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto font-medium px-4">
            Masz kilka domków lub apartamentów i całą obsługę na swojej głowie? Poczuj gigantyczną ulgę i zapanuj nad chaosem w swoim mikro-biznesie.
            <span className="block mt-2 font-semibold text-slate-700">
               Koniec z overbookingiem (iCal dla Booking/Airbnb). Banalne podatki. Jasna rentowność każdego obiektu.
            </span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
            <Link to="/login" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white px-8 py-4 rounded-2xl text-base font-bold shadow-xl shadow-blue-600/25 transition-all hover:-translate-y-1 flex items-center justify-center gap-2 group">
  Rozpocznij 14-dniowy test <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
</Link>
            <a href="#jak-to-dziala" className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-8 py-4 rounded-2xl text-base font-bold shadow-sm transition-all hover:-translate-y-1 flex items-center justify-center gap-2">
              Zobacz, jak to działa
            </a>
          </div>
          <p className="text-xs text-slate-500 mt-5 font-medium flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-green-500" /> Bez podpinania karty. Później tylko 29,99 zł / miesiąc.
          </p>
        </div>

        {/* NOWOCZESNY MOCKUP "BENTO BOX" BAZUJĄCY NA REALNEJ APLIKACJI */}
        <div className="mt-16 md:mt-20 max-w-5xl mx-auto relative perspective-1000 px-2 sm:px-0">
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

      {/* KLUCZOWE FUNKCJE */}
      <section id="funkcje" className="py-20 md:py-24 bg-white border-y border-slate-100 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-xs md:text-sm font-extrabold text-blue-600 tracking-widest uppercase mb-3">Wszystko w jednym miejscu</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Skup się na gościach.<br/>My zajmiemy się resztą.</h3>
            <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto font-medium">Rozwiązujemy realne problemy mikroprzedsiębiorców. Masz kilka obiektów i brakuje Ci rąk do pracy? WynajemPro działa jak Twój wirtualny asystent, chroniąc Cię przed błędami.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <ModernFeatureCard 
              icon={<Coffee className="w-6 h-6 text-blue-600" />}
              color="blue"
              title="Poranny Raport Dnia"
              desc="Otwierasz aplikację przy kawie i wiesz wszystko. System podaje na tacy listę dzisiejszych zameldowań, wymeldowań i zadań do wykonania. Zero zgadywania."
            />
            <ModernFeatureCard 
              icon={<Bell className="w-6 h-6 text-amber-500" />}
              color="amber"
              title="Dopasowane Powiadomienia"
              desc="Twórz własne reguły i zadania. System przypomni Ci nie tylko o wysłaniu kodu PIN, ale też np. o włączeniu ogrzewania przed przyjazdem gości w domku nr 2."
            />
            <ModernFeatureCard 
              icon={<BarChart3 className="w-6 h-6 text-emerald-600" />}
              color="emerald"
              title="Błyskawiczne Zestawienia"
              desc="Zamiast żmudnego 'generowania raportów', otrzymujesz czytelne podsumowania zysków i kosztów jednym kliknięciem. Idealne do analizy lub dla Twojej księgowej."
            />
            <ModernFeatureCard 
              icon={<CalendarDays className="w-6 h-6 text-indigo-600" />}
              color="indigo"
              title="Synchronizacja z iCal (Booking/Airbnb)"
              desc="Zarządzaj terminami bez paraliżującego stresu o overbooking. Rezerwacje z zewnętrznych portali zablokują daty w Twoim systemie automatycznie."
            />
            <ModernFeatureCard 
              icon={<Calculator className="w-6 h-6 text-purple-600" />}
              color="purple"
              title="Automatyczne Podatki"
              desc="Aplikacja odciąża Cię w rozliczeniach z urzędem. Wpisujesz przychód, a system sam wylicza polski ryczałt (np. 8,5%) i pilnuje groźnych progów podatkowych."
            />
            <ModernFeatureCard 
              icon={<Users className="w-6 h-6 text-pink-600" />}
              color="pink"
              title="Kontrola Płatności"
              desc="Błyskawicznie sprawdzaj kto wpłacił zaliczkę, kto uregulował całość, a kto wciąż zalega z opłatą za pobyt, by uniknąć nieporozumień z gośćmi."
            />
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

      {/* OPINIE KLIENTÓW (SOCIAL PROOF) - KARUZELA */}
      <section id="opinie" className="py-20 md:py-24 bg-white border-y border-slate-200 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-xs md:text-sm font-extrabold text-blue-600 tracking-widest uppercase mb-3">Zaufali nam</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Dołącz do grona zadowolonych gospodarzy</h3>
            <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto font-medium mb-8">Zobacz, jak WynajemPro odmienił codzienną pracę właścicieli domków i apartamentów w całej Polsce.</p>
            
            <button 
              onClick={() => setIsReviewModalOpen(true)} 
              className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-6 py-3 rounded-xl text-sm font-bold shadow-sm transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 mx-auto group"
            >
              <Star className="w-4 h-4 text-amber-400 fill-amber-400 group-hover:scale-110 transition-transform" /> 
              Dodaj swoją opinię
            </button>
          </div>

          <div className="relative group">
            {/* Przycisk przewijania w lewo (widoczny na md+) */}
            <button 
              onClick={scrollLeft}
              className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full shadow-xl border border-slate-100 items-center justify-center text-slate-600 hover:text-blue-600 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label="Poprzednia opinia"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Kontener Karuzeli (ukryte paski przewijania) */}
            <div 
              ref={carouselRef}
              className="flex gap-6 lg:gap-8 overflow-x-auto snap-x snap-mandatory pb-8 pt-4 px-2 sm:px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
            >
              {opinions.map((opinion) => (
                <div 
                  key={opinion.id} 
                  className="group bg-white hover:bg-blue-50/50 border border-slate-100 hover:border-blue-200 p-8 rounded-3xl flex flex-col h-[400px] relative shrink-0 w-[85vw] sm:w-[350px] lg:w-[400px] snap-center transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/10 cursor-default"
                >
                  <div className="absolute top-8 right-8 text-slate-100 group-hover:text-blue-100 transition-colors duration-300">
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z"/></svg>
                  </div>
                  <div className="flex gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 transition-transform duration-300 ${i < opinion.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} group-hover:scale-110`} />
                    ))}
                  </div>
                  <p className="text-slate-700 italic font-medium mb-8 relative z-10 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex-grow transition-colors duration-300">
                    "{opinion.text}"
                  </p>
                  <div className="flex items-center gap-4 mt-auto relative z-10">
                    <div className={`w-12 h-12 ${opinion.avatarBg} rounded-full flex items-center justify-center ${opinion.avatarText} font-bold text-lg shrink-0 transition-all duration-300 group-hover:ring-4 group-hover:ring-blue-100`}>
                      {opinion.initial}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 flex items-center gap-1 transition-colors duration-300">
                        {opinion.author} 
                        {opinion.verified && <CheckCircle className="w-4 h-4 text-blue-500 fill-blue-50 transition-transform duration-300 group-hover:scale-110 group-hover:text-blue-600" />}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium line-clamp-1 transition-colors duration-300">{opinion.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Przycisk przewijania w prawo (widoczny na md+) */}
            <button 
              onClick={scrollRight}
              className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white rounded-full shadow-xl border border-slate-100 items-center justify-center text-slate-600 hover:text-blue-600 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label="Następna opinia"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex justify-center gap-2 mt-4">
            {/* Kropki sugerujące możliwość przewijania na smartfonach */}
            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
            <div className="w-2 h-2 rounded-full bg-slate-200"></div>
            <div className="w-2 h-2 rounded-full bg-slate-200"></div>
          </div>
        </div>
      </section>

      {/* PORÓWNANIE (DLA KOGO) */}
      <section id="dla-kogo" className="py-20 md:py-24 bg-slate-900 text-white relative overflow-hidden">
        {/* Tło - ciemne orby */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[40rem] h-[40rem] bg-blue-600/20 rounded-full mix-blend-screen filter blur-[100px]"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[30rem] h-[30rem] bg-purple-600/20 rounded-full mix-blend-screen filter blur-[100px]"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Mniej stresu. Więcej czasu na <Coffee className="inline w-8 h-8 text-amber-400 -mt-2" /></h2>
            <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">Obsługujesz wynajem po godzinach? Zobacz, dlaczego mikroprzedsiębiorcy wybierają mądre rozwiązania zamiast skomplikowanych molochów.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 text-left">
            {/* Karta: Konkurencja */}
            <div className="p-6 md:p-8 bg-slate-800/50 backdrop-blur-md rounded-3xl border border-slate-700/50 relative overflow-hidden group hover:border-slate-600 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h3 className="text-slate-300 font-bold text-lg md:text-xl mb-6 flex items-center gap-3 relative z-10">
                <div className="p-2 bg-slate-700/50 rounded-lg shrink-0"><XCircle className="w-5 h-5 text-slate-400" /></div> 
                Drogie systemy hotelowe
              </h3>
              <ul className="space-y-4 text-slate-400 text-sm md:text-base relative z-10">
                <li className="flex gap-3 items-start"><span className="text-slate-600 font-bold mt-0.5">×</span> Sztywny układ, którego nie dopasujesz do siebie.</li>
                <li className="flex gap-3 items-start"><span className="text-slate-600 font-bold mt-0.5">×</span> Skomplikowane raporty, z których i tak nie korzystasz.</li>
                <li className="flex gap-3 items-start"><span className="text-slate-600 font-bold mt-0.5">×</span> Brak prostego podglądu "co mam dziś zrobić".</li>
                <li className="flex gap-3 items-start"><span className="text-slate-600 font-bold mt-0.5">×</span> Kosztują od 600 do nawet 1500 zł rocznie.</li>
              </ul>
            </div>

            {/* Karta: WynajemPro */}
            <div className="p-6 md:p-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl border border-blue-500/50 shadow-2xl shadow-blue-900/50 relative overflow-hidden transform md:-translate-y-4">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <h3 className="text-white font-bold text-lg md:text-xl mb-6 flex items-center gap-3 relative z-10">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm shrink-0"><CheckCircle className="w-5 h-5 text-white" /></div> 
                WynajemPro
              </h3>
              <ul className="space-y-4 text-blue-100 text-sm md:text-base font-medium relative z-10">
                <li className="flex gap-3 items-start"><span className="text-blue-300 font-bold mt-0.5">✓</span> Poranny "Raport Dnia" – pijesz kawę i wiesz, jaki masz plan.</li>
                <li className="flex gap-3 items-start"><span className="text-blue-300 font-bold mt-0.5">✓</span> Własne zadania przypisane do rezerwacji (np. sprzątanie).</li>
                <li className="flex gap-3 items-start"><span className="text-blue-300 font-bold mt-0.5">✓</span> Podsumowania dla księgowej w jedno kliknięcie.</li>
                <li className="flex gap-3 items-start"><span className="text-blue-300 font-bold mt-0.5">✓</span> Ułamek ceny (tylko 29,99 zł miesięcznie za całość).</li>
              </ul>
            </div>
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
            <a href="#" className="hover:text-blue-600 transition-colors">Regulamin</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Prywatność</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Kontakt</a>
          </div>
        </div>
      </footer>

      {/* MODAL DODAWANIA OPINII */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsReviewModalOpen(false)}></div>
          <div className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-extrabold text-slate-900">Dodaj opinię</h3>
                <button onClick={() => setIsReviewModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 bg-slate-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleAddReview} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Twoja ocena</label>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star} 
                        className={`w-8 h-8 cursor-pointer transition-colors ${star <= newReview.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200 hover:text-amber-200 hover:fill-amber-200'}`}
                        onClick={() => setNewReview({...newReview, rating: star})}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Imię i nazwisko / Nazwa firmy</label>
                  <input 
                    required
                    type="text" 
                    value={newReview.author}
                    onChange={(e) => setNewReview({...newReview, author: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm font-medium text-slate-700"
                    placeholder="np. Jan K."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Krótki opis działalności (opcjonalnie)</label>
                  <input 
                    type="text" 
                    value={newReview.role}
                    onChange={(e) => setNewReview({...newReview, role: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm font-medium text-slate-700"
                    placeholder="np. Właściciel 2 domków w Zakopanem"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Treść opinii</label>
                  <textarea 
                    required
                    rows="4"
                    value={newReview.text}
                    onChange={(e) => setNewReview({...newReview, text: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm font-medium text-slate-700 resize-none"
                    placeholder="Co sądzisz o naszej aplikacji? Co podoba Ci się najbardziej?"
                  ></textarea>
                </div>

                <div className="pt-2">
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition-transform hover:-translate-y-0.5">
                    Opublikuj opinię (Zweryfikowany)
                  </button>
                </div>
              </form>
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