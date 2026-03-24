# Physical Device Test Checklist

## Pre-Installation
- [ ] Uninstall any previous Ontrek builds
h- [ ] Fresh install from TestFlight (iOS) / Play internal testing (Android)

---

## iOS (TestFlight)

### Splash Screen
- [ ] App icon visible in App Store/TestFlight
- [ ] Splash screen displays correctly (check dark/light mode)
- [ ] Splash dismisses and transitions to app

### Navigation
- [ ] Tab bar visible with 5 tabs (Dashboard, Add, Transactions, Accounts, Vendors)
- [ ] Tab switching is smooth
- [ ] Floating tab bar behavior works

### Dashboard (Home)
- [ ] Account balance displays correctly
- [ ] Balance updates after adding transactions
- [ ] Recent transactions visible

### Add Transaction
- [ ] Can add expense transaction
- [ ] Can add income transaction
- [ ] Amount input works
- [ ] Vendor selection works
- [ ] Category selection works
- [ ] Transaction saves to database
- [ ] Balance updates immediately

### Transactions List
- [ ] All transactions visible
- [ ] Can scroll through list
- [ ] Can tap transaction to view details

### Transaction Detail
- [ ] Opens correct transaction
- [ ] Delete button works
- [ ] Navigates back to list after delete
- [ ] Balance updates after delete

### Vendors
- [ ] Vendor list displays
- [ ] Tap vendor shows details (if implemented)

### Accounts
- [ ] Account balance displays (if implemented)

### System
- [ ] App doesn't crash
- [ ] No JavaScript errors in console
- [ ] Keyboard behavior correct
- [ ] Haptic feedback works (if applicable)
- [ ] App survives backgrounding/foregrounding
- [ ] App survives phone call interruption

---

## Android (Play Internal Testing)

### Splash Screen
- [ ] Splash screen displays with correct background color (#1C2833)
- [ ] Splash image properly contained (resizeMode: "contain")
- [ ] Splash dismisses smoothly

### All above test cases (same as iOS except tab behavior may vary)

### Android-Specific
- [ ] Back button works correctly
- [ ] Swipe back gesture works (if enabled)
- [ ] System navigation bar styling
- [ ] Status bar styling
- [ ] Safe area handling (notches, punch holes)

---

## Both Platforms

### Data Persistence
- [ ] Transactions persist after app restart
- [ ] Vendor data persists
- [ ] Account balance persists
- [ ] Close and reopen app — data intact

### Edge Cases
- [ ] Empty state (no transactions yet)
- [ ] Very long vendor names
- [ ] Very large amounts
- [ ] Special characters in notes
- [ ] Network offline (if any network features)

---

## Performance
- [ ] App launches in < 3 seconds
- [ ] No lag when adding transaction
- [ ] Smooth scrolling in transaction list
- [ ] No memory leaks after extended use

---

## Known Issues to Verify

1. **Splash screen inconsistency** — `expo-splash-screen` plugin in `app.json` uses `ontrek-icon.png` instead of `ontrek-splash.png`. Should be verified/changed.
2. **Android vs root splash** — different `resizeMode` values (`cover` vs `contain`) and no `backgroundColor` at root level.
