import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

/*
  Apple-scroll demo panelu (X2, v2) — implementacja projektu
  „Wynajem Landing Scroll.dc.html" z Claude Design (import przez claude_design MCP).
  Sticky 520vh: lewa szyna postępu + 5 bloków tekstu, prawa strona = okno przeglądarki
  z mockupem panelu przełączającym 5 ekranów (Pulpit/Kalendarz/Obiekty/Rezerwacja/
  Finanse) z ruchomym highlightem. Dyskretny cross-fade sterowany indeksem scrolla
  (1:1 z silnikiem support.js z designu). Mobile: sticky wyłączony, kroki klikalne.
  Markup ekranów przeniesiony wiernie z projektu (statyczny, autorski → dSIH bezpieczne).
*/

const FEATURES = [
  {
    navIdx: '01', label: 'Pulpit', pageTitle: 'Pulpit', pageSub: 'CZWARTEK, 9 LIPCA 2026',
    kicker: '01 / 05', tag: 'PULPIT', ta: 'Cały wynajem na ', tem: 'jednym', tb: ' ekranie.',
    body: 'Przychód, obłożenie i dzisiejsze przyjazdy witają Cię, zanim wystygnie kawa. Zero klikania po zakładkach.',
  },
  {
    navIdx: '02', label: 'Kalendarz', pageTitle: 'Kalendarz', pageSub: 'REZERWACJE WSZYSTKICH OBIEKTÓW',
    kicker: '02 / 05', tag: 'KALENDARZ', ta: 'Koniec z ', tem: 'podwójną', tb: ' rezerwacją.',
    body: 'Airbnb, Booking i rezerwacje bezpośrednie w jednym kalendarzu — synchronizacja pilnuje terminów za Ciebie.',
  },
  {
    navIdx: '03', label: 'Obiekty', pageTitle: 'Obiekty', pageSub: 'TWOJE MIEJSCA NA WYNAJEM',
    kicker: '03 / 05', tag: 'OBIEKTY', ta: 'Każdy obiekt pod ', tem: 'pełną', tb: ' kontrolą.',
    body: 'Ceny, obłożenie i najbliższe przyjazdy dla wszystkich miejsc — obok siebie, gotowe do działania.',
  },
  {
    navIdx: '04', label: 'Rezerwacje', pageTitle: 'Rezerwacja #A-2048', pageSub: 'MARCELI DOBOSZ · 9–12 LIPCA',
    kicker: '04 / 05', tag: 'REZERWACJA', ta: 'Gość obsłużony, ', tem: 'zanim', tb: ' zapyta.',
    body: 'Dane pobytu, przewodnik i kod do skrytki w jednym miejscu. Automatyczne wiadomości robią resztę.',
  },
  {
    navIdx: '05', label: 'Finanse', pageTitle: 'Finanse', pageSub: 'PRZYCHODY, KOSZTY I WYPŁATY',
    kicker: '05 / 05', tag: 'FINANSE', ta: 'Wiesz co do ', tem: 'złotówki', tb: '.',
    body: 'Przychód, prowizje i zysk netto liczą się same. Gotowy raport eksportujesz do PDF jednym kliknięciem.',
  },
];

// ── Statyczny markup 5 ekranów mockupu (wierny z projektu; bez wiązań {{ }}) ──
const SCREEN_HTML = [
  /* 0 · PULPIT */ `
    <div data-hl style="display:grid; grid-template-columns:repeat(4,1fr); border:1px solid #DDD5C3; border-radius:5px; background:#FBFAF6;">
      <div style="padding:16px; border-right:1px solid #EFE9DA;"><div style="font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:#A0987F; margin-bottom:9px;">Przychód · lipiec</div><div style="font-size:26px; font-weight:800; letter-spacing:-0.02em;">14 280 zł</div><div style="font-family:'IBM Plex Mono',monospace; font-size:10px; color:#2F6B53; margin-top:5px;">▲ 12% VS CZERWIEC</div></div>
      <div style="padding:16px; border-right:1px solid #EFE9DA;"><div style="font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:#A0987F; margin-bottom:9px;">Obłożenie</div><div style="font-size:26px; font-weight:800; letter-spacing:-0.02em;">81%</div><div style="height:5px; background:#EFE9DA; border-radius:2px; margin-top:10px; overflow:hidden;"><div style="width:81%; height:100%; background:#D9492B;"></div></div></div>
      <div style="padding:16px; border-right:1px solid #EFE9DA;"><div style="font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:#A0987F; margin-bottom:9px;">Przyjazdy dziś</div><div style="font-size:26px; font-weight:800; letter-spacing:-0.02em;">2</div><div style="font-family:'IBM Plex Mono',monospace; font-size:10px; color:#9A917D; margin-top:5px;">+ 1 WYJAZD</div></div>
      <div style="padding:16px;"><div style="font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:#A0987F; margin-bottom:9px;">Do posprzątania</div><div style="font-size:26px; font-weight:800; letter-spacing:-0.02em;">1</div><div style="font-family:'IBM Plex Mono',monospace; font-size:10px; color:#D9492B; margin-top:5px;">STUDIO · DZIŚ 14:00</div></div>
    </div>
    <div style="display:grid; grid-template-columns:1.5fr 1fr; gap:14px; flex:1; min-height:0;">
      <div style="background:#FBFAF6; border:1px solid #DDD5C3; border-radius:5px; padding:18px; min-height:0;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;"><div style="font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:0.1em; text-transform:uppercase; color:#A0987F;">Najbliższe przyjazdy i wyjazdy</div><span style="font-size:12px; color:#D9492B; font-weight:600;">Kalendarz →</span></div>
        <div style="display:grid; grid-template-columns:48px 1fr auto auto; gap:12px; align-items:center; padding:12px 0; border-bottom:1px solid #EFE9DA;"><div style="font-family:'IBM Plex Mono',monospace; font-size:9px; font-weight:600; text-align:center; padding:5px 0; border-radius:3px; background:#E7EDE7; color:#2F6B53;">PRZY</div><div><div style="font-size:14px; font-weight:600;">Marceli Dobosz</div><div style="font-family:'IBM Plex Mono',monospace; font-size:9px; color:#9A917D; letter-spacing:0.04em; text-transform:uppercase;">Apartament Centrum</div></div><div style="font-family:'IBM Plex Mono',monospace; font-size:11px; color:#524C3F;">dziś · 15:00</div><div style="font-family:'IBM Plex Mono',monospace; font-size:9px; color:#524C3F; background:#F0EADC; padding:4px 7px; border-radius:3px;">AIRBNB</div></div>
        <div style="display:grid; grid-template-columns:48px 1fr auto auto; gap:12px; align-items:center; padding:12px 0; border-bottom:1px solid #EFE9DA;"><div style="font-family:'IBM Plex Mono',monospace; font-size:9px; font-weight:600; text-align:center; padding:5px 0; border-radius:3px; background:#E7EDE7; color:#2F6B53;">PRZY</div><div><div style="font-size:14px; font-weight:600;">Rodzina Zwolińskich</div><div style="font-family:'IBM Plex Mono',monospace; font-size:9px; color:#9A917D; letter-spacing:0.04em; text-transform:uppercase;">Domek nad jeziorem</div></div><div style="font-family:'IBM Plex Mono',monospace; font-size:11px; color:#524C3F;">dziś · 16:00</div><div style="font-family:'IBM Plex Mono',monospace; font-size:9px; color:#524C3F; background:#F0EADC; padding:4px 7px; border-radius:3px;">DIRECT</div></div>
        <div style="display:grid; grid-template-columns:48px 1fr auto auto; gap:12px; align-items:center; padding:12px 0; border-bottom:1px solid #EFE9DA;"><div style="font-family:'IBM Plex Mono',monospace; font-size:9px; font-weight:600; text-align:center; padding:5px 0; border-radius:3px; background:#F6E5DF; color:#A2553F;">WYJ</div><div><div style="font-size:14px; font-weight:600;">Igor Pawelec</div><div style="font-family:'IBM Plex Mono',monospace; font-size:9px; color:#9A917D; letter-spacing:0.04em; text-transform:uppercase;">Studio Stare Miasto</div></div><div style="font-family:'IBM Plex Mono',monospace; font-size:11px; color:#524C3F;">dziś · 11:00</div><div style="font-family:'IBM Plex Mono',monospace; font-size:9px; color:#524C3F; background:#F0EADC; padding:4px 7px; border-radius:3px;">BOOKING</div></div>
        <div style="display:grid; grid-template-columns:48px 1fr auto auto; gap:12px; align-items:center; padding:12px 0;"><div style="font-family:'IBM Plex Mono',monospace; font-size:9px; font-weight:600; text-align:center; padding:5px 0; border-radius:3px; background:#E7EDE7; color:#2F6B53;">PRZY</div><div><div style="font-size:14px; font-weight:600;">Weronika Stelmach</div><div style="font-family:'IBM Plex Mono',monospace; font-size:9px; color:#9A917D; letter-spacing:0.04em; text-transform:uppercase;">Domek nad jeziorem</div></div><div style="font-family:'IBM Plex Mono',monospace; font-size:11px; color:#524C3F;">jutro · 14:00</div><div style="font-family:'IBM Plex Mono',monospace; font-size:9px; color:#524C3F; background:#F0EADC; padding:4px 7px; border-radius:3px;">BOOKING</div></div>
      </div>
      <div style="display:flex; flex-direction:column; gap:14px; min-height:0;">
        <div style="background:#17150F; border-radius:5px; padding:18px; color:#E4DDCE;">
          <div style="font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:#6B6555; margin-bottom:16px;">Przychód · ostatnie 7 dni</div>
          <div style="display:flex; align-items:flex-end; gap:7px; height:78px;">
            <div style="flex:1; height:48%; background:#3A352A; border-radius:2px;"></div><div style="flex:1; height:66%; background:#3A352A; border-radius:2px;"></div><div style="flex:1; height:40%; background:#3A352A; border-radius:2px;"></div><div style="flex:1; height:82%; background:#D9492B; border-radius:2px;"></div><div style="flex:1; height:70%; background:#3A352A; border-radius:2px;"></div><div style="flex:1; height:95%; background:#D9492B; border-radius:2px;"></div><div style="flex:1; height:60%; background:#3A352A; border-radius:2px;"></div>
          </div>
          <div style="font-family:'IBM Plex Mono',monospace; display:flex; justify-content:space-between; font-size:9px; color:#4F4A3F; margin-top:8px;"><span>PN</span><span>WT</span><span>ŚR</span><span>CZ</span><span>PT</span><span>SB</span><span>ND</span></div>
        </div>
        <div style="background:#FBFAF6; border:1px solid #DDD5C3; border-radius:5px; padding:16px; flex:1; min-height:0;">
          <div style="font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:#A0987F; margin-bottom:12px;">Zadania na dziś</div>
          <div style="display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid #EFE9DA;"><span style="width:15px;height:15px;border-radius:3px;border:1.5px solid #D9492B;flex-shrink:0;"></span><span style="font-size:13px;">Sprzątanie · Studio Stare Miasto</span><span style="font-family:'IBM Plex Mono',monospace; margin-left:auto; font-size:10px; color:#9A917D;">14:00</span></div>
          <div style="display:flex; align-items:center; gap:10px; padding:8px 0;"><span style="width:15px;height:15px;border-radius:3px;background:#2F6B53;display:inline-flex;align-items:center;justify-content:center;color:#fff;font-size:10px;flex-shrink:0;">✓</span><span style="font-size:13px; color:#A0987F; text-decoration:line-through;">Potwierdź rezerwację · Booking</span></div>
        </div>
      </div>
    </div>`,

  /* 1 · KALENDARZ */ `
    <div data-hl style="background:#FBFAF6; border:1px solid #DDD5C3; border-radius:5px; padding:18px;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="display:flex; align-items:center; gap:4px;"><span style="width:28px;height:28px;border-radius:3px;border:1px solid #DDD5C3;display:flex;align-items:center;justify-content:center;">‹</span><span style="width:28px;height:28px;border-radius:3px;border:1px solid #DDD5C3;display:flex;align-items:center;justify-content:center;">›</span></div>
          <div style="font-size:17px; font-weight:800; letter-spacing:-0.02em;">Lipiec 2026</div>
        </div>
        <div style="font-family:'IBM Plex Mono',monospace; display:flex; align-items:center; gap:14px; font-size:10px; letter-spacing:0.04em; text-transform:uppercase;">
          <span style="display:flex; align-items:center; gap:6px;"><span style="width:10px;height:10px;border-radius:2px;background:#D9492B;"></span>Airbnb</span>
          <span style="display:flex; align-items:center; gap:6px;"><span style="width:10px;height:10px;border-radius:2px;background:#234B7A;"></span>Booking</span>
          <span style="display:flex; align-items:center; gap:6px;"><span style="width:10px;height:10px;border-radius:2px;background:#2F6B53;"></span>Direct</span>
        </div>
      </div>
      <div style="display:grid; grid-template-columns:170px 1fr;">
        <div></div>
        <div style="font-family:'IBM Plex Mono',monospace; display:grid; grid-template-columns:repeat(14,1fr); font-size:10px; color:#9A917D; text-align:center; border-bottom:1px solid #DDD5C3; padding-bottom:8px;"><span>07</span><span>08</span><span>09</span><span style="color:#D9492B;font-weight:600;">10</span><span>11</span><span>12</span><span>13</span><span>14</span><span>15</span><span>16</span><span>17</span><span>18</span><span>19</span><span>20</span></div>
      </div>
      <div style="display:grid; grid-template-columns:170px 1fr; align-items:center; border-bottom:1px solid #EFE9DA; min-height:56px;">
        <div style="font-size:13px; font-weight:600; padding-right:12px;">Apartament Centrum<div style="font-family:'IBM Plex Mono',monospace; font-size:10px; color:#9A917D; font-weight:400; letter-spacing:0.04em;">KRAKÓW · 320 ZŁ</div></div>
        <div style="position:relative; height:36px; background:repeating-linear-gradient(90deg,#FBFAF6,#FBFAF6 calc(100%/14 - 1px),#EFE9DA calc(100%/14 - 1px),#EFE9DA calc(100%/14)); border-radius:3px;">
          <div style="position:absolute; left:1.5%; width:25%; top:5px; bottom:5px; background:#234B7A; border-radius:3px; color:#fff; font-size:11px; font-weight:600; display:flex; align-items:center; padding-left:9px;">Dobosz</div>
          <div style="position:absolute; left:30%; width:19%; top:5px; bottom:5px; background:#D9492B; border-radius:3px; color:#fff; font-size:11px; font-weight:600; display:flex; align-items:center; padding-left:9px;">Pawelec</div>
          <div style="position:absolute; left:64%; width:33%; top:5px; bottom:5px; background:#2F6B53; border-radius:3px; color:#fff; font-size:11px; font-weight:600; display:flex; align-items:center; padding-left:9px;">Zwolińscy</div>
        </div>
      </div>
      <div style="display:grid; grid-template-columns:170px 1fr; align-items:center; border-bottom:1px solid #EFE9DA; min-height:56px;">
        <div style="font-size:13px; font-weight:600; padding-right:12px;">Domek nad jeziorem<div style="font-family:'IBM Plex Mono',monospace; font-size:10px; color:#9A917D; font-weight:400; letter-spacing:0.04em;">MAZURY · 540 ZŁ</div></div>
        <div style="position:relative; height:36px; background:repeating-linear-gradient(90deg,#FBFAF6,#FBFAF6 calc(100%/14 - 1px),#EFE9DA calc(100%/14 - 1px),#EFE9DA calc(100%/14)); border-radius:3px;">
          <div style="position:absolute; left:10%; width:40%; top:5px; bottom:5px; background:#D9492B; border-radius:3px; color:#fff; font-size:11px; font-weight:600; display:flex; align-items:center; padding-left:9px;">Stelmach</div>
          <div style="position:absolute; left:72%; width:26%; top:5px; bottom:5px; background:#234B7A; border-radius:3px; color:#fff; font-size:11px; font-weight:600; display:flex; align-items:center; padding-left:9px;">Broda</div>
        </div>
      </div>
      <div style="display:grid; grid-template-columns:170px 1fr; align-items:center; min-height:56px;">
        <div style="font-size:13px; font-weight:600; padding-right:12px;">Studio Stare Miasto<div style="font-family:'IBM Plex Mono',monospace; font-size:10px; color:#9A917D; font-weight:400; letter-spacing:0.04em;">GDAŃSK · 240 ZŁ</div></div>
        <div style="position:relative; height:36px; background:repeating-linear-gradient(90deg,#FBFAF6,#FBFAF6 calc(100%/14 - 1px),#EFE9DA calc(100%/14 - 1px),#EFE9DA calc(100%/14)); border-radius:3px;">
          <div style="position:absolute; left:1.5%; width:18%; top:5px; bottom:5px; background:#2F6B53; border-radius:3px; color:#fff; font-size:11px; font-weight:600; display:flex; align-items:center; padding-left:9px;">Jasiński</div>
          <div style="position:absolute; left:42%; width:14%; top:5px; bottom:5px; background:#234B7A; border-radius:3px; color:#fff; font-size:11px; font-weight:600; display:flex; align-items:center; padding-left:9px;">Ostrowicz</div>
          <div style="position:absolute; left:78%; width:20%; top:5px; bottom:5px; background:#D9492B; border-radius:3px; color:#fff; font-size:11px; font-weight:600; display:flex; align-items:center; padding-left:9px;">Niedziela</div>
        </div>
      </div>
    </div>
    <div style="display:grid; grid-template-columns:repeat(3,1fr); border:1px solid #DDD5C3; border-radius:5px; background:#FBFAF6; margin-top:16px;">
      <div style="padding:16px; border-right:1px solid #EFE9DA;"><div style="font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:#A0987F;">Rezerwacje w tym mies.</div><div style="font-size:22px; font-weight:800; margin-top:5px;">23</div></div>
      <div style="padding:16px; border-right:1px solid #EFE9DA;"><div style="font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:#A0987F;">Wolnych nocy</div><div style="font-size:22px; font-weight:800; margin-top:5px;">17</div></div>
      <div style="padding:16px;"><div style="font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:#A0987F;">Śr. długość pobytu</div><div style="font-size:22px; font-weight:800; margin-top:5px;">3,2 nocy</div></div>
    </div>`,

  /* 2 · OBIEKTY */ `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <div style="font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:0.08em; text-transform:uppercase; color:#A0987F;">3 obiekty · wszystkie aktywne</div>
      <div style="padding:9px 15px; background:#FBFAF6; border:1px solid #DDD5C3; border-radius:3px; font-weight:600; font-size:13px;">+ Dodaj obiekt</div>
    </div>
    <div data-hl style="display:grid; grid-template-columns:repeat(3,1fr); gap:16px;">
      ${['#D8CDB6|FOT. 01|MIESZKANIE 2-POK.|Apartament Centrum|ul. Floriańska 12, Kraków|320 zł|84%|Przyjazd: jutro',
         '#C6D2C7|FOT. 02|DOM · 3 SYPIALNIE|Domek nad jeziorem|Ruciane-Nida, Mazury|540 zł|76%|Przyjazd: pt, 11 lip',
         '#D9C9C2|FOT. 03|KAWALERKA|Studio Stare Miasto|ul. Piwna 4, Gdańsk|240 zł|81%|Przyjazd: dziś'].map((r) => {
        const [bg, fot, typ, name, addr, price, occ, arr] = r.split('|');
        return `<div style="background:#FBFAF6; border:1px solid #DDD5C3; border-radius:5px; overflow:hidden;">
        <div style="height:120px; background-color:${bg}; background-image:linear-gradient(rgba(23,21,15,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(23,21,15,.05) 1px,transparent 1px); background-size:20px 20px; position:relative; border-bottom:1px solid #DDD5C3;">
          <div style="position:absolute; top:11px; left:11px; right:11px; display:flex; align-items:center; justify-content:space-between;"><span style="font-family:'IBM Plex Mono',monospace; background:#17150F; color:#F3EFE5; font-size:9px; padding:3px 7px; letter-spacing:0.06em; border-radius:3px;">${fot}</span><span style="font-family:'IBM Plex Mono',monospace; display:flex; align-items:center; gap:5px; background:rgba(251,250,246,.9); color:#2F6B53; font-size:9px; font-weight:600; padding:3px 7px; border-radius:3px;"><span style="width:6px;height:6px;background:#2F6B53;border-radius:50%;"></span>AKTYWNY</span></div>
          <span style="font-family:'IBM Plex Mono',monospace; position:absolute; bottom:11px; left:11px; font-size:9px; color:#7A715C; letter-spacing:0.06em;">${typ}</span>
        </div>
        <div style="padding:16px;">
          <div style="font-size:16px; font-weight:700; letter-spacing:-0.01em;">${name}</div>
          <div style="font-family:'IBM Plex Mono',monospace; font-size:10px; color:#9A917D; margin-bottom:14px; letter-spacing:0.03em; text-transform:uppercase;">${addr}</div>
          <div style="display:flex; gap:22px; margin-bottom:14px;"><div><div style="font-family:'IBM Plex Mono',monospace; font-size:9px; color:#A0987F; letter-spacing:0.08em; text-transform:uppercase;">Cena/noc</div><div style="font-size:15px; font-weight:700; margin-top:3px;">${price}</div></div><div><div style="font-family:'IBM Plex Mono',monospace; font-size:9px; color:#A0987F; letter-spacing:0.08em; text-transform:uppercase;">Obłożenie</div><div style="font-size:15px; font-weight:700; margin-top:3px;">${occ}</div></div></div>
          <div style="font-family:'IBM Plex Mono',monospace; display:flex; align-items:center; gap:8px; padding-top:12px; border-top:1px solid #EFE9DA; font-size:9px; color:#9A917D; letter-spacing:0.04em; text-transform:uppercase;"><span style="display:flex; align-items:center; gap:6px;"><span style="width:6px;height:6px;border-radius:50%;background:#5FB389;"></span>iCal OK</span><span style="margin-left:auto;">${arr}</span></div>
        </div>
      </div>`;
      }).join('')}
    </div>`,

  /* 3 · REZERWACJA */ `
    <div style="font-family:'IBM Plex Mono',monospace; display:flex; align-items:center; gap:9px; font-size:10px; letter-spacing:0.06em; text-transform:uppercase; color:#A0987F; margin-bottom:14px;"><span>Kalendarz</span><span>/</span><span style="color:#17150F; font-weight:600;">Rezerwacja #A-2048</span></div>
    <div style="display:grid; grid-template-columns:1.6fr 1fr; gap:16px;">
      <div style="display:flex; flex-direction:column; gap:16px;">
        <div style="background:#FBFAF6; border:1px solid #DDD5C3; border-radius:5px; padding:20px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:18px;">
            <div style="display:flex; gap:13px; align-items:center;">
              <div style="width:48px;height:48px;border-radius:3px;background:#D9492B;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px;">MD</div>
              <div><div style="font-size:19px; font-weight:800; letter-spacing:-0.02em;">Marceli Dobosz</div><div style="font-family:'IBM Plex Mono',monospace; font-size:10px; color:#9A917D; letter-spacing:0.04em; text-transform:uppercase;">2 osoby · Apartament Centrum</div></div>
            </div>
            <span style="font-family:'IBM Plex Mono',monospace; display:flex; align-items:center; gap:6px; background:#E7EDE7; color:#2F6B53; font-size:10px; font-weight:600; padding:6px 10px; border-radius:3px; letter-spacing:0.06em;"><span style="width:6px;height:6px;background:#2F6B53;border-radius:50%;"></span>POTWIERDZONA</span>
          </div>
          <div style="display:grid; grid-template-columns:repeat(3,1fr); border:1px solid #EFE9DA; border-radius:3px;">
            <div style="padding:13px; border-right:1px solid #EFE9DA;"><div style="font-family:'IBM Plex Mono',monospace; font-size:9px; color:#A0987F; letter-spacing:0.08em; text-transform:uppercase;">Przyjazd</div><div style="font-size:14px; font-weight:700; margin-top:4px;">9 lip · 15:00</div></div>
            <div style="padding:13px; border-right:1px solid #EFE9DA;"><div style="font-family:'IBM Plex Mono',monospace; font-size:9px; color:#A0987F; letter-spacing:0.08em; text-transform:uppercase;">Wyjazd</div><div style="font-size:14px; font-weight:700; margin-top:4px;">12 lip · 11:00</div></div>
            <div style="padding:13px;"><div style="font-family:'IBM Plex Mono',monospace; font-size:9px; color:#A0987F; letter-spacing:0.08em; text-transform:uppercase;">Kanał</div><div style="font-size:14px; font-weight:700; margin-top:4px; color:#D9492B;">Airbnb</div></div>
          </div>
        </div>
        <div style="background:#FBFAF6; border:1px solid #DDD5C3; border-radius:5px; padding:20px;">
          <div style="font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:#A0987F; margin-bottom:12px;">Rozliczenie</div>
          <div style="display:flex; justify-content:space-between; font-size:13px; padding:8px 0; color:#3D382E; border-bottom:1px solid #EFE9DA;">320 zł × 3 noce<span style="font-family:'IBM Plex Mono',monospace;">960 zł</span></div>
          <div style="display:flex; justify-content:space-between; font-size:13px; padding:8px 0; color:#3D382E; border-bottom:1px solid #EFE9DA;">Opłata za sprzątanie<span style="font-family:'IBM Plex Mono',monospace;">80 zł</span></div>
          <div style="display:flex; justify-content:space-between; font-size:13px; padding:8px 0; color:#3D382E; border-bottom:1px solid #DDD5C3;">Prowizja Airbnb<span style="font-family:'IBM Plex Mono',monospace; color:#A2553F;">− 45 zł</span></div>
          <div style="display:flex; justify-content:space-between; align-items:baseline; font-size:17px; font-weight:800; padding:13px 0 4px;">Do wypłaty<span style="font-family:'IBM Plex Mono',monospace; font-size:19px;">995 zł</span></div>
        </div>
      </div>
      <div style="display:flex; flex-direction:column; gap:14px;">
        <div data-hl style="background:#17150F; border-radius:5px; padding:18px; color:#E4DDCE;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:5px;"><div style="font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:#9A8E78;">Przewodnik dla gości</div><span style="font-family:'IBM Plex Mono',monospace; font-size:9px; background:#2F6B53; color:#fff; padding:3px 7px; border-radius:3px; letter-spacing:0.06em;">WYSŁANY</span></div>
          <div style="font-family:'IBM Plex Mono',monospace; font-size:11px; color:#7A715C; margin-bottom:16px;">wynajempro.pl/g/centrum-md48</div>
          <div style="border:1px solid #3A352A; border-radius:3px; padding:14px; margin-bottom:11px;">
            <div style="font-family:'IBM Plex Mono',monospace; font-size:9px; color:#9A8E78; letter-spacing:0.06em; text-transform:uppercase; margin-bottom:6px;">Kod do skrytki z kluczami</div>
            <div style="font-family:'IBM Plex Mono',monospace; font-size:26px; font-weight:600; letter-spacing:0.18em; color:#F3EFE5;">4 7 2 9</div>
            <div style="font-family:'IBM Plex Mono',monospace; font-size:9px; color:#6B6555; margin-top:5px; letter-spacing:0.03em;">WIDOCZNY OD 9 LIP, 13:00</div>
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div style="border:1px solid #3A352A; border-radius:3px; padding:11px;"><div style="font-family:'IBM Plex Mono',monospace; font-size:9px; color:#6B6555; letter-spacing:0.06em; text-transform:uppercase;">WiFi</div><div style="font-size:13px; font-weight:600; color:#F3EFE5; margin-top:2px;">Centrum_5G</div></div>
            <div style="border:1px solid #3A352A; border-radius:3px; padding:11px;"><div style="font-family:'IBM Plex Mono',monospace; font-size:9px; color:#6B6555; letter-spacing:0.06em; text-transform:uppercase;">Hasło</div><div style="font-size:13px; font-weight:600; color:#F3EFE5; margin-top:2px;">goscie2026</div></div>
          </div>
        </div>
        <div style="background:#FBFAF6; border:1px solid #DDD5C3; border-radius:5px; padding:16px;">
          <div style="font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:#A0987F; margin-bottom:4px;">Polecane w okolicy</div>
          <div style="display:grid; grid-template-columns:auto 1fr auto; gap:12px; align-items:center; padding:9px 0; border-bottom:1px solid #EFE9DA;"><span style="font-family:'IBM Plex Mono',monospace; font-size:10px; color:#D9492B; font-weight:600;">01</span><span style="font-size:13px;">Kawiarnia Mela</span><span style="font-family:'IBM Plex Mono',monospace; font-size:10px; color:#9A917D;">120 M</span></div>
          <div style="display:grid; grid-template-columns:auto 1fr auto; gap:12px; align-items:center; padding:9px 0;"><span style="font-family:'IBM Plex Mono',monospace; font-size:10px; color:#D9492B; font-weight:600;">02</span><span style="font-size:13px;">Wzgórze Wawelskie</span><span style="font-family:'IBM Plex Mono',monospace; font-size:10px; color:#9A917D;">850 M</span></div>
        </div>
      </div>
    </div>`,

  /* 4 · FINANSE */ `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
      <div style="font-family:'IBM Plex Mono',monospace; display:flex; background:#FBFAF6; border:1px solid #DDD5C3; border-radius:3px; overflow:hidden; font-size:11px; letter-spacing:0.04em; text-transform:uppercase;">
        <span style="padding:8px 13px; color:#9A917D; border-right:1px solid #EFE9DA;">Miesiąc</span>
        <span style="padding:8px 13px; font-weight:600; background:#17150F; color:#F3EFE5;">Rok 2026</span>
        <span style="padding:8px 13px; color:#9A917D; border-left:1px solid #EFE9DA;">Wszystko</span>
      </div>
      <div style="padding:9px 15px; background:#FBFAF6; border:1px solid #DDD5C3; border-radius:3px; font-weight:600; font-size:13px;">↓ Eksport PDF</div>
    </div>
    <div style="display:grid; grid-template-columns:repeat(4,1fr); border:1px solid #DDD5C3; border-radius:5px; overflow:hidden; margin-bottom:16px;">
      <div style="padding:16px; background:#FBFAF6; border-right:1px solid #EFE9DA;"><div style="font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:#A0987F;">Przychód brutto</div><div style="font-size:24px; font-weight:800; margin-top:6px;">84 600 zł</div></div>
      <div style="padding:16px; background:#FBFAF6; border-right:1px solid #EFE9DA;"><div style="font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:#A0987F;">Prowizje i koszty</div><div style="font-size:24px; font-weight:800; margin-top:6px; color:#A2553F;">− 15 080 zł</div></div>
      <div style="padding:16px; background:#17150F; color:#F3EFE5;"><div style="font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:#8FBBA6;">Zysk netto</div><div style="font-size:24px; font-weight:800; margin-top:6px; color:#7FD0AC;">69 520 zł</div></div>
      <div style="padding:16px; background:#FBFAF6;"><div style="font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:#A0987F;">Śr. cena / noc</div><div style="font-size:24px; font-weight:800; margin-top:6px;">348 zł</div></div>
    </div>
    <div style="display:grid; grid-template-columns:1.6fr 1fr; gap:16px;">
      <div data-hl style="background:#FBFAF6; border:1px solid #DDD5C3; border-radius:5px; padding:18px;">
        <div style="font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:#A0987F; margin-bottom:18px;">Przychód miesięczny · 2026</div>
        <div style="display:flex; align-items:flex-end; gap:9px; height:150px;">
          <div style="flex:1; height:32%; background:#E0D8C6; border-radius:2px 2px 0 0;"></div><div style="flex:1; height:40%; background:#E0D8C6; border-radius:2px 2px 0 0;"></div><div style="flex:1; height:55%; background:#E0D8C6; border-radius:2px 2px 0 0;"></div><div style="flex:1; height:62%; background:#E0D8C6; border-radius:2px 2px 0 0;"></div><div style="flex:1; height:78%; background:#D9492B; border-radius:2px 2px 0 0;"></div><div style="flex:1; height:92%; background:#D9492B; border-radius:2px 2px 0 0;"></div><div style="flex:1; height:60%; background:#E0D8C6; border-radius:2px 2px 0 0;"></div><div style="flex:1; height:50%; background:#E0D8C6; border-radius:2px 2px 0 0;"></div><div style="flex:1; height:44%; background:#E0D8C6; border-radius:2px 2px 0 0;"></div><div style="flex:1; height:38%; background:#E0D8C6; border-radius:2px 2px 0 0;"></div><div style="flex:1; height:30%; background:#E0D8C6; border-radius:2px 2px 0 0;"></div><div style="flex:1; height:25%; background:#E0D8C6; border-radius:2px 2px 0 0;"></div>
        </div>
        <div style="font-family:'IBM Plex Mono',monospace; display:flex; justify-content:space-between; font-size:9px; color:#9A917D; margin-top:8px;"><span>STY</span><span>LUT</span><span>MAR</span><span>KWI</span><span>MAJ</span><span>CZE</span><span>LIP</span><span>SIE</span><span>WRZ</span><span>PAŹ</span><span>LIS</span><span>GRU</span></div>
      </div>
      <div style="background:#FBFAF6; border:1px solid #DDD5C3; border-radius:5px; padding:18px;">
        <div style="font-family:'IBM Plex Mono',monospace; font-size:10px; letter-spacing:0.1em; text-transform:uppercase; color:#A0987F; margin-bottom:16px;">Przychód wg kanału</div>
        <div style="margin-bottom:15px;"><div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:6px;"><span>Airbnb</span><span style="font-family:'IBM Plex Mono',monospace; font-weight:600;">48%</span></div><div style="height:7px; background:#EFE9DA; border-radius:3px; overflow:hidden;"><div style="width:48%; height:100%; background:#D9492B;"></div></div></div>
        <div style="margin-bottom:15px;"><div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:6px;"><span>Booking.com</span><span style="font-family:'IBM Plex Mono',monospace; font-weight:600;">34%</span></div><div style="height:7px; background:#EFE9DA; border-radius:3px; overflow:hidden;"><div style="width:34%; height:100%; background:#234B7A;"></div></div></div>
        <div><div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:6px;"><span>Bezpośrednie</span><span style="font-family:'IBM Plex Mono',monospace; font-weight:600;">18%</span></div><div style="height:7px; background:#EFE9DA; border-radius:3px; overflow:hidden;"><div style="width:18%; height:100%; background:#2F6B53;"></div></div></div>
      </div>
    </div>`,
];

const NAV = [
  { idx: '01', label: 'Pulpit', on: 0 }, { idx: '02', label: 'Kalendarz', on: 1 },
  { idx: '03', label: 'Obiekty', on: 2 }, { idx: '04', label: 'Rezerwacje', on: 3 },
  { idx: '05', label: 'Finanse', on: 4 },
];

const HL_PAD = 6; // oddech ramki highlightu wokół treści (px w układzie okna 1160)

export default function LandingScrollDemo() {
  const containerRef = useRef(null);
  const slotRef = useRef(null);
  const boxRef = useRef(null);       // pudełko treści (inset:20) — układ odniesienia highlightu
  const hlRef = useRef(null);        // ramka highlightu — pozycjonowana imperatywnie z pomiaru DOM
  const tickRef = useRef(false);
  const indexRef = useRef(0);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [winScale, setWinScale] = useState(0.78);
  const [slotW, setSlotW] = useState(360);
  const [compact, setCompact] = useState(false);

  // sterowanie indeksem scrollem (desktop) — 1:1 z silnikiem support.js
  useEffect(() => {
    const mq = window.matchMedia('(max-width:860px)');
    const applyMq = () => setCompact(mq.matches);
    applyMq();
    mq.addEventListener('change', applyMq);

    const compute = () => {
      tickRef.current = false;
      const el = containerRef.current;
      if (!el || mq.matches) return; // na mobile indeks steruje klik, nie scroll
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      let p = total > 0 ? (-rect.top) / total : 0;
      p = Math.max(0, Math.min(1, p));
      let i = Math.floor(p * FEATURES.length - 0.0001);
      i = Math.max(0, Math.min(FEATURES.length - 1, i));
      setProgress(p); setIndex(i);
    };
    const onScroll = () => { if (tickRef.current) return; tickRef.current = true; requestAnimationFrame(compute); };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    compute();

    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      setSlotW((prev) => (Math.abs(prev - cr.width) > 1 ? cr.width : prev));
      const scale = Math.min(cr.width / 1160, cr.height / 764, 0.78);
      setWinScale((prev) => (Math.abs(prev - scale) > 0.004 ? Math.max(0.3, scale) : prev));
    });
    if (slotRef.current) ro.observe(slotRef.current);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      mq.removeEventListener('change', applyMq);
      ro.disconnect();
    };
  }, []);

  const scrollToIndex = useCallback((i) => {
    if (compact) { setIndex(i); return; }
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    const target = (i + 0.5) / FEATURES.length;
    window.scrollTo({ top: window.scrollY + rect.top + target * total, behavior: 'smooth' });
  }, [compact]);

  // Highlight liczony z REALNEGO elementu ([data-hl] aktywnego ekranu), nie z ręcznych %.
  // offset* są w nieskalowanych px układu okna (1160), więc ramka trzyma się treści w każdej skali.
  // Pozycjonowanie imperatywne (bez stanu) — nakładka liczona z DOM, zero re-renderów przy pomiarze.
  const measureHL = useCallback((i) => {
    const box = boxRef.current;
    const hl = hlRef.current;
    if (!box || !hl) return;
    const t = box.querySelector(`[data-screen="${i}"] [data-hl]`);
    if (!t) { hl.style.opacity = '0'; return; }
    hl.style.top = `${t.offsetTop - HL_PAD}px`;
    hl.style.left = `${t.offsetLeft - HL_PAD}px`;
    hl.style.width = `${t.offsetWidth + HL_PAD * 2}px`;
    hl.style.height = `${t.offsetHeight + HL_PAD * 2}px`;
    hl.style.opacity = '1';
  }, []);

  // pomiar po każdej zmianie ekranu (przed malowaniem — bez migotania); ref trzyma aktualny indeks dla handlerów
  useLayoutEffect(() => { indexRef.current = index; measureHL(index); }, [index, measureHL]);

  // ponowny pomiar, gdy fonty domierzą układ lub zmieni się rozmiar okna
  useEffect(() => {
    const remeasure = () => measureHL(indexRef.current);
    if (document.fonts && document.fonts.status !== 'loaded') {
      document.fonts.ready.then(remeasure).catch(() => {});
    }
    window.addEventListener('resize', remeasure);
    return () => window.removeEventListener('resize', remeasure);
  }, [measureHL]);

  const active = FEATURES[index];
  const compactScale = Math.min(slotW / 1160, 0.92); // skala okna na mobile (szerokość slotu)

  return (
    <div className="wp4-sd" ref={containerRef} id="panel"
      style={{ position: 'relative', height: compact ? 'auto' : '520vh' }}>
      <div className="wp4-sd__sticky"
        style={{ position: compact ? 'static' : 'sticky', top: 0, height: compact ? 'auto' : '100vh',
          display: 'flex', alignItems: 'center', gap: '3vw', padding: '0 clamp(20px,4vw,72px)',
          flexDirection: compact ? 'column' : 'row' }}>

        {/* LEWA: szyna + kroki */}
        <div className="wp4-sd__rail-wrap"
          style={{ width: compact ? '100%' : '35%', minWidth: compact ? 0 : 300, maxWidth: compact ? 'none' : 440,
            display: 'flex', gap: 22, alignItems: 'flex-start', flexShrink: 0, order: compact ? 2 : 1,
            paddingTop: compact ? 24 : 0 }}>
          {!compact && (
            <div style={{ position: 'relative', width: 14, height: 250, flexShrink: 0, marginTop: 6 }}>
              <div style={{ position: 'absolute', left: 6, top: 6, bottom: 6, width: 2, background: '#DDD5C3', borderRadius: 2 }} />
              <div style={{ position: 'absolute', left: 6, top: 6, width: 2, background: '#D9492B', borderRadius: 2, height: `${(progress * 238).toFixed(1)}px`, transition: 'height .12s linear' }} />
              {FEATURES.map((f, i) => (
                <button key={f.navIdx} onClick={() => scrollToIndex(i)} title={f.pageTitle}
                  aria-label={`Przejdź do: ${f.pageTitle}`}
                  style={{ position: 'absolute', left: 0, top: `${(i / (FEATURES.length - 1) * 236).toFixed(1)}px`,
                    width: 14, height: 14, borderRadius: '50%', padding: 0, cursor: 'pointer',
                    background: i <= index ? '#D9492B' : '#F3EFE5', border: `2px solid ${i <= index ? '#D9492B' : '#C9C0AD'}`,
                    transform: i === index ? 'scale(1.35)' : 'scale(1)',
                    transition: 'background .4s ease, border-color .4s ease, transform .4s cubic-bezier(.22,1,.36,1)' }} />
              ))}
            </div>
          )}

          <div style={{ position: compact ? 'static' : 'relative', height: compact ? 'auto' : 250, flex: 1, minWidth: 0,
            display: compact ? 'flex' : 'block', flexDirection: 'column', gap: compact ? 10 : 0 }}>
            {FEATURES.map((f, i) => {
              const on = i === index;
              const blk = (
                <>
                  <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 12, fontWeight: 500, letterSpacing: '0.1em', color: on ? '#D9492B' : '#A0987F', marginBottom: compact ? 8 : 16 }}>
                    {f.kicker}&nbsp;·&nbsp;{f.tag}
                  </div>
                  <h2 style={{ fontSize: compact ? 24 : 38, lineHeight: 1.1, fontWeight: 800, letterSpacing: '-0.025em', margin: `0 0 ${compact ? 6 : 16}px` }}>
                    {f.ta}<span style={{ fontFamily: "'Newsreader',serif", fontWeight: 500, fontStyle: 'italic' }}>{f.tem}</span>{f.tb}
                  </h2>
                  <p style={{ fontSize: compact ? 14.5 : 16, lineHeight: 1.6, color: '#524C3F', margin: 0 }}>{f.body}</p>
                </>
              );
              if (compact) {
                return (
                  <button key={f.navIdx} onClick={() => setIndex(i)} aria-current={on ? 'true' : undefined}
                    style={{ textAlign: 'left', font: 'inherit', cursor: 'pointer', width: '100%',
                      background: on ? 'var(--surface)' : 'transparent', border: `1px solid ${on ? 'var(--ink)' : 'transparent'}`,
                      borderRadius: 4, padding: '16px 18px', transition: 'background .2s, border-color .2s' }}>
                    {blk}
                  </button>
                );
              }
              return (
                <div key={f.navIdx} style={{ position: 'absolute', inset: 0, opacity: on ? 1 : 0,
                  transform: on ? 'translateY(0)' : 'translateY(16px)', pointerEvents: on ? 'auto' : 'none',
                  transition: 'opacity .5s ease, transform .5s cubic-bezier(.22,1,.36,1)' }}>
                  {blk}
                </div>
              );
            })}
            {compact && (
              <Link to="/login" className="wp4-link wp4-link--strong" style={{ padding: '6px 18px' }}>
                Załóż darmowe konto — 14 dni testów →
              </Link>
            )}
          </div>
        </div>

        {/* PRAWA: okno przeglądarki + mockup */}
        <div ref={slotRef} style={{ flex: 1, width: compact ? '100%' : 'auto',
          height: compact ? `${Math.round(764 * compactScale)}px` : '78vh', overflow: compact ? 'hidden' : 'visible',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minWidth: 0, position: 'relative', order: compact ? 1 : 2 }}>
          <div role="img" data-view={active.label.toLowerCase()} data-idx={index}
            aria-label={`Podgląd panelu WynajemPRO — widok: ${active.label}`}
            style={{ width: 1160, transform: `scale(${compact ? compactScale : winScale})`,
              transformOrigin: compact ? 'top left' : 'center center', flexShrink: 0, borderRadius: 10, overflow: 'hidden',
              position: compact ? 'absolute' : 'static', top: compact ? 0 : 'auto', left: compact ? 0 : 'auto',
              boxShadow: '0 50px 100px -20px rgba(23,21,15,0.45), 0 0 0 1px rgba(23,21,15,0.06)' }}>

            {/* chrome przeglądarki */}
            <div style={{ height: 44, background: '#E7E0D2', borderBottom: '1px solid #D5CCB8', display: 'flex', alignItems: 'center', gap: 16, padding: '0 16px' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#EC6A5E' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#F4BF4F' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#61C554' }} />
              </div>
              <div style={{ flex: 1, height: 26, background: '#F3EFE5', border: '1px solid #D5CCB8', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, maxWidth: 420, margin: '0 auto' }}>
                <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: '#7A715C', letterSpacing: '0.02em' }}>app.wynajempro.pl</span>
              </div>
              <div style={{ width: 52 }} />
            </div>

            {/* powłoka aplikacji */}
            <div style={{ display: 'flex', height: 720, background: '#F3EFE5' }}>
              {/* SIDEBAR */}
              <div style={{ width: 196, flexShrink: 0, background: '#17150F', color: '#8C8576', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em', color: '#F3EFE5', padding: '20px 20px 22px' }}>
                  Wynajem<span style={{ fontFamily: "'IBM Plex Mono',monospace", fontWeight: 500, fontSize: 11, background: '#D9492B', color: '#fff', padding: '2px 5px', marginLeft: 3, letterSpacing: '0.05em', borderRadius: 2 }}>PRO</span>
                </div>
                {NAV.map((n) => {
                  const on = n.on === index;
                  return (
                    <div key={n.idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px', fontSize: 14,
                      borderLeft: `2px solid ${on ? '#D9492B' : 'transparent'}`, color: on ? '#F3EFE5' : '#8C8576',
                      background: on ? 'rgba(255,255,255,0.05)' : 'transparent', fontWeight: on ? 600 : 500,
                      transition: 'color .45s ease, background .45s ease, border-color .45s ease' }}>
                      <span style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 11, color: on ? '#D9492B' : '#5C574A' }}>{n.idx}</span>
                      <span>{n.label}</span>
                    </div>
                  );
                })}
                <div style={{ fontFamily: "'IBM Plex Mono',monospace", margin: '24px 20px 12px', fontSize: 10, letterSpacing: '0.12em', color: '#4F4A3F' }}>SYNCHRONIZACJA</div>
                <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 11, fontSize: 12.5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><span style={{ width: 7, height: 7, background: '#5FB389', borderRadius: 2 }} />Airbnb<span style={{ fontFamily: "'IBM Plex Mono',monospace", marginLeft: 'auto', color: '#4F4A3F', fontSize: 10 }}>2 MIN</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><span style={{ width: 7, height: 7, background: '#5FB389', borderRadius: 2 }} />Booking.com<span style={{ fontFamily: "'IBM Plex Mono',monospace", marginLeft: 'auto', color: '#4F4A3F', fontSize: 10 }}>5 MIN</span></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><span style={{ width: 7, height: 7, background: '#C99A2E', borderRadius: 2 }} />Nocowanie<span style={{ fontFamily: "'IBM Plex Mono',monospace", marginLeft: 'auto', color: '#4F4A3F', fontSize: 10 }}>···</span></div>
                </div>
                <div style={{ marginTop: 'auto', borderTop: '1px solid #2C2920', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 11 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 3, background: '#D9492B', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>KM</div>
                  <div style={{ lineHeight: 1.3 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#F3EFE5' }}>Kalina Morawiec</div>
                    <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: '#6B6555', letterSpacing: '0.05em' }}>PLAN GOSPODARZ</div>
                  </div>
                </div>
              </div>

              {/* MAIN */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <div style={{ height: 60, flexShrink: 0, borderBottom: '1px solid #DDD5C3', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: '-0.02em' }}>{active.pageTitle}</div>
                    <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#A0987F', marginTop: 2 }}>{active.pageSub}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FBFAF6', border: '1px solid #DDD5C3', borderRadius: 3, padding: '8px 12px', width: 200, color: '#9A917D', fontSize: 13 }}>
                      <span>Szukaj rezerwacji…</span>
                    </div>
                    <div style={{ padding: '9px 15px', background: '#D9492B', color: '#fff', borderRadius: 3, fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}>+ Rezerwacja</div>
                  </div>
                </div>

                <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                  <div ref={boxRef} style={{ position: 'absolute', inset: 20 }}>
                    {/* highlight — geometria mierzona z [data-hl] aktywnego ekranu (measureHL, imperatywnie) */}
                    <div ref={hlRef} style={{ position: 'absolute', zIndex: 6, border: '2px solid #D9492B', borderRadius: 6, background: 'rgba(217,73,43,0.05)', boxShadow: '0 0 0 4px rgba(217,73,43,0.12), 0 16px 40px rgba(217,73,43,0.2)', pointerEvents: 'none', top: 0, left: 0, width: 0, height: 0, opacity: 0, transition: 'top .6s cubic-bezier(.22,1,.36,1), left .6s cubic-bezier(.22,1,.36,1), width .6s cubic-bezier(.22,1,.36,1), height .6s cubic-bezier(.22,1,.36,1), opacity .3s ease' }} />
                    {/* 5 ekranów (cross-fade) */}
                    {SCREEN_HTML.map((html, i) => {
                      const on = i === index;
                      return (
                        <div key={i} data-screen={i} style={{ position: 'absolute', inset: 0, display: i === 0 ? 'flex' : 'block',
                          flexDirection: i === 0 ? 'column' : undefined, gap: i === 0 ? 14 : undefined,
                          opacity: on ? 1 : 0, transform: on ? 'translateY(0) scale(1)' : 'translateY(14px) scale(0.985)',
                          pointerEvents: on ? 'auto' : 'none', transition: 'opacity .55s cubic-bezier(.22,1,.36,1), transform .55s cubic-bezier(.22,1,.36,1)' }}
                          dangerouslySetInnerHTML={{ __html: html }} />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
