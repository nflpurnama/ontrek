# Ontrek

A personal net worth dashboard. The user opens the app and sees their total worth — cash in accounts plus investment portfolio value. Expense tracking (via receipt scanning) is the primary mechanism for keeping account balances accurate.

## Language

**Receipt**:
A photograph of a transaction proof. A Receipt becomes one or more Transactions after OCR extraction and user validation. OCR failures follow a graceful degradation path: first, user can retry (photo may be blurry); if that fails, show partial results (whatever OCR extracted) for user correction; if still unusable, fall back to full manual entry. Photos are stored in app's internal storage (private, not accessible by user or other apps) and deleted after the entire batch is reviewed to save storage.
_Avoid_: Invoice, bill, proof

**Transaction**:
A validated record of money movement. Contains Amount, Date, Account, and optionally Vendor, Category, and Notes. Can be positive (income) or negative (expense). The Date field uses the transaction date from the receipt (when the merchant recorded it), not the scan time. A default Account is set during onboarding and automatically assigned to new transactions, but can be changed during review. Manual transactions are created via a floating action button (FAB) visible on all screens — tap FAB → select account → fill form → save. Basic validation applies: amount must be non-zero, date must be valid, account must exist. Refunds are handled by editing the original transaction amount — full refund changes amount to €0 (or delete), partial refund changes to net expense (e.g., €100 purchase with €60 refund becomes €40). Add a note to track that a refund occurred. Shared expenses (splitting bills with friends) are out of scope for MVP — users can enter only their share as the transaction amount. The app warns on exact duplicates (same amount, date, and vendor) but allows the user to keep both if intentional. Transactions can be deleted with an undo option (shown for a few seconds after deletion). Users can find transactions by scrolling through a chronological list (sorted newest first by default), searching by vendor/amount/notes using partial match (searching "Star" finds "Starbucks"), or filtering by date range/category/account/amount range. Special transactions (transfers, adjustments, recurring) are visually distinguished with color coding plus text labels (e.g., blue "Transfer", orange "Adjustment", green "Recurring") for clarity. Batch categorization is supported — users can select multiple transactions and apply one category to all of them. Transaction detail view shows full details (amount, date, vendor, category, notes, account, validation status, source) + edit button + delete button + linked transactions (for transfers, shows the other side; for recurring, shows the template).
_Avoid_: Expense, payment, purchase

**Draft Transaction**:
A Transaction extracted by OCR from a Receipt, awaiting user validation. The user reviews Draft Transactions using a card stack interface — swipe through one draft at a time, swipe right to validate, left to skip. This focused, sequential flow is optimized for mobile and quick decision-making.
_Avoid_: Pending transaction, unconfirmed transaction

**Validation State**:
A Draft Transaction can be in one of two states: `validated` (user reviewed and confirmed) or `unvalidated` (user skipped or hasn't reviewed yet). Unvalidated Draft Transactions show a yellow icon as a soft signal — they count in all calculations (balance, net worth, budget, reports) because the money is already gone. The user can validate later to confirm accuracy.
_Avoid_: Status, review state, confirmation state

**Source**:
Where a Transaction originates. Primary source is Receipt (OCR). Secondary sources include Statement (PDF/CSV) and manual entry.
_Avoid_: Origin, provider, input method

**Statement**:
A bank or service statement (PDF or CSV) containing multiple Transactions. Statement imports are initiated from the account detail screen (tap "Import Statement" → select file → app auto-detects parser or user confirms → review draft transactions). Parsers use a plugin architecture — each bank/service has its own parser module that can be added or updated independently without touching core code. If the parser fails, the app shows an error and discards the statement — users can try a different format or fall back to manual entry.
_Avoid_: Export, report, transaction list

**Category**:
A classification for a Transaction (e.g., Groceries, Transport, Entertainment). The app provides a predefined set of categories, and the user can add custom ones. Each Transaction has at most one Category. Categories are managed from Settings (list all categories, tap to edit/delete, "+" to add) and can also be created on-the-fly during transaction entry (type new category name → "Create new category" option appears). Categories are ordered by usage frequency (most-used first) in pickers and lists. Deleting a category that's in use shows a warning — the user can select a replacement category to reassign all impacted transactions, or leave them uncategorized, then delete.
_Avoid_: Type, group, label

**Vendor**:
Where a Transaction occurred (e.g., "Lidl", "Starbucks"). Optional but encouraged. The app learns from history — OCR extracts vendor names, and the app builds a list of known vendors over time, suggesting matches for future receipts using normalized matching (strips common suffixes like store numbers "#1234", corporate suffixes "INC", "LLC"). Vendors are managed from Settings (list all vendors, tap to edit/delete/merge, search to find) and can also be created on-the-fly during transaction entry (type new vendor name → "Create new vendor" option appears). Users can merge duplicates. Deleting a vendor that's in use shows a warning — the user can select a replacement vendor to reassign all impacted transactions, or leave them without a vendor, then delete.
_Avoid_: Merchant, store, shop, payee

**Recurring Transaction**:
A template that auto-generates Transactions on the due date (e.g., "Netflix, €12.99, monthly, Entertainment" generates on the 15th of each month). Created from transaction detail view — user creates a regular transaction first, then taps "Make Recurring" → sets frequency → saves as template. The template is stored as metadata, and each generated transaction is a real, editable transaction in the database. If the app is closed on the due date, all missed transactions are generated when the app next opens, each with its original due date. A template can be paused indefinitely and manually resumed when ready. Individual generated Transactions can be edited independently — editing one instance doesn't affect the template or future instances. Deleting a template keeps all previously generated transactions (they become regular transactions).
_Avoid_: Subscription, scheduled payment, auto-repeating transaction

**Budget**:
A planned spending limit for a Category over a weekly, monthly, or yearly period. A Category can have multiple budgets with different periods (e.g., €100/week and €400/month for Groceries). Created from the dedicated Budgets tab — tap "+" → select category → enter amount and period → save. Weekly budgets use fixed weeks from a user-defined start date (e.g., if start date is Wednesday, weeks run Wednesday to Tuesday). Monthly budgets starting on the 1st use calendar months (1st to last day); otherwise, they use rolling 30-day periods from the start date. Each period starts fresh — unused budget does not roll over. Budget status is displayed with both a progress bar (visual sense of remaining budget) and color coding (green = under budget, red = over budget) for quick scanning. A Budget is a soft signal — it compares planned vs. actual spending but never constrains or blocks Transactions. The app is a mirror, not a wallet.
_Avoid_: Envelope, spending plan, allocation

**Account**:
A financial container with a balance. Types: cash accounts (Mandiri, Jago, GoPay) and investment accounts (Bibit). Each Transaction belongs to an Account and changes its balance. Net worth = sum of all cash account balances + current value of all investment holdings. Balances can go negative — the app mirrors reality, not constraints. Accounts are managed from Settings (list all accounts, tap to edit/delete, "+" to add) and can also be quick-added from Dashboard. Accounts are displayed in user-defined order (drag-to-reorder). Deleting an Account also deletes all its Transactions — the app mirrors current reality, not history.
_Avoid_: Wallet, fund, pool

**Holding**:
A position within an investment Account. Tracks the total amount invested (sum of buy transactions) and the current value (manually updated by the user). Holdings are managed from the investment account detail screen (tap "Manage Holdings" → list/edit/delete/add). Holdings are updated from the account detail screen (tap "Update Value" → enter current value → save). No API integration — user checks Bibit and updates the value. Portfolio value = sum of all Holdings' current values. Investment performance = current value - total invested.
_Avoid_: Position, asset, investment

**Transfer**:
A movement of money between two of the user's own Accounts. Created from the FAB (tap "+" → select "Transfer" → choose source/destination accounts → enter amount → save) that creates both linked Transactions (one debit, one credit) at once. Net worth is unchanged. Hidden from expense/income reports. Deleting a transfer deletes both linked transactions automatically — they cannot exist independently.
_Avoid_: Internal transfer, account movement

**Adjustment**:
A correction Transaction created manually by the user to reconcile Account balances or record missing transactions. Created from the account detail screen (tap "Add Adjustment" → enter amount, date, notes → save). Marked as "adjustment" in the UI. Excluded from budget tracking and hidden from expense/income reports.
_Avoid_: Correction, reconciliation, balance fix

## Principles

**Mirror, not wallet**: The app reflects the user's financial situation. It does not hold money, enforce constraints, or prevent spending. All limits and budgets are informational signals, not hard boundaries. The app does not send notifications — users open it when they want to check their worth.

**Locale-aware formatting**: The app uses a single currency (user-selected during onboarding) but respects locale-specific number formatting — decimal separators (`,` vs `.`), thousands separators, and currency symbol placement vary by region. The user can change the currency after onboarding, but historical transactions are not converted — they remain in the original currency.

**Net worth focus**: The primary value proposition is showing the user their total worth — cash plus investments. Expense tracking serves this goal by keeping account balances accurate.

**Transactions are editable**: Any validated transaction can be edited, regardless of source (receipt, statement import, or manual entry). No special refund transaction type — users simply edit the original amount. No audit trail tracking for simplicity.

**Format validation only**: The app validates data formats (amounts must be valid numbers, dates must be valid, required fields must be filled) but does not enforce business rules (budgets can exceed income, balances can go negative). The app mirrors reality, not constraints.

**Single-user**: One user per app instance. No household sharing, no multi-user accounts. Each user has their own isolated data.

**Local-only**: All data stored on device. No cloud sync, no backup. Switching devices means losing data. Can be extended to cloud sync later.

**Error communication**: Transient errors (network timeout, temporary failure) show as toast notifications that auto-dismiss. Critical errors (database corruption, unrecoverable failures) show as modal dialogs requiring user acknowledgment. Silent failures lose trust; technical details confuse users.

**Undo for destructive actions**: All destructive actions (delete transaction, delete account, delete category, delete vendor) can be undone. The undo option is shown for a few seconds after the action. Edits and other non-destructive actions cannot be undone — users simply edit again.

**System-encrypted database**: The local database is encrypted with a system-generated key stored in the device's secure enclave. This protects financial data if the device is stolen, without requiring a user password.

**Automatic schema migration**: The app stores a schema version number. On startup, if the version is outdated, it runs migration scripts to update the schema and transform existing data. This is seamless for users — no manual export/import needed.

**JSON export/import**: The app provides full data export to JSON format using a relational structure — separate arrays for each entity type (transactions, accounts, categories, vendors, budgets, recurring templates) with IDs for relationships. Export is initiated from settings menu (tap "Export Data" → choose location → save JSON file). Import is also initiated from settings menu (tap "Import Data" → select JSON file → confirm overwrite → load). Users can backup their complete dataset or migrate to a new device. Import warns that existing data will be overwritten to prevent accidental data loss. If the JSON file contains invalid entries, the app imports what's valid, skips invalid entries, and shows a summary of what was imported/skipped.

## Reports

Reports are calculated in real-time by querying transactions on every view — no pre-computed snapshots or background jobs. This ensures reports are always accurate. Reports support both fixed time ranges (last 7 days, last 30 days, last 12 months, all time) and custom date range picker for specific periods.

**Net worth trend**: Line chart showing total net worth over time (daily/weekly/monthly).

**Cash flow**: Income vs. expenses per period. Shows whether the user is saving or burning cash.

**Category breakdown**: Spending by category (pie chart or bar chart). Shows where money goes.

**Budget vs. actual**: For each category, planned vs. actual spending. Shows which budgets are over or under.

**Account breakdown**: Balance per account (Mandiri, Jago, GoPay, Bibit). Shows asset allocation.

**Expense heatmap**: Calendar view where each day is colored by expense intensity. Shows spending patterns over time.

## Platform

**Kotlin (Android native)**: The app is built as a native Android application using Kotlin. This provides the simplest architecture, best performance, and most straightforward debugging. iOS support is out of scope for MVP. Minimum Android version: API 29 (Android 10, 2019).

**On-device OCR**: Receipt scanning uses Google ML Kit for text recognition, processed entirely on the device. No internet required, no cloud costs, aligns with local-only principle.

**Charting library**: Reports use MPAndroidChart for visualizations (line charts, bar charts, pie charts, heatmaps). Native Kotlin library, well-documented, performs well, supports all required chart types.

**Accessibility**: Basic accessibility support — content descriptions for screen readers, proper color contrast (WCAG AA), and semantic UI structure. Full accessibility compliance is deferred to post-MVP.

**Language support**: English only for MVP. Indonesian localization will be added later based on user feedback.

**Testing strategy**: Unit tests for business logic (calculations, parsers, validators) + integration tests for database operations and complex workflows. UI tests are deferred to post-MVP.

**Database**: Room (Android's SQLite abstraction) for local data storage. Provides type-safe queries, compile-time verification, and seamless Kotlin coroutines integration. SQLite under the hood ensures data integrity and reliability. Database corruption is prevented with write-ahead logging (WAL) mode and proper transaction safety. If corruption still occurs, the app shows an error message and offers to restore from the last JSON export.

**Architecture**: MVI (Model-View-Intent) pattern for state management. Unidirectional data flow with predictable state updates. Clean Architecture layers deferred to post-MVP for faster initial development.

**Performance**: Pagination for transaction lists (50 items per page). Lazy loading and caching deferred to post-MVP.

**Bottom navigation**: The app uses a bottom navigation bar with 5 main tabs: Dashboard (net worth overview), Transactions (list and search), Budgets (spending limits and tracking), Reports (charts and analytics), and Settings (accounts, categories, export/import). This follows standard Android patterns for quick, discoverable navigation.

**Customizable Dashboard**: The Dashboard uses a widget-based layout where users choose what to display. Available widgets include: total net worth, net worth trend chart, account breakdown, recent transactions, budget status, and expense heatmap. Users configure widgets via long-press (quick actions: remove, resize) and edit mode (drag-and-drop reordering for major layout changes). This matches Android home screen patterns.

**Theming**: The app supports both light and dark modes with a manual toggle in Settings, independent of system theme preference. Users can choose their preferred theme regardless of device settings.

## Onboarding

**Minimal setup flow**: First-time users go through a minimal setup: create first account → set starting balance → done. No guided wizard for categories or budgets. Users can add more accounts, categories, and budgets later as needed. The goal is to get users to a working state as fast as possible.
