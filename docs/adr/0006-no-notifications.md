# No Notifications

The app does not send any notifications — no reminders for unvalidated transactions, no alerts for upcoming recurring transactions, no budget warnings.

## Context

Most finance apps use notifications to remind users to log expenses, warn about budget overruns, or alert about upcoming bills. This drives engagement but can feel intrusive and paternalistic.

## Decision

No notifications of any kind. Users open the app when they want to check their net worth. The app is a mirror, not a nag.

## Considered Options

- **Daily reminders for unvalidated transactions**: Encourages validation but feels like a nag
- **Upcoming recurring transaction alerts**: Helpful but adds notification fatigue
- **Budget overrun warnings**: Useful but conflicts with "mirror, not wallet" philosophy
- **User-configurable notifications**: Adds complexity and settings UI

## Consequences

- **Philosophy alignment**: Reinforces "mirror, not wallet" — app reflects reality, doesn't try to control behavior
- **User trust**: No notification fatigue, users don't feel monitored
- **Simplicity**: No notification permissions, no background services, no notification UI
- **Trade-off**: Users might forget to validate transactions or check upcoming bills
- **Mitigation**: Yellow icon on unvalidated transactions provides soft visual signal when user opens app
