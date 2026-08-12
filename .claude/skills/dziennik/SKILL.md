---
name: dziennik
description: Wpis do docs/Activity-Log.md w konwencji WynajemPRO. Używaj po każdej zmianie, która zmieniła stan rzeczy — wdrożonej funkcji, naprawie, decyzji, deployu, odkryciu przy diagnostyce. Obejmuje znaczniki, wikilinki, zasadę erraty oraz synchronizację statusu w Roadmapie i Known-Issues.
user-invocable: true
argument-hint: "[czego dotyczy wpis]"
---

# Wpis do dziennika

Dziennik to **historia**, nie plan. Plan żyje w [[Projects/Roadmap]], znane usterki
w [[Known-Issues]], pomysły w [[Projects/Backlog]]. Wpis opisuje, co się faktycznie stało.

## Gdzie i w jakiej kolejności

Plik: `docs/Activity-Log.md`. Kolejność **odwrotnie chronologiczna** — najnowszy wpis
na górze, pod nagłówkiem pliku. Nowy dzień dostaje `## RRRR-MM-DD`, każda zmiana w tym
dniu własny `### Tytuł`. Tytuł nazywa zmianę, nie zadanie („Znacznik zgłoszeń testowych
w formularzu `/kontakt`", nie „Zadanie #12").

## Znaczniki

Wewnętrzne dokumenty używają znaczników emoji jako nawigacji. To **nie kłóci się**
z zasadą „zero emoji" z identyfikacji — tamta obowiązuje w produkcie i w treściach dla
klientów, nie w dzienniku.

| Znacznik | Do czego |
|---|---|
| 🎯 | powód, po co ta zmiana powstała |
| ✅ | zrobione i zweryfikowane (z dowodem) |
| ⚠️ | ostrzeżenie, ryzyko, rzecz do zapamiętania |
| 🛡️ | decyzja projektowa lub bezpieczeństwa wraz z uzasadnieniem |
| 📌 | skutek uboczny, notatka, zmiana w innym dokumencie |
| ⚖️ | granica: czego zmiana **nie** załatwia |
| 🔎 | przebieg diagnostyki |
| 🛑 | znalezione i usunięte |
| 🔥 | odkrycie, które zmienia obraz sprawy |
| ⏳ ⏸ | niedomknięte, czeka na decyzję lub dane |
| 🔴 | blokuje coś innego |

## Zasady treści

**Dowód, nie przekonanie** ([[Team-Playbook]] §6). Pisz `e2e 7/7`, nie „testy przechodzą".
Pisz `39 plików, release OK`, nie „deploy się udał". Liczby, hashe commitów, nazwy pól.

**Deklaracje datuj.** „e2e N/N" jest prawdziwe wyłącznie w dniu przebiegu.

**Bez zmyślonych liczb** (§8). Czego nie zmierzyłeś, tego nie wpisujesz. Żadnych estymat
ani metryk „na oko".

**Uczciwie** (§10). Co się nie udało, co zostaje otwarte, jakie ryzyko przechodzi dalej.
Porażka opisana wprost jest w porządku, zamieciona nigdy. Wpis z 2026-08-10 opisuje
pościg za nieistniejącym błędem i to jest wzorcowy wpis, bo zapisuje też wniosek.

**Uzasadniaj decyzje projektowe.** Nie „dodano parametr URL", tylko dlaczego parametr,
a nie widoczny checkbox. Za pół roku wartość ma powód, nie fakt.

## Errata: wpisu się nie przepisuje

Gdy późniejsze ustalenia obalają wpis, **zostawiasz go w pierwotnym brzmieniu** i dopisujesz
blok erraty tuż pod tytułem:

```markdown
> ⚠️ **ERRATA RRRR-MM-DD.** Co się okazało nieprawdą i skąd to wiadomo.
> Poniższe punkty zostają w pierwotnym brzmieniu (konwencja pliku), ale czytaj je
> z tą poprawką. Co z tego przeżywa: ... Upada wyłącznie: ...
```

Errata musi rozdzielić, **co przeżywa, a co upada** — inaczej czytelnik nie wie,
którym punktom ufać. Wzór: wpis z 2026-08-10.

## Wikilinki

Odsyłacze w formacie Obsidian: `[[Known-Issues]]`, `[[Projects/Roadmap]]`,
`[[support/Proces-obslugi-zgloszen]]`, `[[Design-Notes]]`. Ścieżka względem `docs/`.
Linkuj hojnie — dziennik jest punktem wejścia do reszty dokumentacji.

## Czego jeszcze nie zapomnieć

Wpis rzadko jest jedyną zmianą w dokumentach. Sprawdź i zaktualizuj **od razu**:

1. **[[Projects/Roadmap]]** — status pozycji (⬜ 🔄 ⏸ ✅). To jedyne źródło prawdy
   planowania i rozjeżdża się najszybciej.
2. **[[Known-Issues]]** — nowa usterka dostaje numer, rozwiązana dostaje domknięcie.
3. **[[Projects/Backlog]]** — dług techniczny zauważony przy okazji.
4. **[[Decisions]]** — jeśli zapadła decyzja architektoniczna lub produktowa.
5. **[[Projects/Zlecenia-wlasciciela]]** — jeśli wpis realizuje zlecenie.

Jeśli aktualizacja czegoś z tej listy jest potrzebna, a nie zrobiłeś jej, napisz to
wprost w raporcie zamiast zostawiać cicho.
