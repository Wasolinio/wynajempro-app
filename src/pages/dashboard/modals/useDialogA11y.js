import { useEffect, useRef } from 'react';

/* Wspólna dostępność modali (audyt poz. 12): fokus wchodzi do dialogu przy otwarciu,
   Escape zamyka — ale tylko dialog leżący na wierzchu (DeleteConfirm z-index 90 może
   być otwarty nad Ustawieniami; jedno Escape = jedno zamknięcie), semantyka ARIA.
   Użycie: const dialogA11y = useDialogA11y(open, onClose);
           <div className="wpd-dialog" {...dialogA11y}> */
export function useDialogA11y(open, onClose) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; });

  useEffect(() => {
    if (!open) return undefined;
    ref.current?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      const mine = ref.current?.closest('.wpd-overlay');
      let top = null; let topZ = -Infinity;
      document.querySelectorAll('.wpd-overlay').forEach((d) => {
        const z = Number(getComputedStyle(d).zIndex) || 0;
        if (z >= topZ) { topZ = z; top = d; }
      });
      if (mine && top === mine) closeRef.current?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return { ref, role: 'dialog', 'aria-modal': 'true', tabIndex: -1 };
}
