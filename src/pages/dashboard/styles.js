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
  --muted:#524C3F; --faint:#9A917D; --label:#A0987F;
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
.wpd-iconbtn__dot{ position:absolute; top:7px; right:8px; width:6px; height:6px; border-radius:50%;
  background:var(--cynober); }
.wpd-iconbtn__badge{ position:absolute; top:-7px; right:-7px; min-width:18px; height:18px; padding:0 4px;
  background:var(--cynober); color:#fff; border-radius:9px; font-family:'IBM Plex Mono', monospace;
  font-size:10px; font-weight:600; display:flex; align-items:center; justify-content:center; }

/* ── Link akcentowy ── */
.wpd-alink{ font-weight:600; font-size:13px; color:var(--cynober); text-decoration:none;
  display:inline-flex; align-items:center; gap:5px; }
.wpd-alink svg{ width:14px; height:14px; }

/* ── Panele ── */
.wpd-panel{ background:var(--surface); border:1px solid var(--hairline); border-radius:4px; }
.wpd-panel__head{ display:flex; align-items:center; gap:10px; padding:16px 20px;
  border-bottom:1px solid var(--hairline); }
.wpd-h2{ font-weight:700; font-size:17px; letter-spacing:-.02em; margin:0; }
.wpd-hairline{ height:1px; background:var(--hairline); border:0; margin:0; }

/* ── Karty statystyk ── */
.wpd-stats{ display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
.wpd-stat{ background:var(--surface); border:1px solid var(--hairline); border-radius:4px;
  padding:18px 20px 20px; min-height:128px; display:flex; flex-direction:column; cursor:pointer;
  transition:border-color .14s; }
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
.wpd-stat__foot{ margin-top:auto; padding-top:12px; }
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
.wpd-tag--amber{ color:var(--amber); background:var(--tint-amber); border-color:#EFE2C2; }
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
.wpd-seg{ display:inline-flex; gap:2px; background:var(--inner); border:1px solid var(--hairline);
  border-radius:3px; padding:3px; }
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
.wpd-cal__label{ padding:14px 18px; border-right:1px solid var(--hairline); }
.wpd-cal__objname{ font-weight:600; font-size:14px; }
.wpd-cal__objsub{ font-family:'IBM Plex Mono', monospace; font-size:9.5px; letter-spacing:.05em;
  text-transform:uppercase; color:var(--faint); margin-top:3px; }
.wpd-cal__corner{ border-right:1px solid var(--hairline); }
.wpd-cal__track{ position:relative; display:grid; grid-auto-rows:minmax(48px,auto); align-items:center; }
.wpd-cal__daycell{ grid-row:1; border-left:1px solid var(--inner); height:100%; }
.wpd-cal__daycell--today{ background:var(--tint-cynober); border-left-color:#EBD3CB; }
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
.wpd-textarea{ resize:vertical; min-height:64px; }
.wpd-input--num{ font-family:'IBM Plex Mono', monospace; }
.wpd-fgrid{ display:grid; grid-template-columns:1fr 1fr; gap:14px; }
.wpd-fgrid--3{ grid-template-columns:1fr 1fr 1fr; }
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
.wpd-tabs{ display:flex; gap:4px; overflow-x:auto; padding-bottom:14px; margin-bottom:18px;
  border-bottom:1px solid var(--hairline); }
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
.wpd-cell{ padding:14px 18px; border-right:1px solid var(--hairline); }
.wpd-cell:last-child{ border-right:none; }
.wpd-cell__label{ font-family:'IBM Plex Mono', monospace; font-size:9.5px; letter-spacing:.07em;
  text-transform:uppercase; color:var(--label); margin-bottom:5px; }
.wpd-cell__val{ font-weight:600; font-size:15px; }
.wpd-cell__val--accent{ color:var(--cynober); }
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
.wpd-kvgrid{ display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:14px; }
.wpd-kv{ border:1px solid var(--hairline); border-radius:4px; padding:11px 13px; background:var(--surface); }
.wpd-kv__k{ font-family:'IBM Plex Mono', monospace; font-size:9.5px; letter-spacing:.06em;
  text-transform:uppercase; color:var(--label); margin-bottom:4px; }
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
  body *{ visibility:hidden !important; }
  .wpd-ctr-sheet, .wpd-ctr-sheet *{ visibility:visible !important; }
  .wpd-ctr-sheet{ position:absolute !important; left:0 !important; top:0 !important; width:100% !important;
    border:none !important; border-radius:0 !important; padding:0 !important; background:#fff !important; }
  .wpd-noprint{ display:none !important; }
}

/* wejście sekcji */
.wpd-rise{ opacity:0; transform:translateY(10px); transition:opacity .5s ease, transform .5s cubic-bezier(.22,1,.36,1); }
.wpd-rise.is-in{ opacity:1; transform:none; }

/* wejście widoku — ten sam charakter co „pisanie" umowy w generatorze
   (ta sama krzywa cubic-bezier(.22,1,.36,1)). Odtwarzane przy każdej zmianie
   widoku dzięki atrybutowi key (remount) w ManagerApp. */
@keyframes wpd-view-in{ from{ opacity:0; transform:translateY(10px); } to{ opacity:1; transform:none; } }
.wpd-view{ animation:wpd-view-in .32s cubic-bezier(.22,1,.36,1) both; }

@media (prefers-reduced-motion: reduce){
  .wpd-trend__bar{ transition:none !important; }
  .wpd-hbar__fill{ transition:none !important; }
  .wpd-rise{ transition:none !important; opacity:1 !important; transform:none !important; }
  .wpd-view{ animation:none !important; }
  .wpd-overlay, .wpd-dialog{ animation:none !important; }
}

/* ── Responsywność ── */
@media (max-width:980px){
  .wpd-side{ display:none; }
  .wpd-stats{ grid-template-columns:repeat(2,1fr); }
  .wpd-kpi{ grid-template-columns:repeat(2,1fr); }
  .wpd-grid-2{ grid-template-columns:1fr; }
  .wpd-objs{ grid-template-columns:1fr; }
  .wpd-content{ padding:18px 16px 56px; }
  .wpd-top{ padding:0 16px; }
  .wpd-search{ width:140px; }
  .wpd-top__title h1{ font-size:21px; }
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
