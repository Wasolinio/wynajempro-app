---
name: porzadek
description: Rytuał porządków w vaulcie Obsidiana (docs/) i repozytorium WynajemPRO. Używaj co miesiąc–dwa albo gdy właściciel prosi „zrób porządek". Obejmuje śmieci śledzone w gicie, skan martwych wikilinków, kontrolę świeżości indeksów wiedzy, sieroty vaulta, rozjazd kopii .docx i duplikaty skilli.
user-invocable: true
argument-hint: "[zakres: vault|repo|wszystko]"
---

# Porządek w vaulcie i repo

Rytuał powstał z porządków 2026-08-27, przy których w repozytorium znalazło się
**2337 commitowanych plików cache npm**, a indeksy vaulta wisiały nieaktualne od
7 tygodni. Wniosek: bałagan nie ogłasza się sam — trzeba go okresowo szukać.

## 1. Śmieci w gicie (najpierw, bo najdroższe)

```bash
git status --short
git ls-files | grep -iE 'cache|\.DS_Store|node_modules|\.log$' | head
du -sh .git
```

- **Śledzone śmieci** (cache, logi, artefakty buildów): `git rm -r --cached`, wpis do
  `.gitignore` **z komentarzem po co**, dopiero potem ewentualnie kasowanie z dysku.
- **Nieśledzone katalogi wiszące w `git status`** — zdecyduj od razu: dodać do repo
  (jeśli reszta rodzeństwa jest śledzona) albo do `.gitignore`. Nigdy nie zostawiaj
  „na potem" — po miesiącu nikt nie pamięta, czym są.
- `.git` puchnie mimo sprzątnięcia indeksu? Bloby żyją w historii — odchudzenie to
  przepisanie historii + force-push, **wyłącznie na decyzję właściciela**
  (stan po 2026-08-27: ~129 MB, wpis w [[Projects/Backlog]] → dług techniczny).
- `find . -name .DS_Store -not -path "./node_modules/*" -not -path "./.git/*" -delete`

## 2. Martwe wikilinki w vaulcie

```bash
cd docs && grep -rhoE "\[\[[^]|#]+" --include="*.md" . | sed 's/\[\[//' | sort -u | while read -r link; do f="$link.md"; if [ ! -f "$f" ] && [ ! -f "Projects/$f" ] && [ ! -f "legal/$f" ] && [ ! -f "support/$f" ]; then echo "BRAK CELU: [[$link]]"; fi; done
```

Martwy link naprawia się u źródła (literówka, zmiana nazwy) albo świadomie zostaje
(pseudo-linki do kodu w rodzaju `[[../src/...]]` — kosmetyka, nie błąd).

## 3. Świeżość indeksów wiedzy

Indeksy rozjeżdżają się bezgłośnie — porównuj z **górą [[Activity-Log]]**, nie z pamięcią:

| Plik | Co sprawdzić |
|---|---|
| [[Home]] | Quick Status i Recent Activity vs najnowsze wpisy dziennika; „Last Updated" |
| [[Projects/WynajemPRO]] | akapit **Status** i tabela ryzyk — czy nie mówią o zamkniętych sprawach |
| [[Projects/Milestones]] | czy ukończone kamienie z dziennika mają wiersz z datą |
| `CLAUDE.md` | „Aktualny focus", „Ostatni status", „Zadania w trakcie" — skompresuj zamknięte wpisy (treść żyje w dzienniku), bo ten plik ładuje się co sesję |
| `docs/README.md` i `src/README.md` | czy ścieżki nie wskazują plików przeniesionych do `/_legacy` |

## 4. Sieroty vaulta

```bash
find docs -name "Bez nazwy*" -o -name "Untitled*" -o -name "*.canvas" -o -name "*.base"
```

- Puste/niedokończone `.canvas`/`.base` i pliki „Bez nazwy" — usuń (git pamięta).
- **Nagrobki** (notatki-przekierowania „przeniesione do X") starsze niż miesiąc, do
  których nic już nie linkuje (sprawdź grepem) — usuń.
- Materiał historyczny z wartością → `docs/archive/`, nie kosz.

## 5. Rozjazd kopii `.docx`

Uruchom kontrolę ze skilla `dokument` (pętla porównująca daty `.md` vs `.docx`);
rozjazdy naprawia regeneracja, martwe kopie bez źródła — odszukanie źródła.

## 6. Duplikaty skilli i konfiguracji

- Skill w więcej niż jednej kopii (projekt `.claude/skills/` vs globalny
  `~/.claude/skills/`) = dryf czekający na okazję — `diff -rq` i zgłoś właścicielowi.
  Stan 2026-08-27: `humanizer` w 3 kopiach, klon projektowy w `.gitignore`.
- Konfiguracja edytora w dwóch miejscach (np. drugi vault `.obsidian/` poza `docs/`)
  — zostaje tylko aktywna.

## 7. Zakończenie — obowiązkowe

1. Wpis w [[Activity-Log]] wg skilla `dziennik` (co znalezione, co usunięte, co czeka
   na decyzję właściciela).
2. Zsynchronizuj to, co porządek zmienił: `CLAUDE.md`, [[Projects/Backlog]] (nowy dług
   techniczny), indeksy z kroku 3.
3. Commit **za zgodą właściciela** — porządek to dużo małych zmian, jeden opisowy commit.

## Czego porządek NIE robi

- Nie rusza kodu produkcyjnego „przy okazji" — znaleziska kodowe → [[Projects/Backlog]].
- Nie przepisuje historii gita i nie robi force-pusha.
- Nie kasuje niczego **nieśledzonego** bez obejrzenia zawartości (nieśledzone nie ma
  kopii w historii — pomyłka jest nieodwracalna).
- Nie zmienia treści dokumentów prawnych ani procesu zgłoszeń.
