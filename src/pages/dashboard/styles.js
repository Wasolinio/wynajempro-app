/*
  System designu dashboardu WynajemPRO — namespace `.wpd`.
  Wzorzec: "Aplikacja v2" z identyfikacji WynajemPRO (NIE wczesny mockup "Kluczyk").
  Ciemny sidebar (ink) + jasna powierzchnia robocza (paper). Struktura na liniach 1px,
  zero cieni/gradientów/emoji. Radius 3px (kontrolki) / 4px (panele).
  Fonty: Schibsted Grotesk (UI/nagłówki), Newsreader italic (akcenty), IBM Plex Mono (liczby/etykiety).
*/
export const DASHBOARD_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:wght@400;500;600;700;800&family=Newsreader:ital,wght@1,400;1,500&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

.wpd{
  --paper:#F3EFE5; --surface:#FBFAF6; --ink:#17150F;
  --cynober:#D9492B; --cynober-hover:#C23E22; --brick:#A2553F;
  --green:#2F6B53; --green-dot:#5FB389; --granat:#234B7A; --amber:#C99A2E;
  --hairline:#DDD5C3; --inner:#EFE9DA; --inner-2:#E0D8C6;
  --tint-cynober:#F6E5DF; --tint-green:#E7EDE7; --tint-amber:#FBF1D9; --tint-granat:#E4EAF1;
  /* --faint/--label/--amber-ink: minimum 4.5:1 (WCAG AA) na --paper dla mikro-etykiet */
  --muted:#524C3F; --faint:#716951; --label:#746C54; --amber-ink:#7E6119;
  /* ciemny sidebar */
  --side:#17150F; --side-2:#221F17; --side-active:#2C2920; --side-line:#2C2920;
  --on-side:#E4DDCE; --on-side-faint:#8C8576; --on-side-label:#6B6555;

  background:var(--paper); color:var(--ink);
  font-family:'Schibsted Grotesk', system-ui, sans-serif;
  -webkit-font-smoothing:antialiased; line-height:1.5;
  min-height:100vh;
}
.wpd *{ box-sizing:border-box; }
.wpd ::selection{ background:var(--tint-cynober); }
/* delikatniejszy stroke ikon — spójny z estetyką cienkich linii brand booka */
.wpd svg{ stroke-width:1.75; }
.wpd-mono{ font-family:'IBM Plex Mono', monospace; font-variant-numeric:tabular-nums; }
.wpd-serif{ font-family:'Newsreader', serif; font-style:italic; font-weight:400; }

/* ── Layout ── */
.wpd-shell{ display:flex; min-height:100vh; }
.wpd-main{ flex:1 1 auto; min-width:0; display:flex; flex-direction:column; }
.wpd-content{ padding:26px 34px 72px; max-width:1240px; width:100%; margin:0 auto; }
.wpd-section{ margin-top:22px; }
.wpd-grid-2{ display:grid; grid-template-columns:1.45fr 1fr; gap:20px; }
.wpd-label{
  font-family:'IBM Plex Mono', monospace; font-weight:500; font-size:10.5px;
  letter-spacing:.10em; text-transform:uppercase; color:var(--label);
}

/* ── Sidebar (ciemny) ── */
.wpd-side{
  flex:0 0 240px; width:240px; background:var(--side); color:var(--on-side);
  position:sticky; top:0; height:100vh; display:flex; flex-direction:column;
}
.wpd-side__brand{ display:flex; align-items:center; gap:9px; height:72px; padding:0 24px; }
.wpd-logo__word{ font-weight:800; font-size:19px; letter-spacing:-.02em; color:#fff; }
.wpd-logo__pro{
  font-family:'IBM Plex Mono', monospace; font-weight:600; font-size:10px;
  letter-spacing:.10em; color:#fff; background:var(--cynober); border-radius:3px; padding:3px 6px;
}
.wpd-nav{ display:flex; flex-direction:column; padding:14px 0 0; }
.wpd-nav__item{
  display:flex; align-items:center; gap:13px; width:100%; text-align:left;
  padding:11px 24px; border:none; background:transparent; border-left:2px solid transparent;
  color:var(--on-side-faint); font-family:inherit; font-weight:500; font-size:15px;
  cursor:pointer; transition:background .14s, color .14s;
}
.wpd-nav__item:hover{ background:var(--side-2); color:var(--on-side); }
.wpd-nav__item--active{ background:var(--side-active); color:#fff; border-left-color:var(--cynober); }
.wpd-nav__item--active:hover{ background:var(--side-active); }
.wpd-nav__num{
  font-family:'IBM Plex Mono', monospace; font-size:11px; font-weight:500;
  color:var(--on-side-label); width:16px; flex:0 0 16px;
}
.wpd-nav__item--active .wpd-nav__num{ color:var(--cynober); }

/* sekcja synchronizacji */
.wpd-sync{ margin-top:auto; padding:18px 24px; }
.wpd-sync__title{ font-family:'IBM Plex Mono', monospace; font-size:9.5px; letter-spacing:.12em;
  text-transform:uppercase; color:var(--on-side-label); margin:0 0 12px; }
.wpd-sync__row{ display:flex; align-items:center; gap:9px; padding:5px 0; }
.wpd-sync__dot{ width:7px; height:7px; border-radius:2px; flex:0 0 7px; }
.wpd-sync__name{ font-size:13px; color:var(--on-side); }
.wpd-sync__time{ margin-left:auto; font-family:'IBM Plex Mono', monospace; font-size:10.5px; color:var(--on-side-faint); }

/* karta użytkownika */
.wpd-user{ display:flex; align-items:center; gap:11px; padding:16px 22px;
  border-top:1px solid var(--side-line); }
.wpd-user__av{ width:34px; height:34px; border-radius:3px; background:var(--cynober); color:#fff;
  display:flex; align-items:center; justify-content:center; font-family:'IBM Plex Mono', monospace;
  font-size:12px; font-weight:600; flex:0 0 34px; }
.wpd-user__name{ font-size:13.5px; font-weight:600; color:#fff; }
.wpd-user__plan{ font-family:'IBM Plex Mono', monospace; font-size:9.5px; letter-spacing:.08em;
  text-transform:uppercase; color:var(--on-side-faint); margin-top:1px; }
.wpd-user__out{ margin-left:auto; background:none; border:none; cursor:pointer; color:var(--on-side-faint);
  display:flex; padding:4px; transition:color .14s; }
.wpd-user__out:hover{ color:var(--cynober); }
.wpd-user__out svg{ width:17px; height:17px; }
/* klik w tożsamość otwiera Konto (X6) */
.wpd-user__btn{ display:flex; align-items:center; gap:11px; flex:1 1 auto; min-width:0;
  background:none; border:none; padding:6px; margin:-6px; border-radius:3px;
  cursor:pointer; color:inherit; font:inherit; text-align:left; }
.wpd-user__btn:hover .wpd-user__name{ color:#fff; }

/* ── Topbar ── */
.wpd-top{
  position:sticky; top:0; z-index:40; background:rgba(243,239,229,.9);
  backdrop-filter:blur(8px); border-bottom:1px solid var(--hairline);
  display:flex; align-items:center; gap:18px; min-height:72px; padding:0 34px;
}
.wpd-top__title h1{ font-weight:700; font-size:25px; letter-spacing:-.03em; margin:0; line-height:1.1; }
.wpd-top__sub{ font-family:'IBM Plex Mono', monospace; font-size:10.5px; letter-spacing:.07em;
  text-transform:uppercase; color:var(--faint); margin:4px 0 0; }
.wpd-top__spacer{ flex:1 1 auto; }
.wpd-search{
  display:flex; align-items:center; gap:9px; background:var(--surface);
  border:1px solid var(--hairline); border-radius:3px; height:40px; padding:0 13px; width:230px;
  transition:border-color .14s;
}
.wpd-search:focus-within{ border-color:var(--ink); }
.wpd-search svg{ width:15px; height:15px; color:var(--faint); flex:0 0 15px; }
.wpd-search input{ border:none; background:transparent; outline:none; font-family:inherit;
  font-size:14px; color:var(--ink); width:100%; }
.wpd-search input::placeholder{ color:var(--faint); }

/* ── Przyciski ── */
.wpd-btn{
  display:inline-flex; align-items:center; gap:8px; justify-content:center;
  font-family:inherit; font-weight:600; font-size:14px; height:40px; padding:0 16px;
  border-radius:3px; border:1px solid var(--hairline); background:var(--surface);
  color:var(--ink); cursor:pointer; text-decoration:none; white-space:nowrap;
  transition:background .14s, border-color .14s, color .14s, transform .14s cubic-bezier(.22,1,.36,1);
}
.wpd-btn svg{ width:16px; height:16px; flex:0 0 16px; }
.wpd-btn:hover{ border-color:var(--ink); }
.wpd-btn:active:not(:disabled){ transform:scale(.97); }
.wpd-btn--primary{ background:var(--cynober); border-color:var(--cynober); color:#fff; }
.wpd-btn--primary:hover{ background:var(--cynober-hover); border-color:var(--cynober-hover); }
.wpd-btn--sm{ height:34px; padding:0 12px; font-size:13px; gap:6px; }
.wpd-btn--sm svg{ width:14px; height:14px; flex:0 0 14px; }
.wpd-btn--block{ width:100%; }
.wpd-btn:disabled{ opacity:.5; cursor:default; }
.wpd-btn--danger:hover{ border-color:var(--cynober); color:var(--cynober); }
.wpd-iconbtn{
  display:inline-flex; align-items:center; justify-content:center; width:40px; height:40px; padding:0;
  border:1px solid var(--hairline); background:var(--surface); border-radius:3px; flex:0 0 40px;
  color:var(--muted); cursor:pointer; position:relative; transition:border-color .14s, color .14s, transform .14s cubic-bezier(.22,1,.36,1);
}
.wpd-iconbtn svg{ width:17px; height:17px; }
.wpd-iconbtn:hover{ border-color:var(--ink); color:var(--ink); }
.wpd-iconbtn:active:not(:disabled){ transform:scale(.97); }
.wpd :is(button, a, [role="button"]):focus-visible{ outline:2px solid var(--cynober); outline-offset:2px; }
.wpd-iconbtn__dot{ position:absolute; top:7px; right:8px; width:6px; height:6px; border-radius:50%;
  background:var(--cynober); }
.wpd-iconbtn__badge{ position:absolute; top:-7px; right:-7px; min-width:18px; height:18px; padding:0 4px;
  background:var(--cynober); color:#fff; border-radius:9px; font-family:'IBM Plex Mono', monospace;
  font-size:10px; font-weight:600; display:flex; align-items:center; justify-content:center; }
/* E6: „Dodaj do kalendarza" przy zadaniu — przycisk w skali wiersza (obok 22px checka
   pełny 40px iconbtn przygniata listę) + menu dwóch opcji. Menu jest FIXED, bo listy
   zadań żyją w kontenerach z overflow — patrz komentarz w AddToCalendarButton.jsx.
   Bez cienia (identyfikacja v2): warstwę oddziela ramka 1px w kolorze tuszu.
   z-index 75: nad dolnym paskiem mobile (70), pod modalami (80). */
.wpd-iconbtn--row{ width:26px; height:26px; flex:0 0 26px; }
.wpd-iconbtn--row svg{ width:14px; height:14px; }
.wpd-calmenu{ position:fixed; z-index:75; min-width:172px; padding:4px;
  background:var(--surface); border:1px solid var(--ink); border-radius:3px; }
.wpd-calmenu__item{ display:flex; width:100%; padding:8px 10px; border:none; background:none;
  border-radius:3px; font-family:inherit; font-size:13px; font-weight:600; color:var(--ink);
  cursor:pointer; text-decoration:none; text-align:left; }
.wpd-calmenu__item:hover{ background:var(--inner); }

/* ── Link akcentowy ── */
.wpd-alink{ font-weight:600; font-size:13px; color:var(--cynober); text-decoration:none;
  display:inline-flex; align-items:center; gap:5px; }
.wpd-alink svg{ width:14px; height:14px; }

/* ── Panele ── */
/* min-width:0 — panel bywa elementem siatki (Finanse, panel podatkowy), a element
   siatki ma domyślnie min-width:auto i rozciąga się do szerokości najszerszej treści
   zamiast ją zawinąć. Bez tego panel z siatką klucz–wartość w środku rozpychał stronę
   na telefonie o 30 px. Ten sam idiom co przy .wpd-stat, .wpd-cell i .wpd-tabs. */
.wpd-panel{ background:var(--surface); border:1px solid var(--hairline); border-radius:4px;
  min-width:0; }

/* ── Alerty synchronizacji (X26) ──
   Kolizja terminów i rezerwacje znikłe z portalu. Dwa poziomy pilności: cynober =
   dwa portale sprzedały ten sam termin (realny overbooking), bursztyn = rzecz do
   sprawdzenia. Markery to ikony liniowe, nie emoji — zasada identyfikacji v2. */
.wpd-alerts{ display:flex; flex-direction:column; gap:10px; margin-bottom:22px; }
.wpd-alert{ display:flex; gap:12px; padding:14px 16px; border-radius:4px;
  border:1px solid var(--hairline); background:var(--surface); align-items:flex-start; }
.wpd-alert--pilny{ border-color:var(--cynober); background:var(--tint-cynober); }
.wpd-alert--uwaga{ border-color:var(--amber); background:var(--tint-amber); }
.wpd-alert__ic{ flex:0 0 auto; margin-top:1px; }
.wpd-alert__ic svg{ width:17px; height:17px; }
.wpd-alert--pilny .wpd-alert__ic{ color:var(--cynober); }
.wpd-alert--uwaga .wpd-alert__ic{ color:var(--amber-ink); }
.wpd-alert__body{ flex:1 1 auto; min-width:0; }
.wpd-alert__title{ font-weight:700; font-size:14px; letter-spacing:-.01em; margin:0 0 4px; }
.wpd-alert__list{ margin:0; padding:0; list-style:none; display:flex; flex-direction:column; gap:5px; }
.wpd-alert__row{ font-size:13px; line-height:1.45; color:var(--muted); }
.wpd-alert__row b{ color:var(--ink); font-weight:600; }
.wpd-alert__when{ font-family:'IBM Plex Mono', monospace; font-size:11.5px; color:var(--faint);
  letter-spacing:.02em; }
.wpd-alert__more{ font-size:12px; color:var(--faint); margin-top:6px; }
.wpd-alert__act{ background:none; border:0; padding:0; font:inherit; font-size:13px; font-weight:600;
  color:var(--cynober); cursor:pointer; text-align:left; }
.wpd-alert__act:hover{ text-decoration:underline; }
.wpd-panel__head{ display:flex; align-items:center; gap:10px; padding:16px 20px;
  border-bottom:1px solid var(--hairline); }
.wpd-h2{ font-weight:700; font-size:17px; letter-spacing:-.02em; margin:0; }
.wpd-hairline{ height:1px; background:var(--hairline); border:0; margin:0; }

/* ── Karty statystyk ── */
.wpd-stats{ display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
/* min-width:0 — element siatki ma domyślnie min-width:auto, więc dłuższy tekst w karcie
   rozpycha kolumnę zamiast się zawinąć. Na telefonie dawało to stronę szerszą niż okno. */
.wpd-stat{ background:var(--surface); border:1px solid var(--hairline); border-radius:4px;
  padding:18px 20px 20px; min-height:128px; display:flex; flex-direction:column; cursor:pointer;
  min-width:0; transition:border-color .14s; }
.wpd-stat__label, .wpd-stat__value, .wpd-stat__sub{ overflow-wrap:anywhere; }
.wpd-stat:hover{ border-color:var(--ink); }
.wpd-stat__head{ display:flex; align-items:flex-start; justify-content:space-between; gap:10px; margin-bottom:14px; }
.wpd-stat__head .wpd-stat__label{ margin:0; }
.wpd-stat__ic{ color:var(--faint); flex:0 0 auto; line-height:0; }
.wpd-stat__ic svg{ width:18px; height:18px; }
.wpd-stat--dark .wpd-stat__ic{ color:var(--on-side-faint); }
.wpd-stat__label{ font-family:'IBM Plex Mono', monospace; font-size:10px; letter-spacing:.08em;
  text-transform:uppercase; color:var(--label); margin:0 0 14px; line-height:1.4; }
.wpd-stat__value{ font-weight:800; font-size:30px; letter-spacing:-.02em; color:var(--ink); line-height:1.05; }
.wpd-stat__value small{ font-size:17px; font-weight:700; margin-left:2px; }
/* Kolumna, nie blok. Kazde inne uzycie ma jedno dziecko, wiec wyglada tak samo — ale
   kafelek „Konta oplacone" ma dwa (MRR oraz liczba kont z dostepem) i w zwyklym bloku
   elementy span sklejaly sie w jeden ciag: „MRR 0 ZL3 Z DOSTEPEM". Ta sama pomylka co
   w .wpd-kv tego samego dnia — elementy liniowe nie rozdzielaja sie same. */
.wpd-stat__foot{ margin-top:auto; padding-top:12px; display:flex; flex-direction:column; gap:3px; }
.wpd-stat__delta{ font-family:'IBM Plex Mono', monospace; font-size:11px; color:var(--cynober);
  letter-spacing:.03em; text-transform:uppercase; }
.wpd-stat__delta--up{ color:var(--green); }
.wpd-stat__sub{ font-family:'IBM Plex Mono', monospace; font-size:11px; color:var(--faint);
  letter-spacing:.03em; text-transform:uppercase; }
.wpd-stat__sub--accent{ color:var(--cynober); }
.wpd-stat--dark{ background:var(--ink); border-color:var(--ink); }
.wpd-stat--dark .wpd-stat__label{ color:var(--on-side-faint); }
.wpd-stat--dark .wpd-stat__value{ color:var(--green-dot); }
/* pasek obłożenia */
.wpd-bar{ height:6px; border-radius:3px; background:var(--inner-2); overflow:hidden; margin-top:4px; }
.wpd-bar__fill{ height:100%; background:var(--cynober); border-radius:3px; }

/* ── Lista przyjazdów / zadań ── */
.wpd-list{ display:flex; flex-direction:column; }
.wpd-row{ display:flex; align-items:center; gap:13px; padding:13px 20px; border-bottom:1px solid var(--hairline); }
.wpd-row:last-child{ border-bottom:none; }
.wpd-row__tag{ font-family:'IBM Plex Mono', monospace; font-size:10px; font-weight:600; letter-spacing:.06em;
  color:var(--muted); background:var(--inner); border:1px solid var(--hairline); border-radius:3px;
  padding:7px 8px; flex:0 0 auto; }
.wpd-row__tag--out{ color:var(--cynober); background:var(--tint-cynober); border-color:#EBD3CB; }
.wpd-row__main{ flex:1 1 auto; min-width:0; }
.wpd-row__name{ font-size:14.5px; font-weight:600; color:var(--ink); }
.wpd-row__meta{ font-family:'IBM Plex Mono', monospace; font-size:10px; letter-spacing:.05em;
  text-transform:uppercase; color:var(--faint); margin-top:2px; }
.wpd-row__when{ font-size:13px; color:var(--muted); white-space:nowrap; }
.wpd-row__when b{ color:var(--green); font-weight:600; }

/* ── Tagi / źródła ── */
.wpd-tag{ display:inline-flex; align-items:center; gap:5px; font-family:'IBM Plex Mono', monospace;
  font-weight:500; font-size:10px; letter-spacing:.05em; text-transform:uppercase; padding:4px 8px;
  border-radius:3px; border:1px solid var(--hairline); color:var(--muted); white-space:nowrap; }
.wpd-tag--green{ color:var(--green); background:var(--tint-green); border-color:#D7E2DA; }
.wpd-tag--amber{ color:var(--amber-ink); background:var(--tint-amber); border-color:#EFE2C2; }
.wpd-tag--cynober{ color:var(--cynober); background:var(--tint-cynober); border-color:#EBD3CB; }
.wpd-tag--granat{ color:var(--granat); background:var(--tint-granat); border-color:#C9D3E0; }
.wpd-tag--muted{ color:var(--faint); }
.wpd-dot{ display:inline-block; width:8px; height:8px; border-radius:2px; flex:0 0 8px; }

/* ── Wykres słupkowy (ciemny panel) ── */
.wpd-chart{ background:var(--ink); border:1px solid var(--ink); border-radius:4px; padding:18px 20px; }
.wpd-chart__title{ font-family:'IBM Plex Mono', monospace; font-size:10px; letter-spacing:.08em;
  text-transform:uppercase; color:var(--on-side-faint); margin:0 0 18px; }
.wpd-chart__bars{ display:flex; align-items:flex-end; gap:10px; height:130px; }
.wpd-chart__col{ flex:1 1 0; display:flex; flex-direction:column; align-items:center; gap:8px; height:100%; justify-content:flex-end; }
.wpd-chart__bar{ width:100%; max-width:26px; background:var(--side-active); border-radius:2px 2px 0 0; min-height:3px; }
.wpd-chart__bar--hi{ background:var(--cynober); }
.wpd-chart__x{ font-family:'IBM Plex Mono', monospace; font-size:9.5px; letter-spacing:.05em;
  text-transform:uppercase; color:var(--on-side-label); }

/* wykres na jasnym tle (Finanse) */
.wpd-chartl__bars{ display:flex; align-items:flex-end; gap:7px; height:200px; }
.wpd-chartl__bar{ flex:1 1 0; background:var(--inner-2); border-radius:2px 2px 0 0; min-height:3px; }
.wpd-chartl__bar--hi{ background:var(--cynober); }

/* paski udziału (wg kanału) */
.wpd-share{ padding:6px 0; }
.wpd-share__top{ display:flex; align-items:baseline; justify-content:space-between; margin-bottom:6px; }
.wpd-share__name{ font-size:13.5px; font-weight:500; }
.wpd-share__pct{ font-family:'IBM Plex Mono', monospace; font-size:12px; font-weight:600; }
.wpd-share__bar{ height:7px; border-radius:3px; background:var(--inner-2); overflow:hidden; }
.wpd-share__fill{ height:100%; border-radius:3px; }

/* ── Tabela ── */
.wpd-table{ width:100%; border-collapse:collapse; }
.wpd-table th{ font-family:'IBM Plex Mono', monospace; font-weight:500; font-size:10px;
  letter-spacing:.06em; text-transform:uppercase; color:var(--label); text-align:left;
  padding:12px 16px; border-bottom:1px solid var(--hairline); white-space:nowrap; }
.wpd-table th.wpd-num, .wpd-table td.wpd-num{ text-align:right; }
.wpd-table td{ padding:13px 16px; border-bottom:1px solid var(--hairline); font-size:13.5px;
  color:var(--ink); vertical-align:middle; }
.wpd-table tr:last-child td{ border-bottom:none; }
.wpd-table tbody tr{ transition:background .12s; }
.wpd-table tbody tr:hover{ background:var(--inner); }
.wpd-table__sort{ background:none; border:none; cursor:pointer; display:inline-flex; align-items:center;
  gap:4px; font-family:'IBM Plex Mono', monospace; font-size:10px; letter-spacing:.06em;
  text-transform:uppercase; color:var(--label); }
.wpd-table__sort svg{ width:12px; height:12px; }
.wpd-cell-strong{ font-weight:600; }
.wpd-cell-sub{ font-family:'IBM Plex Mono', monospace; font-size:10.5px; color:var(--faint); margin-top:2px; }
.wpd-cell-num{ font-family:'IBM Plex Mono', monospace; font-variant-numeric:tabular-nums; }

/* ── Karty obiektów ── */
.wpd-objs{ display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
.wpd-obj{ background:var(--surface); border:1px solid var(--hairline); border-radius:4px; overflow:hidden; }
.wpd-obj__photo{ position:relative; height:128px; border-bottom:1px solid var(--hairline);
  background-color:var(--inner);
  background-image:linear-gradient(var(--inner-2) 1px, transparent 1px), linear-gradient(90deg, var(--inner-2) 1px, transparent 1px);
  background-size:16px 16px; display:flex; align-items:flex-start; justify-content:space-between; padding:12px; }
.wpd-obj__fot{ font-family:'IBM Plex Mono', monospace; font-size:9.5px; letter-spacing:.08em;
  text-transform:uppercase; color:var(--muted); background:var(--surface); border:1px solid var(--hairline);
  border-radius:3px; padding:4px 7px; }
.wpd-obj__type{ font-family:'IBM Plex Mono', monospace; font-size:9.5px; letter-spacing:.06em;
  text-transform:uppercase; color:var(--faint); position:absolute; left:12px; bottom:10px; }
.wpd-obj__body{ padding:16px 18px; }
.wpd-obj__name{ font-weight:700; font-size:17px; letter-spacing:-.02em; margin:0 0 4px; }
.wpd-obj__addr{ font-family:'IBM Plex Mono', monospace; font-size:10px; letter-spacing:.05em;
  text-transform:uppercase; color:var(--faint); }
.wpd-obj__metrics{ display:flex; gap:28px; margin-top:16px; padding-top:14px; border-top:1px solid var(--hairline); }
.wpd-obj__mlabel{ font-family:'IBM Plex Mono', monospace; font-size:9.5px; letter-spacing:.06em;
  text-transform:uppercase; color:var(--label); }
.wpd-obj__mval{ font-weight:700; font-size:18px; margin-top:3px; }
.wpd-obj__mval small{ font-size:12px; font-weight:600; color:var(--faint); }
.wpd-obj__status{ display:inline-flex; align-items:center; gap:6px; font-family:'IBM Plex Mono', monospace;
  font-size:9.5px; letter-spacing:.06em; text-transform:uppercase; color:var(--green);
  background:var(--surface); border:1px solid var(--hairline); border-radius:3px; padding:4px 8px; }
.wpd-obj__status .wpd-dot{ width:6px; height:6px; }
.wpd-obj__foot{ display:flex; align-items:center; gap:24px; margin-top:16px; padding-top:14px;
  border-top:1px solid var(--hairline); }
.wpd-obj__footitem{ display:flex; align-items:center; gap:6px; font-family:'IBM Plex Mono', monospace;
  font-size:9.5px; letter-spacing:.05em; text-transform:uppercase; color:var(--faint); }
.wpd-obj__footitem b{ color:var(--muted); font-weight:500; }
.wpd-objs__head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:18px; }

/* ── Segment / filtry ── */
/* min-width:0 + overflow-x:auto, bo przyciski mają white-space:nowrap: cztery filtry
   Rezerwacji dawały 437px i rozpychały CAŁĄ stronę w poziomie na telefonie (body.scrollWidth
   474 przy ekranie 375). Jako element flex w .wpd-panel__head nie kurczył się poniżej treści
   bez min-width:0. Ten sam idiom co .wpd-tabs — przewija się u siebie, strona stoi. */
.wpd-seg{ display:inline-flex; gap:2px; background:var(--inner); border:1px solid var(--hairline);
  border-radius:3px; padding:3px; min-width:0; max-width:100%; overflow-x:auto; }
.wpd-seg__btn{ border:none; background:transparent; cursor:pointer; font-family:inherit; font-size:13px;
  font-weight:500; color:var(--muted); padding:6px 14px; border-radius:2px;
  transition:background .14s, color .14s; white-space:nowrap; }
.wpd-seg__btn:hover{ color:var(--ink); }
.wpd-seg__btn--active{ background:var(--ink); color:#fff; }
.wpd-seg__count{ font-family:'IBM Plex Mono', monospace; font-size:11px; opacity:.7; margin-left:5px; }

/* ── Status toggle ── */
.wpd-check{ width:22px; height:22px; border:1px solid var(--hairline); border-radius:3px;
  background:var(--surface); display:inline-flex; align-items:center; justify-content:center;
  cursor:pointer; color:transparent; transition:all .14s; padding:0; }
.wpd-check svg{ width:14px; height:14px; }
.wpd-check--on{ background:var(--green); border-color:var(--green); color:#fff; }
.wpd-check--off:hover{ border-color:var(--green); color:var(--green); }

/* ── Paginacja ── */
.wpd-pager{ display:flex; align-items:center; justify-content:center; gap:14px; padding:16px;
  border-top:1px solid var(--hairline); }
.wpd-pager__info{ font-family:'IBM Plex Mono', monospace; font-size:12px; color:var(--muted); }

/* ── Stan pusty / placeholder ── */
.wpd-empty{ text-align:center; padding:52px 24px; }
.wpd-empty__icon{ color:var(--faint); margin:0 auto 14px; }
.wpd-empty__icon svg{ width:26px; height:26px; }
.wpd-empty p{ color:var(--faint); font-size:14px; margin:0; }
.wpd-soon{ border:1px dashed var(--hairline); border-radius:4px; padding:56px 24px; text-align:center;
  background-color:var(--surface);
  background-image:linear-gradient(var(--inner) 1px, transparent 1px), linear-gradient(90deg, var(--inner) 1px, transparent 1px);
  background-size:18px 18px; }
.wpd-soon__card{ display:inline-block; background:var(--surface); border:1px solid var(--hairline);
  border-radius:4px; padding:22px 26px; text-align:left; }

/* ── Ekran ładowania ── */
.wpd-loader{ min-height:100vh; display:flex; align-items:center; justify-content:center; background:var(--paper); }
.wpd-spin{ width:34px; height:34px; border:2px solid var(--hairline); border-top-color:var(--cynober);
  border-radius:50%; animation:wpd-spin .8s linear infinite; }
@keyframes wpd-spin{ to{ transform:rotate(360deg); } }
.wpd-spin--xs{ width:12px; height:12px; }
/* sama rotacja dla ikon (np. RefreshCw) — bez obwódki-kółka .wpd-spin */
.wpd-rotate{ animation:wpd-spin .8s linear infinite; }

/* ── Kalendarz (timeline / gantt) ── */
.wpd-cal__head{ display:flex; align-items:center; gap:14px; padding:16px 20px; border-bottom:1px solid var(--hairline); }
.wpd-cal__nav{ display:inline-flex; gap:6px; }
.wpd-cal__navbtn{ width:30px; height:30px; border:1px solid var(--hairline); background:var(--surface);
  border-radius:3px; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; color:var(--muted); }
.wpd-cal__navbtn:hover{ border-color:var(--ink); color:var(--ink); }
.wpd-cal__navbtn svg{ width:15px; height:15px; }
.wpd-cal__title{ font-weight:700; font-size:18px; letter-spacing:-.02em; text-transform:capitalize; }
.wpd-cal__legend{ display:flex; gap:16px; margin-left:auto; }
.wpd-cal__leg{ display:inline-flex; align-items:center; gap:6px; font-family:'IBM Plex Mono', monospace;
  font-size:10px; letter-spacing:.05em; text-transform:uppercase; color:var(--muted); }
.wpd-cal__scroll{ overflow-x:auto; }
.wpd-cal__inner{ min-width:720px; }
.wpd-cal__headrow, .wpd-cal__row{ display:grid; grid-template-columns:196px 1fr; }
.wpd-cal__row{ border-top:1px solid var(--hairline); }
.wpd-cal__label{ position:relative; padding:14px 40px 14px 18px; border-right:1px solid var(--hairline); }
.wpd-cal__objname{ font-weight:600; font-size:14px; }
.wpd-cal__objsub{ font-family:'IBM Plex Mono', monospace; font-size:9.5px; letter-spacing:.05em;
  text-transform:uppercase; color:var(--faint); margin-top:3px; }
.wpd-cal__corner{ border-right:1px solid var(--hairline); }
.wpd-cal__track{ position:relative; display:grid; grid-auto-rows:minmax(48px,auto); align-items:center; }
.wpd-cal__daycell{ grid-row:1; border-left:1px solid var(--inner); height:100%; }
.wpd-cal__daycell--today{ background:var(--tint-cynober); border-left-color:#EBD3CB; }
/* X22: wolna noc zaprasza do rezerwacji — klik zakłada jedną noc, przeciągnięcie zakres.
   Reguły stoją PO --today, żeby podświetlenie działało także w kolumnie dzisiejszej. */
.wpd-cal__daycell--free{ cursor:cell; }
.wpd-cal__daycell--free:hover{ background:var(--inner); }
.wpd-cal__daycell--sel, .wpd-cal__daycell--sel:hover{ background:rgba(217,73,43,.22); border-left-color:var(--cynober); }
/* klawiaturowa ścieżka do nowej rezerwacji w obiekcie (komórki siatki są myszkowe) */
.wpd-cal__add{ position:absolute; top:50%; right:12px; transform:translateY(-50%); width:24px; height:24px;
  border:1px solid var(--hairline); background:var(--surface); border-radius:3px; color:var(--muted);
  display:inline-flex; align-items:center; justify-content:center; cursor:pointer; opacity:0; transition:opacity .14s; }
.wpd-cal__row:hover .wpd-cal__add, .wpd-cal__add:focus-visible{ opacity:1; }
.wpd-cal__add:hover{ border-color:var(--ink); color:var(--ink); }
.wpd-cal__add svg{ width:13px; height:13px; }
@media (hover:none){ .wpd-cal__add{ opacity:1; } }
.wpd-cal__dnum{ grid-row:1; text-align:center; padding:9px 0 8px; border-left:1px solid var(--inner); }
.wpd-cal__dnum b{ font-family:'IBM Plex Mono', monospace; font-size:12px; font-weight:500; color:var(--muted); display:block; }
.wpd-cal__dnum span{ font-family:'IBM Plex Mono', monospace; font-size:8.5px; text-transform:uppercase; color:var(--faint); }
.wpd-cal__dnum--today b, .wpd-cal__dnum--today span{ color:var(--cynober); font-weight:600; }
.wpd-cal__bar{ grid-row:1; height:30px; border-radius:3px; display:flex; align-items:center; padding:0 9px;
  font-size:12px; font-weight:600; color:#fff; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;
  margin:0 2px; cursor:pointer; z-index:2; }
.wpd-cal__empty{ grid-column:1 / -1; }

/* ── Modale ── */
/* wejście: overlay 180ms fade + dialog 200ms ease-out od scale(.97) — nic nie pojawia się „z niczego";
   transform-origin zostaje domyślny (center) — modal nie jest kotwiczony do triggera */
.wpd-overlay{ position:fixed; inset:0; background:rgba(23,21,15,.42); backdrop-filter:blur(3px);
  display:flex; align-items:center; justify-content:center; padding:20px; z-index:80;
  animation:wpd-fade-in .18s ease-out; }
@keyframes wpd-fade-in{ from{ opacity:0; } }
.wpd-dialog{ background:var(--paper); border:1px solid var(--hairline); border-radius:4px;
  width:100%; max-width:600px; max-height:90vh; display:flex; flex-direction:column; overflow:hidden;
  animation:wpd-dialog-in .2s cubic-bezier(.22,1,.36,1); }
@keyframes wpd-dialog-in{ from{ opacity:0; transform:scale(.97) translateY(8px); } }
.wpd-dialog--lg{ max-width:860px; }
.wpd-dialog--sm{ max-width:400px; }
.wpd-dialog__head{ display:flex; align-items:flex-start; gap:14px; padding:20px 24px;
  border-bottom:1px solid var(--hairline); background:var(--surface); }
.wpd-dialog__head .wpd-h2{ font-size:19px; }
.wpd-dialog__sub{ font-family:'IBM Plex Mono', monospace; font-size:10px; letter-spacing:.07em;
  text-transform:uppercase; color:var(--faint); margin:4px 0 0; }
.wpd-dialog__ic{ width:38px; height:38px; border-radius:3px; background:var(--paper);
  border:1px solid var(--hairline); display:flex; align-items:center; justify-content:center;
  color:var(--cynober); flex:0 0 38px; }
.wpd-dialog__ic svg{ width:19px; height:19px; }
.wpd-dialog__close{ margin-left:auto; background:none; border:1px solid var(--hairline); border-radius:3px;
  width:34px; height:34px; display:flex; align-items:center; justify-content:center; cursor:pointer;
  color:var(--muted); transition:border-color .14s, color .14s; flex:0 0 34px; }
.wpd-dialog__close:hover{ border-color:var(--ink); color:var(--ink); }
.wpd-dialog__close svg{ width:17px; height:17px; }
.wpd-dialog__body{ padding:24px; overflow-y:auto; }
.wpd-dialog__foot{ display:flex; gap:12px; padding:18px 24px; border-top:1px solid var(--hairline);
  background:var(--surface); }
.wpd-dialog__foot .wpd-btn{ flex:1; height:44px; }

/* ── Kontrolki formularza ── */
.wpd-field{ margin-bottom:16px; }
.wpd-field:last-child{ margin-bottom:0; }
.wpd-flabel{ display:block; font-family:'IBM Plex Mono', monospace; font-size:10px; font-weight:500;
  letter-spacing:.08em; text-transform:uppercase; color:var(--label); margin-bottom:7px; }
.wpd-flabel--green{ color:var(--green); }
.wpd-flabel--cynober{ color:var(--cynober); }
.wpd-input, .wpd-select, .wpd-textarea{ width:100%; padding:11px 13px; background:var(--surface);
  border:1px solid var(--hairline); border-radius:3px; font-family:inherit; font-size:14px;
  color:var(--ink); outline:none; transition:border-color .14s; }
.wpd-input:focus, .wpd-select:focus, .wpd-textarea:focus{ border-color:var(--ink); }
.wpd-input::placeholder, .wpd-textarea::placeholder{ color:var(--faint); }
.wpd-select{ cursor:pointer; appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239A917D' stroke-width='2.5'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 12px center; padding-right:32px; }
/* Kompaktowy select do pasków narzędzi (filtr obiektu w Kosztach) — spójny z .wpd-seg wysokością */
.wpd-select--sm{ width:auto; min-width:150px; max-width:220px; padding:8px 30px 8px 12px; font-size:12.5px; background-position:right 10px center; }
.wpd-textarea{ resize:vertical; min-height:64px; }
.wpd-input--num{ font-family:'IBM Plex Mono', monospace; }
.wpd-fgrid{ display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.wpd-fgrid--3{ grid-template-columns:1fr 1fr 1fr; }
/* Pola w siatce MUSZĄ móc zejść poniżej swojej szerokości własnej. Pola typu month
   i date mają w przeglądarce dużą szerokość intrinsic (wartość + ikona kalendarza),
   a element siatki domyślnie stoi na min-width:auto i nie da się go ścisnąć — w wąskim
   dialogu (--sm = 400 px) para takich pól rozpychała okno o ~32 px i dawała poziome
   przewijanie w środku modalu. Zgłoszone przez właściciela przy smoke 4e (2026-08-13),
   odtworzone pomiarem. Ten sam idiom co przy .wpd-seg i .wpd-tabs.
   UWAGA: ten plik to szablon JS — bez odwróconych apostrofów w komentarzach CSS. */
.wpd-fgrid > *{ min-width:0; }
.wpd-input, .wpd-select, .wpd-textarea{ min-width:0; }
/* dyskretny podpis pod grupą pól (np. wyliczona suma osób w rezerwacji) */
.wpd-fhint{ font-family:'IBM Plex Mono', monospace; font-size:10.5px; letter-spacing:.05em;
  color:var(--faint); margin:12px 0 0; }
.wpd-fhint strong{ color:var(--ink); font-weight:600; }
.wpd-fieldset{ background:var(--inner); border:1px solid var(--hairline); border-radius:4px; padding:16px; margin-top:4px; }
.wpd-fieldset__title{ display:flex; align-items:center; gap:7px; font-family:'IBM Plex Mono', monospace;
  font-size:10px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); margin:0 0 14px; }
.wpd-fieldset__title svg{ width:14px; height:14px; color:var(--green); }

/* przełącznik typu wpisu */
.wpd-typetabs{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:3px; background:var(--inner);
  border:1px solid var(--hairline); border-radius:3px; padding:3px; margin-bottom:20px; }
.wpd-typetab{ border:none; background:transparent; cursor:pointer; font-family:'IBM Plex Mono', monospace;
  font-size:11px; font-weight:500; letter-spacing:.06em; text-transform:uppercase; color:var(--muted);
  padding:9px; border-radius:2px; transition:background .14s, color .14s; }
.wpd-typetab:hover{ color:var(--ink); }
.wpd-typetab--active{ background:var(--ink); color:#fff; }

/* sekcje raportu dziennego */
.wpd-rep__sec{ margin-bottom:24px; }
.wpd-rep__sec:last-child{ margin-bottom:0; }
.wpd-rep__head{ display:flex; align-items:center; gap:9px; margin-bottom:12px; }
.wpd-rep__head svg{ width:16px; height:16px; }
.wpd-rep__head h3{ font-weight:700; font-size:15px; margin:0; }
.wpd-rep__count{ font-family:'IBM Plex Mono', monospace; font-size:12px; color:var(--faint); margin-left:2px; }
.wpd-rep__empty{ border:1px dashed var(--hairline); border-radius:4px; padding:18px; text-align:center;
  color:var(--faint); font-size:13px; }
.wpd-rep__item{ display:flex; align-items:center; gap:12px; padding:13px 16px; background:var(--surface);
  border:1px solid var(--hairline); border-radius:4px; margin-bottom:8px; }
.wpd-rep__item:last-child{ margin-bottom:0; }
.wpd-rep__accent{ width:3px; height:36px; border-radius:2px; flex:0 0 3px; }
.wpd-rep__name{ font-weight:600; font-size:14px; }
.wpd-rep__meta{ font-family:'IBM Plex Mono', monospace; font-size:10px; letter-spacing:.05em;
  text-transform:uppercase; color:var(--faint); margin-top:3px; }

/* ── Ustawienia (taby + listy) ── */
/* min-width:0 + max-width:100% to nie ozdoba: bez nich kontener flex rośnie do sumy
   szerokości zakładek zamiast je przewijać i rozpycha stronę w poziomie. Ujawniła to
   dopiero CZWARTA zakładka Finansów (Podatki, X25) — przy trzech mieściło się na styk,
   przy czterech strona miała 406 px w oknie 375 px. Ten sam idiom stoi przy .wpd-seg,
   gdzie komentarz od dawna powoływał się na .wpd-tabs jako wzór; wzór go nie miał. */
.wpd-tabs{ display:flex; gap:4px; overflow-x:auto; padding-bottom:14px; margin-bottom:18px;
  min-width:0; max-width:100%; border-bottom:1px solid var(--hairline); }
.wpd-tab{ flex:0 0 auto; border:1px solid transparent; background:transparent; cursor:pointer;
  font-family:'IBM Plex Mono', monospace; font-size:10.5px; letter-spacing:.06em; text-transform:uppercase;
  color:var(--muted); padding:8px 12px; border-radius:3px; white-space:nowrap; transition:.14s; }
.wpd-tab:hover{ color:var(--ink); background:var(--inner); }
.wpd-tab--active{ background:var(--ink); color:#fff; }
.wpd-listrow{ display:flex; align-items:center; gap:12px; background:var(--surface); border:1px solid var(--hairline);
  border-radius:4px; padding:12px 14px; margin-bottom:10px; }
.wpd-listrow__ic{ width:34px; height:34px; border-radius:3px; display:flex; align-items:center;
  justify-content:center; color:#fff; flex:0 0 34px; }
.wpd-listrow__ic svg{ width:16px; height:16px; }
.wpd-iconbtn--del:hover{ border-color:var(--cynober); color:var(--cynober); }
.wpd-addbox{ border:1px dashed var(--hairline); border-radius:4px; padding:16px; margin-top:14px; background:var(--surface); }
.wpd-swatches{ display:flex; flex-wrap:wrap; gap:8px; align-items:center; margin-top:12px; }
.wpd-swatch{ width:26px; height:26px; border-radius:3px; cursor:pointer; border:2px solid transparent;
  opacity:.4; transition:.14s; }
.wpd-swatch:hover{ opacity:.8; }
.wpd-swatch--on{ opacity:1; border-color:var(--ink); }
.wpd-note{ border:1px solid var(--hairline); border-radius:4px; padding:14px 16px; font-size:13px;
  color:var(--muted); line-height:1.6; background:var(--surface); }
.wpd-note--info{ background:var(--tint-granat); border-color:#C9D3E0; color:#27405c; }
.wpd-note--danger{ background:var(--tint-cynober); border-color:#EBD3CB; color:#7a2e1c; }
.wpd-note h4{ display:flex; align-items:center; gap:7px; font-size:13px; margin:0 0 6px; font-weight:700; }
.wpd-note h4 svg{ width:15px; height:15px; }
.wpd-checkrow{ display:flex; align-items:flex-start; gap:11px; padding:10px 0; cursor:pointer;
  font-size:14px; font-weight:500; color:var(--ink); }
.wpd-checkrow input{ width:17px; height:17px; accent-color:var(--cynober); margin-top:1px; flex:0 0 17px; }
/* Obramowana KARTA opcji (.wpd-listrow.wpd-checkrow) rzadzi sie inaczej niz goly wiersz
   z checkboxem: karty w siatce maja rowna wysokosc, wiec przy dwuliniowej etykiecie
   („Najem prywatny — wynajmuje poza dzialalnoscia gospodarcza") przelacznik przyklejony
   do gory czytal sie jako przekrzywiony obok sasiada z jedna linia. W karcie centrujemy;
   gole wiersze zostaja przy rownaniu do pierwszej linii, bo tam jest to poprawne. */
.wpd-listrow.wpd-checkrow{ align-items:center; }
.wpd-listrow.wpd-checkrow input{ margin-top:0; }
.wpd-codebox{ display:flex; gap:8px; align-items:center; }
.wpd-codebox input{ flex:1; font-family:'IBM Plex Mono', monospace; font-size:11px; color:var(--muted);
  background:var(--inner); border:1px solid var(--hairline); border-radius:3px; padding:9px 11px;
  outline:none; text-overflow:ellipsis; }

/* ── Szczegóły rezerwacji ── */
.wpd-bc{ display:flex; align-items:center; gap:8px; font-family:'IBM Plex Mono', monospace; font-size:11px;
  letter-spacing:.05em; text-transform:uppercase; color:var(--faint); margin-bottom:18px; }
.wpd-bc button{ background:none; border:none; cursor:pointer; font:inherit; color:var(--faint); padding:0;
  text-transform:uppercase; }
.wpd-bc button:hover{ color:var(--ink); }
.wpd-bc__cur{ color:var(--ink); }
.wpd-guest{ display:flex; align-items:center; gap:14px; padding:18px 20px; }
.wpd-guest__av{ width:48px; height:48px; border-radius:3px; background:var(--cynober); color:#fff;
  display:flex; align-items:center; justify-content:center; font-family:'IBM Plex Mono', monospace;
  font-size:16px; font-weight:600; flex:0 0 48px; }
.wpd-guest__name{ font-weight:700; font-size:19px; letter-spacing:-.02em; }
.wpd-guest__sub{ font-family:'IBM Plex Mono', monospace; font-size:10.5px; letter-spacing:.05em;
  text-transform:uppercase; color:var(--faint); margin-top:3px; }
.wpd-cells{ display:grid; grid-template-columns:repeat(3,1fr); border-top:1px solid var(--hairline); }
.wpd-cells--4{ grid-template-columns:repeat(4,1fr); }
.wpd-cell{ padding:14px 18px; border-right:1px solid var(--hairline); min-width:0; }
.wpd-cell__val{ overflow-wrap:anywhere; }
.wpd-cell:last-child{ border-right:none; }
.wpd-cell__label{ font-family:'IBM Plex Mono', monospace; font-size:9.5px; letter-spacing:.07em;
  text-transform:uppercase; color:var(--label); margin-bottom:5px; }
.wpd-cell__val{ font-weight:600; font-size:15px; }
.wpd-cell__val--accent{ color:var(--cynober); }
/* Komórka KPI na ciemnym tle („Do odłożenia" w podatkach): bez tych reguł wartość
   dziedziczy kolor atramentu i znika na tle --ink — lustrzane odbicie stylu
   .wpd-stat--dark .wpd-stat__label/__value wyżej. */
.wpd-stat--dark .wpd-cell__label{ color:var(--on-side-faint); }
.wpd-stat--dark .wpd-cell__val{ color:var(--green-dot); }
.wpd-settle__row{ display:flex; align-items:baseline; justify-content:space-between; padding:11px 0;
  border-bottom:1px solid var(--hairline); }
.wpd-settle__row:last-child{ border-bottom:none; }
.wpd-settle__k{ font-size:13.5px; color:var(--muted); }
.wpd-settle__v{ font-family:'IBM Plex Mono', monospace; font-size:14px; font-weight:500; color:var(--ink); }
.wpd-settle__row--total .wpd-settle__k{ font-weight:700; color:var(--ink); }
.wpd-settle__row--total .wpd-settle__v{ font-weight:700; font-size:17px; }

/* przewodnik dla gości */
.wpd-guide__code{ background:var(--ink); border-radius:4px; padding:18px 20px; margin:4px 0 16px; }
.wpd-guide__codelabel{ font-family:'IBM Plex Mono', monospace; font-size:10px; letter-spacing:.07em;
  text-transform:uppercase; color:var(--on-side-faint); margin:0 0 10px; }
.wpd-guide__pin{ font-family:'IBM Plex Mono', monospace; font-weight:600; font-size:30px; letter-spacing:.18em;
  color:var(--green-dot); }
.wpd-guide__pin--empty{ color:var(--on-side-label); letter-spacing:.22em; }
.wpd-guide__note{ font-family:'IBM Plex Mono', monospace; font-size:10px; color:var(--on-side-faint); margin:10px 0 0; }
.wpd-kvgrid{ display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px; min-width:0; }
/* Etykieta NAD wartoscia, nie obok. Wczesniej .wpd-kv bylo zwyklym blokiem, a oba dzieci
   to span-y, czyli elementy liniowe — margin-bottom na etykiecie nie dziala wtedy w pionie
   i wartosc sklejala sie z etykieta w jeden ciag: „PODSTAWA WYNAJMUnieuzupelniona"
   (zgloszenie wlasciciela ze zrzutem, 2026-08-25). Kolumna flex naprawia to u zrodla. */
.wpd-kv{ border:1px solid var(--hairline); border-radius:4px; padding:11px 13px; background:var(--surface);
  min-width:0; overflow-wrap:anywhere; display:flex; flex-direction:column; gap:4px; }
.wpd-kv__k{ font-family:'IBM Plex Mono', monospace; font-size:9.5px; letter-spacing:.06em;
  text-transform:uppercase; color:var(--label); margin-bottom:0; }
.wpd-kv__v{ font-family:'IBM Plex Mono', monospace; font-size:14px; font-weight:500; color:var(--ink); }

/* ── Kreator przewodnika ── */
.wpd-up{ border:1px dashed var(--hairline); border-radius:4px; padding:22px; display:flex;
  flex-direction:column; align-items:center; justify-content:center; gap:8px; cursor:pointer;
  background:var(--surface); color:var(--faint); text-align:center; transition:border-color .14s, background .14s; }
.wpd-up:hover{ border-color:var(--ink); background:var(--inner); }
.wpd-up svg{ width:22px; height:22px; }
.wpd-up__txt{ font-size:13px; color:var(--muted); }
.wpd-cover{ width:88px; height:88px; border-radius:4px; object-fit:cover; border:1px solid var(--hairline); flex:0 0 88px; }
.wpd-qr{ display:flex; justify-content:center; padding:16px; background:#fff; border:1px solid var(--hairline); border-radius:4px; }
.wpd-attr{ display:flex; gap:12px; align-items:flex-start; background:var(--inner); border:1px solid var(--hairline);
  border-radius:4px; padding:12px; margin-bottom:10px; }
.wpd-filechip{ display:flex; align-items:center; justify-content:space-between; gap:10px; padding:11px 13px;
  background:var(--tint-granat); border:1px solid #C9D3E0; border-radius:4px; }
.wpd-filechip__name{ display:flex; align-items:center; gap:9px; min-width:0; }
.wpd-filechip__name b{ font-size:13px; font-weight:600; color:var(--granat); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.wpd-gcard__cover{ height:140px; border-bottom:1px solid var(--hairline); position:relative; overflow:hidden;
  background-color:var(--inner);
  background-image:linear-gradient(var(--inner-2) 1px, transparent 1px), linear-gradient(90deg, var(--inner-2) 1px, transparent 1px);
  background-size:16px 16px; display:flex; align-items:center; justify-content:center; }
.wpd-gcard__cover img{ width:100%; height:100%; object-fit:cover; }
.wpd-gcard__prop{ position:absolute; left:12px; bottom:10px; font-family:'IBM Plex Mono', monospace;
  font-size:9.5px; letter-spacing:.05em; text-transform:uppercase; color:var(--ink); background:var(--surface);
  border:1px solid var(--hairline); border-radius:3px; padding:4px 8px; }

/* ── Analityka ── */
.wpd-anl-bar{ display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:20px; }
.wpd-step{ display:inline-flex; align-items:center; border:1px solid var(--hairline); border-radius:3px; background:var(--surface); }
.wpd-step__btn{ width:34px; height:38px; border:none; background:none; cursor:pointer; color:var(--muted); display:flex; align-items:center; justify-content:center; transition:color .14s; }
.wpd-step__btn:hover{ color:var(--ink); }
.wpd-step__btn:disabled{ opacity:.3; cursor:default; }
.wpd-step__btn svg{ width:15px; height:15px; }
.wpd-step__label{ min-width:132px; text-align:center; font-family:'IBM Plex Mono', monospace; font-weight:500; font-size:13px; color:var(--ink); padding:0 8px; border-left:1px solid var(--hairline); border-right:1px solid var(--hairline); align-self:stretch; display:flex; flex-direction:column; justify-content:center; text-transform:capitalize; }
.wpd-step__label small{ font-size:8.5px; letter-spacing:.09em; text-transform:uppercase; color:var(--faint); margin-bottom:1px; }

.wpd-kpi{ display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
.wpd-delta{ display:inline-flex; align-items:center; gap:4px; font-family:'IBM Plex Mono', monospace; font-size:11px; letter-spacing:.03em; }
.wpd-delta--up{ color:var(--green); }
.wpd-delta--down{ color:var(--cynober); }
.wpd-delta--flat{ color:var(--faint); }
.wpd-delta--up.wpd-delta--inv{ color:var(--cynober); }
.wpd-delta--down.wpd-delta--inv{ color:var(--green); }

/* wykres trendu (słupki + oś) */
.wpd-trend__head{ display:flex; align-items:center; gap:14px; padding:16px 20px; border-bottom:1px solid var(--hairline); }
.wpd-trend__legend{ display:flex; gap:16px; margin-left:auto; }
.wpd-trend__leg{ display:inline-flex; align-items:center; gap:6px; font-family:'IBM Plex Mono', monospace; font-size:10px; letter-spacing:.05em; text-transform:uppercase; color:var(--muted); }
.wpd-trend__body{ padding:20px 20px 14px; }
.wpd-trend__bars{ display:flex; align-items:flex-end; gap:5px; height:196px; }
.wpd-trend__col{ flex:1 1 0; display:flex; flex-direction:column; align-items:center; gap:9px; height:100%; justify-content:flex-end; position:relative; }
.wpd-trend__bar{ width:100%; max-width:38px; background:var(--inner-2); border-radius:2px 2px 0 0; transform:scaleY(0); transform-origin:bottom; transition:transform .7s cubic-bezier(.22,1,.36,1); }
.wpd-trend__bar--hi{ background:var(--cynober); }
.wpd-trend__col:hover .wpd-trend__bar{ background:var(--ink); }
.wpd-trend__col:hover .wpd-trend__bar--hi{ background:var(--cynober-hover); }
.wpd-trend__x{ font-family:'IBM Plex Mono', monospace; font-size:9px; letter-spacing:.03em; text-transform:uppercase; color:var(--faint); white-space:nowrap; }
.wpd-trend__tip{ position:absolute; bottom:calc(100% + 6px); left:50%; transform:translateX(-50%); background:var(--ink); color:#fff; border-radius:3px; padding:7px 9px; font-size:11px; line-height:1.5; white-space:nowrap; opacity:0; pointer-events:none; transition:opacity .12s; z-index:5; }
.wpd-trend__col:hover .wpd-trend__tip{ opacity:1; }
.wpd-trend__tip b{ font-family:'IBM Plex Mono', monospace; }

/* poziome słupki (kanał / obiekt) */
.wpd-hbar{ padding:9px 0; }
.wpd-hbar:first-child{ padding-top:2px; }
.wpd-hbar__head{ display:flex; align-items:baseline; justify-content:space-between; gap:10px; margin-bottom:7px; }
.wpd-hbar__name{ font-size:13.5px; font-weight:500; display:inline-flex; align-items:center; gap:8px; }
.wpd-hbar__val{ font-family:'IBM Plex Mono', monospace; font-size:12px; color:var(--faint); white-space:nowrap; }
.wpd-hbar__val b{ color:var(--ink); font-weight:600; }
.wpd-hbar__track{ height:8px; border-radius:3px; background:var(--inner-2); overflow:hidden; }
.wpd-hbar__fill{ height:100%; border-radius:3px; transform:scaleX(0); transform-origin:left; transition:transform .7s cubic-bezier(.22,1,.36,1); }

/* Tabela ostatnich kosztów (Koszty i opłaty) — linie 1px, mono na kwotach, restacking na mobile */
.wpd-ctable{ display:flex; flex-direction:column; padding:4px 0 6px; }
.wpd-ctable__row{ display:grid; align-items:center; gap:14px; padding:11px 20px; border-top:1px solid var(--hairline);
  grid-template-columns:84px minmax(110px,1fr) minmax(140px,1.6fr) minmax(90px,1fr) auto auto;
  grid-template-areas:"date cat detail prop amt act"; }
.wpd-ctable__act{ grid-area:act; display:inline-flex; gap:6px; justify-content:flex-end; }
.wpd-ctable__row:first-child{ border-top:none; }
.wpd-ctable__date{ grid-area:date; color:var(--faint); font-size:12px; }
.wpd-ctable__cat{ grid-area:cat; font-weight:600; font-size:13.5px; }
.wpd-ctable__detail{ grid-area:detail; color:var(--muted); font-size:13px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.wpd-ctable__prop{ grid-area:prop; color:var(--faint); font-size:12px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.wpd-ctable__amt{ grid-area:amt; text-align:right; font-weight:600; font-size:13.5px; color:var(--cynober); white-space:nowrap; }
@media (max-width:720px){
  .wpd-ctable__row{ grid-template-columns:1fr auto; column-gap:12px; row-gap:3px;
    grid-template-areas:"cat amt" "detail amt" "date prop" "act act"; }
  .wpd-ctable__prop{ text-align:right; }
  .wpd-ctable__act{ justify-content:flex-start; padding-top:4px; }
}

/* Zysk wg obiektu (X4 partia 2) — te same tokeny co wpd-ctable */
.wpd-ptable{ display:flex; flex-direction:column; padding:4px 0 6px; }
.wpd-ptable__row{ display:grid; align-items:center; gap:12px; padding:11px 18px; border-top:1px solid var(--hairline);
  grid-template-columns:minmax(90px,1.4fr) minmax(96px,1fr) auto 46px;
  grid-template-areas:"name meta profit margin"; }
.wpd-ptable__row:first-child{ border-top:none; }
.wpd-ptable__name{ grid-area:name; font-weight:600; font-size:13.5px; display:inline-flex; align-items:center; gap:8px; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.wpd-ptable__meta{ grid-area:meta; color:var(--faint); font-size:12px; white-space:nowrap; }
.wpd-ptable__profit{ grid-area:profit; text-align:right; font-weight:600; font-size:13.5px; white-space:nowrap; }
.wpd-ptable__margin{ grid-area:margin; text-align:right; color:var(--muted); font-size:12px; }
@media (max-width:720px){
  .wpd-ptable__row{ grid-template-columns:1fr auto; column-gap:12px; row-gap:2px;
    grid-template-areas:"name profit" "meta margin"; }
}

/* ── Raport rentowności: ekran + druk A4→PDF (X4 partia 3) ── */
.wpd-report-onlyprint{ display:none; }
.wpd-rpt-total td{ border-top:2px solid var(--ink); padding-top:10px; }
/* Miesiąc bez ruchu — na ekranie wyszarzony. Klasa zamiast stylu w JSX, bo w druku
   ta sama informacja potrzebuje innej mocy: 0.4 na papierze to ~2,5:1, czyli nieczytelne. */
/* Miesiac bez ruchu: wygaszony, ale czytelny. 0.4 dawalo ok. 2,55:1 na jasnym tle,
   czyli ponizej progu dostepnosci, a wiersz niesie nazwe miesiaca. Decyzja wlasciciela
   2026-08-19: rowna sie wartosci uzytej w druku. */
.wpd-rpt-idle{ opacity:.62; }
@media print {
  /* ── DRUK RAPORTU ──
     Poprzednia wersja ukrywała panel przez visibility:hidden i wyrywała raport z układu
     przez position:absolute z top:0. Obie rzeczy okazały się źródłem wad zgłoszonych
     2026-08-13: visibility NIE zwalnia miejsca (niewidzialny panel dalej miał ~2400 px
     wysokości, stąd puste strony), a position:absolute wiąże raport z najbliższym
     pozycjonowanym przodkiem — czyli z czymś w drzewie panelu, co potrafi przesunąć
     wydruk o całą stronę (u właściciela: pusta strona 1, treść na 2 i 3).

     Teraz: wszystko, co nie jest raportem ani jego przodkiem, znika przez display:none,
     czyli WYCHODZI Z UKŁADU. Raport zostaje w normalnym przepływie na początku dokumentu.
     Zmierzone na próbie z tym samym CSS: 3 strony -> 1, raport na stronie pierwszej.
     UWAGA: ten plik to szablon JS — bez odwróconych apostrofów w komentarzach. */
  body :not(:has(.wpd-report-print)):not(.wpd-report-print):not(.wpd-report-print *) { display:none !important; }

  .wpd-overlay{ position:static !important; display:block !important; background:#fff !important;
    padding:0 !important; inset:auto !important; }
  .wpd-dialog{ position:static !important; box-shadow:none !important; border:none !important;
    border-radius:0 !important; width:100% !important; max-width:none !important;
    max-height:none !important; overflow:visible !important; display:block !important;
    background:#fff !important; }
  /* Papier jest papierem (X18 partia C). Zmierzone na wydruku PDF z aplikacji: ogon
     ostatniej kartki wychodzil w kolorze #f8fafc, czyli w tle <body> (klasa bg-slate-50
     z czasow Tailwinda) - zimny blekit obcy palecie, drukowany przy wlaczonej opcji
     "Grafika w tle". Dokument dla ksiegowego ma byc bialy: mniej toneru, wyzszy kontrast
     i ten sam wynik niezaleznie od ustawien okna drukowania. */
  html:has(.wpd-report-print), body:has(.wpd-report-print){ background:#fff !important; }
  /* Powloka panelu tez na bialo, ale TYLKO gdy drukujemy raport. Ten sam arkusz obsluguje
     wydruk generatora umow (blok nizej) - kazda niezakresowana regula w @media print
     dotyka i jego, a to on zepsul sie tu juz dwa razy. */
  body:has(.wpd-report-print) .wpd{ background:#fff !important; min-height:0 !important; }
  .wpd-report-print{ position:static !important; max-height:none !important; overflow:visible !important;
    padding:0 !important; background:#fff !important; }
  /* Pas bezpieczenstwa: gdyby ktos znowu dolozyl regule chowajaca wszystko przez visibility
     (tak jak blok generatora umow nizej), raport ma zostac widoczny. Sam display:none na
     reszcie nie wystarczy - visibility dziedziczy sie w dol i nie zwalnia miejsca. */
  .wpd-report-print, .wpd-report-print *{ visibility:visible !important; }

  .wpd-report-noprint{ display:none !important; }
  .wpd-report-onlyprint{ display:block !important; }

  /* ── Naglowek i stopka dokumentu ──
     Numeracji stron NIE robimy w CSS: Chrome nie obsluguje pol @page (@bottom-right,
     counter(page)), wiec reguly te nic by nie zrobily. Numer strony i tytul dokumentu
     daje wlasna stopka przegladarki, karmiona z document.title podmienianego na czas
     drukowania (partia A/B) - potwierdzone przez wlasciciela na wydruku 18.08. */
  .wpd-rpt-head{ display:flex !important; justify-content:space-between; align-items:flex-end; gap:16px; border-bottom:2px solid var(--ink); padding-bottom:8px; margin-bottom:12px; }
  .wpd-rpt-head__title{ font-size:19px; font-weight:800; letter-spacing:-0.01em; }
  .wpd-rpt-head__ent{ font-size:12px; color:var(--muted); margin-top:2px; }
  .wpd-rpt-head__meta{ font-family:'IBM Plex Mono',monospace; font-size:9px; letter-spacing:.04em; text-transform:uppercase; color:var(--faint); white-space:nowrap; }
  .wpd-rpt-foot{ margin-top:12px; padding-top:8px; border-top:1px solid var(--hairline); font-size:10px; color:var(--faint); break-inside:avoid; }

  /* ── Podzial na strony ──
     Sekcje trzymamy w calosci, ale panel dluzszy niz strona MUSI moc sie zlamac -
     inaczej przeskakuje w calosci na nastepna kartke i zostawia po sobie pol strony
     bieli (tak powstawaly strony 3 i 4 w pomiarze sprzed tej partii). Przy lamaniu
     naglowek tabeli powtarza sie na kolejnej stronie (display:table-header-group). */
  .wpd-rpt-section{ break-inside:avoid; page-break-inside:avoid; margin-bottom:9px !important; }
  .wpd-report-print .wpd-panel__head{ break-after:avoid; page-break-after:avoid; }
  /* Zestawienie wolno zlamac, prozy i wykresu nie. Tabela trzymana w calosci
     przeskakuje w CALOSCI na kolejna kartke, gdy zabraknie jej dwoch wierszy miejsca -
     tak powstawaly pol-puste strony. Zlamana tabela nie gubi nic, bo naglowek kolumn
     powtarza sie na nastepnej stronie, a pojedynczy wiersz nigdy nie pekla w pol. */
  .wpd-report-print .wpd-panel:has(table){ break-inside:auto !important; page-break-inside:auto !important; }
  .wpd-report-print thead{ display:table-header-group; break-after:avoid; }
  .wpd-report-print tr{ break-inside:avoid; page-break-inside:avoid; }
  .wpd-report-print .wpd-rpt-total{ break-before:avoid; page-break-before:avoid; }
  .wpd-report-print p{ orphans:2; widows:2; }
  /* Metodyka i stopka to jedna mysl: zastrzezenia do liczb plus zdanie o tym, skad
     te liczby sa. Metodyka ZOSTAJE w calosci (dziedziczy break-inside z .wpd-rpt-section):
     po zageszczeniu ma juz tylko ok. 1/8 kartki, a rozbicie czterech akapitow zastrzezen
     miedzy dwa arkusze kosztuje czytelnika wiecej niz ten ogon bieli. Sklejamy za to
     stopke z metodyka - bez tego jeden wiersz stopki ladowal sam na osobnej kartce. */
  .wpd-rpt-method{ break-after:avoid; page-break-after:avoid; }
  .wpd-rpt-foot{ break-before:avoid; page-break-before:avoid; }
  /* Rejestr pozycji to zalacznik, nie ciag dalszy - zaczyna sie od swiezej kartki
     i jako jedyny lamie sie swobodnie (przy pelnym sezonie to kilkanascie stron). */
  .wpd-rpt-register{ break-before:page; page-break-before:always; break-inside:auto !important; page-break-inside:auto !important; }

  /* ── Gestosc: ekran ma powietrze, papier ma tresc ──
     Wszystko zakresowane przez .wpd-report-print, zeby nie ruszyc ani ekranu, ani
     wydruku umowy. Skala tekstu w tabelach: 13,5px -> 10,5px (ok. 8 pt), naglowki
     kolumn 10 -> 8,5px. Osiem punktow to standardowa gestosc zestawien ksiegowych,
     a laser 600 dpi rysuje ja czysto. */
  /* Panel na papierze to ramka, nie plama. Na ekranie panel (--surface) jest JASNIEJSZY
     od tla (--paper); na bieli ta sama plama robi sie ciemniejsza od tla, czyli figura
     i tlo zamieniaja sie rolami. Do tego tlo znika przy odznaczonej "Grafice w tle",
     wiec dokument wygladalby inaczej u kazdego. Strukture niesie linia 1 px. */
  .wpd-report-print .wpd-panel{ background:#fff !important; }
  .wpd-report-print .wpd-panel__head{ padding:8px 12px !important; }
  .wpd-report-print .wpd-panel__head .wpd-h2{ font-size:12.5px !important; }
  .wpd-report-print .wpd-table th{ padding:6px 10px !important; font-size:8.5px !important; letter-spacing:.05em !important; }
  .wpd-report-print .wpd-table td{ padding:4.5px 10px !important; font-size:10.5px !important; }
  /* Linia 1 px zostaje, ale --hairline (#DDD5C3) to 1,35:1 na bieli - laser rysuje
     z tego siwa kreske na granicy widocznosci. W druku linie to odcien --ink, czyli
     ta sama paleta, tylko mocniejszy ton. Gdy color-mix nie jest wspierany, deklaracja
     wypada i zostaje --hairline, czyli stan sprzed zmiany. */
  .wpd-report-print .wpd-panel{ border-color:color-mix(in srgb, var(--ink) 24%, #fff) !important; }
  .wpd-report-print .wpd-panel__head,
  .wpd-report-print .wpd-table td{ border-bottom-color:color-mix(in srgb, var(--ink) 24%, #fff) !important; }
  .wpd-report-print .wpd-table th{ border-bottom-color:color-mix(in srgb, var(--ink) 42%, #fff) !important; }
  .wpd-report-print .wpd-rpt-total td{ padding-top:7px !important; }
  /* Liczba nigdy sie nie lamie. Przy pelnym sezonie kwota "11 507 zl" schodzila
     do drugiej linii i psula rytm calej tabeli. */
  .wpd-report-print .wpd-table td.wpd-num, .wpd-report-print .wpd-table td.wpd-cell-num,
  .wpd-report-print .wpd-table td.wpd-mono{ white-space:nowrap !important; }
  .wpd-report-print .wpd-rpt-idle{ opacity:.62 !important; }

  /* ── Wskazniki na skrocie: cztery karty w jednym rzedzie ──
     W druku obowiazuje breakpoint mobilny (szerokosc strony < 980px), wiec karty
     ustawialy sie 2x2 i zjadaly polowe pierwszej kartki. Na A4 miesci sie rzad. */
  .wpd-report-print .wpd-stats{ grid-template-columns:repeat(4,1fr) !important; gap:8px !important; }
  /* Linia wskaznikow pod kartami miala ujemny margines gorny dobrany do wysokich kart
     ekranowych - po splaszczeniu kart wchodzila na ich krawedz. */
  .wpd-report-print p.wpd-rpt-section{ margin-top:0 !important; }
  /* Kolor ramki ustawiamy wlasciwosciami jednostronnymi, nie skrotem. Zmierzone na panelu
     (Chrome, tryb print): ani "border:1px solid var(--hairline) !important", ani
     "border-color:var(--hairline) !important" nie przebijaly reguly ".wpd-stat--dark
     { border-color:var(--ink) }" o nizszej specyficznosci - oba sa skrotami, a skrot
     z var() trafia do kaskady jako wartosc odroczona. Tylko border-*-color dziala
     przewidywalnie. Warto o tym pamietac przy kazdym nadpisywaniu koloru linii tutaj. */
  .wpd-report-print .wpd-stat{ background:#fff !important; min-height:0 !important;
    padding:9px 11px 10px !important; border-width:1px !important; border-style:solid !important;
    border-top-color:var(--hairline) !important; border-right-color:var(--hairline) !important;
    border-bottom-color:var(--hairline) !important; border-left-color:var(--hairline) !important; }
  .wpd-report-print .wpd-stat__label{ font-size:8.5px !important; margin-bottom:7px !important; color:var(--label) !important; }
  .wpd-report-print .wpd-stat__value{ font-size:21px !important; }
  .wpd-report-print .wpd-stat__value small{ font-size:12px !important; }
  .wpd-report-print .wpd-stat__foot{ padding-top:5px !important; font-size:9.5px !important; color:var(--muted) !important; }
  /* Karta "Zysk netto" na ekranie jest odwrocona (ciemne tlo). Na papierze odwrocenie
     jest najgorszym z mozliwych wyroznien: przy wylaczonej grafice w tle znika razem
     z tlem, a przy wlaczonej zjada cala kaselte toneru i daje zielen 3:1 na czerni.
     Hierarchie niesie wiec ramka z --ink zamiast wypelnienia - linia, nie plama. */
  .wpd-report-print .wpd-stat--dark{ background:#fff !important;
    border-top-color:var(--ink) !important; border-right-color:var(--ink) !important;
    border-bottom-color:var(--ink) !important; border-left-color:var(--ink) !important; }
  .wpd-report-print .wpd-stat--dark .wpd-stat__label{ color:var(--label) !important; }

  /* ── Kolor tylko tam, gdzie jest duzy ──
     Wlasciciel drukuje na Brother DCP-L3560CDW, czesto mono. W skali szarosci
     --green (44%) i --cynober (48%) to praktycznie ten sam ton, a --cynober na bieli
     daje 4,29:1, czyli ponizej AA dla tekstu tej wielkosci. W tabelach kolor niczego
     nie rozstrzyga (kolumny sa podpisane, strata ma minus), wiec liczby ida --ink.
     Kolor zostaje na kartach wskaznikow, gdzie tekst jest duzy i prog wynosi 3:1. */
  .wpd-report-print .wpd-table td.wpd-cell-num{ color:var(--ink) !important; }
  .wpd-report-print .wpd-table td.wpd-mono{ color:var(--ink) !important; }

  /* ── Struktura kosztow (paski) ──
     print-color-adjust:exact tylko tutaj i na kropkach legendy - to jedyne miejsca,
     w ktorych wypelnienie niesie informacje, a domyslnie odznaczona "Grafika w tle"
     wycielaby je do bieli. */
  .wpd-report-print .wpd-hbar{ padding:4px 0 !important; }
  .wpd-report-print .wpd-hbar__head{ margin-bottom:3px !important; }
  .wpd-report-print .wpd-hbar__name{ font-size:11px !important; }
  .wpd-report-print .wpd-hbar__val{ font-size:9.5px !important; }
  .wpd-report-print .wpd-hbar__track{ height:5px !important; }
  .wpd-report-print .wpd-hbar__track, .wpd-report-print .wpd-hbar__fill,
  .wpd-report-print .wpd-dot{ -webkit-print-color-adjust:exact; print-color-adjust:exact; }

  /* ── Bloki opisowe: statystyki i metodyka ── */
  .wpd-report-print .wpd-rpt-kv{ padding:1.5px 0 !important; }
  .wpd-report-print .wpd-rpt-kv span{ font-size:10.5px !important; }
  .wpd-report-print .wpd-rpt-method > div:last-child{ padding:9px 12px 11px !important;
    font-size:10.5px !important; line-height:1.45 !important; }
  .wpd-report-print .wpd-rpt-method p{ margin-bottom:6px !important; }
  .wpd-report-print .wpd-rpt-register p{ font-size:9.5px !important; padding:7px 12px 9px !important; }
  .wpd-report-print .wpd-panel > div:not(.wpd-panel__head){ padding:9px 12px 11px !important; }

  .wpd-panel{ box-shadow:none !important; }
  /* Marginesy zostaja symetryczne. Szerszy grzbiet (18 mm) bylby wygodniejszy w segregatorze,
     ale @page jest regula dokumentu, nie selektorem - ta sama wartosc obowiazuje wydruk
     generatora umow. Zmiana marginesu innej funkcji nie miesci sie w tej partii;
     propozycja opisana w raporcie do decyzji wlasciciela. */
  @page { size:A4; margin:14mm; }
}

.wpd-anl-bar__sp{ flex:1 1 auto; }
.wpd-anl-load{ font-family:'IBM Plex Mono', monospace; font-size:10px; letter-spacing:.05em; text-transform:uppercase; color:var(--faint); display:inline-flex; align-items:center; gap:7px; }
.wpd-date{ display:inline-flex; align-items:center; gap:8px; }
.wpd-date__sep{ font-family:'IBM Plex Mono', monospace; font-size:11px; color:var(--faint); }
.wpd-date input{ font-family:'IBM Plex Mono', monospace; font-size:12.5px; color:var(--ink); background:var(--surface);
  border:1px solid var(--hairline); border-radius:3px; padding:8px 10px; outline:none; cursor:pointer; }
.wpd-date input:focus{ border-color:var(--ink); }

/* słupki trendu — nakładka roku poprzedniego (YoY) */
.wpd-trend__barwrap{ position:relative; width:100%; flex:1 1 auto; display:flex; align-items:flex-end; justify-content:center; }
.wpd-trend__barwrap .wpd-trend__bar{ position:relative; z-index:1; }
.wpd-trend__bar--ghost{ position:absolute; bottom:0; left:0; right:0; margin:0 auto; z-index:0; background:transparent;
  border:1px dashed var(--faint); border-bottom:none; border-radius:2px 2px 0 0; }

/* ── Generator umów ── */
.wpd-ctr-layout{ display:grid; grid-template-columns:360px 1fr; gap:20px; align-items:start; }
/* formularz kreatora przewodników (GuideBuilder) — ten sam wzorzec dwóch kolumn */
.wpd-gb-form{ display:grid; grid-template-columns:1.6fr 1fr; gap:18px; align-items:start; }
.wpd-ctr-list{ max-height:380px; overflow-y:auto; }
.wpd-ctr-row{ cursor:pointer; border-left:2px solid transparent; transition:background .12s, border-color .12s; }
.wpd-ctr-row:hover{ background:var(--inner); }
.wpd-ctr-row--on{ background:var(--inner); border-left-color:var(--cynober); }

/* arkusz umowy */
.wpd-ctr-sheet{ background:var(--surface); border:1px solid var(--hairline); border-radius:4px; padding:46px 52px 40px; }
.wpd-ctr-title{ text-align:center; font-weight:700; font-size:22px; letter-spacing:-.02em; margin:0; }
.wpd-ctr-title em{ font-family:'Newsreader', serif; font-style:italic; font-weight:400; }
.wpd-ctr-meta{ text-align:center; font-family:'IBM Plex Mono', monospace; font-size:11px; letter-spacing:.06em;
  text-transform:uppercase; color:var(--faint); margin:10px 0 0; }
.wpd-ctr-parties{ display:grid; grid-template-columns:1fr 1fr; gap:18px; margin:28px 0 6px; }
.wpd-ctr-party{ border:1px solid var(--hairline); border-radius:4px; padding:14px 16px; }
.wpd-ctr-party b{ display:block; font-size:14px; margin:3px 0 6px; }
.wpd-ctr-party p{ font-size:12.5px; color:var(--muted); margin:2px 0; line-height:1.5; }
.wpd-ctr-h{ font-family:'IBM Plex Mono', monospace; font-weight:600; font-size:11px; letter-spacing:.09em;
  text-transform:uppercase; color:var(--muted); text-align:center; margin:24px 0 8px; }
.wpd-ctr-par{ font-size:13px; line-height:1.7; color:var(--ink); text-align:justify; margin:0 0 4px; }
.wpd-ctr-sign{ display:grid; grid-template-columns:1fr 1fr; gap:56px; margin-top:64px; }
.wpd-ctr-sign > div{ border-top:1px solid var(--ink); padding-top:9px; text-align:center; }
.wpd-ctr-empty{ border:1px dashed var(--hairline); border-radius:4px; min-height:340px; display:flex;
  flex-direction:column; align-items:center; justify-content:center; gap:12px; color:var(--faint); text-align:center;
  background-image:linear-gradient(var(--inner) 1px, transparent 1px), linear-gradient(90deg, var(--inner) 1px, transparent 1px);
  background-size:18px 18px; background-color:var(--surface); }

/* animacja „pisania" dokumentu */
.wpd-ctr-gen{ min-height:340px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20px;
  border:1px solid var(--hairline); border-radius:4px; background:var(--surface); }
.wpd-ctr-gen__paper{ width:230px; border:1px solid var(--hairline); border-radius:4px; background:var(--paper);
  padding:22px 20px; display:flex; flex-direction:column; gap:10px; }
.wpd-ctr-gen__line{ height:6px; border-radius:2px; background:var(--inner-2); transform-origin:left;
  animation:wpd-write .5s cubic-bezier(.22,1,.36,1) both; }
.wpd-ctr-gen__line--accent{ background:var(--cynober); }
@keyframes wpd-write{ from{ transform:scaleX(0); } to{ transform:scaleX(1); } }
@media (prefers-reduced-motion: reduce){ .wpd-ctr-gen__line{ animation:none; } }

/* druk — tylko arkusz umowy */
@media print{
  /* UWAGA (2026-08-18): ten blok był NIEZAKRESOWANY i ustawiał visibility:hidden na wszystkim
     przy KAZDYM wydruku w panelu, nie tylko przy umowie. Poniewaz stoi w arkuszu PO bloku
     raportu, wygrywal z nim przy rownej specyficznosci - i po zdjeciu z raportu reguly
     przywracajacej visibility raport drukowal sie niewidoczny (puste kartki u wlasciciela).
     Teraz blok dziala wylacznie wtedy, gdy na ekranie faktycznie jest arkusz umowy. */
  body:has(.wpd-ctr-sheet) *{ visibility:hidden !important; }
  .wpd-ctr-sheet, .wpd-ctr-sheet *{ visibility:visible !important; }
  .wpd-ctr-sheet{ position:absolute !important; left:0 !important; top:0 !important; width:100% !important;
    border:none !important; border-radius:0 !important; padding:0 !important; background:#fff !important; }
  .wpd-noprint{ display:none !important; }
}

/* ── Dolny pasek nawigacji + arkusz „Więcej" (mobile <980px, roadmapa X12) ── */
.wpd-bottombar{ display:none; }
.wpd-overlay--sheet{ align-items:flex-end; padding:0; }
.wpd-sheet{ width:100%; background:var(--side); color:var(--on-side); border-top:1px solid var(--side-line);
  border-radius:4px 4px 0 0; padding:14px 0 calc(78px + env(safe-area-inset-bottom));
  animation:wpd-sheet-in .22s cubic-bezier(.22,1,.36,1); }
@keyframes wpd-sheet-in{ from{ opacity:0; transform:translateY(24px); } }
.wpd-sheet .wpd-nav{ padding:0; }
.wpd-sheet__sync{ border-top:1px solid var(--side-line); margin-top:10px; padding:12px 24px 0;
  display:flex; flex-direction:column; gap:7px; }

/* ── Dotykowe pola ≥40px bez zmiany wyglądu (audyt poz. 5) ── */
.wpd-check, .wpd-cal__navbtn, .wpd-user__out, .wpd-swatch, .wpd-bc button, .wpd-sync__title{ position:relative; }
.wpd-check::after{ content:''; position:absolute; inset:-9px; }
.wpd-cal__navbtn::after{ content:''; position:absolute; inset:-5px; }
.wpd-user__out::after{ content:''; position:absolute; inset:-12px; }
.wpd-sync__title::after{ content:''; position:absolute; inset:-13px 0 -13px -13px; }
.wpd-swatch::after{ content:''; position:absolute; inset:-7px; }
.wpd-bc button::after{ content:''; position:absolute; inset:-6px; }

/* wejście sekcji */
.wpd-rise{ opacity:0; transform:translateY(10px); transition:opacity .5s ease, transform .5s cubic-bezier(.22,1,.36,1); }
.wpd-rise.is-in{ opacity:1; transform:none; }

/* wejście widoku — ten sam charakter co „pisanie" umowy w generatorze
   (ta sama krzywa cubic-bezier(.22,1,.36,1)). Odtwarzane przy każdej zmianie
   widoku dzięki atrybutowi key (remount) w ManagerApp. */
@keyframes wpd-view-in{ from{ opacity:0; transform:translateY(10px); } to{ opacity:1; transform:none; } }
.wpd-view{ animation:wpd-view-in .32s cubic-bezier(.22,1,.36,1) both; }

/* ═══ MODUŁ ZADANIA (E3) ═══════════════════════════════════════════════════════
   Blok z design_handoff_zadania/tokens-zadania.css — namespace .wpd-tk-* i .wpd-sel.
   Wyłącznie tokeny var(--...), zero cieni i gradientów, radius 3px kontrolki /
   4px panele. UWAGA: ten plik to szablon JS w odwróconych apostrofach — komentarze
   bez tego znaku. */

/* ── Pasek liczników ── */
.wpd-tk-bar{ display:flex; align-items:stretch; background:var(--surface);
  border:1px solid var(--hairline); border-radius:4px; margin-bottom:20px; overflow:hidden; }
.wpd-tk-bar__cell{ padding:16px 22px 18px; border-right:1px solid var(--hairline); min-width:150px; }
.wpd-tk-bar__hint{ flex:1 1 auto; padding:16px 22px; display:flex; align-items:center;
  justify-content:flex-end; gap:10px; }
.wpd-tk-bar__hint p{ font-size:12.5px; color:var(--muted); max-width:290px; margin:0; text-wrap:pretty; }
.wpd-tk-bar__hint svg{ width:17px; height:17px; color:var(--cynober); flex:0 0 17px; }
.wpd-tk-num{ font-family:'IBM Plex Mono', monospace; font-weight:600; font-size:22px; color:var(--ink); }
.wpd-tk-num--over{ color:var(--cynober); }

/* licznik przewijający cyfry: kolumna 0-9 przesuwana o -cyfra × 40px (transform z JS) */
.wpd-tk-roll{ display:flex; align-items:center; gap:1px; height:40px; overflow:hidden; }
.wpd-tk-roll__col{ display:inline-flex; height:40px; overflow:hidden; }
.wpd-tk-roll__strip{ display:flex; flex-direction:column;
  font-family:'IBM Plex Mono', monospace; font-weight:600; font-size:33px; letter-spacing:-.02em;
  color:var(--ink); transition:transform .55s cubic-bezier(.22,1,.36,1); }
.wpd-tk-roll__strip span{ height:40px; line-height:40px; }

/* ── Oś przypisania ── */
/* wejście panelu osi wg README („Interakcje"): .45s od opacity 0 / translateY(10px) */
.wpd-tk-axis-in{ animation:wpd-tk-rise .45s cubic-bezier(.22,1,.36,1) both; }
.wpd-tk-axis__head{ display:flex; align-items:center; gap:14px; padding:15px 20px;
  border-bottom:1px solid var(--hairline); }
.wpd-tk-axis__leg{ display:inline-flex; align-items:center; gap:6px;
  font-family:'IBM Plex Mono', monospace; font-size:10px; letter-spacing:.05em;
  text-transform:uppercase; color:var(--muted); }
.wpd-tk-axis__swatch{ width:14px; height:6px; border-radius:2px; }
.wpd-tk-axis__swatch--free{ border:1px dashed var(--hairline); }
/* na wąskim ekranie oś przewija się u siebie jak kalendarz (.wpd-cal__scroll/__inner),
   strona stoi — pełny projekt mobilny modułu jest świadomie poza tą partią (README) */
.wpd-tk-axis__scroll{ overflow-x:auto; }
.wpd-tk-axis__inner{ min-width:720px; }
.wpd-tk-axis__headrow, .wpd-tk-axis__row{ display:grid; grid-template-columns:196px 1fr; }
.wpd-tk-axis__row{ border-top:1px solid var(--hairline); }
.wpd-tk-axis__corner{ border-right:1px solid var(--hairline); }
.wpd-tk-axis__dnum{ text-align:center; padding:9px 0 8px; border-left:1px solid var(--inner); }
.wpd-tk-axis__dnum b{ display:block; font-family:'IBM Plex Mono', monospace; font-size:12px;
  font-weight:500; color:var(--muted); }
.wpd-tk-axis__dnum span{ font-family:'IBM Plex Mono', monospace; font-size:8.5px;
  text-transform:uppercase; color:var(--faint); }
.wpd-tk-axis__dnum--today b, .wpd-tk-axis__dnum--today span{ color:var(--cynober); font-weight:600; }
.wpd-tk-axis__label{ padding:14px 18px; border-right:1px solid var(--hairline); position:relative; }
.wpd-tk-axis__objname{ font-weight:600; font-size:14px; }
.wpd-tk-axis__objsub{ font-family:'IBM Plex Mono', monospace; font-size:9.5px; letter-spacing:.05em;
  text-transform:uppercase; color:var(--faint); margin-top:3px; }
.wpd-tk-axis__track{ position:relative; }
.wpd-tk-axis__cells{ display:grid; grid-template-columns:repeat(7,1fr); min-height:56px; height:100%; }
.wpd-tk-cell{ position:relative; border-left:1px solid var(--inner); transition:background-color .18s; }
.wpd-tk-cell--free{ cursor:cell; }
.wpd-tk-cell--weekend{ background:color-mix(in srgb, var(--inner) 45%, var(--surface)); }
.wpd-tk-cell__glow{ position:absolute; left:0; right:0; top:0; height:2px; background:var(--cynober);
  transform:scaleX(0); transform-origin:left; transition:transform .22s cubic-bezier(.22,1,.36,1); }
/* stan celu przeciągania — ustawiany klasą z JS, nie hoverem */
.wpd-tk-cell--target{ background:var(--tint-cynober); }
.wpd-tk-cell--target .wpd-tk-cell__glow{ transform:scaleX(1); }

.wpd-tk-bar-res{ position:absolute; top:12px; height:32px; border-radius:3px; display:flex;
  align-items:center; gap:8px; padding:0 10px; cursor:pointer; z-index:2; border:none;
  font-family:inherit; text-align:left;
  transition:transform .18s cubic-bezier(.22,1,.36,1), filter .18s; }
.wpd-tk-bar-res:hover{ filter:brightness(1.12); }
.wpd-tk-bar-res--clipL{ border-radius:0 3px 3px 0; }
.wpd-tk-bar-res--clipR{ border-radius:3px 0 0 3px; }
.wpd-tk-bar-res__guest{ font-size:12px; font-weight:600; color:#fff; overflow:hidden;
  white-space:nowrap; text-overflow:ellipsis; }
.wpd-tk-bar-res__src{ font-family:'IBM Plex Mono', monospace; font-size:9px; letter-spacing:.06em;
  text-transform:uppercase; color:rgba(255,255,255,.72); }
.wpd-tk-bar-res__add{ margin-left:auto; display:inline-flex; align-items:center; gap:5px; flex:0 0 auto; }
.wpd-tk-bar-res__add svg{ width:13px; height:13px; color:rgba(255,255,255,.85); }
.wpd-tk-bar-res--target{ transform:scale(1.045); outline:1px solid var(--cynober); outline-offset:2px; }
/* klawiaturowa ścieżka przypisania — ten sam idiom co .wpd-cal__add */
.wpd-tk-axis__add{ position:absolute; top:50%; right:12px; transform:translateY(-50%); width:24px;
  height:24px; border:1px solid var(--hairline); background:var(--surface); border-radius:3px;
  color:var(--muted); display:inline-flex; align-items:center; justify-content:center; cursor:pointer;
  opacity:0; transition:opacity .14s; }
.wpd-tk-axis__row:hover .wpd-tk-axis__add, .wpd-tk-axis__add:focus-visible{ opacity:1; }
.wpd-tk-axis__add:hover{ border-color:var(--ink); color:var(--ink); }
.wpd-tk-axis__add svg{ width:13px; height:13px; }
@media (hover:none){ .wpd-tk-axis__add{ opacity:1; } }

/* ── Układ listy + skrzynki ── */
/* flex-wrap, nie sztywne kolumny: przy panelu ~900px kolumna listy schodziła do 265px
   i kartki nachodziły na siebie (tekst łamał się po jednym słowie). */
.wpd-tk-layout{ display:flex; flex-wrap:wrap; gap:20px; margin-top:22px; align-items:flex-start; }
.wpd-tk-list{ flex:1 1 560px; min-width:0; }
.wpd-tk-side{ flex:1 1 300px; max-width:340px; position:sticky; top:96px;
  display:flex; flex-direction:column; gap:14px; }
.wpd-tk-toolbar{ display:flex; align-items:center; gap:12px; margin-bottom:18px; }
.wpd-tk-toolbar__count{ font-family:'IBM Plex Mono', monospace; font-size:10px; letter-spacing:.07em;
  text-transform:uppercase; color:var(--faint); }

/* ── Sekcje dnia i podgrupy obiektów ── */
.wpd-tk-sec{ margin-bottom:26px; }
.wpd-tk-sec__head{ display:flex; align-items:baseline; gap:12px; padding:0 2px 9px;
  border-bottom:1px solid var(--hairline); }
.wpd-tk-sec__title{ font-size:18px; font-weight:700; letter-spacing:-.025em; }
.wpd-tk-sec__sub{ font-family:'IBM Plex Mono', monospace; font-size:10.5px; letter-spacing:.08em;
  text-transform:uppercase; color:var(--label); }
.wpd-tk-sec__count{ margin-left:auto; font-family:'IBM Plex Mono', monospace; font-size:11px;
  color:var(--muted); }
.wpd-tk-sec--over .wpd-tk-sec__head{ border-bottom-color:var(--cynober); }
.wpd-tk-sec--over .wpd-tk-sec__title, .wpd-tk-sec--over .wpd-tk-sec__count{ color:var(--cynober); }
.wpd-tk-grp{ margin-top:15px; }
.wpd-tk-grp__head{ display:flex; align-items:center; gap:9px; margin-bottom:9px; }
.wpd-tk-grp__name{ font-family:'IBM Plex Mono', monospace; font-size:10px; font-weight:500;
  letter-spacing:.1em; text-transform:uppercase; color:var(--muted); }
.wpd-tk-grp__rule{ flex:1 1 auto; height:1px; background:var(--hairline); }
.wpd-tk-grp__items{ display:flex; flex-direction:column; gap:8px; }
.wpd-tk-dot{ width:8px; height:8px; border-radius:2px; flex:0 0 8px; }

/* ── Kartka zadania ── */
.wpd-tk-card{ position:relative; background:var(--surface); border:1px solid var(--hairline);
  border-radius:4px; padding:13px 16px 13px 20px; cursor:grab; touch-action:none;
  animation:wpd-tk-in .34s cubic-bezier(.22,1,.36,1) both;
  transition:border-color .16s, background-color .3s; }
.wpd-tk-card:hover{ border-color:var(--ink); }
.wpd-tk-card--flash{ animation:wpd-tk-flash .95s ease-out both; }
/* kartka szablonowa nie ma uchwytu przeciągania (materializacja = partia 2) */
.wpd-tk-card--static{ cursor:default; touch-action:auto; }
.wpd-tk-card__prio{ position:absolute; left:0; top:0; bottom:0; width:3px; border-radius:3px 0 0 3px;
  transform-origin:left; }
.wpd-tk-card__prio--hi{ background:var(--cynober); }
.wpd-tk-card__prio--mid{ background:var(--amber); }
.wpd-tk-card__prio--low{ background:var(--hairline); }
.wpd-tk-card__prio--pulse{ animation:wpd-tk-pulse 1.8s ease-in-out infinite; }
.wpd-tk-card__body{ display:flex; align-items:flex-start; gap:13px; }
.wpd-tk-card__main{ flex:1 1 auto; min-width:0; }
.wpd-tk-card__grip{ flex:0 0 14px; display:flex; align-items:center; padding-top:4px; }
.wpd-tk-card__grip svg{ width:14px; height:14px; color:var(--hairline); }
.wpd-tk-card__titlewrap{ position:relative; display:inline-block; max-width:100%; }
.wpd-tk-card__title{ font-size:14.5px; font-weight:600; letter-spacing:-.01em; line-height:1.35;
  color:var(--ink); }
.wpd-tk-card--done .wpd-tk-card__title{ color:var(--faint); }
.wpd-tk-card__strike{ position:absolute; left:0; right:0; top:53%; height:1px; background:var(--faint);
  transform-origin:left; animation:wpd-tk-strike .3s cubic-bezier(.22,1,.36,1) both; }
.wpd-tk-card__meta{ display:flex; align-items:center; flex-wrap:wrap; gap:11px; margin-top:8px; }
.wpd-tk-card__note{ font-family:'Newsreader', serif; font-style:italic; font-size:14px;
  color:var(--muted); margin:9px 0 0; padding-left:11px; border-left:1px solid var(--hairline);
  line-height:1.5; text-wrap:pretty; }
/* klawiaturowa droga przypisania z kartki — widoczna na hover/focus jak .wpd-cal__add */
.wpd-tk-card__assign{ display:inline-flex; align-items:center; gap:5px; background:transparent;
  border:1px solid var(--hairline); border-radius:3px; padding:3px 7px; cursor:pointer;
  font-family:'IBM Plex Mono', monospace; font-size:10px; letter-spacing:.05em; color:var(--muted);
  opacity:0; transition:opacity .14s, border-color .14s, color .14s; }
.wpd-tk-card:hover .wpd-tk-card__assign, .wpd-tk-card__assign:focus-visible{ opacity:1; }
.wpd-tk-card__assign:hover{ border-color:var(--ink); color:var(--ink); }
.wpd-tk-card__assign svg{ width:11px; height:11px; }
@media (hover:none){ .wpd-tk-card__assign{ opacity:1; } }

/* checkbox zadania (ptaszek rysowany) */
.wpd-tk-check{ width:22px; height:22px; flex:0 0 22px; border:1px solid var(--hairline);
  background:transparent; border-radius:3px; display:flex; align-items:center; justify-content:center;
  cursor:pointer; padding:0; margin-top:1px; transition:border-color .16s, background-color .16s; }
.wpd-tk-check:hover{ border-color:var(--green); }
.wpd-tk-check--on{ background:var(--green); border-color:var(--green); }
/* ptaszek to lucide Check — biel i grubsza kreska (README: 13px, stroke 2.6) nadane tu,
   a rysowanie stroke-dashoffset na jego wewnętrznej ścieżce */
.wpd-tk-check svg{ width:13px; height:13px; stroke-width:2.6; color:#fff; }
.wpd-tk-check--on svg path{ stroke-dasharray:30; animation:wpd-tk-draw .42s cubic-bezier(.22,1,.36,1) both; }

/* mikro-elementy wiersza meta */
.wpd-tk-time{ display:inline-flex; align-items:center; gap:5px; font-family:'IBM Plex Mono', monospace;
  font-size:11px; color:var(--muted); }
.wpd-tk-time svg{ width:12px; height:12px; color:var(--faint); }
.wpd-tk-over{ font-family:'IBM Plex Mono', monospace; font-size:9.5px; letter-spacing:.06em;
  text-transform:uppercase; color:var(--cynober); background:var(--tint-cynober);
  border:1px solid #EBD3CB; border-radius:3px; padding:3px 7px; }
.wpd-tk-res{ display:inline-flex; align-items:center; gap:6px; background:var(--inner);
  border:1px solid var(--hairline); border-radius:3px; padding:3px 8px 3px 7px; }
.wpd-tk-res__dot{ width:7px; height:7px; border-radius:2px; }
.wpd-tk-res__guest{ font-size:11.5px; font-weight:600; color:var(--ink); }
.wpd-tk-res__src{ font-family:'IBM Plex Mono', monospace; font-size:9px; letter-spacing:.06em;
  text-transform:uppercase; color:var(--faint); }
.wpd-tk-tag{ font-family:'IBM Plex Mono', monospace; font-size:9px; letter-spacing:.08em;
  text-transform:uppercase; color:var(--label); border:1px solid var(--hairline); border-radius:3px;
  padding:3px 6px; }
.wpd-tk-mini{ display:inline-flex; align-items:center; gap:5px; font-family:'IBM Plex Mono', monospace;
  font-size:9.5px; letter-spacing:.05em; text-transform:uppercase; color:var(--faint); }
.wpd-tk-mini svg{ width:12px; height:12px; }
/* etykieta priorytetu: --hairline jako TEKST daje 1,2:1 — używać tylko na pasku 3px */
.wpd-tk-prio{ font-family:'IBM Plex Mono', monospace; font-size:9px; letter-spacing:.07em;
  text-transform:uppercase; }
.wpd-tk-prio--hi{ color:var(--cynober); }
.wpd-tk-prio--mid{ color:var(--amber-ink); }
.wpd-tk-prio--low{ color:var(--faint); }

/* checklista */
.wpd-tk-subs__btn{ display:inline-flex; align-items:center; gap:6px; background:transparent;
  border:1px solid var(--hairline); border-radius:3px; padding:3px 7px; cursor:pointer;
  font-family:'IBM Plex Mono', monospace; font-size:10px; letter-spacing:.05em; color:var(--muted);
  transition:border-color .14s, color .14s; }
.wpd-tk-subs__btn:hover{ border-color:var(--ink); color:var(--ink); }
.wpd-tk-subs__btn svg{ width:12px; height:12px; }
.wpd-tk-subs__chev{ transition:transform .26s cubic-bezier(.22,1,.36,1); }
.wpd-tk-subs__btn--open .wpd-tk-subs__chev{ transform:rotate(180deg); }
.wpd-tk-subs{ margin-top:11px; padding-top:11px; border-top:1px solid var(--hairline);
  display:flex; flex-direction:column; gap:2px; }
/* kaskada: opóźnienie ustawiane inline przez animationDelay = indeks × 55 ms */
.wpd-tk-sub{ display:flex; align-items:center; gap:10px; background:transparent; border:none;
  padding:5px 0; cursor:pointer; text-align:left; font-family:inherit;
  animation:wpd-tk-sub .38s cubic-bezier(.34,1.56,.64,1) both; }
.wpd-tk-sub__box{ width:16px; height:16px; flex:0 0 16px; border:1px solid var(--hairline);
  border-radius:2px; display:flex; align-items:center; justify-content:center; }
.wpd-tk-sub__box--on{ background:var(--green); border-color:var(--green); }
.wpd-tk-sub__box svg{ width:10px; height:10px; stroke-width:3; color:#fff; }
.wpd-tk-sub__txt{ font-size:13px; color:var(--ink); }
.wpd-tk-sub--done .wpd-tk-sub__txt{ color:var(--faint); text-decoration:line-through; }

/* ── Skrzynka „Do przypisania" ── */
.wpd-tk-inbox{ background:var(--surface); border:1px solid var(--ink); border-radius:4px; overflow:hidden; }
.wpd-tk-inbox__head{ display:flex; align-items:center; gap:10px; padding:14px 16px;
  border-bottom:1px solid var(--hairline); }
.wpd-tk-inbox__head svg{ width:16px; height:16px; color:var(--cynober); }
.wpd-tk-inbox__title{ font-weight:700; font-size:15px; letter-spacing:-.02em; margin:0; }
.wpd-tk-inbox__count{ margin-left:auto; font-family:'IBM Plex Mono', monospace; font-size:11px;
  color:var(--faint); }
.wpd-tk-inbox__body{ padding:12px; display:flex; flex-direction:column; gap:8px; }
.wpd-tk-inbox__empty{ border:1px dashed var(--hairline); border-radius:4px; padding:22px 14px;
  text-align:center; font-family:'Newsreader', serif; font-style:italic; font-size:15px; color:var(--faint); }
.wpd-tk-card--compact{ background:var(--paper); padding:11px 12px 11px 17px; }
.wpd-tk-card--compact:hover{ transform:translateX(2px); }
.wpd-tk-card--compact .wpd-tk-card__title{ font-size:13.5px; line-height:1.4; }

/* kafel instrukcji */
.wpd-tk-howto{ background:var(--ink); border-radius:4px; padding:16px 18px; }
.wpd-tk-howto__title{ font-family:'IBM Plex Mono', monospace; font-size:9.5px; letter-spacing:.12em;
  text-transform:uppercase; color:var(--on-side-label); margin:0 0 12px; }
.wpd-tk-howto__row{ display:flex; gap:10px; padding:7px 0; }
.wpd-tk-howto__num{ font-family:'IBM Plex Mono', monospace; font-size:10px; color:var(--cynober);
  flex:0 0 14px; }
.wpd-tk-howto__txt{ font-size:12.5px; color:var(--on-side); line-height:1.5; }
.wpd-tk-howto__txt b{ color:#fff; font-weight:600; }

/* ── Przeciąganie: klon i plakietka celu (tworzone z JS w warstwie fixed) ── */
.wpd-tk-layer{ position:fixed; inset:0; pointer-events:none; z-index:900; }
.wpd-tk-ghost{ position:fixed; z-index:910; pointer-events:none; background:var(--surface);
  border-color:var(--ink); animation:none; will-change:transform; }
.wpd-tk-snap{ position:fixed; z-index:915; pointer-events:none; background:var(--ink); color:#fff;
  border-radius:3px; padding:6px 9px; font-family:'IBM Plex Mono', monospace; font-size:10.5px;
  letter-spacing:.05em; text-transform:uppercase; white-space:nowrap; opacity:0;
  transform:translateY(4px); transition:opacity .16s, transform .16s; }
.wpd-tk-snap--on{ opacity:1; transform:translateY(0); }

/* ── Szybkie zadanie (popover) ── */
/* scrim jest jednocześnie .wpd-overlay (Escape z useDialogA11y szuka dialogu w overlay'u);
   nadpisujemy jego wygląd na wartości z handoffu: przygaszenie .28, bez blura i animacji */
.wpd-tk-pop__scrim{ position:fixed; inset:0; background:rgba(23,21,15,.28); z-index:920;
  backdrop-filter:none; animation:none; padding:0; display:block; }
/* top/left/max-height liczone w JS: max-height = innerHeight - top - 16 */
.wpd-tk-pop{ position:fixed; width:352px; background:var(--paper); border:1px solid var(--ink);
  border-radius:4px; z-index:930; overflow:hidden; display:flex; flex-direction:column;
  transform-origin:top left; animation:wpd-tk-pop .26s cubic-bezier(.22,1,.36,1) both; }
.wpd-tk-pop__head{ flex:0 0 auto; display:flex; align-items:flex-start; gap:12px; padding:15px 16px;
  background:var(--surface); border-bottom:1px solid var(--hairline); }
.wpd-tk-pop__ic{ width:34px; height:34px; flex:0 0 34px; border:1px solid var(--hairline);
  border-radius:3px; background:var(--paper); display:flex; align-items:center; justify-content:center;
  color:var(--cynober); }
.wpd-tk-pop__ic svg{ width:17px; height:17px; }
.wpd-tk-pop__title{ font-weight:700; font-size:15.5px; letter-spacing:-.02em; margin:0; }
.wpd-tk-pop__sub{ font-family:'IBM Plex Mono', monospace; font-size:9.5px; letter-spacing:.07em;
  text-transform:uppercase; color:var(--faint); margin:3px 0 0; }
.wpd-tk-pop__close{ width:30px; height:30px; flex:0 0 30px; border:1px solid var(--hairline);
  background:transparent; border-radius:3px; display:flex; align-items:center; justify-content:center;
  cursor:pointer; color:var(--muted); transition:border-color .14s; }
.wpd-tk-pop__close:hover{ border-color:var(--ink); }
.wpd-tk-pop__close svg{ width:15px; height:15px; }
/* środek przewijalny, stopka przyklejona — inaczej „Dodaj zadanie" wychodzi poza ekran
   przy otwartym kalendarzu */
.wpd-tk-pop__body{ flex:1 1 auto; min-height:0; overflow-y:auto; padding:15px 16px; }
.wpd-tk-pop__label{ font-family:'IBM Plex Mono', monospace; font-size:9.5px; font-weight:500;
  letter-spacing:.09em; text-transform:uppercase; color:var(--label); margin:15px 0 7px; }
.wpd-tk-pop__label--first{ margin-top:0; }
.wpd-tk-pop__foot{ flex:0 0 auto; display:flex; gap:10px; padding:13px 16px;
  border-top:1px solid var(--hairline); background:var(--surface); }
.wpd-tk-pop__foot .wpd-btn{ flex:1; }
.wpd-tk-pop__foot .wpd-btn--primary{ flex:1.4; }
.wpd-tk-chips{ display:flex; flex-wrap:wrap; gap:6px; }
.wpd-tk-chip{ display:inline-flex; align-items:center; gap:6px; height:32px; padding:0 10px;
  background:var(--surface); border:1px solid var(--hairline); border-radius:3px; cursor:pointer;
  font-family:inherit; font-size:12px; font-weight:600; color:var(--ink);
  transition:border-color .14s, background-color .14s; }
.wpd-tk-chip:hover{ border-color:var(--ink); }
.wpd-tk-chip__kind{ font-family:'IBM Plex Mono', monospace; font-size:9px; letter-spacing:.07em;
  text-transform:uppercase; opacity:.72; }
.wpd-tk-chip--on{ background:var(--ink); border-color:var(--ink); color:var(--surface); }
.wpd-tk-prio-row{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:3px; background:var(--inner);
  border:1px solid var(--hairline); border-radius:3px; padding:3px; }
.wpd-tk-prio-btn{ border:none; background:transparent; color:var(--muted); cursor:pointer;
  font-family:'IBM Plex Mono', monospace; font-size:10px; font-weight:500; letter-spacing:.06em;
  text-transform:uppercase; padding:8px 2px; border-radius:2px;
  transition:background-color .16s, color .16s; }
.wpd-tk-prio-btn--on{ background:var(--ink); color:#fff; }
.wpd-tk-timegrid{ display:grid; grid-template-columns:1fr 104px; gap:12px; margin-top:15px; }
.wpd-tk-timegrid .wpd-tk-pop__label{ margin-top:0; }
.wpd-tk-time-input{ width:100%; padding:9px 11px; background:var(--surface);
  border:1px solid var(--hairline); border-radius:3px; font-family:'IBM Plex Mono', monospace;
  font-size:13px; color:var(--ink); outline:none; transition:border-color .14s; }
.wpd-tk-time-input:focus{ border-color:var(--ink); }
.wpd-tk-time-input::placeholder{ color:var(--faint); }

/* ── Kalendarz z zajętością ── */
.wpd-tk-cal{ margin-top:11px; background:var(--surface); border:1px solid var(--hairline);
  border-radius:4px; padding:12px; animation:wpd-tk-pop .26s cubic-bezier(.22,1,.36,1) both;
  transform-origin:top center; }
.wpd-tk-cal__head{ display:flex; align-items:center; gap:10px; margin-bottom:10px; }
.wpd-tk-cal__month{ font-weight:700; font-size:14px; letter-spacing:-.02em; }
.wpd-tk-cal__propname{ font-family:'IBM Plex Mono', monospace; font-size:9.5px; letter-spacing:.07em;
  text-transform:uppercase; color:var(--faint); }
.wpd-tk-cal__leg{ margin-left:auto; display:inline-flex; align-items:center; gap:5px;
  font-family:'IBM Plex Mono', monospace; font-size:9px; letter-spacing:.05em;
  text-transform:uppercase; color:var(--faint); }
.wpd-tk-cal__legsw{ width:10px; height:10px; border-radius:2px; background:var(--inner);
  border:1px solid var(--hairline); }
.wpd-tk-cal__dows, .wpd-tk-cal__grid{ display:grid; grid-template-columns:repeat(7,1fr); gap:2px; }
.wpd-tk-cal__dows{ margin-bottom:4px; }
.wpd-tk-cal__dow{ text-align:center; font-family:'IBM Plex Mono', monospace; font-size:8.5px;
  letter-spacing:.06em; text-transform:uppercase; color:var(--label); }
.wpd-tk-cal__dow--we{ color:var(--cynober); }
.wpd-tk-cal__day{ position:relative; height:34px; border:1px solid var(--hairline);
  background:transparent; border-radius:3px; cursor:pointer; padding:0;
  font-family:'IBM Plex Mono', monospace; font-size:11.5px; color:var(--ink);
  transition:border-color .14s, background-color .14s, transform .14s cubic-bezier(.22,1,.36,1); }
.wpd-tk-cal__day:hover{ border-color:var(--ink); transform:scale(1.06); }
.wpd-tk-cal__day--pad{ border-color:transparent; cursor:default; }
.wpd-tk-cal__day--busy{ background:var(--inner); }
.wpd-tk-cal__day--today{ border-color:var(--cynober); font-weight:600; }
.wpd-tk-cal__day--we{ color:var(--muted); }
.wpd-tk-cal__day--holiday{ color:var(--cynober); }
.wpd-tk-cal__day--on{ background:var(--ink); border-color:var(--ink); color:var(--surface); font-weight:600; }
.wpd-tk-cal__busybar{ position:absolute; left:4px; right:4px; bottom:3px; height:2px; border-radius:1px; }
.wpd-tk-cal__hint{ font-family:'IBM Plex Mono', monospace; font-size:10px; letter-spacing:.04em;
  color:var(--muted); margin:10px 0 0; line-height:1.5; min-height:15px; }

/* ── Custom select (zamiennik .wpd-select) ── */
.wpd-sel{ position:relative; }
.wpd-sel__btn{ display:inline-flex; align-items:center; gap:11px; height:38px; padding:0 13px;
  background:var(--surface); border:1px solid var(--hairline); border-radius:3px; cursor:pointer;
  font-family:inherit; transition:border-color .16s; }
.wpd-sel__btn:hover, .wpd-sel__btn--open{ border-color:var(--ink); }
.wpd-sel__label{ font-family:'IBM Plex Mono', monospace; font-size:9.5px; letter-spacing:.1em;
  text-transform:uppercase; color:var(--label); }
.wpd-sel__dot{ width:7px; height:7px; border-radius:2px; flex:0 0 7px; }
.wpd-sel__value{ font-size:13.5px; font-weight:600; color:var(--ink); }
.wpd-sel__chev{ width:13px; height:13px; color:var(--faint);
  transition:transform .24s cubic-bezier(.22,1,.36,1); }
.wpd-sel__btn--open .wpd-sel__chev{ transform:rotate(180deg); }
.wpd-sel__menu{ position:absolute; top:calc(100% + 6px); left:0; width:262px; background:var(--surface);
  border:1px solid var(--ink); border-radius:4px; padding:5px; z-index:60; transform-origin:top left;
  animation:wpd-tk-pop .24s cubic-bezier(.22,1,.36,1) both; }
/* kaskada pozycji: animationDelay = indeks × 35 ms (inline) */
.wpd-sel__opt{ display:flex; align-items:center; gap:10px; width:100%; padding:9px 10px;
  background:transparent; border:none; border-radius:3px; cursor:pointer; font-family:inherit;
  text-align:left; animation:wpd-tk-sub .3s cubic-bezier(.22,1,.36,1) both;
  transition:background-color .14s; }
.wpd-sel__opt:hover{ background:var(--inner); }
.wpd-sel__opt--on{ background:var(--inner); }
.wpd-sel__opt--on .wpd-sel__optname{ font-weight:600; }
.wpd-sel__optname{ font-size:13.5px; font-weight:500; color:var(--ink); }
.wpd-sel__optcount{ margin-left:auto; font-family:'IBM Plex Mono', monospace; font-size:10.5px;
  color:var(--faint); }
.wpd-sel__check{ width:13px; height:13px; color:var(--cynober); }

/* ── Zdjęcia zadania (partia 2) ── */
.wpd-tk-photos{ display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
.wpd-tk-photo{ position:relative; margin:0; border:1px solid var(--hairline); border-radius:4px;
  overflow:hidden; background:var(--inner); }
.wpd-tk-photo img{ display:block; width:100%; height:96px; object-fit:cover; }
.wpd-tk-photo__del{ position:absolute; top:6px; right:6px; width:26px; height:26px;
  border:1px solid var(--hairline); background:var(--surface); border-radius:3px; cursor:pointer;
  display:flex; align-items:center; justify-content:center; color:var(--muted);
  transition:border-color .14s, color .14s; }
.wpd-tk-photo__del:hover{ border-color:var(--cynober); color:var(--cynober); }
.wpd-tk-photo__del svg{ width:13px; height:13px; }

/* komunikaty dla czytnika ekranu (aria-live po przypisaniu) */
.wpd-tk-sr{ position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden;
  clip:rect(0,0,0,0); white-space:nowrap; border:0; }

/* dotykowe pola co najmniej 40px — konwencja z audytu poz. 5 */
.wpd-tk-check, .wpd-tk-subs__btn, .wpd-tk-sub__box, .wpd-tk-axis__add, .wpd-tk-card__assign,
.wpd-tk-pop__close{ position:relative; }
.wpd-tk-check::after{ content:''; position:absolute; inset:-9px; }
.wpd-tk-subs__btn::after{ content:''; position:absolute; inset:-7px; }
.wpd-tk-axis__add::after{ content:''; position:absolute; inset:-8px; }
.wpd-tk-card__assign::after{ content:''; position:absolute; inset:-7px; }
.wpd-tk-pop__close::after{ content:''; position:absolute; inset:-5px; }

/* ── Klatki kluczowe ── */
@keyframes wpd-tk-rise{ from{ opacity:0; transform:translateY(10px); } }
@keyframes wpd-tk-in{ from{ opacity:0; transform:translateY(7px); } }
@keyframes wpd-tk-pulse{ 0%,100%{ opacity:1; transform:scaleX(1); } 50%{ opacity:.45; transform:scaleX(2.2); } }
@keyframes wpd-tk-draw{ from{ stroke-dashoffset:30; } to{ stroke-dashoffset:0; } }
@keyframes wpd-tk-strike{ from{ transform:scaleX(0); } to{ transform:scaleX(1); } }
@keyframes wpd-tk-pop{ from{ opacity:0; transform:scale(.94) translateY(-6px); } }
@keyframes wpd-tk-sub{ from{ opacity:0; transform:translateX(-10px); } }
@keyframes wpd-tk-sheet{ from{ opacity:0; transform:scale(.96) translateY(-10px); } }
@keyframes wpd-tk-flash{ 0%{ background:var(--tint-cynober); border-color:var(--cynober); }
  100%{ background:var(--surface); border-color:var(--hairline); } }

@media (prefers-reduced-motion: reduce){
  .wpd-trend__bar{ transition:none !important; }
  .wpd-hbar__fill{ transition:none !important; }
  .wpd-rise{ transition:none !important; opacity:1 !important; transform:none !important; }
  .wpd-view{ animation:none !important; }
  .wpd-overlay, .wpd-dialog{ animation:none !important; }
  /* spinnery zostają (informacja o trwającej operacji), ale spokojniejsze */
  .wpd-spin, .wpd-spin--xs, .wpd-rotate{ animation-duration:2s; }
  .wpd-sheet{ animation:none !important; }
  /* moduł Zadania (E3): bez wejść, pulsowania i kaskad; przeciąganie zostaje (to funkcja),
     jego stonowanie robi useTaskDrag (tilt 0, doganianie .55, skala 1.01) */
  .wpd-tk-card, .wpd-tk-pop, .wpd-tk-cal, .wpd-sel__menu, .wpd-sel__opt, .wpd-tk-sub,
  .wpd-tk-axis-in{ animation:none !important; }
  .wpd-tk-card__prio--pulse{ animation:none !important; }
  .wpd-tk-card__strike, .wpd-tk-check--on svg path{ animation:none !important; }
  .wpd-tk-roll__strip{ transition:none !important; }
  .wpd-tk-cal__day:hover{ transform:none !important; }
  .wpd-tk-card--compact:hover{ transform:none !important; }
}

/* ── Responsywność ── */
@media (max-width:980px){
  .wpd-side{ display:none; }
  .wpd-ctr-layout, .wpd-gb-form{ grid-template-columns:1fr; }
  .wpd-cells{ grid-template-columns:1fr; }
  .wpd-fgrid{ grid-template-columns:1fr; }
  .wpd-bottombar{ position:fixed; left:0; right:0; bottom:0; z-index:70;
    display:grid; grid-template-columns:repeat(5,1fr); gap:2px;
    background:var(--side); border-top:1px solid var(--side-line);
    padding:6px 6px calc(6px + env(safe-area-inset-bottom)); }
  .wpd-bottombar__item{ display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px;
    min-height:48px; background:none; border:none; border-radius:3px; cursor:pointer;
    color:var(--on-side-faint); font-family:'IBM Plex Mono', monospace; font-size:9px;
    font-weight:500; letter-spacing:.05em; text-transform:uppercase; }
  .wpd-bottombar__item svg{ width:19px; height:19px; }
  .wpd-bottombar__item--active{ color:#fff; }
  .wpd-bottombar__item--active svg{ color:var(--cynober); }
  /* widget zadań nad paskiem */
  .wpd-taskwidget{ bottom:86px !important; }
  /* ── moduł Zadania < 980 px (partia 2, README §Responsywność) ── */
  .wpd-tk-bar{ flex-wrap:wrap; }
  .wpd-tk-bar__hint{ border-top:1px solid var(--hairline); justify-content:flex-start; }
  .wpd-tk-axis__head{ flex-wrap:wrap; row-gap:6px; }
  /* skrzynka NAD listą jako poziomy pasek kartek (order, nie zmiana DOM) */
  .wpd-tk-layout{ flex-direction:column; }
  .wpd-tk-side{ position:static; max-width:none; order:-1; width:100%; }
  .wpd-tk-inbox__body{ flex-direction:row; overflow-x:auto; }
  .wpd-tk-inbox__body .wpd-tk-card--compact{ flex:0 0 240px; }
  .wpd-tk-inbox__empty{ flex:1 1 auto; }
  /* kafel JAK PRZYPISAĆ opisuje przeciąganie myszą — na dotyku przypisuje przycisk
     „Przypisz", więc instrukcja schodzi z ekranu (decyzja partii 2) */
  .wpd-tk-howto{ display:none; }
  /* kartki mają przewijać listę palcem; przeciąganie dotykiem wyłącza useTaskDrag */
  .wpd-tk-card{ touch-action:pan-y; }
  /* popover „Szybkie zadanie" jako arkusz od dołu (.wpd-sheet, wpd-sheet-in);
     top/left liczone w JS pod desktop — stąd twarde nadpisania */
  .wpd-tk-pop{ top:auto !important; left:0 !important; right:0; bottom:0; width:auto;
    max-height:min(80vh, 100%) !important; border-left:none; border-right:none; border-bottom:none;
    border-radius:4px 4px 0 0; transform-origin:bottom center;
    animation:wpd-sheet-in .22s cubic-bezier(.22,1,.36,1) both;
    padding-bottom:env(safe-area-inset-bottom); }
  .wpd-stats{ grid-template-columns:repeat(2,1fr); }
  .wpd-kpi{ grid-template-columns:repeat(2,1fr); }
  .wpd-grid-2{ grid-template-columns:1fr; }
  .wpd-objs{ grid-template-columns:1fr; }
  .wpd-content{ padding:18px 16px calc(96px + env(safe-area-inset-bottom)); }
  .wpd-top{ padding:0 16px; }
  .wpd-search{ width:140px; }
  .wpd-top__title h1{ font-size:21px; }
}

/* ═══ PANEL PODATKOWY (X25) ═══════════════════════════════════════════════════
   Klasy dopisane pod projekt z 2026-08-24. Wszystko liniami 1px, bez cieni
   i gradientów. Liczby monospace'em i tabularnie, żeby kwoty zgadzały się
   w kolumnie — to nie estetyka, tylko czytelność rachunku dla księgowej. */

.wpd-hero{ background:var(--ink); border-radius:4px; padding:32px; display:grid;
  grid-template-columns:1.25fr 1fr; gap:32px; }
.wpd-hero__label{ font-family:'IBM Plex Mono', monospace; font-size:11px; letter-spacing:.12em;
  text-transform:uppercase; color:var(--on-side-faint); margin:0 0 16px; }
.wpd-hero__value{ font-weight:800; font-size:76px; line-height:.95; letter-spacing:-.04em;
  color:var(--paper); font-variant-numeric:tabular-nums; overflow-wrap:anywhere; }
.wpd-hero__suffix{ font-weight:700; font-size:38px; margin-left:6px; }
.wpd-hero__lead{ font-size:15px; line-height:1.6; color:#C7BFB0; max-width:380px; margin:16px 0 0; }
.wpd-hero__side{ border-left:1px solid var(--side-line); padding-left:28px; min-width:0; }
.wpd-hero__row{ display:flex; justify-content:space-between; align-items:baseline; gap:12px;
  padding:11px 0; border-bottom:1px solid var(--side-line); }
.wpd-hero__row:last-child{ border-bottom:none; }
.wpd-hero__k{ font-size:13.5px; color:#C7BFB0; min-width:0; }
.wpd-hero__v{ font-family:'IBM Plex Mono', monospace; font-size:14px; font-weight:500;
  color:var(--paper); white-space:nowrap; font-variant-numeric:tabular-nums; }
.wpd-hero__v--muted{ font-size:12px; color:var(--on-side-faint); text-transform:uppercase;
  letter-spacing:.06em; white-space:normal; text-align:right; }
/* Gdy zamiast kwoty stoi zdanie („przy najmie prywatnym nie doliczamy"), uklad dwukolumnowy
   przestaje dzialac: etykieta lamie sie na dwie linie, adnotacja tez, i wiersz czyta sie jak
   dwa teksty nachodzace na siebie (widoczne od ~1280 px w dol, zgloszenie wlasciciela).
   Taki wiersz układamy pionowo — etykieta, pod nia adnotacja. */
.wpd-hero__row:has(.wpd-hero__v--muted){ flex-direction:column; align-items:flex-start; gap:3px; }
.wpd-hero__row:has(.wpd-hero__v--muted) .wpd-hero__v--muted{ text-align:left; }
.wpd-hero__tag{ display:inline-block; font-family:'IBM Plex Mono', monospace; font-size:10.5px;
  font-weight:600; letter-spacing:.08em; text-transform:uppercase; background:var(--cynober);
  color:#fff; padding:3px 7px; border-radius:3px; margin-bottom:12px; }

/* Próg ryczałtu — ma się czytać z odległości, dlatego „ile zostało" jest większe niż procent. */
.wpd-prog__head{ display:flex; justify-content:space-between; align-items:baseline; gap:12px; }
.wpd-prog__label{ font-family:'IBM Plex Mono', monospace; font-size:10px; letter-spacing:.1em;
  text-transform:uppercase; color:var(--label); margin:0; min-width:0; }
.wpd-prog__pct{ font-family:'IBM Plex Mono', monospace; font-size:11px; font-weight:600;
  color:var(--amber-ink); white-space:nowrap; }
.wpd-prog__pct--over{ color:var(--cynober); }
.wpd-prog__lead{ font-weight:700; font-size:27px; letter-spacing:-.02em; margin:12px 0 14px; }
.wpd-prog__lead strong{ font-family:'IBM Plex Mono', monospace; font-weight:600;
  font-variant-numeric:tabular-nums;
  /* Separator tysiecy z pl-PL to TWARDA SPACJA, a w monospace kazdy znak ma te sama
     szerokosc (0,6 em) — przy 27 px dawalo to dwie przepascie: „Zostalo 60  000  zl".
     Korekta sprowadza spacje monospace'u do szerokosci spacji tekstu obok. */
  word-spacing:-0.32em; }
.wpd-prog__track{ height:18px; background:var(--inner-2); border-radius:3px; overflow:hidden;
  display:flex; }
.wpd-prog__fill{ background:var(--amber); height:100%; }
.wpd-prog__fill--over{ background:var(--ink); }
.wpd-prog__over{ background:var(--cynober); height:100%; }
.wpd-prog__scale{ display:flex; justify-content:space-between; margin-top:6px;
  font-family:'IBM Plex Mono', monospace; font-size:10px; color:var(--label); }
.wpd-prog__note{ font-size:13.5px; line-height:1.6; color:var(--muted); margin:14px 0 0; }
.wpd-prog__src{ font-family:'IBM Plex Mono', monospace; font-size:10px; color:var(--label);
  margin:8px 0 0; }

/* Rozjazd — dwie kwoty obok siebie, jedna wskazana jako ta z panelu. */
.wpd-compare{ display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.wpd-compare__card{ background:var(--surface); border:1px solid var(--hairline);
  border-radius:4px; padding:22px; min-width:0; }
.wpd-compare__card--main{ border-color:var(--ink); }
.wpd-compare__tag{ display:inline-block; font-family:'IBM Plex Mono', monospace; font-size:10px;
  font-weight:600; letter-spacing:.08em; background:var(--ink); color:#fff; padding:4px 8px;
  border-radius:3px; margin-bottom:10px; }
.wpd-compare__val{ font-weight:800; font-size:34px; letter-spacing:-.02em;
  font-variant-numeric:tabular-nums; overflow-wrap:anywhere; }
.wpd-compare__val--faint{ color:var(--faint); }
.wpd-compare__desc{ font-size:13px; line-height:1.55; color:var(--muted); margin:8px 0 0; }

/* Stopka zastrzeżenia — jedno miejsce w panelu, nie powtarzamy przy liczbach. */
.wpd-taxfoot{ display:flex; justify-content:space-between; align-items:flex-start; gap:24px;
  flex-wrap:wrap; padding:14px 16px; background:var(--surface); border:1px solid var(--hairline);
  border-radius:4px; }
.wpd-taxfoot__txt{ font-size:13px; line-height:1.6; color:var(--muted); max-width:640px; margin:0; }
.wpd-taxfoot__meta{ font-family:'IBM Plex Mono', monospace; font-size:10px; letter-spacing:.08em;
  text-transform:uppercase; color:var(--label); white-space:nowrap; }

/* Wiersz podrzędny rachunku — podstawa prawna albo zastrzeżenie do pozycji wyżej. */
.wpd-settle__sub{ font-family:'IBM Plex Mono', monospace; font-size:10px; line-height:1.5;
  color:var(--faint); margin:-6px 0 10px; }

@media (max-width:900px){
  .wpd-hero{ grid-template-columns:1fr; gap:24px; padding:24px; }
  .wpd-hero__side{ border-left:none; border-top:1px solid var(--side-line);
    padding-left:0; padding-top:12px; }
  .wpd-compare{ grid-template-columns:1fr; }
}
@media (max-width:600px){
  /* Cztery komórki KPI nie mieszczą się na telefonie nawet po zawinięciu. Copy §2.1
     przewiduje dwie: podstawę i kwotę do odłożenia — reszta jest w rachunku niżej. */
  .wpd-cells--4{ grid-template-columns:repeat(2,1fr); }
  .wpd-cells--4 .wpd-cell:nth-child(1),
  .wpd-cells--4 .wpd-cell:nth-child(3){ display:none; }
  .wpd-cells--4 .wpd-cell__val{ font-size:19px; }
  .wpd-hero{ padding:20px; }
  .wpd-hero__value{ font-size:44px; }
  .wpd-hero__suffix{ font-size:22px; }
  .wpd-hero__lead{ font-size:13px; line-height:1.55; }
  .wpd-prog__lead{ font-size:19px; }
  .wpd-prog__track{ height:14px; }
  .wpd-compare__val{ font-size:26px; }
  .wpd-taxfoot{ border:none; background:none; padding:0; }
  .wpd-taxfoot__txt{ font-size:12px; color:var(--faint); }
}

/* ── Wąski telefon: nagłówek panelu bez zawijania i ucinania (zgłoszenie właściciela) ── */
@media (max-width:640px){
  .wpd-top{ gap:8px; }
  .wpd-top__sub{ display:none; }            /* data zawijała się na 3 linie */
  .wpd-top__title{ flex:1 1 auto; min-width:0; } /* tytuł ma pierwszeństwo w walce o miejsce */
  .wpd-top__title h1{ font-size:19px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .wpd-top__spacer{ display:none; }
  .wpd-search{ flex:1 1 60px; width:auto; min-width:44px; max-width:200px; } /* dzieli luz z tytułem, kurczy się pierwszy */
  .wpd-top__btnlabel{ display:none; }       /* „+ Rezerwacja" → sam plus, nic nie wystaje */
  .wpd-top .wpd-btn--primary{ width:40px; padding:0; flex:0 0 40px; }
}
`;

/* Mapa kolorów obiektów (klucze jak w utils/constants.propColors) → hexy z palety V4 */
export const PROP_HEX = {
  blue: '#234B7A', emerald: '#2F6B53', violet: '#6B4E8A', amber: '#C99A2E',
  rose: '#B23A48', cyan: '#2E7A8A', pink: '#A8527A', slate: '#6B6555',
};
export const propHex = (name) => PROP_HEX[name] || '#6B6555';

/* Kolory kanałów rezerwacji (zgodnie z legendą: Airbnb cynober, Booking granat, Direct green) */
export const channelColor = (src = '') => {
  const s = src.toLowerCase();
  if (s.includes('airbnb')) return 'var(--cynober)';
  if (s.includes('booking')) return 'var(--granat)';
  if (s.includes('nocowanie')) return 'var(--amber)';
  return 'var(--green)';
};
export const channelTone = (src = '') => {
  const s = src.toLowerCase();
  if (s.includes('airbnb')) return 'cynober';
  if (s.includes('booking')) return 'granat';
  if (s.includes('nocowanie')) return 'amber';
  return 'green';
};
