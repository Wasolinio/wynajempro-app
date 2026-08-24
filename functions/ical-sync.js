/**
 * SILNIK SYNCHRONIZACJI iCAL — WynajemPRO (X26)
 *
 * PO CO ISTNIEJE TEN PLIK. Do 2026-08-22 logika synchronizacji żyła w DWÓCH kopiach
 * (`syncICalCalendars` i `dailyICalSync`) po ~120 linii każda, i miała wadę, której nie
 * dało się załatać bez przepisania: kluczem tożsamości rezerwacji był `syncId` zbudowany
 * Z DAT (`sync_{źródło}_{obiekt}_{od}_{do}`). Kod potrafił więc odpowiedzieć wyłącznie na
 * pytanie „czy widziałem rezerwację z takimi datami?", a nie „czy to ta sama rezerwacja?".
 *
 * Skutki starego klucza, wszystkie potwierdzone w kodzie:
 *   • gość anuluje → zdarzenie znika z feedu → rezerwacja zostaje u nas NA ZAWSZE,
 *     noce zablokowane, gospodarz traci przychód i nie wie dlaczego;
 *   • gość zmienia daty → nowy `syncId` → DODANA druga rezerwacja, stara zostaje;
 *   • gospodarz kasuje zjawę ręcznie → feed nadal ją ma → WRACA przy następnym przebiegu.
 *
 * Format iCal ma na to pole: `UID`. Stary parser je czytał i wyrzucał.
 *
 * ZASADY TEGO MODUŁU:
 *   1. Kluczem jest `UID` ze zdarzenia, nie daty.
 *   2. Uzgadnianie (reconcile), nie dopisywanie: nowe → dodaj, zmienione → ZAKTUALIZUJ,
 *      znikłe → OZNACZ `syncStatus:'vanished'` i zostaw gospodarzowi decyzję.
 *   3. NIGDY nie kasujemy rezerwacji automatycznie. Czkawka feedu albo chwilowy błąd
 *      portalu nie może usuwać prawdziwych rezerwacji z pieniędzmi i podatkiem.
 *   4. Jeden dokument stanu na kanał zamiast jednego odczytu na zdarzenie.
 *
 * DLACZEGO DOKUMENT STANU — TO NIE JEST PRZEDWCZESNA OPTYMALIZACJA.
 * Symulacja rentowności z 2026-08-22 (`docs/strategy/Rentownosc-symulacja-2026-08-22.md`)
 * policzyła, że podniesienie częstotliwości do godziny PRZY STARYM WZORCU odczytu ścina
 * darmowy próg Firebase ze ~104 kont do ~10. Jeden dokument stanu na kanał daje
 * 444 odczyty/dobę/konto zamiast 480 przy synchronizacji 24× częstszej — czyli taniej
 * niż stan sprzed zmiany. Nie upraszczaj tego z powrotem do zapytania na zdarzenie.
 *
 * CZEGO TEN MODUŁ NIE ROBI I NIE BĘDZIE ROBIŁ. iCal przenosi wyłącznie zajętość terminu.
 * Nie ma w nim cen ani wiadomości, a Airbnb celowo usunął z eksportu nazwisko gościa
 * i kod rezerwacji (grudzień 2019). Ceny i prowizje to osobne zadanie (X27, poczta).
 */

const crypto = require("node:crypto");

const MAX_ICAL_BYTES = 5 * 1024 * 1024;

// ─────────────────────────────────────────────────────────────────────────────
// SSRF: walidacja adresu. Każdy hop przekierowania przechodzi ją od nowa —
// domyślne redirect:'follow' pozwalało ominąć walidację przez 302 na adres
// wewnętrzny albo metadata (audyt N5 🟡3).
// ─────────────────────────────────────────────────────────────────────────────
function isSafeUrl(url) {
  if (!url || typeof url !== "string") return false;
  if (!url.startsWith("http://") && !url.startsWith("https://")) return false;
  try {
    const hn = new URL(url).hostname.toLowerCase();
    if (hn.startsWith("10.") || hn.startsWith("192.168.") || hn.startsWith("127.")) return false;
    if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hn)) return false;
    if (hn.startsWith("169.254.")) return false;
    if (hn === "localhost" || hn === "0.0.0.0" || hn === "[::]") return false;
    if (hn === "::1" || hn === "[::1]") return false;
    if (hn.startsWith("fc") || hn.startsWith("fd") || hn.startsWith("fe80")) return false;
    if (hn === "metadata.google.internal" || hn === "metadata.internal") return false;
    return true;
  } catch {
    return false;
  }
}

async function fetchWithSafeRedirects(url, timeoutMs = 15000, maxRedirects = 3) {
  let current = url;
  for (let i = 0; i <= maxRedirects; i++) {
    if (!isSafeUrl(current)) throw new Error("Adres odrzucony przez walidację SSRF (przekierowanie)");
    const response = await fetch(current, { signal: AbortSignal.timeout(timeoutMs), redirect: "manual" });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) return response;
      current = new URL(location, current).toString();
      continue;
    }
    return response;
  }
  throw new Error("Przekroczono limit przekierowań (3)");
}

/** Pobiera feed z twardym limitem 5 MB (ochrona przed OOM). Zwraca tekst albo rzuca. */
async function fetchFeed(url) {
  const response = await fetchWithSafeRedirects(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const declared = response.headers.get("content-length");
  if (declared && parseInt(declared, 10) > MAX_ICAL_BYTES) {
    throw new Error("Plik iCal przekracza 5 MB (Content-Length)");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let text = "";
  let bytes = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    bytes += value.length;
    if (bytes > MAX_ICAL_BYTES) {
      reader.cancel("limit 5 MB");
      throw new Error("Plik iCal przekracza 5 MB (strumień)");
    }
    text += decoder.decode(value, { stream: true });
  }
  const pelny = text + decoder.decode();

  // Portal w awarii potrafi oddać HTTP 200 ze stroną logowania albo HTML-em błędu.
  // Bez tego sprawdzenia taka odpowiedź parsuje się do ZERA zdarzeń i silnik uznaje,
  // że wszystkie rezerwacje kanału zniknęły z portalu — co zdejmuje je z eksportu
  // i otwiera terminy w pozostałych portalach. Czyli czkawka jednego portalu
  // wywołuje overbooking, któremu ten moduł ma zapobiegać.
  if (!pelny.includes("BEGIN:VCALENDAR")) {
    throw new Error("Odpowiedź nie jest kalendarzem iCal (brak BEGIN:VCALENDAR)");
  }
  return pelny;
}

// ─────────────────────────────────────────────────────────────────────────────
// PARSER
// Czyta UID, DTSTART, DTEND, SUMMARY i STATUS.
//
// ⚖️ `DESCRIPTION` świadomie POMIJAMY, choć Airbnb trzyma tam link do rezerwacji i cztery
// ostatnie cyfry telefonu gościa. Parsowanie pola, którego nikt nie zapisuje, to martwy kod,
// a zapisanie go byłoby NOWYM przetwarzaniem danych osobowych gościa — czyli sprawą dla
// agenta `legal`, nie efektem ubocznym refaktoru. Gdy będzie potrzebne, wraca świadomie.
// ─────────────────────────────────────────────────────────────────────────────
function parseICalEvents(icalText) {
  const events = [];
  // RFC 5545: rozwijanie złamanych linii (CRLF + spacja/tab) MUSI iść przed podziałem
  const normalized = String(icalText).replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "").replace(/\r/g, "");
  const blocks = normalized.split("BEGIN:VEVENT");

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i].split("END:VEVENT")[0];
    const event = {};
    for (const line of block.split("\n")) {
      const colon = line.indexOf(":");
      if (colon === -1) continue;
      const key = line.substring(0, colon).split(";")[0].trim().toUpperCase();
      const value = line.substring(colon + 1).trim();
      if (key === "DTSTART") event.dtstart = value;
      else if (key === "DTEND") event.dtend = value;
      else if (key === "SUMMARY") event.summary = value;
      else if (key === "UID") event.uid = value;
      else if (key === "STATUS") event.status = value.toUpperCase();
    }
    if (event.dtstart) events.push(event);
  }
  return events;
}

/** `20260615` albo `20260615T140000Z` → `2026-06-15`. */
function formatICalDate(dateStr) {
  if (!dateStr || dateStr.length < 8) return null;
  const raw = String(dateStr).replace(/[^\d]/g, "").substring(0, 8);
  if (raw.length < 8) return null;
  return `${raw.substring(0, 4)}-${raw.substring(4, 6)}-${raw.substring(6, 8)}`;
}

/**
 * Klucz kanału = obiekt + źródło. Znaki rozbijające ścieżkę dokumentu (`/`, `.`, `#`,
 * `$`, `[`, `]`) trzeba usunąć — ale samo ich zastąpienie podkreśleniem SKLEJA różne
 * obiekty: „Domek/A" i „Domek_A" dałyby ten sam klucz i wspólny stan synchronizacji,
 * czyli dwa obiekty nadpisywałyby sobie nawzajem mapę tożsamości. Stąd doklejony
 * skrót z oryginalnej nazwy: część czytelna zostaje dla diagnostyki, a rozróżnialność
 * gwarantuje skrót.
 */
function channelKey(propertyName, sourceName) {
  const surowy = `${propertyName}__${sourceName}`;
  const skrot = crypto.createHash("sha1").update(surowy).digest("hex").slice(0, 8);
  const czytelny = surowy.replace(/[/\\.#$[\]]/g, "_").slice(0, 380);
  return `${czytelny}__${skrot}`;
}

/** Nazwa gościa z SUMMARY. Blokady portali oznaczamy wprost, żeby nie udawały gości. */
function guestFromSummary(summary, normalizedSource) {
  const clean = (summary || "").trim();
  const lower = clean.toLowerCase();
  if (!clean) return `Gość ${normalizedSource}`;
  if (lower.includes("blocked") || lower.includes("niedostępne") ||
      lower.includes("not available") || lower.includes("closed")) {
    return `Blokada (${normalizedSource})`;
  }
  return clean;
}

// ─────────────────────────────────────────────────────────────────────────────
// SILNIK
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Uzgadnia JEDEN kanał (obiekt × źródło) z jego feedem.
 *
 * @returns {{dodane:number, zmienione:number, znikle:number, wrocone:number, pominiete:boolean}}
 */
async function reconcileChannel(db, uid, propertyName, sourceName, url, log = console) {
  const key = channelKey(propertyName, sourceName);
  const stateRef = db.collection("users").doc(uid).collection("syncState").doc(key);
  const rentalsRef = db.collection("users").doc(uid).collection("rentals");
  const normalizedSource = sourceName.charAt(0).toUpperCase() + sourceName.slice(1);

  const text = await fetchFeed(url);
  const events = parseICalEvents(text);

  // Suma kontrolna liczona z TREŚCI ZNACZĄCEJ, nie z surowego tekstu. Portale wstawiają
  // do eksportu pole DTSTAMP generowane przy każdym pobraniu — hash z całego pliku nigdy
  // by się nie powtórzył, wczesne wyjście nigdy by nie zadziałało, a rachunek kosztów
  // z symulacji rentowności (444 odczyty/dobę zamiast 480) przestałby obowiązywać.
  // Tak liczona suma jest odporna z definicji, a nie z założenia o zachowaniu portalu.
  const hash = crypto.createHash("sha1").update(
    events
      .filter((e) => e.uid)
      .map((e) => `${e.uid}|${formatICalDate(e.dtstart)}|${formatICalDate(e.dtend)}|${e.status || ""}`)
      .sort()
      .join("\n")
  ).digest("hex");

  const stateSnap = await stateRef.get();            // ← JEDEN odczyt na kanał
  const state = stateSnap.exists ? stateSnap.data() : null;

  // Feed bez zmian — nic nie robimy. To jest typowy przypadek przy synchronizacji
  // co godzinę i powód, dla którego częstotliwość nie przekłada się na koszt.
  if (state && state.hash === hash) {
    return { dodane: 0, zmienione: 0, znikle: 0, wrocone: 0, pominiete: true };
  }

  const feed = new Map();
  let bezUid = 0;
  for (const evt of events) {
    if (!evt.uid) { bezUid++; continue; }            // bez UID nie umiemy śledzić tożsamości
    if (evt.status === "CANCELLED") continue;        // portal sam mówi, że odwołane
    const date = formatICalDate(evt.dtstart);
    const endDate = formatICalDate(evt.dtend);
    if (!date || !endDate) continue;
    // Dwa zdarzenia o tym samym UID (RECURRENCE-ID albo błąd portalu) zlewałyby się
    // po cichu — jedna zajętość znikałaby bez śladu. Zostawiamy WCZEŚNIEJSZĄ datę
    // (bezpieczniejsza: dłużej blokuje termin) i zapisujemy to w logu.
    const juzJest = feed.get(evt.uid);
    if (juzJest) {
      log.warn(`[${uid}] ${propertyName}/${normalizedSource}: powtórzony UID ${evt.uid} w feedzie`);
      if (juzJest.date <= date) continue;
    }
    feed.set(evt.uid, { date, endDate, summary: evt.summary });
  }

  // Mapa UID → id dokumentu rezerwacji. Przy pierwszym przebiegu po wdrożeniu
  // dokumentu stanu jeszcze nie ma — wtedy JEDNORAZOWO zaciągamy istniejące
  // rezerwacje tego kanału i przygarniamy je po datach (patrz niżej).
  const known = (state && state.map) ? { ...state.map } : {};
  const odtworzoneDane = {};
  let legacy = null;

  // Brak dokumentu stanu — odbudowujemy mapę z tego, co leży w bazie.
  //
  // ⚠️ TO NIE JEST NADMIAROWA OSTROŻNOŚĆ. Dokument stanu może zniknąć: nieudany `commit`
  // ostatniej porcji zapisów (stan leci właśnie w niej), skasowanie przy diagnostyce,
  // czyszczenie po awarii.
  // Gdyby wtedy mapa startowała pusta, KAŻDE zdarzenie feedu wyglądałoby na nowe
  // i silnik zdublowałby cały kanał — czyli popełniłby dokładnie ten błąd, dla którego
  // naprawy powstał. Dlatego źródłem prawdy o tożsamości jest `syncUid` NA REZERWACJI,
  // a dokument stanu jest wyłącznie optymalizacją kosztu odczytów.
  if (!state) {
    const istniejace = await wczytajRezerwacjeKanalu(rentalsRef, propertyName, normalizedSource);
    for (const r of istniejace) {
      if (!r.syncUid) continue;
      known[r.syncUid] = r.id;
      // Daty MUSZĄ trafić do odtworzonego stanu. Bez nich próg „pobyt zakończony ponad
      // 60 dni temu" nie ma na czym pracować i po utracie dokumentu stanu wszystko, czego
      // nie ma w bieżącym feedzie, dostaje `vanished` — łącznie z pobytami sprzed roku,
      // które portal normalnie przestał już eksportować. Te wpisy nigdy też nie wypadałyby
      // z mapy, bo warunek przycinania wymaga daty.
      odtworzoneDane[r.syncUid] = {
        date: r.date || "", endDate: r.endDate || r.date || "",
        ...(r.syncStatus === "vanished" ? { vanished: true } : {}),
      };
    }
    legacy = istniejace.filter((r) => !r.syncUid);
  }

  // Firestore przyjmuje maksymalnie 500 operacji na batch. Feed obiektu z długą
  // historią potrafi mieć ich więcej — zbieramy zapisy i wysyłamy porcjami, zamiast
  // pozwolić, żeby cała synchronizacja kanału padła na jednym `commit`.
  // ⚠️ Każdy patch niesie pola tożsamości, choć „już tam są".
  // `set(..., {merge:true})` na dokumencie, który gospodarz SKASOWAŁ, tworzy go od nowa —
  // a mapa `known` nie wie o skasowaniu. Bez tych pól powstałby wpis bez `type: 'booking'`,
  // czyli niewidoczny dla kalendarza, listy rezerwacji, wykrywania kolizji i eksportu:
  // rezerwacja z portalu przestałaby istnieć dla gospodarza, a termin nie byłby niczym
  // zablokowany. Cicho. Trzy pola więcej w zapisie są tanią ceną za tę gwarancję.
  const tozsamosc = { type: "booking", property: propertyName, source: normalizedSource };
  const zapisy = [];
  const zapisz = (ref, data, merge) => zapisy.push({ ref, data, merge });
  let dodane = 0, zmienione = 0, znikle = 0, wrocone = 0;

  for (const [evtUid, dane] of feed) {
    const guest = guestFromSummary(dane.summary, normalizedSource);
    let docId = known[evtUid];

    // Przygarnięcie rezerwacji sprzed X26: pasuje obiekt, źródło i OBIE daty.
    // Dzięki temu wdrożenie nie duplikuje niczego, co gospodarz już ma w panelu,
    // i nie wymaga osobnego skryptu migracyjnego.
    if (!docId && legacy) {
      const dopasowana = legacy.find((r) => r.date === dane.date && r.endDate === dane.endDate && !r.przygarnieta);
      if (dopasowana) {
        dopasowana.przygarnieta = true;
        docId = dopasowana.id;
        zapisz(rentalsRef.doc(docId), { ...tozsamosc, syncUid: evtUid, syncStatus: "active" }, true);
        known[evtUid] = docId;
        continue;                                     // dane i tak się zgadzają
      }
    }

    if (!docId) {
      const ref = rentalsRef.doc();
      zapisz(ref, {
        type: "booking", property: propertyName, source: normalizedSource, guest,
        date: dane.date, endDate: dane.endDate,
        income: 0, advancePayment: 0, isAdvancePaid: false,
        commission: 0, tax: 0, vat: 0, utilities: 0,
        isPaid: false, completedTasks: {}, guestNote: "",
        syncUid: evtUid, syncStatus: "active",
      }, false);
      known[evtUid] = ref.id;
      dodane++;
      continue;
    }

    // Znane UID — sprawdzamy, czy portal czegoś nie zmienił.
    const poprzednie = (state && state.dane && state.dane[evtUid]) || odtworzoneDane[evtUid];
    const zmiana = !poprzednie || poprzednie.date !== dane.date || poprzednie.endDate !== dane.endDate;
    const bylaZnikla = poprzednie && poprzednie.vanished === true;

    if (zmiana || bylaZnikla) {
      // ⚠️ `guest` CELOWO nie wchodzi do aktualizacji. Airbnb wysyła w SUMMARY zawsze
      // „Reserved", więc dopisywanie go przy każdej zmianie dat kasowałoby nazwisko wpisane
      // ręcznie przez gospodarza — a baza wiedzy obiecuje wprost, że synchronizacja
      // „nie nadpisuje Twoich zmian". Nazwę ustawiamy WYŁĄCZNIE przy tworzeniu; potem
      // należy do gospodarza. ⚖️ Cena tego wyboru: dokument skasowany przez gospodarza
      // i wskrzeszony tym patchem powstanie bez nazwiska. To świadomy wybór mniejszej
      // szkody — utrata nazwiska w rzadkim przypadku wskrzeszenia jest tańsza niż
      // kasowanie go przy każdym przesunięciu pobytu.
      // `type`/`property`/`source` zostają, bo bez nich odtworzony dokument byłby
      // niewidoczny dla kalendarza i eksportu — to świadomy kompromis: rezerwacja
      // przeniesiona ręcznie do innego obiektu wróci do obiektu swojego kanału.
      const patch = { ...tozsamosc, date: dane.date, endDate: dane.endDate, syncStatus: "active" };
      zapisz(rentalsRef.doc(docId), patch, true);
      if (zmiana) zmienione++;
      if (bylaZnikla) wrocone++;
    }
  }

  // UID-y, których feed już nie zwraca. NIE KASUJEMY — oznaczamy i zostawiamy
  // gospodarzowi. Rezerwacja może mieć wpisany przychód, zaliczkę i podatek.
  // Próg „pobyt zamknięty": portale eksportują OKNO terminów, więc zakończona rezerwacja
  // wypada z feedu w normalnym trybie i nie jest anulowaniem.
  const PROG = new Date(Date.now() - 60 * 86400000).toISOString().slice(0, 10);

  // Feed przeszedł walidację kalendarza, ale nie zawiera ANI JEDNEGO zdarzenia, a my
  // znamy tu rezerwacje. To znacznie częściej znaczy „portal ma gorszy dzień" niż
  // „gospodarz odwołał wszystko naraz". Pomijamy oznaczanie i zostawiamy ślad w logu —
  // przy prawdziwym wyczyszczeniu kalendarza wystarczy, że stan wróci przy kolejnym przebiegu.
  // Feed bez UID-ów zaimportowałby ZERO rezerwacji, a gospodarz zobaczyłby „Kalendarze
  // aktualne — bez zmian". Diagnoza takiego zdarzenia byłaby ślepa, stąd licznik w logu.
  if (bezUid > 0) {
    log.warn(`[${uid}] ${propertyName}/${normalizedSource}: pominięto ${bezUid} zdarzeń bez UID`);
  }

  // Rozróżniamy dwie sytuacje, które wcześniej były jedną:
  //   • plik NIE MA ANI JEDNEGO zdarzenia → podejrzane, portal bywa w awarii;
  //   • zdarzenia SĄ, ale wszystkie mają STATUS:CANCELLED → to jawne anulowanie, ufamy mu.
  // Bez tego rozdziału gospodarz z jednym domkiem i jedną rezerwacją nigdy nie zobaczyłby
  // anulowania — a to jest profil docelowego klienta.
  const plikPusty = events.length === 0;
  const podejrzane = plikPusty && Object.keys(known).length > 0;

  // ⚠️ Bezpiecznik mierzy CZAS, nie liczbę wywołań. Licznik przebiegów dawał się zwinąć
  // do kilkunastu sekund: ręczny przycisk „Synchronizacja" idzie tą samą ścieżką, więc
  // gospodarz, któremu „nie działa", klikał trzy razy pod rząd i po trzecim kliknięciu
  // cały kanał dostawał `vanished` — mimo że portal był w awarii od minuty.
  // ⚠️ Dla Airbnb ten próg jest JEDYNĄ drogą do wykrycia anulowania. Zweryfikowane na żywym
  // feedzie 2026-08-24: Airbnb nie wysyła pola `STATUS` w ogóle (0 z 7 zdarzeń), więc gałąź
  // „wszystkie zdarzenia CANCELLED" nigdy się dla tego portalu nie odpali i cały ciężar
  // spoczywa tutaj. Skracanie tego progu „dla wygody" osłabia jedyne zabezpieczenie.
  const TRZY_GODZINY = 3 * 3600 * 1000;
  const pierwszyPustyOd = podejrzane
    ? ((state && state.pierwszyPustyOd) || new Date().toISOString())
    : null;
  // Nieczytelny znacznik traktujemy jak BRAK znacznika (odliczanie od nowa), a nie jak
  // „jeszcze nie czas" — to drugie dawałoby wstrzymanie bez końca, czyli awarię, którą
  // ten bezpiecznik miał usunąć, tylko innymi drzwiami.
  const sparsowane = pierwszyPustyOd ? Date.parse(pierwszyPustyOd) : NaN;
  // Normalizujemy TAKŻE wartość, która wróci do stanu. Reset samego `czekamyOd` w pamięci
  // nie wystarczał: nieczytelny znacznik zapisywał się z powrotem i każdy kolejny przebieg
  // znów startował odliczanie od zera, więc próg 3 h nie zostałby osiągnięty nigdy.
  const znacznikCzasu = Number.isFinite(sparsowane) ? pierwszyPustyOd : new Date().toISOString();
  const czekamyOd = Number.isFinite(sparsowane) ? sparsowane : Date.now();
  const dlugoPusty = podejrzane && (Date.now() - czekamyOd) >= TRZY_GODZINY;
  const masoweZniknięcie = podejrzane && !dlugoPusty;
  if (masoweZniknięcie) {
    const minut = Math.round((Date.now() - czekamyOd) / 60000);
    log.warn(`[${uid}] ${propertyName}/${normalizedSource}: pusty kalendarz przy ${Object.keys(known).length} znanych rezerwacjach (od ${minut} min, próg 180 min) — wstrzymuję oznaczanie`);
  }

  for (const [znanyUid, docId] of Object.entries(known)) {
    if (masoweZniknięcie) break;
    if (feed.has(znanyUid)) continue;
    // Zakończony pobyt wypada z feedu w normalnym trybie — to nie jest anulowanie.
    const poprz = (state && state.dane && state.dane[znanyUid]) || odtworzoneDane[znanyUid] || {};
    const koniecPobytu = poprz.endDate || poprz.date || "";
    if (koniecPobytu && koniecPobytu < PROG) continue;
    const poprzednie = (state && state.dane && state.dane[znanyUid]) || odtworzoneDane[znanyUid];
    if (poprzednie && poprzednie.vanished === true) continue;   // już oznaczona
    const p = (state && state.dane && state.dane[znanyUid]) || odtworzoneDane[znanyUid] || {};
    zapisz(rentalsRef.doc(docId), {
      ...tozsamosc, syncStatus: "vanished",
      ...(p.date ? { date: p.date } : {}), ...(p.endDate ? { endDate: p.endDate } : {}),
    }, true);
    znikle++;
  }

  // Nowy stan kanału: mapa UID→dokument oraz ostatnio widziane daty (do wykrywania zmian).
  // Portale eksportują OKNO (bieżące i przyszłe terminy), więc zakończona rezerwacja
  // prędzej czy później wypada z feedu — i to NIE jest anulowanie. `map` (tożsamość)
  // zostaje na stałe, `dane` (daty) kurczą się do nagrobka; szczegóły przy przycinaniu niżej.


  const dane = {};
  for (const [evtUid, d] of feed) dane[evtUid] = { date: d.date, endDate: d.endDate };
  for (const znanyUid of Object.keys(known)) {
    if (feed.has(znanyUid)) continue;
    const p = (state && state.dane && state.dane[znanyUid]) || odtworzoneDane[znanyUid] || {};
    const koniec = p.endDate || p.date || "";
    // Pobyt zamknięty zostawia NAGROBEK, a nie pustkę.
    //
    // ⚠️ Trzy podejścia, trzy różne awarie — warto znać wszystkie, zanim ktoś to „uprości":
    //   1. usunięcie z `map` i `dane` → powrót UID-u do feedu zakładał DRUGI dokument;
    //   2. usunięcie z samego `dane` → następny pełny przebieg nie miał daty, bramka PROG
    //      nie odpalała (pusty napis jest falsy) i wpis dostawał fałszywe `vanished`;
    //      gorzej, `set(merge)` na dokumencie skasowanym wcześniej przez gospodarza
    //      wskrzeszał go BEZ POLA `date`, czyli w postaci łamiącej `isValidRental`
    //      w firestore.rules — panel takiego dokumentu nie widzi, a reguła odrzuca
    //      każdą jego edycję;
    //   3. nagrobek → tożsamość zostaje w `map`, data zostaje w `dane`, reszta leci.
    // Nagrobek waży kilkadziesiąt bajtów: przy 50 rezerwacjach rocznie na dwa kanały to
    // rzędu 4 kB rocznie, więc limit 1 MiB dokumentu stanu jest poza horyzontem.
    if (koniec && koniec < PROG) {
      dane[znanyUid] = { endDate: koniec, zamkniety: true };
      continue;
    }
    // `vanished` w stanie znaczy „rezerwacja ZOSTAŁA oznaczona", a nie „wypadła z feedu".
    // Gdy oznaczanie wstrzymano (podejrzanie pusty kalendarz) albo pobyt jest już zamknięty,
    // znacznika NIE stawiamy — inaczej kolejny przebieg uzna ją za obsłużoną i oznaczenie
    // nie nastąpi nigdy, a przy powrocie rezerwacji doliczyłby fałszywe „przywrócone".
    const oznaczonaTeraz = !masoweZniknięcie && !(koniec && koniec < PROG);
    const bylaOznaczona = (state && state.dane && state.dane[znanyUid] || {}).vanished === true;
    dane[znanyUid] = {
      date: p.date || "", endDate: koniec,
      ...((oznaczonaTeraz || bylaOznaczona) ? { vanished: true } : {}),
    };
  }
  zapisz(stateRef, {
    // Przy wstrzymaniu zapisujemy pusty hash, żeby następny przebieg NIE wyszedł wcześnie
    // po sumie kontrolnej — inaczej zegar nigdy nie zostałby sprawdzony.
    hash: masoweZniknięcie ? "" : hash,
    // `null` zeruje odliczanie, gdy feed wrócił do normy.
    pierwszyPustyOd: masoweZniknięcie ? znacznikCzasu : null,
    map: known, dane,
    property: propertyName, source: normalizedSource,
    updatedAt: new Date().toISOString(),
  }, false);

  const NA_BATCH = 450;   // zapas do limitu 500
  for (let i = 0; i < zapisy.length; i += NA_BATCH) {
    const batch = db.batch();
    for (const z of zapisy.slice(i, i + NA_BATCH)) {
      if (z.merge) batch.set(z.ref, z.data, { merge: true });
      else batch.set(z.ref, z.data);
    }
    await batch.commit();
  }
  return { dodane, zmienione, znikle, wrocone, pominiete: false };
}

/**
 * Odczyt rezerwacji kanału — wykonywany TYLKO wtedy, gdy nie ma dokumentu stanu.
 * Zwraca wszystkie (z `syncUid` i bez), bo służy do dwóch rzeczy naraz: odbudowy mapy
 * tożsamości oraz przygarnięcia rezerwacji sprzed X26, które UID jeszcze nie mają.
 */
async function wczytajRezerwacjeKanalu(rentalsRef, propertyName, normalizedSource) {
  const snap = await rentalsRef
    .where("type", "==", "booking")
    .where("property", "==", propertyName)
    .where("source", "==", normalizedSource)
    .get();
  return snap.docs.map((d) => ({
    id: d.id,
    syncUid: d.data().syncUid || null,
    // `syncStatus` jest tu NIEZBĘDNY, nie informacyjny: po utracie dokumentu stanu to jedyne
    // źródło wiedzy o tym, że rezerwacja była oznaczona jako znikła. Bez niego wracająca
    // do feedu rezerwacja nie dostaje żadnego patcha (daty się zgadzają, `bylaZnikla` fałszywe)
    // i zostaje `vanished` NA ZAWSZE — wypadając z eksportu, czyli zwalniając w portalach
    // termin, który jest sprzedany.
    syncStatus: d.data().syncStatus || null,
    date: d.data().date,
    endDate: d.data().endDate,
    przygarnieta: false,
  }));
}

/**
 * Uzgadnia wszystkie kanały jednego użytkownika.
 * Błąd jednego kanału nie przerywa pozostałych — portal bywa chwilowo niedostępny.
 */
async function syncUser(db, uid, syncLinks, log = console) {
  const suma = { dodane: 0, zmienione: 0, znikle: 0, wrocone: 0, kanaly: 0, bledy: 0 };

  for (const [propertyName, links] of Object.entries(syncLinks || {})) {
    if (!links || typeof links !== "object") continue;
    for (const [sourceName, url] of Object.entries(links)) {
      if (!url || typeof url !== "string") continue;
      if (!isSafeUrl(url)) {
        // Logujemy sam host — pełny URL iCal bywa nośnikiem sekretu (token w ścieżce).
        let host = "nieparsowalny";
        try { host = new URL(url).host; } catch { /* zostaje */ }
        log.warn(`[${uid}] Odrzucono niebezpieczny URL iCal (host: ${host})`);
        suma.bledy++;
        continue;
      }
      try {
        const r = await reconcileChannel(db, uid, propertyName, sourceName, url, log);
        suma.dodane += r.dodane; suma.zmienione += r.zmienione;
        suma.znikle += r.znikle; suma.wrocone += r.wrocone;
        suma.kanaly++;
      } catch (err) {
        log.warn(`[${uid}] Błąd kanału ${propertyName}/${sourceName}: ${err.message}`);
        suma.bledy++;
      }
    }
  }
  return suma;
}

module.exports = {
  syncUser, reconcileChannel,
  parseICalEvents, formatICalDate, channelKey, guestFromSummary,
  isSafeUrl, fetchWithSafeRedirects, fetchFeed,
};
