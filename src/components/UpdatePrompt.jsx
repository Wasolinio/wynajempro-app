import React, { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';
import { useRegisterSW } from 'virtual:pwa-register/react';

/*
  Pasek „dostępna nowa wersja" — [[Known-Issues]] #15.

  Problem: przy `registerType:'autoUpdate'` nowy service worker instalował się w tle, ale
  przejmował stronę dopiero przy KOLEJNYM wejściu — użytkownik po deployu przez jakiś czas
  pracował na starym kodzie i nikt go o tym nie informował (zaobserwowane 2026-08-10:
  `curl` dostawał już nowy `index.html`, przeglądarka serwowała stary).

  Rozwiązanie (decyzja właściciela 2026-08-13): `registerType:'prompt'` + ten pasek.
  Przeładowanie następuje WYŁĄCZNIE po kliknięciu — automatyczne `skipWaiting` mogłoby
  wypaść w środku wypełniania rezerwacji i skasować niezapisane dane.

  Samowystarczalny namespace `.wpu` z tokenami marki (jak `.wpc` w ConsentNotice),
  bo renderuje się poza zakresem `.wp4` / `.wpd`.
*/

// Co godzinę pytamy serwer o nową wersję. Bez tego długo otwarta karta panelu
// dowiaduje się o deployu dopiero przy odświeżeniu — czyli dokładnie wtedy, gdy
// pasek przestaje być potrzebny.
const SPRAWDZAJ_CO_MS = 60 * 60 * 1000;

export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      setInterval(() => { registration.update(); }, SPRAWDZAJ_CO_MS);
    },
  });

  // Szew diagnostyczny: w trybie deweloperskim service worker nie jest rejestrowany,
  // więc paska nie da się zobaczyć ani przetestować bez wymuszenia. Zdarzenie `wpu:show`
  // pokazuje go na żądanie (ten sam idiom co `wpc:open`); w produkcji nieszkodliwe —
  // najgorsze, co robi, to proponuje odświeżenie strony.
  const [wymuszony, setWymuszony] = useState(false);
  useEffect(() => {
    const show = () => setWymuszony(true);
    window.addEventListener('wpu:show', show);
    return () => window.removeEventListener('wpu:show', show);
  }, []);

  if (!needRefresh && !wymuszony) return null;

  const zamknij = () => { setNeedRefresh(false); setWymuszony(false); };

  return (
    <div className="wpu" role="status" aria-live="polite">
      <style>{CSS}</style>
      <div className="wpu-bar">
        <span className="wpu-ic"><RefreshCw /></span>
        <p className="wpu-text">
          <strong>Dostępna nowa wersja aplikacji.</strong> Odśwież, żeby z niej korzystać.
        </p>
        <button type="button" className="wpu-btn" onClick={() => updateServiceWorker(true)}>
          Odśwież
        </button>
        <button type="button" className="wpu-close" onClick={zamknij} title="Zamknij" aria-label="Zamknij">
          <X />
        </button>
      </div>
    </div>
  );
}

const CSS = `
.wpu{
  --surface:#FBFAF6; --ink:#17150F; --paper:#F3EFE5;
  --cynober:#D9492B; --cynober-hover:#C23E22; --hairline:#DDD5C3; --muted:#524C3F;
  position:fixed; left:0; right:0; top:0; z-index:95; padding:14px;
  display:flex; justify-content:center; pointer-events:none;
  font-family:'Schibsted Grotesk', system-ui, sans-serif;
  animation:wpu-down .35s cubic-bezier(.22,1,.36,1);
}
@keyframes wpu-down{ from{ transform:translateY(-12px); opacity:0; } to{ transform:translateY(0); opacity:1; } }
@media (prefers-reduced-motion: reduce){ .wpu{ animation:none; } }
.wpu *{ box-sizing:border-box; }

.wpu-bar{
  pointer-events:auto; max-width:640px; width:100%;
  background:var(--surface); border:1px solid var(--ink); border-radius:4px;
  display:flex; align-items:center; gap:14px; padding:12px 14px;
}
.wpu-ic{
  flex:0 0 34px; width:34px; height:34px; border-radius:3px;
  border:1px solid var(--hairline); background:var(--paper);
  display:flex; align-items:center; justify-content:center; color:var(--cynober);
}
.wpu-ic svg{ width:17px; height:17px; stroke-width:1.75; }

.wpu-text{ flex:1 1 auto; min-width:0; margin:0; font-size:13.5px; line-height:1.5; color:var(--muted); }
.wpu-text strong{ color:var(--ink); font-weight:600; }

.wpu-btn{
  flex:0 0 auto; display:inline-flex; align-items:center; justify-content:center;
  height:36px; padding:0 16px; font-family:inherit; font-weight:600; font-size:14px;
  border-radius:3px; cursor:pointer; white-space:nowrap;
  background:var(--cynober); color:#fff; border:1px solid var(--cynober);
  transition:background .15s, border-color .15s, transform .15s cubic-bezier(.22,1,.36,1);
}
.wpu-btn:hover{ background:var(--cynober-hover); border-color:var(--cynober-hover); }
.wpu-btn:active{ transform:scale(.98); }
.wpu button:focus-visible{ outline:2px solid var(--cynober); outline-offset:2px; }

.wpu-close{
  flex:0 0 auto; width:30px; height:30px; border-radius:3px;
  border:1px solid transparent; background:transparent; color:var(--muted); cursor:pointer;
  display:flex; align-items:center; justify-content:center; transition:color .15s, border-color .15s;
}
.wpu-close svg{ width:16px; height:16px; stroke-width:1.75; }
.wpu-close:hover{ color:var(--ink); border-color:var(--hairline); }

@media (max-width:560px){
  .wpu{ padding:10px; }
  .wpu-ic{ display:none; }
  .wpu-text{ font-size:13px; }
}
`;
