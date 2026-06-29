# 📋 Feature Backlog & Ideas

Prioritized list of features to build and ideas to explore.

---

## Current Sprint

### Bug Fixes (P0 - CRITICAL)

- [ ] **iCal Token Generation** (iCal Export Broken)
  - File: `src/components/modals/AddEditEntryModal.jsx`
  - Issue: `secretToken` not generated on property create
  - Fix: Add token generation + Firestore update
  - Impact: HIGH (export completely broken)
  - Effort: 30 min
  - Test: `e2e/ical_token.spec.js`

- [ ] **Storage Cleanup on Deletion** (Data Leak)
  - File: Cloud Function `deleteUserAccount`
  - Issue: Guide files in Storage not deleted
  - Fix: List + delete files before Firestore cleanup
  - Impact: HIGH (privacy + costs)
  - Effort: 1 hour
  - Test: Integration test with file verification

- [ ] **App Check Monitoring** (Recently Re-enabled)
  - Verify: No false rejections
  - Monitor: Error logs
  - Impact: MEDIUM

---

## Next Sprint (July)

### Features to Build

- [ ] **Email Notifications**
  - Send email when booking confirmed
  - Send email when payment received
  - Send weekly summary to owner
  - Priority: MEDIUM
  - Effort: 4 hours

- [ ] **Guide Photos**
  - Upload images to guide
  - Gallery view for guests
  - Compress before upload
  - Priority: MEDIUM
  - Effort: 3 hours

- [ ] **Guest Comments/Reviews**
  - Allow guests to leave feedback
  - Owner sees reviews
  - Display rating on property
  - Priority: LOW
  - Effort: 5 hours

---

## Backlog (August+)

### Features

- [ ] **Multi-language Support** (i18n)
  - Add English, German translations
  - Language selector in settings
  - Priority: LOW (MVP is Polish)
  - Effort: 8 hours

- [ ] **Dark Mode**
  - Toggle in settings
  - System preference detection
  - CSS variables for theming
  - Priority: LOW
  - Effort: 3 hours

- [ ] **Advanced Availability Calendar**
  - Drag-drop to block dates
  - Bulk actions (block month, open season)
  - Color-coded availability
  - Priority: MEDIUM
  - Effort: 6 hours

- [ ] **Guest Access Logs**
  - Track who saw guide + when
  - IP address logging
  - Audit trail
  - Priority: LOW
  - Effort: 2 hours

- [ ] **Team Management** (Later)
  - Invite co-managers
  - Role-based access (admin, editor, viewer)
  - Activity audit
  - Priority: MEDIUM (post-MVP)
  - Effort: 12 hours

- [ ] **Analytics Dashboard**
  - Property views over time
  - Most popular guides
  - Revenue charts
  - Guest demographics
  - Priority: LOW
  - Effort: 10 hours

- [ ] **Automated Guest Messages**
  - Send guide link automatically
  - Remind about check-in time
  - Post-checkout feedback request
  - Priority: MEDIUM
  - Effort: 8 hours

- [ ] **Integration: iCal Sync**
  - Two-way sync with Google Calendar
  - Automatic booking confirmation
  - Sync availability from host calendar
  - Priority: LOW (one-way export works)
  - Effort: 6 hours

- [ ] **Mobile App**
  - React Native version
  - Receive notifications
  - Manage properties on-the-go
  - Priority: VERY LOW (web first)
  - Effort: 40 hours

---

## Technical Debt

- [ ] **Type Safety**: Add TypeScript
  - Current: JavaScript only
  - Priority: MEDIUM
  - Effort: 12 hours

- [ ] **Component Library**: Extract reusable components
  - Current: Monolithic components
  - Priority: LOW
  - Effort: 8 hours

- [ ] **Storybook**: Document components
  - Priority: LOW
  - Effort: 4 hours

- [ ] **Testing**: Increase E2E coverage
  - Target: 80% → 95%
  - Priority: MEDIUM
  - Effort: 20 hours

---

## Ideas (Brainstorm)

### Revenue Models (Post-MVP)
- Freemium: Basic free, premium paid
- Commission: 5% of bookings
- Monthly subscription: $10-50/month

### Marketplace Features
- Property directory (searchable)
- Messaging between owners & guests
- Review/rating system
- Payment escrow

### Compliance Features
- GDPR data export
- Tax report generation
- Booking contract generation

### Smart Features
- Price optimization based on demand
- Occupancy forecasting
- Guest recommendation engine
- Automated pricing adjustments

---

## Prioritization Matrix

```
Impact ↑
High   │ ███ Email Notif │ ░░░ Dark Mode
       │ ███ Photos      │ ░░░ i18n
       │ ███ Team Mgmt   │ ░░░ Analytics
       │ ██░ Reviews     │ ░░░ Mobile
Low    └─────────────────────────────────→ Effort
       Low            High
```

---

## Roadmap by Quarter

### Q2 2026 (Done by end of June)
- ✅ Test setup
- ✅ Knowledge base

### Q3 2026 (Jul-Sep)
- Content audit
- Bug fixes
- E2E tests
- Performance optimization

### Q4 2026 (Oct-Dec)
- Beta launch
- Email notifications
- Guest photos
- Analytics

### Q1 2027 (Future)
- Multi-language
- Dark mode
- Team management
- Advanced calendar

---

## How to Add Items

1. Create issue: "Feature: [name]"
2. Add to backlog with:
   - Priority (P0-P3)
   - Effort estimate (hours)
   - Related files/systems
   - Acceptance criteria
3. Link to [[Projects/Milestones]] if scheduled

---

**Related**: [[Projects/WynajemPRO]], [[Projects/Milestones]], [[Known-Issues]]

