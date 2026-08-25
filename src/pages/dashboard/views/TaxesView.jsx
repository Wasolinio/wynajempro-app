import React, { useMemo } from 'react';
import { Landmark, TriangleAlert, Info } from 'lucide-react';
import { podsumowaniePodatkowe, podsumowanieMiesieczne, domyslnyTryb } from '../../../utils/taxSummary';
import { monthNames, STAWKI_PODATKOWE } from '../../../utils/constants';

/*
  ⚠️ WIDOK TYMCZASOWY — DO ZASTĄPIENIA PROJEKTEM.
  Ten plik istnieje po to, żeby dało się zobaczyć dane na ekranie i sprawdzić logikę.
  Układ, hierarchia i wygląd idą osobno do Claude Design — brief:
  `docs/Projects/Brief-panel-podatkowy-2026-08-24.md`. Gdy projekt wróci, ten komponent
  wymienia się w całości; `src/utils/taxSummary.js` (logika) zostaje bez zmian.

  PODATKI (X25) — czwarta podzakładka Finansów.

  Odbudowa widoku, który zniknął commitem `fb8a00e` i został usankcjonowany w ADR-013
  („panel nie wraca") z uzasadnieniem „martwy kod przez dwa miesiące, nikt nie zgłosił braku".
  Przesłanka upadła 2026-08-22: beta nie miała wtedy użytkowników, a pierwszy tester,
  który spojrzał na moduł podatkowy, zgłosił dokładnie ten brak. Patrz ADR-018.

  DWA TRYBY, bo właściciel rozstrzygnął (2026-08-22), że nie wybieramy typu gospodarza:
    • prosty      — jedno pytanie: ile odłożyć
    • szczegółowy — widok dla księgowego: rozbicie, miesiące, eksport

  Tryb domyślny WYNIKA Z FORMY OPODATKOWANIA i nie jest pytaniem przy pierwszym
  uruchomieniu (decyzja 2026-08-24): w tamtym momencie gospodarz nie widział żadnego
  z trybów, więc nie ma jak wybrać, a wybór jest odwracalny jednym kliknięciem.

  ⚖️ To jest SZACUNEK dla gospodarza i jego księgowego, nie deklaracja podatkowa —
  i interfejs mówi to wprost, w dwóch miejscach.
*/

const zl = (n) => `${(Math.round(n * 100) / 100).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} zł`;

// Dwie formy, bo tyle aplikacja liczy poprawnie. Podatek liniowy i działalność
// nierejestrowana wypadły 2026-08-25 (ADR-020) — obie były liczone stawką ryczałtu.
const NAZWY_FORM = {
  lump_sum: 'Ryczałt',
  general: 'Zasady ogólne (skala)',
};

export default function TaxesView({ rentals, taxSettings, selectedYear, tryb, onZmienTryb }) {
  // ⚠️ `selectedYear` jest w całym panelu NAPISEM (`setSelectedYear(String(...))`,
  // porównania przez `.toString()`), a `taxSummary` porównuje rok przez `===`.
  // Bez tej konwersji filtr rezerwacji nie trafiał nigdy i panel pokazywał stan pusty
  // każdemu gospodarzowi, niezależnie od danych.
  const rok = Number(selectedYear) || new Date().getFullYear();
  const p = useMemo(() => podsumowaniePodatkowe(rentals, taxSettings, rok), [rentals, taxSettings, rok]);
  const miesiace = useMemo(() => podsumowanieMiesieczne(rentals, taxSettings, rok), [rentals, taxSettings, rok]);

  const aktywnyTryb = tryb || domyslnyTryb(taxSettings);
  const ryczalt = p.forma === 'lump_sum';

  if (p.liczbaRezerwacji === 0) {
    return (
      <div className="wpd-section">
        <div className="wpd-empty">
          <span className="wpd-empty__icon"><Landmark /></span>
          <p>Brak rezerwacji w roku {rok}, więc nie ma czego rozliczać.</p>
          <p className="wpd-stat__sub">Dodaj pierwszą rezerwację, a podsumowanie policzy się samo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wpd-section">
      {/* ── Przełącznik trybu — w widoku, nie tylko w Ustawieniach ── */}
      <div className="wpd-seg" role="group" aria-label="Poziom szczegółowości">
        <button type="button" className={`wpd-seg__btn${aktywnyTryb === 'prosty' ? ' wpd-seg__btn--active' : ''}`}
          onClick={() => onZmienTryb && onZmienTryb('prosty')}>
          Podsumowanie
        </button>
        <button type="button" className={`wpd-seg__btn${aktywnyTryb === 'szczegolowy' ? ' wpd-seg__btn--active' : ''}`}
          onClick={() => onZmienTryb && onZmienTryb('szczegolowy')}>
          Szczegóły dla księgowego
        </button>
      </div>

      {/* ⚠️ Stawki są datowane. Wpisane na sztywno zgniłyby w styczniu BEZ ŻADNEGO
          SYGNAŁU — wyliczenia dalej by wychodziły, tylko byłyby nieprawdziwe. */}
      {!p.stawkiAktualne && (
        <div className="wpd-note wpd-note--danger" style={{ marginBottom: 14 }}>
          <TriangleAlert style={{ width: 14, height: 14, display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
          Wyliczenia używają stawek z roku {p.rokStawek}, a oglądasz rok {p.rok}. Kwoty mogą być
          nieaktualne — potwierdź je u księgowego, zanim cokolwiek zapłacisz.
        </div>
      )}

      {/* ── TRYB PROSTY: jedno pytanie — ile odłożyć ── */}
      <div className="wpd-stats">
        <div className="wpd-stat wpd-stat--dark">
          <div className="wpd-stat__head">
            <p className="wpd-stat__label">Odłóż na podatek i składki · {rok}</p>
            <span className="wpd-stat__ic"><Landmark /></span>
          </div>
          <div className="wpd-stat__value">{p.formaZnana ? zl(p.lacznieDoZaplaty) : '—'}</div>
          <div className="wpd-stat__foot">
            <span className="wpd-stat__sub">
              podatek {zl(p.podatek)}
              {p.zdrowotnaRok > 0 && ` · zdrowotna ${zl(p.zdrowotnaRok)}`}
              {p.spoleczneRok > 0 && ` · społeczna ${zl(p.spoleczneRok)}`}
            </span>
            {/* Ta kwota jest SUMĄ NARASTAJĄCĄ za miniony okres, a nie tym, co zostało
                do zapłaty — ryczałt płaci się zaliczkowo co miesiąc lub kwartał, więc
                w połowie roku większość tej kwoty jest już zapłacona. Bez tego zdania
                „odłóż" czyta się jako „jeszcze nie zapłacone". Analiza prawna §B7. */}
            <span className="wpd-stat__sub" style={{ display: 'block', marginTop: 6 }}>
              Liczone narastająco za {p.miesiecy} mies. {rok}. Nie odejmujemy zapłaconych
              już zaliczek ani składek — to obciążenie za cały ten okres.
            </span>
          </div>
        </div>

        <div className="wpd-stat">
          <div className="wpd-stat__head">
            <p className="wpd-stat__label">Przychód narastająco</p>
          </div>
          <div className="wpd-stat__value">{zl(p.przychod)}</div>
          <div className="wpd-stat__foot">
            <span className="wpd-stat__sub">{p.liczbaRezerwacji} rezerwacji</span>
          </div>
        </div>

        {ryczalt && (
          <div className="wpd-stat">
            <div className="wpd-stat__head">
              <p className="wpd-stat__label">Próg ryczałtu {p.prog.toLocaleString('pl-PL')} zł</p>
            </div>
            <div className="wpd-stat__value">
              {p.progPrzekroczony ? 'przekroczony' : zl(p.doProgu)}
            </div>
            <div className="wpd-stat__foot">
              <div className="wpd-bar"><div className="wpd-bar__fill" style={{ width: `${p.procentProgu}%` }} /></div>
              <span className="wpd-stat__sub">
                {p.progPrzekroczony
                  ? 'nadwyżka liczona stawką 12,5%'
                  : `do przekroczenia · potem stawka 12,5%`}
              </span>
            </div>
          </div>
        )}

        {/* Trzy stany, bo składka zdrowotna przy ryczałcie znaczy co innego zależnie od tego,
            czy najem jest w działalności. Nigdy nie pokazujemy tu „0,00 zł" — zero w polu
            składki czyta się jak twierdzenie „nie masz jej", a tego aplikacja nie wie. */}
        {ryczalt && p.zdrowotnaLiczona && (
          <div className="wpd-stat">
            <div className="wpd-stat__head">
              <p className="wpd-stat__label">Składka zdrowotna · miesięcznie</p>
            </div>
            <div className="wpd-stat__value">{zl(p.zdrowotnaMies)}</div>
            <div className="wpd-stat__foot">
              {/* To jest ta rzecz, której gospodarz nie musi już liczyć sam: składka przy
                  ryczałcie zależy od PROGU PRZYCHODU, a aplikacja przychód zna. */}
              <span className="wpd-stat__sub">wg progu przychodu, liczona automatycznie</span>
            </div>
          </div>
        )}

        {ryczalt && p.podstawaWynajmu === 'private' && (
          <div className="wpd-stat">
            <div className="wpd-stat__head">
              <p className="wpd-stat__label">Składka zdrowotna</p>
            </div>
            <div className="wpd-stat__value" style={{ fontSize: 17 }}>nie doliczamy</div>
            <div className="wpd-stat__foot">
              <span className="wpd-stat__sub">przy najmie poza działalnością</span>
            </div>
          </div>
        )}

        {ryczalt && p.podstawaWynajmu === null && (
          <div className="wpd-stat">
            <div className="wpd-stat__head">
              <p className="wpd-stat__label">Składka zdrowotna</p>
            </div>
            <div className="wpd-stat__value" style={{ fontSize: 17 }}>brak odpowiedzi</div>
            <div className="wpd-stat__foot">
              <span className="wpd-stat__sub wpd-stat__sub--accent">
                uzupełnij „Jak wynajmujesz" w ustawieniach
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── TRYB SZCZEGÓŁOWY ── */}
      {aktywnyTryb === 'szczegolowy' && (
        <>
          <div className="wpd-panel" style={{ marginTop: 18 }}>
            <div className="wpd-panel__head">
              <h2 className="wpd-h2" style={{ fontSize: 15 }}>Rozbicie · {NAZWY_FORM[p.forma] || p.forma}</h2>
            </div>
            <div style={{ padding: 16 }}>
              <div className="wpd-settle__row"><span className="wpd-settle__k">Przychód brutto</span><span className="wpd-settle__v wpd-mono">{zl(p.brutto)}</span></div>
              {p.vatNalezny > 0 && (
                <div className="wpd-settle__row"><span className="wpd-settle__k">VAT należny (8%)</span><span className="wpd-settle__v wpd-mono">−{zl(p.vatNalezny)}</span></div>
              )}
              <div className="wpd-settle__row"><span className="wpd-settle__k">Przychód netto</span><span className="wpd-settle__v wpd-mono">{zl(p.przychod)}</span></div>
              <div className="wpd-settle__row"><span className="wpd-settle__k">Prowizje portali</span><span className="wpd-settle__v wpd-mono">{zl(p.prowizje)}</span></div>
              <div className="wpd-settle__row"><span className="wpd-settle__k">Koszty eksploatacyjne</span><span className="wpd-settle__v wpd-mono">{zl(p.media)}</span></div>
              {/* Odliczenie przysługuje WYŁĄCZNIE w działalności — art. 11 ust. 1a ustawy
                  o ryczałcie odsyła do art. 6 ust. 1 i wymaga składki „z tytułu pozarolniczej
                  działalności gospodarczej". Przy najmie prywatnym nie ma czego odliczać,
                  więc wiersz znika, zamiast pokazywać −0,00 zł. */}
              {p.zdrowotnaLiczona && (
                <div className="wpd-settle__row">
                  <span className="wpd-settle__k">Odliczenie 50% zapłaconej składki zdrowotnej</span>
                  <span className="wpd-settle__v wpd-mono">−{zl(p.przychod - p.podstawa)}</span>
                </div>
              )}
              <div className="wpd-settle__row"><span className="wpd-settle__k">Podstawa opodatkowania</span><span className="wpd-settle__v wpd-mono">{zl(p.podstawa)}</span></div>
              <div className="wpd-settle__row wpd-settle__row--total"><span className="wpd-settle__k">Podatek dochodowy</span><span className="wpd-settle__v wpd-mono">{zl(p.podatek)}</span></div>
            </div>
          </div>

          {/* ⚠️ Przy ryczałcie kosztów NIE odlicza się od podstawy — pokazujemy je,
              bo gospodarz i tak chce wiedzieć, ile zjadły, ale nie wolno sugerować,
              że wchodzą do wyliczenia podatku. */}
          {ryczalt && (p.prowizje > 0 || p.media > 0) && (
            <div className="wpd-note wpd-note--info" style={{ marginTop: 12 }}>
              <Info style={{ width: 14, height: 14, display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
              Przy ryczałcie podatek liczy się od przychodu — prowizje i koszty eksploatacyjne
              pokazujemy dla Twojej orientacji, ale nie pomniejszają one podstawy.
            </div>
          )}

          {p.rozjazd && (
            <div className="wpd-note wpd-note--danger" style={{ marginTop: 12 }}>
              <TriangleAlert style={{ width: 14, height: 14, display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
              Kwoty zapisane przy pojedynczych rezerwacjach sumują się do {zl(p.rozjazd.zapisany)},
              a wyliczenie z bieżących ustawień daje {zl(p.rozjazd.wyliczony)}. Przyczyny bywają różne:
              zmiana formy opodatkowania w trakcie roku albo kwoty wpisane ręcznie przy starszych
              rezerwacjach. W panelu pokazujemy tę policzoną z bieżących ustawień — liczymy ją raz,
              od całego roku.
            </div>
          )}

          <div className="wpd-panel" style={{ marginTop: 18 }}>
            <div className="wpd-panel__head">
              <h2 className="wpd-h2" style={{ fontSize: 15 }}>Miesiąc po miesiącu</h2>
            </div>
            {/* `minWidth: 0` jest tu konieczne, nie ozdobne: bez niego kontener rośnie
                do szerokości tabeli zamiast ją przewijać i rozpycha całą stronę
                w poziomie na telefonie (zmierzone: 406 px przy oknie 375 px). */}
            <div style={{ padding: 16, overflowX: 'auto', minWidth: 0, maxWidth: '100%' }}>
              <table className="wpd-table">
                <thead>
                  <tr>
                    <th>Miesiąc</th>
                    <th className="wpd-cell-num">Rezerwacje</th>
                    <th className="wpd-cell-num">Przychód</th>
                    <th className="wpd-cell-num">Prowizje</th>
                    <th className="wpd-cell-num">Koszty</th>
                  </tr>
                </thead>
                <tbody>
                  {miesiace.filter((m) => m.rezerwacje > 0 || m.media > 0).map((m) => (
                    <tr key={m.miesiac}>
                      <td>{monthNames[m.miesiac]}</td>
                      <td className="wpd-cell-num">{m.rezerwacje || '—'}</td>
                      <td className="wpd-cell-num wpd-mono">{zl(m.przychod)}</td>
                      <td className="wpd-cell-num wpd-mono">{zl(m.prowizje)}</td>
                      <td className="wpd-cell-num wpd-mono">{zl(m.media)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ZASTRZEŻENIE — JEDNO MIEJSCE, NA KOŃCU. Nie powtarzamy go przy liczbach:
          ostrzeżenie postawione wszędzie przestaje ostrzegać, a w ewentualnym sporze
          broni gorzej niż jedno, widoczne. Treść uzgodniona z analizą prawną
          2026-08-24 §5 — trzy rzeczy, których poprzednia wersja nie mówiła:
          na czym oparte jest wyliczenie, że to nie jest wyliczenie podatku,
          i że potwierdzać trzeba PRZED ZAPŁATĄ, a nie dopiero przed zeznaniem
          (ryczałt płaci się zaliczkowo co miesiąc lub kwartał). */}
      <div className="wpd-note wpd-note--info" style={{ marginTop: 18 }}>
        <Info style={{ width: 14, height: 14, display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
        Szacunek policzony z Twoich danych i z ustawień podatkowych Twojego konta —
        nie jest deklaracją, wyliczeniem podatku ani poradą podatkową. Kwoty potwierdź
        z księgową, zanim zapłacisz podatek lub złożysz deklarację.
        <span className="wpd-mono" style={{ display: 'block', marginTop: 6, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em' }}>
          Stawki {p.rokStawek} · zweryfikowane {STAWKI_PODATKOWE.zweryfikowano}
        </span>
      </div>
    </div>
  );
}
