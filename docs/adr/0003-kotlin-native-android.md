# Kotlin Native Android (Not Cross-Platform)

The app is built as a native Android application using Kotlin, not a cross-platform framework like Flutter or React Native.

## Context

Cross-platform frameworks (Flutter, React Native) allow building for both iOS and Android from a single codebase. This reduces development time and maintenance burden but adds abstraction layers and performance overhead.

## Decision

Build a native Android app using Kotlin. iOS support is out of scope for MVP.

## Considered Options

- **Flutter**: Single codebase for iOS + Android, good performance, but larger app size (~15-20MB) and less native feel
- **React Native**: Single codebase with JavaScript/TypeScript, native UI components, but bridge overhead and more complex debugging
- **Kotlin Multiplatform**: Share business logic but separate UI per platform — still requires iOS development

## Consequences

- **Performance**: Native performance with no bridge or abstraction overhead
- **Simplicity**: Single codebase, straightforward architecture, easier debugging
- **Ecosystem**: Full access to Android APIs, mature libraries (Room, ML Kit, MPAndroidChart)
- **Limitation**: Android-only — iOS users cannot use the app
- **AI-assisted development**: Kotlin has extensive training data, AI generates better code than Dart (Flutter)
- **App size**: Smaller than Flutter (~5-10MB vs 15-20MB)
