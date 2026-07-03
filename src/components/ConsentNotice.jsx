import React, { useState } from 'react';
import { Cookie, X } from 'lucide-react';
import { Link } from 'react-router-dom';

/*
  Baner zgody na cookies — identyfikacja WynajemPRO v2.
  Renderowany na poziomie <App/> (poza zakresem .wp4/.wpd), więc ma własny,
  samowystarczalny namespace `.wpc` z tokenami marki. Logika bez zmian:
  zgoda zapisywana w localStorage('cookie_consent'); X zamyka bez zgody.
*/
export default function CookieBanner({ onAccept }) {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !localStorage.getItem('cookie_consent');
  });

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true');
    setIsVisible(false);
    if (onAccept) onAccept();
  };

  if (!isVisible) return null;

  return (
    <div className="wpc">
      <style>{CSS}</style>
      <div className="wpc-bar">
        <span className="wpc-ic"><Cookie /></span>

        <div className="wpc-body">
          <span className="wpc-label">Prywatność</span>
          <h3 className="wpc-title">Szanujemy Twoją prywatność</h3>
          <p className="wpc-text">
            Używamy plików cookies, aby zapewnić najlepsze doświadczenia, analizować ruch na stronie
            i dostosowywać komunikaty. Klikając „Akceptuję”, zgadzasz się na cookies (w tym Google Analytics).
            Szczegóły w <Link to="/prywatnosc" className="wpc-link">Polityce Prywatności</Link>.
          </p>
        </div>

        <div className="wpc-actions">
          <button type="button" className="wpc-btn wpc-btn--ghost" onClick={() => setIsVisible(false)}>
            Tylko niezbędne
          </button>
          <button type="button" className="wpc-btn wpc-btn--primary" onClick={handleAccept}>
            Akceptuję
          </button>
        </div>

        <button type="button" className="wpc-close" onClick={() => setIsVisible(false)} title="Zamknij" aria-label="Zamknij">
          <X />
        </button>
      </div>
    </div>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap');

.wpc{
  --paper:#F3EFE5; --surface:#FBFAF6; --ink:#17150F;
  --cynober:#D9492B; --cynober-hover:#C23E22;
  --hairline:#DDD5C3; --muted:#524C3F; --label:#746C54;
  position:fixed; left:0; right:0; bottom:0; z-index:90; padding:18px;
  font-family:'Schibsted Grotesk', system-ui, sans-serif;
  animation:wpc-up .4s cubic-bezier(.22,1,.36,1);
}
@keyframes wpc-up{ from{ transform:translateY(14px); opacity:0; } to{ transform:translateY(0); opacity:1; } }
.wpc *{ box-sizing:border-box; }

.wpc-bar{
  max-width:1080px; margin:0 auto; position:relative;
  background:var(--surface); border:1px solid var(--ink); border-radius:4px;
  display:flex; align-items:center; gap:20px; padding:18px 22px;
}
.wpc-ic{
  flex:0 0 42px; width:42px; height:42px; border-radius:3px;
  border:1px solid var(--hairline); background:var(--paper);
  display:flex; align-items:center; justify-content:center; color:var(--cynober);
}
.wpc-ic svg{ width:21px; height:21px; stroke-width:1.75; }

.wpc-body{ flex:1 1 auto; min-width:0; padding-right:8px; }
.wpc-label{
  font-family:'IBM Plex Mono', monospace; font-weight:500; font-size:10px;
  letter-spacing:.12em; text-transform:uppercase; color:var(--label);
}
.wpc-title{ font-weight:700; font-size:16px; letter-spacing:-.01em; color:var(--ink); margin:3px 0 5px; }
.wpc-text{ font-size:13.5px; line-height:1.55; color:var(--muted); margin:0; max-width:64ch; }
.wpc-link{
  color:var(--cynober); font-weight:600; text-decoration:none;
  border-bottom:1px solid transparent; transition:border-color .15s;
}
.wpc-link:hover{ border-color:var(--cynober); }

.wpc-actions{ display:flex; align-items:center; gap:10px; flex:0 0 auto; }
.wpc-btn{
  display:inline-flex; align-items:center; justify-content:center; height:42px; padding:0 20px;
  font-family:inherit; font-weight:600; font-size:14px; border-radius:3px; cursor:pointer;
  border:1px solid transparent; white-space:nowrap;
  transition:background .15s, border-color .15s, color .15s, transform .15s cubic-bezier(.22,1,.36,1);
}
.wpc-btn:active{ transform:scale(.98); }
.wpc :is(button, a):focus-visible{ outline:2px solid var(--cynober); outline-offset:2px; }
.wpc-btn--primary{ background:var(--cynober); color:#fff; border-color:var(--cynober); }
.wpc-btn--primary:hover{ background:var(--cynober-hover); border-color:var(--cynober-hover); }
.wpc-btn--ghost{ background:transparent; color:var(--ink); border-color:var(--hairline); }
.wpc-btn--ghost:hover{ border-color:var(--ink); }

.wpc-close{
  position:absolute; top:12px; right:12px; width:30px; height:30px; border-radius:3px;
  border:1px solid transparent; background:transparent; color:var(--label); cursor:pointer;
  display:flex; align-items:center; justify-content:center; transition:color .15s, border-color .15s;
}
.wpc-close svg{ width:16px; height:16px; stroke-width:1.75; }
.wpc-close:hover{ color:var(--ink); border-color:var(--hairline); }

@media (max-width:760px){
  .wpc{ padding:12px; }
  .wpc-bar{ flex-direction:column; align-items:flex-start; gap:14px; padding:18px; }
  .wpc-ic{ display:none; }
  .wpc-actions{ width:100%; }
  .wpc-btn{ flex:1; }
  .wpc-text{ padding-right:24px; }
}
`;
