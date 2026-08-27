# 🎯 WynajemPRO — przegląd projektu

Centralna notatka projektu. Plan pracy: [[Projects/Roadmap]] (jedyne źródło prawdy).

---

## Co budujemy

SaaS do zarządzania wynajmem dla polskich gospodarzy: kalendarz rezerwacji i finansów
wielu obiektów, synchronizacja iCal, rozliczenia podatkowe (ryczałt/skala/VAT),
przewodniki dla gości z QR i danymi dostępowymi po podpisie, generator umów najmu,
analityka okresowa. Model: trial 14 dni → subskrypcja (Stripe).

**Status:** 🟢 **gotowość launchowa (2026-08-26)** — wszystkie blokery launchu zamknięte:
weryfikacja e-mail, paywall i walidacja schematu wdrożone 2026-07-09/10, prawnik bez
zastrzeżeń 2026-08-25, dokumenty prawne opublikowane 2026-08-26 (bramka 47→0).
Aplikacja na hostingu multi-site: site `wynajempro`, domena **wynajempro.com** (stary site
`moje-domki-6c77d` = redirector 301). **Ścieżką krytyczną jest beta** — ścieżka A
(pieniądze/Stripe) ⏸ wstrzymana decyzją właściciela do końca testów; **data launchu =
decyzja właściciela**. Szczegóły: [[Projects/Roadmap]].

**Zespół:** właściciel (wszystkie decyzje biznesowe) + zespół 9 agentów Claude
(`.claude/agents/`: dev, code-reviewer, designer, seo, marketing, support, feedback,
legal, strategist) pracujących wg [[Team-Playbook]].

---

## Fazy

1. **Pre-launch:** ✅ zamknięta 2026-08-26 (blokery techniczne + prawne + publikacja dokumentów).
2. **Beta (teraz):** testy testerów, feedback (`feedback`), dopieszczanie UI v2;
   wznowienie ścieżki A (Stripe) — wyłącznie decyzją właściciela.
3. **Launch i pierwsi klienci:** baza wiedzy, demo na landingu, fundament SEO,
   plan marketingowy — sekcja NEXT roadmapy.
4. **Rozbudowa wg sygnałów:** decyzje na podstawie zgłoszeń (`support`) i danych
   (`strategist`), pula pomysłów w [[Projects/Backlog]].

## Metryki

Mierzymy od launchu: rejestracje → aktywacja (pierwszy obiekt + rezerwacja) →
konwersja trial→płatny → churn. **Dziś brak danych — nie wpisujemy wymyślonych liczb.**
Przed launchem jedyna „metryka" to postęp bety: testerzy i ich zgłoszenia.

## Ryzyka (realne, z przeciwdziałaniem)

| Ryzyko | Przeciwdziałanie |
|---|---|
| Prawne: dane najemców/gości, wzorce umów najmu | ✅ domknięte: prawnik bez zastrzeżeń (2026-08-25), dokumenty opublikowane (2026-08-26); zmiany treści tylko przez `docs/legal/` + `npm run legal:build` |
| Bezpieczeństwo: sekrety gości, reguły Firestore | ✅ wdrożone: audyt `code-reviewer`, walidacja schematu; każda zmiana reguł wg skilla `reguly` |
| Brak przychodu mimo użytkowników | paywall wdrożony; uruchomienie płatności = ścieżka A (⏸ decyzja właściciela) |
| Niska adopcja | demo (X2), SEO (X9), plan marketingowy (X11); weryfikacja ICP zamiast założeń |
| Koszty Firebase przy skali | monitoring po launchu (backlog: dług techniczny) |

## Zależności

Firebase (Auth, Firestore, Storage, Functions v2, Hosting, App Check) · Stripe ·
Google OAuth · Playwright (e2e na emulatorach).

---

**Related:** [[Projects/Roadmap]] · [[Projects/Milestones]] · [[Projects/Backlog]] ·
[[Team-Playbook]] · [[Known-Issues]] · [[Architecture]]
