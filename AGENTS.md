# AGENTS.md

Guidance for AI agents and coding assistants working with CorroborateMe.

## What CorroborateMe is

CorroborateMe is identity for humans, apps, and agents: company API keys (`aa_...`), human login-links with multi-channel notify, OIDC client registration, encrypted integrations, and budget-aware billing. REST + MCP.

**Live product:** https://corroborateme.com

This repository (`corroborate-me`) is the **public MCP catalog stub** for directory crawlers. It is not the hosted server.

## Start here

1. Read the curated site index: https://corroborateme.com/llms.txt
2. **Zero-human path:** bootstrap -> machine-pay -> company key
3. Full agent guide: https://corroborateme.com/llms-full.txt
4. Human integrator docs: https://corroborateme.com/docs

## Zero-human bootstrap

```bash
curl -s -X POST https://corroborateme.com/api/agents/bootstrap \
  -H "Content-Type: application/json" \
  -d '{"contact_email":"agent@example.com"}'
# -> bootstrapToken

curl -s -X POST https://corroborateme.com/api/billing/machine-pay \
  -H "Authorization: Bearer <bootstrapToken>" \
  -H "Content-Type: application/json" \
  -d '{"sku":"pro_prepaid_30d"}'
# MPP settle (when enabled) -> secret aa_...
```

Or use MCP tools `agent_bootstrap` and `billing_machine_pay`. Read live amounts from `GET /api/config`.

Legal: https://corroborateme.com/terms · https://corroborateme.com/privacy

## Connect MCP

Point any MCP client at the live endpoint with a CorroborateMe API key (`aa_...`):

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

Mint keys via bootstrap + machine-pay, or at https://corroborateme.com after human Pro checkout.

## Machine-readable discovery

| Resource | URL |
|----------|-----|
| LLM site map | https://corroborateme.com/llms.txt |
| Full agent guide | https://corroborateme.com/llms-full.txt |
| OpenAPI 3.1 | https://corroborateme.com/openapi.json |
| Interactive API | https://corroborateme.com/swagger |
| Human docs | https://corroborateme.com/docs |
| MCP discovery | https://corroborateme.com/.well-known/mcp.json |
| Sitemap | https://corroborateme.com/sitemap.xml |
| Security contact | https://corroborateme.com/.well-known/security.txt |

## Authentication

- **Agents:** `Authorization: Bearer aa_...` (company API key); bootstrap JWT on machine-pay only
- **Humans:** console session after product Sign in; login-link end-users complete one-time links (`cu_...` user ids)

Active Pro required for most keyed work. Prefer live `/api/config` over hardcoded plan details.

## Tool schemas

Input schemas for all **13** MCP tools are in:

- https://corroborateme.com/.well-known/mcp.json
- [`src/server.ts`](src/server.ts) in this repo (Zod stubs matching production)

## This repo vs the product

| | Product (private) | This repo (public catalog) |
|---|---|---|
| Role | Live Worker, REST, SPA, MCP | Catalog + schema stub for MCP Registry |
| MCP URL | https://corroborateme.com/mcp | Points clients to product URL |
| Handlers | Real auth, billing, login-links | Stub messages only |

When tool names or schemas change in production, update `src/server.ts` and README here to stay in sync.
