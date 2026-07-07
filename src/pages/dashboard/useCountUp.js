import { useEffect, useMemo, useState } from 'react';

/*
  Animacja liczb — wzorzec z widoku Analityka, wyciągnięty do współdzielenia
  (decyzja właściciela 2026-07-06: te same wejście liczb w całym panelu).
  Jeden wspólny `progress` 0→1 (700 ms, ease-out cubic) mnoży wyświetlane
  wartości, więc wszystkie liczby widoku finiszują RAZEM.
  `shown` steruje klasą .wpd-rise/is-in (fade+rise sekcji).
  Przy prefers-reduced-motion wartości pojawiają się od razu (progress=1).
  Użycie: const { progress, shown } = useCountUp();
          <div className="wpd-stat__value">{fmt(kwota * progress)}</div>
*/
export function useCountUp() {
  const reduced = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );
  const [shown, setShown] = useState(reduced);
  const [progress, setProgress] = useState(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) return undefined;
    const rAppear = requestAnimationFrame(() => setShown(true));
    const startT = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - startT) / 700);
      setProgress(1 - Math.pow(1 - p, 3));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); cancelAnimationFrame(rAppear); };
  }, [reduced]);

  return { progress, shown, reduced };
}
