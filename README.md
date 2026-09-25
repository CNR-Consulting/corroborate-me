# CorroborateMe

**Prove end users to agents and apps.**

[![Remote MCP](https://img.shields.io/badge/MCP-remote-555?style=flat-square)](https://corroborateme.com/mcp)
[![Transport](https://img.shields.io/badge/transport-streamable--http-0ea5e9?style=flat-square)](https://modelcontextprotocol.io)
[![Auth](https://img.shields.io/badge/auth-Bearer%20aa__%20or%20OAuth-111?style=flat-square)](https://corroborateme.com)
[![License: MIT](https://img.shields.io/badge/license-MIT-green?style=flat-square)](./LICENSE)

CorroborateMe gives agents and apps company API keys and human login-links with multi-channel notify so they can prove who the end user is - plus OIDC client registration, integration secrets, and budget-aware billing. REST is first-class; MCP is optional.

**Live endpoint:** [`https://corroborateme.com/mcp`](https://corroborateme.com/mcp)

> This repository is the **public catalog and schema stub** for directory crawlers. It is not the hosted server. Point MCP clients at the live URL above with a CorroborateMe API key (`aa_...`) **or** use MCP OAuth (PRM at [/.well-known/oauth-protected-resource](https://corroborateme.com/.well-known/oauth-protected-resource)). Running the TypeScript in this repo does not authenticate users or store secrets.

**Agent guide:** see [AGENTS.md](./AGENTS.md) for discovery URLs, auth, and MCP connect snippets.

## Get an API key

### Zero-human (agents)

1. `POST https://corroborateme.com/api/agents/bootstrap` with optional `{ "company_name": "...", "contact_email": "agent@example.com" }` -> bootstrap token (no outbound mail).
2. `POST https://corroborateme.com/api/billing/machine-pay` with `Authorization: Bearer <bootstrapToken>` and optional `{ "sku": "pro_prepaid_30d" }`.
3. Settle Stripe MPP when enabled (see live `GET /api/config` for amounts) -> response includes `secret` (`aa_...`) when unlock succeeds.

See [llms.txt](https://corroborateme.com/llms.txt) and [llms-full.txt](https://corroborateme.com/llms-full.txt). Legal: [Terms](https://corroborateme.com/terms) · [Privacy](https://corroborateme.com/privacy).

### Human path

1. Open [corroborateme.com](https://corroborateme.com) and create an account.
2. Subscribe on [Pricing](https://corroborateme.com/pricing), then mint an API key in the console. Secrets start with `aa_`.
3. Use the company key for REST and MCP.

Never commit a real key. Use the `aa_...` placeholder in configs.

## Connect a client

Transport is **Streamable HTTP**. Authenticate with either:

- `Authorization: Bearer aa_...` (API key from console or bootstrap + machine-pay), or
- **MCP OAuth** - host discovers PRM at [/.well-known/oauth-protected-resource](https://corroborateme.com/.well-known/oauth-protected-resource), registers via DCR, and obtains an access token for `https://corroborateme.com/mcp`

### Cursor

#### Install via Cursor Marketplace (plugin)

This repo includes a [Cursor plugin manifest](.cursor-plugin/plugin.json) and root [`mcp.json`](mcp.json) for one-click install from the [Cursor Marketplace](https://cursor.com/marketplace/publish).

1. Install the **CorroborateMe** plugin from the marketplace (or clone this repo for local plugin testing).
2. Open **Cursor Settings -> Customize -> CorroborateMe** and set **CorroborateMe API key** (`aa_...` from bootstrap + machine-pay or the console).
3. Reload the window. MCP tools should appear under the CorroborateMe server.

The plugin points at `https://corroborateme.com/mcp` with `Authorization: Bearer ${CORROBORATE_ME_API_KEY}`. Never commit a real key.

Submit the public repo at [cursor.com/marketplace/publish](https://cursor.com/marketplace/publish) when ready.

#### Manual MCP config

User or project MCP config:

```json
{
  "mcpServers": {
    "corroborate-me": {
      "url": "https://corroborateme.com/mcp",
      "headers": {
        "Authorization": "Bearer aa_..."
      }
    }
  }
}
```

### Claude Desktop / Claude Code

```json
{
  "mcpServers": {
    "corroborate-me": {
      "command": "npx",
      "args": ["mcp-remote", "https://corroborateme.com/mcp", "--header", "Authorization: Bearer aa_..."]
    }
  }
}
```

### Generic remote MCP

```json
{
  "url": "https://corroborateme.com/mcp",
  "headers": {
    "Authorization": "Bearer aa_..."
  }
}
```

Discovery manifests on the product host:

- [/.well-known/mcp.json](https://corroborateme.com/.well-known/mcp.json)
- [/.well-known/oauth-protected-resource](https://corroborateme.com/.well-known/oauth-protected-resource) (MCP OAuth)
- [/llms.txt](https://corroborateme.com/llms.txt)
- [/openapi.json](https://corroborateme.com/openapi.json)

## Tools

Schemas in [`src/server.ts`](src/server.ts) match the hosted server.

| Tool | What it does |
|------|----------------|
| `agent_bootstrap` | Start humanless company onboarding (bootstrap token flow) |
| `budget_get` | Remaining quotas for the authenticated company |
| `billing_checkout` | Create Stripe Checkout URL for human Pro |
| `billing_machine_pay` | Agent prepaid unlock via Stripe MPP (`sku` optional) |
| `billing_portal` | Stripe Customer Portal URL |
| `keys_create` | Mint a new `aa_` API key (shown once) |
| `oauth_client_create` | Register an OIDC relying-party client (RP logout enabled; optional post-logout URIs) |
| `integration_upsert` | Store encrypted integration secret (Google/Apple/etc.) |
| `integration_list` | List integrations (prefixes only, no secrets) |
| `create_login_link` | Mint one-time human login URL with notify methods |
| `get_login_status` | Poll login-link session status |
| `retry_login_webhook` | Retry signed webhook delivery after a failed notify |
| `webhook_allowlist_add` | Allowlist a callback URL prefix |

## Typical agent loop

1. Bootstrap a company (`agent_bootstrap`) and unlock prepaid Pro (`billing_machine_pay`) when needed.
2. Mint a key with `keys_create` if you need a durable `aa_...` secret.
3. Allowlist callback prefixes (`webhook_allowlist_add`), then `create_login_link` for human proof.
4. Poll with `get_login_status` (or wait for webhook / redirect / postMessage).
5. Use REST or MCP for keys, OIDC clients, and integrations as needed.

Prefer live [docs](https://corroborateme.com/docs) and [llms-full.txt](https://corroborateme.com/llms-full.txt) for recipes that may change.

## Auth and errors

- **401** - missing or invalid Authorization (API key `aa_...` or MCP OAuth access token)
- **402 / 429** - plan or quota; follow machine-readable actions from the live API
- Pricing amounts: read live `GET /api/config` - do not hardcode dollars as eternal truth (at time of writing: Pro $5.99/mo, agent prepaid Pro $5.99 per 30 days)

## Product docs

- App: [corroborateme.com](https://corroborateme.com)
- Docs: [corroborateme.com/docs](https://corroborateme.com/docs)
- OpenAPI: [corroborateme.com/openapi.json](https://corroborateme.com/openapi.json)
- Swagger: [corroborateme.com/swagger](https://corroborateme.com/swagger)

The CorroborateMe product (Worker, billing, IdP) is closed source. This catalog is MIT-licensed so directories can list tools and install snippets.

## Directory listing

Registry name: **`com.cnrcode/corroborateme`** (domain namespace via [cnrcode.com](https://cnrcode.com/.well-known/mcp-registry-auth)).

1. Ensure `https://cnrcode.com/.well-known/mcp-registry-auth` is deployed.
2. Set GitHub repo secret **`MCP_PRIVATE_KEY`** (the existing cnrcode.com Ed25519 private key hex; never commit it).
3. Push a version tag so [GitHub Actions](.github/workflows/publish-mcp.yml) publishes `server.json` to the [official MCP Registry](https://registry.modelcontextprotocol.io):

   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```

Directories that ingest the official registry (PulseMCP, MCPCentral, MCPFind, Glama connectors) pick the entry up from there. Other directories (Glama server listing, Smithery, mcpservers.org, mcp.directory, MCP Market, McpMux) are submitted by maintainers only. See [docs/directory-listings.md](docs/directory-listings.md).

### Stdio stub (directory introspection)

This repo includes a **stdio catalog stub** (`src/main.ts`) so directories can build a container, start the process, and introspect the **13** tool definitions. It does not implement auth or billing - clients still connect to the hosted endpoint above.

Local verify:

```bash
npm ci && npm run build && npm start   # hangs on stdio - expected
docker build -t corroborate-me-stub . && docker run -i corroborate-me-stub
```

## License

[MIT](./LICENSE) - catalog, documentation, and schema stub only.
