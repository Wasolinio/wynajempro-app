# WynajemPRO — PRODUCT.md

## Register
product — panel SaaS (dashboard, formularze, dane); publiczne strony (landing, przewodnik gościa, strona opinii) mają rejestr brand, ale dzielą tę samą identyfikację v2.

## Product
SaaS do zarządzania wynajmem dla polskich gospodarzy: kalendarz rezerwacji i finansów wielu obiektów, synchronizacja iCal (Booking/Airbnb), rozliczenia podatkowe (ryczałt/skala/VAT), przewodniki gości z sekretami po podpisie, generator umów najmu, strony próśb o opinie, analityka okresowa. Model: trial 14 dni → subskrypcja Stripe 29,99 zł/mc.

## Users
Gospodarz 1–10 obiektów krótkoterminowych (domki, apartamenty), obsługuje gości samodzielnie; dziś: Excel/kalendarz papierowy/kilka narzędzi. Wtórnie: drobny najem długoterminowy (umowy + podatki). Użytkownik jest „w zadaniu" — panel ma znikać w tle pracy. Goście gospodarza (strony publiczne) otwierają linki na telefonie, prosto z SMS/WhatsApp.

## Brand personality
Rzeczowy („zysk 33 280 zł", nie „rosnące przychody"), spokojny (ton narzędzia, nie sprzedawcy; krótkie zdania, zero wykrzykników), po imieniu (jeden człowiek, kilka obiektów — nie korporacja). Polski rynek, polska fleksja.

## Anti-references
- SaaS-owa krzykliwość: gradienty, cienie, glassmorphism, konfetti — zakazane twardo.
- Hotelowe systemy-kombajny (PMS/channel managery) — przeładowane opcjami; my wygrywamy prostotą.
- Generyczny bootstrap-admin: niebieskie przyciski, szare karty bez charakteru.

## Strategic design principles
- **Identyfikacja v2 (nienegocjowalna bez decyzji właściciela):** ciemny sidebar (--side #17150F) + jasny „paper" (#F3EFE5); IBM Plex Mono na liczbach/etykietach; struktura liniami 1px (--hairline/--ink) zamiast cieni; radius 3px (kontrolki) / 4px (panele); akcent cynober #D9492B oszczędnie.
- Fonty: Schibsted Grotesk (UI), Newsreader italic (akcenty), IBM Plex Mono (dane). Namespace'y: `.wpd` (panel), `.wpb` (strony poboczne), `.wp4/.wp4a` (landing/login), `.wpc` (cookie).
- Stany są częścią designu: pusty/ładowanie/błąd/przepełnienie/wąski viewport — zawsze.
- Dostępność: AA (4.5:1) także dla mikro-etykiet; widoczny focus (outline 2px cynober); pola dotykowe ≥40px; `prefers-reduced-motion` obowiązkowy dla każdej animacji.
- Ruch: komunikuje stan (wejście danych, potwierdzenie), krzywa cubic-bezier(.22,1,.36,1), 150–320 ms dla UI; count-up danych 700 ms ease-out-cubic (wzorzec Analityki).
- Mobile: panel z dolnym paskiem nawigacji (<980px); strony publiczne mobile-first.

## Source of truth
Szczegóły produktu i planowanie: `CLAUDE.md`, `docs/Projects/Roadmap.md`, `docs/Team-Playbook.md`, agent `designer` (`.claude/agents/designer.md`).
