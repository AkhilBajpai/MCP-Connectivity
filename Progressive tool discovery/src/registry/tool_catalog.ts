export interface ToolMetadata {
  name: string;
  domain: string;
  description: string;
  tags: string[];
}

// Simulated catalog — in production this would be backed by a database or config file
const CATALOG: ToolMetadata[] = [
  { name: "salesforce_query", domain: "crm", description: "Run SOQL queries against Salesforce", tags: ["crm", "salesforce", "query"] },
  { name: "salesforce_create_lead", domain: "crm", description: "Create a new lead in Salesforce", tags: ["crm", "salesforce", "write"] },
  { name: "jira_list_issues", domain: "project_management", description: "List Jira issues by project and status", tags: ["jira", "issues", "read"] },
  { name: "jira_create_ticket", domain: "project_management", description: "Create a Jira ticket with fields", tags: ["jira", "tickets", "write"] },
  { name: "snowflake_run_sql", domain: "data_warehouse", description: "Execute SQL on Snowflake", tags: ["snowflake", "sql", "query"] },
  { name: "snowflake_list_tables", domain: "data_warehouse", description: "List tables in a Snowflake schema", tags: ["snowflake", "metadata", "read"] },
  { name: "slack_send_message", domain: "messaging", description: "Post a message to a Slack channel", tags: ["slack", "messaging", "write"] },
  { name: "slack_search_messages", domain: "messaging", description: "Search message history in Slack", tags: ["slack", "messaging", "read"] },
  { name: "github_create_pr", domain: "devops", description: "Open a pull request on GitHub", tags: ["github", "pr", "write"] },
  { name: "github_list_workflows", domain: "devops", description: "List GitHub Actions workflows", tags: ["github", "ci", "read"] },
  { name: "confluence_get_page", domain: "documentation", description: "Retrieve a Confluence page by ID", tags: ["confluence", "docs", "read"] },
  { name: "confluence_search", domain: "documentation", description: "Search Confluence spaces", tags: ["confluence", "docs", "search"] },
];

export function searchCatalog(query: string): ToolMetadata[] {
  const q = query.toLowerCase();
  return CATALOG.filter(
    (t) =>
      t.name.includes(q) ||
      t.domain.includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.includes(q))
  );
}

export function listDomains(): string[] {
  return [...new Set(CATALOG.map((t) => t.domain))];
}

export function getToolsByDomain(domain: string): ToolMetadata[] {
  return CATALOG.filter((t) => t.domain === domain);
}
