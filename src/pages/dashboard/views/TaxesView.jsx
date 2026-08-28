import React, { useMemo } from 'react';
import { Landmark, TriangleAlert, Info, Receipt, Plus, CalendarSync, Download } from 'lucide-react';
import { podsumowaniePodatkowe, podsumowanieMiesieczne, domyslnyTryb } from '../../../utils/taxSummary';
import { monthNames, STAWKI_PODATKOWE } from '../../../utils/constants';
import { zestawieniePodatkoweCSV, nazwaPliku, BOM } from '../../../utils/taxExport';

/*
  PANEL PODATKOWY (X25) — czwarta podzakładka Finansów.

  Panel odpowiada na JEDNO pytanie: ile odłożyć, żeby nie zabrakło. Wszystko poniżej
  głównej kwoty tylko ją uzasadnia. Układ wg projektu z 2026-08-24
  (`docs/Projects/handoff-panel-podatkowy/`), teksty wg `Copy-panel-podatkowy-2026-08-24.md`,
  ograniczenia wg `docs/legal/Analiza-panel-podatkowy-2026-08-24.md`.

  ⚖️ CZTERY RZECZY, KTÓRYCH NIE WOLNO TU NARUSZYĆ:

  1. Przy ryczałcie prowizje i media NIE obniżają podatku. Stoją w osobnej karcie, bez
     znaków minus i bez sumy, która sugerowałaby odejmowanie od podstawy.
  2. Zastrzeżenie prawne stoi DOKŁADNIE RAZ, na końcu. Ostrzeżenie powtórzone przy każdej
     liczbie przestaje ostrzegać, a w sporze broni gorzej niż jedno, widoczne.
  3. Nie pokazujemy zer. Zero w polu składki czyta się jak twierdzenie „nie masz jej",
     a tego aplikacja nie wie. Każdy taki przypadek ma własne rozwiązanie tekstowe.
  4. Żadna kwota policzona przez aplikację nie jest nazywana „wiążącą".

  Logika siedzi w `src/utils/taxSummary.js` i ten plik jej nie dubluje — liczy się raz,
  od sumy roku. Wszystkie liczby przychodzą gotowe.
*/

// `useGrouping: 'always'` — bez tego Intl nie rozdziela liczb czterocyfrowych i „8200 zł"
// stoi obok „108 200,00 zł" w tej samej kolumnie. W rachunku dla księgowej kwoty muszą
// wyglądać tak samo, niezależnie od rzędu wielkości.
const GRUPY = { useGrouping: 'always' };
const zl = (n) => `${(Math.round(n * 100) / 100).toLocaleString('pl-PL', { ...GRUPY, minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`;
const zlKrotko = (n) => `${Math.round(n).toLocaleString('pl-PL', GRUPY)} zł`;
const liczba = (n) => Math.round(n).toLocaleString('pl-PL', GRUPY);
const procent = (n) => `${n.toLocaleString('pl-PL', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

/** Polska odmiana: 1 rezerwacja, 2–4 rezerwacje, 5+ rezerwacji. */
function rezerwacje(n) {
  const ost = n % 10, dwie = n % 100;
  if (n === 1) return 'rezerwacja';
  if (ost >= 2 && ost <= 4 && !(dwie >= 12 && dwie <= 14)) return 'rezerwacje';
  return 'rezerwacji';
}

// Dwie formy, bo tyle aplikacja liczy poprawnie. Podatek liniowy i działalność
// nierejestrowana wypadły 2026-08-25 (ADR-020) — obie były liczone stawką ryczałtu.
const NAZWY_FORM = {
  lump_sum: 'Ryczałt',
  general: 'Zasady ogólne (skala)',
};

/** Etykieta widełek składki zdrowotnej — przedział od–do, nigdy sama górna granica. */
function opisWidelek(w) {
  if (!w) return '';
  if (w.od === 0) return `przychód do ${liczba(w.do)} zł`;
  if (w.do === null) return `przychód powyżej ${liczba(w.od)} zł`;
  return `przychód ${liczba(w.od)}–${liczba(w.do)} zł`;
}

function Wiersz({ k, v, mocny, sub }) {
  return (
    <>
      <div className={`wpd-settle__row${mocny ? ' wpd-settle__row--total' : ''}`}>
        <span className="wpd-settle__k" style={mocny ? { fontWeight: 700 } : undefined}>{k}</span>
        <span className="wpd-settle__v wpd-mono">{v}</span>
      </div>
      {sub && <p className="wpd-settle__sub">{sub}</p>}
    </>
  );
}

export default function TaxesView({ rentals, taxSettings, selectedYear, tryb, onZmienTryb, onDodajRezerwacje, onOtworzUstawienia }) {
  // ⚠️ `selectedYear` jest w całym panelu NAPISEM (`setSelectedYear(String(...))`,
  // porównania przez `.toString()`), a `taxSummary` porównuje rok przez `===`.
  // Bez tej konwersji filtr rezerwacji nie trafiał nigdy i panel pokazywał stan pusty
  // każdemu gospodarzowi, niezależnie od danych.
  const rok = Number(selectedYear) || new Date().getFullYear();
  const p = useMemo(() => podsumowaniePodatkowe(rentals, taxSettings, rok), [rentals, taxSettings, rok]);
  const miesiaceWszystkie = useMemo(() => podsumowanieMiesieczne(rentals, taxSettings, rok), [rentals, taxSettings, rok]);
  const rokPoprzedni = useMemo(
    () => podsumowaniePodatkowe(rentals, taxSettings, rok - 1).liczbaRezerwacji,
    [rentals, taxSettings, rok],
  );

  const aktywnyTryb = tryb || domyslnyTryb(taxSettings);
  const ryczalt = p.forma === 'lump_sum';
  const zProgiem = ryczalt && taxSettings?.autoThreshold;

  // Miesiące bez żadnego ruchu pomijamy — pusty wiersz nic nie mówi, a wydłuża tabelę.
  const miesiace = miesiaceWszystkie.filter((m) => m.brutto || m.media || m.rezerwacje);
  // Gdy nie ma VAT-u, „Brutto" i „Przychód" są identyczne w każdym wierszu. Dwie takie
  // same kolumny obok siebie w materiale dla księgowej wyglądają jak błąd.
  const kolumnaBrutto = p.vatNalezny > 0;

  // Eksport dla księgowej. Plik składa się z TEGO SAMEGO podsumowania, które widać
  // na ekranie — `taxExport` nie liczy niczego po swojemu. Rozjazd między ekranem
  // a plikiem byłby gorszy niż brak pliku.
  const pobierzCSV = () => {
    const csv = zestawieniePodatkoweCSV(p, rentals, miesiaceWszystkie, monthNames, rok);
    // BOM przed treścią — bez niego Excel rozsypuje polskie znaki mimo poprawnego UTF-8.
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nazwaPliku(rok);
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Zwolnienie adresu po kliknięciu — inaczej blob wisi w pamięci do przeładowania.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const przelacznik = (
    <div className="wpd-seg" role="tablist" aria-label="Poziom szczegółowości">
      <button role="tab" aria-selected={aktywnyTryb === 'prosty'}
        className={`wpd-seg__btn${aktywnyTryb === 'prosty' ? ' wpd-seg__btn--active' : ''}`}
        onClick={() => onZmienTryb?.('prosty')}>Podsumowanie</button>
      <button role="tab" aria-selected={aktywnyTryb === 'szczegolowy'}
        className={`wpd-seg__btn${aktywnyTryb === 'szczegolowy' ? ' wpd-seg__btn--active' : ''}`}
        onClick={() => onZmienTryb?.('szczegolowy')}>Szczegóły dla księgowego</button>
    </div>
  );

  // ── STAN PUSTY ──────────────────────────────────────────────────────────────
  // Zer, KPI ani pustej tabeli tu nie pokazujemy. Mówimy, co zrobić, żeby coś się pojawiło.
  if (p.liczbaRezerwacji === 0) {
    return (
      <div className="wpd-section">
        <div className="wpd-panel">
          <div className="wpd-empty" style={{ textAlign: 'center', padding: '52px 24px' }}>
            <Receipt className="wpd-empty__icon" style={{ width: 26, height: 26 }} />
            <h2 className="wpd-h2" style={{ fontSize: 22 }}>Za {rok} nie ma jeszcze żadnej rezerwacji</h2>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--muted)', maxWidth: 440, margin: '10px auto 20px' }}>
              Wyliczenie pojawi się, gdy dodasz pierwszą rezerwację albo podłączysz kalendarz
              Airbnb lub Booking.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="wpd-btn wpd-btn--primary" onClick={() => onDodajRezerwacje?.()}>
                <Plus /> Dodaj rezerwację
              </button>
              <button className="wpd-btn" onClick={() => onOtworzUstawienia?.('sync')}>
                <CalendarSync /> Podłącz kalendarz
              </button>
            </div>
            {rokPoprzedni > 0 && (
              <p className="wpd-mono" style={{ fontSize: 11, color: 'var(--faint)', marginTop: 18 }}>
                Za {rok - 1} masz rezerwacje — przełącz rok nad zakładkami
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── ALERTY ──────────────────────────────────────────────────────────────────
  // Nad kwotą, nie przy liczbach. Kolejność: najpierw stawki (wysoka waga), potem rozjazd.
  const alerty = (
    <>
      {p.stawkiPrzeterminowane ? (
        <div className="wpd-alert wpd-alert--pilny" style={{ marginBottom: 16 }}>
          <TriangleAlert className="wpd-alert__ic" />
          <div className="wpd-alert__body">
            <p className="wpd-alert__title">Stawki w aplikacji są z {p.rokStawek}</p>
            <p>
              Nie zaktualizowaliśmy ich jeszcze na {new Date().getFullYear()}. Zanim odłożysz
              pieniądze według tych kwot, potwierdź je z księgową.
            </p>
          </div>
        </div>
      ) : !p.stawkiAktualne && (
        <div className="wpd-alert wpd-alert--pilny" style={{ marginBottom: 16 }}>
          <TriangleAlert className="wpd-alert__ic" />
          <div className="wpd-alert__body">
            <p className="wpd-alert__title">Rok {p.rok} liczymy stawkami z {p.rokStawek}</p>
            <p>
              Kwoty podatku i składek zmieniają się co roku. Dopóki nie poznamy stawek na {p.rok},
              nie opieraj na tych liczbach decyzji o tym, ile odłożyć — zaktualizujemy je,
              gdy stawki wejdą w życie.
            </p>
          </div>
        </div>
      )}

      {p.rozjazd && (
        <>
          <div className="wpd-alert wpd-alert--uwaga" style={{ marginBottom: 16 }}>
            <Info className="wpd-alert__ic" />
            <div className="wpd-alert__body">
              <p className="wpd-alert__title">Dwie różne kwoty podatku za {p.rok}</p>
              <p>
                Przy {p.rozjazd.rezerwacji} {p.rozjazd.rezerwacji === 1 ? 'rezerwacji' : 'rezerwacjach'} zapisano podatek policzony innymi
                ustawieniami. Przyczyny bywają różne: zmiana formy opodatkowania w trakcie roku
                albo kwoty wpisane ręcznie przy starszych rezerwacjach.
              </p>
            </div>
          </div>
          <div className="wpd-compare" style={{ marginBottom: 16 }}>
            <div className="wpd-compare__card wpd-compare__card--main">
              <span className="wpd-compare__tag">W PANELU</span>
              <p className="wpd-mono" style={{ fontSize: 11, color: 'var(--label)', margin: '0 0 6px' }}>Z bieżących ustawień</p>
              <div className="wpd-compare__val">{zl(p.rozjazd.wyliczony)}</div>
              <p className="wpd-compare__desc">Liczymy raz, od całego roku — tę kwotę pokazujemy w panelu.</p>
            </div>
            <div className="wpd-compare__card">
              <p className="wpd-mono" style={{ fontSize: 11, color: 'var(--label)', margin: '0 0 6px' }}>Zapisane przy rezerwacjach</p>
              <div className="wpd-compare__val wpd-compare__val--faint">{zl(p.rozjazd.zapisany)}</div>
              <p className="wpd-compare__desc">
                Suma z {p.rozjazd.rezerwacji} {rezerwacje(p.rozjazd.rezerwacji)}, w tym starszych.
                Różnica: {zl(Math.abs(p.rozjazd.wyliczony - p.rozjazd.zapisany))}.
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );

  // ── STOPKA ZASTRZEŻENIA ─────────────────────────────────────────────────────
  const stopka = (
    <div className="wpd-taxfoot" style={{ marginTop: 16 }}>
      <p className="wpd-taxfoot__txt">
        Szacunek policzony z Twoich danych i z ustawień podatkowych konta — nie jest deklaracją,
        wyliczeniem podatku ani poradą podatkową. Kwoty potwierdź z księgową, zanim zapłacisz
        podatek albo złożysz deklarację.
      </p>
      <span className="wpd-taxfoot__meta">
        Stawki {p.rokStawek} · zweryfikowane {STAWKI_PODATKOWE.zweryfikowano}
      </span>
    </div>
  );

  // ── KARTA PROGU ─────────────────────────────────────────────────────────────
  const kartaProgu = zProgiem && (
    <div className="wpd-panel" style={{ padding: 22 }}>
      <div className="wpd-prog__head">
        <p className="wpd-prog__label">
          Próg ryczałtu · {liczba(p.prog)} zł
          {p.wariantMalzenski === 'calosc' && ' · oświadczenie małżeńskie'}
          {p.wariantMalzenski === 'polowa' && ' · Twoja część'}
        </p>
        <span className={`wpd-prog__pct${p.progPrzekroczony ? ' wpd-prog__pct--over' : ''}`}>
          {procent(p.procentProgu)} progu
        </span>
      </div>

      {p.progPrzekroczony ? (
        <>
          <p className="wpd-prog__lead">Powyżej progu o <strong>{zlKrotko(p.przychod - p.prog)}</strong></p>
          <div className="wpd-prog__track">
            <div className="wpd-prog__fill wpd-prog__fill--over" style={{ flex: `0 0 ${(p.prog / p.przychod) * 100}%` }} />
            <div className="wpd-prog__over" style={{ flex: 1 }} />
          </div>
          <div className="wpd-prog__scale">
            <span>{liczba(p.prog)} zł</span>
            <span style={{ color: 'var(--cynober)' }}>nadwyżka</span>
          </div>
          <p className="wpd-prog__note">
            Od nadwyżki ponad {liczba(p.prog)} zł stawka wynosi 12,5% zamiast 8,5% — każde kolejne
            1 000 zł przychodu to {Math.round(1000 * STAWKI_PODATKOWE.ryczaltNajem.stawkaPowyzejProgu)} zł
            podatku zamiast {Math.round(1000 * STAWKI_PODATKOWE.ryczaltNajem.stawkaDoProgu)} zł.
          </p>
        </>
      ) : (
        <>
          <p className="wpd-prog__lead">Zostało <strong>{zlKrotko(p.doProgu)}</strong> przychodu</p>
          <div className="wpd-prog__track">
            <div className="wpd-prog__fill" style={{ width: `${p.procentProgu}%` }} />
          </div>
          <div className="wpd-prog__scale">
            <span>0</span><span>{liczba(p.prog / 2)}</span><span>{liczba(p.prog)} zł</span>
          </div>
          <p className="wpd-prog__note">
            Do {liczba(p.prog)} zł stawka wynosi 8,5%, od nadwyżki — 12,5%.
          </p>
        </>
      )}
      <p className="wpd-prog__src">Liczymy tylko przychód z rezerwacji w tej aplikacji.</p>
    </div>
  );

  // ── KARTA LIMITU ZWOLNIENIA Z VAT ───────────────────────────────────────────
  // Art. 113 ustawy o VAT (ADR-026). Licznik liczy `taxSummary.js` z pełnego `brutto` —
  // bez podziału małżeńskiego i bez prowizji. Karta TYLKO dla gospodarza bez statusu
  // czynnego podatnika: jemu zwolnienie podmiotowe jest obojętne i pasek sugerowałby,
  // że przy limicie coś się dla niego zmienia.
  //
  // ⚠️ Mechanika przekroczenia jest INNA niż przy progu ryczałtu: tam od nadwyżki
  // zmienia się stawka, tu opodatkowana jest CAŁA czynność, którą limit przekroczono
  // (art. 113 ust. 5). Teksty z analizy legal (P5) — mówią, co stanowi przepis i co
  // widzi aplikacja, bez kwalifikowania czyjejkolwiek sytuacji podatkowej.
  const kartaVat = !p.vatPlatnik && (
    <div className="wpd-panel" style={{ padding: 22 }}>
      <div className="wpd-prog__head">
        <p className="wpd-prog__label">Limit zwolnienia z VAT · {liczba(p.vatLimit)} zł</p>
        <span className={`wpd-prog__pct${p.vatStan !== 'spokojny' ? ' wpd-prog__pct--over' : ''}`}>
          {procent(p.vatProcentLimitu)} limitu
        </span>
      </div>

      {p.vatLimitPrzekroczony ? (
        <>
          <p className="wpd-prog__lead">Powyżej limitu o <strong>{zlKrotko(p.brutto - p.vatLimit)}</strong></p>
          <div className="wpd-prog__track">
            <div className="wpd-prog__fill wpd-prog__fill--over" style={{ flex: `0 0 ${(p.vatLimit / p.brutto) * 100}%` }} />
            <div className="wpd-prog__over" style={{ flex: 1 }} />
          </div>
          <div className="wpd-prog__scale">
            <span>{liczba(p.vatLimit)} zł</span>
            <span style={{ color: 'var(--cynober)' }}>nadwyżka</span>
          </div>
          <p className="wpd-prog__note">
            Rezerwacje w aplikacji przekroczyły {liczba(p.vatLimit)} zł. Od czynności, którą
            przekroczono limit, sprzedaż nie korzysta już ze zwolnienia podmiotowego
            (art. 113 ust. 5 ustawy o VAT), a rejestracji VAT-R dokonuje się przed dniem
            utraty zwolnienia. Skonsultuj rozliczenie z księgowym. Panel nadal nie dolicza
            VAT do Twoich kwot — do czasu włączenia opcji „jestem czynnym podatnikiem VAT"
            w ustawieniach.
          </p>
        </>
      ) : (
        <>
          <p className="wpd-prog__lead">Zostało <strong>{zlKrotko(p.vatDoLimitu)}</strong> wartości sprzedaży</p>
          <div className="wpd-prog__track">
            <div className="wpd-prog__fill" style={{ width: `${p.vatProcentLimitu}%` }} />
          </div>
          <div className="wpd-prog__scale">
            <span>0</span><span>{liczba(p.vatLimit / 2)}</span><span>{liczba(p.vatLimit)} zł</span>
          </div>
          {p.vatStan === 'ostrzezenie' ? (
            <p className="wpd-prog__note">
              Rezerwacje w aplikacji zbliżają się do {liczba(p.vatLimit)} zł. Powyżej tego
              limitu sprzedaż traci zwolnienie z VAT — począwszy od czynności, którą limit
              przekroczono — a przepisy wiążą z tym obowiązki rejestracyjne (VAT-R). Czy
              i kiedy dotyczy to Ciebie, zależy od całej Twojej sprzedaży, nie tylko tej
              w aplikacji — porozmawiaj z księgowym z wyprzedzeniem.
            </p>
          ) : (
            <p className="wpd-prog__note">
              Do {liczba(p.vatLimit)} zł wartości sprzedaży rocznie sprzedaż może korzystać
              ze zwolnienia z VAT (art. 113 ustawy o VAT).
            </p>
          )}
        </>
      )}
      <p className="wpd-prog__src">
        Liczymy tylko przychód z rezerwacji w tej aplikacji — pozostała sprzedaż (inny najem,
        inna działalność) także zużywa ten limit. W pierwszym roku działalności limit liczy
        się proporcjonalnie do okresu prowadzonej działalności (art. 113 ust. 9) — tej proporcji nie liczymy.
      </p>
    </div>
  );

  // Karta z pytaniem zamiast wiersza zdrowotnej, dopóki nie wiemy, jak gospodarz wynajmuje.
  // Lepiej brak liczby niż liczba nieprawdziwa (analiza §B1 pkt 4).
  const kartaPytanie = ryczalt && p.podstawaWynajmu === null && (
    <div className="wpd-panel" style={{ padding: 22 }}>
      <h3 className="wpd-h2" style={{ fontSize: 17 }}>Zanim doliczymy składkę zdrowotną</h3>
      <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--muted)', margin: '8px 0 12px' }}>
        Przy ryczałcie składka zdrowotna zależy od tego, czy wynajmujesz w ramach działalności
        gospodarczej, czy poza nią. Nie wiemy tego o Tobie, więc kwota powyżej jest bez niej.
      </p>
      <button className="wpd-alink" onClick={() => onOtworzUstawienia?.('tax')}>
        Uzupełnij w ustawieniach →
      </button>
    </div>
  );

  return (
    <div className="wpd-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
        {przelacznik}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <span className="wpd-mono" style={{ fontSize: 11, color: 'var(--faint)' }}>
            {p.liczbaRezerwacji} {rezerwacje(p.liczbaRezerwacji)} · stawki {p.rokStawek}
          </span>
          <button className="wpd-btn wpd-btn--sm" onClick={pobierzCSV}
            title="Zestawienie w formacie do otwarcia w arkuszu">
            <Download /> Pobierz dla księgowej
          </button>
        </div>
      </div>

      {alerty}

      {/* ══ TRYB „PODSUMOWANIE" ══════════════════════════════════════════════ */}
      {aktywnyTryb === 'prosty' && (
        <>
          <div className="wpd-hero">
            <div style={{ minWidth: 0 }}>
              {!p.stawkiAktualne && <span className="wpd-hero__tag">Stawki {p.rokStawek}</span>}
              <p className="wpd-hero__label">
                {p.stawkiAktualne ? `Do odłożenia za ${p.rok}` : `Szacunek wstępny za ${p.rok}`}
              </p>
              <div className="wpd-hero__value">
                {p.formaZnana ? liczba(p.lacznieDoZaplaty) : '—'}
                {p.formaZnana && <span className="wpd-hero__suffix">zł</span>}
              </div>
              <p className="wpd-hero__lead">
                Podatek {p.zdrowotnaRok > 0 || p.spoleczneRok > 0 ? 'i składki' : ''} za {p.miesiecy} {p.miesiecy === 1 ? 'miesiąc' : 'mies.'} {p.rok},
                liczone narastająco. Nie odejmujemy zapłaconych już zaliczek ani składek —
                to obciążenie za cały ten okres.
              </p>
            </div>

            <div className="wpd-hero__side">
              <div className="wpd-hero__row">
                <span className="wpd-hero__k">
                  {zProgiem && p.progPrzekroczony ? 'Podatek ryczałtowy 8,5% i 12,5%'
                    : zProgiem ? 'Podatek ryczałtowy 8,5%'
                      : ryczalt ? `Podatek ryczałtowy ${taxSettings?.rate ?? 8.5}%`
                        : 'Podatek według skali'}
                </span>
                <span className="wpd-hero__v">{zl(p.podatek)}</span>
              </div>

              {p.zdrowotnaLiczona ? (
                <div className="wpd-hero__row">
                  <span className="wpd-hero__k">Zdrowotna {zl(p.zdrowotnaMies)} × {p.miesiecy} mies.</span>
                  <span className="wpd-hero__v">{zl(p.zdrowotnaRok)}</span>
                </div>
              ) : ryczalt && p.podstawaWynajmu === 'private' ? (
                <div className="wpd-hero__row">
                  <span className="wpd-hero__k">Składka zdrowotna</span>
                  <span className="wpd-hero__v wpd-hero__v--muted">przy najmie prywatnym nie doliczamy</span>
                </div>
              ) : ryczalt && (
                <div className="wpd-hero__row">
                  <span className="wpd-hero__k">Składka zdrowotna</span>
                  <span className="wpd-hero__v wpd-hero__v--muted">brak odpowiedzi w ustawieniach</span>
                </div>
              )}

              {/* Nigdy „0 zł" — zero czytałoby się jak twierdzenie o obowiązku gospodarza. */}
              <div className="wpd-hero__row">
                <span className="wpd-hero__k">
                  Składki społeczne{p.spoleczneRok > 0 ? ` ${zl(taxSettings?.zusSocial || 0)} × ${p.miesiecy} mies.` : ''}
                </span>
                {p.spoleczneRok > 0
                  ? <span className="wpd-hero__v">{zl(p.spoleczneRok)}</span>
                  : <span className="wpd-hero__v wpd-hero__v--muted">nie masz ich w ustawieniach</span>}
              </div>
            </div>
          </div>

          <div className="wpd-grid-2" style={{ marginTop: 16, alignItems: 'stretch' }}>
            {kartaProgu || <div />}

            <div className="wpd-panel" style={{ padding: 22, display: 'flex', flexDirection: 'column' }}>
              <h3 className="wpd-h2" style={{ fontSize: 17, marginBottom: 12 }}>Przychód i co go zjadło</h3>
              <div className="wpd-settle__row">
                <span className="wpd-settle__k">Przychód brutto</span>
                <span className="wpd-settle__v wpd-mono">{zl(p.brutto)}</span>
              </div>
              {p.prowizje > 0 && (
                <div className="wpd-settle__row">
                  <span className="wpd-settle__k">Prowizje portali</span>
                  <span className="wpd-settle__v wpd-mono">{zl(p.prowizje)}</span>
                </div>
              )}
              {p.media > 0 && (
                <div className="wpd-settle__row">
                  <span className="wpd-settle__k">Media i eksploatacja</span>
                  <span className="wpd-settle__v wpd-mono">{zl(p.media)}</span>
                </div>
              )}
              {p.prowizje === 0 && p.media === 0 && (
                <p style={{ fontSize: 13, color: 'var(--faint)', margin: 0 }}>
                  Za {p.rok} nie ma jeszcze prowizji ani kosztów eksploatacyjnych.
                </p>
              )}

              {/* ⚠️ BEZ ZNAKÓW MINUS I BEZ SUMY W TEJ KOLUMNIE. Przy ryczałcie te kwoty
                  nie obniżają podatku, a układ nie może sugerować odejmowania. */}
              {ryczalt && (
                <div className="wpd-note wpd-note--info" style={{ marginTop: 12 }}>
                  <Info style={{ width: 14, height: 14, display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
                  Przy ryczałcie płacisz od przychodu — prowizje i media nie obniżają podatku.
                  Pokazujemy je, żeby było wiadomo, ile zjadły.
                </div>
              )}
            </div>
          </div>

          {kartaVat && <div style={{ marginTop: 16 }}>{kartaVat}</div>}

          {kartaPytanie && <div style={{ marginTop: 16 }}>{kartaPytanie}</div>}

          {stopka}
        </>
      )}

      {/* ══ TRYB „SZCZEGÓŁY DLA KSIĘGOWEGO" ══════════════════════════════════ */}
      {aktywnyTryb === 'szczegolowy' && (
        <>
          <div className="wpd-cells wpd-cells--4">
            <div className="wpd-cell">
              <p className="wpd-cell__label">Przychód</p>
              <p className="wpd-cell__val">{zl(p.przychod)}</p>
            </div>
            <div className="wpd-cell">
              <p className="wpd-cell__label">Podstawa</p>
              <p className="wpd-cell__val">{zl(p.podstawa)}</p>
            </div>
            <div className="wpd-cell">
              <p className="wpd-cell__label">Podatek</p>
              <p className="wpd-cell__val">{zl(p.podatek)}</p>
            </div>
            <div className="wpd-cell wpd-stat--dark">
              <p className="wpd-cell__label">Do odłożenia</p>
              <p className="wpd-cell__val">{p.formaZnana ? zl(p.lacznieDoZaplaty) : '—'}</p>
            </div>
          </div>

          <div className="wpd-grid-2" style={{ marginTop: 16, alignItems: 'start' }}>
            <div className="wpd-panel">
              <div className="wpd-panel__head">
                <h3 className="wpd-h2" style={{ fontSize: 15 }}>Rachunek roku {p.rok}</h3>
              </div>
              <div style={{ padding: 16 }}>
                <Wiersz k={`Przychód brutto z ${p.liczbaRezerwacji} ${rezerwacje(p.liczbaRezerwacji)}`} v={zl(p.brutto)} />

                {p.vatNalezny > 0 && <>
                  <Wiersz k="VAT należny 8% (usługi zakwaterowania)" v={`− ${zl(p.vatNalezny)}`} />
                  <Wiersz k="Przychód po VAT" v={zl(p.przychodCalosc)} />
                </>}

                {p.wariantMalzenski === 'polowa' && <>
                  <Wiersz k="Część małżonka · rozlicza ją u siebie"
                    v={`− ${zl(p.przychodCalosc - p.przychod)}`}
                    sub="art. 12 ust. 5 i 6 ustawy o ryczałcie — bez oświadczenia przychód dzieli się między małżonków" />
                  {/* Bez tego wiersza skok z „brutto" do „podstawy" wygląda jak błąd rachunku. */}
                  <Wiersz k="Twój przychód do opodatkowania" v={zl(p.przychod)} />
                </>}

                {p.zdrowotnaLiczona && (
                  <Wiersz k="Odliczenie 50% zapłaconej składki zdrowotnej"
                    v={`− ${zl(p.przychod - p.podstawa)}`}
                    sub="art. 11 ust. 1a ustawy o ryczałcie · zakładamy, że składka za ten okres jest zapłacona" />
                )}

                {/* Przy skali podstawa może być zawyżona — aplikacja zna tylko własne koszty.
                    Mówimy to wprost (wzorzec ADR-023), zamiast udawać kompletność. */}
                <Wiersz k="Podstawa opodatkowania" v={zl(p.podstawa)} mocny={false}
                  sub={!ryczalt ? 'Tylko koszty zarejestrowane w aplikacji (prowizje, media, opcjonalnie składki społeczne) — bez kosztów spoza niej.' : null} />

                <Wiersz
                  k={!ryczalt ? 'Podatek według skali (12% / 32%)'
                    : !zProgiem ? `Ryczałt ${taxSettings?.rate ?? 8.5}% od podstawy, bez progu`
                      : p.progPrzekroczony ? 'Ryczałt 8,5% i 12,5% od podstawy'
                        : 'Ryczałt 8,5% od podstawy'}
                  v={zl(p.podatek)}
                  sub={!ryczalt ? `kwota wolna z Twoich ustawień: ${zl(taxSettings?.taxFreeAmount || 0)}` : null}
                />

                {p.zdrowotnaLiczona ? (
                  <Wiersz k={`Składka zdrowotna za ${p.miesiecy} mies. · ${opisWidelek(p.widelki)} · ${zl(p.zdrowotnaMies)}/mies.`}
                    v={zl(p.zdrowotnaRok)}
                    sub="Próg ustala się narastająco — różnicę dopłaca się w rocznym rozliczeniu składki." />
                ) : ryczalt && p.podstawaWynajmu === 'private' ? (
                  <Wiersz k="Składka zdrowotna · najem prywatny" v={<span className="wpd-mono" style={{ fontSize: 11, color: 'var(--faint)', textTransform: 'uppercase' }}>nie doliczamy</span>} />
                ) : ryczalt ? (
                  <Wiersz k="Składka zdrowotna" v={<span className="wpd-mono" style={{ fontSize: 11, color: 'var(--faint)', textTransform: 'uppercase' }}>brak odpowiedzi</span>} />
                ) : p.zdrowotnaRok > 0 ? (
                  <Wiersz k={`Zdrowotna z Twoich ustawień · ${zl(p.zdrowotnaMies)} × ${p.miesiecy}`} v={zl(p.zdrowotnaRok)}
                    sub="Przy skali zależy od dochodu — liczymy z kwoty, którą podałeś w ustawieniach." />
                ) : (
                  // Nigdy „0 zł" — mówimy, czego nie liczymy i dlaczego (wzorzec ADR-023).
                  <Wiersz k="Składka zdrowotna · 9% dochodu"
                    v={<span className="wpd-mono" style={{ fontSize: 11, color: 'var(--faint)', textTransform: 'uppercase' }}>nie wyliczamy</span>}
                    sub="Przy skali liczy się od dochodu z całej Twojej działalności, którego aplikacja nie zna. Jeśli ją opłacasz, wpisz kwotę miesięczną w ustawieniach." />
                )}

                {p.spoleczneRok > 0
                  ? <Wiersz k={`Składki społeczne · ${zl(taxSettings?.zusSocial || 0)} × ${p.miesiecy} mies.`} v={zl(p.spoleczneRok)} />
                  : <Wiersz k="Składki społeczne — nie masz ich w ustawieniach"
                      v={<span className="wpd-mono" style={{ fontSize: 11, color: 'var(--faint)', textTransform: 'uppercase' }}>pomijamy</span>} />}

                <Wiersz k="Podatek i składki razem" v={p.formaZnana ? zl(p.lacznieDoZaplaty) : '—'} mocny />
                <p className="wpd-settle__sub" style={{ marginTop: 8 }}>
                  Kwoty przed zaokrągleniem do pełnych złotych.
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gap: 16, minWidth: 0 }}>
              <div className="wpd-panel" style={{ padding: 22 }}>
                <h3 className="wpd-h2" style={{ fontSize: 15, marginBottom: 12 }}>Do rozmowy z księgową</h3>
                <div className="wpd-kvgrid">
                  {ryczalt && (
                    <div className="wpd-kv">
                      <span className="wpd-kv__k">Podstawa wynajmu</span>
                      <span className="wpd-kv__v">
                        {p.podstawaWynajmu === 'business' ? 'działalność gospodarcza'
                          : p.podstawaWynajmu === 'private' ? 'najem prywatny'
                            : 'nieuzupełniona'}
                      </span>
                    </div>
                  )}
                  <div className="wpd-kv">
                    <span className="wpd-kv__k">Forma opodatkowania</span>
                    <span className="wpd-kv__v">
                      {!ryczalt ? NAZWY_FORM[p.forma] || p.forma
                        : zProgiem ? 'Ryczałt 8,5% / 12,5% od nadwyżki'
                          : `Ryczałt, stała stawka ${taxSettings?.rate ?? 8.5}%`}
                    </span>
                  </div>
                  {ryczalt && (
                    <div className="wpd-kv">
                      <span className="wpd-kv__k">Próg</span>
                      <span className="wpd-kv__v">{zProgiem ? `${liczba(p.prog)} zł` : 'nie stosujemy'}</span>
                    </div>
                  )}
                  {p.vatNalezny > 0 && (
                    <div className="wpd-kv">
                      <span className="wpd-kv__k">VAT należny 8%</span>
                      <span className="wpd-kv__v">{zl(p.vatNalezny)}</span>
                    </div>
                  )}
                  <div className="wpd-kv">
                    <span className="wpd-kv__k">Rok stawek</span>
                    <span className="wpd-kv__v">{p.rokStawek}</span>
                  </div>
                  <div className="wpd-kv">
                    <span className="wpd-kv__k">Miesięcy w wyliczeniu</span>
                    <span className="wpd-kv__v">{p.miesiecy} z 12</span>
                  </div>
                </div>
              </div>

              {p.pasma && (
                <div className="wpd-panel" style={{ padding: 22 }}>
                  <h3 className="wpd-h2" style={{ fontSize: 15, marginBottom: 12 }}>Podatek po dwóch stawkach</h3>
                  <div className="wpd-settle__row">
                    <span className="wpd-settle__k">Stawka do progu · 8,5% od {zl(p.pasma.doProgu.podstawa)}</span>
                    <span className="wpd-settle__v wpd-mono">{zl(p.pasma.doProgu.podatek)}</span>
                  </div>
                  <div className="wpd-settle__row">
                    <span className="wpd-settle__k">Nadwyżka · 12,5% od {zl(p.pasma.nadwyzka.podstawa)}</span>
                    <span className="wpd-settle__v wpd-mono" style={{ color: 'var(--cynober)' }}>{zl(p.pasma.nadwyzka.podatek)}</span>
                  </div>
                  <div className="wpd-settle__row wpd-settle__row--total">
                    <span className="wpd-settle__k" style={{ fontWeight: 700 }}>Podatek za rok</span>
                    <span className="wpd-settle__v wpd-mono">{zl(p.podatek)}</span>
                  </div>
                  {p.podstawa < p.przychod && (
                    <p className="wpd-settle__sub" style={{ marginTop: 8 }}>
                      Pasma liczymy od podstawy, czyli po odliczeniu składki zdrowotnej —
                      dlatego pierwsze z nich nie równa się dokładnie {liczba(p.prog)} zł.
                      Podział proporcjonalny wynika z art. 11 ust. 3 ustawy o ryczałcie.
                    </p>
                  )}
                </div>
              )}

              {ryczalt && (p.prowizje > 0 || p.media > 0) && (
                <div className="wpd-panel" style={{ padding: 22 }}>
                  <h3 className="wpd-h2" style={{ fontSize: 15, marginBottom: 12 }}>Prowizje i media · poza rachunkiem ryczałtu</h3>
                  <div className="wpd-settle__row">
                    <span className="wpd-settle__k">Prowizje portali</span>
                    <span className="wpd-settle__v wpd-mono">{zl(p.prowizje)}</span>
                  </div>
                  <div className="wpd-settle__row">
                    <span className="wpd-settle__k">Media i eksploatacja</span>
                    <span className="wpd-settle__v wpd-mono">{zl(p.media)}</span>
                  </div>
                  <p style={{ fontSize: 12.5, lineHeight: 1.55, color: 'var(--faint)', margin: '10px 0 0' }}>
                    Nie wchodzą do podstawy — ryczałt liczy się od przychodu. Trzymamy je osobno,
                    żeby rachunek powyżej się zgadzał.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="wpd-panel" style={{ marginTop: 16 }}>
            <div className="wpd-panel__head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
              <span className="wpd-mono" style={{ fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--label)' }}>
                Rozkład miesięczny · {p.rok}
              </span>
              <span className="wpd-mono" style={{ fontSize: 10, color: 'var(--faint)' }}>miesiące bez ruchu pominięte</span>
            </div>
            {/* `minWidth: 0` jest tu konieczne, nie ozdobne: bez niego kontener rośnie
                do szerokości tabeli zamiast ją przewijać i rozpycha całą stronę w poziomie. */}
            <div style={{ padding: 16, overflowX: 'auto', minWidth: 0, maxWidth: '100%' }}>
              <table className="wpd-table" style={{ minWidth: 520 }}>
                <thead>
                  <tr>
                    <th>Miesiąc</th>
                    <th className="wpd-cell-num">Rezerwacje</th>
                    {kolumnaBrutto && <th className="wpd-cell-num">Brutto</th>}
                    <th className="wpd-cell-num">Przychód</th>
                    <th className="wpd-cell-num">Prowizje</th>
                    <th className="wpd-cell-num">Media</th>
                  </tr>
                </thead>
                <tbody>
                  {miesiace.map((m) => (
                    <tr key={m.miesiac}>
                      <td>{monthNames[m.miesiac]}</td>
                      <td className="wpd-cell-num wpd-mono">{m.rezerwacje || '—'}</td>
                      {kolumnaBrutto && <td className="wpd-cell-num wpd-mono">{m.brutto ? zl(m.brutto) : '—'}</td>}
                      <td className="wpd-cell-num wpd-mono">{m.przychod ? zl(m.przychod) : '—'}</td>
                      <td className="wpd-cell-num wpd-mono">{m.prowizje ? zl(m.prowizje) : '—'}</td>
                      <td className="wpd-cell-num wpd-mono">{m.media ? zl(m.media) : '—'}</td>
                    </tr>
                  ))}
                  <tr className="wpd-settle__row--total">
                    <td style={{ fontWeight: 700 }}>Razem</td>
                    <td className="wpd-cell-num wpd-mono" style={{ fontWeight: 600 }}>{p.liczbaRezerwacji}</td>
                    {kolumnaBrutto && <td className="wpd-cell-num wpd-mono" style={{ fontWeight: 600 }}>{zl(p.brutto)}</td>}
                    <td className="wpd-cell-num wpd-mono" style={{ fontWeight: 600 }}>{zl(p.przychodCalosc)}</td>
                    <td className="wpd-cell-num wpd-mono" style={{ fontWeight: 600 }}>{zl(p.prowizje)}</td>
                    <td className="wpd-cell-num wpd-mono" style={{ fontWeight: 600 }}>{zl(p.media)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {stopka}
        </>
      )}
    </div>
  );
}
