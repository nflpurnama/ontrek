# Kotlin Native (Android Only) Instead of Cross-Platform

We chose to build Ontrek as a native Android application using Kotlin, rather than using a cross-platform framework like Flutter or React Native. iOS support is out of scope for MVP.

This decision prioritizes architectural simplicity, best performance, and straightforward debugging over cross-platform reach. Native Kotlin provides the simplest architecture with no bridge overhead, no rendering engine abstraction, and direct access to all Android APIs.

**Considered Options:**
- Flutter (cross-platform, single codebase, but larger app size and less native feel)
- React Native (cross-platform, JavaScript ecosystem, but bridge overhead and more complex debugging)
- Kotlin Multiplatform (share business logic, but still need separate UI layers)

**Consequences:**
- iOS users cannot use the app until a separate iOS codebase is built
- Simpler architecture with fewer abstraction layers
- Better performance and easier debugging
- Smaller app size (~5MB vs ~15MB for Flutter)
- AI-generated code benefits from larger Kotlin/Android training data
