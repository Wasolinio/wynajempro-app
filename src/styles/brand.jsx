import React from 'react';

/*
  Wspólny arkusz identyfikacji WynajemPRO v2 dla stron publicznych i ekranów pobocznych
  (regulamin, prywatność, kontakt, blog/baza wiedzy, reset hasła, akcje e-mail,
   paywall, uzupełnienie profilu). Namespace `.wpb`.

  Renderowany poza zakresem .wp4 (landing) / .wpd (panel), więc jest samowystarczalny:
  własne tokeny + fonty. Użycie: <div className="wpb"><BrandStyles/> …treść… </div>
*/
export const BRAND_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700;800&family=Newsreader:ital,wght@1,400;1,500&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

.wpb{
  --paper:#F3EFE5; --surface:#FBFAF6; --ink:#17150F;
  --cynober:#D9492B; --cynober-hover:#C23E22;
  --green:#2F6B53; --granat:#234B7A; --amber:#C99A2E;
  --hairline:#DDD5C3; --inner:#EFE9DA; --inner-2:#E0D8C6;
  --tint-cynober:#F6E5DF; --tint-green:#E7EDE7; --tint-granat:#E4EAF1;
  /* --faint/--label: minimum 4.5:1 (WCAG AA) na --paper dla mikro-etykiet */
  --muted:#524C3F; --faint:#716951; --label:#746C54;

  min-height:100vh; background:var(--paper); color:var(--ink);
  font-family:'Schibsted Grotesk', system-ui, sans-serif;
  -webkit-font-smoothing:antialiased; line-height:1.55;
}
.wpb *{ box-sizing:border-box; }
.wpb ::selection{ background:var(--tint-cynober); }
.wpb svg{ stroke-width:1.75; }

/* ── Topbar ── */
.wpb-topbar{ position:sticky; top:0; z-index:40; background:rgba(243,239,229,.9);
  backdrop-filter:blur(8px); border-bottom:1px solid var(--hairline); }
.wpb-topbar__in{ max-width:1080px; margin:0 auto; height:66px; padding:0 28px;
  display:flex; align-items:center; justify-content:space-between; gap:16px; }
.wpb-logo{ display:inline-flex; align-items:center; gap:8px; text-decoration:none; }
.wpb-logo__word{ font-weight:800; font-size:18px; letter-spacing:-.02em; color:var(--ink); }
.wpb-logo__pro{ font-family:'IBM Plex Mono', monospace; font-weight:600; font-size:10px;
  letter-spacing:.10em; color:#fff; background:var(--cynober); border-radius:3px; padding:3px 6px; }
.wpb-topbar__nav{ display:flex; align-items:center; gap:22px; }
.wpb-back{ display:inline-flex; align-items:center; gap:7px; color:var(--muted); text-decoration:none;
  font-weight:500; font-size:14px; transition:color .15s; }
.wpb-back:hover{ color:var(--ink); }
.wpb-back svg{ width:15px; height:15px; }

/* ── Layout treści ── */
.wpb-container{ max-width:1080px; margin:0 auto; padding:56px 28px 72px; }
.wpb-narrow{ max-width:760px; }
.wpb-head{ margin-bottom:36px; }
.wpb-head--center{ text-align:center; }
.wpb-footer{ border-top:1px solid var(--hairline); background:var(--surface); padding:26px;
  text-align:center; font-family:'IBM Plex Mono', monospace; font-size:11px; letter-spacing:.04em;
  color:var(--faint); }

/* ── Typografia ── */
.wpb-label{ font-family:'IBM Plex Mono', monospace; font-weight:500; font-size:11px;
  letter-spacing:.10em; text-transform:uppercase; color:var(--label); display:inline-block; }
.wpb-display{ font-weight:800; font-size:44px; line-height:1.06; letter-spacing:-.03em; margin:14px 0 0; }
.wpb-display em, .wpb-h1 em, .wpb-h2 em{ font-family:'Newsreader', serif; font-style:italic; font-weight:400; }
.wpb-h1{ font-weight:700; font-size:34px; line-height:1.1; letter-spacing:-.03em; margin:12px 0 0; }
.wpb-h2{ font-weight:700; font-size:22px; line-height:1.2; letter-spacing:-.02em; margin:0; }
.wpb-body{ font-size:15px; line-height:1.6; color:var(--muted); }
.wpb-mono{ font-family:'IBM Plex Mono', monospace; font-variant-numeric:tabular-nums; }
.wpb-lead{ font-size:18px; line-height:1.6; color:var(--muted); margin:14px 0 0; }
.wpb-meta{ font-family:'IBM Plex Mono', monospace; font-size:12px; color:var(--faint); margin:12px 0 0; }
.wpb-accent{ color:var(--cynober); }

/* ── Karty / panele ── */
.wpb-card{ background:var(--surface); border:1px solid var(--hairline); border-radius:4px; padding:32px; }
.wpb-hr{ height:1px; background:var(--hairline); border:0; margin:0; }

/* ── Proza (regulamin / prywatność / wpis blog) ── */
.wpb-prose{ color:var(--muted); font-size:15.5px; line-height:1.7; }
.wpb-prose section + section{ margin-top:28px; }
.wpb-prose h2{ font-family:'Schibsted Grotesk', sans-serif; font-weight:700; font-size:19px;
  letter-spacing:-.01em; color:var(--ink); margin:0 0 12px; }
.wpb-prose h3{ font-weight:700; font-size:16px; color:var(--ink); margin:22px 0 8px; }
.wpb-prose p{ margin:0 0 12px; }
/* Preflight Tailwinda zeruje list-style globalnie, więc punktory i numery przywracamy
   tutaj jawnie — bez tego instrukcje „krok po kroku" traciły numerację, a reguła
   li::marker niżej nie miała czego kolorować. */
.wpb-prose ul, .wpb-prose ol{ margin:0 0 12px; padding-left:22px; }
.wpb-prose ul{ list-style:disc outside; }
.wpb-prose ol{ list-style:decimal outside; }
.wpb-prose li{ margin:0 0 7px; }
.wpb-prose li::marker{ color:var(--cynober); }
.wpb-prose strong{ color:var(--ink); font-weight:600; }
.wpb-prose a{ color:var(--cynober); font-weight:600; text-decoration:none; border-bottom:1px solid transparent; }
.wpb-prose a:hover{ border-color:var(--cynober); }

/* ── Przyciski ── */
.wpb-btn{ display:inline-flex; align-items:center; justify-content:center; gap:8px; height:46px; padding:0 22px;
  font-family:inherit; font-weight:600; font-size:15px; border-radius:3px; border:1px solid var(--hairline);
  background:var(--surface); color:var(--ink); cursor:pointer; text-decoration:none; white-space:nowrap;
  transition:background .15s, border-color .15s, color .15s, transform .15s cubic-bezier(.22,1,.36,1); }
.wpb-btn svg{ width:16px; height:16px; }
.wpb-btn:hover{ border-color:var(--ink); }
.wpb-btn:active:not(:disabled){ transform:scale(.98); }
.wpb :is(button, a, [role="button"]):focus-visible{ outline:2px solid var(--cynober); outline-offset:2px; }
.wpb-btn--primary{ background:var(--cynober); border-color:var(--cynober); color:#fff; }
.wpb-btn--primary:hover{ background:var(--cynober-hover); border-color:var(--cynober-hover); }
.wpb-btn--block{ width:100%; }
.wpb-btn:disabled{ opacity:.55; cursor:default; }
.wpb-link{ color:var(--cynober); font-weight:600; text-decoration:none; border-bottom:1px solid transparent;
  transition:border-color .15s; }
.wpb-link:hover{ border-color:var(--cynober); }

/* ── Formularze ── */
.wpb-field{ margin-bottom:16px; }
.wpb-flabel{ display:block; font-family:'IBM Plex Mono', monospace; font-size:11px; font-weight:500;
  letter-spacing:.07em; text-transform:uppercase; color:var(--label); margin-bottom:7px; }
.wpb-input, .wpb-textarea, .wpb-select{ width:100%; padding:12px 14px; background:var(--paper);
  border:1px solid var(--hairline); border-radius:3px; font-family:inherit; font-size:15px; color:var(--ink);
  outline:none; transition:border-color .15s; }
.wpb-input:focus, .wpb-textarea:focus, .wpb-select:focus{ border-color:var(--ink); background:#fff; }
.wpb-input::placeholder, .wpb-textarea::placeholder{ color:var(--faint); }
.wpb-textarea{ resize:vertical; min-height:120px; }

/* ── Centralny panel (auth / paywall / profil) ── */
.wpb-center{ min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; }
.wpb-panel{ width:100%; max-width:440px; background:var(--surface); border:1px solid var(--hairline);
  border-radius:4px; padding:34px; }
.wpb-panel--wide{ max-width:560px; }
.wpb-ic{ width:46px; height:46px; border-radius:3px; border:1px solid var(--hairline); background:var(--paper);
  display:flex; align-items:center; justify-content:center; color:var(--cynober); }
.wpb-ic svg{ width:22px; height:22px; }
.wpb-ic--green{ color:var(--green); }
.wpb-ic--granat{ color:var(--granat); }

/* ── Notki / alerty ── */
.wpb-note{ border:1px solid var(--hairline); border-radius:4px; padding:13px 15px; font-size:13.5px;
  line-height:1.55; color:var(--muted); }
.wpb-note--info{ background:var(--tint-granat); border-color:#C9D3E0; color:#27405c; }
.wpb-note--ok{ background:var(--tint-green); border-color:#D7E2DA; color:var(--green); }
.wpb-note--err{ background:var(--tint-cynober); border-color:#EBD3CB; color:#7a2e1c; }
.wpb-tag{ display:inline-flex; align-items:center; gap:5px; font-family:'IBM Plex Mono', monospace;
  font-weight:500; font-size:10.5px; letter-spacing:.05em; text-transform:uppercase; padding:4px 9px;
  border-radius:3px; border:1px solid var(--hairline); color:var(--muted); }

/* ── Karty bloga ── */
.wpb-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:22px; }
.wpb-post{ display:flex; flex-direction:column; background:var(--surface); border:1px solid var(--hairline);
  border-radius:4px; overflow:hidden; text-decoration:none; color:inherit; transition:border-color .15s; }
.wpb-post:hover{ border-color:var(--ink); }
.wpb-post__cover{ height:150px; border-bottom:1px solid var(--hairline);
  background-color:var(--inner);
  background-image:linear-gradient(var(--inner-2) 1px, transparent 1px), linear-gradient(90deg, var(--inner-2) 1px, transparent 1px);
  background-size:16px 16px; }
.wpb-post__cover img{ width:100%; height:100%; object-fit:cover; }
.wpb-post__body{ padding:18px 20px; display:flex; flex-direction:column; gap:8px; flex:1; }
.wpb-post__title{ font-weight:700; font-size:17px; letter-spacing:-.01em; line-height:1.25; }
.wpb-post__excerpt{ font-size:13.5px; color:var(--muted); line-height:1.5; flex:1; }
.wpb-post__more{ font-family:'IBM Plex Mono', monospace; font-size:12px; letter-spacing:.05em;
  text-transform:uppercase; color:var(--cynober); margin-top:4px; }

/* ── Spinner ── */
.wpb-spin{ width:32px; height:32px; border:2px solid var(--hairline); border-top-color:var(--cynober);
  border-radius:50%; animation:wpb-spin .8s linear infinite; }
@keyframes wpb-spin{ to{ transform:rotate(360deg); } }
@media (prefers-reduced-motion: reduce){ .wpb-spin{ animation-duration:2s; } }

/* ── Responsywność ── */
@media (max-width:820px){
  .wpb-grid{ grid-template-columns:1fr; }
  .wpb-display{ font-size:34px; }
  .wpb-container{ padding:40px 18px 56px; }
  .wpb-card{ padding:22px; }
  .wpb-topbar__in{ padding:0 18px; }
  .wpb-back span{ display:none; }
}
`;

export function BrandStyles() {
  return <style>{BRAND_CSS}</style>;
}
