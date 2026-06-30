import React, { useState } from 'react';

export default function RoiCalculator() {
  const [bookings, setBookings] = useState(15);
  const [avgPrice, setAvgPrice] = useState(1200);

  const savedMoney = bookings * avgPrice * 0.15;
  const savedHours = bookings * 1.5;

  return (
    <div className="bg-white rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden transform transition-all duration-500 hover:shadow-[0_30px_80px_-15px_rgba(0,0,0,0.15)]">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* Lewa strona: Suwaki */}
        <div className="p-8 md:p-12 flex flex-col justify-center space-y-10">
          
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <label className="font-bold text-slate-700">Rezerwacje w miesiącu</label>
              <span className="bg-blue-50 text-blue-700 border border-blue-100 font-extrabold px-3 py-1 rounded-lg text-sm shadow-sm">
                {bookings}
              </span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="100" 
              value={bookings} 
              onChange={(e) => setBookings(parseInt(e.target.value))}
              className="w-full h-2.5 bg-slate-100 border border-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500 transition-colors shadow-inner"
            />
            <div className="flex justify-between text-xs font-medium text-slate-400 px-1">
              <span>1</span>
              <span>100</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <label className="font-bold text-slate-700">Średnia wartość rezerwacji</label>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-extrabold px-3 py-1 rounded-lg text-sm shadow-sm">
                {avgPrice.toLocaleString('pl-PL')} zł
              </span>
            </div>
            <input 
              type="range" 
              min="200" 
              max="5000" 
              step="50"
              value={avgPrice} 
              onChange={(e) => setAvgPrice(parseInt(e.target.value))}
              className="w-full h-2.5 bg-slate-100 border border-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500 transition-colors shadow-inner"
            />
            <div className="flex justify-between text-xs font-medium text-slate-400 px-1">
              <span>200 zł</span>
              <span>5 000 zł</span>
            </div>
          </div>
          
        </div>

        {/* Prawa strona: Wyniki */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-900 p-8 md:p-12 text-white flex flex-col justify-center space-y-6 relative overflow-hidden">
          {/* Ozdobne tła */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full filter blur-[80px]"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full filter blur-[80px]"></div>
          
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative z-10 hover:bg-white/10 transition-colors">
            <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
              Zatrzymujesz w kieszeni (brak prowizji)
            </p>
            <p className="text-4xl md:text-5xl font-extrabold text-white">
              {savedMoney.toLocaleString('pl-PL')} <span className="text-xl md:text-2xl text-indigo-200 font-bold">zł</span>
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 relative z-10 hover:bg-white/10 transition-colors">
            <p className="text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Zaoszczędzony czas na wiadomościach
            </p>
            <p className="text-4xl md:text-5xl font-extrabold text-white">
              {savedHours} <span className="text-xl md:text-2xl text-emerald-300 font-bold">godzin</span>
            </p>
          </div>

          <button className="mt-6 w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 relative z-10 flex justify-center items-center gap-2">
            Odzyskaj ten czas i pieniądze <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </button>
          
        </div>
      </div>
    </div>
  );
}
