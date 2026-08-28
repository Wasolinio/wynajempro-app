# Prompt startowy dla Claude Code

Wklej poniższy tekst jako pierwszą wiadomość w Claude Code, w katalogu repo WynajemPRO,
mając folder `design_handoff_zadania/` skopiowany do repo (np. do `_design-reference/`).

---

Wdrażasz nowy widok panelu gospodarza: **Zadania**. Materiały leżą w
`_design-reference/design_handoff_zadania/`:

- `README.md` — specyfikacja hi-fi: układ, komponenty, dokładne wartości (kolory, typografia,
  odstępy, promienie), interakcje, animacje (czasy i krzywe), stan, tokeny, responsywność.
- `IMPLEMENTACJA.md` — plan wdrożenia w tym repo: model danych, lista plików nowych
  i modyfikowanych, kolejność w 8 krokach, kontrakty komponentów, testy e2e, ryzyka.
- `tokens-zadania.css` — gotowy blok CSS w konwencji `.wpd-*` do wklejenia w `styles.js`.
- `prototyp/Zadania.dc.html` — **referencja projektowa w HTML**, nie kod produkcyjny.
  Otwórz w przeglądarce (obok musi leżeć `support.js`) i użyj jako wzorca wyglądu
  oraz zachowania, zwłaszcza dla przeciągania i animacji.

Zasady pracy:

1. Najpierw przeczytaj `CLAUDE.md`, `PROJECT.md`, `docs/` i `src/pages/dashboard/styles.js`,
   żeby trzymać się istniejących konwencji repo (React 18 + Vite, Firebase, `lucide-react`,
   namespace `.wpd`, zero cieni i gradientów, linie 1 px, radius 3 px kontrolki / 4 px panele,
   blok `prefers-reduced-motion`).
2. Odtwórz projekt **1:1** — to makieta hi-fi. Nie improwizuj kolorów ani odstępów;
   wszystkie wartości są w `README.md`. Ikony bierz z `lucide-react`, nie kopiuj ścieżek SVG
   z prototypu.
3. Idź krokami z `IMPLEMENTACJA.md` § 3. Po każdym kroku uruchom build i testy.
   Kroki 1–4 dają wdrażalny moduł; krok 5 (przeciąganie) jest kluczową funkcją, nie odkładaj go.
4. Nie kopiuj plików z `prototyp/` do `src/`.
5. Zanim zaczniesz pisać kod, przedstaw plan pierwszego kroku (kolekcja `tasks`, reguły,
   indeksy, subskrypcja, akcje w kontekście) i poczekaj na potwierdzenie.

Zacznij od kroku 1.
