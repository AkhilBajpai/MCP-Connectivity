import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { buildQuery, resolveSchema } from "./graphql/query_builder.js";

const server = new McpServer({
  name: "mcp-graphql-connector",
  version: "1.0.0",
});

server.tool(
  "graphql_query",
  "Build and execute a GraphQL query against a configured endpoint",
  {
    entity: z.string().describe("Top-level entity to query (products, orders, issues)"),
    fields: z.array(z.string()).optional().describe("Specific field names to select"),
    limit: z.number().int().positive().max(100).optional(),
  },
  async ({ entity, fields, limit }) => {
    const schema = resolveSchema(entity);
    if (!schema) {
      return { content: [{ type: "text", text: `Unknown entity: ${entity}` }] };
    }

    const selectedFields = fields
      ? schema.filter((f) => fields.includes(f.name))
      : schema;

    if (selectedFields.length === 0) {
      return { content: [{ type: "text", text: "No matching fields found in schema." }] };
    }

    const query = buildQuery({
      operation: entity,
      fields: selectedFields,
      limit: limit ?? 10,
    });

    const endpoint = process.env.GRAPHQL_ENDPOINT;
    if (!endpoint) {
      return { content: [{ type: "text", text: `Generated query:\n${query}\n\nSet GRAPHQL_ENDPOINT to execute.` }] };
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GRAPHQL_TOKEN ?? ""}`,
      },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2).slice(0, 6000) }] };
  }
);

server.tool(
  "list_schemas",
  "List all registered entity schemas and their available fields",
  {},
  async () => {
    const entities = ["products", "orders", "issues"];
    const info = entities.map((e) => ({
      entity: e,
      fields: resolveSchema(e)?.map((f) => f.name) ?? [],
    }));
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
