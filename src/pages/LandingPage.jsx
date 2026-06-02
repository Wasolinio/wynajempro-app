import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Menu, X, Home, ArrowRight, CheckCircle, 
  Smartphone, BarChart3, CalendarDays, CheckSquare, ChevronDown
} from 'lucide-react';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: "Czy muszę podpinać kartę na starcie?",
      a: "Nie! Rozpoczynasz 14-dniowy okres próbny całkowicie bez zobowiązań. O nic nie pytamy."
    },
    {
      q: "Czy aplikacja wspiera wielu użytkowników?",
      a: "Tak, możesz dodawać współpracowników (np. ekipę sprzątającą) z ograniczonym dostępem do widoków."
    },
    {
      q: "Jak działa synchronizacja z Bookingiem i Airbnb?",
      a: "Wykorzystujemy niezawodny standard iCal. Wystarczy wkleić linki do naszych ustawień, a my zrobimy resztę automatycznie."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-200">
      
      {/* STICKY HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
             <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
               <Home className="w-5 h-5 text-white" />
             </div>
             <span className="font-extrabold text-2xl tracking-tighter">Wynajem<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Pro</span></span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 font-bold text-sm text-slate-600">
            <a href="#funkcje" className="hover:text-indigo-600 transition-colors">Funkcje</a>
            <a href="#cennik" className="hover:text-indigo-600 transition-colors">Cennik</a>
            <a href="#faq" className="hover:text-indigo-600 transition-colors">FAQ</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900">Zaloguj</Link>
            <Link to="/login" className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg transition-transform hover:-translate-y-0.5">
              Rozpocznij za darmo
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white/95 backdrop-blur-xl border-b border-slate-100 p-6 flex flex-col gap-6 shadow-2xl">
            <a href="#funkcje" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-slate-700">Funkcje</a>
            <a href="#cennik" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-slate-700">Cennik</a>
            <a href="#faq" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-slate-700">FAQ</a>
            <hr className="border-slate-100" />
            <Link to="/login" className="text-lg font-bold text-slate-700 text-center">Zaloguj się</Link>
            <Link to="/login" className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-lg font-bold text-center shadow-lg">Rozpocznij za darmo</Link>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-20 md:pt-48 md:pb-32 px-4 overflow-hidden">
        {/* Abstract Blobs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-400/20 rounded-full blur-[120px] -z-10 mix-blend-multiply"></div>
        <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-indigo-400/20 rounded-full blur-[100px] -z-10 mix-blend-multiply"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-8 shadow-sm">
            🚀 Nowość: Kreator Cyfrowych Przewodników
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
            <a href="#funkcje" className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 rounded-2xl font-bold shadow-sm border border-slate-200 transition-colors flex items-center justify-center">
              Poznaj możliwości
            </a>
          </div>
          <p className="mt-4 text-xs font-semibold text-slate-500 flex items-center justify-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-500" /> Karta kredytowa nie jest wymagana
          </p>
        </div>

        {/* UI MOCKUP */}
        <div className="mt-20 max-w-5xl mx-auto relative perspective-1000 px-2 sm:px-0 z-10">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent z-20 h-full w-full pointer-events-none"></div>
          
          <div className="bg-white/40 backdrop-blur-2xl border border-white p-4 md:p-6 rounded-[2rem] shadow-2xl shadow-indigo-900/10 transform md:-rotate-x-12 md:rotate-y-6 md:scale-105 transition-transform hover:rotate-0 hover:scale-100 duration-700 flex flex-col md:flex-row gap-6 mx-4">
            
            <div className="flex-1 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center"><CalendarDays className="w-5 h-5 text-indigo-600" /></div>
                  <div><h3 className="font-bold text-slate-800">Kalendarz</h3><p className="text-xs text-slate-500">Najbliższe dni</p></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-slate-50 rounded-xl p-3 flex justify-between items-center border border-slate-100">
                  <div className="flex gap-3 items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                    <div><p className="text-sm font-bold text-slate-800">Apartament Centrum</p><p className="text-xs text-slate-500">Jan K. • Booking.com</p></div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md">Opłacone</span>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 flex justify-between items-center border border-slate-100">
                  <div className="flex gap-3 items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                    <div><p className="text-sm font-bold text-slate-800">Domek nad Jeziorem</p><p className="text-xs text-slate-500">Anna W. • Airbnb</p></div>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-md">Zaliczka</span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-64 flex flex-col gap-4">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white shadow-xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Przychód (Maj)</p>
                <p className="text-2xl font-extrabold">12 450 <span className="text-sm text-slate-400">zł</span></p>
                <div className="mt-3 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-lg w-fit inline-block">+14% m/m</div>
              </div>
              <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Zadania</p>
                  <p className="text-lg font-extrabold text-slate-800">2 do zrobienia</p>
                </div>
                <CheckSquare className="w-8 h-8 text-blue-500 opacity-20" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* BENTO GRID FEATURES */}
      <section id="funkcje" className="py-24 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Wszystko, czego potrzebujesz.</h2>
            <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto">Skomponowaliśmy funkcje, które zdejmują najwięcej pracy z barków gospodarzy, zamykając je w przepięknym interfejsie.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(250px,auto)]">
            
            {/* Karta 1: Cyfrowe Przewodniki (Duża) */}
            <div className="md:col-span-2 md:row-span-2 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[2rem] p-8 md:p-12 border border-indigo-100 relative overflow-hidden group">
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700"></div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-6">
                  <Smartphone className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Cyfrowe Przewodniki dla Gości</h3>
                <p className="text-slate-600 text-base md:text-lg font-medium max-w-md">Koniec z drukowanymi regulaminami. Generuj piękne, mobilne strony dla swoich obiektów z kodem Wi-Fi, regulaminem i instrukcjami, udostępniane jednym linkiem.</p>
              </div>
            </div>

            {/* Karta 2: Finanse */}
            <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mb-6">
                <BarChart3 className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-3 tracking-tight">Automatyzacja Finansów</h3>
              <p className="text-slate-600 font-medium text-sm">System automatycznie zlicza przychody, odlicza prowizje i podpowiada wysokość polskiego Ryczałtu.</p>
            </div>

            {/* Karta 3: Kalendarz */}
            <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mb-6">
                <CalendarDays className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-3 tracking-tight">Interaktywny Kalendarz</h3>
              <p className="text-slate-600 font-medium text-sm">Synchronizacja dwukierunkowa iCal z Bookingiem i Airbnb chroni Cię przed podwójnymi rezerwacjami.</p>
            </div>

            {/* Karta 4: Zadania (Szeroka) */}
            <div className="md:col-span-3 bg-slate-900 rounded-[2rem] p-8 md:p-12 overflow-hidden relative group">
              <div className="absolute right-10 top-1/2 -translate-y-1/2 opacity-10 group-hover:opacity-20 transition-opacity">
                <CheckSquare className="w-48 h-48 text-white" />
              </div>
              <div className="relative z-10 max-w-xl">
                <h3 className="text-2xl font-extrabold text-white mb-4 tracking-tight">Moduł Sprzątania i Zadań</h3>
                <p className="text-slate-400 text-lg font-medium">Deleguj zadania obsłudze. System sam przypomni o konieczności posprzątania domku tuż po wyjeździe gości lub o konieczności wysłania im kodu do drzwi.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="cennik" className="py-24 bg-slate-50 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Jeden prosty plan.</h2>
          <p className="text-lg text-slate-600 font-medium max-w-xl mx-auto mb-16">Żadnych widełek cenowych od ilości domków. Brak ukrytych prowizji. Po prostu jedno, potężne narzędzie w stałej cenie.</p>
          
          <div className="relative max-w-lg mx-auto bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl border border-slate-100 hover:border-indigo-100 transition-colors">
            
            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-6 py-2 rounded-b-2xl shadow-sm whitespace-nowrap">
              Wszystkie funkcje w jednej cenie
            </div>

            <h3 className="text-2xl font-extrabold text-slate-900 mt-6 mb-2">Plan Gospodarza</h3>
            <p className="text-sm font-medium text-slate-500 mb-8">Dla osób ceniących święty spokój.</p>

            <div className="flex justify-center items-end gap-1 mb-8">
              <span className="text-6xl font-extrabold text-slate-900 tracking-tight">149</span>
              <span className="text-slate-500 font-bold mb-2">zł / msc</span>
            </div>

            <ul className="text-left space-y-4 mb-10 text-slate-700 font-medium text-sm">
              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-indigo-500 shrink-0" /> Nielimitowana ilość obiektów</li>
              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-indigo-500 shrink-0" /> Nielimitowana ilość rezerwacji</li>
              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-indigo-500 shrink-0" /> Pełna automatyzacja kalendarzy (iCal)</li>
              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-indigo-500 shrink-0" /> Kreator Przewodników dla Gości</li>
              <li className="flex items-center gap-3"><CheckCircle className="w-5 h-5 text-indigo-500 shrink-0" /> Wsparcie podatkowe i analityka</li>
            </ul>

            <Link to="/login" className="block w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-extrabold text-lg shadow-xl shadow-slate-900/20 transition-transform hover:-translate-y-1 text-center">
              Zacznij 14-dniowy test
            </Link>
            <p className="mt-4 text-xs font-semibold text-slate-500">14 dni okresu próbnego za darmo. Anuluj kiedy chcesz.</p>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24 bg-white relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Masz pytania?</h2>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="border border-slate-100 rounded-3xl bg-slate-50 overflow-hidden cursor-pointer hover:border-slate-200 transition-colors"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <div className="flex justify-between items-center p-6">
                  <h4 className="font-extrabold text-slate-800">{faq.q}</h4>
                  <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`} />
                </div>
                {openFaq === index && (
                  <div className="px-6 pb-6 text-slate-600 font-medium">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2" onClick={() => window.scrollTo(0, 0)}>
             <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center">
               <Home className="w-4 h-4 text-white" />
             </div>
             <span className="font-bold text-xl tracking-tighter text-white">Wynajem<span className="text-indigo-400">Pro</span></span>
          </div>
          
          <div className="text-sm font-medium">
            © {new Date().getFullYear()} WynajemPro. Wszelkie prawa zastrzeżone.
          </div>
          
          <div className="flex gap-6 text-sm font-bold">
            <a href="#" className="hover:text-white transition-colors">Regulamin</a>
            <a href="#" className="hover:text-white transition-colors">Polityka Prywatności</a>
            <a href="#" className="hover:text-white transition-colors">Kontakt</a>
          </div>
        </div>
      </footer>

    </div>
  );
}