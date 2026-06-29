# Architektura Animacji: `<FeaturesApple />` (Sticky Scroll)

## 1. Złożenia Główne i Struktura DOM
Komponent będzie opierał się na technice "Sticky Scroll". Główny kontener posiada wysokość wymuszającą scrollowanie (`400vh` dla 4 kroków), a jego wewnętrzna zawartość jest przypięta (sticky) do ekranu.

```tsx
<section ref={containerRef} className="relative h-[400vh] bg-neutral-50">
  <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
    <div className="grid grid-cols-2 max-w-7xl mx-auto w-full px-8 gap-12">
      {/* Kolumna lewa: Teksty */}
      <div className="relative flex flex-col justify-center h-full">
         <StepText step={1} title="Cyfrowy przewodnik." />
         <StepText step={2} title="Poranny raport." />
         <StepText step={3} title="Synchronizacja iCal." />
         <StepText step={4} title="Inteligentne podatki." />
      </div>

      {/* Kolumna prawa: Mockupy/UI */}
      <div className="relative flex items-center justify-center h-full">
         <MockupUI step={1} />
         <MockupUI step={2} />
         <MockupUI step={3} />
         <MockupUI step={4} />
      </div>
    </div>
  </div>
</section>
```

## 2. Logika framer-motion (useScroll i useTransform)

Użyjemy hooka `useScroll` przypiętego do głównego kontenera, aby śledzić postęp scrollowania (od 0 do 1). Następnie wykorzystamy `useTransform` do zmapowania postępu na style CSS (`opacity`, `y`, `scale`).

```typescript
const { scrollYProgress } = useScroll({
  target: containerRef,
  offset: ["start start", "end end"]
});
```

Podział punktów zmiany (4 kroki dla 100% postępu scrolla):
- Krok 1: 0.00 – 0.25
- Krok 2: 0.25 – 0.50
- Krok 3: 0.50 – 0.75
- Krok 4: 0.75 – 1.00

### 2.1 Animacja Tekstów (Lewa strona)

Chcemy, aby aktywny tekst płynnie wyłaniał się z dołu (fade in + y) i zanikał przesuwając się w górę (fade out + y), tworząc efekt "kółka przewijania" w systemach Apple. Teksty mają pozycję bezwzględną (`absolute`) nakładając się na siebie, by utrzymać stałą pozycję nagłówków.

* **Krok 1 (Cyfrowy przewodnik):**
  * `opacity`: `useTransform(scrollYProgress, [0, 0.15, 0.25], [1, 1, 0])`
  * `y`: `useTransform(scrollYProgress, [0, 0.25], [0, -40])`

* **Krok 2 (Poranny raport):**
  * `opacity`: `useTransform(scrollYProgress, [0.15, 0.25, 0.40, 0.50], [0, 1, 1, 0])`
  * `y`: `useTransform(scrollYProgress, [0.15, 0.25, 0.40, 0.50], [40, 0, 0, -40])`

* **Krok 3 (Synchronizacja iCal):**
  * `opacity`: `useTransform(scrollYProgress, [0.40, 0.50, 0.65, 0.75], [0, 1, 1, 0])`
  * `y`: `useTransform(scrollYProgress, [0.40, 0.50, 0.65, 0.75], [40, 0, 0, -40])`

* **Krok 4 (Inteligentne podatki):**
  * `opacity`: `useTransform(scrollYProgress, [0.65, 0.75, 1], [0, 1, 1])`
  * `y`: `useTransform(scrollYProgress, [0.65, 0.75, 1], [40, 0, 0])`

### 2.2 Animacja Interfejsów (Prawa strona)

Mockupy aplikacji/interfejsu nakładają się na siebie (`absolute inset-0`). Używamy łagodnych przejść połączonych z delikatną transformacją skali (`scale`) i pozycji (`y`), co nadaje paralaksowy, przestrzenny wygląd (tzw. "depth effect").

* **Mockup 1:**
  * `opacity`: `useTransform(scrollYProgress, [0, 0.2, 0.3], [1, 1, 0])`
  * `scale`: `useTransform(scrollYProgress, [0, 0.3], [1, 0.95])`

* **Mockup 2:**
  * `opacity`: `useTransform(scrollYProgress, [0.2, 0.3, 0.45, 0.55], [0, 1, 1, 0])`
  * `y`: `useTransform(scrollYProgress, [0.2, 0.3], [30, 0])`
  * `scale`: `useTransform(scrollYProgress, [0.45, 0.55], [1, 0.95])`

* **Mockup 3:**
  * `opacity`: `useTransform(scrollYProgress, [0.45, 0.55, 0.7, 0.8], [0, 1, 1, 0])`
  * `y`: `useTransform(scrollYProgress, [0.45, 0.55], [30, 0])`
  * `scale`: `useTransform(scrollYProgress, [0.7, 0.8], [1, 0.95])`

* **Mockup 4:**
  * `opacity`: `useTransform(scrollYProgress, [0.7, 0.8, 1], [0, 1, 1])`
  * `y`: `useTransform(scrollYProgress, [0.7, 0.8], [30, 0])`

## 3. Wskazówki Ogólne dla Pozostałych Sekcji Strony (Scroll Reveal)

Wszystkie inne bloki na landing page'u powinny płynnie odsłaniać się po pojawieniu w polu widzenia (Scroll Reveal). Poniżej optymalny wzorzec z ujednoliconą krzywą przejścia (easing).

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ 
    duration: 0.8, 
    ease: [0.16, 1, 0.3, 1] // Zastosowanie 'Apple-style easing' (wariant custom ease-out-expo)
  }}
>
  {/* Content (Hero, Pricing, Case Study) */}
</motion.div>
```
