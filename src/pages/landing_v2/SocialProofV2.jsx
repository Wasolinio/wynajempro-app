import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

export default function SocialProofV2() {
  return (
    <section className="bg-slate-950 py-32 px-6 border-t border-white/5 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-900/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="absolute -top-12 -left-8 text-white/5 rotate-[-10deg]">
          <Quote size={140} />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-12">
            "Po 3 latach walki z Excelem powiedzieliśmy: <span className="text-sky-400">dość</span>."
          </h2>
          
          <div className="md:pl-8 md:border-l-2 border-sky-500/30">
            <p className="text-slate-300 text-lg md:text-xl leading-relaxed mb-10 font-light">
              <span className="text-white font-semibold block mb-3 text-sm tracking-widest uppercase opacity-70">Historia Sukcesu</span>
              Codzienne operacje zjadały nam 6 godzin. Wdrożenie WynajemPRO obcięło ten czas do 45 minut dziennie. Pozbyliśmy się operacyjnego chaosu i odzyskaliśmy przestrzeń na skalowanie portfela.
            </p>
            <div className="flex items-center gap-5 mt-8">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border border-white/20 shadow-lg" />
              <div>
                <p className="text-white font-bold text-lg tracking-tight">Zarządca Nieruchomości</p>
                <p className="text-slate-500 text-sm">Skalujący portfel z WynajemPRO</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
