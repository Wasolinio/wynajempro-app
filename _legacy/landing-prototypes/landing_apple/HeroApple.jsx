import React from 'react';
import { motion } from 'framer-motion';

export default function HeroApple() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden pt-20 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl mx-auto text-center z-10"
      >
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-neutral-900 mb-6">
          Potężny system.<br />
          Niewiarygodnie prosty.
        </h1>
        <p className="text-xl md:text-2xl text-neutral-500 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
          Zarządzaj najmem bez chaosu. Kalendarze, finanse i goście w jednym, przepięknym ekosystemie. Bez instrukcji obsługi. Po prostu działa.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="px-8 py-4 bg-neutral-900 text-white rounded-full text-lg font-medium hover:bg-neutral-800 transition-colors">
            Rozpocznij 14-dniowy test
          </button>
        </div>
        <p className="mt-4 text-sm text-neutral-400">
          Karta kredytowa nie jest wymagana.
        </p>
      </motion.div>
    </section>
  );
}
