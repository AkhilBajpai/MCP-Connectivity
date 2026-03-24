import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { GitHubClient } from "./github/client.js";

const gh = new GitHubClient(process.env.GITHUB_PAT ?? "");

const server = new McpServer({
  name: "mcp-github-tools",
  version: "1.0.0",
});

server.tool(
  "list_repositories",
  "List public repositories for a GitHub user, sorted by last update",
  {
    owner: z.string().describe("GitHub username"),
    page: z.number().int().positive().optional(),
  },
  async ({ owner, page }) => {
    const repos = await gh.listRepos(owner, page ?? 1);
    const summary = repos.map((r: Record<string, unknown>) => ({
      name: r.name,
      description: r.description,
      stars: r.stargazers_count,
      language: r.language,
      updated: r.updated_at,
    }));
    return { content: [{ type: "text", text: JSON.stringify(summary, null, 2) }] };
  }
);

server.tool(
  "get_file_content",
  "Retrieve the content of a single file from a GitHub repository",
  {
    owner: z.string(),
    repo: z.string(),
    path: z.string().describe("File path relative to repo root"),
  },
  async ({ owner, repo, path }) => {
    const content = await gh.getFileContent(owner, repo, path);
    return { content: [{ type: "text", text: content.slice(0, 8000) }] };
  }
);

server.tool(
  "search_code",
  "Search for code across GitHub repositories",
  {
    query: z.string().describe("Search query (GitHub code-search syntax)"),
    owner: z.string().optional().describe("Restrict to a specific user"),
  },
  async ({ query, owner }) => {
    const result = await gh.searchCode(query, owner);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            { total: result.total_count, items: result.items.slice(0, 10) },
            null,
            2
          ),
        },
      ],
    };
  }
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  process.stderr.write(`Fatal: ${err}\n`);
  process.exit(1);
});
