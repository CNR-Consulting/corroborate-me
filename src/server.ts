/**
 * Schema stub for directory crawlers.
 *
 * This is not the hosted CorroborateMe MCP server. Tool names and input
 * shapes match production. Descriptions describe that hosted behavior.
 * Handlers only tell clients to use:
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
  "Start zero-human company onboarding and return a short-lived bootstrap token (about 15 minutes). Call this first when you have no company API key. No credential is required, and no email is sent. Returns bootstrapToken, expiresIn, and the next billing steps. It does not mint the aa_ key. Call billing_machine_pay next for an agent prepaid unlock, or billing_checkout when a human will pay in the browser.",
  {
    company_name: z
      .string()
      .optional()
      .describe("Optional display name for the company being onboarded."),
    contact_email: z
      .string()
      .optional()
      .describe(
        "Optional contact email recorded on the company. No message is sent.",
      ),
  },
  {
    title: "Start company bootstrap",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  async () => stub(),
);

server.tool(
  "budget_get",
  "Read remaining quotas and plan entitlement for the authenticated company. Call this before minting keys, registering OIDC clients, or creating login links when you need to know whether Pro is active. Requires a company API key (aa_...) or an MCP OAuth access token. Returns the budget and entitlement. It does not change billing or charge a card. To unlock Pro, use billing_machine_pay (agent prepaid) or billing_checkout (human Checkout). To manage an existing Stripe subscription, use billing_portal.",
  {},
  {
    title: "Read company budget",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  async () => stub(),
);

server.tool(
  "billing_checkout",
  "Create a Stripe Checkout URL so a human can subscribe to Pro. Use this when a person will open a browser and pay, including right after agent_bootstrap. Accepts a console session, a company API key (aa_...), or the bootstrap token. Returns a Checkout url. On the bootstrap path it may also mint the company and an aa_ secret. Completing Checkout is a charge. When local billing bypass is enabled, there is no Stripe charge and the result is a bypass grant payload instead of a url. For an agent-only prepaid unlock, use billing_machine_pay. To manage an existing subscription, use billing_portal.",
  {},
  {
    title: "Create Stripe Checkout",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  async () => stub(),
);

server.tool(
  "billing_machine_pay",
  "Unlock prepaid Pro and return an aa_ API key when the unlock succeeds. Call this right after agent_bootstrap, sending the bootstrap token as the Bearer (this step uses that token; later tools use an aa_ key or MCP OAuth). Optional sku selects the plan; pass pro_prepaid_30d and read the live price from GET /api/config. If Stripe Machine Payments (MPP) is enabled, this starts a prepaid charge and returns secret (aa_..., shown once) after settlement. If local billing bypass is enabled, it grants Pro with no charge and may return the same secret. Use billing_checkout for a human Stripe Checkout page, and billing_portal to manage an existing subscription.",
  {
    sku: z
      .string()
      .optional()
      .describe(
        "Optional prepaid plan id. Pass pro_prepaid_30d for the documented 30-day Pro prepaid SKU. Read the live price from GET /api/config.",
      ),
  },
  {
    title: "Unlock prepaid Pro",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  async () => stub(),
);

server.tool(
  "billing_portal",
  "Create a Stripe Customer Portal URL for the authenticated company. Use this when a human needs to update a payment method, view invoices, or change an existing subscription. Requires a company API key (aa_...) or an MCP OAuth access token. Returns url. The call itself does not change the plan or charge a card. To buy Pro, use billing_checkout for a human Checkout page, or billing_machine_pay for an agent prepaid unlock.",
  {},
  {
    title: "Open Stripe customer portal",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  async () => stub(),
);

server.tool(
  "keys_create",
  "Mint an additional company API key. The full secret is returned once and cannot be fetched again. Use this when the company already has Pro and you need another aa_ key besides the one returned by billing_machine_pay. Requires a company API key (aa_...) or an MCP OAuth access token. Returns id, secret, and prefix. Creating a key can be rate limited. Optional name is only a label.",
  {
    name: z
      .string()
      .optional()
      .describe(
        "Optional label stored with the new key. The server generates the secret and returns it once.",
      ),
  },
  {
    title: "Mint API key",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  async () => stub(),
);

server.tool(
  "oauth_client_create",
  "Register an OIDC relying-party client that uses CorroborateMe as the identity provider, with RP-initiated logout enabled. Use this for your app's own OIDC login. MCP hosts connect through protected-resource metadata and dynamic client registration. Requires a company API key (aa_...) or an MCP OAuth access token. Returns the client. Confidential clients include clientSecret once. A missing subscription or exhausted quota returns 402. Set public_client for a public PKCE client. If post_logout_redirect_uris is omitted, each redirect origin's / and /login are allowlisted.",
  {
    name: z.string().describe("Display name of the relying-party client."),
    redirect_uris: z
      .array(z.string())
      .describe("Allowed redirect URIs after sign-in. At least one is required."),
    public_client: z
      .boolean()
      .optional()
      .describe(
        "Set true for a public client that uses PKCE, such as a SPA. Omit or false for a confidential client, which receives clientSecret once.",
      ),
    post_logout_redirect_uris: z
      .array(z.string())
      .optional()
      .describe(
        "Optional allowlist of post_logout_redirect_uri values for end-session. When omitted, each redirect origin's / and /login are used.",
      ),
  },
  {
    title: "Register OIDC client",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  async () => stub(),
);

server.tool(
  "integration_upsert",
  "Store or replace an encrypted integration secret for a provider such as Google or Apple. Use this before login-link social sign-in needs that provider's credentials. Requires a company API key (aa_...) or an MCP OAuth access token. Returns id and a secret prefix only. The full secret is not returned. The value is encrypted at rest, and a later upsert can replace the stored secret. Use integration_list to see which providers are already stored.",
  {
    provider: z
      .string()
      .describe("Integration provider id, such as Google or Apple."),
    label: z
      .string()
      .optional()
      .describe("Optional human-readable label for this integration."),
    secret: z
      .string()
      .describe(
        "Provider secret to encrypt and store. Later reads return only a prefix, not this value.",
      ),
  },
  {
    title: "Store integration secret",
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: true,
    openWorldHint: false,
  },
  async () => stub(),
);

server.tool(
  "integration_list",
  "List this company's stored integrations as ids and secret prefixes only. Use this to see which providers are configured before calling integration_upsert. Requires a company API key (aa_...) or an MCP OAuth access token. Returns integrations. Full secrets are never included. The call does not modify stored secrets.",
  {},
  {
    title: "List integrations",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  async () => stub(),
);

server.tool(
  "create_login_link",
  "Mint a one-time human login URL and session id so you can prove an end user. Call webhook_allowlist_add first when using webhook, redirect, or form_post. Requires a company API key (aa_...) or an MCP OAuth access token and an active Pro quota (402 when blocked). Returns session_id and login_url, plus methods and force_reauth. poll and sse are always available. Optional methods are webhook, redirect, post_message, and form_post. SMS is not offered. The default reuses the company cookie (Continue-as). Set force_reauth for a fresh login. reuse_session is the opposite of force_reauth. Poll with get_login_status. If a webhook notify fails, use retry_login_webhook.",
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
      .optional()
      .describe(
        "Optional notify channels to add. poll and sse stay available even when this is omitted. There is no SMS method.",
      ),
    webhook_url: z
      .string()
      .optional()
      .describe(
        "HTTPS URL that receives the signed webhook after login. It must match a prefix from webhook_allowlist_add.",
      ),
    redirect_uri: z
      .string()
      .optional()
      .describe(
        "Browser redirect after login, such as an https URL or a cursor:// deep link. It must match an allowlisted prefix.",
      ),
    post_message_origin: z
      .string()
      .optional()
      .describe(
        "Origin of the window that should receive the agent_auth.login_completed postMessage.",
      ),
    form_post_uri: z
      .string()
      .optional()
      .describe(
        "HTTPS URL that receives an unsigned form POST with session_id, status, user_id, email, and state. It must match an allowlisted prefix.",
      ),
    state: z
      .string()
      .optional()
      .describe(
        "Optional opaque string echoed back on status and notify payloads so you can correlate the session.",
      ),
    ttl_seconds: z
      .number()
      .optional()
      .describe("Optional lifetime of the login link, in seconds."),
    force_reauth: z
      .boolean()
      .optional()
      .describe(
        "When true, require a fresh login. When false or omitted, the company cookie can be reused (Continue-as).",
      ),
    reuse_session: z
      .boolean()
      .optional()
      .describe(
        "Alias for the opposite of force_reauth. True keeps the existing company cookie session.",
      ),
  },
  {
    title: "Create login link",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  },
  async () => stub(),
);

server.tool(
  "get_login_status",
  "Poll one login-link session until the human finishes, and read any notify errors. Use this after create_login_link, passing that call's session_id. Requires a company API key (aa_...) or an MCP OAuth access token. Returns status (documented states include pending and done), and when the person has finished includes user_id (cu_...) and email, plus notify_result and errors. It does not send a new notification. If a webhook notify failed, call retry_login_webhook.",
  {
    session_id: z
      .string()
      .describe("session_id returned by create_login_link."),
  },
  {
    title: "Poll login status",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  async () => stub(),
);

server.tool(
  "retry_login_webhook",
  "Send the signed login webhook again after a failed notify. Use this when get_login_status reports a webhook delivery error for a session that used the webhook method. The server already retries on HTTP 408, 429, and 5xx, so call this for a further attempt. Requires a company API key (aa_...) or an MCP OAuth access token. Pass the session_id from create_login_link. It POSTs the signed payload again (hex SHA-256 HMAC in X-Agent-Auth-Signature) to the allowlisted webhook URL and returns the retry result. It does not mint a new login link. Redirect, post_message, and form_post do not use this tool.",
  {
    session_id: z
      .string()
      .describe(
        "session_id from create_login_link whose failed webhook delivery should be sent again.",
      ),
  },
  {
    title: "Retry login webhook",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  async () => stub(),
);

server.tool(
  "webhook_allowlist_add",
  "Allow a callback URL prefix for later login-link notify. Call this before create_login_link when methods include webhook, redirect, or form_post. Requires a company API key (aa_...) or an MCP OAuth access token. Pass url_prefix, for example https://hooks.example.com/ or cursor://. Returns an allowlisted result. Callbacks outside an allowlisted prefix fail create_login_link with 400. Adding the same prefix again has no further effect. This call does not send a webhook.",
  {
    url_prefix: z
      .string()
      .describe(
        "URL prefix to allow. Use an https prefix for webhooks, redirects, and form posts, or cursor:// for deep links.",
      ),
  },
  {
    title: "Allowlist callback prefix",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  async () => stub(),
);
