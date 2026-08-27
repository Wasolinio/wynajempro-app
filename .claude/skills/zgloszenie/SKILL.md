---
name: zgloszenie
description: Obsługa zgłoszenia od użytkownika WynajemPRO i diagnostyka konta po UID lub e-mailu. Używaj przy każdym zgłoszeniu z formularza /kontakt oraz gdy właściciel podaje identyfikator konta z prośbą o ustalenie, co się dzieje. Wymusza odsiew zgłoszeń testowych przed diagnostyką i stopniowany dostęp do danych.
user-invocable: true
argument-hint: "[UID, e-mail albo treść zgłoszenia]"
---

# Obsługa zgłoszenia

Pełny proces: [[support/Proces-obslugi-zgloszen]]. Ten skill jest jego operacyjnym skrótem.

## Krok 0 — dwa filtry, zanim cokolwiek zdiagnozujesz

**Filtr 1: pole `source`.** To **pierwszy** odczyt, nie ostatni.

| `source` | Co robisz |
|---|---|
| `kontakt` | obsługujesz normalnie |
| `kontakt-test` | **nie diagnozujesz** — potwierdzasz właścicielowi, że wiadomość dotarła, i kończysz |

**Filtr 2: brak śladu w danych nie jest dowodem awarii.** Jeśli zgłoszenie opisuje awarię,
po której w bazie nie ma żadnego śladu (brak dokumentu, brak nieudanego zapisu), **zapytaj
o potwierdzenie, zanim uruchomisz pełną diagnostykę**. Brak dokumentu równie dobrze znaczy,
że nikt nie próbował.

Oba filtry istnieją z powodu 2026-08-10: zgłoszenie testowe z wymyśloną treścią uruchomiło
pełną diagnostykę awarii, której nie było ([[Known-Issues]] #12).

## Odczyt zgłoszeń

Firebase MCP, pięć narzędzi wyłącznie do odczytu (`.mcp.json`). Poświadczenia to zalogowany
Firebase CLI, bez żadnego klucza serwisowego.

`firestore_query_collection`:
- `collection_path`: `contact_messages` — **bez ukośnika na końcu**. Ukośnik daje twardy
  błąd „Collection id is invalid because it contains /".
- `filters`: `[]` (wymagane, choć puste)
- `order`: `createdAt` malejąco, `limit` np. 20

`firestore_list_collections` wymaga pełnej ścieżki w `parent`:
`projects/moje-domki-6c77d/databases/(default)/documents`. Wywołanie z pustym obiektem
zwraca mylące „Invalid resource field value" — to błąd kształtu żądania, **nie** brak
uprawnień. Nie diagnozuj tego jako problemu z dostępem.

## Diagnostyka po UID — stopniowana

Każdy poziom sięga po dane wrażliwsze. Wchodzisz na kolejny **tylko wtedy, gdy poprzedni
nie wyjaśnił sprawy**. To realizacja zasady minimalizacji, nie formalność: dane Gospodarza
i dane Gości mają różny reżim prawny (Operator jest administratorem tych pierwszych
i procesorem tych drugich).

### Poziom 1 — konto i subskrypcja (zawsze zaczynaj tutaj)

`auth_get_users` (UID lub e-mail) oraz `firestore_get_document` → `users/{uid}`.
Rozstrzyga większość zgłoszeń:

| Objaw | Gdzie patrzeć |
|---|---|
| „nie mogę wejść do panelu" | `emailVerified: false` albo wygasły trial |
| „zapłaciłem, a widzę paywall" | rozjazd `status` (pisze webhook) z `accountStatus` (dane historyczne) |
| „trial skończył się za wcześnie" | `trialEndsAt` jako **string zamiast Timestampa** — reguły są fail-closed |
| „usunąłem konto, a ono jest" | `scheduledDeletionAt`, karencja 30 dni |
| „nie mogę usunąć konta" | logowanie Google wymaga popupu; zablokowany popup daje generyczny komunikat |

### Poziom 2 — konfiguracja konta

`firestore_list_documents` na `users/{uid}/settings`, potem konkretny dokument.
Identyfikatory: `properties`, `syncLinks`, `sources`, `categories`, `tax`, `recurringCosts`,
`reminders`, `hostProfile`, `publicContact`.

| Objaw | Gdzie patrzeć |
|---|---|
| „synchronizacja nie działa" | `syncLinks` — **kluczami są nazwy obiektów**, portale siedzą w wartościach (`{ booking, airbnb }`). Pomylenie tego było źródłem błędu #11 |
| „podatki liczą się źle" | `tax` + `sources` — źródło „Facebook" celowo zeruje podatek, VAT i prowizję |
| „goście widzą mój prywatny e-mail" | `publicContact` i `showPublicContact`; stare konta trzymają adres logowania do następnego zapisu profilu |
| „zysk netto różni się między zakładkami" | to nie awaria konta, tylko znany dług: „Przegląd" nie wlicza kosztów stałych |

⚠️ **`hostProfile` czytaj wyłącznie przy zgłoszeniach o profil lub faktury** — pole
`taxIdentifier` może zawierać PESEL (ustalenie audytu N5).

### Poziom 3 — ⛔ ZNIESIONY z dniem publikacji dokumentów (2026-08-26)

**Danych Gości nie czytasz w ogóle** — `users/{uid}/rentals/`, `guides/`,
`guides/{id}/signatures/` i `secrets/data` są poza kanałem, niezależnie od treści zgłoszenia.
To wykonana bramka F4a: Anthropic jest wykreślony z opublikowanego DPA §7, więc kanał modelu
nie może dotykać danych powierzonych. Gdy diagnostyka wymaga zajrzenia w rezerwacje albo
przewodnik: zakończ na poziomie 2 i podaj właścicielowi dokładną ścieżkę dokumentu do
samodzielnego otwarcia w konsoli Firebase, z opisem, czego w nim szukać.

## Czego nie robisz

Kanał jest **wyłącznie do odczytu**. Nie naprawiasz konta w bazie. Możesz ustalić przyczynę,
wskazać pole i wartość, przygotować treść odpowiedzi i zaproponować poprawkę w kodzie.
Zmiana danych na produkcji zostaje operacją właściciela albo osobnym skryptem po przeglądzie.
Diagnostyka supportu to najgorszy moment na przypadkowy zapis do bazy produkcyjnej.

## Ścieżka obsługi

1. Odczytaj zgłoszenie (data, `source`, treść).
2. **Sprawdź, czy odpowiedź już istnieje** w `docs/support/`. Jeśli tak — odeślij link
   do `/pomoc/<slug>`. Centrum pomocy powstało po to, żeby nie odpisywać w kółko to samo.
3. Zakwalifikuj: *pytanie* → odpowiedź plus ewentualne FAQ · *błąd* → weryfikacja w kodzie,
   nigdy „na słowo", wpis do [[Known-Issues]] · *żądanie RODO* → ścieżka z Polityki §6,
   **termin miesiąca** · *pomysł* → [[Projects/Backlog]] z jednym zdaniem „po co".
4. Przygotuj treść odpowiedzi. Wysyła właściciel z `kontakt@wynajempro.pl` — aplikacja
   nie ma kanału wysyłki.
5. Odnotuj w dzienniku przy zmianach, które ze zgłoszenia wynikły (skill `dziennik`).
6. Jeśli zgłoszenie zmieniło UI: odśwież artykuły i uruchom `npm run help:build`.
   Artykuły cytują etykiety 1:1, więc starzeją się z każdym deployem.
