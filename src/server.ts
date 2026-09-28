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
  "Show how to start zero-human company onboarding. This call does not create a company, send email, or mint a bootstrap token or an aa_ key. MCP requires a company API key (aa_...) or an MCP OAuth access token before any tool runs. Returns message, path (/api/agents/bootstrap), body (company_name and contact_email echoed), product, and keyPrefix. The unauthenticated REST POST to that path returns bootstrapToken, expiresIn 900 (about 15 minutes), and next billing paths, and it does not mint the aa_ key. After that REST call, POST /api/billing/machine-pay with the bootstrap token for an agent prepaid unlock, or POST /api/billing/checkout when a human will pay in the browser.",
  {
    company_name: z
      .string()
      .optional()
      .describe(
        "Optional display name echoed in body for POST /api/agents/bootstrap. This tool does not store it.",
      ),
    contact_email: z
      .string()
      .optional()
      .describe(
        "Optional contact email echoed in body. No message is sent.",
      ),
  },
  {
    title: "Show company bootstrap steps",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  async () => stub(),
);

server.tool(
  "budget_get",
  "Read remaining quotas and plan entitlement for the authenticated company. Call this when you need to know whether an active plan is in effect before registering OIDC clients or creating login links. Minting an API key does not require an active plan. Requires a company API key (aa_...) or an MCP OAuth access token. Returns planId, planStatus, periodYm, included, used, remaining, and hardCap. It does not change billing or charge a card. To start a human Pro checkout, use billing_checkout. billing_machine_pay only returns prepaid REST instructions. To manage an existing Stripe subscription, use billing_portal.",
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
  "Create a Stripe Checkout session for the authenticated company so a human can subscribe to Pro. Requires a company API key (aa_...) or an MCP OAuth access token. It does not accept a console session or a bootstrap token, and it does not mint a company or an aa_ secret. Returns url. Creating the session does not charge a card; the human pays on the Stripe page. When local billing bypass is enabled, there is no Stripe call and no charge: Pro is granted immediately with no period end, and url is the console success URL (/console?billing=ok), not a Stripe Checkout URL. If Stripe is not configured and bypass is off, the JSON includes error stripe_not_configured. For prepaid purchase instructions, use billing_machine_pay. To manage an existing subscription, use billing_portal.",
  {},
  {
    title: "Start Pro checkout",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  async () => stub(),
);

server.tool(
  "billing_machine_pay",
  "Return prepaid Pro purchase instructions. This tool does not charge a card, grant Pro, or return an aa_ secret. MCP requires a company API key (aa_...) or an MCP OAuth access token; a bootstrap token is not accepted on this call. Optional sku defaults to pro_prepaid_30d. On success, returns sku, amount (the live price), currency, periodDays, mppConfigured, action (POST /api/billing/machine-pay), agentSkus, and instructions. If MPP is not configured and local billing bypass is off, returns an error with code mpp_not_configured and does not grant Pro. An unknown sku returns invalid_sku. The REST POST /api/billing/machine-pay is what charges or grants: with MPP enabled it starts a prepaid charge and, only when the caller used a bootstrap token and the company has no API key yet, returns secret (aa_..., shown once) after settlement. With local billing bypass and MPP off, that REST call grants Pro for the SKU period with no Stripe charge and may return the same secret on the bootstrap path. Use billing_checkout for a human Stripe Checkout session.",
  {
    sku: z
      .string()
      .optional()
      .describe(
        "Optional prepaid plan id. When omitted, the server uses pro_prepaid_30d. That is the only accepted SKU. The tool response includes the live amount.",
      ),
  },
  {
    title: "Show prepaid Pro instructions",
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  },
  async () => stub(),
);

server.tool(
  "billing_portal",
  "Create a billing portal URL for the authenticated company. Use this when a human needs to update a payment method, view invoices, or change an existing subscription. Requires a company API key (aa_...) or an MCP OAuth access token. Returns url when Stripe is configured and the company has a Stripe customer. The call itself does not change the plan or charge a card. When local billing bypass is enabled, Stripe is not called and url is the console URL. If Stripe is not configured or the company has no Stripe customer, the JSON includes error stripe_not_configured. To buy Pro, use billing_checkout. billing_machine_pay only returns prepaid REST instructions.",
  {},
  {
    title: "Create billing portal URL",
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  },
  async () => stub(),
);

server.tool(
  "keys_create",
  "Mint an additional company API key. The full secret is returned once (only a hash is stored) and cannot be fetched again. An active plan is not required. Requires a company API key (aa_...) or an MCP OAuth access token. Returns id, secret, and prefix. Creating a key can be rate limited. Optional name is only a label. When name is omitted, the stored label is mcp.",
  {
    name: z
      .string()
      .optional()
      .describe(
        "Optional label stored with the new key. When omitted, the label is mcp. The server generates the secret and returns it once.",
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
  "Register an OIDC relying-party client that uses CorroborateMe as the identity provider, with RP-initiated logout enabled. Use this for your app's own OIDC login. MCP hosts connect through protected-resource metadata and dynamic client registration, not this tool. Requires a company API key (aa_...) or an MCP OAuth access token and an active plan. Returns clientId and, for a confidential client, clientSecret once (the secret prefix is aas_, not aa_). A missing subscription fails the tool with message subscription_required. Exhausted quota fails with message quota_exceeded. Too many registrations returns an error result with code rate_limited. Set public_client for a public PKCE client. If post_logout_redirect_uris is omitted, each redirect origin's / and /login are allowlisted.",
  {
    name: z.string().describe("Display name of the relying-party client."),
    redirect_uris: z
      .array(z.string())
      .describe(
        "Redirect URIs after sign-in. This field must be present. An empty array is stored.",
      ),
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
  "Store or replace an encrypted integration secret for a provider such as Google or Apple. Use this before login-link social sign-in needs that provider's credentials. Requires a company API key (aa_...) or an MCP OAuth access token and an active plan. Returns id and prefix (first four and last four characters of the secret). The full secret is not returned. The value is encrypted at rest. A later upsert with the same provider and the same label replaces that stored secret. A different label inserts another row. Each successful call consumes integration quota, including a repeat with the same secret. A missing subscription returns an error result with status 402 (subscription_required). Exhausted quota returns status 429 (quota_exceeded). Use integration_list to see which providers are already stored.",
  {
    provider: z
      .string()
      .describe(
        "Integration provider id, such as Google or Apple. Together with label, this selects the row to insert or replace.",
      ),
    label: z
      .string()
      .optional()
      .describe(
        "Optional label. When omitted, the stored label is an empty string. The same provider and label replaces the existing secret. A different label stores another secret.",
      ),
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
    idempotentHint: false,
    openWorldHint: false,
  },
  async () => stub(),
);

server.tool(
  "integration_list",
  "List this company's stored integrations. Use this to see which providers are configured before calling integration_upsert. Requires a company API key (aa_...) or an MCP OAuth access token. Returns a JSON array of id, provider, label, secret_prefix, meta, created_at, and rotated_at. Full secrets are never included. The call does not modify stored secrets.",
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
  "Mint a one-time human login URL and session id so you can prove an end user. Call webhook_allowlist_add first when using webhook, redirect, or form_post. Requires a company API key (aa_...) or an MCP OAuth access token and an active plan. A missing subscription returns an error result with code subscription_required (meter status 402). Exhausted quota returns code quota_exceeded (meter status 429). Too many creates can return code rate_limited. Returns ok, sessionId, loginUrl, expiresAt, methods, alwaysOn, and forceReauth. poll and sse are always included. Optional methods are webhook, redirect, post_message, and form_post. SMS is not offered. The default reuses the company cookie (Continue-as). Set force_reauth true, or reuse_session false, for a fresh login. When ttl_seconds is omitted, the link lasts 900 seconds. Poll with get_login_status using sessionId. If a webhook notify fails, use retry_login_webhook.",
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
        "Optional notify channels to add. poll and sse stay available even when this is omitted. If this is omitted, a provided webhook_url, redirect_uri, post_message_origin, or form_post_uri turns that channel on. There is no SMS method.",
      ),
    webhook_url: z
      .string()
      .optional()
      .describe(
        "URL that receives the signed webhook after login. It must match a prefix from webhook_allowlist_add. Use https (http only for localhost when the environment is local). Required when webhook is enabled.",
      ),
    redirect_uri: z
      .string()
      .optional()
      .describe(
        "Browser redirect after login, such as an https URL or a cursor:// deep link. It must match an allowlisted prefix. Required when redirect is enabled.",
      ),
    post_message_origin: z
      .string()
      .optional()
      .describe(
        "http(s) origin that should receive the agent_auth.login_completed postMessage. Required when post_message is enabled. It is not allowlisted. Production requires https except localhost.",
      ),
    form_post_uri: z
      .string()
      .optional()
      .describe(
        "http(s) URL that receives an unsigned browser form POST with session_id, status, user_id, email, and state. It must match an allowlisted prefix. Required when form_post is enabled. Production requires https except localhost. Custom schemes are rejected.",
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
      .describe(
        "Optional lifetime of the login link, in seconds. When omitted, the server uses 900 seconds. There is no maximum clamp.",
      ),
    force_reauth: z
      .boolean()
      .optional()
      .describe(
        "When true, require a fresh login. When false or omitted, the company cookie can be reused (Continue-as), unless reuse_session is false.",
      ),
    reuse_session: z
      .boolean()
      .optional()
      .describe(
        "When false, require a fresh login (same effect as force_reauth true). When true or omitted, it does not override force_reauth true. The tool result reports forceReauth, not this field.",
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
  "Poll one login-link session until the human finishes, and read any notify errors. Use this after create_login_link, passing that call's sessionId as session_id. Requires a company API key (aa_...) or an MCP OAuth access token. Returns id, status, state, user_id, email, claims, expires_at, completed_at, force_reauth, reuse_session, methods, notify_result, errors, poll, sse, and events_url. status is pending, completed, consumed, or expired. There is no done status. user_id (cu_...) and email are present when the person has finished and null while pending. A missing session returns null. It does not send a new notification. If webhook delivery failed, call retry_login_webhook.",
  {
    session_id: z
      .string()
      .describe("sessionId returned by create_login_link."),
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
  "Send the signed login webhook again for a session that already used the webhook method. A prior delivery failure is not required. The session must be completed or consumed. Delivery already tries up to 3 times (immediately, then after 500ms, then after 2000ms) on HTTP 408, 429, 5xx, and network errors, and it does not retry other 4xx responses. Call this for a further attempt. Requires a company API key (aa_...) or an MCP OAuth access token. Pass the sessionId from create_login_link as session_id. It POSTs the signed JSON again to the session webhook URL. The hex SHA-256 HMAC of the raw body is in X-Agent-Auth-Signature, and X-Agent-Auth-Attempt is also set. The payload type is agent_auth.login_completed and includes session_id, company_id, state, user_id, email, claims, and retry true. Returns ok, delivery, and errors, or ok false with code not_found, not_completed, no_webhook, or webhook_not_enabled. It does not mint a new login link. Redirect, post_message, and form_post do not use this tool.",
  {
    session_id: z
      .string()
      .describe(
        "sessionId from create_login_link whose webhook should be sent again. The session must be completed or consumed and must include a webhook URL.",
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
  "Allow a callback URL prefix for later login-link notify. Call this before create_login_link when methods include webhook, redirect, or form_post. Requires a company API key (aa_...) or an MCP OAuth access token. Pass url_prefix, at least 4 characters, for example https://hooks.example.com/ or cursor://. Returns ok true. Adding the same prefix again has no further effect. A shorter prefix returns ok false with code invalid_prefix. Callbacks outside an allowlisted prefix make create_login_link return an error with code not_allowlisted, or allowlist_empty when no prefix is stored. This call does not send a webhook.",
  {
    url_prefix: z
      .string()
      .describe(
        "URL prefix to allow, at least 4 characters. Use an https prefix for webhooks, redirects, and form posts, or a custom scheme such as cursor:// for deep links.",
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
