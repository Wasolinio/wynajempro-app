# 🔌 API Reference

Cloud Functions and external API endpoints for WynajemPRO.

---

## Cloud Functions

All functions run on Firebase Cloud Functions (Node.js 18+).

### exportIcal

**Purpose**: Export property availability as iCal file for calendar apps.

**Type**: HTTP Trigger  
**Method**: POST  
**Endpoint**: `https://us-central1-wynajempro-app.cloudfunctions.net/exportIcal`

#### Parameters

```javascript
{
  "u": "firebase-uid",          // User ID
  "p": "property-id",            // Property ID
  "token": "secret-token"        // Secret token from property doc
}
```

#### Request Example

```bash
curl -X POST https://us-central1-wynajempro-app.cloudfunctions.net/exportIcal \
  -H "Content-Type: application/json" \
  -d '{
    "u": "user123",
    "p": "prop_001",
    "token": "token_abc123xyz789"
  }'
```

#### Response

**Success (200)**:
```
Content-Type: text/calendar
Content-Disposition: attachment; filename="property.ics"

BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//WynajemPRO//Calendar//EN
...
END:VCALENDAR
```

**Error (403)**:
```json
{
  "error": "Forbidden",
  "message": "Invalid token"
}
```

**Error (404)**:
```json
{
  "error": "Not Found",
  "message": "Property not found"
}
```

#### How It Works

1. Validate token against property.secretToken in Firestore
2. Fetch property availability from Firestore
3. Generate iCal format
4. Return as .ics file

#### Frontend Usage

```javascript
// Generate link for calendar
const icalUrl = `https://us-central1-wynajempro-app.cloudfunctions.net/exportIcal?u=${uid}&p=${propId}&token=${secretToken}`;

// Open in calendar app
window.location.href = icalUrl;
```

#### Note

The `secretToken` is generated securely in the frontend (`ManagerApp.jsx`) and verified here.

---

### deleteUserAccount

**Purpose**: Delete user account and all associated data.

**Type**: HTTPS Trigger (callable)  
**Method**: POST  
**Endpoint**: `https://us-central1-wynajempro-app.cloudfunctions.net/deleteUserAccount`

#### Request

```javascript
await firebase.functions().httpsCallable('deleteUserAccount')({
  uid: currentUser.uid
});
```

#### Response

```javascript
{
  "success": true,
  "message": "Account deleted successfully",
  "deletedItems": {
    "properties": 3,
    "guides": 5,
    "bookings": 12,
    "storage_files": 45
  }
}
```

#### What Gets Deleted

- ✅ User document from Firestore
- ✅ All properties owned by user
- ✅ All guides created by user
- ✅ All bookings for user's properties
- ✅ Storage files belonging to guides
- ✅ User authentication account

#### Authentication

Must be called by authenticated user deleting their own account.

```javascript
// Client-side
const user = firebase.auth().currentUser;
if (user) {
  const deleteAccount = firebase.functions().httpsCallable('deleteUserAccount');
  await deleteAccount({ uid: user.uid });
}
```



---

### sendVerificationEmail

**Purpose**: Send email verification link to user.

**Type**: HTTPS Trigger (on-demand or auth trigger)

#### When Called

- User signs up with email
- User requests to resend verification
- User changes email

#### Email Template

```
Subject: Verify your WynajemPRO email

Hi {displayName},

Please verify your email address to complete your registration:
[Verification Link]

This link expires in 24 hours.

Best regards,
WynajemPRO Team
```

---

### stripeWebhook

**Purpose**: Handle Stripe payment events.

**Type**: HTTP Trigger  
**Method**: POST  
**Endpoint**: `https://us-central1-wynajempro-app.cloudfunctions.net/stripeWebhook`

#### Events Handled

- `charge.succeeded` - Payment completed
- `charge.failed` - Payment failed
- `charge.refunded` - Refund issued
- `customer.subscription.updated` - Subscription changed

#### Processing

```
Stripe Event → Webhook → Verify signature → Update Firestore → Send email
```

#### Implementation

```javascript
// In Cloud Function
const signature = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  req.rawBody,
  signature,
  webhookSecret
);

switch (event.type) {
  case 'charge.succeeded':
    // Update booking payment status
    break;
  case 'charge.failed':
    // Notify user
    break;
}
```

---

## Firebase SDK Methods

Common methods used in frontend code.

### Authentication

```javascript
// Sign in with Google
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const auth = getAuth();
const provider = new GoogleAuthProvider();
const result = await signInWithPopup(auth, provider);
```

### Firestore

```javascript
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';

const db = getFirestore();

// Read
const querySnapshot = await getDocs(collection(db, 'properties'));
querySnapshot.forEach(doc => console.log(doc.data()));

// Write
await addDoc(collection(db, 'properties'), {
  name: 'New Property',
  address: '...'
});

// Real-time listener
const q = query(collection(db, 'properties'), where('ownerId', '==', uid));
const unsubscribe = onSnapshot(q, (snapshot) => {
  snapshot.forEach(doc => console.log(doc.data()));
});
```

### Storage

```javascript
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getBytes,
  deleteObject 
} from 'firebase/storage';

const storage = getStorage();

// Upload
const fileRef = ref(storage, `properties/${propId}/photo.jpg`);
await uploadBytes(fileRef, file);

// Download
const bytes = await getBytes(fileRef);

// Delete
await deleteObject(fileRef);
```

---

## Stripe API

For payment processing (backend).

### Create Payment

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const paymentIntent = await stripe.paymentIntents.create({
  amount: 54000, // 540 PLN in cents
  currency: 'pln',
  description: 'Booking for property_001',
  metadata: {
    bookingId: 'booking_001',
    propertyId: 'prop_001'
  }
});
```

### Webhook Signature Verification

```javascript
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  req.rawBody,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

---

## Rate Limiting

### Cloud Functions

Default: 5,000 requests per minute per region

### Firestore

Depends on pricing plan:
- Spark: 25k reads, 25k writes, 1k deletes/day
- Blaze: Pay per operation

---

## Error Handling

### Standard Error Response

```javascript
{
  "error": "ErrorType",
  "message": "Descriptive error message",
  "code": "ERROR_CODE",
  "timestamp": "2026-06-29T10:30:00Z"
}
```

### Common Errors

| Code | Message | Solution |
|------|---------|----------|
| 401 | Unauthorized | User not authenticated |
| 403 | Forbidden | User lacks permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Data already exists |
| 500 | Server Error | Function failure |

---

## Authentication Headers

### Firebase ID Token

```javascript
const user = firebase.auth().currentUser;
const token = await user.getIdToken();

// Use in API calls
fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## Testing APIs

### Local Testing

```bash
# Start emulator
firebase emulators:start

# Functions run on http://localhost:5001
# Firestore on http://localhost:8080
# Auth on http://localhost:9099
```

### Test Cloud Function Locally

```bash
# Deploy to emulator
firebase emulators:start

# Call function
curl -X POST http://localhost:5001/wynajempro-app/us-central1/exportIcal \
  -H "Content-Type: application/json" \
  -d '{...}'
```

---

## Deployment

### Deploy Functions

```bash
firebase deploy --only functions
```

### Deploy Rules

```bash
firebase deploy --only firestore:rules,storage
```

### Deploy Everything

```bash
firebase deploy
```

---

**Related**: [[Development]], [[Known-Issues]], [[Schema]]
