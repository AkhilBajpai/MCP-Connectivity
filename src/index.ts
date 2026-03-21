import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "enterprise-connector",
  version: "1.0.0",
});

server.tool("get_system_time", "Returns current UTC timestamp and timezone offset", {}, async () => {
  const now = new Date();
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({
          utc: now.toISOString(),
          unix: Math.floor(now.getTime() / 1000),
          offset: now.getTimezoneOffset(),
        }),
      },
    ],
  };
});

server.tool(
  "health_check",
  "Validates server availability and returns uptime metrics",
  { verbose: z.boolean().optional().describe("Include memory stats") },
  async ({ verbose }) => {
    const info: Record<string, unknown> = {
      status: "healthy",
      uptime_seconds: process.uptime(),
    };
    if (verbose) {
      const mem = process.memoryUsage();
      info.memory = {
        rss_mb: Math.round(mem.rss / 1048576),
        heap_used_mb: Math.round(mem.heapUsed / 1048576),
      };
    }
    return { content: [{ type: "text", text: JSON.stringify(info, null, 2) }] };
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
