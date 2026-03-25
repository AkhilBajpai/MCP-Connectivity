interface FieldSelection {
  name: string;
  fields?: FieldSelection[];
}

interface QueryParams {
  operation: string;
  fields: FieldSelection[];
  args?: Record<string, string | number | boolean>;
  limit?: number;
}

function renderFields(fields: FieldSelection[], depth: number): string {
  const indent = "  ".repeat(depth);
  return fields
    .map((f) => {
      if (f.fields && f.fields.length > 0) {
        const nested = renderFields(f.fields, depth + 1);
        return `${indent}${f.name} {\n${nested}\n${indent}}`;
      }
      return `${indent}${f.name}`;
    })
    .join("\n");
}

function renderArgs(args: Record<string, string | number | boolean>): string {
  const parts = Object.entries(args).map(([k, v]) => {
    if (typeof v === "string") return `${k}: "${v}"`;
    return `${k}: ${v}`;
  });
  return parts.length > 0 ? `(${parts.join(", ")})` : "";
}

export function buildQuery(params: QueryParams): string {
  const args = params.args ? renderArgs(params.args) : "";
  const limitArg = params.limit ? `first: ${params.limit}` : "";
  const combinedArgs = [args.slice(1, -1), limitArg].filter(Boolean).join(", ");
  const argStr = combinedArgs ? `(${combinedArgs})` : "";
  const body = renderFields(params.fields, 2);
  return `query {\n  ${params.operation}${argStr} {\n${body}\n  }\n}`;
}

// Schema registry — maps entity names to available fields
const SCHEMA_MAP: Record<string, FieldSelection[]> = {
  products: [
    { name: "id" },
    { name: "title" },
    { name: "handle" },
    { name: "priceRange", fields: [{ name: "minVariantPrice", fields: [{ name: "amount" }, { name: "currencyCode" }] }] },
    { name: "createdAt" },
  ],
  orders: [
    { name: "id" },
    { name: "name" },
    { name: "totalPriceSet", fields: [{ name: "shopMoney", fields: [{ name: "amount" }, { name: "currencyCode" }] }] },
    { name: "createdAt" },
  ],
  issues: [
    { name: "id" },
    { name: "title" },
    { name: "state" },
    { name: "assignees", fields: [{ name: "nodes", fields: [{ name: "login" }] }] },
    { name: "createdAt" },
  ],
};

export function resolveSchema(entity: string): FieldSelection[] | null {
  return SCHEMA_MAP[entity.toLowerCase()] ?? null;
}
