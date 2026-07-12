# Card Stack Interface for Draft Transaction Review

Draft transactions are reviewed using a card stack interface (swipe through one at a time) rather than a list view.

## Context

After OCR extraction or statement import, users need to review and validate draft transactions before they become finalized. The review flow needs to be fast, focused, and mobile-optimized. Users may have 5-20 drafts to review at once.

## Decision

Use a card stack interface where users swipe through draft transactions one at a time. Swipe right to validate, swipe left to skip. This provides a focused, sequential review experience optimized for quick decision-making on mobile.

## Considered Options

- **List view with tap-to-edit**: See all drafts in a scrollable list, tap each to edit — requires more taps, less focused
- **Split view (list + detail)**: List on left, details on right — good for tablets but over-engineered for mobile
- **Inline editing in transaction list**: Edit drafts directly in the main transaction list — mixes draft and validated transactions, confusing

## Consequences

- **Focus**: One transaction at a time reduces cognitive load and decision fatigue
- **Speed**: Swipe gestures are faster than tap-edit-save cycles
- **Mobile-first**: Optimized for thumb interaction on small screens
- **Trade-off**: Users can't see all drafts at once or batch-edit multiple drafts
- **Mitigation**: Yellow icon on unvalidated drafts provides visual indicator in main transaction list
- **Pattern familiarity**: Matches popular mobile app patterns (Tinder-style swipe)
