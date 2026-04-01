# Ontrek — Project Plan
_Last updated: April 1, 2026_

---

## Product Principles

- **Logger, not gatekeeper** — the app is always used after transactions take place.
  The money is already spent. No hard stops, no blocking, no interruptions to the
  logging flow. Feedback is purely informational — over-budget categories are shown
  in red, at-risk savings targets are surfaced visually. The user draws their own
  conclusions.
- **Privacy-first, offline-first** — no external APIs, no data collection, no bank
  syncing. Everything lives on the device.
- **Keyboard-first UX** — minimize finger travel. The keyboard stays on screen.
  Navigation and entry flow around it, not the other way around.
- **Paradigm-agnostic domain** — the domain knows nothing about budgeting paradigms.
  Templates and paradigms are setup concerns only, never persisted.
- **Manual entry as self-awareness** — manual logging is a feature, not a limitation.
  Research supports that manual entry promotes deeper financial reflection than
  automated syncing.

---

## Current Status (April 2, 2026)

### Production Release
- ✅ Google Play Console account created and verified
- ✅ App submitted to Play Console (v1.0.3)
- ✅ Privacy policy published via GitHub Pages
- 🔲 Awaiting production review/approval

### Savings Goals (Sprint 3) — COMPLETED
- ✅ SavingsGoal entity — name, targetAmount, currentBalance, targetDate
- ✅ Create goal form with currency/date formatting
- ✅ Goals list screen with progress visualization
- ✅ Deposit to goal (logs as expense, increases goal balance)
- ✅ Withdraw from goal (logs as income, decreases goal balance)
- ⚠️ Delete transaction from transactions list — not linked to goal reversal (known issue)

### Known Issues
- Deleting a deposit/withdrawal transaction from the transactions list does not reverse the linked savings goal balance. This is due to a schema mismatch issue that needs investigation.

---

## ✅ Completed

- Remove `deleteDatabaseSync` from `app/_layout.tsx`
- Fix `SqliteFinancialTransactionService` constructor to depend on `DatabaseTransaction` interface
- 37 domain unit tests passing (Transaction, Account, SqliteFinancialTransactionService)
- Full smoke test — all 11 flows verified
- Transaction detail screen with delete functionality (`app/transactions/[id].tsx`)
- App icon (`assets/images/ontrek-icon.png`)
- Splash screen (`assets/images/ontrek-splash.png`)
- `app.json` corrected — plugin array structure fixed, splash configured per platform
- Transaction form redesign (terminal vision) — complete
- Terminal form styling — Kanagawa-inspired theme, JetBrains Mono font, terminal-style nav bar
- Analytical features — dashboard with balance, income/expenses, net, category breakdown
  with pie chart, month-over-month comparison, transaction list grouped by date
- Vendor/category names resolved at use case level — no more IDs in UI
- Pie chart with colored category names matching slice colors
- Bug fixes — stale closure issues in transaction form, category repository null checks
- Budgeting — monthly budget with total and per-category allocations, auto copy-over to next month
- Google Play Console account created and verified
- Local build setup (Gradle instead of EAS)
- First Android build complete
- Submitted to Google Play
- Privacy policy published via GitHub Pages
- DB initialization race condition fixed
- Transaction detail screen ID display fixed
- Savings Goals feature — create, deposit, withdraw, progress tracking
- Goal balance updates on deposit/withdraw via UI buttons

---

## 🔲 In Progress — Production Release (Android)

- [ ] Await Google Play review/approval
- [ ] Production rollout after approval

### iOS — deferred
Apple Developer Program ($99/yr) not enrolled yet. iOS release deferred indefinitely.

---

## 🔲 Known Bugs (to fix before production)

All known bugs have been fixed:
- [x] DB initialization race condition
- [x] Transaction detail ID display
- [x] Category allocation validation
- [x] Budget screen keyboard handling

---

## 🔲 Sprint 2 — UI/UX Redesign (Budget-Centric Architecture)

### Vision
The budget becomes the primary navigation structure. Users don't add a transaction
and pick a category — they enter a category and log spending against it. Category
context is implicit from where you are, not a field to fill in.

### New tab structure
- **Home** — budget progress per category, savings target progress, income button
- **Analytics** — current dashboard moved here (pie chart, income vs expense,
  month-over-month, net worth)
- **Goals** — savings goals list, progress, deposit/withdraw actions
- **Transactions** — full history

### Home screen
- Each budget category displayed as a card showing allocated vs spent
- Over-budget categories shown in red — informational only, never blocking
- Savings target progress for current month
- `+ Income` button — single tap, enter amount only, no category needed
- Tapping a category card opens that category's transaction log and add flow
- "Unplanned" catch-all bucket always present for transactions outside budget categories

### Transaction entry
- Entry point moves inside each budget category
- Category is implicit — no category selection step needed
- Vendor and description remain optional fields
- Income entry is a separate minimal flow — amount only

### Budget setup & paradigm plugins
Each paradigm is a plugin contributing:
1. Its own onboarding UI
2. Its own transient model (intermediate state during setup)
3. A converter function — takes transient model + monthly income, produces
   standard category/allocation list
```ts
type BudgetParadigmPlugin = {
  id: string
  name: string
  description: string
  OnboardingFlow: React.Component
  convert: (transientModel: any, monthlyIncome: number) => {
    categoryName: string
    allocatedAmount: number
  }[]
}
```

### Paradigms to implement
- **Percentage-based** (50/30/20, 70/20/10, 80/20) — transient model is an array
  of integers representing splits. Onboarding UI is sliders. User picks a preset
  then adjusts sliders to taste.
- **Zero-Based Budgeting (ZBB)** — transient model is a list of categories with
  amounts. Onboarding UI is a category list editor — create, edit, delete. Sum
  must equal monthly income.
- **Pay Yourself First** — savings amount set first, remainder allocated freely
- **Blank** — no template, user defines everything from scratch

### Savings target
- Set once per month alongside budget
- Displayed as progress on home screen
- Not a spendable category — purely a monthly target

### Domain changes needed
- `Budget` entity unchanged — paradigm is purely a setup concern, never persisted
- `BudgetParadigmPlugin` — presentation/setup concern only, not a domain entity
- `SavingsTarget` entity — targetAmount, month, year
- New use case: `GetHomeDashboard` — returns budget categories with allocated vs
  spent, savings progress, for current month
- `GetDashboardUseCase` repurposed for analytics tab only

---

## ✅ Completed — Savings Goals (Sprint 3)

### Vision
Named, dated savings goals that users fund deliberately. Goals are virtual envelopes
sitting outside the main spending budget.

### Implemented
- User creates a goal with a name, target amount, and optional target date
- Multiple goals can exist simultaneously
- **Deposit** — user taps deposit on a goal, enters amount, logs as an expense
  transaction. Goal balance increases.
- **Withdraw** — user taps withdraw on a goal, enters amount, logs as an income
  transaction. Goal balance decreases.
- When goal balance reaches target amount, goal displays as complete
- Completed goals remain visible — user decides what to do next, no forced action

### Goals screen
- List of all goals — name, target amount, current balance, progress bar, target date
- Deposit/withdraw buttons on each card
- Completed goals shown with a distinct visual treatment

### Progress visualization
- Progress bar per goal — current balance vs target amount
- Target date shown

### Domain additions
- `SavingsGoal` entity — name, targetAmount, currentBalance, targetDate (optional)
- `SavingsGoalTransaction` (linking table) — goalId, transactionId, type (deposit/withdraw)
- `SavingsGoalRepository` interface
- Use cases: `CreateSavingsGoal`, `DepositToGoal`, `WithdrawFromGoal`, `GetAllGoals`
- Transaction deletion reverses linked savings goal balance

### Limitations (known)
- No foreign key constraints in SQLite (planned for future)
- Deleting a savings goal does not delete linked transactions

---

## 🔲 Sprint 4 — Analytics & Progress Visualization

### Vision
Forward-looking and backward-looking views that help users understand where they
are and where they are going. Lives in the Analytics tab.

### Analytics tab contents
- Current dashboard (moved from home) — income vs expense, category breakdown,
  month-over-month comparison
- **Net worth over time** — balance trend as a chart
- **Cash flow forecasting** — "at this rate you'll end the month with X" based
  on current month spend rate projected forward. Recurring expenses factored in
  once that feature is implemented.
- **Spending by vendor** — once vendor prominence is revisited

---

## 🔲 Sprint 5 — Terminal Form Styling

- Pseudo-autocorrect strip above keyboard for vendor input
- Visual polish on pills
- Suggestion list styling

---

## 🔲 Sprint 6 — Command Interface (Optional)

Tab-based navigation is working well — revisit only if terminal vision demands it.

---

## 🔲 Backlog (priority order)

### UX & Core Features
- [ ] Edit transaction
- [x] Fix delete transaction to reverse linked savings goal balance
- [ ] Pseudo-autocorrect strip above keyboard for vendor input
- [ ] Backspace navigation between transaction form phases
- [ ] Vendor management screen
- [ ] Category management screen (revisit default categories)
- [ ] Category suggestions based on vendor history
- [ ] Transaction filtering and search
- [ ] Recurring expenses — needed before cash flow forecasting is meaningful

### Theming
- [ ] Theme system — abstract all colors and typography into a theme context
- [ ] Kanagawa remains the default (free)
- [ ] Custom theming — one-time $1 IAP to unlock ability to edit own theme
  (colors, font, accent — stored locally per device)
- [ ] IAP infrastructure — Play Store and App Store in-app purchase configuration,
  receipt validation, purchase state persisted locally
- [ ] Note: IAP requires Apple Developer Program enrollment for iOS

### Infrastructure
- [ ] Multi-account support
- [ ] Command interface (`/add`, `/view`, etc.) — optional
- [ ] Add foreign key constraints to SQLite schema (for referential integrity)

---

## Architecture Notes

**Stack:** React Native, Expo, Expo Router, Drizzle ORM, SQLite, TypeScript

**Build Process (no EAS):**
```bash
# One-time setup
npx expo prebuild --platform android --clean

# Release build
cd android && ./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

**Version Management:**
- `app.json` — version name (e.g., "1.0.3")
- `android/app/build.gradle` — versionCode (integer, must increment)
- Upload keystore: `android/app/upload-keystore.jks` (backed up locally, not in git)

**Layer structure:**
- `domain/` — entities, value objects, repository interfaces, service interfaces.
  No framework dependencies.
- `application/` — use cases, dependency provider
- `infrastructure/` — SQLite repositories, SqliteFinancialTransactionService, DI container
- `presentation/` — screens, forms, components. Kanagawa terminal theme throughout.
- `presentation/paradigms/` — budget paradigm plugins. Setup concern only.

**Key conventions:**
- Use cases receive and return domain entities, never raw DB rows
- Category state typed as `Category | null` — never a raw string name
- Type narrowing happens once via `validate()`, not at every boundary
- `TextInput` value prop uses `?? undefined`, never `null`
- Domain layer unit tested with Jest — no component tests in MVP scope
- `SqliteFinancialTransactionService` depends on `DatabaseTransaction` interface,
  enabling mock injection in tests
- Read-only display data resolved to names at use case level — IDs only passed when editing
- Budget paradigms are plugins — transient setup concerns, never persisted to domain
- No enforcement of budget limits — app is a logger, not a gatekeeper
- Savings goal deposits logged as expenses, withdrawals logged as income

**Testing:**
- Runner: Jest
- Scope: domain layer only — entities and service
- Location: `src/__tests__/domain/` and `src/__tests__/services/`
- Mock pattern: hand-rolled `jest.fn()` mocks typed with explicit param signatures
  to satisfy `jest.Mocked<T>` 

**Play Store:**
- Package: `com.kenali.ontrek`
- EAS Project ID: `a1f59bb1-f518-4196-8af1-8b2c1510355e`
- Privacy Policy: GitHub Pages URL
- Play App Signing: Enabled (Google manages signing key)
- No EAS Submit — manual upload to Play Console
