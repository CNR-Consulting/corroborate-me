# Changelog

## 0.2.2

- Align MCP tool description strings and `billing_checkout` input schema with live `https://corroborateme.com/.well-known/mcp.json` (stub parity).
- Correct documented MCP tool count to **14** (still the same tool names as 0.2.1; no new MCP tools).
- Note login-link **password** completion as REST-only (`/api/login-links/{id}/password-login`, `/api/login-links/{id}/set-password` per OpenAPI).

## 0.2.1

- Registry remote URL uses trailing slash on `https://corroborateme.com/mcp/` for `com.corroborateme/corroborate-me`.
