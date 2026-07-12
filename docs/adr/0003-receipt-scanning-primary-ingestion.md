# Receipt Scanning as Primary Ingestion Instead of Manual Entry

Receipt scanning via OCR is the primary mechanism for recording transactions, with manual entry and statement imports as secondary options. The entire review flow (card stack interface, draft transactions, validation states) is designed around this primary ingestion method.

This decision prioritizes automation and reducing friction over simplicity of implementation. Users should be able to capture transactions quickly by photographing receipts, not manually typing every detail.

**Considered Options:**
- Manual entry as primary (simpler to implement, but high friction for users)
- Bank statement imports as primary (batch processing, but delayed and less granular)
- Equal weight to all ingestion methods (no primary, but less optimized UX)

**Consequences:**
- Requires OCR integration (ML Kit) and photo handling logic
- Review flow adds complexity (draft transactions, validation states, card stack UI)
- Users can capture transactions at the moment of purchase
- Reduces double-entry from multiple banking apps
- Photos stored temporarily and deleted after batch review to save storage
- OCR failures require graceful degradation (retry → partial results → manual entry)
