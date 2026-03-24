# Day 3 — GitHub Repository Tooling Server

An MCP server that exposes GitHub operations — listing repos, reading files,
and searching code — as callable tools for any MCP client.

## Tools

| Tool | Description |
|------|-------------|
| `list_repositories` | List repos for a user, sorted by update time |
| `get_file_content` | Fetch raw content of a file from any public repo |
| `search_code` | Full-text code search across GitHub |

## Rate Limiting

The client tracks the `x-ratelimit-remaining` header and automatically backs off
when approaching the limit, avoiding 403 errors during heavy usage.

## Setup

```bash
export GITHUB_PAT=ghp_...
npm install && npm run build && npm start
```
