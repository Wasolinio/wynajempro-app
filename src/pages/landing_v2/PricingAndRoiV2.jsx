import React, { useState, useEffect } from 'react';
import { motion, animate } from 'framer-motion';
import { Check } from 'lucide-react';

export default function PricingAndRoiV2() {
  const [apartments, setApartments] = useState(5);
  const [savedHours, setSavedHours] = useState(0);

  useEffect(() => {
    // Prosty mnożnik 4.5h zaoszczędzonych miesięcznie per apartament
    const hours = apartments * 4.5;
    const controls = animate(savedHours, hours, {
      duration: 0.6,
      ease: "easeOut",
      onUpdate: (value) => setSavedHours(value),
    });
    return () => controls.stop();
  }, [apartments]);

  return (
    <section className="bg-slate-950 py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-indigo-900/10 via-slate-950 to-slate-950 pointer-events-none" />
      
      <div className="max-w-6xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        
        {/* ROI Calculator */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-white mb-6 leading-tight">
            Zyskaj czas na <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
              to, co ważne.
            </span>
          </h2>
          <p className="text-slate-400 text-lg mb-12 max-w-md leading-relaxed font-light">
            Oblicz, ile czasu zaoszczędzisz co miesiąc używając pełnej automatyzacji i cyfrowego asystenta.
          </p>

          <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 md:p-10 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-cyan-500 opacity-50"></div>
            <div className="mb-10">
              <div className="flex justify-between items-end mb-6">
                <span className="text-slate-300 font-medium text-lg">Liczba apartamentów:</span>
                <span className="text-4xl font-black text-white">{apartments}</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="20" 
                value={apartments}
                onChange={(e) => setApartments(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <div className="flex justify-between text-sm text-slate-500 mt-3 font-medium">
                <span>1 obj</span>
                <span>20 obj</span>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10">
              <span className="text-slate-400 text-sm block mb-2 uppercase tracking-widest">Zaoszczędzony czas w miesiącu:</span>
              <div className="flex items-baseline gap-3">
                <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                  {Math.round(savedHours)}
                </span>
                <span className="text-2xl text-slate-500 font-medium">godzin</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pricing Card */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-indigo-500 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-300" />
          
          <div className="relative bg-slate-900 border border-white/10 p-10 md:p-12 rounded-[2.5rem] shadow-2xl">
            <div className="inline-block px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-semibold mb-8">
              Jeden plan. Pełna moc.
            </div>
            
            <div className="mb-8 border-b border-white/10 pb-8">
              <span className="text-7xl font-black text-white tracking-tighter">29,99</span>
              <span className="text-xl text-slate-400 ml-2 font-medium">PLN / mc</span>
            </div>

            <ul className="space-y-5 mb-10">
              {[
                "Zero ukrytych kosztów",
                "Zwrot przy pierwszej unikniętej luce",
                "Wszystkie funkcje w cenie",
                "Nielimitowana liczba gości"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-slate-300">
                  <div className="bg-emerald-500/10 rounded-full p-1 border border-emerald-500/20">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  </div>
                  <span className="font-light">{item}</span>
                </li>
              ))}
            </ul>

            <button className="w-full py-5 bg-white text-slate-950 font-extrabold text-lg rounded-2xl hover:bg-slate-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              Rozpocznij darmowy okres
            </button>
            <p className="text-center text-slate-500 text-sm mt-5 font-medium">
              14 dni za darmo. Nie wymaga karty.
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
