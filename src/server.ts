/**
 * Schema stub for directory crawlers.
 *
 * This is not the hosted CorroborateMe MCP server. Tool names, descriptions,
 * and input shapes match production. Handlers only tell clients to use:
 *   https://corroborateme.com/mcp
 *   Authorization: Bearer aa_...  (or MCP OAuth via /.well-known/oauth-protected-resource)
 */
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const HOSTED_MCP = "https://corroborateme.com/mcp";

const stubMessage =
  "This repository is a catalog stub. Connect to " +
  HOSTED_MCP +
  " with Authorization: Bearer aa_... (mint a key at https://corroborateme.com) " +
  "or MCP OAuth (PRM: https://corroborateme.com/.well-known/oauth-protected-resource).";

function stub() {
  return {
    content: [{ type: "text" as const, text: stubMessage }],
  };
}

export const server = new McpServer({
  name: "corroborate-me",
  version: "0.1.0",
});

server.tool(
  "agent_bootstrap",
  "Start humanless company onboarding (returns bootstrap token flow info)",
  {
    company_name: z.string().optional(),
    contact_email: z.string().optional(),
  },
  async () => stub(),
);

server.tool(
  "budget_get",
  "Remaining quotas for the authenticated company",
  {},
  async () => stub(),
);

server.tool(
  "billing_checkout",
  "Create Stripe Checkout URL (or local bypass grant)",
  {},
  async () => stub(),
);

server.tool(
  "billing_machine_pay",
  "Agent prepaid unlock when MPP enabled / local bypass",
  {
    sku: z.string().optional(),
  },
  async () => stub(),
);

server.tool(
  "billing_portal",
  "Stripe Customer Portal URL",
  {},
  async () => stub(),
);

server.tool(
  "keys_create",
  "Mint a new aa_ API key (shown once)",
  {
    name: z.string().optional(),
  },
  async () => stub(),
);

server.tool(
  "oauth_client_create",
  "Register an OIDC relying-party client",
  {
    name: z.string(),
    redirect_uris: z.array(z.string()),
    public_client: z.boolean().optional(),
  },
  async () => stub(),
);

server.tool(
  "integration_upsert",
  "Store encrypted integration secret (Google/Apple/etc.)",
  {
    provider: z.string(),
    label: z.string().optional(),
    secret: z.string(),
  },
  async () => stub(),
);

server.tool(
  "integration_list",
  "List integrations (prefixes only, no secrets)",
  {},
  async () => stub(),
);

server.tool(
  "create_login_link",
  "Mint one-time human login URL. Choose notify methods: webhook, redirect, post_message, form_post (poll+sse always on). Default reuses company cookie (Continue-as); set force_reauth for fresh login. No SMS.",
  {
    methods: z
      .array(
        z.enum([
          "webhook",
          "redirect",
          "post_message",
          "form_post",
          "poll",
          "sse",
        ]),
      )
      .optional(),
    webhook_url: z.string().optional(),
    redirect_uri: z.string().optional(),
    post_message_origin: z.string().optional(),
    form_post_uri: z.string().optional(),
    state: z.string().optional(),
    ttl_seconds: z.number().optional(),
    force_reauth: z.boolean().optional(),
    reuse_session: z.boolean().optional(),
  },
  async () => stub(),
);

server.tool(
  "get_login_status",
  "Poll login-link session status (includes notify errors)",
  {
    session_id: z.string(),
  },
  async () => stub(),
);

server.tool(
  "retry_login_webhook",
  "Retry signed webhook delivery after a failed notify",
  {
    session_id: z.string(),
  },
  async () => stub(),
);

server.tool(
  "webhook_allowlist_add",
  "Allowlist a callback URL prefix (https webhooks/redirects or cursor:// deep links)",
  {
    url_prefix: z.string(),
  },
  async () => stub(),
);
