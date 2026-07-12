# Single Currency with No Conversion

The app supports only one currency at a time (user-selected during onboarding). No multi-currency support, no exchange rate conversion.

## Context

Users may have accounts in different currencies or travel internationally. Multi-currency support requires exchange rate APIs, conversion logic, and complex data modeling. For a personal net worth dashboard, this adds significant complexity.

## Decision

Support a single currency selected during onboarding. Users can change the currency later, but historical transactions are not converted — they remain in the original currency. No exchange rate integration.

## Considered Options

- **Multi-currency with automatic conversion**: Requires exchange rate API, conversion logic, and handling historical rates
- **Multi-currency with manual rates**: User enters exchange rates manually — tedious and error-prone
- **Single currency with conversion on change**: Convert all historical transactions when currency changes — loses original amounts

## Consequences

- **Simplicity**: No exchange rate API, no conversion logic, no rate storage
- **Limitation**: Users with multi-currency finances must choose one currency or use separate apps
- **Data integrity**: Historical transactions preserve original currency amounts
- **User friction**: Changing currency after onboarding means historical data is in mixed currencies
- **Scope**: Keeps MVP focused on core value proposition (net worth tracking) without currency complexity
