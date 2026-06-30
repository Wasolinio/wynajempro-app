import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function FeaturesApple() {
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Step 1: Cyfrowy przewodnik (Guide Mobile View)
  const modOp1 = useTransform(scrollYProgress, [0, 0.1, 0.2, 0.25], [0, 1, 1, 0]);
  const modY1 = useTransform(scrollYProgress, [0, 0.1, 0.2, 0.25], [100, 0, 0, -100]);

  // Step 2: Poranny raport (Raport Dnia Modal)
  const modOp2 = useTransform(scrollYProgress, [0.20, 0.30, 0.45, 0.50], [0, 1, 1, 0]);
  const modS2 = useTransform(scrollYProgress, [0.20, 0.30, 0.45, 0.50], [0.9, 1, 1, 1.1]);

  // Step 3: Synchronizacja iCal (Sync Modal)
  const modOp3 = useTransform(scrollYProgress, [0.45, 0.55, 0.70, 0.75], [0, 1, 1, 0]);
  const modY3 = useTransform(scrollYProgress, [0.45, 0.55, 0.70, 0.75], [100, 0, 0, -100]);

  // Step 4: Inteligentne podatki (Taxes Summary)
  const modOp4 = useTransform(scrollYProgress, [0.70, 0.80, 0.95, 1], [0, 1, 1, 1]);
  const modY4 = useTransform(scrollYProgress, [0.70, 0.80, 0.95, 1], [100, 0, 0, 0]);

  return (
    <section ref={containerRef} className="relative h-[400vh] bg-[#fdfdfd]">
      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden bg-[#070b14] px-4 md:px-0">
        
        {/* Background glow effects to make the app window pop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none z-0" />

        {/* --- BACKGROUND DASHBOARD (ALWAYS DIMMED & BLURRED) --- */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30 blur-[4px] pointer-events-none z-0 scale-[1.02]">
          <DashboardMockup />
        </div>

        {/* --- DYNAMIC FOREGROUND MODALS --- */}
        <div className="w-full max-w-7xl h-full relative z-20 pointer-events-none">
          
          {/* STEP 1: GUIDE (Mobile Mockup) */}
          <motion.div style={{ opacity: modOp1, y: modY1 }} className="absolute inset-0 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-32 px-4">
            <div className="w-[300px] md:w-[320px] h-[600px] md:h-[640px] bg-slate-50 rounded-[3rem] shadow-2xl border-[8px] border-slate-900 overflow-hidden relative flex flex-col flex-shrink-0">
               <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center relative">
                  <svg className="w-16 h-16 text-blue-400 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl"></div>
               </div>
               <div className="p-6 flex-1 flex flex-col gap-4">
                  <div className="text-center mb-4">
                     <h2 className="text-xl font-black text-slate-800">Apartament nad Morzem</h2>
                     <p className="text-sm text-slate-500 font-medium mt-1">Twój cyfrowy przewodnik</p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
                     <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                       <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>
                     </div>
                     <div>
                        <div className="text-[10px] font-bold text-slate-400 tracking-wider">SIEĆ WI-FI</div>
                        <div className="font-black text-slate-800 text-lg">WPRO_8492</div>
                     </div>
                  </div>
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
                     <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center">
                       <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                     </div>
                     <div>
                        <div className="text-[10px] font-bold text-slate-400 tracking-wider">KOD DO DRZWI</div>
                        <div className="font-black text-slate-800 text-2xl tracking-[0.2em]">4829</div>
                     </div>
                  </div>
               </div>
               <div className="w-full h-1 bg-slate-200 mt-auto mb-2 rounded-full mx-auto max-w-[100px]" />
            </div>
            
            <div className="w-[90vw] md:w-[400px] bg-white/10 backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.4)] rounded-3xl p-8 border border-white/10">
               <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">Cyfrowy przewodnik.</h3>
               <p className="text-slate-300 font-medium leading-relaxed">Koniec z drukowanymi kartkami. Hasło Wi-Fi, instrukcje i świetlisty PIN do drzwi – prosto na telefon gościa, jeszcze przed jego przyjazdem.</p>
            </div>
          </motion.div>

          {/* STEP 2: REPORT (Raport Dnia Modal) */}
          <motion.div style={{ opacity: modOp2, scale: modS2 }} className="absolute inset-0 flex flex-col lg:flex-row-reverse items-center justify-center gap-12 lg:gap-32 px-4">
            <div className="w-[90vw] md:w-[450px] bg-[#0b1120] rounded-[2rem] shadow-2xl border border-slate-700 overflow-hidden flex-shrink-0">
               <div className="bg-gradient-to-b from-[#1e293b] to-[#0f172a] p-6 flex items-center gap-4 relative">
                  <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20 flex items-center justify-center">
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  </div>
                  <div>
                     <h2 className="text-xl font-bold text-white">Raport Dnia</h2>
                     <div className="text-indigo-400/60 text-xs font-bold tracking-wider mt-1 uppercase">2026-06-22</div>
                  </div>
                  <div className="absolute top-6 right-6 w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center text-slate-500">
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </div>
               </div>
               
               <div className="p-6 flex flex-col gap-5">
                  <div>
                     <div className="flex items-center gap-3 mb-3">
                        <div className="w-7 h-7 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg></div>
                        <div className="text-sm font-bold text-white">Przyjazdy (0)</div>
                     </div>
                     <div className="w-full border border-dashed border-slate-700/50 rounded-2xl py-5 flex items-center justify-center text-[13px] text-slate-500 font-medium bg-[#151e2e]/30">
                        Dzisiaj nikt nie przyjeżdża.
                     </div>
                  </div>
                  
                  <div>
                     <div className="flex items-center gap-3 mb-3">
                        <div className="w-7 h-7 bg-rose-500/10 text-rose-400 rounded-lg flex items-center justify-center"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg></div>
                        <div className="text-sm font-bold text-white">Wyjazdy (0)</div>
                     </div>
                     <div className="w-full border border-dashed border-slate-700/50 rounded-2xl py-5 flex items-center justify-center text-[13px] text-slate-500 font-medium bg-[#151e2e]/30">
                        Brak wyjazdów na dzisiaj.
                     </div>
                  </div>

                  <div>
                     <div className="flex items-center gap-3 mb-3">
                        <div className="w-7 h-7 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                        <div className="text-sm font-bold text-white">Zadania (0)</div>
                     </div>
                     <div className="w-full border border-slate-700/80 rounded-2xl py-5 flex items-center justify-center text-[13px] text-slate-400 font-medium bg-[#151e2e]">
                        Wszystko gotowe! Możesz odpocząć. ☕
                     </div>
                  </div>
               </div>
            </div>

            <div className="w-[90vw] md:w-[400px] bg-white/10 backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.4)] rounded-3xl p-8 border border-white/10">
               <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">Poranny raport.</h3>
               <p className="text-slate-300 font-medium leading-relaxed">Twój dzień. Podsumowany w 5 sekund. Kto przyjeżdża, co trzeba posprzątać, jakie płatności uregulować. Otwierasz, sprawdzasz, działasz.</p>
            </div>
          </motion.div>

          {/* STEP 3: CALENDAR (Sync Modal) */}
          <motion.div style={{ opacity: modOp3, y: modY3 }} className="absolute inset-0 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-32 px-4">
             <div className="w-[90vw] md:w-[450px] bg-[#151e2e] rounded-[2rem] shadow-2xl border border-slate-700 overflow-hidden p-8 flex flex-col items-center flex-shrink-0 relative">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF5A5F] via-emerald-400 to-[#003580]" />
               <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 border border-blue-500/20">
                  <svg className="w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
               </div>
               <h3 className="text-2xl font-bold text-white mb-8">Trwa synchronizacja</h3>
               
               <div className="w-full space-y-4">
                  <div className="flex items-center justify-between p-5 bg-[#0b1120] rounded-2xl border border-slate-700 shadow-inner">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#FF5A5F]/10 text-[#FF5A5F] rounded-xl flex items-center justify-center font-bold text-lg">A</div>
                        <span className="text-white font-medium text-lg">Airbnb</span>
                     </div>
                     <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold bg-emerald-400/10 px-3 py-1.5 rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Połączono
                     </div>
                  </div>

                  <div className="flex items-center justify-between p-5 bg-[#0b1120] rounded-2xl border border-slate-700 shadow-inner">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[#003580]/10 text-[#4281db] rounded-xl flex items-center justify-center font-bold text-lg">B</div>
                        <span className="text-white font-medium text-lg">Booking.com</span>
                     </div>
                     <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold bg-emerald-400/10 px-3 py-1.5 rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Połączono
                     </div>
                  </div>
               </div>
            </div>

            <div className="w-[90vw] md:w-[400px] bg-white/10 backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.4)] rounded-3xl p-8 border border-white/10">
               <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">Synchronizacja iCal.</h3>
               <p className="text-slate-300 font-medium leading-relaxed">Zero podwójnych rezerwacji. Airbnb i Booking.com idealnie zgrane z Twoim głównym kalendarzem. Dwukierunkowo. Błyskawicznie. Niezawodnie.</p>
            </div>
          </motion.div>

          {/* STEP 4: TAXES (Tax Summary View) */}
          <motion.div style={{ opacity: modOp4, y: modY4 }} className="absolute inset-0 flex flex-col lg:flex-row-reverse items-center justify-center gap-12 lg:gap-32 px-4">
             <div className="w-[90vw] md:w-[400px] bg-white rounded-[2rem] shadow-2xl border border-slate-200 overflow-hidden p-8 flex-shrink-0">
               <div className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-1">Czerwiec 2026</div>
               <div className="text-2xl font-black text-slate-800 mb-8 tracking-tight">Podsumowanie finansowe</div>
               
               <div className="space-y-5 mb-8">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                     <span className="text-slate-500 font-medium">Przychód brutto</span>
                     <span className="text-slate-800 font-bold">8 450,00 zł</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                     <span className="text-slate-500 font-medium">Prowizje portali</span>
                     <span className="text-rose-500 font-bold">- 1 240,00 zł</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                     <span className="text-slate-500 font-medium">Koszty operacyjne</span>
                     <span className="text-rose-500 font-bold">- 850,00 zł</span>
                  </div>
               </div>
               
               <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 mb-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-bl-full" />
                  <div className="text-indigo-900 text-sm font-bold mb-1">Ryczałt 8.5%</div>
                  <div className="text-indigo-900/60 text-[10px] uppercase tracking-wider font-bold mb-4">Obliczony automatycznie</div>
                  <div className="text-4xl font-black text-indigo-600 tracking-tighter">540,60 <span className="text-xl">zł</span></div>
               </div>
               
               <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-800 font-black">Zysk Netto</span>
                  <span className="text-emerald-500 font-black text-2xl tracking-tighter">5 819,40 <span className="text-base">zł</span></span>
               </div>
            </div>

            <div className="w-[90vw] md:w-[400px] bg-white/10 backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.4)] rounded-3xl p-8 border border-white/10">
               <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">Inteligentne podatki.</h3>
               <p className="text-slate-300 font-medium leading-relaxed">Zapomnij o kalkulatorze. System automatycznie wylicza ryczałt, pilnuje progów i ogarnia prowizje portali. Twoje finanse. Zawsze bezbłędne.</p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

// Background Context Mockup
function DashboardMockup() {
  return (
    <div className="w-[1200px] h-[85vh] bg-[#0B1120] rounded-[3rem] border border-slate-800 overflow-hidden flex flex-col p-10 font-sans">
      <div className="bg-[#151e2e] border border-slate-700/60 rounded-3xl p-6 flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-400" />
          <div className="w-48 h-10 bg-slate-700/50 rounded-lg" />
        </div>
        <div className="flex gap-4">
          <div className="w-64 h-10 bg-slate-700/50 rounded-lg" />
          <div className="w-24 h-10 bg-slate-700/50 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-6 mb-10">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-[#151e2e] border border-slate-700/60 rounded-3xl h-32" />
        ))}
      </div>
      <div className="flex gap-8 mb-4 border-b border-slate-800 pb-2">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="w-24 h-6 bg-slate-700/50 rounded" />
        ))}
      </div>
      <div className="bg-[#151e2e] border border-slate-700/60 rounded-[2rem] flex-1" />
    </div>
  );
}
