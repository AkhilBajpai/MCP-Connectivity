# Day 1 — MCP Server Architecture

Foundation of a Model Context Protocol server built with the official TypeScript SDK.

## What This Covers

- MCP server initialisation via STDIO transport
- Tool registration pattern using Zod schema validation
- Two baseline tools: `get_system_time` and `health_check`

## Quick Start

```bash
npm install
npm run build
npm start
```

The server communicates over STDIO — connect it to any MCP-compatible client
(Claude Desktop, custom agent, etc.) by pointing the client config at the built binary.

## Architecture

```
src/
  index.ts   — server bootstrap + tool definitions
```

Subsequent days extend this with auth, dynamic discovery, and domain-specific tools.
