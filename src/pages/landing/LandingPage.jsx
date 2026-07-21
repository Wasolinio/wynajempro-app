import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { blogPosts } from '../../data/blogPosts';
import LandingScrollDemo from './LandingScrollDemo';

// Kategoria wpisu → kolor tagu zgodny z paletą marki
const CATEGORY_TAG = {
  Szkolenia: 'wp4-tag--cynober',
  Finanse: 'wp4-tag--green',
  Obsługa: 'wp4-tag--booking',
};

/**
 * LandingPage — landing wierny systemowi identyfikacji wizualnej "Wynajem PRO" v1.0.
 *
 * Założenia brand booka:
 *  - Kolory: Paper #F3EFE5 / Surface #FBFAF6 / Ink #17150F / Cynober #D9492B /
 *    Zieleń #2F6B53 / Granat #234B7A / Amber #C99A2E / Hairline #DDD5C3.
 *  - Typografia: Schibsted Grotesk (nagłówki+UI), Newsreader italic (akcent),
 *    IBM Plex Mono (etykiety, liczby, dane).
 *  - Zasady: struktura liniami 1px (nie cieniami), zero emoji, zero gradientów,
 *    promień 3px (kontrolki) / 4px (panele), siatka max 1240px, padding 40px.
 *
 * Treść przeniesiona z głównego landingu (src/pages/LandingPage.jsx) i przełożona
 * na język marki: cena 29,99 zł, "Jak to działa", porównanie, case study, FAQ,
 * newsletter (zapis do Firestore).
 *
 * Komponent jest samowystarczalny — całe brandowanie żyje w lokalnym <style>,
 * niezależnie od globalnego Tailwinda aplikacji.
 */

const LogoMark = ({ size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* Atramentowy kafel — miniaturowa oś czasu rezerwacji */}
    <rect width="24" height="24" rx="4" fill="#17150F" />
    <rect x="5" y="6.5" width="14" height="3" rx="1.5" fill="#A0987F" />
    <rect x="5" y="11.5" width="14" height="3" rx="1.5" fill="#D9492B" />
    <rect x="5" y="16.5" width="14" height="3" rx="1.5" fill="#A0987F" />
  </svg>
);

const Logo = ({ onInk = false }) => (
  <span className={`wp4-logo${onInk ? ' wp4-logo--ink' : ''}`}>
    <LogoMark />
    <span className="wp4-logo__word">Wynajem</span>
    <span className="wp4-logo__pro">PRO</span>
  </span>
);

const FaqItem = ({ q, a }) => (
  <details className="wp4-faq__item">
    <summary>
      <span>{q}</span>
      <span className="wp4-faq__sign" aria-hidden="true">+</span>
    </summary>
    <p className="wp4-body">{a}</p>
  </details>
);

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [note, setNote] = useState('');
  const [noteErr, setNoteErr] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    setNote('');
    try {
      await addDoc(collection(db, 'newsletter_subscribers'), {
        email,
        subscribedAt: serverTimestamp(),
        source: 'landing_v4',
      });
      setNote('Dziękujemy — otrzymasz nasze poradniki.');
      setNoteErr(false);
      setEmail('');
    } catch (err) {
      console.error('Błąd newslettera', err);
      setNote('Błąd zapisu. Spróbuj ponownie.');
      setNoteErr(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="wp4">
      <style>{CSS}</style>

      {/* ───────────────────────── Top bar ───────────────────────── */}
      <header className="wp4-topbar">
        <div className="wp4-container wp4-topbar__inner">
          <Logo />
          <nav className="wp4-nav">
            <a href="#funkcje">Funkcje</a>
            <a href="#jak-to-dziala">Jak to działa</a>
            <a href="#dla-kogo">Dla kogo</a>
            <a href="#cennik">Cennik</a>
            <a href="#faq">FAQ</a>
            <Link to="/blog">Baza wiedzy</Link>
          </nav>
          <div className="wp4-topbar__cta">
            <Link to="/login" className="wp4-link">Zaloguj się</Link>
            <Link to="/login" className="wp4-btn wp4-btn--primary wp4-btn--sm">Wypróbuj</Link>
          </div>
        </div>
      </header>

      {/* ───────────────────────── Hero ───────────────────────── */}
      <section className="wp4-hero">
        <div className="wp4-container wp4-hero__grid">
          <div className="wp4-hero__copy">
            <span className="wp4-label">System dla mikro-gospodarzy</span>
            <h1 className="wp4-display">
              Wynajem <em>pod kontrolą</em><span className="wp4-accent">.</span>
            </h1>
            <p className="wp4-lead">
              Zautomatyzuj kalendarz, finanse i komunikację z gośćmi w jednym
              precyzyjnym panelu, który nie wymaga instrukcji obsługi.
            </p>
            <div className="wp4-hero__actions">
              <Link to="/login" className="wp4-btn wp4-btn--primary wp4-btn--lg">
                Rozpocznij 14-dniowy test
              </Link>
              <a href="#jak-to-dziala" className="wp4-btn wp4-btn--ghost wp4-btn--lg">
                Zobacz, jak to działa <span aria-hidden="true">→</span>
              </a>
            </div>
            <p className="wp4-hero__assure">
              <span className="wp4-dot wp4-dot--green" /> Karta kredytowa nie jest wymagana
            </p>
            <div className="wp4-hero__trust">
              <span className="wp4-label wp4-label--faint">Synchronizacja</span>
              <span className="wp4-chan wp4-chan--airbnb">Airbnb</span>
              <span className="wp4-chan wp4-chan--booking">Booking.com</span>
            </div>
          </div>

          {/* Panel KPI — mockup produktu */}
          <div className="wp4-hero__panel">
            <div className="wp4-panel">
              <div className="wp4-panel__head">
                <span className="wp4-label">Zysk netto · 2026</span>
                <span className="wp4-tag wp4-tag--green">▲ 12% VS 2025</span>
              </div>
              <div className="wp4-kpi">69 520 zł</div>
              <div className="wp4-hairline" />
              <table className="wp4-table">
                <thead>
                  <tr>
                    <th>Obiekt</th>
                    <th className="wp4-num">Przychód</th>
                    <th className="wp4-num">Zysk netto</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Apartament Centrum</td>
                    <td className="wp4-num">38 400 zł</td>
                    <td className="wp4-num wp4-num--green">33 280 zł</td>
                  </tr>
                  <tr>
                    <td>Domek nad jeziorem</td>
                    <td className="wp4-num">46 200 zł</td>
                    <td className="wp4-num wp4-num--green">36 240 zł</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td>Razem</td>
                    <td className="wp4-num">84 600 zł</td>
                    <td className="wp4-num wp4-num--green">69 520 zł</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="wp4-fig">RYS. 1 — Panel zysku netto</p>
          </div>
        </div>
      </section>

      {/* ───────────────────────── Wartości / głos marki ───────────────────────── */}
      <section className="wp4-values">
        <div className="wp4-container">
          <div className="wp4-values__grid">
            <article>
              <span className="wp4-label">01 · Rzeczowy</span>
              <h3 className="wp4-h3">Konkrety i liczby zamiast obietnic</h3>
              <p className="wp4-body">
                „Zysk 33&nbsp;280&nbsp;zł", nie „rosnące przychody". Każda decyzja
                oparta na realnych danych z Twoich obiektów.
              </p>
            </article>
            <article>
              <span className="wp4-label">02 · Spokojny</span>
              <h3 className="wp4-h3">Ton narzędzia, nie sprzedawcy</h3>
              <p className="wp4-body">
                Krótkie zdania, bez wykrzykników i żargonu. Interfejs, który
                nie wymaga instrukcji obsługi.
              </p>
            </article>
            <article>
              <span className="wp4-label">03 · Po imieniu</span>
              <h3 className="wp4-h3">Jeden człowiek, kilka obiektów</h3>
              <p className="wp4-body">
                Mówimy do Ciebie wprost. Zbudowany dla gospodarza, nie dla
                korporacji z działem operacyjnym.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ───────────────────────── Funkcje ───────────────────────── */}
      <section className="wp4-section" id="funkcje">
        <div className="wp4-container">
          <div className="wp4-section__head">
            <span className="wp4-label">Funkcje · 04</span>
            <h2 className="wp4-h2">Wszystko, co składa się na spokojny wynajem</h2>
            <p className="wp4-lead wp4-lead--narrow">
              Funkcje, które zdejmują z Twoich barków najwięcej powtarzalnej
              pracy — bez zbędnych opcji rodem z systemów hotelowych.
            </p>
          </div>

          <div className="wp4-features">
            <article className="wp4-feature">
              <span className="wp4-label">Kalendarz</span>
              <h3 className="wp4-h3">Koniec z podwójnymi rezerwacjami</h3>
              <p className="wp4-body">
                Dwukierunkowa synchronizacja iCal w czasie rzeczywistym.
                Rezerwacja na Booking natychmiast blokuje termin na Airbnb i
                w panelu.
              </p>
              <div className="wp4-feature__foot">
                <span className="wp4-tag wp4-tag--booking">BOOKING</span>
                <span className="wp4-flow" aria-hidden="true">⇄</span>
                <span className="wp4-tag wp4-tag--cynober">WYNAJEM PRO</span>
                <span className="wp4-flow" aria-hidden="true">⇄</span>
                <span className="wp4-tag wp4-tag--airbnb">AIRBNB</span>
              </div>
            </article>

            <article className="wp4-feature">
              <span className="wp4-label">Finanse</span>
              <h3 className="wp4-h3">Zysk na czysto liczony automatycznie</h3>
              <p className="wp4-body">
                Przychód, koszty i prowizje portali w jednym miejscu. Widzisz,
                ile naprawdę zostaje w kieszeni po odliczeniu Booking i Airbnb.
              </p>
              <div className="wp4-feature__foot">
                <span className="wp4-mini-num wp4-mini-num--green">+33 280 zł</span>
                <span className="wp4-label wp4-label--faint">zysk / obiekt</span>
              </div>
            </article>

            <article className="wp4-feature">
              <span className="wp4-label">Goście</span>
              <h3 className="wp4-h3">Cyfrowy przewodnik gościa premium</h3>
              <p className="wp4-body">
                Koniec z drukowanymi kartkami. Wi-Fi, kod do drzwi i instrukcje
                trafiają na telefon gościa automatycznie — przed przyjazdem.
              </p>
              <div className="wp4-feature__foot">
                <span className="wp4-tag wp4-tag--green">KOD WYSŁANY</span>
                <span className="wp4-label wp4-label--faint">auto · w dniu przyjazdu</span>
              </div>
            </article>

            <article className="wp4-feature">
              <span className="wp4-label">Podatki</span>
              <h3 className="wp4-h3">Ryczałt rozliczony bez stresu</h3>
              <p className="wp4-body">
                System pilnuje progu 100&nbsp;000&nbsp;zł i sam przełącza stawkę
                z 8,5% na 12,5%. Koniec z ręcznym liczeniem i strachem przed
                kontrolą.
              </p>
              <div className="wp4-feature__foot">
                <span className="wp4-tag wp4-tag--amber">RYCZAŁT 8,5%</span>
                <span className="wp4-flow" aria-hidden="true">→</span>
                <span className="wp4-tag wp4-tag--amber">12,5%</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ───────────────────────── Przewodnik gościa (mockup telefonu) ───────────────────────── */}
      <section className="wp4-section wp4-section--alt" id="przewodnik">
        <div className="wp4-container wp4-guide">
          <div className="wp4-guide__copy">
            <span className="wp4-label">Przewodnik gościa · 05</span>
            <h2 className="wp4-h2">
              Wszystko, czego gość potrzebuje — <em>zanim zapyta</em>
            </h2>
            <p className="wp4-body">
              Koniec z drukowanymi kartkami i powtarzanymi w kółko pytaniami.
              Wi-Fi, kod do drzwi, zasady i dojazd trafiają na telefon gościa
              automatycznie, jeszcze przed przyjazdem.
            </p>
            <ul className="wp4-checklist">
              <li>Kod do zamka wysłany w dniu przyjazdu</li>
              <li>Instrukcje i regulamin w jednym miejscu</li>
              <li>Mniej telefonów „o której kończy się doba?"</li>
            </ul>
            <Link to="/login" className="wp4-link wp4-link--strong">
              Stwórz własny przewodnik →
            </Link>
          </div>

          <div className="wp4-guide__figure">
            <div className="wp4-phone">
              <div className="wp4-phone__notch" aria-hidden="true" />
              <div className="wp4-phone__screen">
                {/* Nagłówek — placeholder "papier milimetrowy" z etykietą */}
                <div className="wp4-phone__head">
                  <span className="wp4-label">Twój przewodnik</span>
                  <h3 className="wp4-phone__title">Domki Letniskowe</h3>
                  <span className="wp4-label wp4-label--faint">Domek nr 2 · Mazury</span>
                </div>

                <div className="wp4-phone__body">
                  <p className="wp4-phone__hello">
                    Cześć! Witamy w obiekcie. Poniżej najważniejsze informacje,
                    które ułatwią Ci pobyt.
                  </p>

                  {/* Kod do skrytki */}
                  <div className="wp4-gcard">
                    <span className="wp4-label">Kod do skrytki na klucze</span>
                    <div className="wp4-pin">4921</div>
                  </div>

                  {/* Wi-Fi */}
                  <div className="wp4-gcard">
                    <span className="wp4-label">Sieć Wi-Fi</span>
                    <p className="wp4-gcard__name">Domek_WiFi_5G</p>
                    <p className="wp4-gcard__row">
                      Hasło: <code className="wp4-code">Wiosna2026!</code>
                    </p>
                  </div>

                  {/* Warto wiedzieć */}
                  <div className="wp4-gcard">
                    <span className="wp4-label">Warto wiedzieć</span>
                    <ul className="wp4-checklist wp4-checklist--tight">
                      <li>Doba kończy się o 11:00</li>
                      <li>Śmieci segregujemy do pojemników za domkiem</li>
                      <li>Grill na tarasie, węgiel pod schodami</li>
                    </ul>
                  </div>

                  {/* Dojazd — placeholder graph-paper z pinezką */}
                  <div className="wp4-gcard">
                    <span className="wp4-label">Jak dojechać</span>
                    <div className="wp4-minimap">
                      <span className="wp4-minimap__pin" aria-hidden="true" />
                    </div>
                  </div>
                </div>

                <div className="wp4-phone__foot">
                  <span className="wp4-btn wp4-btn--primary wp4-btn--sm wp4-btn--full">
                    Skontaktuj się z gospodarzem
                  </span>
                </div>
              </div>
            </div>
            <p className="wp4-fig">RYS. 3 — Cyfrowy przewodnik gościa</p>
          </div>
        </div>
      </section>

      {/* Panel — apple-scroll demo panelu (X2 v2, projekt z Claude Design) */}
      <LandingScrollDemo />

      {/* ───────────────────────── Jak to działa ───────────────────────── */}
      <section className="wp4-section wp4-section--alt" id="jak-to-dziala">
        <div className="wp4-container">
          <div className="wp4-section__head">
            <span className="wp4-label">Szybki start · 07</span>
            <h2 className="wp4-h2">Od rejestracji do pierwszej rezerwacji w 2 minuty</h2>
          </div>
          <div className="wp4-steps">
            <article className="wp4-step">
              <span className="wp4-step__num">01</span>
              <h3 className="wp4-h3">Załóż darmowe konto</h3>
              <p className="wp4-body">
                Podaj e-mail i hasło. Bez podpinania karty i ukrytych haczyków —
                dostajesz 14 dni na pełne testy.
              </p>
            </article>
            <article className="wp4-step">
              <span className="wp4-step__num">02</span>
              <h3 className="wp4-h3">Dodaj swoje obiekty</h3>
              <p className="wp4-body">
                W ustawieniach wpisz nazwy domków lub apartamentów i nadaj im
                własne kolory na kalendarzu.
              </p>
            </article>
            <article className="wp4-step">
              <span className="wp4-step__num">03</span>
              <h3 className="wp4-h3">Dodaj pierwszą rezerwację</h3>
              <p className="wp4-body">
                Zaznacz daty. System od razu wyliczy zysk na czysto i zaplanuje
                wysyłkę kodu PIN dla gościa.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* ───────────────────────── Dla kogo / porównanie ───────────────────────── */}
      <section className="wp4-section" id="dla-kogo">
        <div className="wp4-container">
          <div className="wp4-section__head">
            <span className="wp4-label">Dla kogo · 08</span>
            <h2 className="wp4-h2">
              System szyty na miarę, <em>nie skomplikowany moloch</em>
            </h2>
            <p className="wp4-lead wp4-lead--narrow">
              Obsługujesz wynajem po godzinach? Zobacz, dlaczego właściciele
              1–20 obiektów wybierają lekkie narzędzie zamiast oprogramowania
              hotelowego.
            </p>
          </div>

          <div className="wp4-compare">
            <div className="wp4-compare__col">
              <span className="wp4-label">Tradycyjne systemy</span>
              <ul className="wp4-xlist">
                <li>Przeładowany interfejs pełen opcji, których nigdy nie użyjesz</li>
                <li>Koszty od kilkuset do kilku tysięcy złotych rocznie</li>
                <li>Skomplikowane generowanie raportów „hotelowych"</li>
                <li>Brak polskiego ryczałtu i funkcji pod mały wynajem</li>
              </ul>
            </div>
            <div className="wp4-compare__col wp4-compare__col--ink">
              <div className="wp4-plan__badge">
                <Logo onInk />
              </div>
              <ul className="wp4-checklist wp4-checklist--ink">
                <li>Czytelny pulpit z gotową listą zadań na dany dzień</li>
                <li>Automatyczne przewodniki dla gości na każdy obiekt</li>
                <li>Zautomatyzowane podatki i podsumowanie miesiąca jednym kliknięciem</li>
                <li>Stała, niska cena niezależnie od liczby rezerwacji</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── Cennik ───────────────────────── */}
      <section className="wp4-section wp4-section--alt" id="cennik">
        <div className="wp4-container">
          <div className="wp4-section__head">
            <span className="wp4-label">Cennik · 09</span>
            <h2 className="wp4-h2">Zwraca się szybciej niż jedna doba najmu</h2>
            <p className="wp4-lead wp4-lead--narrow">
              Zero prowizji od rezerwacji. Stała opłata, bez limitów obiektów
              i rezerwacji.
            </p>
          </div>

          <div className="wp4-pricing">
            <div className="wp4-plan wp4-plan--feature">
              <div className="wp4-plan__badge">
                <span className="wp4-label">Plan Gospodarza</span>
                <span className="wp4-tag wp4-tag--cynober">OFERTA NA START</span>
              </div>
              <div className="wp4-plan__price">
                29,99 zł <span className="wp4-plan__per">/ miesiąc</span>
              </div>
              <p className="wp4-body wp4-body--ink">
                Wszystkie funkcje bez żadnych limitów. 1 domek czy 20
                apartamentów — ta sama, stała cena.
              </p>
              <ul className="wp4-checklist wp4-checklist--ink">
                <li>Nielimitowana liczba obiektów i rezerwacji</li>
                <li>Automatyczne raporty i podatki (ryczałt)</li>
                <li>Interaktywny kalendarz z synchronizacją iCal</li>
                <li>Cyfrowy przewodnik gościa premium</li>
                <li>Szyfrowana baza w chmurze, bez ukrytych prowizji</li>
              </ul>
              <Link to="/login" className="wp4-btn wp4-btn--paper">Zacznij 14-dniowy test</Link>
              <p className="wp4-plan__note">
                <span className="wp4-dot wp4-dot--green" /> Bez danych karty. Anulujesz jednym kliknięciem.
              </p>
            </div>

            <div className="wp4-plan">
              <span className="wp4-label">Dlaczego stała cena?</span>
              <h3 className="wp4-h3">Rozwijasz biznes bez kary za sukces</h3>
              <p className="wp4-body">
                Inni każą Ci płacić za każdy pokój lub pobierają prowizję od
                obrotu. U nas dodajesz kolejne obiekty bez dodatkowych kosztów.
              </p>
              <ul className="wp4-checklist">
                <li>Brak prowizji od rezerwacji</li>
                <li>Brak opłat za obiekt</li>
                <li>Brak długoterminowych umów</li>
              </ul>
              <Link to="/login" className="wp4-btn wp4-btn--ghost">Załóż darmowe konto</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────────────────── FAQ ───────────────────────── */}
      <section className="wp4-section" id="faq">
        <div className="wp4-container wp4-faq">
          <div className="wp4-faq__head">
            <span className="wp4-label">FAQ · 10</span>
            <h2 className="wp4-h2">Często zadawane pytania</h2>
            <p className="wp4-body">Wszystko, co musisz wiedzieć przed startem.</p>
          </div>
          <div className="wp4-faq__list">
            <FaqItem
              q="Czy muszę podpinać kartę, żeby zacząć testy?"
              a="Nie. Rejestrujesz się podając tylko e-mail i hasło i dostajesz 14 dni pełnego dostępu. Decyzję o płatności podejmujesz dopiero, gdy upewnisz się, że system realnie oszczędza Twój czas."
            />
            <FaqItem
              q="Czy aplikacja chroni przed overbookingiem (Booking, Airbnb)?"
              a="Tak. Obsługujemy synchronizację kalendarzy w standardzie iCal. Rezerwacje z popularnych portali automatycznie blokują terminy w Twoim kalendarzu, zapobiegając podwójnym rezerwacjom."
            />
            <FaqItem
              q="Czy system wylicza polskie podatki (ryczałt)?"
              a="Tak. Aplikacja powstała z myślą o polskich realiach. Wspiera m.in. automatyczne wyliczanie ryczałtu 8,5% wraz z przejściem na próg 12,5% po przekroczeniu 100 000 zł."
            />
            <FaqItem
              q="Mam 5 domków. Czy abonament będzie droższy?"
              a="Nie. 29,99 zł miesięcznie to opłata ryczałtowa za całe konto. Możesz dodać 1, 5, a nawet 20 obiektów i nielimitowaną liczbę rezerwacji w tej samej, stałej cenie."
            />
            <FaqItem
              q="Czy aplikacja działa na telefonie?"
              a="Tak, WynajemPRO jest w pełni responsywny. Z powodzeniem dodasz rezerwację, sprawdzisz kalendarz i koszty ze smartfona, będąc w drodze."
            />
            <FaqItem
              q="Co, gdy będę potrzebować pomocy?"
              a="Aplikacja jest zaprojektowana tak, by nie wymagać szkoleń. Jeśli jednak utkniesz, nasz polskojęzyczny zespół wsparcia odpowie po ludzku — nie bot."
            />
          </div>
        </div>
      </section>

      {/* ───────────────────────── Baza wiedzy / blog ───────────────────────── */}
      <section className="wp4-section wp4-section--alt" id="blog">
        <div className="wp4-container">
          <div className="wp4-blog__head">
            <div>
              <span className="wp4-label">Baza wiedzy · 11</span>
              <h2 className="wp4-h2">Ucz się od praktyków</h2>
            </div>
            <Link to="/blog" className="wp4-link wp4-link--strong">
              Wszystkie wpisy →
            </Link>
          </div>

          <div className="wp4-blog__grid">
            {blogPosts.slice(0, 3).map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="wp4-post">
                <div className="wp4-post__top">
                  <span className={`wp4-tag ${CATEGORY_TAG[post.category] || 'wp4-tag--cynober'}`}>
                    {post.category}
                  </span>
                  <span className="wp4-label wp4-label--faint">{post.readTime}</span>
                </div>
                <h3 className="wp4-post__title">{post.title}</h3>
                <p className="wp4-body wp4-post__excerpt">{post.excerpt}</p>
                <span className="wp4-post__more">Czytaj →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────── CTA + newsletter ───────────────────────── */}
      <section className="wp4-cta">
        <div className="wp4-container wp4-cta__inner">
          <h2 className="wp4-cta__title">
            Mniej chaosu.<br />Więcej wynajmu.
          </h2>
          <p className="wp4-cta__lead">
            Raz w miesiącu wyślemy Ci konkretne triki na więcej rezerwacji
            bezpośrednich i niższe koszty. Zero spamu.
          </p>

          <form className="wp4-news" onSubmit={handleSubscribe}>
            <label className="wp4-news__field">
              <span className="wp4-label wp4-label--ink">Adres e-mail</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="anna@wynajempro.com"
              />
            </label>
            <button type="submit" className="wp4-btn wp4-btn--primary wp4-btn--lg" disabled={submitting}>
              {submitting ? 'Zapisuję…' : 'Zapisz się'}
            </button>
          </form>
          {note && <p className={`wp4-news__note${noteErr ? ' wp4-news__note--err' : ''}`} role="status">{note}</p>}

          <div className="wp4-cta__or">
            <span className="wp4-label wp4-label--ink-faint">lub</span>
          </div>
          <Link to="/login" className="wp4-btn wp4-btn--paper wp4-btn--lg">
            Rozpocznij 14-dniowy test
          </Link>
          <span className="wp4-label wp4-label--ink-faint">Karta nie jest wymagana</span>
        </div>
      </section>

      {/* ───────────────────────── Footer ───────────────────────── */}
      <footer className="wp4-footer">
        <div className="wp4-container">
          <div className="wp4-footer__grid">
            <div className="wp4-footer__brand">
              <Logo />
              <p className="wp4-body wp4-footer__about">
                Narzędzie dla właścicieli nieruchomości na wynajem
                krótkoterminowy. Automatyzuj, unikaj overbookingu i odzyskaj
                czas każdego dnia.
              </p>
            </div>
            <div className="wp4-footer__col">
              <span className="wp4-label">Produkt</span>
              <a href="#funkcje">Funkcje</a>
              <a href="#cennik">Cennik</a>
              <a href="#dla-kogo">Dla kogo</a>
              <Link to="/login">Logowanie</Link>
            </div>
            <div className="wp4-footer__col">
              <span className="wp4-label">Zasoby</span>
              <Link to="/blog">Baza wiedzy</Link>
              <a href="#faq">FAQ</a>
              <a href="#panel">Demo panelu</a>
            </div>
            <div className="wp4-footer__col">
              <span className="wp4-label">Firma</span>
              <Link to="/kontakt">Kontakt</Link>
              <Link to="/regulamin">Regulamin</Link>
              <Link to="/prywatnosc">Prywatność</Link>
            </div>
          </div>
          <div className="wp4-footer__bottom">
            <span className="wp4-label wp4-label--faint">
              © {new Date().getFullYear()} WynajemPRO · dla polskich gospodarzy
            </span>
            <span className="wp4-label wp4-label--faint">Identyfikacja v1.0 · 2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   Style brandowe — scope `.wp4`. Tokeny 1:1 z brand bookiem.
   ────────────────────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700;800&family=Newsreader:ital,wght@1,400;1,500&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

.wp4 {
  --paper:#F3EFE5; --surface:#FBFAF6; --ink:#17150F;
  --cynober:#D9492B; --cynober-hover:#C23E22;
  --green:#2F6B53; --granat:#234B7A; --amber:#C99A2E;
  --hairline:#DDD5C3; --inner:#EFE9DA;
  --tint-cynober:#F6E5DF; --tint-green:#E7EDE7; --tint-amber:#FBF1D9;
  /* --faint/--label: minimum 4.5:1 (WCAG AA) na --paper dla mikro-etykiet */
  --muted:#524C3F; --faint:#716951; --label:#746C54;
  --ink-on:#E4DDCE; --ink-faint:#8C8576; --ink-label:#6B6555; --ink-line:#2C2920;

  background:var(--paper);
  color:var(--ink);
  font-family:'Schibsted Grotesk', system-ui, sans-serif;
  -webkit-font-smoothing:antialiased;
  line-height:1.6;
}
.wp4 *{ box-sizing:border-box; }

.wp4-container{ max-width:1240px; margin:0 auto; padding:0 40px; }

/* ── Typografia ── */
.wp4-display{
  font-weight:800; font-size:64px; line-height:1.04; letter-spacing:-.035em;
  margin:0 0 18px; max-width:14ch;
}
.wp4-display em{ font-family:'Newsreader', serif; font-style:italic; font-weight:400; letter-spacing:-.02em; }
.wp4-accent{ color:var(--cynober); }
.wp4-h2{ font-weight:700; font-size:34px; line-height:1.1; letter-spacing:-.03em; margin:0; }
.wp4-h2 em{ font-family:'Newsreader', serif; font-style:italic; font-weight:400; }
.wp4-h3{ font-weight:700; font-size:20px; line-height:1.2; letter-spacing:-.02em; margin:12px 0 8px; }
.wp4-lead{ font-size:19px; line-height:1.6; color:var(--muted); margin:0 0 32px; max-width:46ch; }
.wp4-lead--narrow{ margin:16px 0 0; font-size:18px; }
.wp4-body{ font-size:16px; line-height:1.6; color:var(--muted); margin:0; }
.wp4-body--ink{ color:var(--ink-on); }

.wp4-label{
  font-family:'IBM Plex Mono', monospace; font-weight:500; font-size:12px;
  letter-spacing:.10em; text-transform:uppercase; color:var(--label);
  display:inline-block;
}
.wp4-label--faint{ color:var(--faint); }
.wp4-label--ink{ color:var(--ink-label); }
.wp4-label--ink-faint{ color:var(--ink-faint); }

/* ── Logo ── */
.wp4-logo{ display:inline-flex; align-items:center; gap:9px; }
.wp4-logo__word{ font-weight:800; font-size:19px; letter-spacing:-.02em; color:var(--ink); }
.wp4-logo__pro{
  font-family:'IBM Plex Mono', monospace; font-weight:600; font-size:12px;
  letter-spacing:.08em; color:var(--cynober);
  border:1px solid var(--hairline); border-radius:3px; padding:2px 6px;
}
.wp4-logo--ink .wp4-logo__word{ color:var(--ink-on); }
.wp4-logo--ink .wp4-logo__pro{ border-color:var(--ink-line); }

/* ── Przyciski ── */
.wp4-btn{
  display:inline-flex; align-items:center; gap:8px; justify-content:center;
  font-family:'Schibsted Grotesk', sans-serif; font-weight:600; font-size:15px;
  padding:13px 22px; border-radius:3px; border:1px solid transparent;
  cursor:pointer; text-decoration:none;
  transition:background .15s, border-color .15s, color .15s, transform .15s cubic-bezier(.22,1,.36,1);
}
.wp4-btn:active:not(:disabled){ transform:scale(.98); }
.wp4 :is(button, a):focus-visible{ outline:2px solid var(--cynober); outline-offset:2px; }
.wp4-btn--sm{ padding:9px 16px; font-size:14px; }
.wp4-btn--lg{ padding:15px 28px; font-size:16px; }
.wp4-btn--primary{ background:var(--cynober); color:#fff; }
.wp4-btn--primary:hover{ background:var(--cynober-hover); }
.wp4-btn--primary:disabled{ opacity:.6; cursor:default; }
.wp4-btn--ghost{ background:transparent; color:var(--ink); border-color:var(--hairline); }
.wp4-btn--ghost:hover{ border-color:var(--ink); }
.wp4-btn--paper{ background:var(--paper); color:var(--ink); }
.wp4-btn--paper:hover{ background:#fff; }

.wp4-link{
  font-weight:600; font-size:15px; color:var(--ink); text-decoration:none;
  border-bottom:1px solid transparent; transition:border-color .15s, color .15s;
}
.wp4-link:hover{ border-color:var(--ink); }
.wp4-link--strong{ color:var(--cynober); display:inline-block; margin-top:8px; }
.wp4-link--strong:hover{ border-color:var(--cynober); }

/* ── Tagi / statusy ── */
.wp4-tag{
  font-family:'IBM Plex Mono', monospace; font-weight:500; font-size:11px;
  letter-spacing:.05em; text-transform:uppercase; padding:5px 10px; border-radius:3px;
  border:1px solid var(--hairline); color:var(--muted); white-space:nowrap;
}
.wp4-tag--green{ color:var(--green); background:var(--tint-green); border-color:#D7E2DA; }
.wp4-tag--amber{ color:var(--amber); background:var(--tint-amber); border-color:#EFE2C2; }
.wp4-tag--cynober{ color:var(--cynober); background:var(--tint-cynober); border-color:#EBD3CB; }
.wp4-tag--booking{ color:var(--granat); border-color:#C9D3E0; }
.wp4-tag--airbnb{ color:var(--cynober); border-color:#EBD3CB; }
.wp4-flow{ font-family:'IBM Plex Mono', monospace; color:var(--faint); font-size:13px; }

.wp4-chan{ font-weight:700; font-size:15px; }
.wp4-chan--airbnb{ color:var(--cynober); }
.wp4-chan--booking{ color:var(--granat); }

.wp4-mini-num{ font-family:'IBM Plex Mono', monospace; font-weight:600; font-size:15px; color:var(--ink); }
.wp4-mini-num--green{ color:var(--green); }

.wp4-dot{ display:inline-block; width:8px; height:8px; border-radius:2px; vertical-align:middle; margin-right:4px; }
.wp4-dot--green{ background:var(--green); }

.wp4-hairline{ height:1px; background:var(--hairline); margin:16px 0; }
.wp4-fig{
  font-family:'IBM Plex Mono', monospace; font-size:11px; letter-spacing:.06em;
  text-transform:uppercase; color:var(--faint); margin:12px 0 0;
}

/* ── Top bar ── */
.wp4-topbar{ position:sticky; top:0; z-index:50; background:rgba(243,239,229,.85);
  backdrop-filter:blur(8px); border-bottom:1px solid var(--hairline); }
.wp4-topbar__inner{ display:flex; align-items:center; justify-content:space-between; height:68px; gap:24px; }
.wp4-nav{ display:flex; gap:26px; }
.wp4-nav a{ font-weight:500; font-size:15px; color:var(--muted); text-decoration:none; transition:color .15s; white-space:nowrap; }
.wp4-nav a:hover{ color:var(--ink); }
.wp4-topbar__cta{ display:flex; align-items:center; gap:18px; }

/* ── Hero ── */
.wp4-hero{ padding:84px 0 64px; }
.wp4-hero__grid{ display:grid; grid-template-columns:1.05fr .95fr; gap:64px; align-items:center; }
.wp4-hero__copy .wp4-label{ margin-bottom:20px; }
.wp4-hero__actions{ display:flex; gap:12px; flex-wrap:wrap; }
.wp4-hero__assure{ font-family:'IBM Plex Mono', monospace; font-size:12px; letter-spacing:.04em;
  color:var(--muted); margin:16px 0 0; }
.wp4-hero__trust{ display:flex; align-items:center; gap:16px; margin-top:28px;
  padding-top:24px; border-top:1px solid var(--hairline); }

/* Panel KPI */
.wp4-panel{ background:var(--surface); border:1px solid var(--hairline); border-radius:4px; padding:24px; }
.wp4-panel__head{ display:flex; align-items:center; justify-content:space-between; gap:12px; }
.wp4-kpi{ font-weight:800; font-size:44px; letter-spacing:-.03em; margin-top:8px; font-variant-numeric:tabular-nums; }
.wp4-table{ width:100%; border-collapse:collapse; font-size:14px; }
.wp4-table th{
  font-family:'IBM Plex Mono', monospace; font-weight:500; font-size:11px;
  letter-spacing:.06em; text-transform:uppercase; color:var(--label);
  text-align:left; padding:0 0 10px; border-bottom:1px solid var(--inner);
}
.wp4-table td{ padding:11px 0; border-bottom:1px solid var(--inner); color:var(--muted); }
.wp4-table tfoot td{ font-weight:700; color:var(--ink); border-bottom:none; }
.wp4-num{ text-align:right; font-variant-numeric:tabular-nums; }
.wp4-num--green{ color:var(--green); font-weight:600; }

/* ── Wartości ── */
.wp4-values{ border-top:1px solid var(--hairline); border-bottom:1px solid var(--hairline); padding:64px 0; }
.wp4-values__grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:40px; }
.wp4-values article .wp4-label{ margin-bottom:14px; }

/* ── Sekcje ── */
.wp4-section{ padding:84px 0; }
.wp4-section--alt{ background:var(--surface); border-top:1px solid var(--hairline); border-bottom:1px solid var(--hairline); }
.wp4-section__head{ margin-bottom:48px; max-width:62ch; }
.wp4-section__head .wp4-label{ margin-bottom:16px; }
.wp4-section__head .wp4-h2{ max-width:20ch; }

/* ── Funkcje ── */
.wp4-features{ display:grid; grid-template-columns:repeat(2,1fr); gap:0;
  border:1px solid var(--hairline); border-radius:4px; overflow:hidden; }
.wp4-feature{ padding:32px; border-right:1px solid var(--hairline); border-bottom:1px solid var(--hairline); background:var(--surface); }
.wp4-feature:nth-child(2n){ border-right:none; }
.wp4-feature:nth-last-child(-n+2){ border-bottom:none; }
.wp4-feature__foot{ display:flex; align-items:center; gap:10px; margin-top:20px; flex-wrap:wrap; }

/* ── Panel preview ── */
.wp4-preview{ display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:center; }
.wp4-preview__copy .wp4-label{ margin-bottom:16px; }
.wp4-preview__copy .wp4-h2{ margin-bottom:20px; }
.wp4-checklist{ list-style:none; margin:24px 0; padding:0; }
.wp4-checklist li{ position:relative; padding-left:24px; margin-bottom:12px; color:var(--muted); font-size:16px; }
.wp4-checklist li::before{
  content:''; position:absolute; left:0; top:9px; width:9px; height:9px;
  border:1px solid var(--cynober); border-radius:2px; background:var(--tint-cynober);
}
.wp4-checklist--ink li{ color:var(--ink-on); }
.wp4-checklist--ink li::before{ border-color:var(--paper); background:transparent; }

.wp4-graphpaper{
  background:var(--paper);
  background-image:linear-gradient(var(--inner) 1px, transparent 1px),
                   linear-gradient(90deg, var(--inner) 1px, transparent 1px);
  background-size:20px 20px;
  border:1px solid var(--hairline); border-radius:4px; padding:24px;
  display:flex; flex-direction:column; gap:14px;
}
.wp4-graphpaper__row{ display:flex; align-items:center; justify-content:space-between; gap:12px;
  background:var(--surface); border:1px solid var(--hairline); border-radius:3px; padding:12px 14px; }

/* ── Panel — apple-scroll demo (X2 v2, import z Claude Design) ── */
.wp4-sd button:focus-visible{ outline:2px solid var(--cynober); outline-offset:2px; }
@media (prefers-reduced-motion: reduce){
  .wp4-sd *{ transition:none !important; }
}

/* ── Przewodnik gościa / telefon ── */
.wp4-guide{ display:grid; grid-template-columns:1fr auto; gap:64px; align-items:center; }
.wp4-guide__copy .wp4-label{ margin-bottom:16px; }
.wp4-guide__copy .wp4-h2{ margin-bottom:20px; max-width:18ch; }
.wp4-guide__figure{ display:flex; flex-direction:column; align-items:center; }

.wp4-phone{ width:300px; height:620px; background:var(--ink); border-radius:40px; padding:10px;
  border:1px solid var(--ink-line); position:relative; flex-shrink:0; }
.wp4-phone__notch{ position:absolute; top:10px; left:50%; transform:translateX(-50%);
  width:120px; height:22px; background:var(--ink); border-radius:0 0 14px 14px; z-index:2; }
.wp4-phone__screen{ background:var(--paper); border-radius:30px; overflow:hidden;
  height:100%; display:flex; flex-direction:column; }

.wp4-phone__head{ flex-shrink:0; padding:34px 20px 18px; border-bottom:1px solid var(--hairline);
  background-image:linear-gradient(var(--inner) 1px, transparent 1px),
                   linear-gradient(90deg, var(--inner) 1px, transparent 1px);
  background-size:18px 18px; background-color:var(--paper); }
.wp4-phone__title{ font-weight:800; font-size:22px; letter-spacing:-.025em; margin:8px 0 6px; }

.wp4-phone__body{ flex:1 1 auto; min-height:0; overflow-y:auto; padding:16px; display:flex; flex-direction:column; gap:12px;
  scrollbar-width:none; -ms-overflow-style:none; }
.wp4-phone__body::-webkit-scrollbar{ display:none; }
.wp4-phone__hello{ font-size:13px; line-height:1.55; color:var(--muted); margin:0; }

.wp4-gcard{ background:var(--surface); border:1px solid var(--hairline); border-radius:4px; padding:14px; }
.wp4-gcard .wp4-label{ font-size:10px; }
.wp4-pin{ font-family:'IBM Plex Mono', monospace; font-weight:600; font-size:30px;
  letter-spacing:.32em; color:var(--ink); margin-top:6px; font-variant-numeric:tabular-nums; }
.wp4-gcard__name{ font-weight:700; font-size:15px; margin:6px 0 4px; }
.wp4-gcard__row{ font-size:13px; color:var(--muted); margin:0; }
.wp4-code{ font-family:'IBM Plex Mono', monospace; font-size:12px; color:var(--ink);
  background:var(--inner); border:1px solid var(--hairline); border-radius:3px; padding:1px 6px; }
.wp4-checklist--tight{ margin:10px 0 0; }
.wp4-checklist--tight li{ font-size:13px; margin-bottom:8px; padding-left:20px; }
.wp4-checklist--tight li::before{ top:6px; width:8px; height:8px; }

.wp4-minimap{ position:relative; height:88px; margin-top:10px; border-radius:3px; border:1px solid var(--hairline);
  background-image:linear-gradient(var(--inner) 1px, transparent 1px),
                   linear-gradient(90deg, var(--inner) 1px, transparent 1px);
  background-size:14px 14px; background-color:var(--paper); }
.wp4-minimap__pin{ position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
  width:14px; height:14px; border-radius:50% 50% 50% 0; background:var(--cynober); rotate:-45deg; }

.wp4-phone__foot{ flex-shrink:0; padding:12px 16px; border-top:1px solid var(--hairline); background:var(--surface); }
.wp4-btn--full{ width:100%; }

/* ── Jak to działa ── */
.wp4-steps{ display:grid; grid-template-columns:repeat(3,1fr); gap:0;
  border-top:1px solid var(--hairline); }
.wp4-step{ padding:32px 32px 0 0; border-right:1px solid var(--hairline); }
.wp4-step:last-child{ border-right:none; padding-right:0; }
.wp4-step:not(:first-child){ padding-left:32px; }
.wp4-step__num{ font-family:'IBM Plex Mono', monospace; font-weight:600; font-size:13px;
  letter-spacing:.08em; color:var(--cynober); }

/* ── Porównanie ── */
.wp4-compare{ display:grid; grid-template-columns:1fr 1fr; gap:20px; }
.wp4-compare__col{ border:1px solid var(--hairline); border-radius:4px; padding:32px; background:var(--paper); }
.wp4-compare__col--ink{ background:var(--ink); border-color:var(--ink); }
.wp4-compare__col .wp4-label{ margin-bottom:20px; }
.wp4-compare__col--ink .wp4-plan__badge{ margin-bottom:20px; }
.wp4-xlist{ list-style:none; margin:0; padding:0; }
.wp4-xlist li{ position:relative; padding-left:24px; margin-bottom:14px; color:var(--faint); font-size:16px; }
.wp4-xlist li::before{ content:'\\00d7'; position:absolute; left:2px; top:-1px; color:var(--faint); font-weight:700; }

/* ── Cennik ── */
.wp4-pricing{ display:grid; grid-template-columns:1.1fr .9fr; gap:20px; align-items:stretch; }
.wp4-plan{ border:1px solid var(--hairline); border-radius:4px; padding:32px; background:var(--paper); display:flex; flex-direction:column; }
.wp4-plan--feature{ background:var(--ink); border-color:var(--ink); }
.wp4-plan__badge{ display:flex; align-items:center; gap:12px; }
.wp4-plan--feature .wp4-label{ color:var(--ink-on); }
.wp4-plan__price{ font-weight:800; font-size:44px; letter-spacing:-.03em; margin:14px 0 12px; font-variant-numeric:tabular-nums; }
.wp4-plan--feature .wp4-plan__price{ color:var(--surface); }
.wp4-plan__per{ font-family:'IBM Plex Mono', monospace; font-weight:500; font-size:14px; letter-spacing:.04em; color:var(--faint); }
.wp4-plan .wp4-checklist{ flex:1; }
.wp4-plan .wp4-btn{ margin-top:8px; }
.wp4-plan__note{ font-family:'IBM Plex Mono', monospace; font-size:12px; letter-spacing:.03em; color:var(--ink-faint); margin:14px 0 0; }

/* ── FAQ ── */
.wp4-faq{ max-width:820px; }
.wp4-faq__head{ margin-bottom:40px; }
.wp4-faq__head .wp4-label{ margin-bottom:16px; }
.wp4-faq__head .wp4-h2{ margin-bottom:12px; }
.wp4-faq__list{ border-top:1px solid var(--hairline); }
.wp4-faq__item{ border-bottom:1px solid var(--hairline); }
.wp4-faq__item summary{ list-style:none; cursor:pointer; display:flex; align-items:center; justify-content:space-between;
  gap:24px; padding:20px 0; font-weight:600; font-size:18px; color:var(--ink); }
.wp4-faq__item summary::-webkit-details-marker{ display:none; }
.wp4-faq__sign{ font-family:'IBM Plex Mono', monospace; font-size:20px; color:var(--cynober); transition:transform .2s; flex-shrink:0; }
.wp4-faq__item[open] .wp4-faq__sign{ transform:rotate(45deg); }
.wp4-faq__item .wp4-body{ padding:0 0 20px; max-width:70ch; }

/* ── Baza wiedzy / blog ── */
.wp4-blog__head{ display:flex; align-items:flex-end; justify-content:space-between; gap:24px; margin-bottom:40px; }
.wp4-blog__head .wp4-label{ margin-bottom:14px; }
.wp4-blog__grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:0;
  border:1px solid var(--hairline); border-radius:4px; overflow:hidden; }
.wp4-post{ display:flex; flex-direction:column; padding:28px; background:var(--surface);
  border-right:1px solid var(--hairline); text-decoration:none; transition:background .15s; }
.wp4-post:last-child{ border-right:none; }
.wp4-post:hover{ background:#fff; }
.wp4-post__top{ display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:18px; }
.wp4-post__title{ font-weight:700; font-size:19px; line-height:1.25; letter-spacing:-.02em; color:var(--ink); margin:0 0 12px; }
.wp4-post__excerpt{ font-size:15px; flex:1; }
.wp4-post__more{ font-family:'IBM Plex Mono', monospace; font-size:12px; letter-spacing:.06em;
  text-transform:uppercase; color:var(--cynober); margin-top:20px; }
.wp4-post:hover .wp4-post__title{ color:var(--cynober); }

/* ── CTA + newsletter ── */
.wp4-cta{ background:var(--ink); padding:84px 0; }
.wp4-cta__inner{ display:flex; flex-direction:column; align-items:center; text-align:center; }
.wp4-cta__title{ font-weight:800; font-size:48px; line-height:1.04; letter-spacing:-.035em; color:var(--surface); margin:0 0 20px; }
.wp4-cta__lead{ font-size:18px; color:var(--ink-on); max-width:48ch; margin:0 0 28px; }
.wp4-news{ display:flex; gap:12px; align-items:flex-end; flex-wrap:wrap; justify-content:center; }
.wp4-news__field{ display:flex; flex-direction:column; align-items:flex-start; gap:8px; text-align:left; }
.wp4-news__field input{
  font-family:'Schibsted Grotesk', sans-serif; font-size:15px; color:var(--surface);
  background:transparent; border:1px solid var(--ink-line); border-radius:3px;
  padding:13px 16px; width:300px; outline:none; transition:border-color .15s;
}
.wp4-news__field input::placeholder{ color:var(--ink-faint); }
.wp4-news__field input:focus{ border-color:var(--cynober); }
.wp4-news__note{ font-family:'IBM Plex Mono', monospace; font-size:12px; color:var(--ink-on); margin:14px 0 0; }
/* stan błędu: ton cynobru rozjaśniony pod ciemne tło CTA (6.9:1 na --ink) */
.wp4-news__note--err{ color:#E8836B; }
.wp4-cta__or{ margin:28px 0 16px; }
.wp4-cta__inner > .wp4-label{ margin-top:16px; }

/* ── Footer ── */
.wp4-footer{ background:var(--paper); border-top:1px solid var(--hairline); padding:64px 0 32px; }
.wp4-footer__grid{ display:grid; grid-template-columns:1.6fr 1fr 1fr 1fr; gap:40px; }
.wp4-footer__about{ margin-top:16px; max-width:34ch; font-size:15px; }
.wp4-footer__col{ display:flex; flex-direction:column; gap:12px; }
.wp4-footer__col .wp4-label{ margin-bottom:4px; }
.wp4-footer__col a{ font-size:15px; color:var(--muted); text-decoration:none; }
.wp4-footer__col a:hover{ color:var(--ink); }
.wp4-footer__bottom{ display:flex; align-items:center; justify-content:space-between; gap:16px;
  margin-top:48px; padding-top:24px; border-top:1px solid var(--hairline); flex-wrap:wrap; }

/* ── Responsywność ── */
@media (max-width:1040px){
  .wp4-nav{ gap:18px; font-size:14px; }
  .wp4-nav a{ font-size:14px; }
}
@media (max-width:900px){
  .wp4-container{ padding:0 24px; }
  .wp4-display{ font-size:46px; }
  .wp4-hero__grid,.wp4-preview{ grid-template-columns:1fr; gap:40px; }
  .wp4-guide{ grid-template-columns:1fr; gap:40px; justify-items:center; }
  .wp4-guide__copy{ justify-self:start; }
  .wp4-values__grid{ grid-template-columns:1fr; gap:32px; }
  .wp4-features,.wp4-compare,.wp4-pricing,.wp4-blog__grid{ grid-template-columns:1fr; }
  .wp4-feature{ border-right:none; }
  .wp4-feature:nth-last-child(2){ border-bottom:1px solid var(--hairline); }
  .wp4-post{ border-right:none; border-bottom:1px solid var(--hairline); }
  .wp4-post:last-child{ border-bottom:none; }
  .wp4-steps{ grid-template-columns:1fr; }
  .wp4-step{ border-right:none; border-bottom:1px solid var(--hairline); padding:24px 0; }
  .wp4-step:last-child{ border-bottom:none; }
  .wp4-step:not(:first-child){ padding-left:0; }
  .wp4-footer__grid{ grid-template-columns:1fr 1fr; gap:32px; }
  .wp4-nav{ display:none; }
  .wp4-cta__title{ font-size:36px; }
}
@media (max-width:560px){
  .wp4-display{ font-size:38px; }
  .wp4-topbar__cta .wp4-link{ display:none; }
  .wp4-footer__grid{ grid-template-columns:1fr; }
  .wp4-news__field input{ width:240px; }
}
`;
