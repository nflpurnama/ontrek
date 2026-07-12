# No Notifications Principle

The app does not send any notifications — no reminders for unvalidated transactions, no alerts for upcoming recurring transactions, no budget warnings. Users open the app when they want to check their worth.

This decision is a deliberate deviation from standard app engagement patterns and is core to the "mirror, not wallet" philosophy. The app reflects the user's financial situation without trying to control or nag their behavior.

**Considered Options:**
- Daily reminders for unvalidated transactions — increases engagement, but feels paternalistic
- Notifications for upcoming recurring transactions — helpful, but adds noise
- Budget alerts when approaching limits — useful, but conflicts with "soft signal" principle
- All of the above — maximizes engagement, but violates mirror philosophy

**Consequences:**
- Lower user engagement metrics (no push to open app)
- Users must remember to check the app proactively
- Aligns with "mirror, not wallet" — app reflects, doesn't control
- Reduces notification fatigue — users aren't bombarded with alerts
- Simpler implementation — no notification scheduling or permission handling
- May require alternative discovery mechanisms (widgets, home screen shortcuts)
