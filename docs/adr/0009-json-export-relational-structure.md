# JSON Export/Import with Relational Structure

Data export and import use JSON format with a relational structure (separate arrays for each entity type with foreign keys).

## Context

Users need to backup their data or migrate to a new device. The export format must be complete (all data), portable (can be stored anywhere), and importable (can restore or migrate). The format should also be human-readable for debugging.

## Decision

Use JSON format with a relational structure — separate arrays for each entity type (transactions, accounts, categories, vendors, budgets, recurring templates) with IDs for relationships. This mirrors the database schema and makes import straightforward.

## Considered Options

- **Flat structure**: All transactions in one array, all accounts in another — loses relationship clarity
- **Nested structure**: Accounts contain their transactions, categories contain their budgets — makes imports complex (what if an account references a category that's nested inside it?)
- **CSV export**: Simpler but can't represent relationships, multiple entity types, or complex data like recurring templates
- **Compressed/binary format**: Minimizes file size but sacrifices readability and debuggability

## Consequences

- **Completeness**: Exports all data including relationships between entities
- **Portability**: JSON is universal — can be stored, versioned, inspected with any text editor
- **Import simplicity**: Relational structure maps directly to database schema — straightforward parsing and validation
- **Human-readable**: Users can inspect the JSON to verify data or debug issues
- **Trade-off**: Larger file size than binary formats (acceptable for financial data volumes)
- **Partial import handling**: If JSON contains invalid entries, app imports what's valid, skips invalid, shows summary
