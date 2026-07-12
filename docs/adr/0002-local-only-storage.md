# Local-Only Storage with System-Encrypted Database

All user data is stored locally on the device with system-level encryption. No cloud sync, no server-side storage, no account system.

## Context

Personal finance apps typically offer cloud sync for backup and multi-device access. This requires servers, authentication, and ongoing infrastructure costs. For a personal net worth dashboard, the complexity may not be justified.

## Decision

Store all data locally on the device using Room (SQLite) with system-generated encryption keys stored in the device's secure enclave. No cloud sync for MVP. Users can backup via JSON export/import.

## Considered Options

- **Cloud sync with user accounts**: Enables multi-device access and automatic backup, but requires servers, authentication, and ongoing costs
- **Cloud sync with device-based auth**: Simpler than user accounts but still requires infrastructure
- **No encryption**: Simpler but exposes sensitive financial data if device is stolen

## Consequences

- **Privacy**: Financial data never leaves the device — maximum privacy
- **Simplicity**: No server infrastructure, no authentication, no sync conflicts
- **Cost**: Zero ongoing infrastructure costs
- **Limitation**: Users must manually export/import for backup or device migration
- **Risk**: Device loss means data loss (mitigated by JSON export feature)
- **Security**: System-level encryption protects data at rest without requiring user passwords
