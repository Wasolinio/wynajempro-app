# 🎯 WynajemPRO — przegląd projektu

Centralna notatka projektu. Plan pracy: [[Projects/Roadmap]] (jedyne źródło prawdy).

---

## Co budujemy

SaaS do zarządzania wynajmem dla polskich gospodarzy: kalendarz rezerwacji i finansów
wielu obiektów, synchronizacja iCal, rozliczenia podatkowe (ryczałt/skala/VAT),
przewodniki dla gości z QR i danymi dostępowymi po podpisie, generator umów najmu,
analityka okresowa. Model: trial 14 dni → subskrypcja (Stripe).

**Status:** 🟡 **pre-launch hardening** — wersja V2 wdrożona na Firebase Hosting
(`moje-domki-6c77d`), launch publiczny wstrzymany do domknięcia blokerów
(sekcja NOW w [[Projects/Roadmap]]: weryfikacja e-mail, paywall, walidacja schematu,
dokumenty prawne, audyt).

**Zespół:** właściciel (wszystkie decyzje biznesowe) + zespół 8 agentów Claude
(`.claude/agents/`: dev, code-reviewer, designer, seo, marketing, support, legal,
strategist) pracujących wg [[Team-Playbook]].

---

## Fazy

1. **Pre-launch (teraz):** blokery N1–N5 z roadmapy + dopieszczanie UI v2.
2. **Launch i pierwsi klienci:** baza wiedzy, demo na landingu, fundament SEO,
   plan marketingowy — sekcja NEXT roadmapy.
3. **Rozbudowa wg sygnałów:** decyzje na podstawie zgłoszeń (`support`) i danych
   (`strategist`), pula pomysłów w [[Projects/Backlog]].

## Metryki

Mierzymy od launchu: rejestracje → aktywacja (pierwszy obiekt + rezerwacja) →
konwersja trial→płatny → churn. **Dziś brak danych — nie wpisujemy wymyślonych liczb.**
Przed launchem jedyna „metryka" to: ile blokerów NOW zostało.

## Ryzyka (realne, z przeciwdziałaniem)

| Ryzyko | Przeciwdziałanie |
|---|---|
| Prawne: dane najemców/gości, wzorce umów najmu | N4 + N5 w roadmapie; `legal` + prawnik-człowiek przed launchem |
| Bezpieczeństwo: sekrety gości, reguły Firestore | audyt `code-reviewer` (N5), walidacja schematu (N3) |
| Brak przychodu mimo użytkowników | paywall (N2) + decyzja cenowa u `strategist` przed launchem |
| Niska adopcja | demo (X2), SEO (X9), plan marketingowy (X11); weryfikacja ICP zamiast założeń |
| Koszty Firebase przy skali | monitoring po launchu (backlog: dług techniczny) |

## Zależności

Firebase (Auth, Firestore, Storage, Functions v2, Hosting, App Check) · Stripe ·
Google OAuth · Playwright (e2e na emulatorach).

---

**Related:** [[Projects/Roadmap]] · [[Projects/Milestones]] · [[Projects/Backlog]] ·
[[Team-Playbook]] · [[Known-Issues]] · [[Architecture]]
