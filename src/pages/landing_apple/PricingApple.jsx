import React from 'react';
import { motion } from 'framer-motion';

export default function PricingApple() {
  return (
    <section className="py-32 md:py-48 bg-neutral-50 border-t border-neutral-100 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl mx-auto text-center"
      >
        <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-neutral-900 mb-8">
          Jeden abonament.<br />Bez granic.
        </h2>
        <p className="text-xl md:text-2xl text-neutral-500 max-w-2xl mx-auto leading-relaxed mb-16 font-medium">
          Rozwijaj swój biznes. Bez kar za sukces. Żadnych prowizji od rezerwacji i dopłat za kolejne dodane obiekty. Jedna, transparentna cena za potężny system.
        </p>
        
        <div className="bg-white rounded-[2.5rem] p-10 md:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-neutral-200 flex flex-col items-center max-w-xl mx-auto">
          <div className="flex items-baseline gap-3 mb-10">
            <span className="text-7xl font-bold text-neutral-900 tracking-tight">29,99</span>
            <span className="text-2xl text-neutral-500 font-medium">PLN / miesiąc</span>
          </div>
          
          <button className="w-full px-8 py-5 bg-neutral-900 text-white rounded-full text-xl font-medium hover:bg-neutral-800 transition-colors mb-4">
            Rozpocznij 14-dniowy test
          </button>
          <p className="text-neutral-400 font-medium">
            Karta kredytowa nie jest wymagana.
          </p>
        </div>
      </motion.div>
    </section>
  );
}
