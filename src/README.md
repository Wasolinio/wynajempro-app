# 🗂️ Struktura `src/` — WynajemPRO

Jedna, produkcyjna wersja każdego ekranu, w identyfikacji marki **WynajemPRO v2**
(ciemny sidebar + paper, IBM Plex Mono na liczbach, linie 1px, zero cieni/gradientów).
Stare wersje i prototypy są w `/_legacy` (poza buildem).

```
src/
├── main.jsx ........................ Punkt wejścia (montuje <App/>)
├── App.jsx ......................... Routing + ProtectedRoute (patrz komentarze w pliku)
├── firebase.js ..................... Inicjalizacja Firebase (auth, Firestore, Storage, App Check, Analytics)
├── index.css ....................... Style globalne (Tailwind + bazowe)
├── GlobalErrorBoundary.jsx ......... Łapanie błędów renderu
│
├── context/
│   └── WynajemContext.jsx .......... ⭐ Globalny stan + akcje (rentals, settings, profil,
│                                        paywall/Stripe, synchronizacja iCal). Konsumowany przez panel.
├── hooks/
│   └── useFirebaseData.js .......... ⭐ Synchronizacja na żywo (Firestore onSnapshot → cache)
│
├── pages/
│   ├── landing/ .................... PRODUKCYJNY landing + logowanie (namespace CSS .wp4 / .wp4a)
│   │   ├── LandingPage.jsx ......... Strona główna „/”
│   │   └── LoginPanel.jsx .......... Logowanie/rejestracja „/login” (e-mail, Google, weryfikacja, trial)
│   │
│   ├── dashboard/ ................. ⭐ PRODUKCYJNY panel zarządzania „/dashboard” (namespace CSS .wpd)
│   │   ├── ManagerApp.jsx ......... Powłoka: sidebar 01–08, topbar, stan, akcje Firestore
│   │   ├── styles.js .............. System designu .wpd (DASHBOARD_CSS + helpery kolorów)
│   │   ├── GuideBuilder.jsx ....... Kreator przewodników dla gości (upload do 10 MB, QR, sekrety)
│   │   ├── views/ ................. Widoki: Pulpit, Rezerwacje, Kalendarz, Obiekty, Finanse, Zadania, szczegóły rezerwacji
│   │   ├── tasks/ ................. Moduł Zadania (E3): oś przypisania, kartki, popover, drag&drop, useTasksBoard
│   │   └── modals/ ................ Modale V4: dodaj/edytuj wpis, ustawienia, raporty, usuwanie
│   │
│   ├── admin/ ..................... PANEL ADMINISTRATORA "/admin" (namespace .wpd + dodatek .wpa)
│   │   ├── AdminApp.jsx ........... Powłoka: sidebar 01-06, bramka claimu `admin`
│   │   ├── adminApi.js ............ Klient jedynej funkcji `adminApi` + formatowanie
│   │   ├── styles.js .............. ADMIN_CSS - dodatek do DASHBOARD_CSS (lista+szczegóły, lejek)
│   │   └── views/ ................. Przegląd, Konta, Zgłoszenia, Newsletter, Porządek, Dziennik
│   │
│   ├── GuestGuideView.jsx ......... Publiczny przewodnik gościa „/guide/:id”
│   ├── ResetPassword / AuthActionHandler .. Reset hasła / akcje e-mail Firebase
│   ├── Terms / Privacy / Contact / LegalLayout .. Strony prawne i kontakt
│   └── BlogListPage / BlogPostPage .......... Blog
│
├── components/ ..................... Współdzielone, WCIĄŻ używane:
│   ├── WpdSelect.jsx .............. Custom select .wpd-sel (wzorzec z modułu Zadania; docelowo zamiennik .wpd-select)
│   ├── WpdDatePicker.jsx .......... Mini kalendarz z zajętością obiektu (wzorzec z modułu Zadania)
│   ├── ConsentNotice.jsx .......... Baner zgody na cookies
│   ├── PaywallScreen.jsx .......... Ekran blokady (brak aktywnej subskrypcji)
│   ├── CompleteProfileScreen.jsx .. Uzupełnienie profilu gospodarza
│   └── FloatingTaskWidget.jsx ..... Pływający widget zadań na dziś
│
├── utils/
│   ├── constants.js ............... Stałe (kolory obiektów, domyślne ustawienia, paginacja)
│   ├── taskSchedule.js ........... Terminy zadań z szablonów (kotwica przyjazd/wyjazd, opis słowny)
│   └── taxCalculator.js .......... Logika podatkowa (ryczałt / skala / VAT)
│
└── data/
    └── blogPosts.js .............. Treści wpisów blogowych
```

⭐ = pliki, od których zacząć przy zmianach logiki/danych.

**Trasy:** patrz nagłówek `App.jsx`. **Reguły backendu:** `firestore.rules`, `storage.rules` (limit uploadu 10 MB). **Funkcje:** `functions/index.js` (Stripe, iCal, usuwanie konta) + `functions/admin.js` (panel administratora).

⚠️ **Panel administratora nie czyta Firestore z przeglądarki i nie może.** Reguły zabraniają
klientowi odczytu `contact_messages` i cudzych kont — i to zostaje. Wszystko, co panel
pokazuje, przechodzi przez funkcję `adminApi` (Admin SDK, stopniowany dostęp, dziennik).
Instrukcja dla właściciela: `docs/Panel-administratora.md`.
