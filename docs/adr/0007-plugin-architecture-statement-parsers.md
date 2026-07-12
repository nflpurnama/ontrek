# Plugin Architecture for Statement Parsers

Statement parsers use a plugin architecture where each bank/service has its own parser module that can be added or updated independently.

## Context

Bank statement formats vary widely — different PDF layouts, CSV column orders, date formats, and field names. A monolithic parser with conditionals for each bank becomes unmaintainable. Users need to import statements from multiple banks (Mandiri, Jago, Bibit, etc.).

## Decision

Use a plugin architecture where each bank/service has its own parser module. Parsers can be added or updated without touching core code. Users select the bank before importing, or the app auto-detects the format.

## Considered Options

- **Monolithic parser with conditionals**: Single parser that detects format and branches — becomes a mess of if/else statements
- **Generic CSV parser with column mapping**: User maps columns to fields every time — defeats automation purpose
- **AI-based parser**: Use LLM to extract fields from any format — expensive, unreliable, requires internet

## Consequences

- **Maintainability**: Each parser is isolated — changes to one bank's format don't affect others
- **Extensibility**: Adding support for a new bank is a new module, not a modification to existing code
- **Testability**: Each parser can be tested independently with sample statements
- **Complexity**: Requires defining a parser interface and plugin registration mechanism
- **User experience**: Auto-detection or manual selection of bank before import
- **MVP scope**: Start with one bank parser, add others incrementally based on user demand
