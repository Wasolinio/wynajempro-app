export const blogPosts = [
  {
    id: 1,
    slug: 'jak-uniknac-podwojnych-rezerwacji',
    title: 'Jak uniknąć podwójnych rezerwacji (overbooking) — i czego iCal za Ciebie nie zrobi',
    excerpt: 'Synchronizacja kalendarzy ogranicza ryzyko podwójnej rezerwacji, ale go nie zeruje. Oto gdzie dokładnie jest luka i co z nią zrobić.',
    date: '2026-06-11',
    readTime: '4 min',
    category: 'Szkolenia',
    blocks: [
      { type: 'h2', content: 'Koszmar podwójnej rezerwacji' },
      { type: 'p', content: 'Dostajesz powiadomienie o nowej rezerwacji z Booking.com. Cieszysz się, ale po minucie wibruje telefon — kolejna rezerwacja, tym razem z Airbnb. W ten sam weekend, na ten sam apartament. Brzmi znajomo? Overbooking to nie tylko stres, ale też ryzyko kar umownych i gorszej pozycji ogłoszenia w portalu.' },
      { type: 'p', content: 'Standardowym narzędziem jest synchronizacja kalendarzy w formacie iCal. Zanim jednak uznasz sprawę za zamkniętą, warto wiedzieć, gdzie ten mechanizm ma granicę — bo ma ją każdy, kto go używa, niezależnie od aplikacji.' },
      { type: 'h2', content: 'Czym jest link iCal' },
      { type: 'p', content: 'iCal to otwarty standard wymiany danych kalendarzowych. Każdy portal rezerwacyjny pozwala wygenerować dla obiektu osobny, tajny link z zajętymi terminami, a także wkleić u siebie linki z innych portali. Format przenosi wyłącznie informację „ten termin jest zajęty" — nie ma w nim cen, nazwiska gościa ani wiadomości.' },
      { type: 'h2', content: 'Gdzie jest luka' },
      { type: 'p', content: 'iCal nie działa natychmiast. Portale nie są powiadamiane o zmianie — same, co jakiś czas, pobierają wklejony kalendarz. W praktyce to kilka godzin, a bywa dłużej. Oznacza to, że między sprzedaniem terminu na jednym portalu a zablokowaniem go na drugim zawsze istnieje okno, w którym ktoś może kupić ten sam weekend.' },
      { type: 'p', content: 'Żaden program tego nie obejdzie, bo opóźnienie leży po stronie portalu. Dlatego uczciwa odpowiedź brzmi: synchronizacja iCal mocno ogranicza ryzyko podwójnej rezerwacji, ale go nie zeruje. Kto obiecuje co innego, obiecuje coś, czego format nie potrafi.' },
      { type: 'h2', content: 'Jak podłączyć iCal w WynajemPRO' },
      { type: 'list', items: [
        'W panelu partnera Booking.com otwórz „Ceny i dostępność" → „Kalendarz" → „Synchronizacja kalendarzy" i skopiuj link eksportu.',
        'W Airbnb otwórz „Kalendarz", wybierz ogłoszenie i w ustawieniach dostępności znajdź „Połącz kalendarze" → „Eksportuj kalendarz".',
        'W WynajemPRO wejdź w „Ustawienia" → „Integracje" i wklej oba adresy przy właściwym obiekcie.',
        'Skopiuj też link eksportu z WynajemPRO i wklej go w obu portalach — dzięki temu rezerwacje bezpośrednie blokują terminy w Booking.com i Airbnb.'
      ]},
      { type: 'p', content: 'Kalendarze pobieramy co godzinę, a poza tym w każdej chwili przyciskiem „Synchronizacja". To skraca nasz odcinek opóźnienia do minimum, ale nie skraca odcinka po stronie portalu.' },
      { type: 'h2', content: 'Co robić z luką, której nie da się zamknąć' },
      { type: 'p', content: 'Skoro terminu nie da się zablokować natychmiast, drugą najlepszą rzeczą jest dowiedzieć się o kolizji pierwszym — zanim zadzwoni gość. Tu pomaga centralizacja: rezerwacje ze wszystkich portali leżą w jednym kalendarzu, więc widać je razem, czego nie widzi żaden portal z osobna.' },
      { type: 'p', content: 'WynajemPRO sprawdza to za każdym razem, gdy otwierasz pulpit — jeśli dwie rezerwacje na ten sam obiekt zachodzą na te same noce, zobaczysz alarm z obiema stronami kolizji. To nie jest powiadomienie na telefon; trzeba zajrzeć do panelu. Wyjazd i przyjazd tego samego dnia to nie kolizja — liczymy noce, nie dni.' },
      { type: 'p', content: 'Przy rezerwacjach z ostatniej chwili warto dodatkowo zablokować termin w portalu ręcznie. To jedyny sposób, żeby zadziałało od razu.' }
    ]
  },
  {
    id: 2,
    slug: 'automatyzacja-podatkow-wynajmu',
    title: 'Automatyzacja podatków: Ryczałt od najmu krótkoterminowego',
    excerpt: 'Przestań martwić się papierologią. Jak prawidłowo wyliczać 8,5% ryczałtu i czym różni się od najmu prywatnego?',
    date: '2026-06-08',
    readTime: '6 min',
    category: 'Finanse',
    blocks: [
      { type: 'h2', content: 'Wynajem krótkoterminowy a podatki w Polsce' },
      { type: 'p', content: 'Podatki w Polsce to temat rzeka. W przypadku najmu krótkoterminowego (na doby), urzędy skarbowe najczęściej traktują to jako działalność gospodarczą, ale wielu gospodarzy rozlicza się ryczałtem ewidencjonowanym.' },
      { type: 'h2', content: 'Ryczałt 8,5% vs 12,5%' },
      { type: 'p', content: 'Podstawowa stawka ryczałtu dla najmu to 8,5%. Jednak uwaga! Gdy Twoje przychody w danym roku przekroczą próg 100 000 zł, nadwyżka jest opodatkowana stawką 12,5%. Pilnowanie tego limitu bywa kłopotliwe.' },
      { type: 'p', content: 'W aplikacji WynajemPRO stworzyliśmy specjalny wskaźnik "Przychód YTD" (Year-to-Date), który automatycznie zlicza wszystkie Twoje rezerwacje. Gdy zbliżysz się do limitu, aplikacja powiadomi Cię i automatycznie zmieni stawkę kalkulatora na 12,5%.' },
      { type: 'h2', content: 'Prowizje portali a podstawa opodatkowania' },
      { type: 'p', content: 'Najczęstszy błąd? Odliczanie prowizji Airbnb lub Booking.com przed zapłatą ryczałtu. Pamiętaj, że ryczałt płaci się od *przychodu* (kwoty, którą wpłacił gość), a nie od *dochodu* (kwoty, która wpłynęła na Twoje konto). Moduł finansowy w WynajemPRO dodaje prowizje do podstawy opodatkowania automatycznie, by chronić Cię przed karami skarbowymi.' }
    ]
  },
  {
    id: 3,
    slug: 'wzorowy-kontakt-z-gosciem',
    title: 'Cyfrowy Przewodnik: Jak ograniczyć pytania o WiFi i kody do drzwi?',
    excerpt: 'Dostajesz 5 SMS-ów od gościa tuż po zameldowaniu? Stwórz cyfrowy przewodnik i zyskaj święty spokój.',
    date: '2026-06-01',
    readTime: '3 min',
    category: 'Obsługa',
    blocks: [
      { type: 'h2', content: 'Efekt pierwszego wrażenia' },
      { type: 'p', content: 'Gość, który musi czekać na odpowiedź z hasłem do WiFi, zaczyna pobyt od frustracji. Cyfrowy Przewodnik Gościa to link, który wysyłasz mu 24h przed przyjazdem.' },
      { type: 'list', items: [
        'Zawsze aktualne hasło WiFi z opcją "Kopiuj".',
        'Kod do sejfu / zamka elektronicznego ukryty aż do dnia zameldowania.',
        'Lokalne polecenia restauracji na interaktywnej mapie.',
        'Instrukcja obsługi klimatyzacji czy jacuzzi.'
      ]},
      { type: 'p', content: 'W WynajemPRO wystarczy włączyć moduł "Przewodnik", wygenerować link z poziomu ustawień obiektu i ustawić automatyczną wiadomość powitalną. Twój czas obsługi gościa spada z 15 minut do 0.' }
    ]
  }
];
