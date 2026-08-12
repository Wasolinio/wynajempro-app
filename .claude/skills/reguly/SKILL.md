---
name: reguly
description: Zmiana firestore.rules lub storage.rules w WynajemPRO. Używaj przy każdej modyfikacji reguł bezpieczeństwa — walidacji schematu, bramkach subskrypcji, uprawnieniach do kolekcji. Opisuje, jak zastąpić emulator lustrzanym testerem w functions/*.cjs, bo w tym środowisku nie ma Javy, oraz jakie pułapki mają reguły tego projektu.
user-invocable: true
argument-hint: "[co zmieniasz w regułach]"
---

# Zmiana reguł bezpieczeństwa

## Dlaczego to ma własną procedurę

W tym środowisku **nie ma Javy, więc nie ma emulatora Firestore**, a więc nie ma testów
reguł. Reguły są jednocześnie ostatnią linią obrony: błąd otwiera dane albo kładzie zapisy
wszystkim użytkownikom naraz. Zastępnikiem emulatora jest **lustrzany tester** uruchamiany
na danych produkcyjnych. Ten manewr powtórzył się już cztery razy
(`audit-users-n2.cjs`, `validate-schema-n3.cjs`, `audit-guides-n5.cjs`,
`cleanup-orphan-guide-files-n6.cjs`) i poniżej jest jego spisana postać.

## Krok 1 — ustal wszystkie źródła prawdy dla pola

Zanim napiszesz allowlistę, sprawdź, **skąd biorą się dane**. Dokumenty w `rentals`
powstają z trzech różnych ścieżek: formularza w panelu, synchronizacji iCal i aktualizacji
zadań. Pominięcie jednej z nich odcina zapisy w produkcji.

Przeczytaj równolegle: widok, który pisze, `useFirebaseData.js` i istniejącą regułę.
Nie zgaduj kształtu z jednego miejsca.

## Krok 2 — napisz lustrzany tester

Wzorzec: `functions/validate-schema-n3.cjs`. Zasady:

- **Te same predykaty w JS**, co w regułach (`isStr`, `optNum`, `hasOnly`…), jeden do
  jednego. Rozbieżność jest dopuszczalna **wyłącznie w stronę ostrzejszą** — tester może
  odrzucić coś, co reguła przepuści, nigdy odwrotnie.
- **Tylko odczyt.** Tester niczego nie zapisuje.
- Przepuszcza **wszystkie** istniejące dokumenty produkcji, nie próbkę.
- Zwraca **powód** odrzucenia (nazwa pola i wartość), nie samo `false`. Bez tego wynik
  jest bezużyteczny.
- Uruchomienie wymaga świeżego klucza serwisowego od właściciela:

```bash
cd functions && GOOGLE_APPLICATION_CREDENTIALS=/ścieżka/klucz.json node validate-schema-n3.cjs
```

Sens testera: `update` waliduje dokument **po merge'u**, więc dowodzi, że istniejące dane
przejdą po deployu. To jest kryterium „gotowe, gdy" z roadmapy dla zmian walidacyjnych.

## Krok 3 — sprawdź, co naprawdę leży na produkcji

Reguły w konsoli mogą się rozjechać z repo. Poproś właściciela o wklejenie treści
z konsoli i porównaj:

```bash
diff -wB <(git show HEAD:firestore.rules) /ścieżka/z-konsoli.rules
```

Robiono to 2026-07-07 i wynik był identyczny, ale to sprawdzenie, nie założenie.

## Krok 4 — przegląd `code-reviewer`

Obowiązkowy przed commitem. Przy N2 dwie rundy przeglądu wykryły dwa bugi frontu i lukę
w `storage.rules`, których autor zmiany nie widział. Reviewer czyta i raportuje, nie poprawia.

## Krok 5 — bramka deployu

Deploy reguł to decyzja właściciela. Kolejność:

1. audyt danych testerem (krok 2),
2. diff konsola vs repo (krok 3),
3. `firebase deploy --only firestore:rules,storage`,
4. ⚠️ **prompt CLI o uprawnienia cross-service — POTWIERDZIĆ.** Agent Storage musi dostać
   odczyt Firestore. Odmowa kładzie wszystkie uploady przewodników.

CLI waliduje składnię przed publikacją, więc kompilacja jest darmowym sprawdzeniem —
ale nie sprawdza logiki.

## Krok 6 — smoke test po deployu

Zawsze **para**: jedna operacja, która ma przejść, i jedna, która ma zostać odrzucona.
Sam sukces nie dowodzi niczego, bo reguła „allow all" też przepuszcza.

Przykład z N2: upload okładki na koncie trialowym przechodzi **oraz** zapis na koncie
z wygasłym trialem zostaje odrzucony.

Potem wpis do dziennika (skill `dziennik`) i status w [[Projects/Roadmap]].

## Pułapki tych reguł

- **`permission-denied` to często App Check, nie reguły.** Nieatestowany klient
  z localhosta dostaje odmowę, produkcyjna domena przechodzi atestację reCAPTCHA.
  Zagadka z X13 miała właśnie tę przyczynę. Nie diagnozuj tego jako rozjazdu reguł.
- **Fail-closed przy `trialing`.** Trial liczy się tylko z żywym `trialEndsAt` typu
  `Timestamp`. Zapisany jako string nie przedłuża niczego.
- **Dwa pola statusu.** `status` pisze webhook Stripe, `accountStatus` to dane historyczne.
  Reguła musi uwzględniać oba, front też.
- **Sentinele SDK lecą przed regułami.** `deleteField()` w `setDoc` na create rzuca po
  stronie klienta, zanim reguła cokolwiek zobaczy. Objaw wygląda jak odmowa uprawnień,
  a jest błędem kształtu żądania (naprawione w `ManagerApp.handleAddRental`).
- **`hasOnly` zamyka listę pól.** Dodanie nowego pola w kodzie bez zmiany reguły daje
  odrzucenie zapisu. Odwrotnie też: nowe pole = zmiana reguł = osobny deploy, więc
  rozważ, czy zmieści się w istniejącej allowliście (tak zrobiono ze znacznikiem `source`).
- **Identyfikatory w publicznych URL-ach** generuj przez `crypto.randomUUID()`, nie
  `Date.now()` — id przewodnika żyje w adresie i w ścieżce Storage, więc enumerowalne
  id jest luką.
