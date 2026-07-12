# Room Database (Android's SQLite Abstraction)

The app uses Room as the local database, which is Android's official SQLite abstraction library.

## Context

The app needs persistent local storage for transactions, accounts, categories, vendors, budgets, and recurring templates. The database must be reliable, performant, and integrate well with Kotlin coroutines and reactive UI updates.

## Decision

Use Room (Android's SQLite abstraction) for local data storage. Room provides type-safe queries with compile-time verification, seamless Kotlin coroutines integration, and LiveData/Flow support for reactive UI updates.

## Considered Options

- **Raw SQLite**: Maximum control but requires more boilerplate, no compile-time query verification
- **ObjectBox**: NoSQL object database, faster performance, but less familiar and adds non-standard dependency
- **Realm**: Object-oriented database, easy to use, but larger footprint and less standard than Room
- **DataStore**: Good for simple key-value pairs but not suitable for complex relational data

## Consequences

- **Type safety**: Compile-time verification catches SQL errors before runtime
- **Kotlin integration**: Seamless coroutines support, Flow/LiveData for reactive updates
- **Standard**: Android's official recommendation — well-documented, widely used, long-term support
- **Performance**: SQLite under the hood provides reliable, battle-tested performance
- **Migration**: Built-in support for schema migrations with version tracking
- **Trade-off**: Slightly more verbose than NoSQL alternatives, but worth it for data integrity
- **Ecosystem**: Integrates with other Android architecture components (ViewModel, LiveData, etc.)
