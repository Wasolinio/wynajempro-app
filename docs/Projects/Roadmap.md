# 🗺️ Roadmapa — jedyne źródło prawdy planowania

> **Zasada nadrzędna:** decyzje „co robimy" żyją w JEDNYM miejscu — tutaj.
> [[Projects/Backlog]] to tylko poczekalnia niezaplanowanych pomysłów,
> [[Projects/Milestones]] to tylko widok dat, [[Activity-Log]] to historia.
> Wcześniej plany żyły w 4 miejscach naraz i się rozjechały (np. „krytyczne bugi",
> które od 29.06 były już wyjaśnione jako fałszywe alarmy — patrz [[Known-Issues]]).

## Jak czytać i aktualizować (metodologia)

- Każda pozycja ma: **po co** (cel biznesowy), **gotowe, gdy** (definicja ukończenia),
  **weryfikację** (jaki dowód) i **agenta** prowadzącego (`.claude/agents/`, patrz [[Team-Playbook]]).
- **Bez zmyślonych liczb.** Żadnych estymat godzinowych i wróżonych metryk — czego nie
  zmierzyliśmy, tego nie wpisujemy. Priorytet ma uzasadnienie słowne.
- Statusy: ⬜ do zrobienia · 🔄 w toku · ⏸ czeka na decyzję · ✅ zrobione (wpis w [[Activity-Log]]).
- Nowy pomysł trafia najpierw do [[Projects/Backlog]]; do roadmapy przechodzi decyzją
  właściciela — wtedy dostaje pełny opis wg szablonu.
- Aktualizuje każdy (agent lub właściciel), kto zmienia stan rzeczy — od razu, nie „potem".

---

## 🎯 Horyzont: publiczny launch

**Definicja launchu:** aplikacja może bezpiecznie przyjmować płacących klientów —
prawnie (regulamin, RODO), technicznie (weryfikacja, paywall, walidacja danych)
i operacyjnie (jest jak pomagać użytkownikom). **Data launchu: decyzja właściciela**
po domknięciu sekcji NOW.

---

## 🔴 NOW — blokery launchu

### N1. Przywrócenie weryfikacji e-mail
**Po co:** bypass wprowadzony dla testów V4 (commit `b4aeb4e`) pozwala wejść do panelu bez potwierdzenia adresu — otwarta furtka na fałszywe konta.
**Gotowe, gdy:** rejestracja e-mail wymaga weryfikacji przed dostępem do panelu; TODO z `b4aeb4e` usunięte.
**Weryfikacja:** e2e auth na emulatorach + test ręczny pełnego przepływu rejestracji.
**Agent:** `dev`, przegląd `code-reviewer`. **Status:** 🔄 (2026-07-04)
- ✅ **Kod przywrócony**: guard w `App.jsx` (ProtectedRoute), `WynajemContext.jsx` (onAuthStateChanged → signOut), `LoginPanel.jsx` (blokada logowania niezweryfikowanego); wszystkie 3 TODO z `b4aeb4e` usunięte. Konta Google pomijają wymóg (adres zweryfikowany u dostawcy).
- ✅ **e2e auth 13/13** — w tym „login niezweryfikowanego pokazuje baner" i nowy „niezweryfikowany nie wejdzie na /dashboard". Przy okazji odtworzono całą suitę `auth.spec` (była 0/12 — patrz [[Design-Notes]]/X10: brakujące eksporty w mocku + stale selektory pod v2).
- ⏸ **Zostaje test ręczny właściciela**: bypass powstał przez problem App Check / HTTP 403 (`b4aeb4e`; App Check ponownie włączony — [[Known-Issues]] #3). Runtime pełnego flow (real `sendEmailVerification` → link → `emailVerified` → wejście) trzeba potwierdzić na żywo lub na emulatorze Auth. Nie da się tego zweryfikować w środowisku agenta.
- ⬜ **Warstwa reguł niedokończona** (odkryte przy N4): `firestore.rules:9-13` `isOwnerAndVerified` ma `email_verified` ZAKOMENTOWANE — backend nie egzekwuje weryfikacji, tylko front. Domknąć razem z N2/N3 (ten sam plik i deploy). Zmiana reguł = trudno odwracalna → deploy i test na emulatorze pod nadzorem właściciela.

### N2. Egzekwowanie subskrypcji (paywall)
**Po co:** bez sprawdzania statusu subskrypcji/trialu aplikacja jest realnie darmowa — brak przychodu.
**Gotowe, gdy:** po wygaśnięciu trialu i braku subskrypcji użytkownik widzi `PaywallScreen` i nie ma dostępu do panelu; ścieżki Stripe (checkout → webhook → status) przetestowane.
**Weryfikacja:** test na emulatorach/koncie testowym Stripe: trial aktywny / wygasły / subskrypcja opłacona / anulowana.
**Agent:** `dev`, przegląd `code-reviewer`. **Status:** ⬜
- ⚠️ **Backend zaślepiony** (potwierdzone 2026-07-04): `firestore.rules:29-32` `hasActiveSubscription` → `return true` (reguły przepuszczają wszystkich). Front (`WynajemContext.isAccessLocked` + `PaywallScreen`) działa, ale reguły trzeba przywrócić.

### N3. Walidacja schematu danych (reguły + front)
**Po co:** bez walidacji w `firestore.rules` złośliwy lub wadliwy klient może zapisać dowolne dane — ryzyko bezpieczeństwa i spójności.
**Gotowe, gdy:** reguły walidują kształt zapisów (typy, wymagane pola, rozmiary) dla `rentals`, `settings`, `guides`; front waliduje przed wysłaniem; istniejące dane produkcyjne przechodzą.
**Weryfikacja:** testy reguł na emulatorze (zapis poprawny przechodzi, wadliwy odrzucany) + regresja e2e.
**Agent:** `dev` + `code-reviewer` (audyt reguł). **Status:** ⬜
- ⚠️ **Potwierdzone 2026-07-04**: `firestore.rules` `isValidRental` (`:38-41`) i `isValidGuide` (`:59-62`) → `return true` (walidacja ominięta). Tu też domknąć `email_verified` z N1 (jeden plik reguł).

### N4. Regulamin, polityka prywatności, powierzenie danych (DPA)
**Po co:** przyjmowanie płatności bez regulaminu i podstaw RODO to ryzyko prawne; gospodarze przetwarzają w aplikacji dane SWOICH najemców — potrzebne powierzenie przetwarzania. (Pozycja nr 1 z listy właściciela.)
**Gotowe, gdy:** projekty dokumentów w `docs/legal/` + weryfikacja przez prawnika-człowieka + wdrożone w aplikacji (`Terms`/`Privacy`) przez `dev`.
**Weryfikacja:** checklista zgodności `legal` (podstawy prawne z datą) + potwierdzenie prawnika.
**Agent:** `legal` (projekty) → właściciel + prawnik (akceptacja) → `dev` (wdrożenie). **Status:** 🔄 (2026-07-04)
- ✅ **Projekty gotowe** w `docs/legal/`: `Regulamin.md`, `Polityka-prywatnosci.md`, `DPA-powierzenie.md`, `Checklista-zgodnosci.md` — oparte na kodzie i źródłach (ISAP/UOKiK/UODO), z placeholderami na dane firmy. Wszystkie oznaczone „PROJEKT".
- ⏸ **Czeka na właściciela**: uzupełnić sekcję D checklisty (dane rejestrowe firmy, VAT/faktury, warunki founding members, model odstąpienia) + wybór kancelarii (otwarta decyzja nr 4).
- ⏸ **Czeka na prawnika-człowieka**: 9 punktów z sekcji E (m.in. odstąpienie przy Stripe, status „przedsiębiorcy na prawach konsumenta", kompletność DPA art. 28, nowelizacje 2026).
- 🔴 **Bramka publikacji (sekcja F)**: dokumentów NIE wolno publikować, dopóki N1–N3 nie są wdrożone (włącznie z regułami) — inaczej deklaracje rozejdą się ze stanem (rozliczalność, art. 5 ust. 2 RODO).

### N5. Audyt przedlaunchowy: bezpieczeństwo + RODO w kodzie
**Po co:** ostatnia bramka przed wpuszczeniem prawdziwych klientów i ich danych.
**Gotowe, gdy:** `code-reviewer` przejrzał `firestore.rules`, `storage.rules`, `functions/index.js` i przepływy sekretów (PIN/WiFi, `secretToken`); `legal` przejrzał przepływy danych osobowych; wszystkie 🔴 findingi rozwiązane.
**Weryfikacja:** raporty obu agentów z listą findingów i ich statusem.
**Agent:** `code-reviewer` + `legal`. **Status:** ⬜

---

## 🟡 NEXT — po odblokowaniu launchu (lub równolegle, gdy NOW czeka na prawnika)

### X1. Baza wiedzy / centrum pomocy dla użytkowników
Pozycja nr 2 z listy właściciela. **Po co:** mniej powtarzalnych pytań, łatwiejszy onboarding. **Gotowe, gdy:** artykuły FAQ w `docs/support/` (od `support`) + osadzone w aplikacji (`dev`). **Agent:** `support` → `dev`. ⬜

### X2. Interaktywne demo panelu na landingu
Pozycja nr 3: obecne demo nie działa; pomysł — mockup w stylu „apple scroll" (scrollowanie podświetla funkcje). **Po co:** pokazanie produktu bez rejestracji = wyższa konwersja. **Gotowe, gdy:** działające demo na landingu, zweryfikowane na mobile. **Agent:** `designer` + `dev`, przekaz `marketing`. ⬜

### X3. Przewodnik gościa — dokończenie
Pozycja nr 4, **częściowo zrobiona**: restyl v2 + naprawa odkrywania danych dostępowych ✅ (`76a3059`). Zostaje: możliwość dodania 2 plików (regulamin + przewodnik). **Agent:** `dev`. 🔄

### X4. Modyfikacja panelu księgowego
Pozycja nr 5. **⏸ czeka na decyzję:** zakres do doprecyzowania z właścicielem (co konkretnie ma się zmienić?). **Agent:** `dev` + `designer`. ⏸

### X5. Lepsze podsumowanie miesiąca
Pozycja nr 6, **możliwe częściowe pokrycie**: widok Analityka (statystyki okresowe + YoY) dodany w `af4af47`. **⏸ czeka na decyzję:** czego brakuje względem nowej Analityki? **Agent:** `dev` + `designer`. ⏸

### X6. Ustawienia konta w lewym dolnym rogu + profil
Pozycja nr 7: przeniesienie ustawień obok nazwy gospodarza, zdjęcie profilowe itd. **Agent:** `designer` + `dev`. ⬜

### X7. Rozbudowa szczegółów rezerwacji
Pozycja nr 8, **częściowo zrobiona**: przebudowa szczegółów rezerwacji (zadania zamiast przewodnika) ✅ (`ce2b80f`). **⏸ czeka na decyzję:** jakie informacje dodać w kolejnym kroku? **Agent:** `dev`. ⏸

### X8. Audyt językowy treści PL
Przeniesione ze starego Milestone 2: literówki, gramatyka, spójność tonu na landingu, w panelu i szablonach przewodników. **Agent:** `marketing` (ton) + `designer` (UI copy). ⬜

### X9. Fundament SEO
**Po co:** SPA na Firebase Hosting — najpierw trzeba ustalić, co w ogóle widzi Google. **Gotowe, gdy:** audyt indeksowalności (initial HTML, sitemap, robots, meta/OG, canonical) + wdrożone poprawki warstwy SEO + plan treści. **Agent:** `seo`. ⬜

### X10. Rozszerzenie testów e2e kluczowych przepływów
Przeniesione ze starego Milestone 4, bez fikcyjnego celu „80%": auth (z przywróconą weryfikacją), rezerwacje, przewodnik + sekrety, paywall/Stripe. **Agent:** `dev` + `code-reviewer`. ⬜
**⚠️ Odkrycie 2026-07-03:** duża część istniejącej suity celuje w aplikację sprzed v2 (ui-scaling: selektory Tailwinda, teksty starego landinga — 9 trwale czerwonych testów); pełny bieg to było „33 passed / ~24 failed", nie zielona suita. X10 to de facto przepisanie suity pod v2, nie tylko rozszerzenie. Zalążek: `e2e/panel-v2.spec.js` (smoke zalogowanego panelu na mockach).
**Postęp 2026-07-04:** `auth.spec` odtworzona w całości (0/12 → **13/13**) przy okazji N1 — naprawiony mock (`firebase-mock.js`: brakujące eksporty auth) + stale selektory pod v2 (zakładka Rejestracja, toggle Pokaż/Ukryj, checkbox regulaminu). Wiarygodne dziś: **auth 13, panel-v2 4, smoke 2, spelling 4**. Do przepisania zostają: `ui-scaling` (pre-v2), `stripe.spec` (m.in. `29.99` vs `29,99`, teksty), `stripe-payment`, `links-buttons`, `ical_token`, `guest-guide*`.

### X11. Plan marketingowy launchu
**Gotowe, gdy:** ICP potwierdzony z właścicielem, komunikacja wartości, wybór 1–2 kanałów na start z metrykami testu. **Agent:** `marketing` + `strategist`. ⬜

### X12. Nawigacja mobilna panelu — dolny pasek (decyzja właściciela 2026-07-03)
**Po co:** poniżej 980px sidebar znika bez żadnej alternatywy — panel jest nieużywalny na telefonie, a FAQ landinga obiecuje pełną responsywność (audyt UI poz. 4, [[Design-Notes]]).
**Gotowe, gdy:** dolny pasek w tokenach `--side` z podziałem 8 pozycji nawigacji (pasek + menu „więcej" — propozycja podziału do akceptacji właściciela); dostępne wylogowanie i status synchronizacji; `.wpd-cells`/`.wpd-fgrid` zwinięte w media query.
**Weryfikacja:** przejście wszystkich widoków na viewporcie mobile (375px) + e2e ui-scaling.
**Agent:** `designer` (projekt podziału) + `dev`. **Status:** ✅ 2026-07-04 (podział zatwierdzony przez właściciela: Pulpit · Kalendarz · Rezerwacje · Finanse + „Więcej"; e2e mobile w `panel-v2.spec.js`)

---

## 🟢 LATER — kierunkowo (szczegóły i pełna pula: [[Projects/Backlog]])

Powiadomienia e-mail · automatyczne wiadomości do gości · oceny/opinie gości ·
zaawansowany kalendarz dostępności · konta zespołowe · tryb ciemny · wielojęzyczność ·
głębsza synchronizacja kalendarzy · aplikacja mobilna · TypeScript · monitoring wydajności.

---

## ✅ Ostatnio ukończone (pełna historia: [[Activity-Log]])

- **2026-07-04** — partia 3 audytu: kalendarz (kolizja pasków back-to-back, kontrast amber, legenda), GuideBuilder bez systemowych okien, responsywność generatora, stan błędu newslettera (`432ea6a`); **X12**: dolny pasek nawigacji mobile + arkusz „Więcej" z testem e2e; **N1** kod przywrócony + `auth.spec` odtworzona 13/13 (zostaje ręczny test właściciela).
- **2026-07-03** — zielony lint (`7e64c5a`, `9b4f363`); dopieszczenie v2 — mikrointerakcje i zero cieni (`f2a6c17`); audyt UI 15 pozycji ([[Design-Notes]]) + partia 1: focus-visible, kontrast AA, spójność (`0a7d12b`); naprawa spelling.spec (`c89a3ce`); plan wdrożenia na rynek ([[strategy/Plan-wdrożenia-na-rynek]]).
- **2026-07-02** — zespół 8 agentów + [[Team-Playbook]]; konsolidacja roadmapy (ten plik); generator umów najmu (`76f53ff`); przebudowa szczegółów rezerwacji (`ce2b80f`); widok Analityka (`af4af47`).
- **2026-07-01** — naprawa ujawniania danych dostępowych w przewodniku + restyl v2 (`76a3059`); identyfikacja v2 na stronach publicznych (`c6f2975`).
- **2026-06-30** — porządek repo: jedna wersja produkcyjna, stare do `/_legacy` (`fb8a00e`); kreator przewodników V4 + upload 10 MB (`dd4aec2`); dashboard V4 jako produkcja (`53ecc5d`); baner cookie v2 (`416b4cc`).

---

## ⏸ Otwarte decyzje właściciela

1. **Data launchu** — po domknięciu NOW.
2. ~~**Cennik i pakiety**~~ ✅ **rozstrzygnięte 2026-07-04:** na launch jedna cena **29,99 zł/mc + founding members** (rabat roczny dla uczestników bety); pakiety wg liczby obiektów odłożone do sygnałów od realnych klientów (rekomendacja z [[strategy/Plan-wdrożenia-na-rynek]]).
3. **Zakres X4** (panel księgowy) i **X5** (podsumowanie miesiąca vs Analityka) i **X7** (szczegóły rezerwacji).
4. **Kancelaria/prawnik** do weryfikacji dokumentów z N4 — nadal otwarte (projekty przygotowuje `legal`, akceptacja przez prawnika‑człowieka).

**Related:** [[Team-Playbook]] · [[Projects/Backlog]] · [[Projects/Milestones]] · [[Known-Issues]] · [[Activity-Log]]
