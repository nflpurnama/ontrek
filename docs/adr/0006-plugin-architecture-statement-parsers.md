# Plugin Architecture for Statement Parsers

Statement parsers use a plugin architecture where each bank or service has its own parser module that can be added or updated independently without touching core code. Users select their bank before importing, and the app uses the corresponding parser.

This decision prioritizes extensibility and maintainability over a simpler monolithic parser. As support for more banks is added, each parser can evolve independently without risking regressions in others.

**Considered Options:**
- Monolithic parser (one parser that detects format and handles all banks) — simpler initially, but becomes a mess of conditionals as banks are added
- Generic CSV parser with column mapping UI — flexible, but defeats the purpose of automation (users must map columns every time)
- Single parser per format (PDF parser, CSV parser) — doesn't account for format variations between banks

**Consequences:**
- Easy to add support for new banks without modifying existing parsers
- Each parser can be tested and updated independently
- Users must know which bank their statement is from (can't auto-detect)
- Parser failures are isolated to specific banks
- Initial development requires defining a parser interface/contract
- MVP starts with one bank, others added incrementally
