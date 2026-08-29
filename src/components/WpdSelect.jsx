import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/*
  Rozsuwane menu (custom select) w konwencji .wpd-sel — wzorzec z modułu Zadania
  (design_handoff_zadania/README.md, „Rozsuwane menu"). Docelowo zamiennik natywnych
  .wpd-select w innych widokach (źródło rezerwacji, kategoria kosztu, sortowanie, rok) —
  ta wymiana jest POZA partią 1 modułu Zadania; na razie konsumuje go tylko TasksView.

  options: [{ value, name, color?, count? }]
*/
export default function WpdSelect({ label, value, options, onChange, ariaLabel }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (!rootRef.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const current = options.find((o) => o.value === value) || options[0];

  return (
    <div className="wpd-sel" ref={rootRef}>
      <button type="button"
        className={`wpd-sel__btn${open ? ' wpd-sel__btn--open' : ''}`}
        aria-haspopup="listbox" aria-expanded={open} aria-label={ariaLabel || label}
        onClick={() => setOpen((v) => !v)}>
        <span className="wpd-sel__label">{label}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
          {current?.color && <span className="wpd-sel__dot" style={{ background: current.color }} />}
          <span className="wpd-sel__value">{current?.shortName || current?.name}</span>
        </span>
        <ChevronDown className="wpd-sel__chev" />
      </button>
      {open && (
        <div className="wpd-sel__menu" role="listbox" aria-label={ariaLabel || label}>
          {options.map((o, i) => (
            <button type="button" key={o.value} role="option" aria-selected={o.value === value}
              className={`wpd-sel__opt${o.value === value ? ' wpd-sel__opt--on' : ''}`}
              style={{ animationDelay: `${i * 35}ms` }}
              onClick={() => { onChange(o.value); setOpen(false); }}>
              {o.color && <span className="wpd-tk-dot" style={{ background: o.color }} />}
              <span className="wpd-sel__optname">{o.name}</span>
              {o.count !== undefined && <span className="wpd-sel__optcount">{o.count}</span>}
              {o.value === value && <Check className="wpd-sel__check" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
