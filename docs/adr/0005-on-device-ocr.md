# On-Device OCR Instead of Cloud OCR

Receipt scanning uses Google ML Kit for text recognition, processed entirely on the device. No internet connection is required, and no cloud OCR services are used.

This decision prioritizes user privacy, offline functionality, and cost control over OCR accuracy. On-device processing aligns with the local-only principle and eliminates ongoing API costs.

**Considered Options:**
- Cloud-based OCR (Google Cloud Vision, AWS Textract) — more accurate, but requires internet and incurs per-scan costs
- Hybrid approach (on-device first, fall back to cloud for low confidence) — more complex, but balances accuracy and privacy
- Specialized receipt scanning services (Veryfi, Taggun) — optimized for receipts, but expensive and cloud-dependent

**Consequences:**
- No internet required — app works completely offline
- No ongoing API costs per scan
- OCR accuracy may be lower than cloud services, especially for complex receipts
- Aligns with local-only principle — financial data never leaves the device
- Requires graceful degradation for OCR failures (retry → partial results → manual entry)
- Indonesian receipt formats may require additional training or post-processing
