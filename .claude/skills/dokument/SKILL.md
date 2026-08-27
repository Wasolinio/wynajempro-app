---
name: dokument
description: Dokument dla właściciela w dwóch postaciach — .md (źródło prawdy) i .docx (kopia do czytania). Używaj przy każdym dokumencie pisanym do czytania przez właściciela — instrukcji, raporcie, analizie, podsumowaniu — oraz przy każdej aktualizacji istniejącego. Obejmuje generator build-docx.mjs, zestaw DOKUMENTY i kontrolę rozjazdu kopii z źródłem.
user-invocable: true
argument-hint: "[ścieżka .md albo temat dokumentu]"
---

# Dokument dla właściciela

## Zasada nadrzędna (Team-Playbook → „Dokumenty dla właściciela")

Każdy dokument pisany **do czytania przez właściciela** oddaje się w dwóch postaciach:
`.md` w `docs/` i `.docx` w `docs/docx/`.

- **Markdown jest źródłem prawdy.** Poprawki nanosi się w `.md` i regeneruje kopię.
- **`.docx` to artefakt** — jest w `.gitignore`, nigdy nie edytuje się go ręcznie.
- Dokument bez świeżej kopii `.docx` jest **niedokończony** — regeneracja to część
  zadania, nie „potem".

⚠️ **Zadania dla właściciela to co innego niż dokumenty.** Gdy właściciel ma coś
zrobić (kliknąć w konsoli, wysłać maila), pełna instrukcja idzie **najpierw do czatu**,
gotowa do skopiowania krok po kroku; plik w `docs/` jest kopią zapasową instrukcji,
nie jej miejscem (zasada właściciela z 2026-08-25, spisana w `CLAUDE.md`).

## Gdzie dokument mieszka

| Temat | Katalog |
|---|---|
| planowanie, instrukcje, zlecenia, handoffy | `docs/Projects/` |
| prawo, RODO, dokumenty publikowane w aplikacji | `docs/legal/` |
| support, artykuły pomocy, proces zgłoszeń | `docs/support/` |
| marketing / strategia | `docs/marketing/` · `docs/strategy/` |

Raport jednorazowy dostaje datę w nazwie: `Nazwa-RRRR-MM-DD.md` (konwencja repo).
Nazwa pliku = nazwa przyszłego `.docx`, więc bez polskich znaków i spacji.

## Generacja

```bash
node scripts/build-docx.mjs docs/ścieżka/Plik.md   # pojedynczy dokument
npm run docs:docx                                   # cały stały zestaw DOKUMENTY
```

- **Jednorazowy** dokument generuj ścieżką w argumencie — NIE dopisuj go do zestawu.
- **Cykliczny** (właściciel wraca do niego: instrukcje, rejestry) — dopisz do listy
  `DOKUMENTY` w `scripts/build-docx.mjs` i od tej pory regeneruj przy każdej
  aktualizacji, żeby kopia się nie rozjechała. Stan listy 2026-08-27:
  `Instrukcje-wlasciciela`, `Zlecenia-wlasciciela`, `Panel-administratora`.

Generator obsługuje **dokładnie ten podzbiór markdownu, którego używają nasze
dokumenty** (nagłówki `#`–`####`, pogrubienie/kursywa/kod/linki/wikilinki, listy
punktowane i numerowane, listy zadań `- [ ]`, cytaty `>`, tabele, bloki kodu, `---`).
Konstrukcje spoza listy nie wyrenderują się — po generacji **sprawdź plik wynikowy**,
zwłaszcza przy tabelach i zagnieżdżonych listach.

## Kontrola rozjazdu (przy porządkach i przed oddaniem)

Kopia starsza niż źródło = rozjazd do naprawienia jedną komendą generacji:

```bash
for d in docs/docx/*.docx; do b=$(basename "$d" .docx); m=$(find docs -name "$b.md" -not -path "*/docx/*" | head -1); [ -n "$m" ] && [ "$m" -nt "$d" ] && echo "ROZJAZD: $m nowszy niż $d"; done
```

Brak pliku źródłowego dla istniejącego `.docx` też jest sygnałem — źródło zmieniło
nazwę albo katalog; odszukaj je i przegeneruj, zamiast zostawiać martwą kopię.

## Rozgraniczenia

- **Teksty dla klientów** (landing, maile, wpisy, odpowiedzi supportu) to nie dokumenty
  dla właściciela — pisze się je ze skillem `humanizer` (kalibracja polska w jego `PL.md`).
- **Dokumenty prawne publikowane w aplikacji** (`docs/legal/`: Regulamin, Polityka, DPA)
  mają WŁASNY, ostrzejszy rytuał: `npm run legal:build` + deploy; `.docx` jest dla nich
  tylko kopią do czytania, a zmiany treści idą wyłącznie przez markdown + regenerację
  + deploy (bramka publikacji 2026-08-26).
- Wpis o powstaniu/aktualizacji ważnego dokumentu → [[Activity-Log]] (skill `dziennik`).
