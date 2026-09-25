# Directory listings runbook

How CorroborateMe gets listed in MCP directories. Mirrors the Tillpad catalog repo. Maintainers only.

Registry name: `com.cnrcode/corroborateme`. Remote MCP: `https://corroborateme.com/mcp` (Streamable HTTP, MCP OAuth or Bearer `aa_...`).

## 1. Official MCP Registry

1. Confirm the `MCP_PRIVATE_KEY` repo secret holds the existing cnrcode.com key (same key as the Tillpad catalog repo).
2. After this branch merges, push tag `v0.1.0`. The workflow runs `mcp-publisher login http --domain cnrcode.com` then `mcp-publisher publish`.
3. Verify: `curl -s "https://registry.modelcontextprotocol.io/v0/servers?search=com.cnrcode/corroborateme"`.

The registry limits `description` to 100 characters. Keep `server.json` under that.

## 2. Glama server listing (Dockerfile)

1. Submit `https://github.com/CNR-Consulting/corroborate-me` at [glama.ai/mcp/servers](https://glama.ai/mcp/servers) if it is not indexed.
2. On the server page, click **Sync Server**, then **Claim ownership**. `glama.json` must list the claiming GitHub user.
3. Admin > Dockerfile:

| Field | Value |
|-------|-------|
| Base image | `debian:trixie-slim` (default) |
| Build steps | `["npm ci", "npm run build"]` |
| CMD arguments | `["node", "dist/main.js"]` |
| Environment variables JSON schema | default (`{"properties":{},"required":[],"type":"object"}`) |
| Placeholder parameters | `{}` |

4. **Deploy**, wait for build + introspection (13 tools), then **Make Release** (`0.1.0`).

## 3. Glama hosted connector

Glama imports connectors from the official registry, so `https://glama.ai/mcp/connectors/com.cnrcode/corroborateme` should appear after step 1. To claim it, use **Claim ownership** on that page and publish the claim token JSON Glama shows at `https://corroborateme.com/.well-known/glama.json` (product change, separate PR) or as a DNS TXT record.

## Local verify

```bash
npm ci && npm run build && npm start   # hangs on stdio - expected
docker build -t corroborate-me-stub . && docker run -i corroborate-me-stub
```
