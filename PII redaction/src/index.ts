import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { RedactionEngine } from "./redaction/engine.js";

const engine = new RedactionEngine();

const server = new McpServer({
  name: "mcp-redaction-layer",
  version: "1.0.0",
});

server.tool(
  "redact_text",
  "Strips PII from input text, returning sanitized output with placeholders",
  {
    text: z.string().describe("Raw text potentially containing PII"),
  },
  async ({ text }) => {
    const result = engine.redact(text);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            redacted: result.text,
            placeholder_count: result.replacements.size,
          }),
        },
      ],
    };
  }
);

server.tool(
  "scan_for_pii",
  "Scans text and reports detected PII categories without modifying the input",
  {
    text: z.string(),
  },
  async ({ text }) => {
    const result = engine.redact(text);
    const categories = new Set<string>();
    for (const key of result.replacements.keys()) {
      const match = key.match(/^\[([A-Z_]+)_\d+\]$/);
      if (match) categories.add(match[1]);
    }
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            contains_pii: result.replacements.size > 0,
            categories: Array.from(categories),
            detection_count: result.replacements.size,
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
