import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function LandingPageV3() {
  return (
    <div className="bg-surface text-on-surface flex flex-col min-h-screen">
      
{/*  TopAppBar  */}
<header className="bg-surface-glass backdrop-blur-md border-b border-border-glass fixed top-0 w-full z-50 flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop lg:px-margin-desktop max-w-container-max-width mx-auto left-0 right-0">
<div className="flex items-center gap-4">
<span className="material-symbols-outlined text-primary text-2xl md:hidden cursor-pointer">menu</span>
<span className="font-headline-md text-headline-md text-primary font-bold">WynajemPro</span>
</div>
<nav className="hidden md:flex gap-6 items-center">
<a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#features">Funkcje</a>
<a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#pricing">Cennik</a>
<a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#testimonials">Opinie</a>
<button className="bg-primary text-on-primary font-label-md text-label-md px-6 py-2 rounded-lg hover:bg-inverse-primary transition-colors shadow-sm">Zaloguj się</button>
</nav>
<div className="md:hidden flex items-center gap-4">
<button className="text-primary font-label-md text-label-md hover:text-inverse-primary transition-colors">Log In</button>
</div>
</header>
{/*  Main Content Canvas  */}
<main className="flex-grow pt-16">
{/*  Hero Section  */}
<section className="relative pt-24 pb-32 md:pt-32 md:pb-40 px-margin-mobile md:px-margin-desktop lg:px-margin-desktop max-w-container-max-width mx-auto flex flex-col md:flex-row items-center gap-12">
{/*  Background Glow  */}
<div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none"></div>
<div className="w-full md:w-1/2 flex flex-col gap-6 text-left relative z-10">
<h1 className="font-display-lg text-display-lg text-on-surface leading-tight">
                    Zarządzaj najmem krótkoterminowym <br className="hidden md:block"/><span className="text-primary">bez chaosu</span>
</h1>
<p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg">
                    Zautomatyzuj swój kalendarz, finanse i komunikację z gośćmi w jednym prostym narzędziu, które nie wymaga instrukcji obsługi.
                </p>
<div className="flex flex-col sm:flex-row gap-4 pt-4">
<button className="bg-primary text-on-primary font-label-md text-label-md px-8 py-3 rounded-lg hover:bg-inverse-primary transition-colors shadow-sm flex items-center justify-center gap-2">
                        Rozpocznij 14-dniowy test
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
</button>
<button className="border border-outline text-on-surface font-label-md text-label-md px-8 py-3 rounded-lg hover:bg-surface-container-high transition-colors flex items-center justify-center gap-2">
                        Zobacz demo
                    </button>
</div>
<div className="flex items-center gap-4 mt-8 opacity-75">
<span className="font-label-sm text-label-sm text-on-surface-variant">Zintegrowane z:</span>
<span className="font-label-sm text-label-sm font-bold text-on-surface">Airbnb</span>
<span className="font-label-sm text-label-sm font-bold text-on-surface">Booking.com</span>
<span className="font-label-sm text-label-sm font-bold text-on-surface">Vrbo</span>
</div>
</div>
<div className="w-full md:w-1/2 relative z-10">
{/*  Abstract Dashboard Visual  */}
<div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-2xl border border-border-glass bg-surface-container-lowest">
<div className="bg-cover bg-center w-full h-full" data-alt="A modern, highly detailed digital illustration of a dashboard interface for a short-term rental management software. The dashboard features clean, minimalist charts, calendar views, and booking statistics. The color palette is professional, using slate grays, pristine whites, and teal accents to match the corporate hospitality aesthetic. Bright, even lighting suggests a productive morning environment. High resolution." style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuD_Jq26QfHIsZpz4_AO-T53aIPu7Ni_EtVaC29ogFi3QStoObEKL1RA8cQ1c8TDAfo4Yvb2H7EJykZxc2crbTv7ZLrNSsNtBubeR2kMRRsiC8uOMX6K6ZODoxxqdlAZJdFNo6_7Io18QIdWL9j38lAe3qld6BjKcLDGZNRyeIFJmPXgdB1JsbF6hZqBEngjsnsMcbBScJm85tfCMGDpg_ZN0_Hffs7bXqjH6TREV8-zH2n-ILDr3rcfIKjkXJKQz4o0fTPwlwaWcyCV')` }}></div>
</div>
{/*  Decorative floating element  */}
<div className="absolute -bottom-6 -left-6 glass-card p-4 rounded-lg shadow-xl flex items-center gap-4">
<div className="bg-success-emerald/20 p-2 rounded-full">
<span className="material-symbols-outlined text-success-emerald">trending_up</span>
</div>
<div>
<p className="font-label-sm text-label-sm text-on-surface-variant">Przychody (Październik)</p>
<p className="font-headline-sm text-headline-sm text-on-surface">+24%</p>
</div>
</div>
</div>
</section>
{/*  Features Bento Grid  */}
<section className="bg-surface-container-lowest py-24 px-margin-mobile md:px-margin-desktop lg:px-margin-desktop relative overflow-hidden" id="features">
{/*  Background Details  */}
<div className="absolute top-0 right-0 w-1/2 h-1/2 bg-secondary/10 blur-[150px] rounded-full pointer-events-none"></div>
<div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>
<div className="max-w-container-max-width mx-auto relative z-10">
<div className="text-center mb-16">
<h2 className="font-headline-lg text-headline-lg md:text-display-lg md:font-display-lg text-on-surface mb-4">Wszystko, czego potrzebujesz.</h2>
<p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">Skomponowaliśmy funkcje, które zdejmują najwięcej pracy z barków gospodarzy, zamykając je w przepięknym interfejsie.</p>
</div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
{/*  Feature 1: Sync (Large)  */}
<div className="md:col-span-2 glass-card rounded-xl p-8 relative overflow-hidden flex flex-col justify-between">
<div className="z-10 relative">
<div className="bg-primary/20 text-primary w-12 h-12 rounded-lg flex items-center justify-center mb-6">
<span className="material-symbols-outlined">sync</span>
</div>
<h3 className="font-headline-md text-headline-md text-on-surface mb-2">Koniec z podwójnymi rezerwacjami</h3>
<p className="font-body-md text-body-md text-on-surface-variant max-w-md">Dwukierunkowa synchronizacja w czasie rzeczywistym. Rezerwacja na Booking natychmiast blokuje kalendarz na Airbnb i w WynajemPRO.</p>
</div>
<div className="mt-8 relative h-48 rounded-lg overflow-hidden border border-border-glass shadow-sm bg-surface-charcoal">
<div className="bg-cover bg-center w-full h-full opacity-80" data-alt="A detailed, abstract visual representation of calendar synchronization across multiple platforms. Interlocking calendar grids with colorful event blocks in teal, slate, and gray. Data flows seamlessly between the grids in a well-lit, minimal, modern corporate style. The scene feels organized and efficient." style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCefGpCLaVFk8f7vXDVw2kzi5OeaIw-JmyQUmJOi_wzsuaMyp3HURE3D8hMZuarfk9dUSLUG_wbZNThHu6c8iHdbffAeq21KsmBx-16LrnEkmbDM304CbFlszMuBJbCJrtEM9uzn-mw8FQiKEJItidNu9UaCQIrArxllzPSwDRwHdm6GsvNUp1JOnYQSKuZBY2v8L7oPwhzABKcnkvLrnAvxTYXqmxtAo01pKzwtXo64M9fmF_QilXxoe-uVhadc54QRjGGIt6onWzx')` }}></div>
</div>
</div>
{/*  Feature 2: Automation (Small)  */}
<div className="glass-card rounded-xl p-8 flex flex-col">
<div className="bg-secondary/20 text-secondary w-12 h-12 rounded-lg flex items-center justify-center mb-6">
<span className="material-symbols-outlined">mark_email_unread</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Cyfrowy Przewodnik Gościa premium</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant flex-grow">Zrezygnuj z drukowanych kartek. Daj gościom wszystko na telefon przed przyjazdem.</p>
<div className="mt-6 flex items-center gap-2 p-3 bg-surface-container-low rounded-lg border border-border-glass">
<span className="material-symbols-outlined text-outline text-sm">schedule</span>
<span className="font-label-sm text-label-sm text-on-surface-variant">Wysłano: Instrukcje (2h przed)</span>
</div>
</div>
{/*  Feature 3: Analytics (Small)  */}
<div className="glass-card rounded-xl p-8 flex flex-col">
<div className="bg-tertiary/20 text-tertiary w-12 h-12 rounded-lg flex items-center justify-center mb-6">
<span className="material-symbols-outlined">bar_chart</span>
</div>
<h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Automatyzacja podatków najmu</h3>
<p className="font-body-sm text-body-sm text-on-surface-variant flex-grow">Koniec z ręcznym liczeniem i strachem przed kontrolą. System sam pilnuje wszystkiego.</p>
<div className="mt-6 h-20 w-full rounded-lg bg-surface-container-low flex items-end justify-between px-3 pb-3 border border-border-glass gap-2 pt-4">
<div className="w-full bg-primary/40 h-1/2 rounded-t-sm hover:bg-primary/60 transition-colors cursor-pointer"></div>
<div className="w-full bg-primary/60 h-3/4 rounded-t-sm hover:bg-primary/80 transition-colors cursor-pointer"></div>
<div className="w-full bg-primary h-full rounded-t-sm hover:bg-inverse-primary transition-colors cursor-pointer"></div>
<div className="w-full bg-primary/50 h-2/3 rounded-t-sm hover:bg-primary/70 transition-colors cursor-pointer"></div>
</div>
</div>
{/*  Feature 4: Team (Large)  */}
<div className="md:col-span-2 glass-card rounded-xl p-8 relative overflow-hidden flex flex-col md:flex-row gap-8 items-center justify-between">
<div className="w-full md:w-1/2 z-10">
<div className="bg-surface-charcoal text-primary w-12 h-12 rounded-lg flex items-center justify-center mb-6 shadow-sm border border-border-glass">
<span className="material-symbols-outlined">group</span>
</div>
<h3 className="font-headline-md text-headline-md text-on-surface mb-2">Poranny raport operacyjny</h3>
<p className="font-body-md text-body-md text-on-surface-variant mb-6">Otwierasz aplikację rano przy kawie i w 5 sekund wiesz, co dzisiaj musisz zrobić. Pełna kontrola nad dniem.</p>
<button className="text-primary font-label-md text-label-md flex items-center gap-1 hover:text-inverse-primary transition-colors">
                                Dowiedz się więcej <span className="material-symbols-outlined text-sm">arrow_forward</span>
</button>
</div>
<div className="w-full md:w-1/2 relative h-48 rounded-lg overflow-hidden border border-border-glass shadow-sm bg-surface-charcoal">
<div className="bg-cover bg-left w-full h-full opacity-70" data-alt="A sleek, modern user interface mockup showing a task management board for a cleaning and maintenance team. Tasks are organized in columns like 'To Do', 'In Progress', and 'Done'. High contrast text on white cards, subtle gray backgrounds, professional lighting, conveying efficiency and teamwork in property management." style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuAw_1mVChYuyi-TN88GiHoRHO-uE6HREEk3MTuRqtgZxhJFjo0z6siq1XMlA-P1uL2YLFa85_wgyPeVXfBUYIuQUrrHrd7OzAEcWi77QbzgX0pPZlTIfHIcvkBEEYrEyF2fya0bXrVj8W18d1bmVcHCElq_c43QIaKoQhWKSzNXyX8SXL5YaQ8pC_Rh5NRFbFcMUCStV88QV4C7PPJugrq8c_n5QzWutXF7cyYrRMsIJakKIWRwmJMjJRCd6pyJVvhWzUlBnF0NcMtt')` }}></div>
</div>
</div>
</div>
</div>
</section>
{/*  CTA Section  */}
<section className="bg-surface-container-low border-y border-border-glass py-24 px-margin-mobile md:px-margin-desktop text-center relative overflow-hidden">
<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-surface-container-low to-surface-container-low pointer-events-none"></div>
<div className="max-w-2xl mx-auto flex flex-col items-center relative z-10">
<div className="bg-primary/20 p-4 rounded-full mb-6 border border-border-glass">
<span className="material-symbols-outlined text-primary text-4xl">rocket_launch</span>
</div>
<h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">Gotowy na wyższy poziom wynajmu?</h2>
<p className="font-body-md text-body-md text-on-surface-variant mb-8">
                    Dołącz do tysięcy gospodarzy, którzy zaufali WynajemPro. Rozpocznij 14-dniowy darmowy okres próbny. Karta kredytowa nie jest wymagana.
                </p>
<button className="bg-primary text-on-primary font-label-md text-label-md px-8 py-4 rounded-lg hover:bg-inverse-primary transition-colors shadow-lg w-full sm:w-auto">
                    Załóż darmowe konto
                </button>
<p className="font-label-sm text-label-sm text-on-surface-variant mt-4">Anuluj w dowolnym momencie.</p>
</div>
</section>
</main>
{/*  Footer  */}
<footer className="bg-surface text-on-surface w-full py-12 border-t border-border-glass flex flex-col items-center gap-6 px-margin-mobile text-center">
<div className="font-headline-sm text-headline-sm text-primary font-bold">WynajemPro</div>
<div className="flex flex-wrap justify-center gap-8 mb-4">
<a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">Polityka Prywatności</a>
<a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">Warunki Świadczenia Usług</a>
<a className="font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">Kontakt z Pomocą</a>
</div>
<p className="font-body-sm text-body-sm text-on-surface-variant opacity-70">© 2024 WynajemPro SaaS. Professional Hosting Simplified.</p>
</footer>

    </div>
  );
}
