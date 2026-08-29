# 📊 Database Schema

Complete Firestore data structure for WynajemPRO.

> **CRITICAL ARCHITECTURE RULE**: The database uses a **Subcollection-first model**. Almost everything belongs to a specific user under `users/{uid}`. There are **NO** top-level `properties` or `bookings` collections.

## Collections Overview

```
firestore-database/
├── users/
│   └── {uid}
│       ├── settings/
│       │   ├── properties         ← The property list (array)
│       │   ├── tax                ← Tax settings
│       │   └── hostProfile        ← Host information
│       ├── rentals/
│       │   └── {entryId}          ← All calendar entries (bookings, utilities, reminders)
│       └── tasks/
│           └── {taskId}           ← Zadania gospodarza (moduł Zadania, E3)
├── guides/
│   └── {guideId}                  ← Publicly readable guest guides
│       ├── secrets/data           ← Hidden codes
│       └── signatures/{guestUid}  ← Signatures unlocking the secrets
└── newsletter_subscribers/
    └── {id}
```

---

## users Collection

Stores user profiles, their settings (including properties), and their calendar entries (rentals).

### Document: `users/{uid}`

```javascript
{
  // Profile & Status
  status: "trialing", // trialing, active, past_due, canceled
  trialEndsAt: Timestamp(2026-06-30),
  scheduledDeletionAt: null, // Set if account is scheduled for cleanup
  
  // Stripe Data (Set by Cloud Functions, Read-Only for Client)
  stripeCustomerId: "cus_abc123",
  stripeSubscriptionId: "sub_xyz789",
  
  // Notice: Basic profile like displayName and email lives in Firebase Auth, not here.
}
```

### Subcollection: `users/{uid}/settings`

Contains various configuration documents.

#### Document: `users/{uid}/settings/properties`
Stores the list of properties for the user as an array.

```javascript
{
  items: [
    {
      id: "prop_001",             // generated id
      name: "Apartament Centrum", // display name (also used to link rentals via `property`)
      color: "blue",              // calendar color key (see availableColors)
      secretToken: "uuid-no-dashes" // iCal export auth; generated via crypto.randomUUID() in ManagerApp.jsx
    }
  ]
}
// NOTE: that's the whole object. There is no address / capacity / codes / description
// on a property. Guest-facing codes (PIN, WiFi) live in guides/{guideId}/secrets/data.
```

#### Document: `users/{uid}/settings/hostProfile`
Contains the host's public information. This specific document has public read access via security rules so guest guides can display it.

```javascript
{
  name: "Jan Kowalski",
  phone: "+48 123 456 789",
  email: "jan@example.com"
}
```

#### Other Settings Documents
- `tax`: Contains `taxSettings` object
- `reminders`: Contains `{ items: [...] }`
- `sources`: Contains `{ items: [...] }`
- `categories`: Contains `{ items: [...] }`
- `syncLinks`: Contains `{ links: [...] }` (external iCal URLs for import)

### Subcollection: `users/{uid}/rentals`

Contains all calendar entries: bookings, utility costs, and reminders.

#### Document: `users/{uid}/rentals/{entryId}`

```javascript
{
  id: "timestamp_or_uuid",
  
  // Entry Type
  type: "booking", // booking, utility, reminder
  
  // Dates
  date: "2026-07-15", // YYYY-MM-DD
  endDate: "2026-07-18", // YYYY-MM-DD (if applicable)
  
  // Booking specific fields (if type == 'booking')
  property: "Apartament Centrum", // Name of the property
  price: 450,
  source: "Airbnb",
  guestName: "Maria Nowak",
  guestPhone: "+48 123 456 789",
  isPaid: true,
  
  // Financial specifics
  currency: "PLN"
}
```

---

### Subcollection: `users/{uid}/tasks` (moduł Zadania, E3)

Zadania gospodarza — osobna kolekcja, bo zadanie bez daty (skrzynka „do przypisania")
nie przeszłoby przez roczny filtr `where('date', ...)` subskrypcji `rentals`.
Model wg `_design-reference/design_handoff_zadania/IMPLEMENTACJA.md` §1.
Id nadaje `addDoc` (NIE `Date.now()`). Reguły: blok `tasks` w `firestore.rules`
(`isValidTask`, limity `subtasks` ≤ 50 i `photos` ≤ 10). Czyszczone przy usuwaniu
konta w `cleanupUserData` (`functions/index.js`).

Zadania z szablonów NIE są tu zapisywane — liczy je w locie `useTasksBoard`
(syntetyczne id `tpl:{rentalId}:{templateId}`, wykonanie w `rentals.completedTasks`).
Wyjątek (partia 2): para przeciągnięta na inny termin jest MATERIALIZOWANA —
dokument z `templateId` + `rentalId` pobytu-matki i przesuniętym `date`; taka para
jest odtąd pomijana w wyliczaniu (klucz `rentalId|templateId`).
Wpisy `rentals` z `type: 'reminder'` czytane zgodnościowo do przebiegu migracji
(`functions/migrate-reminders-to-tasks.cjs`, dry-run domyślnie, --fix przenosi).

#### Document: `users/{uid}/tasks/{taskId}`

```javascript
{
  text: "Dowieźć ręczniki",
  propertyName: "Domek nad jeziorem", // nazwa obiektu (nie id) | null
  rentalId: "1755900000000",          // link do users/{uid}/rentals/{id} | null
  templateId: null,                   // tylko dla zadań zmaterializowanych z szablonu
  date: "2026-08-25",                 // 'YYYY-MM-DD' lokalnie | null = skrzynka
  time: "11:00",                      // '' gdy brak
  priority: "wysoki",                 // 'wysoki' | 'normalny' | 'niski'
  note: "",
  subtasks: [{ text: "Pościel i ręczniki", done: true }], // max 50
  recurrence: null,                   // null | { kind: 'weekly'|'monthly'|'afterCheckout', label }
                                      // odhaczenie tworzy następne wystąpienie (utils/taskRecurrence)
  photos: [],                         // max 10; [{ path, url }] — Storage users/{uid}/tasks/{taskId}/
  done: false,
  doneAt: null,                       // Timestamp | null
  createdAt: Timestamp,
  updatedAt: Timestamp,
}
```

---

## guides Collection

Public guest guides.

### Document: `guides/{guideId}`

**Read Access**: Public (no auth required)

```javascript
{
  id: "guide_001",
  ownerId: "firebase-uid", // Links back to the creator
  propertyId: "prop_001",
  
  title: "Przewodnik - Apartament Centrum",
  content: "Witaj w apartamencie...",
  
  // Gated features
  requiresSignature: true,
  
  createdAt: Timestamp(2026-01-15)
}
```

### Subcollection: `guides/{guideId}/secrets`

Contains hidden data unlocked only after signing.

#### Document: `guides/{guideId}/secrets/data`
```javascript
{
  wifiPassword: "SecurePass123",
  entryPin: "1234"
}
```

### Subcollection: `guides/{guideId}/signatures`

Contains proof of signature allowing access to secrets.

#### Document: `guides/{guideId}/signatures/{guestUid}`
```javascript
{
  signedAt: Timestamp(2026-06-28),
  guestUid: "anonymous-auth-uid"
}
```

---

## Storage Structure

```
gs://wynajempro-app.appspot.com/
├── guides/
│   └── {guideId}/
│       ├── cover.jpg
│       └── attachments/
│           └── House_Rules.pdf
└── users/
    └── {uid}/
        └── tasks/
            └── {taskId}/
                └── {uuid}.jpg     ← zdjęcia zadań (E3 partia 2; PRYWATNE — tylko właściciel,
                                      < 10 MB, image/*; nazwa pliku = UUID, nie nazwa z dysku)
```
*Note: These are deleted when the `deleteUserAccount` Cloud Function runs
(guides per przewodnik, `users/{uid}/tasks/` prefiksem w `cleanupUserData`).*

---

## Security Rules Summary

- **`users/{userId}`**: Read/update by verified owner.
- **`users/{userId}/rentals/{docId}`**: Owner + verified + **active subscription**.
- **`users/{userId}/settings/{docId}`**: Owner + verified + **active subscription**. Exception: `hostProfile` can be read publicly.
- **`guides/{guideId}`**: **Public read**. Create/Update/Delete requires verified owner + active subscription + `ownerId` match.
- **`guides/{guideId}/secrets/data`**: Public read ONLY if there is a corresponding signature document in `signatures/{guestUid}`.

See: `firestore.rules` and `storage.rules`

---

**Related**: [[Architecture]], [[Features]], [[Agent-Process-Map]]
