# MVI Architecture (Not Clean Architecture)

The app uses MVI (Model-View-Intent) pattern for state management without the full Clean Architecture layering.

## Context

Enterprise Android apps typically use Clean Architecture with multiple layers (presentation, domain, data) for separation of concerns and testability. This adds boilerplate but scales well for large teams. MVI provides unidirectional data flow with less overhead.

## Decision

Use MVI pattern for state management in ViewModels. Skip Clean Architecture layers (repositories, use cases, DTOs) for MVP. Can be refactored later if the app grows.

## Considered Options

- **Clean Architecture with MVVM**: Industry standard for enterprise apps, highly testable, but 2-3x more files and slower initial development
- **MVI + Clean Architecture**: Best of both worlds but maximum complexity for MVP
- **MVVM only**: Simpler than MVI but less predictable state management

## Consequences

- **Speed**: Faster MVP development — fewer files, less abstraction
- **Predictability**: Unidirectional data flow makes state changes traceable and debuggable
- **Simplicity**: Single developer can move quickly without navigating multiple layers
- **Trade-off**: Less separation of concerns — business logic may leak into ViewModels
- **Future**: Can refactor to Clean Architecture later if the app grows into a team or product
- **AI-assisted development**: Simpler structure is easier for AI to generate and maintain
