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
│   │   ├── ManagerApp.jsx ......... Powłoka: sidebar 01–06, topbar, stan, akcje Firestore
│   │   ├── styles.js .............. System designu .wpd (DASHBOARD_CSS + helpery kolorów)
│   │   ├── GuideBuilder.jsx ....... Kreator przewodników dla gości (upload do 10 MB, QR, sekrety)
│   │   ├── views/ ................. Widoki: Pulpit, Rezerwacje, Kalendarz, Obiekty, Finanse, szczegóły rezerwacji
│   │   └── modals/ ................ Modale V4: dodaj/edytuj wpis, ustawienia, raporty, usuwanie
│   │
│   ├── GuestGuideView.jsx ......... Publiczny przewodnik gościa „/guide/:id”
│   ├── ResetPassword / AuthActionHandler .. Reset hasła / akcje e-mail Firebase
│   ├── Terms / Privacy / Contact / LegalLayout .. Strony prawne i kontakt
│   └── BlogListPage / BlogPostPage .......... Blog
│
├── components/ ..................... Współdzielone, WCIĄŻ używane:
│   ├── ConsentNotice.jsx .......... Baner zgody na cookies
│   ├── PaywallScreen.jsx .......... Ekran blokady (brak aktywnej subskrypcji)
│   ├── CompleteProfileScreen.jsx .. Uzupełnienie profilu gospodarza
│   └── FloatingTaskWidget.jsx ..... Pływający widget zadań na dziś
│
├── utils/
│   ├── constants.js ............... Stałe (kolory obiektów, domyślne ustawienia, paginacja)
│   └── taxCalculator.js .......... Logika podatkowa (ryczałt / skala / VAT)
│
└── data/
    └── blogPosts.js .............. Treści wpisów blogowych
```

⭐ = pliki, od których zacząć przy zmianach logiki/danych.

**Trasy:** patrz nagłówek `App.jsx`. **Reguły backendu:** `firestore.rules`, `storage.rules` (limit uploadu 10 MB). **Funkcje:** `functions/index.js` (Stripe, iCal, usuwanie konta).
