# Proces obsługi zgłoszeń (support) — z odczytem przez Firebase MCP

> **Status:** infrastruktura gotowa 2026-08-10. **Czytanie treści zgłoszeń jest ZABLOKOWANE
> do decyzji właściciela** — patrz sekcja „Bramka RODO". Do tego czasu proces opisuje stan
> docelowy, a nie obowiązującą praktykę.
>
> Ten plik opisuje **obsługę zgłoszeń**. Treści pomocy dla użytkowników są w pozostałych
> plikach `docs/support/` i generują się do aplikacji przez `npm run help:build`.

---

## 1. Skąd biorą się zgłoszenia

Jedyny kanał w aplikacji to formularz `/kontakt` ([ContactPage.jsx](../../src/pages/ContactPage.jsx)),
który od naprawy Known-Issues #6 (2026-07-16) zapisuje do kolekcji **`contact_messages`**.

**Kształt dokumentu** (wymuszony przez `firestore.rules:278-291`):

| Pole | Typ | Uwagi |
|---|---|---|
| `email` | string | ≤ 320 znaków, musi zawierać `@` i kropkę |
| `message` | string | 1–5000 znaków, **wolny tekst — może zawierać cokolwiek** |
| `createdAt` | timestamp | musi równać się `request.time` (nie da się podrobić daty) |
| `source` | string | opcjonalne, ≤ 50 znaków; formularz wysyła `'kontakt'` |

**Reguły dostępu:** `allow read, update, delete: if false`.
Czyli **żaden klient nie odczyta zgłoszeń** — ani panel, ani przeglądarka, ani gospodarz.
Odczyt jest możliwy wyłącznie ścieżką administracyjną (konsola Firebase albo Admin SDK/IAM),
bo reguły bezpieczeństwa nie obowiązują dostępu administracyjnego. **Na tym stoi cały ten
proces** — i to jest właściwy model: zgłoszenia są danymi Operatora, nie danymi aplikacji.

---

## 2. Bramka RODO — przeczytaj przed pierwszym użyciem 🔴

Odczyt zgłoszenia przez agenta oznacza, że **adres e-mail i treść wiadomości trafiają do
Anthropic** (dostawcy modelu) jako do podmiotu przetwarzającego.

Tymczasem [Polityka prywatności §5](../legal/Polityka-prywatnosci.md) wymienia dokładnie
trzech subprocesorów: **Google Cloud/Firebase, Stripe, Google OAuth**. Anthropic nie jest
na tej liście.

Ten projekt konsekwentnie odmawia deklarowania w dokumentach rzeczy niewdrożonych
(patrz: X-Robots-Tag celowo niewpisany do DPA do czasu deployu). Ta sama dyscyplina działa
w drugą stronę: **nie wolno przetwarzać kanałem, którego dokumenty nie deklarują.**

### Do rozstrzygnięcia przed pierwszym odczytem treści

1. **Decyzja właściciela:** czy zgłoszenia mają być obsługiwane z pomocą agenta?
2. Jeśli tak → `legal` dopisuje Anthropic do tabeli subprocesorów §5 (rola: „wsparcie obsługi
   zgłoszeń kierowanych do Operatora", uwaga o transferze poza EOG) **oraz** do erraty
   pakietu dla prawnika, bo pakiet jest już u niego.
3. Wiersz `contact_messages` w §2 Polityki dostaje wzmiankę o odbiorcy.
4. Dopiero wtedy pierwszy realny odczyt.

**Do tego czasu wolno:** listować kolekcje, liczyć zgłoszenia, czytać metadane (`createdAt`,
`source`). **Nie wolno:** czytać `email` ani `message`.

> Osobno, niezależnie od tej decyzji: **okres przechowywania `contact_messages` jest wciąż
> nierozstrzygnięty** ([DO DECYZJI] w §2 Polityki, propozycja kierunkowa 12 miesięcy).
> Wg stanowiska UODO okres musi być konkretny. To zadanie #31.

---

## 3. Jak odczytać zgłoszenia (po odblokowaniu bramki)

Serwer MCP jest skonfigurowany w [`.mcp.json`](../../.mcp.json) i wystaje **wyłącznie 5
narzędzi odczytu** (`--tools` wyłącza auto-wykrywanie, więc `firestore_delete_document`,
`firestore_delete_database` i `firebase_deploy` w ogóle nie istnieją w tej sesji).
Druga warstwa — lista `deny` w [`.claude/settings.json`](../../.claude/settings.json).

Uwierzytelnienie: serwer używa **poświadczeń zalogowanego Firebase CLI** (`wasyl515@gmail.com`).
Nie ma tu żadnego klucza serwisowego do wygenerowania ani przechowywania.

### Najnowsze zgłoszenia

Narzędzie `firestore_query_collection`:
- `collection_path`: `contact_messages/`
- `order`: po `createdAt` malejąco
- `limit`: np. 20

### Lista kolekcji (kontrola, że w ogóle jest się do czego łączyć)

Narzędzie `firestore_list_collections`, argument `parent`:
`projects/moje-domki-6c77d/databases/(default)/documents`

⚠️ **Pułapka:** `parent` to pełna ścieżka zasobu i jest **wymagany**. Wywołanie z pustym
obiektem zwraca mylące „Invalid resource field value in the request" — to błąd kształtu
żądania, **nie** problem z uprawnieniami. Nie diagnozuj tego jako braku dostępu.

### Kim jest zgłaszający

`auth_get_users` po adresie e-mail rozstrzyga, czy piszący ma konto — co zmienia odpowiedź
(użytkownik z wygasłym trialem vs osoba z zewnątrz). **Uwaga:** to odczyt danych konta,
więc podlega tej samej bramce z sekcji 2.

---

## 4. Ścieżka obsługi pojedynczego zgłoszenia

1. **Odczytaj** zgłoszenie (data, źródło, treść).
2. **Sprawdź, czy odpowiedź już istnieje** w `docs/support/` — Centrum pomocy powstało po to,
   żeby nie odpisywać w kółko to samo. Jeśli artykuł odpowiada: odeślij link do `/pomoc/<slug>`.
3. **Zakwalifikuj:**
   - *pytanie* → odpowiedź + ewentualnie nowe FAQ w artykule,
   - *błąd* → weryfikacja w kodzie (nigdy „na słowo"), wpis do [[Known-Issues]],
   - *żądanie RODO* (usunięcie danych, dostęp) → ścieżka z Polityki §6, **termin miesiąca**,
   - *pomysł* → [[Projects/Backlog]] z jednym zdaniem „po co".
4. **Odpisz z własnej skrzynki** (`kontakt@wynajempro.pl`). Aplikacja nie ma kanału wysyłki —
   agent przygotowuje treść, wysyłasz Ty.
5. **Odnotuj** — dopóki nie ma pola statusu (sekcja 5), rejestr obsłużonych zgłoszeń
   prowadzimy w [[Activity-Log]] przy okazji zmian, które z nich wynikły.
6. **Jeśli zgłoszenie zmieniło UI** → odśwież artykuły i uruchom `npm run help:build`.
   Artykuły cytują etykiety 1:1, więc starzeją się z każdym deployem (wniosek z X1).

---

## 5. Czego ten proces jeszcze NIE ma

Firebase MCP rozwiązuje **odczyt**. Nie rozwiązuje reszty — te braki idą do
[[Projects/Backlog]] i czekają na decyzję właściciela:

| Brak | Skutek dziś |
|---|---|
| **Brak powiadomienia o nowym zgłoszeniu** | Nikt się nie dowiaduje, że coś przyszło — trzeba pamiętać, żeby sprawdzić |
| **Brak statusu zgłoszenia** | `hasOnly` w regułach dopuszcza 4 pola, `update` zabroniony — nie da się oznaczyć „obsłużone". Przy dwóch zgłoszeniach nieistotne, przy dwudziestu bolesne |
| **Brak kanału odpowiedzi** | Odpowiedź wychodzi ręcznie ze skrzynki, poza jakimkolwiek śladem |
| **Nierozstrzygnięta retencja** | Zgłoszenia leżą bezterminowo wbrew wymogowi konkretnego okresu (zadanie #31) |

---

## 6. Weryfikacja przed pierwszym prawdziwym użyciem ⚠️

Kontrola z 2026-08-10 wykazała, że w bazie istnieją kolekcje `artifacts`, `guides`, `users` —
**kolekcji `contact_messages` NIE MA**. Firestore nie tworzy pustych kolekcji, więc znaczy to
jedno z dwojga:

- **(a)** od naprawy formularza (2026-07-16) nikt nie napisał — możliwe, produkt jest przed launchem;
- **(b)** zapis cicho nie działa na produkcji, a formularz mimo to pokazuje „Wiadomość została wysłana!".

Wariant (b) to dokładnie ten sam błąd, który już raz wystąpił (Known-Issues #6: formularz
pokazywał sukces, treść przepadała) — i tym razem byłby jeszcze trudniejszy do zauważenia.

**Rozstrzygnięcie:** wyślij testową wiadomość przez formularz na `wynajempro.com/kontakt`,
a potem sprawdź, czy kolekcja się pojawiła. Jeśli nie — podejrzany numer jeden to
**egzekwowanie App Check** (zapis idzie z sesji anonimowej, nieatestowanej), co wiąże się
bezpośrednio z zadaniem 1 w [[Projects/Instrukcje-wlasciciela]].

**Related:** [[Projects/Instrukcje-wlasciciela]] · [[Known-Issues]] · [[Projects/Backlog]] · [[Projects/Roadmap]]
