# Day 4 — GraphQL Integration for Sparse Data Retrieval

An MCP server that constructs minimal GraphQL queries from a schema registry,
fetching only the fields the agent needs to conserve context-window tokens.

## Why Sparse Retrieval Matters

REST endpoints return entire objects. When an agent only needs `title` and `price`
from a product, the remaining 30 fields waste tokens and increase latency.
This server resolves that by building targeted queries against a known schema.

## Tools

| Tool | Description |
|------|-------------|
| `graphql_query` | Build + execute a GraphQL query for a registered entity |
| `list_schemas` | Inspect available entities and their field definitions |

## Setup

```bash
export GRAPHQL_ENDPOINT=https://...
export GRAPHQL_TOKEN=...
npm install && npm run build && npm start
```
