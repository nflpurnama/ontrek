# Receipt Scanning as Primary Ingestion Method

The app uses receipt scanning (OCR) as the primary method for capturing transactions, with statement imports and manual entry as secondary options. This decision shapes the core user experience and data flow.

## Context

Users need a fast, low-friction way to record transactions. Manual entry is tedious and error-prone. Statement imports work but require users to wait for bank statements. Receipt scanning captures transactions in real-time, immediately after purchase.

## Decision

Use on-device OCR (Google ML Kit) for receipt scanning as the primary ingestion method. Photos are stored temporarily during review and deleted after the entire batch is validated to save storage.

## Considered Options

- **Cloud-based OCR (Google Cloud Vision, AWS Textract)**: More accurate but requires internet, adds latency, and incurs per-scan costs
- **Specialized receipt scanning services (Veryfi, Taggun)**: Purpose-built for receipts but expensive and overkill for MVP
- **Manual entry only**: Simple but tedious, leads to user abandonment

## Consequences

- **Privacy**: On-device processing aligns with local-only principle — no financial data leaves the device
- **Cost**: No per-scan fees, scales infinitely with usage
- **Offline**: Works without internet connection
- **Accuracy**: ML Kit is good but not perfect — graceful degradation path (retry → partial results → manual entry) handles failures
- **Storage**: Temporary photo storage requires cleanup logic after batch review
