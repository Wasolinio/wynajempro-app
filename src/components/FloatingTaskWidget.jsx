import React, { useState } from 'react';
import { Bell, X, CalendarClock, ChevronDown } from 'lucide-react';

/*
  Pływający widget zadań na dziś. Renderowany wewnątrz panelu (.wpd),
  więc korzysta z tokenów var(--…) tego namespace'u — identyfikacja WynajemPRO v2.

  DLACZEGO ZWINIĘTY DOMYŚLNIE (zgłoszenie właściciela 2026-08-25):
  widget jest `position: fixed` w prawym dolnym rogu, więc zasłaniał treść na KAŻDYM
  widoku i przy każdym przewinięciu — w panelu podatkowym trafiał dokładnie w kartę
  „Przychód i co go zjadło". Rozwinięty panel ma ~300×200 px; zwinięta pigułka ~40 px
  wysokości i tyle szerokości, ile potrzebuje napis. Licznik zadań zostaje widoczny
  w obu stanach, więc nie tracimy informacji — tracimy tylko zasłoniętą powierzchnię.

  Stan zwinięcia PAMIĘTAMY (localStorage). Wcześniej „×" chowało widget wyłącznie do
  przeładowania, więc wybór właściciela znikał przy każdym wejściu do panelu.
  Świadomie NIE zapamiętujemy „×": ukrycie na stałe, bez widocznej drogi powrotu,
  byłoby pułapką — po przeładowaniu widget wraca zwinięty.
*/

const KLUCZ = 'wpd_taskwidget_rozwiniety';

const czyRozwiniety = () => {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(KLUCZ) === 'true';
  } catch {
    return false; // prywatny tryb przeglądarki — trudno, startujemy zwinięci
  }
};

export default function FloatingTaskWidget({ tasks = [] }) {
  const [isVisible, setIsVisible] = useState(true);
  const [rozwiniety, setRozwiniety] = useState(czyRozwiniety);

  if (!isVisible || tasks.length === 0) return null;

  const przelacz = () => {
    const nowy = !rozwiniety;
    setRozwiniety(nowy);
    try {
      window.localStorage.setItem(KLUCZ, String(nowy));
    } catch { /* brak dostępu do pamięci — stan zostaje na tę sesję */ }
  };

  const sortedTasks = [...tasks].sort((a, b) => a.days - b.days);
  const mostUrgent = sortedTasks[0];

  // Kropka „są zadania" — ten sam znacznik w obu stanach, żeby zwinięcie nie ukrywało sygnału.
  const kropka = (
    <span style={{ position: 'absolute', top: -5, left: -5, width: 12, height: 12, borderRadius: '50%', background: 'var(--cynober)', border: '2px solid var(--surface)' }} />
  );

  return (
    <div className="wpd-taskwidget" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 50, width: rozwiniety ? 300 : 'auto', maxWidth: 'calc(100vw - 32px)' }}>
      {!rozwiniety ? (
        <button
          onClick={przelacz}
          aria-expanded={false}
          title="Pokaż zadania na dziś"
          style={{
            position: 'relative', display: 'flex', alignItems: 'center', gap: 9,
            background: 'var(--surface)', border: '1px solid var(--ink)', borderRadius: 4,
            padding: '9px 13px', cursor: 'pointer', fontFamily: 'inherit', color: 'var(--ink)',
          }}
        >
          {kropka}
          <Bell style={{ width: 15, height: 15, color: 'var(--cynober)', flex: '0 0 15px' }} />
          <span style={{ fontWeight: 600, fontSize: 13 }}>Zadania na dziś</span>
          <span className="wpd-mono" style={{ fontSize: 11, color: 'var(--cynober)' }}>{tasks.length}</span>
        </button>
      ) : (
        <div style={{
          // separacja od tła linią 1px ink zamiast cienia — zasada v2 „zero cieni"
          position: 'relative', background: 'var(--surface)', border: '1px solid var(--ink)',
          borderRadius: 4, padding: 18,
        }}>
          {kropka}

          <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 2 }}>
            <button onClick={przelacz} title="Zwiń" aria-expanded
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--faint)', display: 'flex', padding: 2 }}>
              <ChevronDown style={{ width: 16, height: 16 }} />
            </button>
            <button onClick={() => setIsVisible(false)} title="Ukryj"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--faint)', display: 'flex', padding: 2 }}>
              <X style={{ width: 16, height: 16 }} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 34, height: 34, borderRadius: 3, border: '1px solid var(--hairline)', background: 'var(--paper)', color: 'var(--cynober)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 34px' }}>
              <Bell style={{ width: 16, height: 16 }} />
            </span>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: 14, margin: 0, color: 'var(--ink)' }}>Zadania na dziś</h3>
              <p className="wpd-mono" style={{ fontSize: 11, color: 'var(--cynober)', margin: '2px 0 0' }}>Oczekujące: {tasks.length}</p>
            </div>
          </div>

          <div style={{ marginTop: 14, paddingTop: 13, borderTop: '1px solid var(--hairline)' }}>
            <p className="wpd-mono" style={{ fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--label)', margin: '0 0 8px' }}>Najpilniejsze</p>
            <div style={{ background: 'var(--inner)', border: '1px solid var(--hairline)', borderRadius: 4, padding: 12 }}>
              <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink)', margin: 0, lineHeight: 1.4 }}>{mostUrgent.text}</p>
              <div className="wpd-mono" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 10, color: 'var(--faint)' }}>
                <CalendarClock style={{ width: 13, height: 13 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mostUrgent.property}{mostUrgent.guest ? ` · ${mostUrgent.guest}` : ''}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
