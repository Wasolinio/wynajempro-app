# 📚 WynajemPRO Knowledge Base

Vault Obsidiana projektu WynajemPRO. **Zacznij od [[Home]]** — tam jest aktualny status,
mapa wiedzy i typowe przepływy pracy.

## Konwencje vaulta

- **Vault = katalog `docs/`** (nie korzeń repo). Konfiguracja vaulta (`.obsidian/app.json`
  itd.) jest w repo; układ paneli i grafu (`workspace*.json`, `graph.json`) — ignorowany.
- **[[Projects/Roadmap]]** — jedyne źródło prawdy planowania (NOW/NEXT/LATER).
- **[[Activity-Log]]** — historia zmian, wpisy wg skilla `dziennik` (najnowsze na górze).
- **`legal/`** — dokumenty prawne; źródło prawdy stron `/regulamin`, `/prywatnosc`, `/dpa`
  (`npm run legal:build` → deploy; nigdy edycja stron w `src/`).
- **`support/`** — proces obsługi zgłoszeń + artykuły centrum pomocy.
- **`docx/`** — generowane kopie `.docx` dla właściciela (`npm run docs:docx`; poza repo).
- **`archive/`** — materiały historyczne, nieaktualne celowo.
- Linkuj notatki wikilinkami `[[...]]`; nowe pomysły → [[Projects/Backlog]].

## Szybkie ścieżki do kodu

- Mapa żywego kodu: `src/README.md` · procesy → pliki: [[Agent-Process-Map]]
- Panel: `src/pages/dashboard/` · Landing/logowanie: `src/pages/landing/`
- Stan: `src/context/WynajemContext.jsx` + `src/hooks/useFirebaseData.js`
- Reguły: `firestore.rules` / `storage.rules` · Funkcje: `functions/index.js`

**Last Updated**: 2026-08-27
