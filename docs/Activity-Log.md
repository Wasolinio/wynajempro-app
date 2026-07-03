# 📝 Activity Log

Project timeline and key milestones.

---

## 2026-07-03

### Dopieszczanie UI — audyt i partia 1 (+ plan wdrożenia)
- ✅ `7e64c5a` + `9b4f363` — zielony `npm run lint`: scripts/archive + .agents/.claude w ignores ESLint, usunięty martwy `.eslintignore`
- ✅ `f2a6c17` — dopieszczenie v2: loader/toasty w tokenach, error boundary na `.wpb`, zero cieni (cookie bar, widget), press-scale, animacje modali i widoków
- ✅ Audyt UI (`designer`): 15 pozycji w 5 obszarach → [[Design-Notes]]; realizacja partiami 1–4
- ✅ `c89a3ce` — spelling.spec dogoniony do treści po `fb8a00e` (2 testy padały od reorganizacji, nie przez regresję)
- ✅ `0a7d12b` — **partia 1 audytu**: :focus-visible we wszystkich przestrzeniach, tokeny mikro-etykiet w WCAG AA (`--faint #716951`, `--label #746C54`, `--amber-ink #7E6119`), klasy widmowe, `.wpd-rotate`, spójne kolory kanałów (channelTone), `plural()` w utils, press-scale na landing/login, martwy App.css usunięty
- ✅ Plan wdrożenia na rynek → [[strategy/Plan-wdrożenia-na-rynek]] (strategist przerwany limitem — dokończony przez koordynatora)
- ✅ Partia 2 audytu (dostępność interakcji): hit-area ≥40px, klawiatura dla klikalnych kart/wierszy (`utils/a11y.js`), modale z Escape + fokus + `role=dialog` (`useDialogA11y`)
- ⚠️ Odkrycie: suita e2e w dużej mierze celuje w aplikację sprzed v2 (ui-scaling: Tailwind, teksty starego landinga) — pełny bieg to 33 passed / ~24 failed, wcześniejsze odczyty „33/33" błędne; plan naprawy: roadmapa X10, zalążek nowej suity `e2e/panel-v2.spec.js`
- 📋 Decyzje właściciela: partie 1–3 zatwierdzone · nawigacja mobilna = **dolny pasek** (roadmapa X12) · kontrast tokenów = minimalna korekta hexów (✅ w partii 1)

---

## 2026-07-02

### Zespół agentów + konsolidacja planowania
- ✅ Utworzono zespół 8 agentów w `.claude/agents/` (dev, code-reviewer, designer, seo, marketing, support, legal, strategist) + wspólna metodologia: [[Team-Playbook]]
- ✅ Konsolidacja planowania: [[Projects/Roadmap]] = jedyne źródło prawdy (NOW/NEXT/LATER); [[Projects/Milestones]] → sam widok dat; [[Projects/Backlog]] → poczekalnia pomysłów; „Do zrobienia w przyszłości" → wskaźnik na roadmapę
- ✅ Sprzątnięto nieaktualne dane planistyczne: fałszywe P0 w Backlogu (iCal token, storage leak), wróżone metryki (Lighthouse, godziny), 4 konkurujące listy „Next Steps"

### Aplikacja (commity 2026-06-30 → 2026-07-02)
- ✅ `76f53ff` — generator umów najmu (nawigacja 08)
- ✅ `ce2b80f` — przebudowa szczegółów rezerwacji: zadania zamiast przewodnika
- ✅ `af4af47` — widok Analityka: statystyki okresowe z porównaniem YoY
- ✅ `76a3059` — fix ujawniania danych dostępowych w przewodniku + restyl v2
- ✅ `c6f2975` — identyfikacja v2 na stronach publicznych i ekranach pobocznych
- ✅ `416b4cc` — baner zgody cookie w identyfikacji v2
- ✅ `fb8a00e` — porządek repo: jedna wersja produkcyjna (stare → `/_legacy`)
- ✅ `dd4aec2` — kreator przewodników V4 + limit uploadu 10 MB
- ⚠️ `b4aeb4e` — bypass weryfikacji e-mail dla testów V4 — **DO COFNIĘCIA przed launchem** (roadmapa N1)

---

## 2026-06-29

### Knowledge Base Expansion
- ✅ Created comprehensive Obsidian vault with 12+ documents
- ✅ Added critical Agent-Process-Map for fast code navigation
- ✅ Set up Projects tracking (Milestones, Backlog, WynajemPRO)
- ✅ Documented all features, architecture, tech stack
- ✅ Created debugging guide and performance optimization tips
- ✅ Added code patterns and best practices
- ✅ Setup resource library and glossary

**Impact**: Agents can now navigate code without grepping, saving 500+ tokens per session.

---

## 2026-06-28

### Firebase App Check Re-enabled
- ✅ Commit: 9f85a23 - "fix: Przywrócono App Check"
- Investigation: Was disabled for debugging (commit cbe1594)
- Status: Monitoring for issues

---

## 2026-06-25

### Google Login Loop Fixed
- ✅ Commit: 99cc65b - Fixed Google login redirect loop
- Issue: User got stuck in redirect after email verification
- Solution: Improved redirect logic in auth flow

---

## 2026-06-20

### X-Frame-Options Header Removed
- ✅ Commit: 2bad1ff - "fix: Zmiana X-Frame-Options na SAMEORIGIN"
- Issue: Header was blocking Firebase Auth iFrame
- Solution: Set to SAMEORIGIN to allow iframe from same origin

---

## 2026-06-15

### E2E Testing Infrastructure Completed
- ✅ Firebase Emulator configured
- ✅ Playwright setup complete
- ✅ Test scripts added to package.json
- ✅ Initial test files created

**Status**: Ready to write E2E tests

---

## 2026-06-10

### iCal Export Bug Discovered — later found FALSE
- 🔴 Reported: `secretToken` not generated on property create
- ✅ **2026-06-29 correction**: false alarm — `secretToken` IS generated in `ManagerApp.jsx` (create + legacy retrofit) and validated by `exportIcal`. No fix needed.
- Tracking: [[Known-Issues]], [[Agent-Process-Map]]

---

## 2026-06-05

### Storage Leak Bug Identified — later found FALSE
- 🔴 Reported: Guide files not deleted on account deletion
- ✅ **2026-06-29 correction**: false alarm — `deleteUserAccount` deletes Storage via `bucket.deleteFiles({ prefix: 'guides/${guideId}/' })` before removing docs. No leak.
- Tracking: [[Known-Issues]], [[Agent-Process-Map]]

---

## 2026-05-20

### Project Setup Complete
- ✅ React + Vite scaffolding
- ✅ Firebase integration
- ✅ Stripe payments setup
- ✅ Initial UI components created

---

## 2026-01-20

### Real-time Data Hook Implemented
- ✅ `useFirebaseData.js` created
- ✅ Real-time Firestore listeners setup
- ✅ State synchronization working

---

## 2026-01-15

### Project Kickoff
- ✅ WynajemPRO project started
- ✅ Tech stack decided (React, Firebase, Stripe, Playwright)
- ✅ Architecture planned
- ✅ Initial Firebase setup

---

## Key Decisions Made

See: [[Decisions]] for detailed ADRs

1. **Firebase Backend-as-a-Service** (ADR-001)
2. **React + Vite Frontend** (ADR-002)
3. **Playwright E2E Testing** (ADR-003)
4. **Firestore Security Rules** (ADR-004)
5. **useFirebaseData Hook** (ADR-005)
6. **Guest Guide Signature Requirement** (ADR-006)
7. **iCal Export via Cloud Function** (ADR-007)
8. **Storage Organization** (ADR-008)
9. **Cloud Functions for Deletion** (ADR-009)
10. **Polish Language Default** (ADR-010)
11. **Email Verification Required** (ADR-011)
12. **Stripe for Payments** (ADR-012)

---

## Recent Commits

```
bd710e4 docs: Konfiguracja systemu pamięci i bazy wiedzy w Obsidian
9f85a23 fix: Przywrócono App Check
cbe1594 chore: Tymczasowe wyłączenie App Check w celu diagnozy błędu 401 logowania
2bad1ff fix: Usunięcie nagłówka X-Frame-Options, który blokował iframe autoryzacji Firebase
9aa1aa2 fix: Zmiana X-Frame-Options na SAMEORIGIN aby umożliwić działanie Firebase Auth iframe
```

See: `git log` for full history

---

## Statistics

| Metric | Value |
|--------|-------|
| Total Commits | 20+ |
| E2E Tests Written | 8 |
| Documentation Pages | 16 |
| Known Bugs | 0 krytycznych (2 dawne = fałszywe alarmy, [[Known-Issues]]) |
| Features Working | 8+ |
| Time to Development | 6 months |

---

## Next Steps

➡️ **Przeniesione do [[Projects/Roadmap]]** (jedyne źródło prawdy planowania).
Log nie prowadzi własnej listy zadań — poprzednia natychmiast rozjechała się
z Milestones i Backlogiem. Tu zostaje wyłącznie historia.

---

## Lessons Learned

1. **Real-time data sync**: useFirebaseData hook essential for Firebase apps
2. **Security first**: Firestore rules catch bugs early
3. **Test early**: E2E tests would have caught bugs earlier
4. **Documentation matters**: Clear docs speed up development
5. **Polish language**: Important for target market

---

## Contributing

When adding updates:

1. Add entry at top of this file (most recent first)
2. Include date and description
3. Link to related issues/PRs/docs
4. Update commit sha if applicable

---

**Last Updated**: 2026-07-02  
**Maintained By**: Szymon + Claude

---

**Related**: [[Projects/Milestones]], [[Known-Issues]], [[Decisions]]

