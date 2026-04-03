# Agent Guidelines for Ontrek

Ontrek is a React Native (Expo) financial tracking app using Clean Architecture.

## Commit Protocol

**NEVER commit without explicit user approval.** This applies regardless of:
- Having write permissions to the repository
- Being in "build mode"
- Any other operational context

Before any git commit:
1. Run `git status` to show changes
2. Run `git diff` to show staged changes  
3. Run `git log` to show recent commit style
4. Present a clear summary of what will be committed
5. Ask for explicit approval before proceeding

If the user approves:
- Stage relevant files
- Create commit with message
- Verify with `git status` after

## Build & Test Commands

```bash
# Development
npm start                    # Start Expo dev server
npm run android              # Start with Android
npm run ios                  # Start with iOS

# Linting
npm run lint                 # Run ESLint (expo lint)

# Testing
npm test                    # Run all tests
npm test -- src/__tests__/domain/Transaction.test.ts   # Run single test file
npm test -- --watch        # Watch mode
npm test -- --coverage     # With coverage

# EAS Builds
eas build --platform android --profile preview
eas build --platform ios --profile preview
eas build:list             # List builds
```

## Architecture

```
src/
├── application/           # Use cases, providers, types
│   ├── types/            # Type definitions (e.g., dashboard.ts)
│   ├── providers/        # React context (dependency-provider.tsx)
│   └── use-case/         # Business logic
├── domain/               # Entities, repositories (interfaces), value objects
│   ├── entities/         # Domain models (Transaction, Vendor, Category)
│   ├── repositories/     # Repository interfaces
│   ├── constants/        # Enums (TransactionType, SpendingType)
│   └── value-objects/   # Id, EntityMetadata
├── infrastructure/       # Implementations (SQLite repos, services)
│   ├── database/        # SQLite schema, migrations
│   ├── repository/      # Sqlite*Repository implementations
│   └── services/        # SqliteFinancialTransactionService
└── presentation/        # UI (screens, components, forms)
    ├── components/
    └── forms/
```

## Code Style Guidelines

### Imports
- Use path aliases: `@/src/domain/entities/transaction`
- Group imports: React → external libs → internal modules → relative imports
- Sort alphabetically within groups

### Types
- Strict TypeScript (`strict: true` in tsconfig)
- Use explicit types for function parameters and return values
- Domain entities use private fields with public getters
- Null handling: use `null` explicitly, `?? undefined` for TextInput values

### Naming Conventions
- **Files**: kebab-case (`transaction-repository.ts`, `pie-chart.tsx`)
- **Classes**: PascalCase (`class GetDashboardUseCase`)
- **Interfaces**: PascalCase (`interface TransactionRepository`)
- **Variables/Functions**: camelCase (`handleSubmit`, `vendorName`)
- **Constants**: SCREAMING_SNAKE_CASE for true constants
- **Types/Enums**: PascalCase

### React Components
- Use functional components with hooks
- Prefer named exports for components (`export const TransactionForm`)
- Use `useCallback` for callbacks passed to child components
- Always include dependency arrays in `useEffect` and `useCallback`

### Error Handling
- Domain layer: throw descriptive `Error` objects
- Repository/Service layer: let errors bubble up
- Presentation layer: catch and display user-friendly messages
- Never swallow errors silently

### State Management
- Use React Context for dependency injection (`useDependencies`)
- Local state with `useState` for component-specific state
- Avoid prop drilling - use context when appropriate

### Testing
- Location: `src/__tests__/domain/` and `src/__tests__/services/`
- Use `jest.fn()` for mocking with explicit type signatures
- Test domain logic, not implementation details
- Pattern: `describe` → `it` → `expect`

## Database Conventions

- Use Drizzle ORM with SQLite via `expo-sqlite`
- Schema in `src/infrastructure/database/sqlite/schema.ts`
- Migrations in `drizzle/migrations/`
- Repository pattern: interface in `domain/`, implementation in `infrastructure/`
- `SqliteFinancialTransactionService` depends on `DatabaseTransaction` interface (not concrete class)

## Expo Router

- File-based routing in `app/` directory
- Layout files: `_layout.tsx`
- Dynamic routes: `[id].tsx`
- Tab routes: `(tabs)/`
- Use `useFocusEffect` for screen refresh with proper dependency arrays

## Common Patterns

### Creating a New Use Case
1. Create in `src/application/use-case/<entity>/<action>.ts`
2. Define input/output types
3. Inject required repositories via constructor
4. Add to `DependencyContainer` and `Dependencies` interface

### Creating a New Repository
1. Define interface in `src/domain/repositories/`
2. Implement in `src/infrastructure/repository/sqlite/`
3. Register in `DependencyContainer`

### Adding a New Screen
1. Create in `app/` following Expo Router conventions
2. Use `useDependencies()` hook to access use cases
3. Use `useFocusEffect` with `useCallback` for data loading
4. Handle loading and error states

## UI Conventions

- Style with `StyleSheet.create()`
- Use existing color palette: `#111827` (dark), `#6B7280` (gray), `#10B981` (green/income), `#EF4444` (red/expense)
- Cards: white background, `borderRadius: 20`, subtle shadow
- Consistent spacing: `padding: 16` or `20`, `marginBottom: 16`
