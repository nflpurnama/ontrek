# Ontrek — Project Plan
_Last updated: March 27, 2026_

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

---

## 🔲 In Progress — Release Prep

- [ ] Confirm splash screen renders correctly on native build
- [ ] Test on physical device for both iOS and Android
- [ ] Apply for Apple Developer Program — developer.apple.com/programs/enroll ($99/yr, takes 24–72hr)
- [ ] Apply for Google Play Console — play.google.com/console ($25 one-time)
- [ ] Install EAS CLI: `npm install -g eas-cli`
- [ ] Configure EAS: `eas login` then `eas build:configure`
- [ ] First builds: `eas build --platform ios` and `eas build --platform android`
- [ ] Submit iOS to TestFlight: `eas submit --platform ios`
- [ ] Submit Android to Play internal testing track: `eas submit --platform android`
- [ ] Install on own device via TestFlight and Play internal track
- [ ] Start Google Play 14-day closed testing period (12 testers required → public launch ~early April)

---

## 🔲 Sprint 2 — Budgeting (NEXT)

### Goal
Allow the user to set a monthly budget at two levels: a total absolute value for
the month, and optional per-category allocations that slice into that total.
Budgets live in a dedicated budget tab — dashboard is unchanged.

### Behaviour
- User sets a total monthly budget (absolute number)
- User can optionally allocate portions of that total to specific categories
- Unallocated remainder is implicitly available for uncategorised spending
- At month end, budget copies over to next month by default — no prompt, no friction
- User can adjust the copied budget at any time during the month

### Budget tab views
1. Total budget — amount set vs amount spent so far this month
2. Category allocations — each allocated category shows budget vs actual spent
3. Unallocated remainder — total minus sum of category allocations

### Domain additions needed
- `Budget` entity — totalAmount, month, year
- `BudgetAllocation` entity — budgetId, categoryId, allocatedAmount
- `BudgetRepository` interface — get by month/year, save, update
- New use cases: `SetMonthlyBudget`, `GetCurrentBudget`, `CopyBudgetToNextMonth`
- Schema additions: `budgets` table, `budget_allocations` table

### Notes
- Copy-over logic runs when user opens the budget tab for a new month with no budget set
- Monthly only for now — weekly and yearly periods deferred to backlog

---

## 🔲 Sprint 3 — Command Interface (Optional)

Tab-based navigation is working well — revisit this only if the terminal vision
demands it. No urgency.

### Proposed commands
- `/add` — start transaction entry flow
- `/view` — transaction history, optional date range e.g. `/view 2026-03-01 2026-03-31`
- `/vendors` — vendor list
- `/categories` — category list
- `/balance` — current balance snapshot

### Open questions
- Do tabs disappear entirely or coexist as a fallback?

---

## 🔲 Backlog (priority order)

- [ ] Edit transaction
- [ ] Pseudo-autocorrect strip above keyboard for vendor/category selection
- [ ] Weekly and yearly period views on dashboard
- [ ] Balance over time (sparkline / trend)
- [ ] Spending by vendor
- [ ] Backspace navigation between transaction form phases
- [ ] Vendor management screen
- [ ] Category management screen (revisit default categories)
- [ ] Category suggestions based on vendor history
- [ ] Transaction filtering and search
- [ ] Multi-account support
- [ ] Weekly and yearly budget periods

---

## Architecture Notes

**Stack:** React Native, Expo, Expo Router, Drizzle ORM, SQLite, TypeScript

**Layer structure:**
- `domain/` — entities, value objects, repository interfaces, service interfaces. No framework dependencies.
- `application/` — use cases, dependency provider
- `infrastructure/` — SQLite repositories, SqliteFinancialTransactionService, DI container
- `presentation/` — screens, forms, components. Kanagawa terminal theme throughout.

**Key conventions:**
- Use cases receive and return domain entities, never raw DB rows
- Category state typed as `Category | null` — never a raw string name
- Type narrowing happens once via `validate()`, not at every boundary
- `TextInput` value prop uses `?? undefined`, never `null`
- Domain layer unit tested with Jest — no component tests in MVP scope
- `SqliteFinancialTransactionService` depends on `DatabaseTransaction` interface, enabling mock injection in tests
- Read-only display data resolved to names at use case level — IDs only passed when editing

**Testing:**
- Runner: Jest
- Scope: domain layer only — entities and service
- Location: `src/__tests__/domain/` and `src/__tests__/services/`
- Mock pattern: hand-rolled `jest.fn()` mocks typed with explicit param signatures to satisfy `jest.Mocked<T>`