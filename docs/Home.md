# 🏠 WynajemPRO Knowledge Hub

**Welcome!** Centrum kontroli dla całego projektu WynajemPRO. Zacznij tutaj.

---

## 📊 Quick Status

| Aspekt | Status | Link |
|--------|--------|------|
| **Project** | 🟢 GOTOWOŚĆ LAUNCHOWA — wszystkie blokery zamknięte 2026-08-26; launch = decyzja właściciela po becie | [[Projects/WynajemPRO]] |
| **Roadmap** | 🎯 Beta = ścieżka krytyczna; ścieżka A (pieniądze) ⏸ wstrzymana przez właściciela | [[Projects/Roadmap]] |
| **Known Bugs** | 🟡 1 otwarty (#20: flaky test 375 px w CI — nie blokuje) | [[Known-Issues]] |
| **Dokumenty prawne** | ✅ Opublikowane 2026-08-26 (bramka 47→0); zmiany TYLKO przez `docs/legal/` + `npm run legal:build` | [[legal/Bramka-publikacji-2026-08-26]] |
| **Zespół agentów** | 🤖 9 ról + wspólna metodologia | [[Team-Playbook]] |

---

## 🗺️ Knowledge Map

### 📚 Learn About Project
- **[[Architecture]]** - How the app works (data flow, components, security)
- **[[Agent-Process-Map]]** - ⚡ FAST AGENT NAVIGATION: High-density map of processes to file paths
- **[[Features]]** - What users can do (auth, guides, iCal, payments)
- **[[Tech-Stack]]** - Tech choices (React, Firebase, Playwright)
- **[[Schema]]** - Database structure (Firestore collections, fields)

### 🛠️ Development
- **[[Development]]** - Setup, testing, common tasks
- **[[Design-Notes]]** - UI/UX, animations, accessibility
- **[[API-Reference]]** - Cloud Functions, endpoints, integration

### 🐛 Issues & Solutions
- **[[Known-Issues]]** - Bugs and workarounds
- **[[Debugging]]** - Common problems and fixes
- **[[Performance]]** - Optimization tips and patterns

### 📋 Planning & Tracking
- **[[Projects/Roadmap]]** - ⭐ JEDYNE źródło prawdy planowania (NOW / NEXT / LATER)
- **[[Projects/WynajemPRO]]** - Main project overview
- **[[Projects/Milestones]]** - Widok dat (same kamienie, bez list zadań)
- **[[Projects/Backlog]]** - Poczekalnia pomysłów (niezaplanowane)
- **[[Projects/Zlecenia-wlasciciela]]** - Rejestr zleceń właściciela
- **[[Team-Playbook]]** - Zespół agentów + metodologia pracy
- **[[Decisions]]** - Architecture decisions log

### ⚖️ Legal & Support
- **[[legal/Regulamin]]** · **[[legal/Polityka-prywatnosci]]** · **[[legal/DPA-powierzenie]]** - jedyne źródło prawdy stron `/regulamin`, `/prywatnosc`, `/dpa`
- **[[support/Proces-obslugi-zgloszen]]** - obsługa zgłoszeń (⛔ kanał zawieszony dla danych osobowych od 2026-08-26)

### 📖 Resources & Reference
- **[[Resources]]** - Links, libraries, articles
- **[[Glossary]]** - Terms, acronyms, definitions
- **[[Patterns]]** - Code patterns and best practices

---

## 🚀 Common Workflows

### I want to...

**...start coding** → [[Development]] → Follow "Local Setup" section

**...understand the app** → [[Architecture]] → Read "Data Flow" and "Component Hierarchy"

**...add a new feature** → pomysł do [[Projects/Backlog]] → decyzja właściciela → wpis w [[Projects/Roadmap]] → [[Development]] "Common Tasks"

**...fix a bug** → [[Known-Issues]] → Pick issue → Check [[Debugging]] for similar cases

**...change legal docs** → edycja w `docs/legal/*.md` → `npm run legal:build` → deploy (nigdy edycja stron w `src/`)

**...deploy** → skill `deploy` (pre-flight, komenda per cel, weryfikacja live przez przeglądarkę)

**...write tests** → [[Development]] "Testing" section → Copy pattern from existing tests

**...understand decisions** → [[Decisions]] → Browse by date or topic

---

## 📅 Recent Activity

- **2026-08-27** - Strażnik zgłoszeń: LaunchAgent co 3 h powiadamia właściciela o nowych wiadomościach bez danych osobowych
- **2026-08-26** - 🚀 **Dokumenty prawne OPUBLIKOWANE** (bramka 47→0, weryfikacja live); wydanie poprawkowe: plan Max bez DPA → Anthropic poza Polityką §5, kanał supportu zawieszony dla danych osobowych; purge `contact_messages` wdrożony
- **2026-08-25** - ✅ Prawnik bez zastrzeżeń (N4 zamknięte); decyzja: ścieżka A (Stripe) wstrzymana do końca testów bety
- **2026-08-19/21** - Panel administratora `/admin`, migracja Stripe, dopieszczenie identyfikacji
- **2026-07-22** - Hosting multi-site: aplikacja na `wynajempro.com`, stary site = redirector 301
- **2026-07-09/10** - Blokery techniczne launchu wdrożone: weryfikacja e-mail (N1), paywall (N2), walidacja schematu (N3)
- **2026-07-02** - Zespół agentów + [[Team-Playbook]]; konsolidacja roadmapy

📖 See: [[Activity-Log]] for full history

---

## 🎯 Next Steps

1. **Sprawdź** [[Projects/Roadmap]] — beta jest ścieżką krytyczną (sekcja „Plan tygodnia")
2. **Nie ruszaj** ścieżki A (pieniądze) — wznawia wyłącznie właściciel
3. **Przed zmianą logiki biznesowej** przeczytaj [[Agent-Process-Map]]
4. **Po każdej zmianie stanu rzeczy** — wpis w [[Activity-Log]] (skill `dziennik`)

---

## 💡 Tips

- Use **backlinks** (arrows ↔️) to jump between related notes
- Check **graph view** (icon in left sidebar) to see connections
- Use **search** (Ctrl+Shift+F) to find anything
- Vault Obsidiana = katalog `docs/` (nie korzeń projektu)

---

**Last Updated**: 2026-08-27
**Maintained By**: Claude + You
**Update Frequency**: When significant changes occur

---

## 🔗 Quick Links

- **Live App**: https://wynajempro.com
- **GitHub**: https://github.com/Wasolinio/wynajempro-app
- **Firebase Console**: https://console.firebase.google.com (projekt `moje-domki-6c77d`, site `wynajempro`)
- **Panel administratora**: https://wynajempro.com/admin ([[Panel-administratora]])
