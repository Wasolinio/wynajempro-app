---
name: project-overview
description: WynajemPRO - aplikacja do zarządzania wynajmem, architektura, cele, etapy
metadata:
  type: project
---

# WynajemPRO - Przegląd projektu

## Co to jest?
Aplikacja webowa do zarządzania wynajmem nieruchomości. Pozwala właścicielom na:
- Zarządzanie właściwościami
- Generowanie kodów dostępu (PIN, WiFi)
- Eksport kalendarza (iCal)
- Integracja ze Stripe (płatności)
- Udostępnianie przewodników dla gości

## Użytkownicy
1. **Właściciele** - zarządzają właściwościami, widzą wszystko
2. **Goście** - otrzymują publiczny link do przewodnika (`/guide/:guideId`)
3. **Anonimowi** - mogą podpisać regulamin, aby odblokować PIN/WiFi

## Główne modułów
- **Auth** - logowanie Google, weryfikacja email
- **Property Management** - CRUD operacje na nieruchomościach
- **Guest Guides** - publiczne przewodniki z kodami dostępu
- **Calendar Export** - iCal integration z tokenami
- **Payments** - Stripe dla rezerwacji/depozytów
- **Storage** - Firebase Storage dla guidów

## Tech Stack
- **Frontend**: React + Vite (SPA)
- **Backend**: Firebase (Auth, Firestore, Storage, Cloud Functions)
- **Testing**: Playwright E2E
- **Deployment**: Firebase Hosting

## Etapy realizacji
1. ✅ **Test Setup** - Emulator, Playwright konfiguracja
2. 📝 **Content Audit** - Korekta polszczyzny, typy
3. 🐛 **Bug Fixes** - iCal token, storage leak
4. 🧪 **E2E Tests** - Pełna suite testów
5. 🔍 **Audyt** - Bezpieczeństwo, performance

## Why to zrobiliśmy
- Profesjonalny system do zarządzania wynajmami
- Bezpieczny dostęp dla gości bez żadnych danych
- Automatyzacja komunikacji (kalendarze, kody dostępu)
