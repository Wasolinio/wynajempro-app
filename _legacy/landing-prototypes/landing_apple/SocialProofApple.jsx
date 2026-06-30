import React from 'react';
import { motion } from 'framer-motion';

export default function SocialProofApple() {
  return (
    <section className="py-32 bg-white flex items-center justify-center px-4 border-t border-neutral-100">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl mx-auto text-center"
      >
        <p className="text-sm font-bold tracking-widest text-neutral-400 uppercase mb-8">Zaprojektowane przez praktyków.</p>
        <h2 className="text-4xl md:text-6xl font-semibold tracking-tight text-neutral-900 mb-10 leading-tight">
          „Po 3 latach używania Excela, powiedzieliśmy: dość.”
        </h2>
        <p className="text-xl md:text-2xl text-neutral-500 max-w-3xl mx-auto leading-relaxed mb-12 font-medium">
          Zarządzanie pięcioma domkami na Mazurach pokazało nam jedno: oprogramowanie hotelowe jest drogie, toporne i przeładowane. Potrzebowaliśmy narzędzia, które zdejmie z nas obowiązki, a nie dołoży nowych. Tak powstało WynajemPRO. Z własnej, palącej potrzeby. Zbudowane tak, by odzyskać czas.
        </p>
        <div className="flex items-center justify-center gap-4">
          <div className="w-14 h-14 bg-neutral-200 rounded-full overflow-hidden flex items-center justify-center">
            <span className="text-neutral-500 font-semibold">K</span>
          </div>
          <div className="text-left">
            <p className="font-semibold text-neutral-900 text-lg">— Kamil</p>
            <p className="text-neutral-500 font-medium">Założyciel WynajemPRO</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
