import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { OAuth2ClientCredentials } from "./auth/index.js";

const oauth = new OAuth2ClientCredentials({
  tokenUrl: process.env.OAUTH_TOKEN_URL ?? "https://auth.example.com/oauth/token",
  clientId: process.env.OAUTH_CLIENT_ID ?? "",
  clientSecret: process.env.OAUTH_CLIENT_SECRET ?? "",
  scope: process.env.OAUTH_SCOPE,
});

const server = new McpServer({
  name: "mcp-auth-connector",
  version: "1.0.0",
});

server.tool(
  "authenticated_fetch",
  "Performs a GET request against a secured API using managed OAuth2 tokens",
  {
    url: z.string().url().describe("Target endpoint URL"),
    headers: z.record(z.string()).optional().describe("Additional headers"),
  },
  async ({ url, headers }) => {
    const token = await oauth.getToken();
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...headers,
      },
    });

    const body = await res.text();
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ status: res.status, body: body.slice(0, 4000) }),
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
