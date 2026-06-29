# ✨ Features

## 🔐 Authentication

**Type**: Google OAuth2 + Email Verification

```
1. User clicks "Sign in with Google"
2. Firebase Auth handles OAuth flow
3. User account created in Firestore
4. Email verification sent (if needed)
5. Redirect to Manager Dashboard
```

**Related Code**:
- Auth pages in `src/pages/`
- Firebase Auth config in `src/firebase.js`

---

## 🏠 Property Management

**Owner can**:
- ✅ Create new properties (address, name, photos)
- ✅ Edit property details
- ✅ Generate access codes (PIN, WiFi password)
- ✅ Set up guest guides
- ✅ Export calendar (iCal)
- ✅ Delete property

**Data stored**:
- Property metadata (Firestore)
- Guest guides (Storage)
- Access codes (encrypted)
- Secret token for iCal

**UX Flow**:
```
Dashboard → Select Property → View/Edit → Save → Sync to Firestore
```

---

## 👥 Guest Guides (Public)

**Access**: `/guide/{guideId}`

**Guest can**:
1. View property info (name, address, check-in time)
2. Read guest guide (WiFi, entry codes)
3. **Requires**: Digital signature (terms acceptance)
4. After signature: codes appear (PIN, WiFi, parking)

**Why signature**: Legal protection for code sharing

**Technical**:
- Public Firestore read access (no auth needed)
- Signature stored as proof
- Real-time updates if owner changes codes

---

## 📅 iCal Export

**Purpose**: Add property availability to guest calendars

**Endpoint**: `POST /exportIcal`

**Parameters**:
```
u: user UID
p: property ID
token: secretToken (from property doc)
```

**Response**: Standard `.ics` calendar file

**Security**: Token-based auth (not user auth)

**Known Issue**: ⚠️ secretToken not generated on property create

---

## 💳 Stripe Integration

**Use Cases**:
- Booking deposits
- Cleaning fees
- Damage insurance
- Cancellation fees

**Flow**:
```
Guest enters amount → Stripe checkout → Confirm payment → Receipt
```

**Implementation**: Stripe SDK + Cloud Functions for payment processing

**Status**: ⚠️ Check current payment flow

---

## 🗑️ Account Deletion

**Owner can**:
1. Delete entire account
2. All properties + guides removed
3. Firebase Storage cleaned up
4. User record deleted

**Cloud Function**: `deleteUserAccount`

**Known Issue**: ⚠️ Storage cleanup might not work (guides/ not fully purged)

---

## 🎨 UI Features

- Responsive design (mobile-first)
- Dark mode? (check implementation)
- Animations (see [[Design-Notes]])
- Accessibility (WCAG?)

---

**Related**: [[Architecture]], [[Known-Issues]], [[Development]]
