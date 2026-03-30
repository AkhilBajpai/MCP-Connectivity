# Day 5 — PII Redaction and Tokenization Layer

Middleware for MCP servers that intercepts tool responses and strips
personally identifiable information before it reaches the LLM context.

## Detection Categories

- Email addresses
- Phone numbers (US format)
- Social Security Numbers
- Credit card numbers
- IPv4 addresses
- AWS access key IDs

## Design Decisions

- **Deterministic placeholders** — the same PII value always maps to the same
  placeholder within a session, preserving referential integrity.
- **Rehydration support** — downstream systems can restore originals when
  the redacted response needs to be forwarded to a secure sink.
- **Stateless between resets** — call `reset()` between conversations to
  prevent cross-session leakage of the placeholder map.

## Testing

```bash
npm install && npm test
```
