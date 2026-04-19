# Ontrek — Project Guide

_April 20, 2026_

---

## What is Ontrek?

A privacy-first, offline-only expense tracker with terminal-inspired aesthetics. Used after transactions happen — the money is already spent. No blocking, no enforcement. Just logging and awareness.

**Version:** 1.3.2  
**Package:** `com.kenali.ontrek`  
**Platform:** Android (Play Store), iOS deferred

---

## Tech Stack

| Category | Technology |
|----------|-------------|
| Framework | React Native 0.81, Expo 54 |
| Router | Expo Router (file-based) |
| Database | SQLite via `expo-sqlite` + Drizzle ORM |
| Language | TypeScript |
| Testing | Jest |
| Build | Local Gradle (no EAS) |

---

## Architecture

**Pattern:** Clean Architecture with Dependency Injection

```
src/
├── domain/                    # Business logic (framework-agnostic)
│   ├── entities/              # Transaction, Budget, SavingsGoal, Vendor, Category, Account
│   ├── repositories/          # Interfaces (ISqliteTransactionRepository, etc.)
│   ├── services/             # FinancialTransactionService interface
│   ├── constants/            # TransactionType, SpendingType
│   └── value-objects/        # Id, EntityMetadata
│
├── application/              # Use cases
│   ├── use-case/            # CreateTransaction, SetMonthlyBudget, etc.
│   ├── types/               # DashboardData
│   └── providers/          # dependency-provider.tsx (React Context)
│
├── infrastructure/           # Implementations
│   ├── database/            # SQLite schema (Drizzle)
│   ├── repository/          # SqliteTransactionRepository, etc.
│   └── services/            # SqliteFinancialTransactionService
│
└── presentation/            # UI
    ├── components/          # TopBar, PieChart, TransactionForm, inputs
    ├── forms/               # TransactionForm
    ├── theme/               # terminal.ts (Kanagawa colors)
    └── utility/             # formatters (currency)
```

---

## Key Entities

### Transaction
```ts
class Transaction {
  id: Id
  vendorId: string | null
  categoryId: string | null
  transactionDate: Date
  type: "EXPENSE" | "INCOME"
  spendingType: "ESSENTIAL" | "WANT" | "LUXURY"
  amount: number
  description: string | null
  
  // Methods
  signedAmount: number  // negative for EXPENSE
  updateAmount(), updateVendor(), updateCategory()
}
```

### Budget
```ts
class Budget {
  id: Id
  totalAmount: number
  month: number (1-12)
  year: number
  allocations: BudgetAllocation[]
  
  totalAllocated: number
  unallocatedAmount: number
}

class BudgetAllocation {
  categoryId: string
  allocatedAmount: number
}
```

### SavingsGoal
```ts
class SavingsGoal {
  id: Id
  name: string
  targetAmount: number
  currentBalance: number
  targetDate: Date | null
  month: number
  year: number
  
  isCompleted: boolean
  progressPercentage: number
  
  deposit(amount), withdraw(amount)
}
```

---

## Navigation (Expo Router)

```
app/
├── _layout.tsx                    # Root: database init, DependencyProvider
├── (tabs)/                        # Tab navigator (5 tabs, floating)
│   ├── _layout.tsx               # FloatingTabBar component
│   ├── index.tsx                # Dashboard
│   ├── transactions.tsx           # Transaction list
│   ├── budget/
│   │   ├── index.tsx            # Budget view
│   │   ├── edit.tsx            # Edit budget
│   │   └── _layout.tsx
│   ├── goals/
│   │   ├── index.tsx            # Goals list
│   │   ├── add.tsx              # Create goal
│   │   ├── [id].tsx             # Goal detail
│   │   │   ├── deposit.tsx
│   │   │   └── withdraw.tsx
│   │   └── _layout.tsx
│   └── add.tsx                   # Add transaction form
├── transactions/
│   ├── [id].tsx                 # Transaction detail, delete
│   └── edit/
│       └── [id].tsx            # Edit transaction
```

---

## Theme (Kanagawa-Inspired)

```ts
const terminalTheme = {
  colors: {
    background: "#1a1b26",   // dark blue-gray
    card: "#24283b",         // lighter blue-gray
    border: "#414868",       // muted purple-gray
    primary: "#7aa2f7",     // blue (links, focus)
    secondary: "#a9b1d6",   // light gray (text)
    accent: "#bb9af7",       // purple (highlights)
    income: "#9ece6a",       // green
    expense: "#f7768e",       // red/pink
    muted: "#565f89",        // dark gray
  },
  fonts: { mono: "JetBrains Mono" },  // single weight (regular only)
  ascii: { tl: "┌─", tr: "─┐", bl: "└─", br: "─┘", h: "─", v: "│" }  // card borders
}
```

**Important:** JetBrains Mono has only one weight. Don't set `fontWeight` on any style using this font.

---

## Database Schema (SQLite/Drizzle)

Tables:
- `accounts` — single account for now
- `transactions` — all transactions with type (EXPENSE/INCOME)
- `vendors` — autocomplete for vendor names
- `categories` — default categories (Food, Transport, etc.)
- `budget` — monthly budgets
- `budget_allocations` — per-category allocations
- `savings_goals` — savings targets with progress

---

## Key Use Cases

| Use Case | From UI Component | Returns |
|----------|------------------|---------|
| GetDashboard | Dashboard | currentBalance, thisMonth stats, previousMonth stats |
| CreateTransaction | Add form | new transaction ID |
| ViewTransactions | Transactions list | transactions grouped by date |
| SetMonthlyBudget | Budget edit | budget saved |
| GetCurrentBudget | Budget view | budget with spent per category |
| CreateSavingsGoal | Goals add | new goal |
| DepositToSavingsGoal | Goal deposit | updated balance |
| WithdrawFromSavingsGoal | Goal withdraw | updated balance |

---

## State Management

**Pattern:** React Context + Dependency Injection

```ts
// dependency-provider.tsx
interface Dependencies {
  getDashboardUseCase: GetDashboardUseCase;
  createTransactionUseCase: CreateTransactionUseCase;
  // ... all use cases exposed here
}

// Usage in any component:
const { getDashboardUseCase, createTransactionUseCase } = useDependencies();
```

**Initialization:** `app/_layout.tsx` creates dependencies on mount, passes to `DependencyProvider`.

---

## Running the App

```bash
# Development
npm start              # Expo dev server
npm run android       # Run on Android

# Linting
npm run lint          # ESLint

# Testing
npm test              # Jest (domain tests only)

# Building
npx expo prebuild --platform android --clean
cd android && ./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

---

## Features (v1.3.2)

### ✅ Completed
- Terminal-styled UI (Kanagawa theme: dark blue-gray background #1a1b26)
- JetBrains Mono font throughout
- Dashboard with balance display
- Pie chart for category breakdown
- Month-over-month comparison
- Transaction form with vendor/category autocomplete (pill-based)
- Monthly budget with per-category allocations
- Auto-copy budget to next month
- Savings Goals: create, deposit, withdraw, progress tracking
- Transaction detail with delete
- Shared TopBar component across all screens
- Currency formatter with negative value support
- Flat floating tab bar with center "+" button

### 🔲 Known Bugs / To Do
- [ ] Transaction form needs explicit save button
- [ ] Settings page (monthly income, currency, export, about)
- [ ] Daily Allowance: show `(budget left / days remaining)` on dashboard

---

## Next: Settings Page

**Purpose:** Allow user to configure app basics

**Settings to implement:**
1. **Monthly income** — primary input for the app (affects budget percentages)
2. **Default currency** — IDR for now
3. **Data export** — backup to JSON file
4. **About** — version info, privacy policy link

**Implementation:**
- New table: `settings` (key-value) or single-row
- New use cases: `GetSettings`, `UpdateSettings`
- New tab: `Settings`
- Routes: `app/(tabs)/settings/index.tsx` (list), `app/(tabs)/settings/edit.tsx` (edit specific setting)

---

## Code Conventions

- **Files:** kebab-case (`transaction-form.tsx`, `pie-chart.tsx`)
- **Classes/Interfaces:** PascalCase
- **Variables/Functions:** camelCase
- **Constants:** SCREAMING_SNAKE_CASE for true constants
- **TextInput:** use `value={someValue ?? undefined}`, never `?? null`
- **Fonts:** JetBrains Mono only — do NOT set `fontWeight` (single weight font)
- **Colors:** always use `terminalTheme.colors.*`, never hardcoded hex
- **Domain:** entities enforce invariants, throw Error on invalid input
- **Use cases:** inject repositories via constructor
- **Testing:** Jest, domain layer only (`src/__tests__/domain/`)

---

## Package.json Scripts

```json
{
  "name": "ontrek",
  "version": "1.3.2",
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "lint": "expo lint",
    "test": "jest"
  }
}
```

---

## Key Files Reference

| Purpose | File Path |
|---------|-----------|
| Root layout | `app/_layout.tsx` |
| Tab navigation | `app/(tabs)/_layout.tsx` |
| Dashboard | `app/(tabs)/index.tsx` |
| Add transaction | `app/(tabs)/add.tsx` |
| Transaction form | `src/presentation/forms/transaction-form.tsx` |
| TopBar component | `src/presentation/components/top-bar.tsx` |
| Theme | `src/presentation/theme/terminal.tsx` |
| Currency formatter | `src/presentation/utility/formatter/currency.ts` |
| Dependency container | `src/infrastructure/container/dependency-container.ts` |
| Settings entity | Does not exist yet (create for settings page) |

---

## Git Conventions

**Commit flow:**
1. Run `git status` to see changes
2. Run `git diff` to review
3. Run `git log --oneline -3` for recent commit style
4. Stage with `git add <files>`
5. Commit with `git commit -m "<message>"`
6. Never commit without explicit user approval