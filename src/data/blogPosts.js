export const blogPosts = [
  {
    id: 1,
    slug: 'jak-uniknac-podwojnych-rezerwacji',
    title: 'Jak uniknąć podwójnych rezerwacji (overbooking) dzięki synchronizacji iCal?',
    excerpt: 'Podwójna rezerwacja to najgorszy koszmar każdego gospodarza. Dowiedz się, jak za darmo zautomatyzować kalendarz między Booking.com a Airbnb.',
    date: '2026-06-11',
    readTime: '4 min',
    category: 'Szkolenia',
    image: 'bg-blue-500', // Użyjemy gradientu lub ikony zamiast pliku, by było szybciej
    blocks: [
      { type: 'h2', content: 'Koszmar podwójnej rezerwacji' },
      { type: 'p', content: 'Dostajesz powiadomienie o nowej rezerwacji z Booking.com. Cieszysz się, ale po minucie wibruje telefon - kolejna rezerwacja, tym razem z Airbnb. W ten sam weekend, na ten sam apartament. Brzmi znajomo? Overbooking to nie tylko stres, ale też ryzyko ogromnych kar finansowych i zablokowania konta na portalu.' },
      { type: 'p', content: 'Ręczne blokowanie terminów to przeszłość. Rozwiązaniem, które w 99% przypadków ratuje sytuację, jest synchronizacja poprzez format iCal (iCalendar).' },
      { type: 'h2', content: 'Czym jest link iCal?' },
      { type: 'p', content: 'iCal to otwarty standard wymiany danych kalendarzowych. Każdy portal rezerwacyjny (OTA) pozwala na wygenerowanie specjalnego, tajnego linku dla danego obiektu, a także na wklejenie linków z innych portali.' },
      { type: 'h2', content: 'Jak podłączyć iCal w WynajemPRO?' },
      { type: 'list', items: [
        'Zaloguj się do portalu Booking.com, wejdź w zakładkę Kalendarz i wybierz "Synchronizuj kalendarze". Skopiuj link eksportu.',
        'Zaloguj się do Airbnb i zrób to samo w zakładce "Zarządzaj kalendarzem".',
        'Wejdź w Ustawienia -> Kanały rezerwacji w aplikacji WynajemPRO.',
        'Wklej oba linki. WynajemPRO co kilka minut połączy się z portalem i zaktualizuje Twój główny pulpit oraz zablokuje zajęte terminy na innych platformach.'
      ]},
      { type: 'p', content: 'Dzięki centralizacji kalendarza w WynajemPRO, nie musisz łączyć Booking bezpośrednio z Airbnb (co często powoduje opóźnienia). Nasz system działa jak HUB, pilnując Twojego biznesu, gdy Ty śpisz.' }
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
    image: 'bg-purple-500',
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
    image: 'bg-emerald-500',
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
