import { useCallback, useEffect, useRef } from 'react';

/*
  Przeciąganie kartek zadań (moduł Zadania, E3) — zachowanie 1:1 z prototypu
  design_handoff_zadania (README „Interakcje i animacje"):

  - pointerdown na kartce → KLON w warstwie fixed (z-index 910), oryginał opacity .22,
    body cursor:grabbing; elementy z [data-nodrag] nie zaczynają przeciągania;
  - pętla requestAnimationFrame BEZ setState (jedno przerysowanie na ruch myszy
    zabiłoby płynność listy — ryzyko §6); pozycja dogania kursor: s += (cel − s) × .26,
    przechył clamp(zaległość/42, −1, 1) × 9° wygładzany × .22, skala 1.035;
  - hit-test przez document.elementFromPoint → closest('[data-drop]'); klon ma
    pointer-events:none, inaczej trafiałby w samego siebie (ryzyko §6);
  - podświetlenie celu imperatywnie klasami --target (nie hoverem, nie setState);
  - czarna plakietka celu +16/+18 px od kursora („25 SIE · WT → ANNA NOWAK");
  - upuszczenie na cel: klon leci do środka celu (300 ms, scale .72, opacity .06),
    cel odbija scale(1.09) sprężyną, potem zapis (onDrop) i przerysowanie listy;
  - upuszczenie w pustkę: klon wraca na start i gaśnie;
  - prefers-reduced-motion: bez przechyłu (0°), doganianie .55, skala 1.01 —
    przeciąganie zostaje, bo to funkcja, nie ozdoba.

  Pozycje: klon jest position:fixed we współrzędnych viewportu, a delta liczona z kursora
  (też viewport) — przewinięcie strony w trakcie przeciągania nie rozjeżdża klona,
  a elementFromPoint zawsze czyta żywy układ (ryzyko §6 „przewijanie" załatwione
  doborem układu współrzędnych, bez cache'owania celów).

  Cały silnik żyje POZA Reactem (jeden obiekt z useMemo, stan w domknięciu) —
  komponent nie przerysowuje się ani razu między pointerdown a upuszczeniem.
*/

const EASE = 'cubic-bezier(.22,1,.36,1)';
const SPRING = 'cubic-bezier(.34,1.56,.64,1)';

// poza hookiem: globalny stan kursora na czas przeciągania (grabbing + blokada zaznaczania)
const setBodyDragging = (on) => {
  document.body.style.cursor = on ? 'grabbing' : '';
  document.body.style.userSelect = on ? 'none' : '';
};

// Fabryka silnika NA POZIOMIE MODUŁU (poza komponentem): stan przeciągania żyje
// w domknięciu, nie w Reakcie — reguła react-hooks/immutability słusznie nie pozwala
// trzymać takiego mutowalnego stanu w ciele hooka, a tu jest on całym sensem rozwiązania.
function createDragEngine(cbRef) {
  let drag = null;
  let raf = 0;
  let layer = null;

  const reduced = () => typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const getLayer = () => {
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'wpd-tk-layer';
      // do korzenia .wpd, nie do body: klon i plakietka korzystają z tokenów var(--...),
      // które żyją na .wpd; korzeń nie ma transformu, więc fixed liczy się od viewportu
      (document.querySelector('.wpd') || document.body).appendChild(layer);
    }
    return layer;
  };

  const paint = (el, on) => {
    if (!el) return;
    const kind = el.getAttribute('data-drop');
    if (kind === 'res') el.classList.toggle('wpd-tk-bar-res--target', on);
    else if (kind === 'day') el.classList.toggle('wpd-tk-cell--target', on);
  };

  function tick() {
    if (!drag) return;
    const d = drag;
    const tdx = d.x - d.ox - d.rect.left;
    const tdy = d.y - d.oy - d.rect.top;
    const ease = d.reduced ? 0.55 : 0.26;
    const lag = tdx - d.sdx;
    d.sdx += lag * ease;
    d.sdy += (tdy - d.sdy) * ease;
    const maxTilt = d.reduced ? 0 : 9;
    const want = Math.max(-1, Math.min(1, lag / 42)) * maxTilt;
    d.tilt += (want - d.tilt) * 0.22;
    const sc = d.reduced ? 1.01 : 1.035;
    d.clone.style.transform = `translate3d(${d.sdx.toFixed(2)}px,${d.sdy.toFixed(2)}px,0) rotate(${d.tilt.toFixed(2)}deg) scale(${sc})`;
    if (d.labelOn) {
      d.label.style.left = `${d.x + 16}px`;
      d.label.style.top = `${d.y + 18}px`;
    }
    raf = requestAnimationFrame(tick);
  }

  function snapLabel(el) {
    if (!drag) return;
    const d = drag;
    const info = el ? cbRef.current.resolveDrop(el, d.x) : null;
    if (!info) {
      d.labelOn = false;
      d.label.classList.remove('wpd-tk-snap--on');
      return;
    }
    d.labelOn = true;
    d.label.textContent = cbRef.current.labelFor(info);
    d.label.style.left = `${d.x + 16}px`;
    d.label.style.top = `${d.y + 18}px`;
    d.label.classList.add('wpd-tk-snap--on');
  }

  function onMove(e) {
    if (!drag) return;
    const d = drag;
    d.x = e.clientX; d.y = e.clientY;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    let hit = el && el.closest ? el.closest('[data-drop]') : null;
    if (hit && hit.getAttribute('data-drop') === 'busy') hit = null; // komórka pod paskiem — nieaktywna
    if (hit !== d.target) {
      paint(d.target, false);
      d.target = hit;
      paint(hit, true);
      snapLabel(hit);
    }
  }

  function finish() {
    if (!drag) return;
    const d = drag;
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', finish);
    window.removeEventListener('pointercancel', finish);
    cancelAnimationFrame(raf);
    setBodyDragging(false);
    d.label.remove();

    const info = d.target ? cbRef.current.resolveDrop(d.target, d.x) : null;
    const dur = d.reduced ? 180 : 300;

    if (info) {
      const tr = d.target.getBoundingClientRect();
      const cx = tr.left + tr.width / 2 - (d.rect.left + d.rect.width / 2);
      const cy = tr.top + tr.height / 2 - (d.rect.top + d.rect.height / 2);
      d.clone.style.transition = `transform ${dur}ms ${EASE}, opacity ${dur}ms ease`;
      d.clone.style.transform = `translate3d(${cx}px,${cy}px,0) rotate(0deg) scale(.72)`;
      d.clone.style.opacity = '.06';
      const target = d.target;
      if (target.getAttribute('data-drop') === 'res' && !d.reduced) {
        target.style.transition = `transform .26s ${SPRING}, outline-color .2s, background-color .2s`;
        target.style.transform = 'scale(1.09)';
      }
      setTimeout(() => {
        paint(target, false);
        target.style.transition = '';
        target.style.transform = '';
      }, 260);
      const { taskId, card, clone } = d;
      setTimeout(() => {
        clone.remove();
        card.style.opacity = '';
        cbRef.current.onDrop(taskId, info);
      }, Math.max(0, dur - 40));
    } else {
      paint(d.target, false);
      d.clone.style.transition = `transform ${dur}ms ${EASE}, opacity ${dur}ms ease`;
      d.clone.style.transform = 'translate3d(0,0,0) rotate(0deg) scale(1)';
      d.clone.style.opacity = '0';
      const { card, clone } = d;
      setTimeout(() => { clone.remove(); card.style.opacity = ''; }, dur);
    }
    drag = null;
  }

  function begin(e, task) {
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target.closest && e.target.closest('[data-nodrag]')) return;
    // < 980 px (mobile, partia 2): przeciąganie palcem wyłączone — pointerdown na kartce
    // zjadałby przewijanie listy, a README daje na dotyk równoważną drogę: przycisk
    // „Przypisz" → arkusz od dołu. Długie przytrzymanie („opcjonalnie" w README)
    // świadomie pominięte. Mysz/piórko działają też na wąskim oknie.
    if (e.pointerType === 'touch' && window.matchMedia('(max-width: 980px)').matches) return;
    if (drag) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();

    const clone = card.cloneNode(true);
    clone.classList.add('wpd-tk-ghost');
    clone.classList.remove('wpd-tk-card--flash');
    clone.style.left = `${rect.left}px`;
    clone.style.top = `${rect.top}px`;
    clone.style.width = `${rect.width}px`;
    clone.style.margin = '0';
    getLayer().appendChild(clone);
    card.style.opacity = '.22';

    const label = document.createElement('div');
    label.className = 'wpd-tk-snap';
    getLayer().appendChild(label);

    setBodyDragging(true);
    drag = {
      taskId: task.id, card, clone, label, rect,
      ox: e.clientX - rect.left, oy: e.clientY - rect.top,
      x: e.clientX, y: e.clientY, sdx: 0, sdy: 0, tilt: 0,
      target: null, labelOn: false, reduced: reduced(),
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', finish);
    raf = requestAnimationFrame(tick);
  }

  function destroy() {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', finish);
    window.removeEventListener('pointercancel', finish);
    cancelAnimationFrame(raf);
    setBodyDragging(false);
    layer?.remove();
    layer = null;
    drag = null;
  }

  return { begin, destroy };
}

export function useTaskDrag({ resolveDrop, labelFor, onDrop }) {
  const cbRef = useRef({ resolveDrop, labelFor, onDrop });
  useEffect(() => { cbRef.current = { resolveDrop, labelFor, onDrop }; });

  // silnik powstaje leniwie przy pierwszym pointerdown (dostęp do refów tylko
  // w handlerze zdarzenia i w sprzątającym efekcie — nigdy w renderze)
  const engineRef = useRef(null);

  const begin = useCallback((e, task) => {
    if (!engineRef.current) engineRef.current = createDragEngine(cbRef);
    engineRef.current.begin(e, task);
  }, []);

  useEffect(() => () => {
    engineRef.current?.destroy();
    engineRef.current = null;
  }, []);

  return { begin };
}
