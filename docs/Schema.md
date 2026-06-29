# 📊 Database Schema

Complete Firestore data structure for WynajemPRO.

## Collections Overview

```
firestore-database/
├── users/
│   └── {uid}
├── properties/
│   └── {propId}
├── guides/
│   └── {guideId}
├── bookings/
│   └── {bookingId}
└── analytics/
    └── {analyticsId}
```

---

## users Collection

Stores user profiles and preferences.

### Document: `users/{uid}`

```javascript
{
  // Authentication
  uid: "firebase-uid",
  email: "owner@example.com",
  displayName: "Jan Kowalski",
  photoURL: "https://...",
  emailVerified: true,

  // Metadata
  createdAt: Timestamp(2026-01-15),
  updatedAt: Timestamp(2026-06-29),
  lastLogin: Timestamp(2026-06-29T10:30:00),

  // Preferences
  language: "pl",
  timezone: "Europe/Warsaw",
  notificationsEnabled: true,

  // Account Status
  accountDeleted: false,
  subscriptionPlan: "free", // free, pro, premium
  subscriptionExpiresAt: null,

  // Metadata
  authProvider: "google",
  deviceCount: 2,
  totalProperties: 3,
}
```

### Subcollection: `users/{uid}/properties`

Array or subcollection of property references.

```javascript
[
  {
    propId: "prop_001",
    name: "Apartament Centrum",
    address: "ul. Główna 1, 00-001 Warszawa",
  }
]
```

---

## properties Collection

Stores rental property information.

### Document: `properties/{propId}`

```javascript
{
  // Basic Info
  id: "prop_001",
  ownerId: "firebase-uid",
  name: "Apartament Centrum",
  description: "Nowoczesny apartament w centrum miasta",

  // Location
  address: "ul. Główna 1, 00-001 Warszawa",
  city: "Warszawa",
  zipCode: "00-001",
  country: "Poland",
  coordinates: {
    latitude: 52.2298,
    longitude: 21.0122,
  },

  // Capacity & Details
  bedrooms: 2,
  bathrooms: 1,
  maxGuests: 4,
  squareMeters: 65,

  // Access Codes
  codes: {
    entryPin: "1234",
    wifiPassword: "SecurePass123",
    gateCode: "9876",
    parkingSpot: "A-12",
  },

  // iCal Export (CRITICAL - BUG: not always generated)
  secretToken: "token_abc123xyz789", // ⚠️ MUST BE GENERATED ON CREATE
  icalUrl: "https://app.com/exportIcal?u={uid}&p={propId}&token={token}",

  // Photos & Media
  photos: [
    {
      url: "gs://bucket/prop_001/photo_1.jpg",
      caption: "Living room",
      order: 1,
    },
    // ...
  ],

  // Availability Calendar
  availableFrom: Timestamp(2026-07-01),
  availableTo: Timestamp(2026-12-31),
  blockedDates: [
    Timestamp(2026-09-01),
    Timestamp(2026-09-02),
  ],

  // Pricing
  pricePerNight: 150,
  currency: "PLN",
  minimumStay: 2,
  cleaningFee: 50,

  // Settings
  requiresSignature: true,
  autoAcceptBookings: false,
  allowPets: true,
  allowSmoking: false,

  // Metadata
  createdAt: Timestamp(2026-01-15),
  updatedAt: Timestamp(2026-06-29),
  guidesCount: 2,
  bookingsCount: 12,

  // Guides Array (or subcollection)
  guides: ["guide_001", "guide_002"],
}
```

### Subcollection: `properties/{propId}/guides`

Quick access to guides for this property.

```javascript
{
  id: "guide_001",
  title: "Przewodnik po apartamencie",
  status: "published", // draft, published, archived
}
```

---

## guides Collection

Public guest guides with instructions and codes.

### Document: `guides/{guideId}`

```javascript
{
  // Identification
  id: "guide_001",
  propertyId: "prop_001",
  ownerId: "firebase-uid",

  // Content
  title: "Przewodnik - Apartament Centrum",
  description: "Wszystko co musisz wiedzieć o apartamencie",
  language: "pl",

  // Guide Sections
  sections: [
    {
      id: "sec_1",
      title: "Check-in",
      content: "Klucze odbieracie...",
      order: 1,
    },
    {
      id: "sec_2",
      title: "WiFi i sieci",
      content: "SSID: ApartamentCentrum, Hasło: ...",
      order: 2,
    },
    // ...
  ],

  // Access Control
  requiresSignature: true,
  signatureRequired: "Terms & Conditions",
  signedUsers: [
    {
      email: "guest@example.com",
      signedAt: Timestamp(2026-06-28T14:20:00),
      ipAddress: "192.168.1.100",
    }
  ],

  // Files & Media
  attachments: [
    {
      name: "House Rules.pdf",
      url: "gs://bucket/guides/guide_001/rules.pdf",
      type: "pdf",
    }
  ],

  // Publishing
  status: "published", // draft, published, archived
  publishedAt: Timestamp(2026-01-20),
  publicUrl: "https://app.com/guide/guide_001",
  accessToken: "token_public_xyz", // For sharing

  // Analytics
  viewCount: 45,
  lastViewed: Timestamp(2026-06-29T08:15:00),

  // Metadata
  createdAt: Timestamp(2026-01-15),
  updatedAt: Timestamp(2026-06-29),
}
```

---

## bookings Collection

Track guest reservations.

### Document: `bookings/{bookingId}`

```javascript
{
  // Identification
  id: "booking_001",
  propertyId: "prop_001",
  ownerId: "firebase-uid",
  guideId: "guide_001",

  // Guest Info
  guestEmail: "guest@example.com",
  guestName: "Maria Nowak",
  guestPhone: "+48 123 456 789",

  // Dates
  checkInDate: Timestamp(2026-07-15),
  checkOutDate: Timestamp(2026-07-18),
  numberOfNights: 3,
  numberOfGuests: 2,

  // Pricing
  pricePerNight: 150,
  nights: 3,
  subtotal: 450,
  cleaningFee: 50,
  taxPercentage: 8,
  taxAmount: 40,
  totalPrice: 540,
  currency: "PLN",

  // Payment
  paymentStatus: "completed", // pending, completed, failed, refunded
  paymentMethod: "stripe",
  transactionId: "ch_stripe123...",
  paidAt: Timestamp(2026-06-15T18:30:00),

  // Status
  bookingStatus: "confirmed", // pending, confirmed, cancelled, completed
  cancellationType: null, // full_refund, partial_refund, none
  cancellationReason: null,

  // Special Requests
  specialRequests: "High chair needed for baby",
  housekeepingNotes: "Clean thoroughly, guest allergic to dust",

  // Metadata
  createdAt: Timestamp(2026-06-15),
  confirmedAt: Timestamp(2026-06-16),
  completedAt: null,
}
```

---

## analytics Collection (Optional)

Track app usage and metrics.

### Document: `analytics/{analyticsId}`

```javascript
{
  // Identification
  id: "analytics_2026_06",
  month: "2026-06",
  userId: "firebase-uid",

  // Usage Stats
  propertiesCreated: 1,
  propertiesViewed: 24,
  guidesPublished: 2,
  bookingsReceived: 5,
  totalRevenue: 2150,

  // Engagement
  sessionCount: 18,
  totalSessionDuration: 3600, // seconds
  pageViews: 156,
  lastActiveAt: Timestamp(2026-06-29T18:45:00),

  // Performance
  averageSessionDuration: 200, // seconds
  bounceRate: 15, // percent

  // Metadata
  createdAt: Timestamp(2026-06-30),
  updatedAt: Timestamp(2026-06-30),
}
```

---

## Firestore Indexes

Recommended composite indexes for queries:

### Index 1: Properties by Owner
```
Collection: properties
Fields:
  - ownerId (Ascending)
  - createdAt (Descending)
```

### Index 2: Bookings by Property & Date
```
Collection: bookings
Fields:
  - propertyId (Ascending)
  - checkInDate (Ascending)
```

### Index 3: Guides by Owner Status
```
Collection: guides
Fields:
  - ownerId (Ascending)
  - status (Ascending)
  - publishedAt (Descending)
```

---

## Security Rules

### Read Access
- Users can read own documents
- Guides public with signature check
- No cross-user access

### Write Access
- Users can write own documents
- Validate required fields
- Prevent escalation of privileges

See: `firestore.rules` file

---

## Storage Structure

```
gs://wynajempro-app.appspot.com/
├── properties/{propId}/
│   ├── photos/
│   │   ├── photo_1.jpg
│   │   └── photo_2.jpg
│   └── documents/
│       └── rules.pdf
├── guides/{guideId}/
│   ├── guide_content.pdf
│   └── attachments/
│       ├── WiFi_setup.pdf
│       └── House_Rules.pdf
└── users/{uid}/
    ├── avatar.jpg
    └── documents/
```

See: `storage.rules` file

---

## Data Validation Rules

### Properties
- `name`: required, max 200 chars
- `address`: required, max 300 chars
- `pricePerNight`: required, min 0
- `codes.entryPin`: must be 4-6 digits
- `secretToken`: auto-generated (BUG: not always!)

### Guides
- `title`: required, max 200 chars
- `propertyId`: required, must exist
- `status`: enum [draft, published, archived]

### Bookings
- `checkInDate` < `checkOutDate`: required
- `numberOfGuests` ≤ `property.maxGuests`
- `totalPrice` > 0

---

## Versioning Notes

- **Schema Version**: 1.0
- **Last Updated**: 2026-06-29
- **Compatibility**: Firebase Realtime Database not supported (use Firestore)

---

**Related**: [[Architecture]], [[Features]], [[Development]]
