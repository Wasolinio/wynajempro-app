import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Sunrise, RefreshCw, FileText } from 'lucide-react';

const features = [
  {
    title: "Cyfrowy Przewodnik Gościa",
    description: "Jeden link. Unikalny, podświetlony kod PIN. Rozwiązuje 90% pytań gości zanim zdążą je zadać.",
    icon: Smartphone,
    className: "md:col-span-2 md:row-span-2",
  },
  {
    title: "Poranny Raport Operacyjny",
    description: "Tętno Twojego biznesu w pigułce. Check-iny, check-outy i priorytety na dziś. Czeka na Ciebie każdego ranka o 8:00.",
    icon: Sunrise,
    className: "md:col-span-1 md:row-span-1",
  },
  {
    title: "Synchronizacja iCal",
    description: "Airbnb, Booking i rezerwacje prywatne w jednym silniku. Błyskawiczna synchronizacja. Koniec z podwójnymi rezerwacjami.",
    icon: RefreshCw,
    className: "md:col-span-1 md:row-span-1",
  },
  {
    title: "Automatyzacja Podatków",
    description: "Faktury i raporty generowane w tle. Zgodne z prawem, gotowe do wysłania księgowości. Zero ręcznej pracy.",
    icon: FileText,
    className: "md:col-span-2 md:row-span-1",
  }
];

export default function FeaturesBentoV2() {
  return (
    <section className="bg-slate-950 py-32 px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-16 md:mb-24"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-white mb-6">
            Zaprojektowane by <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">
              eliminować chaos.
            </span>
          </h2>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl font-light">
            Funkcje, których potrzebujesz, by przestać zarządzać, a zacząć skalować.
          </p>
        </motion.div>

        {/* Gapless Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[280px] gap-[1px] bg-white/10 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
              transition={{ duration: 0.2 }}
              className={`p-10 bg-slate-950 flex flex-col justify-end group ${feature.className}`}
            >
              <div className="mb-auto">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-white/20 group-hover:shadow-[0_0_30px_rgba(56,189,248,0.15)] transition-all duration-500">
                  <feature.icon className="w-7 h-7 text-sky-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 tracking-tight group-hover:text-sky-300 transition-colors">{feature.title}</h3>
              <p className="text-slate-400 text-sm md:text-base leading-relaxed font-light">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
