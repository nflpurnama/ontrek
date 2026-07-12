# Single Currency Instead of Multi-Currency

The app uses a single currency selected by the user during onboarding. All transactions, accounts, and reports use this currency. Users can change the currency after onboarding, but historical transactions are not converted — they remain in the original currency.

This decision prioritizes simplicity and accuracy over flexibility. Multi-currency support requires exchange rate management, conversion logic, and decisions about which rate to use (historical vs. current), which adds significant complexity.

**Considered Options:**
- Multi-currency with automatic conversion — flexible, but requires exchange rate API or manual rate entry
- Multi-currency with manual conversion — user enters converted amounts, but tedious
- Single currency with no ability to change — simpler, but locks users into initial choice
- Single currency with full historical conversion — complex, requires storing historical exchange rates

**Consequences:**
- Users who deal with multiple currencies must choose one as primary
- Changing currency after onboarding leaves historical transactions in original currency (mixed currency state)
- No exchange rate API integration required
- Simpler calculations — all amounts are in the same unit
- Aligns with local-only principle — no external dependencies for exchange rates
- Indonesian users typically operate in IDR, reducing multi-currency need
