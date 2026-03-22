# Day 2 — Authenticated MCP Tool-Use

Extends the MCP server with an OAuth2 Client Credentials module that manages
the full token lifecycle: request, cache, and automatic refresh.

## Key Concepts

- **Token caching** with a 60-second pre-expiry buffer to avoid mid-request failures
- **Environment-driven config** — secrets stay outside the codebase
- **`authenticated_fetch`** tool that any MCP client can invoke for secured API calls

## Setup

```bash
cp .env.example .env
# fill in real credentials
npm install && npm run build && npm start
```
