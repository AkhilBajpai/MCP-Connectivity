import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { searchCatalog, listDomains, getToolsByDomain } from "./registry/tool_catalog.js";

const server = new McpServer({
  name: "mcp-progressive-tools",
  version: "1.0.0",
});

// The only tool exposed in the initial handshake — everything else is discovered through it
server.tool(
  "discover_tools",
  "Search or browse available tools by domain or keyword. Start here to find the right tool for a task.",
  {
    query: z.string().optional().describe("Keyword search across tool names, domains, and descriptions"),
    domain: z.string().optional().describe("Filter by domain (crm, devops, messaging, etc.)"),
    list_domains: z.boolean().optional().describe("Set true to list all available domains"),
  },
  async ({ query, domain, list_domains: showDomains }) => {
    if (showDomains) {
      const domains = listDomains();
      return {
        content: [{ type: "text", text: JSON.stringify({ available_domains: domains }, null, 2) }],
      };
    }

    if (domain) {
      const tools = getToolsByDomain(domain);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { domain, tools: tools.map((t) => ({ name: t.name, description: t.description })) },
              null,
              2
            ),
          },
        ],
      };
    }

    if (query) {
      const results = searchCatalog(query);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { query, matches: results.map((t) => ({ name: t.name, domain: t.domain, description: t.description })) },
              null,
              2
            ),
          },
        ],
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            hint: "Provide a query, domain, or set list_domains to true.",
            domains: listDomains(),
          }),
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
