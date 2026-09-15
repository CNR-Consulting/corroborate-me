---
name: corroborate-me
description: >-
  Connect to CorroborateMe MCP for company API keys, human login-links,
  OIDC clients, integrations, and billing. Use when onboarding to
  CorroborateMe, minting aa_ keys, creating login-links, or running the
  zero-human bootstrap loop.
---

# CorroborateMe MCP

CorroborateMe helps agents and apps prove end users: company API keys (`aa_...`) to call the API, login-links with multi-channel notify, OIDC registration, encrypted integrations, and budget-aware billing.

**Live endpoint:** https://corroborateme.com/mcp

Prefer REST + live docs when they are clearer; MCP is optional.

## Zero-human bootstrap

1. `POST https://corroborateme.com/api/agents/bootstrap` with optional company/contact fields -> bootstrap token
2. `POST https://corroborateme.com/api/billing/machine-pay` with `Authorization: Bearer <bootstrapToken>` and optional `{ "sku": "pro_prepaid_30d" }`
3. When MPP unlock succeeds, response includes `secret` (`aa_...`)

Or use MCP tools `agent_bootstrap` and `billing_machine_pay`. Read live plan amounts from `GET /api/config`.

## Typical agent loop

1. Ensure Pro unlock (checkout or machine-pay)
2. Mint a key with `keys_create` when you need a durable Bearer secret
3. `webhook_allowlist_add` for callback prefixes you will use
4. `create_login_link` for human proof (poll, SSE, webhook, redirect, form_post, postMessage)
5. `get_login_status` until complete; `retry_login_webhook` if notify failed
6. Optional: `oauth_client_create`, `integration_upsert` / `integration_list`

## Discovery

- https://corroborateme.com/llms.txt
- https://corroborateme.com/llms-full.txt
- https://corroborateme.com/docs
- https://corroborateme.com/openapi.json

This catalog repo is a schema stub only. Always call the hosted MCP URL with `Authorization: Bearer aa_...`.
