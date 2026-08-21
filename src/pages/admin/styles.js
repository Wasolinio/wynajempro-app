/*
  Panel administratora — DODATEK do systemu designu `.wpd`, nie osobny język.

  Panel administratora jest tym samym produktem co panel gospodarza, oglądanym od
  drugiej strony, więc dziedziczy DASHBOARD_CSS w całości: ciemny sidebar, paper,
  linie 1px, IBM Plex Mono na liczbach, zero cieni, gradientów i emoji. Tutaj są
  wyłącznie te elementy, których panel gospodarza nie ma — układ „lista + szczegóły",
  wykres 30-dniowy (ten z pulpitu jest liczony na 7 kolumn) i lejek rejestracji.

  Prefiks `.wpa-`, żeby na pierwszy rzut oka było widać, co jest dodatkiem.
*/
export const ADMIN_CSS = `
/* ── Oznaczenie trybu administratora ── */
.wpa-badge{
  font-family:'IBM Plex Mono', monospace; font-weight:600; font-size:9px; letter-spacing:.12em;
  text-transform:uppercase; color:#fff; background:var(--brick); border-radius:3px; padding:3px 6px;
}
.wpa-side-note{
  margin-top:auto; padding:16px 24px; border-top:1px solid var(--side-line);
  font-family:'IBM Plex Mono', monospace; font-size:9.5px; line-height:1.7;
  letter-spacing:.04em; color:var(--on-side-label);
}

/* ── Siatki kart ── */
.wpa-stats-3{ display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
.wpa-stats-2{ display:grid; grid-template-columns:repeat(2,1fr); gap:16px; }
/* karta bez akcji — wpd-stat domyślnie sugeruje kliknięcie */
.wpa-stat--flat{ cursor:default; }
.wpa-stat--flat:hover{ border-color:var(--hairline); }

/* ── Wykres 30 dni (pulpit ma 7 kolumn i szersze odstępy) ── */
.wpa-chart30 .wpd-chart__bars{ gap:3px; height:150px; }
.wpa-chart30 .wpd-chart__bar{ max-width:none; }
.wpa-chart30 .wpd-chart__x{ font-size:8.5px; letter-spacing:0; }

/* ── Lejek ── */
.wpa-funnel{ display:flex; flex-direction:column; gap:2px; padding:6px 0; }
.wpa-funnel__row{ padding:9px 0; }
.wpa-funnel__top{ display:flex; align-items:baseline; justify-content:space-between; gap:12px; margin-bottom:6px; }
.wpa-funnel__name{ font-size:13.5px; font-weight:500; }
.wpa-funnel__val{ font-family:'IBM Plex Mono', monospace; font-size:12px; font-weight:600; }
.wpa-funnel__val small{ color:var(--faint); font-weight:400; margin-left:6px; }
.wpa-funnel__bar{ height:9px; border-radius:3px; background:var(--inner-2); overflow:hidden; }
.wpa-funnel__fill{ height:100%; border-radius:3px; background:var(--granat); transition:width .5s cubic-bezier(.22,1,.36,1); }
.wpa-funnel__fill--end{ background:var(--green); }

/* ── Szerszy obszar roboczy ── */
/* Panel gospodarza trzyma 1240 px, bo czyta się go ekranami. Panel administratora to
   narzędzie do danych: układ „lista + szczegóły" przy 1240 px ścina ostatnią kolumnę
   tabeli kont. Stąd osobna, szersza miara — nie kosmetyka, tylko warunek czytelności. */
.wpa-content{ max-width:1560px; }

/* ── Układ „lista + szczegóły" ── */
.wpa-split{ display:grid; grid-template-columns:minmax(0,1fr) 380px; gap:20px; align-items:start; }
/* Tabela administratora ma więcej kolumn niż jakakolwiek w panelu gospodarza. */
.wpa-table th, .wpa-table td{ padding-left:12px; padding-right:12px; }
.wpa-table th:first-child, .wpa-table td:first-child{ padding-left:18px; }
.wpa-table th:last-child, .wpa-table td:last-child{ padding-right:18px; }
.wpa-detail{ position:sticky; top:20px; }
.wpa-toolbar{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:16px; }
.wpa-toolbar__spacer{ flex:1 1 auto; }

/* ── Wiersz klikalny (wybór z listy) ── */
.wpa-pick{ cursor:pointer; border-left:2px solid transparent; }
.wpa-pick--on{ background:var(--inner); border-left-color:var(--cynober); }

/* ── Treść zgłoszenia ── */
.wpa-msg{
  white-space:pre-wrap; word-break:break-word; font-size:13.5px; line-height:1.65;
  background:var(--inner); border:1px solid var(--hairline); border-radius:4px; padding:13px 15px;
}
.wpa-msg--clip{ max-height:96px; overflow:hidden; position:relative; }

/* ── Pary klucz–wartość w szczegółach konta ── */
.wpa-kv{ display:flex; align-items:baseline; gap:12px; padding:8px 0; border-bottom:1px solid var(--hairline); }
.wpa-kv:last-child{ border-bottom:none; }
.wpa-kv__k{
  font-family:'IBM Plex Mono', monospace; font-size:10px; letter-spacing:.06em; text-transform:uppercase;
  color:var(--label); flex:0 0 132px;
}
.wpa-kv__v{ font-size:13.5px; color:var(--ink); min-width:0; word-break:break-word; }
.wpa-kv__v--mono{ font-family:'IBM Plex Mono', monospace; font-size:12px; }

/* ── Strefa działań na koncie ── */
.wpa-actions{ display:flex; flex-direction:column; gap:10px; }
.wpa-actions__row{ display:flex; align-items:center; gap:8px; }
.wpa-actions__row .wpd-input{ max-width:88px; }

/* ── Ekran „brak uprawnień" ── */
.wpa-gate{ min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; }
.wpa-gate__box{ max-width:460px; width:100%; background:var(--surface); border:1px solid var(--hairline);
  border-radius:4px; padding:32px; text-align:center; }

/* ── Nawigacja na wąskich ekranach ──
   Panel gospodarza chowa sidebar poniżej 980 px i zastępuje go dolnym paskiem pod kciukiem.
   Panel administratora dziedziczy to ukrycie, a własnego paska nie ma — bez tego zostawałby
   na telefonie bez żadnej nawigacji. Zamiast dolnego paska (6 pozycji się tam nie mieści)
   poziomy pasek przewijany u góry. */
.wpa-mnav{ display:none; }
@media (max-width:980px){
  .wpa-mnav{
    display:flex; align-items:center; gap:2px; overflow-x:auto; background:var(--side);
    position:sticky; top:0; z-index:60; padding:0 6px; scrollbar-width:none;
  }
  .wpa-mnav::-webkit-scrollbar{ display:none; }
  .wpa-mnav__item{
    flex:0 0 auto; display:flex; align-items:center; gap:7px; padding:14px 12px;
    background:none; border:none; border-bottom:2px solid transparent; cursor:pointer;
    color:var(--on-side-faint); font-family:inherit; font-size:13.5px; font-weight:500; white-space:nowrap;
  }
  .wpa-mnav__item--on{ color:#fff; border-bottom-color:var(--cynober); }
  .wpa-mnav__count{ font-family:'IBM Plex Mono', monospace; font-size:10.5px; color:var(--cynober); }
  .wpa-mnav__out{ margin-left:auto; padding:14px 10px; background:none; border:none;
    color:var(--on-side-faint); cursor:pointer; line-height:0; }
  .wpa-mnav__out svg{ width:17px; height:17px; }
  /* dolny margines panelu gospodarza robi miejsce na jego pasek — tutaj nie ma czego omijać */
  .wpa-content{ padding-bottom:48px; }
}

@media (max-width:1180px){
  .wpa-split{ grid-template-columns:1fr; }
  .wpa-detail{ position:static; }
  .wpa-stats-3{ grid-template-columns:repeat(2,1fr); }
}
@media (max-width:760px){
  .wpa-stats-3, .wpa-stats-2{ grid-template-columns:1fr; }
  .wpa-kv{ flex-direction:column; gap:2px; }
  .wpa-kv__k{ flex:none; }
}
`;
